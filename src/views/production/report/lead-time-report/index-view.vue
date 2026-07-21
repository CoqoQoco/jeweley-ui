<template>
  <div class="app-container">
    <searchView v-model:modelForm="form" @search="onSearchFilter" @export="onExport" />
    <resultView ref="resultRef" :modelForm="search" />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import resultView from './components/result-view.vue'

const interfaceForm = {
  completedStart: null,
  completedEnd: null,
  groupBy: 'productType',
  productType: [],
  customerType: []
}

export default {
  name: 'LeadTimeReportIndexView',

  components: {
    searchView,
    resultView
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: null
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onExport() {
      this.$refs.resultRef.exportExcel()
    }
  }
}
</script>

<style lang="scss" scoped></style>
