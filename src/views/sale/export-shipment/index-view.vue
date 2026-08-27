<template>
  <div class="app-container">
    <searchView v-model:modelForm="filter" @search="onSearch" @clear="onClear" @create="onCreate" />

    <div v-if="selectedDocuments.length" class="merge-summary-bar">
      <span class="merge-summary-count">
        {{ $t('view.sale.exportShipment.mergeSummary.selectedCount', { count: selectedDocuments.length }) }}
      </span>
      <div class="merge-summary-actions">
        <ButtonGeneric variant="main" icon="bi-file-earmark-pdf" :label="$t('view.sale.exportShipment.mergeSummary.btnPdf')" @click="onMergeSummaryPdf" />
        <ButtonGeneric variant="green" icon="bi-file-earmark-excel" :label="$t('view.sale.exportShipment.mergeSummary.btnExcel')" class="ml-2" @click="onMergeSummaryExcel" />
      </div>
    </div>

    <dataTableView
      :items="dataList.data"
      :total="dataList.total"
      :take="take"
      :skip="skip"
      v-model:selectedItems="selectedDocuments"
      @page="handlePageChange"
      @sort="handleSortChange"
      @edit="onEdit"
      @delete="onDelete"
    />
  </div>
</template>

<script>
// External dependencies
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { useExportShipmentStore } from '@/stores/modules/api/sale/export-shipment-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { ExportSummaryPdfBuilder } from '@/services/helper/pdf/export-shipment/export-summary-pdf-builder.js'
import { ExportSummaryExcelBuilder } from '@/services/helper/excel/export-shipment/export-summary-excel-builder.js'

// Local components
import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const interfaceFilter = {
  keyword: null,
  dateFrom: null,
  dateTo: null
}

export default {
  name: 'ExportShipmentIndexView',

  mixins: [dataTablePaging],

  components: {
    searchView,
    dataTableView,
    ButtonGeneric
  },

  setup() {
    const exportShipmentStore = useExportShipmentStore()
    return { exportShipmentStore }
  },

  data() {
    return {
      filter: { ...interfaceFilter },
      dataList: { data: [], total: 0 },
      selectedDocuments: []
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.dataList = await this.exportShipmentStore.list({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          keyword: this.filter.keyword || null,
          dateFrom: this.filter.dateFrom ? formatISOString(this.filter.dateFrom) : null,
          dateTo: this.filter.dateTo ? formatISOString(this.filter.dateTo) : null,
          status: null
        }
      })
    },

    onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.filter = { ...interfaceFilter }
      this.resetPaging()
    },

    onCreate() {
      this.$router.push({ name: 'sale-export-shipment-create' })
    },

    onEdit(data) {
      this.$router.push({ name: 'sale-export-shipment-edit', params: { running: data.running } })
    },

    onDelete(data) {
      confirmThenSubmit(
        data.documentNumber || data.customNumber,
        this.$t('view.sale.exportShipment.confirmDeleteTitle'),
        async () => {
          await this.exportShipmentStore.deleteDocument(data.running)
          success(this.$t('view.sale.exportShipment.deleteSuccess'))
          this.fetchData()
        }
      )
    },

    async buildMergedSummaryData() {
      if (!this.selectedDocuments.length) return null

      const docs = await Promise.all(this.selectedDocuments.map((doc) => this.exportShipmentStore.get(doc.running)))
      const validDocs = docs.filter(Boolean)
      if (!validDocs.length) return null

      const currencies = new Set(validDocs.map((d) => String(d.currency || '').trim().toUpperCase()))
      if (currencies.size > 1) {
        warning(this.$t('view.sale.exportShipment.mergeSummary.currencyMismatch'))
        return null
      }

      const first = validDocs[0]
      const mergedItems = validDocs.flatMap((d) => d.items || [])
      const mergedHeader = {
        ...first,
        customNumber: validDocs.map((d) => d.customNumber).filter(Boolean).join(', ')
      }
      return { mergedHeader, mergedItems }
    },

    async onMergeSummaryPdf() {
      const merged = await this.buildMergedSummaryData()
      if (!merged) return
      const builder = new ExportSummaryPdfBuilder(merged.mergedHeader, merged.mergedItems)
      await builder.preparePDF()
      builder.openPDF()
    },

    async onMergeSummaryExcel() {
      const merged = await this.buildMergedSummaryData()
      if (!merged) return
      const builder = new ExportSummaryExcelBuilder(merged.mergedHeader, merged.mergedItems)
      await builder.prepare()
      await builder.downloadExcel()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}

.merge-summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-md);
  padding: var(--sp-sm) var(--sp-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-highlight-bg);
}

.merge-summary-count {
  font-weight: 700;
  color: var(--base-font-color);
}

.merge-summary-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>
