<!--
  InsightPage — template config-driven ของแท็บ Production Insight (pilot: หมวด wip ผ่าน
  src/views/production/insight/topics/wip.config.js) — เรนเดอร์ InsightTabLayout เดิม (หัวข้อ + chip สถานะ + ปัญหา/คาดการณ์/
  วิธีแก้ ผ่าน i18n + resolveFindingParams) แล้วตามด้วย config.blocks[] ตามลำดับ (InsightBlockNode)

  config:
    titleKey          — i18n key ของหัวข้อ
    findings          — { source } ชื่อ source ที่ response มี status/problems/forecasts/actions
    helpParams(filter) — params เสริมของข้อความคำอธิบาย (view.productionInsight.help.<CODE>)
    masters           — ['fetchGem', 'fetchGemShape'] ชื่อ action ของ master-store ที่ต้องโหลดก่อนใช้ (cache-aware) → ctx.masters (state ของ master store)
    sources           — { Name: { endpoint, method:'post'|'get', params(filter, state) } } ยิงทีละ source เมื่อ "params ของตัวเอง" เปลี่ยน
                        (key = JSON ของ params → 1 request ต่อ endpoint ต่อการกด 1 ครั้ง · แท็บไม่ active = ติดธง stale แล้วยิงตอนกลับมา active)
    state             — { key: { initial, resetOn: { source, value(data, current) } } } state ร่วมของ block (แถวที่เลือก/โฟกัส/draft)
    blocks            — ดู InsightBlockNode (row/group/slot/block มาตรฐาน)
  metal ถูกเติมที่ store (metal-scope) แล้ว — ไม่เติมซ้ำที่นี่

  Props:
    config — Object (required)
    filter — Object (required) — filter ของหมวดจาก ProductionInsightView (range/bucket/ตัวกรองเฉพาะหมวด)
    active — Boolean (true) — false เมื่อ mount ค้างแต่ไม่ใช่หมวดที่เปิดอยู่
-->
<template>
  <InsightTabLayout
    :title="$t(config.titleKey)"
    :status="findings.status"
    :problems="findings.problems"
    :forecasts="findings.forecasts"
    :actions="findings.actions"
    :loading="findingsLoading"
    :helpParams="helpParams"
  >
    <template #report>
      <InsightBlockNode v-for="(node, index) in config.blocks" :key="keyOf(node, index)" :node="node" :ctx="ctx" />
    </template>
  </InsightTabLayout>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { computeSourceKeys, diffSourceKeys, buildStateResets, buildInitialState, nodeKey } from './insight-page-helpers.js'

import InsightTabLayout from '../insight-tab-layout.vue'
import InsightBlockNode from './InsightBlockNode.vue'

export default {
  name: 'InsightPage',

  components: { InsightTabLayout, InsightBlockNode },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    const masterStore = useMasterApiStore()
    return { productionInsightStore, masterStore }
  },

  props: {
    config: { type: Object, required: true },
    filter: { type: Object, required: true },
    active: { type: Boolean, default: true }
  },

  data() {
    return {
      responses: {},
      loadingMap: {},
      state: buildInitialState(this.config.state),
      lastKeys: {},
      staleSources: [],
      requestSeq: {}
    }
  },

  computed: {
    sourceKeys() {
      return computeSourceKeys(this.config.sources, this.filter, this.state)
    },

    findings() {
      const res = this.responses[this.config.findings?.source] || {}
      return { status: res.status || '', problems: res.problems || [], forecasts: res.forecasts || [], actions: res.actions || [] }
    },

    findingsLoading() {
      return !!this.loadingMap[this.config.findings?.source]
    },

    helpParams() {
      return this.config.helpParams ? this.config.helpParams(this.filter) : {}
    },

    // context ที่ส่งให้ทุก block — data = response ของแต่ละ source · loading = สถานะโหลดต่อ source · state ร่วม
    ctx() {
      return {
        filter: this.filter,
        data: this.responses,
        loading: this.loadingMap,
        state: this.state,
        active: this.active,
        masters: this.masterStore,
        setState: this.setState,
        reload: this.reload,
        t: this.translate
      }
    }
  },

  watch: {
    // sourceKeys คำนวณใหม่เมื่อ field ที่ params() ของ source ใดอ่านเปลี่ยน — diff กับรอบก่อนแล้วยิงเฉพาะ source ที่ key ต่างจริง
    // (preset เปลี่ยน start+end+bucket พร้อมกัน = watcher รันรอบเดียว = 1 request ต่อ endpoint)
    sourceKeys: {
      handler(next) {
        const changed = diffSourceKeys(this.lastKeys, next)
        this.lastKeys = { ...next }
        if (!changed.length) return
        if (this.active) changed.forEach((name) => this.fetchSource(name))
        else this.staleSources = [...new Set([...this.staleSources, ...changed])]
      },
      immediate: true
    },

    // กลับมาเป็นหมวดที่เปิดอยู่หลังตัวกรองเปลี่ยนตอนถูกซ่อน — ยิงรอบเดียวตอนนี้
    active(value) {
      if (!value || !this.staleSources.length) return
      const names = this.staleSources
      this.staleSources = []
      names.forEach((name) => this.fetchSource(name))
    }
  },

  created() {
    // master data ที่ block ต้องใช้ (เช่น ชื่อพลอย) — cache-aware อยู่แล้ว เรียกซ้ำได้
    ;(this.config.masters || []).forEach((action) => this.masterStore[action]?.())
  },

  methods: {
    keyOf: nodeKey,

    translate(key, params) {
      return this.$t(key, params)
    },

    setState(key, value) {
      this.state[key] = value
    },

    // ยิง source ซ้ำแม้ params ไม่เปลี่ยน (เช่นหลังบันทึกมาตรฐาน) — รอ nextTick ให้ watcher ของ state ที่เพิ่งเปลี่ยนยิงก่อน
    // แล้วข้าม source ที่ watcher เพิ่งยิงไปแล้ว (key ที่ยิงล่าสุดตรงกับปัจจุบัน และกำลังโหลดอยู่) กันยิงซ้ำ
    reload(names) {
      this.$nextTick(() => {
        ;(names || []).forEach((name) => {
          if (!this.loadingMap[name]) this.fetchSource(name)
        })
      })
    },

    async fetchSource(name) {
      const source = this.config.sources[name]
      if (!source) return
      const seq = (this.requestSeq[name] || 0) + 1
      this.requestSeq[name] = seq
      this.loadingMap = { ...this.loadingMap, [name]: true }

      const body = source.params ? source.params(this.filter, this.state) : null
      const res = source.method === 'get' ? await this.productionInsightStore.get(source.endpoint, body) : await this.productionInsightStore.post(source.endpoint, body)

      if (this.requestSeq[name] !== seq) return
      this.responses = { ...this.responses, [name]: res }
      this.loadingMap = { ...this.loadingMap, [name]: false }

      const patch = buildStateResets(this.config.state, name, res, this.state)
      Object.entries(patch).forEach(([key, value]) => this.setState(key, value))
    }
  }
}
</script>
