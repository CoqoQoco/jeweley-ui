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
import search from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'
import { mapState, mapActions } from 'pinia'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  start: new Date(new Date().setDate(new Date().getDate() - 30)),
  end: new Date(),
  woText: null,
  customerCode: null,
  mold: null,
  customerType: null,
  productType: null,
  productNumber: null,
  gold: null,
  goldSize: null,
  goldPercent: null
}

export default {
  name: 'PlanBom',

  components: {
    search,
    dataTable
  },

  data() {
    return {
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

  async created() {
    await this.fetchAllMasterData()
  },

  methods: {
    ...mapActions(useMasterApiStore, ['fetchAllMasterData']),

    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
    },

    onExport(data) {
      this.formExport = { ...data }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 1rem;
}
</style>
