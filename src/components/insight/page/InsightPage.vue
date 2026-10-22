<!--
  InsightPage — template config-driven ของแท็บ Production Insight (pilot: หมวด wip ผ่าน
  src/views/production/insight/topics/wip.config.js) — เรนเดอร์ InsightTabLayout เดิม (หัวข้อ + chip สถานะ + ปัญหา/คาดการณ์/
  วิธีแก้ ผ่าน i18n + resolveFindingParams) แล้วตามด้วย config.blocks[] ตามลำดับ (InsightBlockNode)

  config:
    titleKey          — i18n key ของหัวข้อ
    findings          — { source } ชื่อ source ที่ response มี status/problems/forecasts/actions
    filterFindings(items, filter, state) — (optional) กรอง problems/forecasts/actions ก่อนแสดง (client-side)
    tabs / tabFor(ref, params, ctx) / floating — โหมดแท็บ (opt-in): tabFor คืน { tab, reveal?, anchor? } หรือ null เพื่อเลือกแท็บจาก params ของ finding/การ์ด KPI (เช่น workerType/deptKey) · floating = block ที่ mount เสมอนอกแท็บ
    helpParams(filter) — params เสริมของข้อความคำอธิบาย (view.productionInsight.help.<CODE>)
    masters           — ['fetchGem', 'fetchGemShape'] ชื่อ action ของ master-store ที่ต้องโหลดก่อนใช้ (cache-aware) → ctx.masters (state ของ master store)
    sources           — { Name: { endpoint, method:'post'|'get', params(filter, state), enabled?(filter, state) } } (enabled=false → ไม่ยิงและเคลียร์ผลเดิม) · scoped:false = ไม่เติม metal ลง body · optional:true = ยิงพลาดไม่กระทบหมวดที่เหลือ ยิงทีละ source เมื่อ "params ของตัวเอง" เปลี่ยน
                        (key = JSON ของ params → 1 request ต่อ endpoint ต่อการกด 1 ครั้ง · แท็บไม่ active = ติดธง stale แล้วยิงตอนกลับมา active)
    onSourceLoaded    — (name, data, emit) hook หลัง source โหลดเสร็จ · ctx.updateFilter(patch) → emit 'update-filter'
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
    :i18nPrefix="config.i18nPrefix"
    :dataTabs="tabsEnabled ? dataTabs : null"
    :activeSub="currentSub"
    @update:activeSub="selectSub"
    @goto-report="goToReport"
  >
    <template #report>
      <template v-if="tabsEnabled">
        <!-- โหมดแท็บ: mount แท็บข้อมูลเมื่อเปิดครั้งแรกแล้วค้างไว้ (v-show) — แท็บที่ยังไม่เคยเปิดไม่ mount/ไม่ยิง request -->
        <template v-for="panel in dataPanels" :key="panel.key">
          <div v-if="visitedTabs.includes(panel.key)" v-show="currentSub === panel.key" class="insight-page__panel" role="tabpanel">
            <InsightBlockNode v-for="(node, index) in panel.nodes" :key="keyOf(node, index)" :node="node" :ctx="ctx" />
          </div>
        </template>
        <!-- config.floating = block ที่อยู่นอกแท็บ mount เสมอ (เช่น modal ที่เปิดจากหลายแท็บ) -->
        <InsightBlockNode v-for="(node, index) in config.floating || []" :key="keyOf(node, index)" :node="node" :ctx="ctx" />
      </template>
      <template v-else>
        <InsightBlockNode v-for="(node, index) in config.blocks" :key="keyOf(node, index)" :node="node" :ctx="ctx" />
      </template>
    </template>
  </InsightTabLayout>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { computeSourceKeys, diffSourceKeys, buildStateResets, buildInitialState, nodeKey, DISABLED_SOURCE_KEY } from './insight-page-helpers.js'
import { hasTabs, resolveSubTab, isDataSubTab, blocksForTab, findTabForReportRef, isSourceTabGated } from './insight-tabs-helpers.js'

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

  emits: ['update-filter', 'filter-options-loaded', 'workers-loaded', 'update:sub'],

  props: {
    config: { type: Object, required: true },
    filter: { type: Object, required: true },
    active: { type: Boolean, default: true },
    // แท็บที่เลือก (โหมดแท็บ — config.tabs): 'problems'(default)|'forecast'|'actions'|<key แท็บข้อมูล> · ไม่รู้จัก = default
    sub: { type: String, default: '' }
  },

  data() {
    return {
      responses: {},
      loadingMap: {},
      state: buildInitialState(this.config.state),
      currentSub: resolveSubTab(this.sub, this.config),
      // แท็บข้อมูลที่เคยเปิดแล้ว (mount ค้าง + ปลดล็อก source ของแท็บนั้น)
      visitedTabs: isDataSubTab(resolveSubTab(this.sub, this.config), this.config) ? [resolveSubTab(this.sub, this.config)] : [],
      lastKeys: {},
      staleSources: [],
      requestSeq: {}
    }
  },

  computed: {
    tabsEnabled() {
      return hasTabs(this.config)
    },

    dataTabs() {
      return (this.config.tabs || []).map((tab) => ({ value: tab.key, label: this.$t(tab.label) }))
    },

    dataPanels() {
      return (this.config.tabs || []).map((tab) => ({ key: tab.key, nodes: blocksForTab(this.config, tab.key) }))
    },

    sourceKeys() {
      return computeSourceKeys(this.config.sources, this.filter, this.state, this.tabsEnabled ? this.visitedTabs : null)
    },

    findings() {
      const res = this.responses[this.config.findings?.source] || {}
      // config.filterFindings(items, filter, state) (optional) — กรอง finding/action ฝั่งหน้าจอ (เช่น ตาม lens ของหมวด gold)
      const pick = (items) => (this.config.filterFindings ? this.config.filterFindings(items || [], this.filter, this.state) : items || [])
      return { status: res.status || '', problems: pick(res.problems), forecasts: pick(res.forecasts), actions: pick(res.actions) }
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
        updateFilter: this.updateFilter,
        goToReport: this.goToReport,
        // เปิดหน้าอื่นจาก block (เช่น เลขที่ใบแจ้งหนี้ในตาราง) — vue-router push
        navigate: (location) => this.$router.push(location),
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
        // source ที่ถูกปิด (enabled=false) เคลียร์ผลเดิมทันที ไม่ยิง — ที่เหลือยิงตามปกติ/ติดธง stale ถ้าแท็บไม่ active
        const disabled = changed.filter((name) => next[name] === DISABLED_SOURCE_KEY)
        disabled.forEach((name) => this.clearSource(name))
        const toFetch = changed.filter((name) => !disabled.includes(name))
        if (this.active) toFetch.forEach((name) => this.fetchSource(name))
        else this.staleSources = [...new Set([...this.staleSources, ...toFetch])]
      },
      immediate: true
    },

    // URL/parent เปลี่ยน sub (back/forward) → ตามไปโดยไม่ emit กลับ
    sub(value) {
      this.applySub(resolveSubTab(value, this.config))
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

    applySub(value) {
      this.currentSub = value
      if (isDataSubTab(value, this.config) && !this.visitedTabs.includes(value)) this.visitedTabs = [...this.visitedTabs, value]
    },

    selectSub(value) {
      const next = resolveSubTab(value, this.config)
      this.applySub(next)
      this.$emit('update:sub', next)
    },

    // "ดู ›" / ctx.goToReport(ref): สลับไปแท็บที่มี block นั้น (+ตั้ง state ให้ block ที่สลับแสดงทีละอัน) แล้วเลื่อนไปหา anchor
    // โหมดเดิม (ไม่ opt-in) = เลื่อนอย่างเดียว
    // reportParams (optional) = params ของ finding / การ์ด KPI — config.tabFor(ref, params, ctx) (optional, opt-in) คืน { tab, reveal?, anchor? }
    // เพื่อกำหนดแท็บเองจาก params (เช่น workerType/deptKey) · reveal = { stateKey, value } หรือ array ของมัน · anchor = id ของ block ที่จะเลื่อนไป
    // (ถ้าต่างจาก ref) · คืน null/undefined = ใช้การจับคู่ block id → tab ตามปกติ
    async goToReport(reportRef, reportParams) {
      const custom = this.tabsEnabled && this.config.tabFor ? this.config.tabFor(reportRef, reportParams || {}, this.ctx) : null
      const target = custom || findTabForReportRef(this.config, reportRef)
      if (target) {
        ;[].concat(target.reveal || []).forEach((reveal) => this.setState(reveal.stateKey, reveal.value))
        this.selectSub(target.tab)
        await this.$nextTick()
        await this.$nextTick()
      }
      const el = document.getElementById(`insight-report-${(custom && custom.anchor) || reportRef}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },

    // block ขอแก้ตัวกรองของหน้า (เช่น คลิกกลุ่มสินค้า = ตั้งตัวกรอง) → emit ให้ ProductionInsightView แก้ filters จริง
    updateFilter(patch) {
      this.$emit('update-filter', patch)
    },

    translate(key, params) {
      return this.$t(key, params)
    },

    setState(key, value) {
      this.state[key] = value
    },

    // เปิดโปรไฟล์ช่างจากภายนอกหน้า (เช่น กล่องค้นหาช่างบนแถบเครื่องมือของ host) — เทียบเท่ากดชื่อช่างในตาราง: ตั้ง state.workerModal
    // ที่ config ของหมวดประกาศไว้ (หมวดที่ไม่มี state นี้ไม่ทำอะไร)
    openWorkerProfile(worker) {
      if (worker && 'workerModal' in this.state) this.setState('workerModal', worker)
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

    clearSource(name) {
      this.requestSeq[name] = (this.requestSeq[name] || 0) + 1
      const { [name]: removed, ...rest } = this.responses
      void removed
      this.responses = rest
      this.loadingMap = { ...this.loadingMap, [name]: false }
      this.staleSources = this.staleSources.filter((n) => n !== name)
    },

    async fetchSource(name) {
      const source = this.config.sources[name]
      if (!source) return
      if (source.enabled && !source.enabled(this.filter, this.state)) return
      if (this.tabsEnabled && isSourceTabGated(source, this.visitedTabs)) return
      const seq = (this.requestSeq[name] || 0) + 1
      this.requestSeq[name] = seq
      this.loadingMap = { ...this.loadingMap, [name]: true }

      const body = source.params ? source.params(this.filter, this.state) : null
      // source.scoped === false → ไม่เติม metal ของทั้งหน้าลง body (endpoint ที่ไม่เกี่ยวกับโลหะ)
      const post = source.scoped === false ? this.productionInsightStore.postRaw : this.productionInsightStore.post
      const request = source.method === 'get' ? this.productionInsightStore.get(source.endpoint, body) : post(source.endpoint, body)
      // source.optional = ข้อมูลเสริม: ยิงพลาด → ถือว่าไม่มีข้อมูล (ctx.data[name] = undefined) หมวดที่เหลือยังแสดงตามปกติ (axios interceptor ยังแจ้ง error ให้ผู้ใช้ตามเดิม)
      const res = source.optional ? await request.catch(() => undefined) : await request

      if (this.requestSeq[name] !== seq) return
      this.responses = { ...this.responses, [name]: res }
      this.loadingMap = { ...this.loadingMap, [name]: false }

      // hook หลังโหลด: config.onSourceLoaded(name, data, emit) — ส่ง event ขึ้น parent ได้ (เช่น filter-options-loaded)
      if (this.config.onSourceLoaded) this.config.onSourceLoaded(name, res, (event, payload) => this.$emit(event, payload))

      const patch = buildStateResets(this.config.state, name, res, this.state)
      Object.entries(patch).forEach(([key, value]) => this.setState(key, value))
    }
  }
}
</script>
