<template>
  <div class="mobile-cost-version-view">
    <!-- Header with Back Button -->
    <div class="cost-header">
      <div class="mobile-container">
        <button class="mobile-btn-icon" @click="goBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div class="header-content">
          <h2 class="mobile-title">ข้อมูลการตีราคา</h2>
          <p class="header-subtitle">{{ jobRunning }}</p>
        </div>
        <button
          class="mobile-btn-icon"
          @click="handleExportPDF"
          :disabled="exportingPDF || !costVersion"
        >
          <i class="bi" :class="exportingPDF ? 'bi-hourglass-split' : 'bi-file-pdf'"></i>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="mobile-container mobile-mt-2">
      <div class="mobile-loading">
        <div class="spinner"></div>
        <div class="loading-text">กำลังโหลดข้อมูล...</div>
      </div>
    </div>

    <!-- Cost Version Details -->
    <div v-else-if="costVersion" class="mobile-container mobile-mt-2">
      <!-- Stock Information Card -->
      <div class="info-card">
        <div class="card-header">
          <i class="bi bi-box-seam"></i>
          <span>ข้อมูลสินค้า</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">เลขที่ผลิต:</span>
            <span class="info-value highlight">{{ costVersion.stockNumber }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">เลขที่ใบตีราคา:</span>
            <span class="info-value">{{ costVersion.running }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">วันที่สร้าง:</span>
            <span class="info-value">{{ formatDate(costVersion.createDate) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">ผู้สร้าง:</span>
            <span class="info-value">{{ costVersion.createBy }}</span>
          </div>
        </div>
      </div>

      <!-- Customer Information Card (if available) -->
      <div v-if="hasCustomerInfo" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-person"></i>
          <span>ข้อมูลลูกค้า</span>
        </div>
        <div class="card-body">
          <div v-if="costVersion.customerCode" class="info-row">
            <span class="info-label">รหัสลูกค้า:</span>
            <span class="info-value">{{ costVersion.customerCode }}</span>
          </div>
          <div v-if="costVersion.customerName" class="info-row">
            <span class="info-label">ชื่อลูกค้า:</span>
            <span class="info-value">{{ costVersion.customerName }}</span>
          </div>
          <div v-if="costVersion.customerTel" class="info-row">
            <span class="info-label">เบอร์โทร:</span>
            <span class="info-value">{{ costVersion.customerTel }}</span>
          </div>
          <div v-if="costVersion.customerEmail" class="info-row">
            <span class="info-label">อีเมล:</span>
            <span class="info-value">{{ costVersion.customerEmail }}</span>
          </div>
          <div v-if="costVersion.customerAddress" class="info-row remark-row">
            <span class="info-label">ที่อยู่:</span>
            <span class="info-value">{{ costVersion.customerAddress }}</span>
          </div>
        </div>
      </div>

      <!-- Cost Details Card -->
      <div v-if="hasCostData" class="cost-card mobile-mt-2">
        <div class="cost-card-header" @click="toggleCostDetails">
          <div class="cost-header-left">
            <i class="bi bi-calculator"></i>
            <span>รายการต้นทุน</span>
          </div>
          <div class="cost-header-right">
            <span class="total-amount">{{ formatCurrency(totalCost) }} บาท</span>
            <i :class="['bi', showCostDetails ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
          </div>
        </div>

        <!-- Tag Price Summary -->
        <div v-if="tagPriceMultiplier > 0" class="tag-price-bar">
          <div class="tag-price-left">
            <i class="bi bi-tag"></i>
            <span>ราคาป้าย (× {{ tagPriceMultiplier }})</span>
          </div>
          <span class="tag-price-amount">{{ formatCurrency(tagPrice) }} บาท</span>
        </div>

        <!-- Expandable Cost Details -->
        <transition name="slide-fade">
          <div v-if="showCostDetails" class="cost-details-content">
            <div class="cost-groups-compact">
              <div v-for="group in groupedCostData" :key="group.key" class="cost-group-compact">
                <div class="group-compact-header" @click="toggleGroup(group.key)">
                  <div class="group-compact-left">
                    <i :class="['bi', group.icon, 'group-icon']"></i>
                    <span class="group-name">{{ group.name }}</span>
                    <span class="group-count">({{ group.items.length }})</span>
                  </div>
                  <div class="group-compact-right">
                    <span class="group-total">{{ formatCurrency(getGroupTotal(group.items)) }}</span>
                    <i
                      :class="[
                        'bi',
                        'bi-chevron-compact-' + (expandedGroups[group.key] ? 'up' : 'down')
                      ]"
                    ></i>
                  </div>
                </div>

                <!-- Group Items Detail -->
                <transition name="slide-fade">
                  <div v-if="expandedGroups[group.key]" class="group-items-detail">
                    <div
                      v-for="(item, index) in group.items"
                      :key="index"
                      class="cost-item-compact"
                    >
                      <div class="item-compact-header">
                        <span class="item-name">{{ item.nameDescription }}</span>
                      </div>
                      <div class="item-compact-table">
                        <table>
                          <tbody>
                            <tr>
                              <td class="label">จำนวน</td>
                              <td class="value">{{ formatNumber(item.qty) }}</td>
                              <td class="label">ราคา/หน่วย</td>
                              <td class="value">{{ formatCurrency(item.qtyPrice) }}</td>
                            </tr>
                            <tr>
                              <td class="label">น้ำหนัก</td>
                              <td class="value">{{ formatNumber(item.qtyWeight) }}</td>
                              <td class="label">ราคา/น้ำหนัก</td>
                              <td class="value">{{ formatCurrency(item.qtyWeightPrice) }}</td>
                            </tr>
                            <tr class="total-row">
                              <td class="label total-label" colspan="3">รวม</td>
                              <td class="value total-value">{{ formatCurrency(item.totalPrice) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Remark Card (if available) -->
      <div v-if="costVersion.remark" class="info-card mobile-mt-2">
        <div class="card-header">
          <i class="bi bi-chat-left-text"></i>
          <span>หมายเหตุ</span>
        </div>
        <div class="card-body">
          <div class="remark-text">{{ costVersion.remark }}</div>
        </div>
      </div>

      <!-- Export PDF Action -->
      <div class="mobile-mt-3">
        <button
          class="mobile-btn mobile-btn-success mobile-btn-block"
          @click="handleExportPDF"
          :disabled="exportingPDF || !costVersion || !stockData"
        >
          <i
            class="bi"
            :class="exportingPDF ? 'bi-hourglass-split spin-icon' : 'bi-file-pdf'"
          ></i>
          <span>{{ exportingPDF ? 'กำลัง Export PDF...' : 'Export PDF' }}</span>
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="mobile-container mobile-mt-2">
      <div class="mobile-empty-state">
        <i class="bi bi-exclamation-circle"></i>
        <div class="empty-title">ไม่พบข้อมูล</div>
        <div class="empty-subtitle">ไม่สามารถโหลดข้อมูลการตีราคาได้</div>
        <button class="mobile-btn mobile-btn-primary mobile-mt-2" @click="loadCostVersion">
          <i class="bi bi-arrow-clockwise"></i>
          ลองอีกครั้ง
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { AppraisalHistoryPdfBuilder } from '@/services/helper/pdf/appraisal/appraisal-history-pdf-builder.js'
import { success, error, warning } from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

export default {
  name: 'MobileCostVersionDetail',

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      costVersion: null,
      stockData: null,
      isLoading: false,
      exportingPDF: false,
      showCostDetails: false,
      expandedGroups: {}
    }
  },

  computed: {
    jobRunning() {
      return this.$route.params.jobRunning || '-'
    },

    hasCustomerInfo() {
      if (!this.costVersion) return false
      return !!(
        this.costVersion.customerCode ||
        this.costVersion.customerName ||
        this.costVersion.customerTel ||
        this.costVersion.customerEmail ||
        this.costVersion.customerAddress
      )
    },

    hasCostData() {
      return (
        this.costVersion &&
        this.costVersion.prictransection &&
        this.costVersion.prictransection.length > 0
      )
    },

    groupedCostData() {
      if (!this.hasCostData) return []

      const groups = {
        Gold: { name: 'รายการทอง', items: [], icon: 'bi-coin', order: 1 },
        Gem: { name: 'รายการวัถุดิบ', items: [], icon: 'bi-gem', order: 2 },
        Worker: { name: 'รายการงานช่าง', items: [], icon: 'bi-tools', order: 3 },
        Embed: { name: 'รายการงานฝัง', items: [], icon: 'bi-grid-3x3', order: 4 },
        ETC: { name: 'รายการเพิ่มเติม', items: [], icon: 'bi-plus-circle', order: 5 }
      }

      this.costVersion.prictransection.forEach((item) => {
        if (groups[item.nameGroup]) {
          groups[item.nameGroup].items.push(item)
        }
      })

      return Object.entries(groups)
        .filter(([, group]) => group.items.length > 0)
        .map(([key, group]) => ({ key, ...group }))
        .sort((a, b) => a.order - b.order)
    },

    totalCost() {
      if (!this.hasCostData) return 0
      return this.costVersion.prictransection.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    },

    tagPriceMultiplier() {
      return this.costVersion?.tagPriceMultiplier || 1
    },

    tagPrice() {
      return this.totalCost * this.tagPriceMultiplier
    }
  },

  mounted() {
    this.loadCostVersion()
  },

  methods: {
    async loadCostVersion() {
      try {
        this.isLoading = true
        this.costVersion = null

        const response = await this.productStore.fetchGetCostVersion(this.jobRunning)

        if (response) {
          this.costVersion = response
          // Load stock data for PDF export
          if (response.stockNumber) {
            await this.loadStockData(response.stockNumber)
          }
        }
      } catch (error) {
        console.error('Error loading cost version:', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadStockData(stockNumber) {
      try {
        const response = await this.productStore.fetchDataGet({
          formValue: { stockNumber: stockNumber }
        })
        if (response) {
          this.stockData = response
        }
      } catch (error) {
        console.error('Error loading stock data:', error)
      }
    },

    async handleExportPDF() {
      if (!this.costVersion) {
        warning('ไม่พบข้อมูลการตีราคา')
        return
      }

      if (!this.stockData) {
        warning('กำลังโหลดข้อมูลสินค้า กรุณารอสักครู่')
        return
      }

      this.exportingPDF = true
      try {
        // Create PDF builder
        const pdfBuilder = new AppraisalHistoryPdfBuilder(this.stockData, this.costVersion)

        // Generate PDF
        const pdf = await pdfBuilder.generatePDF()

        // Create filename
        const filename = `Appraisal_${this.stockData.stockNumber}_${this.costVersion.running}_${dayjs().format('YYYYMMDDHHmmss')}.pdf`

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

    goBack() {
      this.$router.back()
    },

    formatDate(dateString) {
      return dayjs(dateString).format('DD/MM/YYYY HH:mm')
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === '') return '-'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(value))
    },

    formatNumber(value) {
      if (value === null || value === undefined || value === '') return '-'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(value))
    },

    toggleCostDetails() {
      this.showCostDetails = !this.showCostDetails
    },

    toggleGroup(groupKey) {
      this.expandedGroups[groupKey] = !this.expandedGroups[groupKey]
    },

    getGroupTotal(items) {
      if (!items || !Array.isArray(items)) return 0
      return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-cost-version-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.cost-header {
  background: linear-gradient(
    135deg,
    var(--base-font-color) 0%,
    var(--base-font-sub-color) 100%
  );
  padding: 16px 0;
  color: white;
  margin-bottom: 8px;

  .mobile-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mobile-btn-icon {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:active:not(:disabled) {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    i.bi-hourglass-split {
      animation: spin 2s linear infinite;
    }
  }

  .header-content {
    flex: 1;

    .header-subtitle {
      margin: 2px 0 0 0;
      opacity: 0.9;
      font-size: 0.8rem;
      font-weight: 500;
    }
  }
}

.info-card,
.cost-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  color: var(--base-font-color);
  font-size: 0.95rem;

  i {
    font-size: 1.1rem;
  }
}

.card-body {
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  &.remark-row {
    flex-direction: column;
    gap: 4px;
  }
}

.info-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
  min-width: 110px;
}

.info-value {
  font-size: 0.9rem;
  color: #333;
  text-align: right;
  word-break: break-word;

  &.highlight {
    color: var(--base-font-color);
    font-weight: 600;
    font-size: 1rem;
  }
}

.remark-text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
}

// Cost Card Styles (similar to product-detail-card)
.cost-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--base-green) 0%, #026266 100%);
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }

  .cost-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;

    i {
      font-size: 1.1rem;
    }
  }

  .cost-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;

    .total-amount {
      font-size: 1rem;
      font-weight: 700;
    }

    i {
      font-size: 0.9rem;
      transition: transform 0.3s ease;
    }
  }
}

.tag-price-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #fff3e0;
  border-top: 1px solid #ffe0b2;

  .tag-price-left {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #e65100;
    font-size: 0.85rem;
    font-weight: 600;

    i {
      font-size: 0.9rem;
    }
  }

  .tag-price-amount {
    font-size: 1rem;
    font-weight: 700;
    color: #e65100;
  }
}

.cost-details-content {
  padding: 12px;
}

.cost-groups-compact {
  .cost-group-compact {
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    .group-compact-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s ease;
      border-left: 3px solid var(--base-green);

      &:active {
        background: #e9ecef;
      }

      .group-compact-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .group-icon {
          color: var(--base-green);
          font-size: 0.95rem;
        }

        .group-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
        }

        .group-count {
          font-size: 0.75rem;
          color: #666;
        }
      }

      .group-compact-right {
        display: flex;
        align-items: center;
        gap: 6px;

        .group-total {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--base-green);
        }

        i {
          font-size: 0.8rem;
          color: #666;
        }
      }
    }

    .group-items-detail {
      margin-top: 8px;
      padding-left: 8px;

      .cost-item-compact {
        background: white;
        border: 1px solid #e8e8e8;
        border-radius: 6px;
        padding: 10px 12px;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .item-compact-header {
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid #f0f0f0;

          .item-name {
            font-size: 0.85rem;
            font-weight: 600;
            color: #333;
          }
        }

        .item-compact-table {
          table {
            width: 100%;
            border-collapse: collapse;

            tbody {
              tr {
                &:not(.total-row) {
                  border-bottom: 1px solid #f5f5f5;
                }

                &.total-row {
                  border-top: 1px solid #ddd;

                  .total-label {
                    font-weight: 600;
                    color: #333;
                    text-align: right;
                    padding-right: 8px;
                  }

                  .total-value {
                    font-weight: 700;
                    color: var(--base-green);
                    font-size: 0.85rem;
                  }
                }

                td {
                  padding: 5px 2px;

                  &.label {
                    font-size: 0.7rem;
                    color: #666;
                    width: 28%;
                    padding-right: 4px;
                  }

                  &.value {
                    font-size: 0.75rem;
                    color: #333;
                    font-weight: 500;
                    text-align: right;
                    width: 22%;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.mobile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--base-font-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 16px;
    color: #666;
    font-size: 0.9rem;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.mobile-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  text-align: center;

  i {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #666;
    margin-bottom: 4px;
  }

  .empty-subtitle {
    font-size: 0.85rem;
    color: #999;
  }
}

// Button styling
.mobile-btn-block {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  i {
    font-size: 1.1rem;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spin-icon {
  animation: spin 2s linear infinite;
}

// Transition animations
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
