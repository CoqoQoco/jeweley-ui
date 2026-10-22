<!--
  sales-insight-view — แท็บ "ขายและเงิน" ของหน้า executive: InsightPage + salesConfig (SalesInsight/Overview + ตารางบิล/SO เดิมแบบ paged) · metal มาจาก store (parent remount ด้วย key=metal)
  sub= (แท็บย่อย) sync กับ URL เหมือนแท็บคลังสินค้า/ผลิต: รับค่าตั้งต้นจาก initialSub แล้ว $router.replace ตอนเปลี่ยน (ค่า default ไม่เขียน) คง query key อื่นไว้
  การ์ดสรุปด้านบนของหน้า executive กดแล้วส่ง target = { sub, dueFilter? } (object ใหม่ทุกครั้งที่กด) → สลับแท็บย่อย + ตั้งตัวสลับของแท็บ "บิลที่ต้องตาม"
  refreshToken เปลี่ยน (ปุ่ม refresh ของหน้า) → ยิง Overview ซ้ำ + ตารางที่เปิดอยู่ยิงใหม่ (filter.refresh)

  Props:
    metal        — String ('ALL') — โลหะของทั้งหน้า (ใช้แสดงสัดส่วนโลหะใต้ยอดบิล)
    refreshToken — Number (0)
    initialSub   — String ('') — แท็บย่อยตั้งต้น (parent อ่านจาก ?sub= ตอนเข้าหน้าด้วย tab=sales เท่านั้น)
    target       — Object|null — { sub, dueFilter? } จากการ์ดสรุป
  Emits: update:sub(value)
-->
<template>
  <InsightPage ref="page" :config="config" :filter="pageFilter" :active="true" :sub="sub" @update:sub="onSubChange" />
</template>

<script>
import { salesConfig } from '../sales/sales.config.js'
import { resolveSubTab, subTabToQuery, clearedSubTabQueryKeys } from '@/components/insight/page/insight-tabs-helpers.js'

import InsightPage from '@/components/insight/page/InsightPage.vue'

export default {
  name: 'SalesInsightView',

  components: { InsightPage },

  emits: ['update:sub'],

  props: {
    metal: { type: String, default: 'ALL' },
    refreshToken: { type: Number, default: 0 },
    initialSub: { type: String, default: '' },
    target: { type: Object, default: null }
  },

  data() {
    return {
      config: salesConfig,
      sub: resolveSubTab(this.initialSub, salesConfig),
      refreshCount: 0
    }
  },

  computed: {
    pageFilter() {
      return { metal: this.metal, refresh: this.refreshCount }
    }
  },

  watch: {
    refreshToken() {
      this.refreshCount += 1
      this.$refs.page?.reload(['Overview'])
    },

    target() {
      this.applyTarget()
    }
  },

  mounted() {
    this.applyTarget()
  },

  methods: {
    // การ์ดสรุป → แท็บย่อย (+ ตัวสลับ) — ตั้ง state ก่อนสลับแท็บ เพื่อให้ตารางที่เลือกเป็นตัวที่ mount/ยิง
    applyTarget() {
      const target = this.target
      const page = this.$refs.page
      if (!target?.sub || !page) return
      if (target.dueFilter) page.setState('dueFilter', target.dueFilter)
      page.selectSub(target.sub)
    },

    onSubChange(value) {
      this.sub = value
      this.$emit('update:sub', value)
      // tab: 'sales' ระบุเองเสมอ — ตอนมาจากการ์ดสรุป route ของ parent อาจยังไม่อัปเดตเป็น tab=sales ตอนที่ emit นี้ทำงาน
      const query = { ...this.$route.query, tab: 'sales', ...subTabToQuery(value) }
      clearedSubTabQueryKeys(value).forEach((key) => delete query[key])
      this.$router.replace({ query }).catch(() => {})
    }
  }
}
</script>
