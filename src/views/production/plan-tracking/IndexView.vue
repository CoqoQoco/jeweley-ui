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
//import { defineAsyncComponent } from 'vue'

//const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
//const dialogView = defineAsyncComponent(() => import('@/components/prime-vue/DialogSearchView.vue'))

import search from './components/SearchBar.vue'
import dataTable from './components/DataTable.vue'

import { mapState, mapActions } from 'pinia'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  start: new Date(new Date().setDate(new Date().getDate() - 7)),
  end: new Date(),
  sendStart: null,
  sendEnd: null,
  text: null,
  status: null,
  isOverPlan: { id: 0, description: 'ทั้งหมด' },
  customerCode: null,

  mold: null,
  customerType: null,
  productType: null,
  productNumber: null,
  gold: null,
  goldSize: null
}

export default {
  name: 'PlanTracking',

  components: {
    //pageTitle,
    //dialogView
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
    ...mapActions(useMasterApiStore, [
      'fetchPlanStatus',
      'fetchGold',
      'fetchGoldSize',
      'fetchCustomerType',
      'fetchProductType'
    ]),
    //  ---------------- event --------
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
    }
  },
  async created() {
    await this.fetchPlanStatus()
    await this.fetchGold()
    await this.fetchGoldSize()
    await this.fetchCustomerType()
    await this.fetchProductType()

    this.search = { ...this.form }
  }
}
</script>

<style></style>
