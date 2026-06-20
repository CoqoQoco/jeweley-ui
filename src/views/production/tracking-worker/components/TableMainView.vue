<template>
  <div class="mt-2">
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      :paginator="true"
      @page="handlePageChange"
    >
      <template #imageTemplate="{ data: row }">
        <div class="image-container">
          <imagePreview :imageName="row.mold" :type="mold"></imagePreview>
        </div>
      </template>

      <template #woTemplate="{ data: row }">
        {{ `${row.wo}${row.woNumber}` }}
      </template>

      <template #statusTemplate="{ data: row }">
        {{ row.wagesStatus === 100 ? $t('view.production.trackingWorker.statusDone') : $t('view.production.trackingWorker.statusActive') }}
      </template>

      <template #workerCodeTemplate="{ data: row }">
        {{ `${row.workerCode}-${row.workerName}` }}
      </template>

      <template #jobDateTemplate="{ data: row }">
        {{ formatDate(row.jobDate) }}
      </template>

      <template #descTemplate="{ data: row }">
        {{ `${row.gold} ${row.description ? `[${row.description}]` : ``}` }}
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { formatDate, formatISOString } from '@/services/utils/dayjs.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import api from '@/axios/axios-helper.js'

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

export default {
  components: {
    BaseDataTable,
    imagePreview
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    formValue: {
      type: Object,
      default: () => {}
    },
    masterStatusValue: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      mold: 'MOLD',

      // table
      take: 10,
      skip: 0,
      data: {}
    }
  },
  computed: {
    columns() {
      return [
        { field: 'image', header: this.$t('view.production.trackingWorker.colMold'), minWidth: '100px', sortable: false },
        { field: 'wo', header: this.$t('view.production.trackingWorker.colWo'), minWidth: '150px', sortable: false },
        { field: 'status', header: this.$t('view.production.trackingWorker.colStatus'), minWidth: '150px', sortable: false },
        { field: 'workerCode', header: this.$t('view.production.trackingWorker.colWorker'), minWidth: '150px', sortable: false },
        { field: 'jobDate', header: this.$t('view.production.trackingWorker.colCreateDate'), minWidth: '150px', sortable: false },
        { field: 'productNumber', header: this.$t('view.production.trackingWorker.colProductCode'), minWidth: '150px', sortable: false },
        { field: 'statusName', header: this.$t('view.production.trackingWorker.colStatus'), minWidth: '150px', sortable: false },
        { field: 'desc', header: this.$t('common.field.description'), minWidth: '150px', sortable: false },
        { field: 'goldQtySend', header: this.$t('view.production.trackingWorker.colQtySend'), minWidth: '150px', sortable: false },
        { field: 'goldWeightSend', header: this.$t('view.production.trackingWorker.colWeightSend'), minWidth: '150px', sortable: false },
        { field: 'goldQtyCheck', header: this.$t('view.production.trackingWorker.colQtyCheck'), minWidth: '150px', sortable: false },
        { field: 'goldWeightCheck', header: this.$t('view.production.trackingWorker.colWeightCheck'), minWidth: '150px', sortable: false }
      ]
    }
  },
  watch: {
    async formValue() {
      this.take = 10
      this.skip = 0
      await this.fetchData()
    }
  },
  methods: {
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },

    formatDate(date) {
      return formatDate(date)
    },

    async fetchData() {
      this.data = {}
      const param = {
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          createStart: this.formValue?.start ? formatISOString(this.formValue.start) : null,
          createEnd: this.formValue?.end ? formatISOString(this.formValue.end) : null,
          text: this.formValue?.text
        }
      }
      const res = await api.jewelry.post('Worker/TrackingWorkerRequest', param)
      if (res) {
        this.data = { ...res }
      }
    },

    viewplan(item) {
      const id = item.id
      window.open(`/plan-order-tracking-update/${id}`, '_blank')
    }
  },
  created() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/table-data.scss';
</style>
