<template>
  <div class="app-container">
    <searchView v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter" @export="onExport" />
    <dataTableView v-model:modelForm="search" v-model:modelFormExport="formExport" />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'

const interfaceForm = {
  woText: null,
  start: null,
  end: null,
  gold: [],
  goldSize: [],
  status: [],
  worker: null,
  productNumber: null,
  mold: null
}

export default {
  name: 'ReportProductionWagesIndexView',

  components: {
    searchView,
    dataTableView
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: { ...interfaceForm },
      formExport: { ...interfaceForm }
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
      this.search = { ...interfaceForm }
    },

    onExport(data) {
      this.formExport = { ...data }
    }
  }
}
</script>

<style lang="scss" scoped></style>
