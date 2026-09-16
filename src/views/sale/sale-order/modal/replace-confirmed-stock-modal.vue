<template>
  <modal
    :showModal="isShow"
    @closeModal="onClose"
    width="520px"
    headerVariant="main"
    :isShowActionPart="true"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.sale.saleOrder.replaceConfirmedModalTitle') }}</span>
    </template>
    <template #content>
      <div class="replace-modal-content">
        <FormFieldGeneric :label="$t('view.sale.saleOrder.fillFromStockStockNumberLabel')" :required="true">
          <InputTextGeneric
            v-model.trim="stockNumber"
            placeholder="EX: DK-2502-00X"
            @keyup.enter="onSearch"
          />
        </FormFieldGeneric>

        <ButtonGeneric
          variant="green"
          icon="bi-search"
          :label="$t('common.btn.search')"
          class="replace-search-btn"
          @click="onSearch"
        />

        <div v-if="previewData" class="replace-preview">
          <div class="replace-preview-row">
            <span class="title-text">{{ $t('view.sale.saleOrder.productCode') }}</span>
            <span>{{ previewData.productNumber || '-' }}</span>
          </div>
          <div class="replace-preview-row">
            <span class="title-text">{{ $t('view.sale.saleOrder.qtyAvailableCol') }}</span>
            <span>{{ freshQtyAvailable }}</span>
          </div>
          <div class="replace-preview-row">
            <span class="title-text">{{ $t('common.field.quantity') }}</span>
            <span>{{ copyItem.qty || 0 }}</span>
          </div>
          <div class="replace-old-new">
            <span>{{ oldCode }}</span>
            <i class="bi bi-arrow-right mx-2"></i>
            <span class="font-weight-bold text-main">{{ newCode }}</span>
          </div>
        </div>
      </div>
    </template>
    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-check2"
        :label="$t('common.btn.confirm')"
        :disabled="!canConfirm"
        @click="onConfirmClick"
      />
      <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onClose" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { warning } from '@/services/alert/sweetAlerts.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { fetchStockProduct } from '@/services/utils/stock-scan.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'ReplaceConfirmedStockModal',

  components: {
    modal,
    InputTextGeneric,
    ButtonGeneric,
    FormFieldGeneric
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    // บรรทัดรอผลิต/รอแปลงที่ยืนยันแล้ว (isConfirm=true, isPlaceholder=true) — ต้องการ id/lineKey/qty/stockNumber (เลขปลอมที่พิมพ์ไว้)
    copyItem: {
      type: Object,
      default: () => ({})
    },
    // P5-4: เลขที่ผลิตที่รู้อยู่แล้ว (มาจากใบแปลงสินค้าที่เสร็จแล้ว) — เมื่อส่งมา จะกรอกและค้นหาให้อัตโนมัติตอนเปิด modal
    initialStockNumber: {
      type: String,
      default: ''
    }
  },

  emits: ['closeModal', 'confirm'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      stockNumber: '',
      previewData: null,
      freshQtyAvailable: 0
    }
  },

  computed: {
    oldCode() {
      return this.copyItem.stockNumberOrigin || this.copyItem.stockNumber || '-'
    },

    newCode() {
      if (!this.previewData) return '-'
      return this.previewData.stockNumberOrigin || this.previewData.stockNumber || '-'
    },

    canConfirm() {
      if (!this.previewData) return false
      const needed = Number(this.copyItem.qty) || 1
      return this.freshQtyAvailable >= needed
    }
  },

  watch: {
    isShow(newVal) {
      if (newVal) this.resetState()
    }
  },

  methods: {
    resetState() {
      this.stockNumber = this.initialStockNumber || ''
      this.previewData = null
      this.freshQtyAvailable = 0

      if (this.stockNumber) {
        this.$nextTick(() => this.onSearch())
      }
    },

    async onSearch() {
      const code = (this.stockNumber || '').trim()
      if (!code) {
        warning(this.$t('view.sale.saleOrder.warn.stockNotFound'))
        return
      }

      this.previewData = null

      let result = await fetchStockProduct(this.productStore, { stockNumber: code })
      if (result.status === 'not-found') {
        result = await fetchStockProduct(this.productStore, { stockNumberOrigin: code })
      }

      if (result.status === 'error') {
        warning(
          this.$t('view.sale.saleOrder.warn.stockLookupFailed', { status: result.httpStatus || 'Network' })
        )
        return
      }

      if (result.status === 'not-found' || !result.data) {
        warning(this.$t('view.sale.saleOrder.warn.stockNotFound'))
        return
      }

      const rawData = result.data

      const availabilityList = await this.productStore.fetchStockAvailability([rawData.stockNumber])
      const row = availabilityList.find((a) => a.stockNumber === rawData.stockNumber)
      this.freshQtyAvailable = Number(row ? row.qtyAvailable : rawData.qtyAvailable) || 0

      const needed = Number(this.copyItem.qty) || 1
      if (this.freshQtyAvailable < needed) {
        warning(
          this.$t('view.sale.saleOrder.warn.replaceStockInsufficientQty', {
            available: this.freshQtyAvailable,
            needed
          })
        )
      }

      this.previewData = rawData
    },

    onConfirmClick() {
      if (!this.canConfirm) return

      this.$emit('confirm', {
        copyItem: this.copyItem,
        stockNumber: this.previewData.stockNumber,
        stockNumberOrigin: this.previewData.stockNumberOrigin || this.previewData.stockNumber
      })
    },

    onClose() {
      this.$emit('closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.replace-modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.replace-search-btn {
  align-self: flex-start;
}

.replace-preview {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  background: var(--color-highlight-bg);
}

.replace-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-md);
}

.replace-old-new {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--sp-sm);
  border-top: 1px dashed var(--color-border);
}
</style>
