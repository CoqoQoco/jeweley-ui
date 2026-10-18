<!--
  gold-worker-modal-body — เนื้อหาใน modal เจาะข้อมูลช่าง (ตัวบางของ ModalView อยู่ที่ gold-worker-modal.vue): ยิง Gold ของช่างคนนี้ +
  เรนเดอร์ 4 block ที่ยืมจาก gold.config.js (goldKpi/goldTrend/goldOverSlips/goldUncovered) ด้วย InsightBlockNode กับ ctx ของตัวเอง
  แยกออกมาเพื่อ mount ทดสอบได้โดยไม่ต้องมี ModalView (spec จับ loop/จำนวนการ render/request ซ้ำ)

  Props:
    worker     — Object — { workerType, workerCode, workerName }
    pageFilter — Object — filter ของหมวดตอนนี้
  Emits: worker-name(name) — ชื่อช่างจาก Gold.workers (ให้หัว modal แสดง)

-->
<template>
  <div class="gold-worker-modal__blocks">
    <InsightBlockNode v-for="node in blockNodes" :key="node.id" :node="node" :ctx="modalCtx" />
  </div>
</template>

<script>
import { markRaw } from 'vue'

import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { flattenBlocks } from '@/components/insight/page/insight-page-helpers.js'
import { goldConfig } from '../topics/gold.config.js'
import { buildWorkerModalFilter } from '../topics/gold-worker-modal-helpers.js'

import InsightBlockNode from '@/components/insight/page/InsightBlockNode.vue'

const G = 'view.productionInsight.gold'

// collapsible:false → modal แสดงตารางกางเสมอ (ไม่ขึ้นกับ lens ภาพรวมที่พับตั้งต้น) และ mount ทันทีเพื่อยิง request
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

// block ของ modal สร้างครั้งเดียวต่อประเภทช่าง (ต่อ module) — object เดิมทุก render
const cachedNodes = {}
const TREND_ID_BY_TYPE = { 80: 'goldTrendSetting', 50: 'goldTrendTang' }
const buildNodes = (workerType) => {
  if (cachedNodes[workerType]) return cachedNodes[workerType]
  const byId = Object.fromEntries(flattenBlocks(goldConfig.blocks).map((node) => [node.id, node]))
  const kpi = byId.goldKpi
  cachedNodes[workerType] = markRaw([
    reuse(kpi, {
      title: `${G}.workerModal.kpiTitle`,
      // การ์ดคลิกเลื่อนไป block ของหน้าหลัก — ใน modal ไม่มีปลายทางนั้น
      rows: (ctx, t) => kpi.rows(ctx, t).map((row) => ({ ...row, cards: row.cards.map((card) => ({ ...card, reportRef: undefined })) }))
    }),
    reuse(byId[TREND_ID_BY_TYPE[workerType]], { toolbar: undefined }),
    reuse(byId.goldOverSlips),
    reuse(byId.goldUncovered)
  ])
  return cachedNodes[workerType]
}

export default {
  name: 'GoldWorkerModalBody',

  components: { InsightBlockNode },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    worker: { type: Object, required: true },
    pageFilter: { type: Object, default: () => ({}) }
  },

  emits: ['worker-name'],

  data() {
    return {
      goldData: null,
      requestSeq: 0
    }
  },

  computed: {
    modalFilter() {
      return buildWorkerModalFilter(this.pageFilter, this.worker)
    },

    modalCtx() {
      return {
        filter: this.modalFilter,
        data: { Gold: this.goldData || {} },
        loading: {},
        state: { trendWorkerType: this.worker.workerType, draftTargets: [], stageDept: null, includeQueue: false },
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
    }
  }
}
</script>

<style lang="scss" scoped>
// legend-style SectionCardGeneric ต้องมีที่ว่างให้ชิป title คร่อมขอบบน (var(--sp-2xl)) ทั้งก่อนกล่องแรกและระหว่างกล่อง
.gold-worker-modal__blocks {
  padding-top: var(--sp-lg);

  > * + * {
    margin-top: var(--sp-2xl);
  }
}
</style>
