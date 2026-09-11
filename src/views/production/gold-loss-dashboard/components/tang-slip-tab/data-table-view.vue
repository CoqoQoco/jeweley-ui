<template>
  <div class="mt-2">
    <BaseDataTable
      :items="goldLossTangByWorkerStore.dataSearch.data"
      :totalRecords="goldLossTangByWorkerStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      :expandable="true"
      dataKey="workerCode"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #monthTemplate="{ data }">
        {{ formatMonth(data) }}
      </template>

      <template #expansion="{ data }">
        <div class="by-gold-type-block">
          <div class="by-gold-type-title">
            <i class="bi bi-columns-gap"></i>
            {{ $t('view.production.goldLossTangByWorker.byGoldTypeTitle') }}
          </div>
          <BaseDataTable
            :items="data.byGoldType || []"
            :totalRecords="(data.byGoldType || []).length"
            :columns="byGoldTypeColumns"
            :paginator="false"
            dataKey="goldSize"
          >
            <template #goldSizeTemplate="{ data: row }">
              <span>{{ row.goldSize }}</span>
              <i
                v-if="row.hasMixedPrice"
                class="bi bi-exclamation-triangle-fill mixed-price-icon"
                :title="$t('view.production.goldLossTangByWorker.mixedPriceTooltip')"
              ></i>
            </template>
          </BaseDataTable>
        </div>
      </template>

      <template #footer>
        <div>{{ $t('view.production.goldLossTangByWorker.totalWorkers', { total: goldLossTangByWorkerStore.dataSearch.total }) }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { formatYearMonth } from '@/services/utils/dayjs.js'

import { useGoldLossTangByWorkerApiStore } from '@/stores/modules/api/production/gold-loss-tang-by-worker-api.js'

export default {
  name: 'GoldLossTangByWorkerReportDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable
  },

  setup() {
    const goldLossTangByWorkerStore = useGoldLossTangByWorkerApiStore()
    return { goldLossTangByWorkerStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    columns() {
      const cols = [
        {
          field: 'workerCode',
          header: this.$t('view.production.goldLossTangByWorker.colWorkerCode'),
          sortable: true,
          minWidth: '140px'
        },
        {
          field: 'workerName',
          header: this.$t('view.production.goldLossTangByWorker.colWorkerName'),
          sortable: true,
          minWidth: '180px'
        }
      ]

      if (this.modelForm.groupByMonth) {
        cols.push({
          field: 'month',
          header: this.$t('view.production.goldLossTangByWorker.colMonth'),
          sortable: false,
          minWidth: '110px'
        })
      }

      cols.push(
        {
          field: 'slipCount',
          header: this.$t('view.production.goldLossTangByWorker.colSlipCount'),
          sortable: true,
          minWidth: '110px',
          align: 'right'
        },
        {
          field: 'totalIssued',
          header: this.$t('view.production.goldLossTangByWorker.colTotalIssued'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalReturned',
          header: this.$t('view.production.goldLossTangByWorker.colTotalReturned'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalRawLoss',
          header: this.$t('view.production.goldLossTangByWorker.colTotalRawLoss'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalAllowedLoss',
          header: this.$t('view.production.goldLossTangByWorker.colTotalAllowedLoss'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalDiffLoss',
          header: this.$t('view.production.goldLossTangByWorker.colTotalDiffLoss'),
          sortable: true,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalMoneyDiff',
          header: this.$t('view.production.goldLossTangByWorker.colTotalMoneyDiff'),
          sortable: true,
          minWidth: '140px',
          align: 'right',
          format: 'decimal2'
        }
      )

      return cols
    },

    byGoldTypeColumns() {
      return [
        { field: 'goldSize', header: this.$t('view.production.goldLossTangByWorker.colGoldSize'), sortable: false, minWidth: '120px' },
        { field: 'pricePerGram', header: this.$t('view.production.goldLossTangByWorker.colPricePerGram'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'slipCount', header: this.$t('view.production.goldLossTangByWorker.colSlipCount'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'issuedTotal', header: this.$t('view.production.goldLossTangByWorker.colTotalIssued'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'returnedTotal', header: this.$t('view.production.goldLossTangByWorker.colTotalReturned'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'rawLoss', header: this.$t('view.production.goldLossTangByWorker.colTotalRawLoss'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'allowedLoss', header: this.$t('view.production.goldLossTangByWorker.colTotalAllowedLoss'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'diffLoss', header: this.$t('view.production.goldLossTangByWorker.colTotalDiffLoss'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'moneyDiff', header: this.$t('view.production.goldLossTangByWorker.colTotalMoneyDiff'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.goldLossTangByWorkerStore.fetchReportExport({
        sort: this.sort,
        formValue: this.modelFormExport
      })
    }
  },

  methods: {
    formatMonth(data) {
      return formatYearMonth(data.year, data.month)
    },

    async fetchData() {
      await this.goldLossTangByWorkerStore.fetchReport({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  },

  created() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.by-gold-type-block {
  padding: var(--sp-md) var(--sp-lg);
}

.by-gold-type-title {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  font-weight: 700;
  color: var(--base-font-color);
  margin-bottom: var(--sp-sm);
}

.mixed-price-icon {
  color: var(--base-warning);
  margin-left: var(--sp-xs);
}
</style>
