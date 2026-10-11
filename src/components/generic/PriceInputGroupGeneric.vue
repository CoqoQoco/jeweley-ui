<!--
  PriceInputGroupGeneric — ชุดกรอกราคา catalog: สกุลเงิน + ราคาเต็ม + ส่วนลด (ราคา|%) + ราคาขาย + preview + error

  ตัวอย่างการใช้งาน:
  <PriceInputGroupGeneric :item="item" @update="Object.assign(item, $event)" />

  ตาราง (แยกคอลัมน์ ใช้ 1 instance ต่อ 1 คอลัมน์ — สถานะโหมด/% เก็บบน item จึงใช้ร่วมกันได้):
  <PriceInputGroupGeneric part="currency" :item="row" @update="Object.assign(row, $event)" />
  <PriceInputGroupGeneric part="full" ... /> <PriceInputGroupGeneric part="discount" ... /> <PriceInputGroupGeneric part="sale" ... />

  Props:
    item     — Object: { priceFull, priceSale, priceCurrency, priceMode?, pricePercent? }
               priceMode ('price'|'percent') / pricePercent เป็น state ฝั่ง UI เท่านั้น ห้ามส่งขึ้น API
               (ไม่มีค่า = เริ่มที่โหมดราคา)
    part     — 'all' (default) | 'currency' | 'full' | 'discount' | 'sale'
    disabled — Boolean (false)

  Emits: update(patch) — patch = field ที่เปลี่ยน ให้ parent merge เข้า item เอง
-->
<template>
  <div :class="['price-group', `price-group--${part}`]">
    <FormFieldGeneric v-if="showCurrency" :label="part === 'all' ? $t('common.price.currency') : ''">
      <DropdownGeneric
        :modelValue="currency"
        :options="currencyOptions"
        optionLabel="label"
        optionValue="value"
        :disabled="disabled"
        :ariaLabel="$t('common.price.currency')"
        @update:modelValue="emitPatch({ priceCurrency: $event })"
      />
    </FormFieldGeneric>

    <FormFieldGeneric v-if="showFull" :label="part === 'all' ? $t('common.price.full') : ''">
      <InputTextGeneric
        type="number"
        min="0"
        placeholder="0"
        :disabled="disabled"
        :modelValue="toInputValue(item.priceFull)"
        @update:modelValue="onFull"
      />
    </FormFieldGeneric>

    <FormFieldGeneric v-if="showDiscount" :label="part === 'all' ? $t('common.price.discount') : ''">
      <div class="price-discount">
        <ToggleGroupGeneric
          :modelValue="mode"
          :options="modeOptions"
          :ariaLabel="$t('common.price.discount')"
          :disabled="disabled"
          @update:modelValue="onMode"
        />
        <InputTextGeneric
          v-if="mode === 'percent'"
          type="number"
          min="0"
          max="100"
          :placeholder="hasFull ? $t('common.price.percentPlaceholder') : $t('common.price.percentNeedFull')"
          :disabled="disabled || !hasFull"
          :modelValue="toInputValue(item.pricePercent)"
          @update:modelValue="onPercent"
        />
        <span v-else-if="percentHint !== null" class="price-hint">{{ $t('common.price.percentOff', { percent: percentHint }) }}</span>
      </div>
    </FormFieldGeneric>

    <FormFieldGeneric v-if="showSale" :label="part === 'all' ? $t('common.price.sale') : ''" :error="errorText">
      <InputTextGeneric
        type="number"
        min="0"
        placeholder="0"
        :disabled="disabled"
        :readonly="mode === 'percent'"
        :modelValue="toInputValue(item.priceSale)"
        @update:modelValue="onSale"
      />
      <span v-if="mode === 'percent' && percentHint !== null" class="price-hint">{{ $t('common.price.percentOff', { percent: percentHint }) }}</span>
    </FormFieldGeneric>

    <div v-if="part === 'all' && previewText" class="price-preview">
      <span class="price-preview__label">{{ $t('common.price.preview') }}</span>
      <span v-if="resolved.kind === 'strike'" class="price-preview__full">{{ resolved.fullText }}</span>
      <span class="price-preview__sale">{{ previewText }}</span>
    </div>
  </div>
</template>

<script>
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

import {
  PRICE_CURRENCIES,
  PRICE_ERROR_NEGATIVE,
  PRICE_ERROR_SALE_EXCEEDS_FULL,
  normalizeCurrency,
  parsePriceInput,
  percentFromPrices,
  resolvePrice,
  salePriceFromPercent,
  validatePrice
} from '@/services/helper/catalog-price.js'

export default {
  name: 'PriceInputGroupGeneric',

  components: { FormFieldGeneric, InputTextGeneric, ToggleGroupGeneric, DropdownGeneric },

  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    part: {
      type: String,
      default: 'all',
      validator: (v) => ['all', 'currency', 'full', 'discount', 'sale'].includes(v)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update'],

  computed: {
    showCurrency() {
      return this.part === 'all' || this.part === 'currency'
    },
    showFull() {
      return this.part === 'all' || this.part === 'full'
    },
    showDiscount() {
      return this.part === 'all' || this.part === 'discount'
    },
    showSale() {
      return this.part === 'all' || this.part === 'sale'
    },
    currency() {
      return normalizeCurrency(this.item.priceCurrency)
    },
    currencyOptions() {
      return PRICE_CURRENCIES.map((c) => ({ value: c, label: c }))
    },
    mode() {
      return this.item.priceMode === 'percent' ? 'percent' : 'price'
    },
    modeOptions() {
      return [
        { value: 'price', label: this.$t('common.price.modePrice') },
        { value: 'percent', label: this.$t('common.price.modePercent') }
      ]
    },
    hasFull() {
      const full = parsePriceInput(this.item.priceFull)
      return full !== null && full > 0
    },
    percentHint() {
      return percentFromPrices(this.item.priceFull, this.item.priceSale)
    },
    resolved() {
      return resolvePrice(this.item)
    },
    previewText() {
      if (this.resolved.kind === 'strike') return this.resolved.saleText
      if (this.resolved.kind === 'single') return this.resolved.amountText
      return ''
    },
    errorText() {
      const code = validatePrice(this.item)
      if (code === PRICE_ERROR_SALE_EXCEEDS_FULL) return this.$t('common.price.errorSaleExceedsFull')
      if (code === PRICE_ERROR_NEGATIVE) return this.$t('common.price.errorNegative')
      return ''
    }
  },

  methods: {
    emitPatch(patch) {
      this.$emit('update', patch)
    },

    toInputValue(value) {
      return value === null || value === undefined ? '' : String(value)
    },

    onFull(value) {
      const full = parsePriceInput(value)
      const patch = { priceFull: full }
      if (this.mode === 'percent') {
        patch.priceSale = salePriceFromPercent(full, this.item.pricePercent)
      }
      this.emitPatch(patch)
    },

    onSale(value) {
      if (this.mode === 'percent') return
      this.emitPatch({ priceSale: parsePriceInput(value) })
    },

    onMode(mode) {
      if (mode === this.mode) return
      const patch = { priceMode: mode }
      if (mode === 'percent') {
        const percent = percentFromPrices(this.item.priceFull, this.item.priceSale)
        patch.pricePercent = percent === null ? null : percent
      }
      this.emitPatch(patch)
    },

    onPercent(value) {
      const percent = parsePriceInput(value)
      this.emitPatch({
        pricePercent: percent,
        priceSale: salePriceFromPercent(this.item.priceFull, percent)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.price-group {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--sp-md);

  &--currency,
  &--full,
  &--discount,
  &--sale {
    flex-wrap: nowrap;
  }
}

.price-discount {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  flex-wrap: wrap;
}

.price-hint {
  font-size: var(--fs-sm);
  color: var(--base-green);
}

.price-preview {
  display: flex;
  align-items: baseline;
  gap: var(--sp-sm);
  width: 100%;

  &__label {
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
  }

  &__full {
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
    text-decoration: line-through;
  }

  &__sale {
    font-size: var(--fs-lg);
    font-weight: 700;
    color: var(--base-font-color);
  }
}
</style>
