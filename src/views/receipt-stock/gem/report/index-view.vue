<template>
  <div class="app-container">
    <searchView v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter" @export="onExport" />
    <summaryView :modelForm="search" />
    <dataTableView v-model:modelForm="search" v-model:modelFormExport="formExport" />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import summaryView from './components/summary-view.vue'
import dataTableView from './components/data-table-view.vue'

const interfaceForm = {
  code: null,
  text: null,
  groupName: [],
  shape: [],
  grade: []
}

export default {
  name: 'GemOnhandReportIndexView',

  components: {
    searchView,
    summaryView,
    dataTableView
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: { ...interfaceForm },
      formExport: null
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
  },

  created() {
    this.search = { ...this.form }
  }
}
</script>

<style lang="scss" scoped></style>
