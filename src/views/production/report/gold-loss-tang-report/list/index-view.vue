<template>
  <div class="app-container">
    <list-search-view
      v-model:documentNo="form.documentNo"
      v-model:workerCode="form.workerCode"
      v-model:dateStart="form.dateStart"
      v-model:dateEnd="form.dateEnd"
      @search="onSearch"
      @clear="onClear"
      @export="onExport"
      @create="onCreate"
    />
    <list-data-table-view
      :items="slipList"
      class="mt-3"
      @print="onPrint"
      @cancel="onCancel"
      @view="onView"
      @edit="onEdit"
    />
    <detail-modal-view
      :isShow="isShowDetail"
      :slipId="detailSlipId"
      @closeModal="isShowDetail = false"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { useGoldLossTangStore } from '@/stores/modules/api/plan/gold-loss-tang-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { GoldLossTangPdfBuilder } from '@/services/helper/pdf/gold-loss/gold-loss-tang-pdf-builder.js'

import listSearchView from './components/search-view.vue'
import listDataTableView from './components/data-table-view.vue'
import detailModalView from './modal/detail-view.vue'

export default {
  name: 'GoldLossTangSlipList',

  components: {
    listSearchView,
    listDataTableView,
    detailModalView
  },

  data() {
    return {
      form: {
        documentNo: '',
        workerCode: '',
        dateStart: null,
        dateEnd: null
      },
      slipList: [],
      isShowDetail: false,
      detailSlipId: null
    }
  },

  created() {
    this.onSearch()
  },

  methods: {
    async onSearch() {
      const store = useGoldLossTangStore()
      const res = await store.listSlips({
        documentNo: this.form.documentNo || undefined,
        workerCode: this.form.workerCode || undefined,
        requestDateStart: this.form.dateStart ? formatISOString(this.form.dateStart) : undefined,
        requestDateEnd: this.form.dateEnd ? formatISOString(this.form.dateEnd) : undefined
      })
      this.slipList = Array.isArray(res) ? res : res?.data || []
    },

    onClear() {
      this.form = { documentNo: '', workerCode: '', dateStart: null, dateEnd: null }
    },

    onCreate() {
      this.$router.push({ name: 'gold-loss-tang-create' })
    },

    async onExport() {
      if (this.slipList.length === 0) {
        warning(this.$t('view.production.goldLossTang.noDataExport'))
        return
      }

      const rows = this.slipList.map((x) => ({
        documentNo: x.documentNo,
        workerCode: x.workerCode,
        workerName: x.workerName,
        requestDateStart: x.requestDateStart ? dayjs(x.requestDateStart).format('DD/MM/YYYY') : '',
        requestDateEnd: x.requestDateEnd ? dayjs(x.requestDateEnd).format('DD/MM/YYYY') : '',
        lossPercent: x.lossPercent != null ? Number(x.lossPercent).toFixed(4) : '',
        pricePerGram: x.pricePerGram != null ? Number(x.pricePerGram).toFixed(2) : '',
        issuedTotal: x.issuedTotal != null ? Number(x.issuedTotal).toFixed(4) : '',
        returnedTotal: x.returnedTotal != null ? Number(x.returnedTotal).toFixed(4) : '',
        diffLoss: x.diffLoss != null ? Number(x.diffLoss).toFixed(4) : '',
        totalMoneyDiff: x.totalMoneyDiff != null ? Number(x.totalMoneyDiff).toFixed(2) : '',
        createDate: x.createDate ? dayjs(x.createDate).format('DD/MM/YYYY') : ''
      }))

      await ExcelHelper.exportToExcel(rows, {
        filename: this.$t('view.production.goldLossTang.excelFileName') + '.xlsx',
        sheetName: this.$t('view.production.goldLossTang.listTitle'),
        columns: [
          { header: this.$t('view.production.goldLossTang.colDocumentNo'), key: 'documentNo' },
          { header: this.$t('view.production.goldLossTang.colWorkerCode'), key: 'workerCode' },
          { header: this.$t('view.production.goldLossTang.colWorkerName'), key: 'workerName' },
          { header: this.$t('view.production.goldLossTang.colDateStart'), key: 'requestDateStart' },
          { header: this.$t('view.production.goldLossTang.colDateEnd'), key: 'requestDateEnd' },
          { header: this.$t('view.production.goldLossTang.lossPercent'), key: 'lossPercent' },
          { header: this.$t('view.production.goldLossTang.pricePerGram'), key: 'pricePerGram' },
          { header: this.$t('view.production.goldLossTang.issuedTotal'), key: 'issuedTotal' },
          { header: this.$t('view.production.goldLossTang.returnedTotal'), key: 'returnedTotal' },
          { header: this.$t('view.production.goldLossTang.diffLoss'), key: 'diffLoss' },
          { header: this.$t('view.production.goldLossTang.colMoney'), key: 'totalMoneyDiff' },
          { header: this.$t('view.production.goldLossTang.colCreateDate'), key: 'createDate' }
        ]
      })
    },

    onView(slip) {
      this.detailSlipId = slip.id
      this.isShowDetail = true
    },

    onEdit(slip) {
      this.$router.push({ name: 'gold-loss-tang-edit', params: { id: slip.id } })
    },

    onCancel(slip) {
      confirmThenSubmit(
        `${slip.documentNo}`,
        this.$t('view.production.goldLossTang.confirmCancel'),
        async () => {
          const store = useGoldLossTangStore()
          await store.cancelSlip(slip.id)
          success(this.$t('view.production.goldLossTang.cancelSuccess'))
          await this.onSearch()
        }
      )
    },

    async onPrint(slip) {
      const store = useGoldLossTangStore()
      const res = await store.getSlip(slip.id)
      if (res) {
        const data = res.data || res
        const builder = new GoldLossTangPdfBuilder(data)
        builder.generatePDF().open()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.app-container {
  padding: var(--sp-lg);
}
</style>
