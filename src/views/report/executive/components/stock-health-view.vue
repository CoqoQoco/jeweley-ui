<template>
  <SectionCardGeneric :title="$t('view.executive.stock.title')" icon="bi-box-seam" accent="main" headerStyle="legend" class="section-card-block">
    <div class="stock-grid">
      <div class="chart-col">
        <h6 class="chart-title">{{ $t('view.executive.stock.chartTitle') }}</h6>
        <ChartGeneric type="bar" :series="ageSeries" :options="ageOptions" :height="280" :emptyText="$t('common.label.noData')" />
      </div>
      <div class="table-col">
        <h6 class="table-title">{{ $t('view.executive.stock.byReceiptTypeTitle') }}</h6>
        <BaseDataTable :items="receiptTypeRows" :totalRecords="receiptTypeRows.length" :columns="receiptTypeColumns" :paginator="false" dataKey="key">
          <template #countTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.count) }}</div>
          </template>
          <template #noCostCountTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.noCostCount) }}</div>
          </template>
        </BaseDataTable>
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { useExecutiveReportApiStore } from '@/stores/modules/api/report/executive-report-api.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const AGE_BUCKET_KEYS = ['lt1y', 'y1to2', 'y2to5', 'gt5y']

export default {
  name: 'ExecutiveStockHealthView',

  components: {
    SectionCardGeneric,
    ChartGeneric,
    BaseDataTable
  },

  setup() {
    const executiveReportStore = useExecutiveReportApiStore()
    return { executiveReportStore }
  },

  props: {
    refreshToken: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      stockHealth: { ageBuckets: [], receiptTypes: [] }
    }
  },

  computed: {
    bucketLabelMap() {
      const map = {}
      AGE_BUCKET_KEYS.forEach((key) => {
        map[key] = this.$t(`view.executive.stock.ageBucket.${key}`)
      })
      return map
    },

    ageSeries() {
      const buckets = this.stockHealth.ageBuckets || []
      return [
        {
          name: this.$t('view.executive.stock.seriesWithCost'),
          data: buckets.map((b) => Math.max((b.count || 0) - (b.noCostCount || 0), 0))
        },
        {
          name: this.$t('view.executive.stock.seriesNoCost'),
          data: buckets.map((b) => b.noCostCount || 0)
        }
      ]
    },

    ageOptions() {
      const buckets = this.stockHealth.ageBuckets || []
      return {
        chart: { type: 'bar', stacked: true, toolbar: { show: false } },
        colors: [CHART_TOKENS.green, CHART_TOKENS.warning],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
        dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 600 } },
        xaxis: { categories: buckets.map((b) => this.bucketLabelMap[b.key] || b.key) },
        yaxis: { labels: { formatter: (v) => this.formatCount(v) } },
        tooltip: { y: { formatter: (v) => this.formatCount(v) } }
      }
    },

    receiptTypeRows() {
      return (this.stockHealth.receiptTypes || []).map((r) => ({
        key: r.receiptType,
        receiptType: r.receiptType,
        count: r.count || 0,
        noCostCount: r.noCostCount || 0
      }))
    },

    receiptTypeColumns() {
      return [
        { field: 'receiptType', header: this.$t('view.executive.stock.colReceiptType'), sortable: false, minWidth: '160px' },
        { field: 'count', header: this.$t('view.executive.stock.colCount'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'noCostCount', header: this.$t('view.executive.stock.colNoCostCount'), sortable: false, minWidth: '100px', align: 'right' }
      ]
    }
  },

  watch: {
    refreshToken() {
      this.fetchData()
    }
  },

  methods: {
    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    async fetchData() {
      const res = await this.executiveReportStore.fetchStockHealth()
      this.stockHealth = res ? { ageBuckets: res.ageBuckets || [], receiptTypes: res.receiptTypes || [] } : { ageBuckets: [], receiptTypes: [] }
    }
  },

  mounted() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.stock-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-xl);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.chart-title,
.table-title {
  color: var(--base-font-color);
  font-weight: 600;
  font-size: var(--fs-base);
  margin-bottom: var(--sp-sm);
}
</style>
