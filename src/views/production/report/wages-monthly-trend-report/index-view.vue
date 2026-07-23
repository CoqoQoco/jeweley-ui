<template>
  <div class="app-container">
    <searchView v-model:modelForm="form" @search="onSearchFilter" @export="onExport" />
    <resultView ref="resultRef" :modelForm="search" />
  </div>
</template>

<script>
import dayjs from 'dayjs'

import searchView from './components/search-view.vue'
import resultView from './components/result-view.vue'

const buildDefaultForm = () => ({
  start: dayjs().subtract(11, 'month').startOf('month').toDate(),
  end: new Date()
})

export default {
  name: 'WagesMonthlyTrendReportIndexView',

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

    onExport() {
      this.$refs.resultRef.exportExcel()
    }
  }
}
</script>

<style lang="scss" scoped></style>
