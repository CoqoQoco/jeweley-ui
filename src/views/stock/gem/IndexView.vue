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
      :headerHeight="headerHeight"
      class="mt-2"
      @export="exportExcelFlag"
    ></dataTable>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'

//const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import headerBar from './components/headerView.vue'
import dataTable from './components/DataTableView.vue'

const interfaceForm = {
  id: null,
  code: null,
  groupName: [],
  grade: [],
  shape: [],
  size: []
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
      search: {},
      exportData: {},
      headerHeight: 0,
      isExport: false
    }
  },
  methods: {
    //  ---------------- event --------
    updateHeaderHeight() {
      if (this.$refs.headerBarRef) {
        this.headerHeight = this.$refs.headerBarRef.$el.offsetHeight
      }
    },
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
  },
  mounted() {
    this.updateHeaderHeight()
    window.addEventListener('resize', this.updateHeaderHeight)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateHeaderHeight)
  }
}
</script>

<style lang="scss" scoped></style>
