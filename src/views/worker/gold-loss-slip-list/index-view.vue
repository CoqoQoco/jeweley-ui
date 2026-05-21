<template>
  <div class="app-container">
    <searchView
      v-model:modelForm="form"
      @search="onSearch"
      @clear="onClear"
    />
    <dataTableView
      :items="slipList"
      @print="onPrint"
      @cancel="onCancel"
    />
  </div>
</template>

<script>
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs'
import { WorkerWagesSuccessPdfBuilder } from '@/services/helper/pdf/worker-wages/worker-wages-success-pdf-builder.js'
import { confirmSubmit, success } from '@/services/alert/sweetAlerts.js'

import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'

const interfaceForm = {
  requestDateStart: null,
  requestDateEnd: null,
  workerCode: ''
}

export default {
  name: 'GoldLossSlipList',

  components: {
    searchView,
    dataTableView
  },

  data() {
    return {
      form: { ...interfaceForm },
      slipList: []
    }
  },

  methods: {
    async onSearch() {
      const params = {
        workerCode: this.form.workerCode || undefined,
        requestDateStart: this.form.requestDateStart ? formatISOString(this.form.requestDateStart) : undefined,
        requestDateEnd: this.form.requestDateEnd ? formatISOString(this.form.requestDateEnd) : undefined
      }
      const res = await api.jewelry.post('Worker/ListGoldLossSlip', params)
      this.slipList = Array.isArray(res) ? res : []
    },

    onClear() {
      const workerCode = this.$route.params.workerCode || ''
      this.form = { ...interfaceForm, workerCode }
    },

    onCancel(slip) {
      confirmSubmit(
        `ยกเลิก slip "${slip.documentNo}" หรือไม่? (ทอง items จะกลับมาใช้ได้ใหม่)`,
        'ยืนยันการยกเลิก',
        async () => {
          await api.jewelry.post('Worker/CancelGoldLossSlip', { id: slip.id })
          success('ยกเลิก slip สำเร็จ')
          await this.onSearch()
        }
      )
    },

    async onPrint(slip) {
      const full = await api.jewelry.post('Worker/GetGoldLossSlip', { id: slip.id })
      if (full) {
        new WorkerWagesSuccessPdfBuilder(
          { code: full.workerCode, nameTh: full.workerName },
          { requestDateStart: full.requestDateStart, requestDateEnd: full.requestDateEnd },
          full.items || [],
          'goldLoss',
          full
        ).generatePDF().open()
      }
    }
  },

  async created() {
    const workerCode = this.$route.params.workerCode || ''
    if (workerCode) {
      this.form = { ...interfaceForm, workerCode }
      await this.onSearch()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
