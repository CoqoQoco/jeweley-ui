<template>
  <div class="app-container">
    <headerBar
      ref="headerBarRef"
      v-model:modelForm="form"
      :isExport="isExport"
      :modelMasterType="masterType"
      @search="onSearchFilter"
      @export="exportExcel"
      @clear="onClearFilter"
    ></headerBar>
    <dataTable
      v-model:modelForm="search"
      v-model:modelFormExport="exportData"
      :modelMasterType="masterType"
      :headerHeight="headerHeight"
      class="mt-2"
      @export="exportExcelFlag"
    ></dataTable>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'

//const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import headerBar from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'

const interfaceForm = {
  runing: null,
  code: null,
  type: [5],
  status: ['process'],

  operator: null,
  createBy: null,

  requestDateStart: null,
  requestDateEnd: null,

  returnDateStart: null,
  returnDateEnd: null
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
      headerHeight: 0,
      isExport: false,
      masterType: [
        { id: 1, description: 'รับเข้าคลัง [พลอยใหม่]' },
        { id: 2, description: 'รับเข้าคลัง [พลอยนอกสต๊อก]' },
        { id: 3, description: 'รับเข้าคลัง [พลอยคืน]' },
        { id: 4, description: 'จ่ายออกคลัง' },
        { id: 5, description: 'ยืมออกคลัง' }
      ]
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
  }
  // mounted() {
  //   this.updateHeaderHeight()
  //   window.addEventListener('resize', this.updateHeaderHeight)
  // },
  // beforeUnmount() {
  //   window.removeEventListener('resize', this.updateHeaderHeight)
  // }
}
</script>

<style lang="scss" scoped></style>
./components/SearchView.vue
