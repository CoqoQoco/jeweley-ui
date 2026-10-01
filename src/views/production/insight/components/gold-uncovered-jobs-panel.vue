<!--
  gold-uncovered-jobs-panel — ตาราง "งานที่ยังไม่ครบ slip" (reportRef: goldUncovered) ของหมวด "ทองและ Loss"
  — เรียก ProductionInsight/GoldUncoveredJobs (DataSourceRequest + workerTypes/workerCodes/olderThanDays/
  metal/start/end) — ตัวกรองประเภทช่าง/ช่าง/ไม่ครบเกิน (วัน)/โลหะ มาจาก props (คุมจาก FilterPanelGeneric ของ
  ProductionInsightView) — ช่วงเวลา (start/end) ผูกกับ range ของหมวดเดียวกัน (ตาราง range-scoped ฝั่ง backend
  แล้ว กันโชว์งานเก่าเกินช่วงที่เลือก เช่น ปี 2016/ข้อมูลทดสอบ)

  workerName เป็นค่าประมาณ (ช่างหลักของงาน ไม่ใช่ข้อมูลยืนยันแน่นอนเหมือนใบ slip จริง) — โชว์ workerCode คู่กัน
  เสมอกันเข้าใจผิดว่าเป็นข้อมูลแม่นยำระดับเดียวกับตารางอื่น

  Props:
    workerTypes    — Array (default [])
    workerCodes    — Array (default [])
    olderThanDays  — Number (default 14)
    metal          — String ('GOLD') — 'GOLD'|'SILVER'
    start          — Date (required)
    end            — Date (required)
-->
<template>
  <div id="insight-report-goldUncovered" class="gold-uncovered-jobs-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.gold.uncoveredTitle')" icon="bi-receipt" accent="warning" headerStyle="legend">
      <p class="gold-uncovered-jobs-panel__note">{{ $t('view.productionInsight.gold.uncoveredRangeNote') }}</p>
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
            <ButtonGeneric
              v-if="planLinkState(data).canOpen"
              variant="plain"
              icon="bi-box-arrow-up-right"
              :label="data.woText || data.woNumber || data.wo"
              :title="$t('view.productionInsight.wip.planLinkTitle')"
              @click="openPlanDetail(data)"
            />
            <span v-else class="gold-uncovered-jobs-panel__plan-no">
              {{ data.woText || data.woNumber || data.wo }}
              <InfoTipGeneric :text="$t('view.productionInsight.wip.planLinkNoPermission')" />
            </span>
          </template>

          <template #deptKeyTemplate="{ data }">
            {{ departmentLabelMap[data.deptKey] || data.deptKey }}
          </template>

          <template #workerTemplate="{ data }">
            <span class="gold-uncovered-jobs-panel__worker">
              {{ data.workerName }}
              <small class="text-muted">{{ data.workerCode }}</small>
              <InfoTipGeneric :text="$t('view.productionInsight.gold.uncoveredWorkerHint')" />
            </span>
          </template>

          <template #jobDateTemplate="{ data }">
            {{ data.jobDate ? formatDate(data.jobDate) : '—' }}
          </template>

          <template #sendGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.sendGram) }}</div>
          </template>
          <template #checkGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.checkGram) }}</div>
          </template>
          <template #diffGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.diffGram) }}</div>
          </template>
          <template #daysSinceTemplate="{ data }">
            <div class="text-right">{{ data.daysSince }}</div>
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

const DEPARTMENT_KEYS = ['design', 'trim', 'rawPolish', 'gemSort', 'setting', 'plating', 'costCard']

export default {
  name: 'GoldUncoveredJobsPanel',

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
    workerTypes: {
      type: Array,
      default: () => []
    },
    workerCodes: {
      type: Array,
      default: () => []
    },
    olderThanDays: {
      type: Number,
      default: 14
    },
    metal: {
      type: String,
      default: 'GOLD'
    },
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
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
        { field: 'deptKey', header: this.$t('view.productionInsight.gold.uncoveredColDept'), sortable: false, minWidth: '110px' },
        { field: 'worker', header: this.$t('view.productionInsight.gold.uncoveredColWorker'), sortable: false, minWidth: '150px' },
        { field: 'jobDate', header: this.$t('view.productionInsight.gold.uncoveredColJobDate'), sortable: false, minWidth: '100px' },
        { field: 'sendGram', header: this.$t('view.productionInsight.gold.uncoveredColSendGram'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'checkGram', header: this.$t('view.productionInsight.gold.uncoveredColCheckGram'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'diffGram', header: this.$t('view.productionInsight.gold.uncoveredColDiffGram'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'daysSince', header: this.$t('view.productionInsight.gold.uncoveredColDaysSince'), sortable: false, minWidth: '90px', align: 'right' }
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
    }
  },

  watch: {
    workerTypes: {
      handler() {
        this.resetPaging()
      },
      deep: true
    },
    workerCodes: {
      handler() {
        this.resetPaging()
      },
      deep: true
    },
    olderThanDays() {
      this.resetPaging()
    },
    metal() {
      this.resetPaging()
    },
    start() {
      this.resetPaging()
    },
    end() {
      this.resetPaging()
    }
  },

  methods: {
    formatDate,

    formatGram(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value) : '—'
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
      const res = await this.productionInsightStore.fetchGoldUncoveredJobs({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        workerTypes: this.workerTypes,
        workerCodes: this.workerCodes,
        olderThanDays: this.olderThanDays,
        metal: this.metal,
        start: this.start,
        end: this.end
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

.gold-uncovered-jobs-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.gold-uncovered-jobs-panel__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.gold-uncovered-jobs-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.gold-uncovered-jobs-panel__worker {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}
</style>
