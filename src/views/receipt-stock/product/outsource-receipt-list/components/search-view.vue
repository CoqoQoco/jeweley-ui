<template>
  <div class="filter-container-searchBar">
    <form @submit.prevent="onSearch">
      <div>
        <pageTitle title="ค้นหารับสินค้างานนอก" :isShowBtnClose="false" />

        <div class="form-col-container">
          <!-- Receipt date range -->
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.outsourceReceiptList.receiptDate') }}</span>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                v-model="form.receiptDateStart"
                :max-date="form.receiptDateEnd"
                :showIcon="true"
                :manualInput="true"
                :placeholder="$t('common.label.start')"
                dateFormat="dd/mm/yy"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                v-model="form.receiptDateEnd"
                :min-date="form.receiptDateStart"
                :showIcon="true"
                :manualInput="false"
                :placeholder="$t('common.label.end')"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>

          <!-- Vendor -->
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.outsourceReceiptList.vendor') }}</span>
            <InputTextGeneric v-model.trim="form.vendor" />
          </div>

          <!-- PO Number -->
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.outsourceReceiptList.poNumber') }}</span>
            <InputTextGeneric v-model.trim="form.poNumber" />
          </div>

          <!-- Product Type -->
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.outsourceReceiptList.productType') }}</span>
            <MultiSelectGeneric
              v-model="form.productType"
              :options="masterProductType"
              optionLabel="description"
              optionValue="code"
              :placeholder="$t('common.label.all')"
            />
          </div>

          <!-- Stock Number -->
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.outsourceReceiptList.stockNumber') }}</span>
            <InputTextGeneric v-model.trim="form.stockNumber" />
          </div>

          <!-- Product Number -->
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.outsourceReceiptList.productNumber') }}</span>
            <InputTextGeneric v-model.trim="form.productNumber" placeholder="EX: R08X50XXXL" />
          </div>

          <!-- Product Name -->
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.outsourceReceiptList.productName') }}</span>
            <InputTextGeneric v-model.trim="form.productNameEn" />
          </div>

          <!-- Size -->
          <div>
            <span class="title-text">{{ $t('view.receiptStock.product.outsourceReceiptList.size') }}</span>
            <InputTextGeneric v-model.trim="form.size" placeholder="EX: #66" />
          </div>
        </div>

        <div class="btn-submit-container-between">
          <div></div>
          <div>
            <button class="btn btn-sm btn-main" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
            </button>
            <button class="btn btn-sm btn-dark ml-2" type="button" @click="onClear" title="ล้าง">
              <i class="bi bi-x-circle"></i>
            </button>
            <button
              class="btn btn-sm btn-green ml-2"
              type="button"
              :disabled="!receiptOutsourceStore.dataReceiptHistory.total > 0"
              @click="onExport"
              title="Export Excel"
            >
              <i class="bi bi-filetype-csv"></i>
            </button>
            <button
              class="btn btn-sm btn-main ml-2"
              type="button"
              @click="$router.push({ name: 'goods-receipt-outsource-create' })"
              :title="$t('view.receiptStock.product.outsourceReceiptList.receiveOutsource')"
            >
              <i class="bi bi-plus"></i> {{ $t('view.receiptStock.product.outsourceReceiptList.receiveOutsource') }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

import { useReceiptOutsourceApiStore } from '@/stores/modules/api/receipt/receipt-outsource-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

export default {
  name: 'search-view',

  components: {
    pageTitle,
    CalendarGeneric,
    MultiSelectGeneric,
    InputTextGeneric
  },

  setup() {
    const receiptOutsourceStore = useReceiptOutsourceApiStore()
    const masterStore = useMasterApiStore()
    return { receiptOutsourceStore, masterStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['search', 'clear', 'export'],

  computed: {
    masterProductType() {
      return this.masterStore.productType
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true
    }
  },

  data() {
    return {
      form: { ...this.modelForm }
    }
  },

  methods: {
    onSearch() {
      this.$emit('search', this.form)
    },
    onExport() {
      this.$emit('export', this.form)
    },
    onClear() {
      this.$emit('clear')
    }
  },

  created() {
    this.$nextTick(async () => {
      await this.masterStore.fetchProductType()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
