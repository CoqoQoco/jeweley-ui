<template>
  <modal
    :showModal="isShow"
    @closeModal="onClose"
    width="520px"
    headerVariant="main"
    :isShowActionPart="true"
  >
    <template #title>
      <span class="title-text-lg d-block">{{ $t('view.sale.saleOrder.fillFromStockModalTitle') }}</span>
    </template>
    <template #content>
      <div class="fill-modal-content">
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
          class="fill-search-btn"
          @click="onSearch"
        />

        <div v-if="previewData" class="fill-preview">
          <div class="fill-preview-row">
            <span class="title-text">{{ $t('view.sale.saleOrder.productCode') }}</span>
            <span>{{ previewData.productNumber || '-' }}</span>
          </div>
          <div class="fill-preview-row">
            <span class="title-text">{{ $t('view.sale.saleOrder.description') }}</span>
            <span>{{ previewData.productNameEn || '-' }}</span>
          </div>
          <div class="fill-preview-row">
            <span class="title-text">{{ $t('view.sale.saleOrder.qtyAvailableCol') }}</span>
            <span>{{ effectiveAvailable }}</span>
          </div>

          <FormFieldGeneric :label="$t('common.field.quantity')">
            <InputTextGeneric
              type="number"
              :min="1"
              :max="maxQty"
              :modelValue="pickedQty"
              @update:modelValue="onPickedQtyChange"
            />
          </FormFieldGeneric>
        </div>
      </div>
    </template>
    <template #action>
      <ButtonGeneric
        variant="main"
        icon="bi-check2"
        :label="$t('common.btn.confirm')"
        :disabled="!previewData"
        @click="onConfirmClick"
      />
      <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onClose" />
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { warning } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { fetchStockProduct, buildScanStockLine } from '@/services/utils/stock-scan.js'

import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'FillFromStockModal',

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
    // รายการรอผลิต/รอแปลงที่กำลังเติมของ — ต้องการ lineKey/qty/productNumber/appraisalPrice/discountPercent
    copyItem: {
      type: Object,
      default: () => ({})
    },
    // qty ที่ถูกใช้อยู่แล้วโดยบรรทัดที่ยังไม่ confirm ต่อ stockNumber (จากใบสั่งขายใบนี้) — หักออกก่อนเช็ค available
    usedQtyByStockNumber: {
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
      freshQtyAvailable: 0,
      pickedQty: 1
    }
  },

  computed: {
    effectiveAvailable() {
      if (!this.previewData) return 0
      const used = this.usedQtyByStockNumber[this.previewData.stockNumber] || 0
      return Math.max(0, this.freshQtyAvailable - used)
    },

    maxQty() {
      const orderedRemaining = Number(this.copyItem.qty) || 1
      return Math.max(1, Math.min(orderedRemaining, this.effectiveAvailable || 1))
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
      this.pickedQty = 1

      if (this.stockNumber) {
        this.$nextTick(() => this.onSearch())
      }
    },

    onPickedQtyChange(value) {
      const num = Number(value) || 1
      this.pickedQty = Math.max(1, Math.min(num, this.maxQty))
    },

    async onSearch() {
      const code = (this.stockNumber || '').trim()
      if (!code) {
        warning(this.$t('view.sale.saleOrder.warn.stockNotFound'))
        return
      }

      this.previewData = null

      // ลองเลขที่ผลิตใหม่ก่อน แล้วค่อย fallback เป็นเลขที่ผลิตเก่า (เลขบนสติกเกอร์อาจเป็นเลขไหนก็ได้)
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

      const used = this.usedQtyByStockNumber[rawData.stockNumber] || 0
      if (this.freshQtyAvailable - used < 1) {
        warning(
          this.$t('view.sale.saleOrder.warn.fillNoAvailable', {
            stockNumber: rawData.stockNumberOrigin || rawData.stockNumber
          })
        )
        return
      }

      this.previewData = rawData
      this.pickedQty = Math.max(
        1,
        Math.min(Number(this.copyItem.qty) || 1, this.freshQtyAvailable - used)
      )
    },

    onConfirmClick() {
      if (!this.previewData) return

      const copyProductNumber = this.copyItem.productNumber
      const stockProductNumber = this.previewData.productNumber

      if (copyProductNumber && stockProductNumber && copyProductNumber !== stockProductNumber) {
        confirmThenSubmit(
          this.$t('view.sale.saleOrder.confirm.fillProductMismatchMessage'),
          this.$t('view.sale.saleOrder.confirm.fillProductMismatchTitle'),
          () => this.doConfirm(),
          { confirmText: this.$t('common.btn.confirm'), cancelText: this.$t('common.btn.cancel') },
          'warning'
        )
        return
      }

      this.doConfirm()
    },

    doConfirm() {
      const newLine = buildScanStockLine(this.previewData, {
        appraisalPrice: this.copyItem.appraisalPrice,
        discountPercent: this.copyItem.discountPercent,
        qty: this.pickedQty,
        qtyAvailable: this.freshQtyAvailable,
        sourceCopyLineKey: this.copyItem.lineKey
      })

      this.$emit('confirm', { copyItem: this.copyItem, newLine, qty: this.pickedQty })
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

.fill-modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.fill-search-btn {
  align-self: flex-start;
}

.fill-preview {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  background: var(--color-highlight-bg);
}

.fill-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--sp-md);
}
</style>
