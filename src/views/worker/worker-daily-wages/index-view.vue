<template>
  <div class="app-container">
    <searchView
      v-model:modelForm="form"
      :worker="data"
      @search="onSearch"
      @clear="onClear"
      @print-success="onPrintSuccess"
      @print-tracking="onPrintTracking"
    />
    <dataTableView
      :items="dataWages.items || []"
      :wageTypeFilter="form.wageTypeFilter"
    />

    <goldLossSlipModal
      :isShow="isShowSlipModal"
      :worker="data"
      :dateRange="form"
      :items="goldLossUnslippedItems"
      @closeModal="isShowSlipModal = false"
      @saved="onSlipSaved"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import api from '@/axios/axios-helper.js'
import { formatISOString } from '@/services/utils/dayjs'
import { usePlanWorkerApiStore } from '@/stores/modules/api/worker/plan-worker-store.js'
import { warning } from '@/services/alert/sweetAlerts.js'

import { WorkerWagesSuccessPdfBuilder } from '@/services/helper/pdf/worker-wages/worker-wages-success-pdf-builder.js'
import { WorkerWagesTrackingPdfBuilder } from '@/services/helper/pdf/worker-wages/worker-wages-tracking-pdf-builder.js'

import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'

const goldLossSlipModal = defineAsyncComponent(() => import('./modal/gold-loss-slip-modal.vue'))

const interfaceForm = {
  requestDateStart: new Date(new Date().setDate(new Date().getDate() - 30)),
  requestDateEnd: new Date(),
  wageTypeFilter: 'wages'
}

export default {
  name: 'WorkerDailyWages',

  components: {
    searchView,
    dataTableView,
    goldLossSlipModal
  },

  setup() {
    const workerStore = usePlanWorkerApiStore()
    return { workerStore }
  },

  data() {
    return {
      data: {},
      dataWages: {
        items: []
      },
      form: { ...interfaceForm },
      isShowSlipModal: false
    }
  },

  computed: {
    goldLossUnslippedItems() {
      const items = this.dataWages.items || []
      return items
        .filter((r) => r.isGoldLoss && !r.workerGoldLossSlipId)
        .map((row) => {
          const weightLossAllowed = (row.goldWeightSend || 0) * (row.lossPercent || 0) / 100
          const weightLossActual = weightLossAllowed - ((row.goldWeightSend || 0) - (row.goldWeightCheck || 0))
          return { ...row, weightLossAllowed, weightLossActual }
        })
    }
  },

  methods: {
    async onSearch() {
      if (!this.form.requestDateStart || !this.form.requestDateEnd) return
      await this.search()
    },

    onClear() {
      this.form = { ...interfaceForm }
    },

    async search() {
      const params = {
        requestDateStart: formatISOString(this.form.requestDateStart),
        requestDateEnd: formatISOString(this.form.requestDateEnd),
        code: this.data.code
      }
      const res = await api.jewelry.post('Worker/SearchWorkerWages', params)
      if (res) {
        this.dataWages = { ...res }
      }
    },

    onPrintSuccess() {
      if (this.form.wageTypeFilter === 'goldLoss') {
        this.isShowSlipModal = true
        return
      }
      const items = (this.dataWages?.items || []).filter((r) => !r.isGoldLoss)
      new WorkerWagesSuccessPdfBuilder(this.data, this.form, items, this.form.wageTypeFilter)
        .generatePDF().open()
    },

    onPrintTracking() {
      if (this.form.wageTypeFilter === 'goldLoss') {
        warning('ในโหมด Gold Loss กรุณาใช้ปุ่ม \'พิมพ์สลิปสถานะสำเร็จ\'', 'แจ้งเตือน')
        return
      }
      const items = (this.dataWages?.items || []).filter((r) => !r.isGoldLoss)
      new WorkerWagesTrackingPdfBuilder(this.data, this.form, items, this.form.wageTypeFilter)
        .generatePDF().open()
    },

    onSlipSaved(slip) {
      new WorkerWagesSuccessPdfBuilder(this.data, this.form, slip.items || [], 'goldLoss', slip)
        .generatePDF().open()
      this.isShowSlipModal = false
      this.onSearch()
    }
  },

  async created() {
    this.$nextTick(async () => {
      const url = window.location.href
      const code = url.split('/').slice(-1)[0]

      const res = await this.workerStore.fetchReturnSearch({
        skip: 0,
        take: 0,
        sort: [],
        formValue: {
          code: code,
          text: null,
          type: null,
          active: 1
        }
      })

      if (res) {
        this.data = { ...res.data[0] }
        this.form = { ...interfaceForm }
      }
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
