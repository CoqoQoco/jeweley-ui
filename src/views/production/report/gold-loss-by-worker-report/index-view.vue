<template>
  <div class="app-container">
    <searchView v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter" @export="onExport" />
    <resultView ref="resultRef" :modelForm="search" />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import resultView from './components/result-view.vue'

const buildDefaultForm = () => ({
  start: null,
  end: null,
  status: [],
  workerCode: null,
  gold: [],
  minJobCount: 10
})

export default {
  name: 'GoldLossByWorkerReportIndexView',

  components: {
    searchView,
    resultView
  },

  data() {
    return {
      form: buildDefaultForm(),
      search: null
    }
  },

  mounted() {
    this.search = { ...this.form }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = buildDefaultForm()
      this.search = { ...this.form }
    },

    onExport() {
      this.$refs.resultRef.exportExcel()
    }
  }
}
</script>

<style lang="scss" scoped></style>
