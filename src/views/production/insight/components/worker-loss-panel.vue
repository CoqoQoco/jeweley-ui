<!--
  worker-loss-panel — แท็บ "Loss ทอง" ของโปรไฟล์ช่าง (เฉพาะช่างฝัง 80 / ช่างแต่ง 50): ยิง Gold ของช่างคนนี้ + เรนเดอร์ 4 block ที่ยืมจาก gold.config.js
  (goldKpi/goldTrend*/goldOverSlips/goldUncovered) ด้วย InsightBlockNode กับ ctx ของตัวเอง + การ์ด "อันดับ Loss ในประเภทเดียวกัน" (คำนวณฝั่งหน้าจอจาก
  รายชื่อช่างของ Gold: peers จากหน้าหมวดทองที่โหลดอยู่แล้ว ไม่มี peers = ยิง Gold ของทั้งประเภทเพิ่ม 1 ครั้ง)
  แยกเป็นคอมโพเนนต์ที่ mount ทดสอบได้โดยไม่ต้องมี ModalView (spec จับ loop/จำนวนการ render/request ซ้ำ)

  Props:
    worker     — Object — { workerType (80|50), workerCode, workerName, deptKey }
    pageFilter — Object — filter ของหน้าตอนนี้ (ช่วงเวลา/metal/olderThanDays ที่แท็บนี้ใช้ต่อ — หมวดอื่นที่ไม่มี metal ใช้ metal ของทั้งหน้า)
    peers      — Array|null — Gold.workers ที่หน้าโหลดอยู่แล้ว (null = ยิงเอง)
  Emits: worker-name(name) — ชื่อช่างจาก Gold.workers (ให้หัวโปรไฟล์แสดง)
-->
<template>
  <div class="worker-loss-panel">
    <InsightBlockNode v-for="node in blockNodes" :key="node.id" :node="node" :ctx="modalCtx" />
  </div>
</template>

<script>
import { markRaw } from 'vue'

import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'
import { resolveGoldTabMetal } from '@/services/utils/metal-scope.js'
import { flattenBlocks } from '@/components/insight/page/insight-page-helpers.js'
import { goldConfig } from '../topics/gold.config.js'
import { GOLD_DEFAULT_OLDER_THAN_DAYS } from '../insight-filters.js'
import { buildWorkerModalFilter, buildPeersFilter, computeLossRank } from '../topics/worker-profile-helpers.js'

import InsightBlockNode from '@/components/insight/page/InsightBlockNode.vue'

const G = 'view.productionInsight.gold'
const WP = 'view.productionInsight.workerProfile'

// collapsible:false → แสดงตารางกางเสมอและ mount ทันทีเพื่อยิง request
const reuse = (node, patch = {}) => ({
  ...node,
  ...patch,
  id: `worker-${node.id}`,
  visible: undefined,
  collapsible: false,
  collapsedByDefault: undefined,
  collapseResetKey: undefined,
  sourceStrip: undefined
})

const noop = () => {}

const percentText = (value) => `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)}%`
const signedPercentText = (value) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${percentText(Math.abs(value))}`

// การ์ดอันดับ Loss (1 = Loss สูงสุดในประเภท) เทียบมัธยฐานของประเภทเดียวกัน — อ่านจาก ctx.rank
const rankCard = {
  id: 'rank',
  icon: 'bi-bar-chart-steps',
  label: `${WP}.lossRankLabel`,
  value: (ctx) => (ctx.rank ? `${ctx.rank.rank}/${ctx.rank.total}` : '—'),
  format: 'text',
  sub: (ctx, t) =>
    ctx.rank ? t(`${WP}.lossRankSub`, { median: percentText(ctx.rank.medianPercent), delta: signedPercentText(ctx.rank.deltaPercent) }) : t(`${WP}.lossRankNone`),
  tone: (ctx) => (ctx.rank ? (ctx.rank.deltaPercent > 0 ? 'warning' : 'green') : 'grey')
}

// block สร้างครั้งเดียวต่อประเภทช่าง (ต่อ module) — object เดิมทุก render
const cachedNodes = {}
const TREND_ID_BY_TYPE = { 80: 'goldTrendSetting', 50: 'goldTrendTang' }
const buildNodes = (workerType) => {
  if (cachedNodes[workerType]) return cachedNodes[workerType]
  const byId = Object.fromEntries(flattenBlocks(goldConfig.blocks).map((node) => [node.id, node]))
  const kpi = byId.goldKpi
  cachedNodes[workerType] = markRaw([
    reuse(kpi, {
      title: `${G}.workerModal.kpiTitle`,
      gridColumns: 4,
      // การ์ดคลิกเลื่อนไป block ของหน้าหลัก — ในโปรไฟล์ไม่มีปลายทางนั้น · ต่อท้ายด้วยการ์ดอันดับ
      rows: (ctx, t) => kpi.rows(ctx, t).map((row) => ({ ...row, cards: [...row.cards.map((card) => ({ ...card, reportRef: undefined, reportParams: undefined })), rankCard] }))
    }),
    reuse(byId[TREND_ID_BY_TYPE[workerType]], { toolbar: undefined }),
    reuse(byId.goldOverSlips),
    reuse(byId.goldUncovered)
  ])
  return cachedNodes[workerType]
}

export default {
  name: 'WorkerLossPanel',

  components: { InsightBlockNode },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    const metalScopeStore = useMetalScopeStore()
    return { productionInsightStore, metalScopeStore }
  },

  props: {
    worker: { type: Object, required: true },
    pageFilter: { type: Object, default: () => ({}) },
    peers: { type: Array, default: null }
  },

  emits: ['worker-name'],

  data() {
    return {
      goldData: null,
      fetchedPeers: null,
      requestSeq: 0
    }
  },

  computed: {
    modalFilter() {
      return buildWorkerModalFilter(this.pageFilter, this.worker, {
        metal: resolveGoldTabMetal(this.metalScopeStore.metal),
        olderThanDays: GOLD_DEFAULT_OLDER_THAN_DAYS
      })
    },

    peerList() {
      return this.peers ?? this.fetchedPeers
    },

    rank() {
      return computeLossRank(this.peerList, this.worker.workerType, this.worker.workerCode)
    },

    modalCtx() {
      return {
        filter: this.modalFilter,
        data: { Gold: this.goldData || {} },
        loading: {},
        state: { draftTargets: [], stageDept: null, includeQueue: false },
        rank: this.rank,
        active: true,
        masters: {},
        setState: noop,
        reload: noop,
        updateFilter: noop,
        t: this.translate
      }
    },

    // body ของ request Gold — ใช้เป็น key: เปลี่ยนเมื่อช่าง/ช่วงเวลา/metal เปลี่ยนจริงเท่านั้น
    goldRequestKey() {
      return JSON.stringify(goldConfig.sources.Gold.params(this.modalFilter, { draftTargets: [] }))
    },

    blockNodes() {
      return buildNodes(this.worker.workerType)
    }
  },

  watch: {
    // เปลี่ยนช่าง/filter ที่กระทบ Gold → โหลดใหม่ (ค่า key เป็น string จึงไม่ยิงซ้ำเมื่อ object หน้าหลักถูกสร้างใหม่แต่ค่าเท่าเดิม)
    goldRequestKey: {
      handler() {
        this.loadGold()
        if (this.peers == null) this.loadPeers()
      },
      immediate: true
    }
  },

  methods: {
    translate(key, params) {
      return this.$t(key, params)
    },

    async loadGold() {
      const seq = this.requestSeq + 1
      this.requestSeq = seq
      this.goldData = null
      const source = goldConfig.sources.Gold
      const res = await this.productionInsightStore.post(source.endpoint, source.params(this.modalFilter, { draftTargets: [] }))
      if (this.requestSeq !== seq) return
      this.goldData = markRaw(res || {})
      const name = this.worker.workerName || this.goldData.workers?.find((w) => w.workerCode === this.worker.workerCode)?.workerName || ''
      this.$emit('worker-name', name)
    },

    // เพื่อนร่วมประเภททั้งหมด (ไม่จำกัดรหัสช่าง) — ใช้เฉพาะตอนหน้าไม่มีรายชื่อช่างของ Gold ให้
    async loadPeers() {
      const seq = this.requestSeq
      const source = goldConfig.sources.Gold
      this.fetchedPeers = null
      const res = await this.productionInsightStore.post(source.endpoint, source.params(buildPeersFilter(this.modalFilter), { draftTargets: [] }))
      if (this.requestSeq === seq) this.fetchedPeers = markRaw(res?.workers || [])
    }
  }
}
</script>

<style lang="scss" scoped>
// legend-style SectionCardGeneric ต้องมีที่ว่างให้ชิป title คร่อมขอบบน (var(--sp-2xl)) ทั้งก่อนกล่องแรกและระหว่างกล่อง
.worker-loss-panel {
  padding-top: var(--sp-lg);

  > * + * {
    margin-top: var(--sp-2xl);
  }
}
</style>
