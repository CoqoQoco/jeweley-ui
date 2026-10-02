<!--
  plan-workers-cell — เซลล์คอลัมน์ "ช่าง" ของตาราง plan ทุกตัวในหมวด insight (wip-stale/wip-due-risk/
  wip-abnormal-dwell/delivery-at-risk-panel.vue — รวม "executive stale" ที่ฝังหน้า /executive ด้วย เพราะใช้
  ProductionInsightView ตัวเดียวกัน) — ใช้ resolvePlanWorkersDisplay (wip-plan-table-helpers.js) ดึง
  shown/moreCount/allNames จาก data ของแถวนั้นตรงๆ

  ช่างจริง (isQueue=false) โชว์ "ชื่อ" + รหัสตัวเล็กสีรองต่อท้าย — รายการรอคิว (isQueue=true, ยังไม่ได้จ่ายให้
  ช่างคนไหนเลย) โชว์เป็น chip สีรองมีไอคอนนาฬิกาทรายกำกับ ต่อท้ายช่างจริงเสมอ — สูงสุด 3 รายการ ที่เหลือสรุปเป็น
  "+n" — title ของ wrapper เป็นรายชื่อเต็มเสมอ (ไม่ว่าจะถูกตัดหรือไม่)

  Props:
    workers     — Array<String> (default []) — ชื่อช่างล้วน (fallback เดิม เมื่อ workerItems ไม่มี/ว่าง)
    workerItems — Array<{code,name,isQueue}>|null (default null) — field ใหม่จาก API (ยืนยัน 2026-10-01)
    maxShown    — Number (default 3)
-->
<template>
  <span v-if="!display.shown.length">—</span>
  <span v-else :title="display.allNames.join(', ')" class="plan-workers-cell">
    <template v-for="(item, index) in display.shown" :key="index">
      <span v-if="!item.isQueue" class="plan-workers-cell__worker">
        {{ item.name }}
        <small v-if="item.code" class="text-muted">{{ item.code }}</small>
      </span>
      <span v-else class="plan-workers-cell__queue">
        <i class="bi bi-hourglass-split"></i>
        {{ item.name }}
      </span>
    </template>
    <span v-if="display.moreCount > 0" class="text-muted">+{{ display.moreCount }}</span>
  </span>
</template>

<script>
import { resolvePlanWorkersDisplay } from './wip-plan-table-helpers.js'

export default {
  name: 'PlanWorkersCell',

  props: {
    workers: {
      type: Array,
      default: () => []
    },
    workerItems: {
      type: Array,
      default: null
    },
    maxShown: {
      type: Number,
      default: 3
    }
  },

  computed: {
    display() {
      return resolvePlanWorkersDisplay({ workers: this.workers, workerItems: this.workerItems }, this.maxShown)
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-workers-cell {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-xs);
}

.plan-workers-cell__worker {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.plan-workers-cell__queue {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
  font-style: italic;
}
</style>
