<template>
  <SectionCardGeneric
    :title="$t('view.stock.product.dashboard.stockGroupTitle')"
    icon="bi-bar-chart"
    accent="main"
    headerStyle="legend"
    class="section-card-block"
  >
    <div class="group-by-row">
      <span class="title-text">{{ $t('view.stock.product.dashboard.groupByLabel') }}</span>
      <ToggleGroupGeneric v-model="groupBy" :options="groupByOptions" :ariaLabel="$t('view.stock.product.dashboard.groupByLabel')" />
    </div>

    <div class="charts-row-b">
      <ChartGeneric
        type="bar"
        :series="rankingSeries"
        :options="rankingOptions"
        :height="rankingChartHeight"
        :emptyText="$t('common.label.noData')"
      />

      <BaseDataTable :items="tableRows" :totalRecords="tableRows.length" :columns="tableColumns" :paginator="false" dataKey="key">
        <template #pieceQtyTemplate="{ data }">
          <div class="text-right">{{ formatCount(data.pieceQty) }}</div>
        </template>
        <template #percentTemplate="{ data }">
          <div class="text-right">{{ formatPercent(data.percent) }}</div>
        </template>
        <template #avgAgeDaysTemplate="{ data }">
          <div class="text-right">{{ formatCount(data.avgAgeDays) }}</div>
        </template>

        <template #footer>
          <div class="result-footer">
            <span class="result-footer-label">
              {{ $t('view.stock.product.dashboard.tableTotalLabel', { pieces: formatCount(productGroup.totalPieceQty) }) }}
            </span>
          </div>
        </template>
      </BaseDataTable>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { useStockReportApiStore } from '@/stores/modules/api/stock/stock-report-api.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

// จำนวนกลุ่มสูงสุดที่แสดงเป็นแท่งในกราฟอันดับ ที่เหลือรวมเป็น "อื่นๆ" (ตาราง #footer ยังโชว์ทุกกลุ่ม)
const MAX_RANKING_BARS = 12
const RANKING_BAR_MIN_HEIGHT = 200
const RANKING_BAR_ROW_HEIGHT = 34

export default {
  name: 'StockProductDashboardStockGroupView',

  components: {
    SectionCardGeneric,
    ToggleGroupGeneric,
    ChartGeneric,
    BaseDataTable
  },

  setup() {
    const stockReportStore = useStockReportApiStore()
    return { stockReportStore }
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      groupBy: 'productType'
    }
  },

  computed: {
    productGroup() {
      return this.stockReportStore.productGroup
    },

    groupByOptions() {
      return [
        { value: 'productType', label: this.$t('view.stock.product.dashboard.groupByProductType') },
        { value: 'gold', label: this.$t('view.stock.product.dashboard.groupByGold') },
        { value: 'goldSize', label: this.$t('view.stock.product.dashboard.groupByGoldSize') },
        { value: 'combined', label: this.$t('view.stock.product.dashboard.groupByCombined') }
      ]
    },

    // top N กลุ่ม (groups มาเรียง pieceQty desc จาก backend อยู่แล้ว) + แถว "อื่นๆ" รวมส่วนที่เหลือ — สำหรับกราฟอันดับเท่านั้น
    rankingRows() {
      const groups = this.productGroup.groups || []
      const top = groups.slice(0, MAX_RANKING_BARS).map((g) => ({
        label: this.resolveGroupLabel(g),
        pieceQty: g.pieceQty || 0
      }))

      if (groups.length > MAX_RANKING_BARS) {
        const rest = groups.slice(MAX_RANKING_BARS)
        const otherPieceQty = rest.reduce((sum, g) => sum + (g.pieceQty || 0), 0)
        top.push({
          label: this.$t('view.stock.product.dashboard.otherGroupsLabel'),
          pieceQty: otherPieceQty
        })
      }

      return top
    },

    rankingSeries() {
      return [
        {
          name: this.$t('view.stock.product.dashboard.colPieceQty'),
          data: this.rankingRows.map((r) => ({ x: r.label, y: r.pieceQty }))
        }
      ]
    },

    rankingChartHeight() {
      return Math.max(RANKING_BAR_MIN_HEIGHT, this.rankingRows.length * RANKING_BAR_ROW_HEIGHT + 60)
    },

    rankingOptions() {
      return {
        chart: { type: 'bar', stacked: false, toolbar: { show: false } },
        colors: [CHART_TOKENS.primary],
        plotOptions: {
          bar: { horizontal: true, borderRadius: 4, barHeight: '65%', dataLabels: { position: 'top' } }
        },
        dataLabels: {
          enabled: true,
          formatter: (v) => this.formatCount(v),
          style: { fontSize: '12px', fontWeight: 600, colors: [CHART_TOKENS.sub] },
          offsetX: 40
        },
        // gotcha ApexCharts (ดู pipeline-dashboard/product-group-view.vue): horizontal bar — xaxis ยังคือแกนตัวเลข (pieceQty)
        // ชื่อกลุ่มมาจาก data point {x,y} ไม่ใช่ xaxis.categories
        xaxis: {
          title: { text: this.$t('view.stock.product.dashboard.colPieceQty') },
          labels: { formatter: (v) => this.formatCount(v) }
        },
        yaxis: {
          labels: { style: { fontSize: '12px' } }
        },
        grid: { xaxis: { lines: { show: true } } },
        tooltip: {
          y: {
            formatter: (value) => this.formatCount(value)
          }
        }
      }
    },

    // ตาราง — ทุกกลุ่ม (ไม่ตัด top N เหมือนกราฟ)
    tableRows() {
      return (this.productGroup.groups || []).map((g) => ({
        key: g.key,
        label: this.resolveGroupLabel(g),
        pieceQty: g.pieceQty || 0,
        percent: g.percent || 0,
        avgAgeDays: g.avgAgeDays || 0
      }))
    },

    tableColumns() {
      return [
        { field: 'label', header: this.$t('view.stock.product.dashboard.colGroup'), sortable: false, minWidth: '160px' },
        { field: 'pieceQty', header: this.$t('view.stock.product.dashboard.colPieceQty'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'percent', header: this.$t('view.stock.product.dashboard.colPercent'), sortable: false, minWidth: '90px', align: 'right' },
        {
          field: 'avgAgeDays',
          header: this.$t('view.stock.product.dashboard.colAvgAgeDays'),
          sortable: false,
          minWidth: '130px',
          align: 'right'
        }
      ]
    }
  },

  watch: {
    filter: {
      handler() {
        this.fetchData()
      },
      deep: true,
      immediate: true
    },

    groupBy() {
      this.fetchData()
    }
  },

  methods: {
    fetchData() {
      this.stockReportStore.fetchProductGroup(this.filter, this.groupBy)
    },

    resolveGroupLabel(group) {
      return group.key === '__UNKNOWN__' ? this.$t('common.label.notSpecified') : group.label
    },

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    formatPercent(value) {
      return `${new Intl.NumberFormat('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value || 0)}%`
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.section-card-block {
  margin-bottom: var(--sp-lg);
}

.group-by-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-lg);

  .title-text {
    white-space: nowrap;
    font-weight: 600;
    color: var(--base-font-color);
  }
}

.charts-row-b {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.result-footer {
  display: flex;
  align-items: center;
  width: 100%;
}

.result-footer-label {
  font-weight: 600;
  color: var(--base-font-color);
}
</style>
