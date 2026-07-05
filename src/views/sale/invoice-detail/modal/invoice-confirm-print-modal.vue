<template>
  <DrawerGeneric
    :show="isShowModal"
    :title="$t('view.sale.invoiceDetail.confirmPrintTitle')"
    width="480px"
    :isShowActionPart="true"
    headerVariant="main"
    :sideShow="showHistory"
    sideWidth="280px"
    @close="closeModal"
  >
    <template #title>
      <span class="drawer-print-title">
        <i class="bi bi-printer mr-2"></i>
        {{ $t('view.sale.invoiceDetail.confirmPrintTitle') }}
      </span>
    </template>

    <template #side>
      <div class="print-history-panel">
        <div class="print-history-header">
          <i class="bi bi-clock-history mr-2"></i>
          {{ $t('view.sale.invoiceDetail.printHistory') }}
        </div>
        <div class="print-history-count">
          {{ $t('view.sale.invoiceDetail.printHistoryCount', { count: printLogs.length }) }}
        </div>
        <div v-if="printLogs.length === 0" class="print-history-empty">
          <i class="bi bi-printer mr-1"></i>
          {{ $t('view.sale.invoiceDetail.printHistoryEmpty') }}
        </div>
        <div v-else class="print-history-list">
          <div v-for="log in printLogs" :key="log.running" class="print-history-item">
            <div class="print-history-item__copy">#{{ log.copyNo }}</div>
            <div class="print-history-item__type">{{ getPaperTypeLabel(log.paperType) }}</div>
            <div v-if="getPriceModeLabel(log.data)" class="print-history-item__mode">{{ getPriceModeLabel(log.data) }}</div>
            <div class="print-history-item__date">{{ formatLogDate(log.printedAt) }}</div>
            <div class="print-history-item__by">{{ log.printedBy }}</div>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div class="invoice-confirm-print-container p-3">

        <!-- Form Container -->
        <div class="filter-container mb-2">
          <div class="title-text-lg mb-2">
            <i class="bi bi-file-text mr-2"></i>{{ $t('view.sale.invoiceDetail.docInfo') }}
          </div>
          <div class="p-3">
            <div class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-hash mr-1"></i>Invoice Number
              </label>
              <InputTextGeneric
                v-model="printData.invoiceNumber"
                type="text"
                :placeholder="$t('view.sale.invoiceDetail.invoiceNumberPlaceholder')"
              />
              <small class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.originalValue') }}: {{ originalData.invoiceNumber }}
              </small>
            </div>

            <div class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-calendar-event mr-1"></i>Invoice Date
              </label>
              <CalendarGeneric
                v-model="printData.invoiceDate"
                dateFormat="dd/mm/yy"
                :placeholder="$t('view.sale.invoiceDetail.selectDate')"
                :showIcon="true"
                :showButtonBar="true"
                class="w-100"
              />
              <small class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.originalValue') }}: {{ formatDate(originalData.invoiceDate) }}
              </small>
            </div>

            <div class="form-group mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <label class="form-label mb-0">
                  <i class="bi bi-file-earmark mr-1"></i>{{ $t('view.sale.invoiceDetail.paperSize') }}
                </label>
                <button
                  class="btn btn-sm btn-outline-main"
                  type="button"
                  @click="showHistory = !showHistory"
                >
                  <i class="bi bi-clock-history mr-1"></i>
                  {{ $t('view.sale.invoiceDetail.printHistory') }} ({{ printLogs.length }})
                </button>
              </div>
              <RadioGroupGeneric
                v-model="paperSize"
                :options="paperSizeOptions"
                optionLabel="label"
                optionValue="value"
              />
            </div>

            <div v-if="paperSize === 'a4'" class="form-group mb-3">
              <CheckboxGeneric
                v-model="printData.showCifLabel"
                :label="$t('view.sale.invoiceDetail.showCifLabel')"
              />
            </div>

            <div v-if="paperSize === 'a4'" class="form-group mb-3">
              <CheckboxGeneric
                v-model="printData.hideCompanyHeader"
                :label="$t('view.sale.invoiceDetail.hideCompanyHeader')"
              />
            </div>

            <div class="form-group mb-3">
              <CheckboxGeneric
                v-model="printData.showDecimals"
                :label="$t('common.field.showDecimals')"
                @update:modelValue="onShowDecimalsChange"
              />
            </div>

            <div v-if="paperSize === 'a4'" class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-list-ol mr-1"></i>{{ $t('view.sale.invoiceDetail.itemsPerPage') }}
              </label>
              <InputTextGeneric
                v-model="printData.itemsPerPage"
                type="number"
                min="1"
                max="20"
              />
              <small class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.itemsPerPageHint') }}
              </small>
            </div>

            <div v-if="paperSize === 'a4'" class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-layout-text-window mr-1"></i>{{ $t('view.sale.invoiceDetail.template') }}
              </label>
              <DropdownGeneric
                v-model="invoiceTemplate"
                :options="templateOptions"
                optionLabel="label"
                optionValue="value"
              />
            </div>

            <div v-if="paperSize === 'bill' || paperSize === 'vat-bridge'" class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-printer mr-1"></i>{{ $t('view.sale.invoiceDetail.printer') }}
              </label>
              <DropdownGeneric
                v-model="selectedPrinter"
                :options="printerOptions"
                optionLabel="label"
                optionValue="name"
                :placeholder="$t('view.sale.invoiceDetail.selectPrinter')"
                :showClear="true"
              />
              <small v-if="printerOptions.length === 0" class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.noPrinterFound') }}
              </small>
            </div>

            <div v-if="paperSize === 'bill'" class="form-group mb-3">
              <div class="row">
                <div class="col-6">
                  <label class="form-label">
                    <i class="bi bi-arrows-move mr-1"></i>Offset X (mm)
                  </label>
                  <InputTextGeneric
                    v-model="billOffset.x"
                    type="number"
                    step="0.5"
                  />
                </div>
                <div class="col-6">
                  <label class="form-label">
                    <i class="bi bi-arrows-move mr-1"></i>Offset Y (mm)
                  </label>
                  <InputTextGeneric
                    v-model="billOffset.y"
                    type="number"
                    step="0.5"
                  />
                </div>
              </div>
              <small class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.offsetHint') }}
              </small>
            </div>

            <div v-if="paperSize === 'bill'" class="form-group mb-3">
              <label class="form-label">
                <i class="bi bi-layout-three-columns mr-1"></i>{{ $t('view.sale.invoiceDetail.billColumnToggles') }}
              </label>

              <!-- Header group -->
              <div class="bill-element-group mb-2">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGroupHeader') }}</div>
                <div class="bill-column-toggles">
                  <CheckboxGeneric
                    v-model="billElementFlags.showInvoiceNo"
                    :label="$t('view.sale.invoiceDetail.billElemInvoiceNo')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showDate"
                    :label="$t('view.sale.invoiceDetail.billElemDate')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showPageNumber"
                    :label="$t('view.sale.invoiceDetail.billElemPageNumber')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showCustomerName"
                    :label="$t('view.sale.invoiceDetail.billElemCustomerName')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showCustomerTaxId"
                    :label="$t('view.sale.invoiceDetail.billElemCustomerTaxId')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showCustomerAddress"
                    :label="$t('view.sale.invoiceDetail.billElemCustomerAddress')"
                    @update:modelValue="onBillFlagChange"
                  />
                </div>
              </div>

              <!-- Table group -->
              <div class="bill-element-group mb-2">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGroupTable') }}</div>
                <div class="bill-column-toggles">
                  <CheckboxGeneric
                    v-model="billElementFlags.showItemNo"
                    :label="$t('view.sale.invoiceDetail.billElemItemNo')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showDescription"
                    :label="$t('view.sale.invoiceDetail.billElemDescription')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showStockNumber"
                    :label="$t('view.sale.invoiceDetail.billColumnStockNumber')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showProductNumber"
                    :label="$t('view.sale.invoiceDetail.billColumnProductNumber')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showPriceBeforeDiscount"
                    :label="$t('view.sale.invoiceDetail.billElemPriceBeforeDiscount')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showPriceIncludingVat"
                    :label="$t('view.sale.invoiceDetail.billElemPriceIncludingVat')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showGoldWeight"
                    :label="$t('view.sale.invoiceDetail.billElemGoldWeight')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showStoneWeight"
                    :label="$t('view.sale.invoiceDetail.billElemStoneWeight')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showDiamondWeight"
                    :label="$t('view.sale.invoiceDetail.billElemDiamondWeight')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showQty"
                    :label="$t('view.sale.invoiceDetail.billElemQty')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showUnitPrice"
                    :label="$t('view.sale.invoiceDetail.billElemUnitPrice')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showAmount"
                    :label="$t('view.sale.invoiceDetail.billElemAmount')"
                    @update:modelValue="onBillFlagChange"
                  />
                </div>
              </div>

              <!-- Footer group -->
              <div class="bill-element-group mb-2">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGroupFooter') }}</div>
                <div class="bill-column-toggles">
                  <CheckboxGeneric
                    v-model="billElementFlags.showSubtotal"
                    :label="$t('view.sale.invoiceDetail.billElemSubtotal')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showTotal"
                    :label="$t('view.sale.invoiceDetail.billElemTotal')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showAmountText"
                    :label="$t('view.sale.invoiceDetail.billElemAmountText')"
                    @update:modelValue="onBillFlagChange"
                  />
                  <CheckboxGeneric
                    v-model="billElementFlags.showRemark"
                    :label="$t('view.sale.invoiceDetail.billColumnRemark')"
                    @update:modelValue="onBillFlagChange"
                  />
                </div>
              </div>

              <!-- VAT / Price mode -->
              <div class="bill-element-group">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGroupVatMode') }}</div>
                <RadioGroupGeneric
                  v-model="billElementFlags.unitPriceMode"
                  :options="unitPriceModeOptions"
                  optionLabel="label"
                  optionValue="value"
                  @update:modelValue="onBillFlagChange"
                />
                <div v-if="billElementFlags.unitPriceMode === 'addVat' || billElementFlags.unitPriceMode === 'subVat'" class="mt-2">
                  <label class="form-label">
                    <i class="bi bi-percent mr-1"></i>{{ $t('view.sale.invoiceDetail.unitVatPercentLabel') }}
                  </label>
                  <InputTextGeneric
                    v-model="billElementFlags.unitVatPercent"
                    type="number"
                    step="0.01"
                    min="0"
                    @blur="onBillFlagChange"
                  />
                </div>
              </div>

              <!-- Footer VAT % -->
              <div class="bill-element-group mt-2">
                <div class="bill-element-group-title">{{ $t('view.sale.invoiceDetail.billGroupFooterVat') }}</div>
                <CheckboxGeneric
                  v-model="billElementFlags.showVat"
                  :label="$t('view.sale.invoiceDetail.billElemVat')"
                  @update:modelValue="onBillFlagChange"
                />
                <div v-if="billElementFlags.showVat" class="mt-2">
                  <label class="form-label">
                    <i class="bi bi-percent mr-1"></i>{{ $t('view.sale.invoiceDetail.summaryVatPercentLabel') }}
                  </label>
                  <InputTextGeneric
                    v-model="billElementFlags.summaryVatPercent"
                    type="number"
                    step="0.01"
                    min="0"
                    @blur="onBillFlagChange"
                  />
                </div>
              </div>
            </div>

            <div v-if="paperSize === 'vat-bridge'" class="form-group mb-3">
              <div class="row">
                <div class="col-6">
                  <label class="form-label">
                    <i class="bi bi-arrows-move mr-1"></i>Offset X (mm)
                  </label>
                  <InputTextGeneric
                    v-model="continuousOffset.x"
                    type="number"
                    step="0.5"
                  />
                </div>
                <div class="col-6">
                  <label class="form-label">
                    <i class="bi bi-arrows-move mr-1"></i>Offset Y (mm)
                  </label>
                  <InputTextGeneric
                    v-model="continuousOffset.y"
                    type="number"
                    step="0.5"
                  />
                </div>
              </div>
              <small class="form-text text-muted">
                {{ $t('view.sale.invoiceDetail.offsetHint') }}
              </small>
            </div>
          </div>
        </div>

        <!-- Info Container -->
        <div class="filter-container-search mb-2">
          <div class="p-2">
            <div class="d-flex align-items-start">
              <i class="bi bi-info-circle text-info mr-2 info-icon"></i>
              <div>
                <p class="mb-1 info-text">
                  {{ $t('view.sale.deliveryNote.printOnlyNote') }}
                </p>
                <p class="mb-0 info-text">
                  {{ $t('view.sale.deliveryNote.originalNotChanged') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #action>
      <button v-if="paperSize === 'a4'" class="btn btn-main mr-2" type="button" @click="onPreviewPDF">
        <i class="bi bi-eye mr-1"></i>
        {{ $t('view.sale.invoiceDetail.previewBtn') }}
      </button>

      <button class="btn btn-green mr-2" type="button" @click="onConfirmPrint">
        <i class="bi bi-printer mr-1"></i>
        {{ $t('view.sale.invoiceDetail.printBtn') }}
      </button>

      <button class="btn btn-outline-main" type="button" @click="closeModal">
        <i class="bi bi-x-circle mr-1"></i>
        {{ $t('common.btn.cancel') }}
      </button>
    </template>
  </DrawerGeneric>
</template>

<script>
import { warning } from '@/services/alert/sweetAlerts.js'
import { storage } from '@/services/storage.js'
import { isForeignCurrency } from '@/services/utils/decimal.js'
import dayjs from 'dayjs'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import RadioGroupGeneric from '@/components/prime-vue/RadioGroupGeneric.vue'
import DrawerGeneric from '@/components/generic/DrawerGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import { getPrinterList } from '@/services/api/printer-config-service.js'
import { getBillLayout } from '@/services/helper/print/bill-layout-store.js'
import { getVatLayout } from '@/services/helper/print/vat-layout-store.js'
import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'

export default {
  name: 'InvoiceConfirmPrintModal',

  components: {
    DrawerGeneric,
    CalendarGeneric,
    DropdownGeneric,
    CheckboxGeneric,
    RadioGroupGeneric,
    InputTextGeneric
  },

  props: {
    isShowModal: {
      type: Boolean,
      default: false
    },
    invoiceData: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['close-modal', 'confirm-print', 'preview-print'],

  data() {
    return {
      invoiceStore: useInvoiceApiStore(),
      printLogs: [],
      showHistory: false,
      originalData: {
        invoiceNumber: '',
        invoiceDate: ''
      },
      printData: {
        invoiceNumber: '',
        invoiceDate: '',
        showCifLabel: true,
        hideCompanyHeader: false,
        showDecimals: true,
        itemsPerPage: 10
      },
      invoiceTemplate: 'standard',
      paperSize: 'vat-bridge',
      continuousOffset: { x: 0, y: 0 },
      billOffset: { x: 0, y: 0 },
      printerOptions: [],
      selectedPrinter: null,
      defaultBillPrinter: null,
      defaultVatPrinter: null,
      billElementFlags: {
        // Header
        showInvoiceNo: true,
        showDate: true,
        showPageNumber: true,
        showCustomerName: true,
        showCustomerTaxId: true,
        showCustomerAddress: true,
        // Table
        showItemNo: true,
        showDescription: true,
        showStockNumber: true,
        showProductNumber: true,
        showPriceBeforeDiscount: true,
        showPriceIncludingVat: true,
        showGoldWeight: true,
        showStoneWeight: true,
        showDiamondWeight: true,
        showQty: true,
        showUnitPrice: true,
        showAmount: true,
        showRemark: true,
        // Footer
        showSubtotal: true,
        showVat: true,
        showTotal: true,
        showAmountText: true,
        // Unit price mode
        unitPriceMode: 'tag',
        unitVatPercent: 7,
        summaryVatPercent: 7
      }
    }
  },

  computed: {
    templateOptions() {
      return [
        { value: 'standard', label: this.$t('view.sale.invoiceDetail.templateStandard') },
        { value: 'summary', label: this.$t('view.sale.invoiceDetail.templateSummary') }
      ]
    },

    paperSizeOptions() {
      return [
        { value: 'a4', label: this.$t('view.sale.invoiceDetail.paperA4') },
        { value: 'bill', label: this.$t('view.sale.invoiceDetail.paperBill') },
        { value: 'vat-bridge', label: this.$t('view.sale.invoiceDetail.paperTax') }
      ]
    },

    unitPriceModeOptions() {
      return [
        { value: 'tag', label: this.$t('view.sale.invoiceDetail.priceModeTag') },
        { value: 'addVat', label: this.$t('view.sale.invoiceDetail.priceModeAddVat') },
        { value: 'subVat', label: this.$t('view.sale.invoiceDetail.priceModeSubVat') }
      ]
    }
  },

  watch: {
    isShowModal: {
      handler(newVal) {
        if (newVal) {
          this.initializePrintData()
          this.fetchPrintLogs()
        }
      },
      immediate: true
    },
    paperSize(newVal) {
      if (newVal === 'bill') {
        this.selectedPrinter = this.defaultBillPrinter
      } else if (newVal === 'vat-bridge') {
        this.selectedPrinter = this.defaultVatPrinter
      } else {
        this.selectedPrinter = null
      }
    }
  },

  async mounted() {
    const savedContinuous = storage.getItem('invoice-continuous-offset')
    if (savedContinuous) {
      try {
        const parsed = JSON.parse(savedContinuous)
        if (parsed && typeof parsed === 'object') {
          this.continuousOffset = {
            x: Number(parsed.x) || 0,
            y: Number(parsed.y) || 0
          }
        }
      } catch (e) {
        this.continuousOffset = { x: 0, y: 0 }
      }
    }

    const savedBill = storage.getItem('invoice-bill-offset')
    if (savedBill) {
      try {
        const parsed = JSON.parse(savedBill)
        if (parsed && typeof parsed === 'object') {
          this.billOffset = {
            x: Number(parsed.x) || 0,
            y: Number(parsed.y) || 0
          }
        }
      } catch (e) {
        this.billOffset = { x: 0, y: 0 }
      }
    }

    const savedColumnFlags = storage.getItem('bill-print-column-flags')
    if (savedColumnFlags) {
      try {
        const parsed = JSON.parse(savedColumnFlags)
        if (parsed && typeof parsed === 'object') {
          const boolFlag = (key) => parsed[key] !== undefined ? Boolean(parsed[key]) : true
          this.billElementFlags = {
            showInvoiceNo: boolFlag('showInvoiceNo'),
            showDate: boolFlag('showDate'),
            showPageNumber: boolFlag('showPageNumber'),
            showCustomerName: boolFlag('showCustomerName'),
            showCustomerTaxId: boolFlag('showCustomerTaxId'),
            showCustomerAddress: boolFlag('showCustomerAddress'),
            showItemNo: boolFlag('showItemNo'),
            showDescription: boolFlag('showDescription'),
            showStockNumber: boolFlag('showStockNumber'),
            showProductNumber: boolFlag('showProductNumber'),
            showPriceBeforeDiscount: boolFlag('showPriceBeforeDiscount'),
            showPriceIncludingVat: boolFlag('showPriceIncludingVat'),
            showGoldWeight: boolFlag('showGoldWeight'),
            showStoneWeight: boolFlag('showStoneWeight'),
            showDiamondWeight: boolFlag('showDiamondWeight'),
            showQty: boolFlag('showQty'),
            showUnitPrice: boolFlag('showUnitPrice'),
            showAmount: boolFlag('showAmount'),
            showRemark: boolFlag('showRemark'),
            showSubtotal: boolFlag('showSubtotal'),
            showVat: boolFlag('showVat'),
            showTotal: boolFlag('showTotal'),
            showAmountText: boolFlag('showAmountText'),
            unitPriceMode: parsed.unitPriceMode || 'tag',
            unitVatPercent: parsed.unitVatPercent !== undefined ? Number(parsed.unitVatPercent) : 7,
            summaryVatPercent: parsed.summaryVatPercent !== undefined ? Number(parsed.summaryVatPercent) : 7
          }
        }
      } catch (e) {
        // keep defaults
      }
    }

    const savedShowHistory = storage.getItem('invoice-print-show-history')
    if (savedShowHistory !== null) {
      this.showHistory = savedShowHistory === 'true'
    }

    this.printerOptions = await getPrinterList()

    const [billLayout, vatLayout] = await Promise.all([getBillLayout(), getVatLayout()])
    this.defaultBillPrinter = billLayout?.printerName || null
    this.defaultVatPrinter = vatLayout?.printerName || null

    if (this.paperSize === 'bill') {
      this.selectedPrinter = this.defaultBillPrinter
    } else if (this.paperSize === 'vat-bridge') {
      this.selectedPrinter = this.defaultVatPrinter
    }
  },

  methods: {
    async fetchPrintLogs() {
      if (!this.invoiceData || !this.invoiceData.invoiceNumber) return
      const res = await this.invoiceStore.fetchPrintLogList({ invoiceNumber: this.invoiceData.invoiceNumber })
      if (res && res.data) {
        this.printLogs = res.data
      } else {
        this.printLogs = []
      }
    },

    getPaperTypeLabel(paperType) {
      const map = {
        'a4': this.$t('view.sale.invoiceDetail.paperTypeA4'),
        'a4-summary': this.$t('view.sale.invoiceDetail.paperTypeA4Summary'),
        'bill': this.$t('view.sale.invoiceDetail.paperTypeBill'),
        'vat': this.$t('view.sale.invoiceDetail.paperTypeVat')
      }
      return map[paperType] || paperType
    },

    getPriceModeLabel(dataJson) {
      if (!dataJson) return ''
      try {
        const parsed = JSON.parse(dataJson)
        const mode = parsed.unitPriceMode || parsed.priceMode
        if (!mode) return ''
        if (mode === 'addVat') return this.$t('view.sale.invoiceDetail.priceModeAddVat')
        if (mode === 'subVat') return this.$t('view.sale.invoiceDetail.priceModeSubVat')
        return this.$t('view.sale.invoiceDetail.priceModeTag')
      } catch {
        return ''
      }
    },

    formatLogDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    initializePrintData() {
      this.originalData = {
        invoiceNumber: this.invoiceData.invoiceNumber || '',
        invoiceDate: this.invoiceData.invoiceDate || ''
      }

      const savedShowDecimals = storage.getItem('invoice-print-show-decimals')
      const showDecimals = savedShowDecimals !== null
        ? savedShowDecimals === 'true'
        : !isForeignCurrency(this.invoiceData.currencyUnit)

      this.printData = {
        invoiceNumber: this.invoiceData.invoiceNumber || '',
        invoiceDate: new Date(),
        showCifLabel: true,
        hideCompanyHeader: false,
        showDecimals,
        itemsPerPage: 10
      }
      this.invoiceTemplate = 'standard'
    },

    onShowDecimalsChange(val) {
      storage.setItem('invoice-print-show-decimals', String(val))
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY')
    },

    onBillFlagChange() {
      storage.setItem('bill-print-column-flags', JSON.stringify(this.billElementFlags))
    },

    closeModal() {
      this.$emit('close-modal')
    },

    buildPrintData() {
      const normalizedDate = new Date(this.printData.invoiceDate)
      normalizedDate.setHours(0, 0, 0, 0)

      if (this.paperSize === 'vat-bridge') {
        storage.setItem('invoice-continuous-offset', JSON.stringify(this.continuousOffset))
      } else if (this.paperSize === 'bill') {
        storage.setItem('invoice-bill-offset', JSON.stringify(this.billOffset))
      }

      return {
        ...this.invoiceData,
        invoiceNumber: this.printData.invoiceNumber.trim(),
        invoiceDate: normalizedDate,
        showCifLabel: this.paperSize === 'a4' ? this.printData.showCifLabel : false,
        hideCompanyHeader: this.paperSize === 'a4' ? this.printData.hideCompanyHeader : false,
        showDecimals: this.printData.showDecimals,
        itemsPerPage: Number(this.printData.itemsPerPage) || 10,
        invoiceTemplate: this.invoiceTemplate,
        paperSize: this.paperSize,
        continuousOffset: { ...this.continuousOffset },
        billOffset: { ...this.billOffset },
        printerName: this.selectedPrinter,
        ...this.billElementFlags
      }
    },

    validatePrintData() {
      if (!this.printData.invoiceNumber || !this.printData.invoiceNumber.trim()) {
        warning(this.$t('view.sale.invoiceDetail.validation.invoiceNumberRequired'), this.$t('common.label.incompleteData'))
        return false
      }

      if (!this.printData.invoiceDate) {
        warning(this.$t('view.sale.invoiceDetail.validation.invoiceDateRequired'), this.$t('common.label.incompleteData'))
        return false
      }

      return true
    },

    onConfirmPrint() {
      if (!this.validatePrintData()) return

      const printDataToEmit = this.buildPrintData()
      this.$emit('confirm-print', printDataToEmit)
      this.closeModal()
    },

    onPreviewPDF() {
      if (!this.validatePrintData()) return

      const printDataToEmit = this.buildPrintData()
      this.$emit('preview-print', printDataToEmit)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';

.invoice-confirm-print-container {
  // Component-specific styles only
}

.drawer-print-title {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: #ffffff;
}

.info-icon {
  font-size: var(--fs-lg);
}

.info-text {
  font-size: var(--fs-sm);
  color: #6c757d;
}

.form-label {
  font-weight: 600;
  color: var(--base-sub-color);
  margin-bottom: 0.5rem;
  display: block;

  i {
    color: var(--base-font-color);
  }
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.bill-element-group {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--sp-sm);
  background: #fafafa;
}

.bill-element-group-title {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-font-color);
  margin-bottom: var(--sp-xs);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.bill-column-toggles {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

// History side panel
.print-history-panel {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.print-history-header {
  background: var(--base-font-color);
  color: #ffffff;
  font-size: var(--fs-sm);
  font-weight: 700;
  padding: var(--sp-sm) var(--sp-md);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.print-history-count {
  padding: var(--sp-xs) var(--sp-md);
  font-size: var(--fs-sm);
  color: var(--base-font-color);
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-highlight-bg);
  flex-shrink: 0;
}

.print-history-empty {
  padding: var(--sp-lg) var(--sp-md);
  text-align: center;
  color: #6c757d;
  font-size: var(--fs-sm);
}

.print-history-list {
  flex: 1;
  overflow-y: auto;
}

.print-history-item {
  padding: var(--sp-sm) var(--sp-md);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--fs-sm);

  &:last-child {
    border-bottom: none;
  }

  &__copy {
    font-weight: 700;
    color: var(--base-font-color);
    display: inline;
  }

  &__type {
    display: inline;
    margin-left: var(--sp-xs);
    font-weight: 600;
  }

  &__mode {
    font-size: 11px;
    color: #6c757d;
    margin-top: 2px;
  }

  &__date {
    font-size: 11px;
    color: #6c757d;
    margin-top: 2px;
  }

  &__by {
    font-size: 11px;
    color: var(--base-green);
    margin-top: 1px;
  }
}

// PrimeVue Calendar full width
:deep(.p-calendar) {
  width: 100%;

  .p-inputtext {
    width: 100%;
    border: 1px solid #ced4da;
    border-radius: var(--radius-sm);
    padding: 0.5rem 0.75rem;
    font-size: var(--base-font-size);

    &:focus {
      border-color: var(--base-green);
      box-shadow: 0 0 0 0.2rem rgba(3, 131, 135, 0.25);
      outline: none;
    }
  }
}
</style>
