<template>
  <div class="pos-cart-line">
    <div class="line-header">
      <div class="line-info">
        <span class="line-stock-number">{{ primaryCode }}</span>
        <span v-if="item.mold" class="line-mold">{{ item.mold }}</span>
        <span v-if="secondaryCode" class="line-new-code">{{ secondaryCode }}</span>
        <span class="line-name">{{ item.description || '-' }}</span>
      </div>
      <ButtonGeneric
        variant="red"
        icon="bi-trash"
        :title="$t('view.mobile.pos.removeItemBtn')"
        class="btn-remove-line"
        @click="$emit('remove', index)"
      />
    </div>

    <div class="line-fields">
      <div class="field-group">
        <label>{{ $t('view.mobile.pos.itemFieldPrice') }}</label>
        <InputTextGeneric
          type="number"
          :modelValue="String(item.price ?? '')"
          :min="0"
          step="0.01"
          @update:modelValue="updateField('price', $event)"
        />
      </div>
      <div class="field-group">
        <label>{{ $t('view.mobile.pos.itemFieldQty') }}</label>
        <InputTextGeneric
          type="number"
          :modelValue="String(item.qty ?? '')"
          :min="1"
          step="1"
          @update:modelValue="updateField('qty', $event)"
        />
      </div>
      <div class="field-group">
        <label>{{ $t('view.mobile.pos.itemFieldDiscount') }}</label>
        <InputTextGeneric
          type="number"
          :modelValue="String(item.discountPercent ?? '')"
          :min="0"
          :max="100"
          step="0.01"
          @update:modelValue="updateField('discountPercent', $event)"
        />
      </div>
    </div>

    <div class="line-total">
      <span class="total-label">{{ $t('view.mobile.pos.itemTotalLabel') }}</span>
      <span class="total-value">{{ formatCurrency(lineTotal) }} {{ currencyUnit }}</span>
    </div>
  </div>
</template>

<script>
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'PosCartLine',

  components: {
    InputTextGeneric,
    ButtonGeneric
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
    // รหัสหลักที่โชว์เด่น = รหัสเก่าถ้ามี ไม่มีค่อยใช้รหัสใหม่แทน
    primaryCode() {
      return this.item.stockNumberOrigin || this.item.stockNumber
    },

    // โชว์รหัสใหม่ซ้ำเฉพาะตอนมีรหัสเก่าอยู่แล้ว (ไม่งั้นรหัสใหม่ถูกยกเป็นตัวเด่นไปแล้ว)
    secondaryCode() {
      return this.item.stockNumberOrigin ? this.item.stockNumber : ''
    },

    lineTotal() {
      const price = Number(this.item.price) || 0
      const qty = Number(this.item.qty) || 1
      const discountPercent = Number(this.item.discountPercent) || 0
      return price * qty * (1 - discountPercent / 100)
    }
  },

  methods: {
    updateField(field, value) {
      const numValue = Number(value) || 0
      const updatedItem = { ...this.item, [field]: numValue }
      if (field === 'price') {
        updatedItem.appraisalPrice = numValue
      }
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

.pos-cart-line {
  background: var(--color-card-bg);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  border: 1px solid var(--color-border);
}

.line-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);

  .line-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .line-stock-number {
    font-weight: 600;
    color: var(--base-font-color);
    font-size: 0.9rem;
  }

  .line-mold {
    font-size: 0.8rem;
    color: #666;
  }

  // ไฟล์นี้ไม่มีสไตล์ "จาง" ให้ reuse ตรงๆ — ใช้ fs-sm + opacity ตาม fallback rule
  .line-new-code {
    font-size: var(--fs-sm);
    opacity: 0.6;
  }

  .line-name {
    font-size: 0.8rem;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.btn-remove-line {
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
}

.line-fields {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);

  .field-group {
    label {
      display: block;
      font-size: 0.7rem;
      color: #999;
      margin-bottom: 4px;
    }

    :deep(.form-control) {
      width: 100%;
      padding: 8px;
      min-height: 44px;
      font-size: 0.9rem;
      text-align: right;
      box-sizing: border-box;
    }
  }
}

.line-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--sp-sm);
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
</style>
