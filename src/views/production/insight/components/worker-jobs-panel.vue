<!--
  worker-jobs-panel — แท็บ "ใบงาน" ของโปรไฟล์ช่าง: ใบงานที่ช่างคนนี้ทำแล้วแต่ยังไม่บันทึกค่าแรง
  ข้อมูล: ProductionInsight/UnpaidPieceJobs ไม่มีตัวกรองช่างฝั่ง server → ดึงทั้งแผนกของช่าง (take 0) แล้วกรองด้วยรหัสช่างฝั่งหน้าจอ แสดงสูงสุด 50 แถว + บอกยอดรวม
  ช่างฝัง/ช่างแต่ง: ใบงานทองเกินเกณฑ์/งานไม่ครบ slip อยู่แท็บ "Loss ทอง" แล้ว — แท็บนี้ไม่ซ้ำ แค่ชี้ไป

  Props:
    worker     — Object — { workerCode, workerType?, deptKey }
    pageFilter — Object — filter ของหน้าตอนนี้ (อ่านเฉพาะ start/end)
-->
<template>
  <div class="worker-jobs-panel">
    <InsightBlockNode :node="tableNode" :ctx="panelCtx" />
  </div>
</template>

<script>
import { markRaw } from 'vue'

import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { isoOrNull } from '@/components/insight/page/insight-page-helpers.js'
import * as col from '@/components/insight/page/columns.js'
import { buildUnpaidJobsRequestBody, filterUnpaidJobsForWorker, UNPAID_JOBS_DISPLAY_LIMIT } from '../topics/worker-profile-helpers.js'

import InsightBlockNode from '@/components/insight/page/InsightBlockNode.vue'

const WJ = 'view.productionInsight.workerProfile.jobs'
const W = 'view.productionInsight.workers'

const noop = () => {}

const tableNode = markRaw({
  type: 'table',
  id: 'worker-jobs-table',
  source: 'Unpaid',
  title: `${WJ}.tableTitle`,
  icon: 'bi-exclamation-circle',
  sections: [
    {
      rows: (ctx) => ctx.jobs.rows,
      dataKey: 'rowKey',
      columns: [col.planLink(), col.date('jobDate', `${W}.unpaidColJobDate`), col.number('checkGram', `${W}.unpaidColCheckGram`, 'decimal', { minWidth: '100px' })]
    },
    {
      kind: 'text',
      tone: 'foot',
      text: (ctx, t) => {
        const note = ctx.jobs.total > ctx.jobs.rows.length ? t(`${WJ}.limitNote`, { shown: ctx.jobs.rows.length, total: ctx.jobs.total }) : t(`${WJ}.totalNote`, { total: ctx.jobs.total })
        return ctx.hasLoss ? `${note} ${t(`${WJ}.lossHint`)}` : note
      }
    }
  ]
})

export default {
  name: 'WorkerJobsPanel',

  components: { InsightBlockNode },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    worker: { type: Object, required: true },
    pageFilter: { type: Object, default: () => ({}) }
  },

  data() {
    return {
      items: null,
      loaded: false,
      requestSeq: 0
    }
  },

  computed: {
    jobs() {
      return filterUnpaidJobsForWorker(this.items, this.worker, UNPAID_JOBS_DISPLAY_LIMIT)
    },

    requestKey() {
      return JSON.stringify(buildUnpaidJobsRequestBody(this.pageFilter, this.worker, isoOrNull))
    },

    panelCtx() {
      return {
        filter: this.pageFilter,
        data: {},
        loading: { Unpaid: !this.loaded },
        state: {},
        jobs: this.jobs,
        hasLoss: !!this.worker.workerType,
        active: true,
        masters: {},
        setState: noop,
        reload: noop,
        updateFilter: noop,
        t: this.translate
      }
    },

    tableNode() {
      return tableNode
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
      this.loaded = false
      this.items = null
      const res = await this.productionInsightStore.post('ProductionInsight/UnpaidPieceJobs', buildUnpaidJobsRequestBody(this.pageFilter, this.worker, isoOrNull))
      if (this.requestSeq !== seq) return
      this.items = markRaw(res?.data || [])
      this.loaded = true
    }
  }
}
</script>

<style lang="scss" scoped>
.worker-jobs-panel {
  padding-top: var(--sp-lg);
}
</style>
