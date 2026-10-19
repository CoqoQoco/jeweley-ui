<template>
  <div class="app-container">
    <searchView @search="onSearch" @clear="onClear" />

    <div v-if="notFound.length" class="not-found-box">
      <i class="bi bi-exclamation-triangle mr-1"></i>
      <span class="not-found-title">{{ $t('view.stock.printBarcode.notFoundTitle', { count: notFound.length }) }}</span>
      <div class="not-found-codes">{{ notFound.join(', ') }}</div>
    </div>

    <dataTable
      :rows="rows"
      :selection="selection"
      @update:selection="selection = $event"
      @change-copies="onChangeCopies"
      @commit-copies="onCommitCopies"
    />

    <printPanel
      v-model:barcodeType="barcodeType"
      v-model:remarkSymbol="remarkSymbol"
      :selectedCount="selectedRows.length"
      :totalCount="rows.length"
      :labelCount="selectedSummary.labels"
      :isPrinting="isPrinting"
      :progress="progress"
      :failedCount="failedEntries.length"
      :statusMessage="statusMessage"
      @print="onPrint"
      @retry="onRetryFailed"
    />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { zebraPrinterApi } from '@/stores/modules/api/printer/zebra-store.js'
import { warning, error } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { buildBarcodeModel } from '@/services/helper/barcode/barcode-model.js'
import { resolveLabelCode, REMARK_SYMBOL_NONE } from '@/services/helper/barcode/barcode-zpl.js'
import {
  MAX_COPIES_PER_ROW,
  MAX_LABELS_PER_RUN,
  MAX_LIST_ROWS,
  buildRowKey,
  formatCodeListForDialog,
  isCostLabelType,
  mergeRowsByKey,
  normalizeCopies,
  parseCodeList,
  pickAutoSelection,
  pickExactMatches,
  resolveLabelPrice,
  runWithConcurrency,
  sumCostLines,
  summarizeSelection
} from '@/services/helper/barcode/print-batch.js'
import { getPieceQty } from '@/services/utils/stock-piece-qty.js'
import { getBarcodeProfile, PRINTER_PROFILES } from '@/services/api/barcode-printer-config.js'
import { buildPublicUrl } from '@/config/public-site-config.js'

import searchView from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'
import printPanel from './components/print-panel.vue'

const LOOKUP_CONCURRENCY = 5
const COST_CONCURRENCY = 5
const LINK_CONCURRENCY = 3

export default {
  name: 'StockProductPrintBarcode',

  components: { searchView, dataTable, printPanel },

  setup() {
    const productStore = usrStockProductApiStore()
    const zebraPrinter = zebraPrinterApi()
    return { productStore, zebraPrinter }
  },

  data() {
    return {
      rows: [],
      selection: [],
      notFound: [],
      barcodeType: 'original',
      remarkSymbol: REMARK_SYMBOL_NONE,
      isPrinting: false,
      progress: { done: 0, total: 0 },
      failedEntries: [],
      statusMessage: ''
    }
  },

  computed: {
    selectedRows() {
      const keys = new Set(this.selection.map((row) => row.rowKey))
      return this.rows.filter((row) => keys.has(row.rowKey))
    },

    selectedSummary() {
      return summarizeSelection(this.selectedRows)
    }
  },

  methods: {
    // ---------------- search
    decorateRow(row) {
      return {
        ...row,
        rowKey: buildRowKey(row),
        labelCode: resolveLabelCode(row),
        printCount: normalizeCopies(Math.floor(getPieceQty(row)), MAX_COPIES_PER_ROW)
      }
    },

    resetResult() {
      this.rows = []
      this.selection = []
      this.notFound = []
      this.failedEntries = []
      this.statusMessage = ''
    },

    async onSearch(form) {
      this.resetResult()

      if (form.mode === 'scan') {
        await this.searchByCodes(form)
      } else {
        await this.searchByFilter(form)
      }

      this.selection = pickAutoSelection(this.rows)
    },

    async searchByFilter(form) {
      const formValue = { pieceStatus: form.pieceStatus || undefined }
      if (form.mode === 'sku') {
        formValue.productNumber = form.productNumber || undefined
        formValue.mold = form.mold || undefined
      } else if (form.mode === 'wo') {
        formValue.woText = form.woText || undefined
      } else if (form.mode === 'location') {
        formValue.locationCodes = form.locationCodes
      }

      const res = await this.productStore.fetchDataSearch({
        take: MAX_LIST_ROWS,
        skip: 0,
        sort: [],
        formValue
      })

      this.rows = (res?.data || []).map(this.decorateRow)

      if ((res?.total || 0) > MAX_LIST_ROWS) {
        warning(
          this.$t('view.stock.printBarcode.overLimit', { total: res.total, max: MAX_LIST_ROWS }),
          this.$t('alert.alertTitle.warning')
        )
      }
    },

    async searchByCodes(form) {
      const { codes, total, truncated } = parseCodeList(form.codesText)

      if (truncated) {
        warning(
          this.$t('view.stock.printBarcode.scanCapWarning', { max: codes.length, total }),
          this.$t('alert.alertTitle.warning')
        )
      }

      const results = await runWithConcurrency(codes, LOOKUP_CONCURRENCY, (code) =>
        this.lookupCode(code, form.pieceStatus)
      )

      const missing = []
      let merged = []
      results.forEach((result, index) => {
        const found = result.status === 'fulfilled' ? result.value : []
        if (found.length === 0) {
          missing.push(codes[index])
          return
        }
        merged = mergeRowsByKey(merged, found)
      })

      this.rows = merged
      this.notFound = missing
    },

    // รหัสบนป้ายคือเลขผลิตเก่า → ค้นเลขเก่าก่อน ไม่เจอค่อยค้นเลขใหม่ — API ค้นแบบ Contains จึงต้องคัดแถวที่ตรงเป๊ะ
    async lookupCode(code, pieceStatus) {
      for (const field of ['stockNumberOrigin', 'stockNumber']) {
        const res = await this.productStore.fetchDataSearch({
          take: 20,
          skip: 0,
          sort: [],
          formValue: { [field]: code, pieceStatus: pieceStatus || undefined },
          skipLoading: true
        })
        const matches = pickExactMatches(res?.data, code, field)
        if (matches.length > 0) return matches.map(this.decorateRow)
      }
      return []
    },

    onClear() {
      this.resetResult()
    },

    // ---------------- copies
    onChangeCopies({ rowKey, value }) {
      const row = this.rows.find((item) => item.rowKey === rowKey)
      if (row) row.printCount = value
    },

    onCommitCopies(rowKey) {
      const row = this.rows.find((item) => item.rowKey === rowKey)
      if (row) row.printCount = normalizeCopies(row.printCount, MAX_COPIES_PER_ROW)
    },

    // ---------------- print
    onPrint() {
      const rows = this.selectedRows
      if (rows.length === 0) {
        warning(this.$t('view.stock.printBarcode.noSelection'), this.$t('alert.alertTitle.warning'))
        return
      }

      if (this.selectedSummary.labels > MAX_LABELS_PER_RUN) {
        warning(
          this.$t('view.stock.printBarcode.labelLimit', {
            max: MAX_LABELS_PER_RUN,
            labels: this.selectedSummary.labels
          }),
          this.$t('alert.alertTitle.warning')
        )
        return
      }

      this.prepareAndConfirm(rows)
    },

    buildBaseForm(row) {
      const showRemark = this.barcodeType === 'original' && getBarcodeProfile() !== PRINTER_PROFILES.LEGACY
      return {
        ...buildBarcodeModel(row),
        price: null,
        originPrice: null,
        tagPriceMultiplier: Number(row.tagPriceMultiplier) || 1,
        barcodeType: this.barcodeType,
        remarkSymbol: showRemark ? this.remarkSymbol : '',
        print: normalizeCopies(row.printCount, MAX_COPIES_PER_ROW)
      }
    },

    async attachCost(entries) {
      const results = await runWithConcurrency(entries, COST_CONCURRENCY, (entry) =>
        this.productStore.fetchGetStockCostDetail(entry.row.stockNumber, { skipLoading: true })
      )

      const included = []
      const skipped = []
      entries.forEach((entry, index) => {
        const result = results[index]
        const cost = result.status === 'fulfilled' ? sumCostLines(result.value) : { hasCost: false }
        if (!cost.hasCost) {
          skipped.push(entry)
          return
        }
        entry.form.originPrice = cost.originPrice
        entry.form.price = resolveLabelPrice(
          this.barcodeType,
          cost,
          entry.form.tagPriceMultiplier
        )
        included.push(entry)
      })
      return { included, skipped, skippedKey: 'skippedNoCost' }
    },

    // skipError:true ยังปฏิเสธ promise (axios-helper.js แค่ไม่โชว์ alert) — runWithConcurrency เก็บเป็น rejected ให้แล้ว
    async attachPublicLink(entries) {
      const results = await runWithConcurrency(entries, LINK_CONCURRENCY, (entry) =>
        this.productStore.fetchPublicLink(entry.row.stockNumber, { skipLoading: true, skipError: true })
      )

      const included = []
      const skipped = []
      entries.forEach((entry, index) => {
        const result = results[index]
        const path = result.status === 'fulfilled' ? result.value?.path : ''
        if (!path) {
          skipped.push(entry)
          return
        }
        entry.form.publicUrl = buildPublicUrl(path)
        included.push(entry)
      })
      return { included, skipped, skippedKey: 'skippedNoLink' }
    },

    async prepareAndConfirm(rows) {
      this.statusMessage = ''
      this.failedEntries = []
      this.progress = { done: 0, total: 0 }
      this.isPrinting = true

      const entries = rows.map((row) => ({ row, form: this.buildBaseForm(row) }))

      let prepared = { included: entries, skipped: [], skippedKey: '' }
      if (isCostLabelType(this.barcodeType)) {
        prepared = await this.attachCost(entries)
      } else if (this.barcodeType === 'original-qr') {
        prepared = await this.attachPublicLink(entries)
      }

      this.isPrinting = false

      if (prepared.included.length === 0) {
        warning(this.$t('view.stock.printBarcode.nothingToPrint'), this.$t('alert.alertTitle.warning'))
        return
      }

      const labels = prepared.included.reduce((sum, entry) => sum + entry.form.print, 0)
      let message = this.$t('view.stock.printBarcode.confirmMsg', { count: prepared.included.length, labels })
      if (prepared.skipped.length > 0) {
        const list = formatCodeListForDialog(prepared.skipped.map((entry) => entry.row.labelCode))
        message += `<br><br>${this.$t(`view.stock.printBarcode.${prepared.skippedKey}`, {
          count: prepared.skipped.length,
          list
        })}`
      }

      confirmThenSubmit(
        message,
        this.$t('view.stock.printBarcode.confirmTitle'),
        () => this.sendEntries(prepared.included),
        { confirmText: this.$t('common.btn.confirm'), cancelText: this.$t('common.btn.cancel') },
        'question'
      )
    },

    async sendEntries(entries) {
      const forms = entries.map((entry) => entry.form)
      this.statusMessage = ''
      this.failedEntries = []
      this.progress = { done: 0, total: forms.reduce((sum, form) => sum + form.print, 0) }
      this.isPrinting = true

      const res = await this.zebraPrinter.fetchZebraPrints({
        formValue: forms,
        skipLoading: true,
        onProgress: (done, total) => {
          this.progress = { done, total }
        }
      })

      this.isPrinting = false
      this.handlePrintResult(res, entries)
    },

    handlePrintResult(res, entries) {
      const failedIndexes = res?.summary?.failedIndexes
      const failureTitle = this.$t('common.printer.printFailedTitle')

      if (res?.status === 'success') {
        this.statusMessage = this.$t('view.stock.printBarcode.printDone', { labels: this.progress.total })
        return
      }

      if (Array.isArray(failedIndexes) && failedIndexes.length > 0) {
        this.failedEntries = failedIndexes.map((index) => entries[index])
        this.statusMessage = this.$t('view.stock.printBarcode.partialFailed')
      } else if (res?.status === 'partial') {
        this.statusMessage = this.$t('view.stock.printBarcode.retryLegacyUnknown')
      }

      error(res?.message || failureTitle, failureTitle)
    },

    onRetryFailed() {
      if (this.failedEntries.length === 0) return
      this.sendEntries(this.failedEntries)
    }
  }
}
</script>

<style lang="scss" scoped>
.not-found-box {
  margin-top: var(--sp-md);
  padding: var(--sp-sm) var(--sp-md);
  border-radius: var(--radius-sm);
  background: var(--status-open-bg);
  color: var(--base-font-color);
  font-size: var(--fs-sm);

  .bi {
    color: var(--status-open);
  }
}

.not-found-title {
  font-weight: 700;
}

.not-found-codes {
  margin-top: var(--sp-xs);
  word-break: break-all;
}
</style>
