<template>
  <div class="product-detail-card">
    <!-- Product Image -->
    <div class="product-image-section">
      <div v-if="product.imagePath" class="product-image">
        <imagePreview
          :imageName="product.imagePath"
          :path="product.imagePath"
          :type="imageType"
          :width="imageSize"
          :height="imageSize"
          :preview="true"
        />
      </div>
      <div v-else class="product-image-placeholder">
        <i class="bi bi-image"></i>
        <span>ไม่มีรูปภาพ</span>
      </div>
    </div>

    <!-- Product Information -->
    <div class="product-info-section">
      <!-- Stock Numbers -->
      <div class="info-group">
        <div class="info-row">
          <span class="info-label">เลขที่ผลิต (ใหม่):</span>
          <span class="info-value highlight">{{ product.stockNumber || '-' }}</span>
        </div>
        <div v-if="product.stockNumberOrigin" class="info-row">
          <span class="info-label">เลขที่ผลิต (เก่า):</span>
          <span class="info-value">{{ product.stockNumberOrigin }}</span>
        </div>
      </div>

      <!-- Product Details -->
      <div class="info-group">
        <div class="info-row">
          <span class="info-label">รหัสสินค้า:</span>
          <span class="info-value">{{ product.productNumber || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">แม่พิมพ์:</span>
          <span class="info-value">{{ product.mold || '-' }}</span>
        </div>
        <div v-if="product.productNameEn" class="info-row">
          <span class="info-label">ชื่อสินค้า (EN):</span>
          <span class="info-value">{{ product.productNameEn }}</span>
        </div>
        <div v-if="product.productNameTh" class="info-row">
          <span class="info-label">ชื่อสินค้า (TH):</span>
          <span class="info-value">{{ product.productNameTh }}</span>
        </div>
        <div v-if="product.productTypeName" class="info-row">
          <span class="info-label">ประเภทสินค้า:</span>
          <span class="info-value">{{ product.productTypeName }}</span>
        </div>
        <div v-if="product.size" class="info-row">
          <span class="info-label">ขนาด:</span>
          <span class="info-value">{{ product.size }}</span>
        </div>
      </div>

      <!-- Production Info -->
      <div class="info-group">
        <div v-if="product.productionType" class="info-row">
          <span class="info-label">สีของทอง/เงิน:</span>
          <span class="info-value">{{ product.productionType }}</span>
        </div>
        <div v-if="product.productionTypeSize" class="info-row">
          <span class="info-label">ประเภททอง/เงิน:</span>
          <span class="info-value">{{ product.productionTypeSize }}</span>
        </div>
        <div v-if="product.woText" class="info-row">
          <span class="info-label">W.O.:</span>
          <span class="info-value">{{ product.woText }}</span>
        </div>
      </div>

      <!-- Price & Location -->
      <div class="info-group">
        <div v-if="product.productPrice !== null && product.productPrice !== undefined" class="info-row">
          <span class="info-label">ราคา:</span>
          <span class="info-value price">{{ formatPrice(product.productPrice) }} บาท</span>
        </div>
        <div v-if="product.location" class="info-row">
          <span class="info-label">จัดเก็บ:</span>
          <span class="info-value">{{ product.location }}</span>
        </div>
      </div>

      <!-- Materials Summary (if available) -->
      <div v-if="hasMaterials" class="info-group materials-section">
        <div class="materials-header">
          <i class="bi bi-gem"></i>
          <span>วัตถุดิบ</span>
        </div>

        <!-- Gold -->
        <div v-if="product.goldTotal > 0" class="material-row">
          <span class="material-label">ทอง:</span>
          <span class="material-value">{{ formatWeight(product.goldTotal) }} กรัม</span>
        </div>

        <!-- Diamond -->
        <div v-if="product.diamondTotal > 0" class="material-row">
          <span class="material-label">เพชร:</span>
          <span class="material-value">{{ formatWeight(product.diamondTotal) }} กะรัต</span>
        </div>

        <!-- Gems -->
        <div v-if="product.gemTotal > 0" class="material-row">
          <span class="material-label">พลอย:</span>
          <span class="material-value">{{ formatWeight(product.gemTotal) }} กะรัต</span>
        </div>
      </div>

      <!-- Cost Details Section - Collapsible -->
      <!-- <div v-if="hasCostData" class="cost-details-section">
        <div class="cost-header" @click="toggleCostDetails">
          <div class="cost-header-left">
            <i class="bi bi-calculator"></i>
            <span>ต้นทุนสินค้า</span>
          </div>
          <div class="cost-header-right">
            <span class="total-amount">{{ formatCurrency(totalCost) }} บาท</span>
            <i :class="['bi', showCostDetails ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
          </div>
        </div> -->

        <!-- Tag Price -->
        <!-- <div v-if="tagPriceMultiplier > 0" class="tag-price-bar">
          <div class="tag-price-left">
            <i class="bi bi-tag"></i>
            <span>ราคาป้าย (× {{ tagPriceMultiplier }})</span>
          </div>
          <span class="tag-price-amount">{{ formatCurrency(tagPrice) }} บาท</span>
        </div> -->

        <!-- Expandable Details -->
        <!-- <transition name="slide-fade">
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
                    <i :class="['bi', 'bi-chevron-compact-' + (expandedGroups[group.key] ? 'up' : 'down')]"></i>
                  </div>
                </div>

                <transition name="slide-fade">
                  <div v-if="expandedGroups[group.key]" class="group-items-detail">
                    <div v-for="(item, index) in group.items" :key="index" class="cost-item-compact">
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
        </transition> -->
      <!-- </div> -->

      <!-- Remark -->
      <div v-if="product.remark" class="info-group">
        <div class="info-row remark-row">
          <span class="info-label">หมายเหตุ:</span>
          <span class="info-value">{{ product.remark }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import imagePreview from '@/components/prime-vue/ImagePreview.vue'

export default {
  name: 'ProductDetailCard',

  components: {
    imagePreview
  },

  props: {
    product: {
      type: Object,
      required: true,
      default: () => ({})
    },
    priceTransactions: {
      type: Array,
      default: () => []
    },
    imageType: {
      type: String,
      default: 'STOCK-PRODUCT'
    },
    imageSize: {
      type: Number,
      default: 200
    }
  },

  data() {
    return {
      showCostDetails: false,
      expandedGroups: {}
    }
  },

  computed: {
    hasMaterials() {
      return (
        (this.product.goldTotal && this.product.goldTotal > 0) ||
        (this.product.diamondTotal && this.product.diamondTotal > 0) ||
        (this.product.gemTotal && this.product.gemTotal > 0)
      )
    },

    hasCostData() {
      return this.priceTransactions && this.priceTransactions.length > 0
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

      this.priceTransactions.forEach((item) => {
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
      return this.priceTransactions.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    },

    tagPriceMultiplier() {
      return this.product?.tagPriceMultiplier || 1
    },

    tagPrice() {
      return this.totalCost * this.tagPriceMultiplier
    }
  },

  methods: {
    formatPrice(value) {
      if (!value && value !== 0) return '-'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    },

    formatWeight(value) {
      if (!value && value !== 0) return '-'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      }).format(value)
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

.product-detail-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;

  .product-image {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .product-image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 200px;
    background: white;
    border: 2px dashed #ddd;
    border-radius: 8px;
    color: #999;

    i {
      font-size: 3rem;
      margin-bottom: 8px;
    }

    span {
      font-size: 0.9rem;
    }
  }
}

.product-info-section {
  padding: 16px;
}

.info-group {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
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
  min-width: 120px;
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

  &.price {
    color: var(--base-green);
    font-weight: 600;
  }
}

.materials-section {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;

  .materials-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--base-font-color);
    margin-bottom: 12px;
    font-size: 0.95rem;

    i {
      font-size: 1.1rem;
    }
  }

  .material-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .material-label {
    font-size: 0.85rem;
    color: #666;
  }

  .material-value {
    font-size: 0.85rem;
    color: #333;
    font-weight: 500;
  }
}

// Cost Details Section - Compact & Collapsible
.cost-details-section {
  margin-bottom: 12px;

  .cost-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, var(--base-green) 0%, #026266 100%);
    padding: 12px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(3, 131, 135, 0.15);

    &:active {
      transform: scale(0.98);
    }

    .cost-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;

      i {
        font-size: 1rem;
      }
    }

    .cost-header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;

      .total-amount {
        font-size: 0.95rem;
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
    padding: 8px 14px;
    margin-top: 6px;
    background: #fff3e0;
    border-radius: 6px;

    .tag-price-left {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #e65100;
      font-size: 0.8rem;
      font-weight: 600;

      i {
        font-size: 0.85rem;
      }
    }

    .tag-price-amount {
      font-size: 0.9rem;
      font-weight: 700;
      color: #e65100;
    }
  }

  .cost-details-content {
    margin-top: 10px;
  }

  .cost-groups-compact {
    .cost-group-compact {
      margin-bottom: 8px;

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
        margin-top: 6px;
        padding-left: 8px;

        .cost-item-compact {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 6px;
          padding: 8px 10px;
          margin-bottom: 6px;

          &:last-child {
            margin-bottom: 0;
          }

          .item-compact-header {
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid #f0f0f0;

            .item-name {
              font-size: 0.8rem;
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
                    padding: 4px 2px;

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
