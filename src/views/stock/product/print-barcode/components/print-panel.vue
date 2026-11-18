<template>
  <SectionCardGeneric class="print-panel">
    <div class="panel-row">
      <div class="summary">
        <span class="summary-text">{{
          $t('view.stock.printBarcode.selectedSummary', { count: selectedCount, total: totalCount, labels: labelCount })
        }}</span>
      </div>

      <div class="field">
        <span class="title-text">{{ $t('view.stock.printBarcode.typeLabel') }}</span>
        <DropdownGeneric
          :modelValue="barcodeType"
          inputId="print-barcode-type"
          :ariaLabel="$t('view.stock.printBarcode.typeLabel')"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          :disabled="isPrinting"
          @update:modelValue="$emit('update:barcodeType', $event)"
        />
      </div>

      <div v-if="showRemarkSelect" class="field">
        <span class="title-text">{{ $t('view.stock.product.remarkLabel') }}</span>
        <DropdownGeneric
          :modelValue="remarkSymbol"
          inputId="print-barcode-remark"
          :ariaLabel="$t('view.stock.product.remarkLabel')"
          :options="remarkOptions"
          optionLabel="label"
          optionValue="value"
          :disabled="isPrinting"
          @update:modelValue="$emit('update:remarkSymbol', $event)"
        />
      </div>

      <div v-if="showHideMoldOption" class="field field-checkbox">
        <CheckboxGeneric
          :modelValue="hideMold"
          :label="$t('view.stock.printBarcode.hideMold')"
          :disabled="isPrinting"
          @update:modelValue="$emit('update:hideMold', $event)"
        />
      </div>

      <div v-if="showHideMoldOption && !hidePrice" class="field">
        <FormFieldGeneric :label="$t('view.stock.printBarcode.labelPriceMode')">
          <ToggleGroupGeneric
            :modelValue="labelPriceMode"
            :options="priceModeOptions"
            :ariaLabel="$t('view.stock.printBarcode.labelPriceMode')"
            :disabled="isPrinting"
            @update:modelValue="$emit('update:labelPriceMode', $event)"
          />
        </FormFieldGeneric>
      </div>

      <template v-if="isFullPriceMode">
        <div class="field">
          <FormFieldGeneric :label="$t('view.stock.printBarcode.labelCurrency')">
            <ToggleGroupGeneric
              :modelValue="labelCurrency"
              :options="currencyOptions"
              :ariaLabel="$t('view.stock.printBarcode.labelCurrency')"
              :disabled="isPrinting"
              @update:modelValue="$emit('update:labelCurrency', $event)"
            />
          </FormFieldGeneric>
        </div>
        <div v-if="labelCurrency === 'USD'" class="field">
          <FormFieldGeneric :label="$t('view.stock.printBarcode.labelRate')">
            <InputTextGeneric
              :modelValue="labelRate"
              type="number"
              :min="0"
              :disabled="isPrinting"
              @update:modelValue="$emit('update:labelRate', $event)"
            />
          </FormFieldGeneric>
          <div v-if="labelRateOutOfRange" class="gold-price-warning">
            <span class="bi bi-exclamation-triangle mr-1"></span>
            <span>{{ labelRateRangeText }}</span>
          </div>
        </div>
      </template>

      <div v-if="!isLegacyProfile" class="field field-checkbox">
        <CheckboxGeneric
          :modelValue="abbreviateGems"
          :label="$t('view.stock.printBarcode.abbreviateGems')"
          :disabled="isPrinting"
          @update:modelValue="$emit('update:abbreviateGems', $event)"
        />
      </div>

      <div v-if="showUnitNoOption" class="field field-checkbox">
        <CheckboxGeneric
          :modelValue="printUnitNo"
          :label="$t('view.stock.printBarcode.printUnitNo')"
          :disabled="isPrinting"
          @update:modelValue="$emit('update:printUnitNo', $event)"
        />
      </div>

      <div class="field field-checkbox">
        <CheckboxGeneric
          :modelValue="hidePrice"
          :label="$t('common.label.hidePrice')"
          :disabled="isPrinting"
          @update:modelValue="$emit('update:hidePrice', $event)"
        />
      </div>

      <div class="printer-status">
        <div
          class="status-light"
          :class="statusClass"
          role="button"
          tabindex="0"
          :title="$t('view.stock.product.printerChecking')"
          @click="checkPrinterStatus"
          @keydown.enter="checkPrinterStatus"
        ></div>
        <span class="status-text" :class="statusClass">{{ printerStatusText }}</span>
        <router-link v-if="showPrinterSettingLink" to="/setting/barcode-printer" class="printer-setting-link">
          {{ $t('common.printer.goToSetting') }}
        </router-link>
      </div>

      <div v-if="showHideMoldOption" class="field">
        <FormFieldGeneric :label="$t('view.stock.printBarcode.goldPriceFallback')">
          <InputTextGeneric
            :modelValue="goldPrice"
            type="number"
            :min="0"
            :placeholder="$t('view.stock.printBarcode.goldPricePlaceholder')"
            :disabled="isPrinting"
            @update:modelValue="$emit('update:goldPrice', $event)"
          />
        </FormFieldGeneric>
        <div v-if="goldPriceOutOfRange" class="gold-price-warning">
          <span class="bi bi-exclamation-triangle mr-1"></span>
          <span>{{ goldPriceRangeText }}</span>
        </div>
      </div>

      <div class="actions">
        <ButtonGeneric
          v-if="failedCount > 0 && !isPrinting"
          variant="outline"
          icon="bi-arrow-repeat"
          :label="$t('view.stock.printBarcode.retryFailed', { count: failedCount })"
          @click="$emit('retry')"
        />
        <ButtonGeneric
          variant="main"
          icon="bi-upc-scan"
          class="ml-2"
          :label="$t('view.stock.printBarcode.printBtn')"
          :disabled="isPrintDisabled"
          @click="$emit('print')"
        />
      </div>
    </div>

    <div v-if="isGt800OnlyBlocked" class="panel-note">
      <span class="status-message">
        {{ $t('view.stock.product.qrGt800Blocked') }}
        <router-link to="/setting/barcode-printer">{{ $t('view.stock.product.qrGt800SettingLink') }}</router-link>
      </span>
    </div>

    <div v-if="labelPriceBlockReason" class="panel-note">
      <span class="gold-price-warning">
        <span class="bi bi-exclamation-triangle mr-1"></span>
        <span>{{ labelPriceBlockReason }}</span>
      </span>
    </div>

    <div v-if="showNote" class="panel-note">
      <span v-if="isPrinting" class="progress-text">
        <i class="bi bi-printer"></i>
        {{
          progress.total > 0
            ? $t('view.stock.printBarcode.progress', { done: progress.done, total: progress.total })
            : $t('view.stock.printBarcode.preparing')
        }}
      </span>
      <span v-else-if="statusMessage" class="status-message">{{ statusMessage }}</span>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { zebraPrinterApi } from '@/stores/modules/api/printer/zebra-store.js'
import { getBarcodeProfile, PRINTER_PROFILES } from '@/services/api/barcode-printer-config.js'
import { REMARK_SYMBOLS, REMARK_SYMBOL_NONE } from '@/services/helper/barcode/barcode-zpl.js'
import {
  LABEL_PRICE_MODES,
  LABEL_CURRENCIES,
  LABEL_RATE_MIN,
  LABEL_RATE_MAX,
  isLabelRateOutOfRange
} from '@/services/helper/barcode/label-price.js'
import { isPriceOutOfRange, MIN_PRICE_PER_GRAM, MAX_PRICE_PER_GRAM } from '@/services/helper/barcode/gold-stamp.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'

const REMARK_I18N_KEYS = {
  star: 'remarkStar',
  hash: 'remarkHash',
  plus: 'remarkPlus',
  at: 'remarkAt',
  'circle-filled': 'remarkCircleFilled',
  'circle-outline': 'remarkCircleOutline',
  'square-filled': 'remarkSquareFilled',
  'square-outline': 'remarkSquareOutline'
}

export default {
  components: { SectionCardGeneric, ToggleGroupGeneric, ButtonGeneric, DropdownGeneric, CheckboxGeneric, FormFieldGeneric, InputTextGeneric },

  props: {
    hidePrice: {
      type: Boolean,
      default: false
    },
    hideMold: {
      type: Boolean,
      default: false
    },
    goldPrice: {
      type: [String, Number],
      default: ''
    },
    labelPriceMode: {
      type: String,
      default: LABEL_PRICE_MODES.CODE
    },
    labelCurrency: {
      type: String,
      default: LABEL_CURRENCIES.USD
    },
    labelRate: {
      type: [String, Number],
      default: ''
    },
    labelPriceBlockReason: {
      type: String,
      default: ''
    },
    abbreviateGems: {
      type: Boolean,
      default: true
    },
    printUnitNo: {
      type: Boolean,
      default: false
    },
    barcodeType: {
      type: String,
      default: 'original'
    },
    remarkSymbol: {
      type: String,
      default: REMARK_SYMBOL_NONE
    },
    selectedCount: {
      type: Number,
      default: 0
    },
    totalCount: {
      type: Number,
      default: 0
    },
    labelCount: {
      type: Number,
      default: 0
    },
    isPrinting: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Object,
      default: () => ({ done: 0, total: 0 })
    },
    failedCount: {
      type: Number,
      default: 0
    },
    statusMessage: {
      type: String,
      default: ''
    }
  },

  emits: ['update:barcodeType', 'update:remarkSymbol', 'update:hidePrice', 'update:hideMold', 'update:goldPrice', 'update:labelPriceMode', 'update:labelCurrency', 'update:labelRate', 'update:abbreviateGems', 'update:printUnitNo', 'print', 'retry'],

  setup() {
    const zebraPrinter = zebraPrinterApi()
    return { zebraPrinter }
  },

  data() {
    return {
      printerCheck: { status: 'unknown', printerName: '', printers: [], detail: null }
    }
  },

  computed: {
    isLegacyProfile() {
      return getBarcodeProfile() === PRINTER_PROFILES.LEGACY
    },

    isGt800OnlyBlocked() {
      return this.isLegacyProfile && (this.barcodeType === 'original-qr' || this.barcodeType === 'small-50x14')
    },

    typeOptions() {
      const options = [
        { value: 'original', label: this.$t('view.stock.product.tabOriginal') },
        { value: 'cost-with-gold', label: this.$t('view.stock.product.tabCostWithGold') },
        { value: 'cost-no-gold', label: this.$t('view.stock.product.tabCostNoGold') },
        { value: 'tag-with-gold', label: this.$t('view.stock.product.tabTagWithGold') },
        { value: 'tag-no-gold', label: this.$t('view.stock.product.tabTagNoGold') }
      ]
      options.push({ value: 'original-qr', label: this.$t('view.stock.product.tabOriginalQr') })
      options.push({ value: 'small-50x14', label: this.$t('view.stock.product.tabSmall50x14') })
      return options
    },

    goldPriceRangeText() {
      return this.$t('view.stock.printBarcode.goldPriceOutOfRange', { min: MIN_PRICE_PER_GRAM, max: MAX_PRICE_PER_GRAM })
    },

    goldPriceOutOfRange() {
      return this.showHideMoldOption && isPriceOutOfRange(this.goldPrice)
    },

    showHideMoldOption() {
      return this.barcodeType === 'small-50x14'
    },

    isFullPriceMode() {
      return this.showHideMoldOption && !this.hidePrice && this.labelPriceMode === LABEL_PRICE_MODES.FULL
    },

    priceModeOptions() {
      return [
        { value: LABEL_PRICE_MODES.CODE, label: this.$t('view.stock.printBarcode.labelPriceModeCode') },
        { value: LABEL_PRICE_MODES.FULL, label: this.$t('view.stock.printBarcode.labelPriceModeFull') }
      ]
    },

    currencyOptions() {
      return [
        { value: LABEL_CURRENCIES.USD, label: this.$t('view.stock.printBarcode.labelCurrencyUsd') },
        { value: LABEL_CURRENCIES.THB, label: this.$t('view.stock.printBarcode.labelCurrencyThb') }
      ]
    },

    labelRateOutOfRange() {
      return isLabelRateOutOfRange(this.labelRate)
    },

    labelRateRangeText() {
      return this.$t('view.stock.printBarcode.labelRateOutOfRange', { rate: this.labelRate, min: LABEL_RATE_MIN, max: LABEL_RATE_MAX })
    },

    showUnitNoOption() {
      return this.barcodeType === 'original' && !this.isLegacyProfile
    },

    showRemarkSelect() {
      return this.barcodeType === 'original' && !this.isLegacyProfile
    },

    remarkOptions() {
      return [
        { value: REMARK_SYMBOL_NONE, label: this.$t('view.stock.product.remarkNone') },
        ...REMARK_SYMBOLS.map((key) => ({
          value: key,
          label: this.$t(`view.stock.product.${REMARK_I18N_KEYS[key]}`)
        }))
      ]
    },

    showNote() {
      return this.isPrinting || !!this.statusMessage
    },

    isPrinterReady() {
      return this.printerCheck.status === 'success'
    },

    isPrinterChecking() {
      return this.printerCheck.status === 'unknown'
    },

    statusClass() {
      if (this.isPrinterReady) return 'is-ready'
      if (this.isPrinterChecking) return 'is-checking'
      return 'is-error'
    },

    showPrinterSettingLink() {
      return this.printerCheck.status === 'no-printer' || this.printerCheck.status === 'printer-not-found'
    },

    printerStatusText() {
      if (this.printerCheck.profile === 'legacy') {
        return this.printerCheck.status === 'success'
          ? this.$t('view.stock.product.printerReady')
          : this.$t('common.printer.legacyServiceError')
      }

      switch (this.printerCheck.status) {
        case 'success':
          return `${this.$t('view.stock.product.printerReady')} · ${this.printerCheck.printerName}`
        case 'no-printer':
          return this.$t('common.printer.noPrinterSet')
        case 'printer-not-found':
          return this.$t('common.printer.savedNotFound', { name: this.printerCheck.printerName })
        case 'printer-offline':
          return this.$t('common.printer.statusOffline', { name: this.printerCheck.printerName })
        case 'printer-paused':
          return this.$t('common.printer.statusPaused', { name: this.printerCheck.printerName })
        case 'printer-error':
          return this.$t('common.printer.statusError', { name: this.printerCheck.printerName })
        case 'bridge-error':
          return this.bridgeErrorText
        default:
          return this.$t('view.stock.product.printerChecking')
      }
    },

    bridgeErrorText() {
      const bridgeStatus = this.printerCheck.detail?.bridgeStatus
      if (bridgeStatus === 'blocked') return this.$t('common.printer.statusBlocked')
      if (bridgeStatus === 'empty') return this.$t('common.printer.statusEmpty')
      return this.$t('common.printer.statusUnreachableTitle')
    },

    isPrintDisabled() {
      return this.isPrinting || !this.isPrinterReady || this.selectedCount === 0 || this.isGt800OnlyBlocked || !!this.labelPriceBlockReason
    }
  },

  methods: {
    async checkPrinterStatus() {
      this.printerCheck = { status: 'unknown', printerName: '', printers: [], detail: null }
      this.printerCheck = await this.zebraPrinter.fetchBarcodePrinterStatus()
    }
  },

  async created() {
    await this.checkPrinterStatus()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.print-panel {
  margin-top: var(--sp-lg);
}

.panel-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--sp-lg);
}

.summary {
  flex: 1 1 auto;
  align-self: center;
}

.summary-text {
  font-weight: 700;
  color: var(--base-font-color);
}

.field {
  min-width: calc(var(--sp-2xl) * 8);
}

.gold-price-warning {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  margin-top: var(--sp-xs);

  .bi {
    color: var(--status-open);
  }
}

.field-checkbox {
  min-width: auto;
  align-self: center;
}

.printer-status {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  align-self: center;
}

.status-light {
  width: var(--sp-md);
  height: var(--sp-md);
  border-radius: 50%;
  cursor: pointer;

  &.is-ready {
    background-color: var(--base-green);
    box-shadow: 0 0 var(--sp-xs) var(--base-green);
  }

  &.is-checking {
    background-color: var(--base-warning);
    box-shadow: 0 0 var(--sp-xs) var(--base-warning);
  }

  &.is-error {
    background-color: var(--base-red);
    box-shadow: 0 0 var(--sp-xs) var(--base-red);
  }
}

.status-text {
  font-size: var(--fs-base);
  font-weight: 700;

  &.is-ready {
    color: var(--base-green);
  }

  &.is-checking {
    color: var(--base-warning);
  }

  &.is-error {
    color: var(--base-red);
  }
}

.printer-setting-link {
  font-size: var(--fs-sm);
  color: var(--base-green);
  text-decoration: underline;
}

.actions {
  display: flex;
  align-items: center;
}

.panel-note {
  margin-top: var(--sp-md);
  font-size: var(--fs-base);
  color: var(--base-font-color);
}

.status-message {
  font-weight: 700;
}

.progress-text {
  font-weight: 700;
}
</style>
