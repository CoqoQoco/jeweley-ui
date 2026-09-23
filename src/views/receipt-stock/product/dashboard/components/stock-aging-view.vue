<template>
  <SectionCardGeneric
    :title="$t('view.stock.product.dashboard.agingTitle')"
    icon="bi-hourglass-bottom"
    accent="warning"
    headerStyle="legend"
    class="section-card-block"
  >
    <div class="group-by-row">
      <span class="title-text">{{ $t('view.stock.product.dashboard.agingThresholdLabel') }}</span>
      <ToggleGroupGeneric v-model="thresholdYears" :options="thresholdOptions" :ariaLabel="$t('view.stock.product.dashboard.agingThresholdLabel')" />
    </div>

    <div class="charts-row-b">
      <ChartGeneric type="bar" :series="bucketSeries" :options="bucketOptions" :height="320" :emptyText="$t('common.label.noData')" />

      <BaseDataTable :items="topGroupsRows" :totalRecords="topGroupsRows.length" :columns="topGroupsColumns" :paginator="false" dataKey="key">
        <template #pieceQtyTemplate="{ data }">
          <div class="text-right">{{ formatCount(data.pieceQty) }}</div>
        </template>
        <template #agedQtyTemplate="{ data }">
          <div class="text-right">{{ formatCount(data.agedQty) }}</div>
        </template>
        <template #agedPercentTemplate="{ data }">
          <div class="text-right">{{ formatPercent(data.agedPercent) }}</div>
        </template>
      </BaseDataTable>
    </div>

    <div class="items-header">
      <h6 class="items-title">{{ $t('view.stock.product.dashboard.agingItemsTitle') }}</h6>
      <ButtonGeneric variant="green" icon="bi-file-earmark-excel" :label="$t('view.stock.product.dashboard.exportExcelBtn')" @click="onExportExcel" />
    </div>

    <BaseDataTable
      :items="agingItems.data"
      :totalRecords="agingItems.total"
      :columns="itemColumns"
      :perPage="take"
      dataKey="stockNumber"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #imageTemplate="{ data }">
        <ImagePreview :imageName="data.imageBlobPath || ''" :width="50" :height="50" :preview="true" />
      </template>

      <template #stockNumberTemplate="{ data }">
        <router-link
          v-if="canViewStockDetail"
          :to="{ name: 'stock-product-detail', params: { stockNumber: data.stockNumber } }"
          class="stock-number-link"
        >
          <strong>{{ data.stockNumberOrigin || data.stockNumber }}</strong>
          <br v-if="data.stockNumberOrigin" />
          <small v-if="data.stockNumberOrigin" class="text-muted">{{ data.stockNumber }}</small>
        </router-link>
        <div v-else>
          <strong>{{ data.stockNumberOrigin || data.stockNumber }}</strong>
          <br v-if="data.stockNumberOrigin" />
          <small v-if="data.stockNumberOrigin" class="text-muted">{{ data.stockNumber }}</small>
        </div>
      </template>

      <template #ageDaysTemplate="{ data }">
        {{ formatAge(data.ageDays) }}
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { useStockReportApiStore } from '@/stores/modules/api/stock/stock-report-api.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { formatDate, formatExcelReport } from '@/services/utils/dayjs.js'
import { ExcelHelper } from '@/services/utils/excel-js.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { splitAgeDays } from '@/services/utils/stock-age.js'
import { PermissionService } from '@/services/permission/permission.js'
import { PERMISSIONS } from '@/services/permission/config.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ImagePreview from '@/components/prime-vue/ImagePreview.vue'

export default {
  name: 'StockProductDashboardStockAgingView',

  mixins: [dataTablePaging],

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
    const authStore = useAuthStore()
    return { stockReportStore, authStore }
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      thresholdYears: 2,
      take: 50
    }
  },

  computed: {
    canViewStockDetail() {
      const permissionService = new PermissionService(this.authStore.getUser, this.authStore.permissions)
      return permissionService.hasPermission(PERMISSIONS.STOCK_PRODUCT)
    },

    aging() {
      return this.stockReportStore.aging
    },

    agingItems() {
      return this.stockReportStore.agingItems
    },

    thresholdOptions() {
      return [
        { value: 1, label: this.$t('view.stock.product.dashboard.agingThresholdOver1') },
        { value: 2, label: this.$t('view.stock.product.dashboard.agingThresholdOver2') },
        { value: 3, label: this.$t('view.stock.product.dashboard.agingThresholdOver3') },
        { value: 5, label: this.$t('view.stock.product.dashboard.agingThresholdOver5') }
      ]
    },

    bucketRows() {
      return (this.aging.buckets || []).map((b) => ({ ...b, label: this.bucketLabel(b) }))
    },

    bucketSeries() {
      return [
        {
          name: this.$t('view.stock.product.dashboard.colPieceQty'),
          data: this.bucketRows.map((b) => b.pieceQty || 0)
        }
      ]
    },

    bucketOptions() {
      return {
        chart: { type: 'bar', toolbar: { show: false } },
        colors: [CHART_TOKENS.warning],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
        dataLabels: {
          enabled: true,
          formatter: (v) => this.formatCount(v),
          style: { fontSize: '12px', fontWeight: 600, colors: [CHART_TOKENS.sub] }
        },
        xaxis: {
          categories: this.bucketRows.map((b) => b.label),
          labels: { style: { fontSize: '12px' } }
        },
        yaxis: {
          labels: { formatter: (v) => this.formatCount(v) }
        },
        tooltip: {
          y: { formatter: (v) => this.formatCount(v) }
        }
      }
    },

    topGroupsRows() {
      return (this.aging.topGroups || []).map((g) => ({
        key: g.key,
        label: this.resolveGroupLabel(g),
        pieceQty: g.pieceQty || 0,
        agedQty: g.agedQty || 0,
        agedPercent: g.agedPercent || 0
      }))
    },

    topGroupsColumns() {
      return [
        { field: 'label', header: this.$t('view.stock.product.dashboard.colGroup'), sortable: false, minWidth: '160px' },
        {
          field: 'pieceQty',
          header: this.$t('view.stock.product.dashboard.colTotalPieces'),
          sortable: false,
          minWidth: '110px',
          align: 'right'
        },
        {
          field: 'agedQty',
          header: this.$t('view.stock.product.dashboard.colAgedPieces'),
          sortable: false,
          minWidth: '110px',
          align: 'right'
        },
        {
          field: 'agedPercent',
          header: this.$t('view.stock.product.dashboard.colAgedPercent'),
          sortable: false,
          minWidth: '90px',
          align: 'right'
        }
      ]
    },

    itemColumns() {
      return [
        { field: 'image', header: this.$t('view.stock.product.dashboard.colImage'), sortable: false, minWidth: '70px', align: 'center' },
        { field: 'stockNumber', header: this.$t('view.stock.product.dashboard.colStockNumber'), sortable: false, minWidth: '150px' },
        { field: 'design', header: this.$t('view.stock.product.dashboard.colDesign'), sortable: false, minWidth: '110px' },
        { field: 'productNameTh', header: this.$t('view.stock.product.dashboard.colProductName'), sortable: false, minWidth: '160px' },
        { field: 'productTypeName', header: this.$t('view.stock.product.dashboard.colProductType'), sortable: false, minWidth: '110px' },
        { field: 'productionType', header: this.$t('view.stock.product.dashboard.colGold'), sortable: false, minWidth: '90px' },
        { field: 'productionTypeSize', header: this.$t('view.stock.product.dashboard.colGoldSize'), sortable: false, minWidth: '90px' },
        { field: 'locationName', header: this.$t('view.stock.product.dashboard.colLocation'), sortable: false, minWidth: '110px' },
        { field: 'productionDate', header: this.$t('view.stock.product.dashboard.colProductionDate'), sortable: false, minWidth: '110px', format: 'date' },
        { field: 'ageDays', header: this.$t('view.stock.product.dashboard.colAge'), sortable: false, minWidth: '120px' }
      ]
    }
  },

  watch: {
    filter: {
      handler() {
        this.onFilterChanged()
      },
      deep: true,
      immediate: true
    },

    thresholdYears() {
      this.onFilterChanged()
    }
  },

  methods: {
    onFilterChanged() {
      this.skip = 0
      this.fetchAgingSummary()
      this.fetchData()
    },

    fetchAgingSummary() {
      this.stockReportStore.fetchAging(this.filter, { thresholdYears: this.thresholdYears })
    },

    async fetchData() {
      await this.stockReportStore.fetchAgingItems(this.filter, {
        thresholdYears: this.thresholdYears,
        skip: this.skip,
        take: this.take
      })
    },

    resolveGroupLabel(group) {
      return group.key === '__UNKNOWN__' ? this.$t('common.label.notSpecified') : group.label
    },

    bucketLabel(bucket) {
      return this.$t(`view.stock.product.dashboard.ageBucket.${bucket.key}`)
    },

    formatAge(ageDays) {
      if (ageDays === null || ageDays === undefined) return '-'
      const { years, months } = splitAgeDays(ageDays)
      return this.$t('view.stock.product.dashboard.ageYearsMonths', { years, months })
    },

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    formatPercent(value) {
      return `${new Intl.NumberFormat('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value || 0)}%`
    },

    // ตัวเลข export = รายการที่โหลดอยู่ในหน้าปัจจุบัน (skip/take 50) — ยังไม่มี endpoint export ทั้งหมดจาก backend
    onExportExcel() {
      if (!this.agingItems.data || !this.agingItems.data.length) {
        warning(this.$t('common.label.noData'))
        return
      }

      const dataExcel = this.agingItems.data.map((item) => ({
        stockNumber: item.stockNumberOrigin || item.stockNumber,
        design: item.design,
        productNameTh: item.productNameTh,
        productTypeName: item.productTypeName,
        productionType: item.productionType,
        productionTypeSize: item.productionTypeSize,
        locationName: item.locationName,
        productionDate: item.productionDate ? formatDate(item.productionDate) : '',
        age: this.formatAge(item.ageDays)
      }))

      ExcelHelper.exportToExcel(dataExcel, {
        filename: `${this.$t('view.stock.product.dashboard.agingItemsExportFileName')}[${formatExcelReport()}].xlsx`,
        sheetName: this.$t('view.stock.product.dashboard.agingItemsExportFileName'),
        columns: [
          { header: this.$t('view.stock.product.dashboard.colStockNumber'), key: 'stockNumber' },
          { header: this.$t('view.stock.product.dashboard.colDesign'), key: 'design' },
          { header: this.$t('view.stock.product.dashboard.colProductName'), key: 'productNameTh' },
          { header: this.$t('view.stock.product.dashboard.colProductType'), key: 'productTypeName' },
          { header: this.$t('view.stock.product.dashboard.colGold'), key: 'productionType' },
          { header: this.$t('view.stock.product.dashboard.colGoldSize'), key: 'productionTypeSize' },
          { header: this.$t('view.stock.product.dashboard.colLocation'), key: 'locationName' },
          { header: this.$t('view.stock.product.dashboard.colProductionDate'), key: 'productionDate' },
          { header: this.$t('view.stock.product.dashboard.colAge'), key: 'age' }
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
  margin-bottom: var(--sp-xl);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);
}

.items-title {
  margin: 0;
  color: var(--base-font-color);
  font-weight: 600;
  font-size: var(--fs-lg);
}

.stock-number-link {
  color: var(--base-font-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
