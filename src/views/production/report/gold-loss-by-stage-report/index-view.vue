<template>
  <div class="app-container">
    <searchView v-model:modelForm="form" @search="onSearchFilter" @export="onExport" />
    <resultView ref="resultRef" :modelForm="search" />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import resultView from './components/result-view.vue'

const now = new Date()

const interfaceForm = {
  year: now.getFullYear(),
  month: now.getMonth() + 1
}

export default {
  name: 'GoldLossByStageReportIndexView',

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
