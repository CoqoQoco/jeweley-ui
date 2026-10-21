<!--
  stock-insight-view — แท็บ "คลังสินค้า" ของหน้า executive: InsightPage + stockConfig (StockInsight/Overview) · metal มาจาก store (key=metal ที่ parent remount)
  sub= (แท็บย่อย) sync กับ URL เหมือนหมวดผลิต: รับค่าตั้งต้นจาก initialSub แล้ว $router.replace ตอนเปลี่ยน (ค่า default ไม่เขียน) คง query key อื่นไว้
  refreshToken เปลี่ยน (ปุ่ม refresh ของหน้า) → ยิง Overview ซ้ำ

  Props:
    metal        — String ('ALL') — โลหะของทั้งหน้า (ใช้ตัดสินว่าแสดง "จำนวนตามหน่วย" หรือไม่)
    refreshToken — Number (0)
    initialSub   — String ('') — แท็บย่อยตั้งต้น (parent อ่านจาก ?sub= ตอนเข้าหน้าด้วย tab=stock เท่านั้น — กัน sub ของแท็บผลิตที่ค้างใน URL หลุดมา)
-->
<template>
  <InsightPage ref="page" :config="config" :filter="pageFilter" :active="true" :sub="sub" @update:sub="onSubChange" />
</template>

<script>
import { stockConfig } from '../stock/stock.config.js'
import { resolveSubTab, subTabToQuery, clearedSubTabQueryKeys } from '@/components/insight/page/insight-tabs-helpers.js'

import InsightPage from '@/components/insight/page/InsightPage.vue'

export default {
  name: 'StockInsightView',

  components: { InsightPage },

  emits: ['update:sub'],

  props: {
    metal: { type: String, default: 'ALL' },
    refreshToken: { type: Number, default: 0 },
    initialSub: { type: String, default: '' }
  },

  data() {
    return {
      config: stockConfig,
      sub: resolveSubTab(this.initialSub, stockConfig)
    }
  },

  computed: {
    pageFilter() {
      return { metal: this.metal }
    }
  },

  watch: {
    refreshToken() {
      this.$refs.page?.reload(['Overview'])
    }
  },

  methods: {
    onSubChange(value) {
      this.sub = value
      this.$emit('update:sub', value)
      const query = { ...this.$route.query, ...subTabToQuery(value) }
      clearedSubTabQueryKeys(value).forEach((key) => delete query[key])
      this.$router.replace({ query }).catch(() => {})
    }
  }
}
</script>
