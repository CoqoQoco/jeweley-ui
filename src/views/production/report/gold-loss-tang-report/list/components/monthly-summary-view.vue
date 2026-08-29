<template>
  <SectionCardGeneric
    :title="$t('view.production.goldLossTang.monthlySummaryTitle')"
    icon="bi-calendar3"
    accent="main"
    headerStyle="legend"
  >
    <BaseDataTable
      :items="rows"
      :columns="columns"
      :paginator="true"
      :totalRecords="total"
      :perPage="take"
      dataKey="_rowKey"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #monthTemplate="{ data }">
        {{ formatMonth(data) }}
      </template>
      <template #actionTemplate="{ data }">
        <ButtonGeneric
          variant="green"
          icon="bi-printer"
          :title="$t('view.production.goldLossTangByWorker.printMonthly')"
          @click="onPrintMonthly(data)"
        />
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import dayjs from 'dayjs'
import { useGoldLossTangByWorkerApiStore } from '@/stores/modules/api/production/gold-loss-tang-by-worker-api.js'
import { useGoldLossTangMonthlyApiStore } from '@/stores/modules/api/production/gold-loss-tang-monthly-api.js'
import { formatYearMonth } from '@/services/utils/dayjs.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { GoldLossTangMonthlyPdfBuilder } from '@/services/helper/pdf/gold-loss/gold-loss-tang-monthly-pdf-builder.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'GoldLossTangMonthlySummaryView',

  components: {
    SectionCardGeneric,
    BaseDataTable,
    ButtonGeneric
  },

  mixins: [dataTablePaging],

  setup() {
    const goldLossTangByWorkerStore = useGoldLossTangByWorkerApiStore()
    const goldLossTangMonthlyStore = useGoldLossTangMonthlyApiStore()
    return { goldLossTangByWorkerStore, goldLossTangMonthlyStore }
  },

  props: {
    search: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      rows: [],
      total: 0
    }
  },

  computed: {
    columns() {
      return [
        {
          field: 'workerCode',
          header: this.$t('view.production.goldLossTangByWorker.colWorkerCode'),
          sortable: false,
          minWidth: '140px'
        },
        {
          field: 'workerName',
          header: this.$t('view.production.goldLossTangByWorker.colWorkerName'),
          sortable: false,
          minWidth: '180px'
        },
        {
          field: 'month',
          header: this.$t('view.production.goldLossTangByWorker.colMonth'),
          sortable: false,
          minWidth: '110px'
        },
        {
          field: 'slipCount',
          header: this.$t('view.production.goldLossTangByWorker.colSlipCount'),
          sortable: false,
          minWidth: '110px',
          align: 'right'
        },
        {
          field: 'totalIssued',
          header: this.$t('view.production.goldLossTangByWorker.colTotalIssued'),
          sortable: false,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalReturned',
          header: this.$t('view.production.goldLossTangByWorker.colTotalReturned'),
          sortable: false,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalRawLoss',
          header: this.$t('view.production.goldLossTangByWorker.colTotalRawLoss'),
          sortable: false,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalAllowedLoss',
          header: this.$t('view.production.goldLossTangByWorker.colTotalAllowedLoss'),
          sortable: false,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalDiffLoss',
          header: this.$t('view.production.goldLossTangByWorker.colTotalDiffLoss'),
          sortable: false,
          minWidth: '130px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'totalMoneyDiff',
          header: this.$t('view.production.goldLossTangByWorker.colTotalMoneyDiff'),
          sortable: false,
          minWidth: '140px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'action',
          header: '',
          sortable: false,
          minWidth: '80px'
        }
      ]
    }
  },

  watch: {
    search: {
      handler() {
        this.resetPaging()
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    formatMonth(data) {
      return formatYearMonth(data.year, data.month)
    },

    // เรียก action ของ store ที่ report 4.2 ใช้ร่วมกัน (Pinia singleton) แต่ไม่อ่าน
    // goldLossTangByWorkerStore.dataSearch ตรงๆ — เก็บผลลัพธ์ไว้ใน local state (rows)
    // ของ component นี้แทน เพื่อไม่ให้ state ชนกับหน้ารายงาน gold-loss-tang-by-worker-report
    async fetchData() {
      const res = await this.goldLossTangByWorkerStore.fetchReport({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: {
          workerCode: this.search.workerCode,
          requestDateStart: this.search.dateStart,
          requestDateEnd: this.search.dateEnd,
          groupByMonth: true
        }
      })
      const data = res && Array.isArray(res.data) ? res.data : []
      this.rows = data.map((item, index) => ({
        ...item,
        _rowKey: `${item.workerCode}-${item.year}-${item.month}-${index}`
      }))
      this.total = res?.total || 0
    },

    async onPrintMonthly(row) {
      const monthStart = dayjs().year(row.year).month(row.month - 1).startOf('month')
      const monthEnd = dayjs().year(row.year).month(row.month - 1).endOf('month')
      const res = await this.goldLossTangMonthlyStore.fetchMonthly({
        workerCode: row.workerCode,
        requestDateStart: monthStart.toDate(),
        requestDateEnd: monthEnd.toDate()
      })
      if (!res || !res.slipCount) {
        warning(this.$t('view.production.goldLossTangByWorker.noDataPrint'))
        return
      }
      new GoldLossTangMonthlyPdfBuilder(res).generatePDF().open()
    }
  }
}
</script>
