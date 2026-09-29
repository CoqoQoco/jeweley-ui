<!--
  wip-stale-plans-panel — ตารางใบงานค้าง (reportRef: stalePlans) ของหมวด "งานค้างและคอขวด"
  เรียก ProductionInsight/StalePlans (contract เดียวกับ ExecutiveReport/StalePlans เดิม) — ตัวกรองแผนก/
  ไม่ขยับเกิน (วัน) มาจาก props (คุมจาก FilterPanelGeneric ของ ProductionInsightView ไม่ใช่ในกล่องนี้เอง)
-->
<template>
  <div id="insight-report-stalePlans" class="wip-stale-plans-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.wip.stalePlansTitle')" icon="bi-table" accent="main" headerStyle="legend">
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

          <template #createDateTemplate="{ data }">
            {{ formatDate(data.createDate) }}
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

const DEPARTMENT_KEYS = ['design', 'trim', 'rawPolish', 'gemSort', 'setting', 'plating', 'costCard']

export default {
  name: 'WipStalePlansPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    BaseDataTable
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
    minDays: {
      type: Number,
      default: 180
    }
  },

  data() {
    return {
      items: [],
      total: 0
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

    columns() {
      return [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'mold', header: this.$t('view.executive.production.colMold'), sortable: false, minWidth: '110px' },
        { field: 'product', header: this.$t('view.executive.production.colProduct'), sortable: false, minWidth: '160px' },
        { field: 'department', header: this.$t('view.executive.production.colDepartment'), sortable: false, minWidth: '140px' },
        { field: 'createDate', header: this.$t('view.executive.production.colOpenDate'), sortable: false, minWidth: '110px' },
        { field: 'lastAction', header: this.$t('view.productionInsight.wip.colLastAction'), sortable: false, minWidth: '160px' },
        { field: 'workers', header: this.$t('view.productionInsight.wip.colWorkers'), sortable: false, minWidth: '140px' },
        { field: 'daysSinceMove', header: this.$t('view.executive.production.colDays'), sortable: false, minWidth: '80px', align: 'right' }
      ]
    }
  },

  watch: {
    departmentKeys: {
      handler() {
        this.resetPaging()
      },
      deep: true
    },
    minDays() {
      this.resetPaging()
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
      const res = await this.productionInsightStore.fetchStalePlans({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        minDays: this.minDays,
        departmentKeys: this.departmentKeys
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

.wip-stale-plans-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}
</style>
