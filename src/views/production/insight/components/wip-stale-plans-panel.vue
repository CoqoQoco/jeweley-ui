<!--
  wip-stale-plans-panel — ตารางใบงานค้าง (reportRef: stalePlans) ของหมวด "งานค้างและคอขวด"
  เรียก ProductionInsight/StalePlans (contract เดียวกับ ExecutiveReport/StalePlans เดิม) — ตัวกรองแผนก/
  ไม่ขยับเกิน (วัน) มาจาก props (คุมจาก FilterPanelGeneric ของ ProductionInsightView ไม่ใช่ในกล่องนี้เอง)
-->
<template>
  <div id="insight-report-stalePlans" class="wip-stale-plans-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.wip.stalePlansTitle')" icon="bi-table" accent="main" headerStyle="legend">
      <p class="wip-stale-plans-panel__note">{{ $t('view.productionInsight.wip.asOfTodayNote') }}</p>
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
            <span class="wip-stale-plans-panel__col-header">
              {{ $t('view.productionInsight.wip.colLastAction') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.staleColLastAction')" position="bottom" tone="inverse" />
            </span>
          </template>

          <template #header-workers>
            <span class="wip-stale-plans-panel__col-header">
              {{ $t('view.productionInsight.wip.colWorkers') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.staleColWorkers')" position="bottom" tone="inverse" />
            </span>
          </template>

          <template #header-daysSinceMove>
            <span class="wip-stale-plans-panel__col-header">
              {{ $t('view.executive.production.colDays') }}
              <InfoTipGeneric :text="$t('view.productionInsight.help.staleColDays')" position="bottom" tone="inverse" />
            </span>
          </template>

          <template #woTemplate="{ data }">
            <ButtonGeneric
              v-if="planLinkState(data).canOpen"
              variant="plain"
              icon="bi-box-arrow-up-right"
              :label="data.woText || data.woNumber || data.wo"
              :title="$t('view.productionInsight.wip.planLinkTitle')"
              @click="openPlanDetail(data.planId)"
            />
            <span v-else class="wip-stale-plans-panel__plan-no">
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
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { formatDate } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { summarizeWorkers, resolveStatusLine, buildLastActionLine, resolvePlanLinkState, PLAN_DETAIL_ROUTE_NAME } from './wip-plan-table-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const DEPARTMENT_KEYS = ['design', 'trim', 'rawPolish', 'gemSort', 'setting', 'plating', 'costCard']

export default {
  name: 'WipStalePlansPanel',

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

    // BaseDataTable/PrimeVue เรนเดอร์ทั้ง `header` prop และ `#header-<field>` slot คู่กันเสมอ (ไม่ทับกัน — ดู
    // node_modules/primevue/datatable/HeaderCell.vue) คอลัมน์ไหนมี custom header slot (label+ⓘ) ต้องเคลียร์
    // `header` prop ทิ้งเป็น '' ไม่งั้นหัวขึ้นซ้ำ 2 จุด (เหมือน gold-loss-dashboard reconcile-tab)
    columns() {
      const fieldsWithCustomHeaderSlot = ['lastAction', 'workers', 'daysSinceMove']
      const cols = [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'mold', header: this.$t('view.executive.production.colMold'), sortable: false, minWidth: '110px' },
        { field: 'product', header: this.$t('view.executive.production.colProduct'), sortable: false, minWidth: '160px' },
        { field: 'department', header: this.$t('view.executive.production.colDepartment'), sortable: false, minWidth: '140px' },
        { field: 'createDate', header: this.$t('view.executive.production.colOpenDate'), sortable: false, minWidth: '110px' },
        { field: 'lastAction', header: this.$t('view.productionInsight.wip.colLastAction'), sortable: false, minWidth: '160px' },
        { field: 'workers', header: this.$t('view.productionInsight.wip.colWorkers'), sortable: false, minWidth: '140px' },
        { field: 'daysSinceMove', header: this.$t('view.executive.production.colDays'), sortable: false, minWidth: '80px', align: 'right' }
      ]
      return cols.map((col) => (fieldsWithCustomHeaderSlot.includes(col.field) ? { ...col, header: '' } : col))
    },

    // สิทธิ์เปิดรายละเอียดใบงาน — อ่านจาก meta.permissions ของ route ปลายทางเอง (ไม่ hardcode
    // PERMISSIONS.PRODUCTION_EDIT ซ้ำที่นี่ ผูกกับ route definition แหล่งเดียว)
    canOpenPlanDetail() {
      const route = this.$router.resolve({ name: PLAN_DETAIL_ROUTE_NAME, params: { id: 0 } })
      const permissionService = new PermissionService(this.authStore.getUser, this.authStore.permissions)
      return permissionService.hasAnyPermission(route.meta.permissions)
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

    planLinkState(data) {
      return resolvePlanLinkState(data.planId, this.canOpenPlanDetail)
    },

    openPlanDetail(planId) {
      const route = this.$router.resolve({ name: PLAN_DETAIL_ROUTE_NAME, params: { id: planId } })
      window.open(route.href, '_blank', 'noopener')
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

.wip-stale-plans-panel__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.wip-stale-plans-panel__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.wip-stale-plans-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}
</style>
