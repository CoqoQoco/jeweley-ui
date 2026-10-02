<!--
  delivery-at-risk-panel — ตาราง "เสี่ยงเลยกำหนด" (reportRef: atRisk) ของหมวด "ส่งงานตรงเวลา" — เรียก
  ProductionInsight/DeliveryAtRiskPlans (DataSourceRequest + riskHorizonDays + departmentKeys) — item =
  stale-plan base fields + requestDate/currentDeptKey/daysInCurrentDept/remainingDays/projectedFinishDate/
  projectedLateDays — คาดการณ์จากเวลาที่เหลือในแผนกปัจจุบัน + ค่ากลางเวลาของแผนกที่เหลือ (เรียงลำดับคงที่
  แบบง่าย) ครอบคลุมทั้งใบที่ "เสี่ยงจะเลยกำหนด" และใบที่ "เลยกำหนดไปแล้วแต่ยังเปิดอยู่" (remainingDays ติดลบ)

  ตัวกรองแผนก/เตือนล่วงหน้า (วัน) มาจาก props (คุมจาก FilterPanelGeneric ของ ProductionInsightView)

  Props:
    departmentKeys — Array (default []) — ตัวกรองแผนกจาก FilterPanelGeneric
    riskHorizonDays — Number (default 30)
-->
<template>
  <div id="insight-report-atRisk" class="delivery-at-risk-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.delivery.atRiskTitle')" icon="bi-hourglass-split" accent="warning" headerStyle="legend">
      <p class="delivery-at-risk-panel__note">{{ $t('view.productionInsight.wip.asOfTodayNote') }}</p>

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
            <span class="delivery-at-risk-panel__col-header">
              {{ $t('view.productionInsight.wip.colLastAction') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.staleColLastAction')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-workers>
            <span class="delivery-at-risk-panel__col-header">
              {{ $t('view.productionInsight.wip.colWorkers') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.staleColWorkers')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-daysInCurrentDept>
            <span class="delivery-at-risk-panel__col-header">
              {{ $t('view.productionInsight.delivery.atRiskColDaysInDept') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.atRiskColDaysInDept')" position="bottom" tone="inverse" />
            </span>
          </template>
          <template #header-projectedLateDays>
            <span class="delivery-at-risk-panel__col-header">
              {{ $t('view.productionInsight.delivery.atRiskColProjectedLate') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.atRiskColProjectedLate')" position="bottom" tone="inverse" />
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
            <span v-else class="delivery-at-risk-panel__plan-no">
              {{ data.woText || data.woNumber || data.wo }}
              <InfoTipGeneric :text="$t('view.productionInsight.wip.planLinkNoPermission')" />
            </span>
          </template>

          <template #productTemplate="{ data }">
            <strong>{{ data.productNumber }}</strong>
            <br v-if="data.productName" />
            <small v-if="data.productName" class="text-muted">{{ data.productName }}</small>
          </template>

          <template #currentDeptKeyTemplate="{ data }">
            {{ departmentLabelMap[data.currentDeptKey] || data.currentDeptKey }}
          </template>

          <template #daysInCurrentDeptTemplate="{ data }">
            <div class="text-right">{{ data.daysInCurrentDept }}</div>
          </template>

          <template #requestDateTemplate="{ data }">
            {{ data.requestDate ? formatDate(data.requestDate) : '—' }}
          </template>

          <template #remainingDaysTemplate="{ data }">
            <span :class="{ 'delivery-at-risk-panel__overdue': (data.remainingDays ?? 0) < 0 }">{{ data.remainingDays }}</span>
          </template>

          <template #projectedFinishDateTemplate="{ data }">
            {{ data.projectedFinishDate ? formatDate(data.projectedFinishDate) : '—' }}
          </template>

          <template #projectedLateDaysTemplate="{ data }">
            <span :class="{ 'delivery-at-risk-panel__overdue': (data.projectedLateDays ?? 0) > 0 }">{{ data.projectedLateDays }}</span>
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
  buildLastActionLine,
  resolvePlanLinkState,
  PLAN_DETAIL_ROUTE_NAME,
  EXECUTIVE_PLAN_DETAIL_ROUTE_NAME
} from './wip-plan-table-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import PlanWorkersCell from './plan-workers-cell.vue'

const DEPARTMENT_KEYS = ['design', 'trim', 'rawPolish', 'gemSort', 'setting', 'plating', 'costCard']

export default {
  name: 'DeliveryAtRiskPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    InfoTipGeneric,
    ButtonGeneric,
    BaseDataTable,
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
    riskHorizonDays: {
      type: Number,
      default: 30
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

    // BaseDataTable/PrimeVue เรนเดอร์ทั้ง `header` prop และ `#header-<field>` slot คู่กันเสมอ (ไม่ทับกัน — ดู
    // node_modules/primevue/datatable/HeaderCell.vue) คอลัมน์ไหนมี custom header slot (label+ⓘ) ต้องเคลียร์
    // `header` prop ทิ้งเป็น '' ไม่งั้นหัวขึ้นซ้ำ 2 จุด (เหมือน gold-loss-dashboard reconcile-tab)
    columns() {
      const fieldsWithCustomHeaderSlot = ['lastAction', 'workers', 'daysInCurrentDept', 'projectedLateDays']
      const cols = [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'mold', header: this.$t('view.executive.production.colMold'), sortable: false, minWidth: '110px' },
        { field: 'product', header: this.$t('view.executive.production.colProduct'), sortable: false, minWidth: '150px' },
        { field: 'currentDeptKey', header: this.$t('view.productionInsight.delivery.atRiskColCurrentDept'), sortable: false, minWidth: '110px' },
        { field: 'daysInCurrentDept', header: this.$t('view.productionInsight.delivery.atRiskColDaysInDept'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'requestDate', header: this.$t('view.productionInsight.delivery.atRiskColRequestDate'), sortable: false, minWidth: '100px' },
        { field: 'remainingDays', header: this.$t('view.productionInsight.delivery.atRiskColRemainingDays'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'projectedFinishDate', header: this.$t('view.productionInsight.delivery.atRiskColProjectedFinish'), sortable: false, minWidth: '110px' },
        { field: 'projectedLateDays', header: this.$t('view.productionInsight.delivery.atRiskColProjectedLate'), sortable: false, minWidth: '110px', align: 'right' },
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
    },

    // รวม departmentKeys+riskHorizonDays เป็น key เดียว กัน resetPaging() ยิงซ้ำตอนแก้ทั้งคู่แล้วกด "ใช้
    // ตัวกรอง" ครั้งเดียว (pattern เดียวกับบั๊กจริงที่เจอบน delivery-late-plans-panel.vue 2026-10-01)
    resetPagingKey() {
      return JSON.stringify([this.departmentKeys, this.riskHorizonDays])
    }
  },

  watch: {
    resetPagingKey() {
      this.resetPaging()
    }
  },

  methods: {
    formatDate,

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
      const res = await this.productionInsightStore.fetchDeliveryAtRiskPlans({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        riskHorizonDays: this.riskHorizonDays,
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

.delivery-at-risk-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.delivery-at-risk-panel__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.delivery-at-risk-panel__overdue {
  color: var(--base-red);
  font-weight: 700;
}

.delivery-at-risk-panel__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.delivery-at-risk-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}
</style>
