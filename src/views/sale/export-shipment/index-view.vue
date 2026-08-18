<template>
  <div class="app-container">
    <searchView v-model:modelForm="filter" @search="onSearch" @clear="onClear" @create="onCreate" />
    <dataTableView
      :items="dataList.data"
      :total="dataList.total"
      :take="take"
      :skip="skip"
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
import { success } from '@/services/alert/sweetAlerts.js'

// Local components
import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'

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
    dataTableView
  },

  setup() {
    const exportShipmentStore = useExportShipmentStore()
    return { exportShipmentStore }
  },

  data() {
    return {
      filter: { ...interfaceFilter },
      dataList: { data: [], total: 0 }
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}
</style>
