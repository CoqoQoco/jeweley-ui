<!--
  gold-stage-outlier-jobs-panel — ตาราง "ใบงานผิดปกติ (จ่าย-รับ)" (reportRef: goldStageOutliers) ของส่วน
  "Loss ตามใบงานรายแผนก" — เรียก ProductionInsight/GoldStageOutlierJobs (DataSourceRequest +
  metal/start/end/departmentKeys) — เกณฑ์ outlier (คำนวณฝั่ง backend): % เกิน 3 เท่าของค่ากลางแผนก และ
  ส่วนต่าง ≥ 0.20 g — ไม่มีตัวกรองแผนกใน UI (ส่ง departmentKeys ว่างเสมอ = ทุกแผนก มีแค่ 3 แผนก ดูง่ายพอ)

  คอลัมน์ "รหัสช่าง" โชว์ชื่อช่างใต้รหัสด้วย (field workerName ใหม่ ยืนยันจาก API agent 2026-10-01) แยกคนละ
  บรรทัดภายในเซลล์เดียวกันเสมอ (ไม่ต่อเป็นสตริงเดียว) กันข้อความเซลล์ถัดไป (วันที่) ดูเหมือนไหลติดกันตอนรหัส+
  ชื่อยาวกว่าความกว้างคอลัมน์เดิม (ยืนยันจาก user ตรวจบน prod) — ไม่มีชื่อมาโชว์แค่รหัสเหมือนเดิม (รองรับตอน
  backend ยังไม่ส่งมาครบทุก response)

  Props:
    metal — String ('GOLD') — 'GOLD'|'SILVER'
    start — Date (required)
    end   — Date (required)
-->
<template>
  <div id="insight-report-goldStageOutliers" class="gold-stage-outlier-jobs-panel">
    <SectionCardGeneric
      :title="$t('view.productionInsight.gold.stageOutlierTitle')"
      icon="bi-exclamation-triangle"
      accent="warning"
      headerStyle="legend"
    >
      <p class="gold-stage-outlier-jobs-panel__note">{{ $t('view.productionInsight.gold.stageOutlierCriteriaNote') }}</p>

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
            <span v-else class="gold-stage-outlier-jobs-panel__plan-no">
              {{ data.woText || data.woNumber || data.wo }}
              <InfoTipGeneric :text="$t('view.productionInsight.wip.planLinkNoPermission')" />
            </span>
          </template>

          <template #workerCodeTemplate="{ data }">
            <div class="gold-stage-outlier-jobs-panel__worker">
              <span>{{ data.workerCode || '—' }}</span>
              <span v-if="data.workerName" class="gold-stage-outlier-jobs-panel__worker-name">{{ data.workerName }}</span>
            </div>
          </template>
          <template #dateTemplate="{ data }">{{ data.date ? formatDate(data.date) : '—' }}</template>
          <template #sendGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.sendGram) }}</div>
          </template>
          <template #checkGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.checkGram) }}</div>
          </template>
          <template #diffGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.diffGram) }}</div>
          </template>
          <template #diffPercentTemplate="{ data }">
            <div class="text-right gold-stage-outlier-jobs-panel__outlier">{{ formatPercent(data.diffPercent) }}</div>
          </template>
          <template #deptMedianPercentTemplate="{ data }">
            <div class="text-right">{{ formatPercent(data.deptMedianPercent) }}</div>
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
  name: 'GoldStageOutlierJobsPanel',

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
    tableRows() {
      return this.items.map((row) => ({ ...row, deptLabel: this.$t(`view.executive.department.${row.deptKey}`) }))
    },

    columns() {
      return [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'deptLabel', header: this.$t('view.productionInsight.gold.stageColDept'), sortable: false, minWidth: '90px' },
        { field: 'workerCode', header: this.$t('view.productionInsight.gold.workersColWorkerCode'), sortable: false, minWidth: '120px' },
        { field: 'date', header: this.$t('view.productionInsight.gold.stageOutlierColDate'), sortable: false, minWidth: '110px' },
        { field: 'sendGram', header: this.$t('view.productionInsight.gold.stageColSend'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'checkGram', header: this.$t('view.productionInsight.gold.stageOutlierColCheck'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'diffGram', header: this.$t('view.productionInsight.gold.stageColDiffGram'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'diffPercent', header: this.$t('view.productionInsight.gold.stageColDiffPercent'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'deptMedianPercent', header: this.$t('view.productionInsight.gold.stageOutlierColDeptMedian'), sortable: false, minWidth: '110px', align: 'right' }
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

    formatPercent(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)}%` : '—'
    },

    async fetchData() {
      const res = await this.productionInsightStore.fetchGoldStageOutlierJobs({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
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
.gold-stage-outlier-jobs-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.gold-stage-outlier-jobs-panel__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.gold-stage-outlier-jobs-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.gold-stage-outlier-jobs-panel__outlier {
  color: var(--base-red);
  font-weight: 700;
}

.gold-stage-outlier-jobs-panel__worker {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.gold-stage-outlier-jobs-panel__worker-name {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
