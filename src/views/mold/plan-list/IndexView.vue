<template>
  <div class="app-container">
    <headerBar v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter"></headerBar>
    <dataTable v-model:modelForm="search" class="mt-2"></dataTable>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'

//const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import headerBar from './components/headerView.vue'
import dataTable from './components/DataTableView.vue'

const interfaceForm = {
  moldCode: null,
  startCreate: null,
  endCreate: null,
  startUpdate: null,
  endUpdate: null
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
      search: {}
    }
  },
  methods: {
    onSearchFilter(data) {
      console.log('onSearchFilter', data)
      this.search = { ...data }
    },
    onClearFilter() {
      console.log('onClearFilter')
      this.form = { ...interfaceForm }
    }
  }
}
</script>

<style lang="scss" scoped></style>
