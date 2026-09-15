<!--
  overview-tab-view — สรุปข้อมูล Gold Loss จากใบ (SLIP) เท่านั้น ตามที่ลูกค้าขอ — ฝั่ง PLAN
  (แผนผลิต/กระทบยอด/ต่อช่าง) ถูกคอมเมนต์ปิดไว้ชั่วคราวทั้งหมด ดู marker [PLAN-HIDDEN] เพื่อ grep
  จุดที่ถูกปิดและกู้คืนได้ทุกจุด

  เรียก endpoint ตรงด้วย axios-helper (ไม่ผ่าน pinia store ของแท็บอื่น) เพราะ store ของแท็บ
  Stage/TangSlip/Reconcile/Worker เป็น singleton ที่แท็บนั้นๆ ยังอ่านอยู่แม้สลับออกไปแล้ว
  (TabViewGeneric ค้าง component ไว้ไม่ unmount) — ถ้าใช้ store เดียวกัน ตัวเลขของแท็บอื่นจะโดน
  ทับด้วยพารามิเตอร์ของ Overview เอง

  แถว SLIP ยิง endpoint ต่อช่างแบบ groupByMonth:true ทั้งช่างแต่ง (ReportGoldLossTangByWorker) และ
  ช่างฝัง (ReportGoldLossSlipByWorker) แยกกัน 2 endpoint เพราะชื่อฟิลด์ไม่ตรงกัน — map เป็น shape กลาง
  {workerCode, workerName, year, month, slipCount, issued, returned, loss, allowed, allowedBase} ก่อนใช้เสมอ
  (ดู normalizeTangRow/normalizeSetterRow) ฝั่งช่างฝังไม่มีฟิลด์ loss ตรงๆ ต้องคำนวณจาก
  totalWeightSend - totalWeightCheck เอง

  "เกณฑ์ในใบ" (threshold%) = Σ allowed / Σ allowedBase × 100 (ถ่วงน้ำหนักตามน้ำหนักทอง ไม่ใช่ค่าเฉลี่ยตรงๆ —
  ยืนยันแล้วบน prod: เฉลี่ยตรงๆ 3.06% vs ถ่วงน้ำหนัก 2.48%) ช่างแต่ง: allowed=totalAllowedLoss,
  allowedBase=totalAllowedLossBase (ฟิลด์ใหม่ฝั่ง API — อาจยังไม่มีจนกว่าจะ deploy ต้อง fallback เป็น 0
  → threshold = null); ช่างฝัง: allowed=totalWeightLossAllowed, allowedBase=totalWeightCheck (มีอยู่แล้ว)
-->
<template>
  <div>
    <SourceStripGeneric source="slip" />

    <!-- [PLAN-HIDDEN] KPI จากแผนผลิต (PLAN) — ลูกค้าขอให้ดูเฉพาะข้อมูลจากใบก่อน
    <SectionCardGeneric
      :title="$t('view.production.goldLossDashboard.overview.sourcePlanTitle')"
      icon="bi-clipboard-data"
      accent="main"
      headerStyle="legend"
      class="section-card-block"
    >
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--plan">PLAN</span>
          <StatCardGeneric
            icon="bi-percent"
            :value="formatPercentValue(planKpi.lossPercent)"
            :label="$t('view.production.goldLossDashboard.overview.kpiPlanLossPercent')"
            :subLabel="planPeriodLabel"
            variant="main"
          />
        </div>
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--plan">PLAN</span>
          <StatCardGeneric
            icon="bi-droplet-half"
            :value="formatWeightValue(planKpi.rawLoss)"
            :label="$t('view.production.goldLossDashboard.overview.kpiPlanRawLoss')"
            :subLabel="$t('view.production.goldLossDashboard.overview.kpiPlanRawLossSub', { count: formatNumberValue(planKpi.jobCount) })"
            variant="warning"
          />
        </div>
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--plan">PLAN</span>
          <StatCardGeneric
            icon="bi-hourglass-split"
            :value="formatWeightValue(planKpi.pendingWeight)"
            :label="$t('view.production.goldLossDashboard.overview.kpiPlanPending')"
            :subLabel="$t('view.production.goldLossDashboard.overview.kpiPlanPendingSub', { count: formatNumberValue(planKpi.pendingCount) })"
            variant="grey"
          />
        </div>
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--plan">PLAN</span>
          <StatCardGeneric
            icon="bi-person-exclamation"
            :value="farthestWorker ? farthestWorker.workerCode : '—'"
            :label="$t('view.production.goldLossDashboard.overview.kpiPlanFarthestWorker')"
            :subLabel="farthestWorkerSubLabel"
            variant="grey"
          />
        </div>
      </div>
    </SectionCardGeneric>
    -->

    <SectionCardGeneric
      :title="$t('view.production.goldLossDashboard.overview.sourceSlipTangTitle')"
      icon="bi-receipt"
      accent="main"
      headerStyle="dashboard"
      class="section-card-block"
    >
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--slip">SLIP</span>
          <StatCardGeneric
            icon="bi-journal-text"
            :value="formatNumberValue(slipKpiByDept.tang.slipCount)"
            :label="$t('view.production.goldLossDashboard.overview.kpiSlipTotalCount')"
            :subLabel="emptySubLabel"
            variant="main"
          />
        </div>
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--slip">SLIP</span>
          <StatCardGeneric
            icon="bi-box-arrow-up"
            :value="formatWeightValue(slipKpiByDept.tang.issued)"
            :label="$t('view.production.goldLossDashboard.overview.kpiSlipTotalIssued')"
            :subLabel="emptySubLabel"
            variant="main"
          />
        </div>
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--slip">SLIP</span>
          <StatCardGeneric
            icon="bi-box-arrow-in-down"
            :value="formatWeightValue(slipKpiByDept.tang.returned)"
            :label="$t('view.production.goldLossDashboard.overview.kpiSlipTotalReturned')"
            :subLabel="emptySubLabel"
            variant="main"
          />
        </div>
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--slip">SLIP</span>
          <StatCardGeneric
            icon="bi-droplet-half"
            :value="formatWeightValue(slipKpiByDept.tang.loss)"
            :label="$t('view.production.goldLossDashboard.overview.kpiSlipTotalLoss')"
            :subLabel="lossSubLabel(slipKpiByDept.tang)"
            variant="main"
          />
        </div>
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('view.production.goldLossDashboard.overview.sourceSlipSetterTitle')"
      icon="bi-receipt"
      accent="green"
      headerStyle="dashboard"
      class="section-card-block"
    >
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--slip">SLIP</span>
          <StatCardGeneric
            icon="bi-journal-text"
            :value="formatNumberValue(slipKpiByDept.setter.slipCount)"
            :label="$t('view.production.goldLossDashboard.overview.kpiSlipTotalCount')"
            :subLabel="emptySubLabel"
            variant="green"
          />
        </div>
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--slip">SLIP</span>
          <StatCardGeneric
            icon="bi-box-arrow-up"
            :value="formatWeightValue(slipKpiByDept.setter.issued)"
            :label="$t('view.production.goldLossDashboard.overview.kpiSlipTotalIssued')"
            :subLabel="emptySubLabel"
            variant="green"
          />
        </div>
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--slip">SLIP</span>
          <StatCardGeneric
            icon="bi-box-arrow-in-down"
            :value="formatWeightValue(slipKpiByDept.setter.returned)"
            :label="$t('view.production.goldLossDashboard.overview.kpiSlipTotalReturned')"
            :subLabel="emptySubLabel"
            variant="green"
          />
        </div>
        <div class="kpi-card">
          <span class="kpi-card__tag kpi-card__tag--slip">SLIP</span>
          <StatCardGeneric
            icon="bi-droplet-half"
            :value="formatWeightValue(slipKpiByDept.setter.loss)"
            :label="$t('view.production.goldLossDashboard.overview.kpiSlipTotalLoss')"
            :subLabel="lossSubLabel(slipKpiByDept.setter)"
            variant="green"
          />
        </div>
      </div>
    </SectionCardGeneric>

    <div class="charts-row-b">
      <SectionCardGeneric
        :title="$t('view.production.goldLossDashboard.overview.chartSlipCompareTitle')"
        icon="bi-bar-chart-line"
        accent="green"
        headerStyle="legend"
      >
        <ChartGeneric
          type="line"
          :series="slipCompareSeries"
          :options="slipCompareOptions"
          :height="360"
          :emptyText="$t('common.label.noData')"
        />
      </SectionCardGeneric>

      <SectionCardGeneric
        :title="$t('view.production.goldLossDashboard.overview.chartSlipByWorkerTitle')"
        icon="bi-people"
        accent="green"
        headerStyle="legend"
      >
        <div class="slip-dept-toggle-row">
          <span class="title-text">{{ $t('view.production.goldLossDashboard.overview.slipDeptLabel') }}</span>
          <div class="group-by-toggle" role="tablist">
            <button
              type="button"
              class="group-by-toggle__btn"
              :class="{ 'group-by-toggle__btn--active': slipDept === 'tang' }"
              @click="setSlipDept('tang')"
            >
              {{ $t('view.production.goldLossDashboard.overview.slipDeptTang') }}
            </button>
            <button
              type="button"
              class="group-by-toggle__btn"
              :class="{ 'group-by-toggle__btn--active': slipDept === 'setter' }"
              @click="setSlipDept('setter')"
            >
              {{ $t('view.production.goldLossDashboard.overview.slipDeptSetter') }}
            </button>
          </div>
          <span class="slip-dept-toggle-row__threshold">
            <span class="goal-legend-tick"></span>{{ $t('view.production.goldLossDashboard.overview.slipAllowedLegend', { percent: selectedDeptThresholdLabel }) }}
          </span>
        </div>
        <ChartGeneric
          type="bar"
          :series="slipByWorkerSeries"
          :options="slipByWorkerOptions"
          :height="slipByWorkerChartHeight"
          :emptyText="$t('common.label.noData')"
        />
      </SectionCardGeneric>
    </div>

    <SectionCardGeneric
      :title="$t('view.production.goldLossDashboard.overview.tableSlipMonthlyTitle')"
      icon="bi-table"
      accent="green"
      headerStyle="legend"
      class="section-card-block"
    >
      <BaseDataTable
        :items="slipMonthlyTableRows"
        :totalRecords="slipMonthlyTableRows.length"
        :columns="slipMonthlyColumns"
        :paginator="false"
        :expandable="true"
        dataKey="monthKey"
      >
        <template #monthKeyTemplate="{ data }">{{ formatMonthKeyLabel(data.monthKey) }}</template>
        <template #lossPercentTemplate="{ data }">
          <div class="text-right">{{ formatPercentValue(data.lossPercent) }}</div>
        </template>
        <template #allowedPercentTemplate="{ data }">
          <div class="text-right">{{ data.allowedPercent != null ? formatPercentValue(data.allowedPercent) : '—' }}</div>
        </template>
        <template #overAllowedTemplate="{ data }">
          <div class="text-right" :class="{ 'over-allowed--exceeded': data.overAllowed > 0 }">{{ formatSignedDecimal(data.overAllowed) }}</div>
        </template>

        <template #expansion="{ data }">
          <div class="by-worker-block">
            <div class="by-worker-title">
              <i class="bi bi-people"></i>
              {{ $t('view.production.goldLossDashboard.overview.tableSlipByWorkerTitle') }}
            </div>
            <BaseDataTable
              :items="data.workers"
              :totalRecords="data.workers.length"
              :columns="slipWorkerColumns"
              :paginator="false"
              dataKey="workerCode"
            >
              <template #lossPercentTemplate="{ data: row }">
                <div class="text-right">{{ formatPercentValue(row.lossPercent) }}</div>
              </template>
              <template #allowedPercentTemplate="{ data: row }">
                <div class="text-right">{{ row.allowedPercent != null ? formatPercentValue(row.allowedPercent) : '—' }}</div>
              </template>
              <template #overAllowedTemplate="{ data: row }">
                <div class="text-right" :class="{ 'over-allowed--exceeded': row.overAllowed > 0 }">{{ formatSignedDecimal(row.overAllowed) }}</div>
              </template>
            </BaseDataTable>
          </div>
        </template>

        <template #footer>
          <div class="result-footer">
            <span class="result-footer-label">{{ $t('view.production.goldLossDashboard.overview.tableSlipTotalLabel') }}</span>
            <div class="result-footer-values">
              <span class="result-footer-item">{{ $t('view.production.goldLossDashboard.overview.colSlipCount') }}: {{ formatNumberValue(slipMonthlyGrandTotal.slipCount) }}</span>
              <span class="result-footer-item">{{ $t('view.production.goldLossDashboard.overview.colIssued') }}: {{ formatDecimal(slipMonthlyGrandTotal.issued) }}</span>
              <span class="result-footer-item">{{ $t('view.production.goldLossDashboard.overview.colReturned') }}: {{ formatDecimal(slipMonthlyGrandTotal.returned) }}</span>
              <span class="result-footer-item">{{ $t('view.production.goldLossDashboard.overview.colLoss') }}: {{ formatDecimal(slipMonthlyGrandTotal.loss) }}</span>
              <span class="result-footer-item">{{ $t('view.production.goldLossDashboard.overview.colLossPercent') }}: {{ formatPercentValue(slipMonthlyGrandTotal.lossPercent) }}</span>
              <span class="result-footer-item">{{ $t('view.production.goldLossDashboard.overview.colAllowed') }}: {{ formatDecimal(slipMonthlyGrandTotal.allowed) }} ({{ slipMonthlyGrandTotal.allowedPercent != null ? formatPercentValue(slipMonthlyGrandTotal.allowedPercent) : '—' }})</span>
              <span class="result-footer-item" :class="{ 'over-allowed--exceeded': slipMonthlyGrandTotal.overAllowed > 0 }">{{ $t('view.production.goldLossDashboard.overview.colOverAllowed') }}: {{ formatSignedDecimal(slipMonthlyGrandTotal.overAllowed) }}</span>
            </div>
          </div>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>

    <!-- [PLAN-HIDDEN] banner กระทบยอด PLAN vs SLIP — ต้องเปิดใช้อีกครั้งพร้อมแท็บ reconcile
    <div class="reconcile-banner" :class="{ 'reconcile-banner--alert': isLowCoverage }">
      <i class="bi bi-info-circle-fill"></i>
      <span>{{ reconcileBannerText }}</span>
      <ButtonGeneric
        variant="green"
        icon="bi-arrow-right-circle"
        :label="$t('view.production.goldLossDashboard.overview.goReconcile')"
        @click="goToTab('reconcile')"
      />
    </div>
    -->

    <!-- [PLAN-HIDDEN] กราฟแนวโน้ม %loss รายเดือน แผน เทียบ ใบ — ต้องเปิดใช้อีกครั้งพร้อมแท็บ reconcile
    <SectionCardGeneric
      :title="$t('view.production.goldLossDashboard.overview.chartTitle')"
      icon="bi-graph-up"
      accent="main"
      headerStyle="legend"
      class="section-card-block"
    >
      <ChartGeneric
        type="line"
        :series="chartSeries"
        :options="chartOptions"
        :height="360"
        :emptyText="$t('common.label.noData')"
      />
    </SectionCardGeneric>
    -->

    <SectionCardGeneric
      :title="$t('view.production.goldLossDashboard.overview.actionTitle')"
      icon="bi-list-check"
      accent="main"
      headerStyle="legend"
      class="section-card-block"
    >
      <div v-if="actionItems.length" class="action-list">
        <div v-for="item in visibleActionItems" :key="item.key" class="action-item">
          <span class="action-item__tag" :class="`action-item__tag--${item.tagClass}`">{{ item.tagLabel }}</span>
          <span class="action-item__text">{{ item.text }}</span>
          <ButtonGeneric
            variant="green"
            :label="$t('common.btn.view')"
            @click="goToTab(item.tab)"
          />
        </div>
        <div v-if="hiddenActionItemsCount > 0" class="action-item action-item--more">
          <span class="action-item__text">{{ $t('view.production.goldLossDashboard.overview.actionMoreItems', { count: hiddenActionItemsCount }) }}</span>
          <ButtonGeneric
            variant="green"
            :label="$t('common.btn.view')"
            @click="goToTab('slip-tang')"
          />
        </div>
      </div>
      <div v-else class="action-empty">
        <i class="bi bi-check-circle-fill"></i>
        <span>{{ $t('view.production.goldLossDashboard.overview.actionEmpty') }}</span>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import api from '@/axios/axios-helper.js'
import { formatISOString, formatYearMonth } from '@/services/utils/dayjs.js'
import { CHART_PALETTE, CHART_TOKENS } from '@/services/utils/chart-colors.js'

import SourceStripGeneric from '@/components/generic/SourceStripGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

// แผนกที่มีการคืนทองจริง — เหมือนกับแท็บ Stage/ต่อช่าง
const GOLD_LOSS_STAGE_CODES = [50, 60, 70, 80, 90]

// เกณฑ์ของกฎ "ต้องดำเนินการ" ข้อ 1 และ 4 (ดูพิมพ์เขียว Fig. 3) — [PLAN-HIDDEN] ข้อ 1/4 ปิดอยู่ แต่เก็บ constant ไว้กู้คืนได้
const DIFF_THRESHOLD_PERCENT = 2
const MIN_JOB_COUNT_FOR_ACTION = 10
const LINK_COVERAGE_THRESHOLD = 80
// จำนวนบรรทัดสูงสุดที่โชว์ในกล่อง "ต้องดำเนินการ" ก่อนพับเป็น "และอีก N รายการ"
const ACTION_ITEMS_LIMIT = 5
// จำนวนช่างสูงสุดที่แสดงเป็นแท่งในกราฟอันดับ (สีเดียวไม่ชนกัน แต่แท่งเยอะเกินไปจะอ่านยาก) ที่เหลือรวมเป็น "อื่นๆ"
const MAX_WORKER_BARS = 12
// ความสูงกราฟอันดับต่อ 1 แท่ง (px) — ใช้คำนวณความสูงรวมให้พอดีกับจำนวนช่าง (ตาม pattern barChartHeight ของ ticket-dashboard)
const WORKER_BAR_MIN_HEIGHT = 200
const WORKER_BAR_ROW_HEIGHT = 34

const emptyPlanTotal = () => ({
  rawLoss: 0,
  rawLossPercent: 0,
  jobCount: 0,
  pendingWeight: 0,
  rowsPendingReturn: 0
})

const emptyReconcileSummary = () => ({
  gapUnexplained: 0,
  linkCoveragePercent: 0
})

export default {
  name: 'GoldLossOverviewTabView',

  components: {
    SourceStripGeneric,
    StatCardGeneric,
    SectionCardGeneric,
    ButtonGeneric,
    ChartGeneric,
    BaseDataTable
  },

  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['navigate-tab'],

  data() {
    return {
      planTotal: emptyPlanTotal(),
      tangWorkerRows: [],
      setterWorkerRows: [],
      reconcileSummary: emptyReconcileSummary(),
      reconcileRows: [],
      workerRows: [],
      slipDept: 'tang'
    }
  },

  computed: {
    effectiveStatus() {
      return this.filter.status && this.filter.status.length ? this.filter.status : GOLD_LOSS_STAGE_CODES
    },

    // GoldLossByStageReport เป็นรายเดือน — ยึดเดือนล่าสุดในช่วงวันที่เสมอ (ตามพิมพ์เขียว ข้อ 09)
    period() {
      const end = this.filter.end ? new Date(this.filter.end) : new Date()
      return {
        year: end.getFullYear(),
        month: end.getMonth() + 1
      }
    },

    planPeriodLabel() {
      return formatYearMonth(this.period.year, this.period.month)
    },

    planKpi() {
      return {
        lossPercent: this.planTotal.rawLossPercent || 0,
        rawLoss: this.planTotal.rawLoss || 0,
        jobCount: this.planTotal.jobCount || 0,
        pendingWeight: this.planTotal.pendingWeight || 0,
        pendingCount: this.planTotal.rowsPendingReturn || 0
      }
    },

    nonTestWorkerRows() {
      return this.workerRows.filter((r) => !this.isTestWorker(r))
    },

    // เฉพาะช่างที่ "แย่กว่า" ค่าเฉลี่ยแผนก (diff เป็นบวก) เท่านั้น — ห้ามใช้ Math.abs เพราะจะดึงคนที่ทำได้ดีกว่าเฉลี่ยมากๆ ขึ้นมาแทน
    farthestWorker() {
      const candidates = this.nonTestWorkerRows.filter(
        (r) => (r.jobCount || 0) >= MIN_JOB_COUNT_FOR_ACTION && (r.diffFromStageAvgPercent || 0) > 0
      )
      if (!candidates.length) return null
      return [...candidates].sort((a, b) => (b.diffFromStageAvgPercent || 0) - (a.diffFromStageAvgPercent || 0))[0]
    },

    farthestWorkerSubLabel() {
      if (!this.farthestWorker) return this.$t('view.production.goldLossDashboard.overview.kpiPlanFarthestWorkerEmpty')
      const diff = this.farthestWorker.diffFromStageAvgPercent || 0
      return `${this.farthestWorker.workerName} (${this.farthestWorker.statusName}) +${this.formatDecimal(diff)}${this.$t('view.production.goldLossDashboard.overview.pointUnit')}`
    },

    // ข้อความเสริมที่ว่างเปล่า — สำรองพื้นที่บรรทัด sub-label ของ StatCardGeneric ไว้เสมอ
    // เพื่อให้การ์ดที่ไม่มีคำอธิบายย่อยสูงเท่ากับการ์ดที่มี (ดูข้อ 2 ของแผน)
    emptySubLabel() {
      return ' '
    },

    // map field ของ endpoint ช่างแต่งให้เป็น shape กลาง {workerCode, workerName, year, month, slipCount, issued, returned, loss, allowed, allowedBase}
    normalizedTangRows() {
      return this.tangWorkerRows.map((r) => this.normalizeTangRow(r))
    },

    // ฝั่งช่างฝังไม่มีฟิลด์ loss ตรงๆ ต้องคำนวณจาก totalWeightSend - totalWeightCheck เอง
    normalizedSetterRows() {
      return this.setterWorkerRows.map((r) => this.normalizeSetterRow(r))
    },

    selectedDeptRows() {
      return this.slipDept === 'tang' ? this.normalizedTangRows : this.normalizedSetterRows
    },

    // KPI ต่อแผนก (tang/setter) — รวมยอด + %loss + เกณฑ์ในใบถ่วงน้ำหนัก (ดูหมายเหตุหัวไฟล์) — ต้นทางเดียวกับ
    // กราฟ/ตารางด้านล่างเป๊ะ ไม่ยิง endpoint เพิ่ม
    slipKpiByDept() {
      const combine = (rows) =>
        rows.reduce(
          (acc, r) => {
            acc.slipCount += r.slipCount
            acc.issued += r.issued
            acc.returned += r.returned
            acc.loss += r.loss
            acc.allowed += r.allowed
            acc.allowedBase += r.allowedBase
            return acc
          },
          { slipCount: 0, issued: 0, returned: 0, loss: 0, allowed: 0, allowedBase: 0 }
        )

      const buildKpi = (totals) => ({
        ...totals,
        lossPercent: this.computeLossPercent(totals.loss, totals.issued),
        thresholdPercent: this.computeThresholdPercent(totals.allowed, totals.allowedBase)
      })

      return {
        tang: buildKpi(combine(this.normalizedTangRows)),
        setter: buildKpi(combine(this.normalizedSetterRows))
      }
    },

    // รวมยอดช่างแต่งข้ามเดือนกลับเป็นรายช่างต่อช่วงทั้งหมด — ใช้แทน endpoint แบบไม่ group เดิม
    // (ผลรวมข้ามเดือนเท่ากับยอดรวมทั้งช่วงเป๊ะ จึงไม่ต้องยิง endpoint ซ้ำ) สำหรับกฎ 3 ในกล่อง "ต้องดำเนินการ"
    tangWorkerTotalsAcrossPeriod() {
      const map = new Map()
      this.normalizedTangRows.forEach((r) => {
        const acc = map.get(r.workerCode) || {
          workerCode: r.workerCode,
          workerName: r.workerName,
          slipCount: 0,
          totalIssued: 0,
          totalReturned: 0,
          totalRawLoss: 0
        }
        acc.slipCount += r.slipCount
        acc.totalIssued += r.issued
        acc.totalReturned += r.returned
        acc.totalRawLoss += r.loss
        map.set(r.workerCode, acc)
      })
      return [...map.values()]
    },

    // ช่วงเดือนแบบเต็ม (รวมเดือนที่ไม่มีใบ) — ใช้ได้เฉพาะตอน filter ระบุวันเริ่ม/สิ้นสุดชัดเจน
    // ถ้าไม่ระบุ (ดูข้อมูลทั้งหมด) จะ fallback ไปใช้เฉพาะเดือนที่มีข้อมูลจริงแทน (ดู slipMonthKeys)
    explicitMonthRange() {
      if (!this.filter.start || !this.filter.end) return null
      return this.buildMonthRange(this.filter.start, this.filter.end)
    },

    slipMonthKeys() {
      if (this.explicitMonthRange) {
        return this.explicitMonthRange.map((m) => this.monthKeyOf(m.year, m.month))
      }
      const set = new Set()
      this.normalizedTangRows.forEach((r) => set.add(this.monthKeyOf(r.year, r.month)))
      this.normalizedSetterRows.forEach((r) => set.add(this.monthKeyOf(r.year, r.month)))
      return [...set].sort()
    },

    tangMonthlyTotals() {
      return this.aggregateMonthlyTotals(this.normalizedTangRows)
    },

    setterMonthlyTotals() {
      return this.aggregateMonthlyTotals(this.normalizedSetterRows)
    },

    // กราฟที่ 1 — แท่งคู่ต่อเดือน (ช่างแต่ง/ช่างฝัง) + เส้น %loss ต่อแผนก + เส้นเกณฑ์ในใบต่อแผนก (ประ)
    // เดือนที่ไม่มีใบของแผนกนั้น (ไม่มีแถว หรือ issued = 0) ให้ %loss/เกณฑ์เป็น null ไม่ใช่ 0 กันเส้นดิ่งลง 0% หลอกตา
    slipCompareSeries() {
      const tangLabel = this.$t('view.production.goldLossDashboard.overview.slipDeptTang')
      const setterLabel = this.$t('view.production.goldLossDashboard.overview.slipDeptSetter')

      const tangLossData = this.slipMonthKeys.map((k) => this.roundDecimal((this.tangMonthlyTotals.get(k) || {}).loss || 0))
      const setterLossData = this.slipMonthKeys.map((k) => this.roundDecimal((this.setterMonthlyTotals.get(k) || {}).loss || 0))

      const tangPctData = this.slipMonthKeys.map((k) => {
        const row = this.tangMonthlyTotals.get(k)
        return row && row.issued > 0 ? this.computeLossPercent(row.loss, row.issued) : null
      })
      const setterPctData = this.slipMonthKeys.map((k) => {
        const row = this.setterMonthlyTotals.get(k)
        return row && row.issued > 0 ? this.computeLossPercent(row.loss, row.issued) : null
      })
      const tangThresholdData = this.slipMonthKeys.map((k) => {
        const row = this.tangMonthlyTotals.get(k)
        return row && row.issued > 0 ? this.computeThresholdPercent(row.allowed, row.allowedBase) : null
      })
      const setterThresholdData = this.slipMonthKeys.map((k) => {
        const row = this.setterMonthlyTotals.get(k)
        return row && row.issued > 0 ? this.computeThresholdPercent(row.allowed, row.allowedBase) : null
      })

      return [
        { name: tangLabel, type: 'column', data: tangLossData },
        { name: setterLabel, type: 'column', data: setterLossData },
        {
          name: this.$t('view.production.goldLossDashboard.overview.chartSlipComparePctSeries', { dept: tangLabel }),
          type: 'line',
          data: tangPctData
        },
        {
          name: this.$t('view.production.goldLossDashboard.overview.chartSlipComparePctSeries', { dept: setterLabel }),
          type: 'line',
          data: setterPctData
        },
        {
          name: this.$t('view.production.goldLossDashboard.overview.chartSlipCompareThresholdSeries', { dept: tangLabel }),
          type: 'line',
          data: tangThresholdData
        },
        {
          name: this.$t('view.production.goldLossDashboard.overview.chartSlipCompareThresholdSeries', { dept: setterLabel }),
          type: 'line',
          data: setterThresholdData
        }
      ]
    },

    slipCompareOptions() {
      const tangLabel = this.$t('view.production.goldLossDashboard.overview.slipDeptTang')
      const setterLabel = this.$t('view.production.goldLossDashboard.overview.slipDeptSetter')
      const pctTangName = this.$t('view.production.goldLossDashboard.overview.chartSlipComparePctSeries', { dept: tangLabel })
      const pctSetterName = this.$t('view.production.goldLossDashboard.overview.chartSlipComparePctSeries', { dept: setterLabel })
      const thresholdTangName = this.$t('view.production.goldLossDashboard.overview.chartSlipCompareThresholdSeries', { dept: tangLabel })
      const thresholdSetterName = this.$t('view.production.goldLossDashboard.overview.chartSlipCompareThresholdSeries', { dept: setterLabel })

      const series = this.slipCompareSeries
      const weightValues = [...series[0].data, ...series[1].data]
      const pctValues = [...series[2].data, ...series[3].data, ...series[4].data, ...series[5].data].filter(
        (v) => v !== null && v !== undefined
      )
      const weightMaxRaw = weightValues.length ? Math.max(...weightValues) : 0
      const pctMaxRaw = pctValues.length ? Math.max(...pctValues) : 0
      // ให้ทั้ง 2 แท่ง/4 เส้นใช้สเกลเดียวกัน (แม้แกนที่ซ่อนจะไม่แสดง) ไม่งั้นความสูงเทียบกันไม่ได้จริง
      const weightMax = weightMaxRaw > 0 ? Math.ceil(weightMaxRaw * 1.2) : undefined
      const pctMax = pctMaxRaw > 0 ? Math.ceil(pctMaxRaw * 1.2) : undefined

      const pctFormatter = (v) => (v === null || v === undefined ? '—' : `${Number(v).toFixed(2)}%`)

      return {
        chart: { stacked: false },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.green, CHART_TOKENS.primary, CHART_TOKENS.green, CHART_TOKENS.primary, CHART_TOKENS.green],
        plotOptions: { bar: { columnWidth: '45%' } },
        fill: { opacity: [0.85, 0.85, 1, 1, 1, 1] },
        stroke: { width: [0, 0, 3, 3, 2, 2], dashArray: [0, 0, 0, 0, 6, 6], curve: 'smooth' },
        markers: { size: [0, 0, 4, 4, 4, 4], strokeWidth: 0 },
        xaxis: { categories: this.slipMonthKeys.map((k) => this.formatMonthKeyLabel(k)) },
        yaxis: [
          {
            seriesName: tangLabel,
            min: 0,
            max: weightMax,
            title: { text: this.$t('view.production.goldLossByStage.unitGram') },
            labels: { formatter: (v) => this.formatDecimal(v) }
          },
          {
            seriesName: setterLabel,
            min: 0,
            max: weightMax,
            show: false
          },
          {
            seriesName: pctTangName,
            opposite: true,
            min: 0,
            max: pctMax,
            labels: { formatter: pctFormatter }
          },
          {
            seriesName: pctSetterName,
            opposite: true,
            min: 0,
            max: pctMax,
            show: false
          },
          {
            seriesName: thresholdTangName,
            opposite: true,
            min: 0,
            max: pctMax,
            show: false
          },
          {
            seriesName: thresholdSetterName,
            opposite: true,
            min: 0,
            max: pctMax,
            show: false
          }
        ],
        tooltip: {
          shared: true,
          y: {
            formatter: (value, opts) => {
              if (value === null || value === undefined) return '—'
              const seriesIndex = opts && typeof opts.seriesIndex === 'number' ? opts.seriesIndex : 0
              return seriesIndex <= 1 ? this.formatWeightValue(value) : `${Number(value).toFixed(2)}%`
            }
          }
        }
      }
    },

    // รวม loss/เกณฑ์ในใบทั้งช่วงต่อช่าง (ของแผนกที่เลือกอยู่) เรียงมากไปน้อย — ใช้ทั้งตัด top N และเป็นข้อมูลกราฟอันดับ
    selectedDeptWorkerTotals() {
      const map = new Map()
      this.selectedDeptRows.forEach((r) => {
        const acc = map.get(r.workerCode) || {
          workerCode: r.workerCode,
          workerName: r.workerName,
          totalLoss: 0,
          totalAllowed: 0,
          totalAllowedBase: 0
        }
        acc.totalLoss += r.loss
        acc.totalAllowed += r.allowed
        acc.totalAllowedBase += r.allowedBase
        map.set(r.workerCode, acc)
      })
      return [...map.values()].sort((a, b) => b.totalLoss - a.totalLoss)
    },

    topWorkerCodes() {
      return this.selectedDeptWorkerTotals.slice(0, MAX_WORKER_BARS).map((w) => w.workerCode)
    },

    hasOtherWorkers() {
      return this.selectedDeptWorkerTotals.length > MAX_WORKER_BARS
    },

    selectedDeptColor() {
      return this.slipDept === 'tang' ? CHART_TOKENS.primary : CHART_TOKENS.green
    },

    // เกณฑ์ในใบเฉลี่ยถ่วงน้ำหนักของแผนกที่เลือกอยู่ ทั้งช่วงที่กรอง — ใช้แสดงเป็น chip ข้างตัวสลับแผนก
    selectedDeptThresholdLabel() {
      const percent = this.slipKpiByDept[this.slipDept].thresholdPercent
      return percent != null ? this.formatPercentValue(percent) : '—'
    },

    // กราฟที่ 2 — แท่งเรียงอันดับ loss รวมทั้งช่วง (สีตามแผนก) ของทุกช่างในแผนกที่เลือก เกิน 12 คนค่อยรวมท้ายเป็น "อื่นๆ"
    slipByWorkerRankingRows() {
      const rows = this.selectedDeptWorkerTotals.slice(0, MAX_WORKER_BARS).map((w) => ({
        label: `${w.workerCode} ${w.workerName}`,
        loss: this.roundDecimal(w.totalLoss),
        allowed: this.roundDecimal(w.totalAllowed),
        thresholdPercent: this.computeThresholdPercent(w.totalAllowed, w.totalAllowedBase)
      }))

      if (this.hasOtherWorkers) {
        const otherTotals = this.selectedDeptWorkerTotals.slice(MAX_WORKER_BARS).reduce(
          (acc, w) => {
            acc.loss += w.totalLoss
            acc.allowed += w.totalAllowed
            acc.allowedBase += w.totalAllowedBase
            return acc
          },
          { loss: 0, allowed: 0, allowedBase: 0 }
        )
        rows.push({
          label: this.$t('view.production.goldLossDashboard.overview.otherWorkersLabel'),
          loss: this.roundDecimal(otherTotals.loss),
          allowed: this.roundDecimal(otherTotals.allowed),
          thresholdPercent: this.computeThresholdPercent(otherTotals.allowed, otherTotals.allowedBase)
        })
      }

      // apex bar แนวนอนวาด categories[0] ไว้บนสุดเสมอ — ไม่ต้อง reverse, ปล่อย desc (มากสุดก่อน) ให้อันดับ 1 อยู่บนสุดพอดี
      return rows
    },

    // ให้ ChartGeneric แสดง empty state ได้ถูกต้องเมื่อไม่มีช่างเลย — data point เป็น {x,y,goals} object
    // (goals ใส่เฉพาะตอน allowed > 0 กันเส้นยอมให้โผล่ตอนไม่มีเกณฑ์)
    slipByWorkerSeries() {
      const goalName = this.$t('view.production.goldLossDashboard.overview.chartGoalAllowedLoss')
      return [
        {
          name: this.$t('view.production.goldLossDashboard.overview.colLoss'),
          data: this.slipByWorkerRankingRows.map((r) => {
            const point = { x: r.label, y: r.loss }
            if (r.allowed > 0) {
              point.goals = [
                {
                  name: goalName,
                  value: r.allowed,
                  strokeWidth: 3,
                  strokeHeight: 14,
                  strokeColor: CHART_TOKENS.sub
                }
              ]
            }
            return point
          })
        }
      ]
    },

    slipByWorkerChartHeight() {
      return Math.max(WORKER_BAR_MIN_HEIGHT, this.slipByWorkerRankingRows.length * WORKER_BAR_ROW_HEIGHT + 60)
    },

    // กันเส้นยอมให้ (goal marker) และ value label โผล่นอกกรอบแกน — เผื่อพื้นที่ label ที่ไปอยู่นอกแท่งแล้วมากกว่าเดิม
    slipByWorkerXaxisMax() {
      const values = this.slipByWorkerRankingRows.flatMap((r) => [r.loss || 0, r.allowed || 0])
      const max = values.length ? Math.max(...values) : 0
      return max > 0 ? Math.ceil(max * 1.25) : undefined
    },

    slipByWorkerOptions() {
      return {
        chart: { type: 'bar', stacked: false, toolbar: { show: false } },
        colors: [this.selectedDeptColor],
        plotOptions: {
          bar: { horizontal: true, borderRadius: 4, barHeight: '65%', dataLabels: { position: 'top' } }
        },
        // label วางที่ปลายแท่ง (position: 'top' ด้านบน) แล้วดันออกด้วย offsetX บวกให้พ้นแท่ง — สีเข้มกลาง
        // (CHART_TOKENS.sub) แทนสีเดียวกับแท่งเพื่อให้อ่านออกตอนอยู่นอกแท่ง
        dataLabels: {
          enabled: true,
          formatter: (v) => this.formatWeightValue(v),
          style: { fontSize: '12px', fontWeight: 600, colors: [CHART_TOKENS.sub] },
          offsetX: 40
        },
        // gotcha ApexCharts: horizontal bar สลับ "แกนไหนรับ formatter" กับที่ชื่อ prop บอกไว้ —
        // xaxis ยังคือแกนตัวเลข (loss) ที่ต้อง format/กำหนด max ที่นี่ ส่วนชื่อช่างมาจาก data point {x,y,goals}
        // แทน xaxis.categories (ตัดออกแล้วเพราะใช้ data point object แทน)
        xaxis: {
          max: this.slipByWorkerXaxisMax,
          title: { text: this.$t('view.production.goldLossByStage.unitGram') },
          labels: { formatter: (v) => this.formatDecimal(v) }
        },
        yaxis: {
          labels: { style: { fontSize: '12px' } }
        },
        grid: { xaxis: { lines: { show: true } } },
        tooltip: {
          y: {
            formatter: (value, opts) => {
              const dataPointIndex = opts && typeof opts.dataPointIndex === 'number' ? opts.dataPointIndex : -1
              const row = this.slipByWorkerRankingRows[dataPointIndex]
              if (!row) return this.formatWeightValue(value)
              return this.$t('view.production.goldLossDashboard.overview.chartRankingTooltip', {
                loss: this.formatWeightValue(row.loss),
                allowed: this.formatWeightValue(row.allowed),
                percent: row.thresholdPercent != null ? this.formatPercentValue(row.thresholdPercent) : '—'
              })
            }
          }
        }
      }
    },

    slipMonthlyColumns() {
      return [
        { field: 'monthKey', header: this.$t('view.production.goldLossDashboard.overview.colMonth'), sortable: false, minWidth: '110px' },
        { field: 'slipCount', header: this.$t('view.production.goldLossDashboard.overview.colSlipCount'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'issued', header: this.$t('view.production.goldLossDashboard.overview.colIssued'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'returned', header: this.$t('view.production.goldLossDashboard.overview.colReturned'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'loss', header: this.$t('view.production.goldLossDashboard.overview.colLoss'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'lossPercent', header: this.$t('view.production.goldLossDashboard.overview.colLossPercent'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'allowed', header: this.$t('view.production.goldLossDashboard.overview.colAllowed'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'allowedPercent', header: this.$t('view.production.goldLossDashboard.overview.colAllowedPercent'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'overAllowed', header: this.$t('view.production.goldLossDashboard.overview.colOverAllowed'), sortable: false, minWidth: '130px', align: 'right' }
      ]
    },

    slipWorkerColumns() {
      return [
        { field: 'workerCode', header: this.$t('view.production.goldLossDashboard.overview.colWorkerCode'), sortable: false, minWidth: '110px' },
        { field: 'workerName', header: this.$t('view.production.goldLossDashboard.overview.colWorkerName'), sortable: false, minWidth: '160px' },
        { field: 'slipCount', header: this.$t('view.production.goldLossDashboard.overview.colSlipCount'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'issued', header: this.$t('view.production.goldLossDashboard.overview.colIssued'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'returned', header: this.$t('view.production.goldLossDashboard.overview.colReturned'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'loss', header: this.$t('view.production.goldLossDashboard.overview.colLoss'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'lossPercent', header: this.$t('view.production.goldLossDashboard.overview.colLossPercent'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'allowed', header: this.$t('view.production.goldLossDashboard.overview.colAllowed'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'allowedPercent', header: this.$t('view.production.goldLossDashboard.overview.colAllowedPercent'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'overAllowed', header: this.$t('view.production.goldLossDashboard.overview.colOverAllowed'), sortable: false, minWidth: '130px', align: 'right' }
      ]
    },

    // ตารางที่ 3.5 — แถวเดือน (zero-fill เดือนที่ไม่มีใบ) กางดูรายช่างได้
    // ยอดแถวเดือน = ผลบวกของช่างในเดือนนั้นเสมอ เพราะสร้างจากอาเรย์ workers ตัวเดียวกัน (self-check โดยสร้าง)
    slipMonthlyTableRows() {
      const map = new Map()
      this.slipMonthKeys.forEach((key) => {
        const [y, m] = key.split('-').map(Number)
        map.set(key, { monthKey: key, year: y, month: m, slipCount: 0, issued: 0, returned: 0, loss: 0, allowed: 0, allowedBase: 0, workers: [] })
      })

      this.selectedDeptRows.forEach((r) => {
        const key = this.monthKeyOf(r.year, r.month)
        if (!map.has(key)) {
          map.set(key, { monthKey: key, year: r.year, month: r.month, slipCount: 0, issued: 0, returned: 0, loss: 0, allowed: 0, allowedBase: 0, workers: [] })
        }
        const row = map.get(key)
        row.slipCount += r.slipCount
        row.issued += r.issued
        row.returned += r.returned
        row.loss += r.loss
        row.allowed += r.allowed
        row.allowedBase += r.allowedBase
        row.workers.push({
          workerCode: r.workerCode,
          workerName: r.workerName,
          slipCount: r.slipCount,
          issued: r.issued,
          returned: r.returned,
          loss: r.loss,
          lossPercent: this.computeLossPercent(r.loss, r.issued),
          allowed: r.allowed,
          allowedPercent: this.computeThresholdPercent(r.allowed, r.allowedBase),
          overAllowed: r.loss - r.allowed
        })
      })

      return [...map.values()]
        .map((row) => ({
          ...row,
          lossPercent: this.computeLossPercent(row.loss, row.issued),
          allowedPercent: this.computeThresholdPercent(row.allowed, row.allowedBase),
          overAllowed: row.loss - row.allowed,
          workers: [...row.workers].sort((a, b) => b.loss - a.loss)
        }))
        .sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1))
    },

    slipMonthlyGrandTotal() {
      const total = this.slipMonthlyTableRows.reduce(
        (acc, row) => {
          acc.slipCount += row.slipCount
          acc.issued += row.issued
          acc.returned += row.returned
          acc.loss += row.loss
          acc.allowed += row.allowed
          acc.allowedBase += row.allowedBase
          return acc
        },
        { slipCount: 0, issued: 0, returned: 0, loss: 0, allowed: 0, allowedBase: 0 }
      )
      total.lossPercent = this.computeLossPercent(total.loss, total.issued)
      total.allowedPercent = this.computeThresholdPercent(total.allowed, total.allowedBase)
      total.overAllowed = total.loss - total.allowed
      return total
    },

    isLowCoverage() {
      return (this.reconcileSummary.linkCoveragePercent || 0) < LINK_COVERAGE_THRESHOLD
    },

    reconcileBannerText() {
      return this.$t('view.production.goldLossDashboard.overview.reconcileNote', {
        gap: this.formatWeightValue(this.reconcileSummary.gapUnexplained)
      })
    },

    // เฉพาะแผนกที่มีใบจริงในช่วงที่กรอง (sum slipCount > 0) — แผนกที่ไม่มีระบบใบ (เช่น หลอม/พ่นทราย)
    // จะมี slipLossPercent เป็น 0 ทุกเดือนเสมอ ตัดทิ้งไม่ให้กราฟรกด้วยเส้นแบนที่ 0 (data-driven ไม่ hardcode รหัสแผนก)
    departmentsPresent() {
      const map = new Map()
      this.reconcileRows.forEach((r) => {
        const info = map.get(r.statusCode) || { statusName: r.statusName, slipCount: 0 }
        info.slipCount += r.slipCount || 0
        map.set(r.statusCode, info)
      })
      return [...map.entries()]
        .filter(([, info]) => info.slipCount > 0)
        .sort((a, b) => a[0] - b[0])
        .map(([statusCode, info]) => ({ statusCode, statusName: info.statusName }))
    },

    monthCategories() {
      const set = new Set(this.reconcileRows.map((r) => `${r.year}-${String(r.month).padStart(2, '0')}`))
      return [...set].sort()
    },

    chartSeries() {
      const series = []
      this.departmentsPresent.forEach((dept) => {
        const rowsByMonth = {}
        this.reconcileRows
          .filter((r) => r.statusCode === dept.statusCode)
          .forEach((r) => {
            rowsByMonth[`${r.year}-${String(r.month).padStart(2, '0')}`] = r
          })

        series.push({
          name: `${dept.statusName} - ${this.$t('view.production.goldLossReconcile.chartSeriesPlanSuffix')}`,
          data: this.monthCategories.map((catKey) => {
            const row = rowsByMonth[catKey]
            return row ? row.planLossPercent : null
          })
        })
        series.push({
          name: `${dept.statusName} - ${this.$t('view.production.goldLossReconcile.chartSeriesSlipSuffix')}`,
          data: this.monthCategories.map((catKey) => {
            const row = rowsByMonth[catKey]
            return row ? row.slipLossPercent : null
          })
        })
      })
      return series
    },

    chartOptions() {
      const colors = []
      const dashArray = []
      this.departmentsPresent.forEach((_, index) => {
        const color = CHART_PALETTE[index % CHART_PALETTE.length]
        colors.push(color, color)
        dashArray.push(0, 6)
      })

      return {
        colors,
        xaxis: {
          categories: this.monthCategories.map((catKey) => {
            const [y, m] = catKey.split('-')
            return formatYearMonth(Number(y), Number(m))
          })
        },
        stroke: { curve: 'smooth', width: 2, dashArray },
        yaxis: {
          labels: {
            formatter: (v) => `${Number(v).toFixed(2)}%`
          }
        }
      }
    },

    // กฎ 1 — PLAN: เฉพาะช่างที่ "แย่กว่า" ค่าเฉลี่ยแผนกเกิน 2 จุด และงาน >= 10 (ไม่รวมช่างทดสอบ — แยกไปกฎ 2)
    // ห้ามใช้ Math.abs — ไม่งั้นช่างที่ทำได้ดีกว่าเฉลี่ยมากๆ จะโดนขึ้นเตือนเหมือนเป็นปัญหา
    // เรียงจากห่างเฉลี่ยมากสุดก่อน (แย่สุดก่อน) เพื่อให้ตอน slice 5 รายการ คนที่ควรรีบดูอยู่บนสุดเสมอ
    planHighDiffRows() {
      return this.nonTestWorkerRows
        .filter((r) => (r.jobCount || 0) >= MIN_JOB_COUNT_FOR_ACTION && (r.diffFromStageAvgPercent || 0) > DIFF_THRESHOLD_PERCENT)
        .sort((a, b) => (b.diffFromStageAvgPercent || 0) - (a.diffFromStageAvgPercent || 0))
    },

    actionItems() {
      const items = []

      // [PLAN-HIDDEN] กฎ 1 — PLAN: เฉพาะช่างที่ "แย่กว่า" ค่าเฉลี่ยแผนกเกิน 2 จุด
      // this.planHighDiffRows.forEach((r) => {
      //   items.push({
      //     key: `plan-worker-${r.statusCode}-${r.workerCode}`,
      //     tagClass: 'plan',
      //     tagLabel: 'PLAN',
      //     tab: 'worker',
      //     text: this.$t('view.production.goldLossDashboard.overview.actionPlanHighDiff', {
      //       code: r.workerCode,
      //       name: r.workerName,
      //       dept: r.statusName,
      //       percent: this.formatDecimal(r.lossPercent),
      //       diff: `+${this.formatDecimal(r.diffFromStageAvgPercent)}`,
      //       jobCount: this.formatNumberValue(r.jobCount)
      //     })
      //   })
      // })

      // [PLAN-HIDDEN] กฎ 2 — PLAN: พบช่างทดสอบที่มีข้อมูลจริงปนอยู่ — รวมยอดข้ามแผนกเป็น 1 บรรทัดต่อ 1 รหัสช่าง
      // const testWorkerGroups = new Map()
      // this.workerRows
      //   .filter((r) => this.isTestWorker(r) && (r.jobCount || 0) > 0)
      //   .forEach((r) => {
      //     const key = r.workerCode || r.workerName
      //     const group = testWorkerGroups.get(key) || { workerName: r.workerName, jobCount: 0, weight: 0 }
      //     group.jobCount += r.jobCount || 0
      //     group.weight += r.sumGoldWeightSend || 0
      //     testWorkerGroups.set(key, group)
      //   })
      // testWorkerGroups.forEach((group, key) => {
      //   items.push({
      //     key: `plan-test-${key}`,
      //     tagClass: 'plan',
      //     tagLabel: 'PLAN',
      //     tab: 'worker',
      //     text: this.$t('view.production.goldLossDashboard.overview.actionPlanTestWorker', {
      //       name: group.workerName,
      //       jobCount: this.formatNumberValue(group.jobCount),
      //       weight: this.formatWeightValue(group.weight)
      //     })
      //   })
      // })

      // กฎ 3 — SLIP: ช่างแต่ง (รวมทุกใบทั้งช่วง) ที่คืนมากกว่าจ่าย — endpoint นี้รวมยอดระดับช่าง ไม่ใช่ระดับใบ
      // จึงระบุเป็น "ช่าง" ไม่ใช่เลขที่ใบเดี่ยวๆ (เฉพาะช่างแต่ง — ฝั่งช่างฝังไม่มีฟิลด์ loss ดิบแบบเดียวกัน)
      this.tangWorkerTotalsAcrossPeriod
        .filter((r) => (r.totalRawLoss || 0) < 0)
        .forEach((r) => {
          items.push({
            key: `slip-negative-${r.workerCode}`,
            tagClass: 'slip',
            tagLabel: 'SLIP',
            tab: 'slip-tang',
            text: this.$t('view.production.goldLossDashboard.overview.actionSlipNegative', {
              code: r.workerCode,
              name: r.workerName,
              weight: this.formatWeightValue(Math.abs(r.totalRawLoss)),
              slipCount: this.formatNumberValue(r.slipCount)
            })
          })
        })

      // [PLAN-HIDDEN] กฎ 4 — BOTH: % ผูกใบกับงานต่ำกว่าเกณฑ์
      // if (this.isLowCoverage) {
      //   items.push({
      //     key: 'both-low-coverage',
      //     tagClass: 'both',
      //     tagLabel: 'BOTH',
      //     tab: 'reconcile',
      //     text: this.$t('view.production.goldLossDashboard.overview.actionLowCoverage', {
      //       percent: this.formatPercentValue(this.reconcileSummary.linkCoveragePercent)
      //     })
      //   })
      // }

      return items
    },

    // จำกัดไว้ 5 บรรทัดแรก (เรียงตามความรุนแรงอยู่แล้วจาก actionItems) กันรายการยาวจนของสำคัญจมหาย
    visibleActionItems() {
      return this.actionItems.slice(0, ACTION_ITEMS_LIMIT)
    },

    hiddenActionItemsCount() {
      return Math.max(0, this.actionItems.length - ACTION_ITEMS_LIMIT)
    }
  },

  watch: {
    filter: {
      handler() {
        this.fetchAll()
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    async fetchAll() {
      await Promise.all([
        // [PLAN-HIDDEN] this.fetchPlanReport(),
        this.fetchTangWorkerReport(),
        this.fetchSetterWorkerReport()
        // [PLAN-HIDDEN] this.fetchReconcileReport(),
        // [PLAN-HIDDEN] this.fetchWorkerReport()
      ])
    },

    async fetchPlanReport() {
      const res = await api.jewelry.post('Production/Plan/GoldLossByStageReport', {
        year: this.period.year,
        month: this.period.month,
        status: this.effectiveStatus
      })
      this.planTotal = res?.total ? { ...res.total } : emptyPlanTotal()
    },

    async fetchTangWorkerReport() {
      const res = await api.jewelry.post(
        'Worker/ReportGoldLossTangByWorker',
        {
          take: 0,
          skip: 0,
          sort: [],
          search: {
            requestDateStart: this.filter.start ? formatISOString(this.filter.start) : null,
            requestDateEnd: this.filter.end ? formatISOString(this.filter.end) : null,
            groupByMonth: true
          }
        },
        { skipLoading: true }
      )
      this.tangWorkerRows = res?.data || []
    },

    async fetchSetterWorkerReport() {
      const res = await api.jewelry.post(
        'Worker/ReportGoldLossSlipByWorker',
        {
          take: 0,
          skip: 0,
          sort: [],
          search: {
            requestDateStart: this.filter.start ? formatISOString(this.filter.start) : null,
            requestDateEnd: this.filter.end ? formatISOString(this.filter.end) : null,
            groupByMonth: true
          }
        },
        { skipLoading: true }
      )
      this.setterWorkerRows = res?.data || []
    },

    async fetchReconcileReport() {
      const res = await api.jewelry.post('Production/Plan/GoldLossReconcileReport', {
        start: this.filter.start ? formatISOString(this.filter.start) : null,
        end: this.filter.end ? formatISOString(this.filter.end) : null,
        status: this.effectiveStatus,
        workerCode: null
      })
      this.reconcileSummary = res?.summary ? { ...res.summary } : emptyReconcileSummary()
      this.reconcileRows = res?.rows || []
    },

    async fetchWorkerReport() {
      const res = await api.jewelry.post(
        'Production/Plan/GoldLossByWorkerReport',
        {
          search: {
            start: this.filter.start ? formatISOString(this.filter.start) : null,
            end: this.filter.end ? formatISOString(this.filter.end) : null,
            status: this.effectiveStatus,
            workerCode: null,
            gold: null,
            minJobCount: 1
          }
        },
        { skipLoading: true }
      )
      this.workerRows = res?.rows || []
    },

    isTestWorker(row) {
      const code = (row.workerCode || '').toUpperCase()
      const name = (row.workerName || '').toUpperCase()
      return code.includes('TEST') || name.includes('TEST')
    },

    setSlipDept(value) {
      if (this.slipDept === value) return
      this.slipDept = value
    },

    normalizeTangRow(row) {
      return {
        workerCode: row.workerCode,
        workerName: row.workerName,
        year: row.year,
        month: row.month,
        slipCount: row.slipCount || 0,
        issued: row.totalIssued || 0,
        returned: row.totalReturned || 0,
        loss: row.totalRawLoss || 0,
        allowed: row.totalAllowedLoss || 0,
        allowedBase: row.totalAllowedLossBase || 0
      }
    },

    normalizeSetterRow(row) {
      const issued = row.totalWeightSend || 0
      const returned = row.totalWeightCheck || 0
      return {
        workerCode: row.workerCode,
        workerName: row.workerName,
        year: row.year,
        month: row.month,
        slipCount: row.slipCount || 0,
        issued,
        returned,
        loss: issued - returned,
        allowed: row.totalWeightLossAllowed || 0,
        allowedBase: returned
      }
    },

    monthKeyOf(year, month) {
      return `${year}-${String(month).padStart(2, '0')}`
    },

    // สร้างรายเดือนแบบเต็มช่วง (รวมเดือนที่ไม่มีใบ) — เรียกเฉพาะตอนมีวันเริ่ม/สิ้นสุดชัดเจนเท่านั้น
    buildMonthRange(startDate, endDate) {
      const months = []
      let cursor = dayjs(startDate).startOf('month')
      const last = dayjs(endDate).startOf('month')
      let guard = 0
      while (cursor.valueOf() <= last.valueOf() && guard < 120) {
        months.push({ year: cursor.year(), month: cursor.month() + 1 })
        cursor = cursor.add(1, 'month')
        guard += 1
      }
      return months
    },

    formatMonthKeyLabel(key) {
      const [y, m] = key.split('-').map(Number)
      return formatYearMonth(y, m)
    },

    computeLossPercent(loss, issued) {
      return issued ? Math.round((loss / issued) * 100 * 100) / 100 : 0
    },

    // "เกณฑ์ในใบ" ถ่วงน้ำหนักตามน้ำหนักทอง — allowedBase <= 0 (ยังไม่มีข้อมูล/ฟิลด์ใหม่ยังไม่ deploy) ถือว่าไม่มีเกณฑ์
    computeThresholdPercent(allowed, allowedBase) {
      return allowedBase > 0 ? Math.round((allowed / allowedBase) * 100 * 100) / 100 : null
    },

    roundDecimal(value) {
      return Math.round((value || 0) * 100) / 100
    },

    aggregateMonthlyTotals(rows) {
      const map = new Map()
      rows.forEach((r) => {
        const key = this.monthKeyOf(r.year, r.month)
        const acc = map.get(key) || { issued: 0, loss: 0, allowed: 0, allowedBase: 0, slipCount: 0 }
        acc.issued += r.issued
        acc.loss += r.loss
        acc.allowed += r.allowed
        acc.allowedBase += r.allowedBase
        acc.slipCount += r.slipCount
        map.set(key, acc)
      })
      return map
    },

    goToTab(tab) {
      this.$emit('navigate-tab', tab)
    },

    // subLabel ของการ์ด Loss รวม — มีเกณฑ์ในใบ (thresholdPercent != null) ก็โชว์เทียบด้วย ไม่มีก็โชว์แค่ %ของที่เบิก
    lossSubLabel(deptKpi) {
      if (deptKpi.thresholdPercent != null) {
        return this.$t('view.production.goldLossDashboard.overview.kpiSlipLossPercentSub', {
          percent: this.formatPercentValue(deptKpi.lossPercent),
          threshold: this.formatPercentValue(deptKpi.thresholdPercent)
        })
      }
      return this.$t('view.production.goldLossDashboard.overview.kpiSlipLossPercentSubNoThreshold', {
        percent: this.formatPercentValue(deptKpi.lossPercent)
      })
    },

    formatDecimal(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    },

    formatNumberValue(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    formatWeightValue(value) {
      return `${this.formatDecimal(value)} ${this.$t('view.production.goldLossByStage.unitGram')}`
    },

    formatSignedWeightValue(value) {
      const num = value || 0
      const sign = num > 0 ? '+' : ''
      return `${sign}${this.formatDecimal(num)} ${this.$t('view.production.goldLossByStage.unitGram')}`
    },

    formatSignedDecimal(value) {
      const num = value || 0
      const sign = num > 0 ? '+' : ''
      return `${sign}${this.formatDecimal(num)}`
    },

    formatPercentValue(value) {
      return `${this.formatDecimal(value)}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.charts-row-b {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi-card {
  position: relative;
  height: 100%;

  :deep(.stat-card) {
    height: 100%;
  }

  &--alert :deep(.stat-value) {
    color: var(--base-warning);
  }
}

// เดิมเป็นป้ายพื้นทึบ+ตัวอักษรขาว เด่นเกินจนแย่งสายตาจากตัวเลข — เปลี่ยนเป็น outline chip จางๆ แทน
.kpi-card__tag {
  position: absolute;
  top: -6px;
  right: var(--sp-sm);
  z-index: 1;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1.4;
  padding: 0 5px;
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  border: 1px solid currentColor;
  opacity: 0.7;

  &--plan {
    color: var(--base-font-color);
  }

  &--slip {
    color: var(--base-green);
  }
}

.slip-dept-toggle-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-md);

  .title-text {
    white-space: nowrap;
    font-weight: 600;
    color: var(--base-font-color);
  }
}

.slip-dept-toggle-row__threshold {
  margin-left: auto;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  white-space: nowrap;
}

.goal-legend-tick {
  display: inline-block;
  width: 3px;
  height: 14px;
  background: var(--base-sub-color);
  vertical-align: middle;
  margin-right: var(--sp-xs);
}

.over-allowed--exceeded {
  color: var(--base-red);
  font-weight: 700;
}

.group-by-toggle {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.group-by-toggle__btn {
  border: none;
  background: var(--color-card-bg);
  padding: var(--sp-xs) var(--sp-lg);
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--base-sub-color);
  cursor: pointer;

  & + & {
    border-left: 1px solid var(--color-border);
  }

  &:hover {
    background: var(--color-highlight-bg);
  }

  &--active {
    background: var(--base-green);
    color: #fff;
  }
}

.by-worker-block {
  padding: var(--sp-md) var(--sp-lg);
}

.by-worker-title {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  font-weight: 700;
  color: var(--base-font-color);
  margin-bottom: var(--sp-sm);
}

.result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  width: 100%;
}

.result-footer-label {
  font-weight: 600;
  color: var(--base-font-color);
}

.result-footer-values {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-lg);
}

.result-footer-item {
  font-weight: 600;
  color: var(--base-font-color);
}

.reconcile-banner {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  background: var(--color-highlight-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md) var(--sp-lg);
  margin-bottom: var(--sp-lg);
  color: var(--base-font-color);
  font-size: var(--fs-base);
  line-height: var(--lh-md);

  span {
    flex: 1;
  }

  &--alert {
    background: var(--status-open-bg);
  }
}

.section-card-block {
  margin-bottom: var(--sp-lg);
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-sm) var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  span.action-item__text {
    flex: 1;
    font-size: var(--fs-base);
    color: var(--base-font-color);
  }

  &--more {
    border-style: dashed;
    background: var(--color-highlight-bg);

    span.action-item__text {
      color: var(--base-sub-color);
      font-weight: 600;
    }
  }
}

.action-item__tag {
  flex-shrink: 0;
  font-size: var(--fs-sm);
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-sm);
  color: #fff;

  &--plan {
    background: var(--base-font-color);
  }

  &--slip {
    background: var(--base-green);
  }

  &--both {
    background: var(--status-progress);
  }
}

.action-empty {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  color: var(--base-green);
  font-size: var(--fs-base);
  font-weight: 600;
  padding: var(--sp-md);

  i {
    font-size: var(--fs-lg);
  }
}
</style>
