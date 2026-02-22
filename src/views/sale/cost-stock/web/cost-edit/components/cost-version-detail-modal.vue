<template>
  <Dialog
    v-model:visible="localVisible"
    :modal="true"
    :style="{ width: '95vw', maxWidth: '1200px', height: '90vh' }"
    :closable="true"
    @update:visible="handleVisibleChange"
  >
    <template #header>
      <div class="vertical-center-container">
        <span class="title-text-lg bi bi-calculator mr-2"></span>
        <span class="title-text-lg">รายละเอียดใบตีราคา - {{ version?.running }}</span>
      </div>
    </template>

    <div v-if="version" class="detail-content">
      <!-- Stock Information -->
      <div class="filter-container">
        <div class="vertical-center-container mb-2">
          <span class="title-text-lg bi bi-clipboard2-check-fill mr-2"></span>
          <span class="title-text-lg">ข้อมูลสินค้า</span>
        </div>

        <div class="form-col-sm-container">
          <div>
            <span class="title-text">เลขที่ผลิต</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="version.stockNumber"
              readonly
              disabled
            />
          </div>
          <div>
            <span class="title-text">ใบตีราคา</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="version.running"
              readonly
              disabled
            />
          </div>
          <div>
            <span class="title-text">วันที่สร้าง</span>
            <input
              class="form-control form-control-sm"
              type="text"
              :value="formatDate(version.createDate)"
              readonly
              disabled
            />
          </div>
          <div>
            <span class="title-text">ผู้สร้าง</span>
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
          <span class="title-text-lg">ข้อมูลลูกค้า</span>
        </div>

        <div class="customer-info-display">
          <div class="form-col-sm-container">
            <div>
              <span class="title-text">ชื่อลูกค้า</span>
              <div class="customer-display-field">
                {{ version.customerName || '-' }}
              </div>
            </div>
            <div>
              <span class="title-text">รหัสลูกค้า</span>
              <div class="customer-display-field">
                {{ version.customerCode || '-' }}
              </div>
            </div>
            <div>
              <span class="title-text">เบอร์โทร</span>
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
          <span class="title-text-lg">หมายเหตุ</span>
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

    <template #footer>
      <div class="responsive-btn-group">
        <button
          class="btn btn-sm btn-success"
          type="button"
          @click="handleExportPDF"
          :disabled="exportingPDF"
        >
          <span class="bi bi-file-pdf mr-2"></span>
          <span>Export PDF</span>
        </button>
        <button class="btn btn-sm btn-secondary" type="button" @click="handleClose">
          <span class="bi bi-x mr-2"></span>
          <span>ปิด</span>
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog'
import CostDetailTableView from '@/components/cost/cost-detail-table-view.vue'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { AppraisalHistoryPdfBuilder } from '@/services/helper/pdf/appraisal/appraisal-history-pdf-builder.js'
import { success, error, warning } from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

export default {
  name: 'CostVersionDetailModal',

  components: {
    Dialog,
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
      localVisible: false,
      exportingPDF: false
    }
  },

  computed: {
    hasCustomerInfo() {
      return this.version && (this.version.customerCode || this.version.customerName)
    }
  },

  watch: {
    visible: {
      handler(val) {
        this.localVisible = val
      },
      immediate: true
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    async handleExportPDF() {
      if (!this.version) {
        warning('ไม่พบข้อมูลใบตีราคา')
        return
      }

      this.exportingPDF = true
      try {
        const stockData = await this.productStore.fetchDataGet({
          formValue: { stockNumber: this.version.stockNumber }
        })

        if (!stockData) {
          warning('ไม่พบข้อมูลสินค้า')
          return
        }

        const pdfOptions = this.version.currencyUnit
          ? { currencyUnit: this.version.currencyUnit, currencyRate: this.version.currencyRate }
          : {}
        const pdfBuilder = new AppraisalHistoryPdfBuilder(stockData, this.version, pdfOptions)
        const pdf = await pdfBuilder.generatePDF()
        const filename = `Appraisal_${this.version.stockNumber}_${this.version.running}_${dayjs().format('YYYYMMDDHHmmss')}.pdf`
        pdf.download(filename)
        success('Export PDF สำเร็จ', 'สำเร็จ')
      } catch (err) {
        console.error('Error exporting PDF:', err)
        error(err.message || 'เกิดข้อผิดพลาดในการ Export PDF', 'ข้อผิดพลาด')
      } finally {
        this.exportingPDF = false
      }
    },

    handleVisibleChange(val) {
      this.$emit('update:visible', val)
    },

    handleClose() {
      this.localVisible = false
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.detail-content {
  overflow-y: auto;
  max-height: calc(90vh - 200px);
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
