<template>
  <SectionCardGeneric
    :title="$t('view.stock.product.quickPrice.boxTitle')"
    headerStyle="legend"
    icon="bi-lightning-charge"
    accent="main"
  >
    <div class="qp-step">
      <div class="qp-step-title">{{ $t('view.stock.product.quickPrice.step1') }}</div>
      <div class="qp-row">
        <div class="qp-readonly">
          <span class="qp-label">
            {{ isLot ? $t('view.stock.product.quickPrice.oldSalePricePerPiece') : $t('view.stock.product.quickPrice.oldSalePrice') }}
          </span>
          <span class="qp-value">{{ formatMoney2(salePrice) }}</span>
        </div>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.markup')">
          <InputTextGeneric v-model="form.markup" type="number" :min="0" step="any" />
        </FormFieldGeneric>
        <div class="qp-readonly">
          <span class="qp-label">{{ $t('view.stock.product.quickPrice.cost') }}</span>
          <span class="qp-value">{{ formatMoney2(result.cost) }}</span>
        </div>
      </div>
      <p v-if="result.error === 'salePrice'" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.invalid.salePrice') }}
      </p>
    </div>

    <div class="qp-step">
      <div class="qp-step-title">{{ $t('view.stock.product.quickPrice.step2') }}</div>
      <div class="qp-row">
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.goldWeight')">
          <InputTextGeneric v-model="form.goldWeight" type="number" :min="0" step="any" @input="weightTouched = true" />
          <span v-if="metal.source" class="qp-hint">
            {{ $t(`view.stock.product.quickPrice.weightFrom.${metal.source}`) }}
          </span>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.goldPricePerGram')">
          <div class="qp-inline">
            <InputTextGeneric v-model="form.goldPrice" type="number" :min="0" step="any" />
            <ButtonGeneric
              variant="outline"
              icon="bi-calculator"
              :label="$t('view.stock.product.quickPrice.spot')"
              @click="showGoldCalculator = true"
            />
          </div>
        </FormFieldGeneric>
      </div>
      <p v-if="!metal.source && !hasWeightInput" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.noMetalWeight') }}
      </p>
      <div class="qp-row">
        <div class="qp-readonly">
          <span class="qp-label">{{ $t('view.stock.product.quickPrice.goldCost') }}</span>
          <span class="qp-value">{{ formatMoney2(result.goldCost) }}</span>
        </div>
        <div class="qp-readonly">
          <span class="qp-label">{{ $t('view.stock.product.quickPrice.costExGold') }}</span>
          <span class="qp-value" :class="{ 'qp-value--negative': result.costExGold !== null && result.costExGold <= 0 }">
            {{ formatMoney2(result.costExGold) }}
          </span>
        </div>
      </div>
      <p v-if="result.error === 'costExGold'" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.invalid.costExGold') }}
      </p>
    </div>

    <div class="qp-step">
      <div class="qp-step-title">{{ $t('view.stock.product.quickPrice.step3') }}</div>
      <div class="qp-row">
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.addPercent')">
          <InputTextGeneric v-model="form.percent" type="number" :min="0" step="any" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.rounding')">
          <RadioGroupGeneric
            v-model="form.rounding"
            :options="roundingOptions"
            optionValue="value"
            :inline="true"
          />
        </FormFieldGeneric>
      </div>
      <p v-if="result.error === 'percent'" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.invalid.percent') }}
      </p>
      <div class="qp-result">
        <span class="qp-label">{{ $t('view.stock.product.quickPrice.resultLabel') }}</span>
        <span class="qp-result-value">{{ formatMoney2(result.quickPrice) }}</span>
        <span v-if="result.valid && Number(form.rounding) !== 0" class="qp-hint">
          {{ $t('view.stock.product.quickPrice.beforeRounding', { raw: formatMoney2(result.raw) }) }}
        </span>
      </div>
    </div>

    <FormFieldGeneric :label="$t('view.stock.product.quickPrice.remark')">
      <InputTextGeneric v-model="form.remark" type="text" :maxlength="200" />
    </FormFieldGeneric>

    <div class="qp-actions">
      <ButtonGeneric variant="outline" icon="bi-arrow-counterclockwise" :label="$t('common.btn.clear')" @click="onReset" />
      <ButtonGeneric
        variant="main"
        icon="bi-save"
        :label="$t('view.stock.product.quickPrice.save')"
        :disabled="!result.valid"
        @click="onSave"
      />
    </div>

    <GoldCalculatorModal
      :isShow="showGoldCalculator"
      @closeModal="showGoldCalculator = false"
      @select="onGoldCalculatorSelect"
    />
  </SectionCardGeneric>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { storage } from '@/services/storage.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import {
  DEFAULT_MARKUP,
  DEFAULT_ROUNDING,
  QUICK_PRICE_ROUNDINGS,
  calcQuickPrice,
  formatMoney2,
  getMetalWeight
} from '@/services/helper/quick-price.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'
import GoldCalculatorModal from '@/components/modal/gold-calculator-modal.vue'

const STORAGE_KEY = 'quick-price-defaults-dk'

const loadDefaults = () => {
  const saved = storage.getJSON(STORAGE_KEY, {}) || {}
  const rounding = Number(saved.rounding)
  return {
    markup: Number(saved.markup) > 0 ? saved.markup : DEFAULT_MARKUP,
    goldPrice: Number(saved.goldPrice) > 0 ? saved.goldPrice : '',
    rounding: QUICK_PRICE_ROUNDINGS.includes(rounding) ? rounding : DEFAULT_ROUNDING
  }
}

const weightToInput = (weight) => (weight > 0 ? Number(weight.toFixed(3)) : '')

export default {
  name: 'QuickPriceForm',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    RadioGroupGeneric,
    GoldCalculatorModal
  },

  props: {
    stockNumber: {
      type: String,
      required: true
    },
    salePrice: {
      type: Number,
      default: null
    },
    materials: {
      type: Array,
      default: () => []
    },
    isLot: {
      type: Boolean,
      default: false
    }
  },

  emits: ['saved'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    const defaults = loadDefaults()
    return {
      form: {
        markup: defaults.markup,
        goldWeight: weightToInput(getMetalWeight(this.materials).weight),
        goldPrice: defaults.goldPrice,
        percent: '',
        rounding: defaults.rounding,
        remark: ''
      },
      weightTouched: false,
      showGoldCalculator: false
    }
  },

  computed: {
    metal() {
      return getMetalWeight(this.materials)
    },

    hasWeightInput() {
      return this.form.goldWeight !== '' && this.form.goldWeight !== null
    },

    result() {
      return calcQuickPrice({
        salePrice: this.salePrice,
        markup: this.form.markup,
        goldWeight: this.form.goldWeight,
        goldPrice: this.form.goldPrice,
        percent: this.form.percent,
        rounding: this.form.rounding
      })
    },

    roundingOptions() {
      return QUICK_PRICE_ROUNDINGS.map((value) => ({
        value,
        label: this.$t(`view.stock.product.quickPrice.roundingOption.r${value}`)
      }))
    }
  },

  watch: {
    metal(val) {
      if (!this.weightTouched) this.form.goldWeight = weightToInput(val.weight)
    }
  },

  methods: {
    formatMoney2,

    onGoldCalculatorSelect(data) {
      const perGram = Number(data.pricePerGramThb) || 0
      if (perGram <= 0) {
        warning(this.$t('view.stock.product.quickPrice.spotNoRate'), this.$t('alert.alertTitle.warning'))
        return
      }
      this.form.goldPrice = Number(perGram.toFixed(2))
      this.showGoldCalculator = false
    },

    onReset() {
      const defaults = loadDefaults()
      this.weightTouched = false
      this.form = {
        markup: defaults.markup,
        goldWeight: weightToInput(this.metal.weight),
        goldPrice: defaults.goldPrice,
        percent: '',
        rounding: defaults.rounding,
        remark: ''
      }
    },

    rememberDefaults() {
      try {
        storage.setJSON(STORAGE_KEY, {
          markup: Number(this.form.markup),
          goldPrice: Number(this.form.goldPrice),
          rounding: Number(this.form.rounding)
        })
      } catch {
        // เก็บค่าล่าสุดไม่ได้ (storage เต็ม/ถูกปิด) ไม่กระทบการบันทึกราคา
      }
    },

    async onSave() {
      if (!this.result.valid) return
      const remark = String(this.form.remark || '').trim()
      const res = await this.productStore.fetchQuickPriceCreate({
        formValue: {
          stockNumber: this.stockNumber,
          markup: Number(this.form.markup),
          goldWeight: Number(this.form.goldWeight),
          goldPrice: Number(this.form.goldPrice),
          percent: this.form.percent === '' ? 0 : Number(this.form.percent),
          rounding: Number(this.form.rounding),
          remark: remark || null
        }
      })
      if (!res) return
      this.rememberDefaults()
      this.form.remark = ''
      success(this.$t('view.stock.product.quickPrice.saveSuccess', { price: formatMoney2(res.quickPrice ?? this.result.quickPrice) }))
      this.$emit('saved')
    }
  }
}
</script>

<style lang="scss" scoped>
.qp-step {
  padding-bottom: var(--sp-lg);
  margin-bottom: var(--sp-lg);
  border-bottom: 1px solid var(--color-border);
}

.qp-step-title {
  margin-bottom: var(--sp-sm);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--base-font-color);
}

.qp-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--sp-md) var(--sp-lg);
  align-items: end;
  margin-bottom: var(--sp-sm);
}

.qp-readonly {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.qp-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.qp-value {
  font-size: var(--fs-base);
  font-weight: 700;

  &--negative {
    color: var(--base-red);
  }
}

.qp-inline {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.qp-hint {
  display: block;
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.qp-warning {
  margin: var(--sp-xs) 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-red);
}

.qp-result {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-top: var(--sp-sm);
}

.qp-result-value {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
}

.qp-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-sm);
  margin-top: var(--sp-lg);
}
</style>
