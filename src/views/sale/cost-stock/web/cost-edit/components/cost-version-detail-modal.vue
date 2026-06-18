<template>
  <modal
    :showModal="isShow"
    width="95%"
    :isShowActionPart="true"
    @closeModal="handleClose"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">
        <i class="bi bi-calculator mr-2"></i>{{ $t('view.sale.costStock.appraisalDetail') }} - {{ version?.running }}
      </span>
    </template>

    <template #content>
      <div v-if="version" class="detail-content px-3 pb-3">
        <!-- Stock Information -->
        <div class="filter-container">
          <div class="vertical-center-container mb-2">
            <span class="title-text-lg bi bi-clipboard2-check-fill mr-2"></span>
            <span class="title-text-lg">{{ $t('view.sale.costStock.stockInfo') }}</span>
          </div>

          <div class="form-col-sm-container">
            <div>
              <span class="title-text">{{ $t('view.sale.costStock.stockNumber') }}</span>
              <input
                class="form-control form-control-sm"
                type="text"
                :value="version.stockNumber"
                readonly
                disabled
              />
            </div>
            <div>
              <span class="title-text">{{ $t('view.sale.costStock.appraisalNo') }}</span>
              <input
                class="form-control form-control-sm"
                type="text"
                :value="version.running"
                readonly
                disabled
              />
            </div>
            <div>
              <span class="title-text">{{ $t('view.sale.costStock.createDate') }}</span>
              <input
                class="form-control form-control-sm"
                type="text"
                :value="formatDate(version.createDate)"
                readonly
                disabled
              />
            </div>
            <div>
              <span class="title-text">{{ $t('view.sale.costStock.createBy') }}</span>
              <input
                class="form-control form-control-sm"
                type="text"
                :value="version.createBy || '-'"
                readonly
                disabled
              />
            </div>
          </div>
        </div>

        <!-- Customer Information (Conditional) -->
        <div v-if="hasCustomerInfo" class="filter-container mt-3">
          <div class="line mb-3"></div>
          <div class="vertical-center-container mb-2">
            <span class="title-text-lg bi bi-person-fill mr-2"></span>
            <span class="title-text-lg">{{ $t('view.sale.costStock.customerInfo') }}</span>
          </div>

          <div class="customer-info-display">
            <div class="form-col-sm-container">
              <div>
                <span class="title-text">{{ $t('view.sale.saleOrder.customerName') }}</span>
                <div class="customer-display-field">
                  {{ version.customerName || '-' }}
                </div>
              </div>
              <div>
                <span class="title-text">{{ $t('view.sale.costStock.customerCode') }}</span>
                <div class="customer-display-field">
                  {{ version.customerCode || '-' }}
                </div>
              </div>
              <div>
                <span class="title-text">{{ $t('common.field.phone') }}</span>
                <div class="customer-display-field">
                  {{ version.customerTel || '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Remark -->
        <div v-if="version.remark" class="filter-container mt-3">
          <div class="vertical-center-container mb-2">
            <span class="title-text-lg bi bi-chat-left-text mr-2"></span>
            <span class="title-text-lg">{{ $t('common.field.remark') }}</span>
          </div>
          <div class="form-col-sm-container">
            <div>
              <textarea
                class="form-control form-control-sm"
                :value="version.remark"
                rows="2"
                readonly
                disabled
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Cost Detail Table (Shared Component) -->
        <cost-detail-table-view
          :transactions="version.prictransection"
          :tag-price-multiplier="version.tagPriceMultiplier"
          :currency-unit="version.currencyUnit"
          :currency-rate="version.currencyRate"
        />
      </div>
    </template>

    <template #action>
      <button
        class="btn btn-sm btn-main"
        type="button"
        @click="handleExportPDF"
        :disabled="exportingPDF"
      >
        <span class="bi bi-file-pdf mr-2"></span>
        <span>Export PDF</span>
      </button>
      <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="handleClose">
        <span class="bi bi-x mr-2"></span>
        <span>{{ $t('common.btn.close') }}</span>
      </button>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import CostDetailTableView from '@/components/cost/cost-detail-table-view.vue'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { AppraisalHistoryPdfBuilder } from '@/services/helper/pdf/appraisal/appraisal-history-pdf-builder.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'CostVersionDetailModal',

  components: {
    modal,
    CostDetailTableView
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    version: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['update:visible'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      exportingPDF: false
    }
  },

  computed: {
    isShow() {
      return this.visible
    },

    hasCustomerInfo() {
      return this.version && (this.version.customerCode || this.version.customerName)
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    async handleExportPDF() {
      if (!this.version) {
        warning(this.$t('view.sale.costStock.error.appraisalNotFound'))
        return
      }

      this.exportingPDF = true
      const stockData = await this.productStore.fetchDataGet({
        formValue: { stockNumber: this.version.stockNumber }
      })

      if (!stockData) {
        warning(this.$t('view.sale.costStock.error.notFound'))
        this.exportingPDF = false
        return
      }

      const pdfOptions = {
        ...(this.version.currencyUnit ? { currencyUnit: this.version.currencyUnit, currencyRate: this.version.currencyRate } : {}),
        ...(this.version.customStockInfo?.length ? { customStockInfo: this.version.customStockInfo } : {})
      }
      const pdfBuilder = new AppraisalHistoryPdfBuilder(stockData, this.version, pdfOptions)
      const pdf = await pdfBuilder.generatePDF()
      const filename = `Appraisal_${this.version.stockNumber}_${this.version.running}_${dayjs().format('YYYYMMDDHHmmss')}.pdf`
      pdf.download(filename)
      success(this.$t('view.sale.costStock.success.exportPdf'))
      this.exportingPDF = false
    },

    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.detail-content {
  max-height: calc(90vh - 200px);
  overflow-y: auto;
  padding-right: 5px;
}

input,
textarea {
  margin-top: 5px !important;
}

textarea {
  resize: vertical;
}

.customer-info-display {
  margin-top: 10px;
}

.customer-display-field {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 5px;
  min-height: 36px;
  color: #495057;
  font-size: 14px;

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 6px 10px;
    min-height: 34px;
  }
}

.detail-content::-webkit-scrollbar {
  width: 8px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
