<!--
  PriceInputGeneric — ช่องกรอกราคาที่อ่านง่าย
  - ตอนไม่ได้โฟกัสแสดงตัวคั่นหลักพัน (611,000) ตอนพิมพ์แสดงตัวเลขดิบ
  - ใต้ช่องแสดงจำนวนเงินเป็นตัวหนังสือ (TH: คำอ่านบาทไทย, EN: ตัวเลขพร้อม THB)
  - emit ค่าเป็น Number (ว่าง = '')

  ตัวอย่าง:
  <PriceInputGeneric ref="priceInput" v-model="stock.productPrice" :required="true" />

  Props: modelValue, placeholder, disabled, required, showWords(true)
  Methods (ผ่าน ref): focus()
  Emits: update:modelValue, blur, focus
-->
<template>
  <div class="price-input">
    <InputTextGeneric
      ref="input"
      v-bind="$attrs"
      type="text"
      inputmode="decimal"
      autocomplete="off"
      :modelValue="text"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      @update:modelValue="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
    <small v-if="showWords && hint" class="price-input-hint">{{ hint }}</small>
  </div>
</template>

<script>
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import { convertAmountToThaiText } from '@/services/utils/thai-baht-text.js'

const formatGrouped = (value) => {
  if (value === '' || value === null || value === undefined) return ''
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export default {
  name: 'PriceInputGeneric',

  components: { InputTextGeneric },

  inheritAttrs: false,

  props: {
    modelValue: {
      type: [Number, String],
      default: ''
    },
    placeholder: {
      type: String,
      default: '0.00'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    showWords: {
      type: Boolean,
      default: true
    }
  },

  emits: ['update:modelValue', 'blur', 'focus'],

  data() {
    return {
      text: formatGrouped(this.modelValue),
      focused: false
    }
  },

  computed: {
    amount() {
      const n = Number(this.modelValue)
      return this.modelValue === '' || this.modelValue === null || !Number.isFinite(n) ? 0 : n
    },
    hint() {
      if (this.amount <= 0) return ''
      const grouped = formatGrouped(this.amount)
      if (this.$i18n.locale === 'th') {
        return `${grouped} — ${convertAmountToThaiText(this.amount)}`
      }
      return this.$t('common.priceInput.hintEn', { amount: grouped })
    }
  },

  watch: {
    modelValue(val) {
      if (this.focused) return
      this.text = formatGrouped(val)
    }
  },

  methods: {
    focus() {
      this.$refs.input?.$el?.focus?.()
    },

    onInput(raw) {
      let cleaned = String(raw ?? '').replace(/[^0-9.]/g, '')
      const firstDot = cleaned.indexOf('.')
      if (firstDot !== -1) {
        cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
      }
      this.text = cleaned
      this.$emit('update:modelValue', cleaned === '' || cleaned === '.' ? '' : Number(cleaned))
    },

    onFocus(event) {
      this.focused = true
      this.text = this.amount > 0 ? String(this.modelValue) : ''
      this.$emit('focus', event)
    },

    onBlur(event) {
      this.focused = false
      this.text = formatGrouped(this.modelValue)
      this.$emit('blur', event)
    }
  }
}
</script>

<style lang="scss" scoped>
.price-input {
  width: 100%;
}

.price-input-hint {
  display: block;
  margin-top: var(--sp-xs);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}
</style>
