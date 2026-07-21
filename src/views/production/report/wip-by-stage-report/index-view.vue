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
  receiveWorkDateStart: new Date(new Date().setDate(new Date().getDate() - 30)),
  receiveWorkDateEnd: new Date(),
  status: [],
  gold: [],
  woText: null,
  productNumber: null
}

export default {
  name: 'WipByStageReportIndexView',

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
  },

  created() {
    this.search = { ...this.form }
  }
}
</script>

<style lang="scss" scoped></style>
