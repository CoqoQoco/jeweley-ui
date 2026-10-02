<!--
  workers-unpaid-jobs-panel — ตาราง "งานที่ยังไม่บันทึกค่าแรง" (reportRef: wrkUnpaid) ของหมวด "ช่างและค่าแรง" —
  เรียก ProductionInsight/UnpaidPieceJobs (DataSourceRequest + start/end/departmentKeys) — งานที่ตรวจนับแล้ว
  (checkGram) แต่ยังไม่ถูกบันทึกเป็นค่าแรงรายชิ้น (ไม่เข้า workers[]/kpi.wagesPerMonth ของหมวดนี้)

  ช่วงเวลา/ตัวกรองแผนกมาจาก props (คุมจาก RangePresetGeneric/FilterPanelGeneric ของ ProductionInsightView)

  Props:
    start          — Date (required)
    end            — Date (required)
    departmentKeys — Array (default []) — ตัวกรองแผนกจาก FilterPanelGeneric
-->
<template>
  <div id="insight-report-wrkUnpaid" class="workers-unpaid-jobs-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.workers.unpaidTitle')" icon="bi-exclamation-circle" accent="warning" headerStyle="legend">
      <div class="responsive-table-wrapper">
        <BaseDataTable
          :items="tableRows"
          :totalRecords="total"
          :columns="columns"
          :perPage="take"
          dataKey="planId"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
          <template #woTemplate="{ data }">
            <ButtonGeneric
              v-if="planLinkState(data).canOpen"
              variant="plain"
              icon="bi-box-arrow-up-right"
              :label="data.woText || data.woNumber || data.wo"
              :title="$t('view.productionInsight.wip.planLinkTitle')"
              @click="openPlanDetail(data)"
            />
            <span v-else class="workers-unpaid-jobs-panel__plan-no">
              {{ data.woText || data.woNumber || data.wo }}
              <InfoTipGeneric :text="$t('view.productionInsight.wip.planLinkNoPermission')" />
            </span>
          </template>

          <template #workerCodeTemplate="{ data }">
            <div class="workers-unpaid-jobs-panel__worker">
              <span>{{ data.workerCode || '—' }}</span>
              <span v-if="data.workerName" class="workers-unpaid-jobs-panel__worker-name">{{ data.workerName }}</span>
            </div>
          </template>

          <template #jobDateTemplate="{ data }">{{ data.jobDate ? formatDate(data.jobDate) : '—' }}</template>
          <template #checkGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.checkGram) }}</div>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { formatDate } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { resolvePlanLinkState, PLAN_DETAIL_ROUTE_NAME, EXECUTIVE_PLAN_DETAIL_ROUTE_NAME } from './wip-plan-table-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'WorkersUnpaidJobsPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    InfoTipGeneric,
    ButtonGeneric,
    BaseDataTable
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    const authStore = useAuthStore()
    return { productionInsightStore, authStore }
  },

  props: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    departmentKeys: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      items: [],
      total: 0
    }
  },

  computed: {
    tableRows() {
      return this.items.map((row) => ({ ...row, deptLabel: this.$t(`view.executive.department.${row.deptKey}`) }))
    },

    columns() {
      return [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'deptLabel', header: this.$t('view.productionInsight.workers.colDept'), sortable: false, minWidth: '100px' },
        { field: 'workerCode', header: this.$t('view.productionInsight.workers.colWorker'), sortable: false, minWidth: '140px' },
        { field: 'jobDate', header: this.$t('view.productionInsight.workers.unpaidColJobDate'), sortable: false, minWidth: '110px' },
        { field: 'checkGram', header: this.$t('view.productionInsight.workers.unpaidColCheckGram'), sortable: false, minWidth: '100px', align: 'right' }
      ]
    },

    canOpenPlanDetail() {
      const route = this.$router.resolve({ name: PLAN_DETAIL_ROUTE_NAME, params: { id: 0 } })
      return this.permissionService.hasAnyPermission(route.meta.permissions)
    },

    canOpenExecutivePlanDetail() {
      const route = this.$router.resolve({ name: EXECUTIVE_PLAN_DETAIL_ROUTE_NAME, params: { id: 0 } })
      return this.permissionService.hasAnyPermission(route.meta.permissions)
    },

    permissionService() {
      return new PermissionService(this.authStore.getUser, this.authStore.permissions)
    },

    // รวม start+end+departmentKeys เป็น key เดียว กัน resetPaging() ยิงซ้ำตอนเปลี่ยนหลายค่าพร้อมกัน (เช่น
    // preset เปลี่ยน start+end พร้อมกัน) — pattern เดียวกับบั๊กจริงที่เจอบน delivery-late-plans-panel.vue
    // 2026-10-01
    resetPagingKey() {
      return JSON.stringify([this.start, this.end, this.departmentKeys])
    }
  },

  watch: {
    resetPagingKey() {
      this.resetPaging()
    }
  },

  methods: {
    formatDate,

    planLinkState(data) {
      return resolvePlanLinkState(data.planId, this.canOpenPlanDetail, this.canOpenExecutivePlanDetail)
    },

    openPlanDetail(data) {
      const { routeLocation } = this.planLinkState(data)
      if (!routeLocation) return
      const route = this.$router.resolve(routeLocation)
      window.open(route.href, '_blank', 'noopener')
    },

    formatGram(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value) : '—'
    },

    async fetchData() {
      const res = await this.productionInsightStore.fetchUnpaidPieceJobs({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        start: this.start,
        end: this.end,
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
.workers-unpaid-jobs-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.workers-unpaid-jobs-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.workers-unpaid-jobs-panel__worker {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.workers-unpaid-jobs-panel__worker-name {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
