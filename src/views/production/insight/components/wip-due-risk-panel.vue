<!--
  wip-due-risk-panel — ตาราง "งานเสี่ยงเลยกำหนด" (reportRef: dueRisk) ของหมวด "งานค้างและคอขวด"
  เรียก ProductionInsight/DueRiskPlans (DataSourceRequest + mode:'overdue'|'dueSoon') — สลับมุมมองด้วย
  ToggleGroupGeneric ในตัว, ตัวกรองแผนกมาจาก props (คุมจาก FilterPanelGeneric ของ ProductionInsightView)
-->
<template>
  <div id="insight-report-dueRisk" class="wip-due-risk-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.wip.dueRiskTitle')" icon="bi-hourglass-split" accent="warning" headerStyle="legend">
      <div class="wip-due-risk-panel__toolbar">
        <ToggleGroupGeneric v-model="mode" :options="modeOptions" :ariaLabel="$t('view.productionInsight.wip.dueRiskModeLabel')" />
      </div>

      <div class="responsive-table-wrapper">
        <BaseDataTable
          :items="items"
          :totalRecords="total"
          :columns="columns"
          :perPage="take"
          dataKey="planId"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
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
            <br v-if="statusLine(data)" />
            <small v-if="statusLine(data)" class="text-muted">{{ statusLine(data) }}</small>
          </template>

          <template #lastActionTemplate="{ data }">
            <div :title="data.lastActionRemark || ''">
              {{ data.lastActionDate ? formatDate(data.lastActionDate) : '—' }}
              <br />
              <small class="text-muted">{{ lastActionLine(data) }}</small>
            </div>
          </template>

          <template #workersTemplate="{ data }">
            <span v-if="!workersOf(data).shown">—</span>
            <span v-else :title="workersOf(data).title">
              {{ workersOf(data).shown }}
              <span v-if="workersOf(data).moreCount > 0" class="text-muted">+{{ workersOf(data).moreCount }}</span>
            </span>
          </template>

          <template #dueDateTemplate="{ data }">
            {{ data.dueDate ? formatDate(data.dueDate) : '—' }}
          </template>

          <template #daysToDueTemplate="{ data }">
            <span :class="{ 'wip-due-risk-panel__overdue': (data.daysToDue || 0) < 0 }">{{ data.daysToDue }}</span>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { formatDate } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { summarizeWorkers, resolveStatusLine, buildLastActionLine } from './wip-plan-table-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

const DEPARTMENT_KEYS = ['design', 'trim', 'rawPolish', 'gemSort', 'setting', 'plating', 'costCard']

export default {
  name: 'WipDueRiskPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    BaseDataTable,
    ToggleGroupGeneric
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    departmentKeys: {
      type: Array,
      default: () => []
    },
    riskWindowDays: {
      type: Number,
      default: 30
    }
  },

  data() {
    return {
      mode: 'overdue',
      items: [],
      total: 0
    }
  },

  computed: {
    modeOptions() {
      return [
        { value: 'overdue', label: this.$t('view.productionInsight.wip.dueRiskModeOverdue') },
        { value: 'dueSoon', label: this.$t('view.productionInsight.wip.dueRiskModeDueSoon', { days: this.riskWindowDays }) }
      ]
    },

    departmentLabelMap() {
      const map = {}
      DEPARTMENT_KEYS.forEach((key) => {
        map[key] = this.$t(`view.executive.department.${key}`)
      })
      return map
    },

    columns() {
      return [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'mold', header: this.$t('view.executive.production.colMold'), sortable: false, minWidth: '110px' },
        { field: 'product', header: this.$t('view.executive.production.colProduct'), sortable: false, minWidth: '160px' },
        { field: 'department', header: this.$t('view.executive.production.colDepartment'), sortable: false, minWidth: '140px' },
        { field: 'lastAction', header: this.$t('view.productionInsight.wip.colLastAction'), sortable: false, minWidth: '160px' },
        { field: 'workers', header: this.$t('view.productionInsight.wip.colWorkers'), sortable: false, minWidth: '140px' },
        { field: 'dueDate', header: this.$t('view.productionInsight.wip.dueRiskColDueDate'), sortable: false, minWidth: '110px' },
        { field: 'daysToDue', header: this.$t('view.productionInsight.wip.dueRiskColDaysToDue'), sortable: false, minWidth: '90px', align: 'right' }
      ]
    }
  },

  watch: {
    mode() {
      this.resetPaging()
    },
    departmentKeys: {
      handler() {
        this.resetPaging()
      },
      deep: true
    },
    riskWindowDays() {
      if (this.mode === 'dueSoon') this.resetPaging()
    }
  },

  methods: {
    formatDate,

    statusLine(data) {
      return resolveStatusLine(this.departmentLabelMap[data.departmentKey] || data.departmentKey, data.statusName)
    },

    lastActionLine(data) {
      return buildLastActionLine(data.lastUpdateBy, data.lastAction, this.$t('view.productionInsight.wip.lastActionCreated'))
    },

    workersOf(data) {
      return summarizeWorkers(data.workers)
    },

    async fetchData() {
      const res = await this.productionInsightStore.fetchDueRiskPlans({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        mode: this.mode,
        departmentKeys: this.departmentKeys,
        riskWindowDays: this.riskWindowDays
      })
      this.items = res?.data || []
      this.total = res?.total || 0
    }
  },

  mounted() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.wip-due-risk-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.wip-due-risk-panel__toolbar {
  margin-bottom: var(--sp-lg);
}

.wip-due-risk-panel__overdue {
  color: var(--base-red);
  font-weight: 700;
}
</style>
