<template>
  <div class="so-item-card">
    <div class="item-card-header">
      <div class="item-info">
        <span class="item-stock-number">{{ item.stockNumber || item.productNumber || '-' }}</span>
        <span
          v-if="confirmStatus"
          class="item-status-badge"
          :style="{ background: statusColor }"
        >
          {{ statusLabel }}
        </span>
      </div>
    </div>

    <div v-if="item.description" class="item-name">{{ item.description }}</div>

    <div class="item-details">
      <div v-if="item.productNumber && item.stockNumber" class="detail-row">
        <span class="detail-label">รหัสสินค้า</span>
        <span class="detail-value">{{ item.productNumber }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">ราคา</span>
        <span class="detail-value">{{ formatCurrency(displayPrice) }} บาท</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">จำนวน</span>
        <span class="detail-value">{{ item.qty || 1 }}</span>
      </div>
      <div v-if="displayDiscount > 0" class="detail-row">
        <span class="detail-label">ส่วนลด</span>
        <span class="detail-value discount">{{ displayDiscount }}%</span>
      </div>
    </div>

    <div class="item-total">
      <span class="total-label">รวม</span>
      <span class="total-value">{{ formatCurrency(itemTotal) }} บาท</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SoItemCard',

  props: {
    item: {
      type: Object,
      required: true
    },
    currencyUnit: {
      type: String,
      default: 'THB'
    }
  },

  computed: {
    // ราคาจริง: ใช้ appraisalPrice (ราคาตีราคา) ถ้ามี ไม่งั้นใช้ price
    displayPrice() {
      return Number(this.item.appraisalPrice) || Number(this.item.price) || 0
    },

    displayDiscount() {
      return Number(this.item.discountPercent) || 0
    },

    itemTotal() {
      const price = this.displayPrice
      const qty = Number(this.item.qty) || 1
      const discountPercent = this.displayDiscount
      return price * qty * (1 - discountPercent / 100)
    },

    confirmStatus() {
      if (this.item.isInvoice) return 'invoiced'
      if (this.item.isConfirm) return 'confirmed'
      return null
    },

    statusColor() {
      switch (this.confirmStatus) {
        case 'confirmed':
          return '#2196f3'
        case 'invoiced':
          return '#4caf50'
        default:
          return '#9e9e9e'
      }
    },

    statusLabel() {
      switch (this.confirmStatus) {
        case 'confirmed':
          return 'ยืนยันแล้ว'
        case 'invoiced':
          return 'ออก Invoice แล้ว'
        default:
          return ''
      }
    }
  },

  methods: {
    formatCurrency(value) {
      if (value === null || value === undefined) return '0.00'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(value))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.so-item-card {
  background: white;
  border-radius: 10px;
  padding: 14px;
  border: 1px solid #e8e8e8;

  .item-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    .item-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .item-stock-number {
      font-weight: 600;
      color: var(--base-font-color);
      font-size: 0.9rem;
    }

    .item-status-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 500;
      color: white;
    }
  }

  .item-name {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 10px;
  }

  .item-details {
    margin-bottom: 8px;

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;

      .detail-label {
        font-size: 0.8rem;
        color: #999;
      }

      .detail-value {
        font-size: 0.85rem;
        color: #333;
        font-weight: 500;

        &.discount {
          color: #f44336;
        }
      }
    }
  }

  .item-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;

    .total-label {
      font-size: 0.85rem;
      color: #666;
      font-weight: 500;
    }

    .total-value {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--base-font-color);
    }
  }
}
</style>
