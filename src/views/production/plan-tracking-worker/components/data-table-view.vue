<template>
  <div class="mt-2">
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 350px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- Image Column -->
      <template #imageTemplate="{ data }">
        <div class="image-container">
          <imagePreview :imageName="data.mold" :type="mold" :width="30" :height="30" />
        </div>
      </template>

      <!-- WO Number template -->
      <template #woTemplate="{ data: rowData }">
        {{ `${rowData.wo}-${rowData.woNumber}` }}
      </template>

      <!-- Status template -->
      <template #statusTemplate="{ data: rowData }">
        {{ rowData.wagesStatus === 100 ? $t('view.production.planTrackingWorker.statusSuccess') : $t('view.production.planTrackingWorker.statusInProgress') }}
      </template>

      <!-- Worker template -->
      <template #workerCodeTemplate="{ data: rowData }">
        {{ `${rowData.workerCode}-${rowData.workerName}` }}
      </template>

      <!-- Description template -->
      <template #descTemplate="{ data: rowData }">
        {{ `${rowData.gold} ${rowData.description ? `[${rowData.description}]` : ``}` }}
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

// External
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usePlanWorkerApiStore } from '@/stores/modules/api/worker/plan-worker-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

// Local
const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))

export default {
  name: 'ProductionPlanList',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable,
    imagePreview
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    },
    formValueExport: {
      type: Object,
      default: () => ({})
    },
    masterPlanStatus: {
      type: Array,
      default: () => [],
      required: true
    }
  },

  data() {
    return {
      data: {},
      mold: 'MOLD'
    }
  },

  setup() {
    const planWorkerStore = usePlanWorkerApiStore()
    return { planWorkerStore }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    planStatus() {
      return this.masterPlanStatus
    },
    columns() {
      return [
        {
          field: 'image',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'wo',
          header: this.$t('view.production.planTrackingWorker.colWo'),
          minWidth: '150px'
        },
        {
          field: 'status',
          header: this.$t('view.production.planTrackingWorker.colStatus'),
          minWidth: '150px'
        },
        {
          field: 'workerCode',
          header: this.$t('view.production.planTrackingWorker.colWorker'),
          minWidth: '150px'
        },
        {
          field: 'jobDate',
          header: this.$t('view.production.planTrackingWorker.colJobDate'),
          minWidth: '150px',
          format: 'date'
        },
        {
          field: 'productNumber',
          header: this.$t('common.field.code'),
          minWidth: '150px'
        },
        {
          field: 'statusName',
          header: this.$t('view.production.planTrackingWorker.colDepartment'),
          minWidth: '150px'
        },
        {
          field: 'desc',
          header: this.$t('view.production.planTrackingWorker.colDesc'),
          minWidth: '150px'
        },
        {
          field: 'goldQtySend',
          header: this.$t('view.production.planTrackingWorker.colGoldQtySend'),
          minWidth: '150px',
          format: 'decimal3'
        },
        {
          field: 'goldWeightSend',
          header: this.$t('view.production.planTrackingWorker.colGoldWeightSend'),
          minWidth: '150px',
          format: 'decimal3'
        },
        {
          field: 'goldQtyCheck',
          header: this.$t('view.production.planTrackingWorker.colGoldQtyCheck'),
          minWidth: '150px',
          format: 'decimal3'
        },
        {
          field: 'goldWeightCheck',
          header: this.$t('view.production.planTrackingWorker.colGoldWeightCheck'),
          minWidth: '150px',
          format: 'decimal3'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.fetchDataExport()
    }
  },

  methods: {
    async fetchData() {
      const res = await this.planWorkerStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        form: this.form
      })
      this.data = { ...res }
    },

    async fetchDataExport() {
      await this.planWorkerStore.fetchDataSearchExport({
        sort: this.sort,
        form: this.form
      })
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.notification {
  display: inline-flex;
  align-items: center;
}

.overdue-tag {
  background-color: var(--base-red);
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
</style>
