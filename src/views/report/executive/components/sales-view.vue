<template>
  <SectionCardGeneric :title="$t('view.executive.money.title')" icon="bi-cash-stack" accent="warning" headerStyle="legend" class="section-card-block">
    <div class="sales-grid">
      <div class="donut-col">
        <h6 class="chart-title">{{ $t('view.executive.money.chartTitle') }}</h6>
        <ChartGeneric type="donut" :series="donutSeries" :options="donutOptions" :height="280" :emptyText="$t('common.label.noData')" />
      </div>

      <div class="table-col">
        <div class="tab-row">
          <ToggleGroupGeneric v-model="activeFilter" :options="toggleOptions" :ariaLabel="$t('view.executive.money.title')" />
        </div>

        <BaseDataTable :items="tableRows.data" :totalRecords="tableRows.total" :columns="columns" :perPage="take" dataKey="rowKey" @page="handlePageChange" @sort="handleSortChange" @row-click="onRowClick">
          <template #dkInvoiceNumberTemplate="{ data }">
            {{ data.dkInvoiceNumber || data.running }}
          </template>
          <template #createDateTemplate="{ data }">
            {{ formatDate(data.createDate) }}
          </template>
          <template #soDateTemplate="{ data }">
            {{ formatDate(data.soDate) }}
          </template>
          <template #dueDateTemplate="{ data }">
            {{ data.dueDate ? formatDate(data.dueDate) : '-' }}
          </template>
          <template #deliveryDateTemplate="{ data }">
            {{ data.deliveryDate ? formatDate(data.deliveryDate) : '-' }}
          </template>
          <template #grandTotalThbTemplate="{ data }">
            <div class="text-right">{{ formatMoneyFull(data.grandTotalThb) }}</div>
          </template>
          <template #outstandingTemplate="{ data }">
            <div class="text-right">{{ formatMoneyWithCurrency(data.outstanding, data.currencyUnit) }}</div>
          </template>
          <template #paymentStateTemplate="{ data }">
            {{ paymentStateLabel(data.paymentState) }}
          </template>
          <template #isOverdueTemplate="{ data }">
            {{ data.isOverdue ? $t('view.executive.money.yes') : $t('view.executive.money.no') }}
          </template>
        </BaseDataTable>
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { useExecutiveReportApiStore } from '@/stores/modules/api/report/executive-report-api.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import {
  formatMoneyFull,
  formatMoneyAbbreviated,
  formatMoneyWithCurrency,
  buildReceivablesDonutSeries,
  buildDonutCenterLabel,
  buildDonutCenterLabelsOptions,
  resolveDonutSliceFilter
} from '../executive-helpers.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'ExecutiveSalesView',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    ToggleGroupGeneric,
    ChartGeneric,
    BaseDataTable
  },

  setup() {
    const executiveReportStore = useExecutiveReportApiStore()
    return { executiveReportStore }
  },

  props: {
    receivablesSummary: {
      type: Object,
      required: true
    },
    salesOrdersSummary: {
      type: Object,
      required: true
    },
    refreshToken: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      activeFilter: 'unpaid',
      tableRows: { data: [], total: 0 }
    }
  },

  computed: {
    toggleOptions() {
      return [
        { value: 'unpaid', label: this.$t('view.executive.money.tabUnpaid', { count: this.formatCount(this.receivablesSummary.unpaidCount) }) },
        { value: 'overdue', label: this.$t('view.executive.money.tabOverdue', { count: this.formatCount(this.receivablesSummary.overdueCount) }) },
        { value: 'noDueDate', label: this.$t('view.executive.money.tabNoDueDate', { count: this.formatCount(this.receivablesSummary.noDueDateCount) }) },
        { value: 'soNoInvoice', label: this.$t('view.executive.money.tabSoNoInvoice', { count: this.formatCount(this.salesOrdersSummary.noInvoiceCount) }) }
      ]
    },

    isSoTab() {
      return this.activeFilter === 'soNoInvoice'
    },

    donutLabelTexts() {
      return {
        paid: this.$t('view.executive.money.seriesPaid'),
        unpaidNotDue: this.$t('view.executive.money.seriesUnpaidNotDue'),
        overdue: this.$t('view.executive.money.seriesOverdue')
      }
    },

    donutData() {
      return buildReceivablesDonutSeries(this.receivablesSummary, this.donutLabelTexts)
    },

    donutSeries() {
      return this.donutData.series
    },

    donutCenter() {
      return buildDonutCenterLabel(this.receivablesSummary)
    },

    donutOptions() {
      const seriesValues = this.donutData.series
      const total = seriesValues.reduce((sum, v) => sum + v, 0)
      const center = this.donutCenter

      return {
        chart: {
          events: {
            dataPointSelection: (event, chartContext, config) => this.onDonutSliceClick(config.dataPointIndex)
          }
        },
        labels: this.donutData.labels,
        colors: [CHART_TOKENS.green, CHART_TOKENS.warning, CHART_TOKENS.red],
        dataLabels: { enabled: true, formatter: (val) => `${Number(val).toFixed(1)}%` },
        legend: {
          position: 'bottom',
          formatter: (seriesName, opts) => {
            const value = seriesValues[opts.seriesIndex] || 0
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
            return `${seriesName}: ${formatMoneyAbbreviated(value)} (${percent}%)`
          }
        },
        plotOptions: {
          pie: {
            donut: {
              labels: buildDonutCenterLabelsOptions(
                this.$t('view.executive.money.donutInvoiceCount', { count: this.formatCount(center.invoiceCount) }),
                center.totalAbbrev
              )
            }
          }
        },
        tooltip: { y: { formatter: (v) => formatMoneyFull(v) } }
      }
    },

    columns() {
      if (this.isSoTab) {
        return [
          { field: 'soNumber', header: this.$t('view.executive.money.colSoNumber'), sortable: false, minWidth: '130px' },
          { field: 'customerName', header: this.$t('view.executive.money.colCustomerName'), sortable: false, minWidth: '160px' },
          { field: 'soDate', header: this.$t('view.executive.money.colSoDate'), sortable: false, minWidth: '110px' },
          { field: 'deliveryDate', header: this.$t('view.executive.money.colDeliveryDate'), sortable: false, minWidth: '110px' },
          { field: 'grandTotalThb', header: this.$t('view.executive.money.colGrandTotalThb'), sortable: false, minWidth: '130px', align: 'right' },
          { field: 'isOverdue', header: this.$t('view.executive.money.colOverdue'), sortable: false, minWidth: '90px' },
          { field: 'salePerson', header: this.$t('view.executive.money.colSalePerson'), sortable: false, minWidth: '110px' }
        ]
      }

      return [
        { field: 'dkInvoiceNumber', header: this.$t('view.executive.money.colInvoiceNumber'), sortable: false, minWidth: '130px' },
        { field: 'customerName', header: this.$t('view.executive.money.colCustomerName'), sortable: false, minWidth: '160px' },
        { field: 'createDate', header: this.$t('view.executive.money.colCreateDate'), sortable: false, minWidth: '110px' },
        { field: 'dueDate', header: this.$t('view.executive.money.colDueDate'), sortable: false, minWidth: '110px' },
        { field: 'grandTotalThb', header: this.$t('view.executive.money.colGrandTotalThb'), sortable: false, minWidth: '130px', align: 'right' },
        { field: 'outstanding', header: this.$t('view.executive.money.colOutstanding'), sortable: false, minWidth: '130px', align: 'right' },
        { field: 'paymentState', header: this.$t('view.executive.money.colPaymentState'), sortable: false, minWidth: '110px' },
        { field: 'salePerson', header: this.$t('view.executive.money.colSalePerson'), sortable: false, minWidth: '110px' }
      ]
    }
  },

  watch: {
    activeFilter() {
      this.resetPaging()
    },

    refreshToken() {
      this.fetchData()
    }
  },

  methods: {
    formatDate,
    formatMoneyFull,
    formatMoneyWithCurrency,

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    paymentStateLabel(state) {
      return this.$t(`view.executive.money.paymentState.${state}`) || state
    },

    // green (index 0 = รับแล้ว/บางส่วน) ไม่ใช่ filter จริงใน ToggleGroup — ignore ตามที่ระบุ
    onDonutSliceClick(dataPointIndex) {
      const filter = resolveDonutSliceFilter(dataPointIndex)
      if (filter === 'unpaid' || filter === 'overdue') {
        this.activeFilter = filter
      }
    },

    async fetchData() {
      if (this.isSoTab) {
        const res = await this.executiveReportStore.fetchSalesOrdersWithoutInvoice({ take: this.take, skip: this.skip, sort: this.sort })
        const data = (res?.data || []).map((row) => ({ ...row, rowKey: row.soNumber }))
        this.tableRows = { data, total: res?.total || 0 }
        return
      }

      const res = await this.executiveReportStore.fetchReceivables({ take: this.take, skip: this.skip, sort: this.sort, filter: this.activeFilter })
      const data = (res?.data || []).map((row) => ({ ...row, rowKey: row.running }))
      this.tableRows = { data, total: res?.total || 0 }
    },

    onRowClick(event) {
      const data = event.data
      if (this.isSoTab) {
        this.$router.push({ name: 'sale-order', query: { soNumber: data.soNumber } })
        return
      }
      // invoice-detail อ่าน query.invoiceNumber = running (InvoiceService map InvoiceNumber = Running)
      // dkInvoiceNumber เป็น null ในบิลเก่าหลายใบ ใช้ dkInvoiceNumber ไปเปิดหน้าจะพังเสมอ
      this.$router.push({ name: 'invoice-detail', query: { invoiceNumber: data.running } })
    }
  },

  mounted() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.section-card-block {
  margin-bottom: var(--sp-lg);
}

.sales-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--sp-xl);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.chart-title {
  color: var(--base-font-color);
  font-weight: 600;
  font-size: var(--fs-base);
  margin-bottom: var(--sp-sm);
}

.tab-row {
  margin-bottom: var(--sp-lg);
}
</style>
