<template>
  <div class="monthly-success-report">
    <!-- Month Selection -->
    <div class="filter-container">
      <div>
        <div class="title-text">{{ $t('view.production.dashboard.selectMonth') }}</div>
        <div class="form-col-container">
          <CalendarGeneric
            v-model="selectedMonth"
            view="month"
            dateFormat="MM - yy"
            showIcon
            showButtonBar
            :manualInput="false"
            @date-select="onMonthChange"
            :class="{ 'p-invalid': !selectedMonth }"
            class="mr-2"
            :placeholder="$t('view.production.dashboard.placeholderMonth')"
          />
          <div></div>
          <div></div>
          <div class="d-flex align-items-end justify-content-end">
            <ButtonGeneric
              variant="green"
              icon="bi-search"
              :label="$t('common.btn.search')"
              :loading="isMonthlyLoading"
              :disabled="!selectedMonth"
              class="ml-2"
              @click="loadMonthlyReport"
            />
          </div>
        </div>
      </div>

      <div class=" ml-2 mt-1" v-if="selectedMonth">
        <small class="text-muted">
          <i class="bi bi-calendar"></i>
          {{ $t('view.production.dashboard.selectedMonth') }} {{ formatMonthYear(selectedMonth) }}
          <span v-if="monthlyReportData">
            | {{ $t('view.production.dashboard.goldType2') }} {{ planFinishByType.length }} | {{ $t('view.production.dashboard.productType2') }}
            {{ planFinishByProductType.length }} | {{ $t('view.production.dashboard.customerType2') }}
            {{ planFinishByCustomerType.length }}
          </span>
        </small>
      </div>
    </div>

    <!-- Monthly Report Content -->
    <div v-if="monthlyReportData" class="monthly-report-content mt-4">
      <div v-for="section in sections" :key="section.key" class="responsive-grid-2col report-section-row">
        <SectionCardGeneric :title="section.chartTitle" icon="bi-bar-chart" accent="main" headerStyle="legend">
          <ChartGeneric
            type="bar"
            :series="[{ name: $t('view.production.dashboard.countLabel'), data: section.rows.map((r) => r.count) }]"
            :options="chartOptions(section)"
            :height="300"
            :emptyText="$t('common.label.noData')"
          />
        </SectionCardGeneric>

        <SectionCardGeneric :title="section.tableTitle" icon="bi-table" accent="main" headerStyle="legend">
          <BaseDataTable :items="section.rows" :columns="tableColumns(section)" :paginator="false" dataKey="name">
            <template #countTemplate="{ data }">
              <span class="badge-count">{{ data.count }}</span>
            </template>
            <template #totalQtyTemplate="{ data }">
              {{ data.totalQty }} {{ $t('view.production.dashboard.unitPiece') }}
            </template>
            <template #percentageTemplate="{ data }">
              <span class="badge-count">{{ data.percentage }}%</span>
            </template>
          </BaseDataTable>
        </SectionCardGeneric>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="placeholder-content">
        <i class="bi bi-calendar-month"></i>
        <h4>{{ $t('view.production.dashboard.monthlyReport') }}</h4>
        <p>{{ $t('view.production.dashboard.selectMonth') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { useProductionMonthlyReportApiStore } from '@/stores/modules/api/plan/monthly-report-store-api.js'
import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import { warning } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'MonthlySuccessReport',
  components: {
    CalendarGeneric,
    ChartGeneric,
    BaseDataTable,
    SectionCardGeneric,
    ButtonGeneric
  },
  setup() {
    const monthlyReportApiStore = useProductionMonthlyReportApiStore()
    return {
      monthlyReportApiStore
    }
  },
  data() {
    return {
      selectedMonth: new Date() // Current month for the month picker
    }
  },
  computed: {
    // Monthly Report Computed Properties
    monthlyReportData() {
      return this.monthlyReportApiStore.getMonthlyReportData
    },
    planFinishByType() {
      return this.monthlyReportApiStore.getPlanFinishByType
    },
    planFinishByProductType() {
      return this.monthlyReportApiStore.getPlanFinishByProductType
    },
    planFinishByCustomerType() {
      return this.monthlyReportApiStore.getPlanFinishByCustomerType
    },
    isMonthlyLoading() {
      return this.monthlyReportApiStore.getIsLoading
    },
    sections() {
      return [
        {
          key: 'gold',
          chartTitle: this.$t('view.production.dashboard.chartTitleGold'),
          tableTitle: this.$t('view.production.dashboard.tableDetailGold'),
          nameHeader: this.$t('view.production.dashboard.colGoldType'),
          rows: this.planFinishByType.map((item) => ({
            name: item.typeName || item.type,
            count: item.count,
            totalQty: item.totalQty,
            percentage: item.percentage
          }))
        },
        {
          key: 'product',
          chartTitle: this.$t('view.production.dashboard.chartTitleProduct'),
          tableTitle: this.$t('view.production.dashboard.tableDetailProduct'),
          nameHeader: this.$t('view.production.dashboard.colProductType'),
          rows: this.planFinishByProductType.map((item) => ({
            name: item.productTypeName || item.productType,
            count: item.count,
            totalQty: item.totalQty,
            percentage: item.percentage
          }))
        },
        {
          key: 'customer',
          chartTitle: this.$t('view.production.dashboard.chartTitleCustomer'),
          tableTitle: this.$t('view.production.dashboard.tableDetailCustomer'),
          nameHeader: this.$t('view.production.dashboard.colCustomerType'),
          rows: this.planFinishByCustomerType.map((item) => ({
            name: item.customerTypeName || item.customerType,
            count: item.count,
            totalQty: item.totalQty,
            percentage: item.percentage
          }))
        }
      ]
    }
  },
  methods: {
    // Monthly Report Methods
    onMonthChange(event) {
      this.selectedMonth = event
    },

    async loadMonthlyReport() {
      if (!this.selectedMonth) {
        warning(this.$t('view.production.dashboard.validationSelectMonth'))
        return
      }

      await this.monthlyReportApiStore.fetchMonthlyReport(true, {
        selectedMonth: this.selectedMonth
      })
    },

    formatMonthYear(date) {
      if (!date) return ''
      return dayjs(date).format('MM/YYYY')
    },

    tableColumns(section) {
      return [
        { field: 'name', header: section.nameHeader, sortable: false },
        { field: 'count', header: this.$t('view.production.dashboard.colProductCount'), align: 'center', sortable: false },
        { field: 'totalQty', header: this.$t('view.production.dashboard.colOrderCount2'), align: 'center', sortable: false },
        { field: 'percentage', header: this.$t('view.production.dashboard.colPercent'), align: 'center', sortable: false }
      ]
    },

    chartOptions(section) {
      return {
        plotOptions: { bar: { horizontal: true } },
        xaxis: { categories: section.rows.map((r) => r.name) }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.monthly-success-report {
  .monthly-report-content {
    .report-section-row {
      margin-bottom: var(--sp-2xl);
    }

    :deep(.badge-count) {
      background-color: var(--base-green);
      color: #ffffff;
      padding: var(--sp-xs) var(--sp-sm);
      border-radius: var(--radius-lg);
      font-size: var(--fs-sm);
      font-weight: 500;
    }
  }

  // Empty State
  .empty-state {
    background: var(--color-card-bg);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: 60px 20px;
    text-align: center;

    .placeholder-content {
      i {
        font-size: 64px;
        color: $base-sub-color;
        margin-bottom: 20px;
      }

      h4 {
        color: $base-font-color;
        margin-bottom: 10px;
      }

      p {
        color: $base-sub-color;
        margin: 0;
      }
    }
  }
}
</style>
