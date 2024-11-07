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
      :masterPlanStatus="planStatus"
      class="mt-2"
    ></dataTable>
  </div>
</template>

<script>
import search from './components/SearchBar.vue'
import dataTable from './components/DataTable.vue'
import { mapState, mapActions } from 'pinia'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { useLoadingStore } from '@/stores/modules/master/loading-store.js'

const interfaceForm = {
  recieptStart: new Date(new Date().setDate(new Date().getDate() - 7)),
  recieptEnd: new Date(),

  receiptNumber: null,
  stockNumber: null,

  woText: null,
  mold: null,

  customerCode: null,
  customerType: null,

  productType: null,
  productNumber: null,

  gold: null,
  goldSize: null
}

export default {
  name: 'PlanTracking',

  components: {
    search,
    dataTable
  },

  data() {
    return {
      isLoading: false,
      isExport: false,
      form: { ...interfaceForm },
      formExport: { ...interfaceForm },
      search: {}
    }
  },

  computed: {
    ...mapState(useMasterApiStore, [
      'planStatus',
      'gold',
      'goldSize',
      'customerType',
      'productType'
    ])
  },

  methods: {
    ...mapActions(useMasterApiStore, ['fetchAllMasterData']),

    onSearchFilter(data) {
      console.log('onSearchFilter', data)
      this.search = { ...data }
    },

    onClearFilter() {
      console.log('onClearFilter')
      this.form = { ...interfaceForm }
    },

    onExport(data) {
      console.log('onExport', data)
      this.formExport = { ...data }
    },

    async initializeMasterData() {
      const loadingStore = useLoadingStore()
      try {
        loadingStore.showLoading()
        await this.fetchAllMasterData()
        //this.search = { ...this.form }
      } catch (error) {
        console.error('Error initializing master data:', error)
      } finally {
        loadingStore.hideLoading()
      }
    }
  },

  async created() {
    await this.initializeMasterData()
    //this.search = { ...this.form }
  },

  beforeUnmount() {
    const loadingStore = useLoadingStore()
    loadingStore.hideLoading() // Ensure loading is hidden when component is destroyed
  }
}
</script>

<style scoped>
.app-container {
  padding: 1rem;
}
</style>
