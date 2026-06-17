<template>
  <modal
    :showModal="visible"
    @closeModal="handleClose"
    width="1400px"
    :isShowActionPart="true"
  >
    <template #title>
      <span class="title-text-lg bi bi-clock-history mr-2"></span>
      <span class="title-text-lg">{{ $t('view.stock.product.viewHistory') }} - {{ stockNumber }}</span>
    </template>

    <template #content>
      <!-- Content -->
      <div v-if="versions && versions.length > 0" class="history-layout p-3">
        <!-- Left Panel: Version List -->
        <div class="version-sidebar">
          <div class="filter-container">
            <div class="vertical-center-container mb-2">
              <span class="title-text-lg bi bi-list-ul mr-2"></span>
              <span class="title-text-lg">{{ $t('view.stock.product.versionList') }}</span>
            </div>

            <div class="version-list">
              <div
                v-for="version in versions"
                :key="version.versionId"
                class="version-card"
                :class="{ 'version-active': selectedVersion?.versionId === version.versionId }"
                @click="selectVersion(version)"
              >
                <div class="version-header-row">
                  <span class="version-badge">{{ version.running }}</span>
                  <span class="version-date-text">{{ formatDate(version.createDate) }}</span>
                </div>
                <div class="version-info-row">
                  <div class="version-user">
                    <i class="bi bi-person-fill"></i>
                    <span>{{ version.createBy || '-' }}</span>
                  </div>
                  <div class="version-total">
                    <span>{{ $t('view.stock.product.versionTotal') }}<strong>{{ formatCurrency(version.totalPrice) }}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Version Detail -->
        <div class="version-content">
          <div v-if="selectedVersion">
            <!-- Version Info Banner -->
            <div class="filter-container-highlight mb-3">
              <div class="flex-group">
                <span class="title-text-white"
                  ><i class="bi bi-bookmark-check-fill mr-2"></i>{{ selectedVersion.running }} -
                  {{ formatDate(selectedVersion.createDate) }}</span
                >
                <span class="title-text-white"
                  ><i class="bi bi-person-fill mr-2"></i>{{ selectedVersion.createBy || '-' }}</span
                >
              </div>
            </div>

            <!-- Stock Information Section -->
            <div class="filter-container mt-2">
              <div class="vertical-center-container mb-2">
                <span class="title-text-lg bi bi-clipboard2-check-fill mr-2"></span>
                <span class="title-text-lg">{{ $t('view.stock.product.stockInfo') }}</span>
              </div>

              <div class="form-col-sm-container">
                <div>
                  <span class="title-text">{{ $t('view.stock.product.stockNumberNew') }}</span>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    :value="stockData.stockNumber"
                    readonly
                    disabled
                  />
                </div>
                <div>
                  <span class="title-text">{{ $t('view.stock.product.productNumber') }}</span>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    :value="stockData.productNumber"
                    readonly
                    disabled
                  />
                </div>
                <div>
                  <span class="title-text">{{ $t('view.stock.product.productNameTh') }}</span>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    :value="stockData.productNameTh"
                    readonly
                    disabled
                  />
                </div>
                <div>
                  <span class="title-text">{{ $t('view.stock.product.productNameEn') }}</span>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    :value="stockData.productNameEn"
                    readonly
                    disabled
                  />
                </div>
                <div>
                  <span class="title-text">{{ $t('view.stock.product.productType') }}</span>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    :value="stockData.productTypeName"
                    readonly
                    disabled
                  />
                </div>
                <div>
                  <span class="title-text">{{ $t('view.stock.product.wo') }}</span>
                  <input
                    class="form-control form-control-sm"
                    type="text"
                    :value="stockData.wo && stockData.woNumber ? `${stockData.wo}-${stockData.woNumber}` : '-'"
                    readonly
                    disabled
                  />
                </div>
              </div>
              <div v-if="stockData.remark" class="form-col-sm-container mt-2">
                <div>
                  <span class="title-text">{{ $t('common.field.remark') }}</span>
                  <textarea
                    class="form-control form-control-sm"
                    :value="stockData.remark"
                    rows="2"
                    readonly
                    disabled
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Version Remark Section (from version data) -->
            <div v-if="selectedVersion.remark" class="filter-container mt-3">
              <div class="vertical-center-container mb-2">
                <span class="title-text-lg bi bi-chat-left-text mr-2"></span>
                <span class="title-text-lg">{{ $t('view.stock.product.appraisalRemark') }}</span>
              </div>
              <div class="form-col-sm-container">
                <div>
                  <textarea
                    class="form-control form-control-sm"
                    :value="selectedVersion.remark"
                    rows="2"
                    readonly
                    disabled
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Customer Information Section (Conditional) -->
            <div v-if="hasCustomerInfo(selectedVersion)" class="filter-container mt-3">
              <div class="line mb-3"></div>
              <div class="vertical-center-container mb-2">
                <span class="title-text-lg bi bi-person-fill mr-2"></span>
                <span class="title-text-lg">{{ $t('view.stock.product.customerInfo') }}</span>
              </div>

              <div class="customer-info-display">
                <div class="form-col-sm-container">
                  <div>
                    <span class="title-text">{{ $t('view.stock.product.customerName') }}</span>
                    <div class="customer-display-field">
                      {{ selectedVersion.customerName || '-' }}
                    </div>
                  </div>
                  <div>
                    <span class="title-text">{{ $t('view.stock.product.customerCode') }}</span>
                    <div class="customer-display-field">
                      {{ selectedVersion.customerCode || selectedVersion.customerNumber || '-' }}
                    </div>
                  </div>
                  <div>
                    <span class="title-text">{{ $t('view.stock.product.customerTel') }}</span>
                    <div class="customer-display-field">
                      {{ selectedVersion.customerTel || '-' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cost Detail Table (Shared Component) -->
            <cost-detail-table-view
              :transactions="selectedVersion.priceTransactions"
              :tag-price-multiplier="selectedVersion.tagPriceMultiplier"
              :currency-unit="selectedVersion.currencyUnit"
              :currency-rate="selectedVersion.currencyRate"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center p-5">
            <p>{{ $t('view.stock.product.selectVersionFirst') }}</p>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="text-center p-5">
        <p>{{ $t('common.label.noData') }}</p>
      </div>
    </template>

    <template #action>
      <div class="responsive-btn-group">
        <button
          class="btn btn-sm btn-main"
          type="button"
          @click="handleExportPDF"
          :disabled="!selectedVersion || exportingPDF"
        >
          <span class="bi bi-file-pdf mr-2"></span>
          <span>{{ $t('view.stock.product.exportPdf') }}</span>
        </button>
        <button class="btn btn-sm btn-outline-main ml-2" type="button" @click="handleClose">
          <span class="bi bi-x mr-2"></span>
          <span>{{ $t('common.btn.close') }}</span>
        </button>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import CostDetailTableView from '@/components/cost/cost-detail-table-view.vue'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import dayjs from 'dayjs'
import { warning, success } from '@/services/alert/sweetAlerts.js'
import { AppraisalHistoryPdfBuilder } from '@/services/helper/pdf/appraisal/appraisal-history-pdf-builder.js'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'CostHistoryModal',
  components: {
    modal,
    CostDetailTableView
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    stockNumber: {
      type: String,
      default: ''
    },
    stockData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      versions: [],
      selectedVersion: null,
      exportingPDF: false
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (val && this.stockNumber) {
          this.loadVersionHistory()
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadVersionHistory() {
      if (!this.stockNumber) return

      const store = usrStockProductApiStore()
      const response = await store.fetchGetProductCostDetailVersion(this.stockNumber)

      let rawVersions = []
      if (Array.isArray(response)) {
        rawVersions = response
      } else if (response && Array.isArray(response.data)) {
        rawVersions = response.data
      } else if (response && response.data) {
        rawVersions = [response.data]
      }

      this.versions = rawVersions.map((version, index) => {
        const totalPrice = version.prictransection
          ? version.prictransection.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
          : 0

        return {
          ...version,
          versionId: version.running || `v-${index}`,
          versionNumber: rawVersions.length - index,
          priceTransactions: version.prictransection || [],
          totalPrice: totalPrice,
          customerNumber: version.customerCode || null
        }
      })

      if (this.versions.length > 0) {
        this.selectedVersion = this.versions[0]
      }
    },

    selectVersion(version) {
      this.selectedVersion = version
    },

    hasCustomerInfo(version) {
      return version && (version.customerCode || version.customerName || version.customerNumber)
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    },

    async handleExportPDF() {
      if (!this.selectedVersion) {
        warning(this.$t('view.stock.product.warnSelectVersion'))
        return
      }

      this.exportingPDF = true
      const pdfOptions = {
        ...(this.selectedVersion.currencyUnit ? { currencyUnit: this.selectedVersion.currencyUnit, currencyRate: this.selectedVersion.currencyRate } : {}),
        ...(this.selectedVersion.customStockInfo?.length ? { customStockInfo: this.selectedVersion.customStockInfo } : {})
      }
      const pdfBuilder = new AppraisalHistoryPdfBuilder(this.stockData, this.selectedVersion, pdfOptions)

      const pdf = await pdfBuilder.generatePDF()

      const filename = `Appraisal_${this.stockData.stockNumber}_${this.selectedVersion.running}_${dayjs().format('YYYYMMDDHHmmss')}.pdf`

      pdf.download(filename)

      success(this.$t('view.stock.product.exportPdfSuccess'))
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

.history-layout {
  display: flex;
  gap: 15px;
  height: calc(90vh - 200px);
  overflow: hidden;
}

.version-sidebar {
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
}

.version-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.version-list {
  margin-top: 10px;
}

.version-card {
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  margin-bottom: var(--sp-md);
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--color-card-bg);

  &:hover {
    background-color: #f8f9fa;
    border-color: #adb5bd;
    box-shadow: var(--shadow-sm);
  }

  &.version-active {
    border-color: var(--base-green);
    background-color: #e8f5e9;
    box-shadow: var(--shadow-md);
  }
}

.version-header-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--sp-sm);
}

.version-badge {
  font-size: 13px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 4px 10px;
  background-color: var(--color-border);
  border-radius: var(--radius-md);
  white-space: nowrap;
  display: inline-block;
}

.version-date-text {
  font-size: 13px;
  color: #666;
}

.version-info-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.version-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;

  i {
    font-size: 14px;
    color: var(--base-font-color);
  }
}

.version-total {
  font-size: 13px;
  color: var(--base-green);
  font-weight: 500;

  strong {
    font-weight: bold;
  }
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--sp-sm) var(--sp-md);
  margin-top: 5px;
  min-height: 36px;
  color: #495057;
  font-size: var(--fs-base);

  @media (max-width: 1024px) {
    font-size: var(--fs-sm);
    padding: 6px 10px;
    min-height: 34px;
  }
}

.version-sidebar::-webkit-scrollbar,
.version-content::-webkit-scrollbar {
  width: 8px;
}

.version-sidebar::-webkit-scrollbar-track,
.version-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.version-sidebar::-webkit-scrollbar-thumb,
.version-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: var(--radius-sm);
}

.version-sidebar::-webkit-scrollbar-thumb:hover,
.version-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
