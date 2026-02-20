<template>
  <Dialog
    v-model:visible="localVisible"
    :modal="true"
    :style="{ width: '95vw', maxWidth: '1400px', height: '90vh' }"
    :closable="true"
    @update:visible="handleVisibleChange"
  >
    <template #header>
      <div class="vertical-center-container">
        <span class="title-text-lg bi bi-clock-history mr-2"></span>
        <span class="title-text-lg">ดูประวัติตีราคา - {{ stockNumber }}</span>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="loading" class="text-center p-5">
      <ProgressSpinner />
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Content -->
    <div v-else-if="versions && versions.length > 0" class="history-layout">
      <!-- Left Panel: Version List -->
      <div class="version-sidebar">
        <div class="filter-container">
          <div class="vertical-center-container mb-2">
            <span class="title-text-lg bi bi-list-ul mr-2"></span>
            <span class="title-text-lg">รายการเวอร์ชัน</span>
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
                  <span>รวม: <strong>{{ formatCurrency(version.totalPrice) }}</strong></span>
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
              <span class="title-text-lg">ข้อมูลสินค้า</span>
            </div>

            <div class="form-col-sm-container">
              <div>
                <span class="title-text">เลขที่ผลิต</span>
                <input
                  class="form-control form-control-sm"
                  type="text"
                  :value="stockData.stockNumber"
                  readonly
                  disabled
                />
              </div>
              <div>
                <span class="title-text">รหัสสินค้า</span>
                <input
                  class="form-control form-control-sm"
                  type="text"
                  :value="stockData.productNumber"
                  readonly
                  disabled
                />
              </div>
              <div>
                <span class="title-text">ชื่อสินค้า (TH)</span>
                <input
                  class="form-control form-control-sm"
                  type="text"
                  :value="stockData.productNameTh"
                  readonly
                  disabled
                />
              </div>
              <div>
                <span class="title-text">ชื่อสินค้า (EN)</span>
                <input
                  class="form-control form-control-sm"
                  type="text"
                  :value="stockData.productNameEn"
                  readonly
                  disabled
                />
              </div>
              <div>
                <span class="title-text">ประเภทสินค้า</span>
                <input
                  class="form-control form-control-sm"
                  type="text"
                  :value="stockData.productTypeName"
                  readonly
                  disabled
                />
              </div>
              <div>
                <span class="title-text">W.O.</span>
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
                <span class="title-text">หมายเหตุ</span>
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
              <span class="title-text-lg">หมายเหตุการตีราคา</span>
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
              <span class="title-text-lg">ข้อมูลลูกค้า</span>
            </div>

            <div class="customer-info-display">
              <div class="form-col-sm-container">
                <div>
                  <span class="title-text">ชื่อลูกค้า</span>
                  <div class="customer-display-field">
                    {{ selectedVersion.customerName || '-' }}
                  </div>
                </div>
                <div>
                  <span class="title-text">รหัสลูกค้า</span>
                  <div class="customer-display-field">
                    {{ selectedVersion.customerCode || selectedVersion.customerNumber || '-' }}
                  </div>
                </div>
                <div>
                  <span class="title-text">เบอร์โทร</span>
                  <div class="customer-display-field">
                    {{ selectedVersion.customerTel || '-' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Price Appraisal Table -->
          <div class="filter-container mt-3">
            <div class="vertical-center-container mb-2">
              <span class="title-text-lg bi bi-calculator mr-2"></span>
              <span class="title-text-lg">รายการตีราคา</span>
            </div>

            <div class="responsive-table-wrapper">
              <DataTable
                :value="groupedVersionTransactions"
                rowGroupMode="subheader"
                groupRowsBy="nameGroup"
                :sortOrder="1"
                :sortField="'groupOrder'"
                stripedRows
                showGridlines
              >
                <ColumnGroup type="header">
                  <Row>
                    <Column header="รายการ" />
                    <Column header="จำนวน" />
                    <Column header="ราคา/หน่วย" />
                    <Column header="น้ำหนัก" />
                    <Column header="ราคา/น้ำหนัก" />
                    <Column header="รวม" />
                  </Row>
                </ColumnGroup>

                <Column field="nameDescription">
                  <template #body="slotProps">
                    <input
                      type="text"
                      class="form-control"
                      :value="slotProps.data.nameDescription"
                      readonly
                      disabled
                    />
                  </template>
                </Column>

                <Column field="qty" style="width: 130px">
                  <template #body="slotProps">
                    <input
                      type="text"
                      class="form-control text-right"
                      :value="formatNumber(slotProps.data.qty)"
                      readonly
                      disabled
                    />
                  </template>
                </Column>

                <Column field="qtyPrice" style="width: 110px">
                  <template #body="slotProps">
                    <input
                      type="text"
                      class="form-control text-right"
                      :value="formatCurrency(slotProps.data.qtyPrice)"
                      readonly
                      disabled
                    />
                  </template>
                </Column>

                <Column field="qtyWeight" style="width: 110px">
                  <template #body="slotProps">
                    <input
                      type="text"
                      class="form-control text-right"
                      :value="formatNumber(slotProps.data.qtyWeight)"
                      readonly
                      disabled
                    />
                  </template>
                </Column>

                <Column field="qtyWeightPrice" style="width: 110px">
                  <template #body="slotProps">
                    <input
                      type="text"
                      class="form-control text-right"
                      :value="formatCurrency(slotProps.data.qtyWeightPrice)"
                      readonly
                      disabled
                    />
                  </template>
                </Column>

                <Column field="totalPrice" style="width: 150px">
                  <template #body="slotProps">
                    <input
                      type="text"
                      class="form-control text-right"
                      :value="formatCurrency(slotProps.data.totalPrice)"
                      readonly
                      disabled
                    />
                  </template>
                </Column>

                <template #groupheader="slotProps">
                  <div class="flex align-items-center gap-2 type-container">
                    <span><i class="bi bi-clipboard2-check mr-2"></i></span>
                    <span>{{ getGroupLabel(slotProps.data.nameGroup) }}</span>
                  </div>
                </template>

                <ColumnGroup type="footer">
                  <Row>
                    <Column :colspan="5">
                      <template #footer>
                        <div class="text-right type-container">
                          <span>รวมราคาทุกรายการ</span>
                        </div>
                      </template>
                    </Column>
                    <Column :colspan="1">
                      <template #footer>
                        <div class="text-right type-container">
                          <span>{{ formatCurrency(selectedVersion.totalPrice) }}</span>
                        </div>
                      </template>
                    </Column>
                  </Row>
                  <Row v-if="selectedVersionTagMultiplier > 0">
                    <Column :colspan="5">
                      <template #footer>
                        <div class="text-right type-container tag-price-row">
                          <span>ราคาป้าย (ตัวคูณ × {{ selectedVersionTagMultiplier }})</span>
                        </div>
                      </template>
                    </Column>
                    <Column :colspan="1">
                      <template #footer>
                        <div class="text-right type-container tag-price-row">
                          <span>{{ formatCurrency(selectedVersionTagPrice) }}</span>
                        </div>
                      </template>
                    </Column>
                  </Row>
                </ColumnGroup>
              </DataTable>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center p-5">
          <p>กรุณาเลือกเวอร์ชันเพื่อดูรายละเอียด</p>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!loading" class="text-center p-5">
      <p>ไม่พบข้อมูลประวัติตีราคา</p>
    </div>

    <template #footer>
      <div class="responsive-btn-group">
        <button
          class="btn btn-sm btn-success"
          type="button"
          @click="handleExportPDF"
          :disabled="!selectedVersion || exportingPDF"
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import ProgressSpinner from 'primevue/progressspinner'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import dayjs from 'dayjs'
import { warning, success, error } from '@/services/alert/sweetAlerts.js'
import { AppraisalHistoryPdfBuilder } from '@/services/helper/pdf/appraisal/appraisal-history-pdf-builder.js'

export default {
  name: 'CostHistoryModal',
  components: {
    Dialog,
    DataTable,
    Column,
    ColumnGroup,
    Row,
    ProgressSpinner
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
      localVisible: false,
      versions: [],
      selectedVersion: null,
      loading: false,
      exportingPDF: false,
      groupOrder: {
        Gold: 1,
        Gem: 2,
        Worker: 3,
        Embed: 4,
        ETC: 5
      }
    }
  },
  computed: {
    groupedVersionTransactions() {
      if (
        !this.selectedVersion ||
        !this.selectedVersion.priceTransactions ||
        !Array.isArray(this.selectedVersion.priceTransactions)
      ) {
        return []
      }

      // Add group order for sorting
      return this.selectedVersion.priceTransactions.map((item) => ({
        ...item,
        groupOrder: this.groupOrder[item.nameGroup] || 999
      }))
    },
    selectedVersionTagMultiplier() {
      return this.selectedVersion?.tagPriceMultiplier || 1
    },
    selectedVersionTagPrice() {
      return (this.selectedVersion?.totalPrice || 0) * this.selectedVersionTagMultiplier
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.localVisible = val
        if (val && this.stockNumber) {
          console.log('Loading version history for stock:', this.stockNumber)
          this.loadVersionHistory()
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadVersionHistory() {
      if (!this.stockNumber) {
        console.warn('No stock number provided')
        return
      }

      this.loading = true
      try {
        const store = usrStockProductApiStore()
        console.log('Fetching versions for:', this.stockNumber)
        const response = await store.fetchGetProductCostDetailVersion(this.stockNumber)
        console.log('API Response:', response)

        // API returns array directly
        let rawVersions = []
        if (Array.isArray(response)) {
          rawVersions = response
        } else if (response && Array.isArray(response.data)) {
          rawVersions = response.data
        } else if (response && response.data) {
          rawVersions = [response.data]
        }

        // Transform and enrich version data
        this.versions = rawVersions.map((version, index) => {
          // Calculate total price from prictransection
          const totalPrice = version.prictransection
            ? version.prictransection.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
            : 0

          return {
            ...version,
            versionId: version.running || `v-${index}`,
            versionNumber: rawVersions.length - index, // Latest = highest number
            priceTransactions: version.prictransection || [], // Map to expected field name
            totalPrice: totalPrice,
            customerNumber: version.customerCode || null
          }
        })

        console.log('Loaded and transformed versions:', this.versions)

        // Auto-select latest version (first in array = latest)
        if (this.versions.length > 0) {
          this.selectedVersion = this.versions[0]
          console.log('Auto-selected version:', this.selectedVersion)
        }
      } catch (error) {
        console.error('Error loading version history:', error)
        this.versions = []
        this.selectedVersion = null
      } finally {
        this.loading = false
      }
    },

    selectVersion(version) {
      this.selectedVersion = version
      console.log('Selected version:', version)
    },

    hasCustomerInfo(version) {
      return version && (version.customerCode || version.customerName || version.customerNumber)
    },

    getGroupLabel(group) {
      const labels = {
        Gold: 'รายการทอง',
        Gem: 'รายการวัถุดิบ',
        Worker: 'รายการงานช่าง',
        Embed: 'รายการงานฝัง',
        ETC: 'รายการเพิ่มเติม'
      }
      return labels[group] || group
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    },

    formatNumber(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    },

    async handleExportPDF() {
      if (!this.selectedVersion) {
        warning('กรุณาเลือกเวอร์ชันที่ต้องการ Export PDF')
        return
      }

      this.exportingPDF = true
      try {
        // Create PDF builder
        const pdfBuilder = new AppraisalHistoryPdfBuilder(this.stockData, this.selectedVersion)

        // Generate PDF
        const pdf = await pdfBuilder.generatePDF()

        // Create filename
        const filename = `Appraisal_${this.stockData.stockNumber}_${this.selectedVersion.running}_${dayjs().format('YYYYMMDDHHmmss')}.pdf`

        // Download PDF
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
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: white;

  &:hover {
    background-color: #f8f9fa;
    border-color: #adb5bd;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &.version-active {
    border-color: var(--base-green);
    background-color: #e8f5e9;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
}

.version-header-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.version-badge {
  font-size: 13px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 4px 10px;
  background-color: #e0e0e0;
  border-radius: 8px;
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

.type-container {
  font-size: 15px;
  font-weight: bold;
  color: var(--base-font-color);
  padding: 5px;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
}

input,
textarea {
  margin-top: 5px !important;
}

textarea {
  resize: vertical;
}

// Customer Display Field Styles
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

// Responsive DataTable styles for Tablet
:deep(.p-datatable) {
  font-size: 14px;

  @media (max-width: 1024px) {
    font-size: 13px;

    .p-datatable-thead > tr > th {
      padding: 0.5rem 0.4rem;
    }

    .p-datatable-tbody > tr > td {
      padding: 0.5rem 0.4rem;
    }

    input.form-control {
      font-size: 13px;
    }
  }
}

.tag-price-row {
  color: #e65100;
}

// Responsive Column widths for Tablet
:deep(.p-datatable) {
  @media (max-width: 1024px) {
    th[style*='width: 130px'],
    td[style*='width: 130px'] {
      width: 110px !important;
    }

    th[style*='width: 110px'],
    td[style*='width: 110px'] {
      width: 95px !important;
    }

    th[style*='width: 150px'],
    td[style*='width: 150px'] {
      width: 130px !important;
    }
  }
}

// Scrollbar styling
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
  border-radius: 4px;
}

.version-sidebar::-webkit-scrollbar-thumb:hover,
.version-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
