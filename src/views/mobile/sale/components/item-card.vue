<template>
  <div class="item-card">
    <div class="item-card-header">
      <div class="item-info">
        <span class="item-stock-number">{{ item.stockNumber }}</span>
        <span class="item-source-badge" :class="item.source">
          {{ item.source === 'appraisal' ? 'ตีราคา' : 'สแกน' }}
        </span>
      </div>
      <button class="btn-remove" @click="$emit('remove', index)">
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <div class="item-name">{{ item.description || '-' }}</div>

    <div class="item-fields">
      <div class="field-group">
        <label>ราคา/ชิ้น</label>
        <input
          type="number"
          :value="item.appraisalPrice || item.price"
          @input="updateField('appraisalPrice', $event.target.value)"
          min="0"
          step="0.01"
        />
      </div>
      <div class="field-group">
        <label>จำนวน</label>
        <input
          type="number"
          :value="item.qty"
          @input="updateField('qty', $event.target.value)"
          min="1"
          step="1"
        />
      </div>
      <div class="field-group">
        <label>ส่วนลด %</label>
        <input
          type="number"
          :value="item.discountPercent"
          @input="updateField('discountPercent', $event.target.value)"
          min="0"
          max="100"
          step="0.01"
        />
      </div>
    </div>

    <div class="item-total">
      <span class="total-label">รวม</span>
      <span class="total-value">{{ formatCurrency(calculatedTotal) }} บาท</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItemCard',

  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },

  emits: ['update', 'remove'],

  computed: {
    calculatedTotal() {
      const price = Number(this.item.appraisalPrice) || Number(this.item.price) || 0
      const qty = Number(this.item.qty) || 1
      const discountPercent = Number(this.item.discountPercent) || 0
      return price * qty * (1 - discountPercent / 100)
    }
  },

  methods: {
    updateField(field, value) {
      const numValue = Number(value) || 0
      const updatedItem = { ...this.item, [field]: numValue }
      this.$emit('update', this.index, updatedItem)
    },

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

.item-card {
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

    .item-source-badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 500;
      color: white;

      &.appraisal {
        background: #ff9800;
      }

      &.scan {
        background: #2196f3;
      }
    }

    .btn-remove {
      background: none;
      border: none;
      color: #f44336;
      font-size: 1rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;

      &:active {
        background: rgba(244, 67, 54, 0.1);
      }
    }
  }

  .item-name {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 10px;
  }

  .item-fields {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;

    .field-group {
      label {
        display: block;
        font-size: 0.7rem;
        color: #999;
        margin-bottom: 4px;
      }

      input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 0.85rem;
        text-align: right;
        outline: none;

        &:focus {
          border-color: var(--base-font-color);
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
