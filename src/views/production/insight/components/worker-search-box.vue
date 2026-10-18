<!--
  worker-search-box — ช่องค้นหาช่าง (ชื่อหรือรหัส) บนแถบเครื่องมือหน้า Production Insight · เลือกแล้วเปิดโปรไฟล์ช่างของหมวดที่เปิดอยู่
  รายชื่อ: ProductionInsight/Workers ของช่วงเวลาปัจจุบัน (ไม่ใส่ตัวกรองแผนก/ประเภทการจ้าง → ทุกคนในช่วงนั้น) ยิงครั้งแรกที่พิมพ์เท่านั้น (ไม่ยิงตอนโหลดหน้า)
  แล้ว cache ตามช่วงเวลา — ช่วงเปลี่ยน = ยิงใหม่ตอนพิมพ์ครั้งถัดไป · ตัดคิวรองาน (ชื่อขึ้นต้น "รอ") และ dedupe ด้วย (รหัส, แผนก)
  AutoCompleteGeneric เขียน object ลง v-model เมื่อเลือกจากรายการ → ที่นี่ v-model เป็นข้อความเสมอ (object ถูกแปลงเป็นค่าว่างแล้วล้างช่อง)

  Props:
    filter — Object — filter ของหมวดที่เปิดอยู่ (อ่านเฉพาะ start/end)
  Emits: select(payload) — payload เดียวกับกดชื่อช่างในตาราง ({ workerType|null, workerCode, workerName, deptKey, employmentType })
-->
<template>
  <div class="worker-search-box">
    <AutoCompleteGeneric
      v-model="query"
      :inputId="inputId"
      :ariaLabel="$t('view.productionInsight.workerSearch.aria')"
      :placeholder="$t('view.productionInsight.workerSearch.placeholder')"
      :suggestions="suggestions"
      optionLabel="label"
      @complete="onComplete"
      @update:modelValue="onModel"
      @item-select="onSelect"
    >
      <template #empty>{{ $t('view.productionInsight.workerSearch.empty') }}</template>
    </AutoCompleteGeneric>
  </div>
</template>

<script>
import { markRaw } from 'vue'

import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { isoOrNull } from '@/components/insight/page/insight-page-helpers.js'
import { buildWorkerSearchOptions, searchWorkerOptions, buildWorkerSearchPayload, buildWorkerSearchRangeKey, buildWorkerSearchRequestBody } from '../topics/worker-search-helpers.js'

import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'

export default {
  name: 'WorkerSearchBox',

  components: { AutoCompleteGeneric },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    filter: { type: Object, default: () => ({}) }
  },

  emits: ['select'],

  data() {
    return {
      query: '',
      suggestions: [],
      inputId: 'production-insight-worker-search',
      loadedKey: null,
      options: [],
      requestSeq: 0
    }
  },

  methods: {
    async ensureOptions() {
      const key = buildWorkerSearchRangeKey(this.filter, isoOrNull)
      if (this.loadedKey === key) return
      const seq = this.requestSeq + 1
      this.requestSeq = seq
      const res = await this.productionInsightStore.post('ProductionInsight/Workers', buildWorkerSearchRequestBody(this.filter, isoOrNull))
      if (this.requestSeq !== seq) return
      this.options = markRaw(buildWorkerSearchOptions(res?.workers, (k, params) => this.$t(k, params)))
      this.loadedKey = key
    },

    async onComplete(event) {
      const seq = this.requestSeq
      await this.ensureOptions()
      // ผู้ใช้พิมพ์ต่อระหว่างรอโหลด → ปล่อยให้ complete รอบใหม่ตอบแทน
      if (seq !== this.requestSeq && this.loadedKey === null) return
      this.suggestions = searchWorkerOptions(this.options, event.query)
    },

    onModel(value) {
      if (typeof value !== 'string') this.query = ''
    },

    onSelect(event) {
      const payload = buildWorkerSearchPayload(event.value)
      this.query = ''
      this.suggestions = []
      if (payload) this.$emit('select', payload)
    }
  }
}
</script>

<style lang="scss" scoped>
.worker-search-box {
  flex: 0 1 var(--worker-search-width, 20rem);
  min-width: 12rem;
}
</style>
