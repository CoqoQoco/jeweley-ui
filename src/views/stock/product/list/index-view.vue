<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
      @export="onExport"
    ></search>
    <dataTable
      v-model:modelForm="search"
      v-model:modelFormExport="formExport"
      @view-cost="handleViewCost"
      @view-history="handleViewHistory"
    ></dataTable>

    <!-- Cost Detail Modal -->
    <costDetailModal
      v-model:visible="costDetailVisible"
      :stockNumber="selectedStockNumber"
      :stockData="selectedStockData"
    ></costDetailModal>

    <!-- Cost History Modal -->
    <costHistoryModal
      v-model:visible="costHistoryVisible"
      :stockNumber="selectedStockNumber"
      :stockData="selectedStockData"
    ></costHistoryModal>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'
import costDetailModal from './components/cost-detail-modal.vue'
import costHistoryModal from './components/cost-history-modal.vue'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  //receiptDateStart: new Date(new Date().setDate(new Date().getDate())),
  //receiptDateEnd: new Date(),
  receiptType: null,
  stockNumberOriginal: null,

  stockNumber: null,
  mold: null,

  productNumber: null,
  productNameEn: null,
  productNameTh: null,

  woText: null,
  size: null,

  productType: [],
  gold: null,
  goldSize: null
}

export default {
  name: 'ReportGr',

  components: {
    search,
    dataTable,
    costDetailModal,
    costHistoryModal
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  computed: {
    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    },
    masterDiamondGrade() {
      return this.masterStore.diamondGrade
    }
  },

  data() {
    return {
      isLoading: false,
      isExport: false,
      form: { ...interfaceForm },
      formExport: { ...interfaceForm },
      search: {},
      costDetailVisible: false,
      costHistoryVisible: false,
      selectedStockNumber: '',
      selectedStockData: {}
    }
  },

  methods: {
    onSearchFilter(data) {
      //console.log('onSearchFilter', data)
      this.search = { ...data }
    },

    onClearFilter() {
      //console.log('onClearFilter')
      this.form = { ...interfaceForm }
    },

    onExport(data) {
      //console.log('onExport', data)
      this.formExport = { ...data }
    },

    handleViewCost(data) {
      if (data && data.stockNumber) {
        this.selectedStockNumber = data.stockNumber
        this.selectedStockData = data
        this.costDetailVisible = true
      }
    },

    handleViewHistory(data) {
      if (data && data.stockNumber) {
        this.selectedStockNumber = data.stockNumber
        this.selectedStockData = data
        this.costHistoryVisible = true
      }
    }
  },

  async created() {
    this.$nextTick(async () => {
      await this.masterStore.fetchGold()
      await this.masterStore.fetchGoldSize()
      await this.masterStore.fetchProductType()
      //await this.masterStore.fetchGem()
      //await this.masterStore.fetchDiamondGrade()
    })
  }
}
</script>
