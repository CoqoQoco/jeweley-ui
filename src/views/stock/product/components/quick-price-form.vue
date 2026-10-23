<template>
  <div class="qp-form">
    <div class="qp-step">
      <div class="qp-step-title">{{ $t('view.stock.product.quickPrice.step1') }}</div>
      <div class="qp-row qp-row--3">
        <FormFieldGeneric
          :label="isLot ? $t('view.stock.product.quickPrice.oldSalePricePerPiece') : $t('view.stock.product.quickPrice.oldSalePrice')"
        >
          <div class="qp-readonly">{{ formatMoney2(salePrice) }}</div>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.markup')">
          <InputTextGeneric v-model="form.markup" type="number" :min="0" step="any" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.cost')">
          <div class="qp-readonly">{{ formatMoney2(result.cost) }}</div>
        </FormFieldGeneric>
      </div>
      <p v-if="result.error === 'salePrice'" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.invalid.salePrice') }}
      </p>
    </div>

    <div class="qp-step">
      <div class="qp-step-title">{{ $t('view.stock.product.quickPrice.step2') }}</div>
      <div class="qp-row qp-row--3">
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.goldWeight')">
          <InputTextGeneric v-model="form.goldWeight" type="number" :min="0" step="any" @input="weightTouched = true" />
          <span v-if="metal.source" class="qp-hint">
            {{ $t(`view.stock.product.quickPrice.weightFrom.${metal.source}`) }}
          </span>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.goldPricePerGram')">
          <InputTextGeneric v-model="form.goldPrice" type="number" :min="0" step="any" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.goldCost')">
          <div class="qp-readonly">{{ formatMoney2(result.goldCost) }}</div>
        </FormFieldGeneric>
      </div>

      <div class="qp-row qp-row--4 qp-row--spaced">
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.karat')">
          <DropdownGeneric
            v-model="form.karat"
            :options="karatOptions"
            optionLabel="label"
            optionValue="value"
            :ariaLabel="$t('view.stock.product.quickPrice.karat')"
          />
          <span v-if="isKaratAuto" class="qp-hint">
            {{ $t('view.stock.product.quickPrice.karatFrom', { size: productionTypeSize }) }}
          </span>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.alloyWeight')">
          <InputTextGeneric v-model="form.alloyWeight" type="number" :min="0" step="any" @input="alloyTouched = true" />
          <span v-if="form.karat" class="qp-hint">
            {{ $t('view.stock.product.quickPrice.alloyFormula', { w: form.goldWeight === '' ? 0 : form.goldWeight, gl: goldLossText, factor: karatFactor }) }}
          </span>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.alloyPrice')">
          <InputTextGeneric v-model="form.alloyPrice" type="number" :min="0" step="any" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.alloyCost')">
          <div class="qp-readonly">{{ formatMoney2(result.alloyCost) }}</div>
        </FormFieldGeneric>
      </div>

      <div class="qp-row qp-row--2 qp-row--spaced">
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.goldCostTotal')">
          <div class="qp-readonly">{{ formatMoney2(result.goldCostTotal) }}</div>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.costExGold')">
          <div class="qp-readonly" :class="{ 'qp-readonly--negative': result.costExGold !== null && result.costExGold <= 0 }">
            {{ formatMoney2(result.costExGold) }}
          </div>
        </FormFieldGeneric>
      </div>

      <div class="qp-row qp-row--2 qp-row--spaced">
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.saleGoldPricePerGram')">
          <div class="qp-inline">
            <InputTextGeneric v-model="form.saleGoldPrice" type="number" :min="0" step="any" />
            <ButtonGeneric
              variant="outline"
              icon="bi-calculator"
              class="qp-calc-btn"
              :title="$t('view.stock.product.quickPrice.spot')"
              :aria-label="$t('view.stock.product.quickPrice.spot')"
              @click="showGoldCalculator = true"
            />
          </div>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.saleGoldCostTotal')">
          <div class="qp-readonly">{{ formatMoney2(result.saleGoldCostTotal) }}</div>
          <span v-if="result.saleGoldCostTotal !== null" class="qp-hint">
            {{ $t('view.stock.product.quickPrice.saleGoldCostTotalFormula', { gold: formatMoney2(result.saleGoldCost), alloy: formatMoney2(result.alloyCost) }) }}
          </span>
        </FormFieldGeneric>
      </div>
      <p v-if="result.error === 'saleGoldPrice'" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.invalid.saleGoldPrice') }}
      </p>

      <div class="qp-row qp-row--3 qp-row--spaced">
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.goldLossPercent')">
          <InputTextGeneric v-model="form.goldLossPercent" type="number" :min="0" step="any" @input="goldLossTouched = true" />
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.goldWithLoss')">
          <div class="qp-readonly">{{ formatMoney2(result.goldWithLossCost) }}</div>
          <span v-if="result.goldWithLossCost !== null" class="qp-hint">
            {{ $t('view.stock.product.quickPrice.goldWithLossFormula', { w: form.goldWeight, gl: goldLossText, price: formatPlainNumber(salePriceGold) }) }}
          </span>
        </FormFieldGeneric>
        <FormFieldGeneric :label="$t('view.stock.product.quickPrice.goldLossCostTotal')">
          <div class="qp-readonly">{{ formatMoney2(result.goldLossCostTotal) }}</div>
          <span v-if="result.goldLossCostTotal !== null" class="qp-hint">
            {{ $t('view.stock.product.quickPrice.goldLossCostTotalFormula', { gold: formatMoney2(result.goldWithLossCost), alloy: formatMoney2(result.alloyCost) }) }}
          </span>
        </FormFieldGeneric>
      </div>
      <p v-if="goldLossInvalid" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.invalid.goldLossPercent') }}
      </p>
      <p v-if="!metal.source && !hasWeightInput" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.noMetalWeight') }}
      </p>
      <p v-if="result.error === 'alloyPrice'" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.invalid.alloyPrice') }}
      </p>
      <p v-if="result.error === 'alloyWeight'" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.invalid.alloyWeight') }}
      </p>
      <p v-if="result.error === 'costExGold'" class="qp-warning">
        <i class="bi bi-exclamation-triangle"></i> {{ $t('view.stock.product.quickPrice.invalid.costExGold') }}
      </p>
    </div>

    <div class="qp-step">
      <div class="qp-step-title">{{ $t('view.stock.product.quickPrice.step3') }}</div>
      <div class="qp-row qp-row--2">
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
    </div>

    <div class="qp-result">
      <div class="qp-result-line">
        <span class="qp-result-label">{{ $t('view.stock.product.quickPrice.newPrice') }}</span>
        <div class="qp-result-amount">
          <span class="qp-result-value qp-result-value--sub">{{ result.valid ? formatMoney2(result.quickPrice) : '—' }}</span>
          <span v-if="result.valid && Number(form.rounding) !== 0" class="qp-hint">
            {{ $t('view.stock.product.quickPrice.beforeRounding', { raw: formatMoney2(result.raw) }) }}
          </span>
        </div>
      </div>
      <div class="qp-result-line">
        <span class="qp-result-label">{{ $t('view.stock.product.quickPrice.totalPrice') }}</span>
        <div class="qp-result-amount">
          <span class="qp-result-value">{{ result.valid ? formatMoney2(result.totalPrice) : '—' }}</span>
          <span v-if="result.valid" class="qp-hint">
            {{ $t('view.stock.product.quickPrice.saleGoldPriceHint', { price: formatPlainNumber(salePriceGold) }) }}
          </span>
          <span v-if="result.valid && Number(form.rounding) !== 0" class="qp-hint">
            {{ $t('view.stock.product.quickPrice.beforeRounding', { raw: formatMoney2(result.totalRaw) }) }}
          </span>
        </div>
      </div>
      <div class="qp-result-line">
        <span class="qp-result-label">{{ $t('view.stock.product.quickPrice.totalPriceGoldLoss', { gl: goldLossText }) }}</span>
        <div class="qp-result-amount">
          <span class="qp-result-value">{{ result.goldLossValid ? formatMoney2(result.goldLossTotalPrice) : '—' }}</span>
          <span v-if="result.goldLossValid && Number(form.rounding) !== 0" class="qp-hint">
            {{ $t('view.stock.product.quickPrice.beforeRounding', { raw: formatMoney2(result.goldLossTotalRaw) }) }}
          </span>
        </div>
      </div>
    </div>

    <FormFieldGeneric :label="$t('view.stock.product.quickPrice.remark')">
      <InputTextGeneric v-model="form.remark" type="text" :maxlength="200" />
    </FormFieldGeneric>

    <GoldCalculatorModal
      :isShow="showGoldCalculator"
      @closeModal="showGoldCalculator = false"
      @select="onGoldCalculatorSelect"
    />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { storage } from '@/services/storage.js'
import { getBreakdownSetting } from '@/services/helper/breakdown-setting-store.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import {
  ALLOY_FACTORS,
  DEFAULT_GOLD_LOSS_PERCENT,
  DEFAULT_MARKUP,
  DEFAULT_ROUNDING,
  QUICK_PRICE_ROUNDINGS,
  calcAlloyWeight,
  buildAlloyFactors,
  calcQuickPrice,
  formatMoney2,
  formatPlainNumber,
  getAlloyKarat,
  getMetalWeight
} from '@/services/helper/quick-price.js'

import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'
import GoldCalculatorModal from '@/components/modal/gold-calculator-modal.vue'

const STORAGE_KEY = 'quick-price-defaults-dk'

const loadDefaults = () => {
  const saved = storage.getJSON(STORAGE_KEY, {}) || {}
  const rounding = Number(saved.rounding)
  const savedGoldLoss = saved.goldLossPercent
  const hasGoldLoss = savedGoldLoss !== null && savedGoldLoss !== undefined && savedGoldLoss !== '' && Number(savedGoldLoss) >= 0
  return {
    goldLossPercent: hasGoldLoss ? Number(savedGoldLoss) : null,
    markup: Number(saved.markup) > 0 ? saved.markup : DEFAULT_MARKUP,
    goldPrice: Number(saved.goldPrice) > 0 ? saved.goldPrice : '',
    saleGoldPrice: Number(saved.saleGoldPrice) > 0 ? saved.saleGoldPrice : '',
    alloyPrice: Number(saved.alloyPrice) > 0 ? saved.alloyPrice : '',
    rounding: QUICK_PRICE_ROUNDINGS.includes(rounding) ? rounding : DEFAULT_ROUNDING
  }
}

const weightToInput = (weight) => (weight > 0 ? Number(weight.toFixed(3)) : '')

export default {
  name: 'QuickPriceForm',

  components: {
    FormFieldGeneric,
    InputTextGeneric,
    ButtonGeneric,
    DropdownGeneric,
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
    },
    productionTypeSize: {
      type: String,
      default: ''
    }
  },

  emits: ['saved', 'validChange'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    const defaults = loadDefaults()
    const goldWeight = weightToInput(getMetalWeight(this.materials).weight)
    const karat = getAlloyKarat(this.productionTypeSize)
    const goldLossPercent = defaults.goldLossPercent ?? DEFAULT_GOLD_LOSS_PERCENT
    return {
      form: {
        markup: defaults.markup,
        goldLossPercent,
        goldWeight,
        goldPrice: defaults.goldPrice,
        saleGoldPrice: defaults.saleGoldPrice,
        karat,
        alloyWeight: weightToInput(calcAlloyWeight(goldWeight, karat, goldLossPercent)),
        alloyPrice: defaults.alloyPrice,
        percent: '',
        rounding: defaults.rounding,
        remark: ''
      },
      factors: { ...ALLOY_FACTORS },
      breakdownSetting: null,
      hasSavedGoldLoss: defaults.goldLossPercent !== null,
      weightTouched: false,
      alloyTouched: false,
      goldLossTouched: false,
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

    karatOptions() {
      return [
        ...Object.entries(this.factors).map(([value, factor]) => ({ value, label: `${value} (${factor})` })),
        { value: '', label: this.$t('view.stock.product.quickPrice.karatNone') }
      ]
    },

    karatFactor() {
      return this.factors[this.form.karat] ?? 0
    },

    goldLossValue() {
      const raw = this.form.goldLossPercent
      if (raw === '' || raw === null || raw === undefined) return null
      const num = Number(raw)
      return Number.isFinite(num) && num >= 0 ? num : null
    },

    goldLossInvalid() {
      return this.goldLossValue === null
    },

    goldLossText() {
      return this.goldLossValue === null ? 0 : this.goldLossValue
    },

    isKaratAuto() {
      return !!this.form.karat && this.form.karat === getAlloyKarat(this.productionTypeSize)
    },

    autoAlloyWeight() {
      if (this.goldLossValue === null) return null
      return weightToInput(calcAlloyWeight(this.form.goldWeight, this.form.karat, this.goldLossValue, this.factors))
    },

    salePriceGold() {
      return this.form.saleGoldPrice === '' ? this.form.goldPrice : this.form.saleGoldPrice
    },

    result() {
      return calcQuickPrice({
        salePrice: this.salePrice,
        markup: this.form.markup,
        goldWeight: this.form.goldWeight,
        goldPrice: this.form.goldPrice,
        saleGoldPrice: this.form.saleGoldPrice,
        alloyWeight: this.form.alloyWeight,
        alloyPrice: this.form.alloyPrice,
        percent: this.form.percent,
        rounding: this.form.rounding,
        goldLossPercent: this.form.goldLossPercent
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
    'result.valid': {
      immediate: true,
      handler(val) {
        this.$emit('validChange', val)
      }
    },

    'form.karat'() {
      this.alloyTouched = false
      if (this.autoAlloyWeight !== null) this.form.alloyWeight = this.autoAlloyWeight
    },

    autoAlloyWeight(val) {
      if (val !== null && !this.alloyTouched) this.form.alloyWeight = val
    },

    metal(val) {
      if (!this.weightTouched) this.form.goldWeight = weightToInput(val.weight)
    }
  },

  async created() {
    this.applyBreakdownSetting(await getBreakdownSetting())
  },

  methods: {
    formatMoney2,
    formatPlainNumber,

    applyBreakdownSetting(setting) {
      this.breakdownSetting = setting
      this.factors = buildAlloyFactors(setting)
      const gl = Number(setting?.goldLossPercent)
      if (!this.goldLossTouched && !this.hasSavedGoldLoss && Number.isFinite(gl) && gl >= 0) {
        this.form.goldLossPercent = gl
      }
    },

    onGoldCalculatorSelect(data) {
      const perGram = Number(data.pricePerGramThb) || 0
      if (perGram <= 0) {
        warning(this.$t('view.stock.product.quickPrice.spotNoRate'), this.$t('alert.alertTitle.warning'))
        return
      }
      this.form.saleGoldPrice = Number(perGram.toFixed(2))
      this.showGoldCalculator = false
    },

    onReset() {
      const defaults = loadDefaults()
      const goldWeight = weightToInput(this.metal.weight)
      const karat = getAlloyKarat(this.productionTypeSize)
      const settingGoldLoss = Number(this.breakdownSetting?.goldLossPercent)
      const goldLossPercent =
        defaults.goldLossPercent ??
        (Number.isFinite(settingGoldLoss) && settingGoldLoss >= 0 ? settingGoldLoss : DEFAULT_GOLD_LOSS_PERCENT)
      this.weightTouched = false
      this.alloyTouched = false
      this.goldLossTouched = false
      this.hasSavedGoldLoss = defaults.goldLossPercent !== null
      this.form = {
        markup: defaults.markup,
        goldLossPercent,
        goldWeight,
        goldPrice: defaults.goldPrice,
        saleGoldPrice: defaults.saleGoldPrice,
        karat,
        alloyWeight: weightToInput(calcAlloyWeight(goldWeight, karat, goldLossPercent, this.factors)),
        alloyPrice: defaults.alloyPrice,
        percent: '',
        rounding: defaults.rounding,
        remark: ''
      }
    },

    rememberDefaults() {
      try {
        const saved = storage.getJSON(STORAGE_KEY, {}) || {}
        const alloyPrice = Number(this.form.alloyPrice)
        storage.setJSON(STORAGE_KEY, {
          markup: Number(this.form.markup),
          goldPrice: Number(this.form.goldPrice),
          saleGoldPrice: Number(this.form.saleGoldPrice) > 0 ? Number(this.form.saleGoldPrice) : saved.saleGoldPrice,
          alloyPrice: alloyPrice > 0 ? alloyPrice : saved.alloyPrice,
          goldLossPercent: this.goldLossValue ?? saved.goldLossPercent,
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
          saleGoldPrice: Number(this.form.saleGoldPrice),
          karat: this.form.karat || null,
          alloyFactor: this.karatFactor,
          alloyWeight: Number(this.form.alloyWeight) || 0,
          alloyPrice: Number(this.form.alloyPrice) || 0,
          percent: this.form.percent === '' ? 0 : Number(this.form.percent),
          goldLossPercent: this.goldLossValue,
          rounding: Number(this.form.rounding),
          remark: remark || null
        }
      })
      if (!res) return
      this.rememberDefaults()
      this.form.remark = ''
      success(this.$t('view.stock.product.quickPrice.saveSuccess', { price: formatMoney2(res.totalPrice ?? this.result.totalPrice) }))
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
  gap: var(--sp-md) var(--sp-lg);
  align-items: start;

  &--2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &--3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  &--4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  &--spaced {
    margin-top: var(--sp-md);
  }

  @media (max-width: 768px) {
    &--2,
    &--3,
    &--4 {
      grid-template-columns: 1fr;
    }
  }
}

.qp-readonly {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--status-closed-bg);
  font-size: 0.9rem;
  line-height: var(--lh-sm);
  font-weight: 700;
  text-align: right;

  &--negative {
    color: var(--base-red);
  }
}

.qp-inline {
  display: flex;
  align-items: stretch;

  :deep(input.form-control) {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
    margin-top: 0 !important;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.qp-calc-btn.btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: -1px;
  padding: 0 var(--sp-md);
  border: 1px solid var(--color-border);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
  background: var(--status-closed-bg);
  color: var(--base-sub-color);
  box-shadow: none;

  &:hover,
  &:focus {
    border-color: var(--color-border);
    background: var(--color-highlight-bg);
    color: var(--base-font-color);
    box-shadow: none;
  }
}

.qp-hint {
  display: block;
  margin-top: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.qp-warning {
  margin: var(--sp-sm) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-red);
}

.qp-result {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);
  padding: var(--sp-lg);
  border-radius: var(--radius-lg);
  background: var(--color-highlight-bg);
}

.qp-result-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-lg);
}

.qp-result-label {
  font-weight: 700;
  color: var(--base-font-color);
}

.qp-result-amount {
  text-align: right;

  .qp-hint {
    margin-top: 0;
  }
}

.qp-result-value {
  font-size: var(--fs-xl);
  font-weight: 700;
  color: var(--base-font-color);
}

.qp-result-value--sub {
  font-size: var(--fs-lg);
}
</style>
