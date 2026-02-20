<template>
  <div class="so-summary-section">
    <div class="summary-card">
      <div class="summary-row">
        <span class="summary-label">จำนวนรายการ</span>
        <span class="summary-value">{{ itemCount }} รายการ</span>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-row">
        <span class="summary-label">ยอดรวม (THB)</span>
        <span class="summary-value">{{ formatCurrency(totalAmountTHB) }} บาท</span>
      </div>
      <div v-if="hasCurrencyConversion" class="summary-row total">
        <span class="summary-label">ยอดรวม ({{ currencyUnit }})</span>
        <span class="summary-value">{{ formatCurrency(totalAmountConverted) }} {{ currencyUnit }}</span>
      </div>
      <div v-else class="summary-row total">
        <span class="summary-label">ยอดรวมทั้งหมด</span>
        <span class="summary-value">{{ formatCurrency(totalAmountTHB) }} บาท</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SoSummary',

  props: {
    items: {
      type: Array,
      default: () => []
    },
    currencyUnit: {
      type: String,
      default: ''
    },
    currencyRate: {
      type: Number,
      default: 1
    }
  },

  computed: {
    itemCount() {
      return this.items.length
    },

    hasCurrencyConversion() {
      return this.currencyUnit && this.currencyRate && this.currencyRate !== 1
    },

    totalAmountTHB() {
      return this.items.reduce((sum, item) => {
        const price = Number(item.appraisalPrice) || Number(item.price) || 0
        const qty = Number(item.qty) || 1
        const discountPercent = Number(item.discountPercent) || 0
        return sum + price * qty * (1 - discountPercent / 100)
      }, 0)
    },

    totalAmountConverted() {
      if (!this.currencyRate || this.currencyRate === 0) return this.totalAmountTHB
      return this.totalAmountTHB / this.currencyRate
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

.so-summary-section {
  margin-top: 16px;
}

.summary-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e8e8e8;

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;

    .summary-label {
      font-size: 0.9rem;
      color: #666;
    }

    .summary-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
    }

    &.total {
      .summary-label {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
      }

      .summary-value {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--base-font-color);
      }
    }
  }

  .summary-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 6px 0;
  }
}
</style>
