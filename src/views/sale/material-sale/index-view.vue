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
      @view="onView"
      @edit="onView"
      @delete="onDelete"
    />
  </div>
</template>

<script>
// External dependencies
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { useMaterialSaleApiStore } from '@/stores/modules/api/sale/material-sale-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'

// Local components
import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'

const interfaceFilter = {
  documentNo: null,
  customerName: null,
  status: [],
  documentDateStart: null,
  documentDateEnd: null
}

export default {
  name: 'MaterialSaleIndexView',

  mixins: [dataTablePaging],

  components: {
    searchView,
    dataTableView
  },

  setup() {
    const materialSaleStore = useMaterialSaleApiStore()
    return { materialSaleStore }
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
      this.dataList = await this.materialSaleStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: {
          documentNo: this.filter.documentNo,
          customerName: this.filter.customerName,
          status: this.filter.status,
          documentDateStart: this.filter.documentDateStart ? formatISOString(this.filter.documentDateStart) : null,
          documentDateEnd: this.filter.documentDateEnd ? formatISOString(this.filter.documentDateEnd) : null
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
      this.$router.push({ name: 'sale-material-sale-create' })
    },

    onView(data) {
      this.$router.push({ name: 'sale-material-sale-detail', params: { running: data.running } })
    },

    onDelete(data) {
      confirmThenSubmit(data.documentNo, this.$t('view.sale.materialSale.confirmDeleteTitle'), async () => {
        const res = await this.materialSaleStore.fetchDelete({ running: data.running })
        if (res) {
          success(this.$t('view.sale.materialSale.deleteSuccess'))
          this.fetchData()
        }
      })
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
