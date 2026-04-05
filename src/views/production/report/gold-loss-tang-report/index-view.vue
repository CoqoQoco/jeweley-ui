<template>
  <div class="app-container">
    <searchView @search="onSearch" @viewJobs="isShowViewJobs = true" />
    <dataTableView
      v-if="reportData"
      :reportData="reportData"
      :readonly="isReadonly"
      :jobInfo="currentJobInfo"
      class="mt-3"
      @createJob="onCreateJob"
      @reload="onReload"
      @deleteRow="onDeleteRow"
      @edit="onEdit"
      @exportPdf="onExportPdf"
      @saveEdit="onSaveEdit"
    />
    <viewJobsModal
      :isShow="isShowViewJobs"
      @closeModal="isShowViewJobs = false"
      @jobSelected="onJobSelected"
      @exportJobPdf="onExportJobPdf"
    />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'
import viewJobsModal from './modal/view-jobs-modal.vue'
import { useGoldLossTangReportStore } from '@/stores/modules/api/plan/gold-loss-tang-report-store.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { GoldLossPdfBuilder } from '@/services/helper/pdf/gold-loss/gold-loss-pdf-builder.js'

export default {
  name: 'GoldLossTangReport',

  components: {
    searchView,
    dataTableView,
    viewJobsModal
  },

  data() {
    return {
      reportData: null,
      currentParams: null,
      isReadonly: false,
      currentJobId: null,
      currentJobInfo: null,
      isShowViewJobs: false
    }
  },

  methods: {
    async onSearch({ startDate, endDate, wo, workerCode, goldCode }) {
      this.currentParams = { startDate, endDate, wo, workerCode, goldCode }
      this.isReadonly = false
      this.currentJobId = null
      this.currentJobInfo = null

      const store = useGoldLossTangReportStore()
      const res = await store.fetchReport({ startDate, endDate, wo, workerCode, goldCode })

      if (res) {
        this.reportData = res
      }
    },

    async onCreateJob(items) {
      const store = useGoldLossTangReportStore()
      await store.createJob({
        startDate: this.currentParams.startDate,
        endDate: this.currentParams.endDate,
        items
      })

      success('สร้างใบงาน Gold Loss สำเร็จ')
      this.isReadonly = true

      // reload data
      await this.onReload()
    },

    onDeleteRow(idx) {
      if (this.reportData && this.reportData.rows) {
        this.reportData.rows.splice(idx, 1)
      }
    },

    async onReload() {
      if (this.currentParams) {
        await this.onSearch(this.currentParams)
      }
    },

    async onJobSelected(jobId) {
      this.isShowViewJobs = false
      const store = useGoldLossTangReportStore()
      const res = await store.fetchJobDetail(jobId)
      if (res) {
        this.reportData = { hasSavedData: true, rows: res.items }
        this.currentJobId = res.id
        this.currentJobInfo = { id: res.id, documentNo: res.documentNo }
        this.isReadonly = true
      }
    },

    onEdit() {
      this.isReadonly = false
    },

    async onSaveEdit(items) {
      const store = useGoldLossTangReportStore()
      await store.updateJob({
        jobId: this.currentJobId,
        items
      })
      success('บันทึกแก้ไขสำเร็จ')
      await this.onJobSelected(this.currentJobId)
    },

    async onExportPdf() {
      if (!this.currentJobInfo || !this.reportData) return
      const builder = new GoldLossPdfBuilder(this.currentJobInfo, this.reportData.rows)
      builder.generatePDF().open()
    },

    async onExportJobPdf(jobId) {
      const store = useGoldLossTangReportStore()
      const res = await store.fetchJobDetail(jobId)
      if (res) {
        const builder = new GoldLossPdfBuilder(
          { id: res.id, documentNo: res.documentNo, startDate: res.startDate, endDate: res.endDate, createBy: res.createBy, createDate: res.createDate, remark: res.remark },
          res.items
        )
        builder.generatePDF().open()
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
