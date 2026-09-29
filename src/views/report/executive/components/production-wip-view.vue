<template>
  <SectionCardGeneric :title="$t('view.executive.production.title')" icon="bi-diagram-3" accent="main" headerStyle="legend" class="section-card-block">
    <div class="charts-row">
      <div class="chart-block">
        <h6 class="chart-title">{{ $t('view.executive.production.byDepartmentTitle') }}</h6>
        <DepartmentWipChart :departments="productionWip.departments" />
      </div>
      <div class="chart-block">
        <h6 class="chart-title">{{ $t('view.executive.production.monthlyCompletedTitle') }}</h6>
        <MonthlyCompletedChart :monthlyCompleted="productionWip.monthlyCompleted" />
      </div>
    </div>

    <div class="filter-row">
      <div>
        <span class="title-text">{{ $t('view.executive.production.filterDepartment') }}</span>
        <MultiSelectGeneric
          v-model="departmentKeys"
          :options="departmentOptionsList"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('common.label.all')"
          :showClear="true"
        />
      </div>
      <div>
        <span class="title-text">{{ $t('view.executive.production.filterMinDays') }}</span>
        <InputTextGeneric v-model.number="minDays" type="number" :min="0" />
      </div>
    </div>

    <h6 class="table-title">{{ $t('view.executive.production.tableTitle') }}</h6>
    <BaseDataTable :items="stalePlans.data" :totalRecords="stalePlans.total" :columns="columns" :perPage="take" dataKey="planId" @page="handlePageChange" @sort="handleSortChange">
      <template #woTemplate="{ data }">
        {{ data.woText || data.woNumber || data.wo }}
      </template>

      <template #productTemplate="{ data }">
        <strong>{{ data.productNumber }}</strong>
        <br v-if="data.productName" />
        <small v-if="data.productName" class="text-muted">{{ data.productName }}</small>
      </template>

      <template #departmentTemplate="{ data }">
        {{ departmentLabelMap[data.departmentKey] || data.departmentKey }}
        <br />
        <small class="text-muted">{{ data.statusName }}</small>
      </template>

      <template #createDateTemplate="{ data }">
        {{ formatDate(data.createDate) }}
      </template>

      <template #lastMoveDateTemplate="{ data }">
        {{ formatDate(data.lastMoveDate) }}
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { useExecutiveReportApiStore } from '@/stores/modules/api/report/executive-report-api.js'
import { formatDate } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import DepartmentWipChart from '@/views/production/insight/components/department-wip-chart.vue'
import MonthlyCompletedChart from '@/views/production/insight/components/monthly-completed-chart.vue'

const DEPARTMENT_KEYS = ['design', 'trim', 'rawPolish', 'gemSort', 'setting', 'plating', 'costCard']

export default {
  name: 'ExecutiveProductionWipView',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    BaseDataTable,
    MultiSelectGeneric,
    InputTextGeneric,
    DepartmentWipChart,
    MonthlyCompletedChart
  },

  setup() {
    const executiveReportStore = useExecutiveReportApiStore()
    return { executiveReportStore }
  },

  props: {
    filter: {
      type: Object,
      default: () => ({ departmentKeys: [], minDays: 180 })
    },
    refreshToken: {
      type: Number,
      default: 0
    }
  },

  emits: ['update:filter'],

  data() {
    return {
      departmentKeys: [...(this.filter.departmentKeys || [])],
      minDays: this.filter.minDays || 180,
      productionWip: { departments: [], monthlyCompleted: [] },
      stalePlans: { data: [], total: 0 }
    }
  },

  computed: {
    departmentLabelMap() {
      const map = {}
      DEPARTMENT_KEYS.forEach((key) => {
        map[key] = this.$t(`view.executive.department.${key}`)
      })
      return map
    },

    departmentOptionsList() {
      return DEPARTMENT_KEYS.map((key) => ({ value: key, label: this.departmentLabelMap[key] }))
    },

    columns() {
      return [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'mold', header: this.$t('view.executive.production.colMold'), sortable: false, minWidth: '110px' },
        { field: 'product', header: this.$t('view.executive.production.colProduct'), sortable: false, minWidth: '160px' },
        { field: 'department', header: this.$t('view.executive.production.colDepartment'), sortable: false, minWidth: '140px' },
        { field: 'createDate', header: this.$t('view.executive.production.colOpenDate'), sortable: false, minWidth: '110px' },
        { field: 'lastMoveDate', header: this.$t('view.executive.production.colLastMove'), sortable: false, minWidth: '110px' },
        { field: 'daysSinceMove', header: this.$t('view.executive.production.colDays'), sortable: false, minWidth: '80px', align: 'right' }
      ]
    }
  },

  watch: {
    departmentKeys() {
      this.onFilterChanged()
    },

    minDays() {
      this.onFilterChanged()
    },

    refreshToken() {
      this.fetchProductionWip()
      this.fetchData()
    }
  },

  methods: {
    formatDate,

    onFilterChanged() {
      this.$emit('update:filter', { departmentKeys: this.departmentKeys, minDays: this.minDays })
      this.resetPaging()
    },

    async fetchProductionWip() {
      const res = await this.executiveReportStore.fetchProductionWip()
      this.productionWip = res
        ? { departments: res.departments || [], monthlyCompleted: res.monthlyCompleted || [] }
        : { departments: [], monthlyCompleted: [] }
    },

    async fetchData() {
      const res = await this.executiveReportStore.fetchStalePlans({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        minDays: this.minDays,
        departmentKeys: this.departmentKeys
      })
      this.stalePlans = res ? { data: res.data || [], total: res.total || 0 } : { data: [], total: 0 }
    }
  },

  mounted() {
    this.$emit('update:filter', { departmentKeys: this.departmentKeys, minDays: this.minDays })
    this.fetchProductionWip()
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.section-card-block {
  margin-bottom: var(--sp-lg);
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md);
  margin-bottom: var(--sp-xl);

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

.filter-row {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.table-title {
  color: var(--base-font-color);
  font-weight: 600;
  padding-bottom: var(--sp-sm);
  border-bottom: 1px solid var(--color-border);
  background: transparent !important;
  margin-bottom: var(--sp-sm);
}
</style>
