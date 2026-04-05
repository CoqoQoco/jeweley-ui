<template>
  <div class="app-container">
    <searchView @search="onSearch" />
    <dataTableView
      v-if="reportData"
      :reportData="reportData"
      class="mt-3"
      @save="onSave"
      @reload="onReload"
    />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'
import { useGoldLossTangReportStore } from '@/stores/modules/api/plan/gold-loss-tang-report-store.js'
import { success } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'GoldLossTangReport',

  components: {
    searchView,
    dataTableView
  },

  data() {
    return {
      reportData: null,
      currentYear: null,
      currentMonth: null
    }
  },

  methods: {
    async onSearch({ year, month }) {
      this.currentYear = year
      this.currentMonth = month

      const store = useGoldLossTangReportStore()
      const res = await store.fetchReport(year, month)

      if (res) {
        this.reportData = res
      }
    },

    async onSave(payload) {
      const store = useGoldLossTangReportStore()
      await store.saveReport({
        year: this.currentYear,
        month: this.currentMonth,
        status: 50,
        items: payload
      })

      success('บันทึก Gold Loss สำเร็จ')

      // reload data
      await this.onReload()
    },

    async onReload() {
      if (this.currentYear && this.currentMonth) {
        await this.onSearch({ year: this.currentYear, month: this.currentMonth })
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 1rem;
}
</style>
