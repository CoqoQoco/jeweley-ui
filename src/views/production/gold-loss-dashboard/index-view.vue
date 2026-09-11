<template>
  <div class="app-container">
    <DashboardHeaderGeneric
      :title="$t('view.production.goldLossDashboard.title')"
      :subtitle="$t('view.production.goldLossDashboard.subtitle')"
      icon="bi-gem"
      @refresh="onRefresh"
    />

    <GoldLossDashboardFilterView
      class="mb-2"
      :modelForm="filter"
      :activeTab="activeTab"
      @search="onSearchFilter"
      @clear="onClearFilter"
    />

    <TabViewGeneric v-model="activeTab" :tabs="tabs">
      <template #overview>
        <OverviewTabView :filter="filter" @navigate-tab="onNavigateTab" />
      </template>
      <template #stage>
        <StageTabView :filter="filter" :initialGroup="initialStageGroup" @update:group="onStageGroupChange" />
      </template>
      <template #worker>
        <WorkerTabView :filter="filter" @navigate-tab="onNavigateTab" />
      </template>
      <template #slip-tang>
        <TangSlipTabView :filter="filter" />
      </template>
      <template #slip-setter>
        <SetterSlipTabView :filter="filter" />
      </template>
      <template #reconcile>
        <ReconcileTabView :filter="filter" />
      </template>
    </TabViewGeneric>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import DashboardHeaderGeneric from '@/components/generic/DashboardHeaderGeneric.vue'
import TabViewGeneric from '@/components/generic/TabViewGeneric.vue'

import GoldLossDashboardFilterView from './components/dashboard-filter-view.vue'
import OverviewTabView from './components/overview-tab-view.vue'
import StageTabView from './components/stage-tab/index-tab-view.vue'
import WorkerTabView from './components/worker-tab/index-tab-view.vue'
import TangSlipTabView from './components/tang-slip-tab/index-tab-view.vue'
import SetterSlipTabView from './components/setter-slip-tab/index-tab-view.vue'
import ReconcileTabView from './components/reconcile-tab/index-tab-view.vue'

dayjs.extend(utc)
dayjs.extend(timezone)

const VALID_TABS = ['overview', 'stage', 'worker', 'slip-tang', 'slip-setter', 'reconcile']
const THAI_TIMEZONE = 'Asia/Bangkok'
// จำนวนเดือนที่เห็นเป็น default (เดือนปัจจุบัน + ย้อนหลัง 5 เดือน) — ให้เห็นแนวโน้มโดยไม่ต้องเลือกช่วงเอง
const DEFAULT_MONTHS_BACK = 6

// ช่วงวันที่ default ของ dashboard — ขอบเดือนยึดเวลาไทยเสมอ (ไม่ใช่ timezone เครื่อง)
const buildDefaultDateRange = () => {
  const now = dayjs().tz(THAI_TIMEZONE)
  return {
    start: now.subtract(DEFAULT_MONTHS_BACK - 1, 'month').startOf('month').toDate(),
    end: now.endOf('day').toDate()
  }
}

const buildDefaultFilter = () => ({
  ...buildDefaultDateRange(),
  status: [],
  workerCode: null
})

export default {
  name: 'GoldLossDashboardIndexView',

  components: {
    DashboardHeaderGeneric,
    TabViewGeneric,
    GoldLossDashboardFilterView,
    OverviewTabView,
    StageTabView,
    WorkerTabView,
    TangSlipTabView,
    SetterSlipTabView,
    ReconcileTabView
  },

  data() {
    return {
      activeTab: 'overview',
      initialStageGroup: 'stage',
      stageGroup: 'stage',
      filter: buildDefaultFilter(),
      isApplyingRouteQuery: false
    }
  },

  computed: {
    tabs() {
      const t = (key) => this.$t(`view.production.goldLossDashboard.${key}`)
      return [
        { value: 'overview', label: t('tabOverview') },
        { value: 'stage', label: t('tabStage'), group: 'plan', groupLabel: t('groupPlan') },
        { value: 'worker', label: t('tabWorker'), group: 'plan', groupLabel: t('groupPlan') },
        { value: 'slip-tang', label: t('tabSlipTang'), group: 'slip', groupLabel: t('groupSlip') },
        { value: 'slip-setter', label: t('tabSlipSetter'), group: 'slip', groupLabel: t('groupSlip') },
        { value: 'reconcile', label: t('tabReconcile'), group: 'both', groupLabel: t('groupBoth') }
      ]
    }
  },

  watch: {
    activeTab() {
      this.syncStateToQuery()
    },

    filter: {
      handler() {
        this.syncStateToQuery()
      },
      deep: true
    }
  },

  methods: {
    applyQueryToState(query) {
      this.isApplyingRouteQuery = true

      this.activeTab = VALID_TABS.includes(query.tab) ? query.tab : 'overview'
      this.initialStageGroup = query.group === 'gold' ? 'gold' : 'stage'
      this.stageGroup = this.initialStageGroup

      // ไม่มี query start/end (เข้าหน้าครั้งแรก) → ใช้ default 6 เดือนล่าสุดแทนค่าว่าง
      const defaultRange = buildDefaultDateRange()
      this.filter = {
        start: query.start ? new Date(query.start) : defaultRange.start,
        end: query.end ? new Date(query.end) : defaultRange.end,
        status: query.status
          ? String(query.status).split(',').map(Number).filter((n) => !Number.isNaN(n))
          : [],
        workerCode: query.worker || null
      }

      this.$nextTick(() => {
        this.isApplyingRouteQuery = false
      })
    },

    syncStateToQuery() {
      if (this.isApplyingRouteQuery) return

      const query = { tab: this.activeTab }
      if (this.filter.start) query.start = dayjs(this.filter.start).format('YYYY-MM-DD')
      if (this.filter.end) query.end = dayjs(this.filter.end).format('YYYY-MM-DD')
      if (this.filter.status && this.filter.status.length) query.status = this.filter.status.join(',')
      if (this.filter.workerCode) query.worker = this.filter.workerCode
      if (this.activeTab === 'stage' && this.stageGroup === 'gold') query.group = 'gold'

      this.$router.replace({ query }).catch(() => {})
    },

    onSearchFilter(formData) {
      this.filter = { ...formData }
    },

    onClearFilter() {
      this.filter = buildDefaultFilter()
    },

    onStageGroupChange(group) {
      this.stageGroup = group
      this.syncStateToQuery()
    },

    onRefresh() {
      // ยิงใหม่ด้วยค่า filter เดิม — ทุก tab-view watch `filter` แบบ deep อยู่แล้ว
      this.filter = { ...this.filter }
    },

    onNavigateTab(tab) {
      if (VALID_TABS.includes(tab)) this.activeTab = tab
    }
  },

  created() {
    this.applyQueryToState(this.$route.query)
  }
}
</script>

<style lang="scss" scoped></style>
