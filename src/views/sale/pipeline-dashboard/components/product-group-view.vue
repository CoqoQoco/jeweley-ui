<template>
  <SectionCardGeneric
    :title="$t('view.sale.pipelineDashboard.productGroupTitle')"
    icon="bi-trophy"
    accent="green"
    headerStyle="legend"
    class="section-card-block"
  >
    <div class="group-by-row">
      <span class="title-text">{{ $t('view.sale.pipelineDashboard.groupByLabel') }}</span>
      <ToggleGroupGeneric v-model="groupBy" :options="groupByOptions" :ariaLabel="$t('view.sale.pipelineDashboard.groupByLabel')" />
    </div>

    <div class="filter-row-3">
      <div>
        <span class="title-text">{{ $t('view.sale.pipelineDashboard.filterProductTypeLabel') }}</span>
        <MultiSelectGeneric
          v-model="productTypes"
          :options="productTypeOptions"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>
      <div>
        <span class="title-text">{{ $t('view.sale.pipelineDashboard.filterGoldLabel') }}</span>
        <MultiSelectGeneric
          v-model="golds"
          :options="goldOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>
      <div>
        <span class="title-text">{{ $t('view.sale.pipelineDashboard.filterGoldSizeLabel') }}</span>
        <MultiSelectGeneric
          v-model="goldSizes"
          :options="goldSizeOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>
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
        <template #pieceCountTemplate="{ data }">
          <div class="text-right">{{ formatCount(data.pieceCount) }}</div>
        </template>
        <template #amountThbTemplate="{ data }">
          <div class="text-right">{{ formatMoneyValue(data.amountThb) }}</div>
        </template>
        <template #percentTemplate="{ data }">
          <div class="text-right">{{ formatPercent(data.percent) }}</div>
        </template>

        <template #footer>
          <div class="result-footer">
            <span class="result-footer-label">
              {{
                $t('view.sale.pipelineDashboard.tableTotalLabel', {
                  pieces: formatCount(productGroup.totalPieceCount),
                  amount: formatMoneyValue(productGroup.totalAmountThb)
                })
              }}
            </span>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <topDesignGrid :filter="filter" :productTypes="productTypes" :golds="golds" :goldSizes="goldSizes" />

    <p class="summary-note">
      <i class="bi bi-info-circle"></i>
      {{ $t('view.sale.pipelineDashboard.productGroupNote') }}
    </p>
  </SectionCardGeneric>
</template>

<script>
import { useSaleReportApiStore } from '@/stores/modules/api/sale/sale-report-api.js'
import { formatMoney } from '@/services/utils/decimal.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import topDesignGrid from './top-design-grid.vue'

// จำนวนกลุ่มสูงสุดที่แสดงเป็นแท่งในกราฟอันดับ ที่เหลือรวมเป็น "อื่นๆ" (ตาราง #footer ยังโชว์ทุกกลุ่ม)
const MAX_RANKING_BARS = 12
const RANKING_BAR_MIN_HEIGHT = 200
const RANKING_BAR_ROW_HEIGHT = 34

export default {
  name: 'SalePipelineDashboardProductGroupView',

  components: {
    SectionCardGeneric,
    ToggleGroupGeneric,
    MultiSelectGeneric,
    ChartGeneric,
    BaseDataTable,
    topDesignGrid
  },

  setup() {
    const saleReportStore = useSaleReportApiStore()
    return { saleReportStore }
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      groupBy: 'productType',
      productTypes: [],
      golds: [],
      goldSizes: []
    }
  },

  computed: {
    productGroup() {
      return this.saleReportStore.productGroup
    },

    groupByOptions() {
      return [
        { value: 'productType', label: this.$t('view.sale.pipelineDashboard.groupByProductType') },
        { value: 'gold', label: this.$t('view.sale.pipelineDashboard.groupByGold') },
        { value: 'goldSize', label: this.$t('view.sale.pipelineDashboard.groupByGoldSize') },
        { value: 'combined', label: this.$t('view.sale.pipelineDashboard.groupByCombined') }
      ]
    },

    productTypeOptions() {
      return this.productGroup.filterOptions.productTypes || []
    },

    goldOptions() {
      return (this.productGroup.filterOptions.golds || []).map((g) => ({ value: g, label: g }))
    },

    goldSizeOptions() {
      return (this.productGroup.filterOptions.goldSizes || []).map((g) => ({ value: g, label: g }))
    },

    // top N กลุ่ม (groups มาเรียง pieceCount desc จาก backend อยู่แล้ว) + แถว "อื่นๆ" รวมส่วนที่เหลือ — สำหรับกราฟอันดับเท่านั้น
    rankingRows() {
      const groups = this.productGroup.groups || []
      const top = groups.slice(0, MAX_RANKING_BARS).map((g) => ({
        label: this.resolveGroupLabel(g),
        pieceCount: g.pieceCount || 0,
        amountThb: g.amountThb || 0
      }))

      if (groups.length > MAX_RANKING_BARS) {
        const rest = groups.slice(MAX_RANKING_BARS)
        const otherTotals = rest.reduce(
          (acc, g) => {
            acc.pieceCount += g.pieceCount || 0
            acc.amountThb += g.amountThb || 0
            return acc
          },
          { pieceCount: 0, amountThb: 0 }
        )
        top.push({
          label: this.$t('view.sale.pipelineDashboard.otherGroupsLabel'),
          pieceCount: otherTotals.pieceCount,
          amountThb: otherTotals.amountThb
        })
      }

      return top
    },

    rankingSeries() {
      return [
        {
          name: this.$t('view.sale.pipelineDashboard.colPieceCount'),
          data: this.rankingRows.map((r) => ({ x: r.label, y: r.pieceCount }))
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
        // gotcha ApexCharts (ดู overview-tab-view.vue): horizontal bar — xaxis ยังคือแกนตัวเลข (pieceCount)
        // ชื่อกลุ่มมาจาก data point {x,y} ไม่ใช่ xaxis.categories
        xaxis: {
          title: { text: this.$t('view.sale.pipelineDashboard.colPieceCount') },
          labels: { formatter: (v) => this.formatCount(v) }
        },
        yaxis: {
          labels: { style: { fontSize: '12px' } }
        },
        grid: { xaxis: { lines: { show: true } } },
        tooltip: {
          y: {
            formatter: (value, opts) => {
              const dataPointIndex = opts && typeof opts.dataPointIndex === 'number' ? opts.dataPointIndex : -1
              const row = this.rankingRows[dataPointIndex]
              if (!row) return this.formatCount(value)
              return this.$t('view.sale.pipelineDashboard.chartTooltip', {
                pieces: this.formatCount(row.pieceCount),
                amount: this.formatMoneyValue(row.amountThb)
              })
            }
          }
        }
      }
    },

    // ตาราง — ทุกกลุ่ม (ไม่ตัด top N เหมือนกราฟ)
    tableRows() {
      const total = this.productGroup.totalPieceCount || 0
      return (this.productGroup.groups || []).map((g) => ({
        key: g.key,
        label: this.resolveGroupLabel(g),
        pieceCount: g.pieceCount || 0,
        amountThb: g.amountThb || 0,
        percent: total > 0 ? ((g.pieceCount || 0) / total) * 100 : 0
      }))
    },

    tableColumns() {
      return [
        { field: 'label', header: this.$t('view.sale.pipelineDashboard.colGroup'), sortable: false, minWidth: '160px' },
        { field: 'pieceCount', header: this.$t('view.sale.pipelineDashboard.colPieceCount'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'amountThb', header: this.$t('view.sale.pipelineDashboard.colAmountThb'), sortable: false, minWidth: '130px', align: 'right' },
        { field: 'percent', header: this.$t('view.sale.pipelineDashboard.colPercent'), sortable: false, minWidth: '110px', align: 'right' }
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
    },

    productTypes: {
      handler() {
        this.fetchData()
      },
      deep: true
    },

    golds: {
      handler() {
        this.fetchData()
      },
      deep: true
    },

    goldSizes: {
      handler() {
        this.fetchData()
      },
      deep: true
    }
  },

  methods: {
    fetchData() {
      this.saleReportStore.fetchProductGroupSales(this.filter, {
        groupBy: this.groupBy,
        productTypes: this.productTypes,
        golds: this.golds,
        goldSizes: this.goldSizes
      })
    },

    resolveGroupLabel(group) {
      return group.key === '__UNKNOWN__' ? this.$t('common.label.notSpecified') : group.label
    },

    formatMoneyValue(value) {
      return formatMoney(value)
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

.filter-row-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-lg);
  margin-bottom: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.charts-row-b {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);

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

.summary-note {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  margin: 0;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}
</style>
