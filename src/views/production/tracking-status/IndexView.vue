<template>
  <div class="app-container">
    <headerBar
      ref="headerBarRef"
      v-model:modelForm="form"
      :isExport="isExport"
      @search="onSearchFilter"
      @export="exportExcel"
      @clear="onClearFilter"
    ></headerBar>
    <dataTable
      v-model:modelForm="search"
      v-model:modelFormExport="exportData"
      class="mt-2"
      @export="exportExcelFlag"
    ></dataTable>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'

//const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import headerBar from './components/SearchView.vue'
import dataTable from './components/DataTableView.vue'

const interfaceForm = {
  requestDateStart: new Date(),
  requestDateEnd: new Date(),
  status: [],
  
  gold: [],

  wo: null,
  productNo: null
}
export default {
  components: {
    //pageTitle,
    headerBar,
    dataTable
  },
  data() {
    return {
      form: { ...interfaceForm },
      search: { ...interfaceForm },
      exportData: {},
      isExport: false
    }
  },
  methods: {
    //  ---------------- event --------
    onSearchFilter(data) {
      console.log('onSearchFilter', data)
      this.search = { ...data }
    },
    onClearFilter() {
      console.log('onClearFilter')
      this.form = { ...interfaceForm }
    },
    exportExcel(data) {
      console.log('exportExcel', data)
      this.exportData = { ...data }
    },
    exportExcelFlag(value) {
      console.log('exportExcelFlag', value)
      this.isExport = value
    }
  }
}
</script>

<style lang="scss" scoped></style>
