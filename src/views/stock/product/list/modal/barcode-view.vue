<template>
  <div>
    <modal :showModal="isShowModal" @closeModal="closeModal" width="800px">
      <template #title>
        <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.stock.product.printTitle', { stockNumber: stock.stockNumber }) }}</span>
      </template>
      <template #content>
        <!-- Tab เลือกแบบ -->
        <div>
          <div class="label-type-tabs">
            <button
              :class="['tab-btn', selectedType === 'original' ? 'tab-btn-active' : '']"
              @click="selectedType = 'original'"
            >
              <i class="bi bi-file-earmark-text mr-1"></i> {{ $t('view.stock.product.tabOriginal') }}
            </button>
            <button
              :class="['tab-btn', selectedType === 'cost-with-gold' ? 'tab-btn-active' : '']"
              @click="selectedType = 'cost-with-gold'"
            >
              <i class="bi bi-file-earmark mr-1"></i> {{ $t('view.stock.product.tabCostWithGold') }}
            </button>
            <button
              :class="['tab-btn', selectedType === 'cost-no-gold' ? 'tab-btn-active' : '']"
              @click="selectedType = 'cost-no-gold'"
            >
              <i class="bi bi-file-earmark-minus mr-1"></i> {{ $t('view.stock.product.tabCostNoGold') }}
            </button>
            <button
              :class="['tab-btn', selectedType === 'tag-with-gold' ? 'tab-btn-active' : '']"
              @click="selectedType = 'tag-with-gold'"
            >
              <i class="bi bi-tag mr-1"></i> {{ $t('view.stock.product.tabTagWithGold') }}
            </button>
            <button
              :class="['tab-btn', selectedType === 'tag-no-gold' ? 'tab-btn-active' : '']"
              @click="selectedType = 'tag-no-gold'"
            >
              <i class="bi bi-tag-fill mr-1"></i> {{ $t('view.stock.product.tabTagNoGold') }}
            </button>
            <button
              :class="['tab-btn', selectedType === 'original-qr' ? 'tab-btn-active' : '']"
              @click="selectedType = 'original-qr'"
            >
              <i class="bi bi-qr-code mr-1"></i> {{ $t('view.stock.product.tabOriginalQr') }}
            </button>
            <button
              :class="['tab-btn', selectedType === 'small-50x14' ? 'tab-btn-active' : '']"
              @click="selectedType = 'small-50x14'"
            >
              <i class="bi bi-tags mr-1"></i> {{ $t('view.stock.product.tabSmall50x14') }}
            </button>
          </div>
        </div>

        <div class="pl-4 pr-4 pt-2">
          <BarcodeNoDashNotice />
        </div>

        <div v-if="showCostMissingWarning" class="pl-4 pr-4 pt-2">
          <div class="cost-missing-warning">
            <span class="bi bi-exclamation-triangle mr-1"></span>
            <span>{{ $t('view.stock.product.costMissingWarning') }}</span>
          </div>
        </div>

        <div v-if="isGt800OnlyBlocked" class="pl-4 pr-4 pt-2">
          <div class="cost-missing-warning">
            <span class="bi bi-exclamation-triangle mr-1"></span>
            <span>{{ $t('view.stock.product.qrGt800Blocked') }}</span>
            <router-link to="/setting/barcode-printer" class="ml-1">{{ $t('view.stock.product.qrGt800SettingLink') }}</router-link>
          </div>
        </div>

        <div v-if="showPublicLinkWarning" class="pl-4 pr-4 pt-2">
          <div class="cost-missing-warning">
            <span class="bi bi-exclamation-triangle mr-1"></span>
            <span>{{ $t('view.stock.product.publicLinkError') }}</span>
          </div>
        </div>

        <div class="pl-4 pt-2">
          <span class="title-text">{{ $t('view.stock.product.previewLabel') }}</span>
        </div>

        <div class="form-col-container pl-4 pr-4">
          <div class="filter-container-bg-focus">
            <barcodePreview
              :selectedType="selectedType"
              :barcode="labelBarcode"
              :price="previewPrice"
              :hidePrice="hidePrice"
              :qrUrl="selectedType === 'original-qr' ? publicUrl : ''"
              :remarkSymbol="showRemarkSelect ? remarkSymbol : ''"
              :hideMold="hideMold"
              :goldStamp="selectedType === 'small-50x14' ? pieceGoldStamp.stamp : null"
              :abbreviateGems="abbreviateGems"
              :gemLabelMeta="gemLabelMeta"
              :labelPriceText="labelPriceText"
            />
          </div>
        </div>

        <div v-if="showRemarkSelect" class="pl-4 pr-4 pt-2 top-line-select">
          <FormFieldGeneric :label="$t('view.stock.product.labelTopLine')">
            <ToggleGroupGeneric
              v-model="labelTopLine"
              :options="topLineOptions"
              :ariaLabel="$t('view.stock.product.labelTopLine')"
            />
          </FormFieldGeneric>
        </div>

        <div v-if="selectedType === 'small-50x14'" class="pl-4 pr-4 pt-2">
          <FormFieldGeneric :label="$t('view.stock.printBarcode.labelPriceMode')">
            <ToggleGroupGeneric
              v-model="labelPriceMode"
              :options="priceModeOptions"
              :ariaLabel="$t('view.stock.printBarcode.labelPriceMode')"
              :disabled="isPrinting"
              @update:modelValue="onLabelPriceModeChange"
            />
          </FormFieldGeneric>
        </div>

        <div v-if="isFullPriceMode && hidePrice" class="pl-4 pr-4 pt-2">
          <div class="label-price-hint">{{ $t('view.stock.printBarcode.labelPriceNotPrinted') }}</div>
        </div>

        <div v-if="isFullPriceMode && !hidePrice" class="pl-4 pr-4 pt-2">
          <div class="label-price-box">
            <FormFieldGeneric :label="$t('view.stock.printBarcode.labelCurrency')">
              <ToggleGroupGeneric
                v-model="labelCurrency"
                :options="currencyOptions"
                :ariaLabel="$t('view.stock.printBarcode.labelCurrency')"
                :disabled="isPrinting"
                @update:modelValue="onLabelCurrencyChange"
              />
            </FormFieldGeneric>
            <FormFieldGeneric v-if="labelCurrency === 'USD'" :label="$t('view.stock.printBarcode.labelRate')">
              <InputTextGeneric
                v-model="labelRate"
                type="number"
                :min="0"
                :disabled="isPrinting"
                @update:modelValue="onLabelRateChange"
              />
            </FormFieldGeneric>
            <FormFieldGeneric :label="$t('view.stock.printBarcode.labelPriceInput')">
              <div class="label-price-input">
                <span v-if="labelSymbol" class="label-price-symbol">{{ labelSymbol }}</span>
                <InputTextGeneric
                  :modelValue="labelPriceInputValue"
                  type="number"
                  :min="0"
                  :step="0.01"
                  :disabled="isPrinting"
                  @update:modelValue="labelPriceOverride = $event"
                  @blur="onLabelPriceBlur"
                />
                <template v-if="labelPriceOverride !== null">
                  <span class="label-price-edited">{{ $t('view.stock.printBarcode.labelPriceEdited') }}</span>
                  <ButtonGeneric
                    variant="outline"
                    icon="bi-arrow-counterclockwise"
                    :title="$t('view.stock.printBarcode.labelPriceReset')"
                    @click="labelPriceOverride = null"
                  />
                </template>
              </div>
            </FormFieldGeneric>
            <div v-if="labelPriceHint" class="label-price-hint">{{ labelPriceHint }}</div>
            <div class="label-price-hint label-price-printed">
              {{ $t('view.stock.printBarcode.labelPricePrinted') }}: <span class="label-price-printed-text">{{ printedLine2 }}</span>
            </div>
            <div v-if="labelRateOutOfRange" class="gold-price-warning">
              <span class="bi bi-exclamation-triangle mr-1"></span>
              <span>{{ labelRateRangeText }}</span>
            </div>
            <div v-if="labelPriceMissingText" class="gold-price-warning">
              <span class="bi bi-exclamation-triangle mr-1"></span>
              <span>{{ labelPriceMissingText }}</span>
            </div>
          </div>
        </div>

        <div class="pl-4 pr-4 pt-2">
          <CheckboxGeneric v-model="hidePrice" :label="$t('common.label.hidePrice')" />
        </div>

        <div v-if="selectedType === 'small-50x14'" class="pl-4 pr-4 pt-2">
          <CheckboxGeneric v-model="hideMold" :label="$t('view.stock.printBarcode.hideMold')" />
        </div>

        <div v-if="!isLegacyProfile || isGt800OnlyType" class="pl-4 pr-4 pt-2">
          <CheckboxGeneric
            v-model="abbreviateGems"
            :label="$t('view.stock.printBarcode.abbreviateGems')"
            @update:modelValue="onAbbreviateGemsChange"
          />
        </div>

        <div v-if="showRemarkSelect" class="pl-4 pr-4 pt-2 remark-select">
          <FormFieldGeneric :label="$t('view.stock.product.remarkLabel')">
            <DropdownGeneric
              v-model="remarkSymbol"
              inputId="barcode-remark-symbol"
              :ariaLabel="$t('view.stock.product.remarkLabel')"
              :options="remarkOptions"
              optionLabel="label"
              optionValue="value"
            />
          </FormFieldGeneric>
          <div v-if="showRemarkNoRoomWarning" class="pt-2">
            <div class="cost-missing-warning">
              <span class="bi bi-exclamation-triangle mr-1"></span>
              <span>{{ $t('view.stock.product.remarkNoRoom') }}</span>
            </div>
          </div>
        </div>

        <div class="pl-4 pr-4 pt-2 pb-2">
          <div class="title-text printer-warning-line">
            <span class="bi bi-exclamation-circle mr-1"></span>
            <span>{{ $t('view.stock.product.printerWarning') }}</span>
          </div>

          <div v-if="selectedType === 'small-50x14'" class="gold-stamp-box">
            <div class="gold-stamp-fallback">
              <FormFieldGeneric :label="$t('view.stock.printBarcode.goldPriceFallback')">
                <InputTextGeneric
                  v-model="goldPrice"
                  type="number"
                  :min="0"
                  :placeholder="$t('view.stock.printBarcode.goldPricePlaceholder')"
                  :disabled="isPrinting"
                  @update:modelValue="onGoldPriceChange"
                />
              </FormFieldGeneric>
              <div v-if="goldPriceOutOfRange" class="gold-price-warning">
                <span class="bi bi-exclamation-triangle mr-1"></span>
                <span>{{ goldPriceRangeText }}</span>
              </div>
            </div>
            <div class="gold-stamp-preview" :class="{ 'gold-stamp-preview--none': pieceGoldStamp.source === 'none' }">
              <span class="bi mr-1" :class="pieceGoldStamp.source === 'none' ? 'bi-exclamation-triangle' : 'bi-tag'"></span>
              <span>{{ $t('view.stock.printBarcode.stampPrefix') }} {{ goldStampText }}</span>
            </div>
          </div>

          <div class="d-flex justify-content-between items-center">
            <!-- status -->
            <div class="vertical-center-container">
              <div class="printer-status-indicator">
                <div class="status-container">
                  <div
                    class="status-light"
                    :class="{
                      'status-green': isPrinterReady,
                      'status-yellow': isPrinterChecking,
                      'status-red': !isPrinterReady && !isPrinterChecking
                    }"
                    @click="checkPrinterStatus"
                  ></div>
                  <span
                    class="status-text"
                    :class="{
                      'text-green': isPrinterReady,
                      'text-yellow': isPrinterChecking,
                      'text-red': !isPrinterReady && !isPrinterChecking
                    }"
                    >{{ printerStatusText }}</span
                  >
                </div>
                <router-link
                  v-if="showPrinterSettingLink"
                  to="/setting/barcode-printer"
                  class="printer-setting-link"
                >
                  {{ $t('common.printer.goToSetting') }}
                </router-link>
              </div>
            </div>

            <!-- action -->
            <div class="vertical-center-container">
              <div>
                <span class="title-text">{{ $t('view.stock.product.printCount') }}</span>
              </div>
              <div class="ml-2 mr-2">
                <input
                  class="form-control text-center print-count-input"
                  type="number"
                  v-model="barcode.print"
                  min="1"
                  :max="maxPrintCount"
                  @input="validateInput"
                />
              </div>
              <ButtonGeneric
                variant="main"
                icon="bi-upc-scan"
                :loading="isPrinting"
                :disabled="isPrintDisabled"
                @click="onPrintBarcode"
              />
            </div>
          </div>

          <div v-if="isPrinting" class="pt-2 printing-progress">
            <span class="bi bi-printer mr-1"></span>
            <span>{{ $t('common.printer.printing', { done: progress.done, total: progress.total }) }}</span>
          </div>

          <div v-if="pendingJobs > 0" class="pt-2">
            <div class="cost-missing-warning">
              <span class="bi bi-exclamation-triangle mr-1"></span>
              <span>{{ $t('common.printer.queueJobs', { n: pendingJobs }) }}</span>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))
const barcodePreview = defineAsyncComponent(() =>
  import('@/components/custom/barcode-demo/barcode-preview.vue')
)

const interfaceBarcode = {
  madeIn: 'MADE IN THAILAND',
  madeInText: 'XXXXXXXXXXX',
  mold: 'RFXXXXR',
  goldType: 'XXK',
  stockNumber: 'XX-XXXX-XXX',
  size: 'XX',
  productNameEn: '',
  gold: '',
  gems: [],
  price: null,
  salePrice: null,
  originPrice: null,
  tagPriceMultiplier: 1,
  print: 1,
  isSilver: false
}

import { zebraPrinterApi } from '@/stores/modules/api/printer/zebra-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { buildBarcodeModel } from '@/services/helper/barcode/barcode-model.js'
import { getPieceQty } from '@/services/utils/stock-piece-qty.js'
import { error, success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import {
  getBarcodeProfile,
  PRINTER_PROFILES,
  getAbbreviateGems,
  setAbbreviateGems,
  getBarcodeGoldPrice,
  setBarcodeGoldPrice,
  getBarcodeLabelPriceMode,
  setBarcodeLabelPriceMode,
  getBarcodeLabelCurrency,
  setBarcodeLabelCurrency,
  getBarcodeLabelRate,
  setBarcodeLabelRate
} from '@/services/api/barcode-printer-config.js'
import { buildPublicUrl } from '@/config/public-site-config.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { resolvePieceGoldStamp, formatStampDisplay, isPriceOutOfRange, MIN_PRICE_PER_GRAM, MAX_PRICE_PER_GRAM } from '@/services/helper/barcode/gold-stamp.js'
import {
  LABEL_PRICE_MODES,
  LABEL_CURRENCIES,
  LABEL_CURRENCY_SYMBOLS,
  LABEL_RATE_MIN,
  LABEL_RATE_MAX,
  computeLabelPrice,
  pickLabelPrice,
  isUsableLabelPrice,
  isValidLabelRate,
  isLabelRateOutOfRange,
  formatLabelPriceText,
  normalizeLabelPriceInput,
  formatLabelPriceInput
} from '@/services/helper/barcode/label-price.js'
import { layoutGt800, layoutGt800Small, buildGemLabelMeta, REMARK_SYMBOLS, REMARK_SYMBOL_NONE } from '@/services/helper/barcode/barcode-zpl.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import BarcodeNoDashNotice from '@/components/custom/barcode-no-dash-notice.vue'

export default {
  components: {
    modal,
    BarcodeNoDashNotice,
    barcodePreview,
    ToggleGroupGeneric,
    ButtonGeneric,
    DropdownGeneric,
    FormFieldGeneric,
    InputTextGeneric,
    CheckboxGeneric
  },

  setup() {
    const zebraPrinter = zebraPrinterApi()
    const productStore = usrStockProductApiStore()
    const masterStore = useMasterApiStore()
    return { zebraPrinter, productStore, masterStore }
  },

  props: {
    isShow: {
      type: Boolean,
      required: true,
      default: false
    },
    modelStock: {
      type: Object,
      required: true,
      default: () => {}
    }
  },

  watch: {
    isShow: {
      handler(val) {
        this.isShowModal = val

        if (val && this.stock?.stockNumber) {
          this.checkPrinterStatus()
        }
      },
      immediate: true
    },
    modelStock: {
      async handler(val) {
        if (!val || !val.stockNumber) return

        this.stock = { ...val }
        this.costLoaded = false
        this.hasCostData = false
        this.publicUrl = ''
        this.publicLinkStatus = 'idle'
        this.remarkSymbol = REMARK_SYMBOL_NONE
        this.labelPriceOverride = null

        this.barcode = {
          ...buildBarcodeModel(val),
          price: null,
          originPrice: null,
          tagPriceMultiplier: Number(val.tagPriceMultiplier) || 1,
          print: getPieceQty(val)
        }
        // เงินใช้แม่พิมพ์เป็นบรรทัดบนป้ายเป็นค่าเริ่มต้น
        this.labelTopLine = this.barcode.isSilver ? 'mold' : 'name'

        // fetch price แยก API เพื่อไม่ให้ list ช้า
        if (val.stockNumber) {
          const costRes = await this.productStore.fetchGetStockCostDetail(val.stockNumber, { skipLoading: true })
          this.hasCostData = costRes?.length > 0
          if (this.hasCostData) {
            this.barcode.price = costRes
              .filter((x) => x.nameGroup !== 'Gold')
              .reduce((sum, x) => sum + (x.totalPrice ?? 0), 0)
            this.barcode.originPrice = costRes.reduce((sum, x) => sum + (x.totalPrice ?? 0), 0)
          }
          this.costLoaded = true
        }

        if (this.selectedType === 'original-qr') {
          this.loadPublicLink()
        }
        if (this.selectedType === 'small-50x14') {
          this.loadGemLabelMeta()
        }
      },
      immediate: true
    },
    selectedType(val) {
      if (val === 'original-qr') {
        this.loadPublicLink()
      }
      if (val === 'small-50x14') {
        this.loadGemLabelMeta()
      }
    }
  },

  computed: {
    goldPriceOutOfRange() {
      return this.selectedType === 'small-50x14' && isPriceOutOfRange(this.goldPrice)
    },

    usesFallbackPrice() {
      return this.goldPriceOutOfRange && this.pieceGoldStamp.source === 'fallback'
    },

    goldPriceRangeText() {
      return this.$t('view.stock.printBarcode.goldPriceOutOfRange', { min: MIN_PRICE_PER_GRAM, max: MAX_PRICE_PER_GRAM })
    },

    pieceGoldStamp() {
      return resolvePieceGoldStamp(this.stock?.materials, this.goldPrice, new Date())
    },

    goldStampText() {
      const { stamp, source } = this.pieceGoldStamp
      if (source === 'none') return this.$t('view.stock.printBarcode.stampNone')
      const label = this.$t(source === 'material' ? 'view.stock.printBarcode.stampFromMaterial' : 'view.stock.printBarcode.stampFromFallback')
      const price = this.$t('view.stock.printBarcode.stampPricePerGram', { price: Number(this.pieceGoldStamp.pricePerGram).toLocaleString('en-US') })
      const check = this.pieceGoldStamp.ambiguous ? ` · ${this.$t('view.stock.printBarcode.stampCheckPrice')}` : ''
      return `${formatStampDisplay(stamp)} · ${price} · ${label}${check}`
    },

    isFullPriceMode() {
      return this.selectedType === 'small-50x14' && this.labelPriceMode === LABEL_PRICE_MODES.FULL
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

    labelSymbol() {
      return LABEL_CURRENCY_SYMBOLS[this.labelCurrency]
    },

    computedLabelPrice() {
      return computeLabelPrice(this.barcode.salePrice, this.labelCurrency, this.labelRate)
    },

    labelPriceInputValue() {
      if (this.labelPriceOverride !== null) return this.labelPriceOverride
      return formatLabelPriceInput(this.computedLabelPrice)
    },

    effectiveLabelPrice() {
      return pickLabelPrice(this.barcode.salePrice, this.labelCurrency, this.labelRate, this.labelPriceOverride)
    },

    // null = โหมดรหัสราคา (ZPL เดิม) · string = ข้อความราคาเต็มที่จะพิมพ์ ('' = ไม่มีราคา)
    labelPriceText() {
      if (!this.isFullPriceMode) return null
      return formatLabelPriceText(this.effectiveLabelPrice, this.labelCurrency)
    },

    labelPriceHint() {
      const thb = Number(this.barcode.salePrice)
      if (!Number.isFinite(thb) || thb <= 0) return ''
      const thbText = thb.toLocaleString('en-US')
      if (this.labelCurrency === LABEL_CURRENCIES.THB) {
        return this.$t('view.stock.printBarcode.labelPriceHintThb', { thb: thbText })
      }
      if (this.computedLabelPrice === null) return ''
      return this.$t('view.stock.printBarcode.labelPriceHintUsd', {
        thb: thbText,
        rate: this.labelRate,
        result: formatLabelPriceText(this.computedLabelPrice, this.labelCurrency).slice(1)
      })
    },

    // บรรทัด 2 จริงที่จะพิมพ์ (ใช้ layout เดียวกับ ZPL) — ให้เห็นผลตอนแก้ราคา แม้ตัวอย่างอยู่พ้นจอ
    printedLine2() {
      return layoutGt800Small({ ...this.barcode, hidePrice: this.hidePrice, labelPriceText: this.labelPriceText }).line2
    },

    labelRateOutOfRange() {
      return this.labelCurrency === LABEL_CURRENCIES.USD && isLabelRateOutOfRange(this.labelRate)
    },

    labelRateRangeText() {
      return this.$t('view.stock.printBarcode.labelRateOutOfRange', { rate: this.labelRate, min: LABEL_RATE_MIN, max: LABEL_RATE_MAX })
    },

    // เหตุที่ยังพิมพ์ราคาเต็มไม่ได้ (ว่าง = พร้อม) · hidePrice = ไม่พิมพ์ราคา จึงไม่ต้องบล็อก
    labelPriceMissingText() {
      if (!this.isFullPriceMode || this.hidePrice) return ''
      if (this.labelCurrency === LABEL_CURRENCIES.USD && !isValidLabelRate(this.labelRate)) {
        return this.$t('view.stock.printBarcode.labelPriceMissingRate')
      }
      if (!isUsableLabelPrice(this.effectiveLabelPrice)) {
        return this.$t('view.stock.printBarcode.labelPriceMissingSingle')
      }
      return ''
    },

    previewPrice() {
      const origin = Number(this.barcode.originPrice) || 0
      const noGold = Number(this.barcode.price) || 0
      const multiplier = Number(this.barcode.tagPriceMultiplier) || 1
      switch (this.selectedType) {
        case 'cost-with-gold':  return origin || null
        case 'cost-no-gold':    return noGold || null
        case 'tag-with-gold':   return origin ? origin * multiplier : null
        case 'tag-no-gold':     return noGold ? noGold * multiplier : null
        default:                return null
      }
    },

    // ล็อตเงินมี qty ได้มากกว่า 30 — max ต้องไม่ต่ำกว่าจำนวนของล็อตนี้
    maxPrintCount() {
      return Math.max(30, getPieceQty(this.stock))
    },

    isPrinterReady() {
      return this.printerCheck.status === 'success'
    },

    isPrinterChecking() {
      return this.printerCheck.status === 'unknown'
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

    // โหลดต้นทุนเสร็จแล้วแต่ไม่มีข้อมูล + แท็บราคา (ไม่ใช่ original/original-qr) → เตือนว่าจะพิมพ์โดยไม่มีราคา
    showCostMissingWarning() {
      return !this.hidePrice && this.costLoaded && !this.hasCostData && this.selectedType !== 'original' && this.selectedType !== 'original-qr' && this.selectedType !== 'small-50x14'
    },

    // เครื่องพิมพ์เดิม (legacy) พิมพ์ป้าย QR ไม่ได้
    isLegacyProfile() {
      return getBarcodeProfile() === PRINTER_PROFILES.LEGACY
    },

    isGt800OnlyType() {
      return this.selectedType === 'original-qr' || this.selectedType === 'small-50x14'
    },

    isGt800OnlyBlocked() {
      return this.isLegacyProfile && this.isGt800OnlyType
    },

    showPublicLinkWarning() {
      return this.selectedType === 'original-qr' && this.publicLinkStatus === 'error'
    },

    // สัญลักษณ์หมายเหตุ: แท็บ original + GT800 เท่านั้น
    showRemarkSelect() {
      return this.selectedType === 'original' && !this.isLegacyProfile
    },

    remarkOptions() {
      const keyToI18n = {
        star: 'remarkStar',
        hash: 'remarkHash',
        plus: 'remarkPlus',
        at: 'remarkAt',
        'circle-filled': 'remarkCircleFilled',
        'circle-outline': 'remarkCircleOutline',
        'square-filled': 'remarkSquareFilled',
        'square-outline': 'remarkSquareOutline'
      }
      return [
        { value: REMARK_SYMBOL_NONE, label: this.$t('view.stock.product.remarkNone') },
        ...REMARK_SYMBOLS.map((key) => ({ value: key, label: this.$t(`view.stock.product.${keyToI18n[key]}`) }))
      ]
    },

    topLineOptions() {
      return [
        { value: 'name', label: this.$t('view.stock.product.labelTopLineName') },
        { value: 'mold', label: this.$t('view.stock.product.labelTopLineMold') }
      ]
    },

    // บรรทัดบนป้าย: เลือกแม่พิมพ์ → ใช้ mold แทนชื่อสินค้า (ว่างให้ fallback เป็นชื่อ)
    labelBarcode() {
      if (this.showRemarkSelect && this.labelTopLine === 'mold' && this.barcode.mold) {
        return { ...this.barcode, productNameEn: this.barcode.mold }
      }
      return this.barcode
    },

    showRemarkNoRoomWarning() {
      if (!this.showRemarkSelect) return false
      return layoutGt800({ ...this.labelBarcode, remarkSymbol: this.remarkSymbol }, 'original').remarkNoRoom
    },

    pendingJobs() {
      return Number(this.printerCheck.detail?.jobs) || 0
    },

    isPrintDisabled() {
      if (this.isPrinting) return true
      if (this.isGt800OnlyBlocked) return true
      if (!this.isPrinterReady) return true
      if (this.labelPriceMissingText) return true
      if (this.selectedType === 'original-qr' && this.publicLinkStatus !== 'ready') return true
      return false
    }
  },

  data() {
    return {
      isShowModal: false,
      printerCheck: { status: 'unknown', printerName: '', printers: [], detail: null },
      selectedType: 'original',

      stock: {},
      barcode: { ...interfaceBarcode },
      costLoaded: false,
      hasCostData: false,
      publicUrl: '',
      publicLinkStatus: 'idle',
      remarkSymbol: REMARK_SYMBOL_NONE,
      labelTopLine: 'name',
      hidePrice: false,
      hideMold: false,
      goldPrice: getBarcodeGoldPrice(),
      labelPriceMode: getBarcodeLabelPriceMode(),
      labelCurrency: getBarcodeLabelCurrency(),
      labelRate: getBarcodeLabelRate(),
      labelPriceOverride: null,
      abbreviateGems: getAbbreviateGems(),
      gemLabelMeta: null,
      isPrinting: false,
      progress: { done: 0, total: 0 }
    }
  },

  methods: {
    onGoldPriceChange(value) {
      setBarcodeGoldPrice(value)
    },

    onLabelPriceBlur() {
      this.labelPriceOverride = normalizeLabelPriceInput(this.labelPriceOverride)
    },

    onLabelPriceModeChange(value) {
      setBarcodeLabelPriceMode(value)
    },

    onLabelCurrencyChange(value) {
      setBarcodeLabelCurrency(value)
      this.labelPriceOverride = null
    },

    onLabelRateChange(value) {
      setBarcodeLabelRate(value)
    },

    onAbbreviateGemsChange(value) {
      setAbbreviateGems(value)
    },

    onClear() {
      this.stock = {}
      this.barcode = { ...interfaceBarcode }
      this.selectedType = 'original'
      this.printerCheck = { status: 'unknown', printerName: '', printers: [], detail: null }
      this.costLoaded = false
      this.hasCostData = false
      this.publicUrl = ''
      this.publicLinkStatus = 'idle'
      this.remarkSymbol = REMARK_SYMBOL_NONE
      this.labelTopLine = 'name'
      this.hidePrice = false
      this.hideMold = false
      this.labelPriceOverride = null
      this.gemLabelMeta = null
      this.isPrinting = false
      this.progress = { done: 0, total: 0 }
    },

    closeModal() {
      this.$emit('closeModal')
      this.onClear()
    },

    validateInput() {
      if (this.barcode.print < 1) {
        this.barcode.print = 1
      } else if (this.barcode.print > this.maxPrintCount) {
        this.barcode.print = this.maxPrintCount
      }
      this.barcode.print = Math.floor(this.barcode.print)
    },

    async checkPrinterStatus() {
      this.printerCheck = { status: 'unknown', printerName: '', printers: [], detail: null }
      this.printerCheck = await this.zebraPrinter.fetchBarcodePrinterStatus()
    },

    // โหลดลิงก์หน้าสินค้าสาธารณะสำหรับฝัง QR — ข้ามถ้ามีลิงก์อยู่แล้วหรือกำลังโหลดอยู่
    async loadPublicLink() {
      if (this.publicUrl || this.publicLinkStatus === 'loading') return

      const stockNumber = this.stock?.stockNumber
      if (!stockNumber) return

      this.publicLinkStatus = 'loading'

      // skipError:true ยังปฏิเสธ promise อยู่ดี (axios-helper.js แค่ไม่โชว์ alert) — ต้อง catch เอง
      // เพราะ endpoint นี้ตอบ 400 "not found" ปกติเมื่อ feature ปิด/หาชิ้นไม่เจอ
      let res
      try {
        res = await this.productStore.fetchPublicLink(stockNumber, { skipLoading: true, skipError: true })
      } catch {
        if (this.stock?.stockNumber !== stockNumber) return
        this.publicLinkStatus = 'error'
        return
      }

      // กันเคส response ช้าแล้ว modal เปลี่ยนไปดูสินค้าอื่นแล้ว
      if (this.stock?.stockNumber !== stockNumber) return

      if (res?.path) {
        this.publicUrl = buildPublicUrl(res.path)
        this.publicLinkStatus = 'ready'
      } else {
        this.publicLinkStatus = 'error'
      }
    },

    // โหลดรหัส/ลำดับพลอยจาก master สำหรับป้ายเล็ก — ล้มเหลวได้ (generator มีลำดับ fallback เอง)
    async loadGemLabelMeta() {
      if (this.gemLabelMeta) return
      try {
        await this.masterStore.fetchGem()
        this.gemLabelMeta = buildGemLabelMeta(this.masterStore.gem)
      } catch {
        this.gemLabelMeta = null
      }
    },

    onPrintBarcode() {
      if (this.usesFallbackPrice) {
        confirmThenSubmit(
          this.$t('view.stock.printBarcode.goldPriceOutOfRangeMsg', { price: this.goldPrice, min: MIN_PRICE_PER_GRAM, max: MAX_PRICE_PER_GRAM }),
          this.$t('view.stock.printBarcode.goldPriceOutOfRangeTitle'),
          () => this.confirmStampThenPrint(),
          { confirmText: this.$t('view.stock.printBarcode.goldPriceMissingConfirm'), cancelText: this.$t('common.btn.cancel') },
          'warning'
        )
        return
      }
      this.confirmStampThenPrint()
    },

    confirmStampThenPrint() {
      if (this.selectedType === 'small-50x14' && this.pieceGoldStamp.source === 'none') {
        confirmThenSubmit(
          this.$t('view.stock.printBarcode.goldPriceMissingMsgSingle'),
          this.$t('view.stock.printBarcode.goldPriceMissingTitle'),
          () => this.printBarcode(),
          { confirmText: this.$t('view.stock.printBarcode.goldPriceMissingConfirm'), cancelText: this.$t('common.btn.cancel') },
          'warning'
        )
        return
      }
      this.printBarcode()
    },

    async printBarcode() {
      if (this.selectedType === 'small-50x14') {
        await this.loadGemLabelMeta()
      }
      const zplData = {
        ...this.labelBarcode,
        price: this.previewPrice,
        barcodeType: this.selectedType,
        publicUrl: this.publicUrl,
        hidePrice: this.hidePrice,
        hideMold: this.hideMold,
        ...(this.labelPriceText !== null ? { labelPriceText: this.labelPriceText } : {}),
        goldDateStamp: this.selectedType === 'small-50x14' ? this.pieceGoldStamp.stamp : '',
        abbreviateGems: this.abbreviateGems,
        gemLabelMeta: this.gemLabelMeta,
        remarkSymbol: this.showRemarkSelect ? this.remarkSymbol : ''
      }
      const total = Number(this.barcode.print) || 1
      this.isPrinting = true
      this.progress = { done: 0, total }
      let res
      try {
        res = await this.zebraPrinter.fetchZebraPrint({
          formValue: zplData,
          skipLoading: true,
          onProgress: (done, all) => {
            this.progress = { done, total: all }
          }
        })
      } finally {
        this.isPrinting = false
      }

      if (res?.status !== 'success') {
        error(res?.message || this.$t('common.printer.printFailedTitle'), this.$t('common.printer.printFailedTitle'))
        return
      }

      success(`${this.$t('common.printer.sentMessage', { n: total })}<br>${this.$t('common.printer.sentHint')}`)
      this.checkPrinterStatus()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.card { background: #ffffff !important; }

.printer-warning-line {
  margin-bottom: var(--sp-md);
}

.label-price-box {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  padding: var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.label-price-input {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.label-price-symbol {
  font-weight: 700;
  color: var(--base-font-color);
}

.label-price-edited {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  background: var(--status-open-bg);
  padding: 0 var(--sp-xs);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.label-price-hint {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
}

.label-price-printed-text {
  font-weight: 700;
  white-space: pre;
}

.gold-stamp-box {
  margin-bottom: var(--sp-sm);
}

.gold-price-warning {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  margin-bottom: var(--sp-xs);

  .bi {
    color: var(--status-open);
  }
}

.gold-stamp-preview {
  font-size: var(--fs-sm);
  color: var(--base-font-color);

  &--none .bi {
    color: var(--status-open);
  }
}

.cost-missing-warning {
  padding: var(--sp-sm) var(--sp-md);
  border-radius: var(--radius-sm);
  background: var(--status-open-bg);
  color: var(--base-font-color);
  font-size: var(--fs-sm);

  .bi {
    color: var(--status-open);
  }
}

.printing-progress {
  font-size: var(--fs-sm);
  color: var(--base-font-color);
}

.print-count-input {
  width: 50px;
  font-size: 16px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

input {
  margin-top: 0px !important;
}

.label-type-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.tab-btn {
  padding: 4px 14px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  color: #555;

  &:hover {
    background: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background: #fff;
    }
  }
}

.tab-btn-active {
  background: var(--base-font-color);
  color: #fff;
  border-color: var(--base-font-color);
}

.printer-status-indicator {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.printer-setting-link {
  font-size: 13px;
  color: var(--base-green);
  text-decoration: underline;
  cursor: pointer;
}

.status-container {
  display: flex;
  align-items: center;
}

.status-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.status-red {
  background-color: var(--base-red);
  box-shadow: 0 0 5px var(--base-red);
}

.status-green {
  background-color: var(--base-green);
  box-shadow: 0 0 5px var(--base-green);
}

.status-yellow {
  background-color: var(--base-warning);
  box-shadow: 0 0 5px var(--base-warning);
}

.status-text {
  font-size: 14px;
  font-weight: 700;
}

.text-red {
  color: var(--base-red);
  text-shadow: 0 0 15px var(--base-red);
}

.text-green {
  color: var(--base-green);
  text-shadow: 0 0 15px var(--base-green);
}

.text-yellow {
  color: var(--base-warning);
  text-shadow: 0 0 15px #ffcc00;
}
</style>
