<template>
  <SectionCardGeneric :title="$t('view.executive.money.title')" icon="bi-cash-stack" accent="warning" headerStyle="legend" class="section-card-block">
    <h6 class="chart-title">{{ $t('view.executive.money.chartTitle') }}</h6>
    <ChartGeneric type="bar" :series="chartSeries" :options="chartOptions" :height="140" :emptyText="$t('common.label.noData')" />

    <div class="tab-row">
      <ToggleGroupGeneric v-model="activeTab" :options="tabOptions" :ariaLabel="$t('view.executive.money.title')" />
    </div>

    <BaseDataTable :items="tableRows.data" :totalRecords="tableRows.total" :columns="columns" :perPage="take" dataKey="rowKey" @page="handlePageChange" @sort="handleSortChange" @row-click="onRowClick">
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
  </SectionCardGeneric>
</template>

<script>
import { useExecutiveReportApiStore } from '@/stores/modules/api/report/executive-report-api.js'
import { formatDate } from '@/services/utils/dayjs.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatMoneyFull, formatMoneyWithCurrency } from '../executive-helpers.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'ExecutiveReceivablesView',

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
    refreshToken: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      activeTab: 'unpaid',
      tableRows: { data: [], total: 0 }
    }
  },

  computed: {
    tabOptions() {
      return [
        { value: 'unpaid', label: this.$t('view.executive.money.tabUnpaid') },
        { value: 'overdue', label: this.$t('view.executive.money.tabOverdue') },
        { value: 'noDueDate', label: this.$t('view.executive.money.tabNoDueDate') },
        { value: 'soNoInvoice', label: this.$t('view.executive.money.tabSoNoInvoice') }
      ]
    },

    isSoTab() {
      return this.activeTab === 'soNoInvoice'
    },

    chartSeries() {
      const r = this.receivablesSummary
      return [
        { name: this.$t('view.executive.money.seriesPaid'), data: [r.paidOrPartialThb || 0] },
        { name: this.$t('view.executive.money.seriesUnpaidNotDue'), data: [r.unpaidNotOverdueThb || 0] },
        { name: this.$t('view.executive.money.seriesOverdue'), data: [r.overdueThb || 0] }
      ]
    },

    chartOptions() {
      return {
        chart: { type: 'bar', stacked: true, stackType: '100%', toolbar: { show: false } },
        colors: [CHART_TOKENS.green, CHART_TOKENS.warning, CHART_TOKENS.red],
        plotOptions: { bar: { horizontal: true, barHeight: '50%' } },
        xaxis: { categories: [this.$t('view.executive.money.title')] },
        dataLabels: { enabled: true, formatter: (val) => `${Number(val).toFixed(1)}%` },
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
    activeTab() {
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

    paymentStateLabel(state) {
      return this.$t(`view.executive.money.paymentState.${state}`) || state
    },

    async fetchData() {
      if (this.isSoTab) {
        const res = await this.executiveReportStore.fetchSalesOrdersWithoutInvoice({ take: this.take, skip: this.skip, sort: this.sort })
        const data = (res?.data || []).map((row) => ({ ...row, rowKey: row.soNumber }))
        this.tableRows = { data, total: res?.total || 0 }
        return
      }

      const res = await this.executiveReportStore.fetchReceivables({ take: this.take, skip: this.skip, sort: this.sort, filter: this.activeTab })
      const data = (res?.data || []).map((row) => ({ ...row, rowKey: row.running }))
      this.tableRows = { data, total: res?.total || 0 }
    },

    onRowClick(event) {
      const data = event.data
      if (this.isSoTab) {
        this.$router.push({ name: 'sale-order', query: { soNumber: data.soNumber } })
        return
      }
      this.$router.push({ name: 'invoice-detail', query: { invoiceNumber: data.dkInvoiceNumber } })
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

.chart-title {
  color: var(--base-font-color);
  font-weight: 600;
  font-size: var(--fs-base);
  margin-bottom: var(--sp-sm);
}

.tab-row {
  margin: var(--sp-lg) 0;
}
</style>
