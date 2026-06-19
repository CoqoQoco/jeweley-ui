<template>
  <div class="item-card">
    <div class="item-card-header">
      <div class="item-info">
        <span class="item-stock-number">{{ item.stockNumber }}</span>
        <span class="item-source-badge" :class="item.source">
          {{ item.source === 'appraisal' ? $t('view.mobile.sale.itemSourceAppraisal') : item.source === 'quotation' ? $t('view.mobile.sale.itemSourceQuotation') : $t('view.mobile.sale.itemSourceScan') }}
        </span>
      </div>
      <button class="btn-remove" @click="$emit('remove', index)">
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <div class="item-name">{{ item.description || '-' }}</div>

    <div class="cost-info" v-if="item.costPrice">
      <span class="cost-label">{{ $t('view.mobile.sale.itemCostLabel') }}</span>
      <span class="cost-value">{{ formatCurrency(item.costPrice) }} {{ $t('view.mobile.sale.itemCostUnit') }}</span>
      <span v-if="item.tagPriceMultiplier > 1" class="multiplier-badge">
        x{{ item.tagPriceMultiplier }}
      </span>
    </div>

    <div class="item-fields">
      <div class="field-group">
        <label>{{ $t('view.mobile.sale.itemFieldPrice') }}</label>
        <InputTextGeneric
          type="number"
          :modelValue="String(item.appraisalPrice || item.price || '')"
          @update:modelValue="updateField('appraisalPrice', $event)"
          :min="0"
          :step="0.01"
        />
      </div>
      <div class="field-group">
        <label>{{ $t('view.mobile.sale.itemFieldQty') }}</label>
        <InputTextGeneric
          type="number"
          :modelValue="String(item.qty || '')"
          @update:modelValue="updateField('qty', $event)"
          :min="1"
          :step="1"
        />
      </div>
      <div class="field-group">
        <label>{{ $t('view.mobile.sale.itemFieldDiscount') }}</label>
        <InputTextGeneric
          type="number"
          :modelValue="String(item.discountPercent || '')"
          @update:modelValue="updateField('discountPercent', $event)"
          :min="0"
          :max="100"
          :step="0.01"
        />
      </div>
    </div>

    <div class="item-total">
      <span class="total-label">{{ $t('view.mobile.sale.itemTotalLabel') }}</span>
      <span class="total-value">{{ formatCurrency(calculatedTotal) }} {{ $t('view.mobile.sale.itemTotalUnit') }}</span>
    </div>
  </div>
</template>

<script>
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

export default {
  name: 'ItemCard',

  components: {
    InputTextGeneric
  },

  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    currencyUnit: {
      type: String,
      default: 'THB'
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
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  padding: 14px;
  border: 1px solid var(--color-border);

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

      &.quotation {
        background: #9c27b0;
      }
    }

    .btn-remove {
      background: none;
      border: none;
      color: var(--base-red);
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
    margin-bottom: 6px;
  }

  .cost-info {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: #fff8e1;
    border-radius: 6px;
    margin-bottom: 10px;

    .cost-label {
      font-size: 0.75rem;
      color: #999;
    }

    .cost-value {
      font-size: 0.8rem;
      font-weight: 500;
      color: #e65100;
    }

    .multiplier-badge {
      font-size: 0.7rem;
      font-weight: 600;
      color: white;
      background: #ff9800;
      padding: 1px 6px;
      border-radius: 8px;
    }
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

      :deep(.form-control) {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid var(--color-border);
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
