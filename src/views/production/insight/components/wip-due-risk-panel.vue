<!--
  wip-due-risk-panel — ตาราง "งานเสี่ยงเลยกำหนด" (reportRef: dueRisk) ของหมวด "งานค้างและคอขวด"
  เรียก ProductionInsight/DueRiskPlans (DataSourceRequest + mode:'overdue'|'dueSoon') — สลับมุมมองด้วย
  ToggleGroupGeneric ในตัว, ตัวกรองแผนกมาจาก props (คุมจาก FilterPanelGeneric ของ ProductionInsightView)
-->
<template>
  <div id="insight-report-dueRisk" class="wip-due-risk-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.wip.dueRiskTitle')" icon="bi-hourglass-split" accent="warning" headerStyle="legend">
      <p class="wip-due-risk-panel__note">{{ $t('view.productionInsight.wip.asOfTodayNote') }}</p>
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
          <template #header-lastAction>
            <span class="wip-due-risk-panel__col-header">
              {{ $t('view.productionInsight.wip.colLastAction') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.staleColLastAction')" position="bottom" tone="inverse" />
            </span>
          </template>

          <template #header-workers>
            <span class="wip-due-risk-panel__col-header">
              {{ $t('view.productionInsight.wip.colWorkers') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.staleColWorkers')" position="bottom" tone="inverse" />
            </span>
          </template>

          <template #woTemplate="{ data }">
            <ButtonGeneric
              v-if="planLinkState(data).canOpen"
              variant="plain"
              icon="bi-box-arrow-up-right"
              :label="data.woText || data.woNumber || data.wo"
              :title="$t('view.productionInsight.wip.planLinkTitle')"
              @click="openPlanDetail(data)"
            />
            <span v-else class="wip-due-risk-panel__plan-no">
              {{ data.woText || data.woNumber || data.wo }}
              <InfoTipGeneric :text="$t('view.productionInsight.wip.planLinkNoPermission')" />
            </span>
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
            <PlanWorkersCell :workers="data.workers" :worker-items="data.workerItems" />
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
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { formatDate } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import {
  resolveStatusLine,
  buildLastActionLine,
  resolvePlanLinkState,
  PLAN_DETAIL_ROUTE_NAME,
  EXECUTIVE_PLAN_DETAIL_ROUTE_NAME
} from './wip-plan-table-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import PlanWorkersCell from './plan-workers-cell.vue'

const DEPARTMENT_KEYS = ['design', 'trim', 'rawPolish', 'gemSort', 'setting', 'plating', 'costCard']

export default {
  name: 'WipDueRiskPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    InfoTipGeneric,
    ButtonGeneric,
    BaseDataTable,
    ToggleGroupGeneric,
    PlanWorkersCell
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    const authStore = useAuthStore()
    return { productionInsightStore, authStore }
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
        {
          value: 'overdue',
          label: this.$t('view.productionInsight.wip.dueRiskModeOverdue'),
          title: this.$t('view.productionInsight.help.dueRiskModeOverdue')
        },
        {
          value: 'dueSoon',
          label: this.$t('view.productionInsight.wip.dueRiskModeDueSoon', { days: this.riskWindowDays }),
          title: this.$t('view.productionInsight.help.dueRiskModeDueSoon', { days: this.riskWindowDays })
        }
      ]
    },

    departmentLabelMap() {
      const map = {}
      DEPARTMENT_KEYS.forEach((key) => {
        map[key] = this.$t(`view.executive.department.${key}`)
      })
      return map
    },

    // BaseDataTable/PrimeVue เรนเดอร์ทั้ง `header` prop และ `#header-<field>` slot คู่กันเสมอ (ไม่ทับกัน — ดู
    // node_modules/primevue/datatable/HeaderCell.vue) คอลัมน์ไหนมี custom header slot (label+ⓘ) ต้องเคลียร์
    // `header` prop ทิ้งเป็น '' ไม่งั้นหัวขึ้นซ้ำ 2 จุด (เหมือน gold-loss-dashboard reconcile-tab)
    columns() {
      const fieldsWithCustomHeaderSlot = ['lastAction', 'workers']
      const cols = [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'mold', header: this.$t('view.executive.production.colMold'), sortable: false, minWidth: '110px' },
        { field: 'product', header: this.$t('view.executive.production.colProduct'), sortable: false, minWidth: '160px' },
        { field: 'department', header: this.$t('view.executive.production.colDepartment'), sortable: false, minWidth: '140px' },
        { field: 'lastAction', header: this.$t('view.productionInsight.wip.colLastAction'), sortable: false, minWidth: '160px' },
        { field: 'workers', header: this.$t('view.productionInsight.wip.colWorkers'), sortable: false, minWidth: '140px' },
        { field: 'dueDate', header: this.$t('view.productionInsight.wip.dueRiskColDueDate'), sortable: false, minWidth: '110px' },
        { field: 'daysToDue', header: this.$t('view.productionInsight.wip.dueRiskColDaysToDue'), sortable: false, minWidth: '90px', align: 'right' }
      ]
      return cols.map((col) => (fieldsWithCustomHeaderSlot.includes(col.field) ? { ...col, header: '' } : col))
    },

    // สิทธิ์เปิดรายละเอียดใบงาน (ตัวเต็ม แก้ไขได้) — อ่านจาก meta.permissions ของ route ปลายทางเอง (ไม่
    // hardcode PERMISSIONS.PRODUCTION_EDIT ซ้ำที่นี่ ผูกกับ route definition แหล่งเดียว)
    canOpenPlanDetail() {
      const route = this.$router.resolve({ name: PLAN_DETAIL_ROUTE_NAME, params: { id: 0 } })
      return this.permissionService.hasAnyPermission(route.meta.permissions)
    },

    // สิทธิ์เปิดรายละเอียดใบงานแบบ boss (อ่านอย่างเดียว) — ใช้เมื่อไม่มีสิทธิ์แก้ไขงานผลิต
    canOpenExecutivePlanDetail() {
      const route = this.$router.resolve({ name: EXECUTIVE_PLAN_DETAIL_ROUTE_NAME, params: { id: 0 } })
      return this.permissionService.hasAnyPermission(route.meta.permissions)
    },

    permissionService() {
      return new PermissionService(this.authStore.getUser, this.authStore.permissions)
    },

    // รวม mode+departmentKeys+riskWindowDays เป็น key เดียว กัน resetPaging() ยิงซ้ำตอนเปลี่ยนหลายค่าพร้อมกัน
    // (เช่นแก้แผนก+riskWindowDays แล้วกด "ใช้ตัวกรอง" ครั้งเดียว) — riskWindowDays มีผลเฉพาะโหมด dueSoon
    // (เหมือนเดิม) จึงใส่ใน key เฉพาะตอนนั้น ไม่งั้น key ไม่เปลี่ยนตอนแก้ riskWindowDays ระหว่างดูโหมด overdue
    // (คงพฤติกรรมเดิมที่ตั้งใจไม่ยิง fetch เปล่าประโยชน์) — mode ต้องรวมเข้า key นี้ด้วย (ไม่แยก watcher เอง)
    // ไม่งั้นตอนสลับโหมดจะโดนยิงซ้ำ 2 รอบเองจาก mode()+resetPagingKey() คนละตัว
    resetPagingKey() {
      return JSON.stringify([this.mode, this.departmentKeys, this.mode === 'dueSoon' ? this.riskWindowDays : null])
    }
  },

  watch: {
    resetPagingKey() {
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

    planLinkState(data) {
      return resolvePlanLinkState(data.planId, this.canOpenPlanDetail, this.canOpenExecutivePlanDetail)
    },

    openPlanDetail(data) {
      const { routeLocation } = this.planLinkState(data)
      if (!routeLocation) return
      const route = this.$router.resolve(routeLocation)
      window.open(route.href, '_blank', 'noopener')
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

.wip-due-risk-panel__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.wip-due-risk-panel__toolbar {
  margin-bottom: var(--sp-lg);
}

.wip-due-risk-panel__overdue {
  color: var(--base-red);
  font-weight: 700;
}

.wip-due-risk-panel__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.wip-due-risk-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}
</style>
