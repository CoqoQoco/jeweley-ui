<!--
  wip-abnormal-dwell-panel — ตาราง "ใบที่อยู่ในแผนกนานผิดปกติ" (reportRef: abnormalDwell) ของหมวด
  "งานค้างและคอขวด" — เรียก ProductionInsight/AbnormalDwellPlans (DataSourceRequest + multiplier) — item
  shape เดียวกับ StalePlans + deptKey/daysInDept/waitDays/workDays/standardDays (waitDays/workDays อาจเป็น
  null ถ้าใบนั้นยังไม่มีข้อมูลแยกรอ/ทำ) — รายการ/จำนวนไม่รวมใบที่ไม่ขยับเกิน 180 วัน (ตัดทิ้งฝั่ง backend ให้
  ไปดูที่ตาราง "ใบงานค้าง" แทน กันนับซ้ำ 2 ตาราง)

  ตัวกรองแผนกปกติมาจาก props.departmentKeys (FilterPanelGeneric ของ ProductionInsightView เหมือนตารางอื่น)
  แต่คลิกตัวเลข "ค้างนานผิดปกติ" ในตาราง "เวลาผลิตรายแผนก" (wip-lead-time-table.vue) ส่ง focusDeptKey ลงมา
  override ให้กรองเฉพาะแผนกนั้นชั่วคราว (ไม่แตะค่า departmentKeys ที่ apply อยู่จริง) — มี chip ให้ล้างกลับ

  Props:
    departmentKeys — Array (default []) — ตัวกรองแผนกจาก FilterPanelGeneric
    focusDeptKey   — String (default '') — แผนกที่ถูกโฟกัสจากการคลิกตัวเลขค้างนานผิดปกติ (override ตัวกรอง)

  Emits: clear-focus — กดล้าง chip โฟกัสแผนก
-->
<template>
  <div id="insight-report-abnormalDwell" class="wip-abnormal-dwell-panel">
    <SectionCardGeneric
      :title="$t('view.productionInsight.wip.abnormalDwellTitle')"
      :titleTip="$t('view.productionInsight.help.STAGE_ABNORMAL_DWELL')"
      icon="bi-hourglass-bottom"
      accent="warning"
      headerStyle="legend"
    >
      <p class="wip-abnormal-dwell-panel__note">{{ $t('view.productionInsight.wip.asOfTodayNote') }}</p>
      <p class="wip-abnormal-dwell-panel__note">{{ $t('view.productionInsight.wip.abnormalDwellStaleExcludedNote') }}</p>

      <div v-if="focusDeptKey" class="wip-abnormal-dwell-panel__focus-chip">
        <span>{{ $t('view.productionInsight.wip.abnormalDwellFilterChip', { name: focusDeptLabel }) }}</span>
        <ButtonGeneric
          variant="plain"
          icon="bi-x-lg"
          :title="$t('view.productionInsight.wip.abnormalDwellClearFilter')"
          @click="$emit('clear-focus')"
        />
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
          <template #header-daysInDept>
            <span class="wip-abnormal-dwell-panel__col-header">
              {{ $t('view.productionInsight.wip.abnormalDwellColDays') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.abnormalDwellColDays')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-standardDays>
            <span class="wip-abnormal-dwell-panel__col-header">
              {{ $t('view.productionInsight.wip.abnormalDwellColStandard') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.abnormalDwellColStandard')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-lastAction>
            <span class="wip-abnormal-dwell-panel__col-header">
              {{ $t('view.productionInsight.wip.colLastAction') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.staleColLastAction')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-workers>
            <span class="wip-abnormal-dwell-panel__col-header">
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
            <span v-else class="wip-abnormal-dwell-panel__plan-no">
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
            {{ departmentLabelMap[data.deptKey || data.departmentKey] || data.deptKey || data.departmentKey }}
          </template>

          <template #daysInDeptTemplate="{ data }">
            <div class="text-right">{{ data.daysInDept }}</div>
          </template>

          <template #waitWorkTemplate="{ data }">
            <div class="text-right">{{ data.waitDays ?? '—' }} / {{ data.workDays ?? '—' }}</div>
          </template>

          <template #standardDaysTemplate="{ data }">
            <div class="text-right">{{ data.standardDays ?? '—' }}</div>
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
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { formatDate } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import {
  summarizeWorkers,
  buildLastActionLine,
  resolvePlanLinkState,
  PLAN_DETAIL_ROUTE_NAME,
  EXECUTIVE_PLAN_DETAIL_ROUTE_NAME
} from './wip-plan-table-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const DEPARTMENT_KEYS = ['design', 'trim', 'rawPolish', 'gemSort', 'setting', 'plating', 'costCard']

export default {
  name: 'WipAbnormalDwellPanel',

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
    departmentKeys: {
      type: Array,
      default: () => []
    },
    focusDeptKey: {
      type: String,
      default: ''
    }
  },

  emits: ['clear-focus'],

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

    focusDeptLabel() {
      return this.departmentLabelMap[this.focusDeptKey] || this.focusDeptKey
    },

    // คลิกตัวเลขค้างนานผิดปกติในตารางเวลาผลิต → override ตัวกรองแผนกชั่วคราวเฉพาะแผนกนั้น ไม่แตะ
    // props.departmentKeys ที่ apply จริงจาก FilterPanelGeneric
    effectiveDepartmentKeys() {
      return this.focusDeptKey ? [this.focusDeptKey] : this.departmentKeys
    },

    // BaseDataTable/PrimeVue เรนเดอร์ทั้ง `header` prop และ `#header-<field>` slot คู่กันเสมอ (ไม่ทับกัน — ดู
    // node_modules/primevue/datatable/HeaderCell.vue) คอลัมน์ไหนมี custom header slot (label+ⓘ) ต้องเคลียร์
    // `header` prop ทิ้งเป็น '' ไม่งั้นหัวขึ้นซ้ำ 2 จุด (เหมือน gold-loss-dashboard reconcile-tab)
    columns() {
      const fieldsWithCustomHeaderSlot = ['daysInDept', 'standardDays', 'lastAction', 'workers']
      const cols = [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'mold', header: this.$t('view.executive.production.colMold'), sortable: false, minWidth: '110px' },
        { field: 'product', header: this.$t('view.executive.production.colProduct'), sortable: false, minWidth: '160px' },
        { field: 'department', header: this.$t('view.executive.production.colDepartment'), sortable: false, minWidth: '120px' },
        { field: 'daysInDept', header: this.$t('view.productionInsight.wip.abnormalDwellColDays'), sortable: false, minWidth: '90px', align: 'right' },
        {
          field: 'waitWork',
          header: `${this.$t('view.productionInsight.wip.leadTimeColWait')} / ${this.$t('view.productionInsight.wip.leadTimeColWork')}`,
          sortable: false,
          minWidth: '90px',
          align: 'right'
        },
        { field: 'standardDays', header: this.$t('view.productionInsight.wip.abnormalDwellColStandard'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'lastAction', header: this.$t('view.productionInsight.wip.colLastAction'), sortable: false, minWidth: '160px' },
        { field: 'workers', header: this.$t('view.productionInsight.wip.colWorkers'), sortable: false, minWidth: '140px' }
      ]
      return cols.map((col) => (fieldsWithCustomHeaderSlot.includes(col.field) ? { ...col, header: '' } : col))
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
    }
  },

  watch: {
    departmentKeys: {
      handler() {
        if (!this.focusDeptKey) this.resetPaging()
      },
      deep: true
    },
    focusDeptKey() {
      this.resetPaging()
      this.$nextTick(() => this.$el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  },

  methods: {
    formatDate,

    lastActionLine(data) {
      return buildLastActionLine(data.lastUpdateBy, data.lastAction, this.$t('view.productionInsight.wip.lastActionCreated'))
    },

    workersOf(data) {
      return summarizeWorkers(data.workers)
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
      const res = await this.productionInsightStore.fetchAbnormalDwellPlans({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        departmentKeys: this.effectiveDepartmentKeys,
        multiplier: 2
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

.wip-abnormal-dwell-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.wip-abnormal-dwell-panel__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.wip-abnormal-dwell-panel__focus-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  margin-bottom: var(--sp-sm);
  padding: var(--sp-xs) var(--sp-sm);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-lg);
  color: var(--base-font-color);
  font-size: var(--fs-sm);
  font-weight: 600;
}

.wip-abnormal-dwell-panel__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.wip-abnormal-dwell-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}
</style>
