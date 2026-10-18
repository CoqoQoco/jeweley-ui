<!--
  worker-wages-panel — แท็บ "ค่าแรง" ของโปรไฟล์ช่าง: การ์ด 4 ใบ (ค่าแรงรวม/เฉลี่ยต่อเดือน · จำนวนงาน · ค่าแรงต่องาน · สัดส่วนในแผนก) + กราฟรายเดือน (งาน = แท่ง, ค่าแรง = เส้น)
  ข้อมูล: ProductionInsight/Workers (กรองแผนกของช่าง → หาแถวช่างด้วยรหัส; ใช้แถวทั้งแผนกคำนวณสัดส่วนค่าแรง) + ProductionInsight/WorkerMonthly (code+deptKey+ช่วงเวลา)
  ช่างไม่มีแถวใน Workers (ไม่มีค่าแรงในช่วงนั้น) = การ์ดเป็น "—" + หมายเหตุ ไม่ซ่อนแท็บ

  Props:
    worker     — Object — { workerCode, workerName, deptKey, ... }
    pageFilter — Object — filter ของหน้าตอนนี้ (อ่านเฉพาะ start/end)
  Emits: worker-info({ name, employmentType }) — ให้หัวโปรไฟล์แสดงชื่อ/ประเภทการจ้างที่หน้าไม่ได้ส่งมา
-->
<template>
  <div class="worker-wages-panel">
    <p v-if="loaded && !row" class="worker-wages-panel__note">{{ $t('view.productionInsight.workerProfile.wages.noRow') }}</p>
    <InsightBlockNode v-for="node in blockNodes" :key="node.id" :node="node" :ctx="panelCtx" />
  </div>
</template>

<script>
import { markRaw } from 'vue'

import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { isoOrNull } from '@/components/insight/page/insight-page-helpers.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'
import { findWorkerRow, computeWageStats, buildWorkersRequestBody, buildWorkerMonthlyRequestBody } from '../topics/worker-profile-helpers.js'

import InsightBlockNode from '@/components/insight/page/InsightBlockNode.vue'

const WP = 'view.productionInsight.workerProfile.wages'
const W = 'view.productionInsight.workers'

const noop = () => {}
const numberText = (value, digits = 0) => (value == null ? '—' : new Intl.NumberFormat('th-TH', { maximumFractionDigits: digits }).format(value))
const moneyText = (value, digits = 0) => (value == null ? '—' : `฿${numberText(value, digits)}`)

const statsOf = (ctx) => ctx.stats || {}

// block ของแท็บนี้สร้างครั้งเดียวต่อ module — object เดิมทุก render
const blockNodes = markRaw([
  {
    type: 'kpi',
    id: 'worker-wages-kpi',
    source: 'Monthly',
    title: `${WP}.kpiTitle`,
    icon: 'bi-cash-stack',
    gridColumns: 4,
    cards: [
      {
        id: 'wages',
        icon: 'bi-cash-stack',
        label: `${WP}.kpiWages`,
        value: (ctx) => statsOf(ctx).wages,
        format: 'money0',
        sub: (ctx, t) => t(`${WP}.kpiWagesSub`, { avg: moneyText(statsOf(ctx).avgWagesPerMonth) })
      },
      {
        id: 'jobs',
        icon: 'bi-list-check',
        label: `${WP}.kpiJobs`,
        value: (ctx) => statsOf(ctx).jobs,
        sub: (ctx, t) => t(`${WP}.kpiJobsSub`, { plans: numberText(statsOf(ctx).plans) })
      },
      {
        id: 'wagePerJob',
        icon: 'bi-receipt',
        label: `${WP}.kpiWagePerJob`,
        value: (ctx) => statsOf(ctx).wagePerJob,
        format: 'money0',
        sub: (ctx, t) => (statsOf(ctx).isRateOutlier ? t(`${WP}.kpiWagePerJobOutlier`) : ''),
        tone: (ctx) => (statsOf(ctx).isRateOutlier ? 'warning' : 'main')
      },
      {
        id: 'share',
        icon: 'bi-pie-chart',
        label: `${WP}.kpiDeptShare`,
        value: (ctx) => statsOf(ctx).deptWageSharePercent,
        format: 'percent',
        sub: (ctx, t) => (statsOf(ctx).shareOfDeptJobs == null ? '' : t(`${WP}.kpiDeptShareSub`, { jobs: numberText(statsOf(ctx).shareOfDeptJobs, 1) })),
        tone: (ctx) => (statsOf(ctx).isConcentrated ? 'warning' : 'main')
      }
    ]
  },
  {
    type: 'trend',
    id: 'worker-wages-trend',
    source: 'Monthly',
    title: `${WP}.trendTitle`,
    icon: 'bi-graph-up',
    height: 260,
    columnWidth: '45%',
    axisTitles: [`${W}.jobsUnit`, `${W}.wagesUnit`],
    points: (ctx) => ctx.data.Monthly?.series || [],
    categories: (points) => formatBucketMonthLabels(points.map((p) => p?.bucketEnd)),
    series: [
      { field: 'jobs', type: 'bar', label: `${W}.detailSeriesJobs`, color: 'primary', axis: 0, format: 'count' },
      { field: 'wages', type: 'line', label: `${W}.detailSeriesWages`, color: 'warning', axis: 1, format: 'money' }
    ]
  }
])

export default {
  name: 'WorkerWagesPanel',

  components: { InsightBlockNode },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    worker: { type: Object, required: true },
    pageFilter: { type: Object, default: () => ({}) }
  },

  emits: ['worker-info'],

  data() {
    return {
      workersData: null,
      monthly: null,
      loaded: false,
      requestSeq: 0
    }
  },

  computed: {
    row() {
      return findWorkerRow(this.workersData?.workers, { workerCode: this.worker.workerCode, deptKey: this.worker.deptKey })
    },

    stats() {
      const deptRows = (this.workersData?.workers || []).filter((w) => w.deptKey === this.worker.deptKey)
      return computeWageStats(this.row, deptRows, this.monthly?.series)
    },

    panelCtx() {
      return {
        filter: this.pageFilter,
        data: { Monthly: this.monthly || {} },
        loading: { Monthly: !this.loaded },
        state: {},
        stats: this.stats,
        active: true,
        masters: {},
        setState: noop,
        reload: noop,
        updateFilter: noop,
        t: this.translate
      }
    },

    // body ของ request ทั้งคู่ — ใช้เป็น key: เปลี่ยนเมื่อช่าง/ช่วงเวลาเปลี่ยนจริงเท่านั้น
    requestKey() {
      return JSON.stringify([buildWorkersRequestBody(this.pageFilter, this.worker, isoOrNull), buildWorkerMonthlyRequestBody(this.pageFilter, this.worker, isoOrNull)])
    },

    blockNodes() {
      return blockNodes
    }
  },

  watch: {
    requestKey: {
      handler() {
        this.load()
      },
      immediate: true
    }
  },

  methods: {
    translate(key, params) {
      return this.$t(key, params)
    },

    async load() {
      const seq = this.requestSeq + 1
      this.requestSeq = seq
      this.workersData = null
      this.monthly = null
      this.loaded = false
      const [workersRes, monthlyRes] = await Promise.all([
        this.productionInsightStore.post('ProductionInsight/Workers', buildWorkersRequestBody(this.pageFilter, this.worker, isoOrNull)),
        this.productionInsightStore.post('ProductionInsight/WorkerMonthly', buildWorkerMonthlyRequestBody(this.pageFilter, this.worker, isoOrNull))
      ])
      if (this.requestSeq !== seq) return
      this.workersData = markRaw(workersRes || {})
      this.monthly = markRaw(monthlyRes || {})
      this.loaded = true
      if (this.row) this.$emit('worker-info', { name: this.row.name || '', employmentType: this.row.employmentType || null })
    }
  }
}
</script>

<style lang="scss" scoped>
.worker-wages-panel {
  padding-top: var(--sp-lg);

  > * + * {
    margin-top: var(--sp-2xl);
  }
}

.worker-wages-panel__note {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}
</style>
