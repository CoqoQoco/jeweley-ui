<!--
  quality-insight-view — แท็บ "คุณภาพข้อมูล" ของหน้า executive: InsightPage + qualityConfig (ExecutiveReport/DataQuality) · metal มาจาก store (key=metal ที่ parent remount)
  sub= (แท็บย่อย) sync กับ URL เหมือนแท็บคลังสินค้า: รับค่าตั้งต้นจาก initialSub แล้ว $router.replace ตอนเปลี่ยน (ค่า default ไม่เขียน)
  [ดู ›] ของตัวตรวจ/finding → emit navigate(domain, target) ให้ parent ใช้ onDigestSelect (สลับแท็บ + เลื่อนไปยังรายงานเดียวกับ Digest)
  refreshToken เปลี่ยน (ปุ่ม refresh ของหน้า) → ยิง Overview ซ้ำ

  Props:
    metal        — String ('ALL')
    refreshToken — Number (0)
    initialSub   — String ('') — แท็บย่อยตั้งต้น (parent อ่านจาก ?sub= ตอนเข้าหน้าด้วย tab=quality เท่านั้น)
  Emits: update:sub(value) · navigate(domain, target)
-->
<template>
  <InsightPage ref="page" :config="config" :filter="pageFilter" :active="true" :sub="sub" @update:sub="onSubChange" />
</template>

<script>
import { qualityConfig } from '../quality/quality.config.js'
import { resolveSubTab, subTabToQuery, clearedSubTabQueryKeys } from '@/components/insight/page/insight-tabs-helpers.js'

import InsightPage from '@/components/insight/page/InsightPage.vue'

export default {
  name: 'QualityInsightView',

  components: { InsightPage },

  emits: ['update:sub', 'navigate'],

  props: {
    metal: { type: String, default: 'ALL' },
    refreshToken: { type: Number, default: 0 },
    initialSub: { type: String, default: '' }
  },

  data() {
    return {
      config: qualityConfig,
      sub: resolveSubTab(this.initialSub, qualityConfig)
    }
  },

  computed: {
    pageFilter() {
      return { metal: this.metal, onNavigate: this.onNavigate }
    }
  },

  watch: {
    refreshToken() {
      this.$refs.page?.reload(['Overview'])
    }
  },

  methods: {
    onNavigate({ domain, target }) {
      this.$emit('navigate', domain, target)
    },

    onSubChange(value) {
      this.sub = value
      this.$emit('update:sub', value)
      const query = { ...this.$route.query, tab: 'quality', ...subTabToQuery(value) }
      clearedSubTabQueryKeys(value).forEach((key) => delete query[key])
      this.$router.replace({ query }).catch(() => {})
    }
  }
}
</script>
