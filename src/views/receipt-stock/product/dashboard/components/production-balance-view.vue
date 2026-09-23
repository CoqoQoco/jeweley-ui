<template>
  <SectionCardGeneric
    :title="$t('view.stock.product.dashboard.balanceTitle')"
    icon="bi-arrow-left-right"
    accent="green"
    headerStyle="legend"
    class="section-card-block"
  >
    <div class="group-by-row">
      <span class="title-text">{{ $t('view.stock.product.dashboard.groupByLabel') }}</span>
      <ToggleGroupGeneric v-model="groupBy" :options="groupByOptions" :ariaLabel="$t('view.stock.product.dashboard.groupByLabel')" />
    </div>

    <p class="summary-note">
      <i class="bi bi-exclamation-triangle"></i>
      {{ $t('view.stock.product.dashboard.balanceNote', { count: formatCount(productionBalance.totalSoldQty) }) }}
    </p>

    <div class="charts-row-b">
      <ChartGeneric type="bar" :series="rankingSeries" :options="rankingOptions" :height="360" :emptyText="$t('common.label.noData')" />

      <BaseDataTable :items="tableRows" :totalRecords="tableRows.length" :columns="tableColumns" :paginator="false" dataKey="key">
        <template #stockPercentTemplate="{ data }">
          <div class="text-right">{{ formatPercent(data.stockPercent) }}</div>
        </template>
        <template #soldPercentTemplate="{ data }">
          <div class="text-right">{{ formatPercent(data.soldPercent) }}</div>
        </template>
        <template #indexTemplate="{ data }">
          <div class="text-right">{{ formatIndex(data.index) }}</div>
        </template>
        <template #statusTemplate="{ data }">
          <div class="text-center">
            <span :class="['status-badge', statusBadgeClass(data.status)]">{{ statusLabel(data.status) }}</span>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <div class="alert-header">
      <span class="title-text">{{ $t('view.stock.product.dashboard.alertModeLabel') }}</span>
      <ToggleGroupGeneric v-model="alertMode" :options="alertModeOptions" :ariaLabel="$t('view.stock.product.dashboard.alertModeLabel')" />
      <ButtonGeneric
        variant="green"
        icon="bi-file-earmark-excel"
        class="alert-export-btn"
        :label="$t('view.stock.product.dashboard.exportExcelBtn')"
        @click="onExportAlerts"
      />
    </div>

    <div v-if="designAlerts.data.length" class="design-grid">
      <div v-for="item in designAlerts.data" :key="`${item.design}-${item.productNumber}`" class="design-card">
        <div class="design-card-image">
          <ImagePreview :imageName="item.imageBlobPath || ''" :width="160" :height="160" :preview="false" />
        </div>

        <div class="design-card-code">{{ item.design }}</div>
        <div class="design-card-type">{{ item.productNameTh }} · {{ item.productTypeName }}</div>

        <div class="design-card-stats">
          <span>{{ $t('view.stock.product.dashboard.alertSoldQty', { count: formatCount(item.soldQty) }) }}</span>
          <span>{{ $t('view.stock.product.dashboard.alertStockQty', { count: formatCount(item.stockQty) }) }}</span>
        </div>

        <div class="design-card-age">
          {{ formatAlertAge(item) }}
        </div>
      </div>
    </div>
    <p v-else class="design-empty">{{ $t('common.label.noData') }}</p>
  </SectionCardGeneric>
</template>

<script>
import { useStockReportApiStore } from '@/stores/modules/api/stock/stock-report-api.js'
import { formatExcelReport } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { splitAgeDays } from '@/services/utils/stock-age.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ImagePreview from '@/components/prime-vue/ImagePreview.vue'

// จำนวนกลุ่มสูงสุดที่แสดงเป็นแท่งในกราฟ ที่เหลือรวมเป็น "อื่นๆ" (ตารางยังโชว์ทุกกลุ่ม)
const MAX_RANKING_BARS = 12
// จำนวนการ์ดแบบที่ต้องดูแลที่ดึงมาแสดง — contract ยังไม่มี endpoint export/paging เพิ่มเติมสำหรับกริดนี้
const ALERT_TAKE = 20

const STATUS_MAP = {
  over: { i18nKey: 'statusOver', badgeClass: 'status-badge--red' },
  balanced: { i18nKey: 'statusBalanced', badgeClass: 'status-badge--grey' },
  under: { i18nKey: 'statusUnder', badgeClass: 'status-badge--green' },
  nosale: { i18nKey: 'statusNoSale', badgeClass: 'status-badge--light-grey' }
}

export default {
  name: 'StockProductDashboardProductionBalanceView',

  components: {
    SectionCardGeneric,
    ToggleGroupGeneric,
    ButtonGeneric,
    ChartGeneric,
    BaseDataTable,
    ImagePreview
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
      groupBy: 'productType',
      alertMode: 'low'
    }
  },

  computed: {
    productionBalance() {
      return this.stockReportStore.productionBalance
    },

    designAlerts() {
      return this.stockReportStore.designAlerts
    },

    groupByOptions() {
      return [
        { value: 'productType', label: this.$t('view.stock.product.dashboard.groupByProductType') },
        { value: 'gold', label: this.$t('view.stock.product.dashboard.groupByGold') },
        { value: 'goldSize', label: this.$t('view.stock.product.dashboard.groupByGoldSize') },
        { value: 'combined', label: this.$t('view.stock.product.dashboard.groupByCombined') }
      ]
    },

    alertModeOptions() {
      return [
        { value: 'low', label: this.$t('view.stock.product.dashboard.alertModeLow') },
        { value: 'over', label: this.$t('view.stock.product.dashboard.alertModeOver') }
      ]
    },

    // top N กลุ่ม + แถว "อื่นๆ" รวมส่วนที่เหลือ — สำหรับกราฟเท่านั้น (ตารางด้านล่างโชว์ทุกกลุ่ม)
    rankingRows() {
      const groups = this.productionBalance.groups || []
      const top = groups.slice(0, MAX_RANKING_BARS).map((g) => ({
        label: this.resolveGroupLabel(g),
        stockPercent: g.stockPercent || 0,
        soldPercent: g.soldPercent || 0
      }))

      if (groups.length > MAX_RANKING_BARS) {
        const rest = groups.slice(MAX_RANKING_BARS)
        const otherTotals = rest.reduce(
          (acc, g) => {
            acc.stockPercent += g.stockPercent || 0
            acc.soldPercent += g.soldPercent || 0
            return acc
          },
          { stockPercent: 0, soldPercent: 0 }
        )
        top.push({
          label: this.$t('view.stock.product.dashboard.otherGroupsLabel'),
          stockPercent: otherTotals.stockPercent,
          soldPercent: otherTotals.soldPercent
        })
      }

      return top
    },

    rankingSeries() {
      return [
        { name: this.$t('view.stock.product.dashboard.colStockPercent'), data: this.rankingRows.map((r) => r.stockPercent) },
        { name: this.$t('view.stock.product.dashboard.colSoldPercent'), data: this.rankingRows.map((r) => r.soldPercent) }
      ]
    },

    rankingOptions() {
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.green],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
        dataLabels: { enabled: false },
        xaxis: {
          categories: this.rankingRows.map((r) => r.label),
          labels: { style: { fontSize: '12px' } }
        },
        yaxis: {
          labels: { formatter: (v) => this.formatPercent(v) }
        },
        tooltip: {
          y: { formatter: (v) => this.formatPercent(v) }
        }
      }
    },

    tableRows() {
      return (this.productionBalance.groups || []).map((g) => ({
        key: g.key,
        label: this.resolveGroupLabel(g),
        stockPercent: g.stockPercent || 0,
        soldPercent: g.soldPercent || 0,
        index: g.index === undefined ? null : g.index,
        status: g.status
      }))
    },

    tableColumns() {
      return [
        { field: 'label', header: this.$t('view.stock.product.dashboard.colGroup'), sortable: false, minWidth: '160px' },
        { field: 'stockPercent', header: this.$t('view.stock.product.dashboard.colStockPercent'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'soldPercent', header: this.$t('view.stock.product.dashboard.colSoldPercent'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'index', header: this.$t('view.stock.product.dashboard.colIndex'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'status', header: this.$t('view.stock.product.dashboard.colStatus'), sortable: false, minWidth: '120px', align: 'center' }
      ]
    }
  },

  watch: {
    filter: {
      handler() {
        this.fetchBalance()
        this.fetchAlerts()
      },
      deep: true,
      immediate: true
    },

    groupBy() {
      this.fetchBalance()
    },

    alertMode() {
      this.fetchAlerts()
    }
  },

  methods: {
    fetchBalance() {
      this.stockReportStore.fetchProductionBalance(this.filter, this.groupBy)
    },

    fetchAlerts() {
      this.stockReportStore.fetchDesignAlerts(this.filter, { mode: this.alertMode, skip: 0, take: ALERT_TAKE })
    },

    resolveGroupLabel(group) {
      return group.key === '__UNKNOWN__' ? this.$t('common.label.notSpecified') : group.label
    },

    statusLabel(status) {
      const meta = STATUS_MAP[status]
      return meta ? this.$t(`view.stock.product.dashboard.${meta.i18nKey}`) : status || '-'
    },

    statusBadgeClass(status) {
      const meta = STATUS_MAP[status]
      return meta ? meta.badgeClass : 'status-badge--grey'
    },

    ageYears(ageDays) {
      return splitAgeDays(ageDays).years
    },

    // stockQty === 0 (ของหมดสต็อกไปแล้ว) → backend ส่ง ageDays: 0 มาจริงๆ เพราะไม่มีชิ้นให้คิดอายุ
    // ถ้าโชว์ "0 ปี" ตรงๆ จะอ่านเข้าใจผิดว่าเป็นของใหม่ — โชว์ '—' แทน
    // ของที่ยังมีสต็อกแต่อายุไม่ถึง 1 ปี (years === 0) ก็เจออาการเดียวกัน ("0 ปี") — โชว์เป็นเดือนแทน
    // (การ์ดพื้นที่น้อย ไม่ใส่เดือนต่อท้ายปีเหมือนตาราง "รายชิ้นค้างนาน")
    formatAlertAge(item) {
      if (!item.stockQty) return '—'

      const { years, months } = splitAgeDays(item.ageDays)
      if (years > 0) return this.$t('view.stock.product.dashboard.alertAgeYears', { years })
      if (months > 0) return this.$t('view.stock.product.dashboard.alertAgeMonths', { months })
      return this.$t('view.stock.product.dashboard.alertAgeLessThanMonth')
    },

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    formatPercent(value) {
      return `${new Intl.NumberFormat('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value || 0)}%`
    },

    formatIndex(value) {
      if (value === null || value === undefined) return '—'
      return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    },

    onExportAlerts() {
      if (!this.designAlerts.data || !this.designAlerts.data.length) {
        warning(this.$t('common.label.noData'))
        return
      }

      const dataExcel = this.designAlerts.data.map((item) => ({
        design: item.design,
        productNameTh: item.productNameTh,
        productTypeName: item.productTypeName,
        productionType: item.productionType,
        productionTypeSize: item.productionTypeSize,
        soldQty: item.soldQty,
        stockQty: item.stockQty,
        // stockQty === 0 → ไม่มีชิ้นให้คิดอายุจริง (ดู formatAlertAge) เว้นว่างกันอ่านผิดว่า "0 ปี" = ของใหม่
        ageYears: item.stockQty ? this.ageYears(item.ageDays) : ''
      }))

      ExcelHelper.exportToExcel(dataExcel, {
        filename: `${this.$t('view.stock.product.dashboard.alertExportFileName')}[${formatExcelReport()}].xlsx`,
        sheetName: this.$t('view.stock.product.dashboard.alertExportFileName'),
        columns: [
          { header: this.$t('view.stock.product.dashboard.colDesign'), key: 'design' },
          { header: this.$t('view.stock.product.dashboard.colProductName'), key: 'productNameTh' },
          { header: this.$t('view.stock.product.dashboard.colProductType'), key: 'productTypeName' },
          { header: this.$t('view.stock.product.dashboard.colGold'), key: 'productionType' },
          { header: this.$t('view.stock.product.dashboard.colGoldSize'), key: 'productionTypeSize' },
          { header: this.$t('view.stock.product.dashboard.colSoldQty'), key: 'soldQty' },
          { header: this.$t('view.stock.product.dashboard.colStockQty'), key: 'stockQty' },
          { header: this.$t('view.stock.product.dashboard.colAgeYears'), key: 'ageYears' }
        ]
      })
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
  margin-bottom: var(--sp-md);

  .title-text {
    white-space: nowrap;
    font-weight: 600;
    color: var(--base-font-color);
  }
}

.summary-note {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  margin: 0 0 var(--sp-lg);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.charts-row-b {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md);
  margin-bottom: var(--sp-xl);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.status-badge {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--on-inverse);

  &--green {
    background: var(--base-green);
  }

  &--red {
    background: var(--base-red);
  }

  &--grey {
    background: var(--base-sub-color);
  }

  &--light-grey {
    background: var(--color-highlight-bg);
    color: var(--base-sub-color);
  }
}

.alert-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-lg);

  .title-text {
    white-space: nowrap;
    font-weight: 600;
    color: var(--base-font-color);
  }
}

.alert-export-btn {
  margin-left: auto;
}

.design-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.design-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  background: var(--color-card-bg);
  padding: var(--sp-md);

  :deep(.p-image) {
    display: flex;
    width: 100%;
    height: 100%;
  }

  :deep(.p-image img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.design-card-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  margin-bottom: var(--sp-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-highlight-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.design-card-code {
  font-weight: 700;
  color: var(--base-font-color);
  text-align: center;
}

.design-card-type {
  text-align: center;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
  margin-bottom: var(--sp-sm);
}

.design-card-stats {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-font-color);
  margin-bottom: var(--sp-xs);
}

.design-card-age {
  text-align: center;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.design-empty {
  text-align: center;
  color: var(--base-sub-color);
  padding: var(--sp-2xl) 0;
  margin: 0;
}
</style>
