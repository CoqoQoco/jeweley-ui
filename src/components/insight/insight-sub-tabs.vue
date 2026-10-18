<!--
  insight-sub-tabs — แถบแท็บย่อยของ InsightTabLayout โหมดแท็บ (ลำดับชั้นล่างสุด): แท็บคงที่ (ปัญหา/คาดการณ์/วิธีแก้ + จำนวน) | คำบรรยายกลุ่ม |
  แท็บข้อมูลของ topic — ใช้ ToggleGroupGeneric (size="sm") 2 ชุด = look เดียวกับแถบหมวด (ปุ่มต่อกัน พื้นเขียวเมื่อเลือก) ไม่มี style แท็บของตัวเอง
  ไม่ถือ state เอง: parent คุม modelValue / รับ update:modelValue
  คีย์บอร์ด: Tab เข้าปุ่ม · ลูกศรซ้าย/ขวาเลื่อนข้ามปุ่มทั้งแถบ (รวมข้ามกลุ่ม) และเลือกแท็บนั้น

  Props:
    modelValue — String (required) — value ของแท็บที่เลือก
    tabs       — Array (required) ของ { value, label, icon?, count? (number|null), group: 'fixed'|'data' }
    ariaLabel  — String ('') — ชื่อของทั้งแถบ (role="group")
    dataLabel  — String ('') — คำบรรยายกลุ่มแท็บข้อมูล (ไม่ใช่ปุ่ม: aria-hidden, ไม่อยู่ใน tab order) เว้นว่างได้
  Emits: update:modelValue
-->
<template>
  <div class="insight-sub-tabs" role="group" :aria-label="ariaLabel || null" @keydown.right.prevent="move($event, 1)" @keydown.left.prevent="move($event, -1)">
    <ToggleGroupGeneric size="sm" :modelValue="selectedIn(fixedTabs)" :options="toOptions(fixedTabs)" :ariaLabel="ariaLabel" @update:modelValue="$emit('update:modelValue', $event)" />

    <template v-if="dataTabs.length">
      <span v-if="fixedTabs.length" class="insight-sub-tabs__divider" role="separator">
        <span v-if="dataLabel" class="insight-sub-tabs__group-label" aria-hidden="true">{{ dataLabel }}</span>
      </span>
      <ToggleGroupGeneric size="sm" :modelValue="selectedIn(dataTabs)" :options="toOptions(dataTabs)" :ariaLabel="dataLabel || ariaLabel" @update:modelValue="$emit('update:modelValue', $event)" />
    </template>
  </div>
</template>

<script>
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

export default {
  name: 'InsightSubTabs',

  components: { ToggleGroupGeneric },

  props: {
    modelValue: { type: String, required: true },
    tabs: { type: Array, required: true },
    ariaLabel: { type: String, default: '' },
    dataLabel: { type: String, default: '' }
  },

  emits: ['update:modelValue'],

  computed: {
    fixedTabs() {
      return this.tabs.filter((tab) => tab.group !== 'data')
    },

    dataTabs() {
      return this.tabs.filter((tab) => tab.group === 'data')
    }
  },

  methods: {
    // ToggleGroupGeneric ต้องการ modelValue เสมอ — กลุ่มที่ไม่มีแท็บที่เลือกอยู่ส่ง '' (ไม่มีปุ่ม active)
    selectedIn(group) {
      return group.some((tab) => tab.value === this.modelValue) ? this.modelValue : ''
    },

    toOptions(group) {
      return group.map((tab) => ({
        value: tab.value,
        icon: tab.icon || undefined,
        label: tab.count !== null && tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label
      }))
    },

    // ลูกศรซ้าย/ขวา: ไปปุ่มก่อน/ถัดไปของทั้งแถบ (ข้ามกลุ่มได้) แล้วเลือก+โฟกัส — ปุ่มแรก/สุดท้ายไม่วนรอบ
    move(event, step) {
      const buttons = [...this.$el.querySelectorAll('[role="tab"]')]
      const next = buttons[buttons.indexOf(event.target) + step]
      if (!next) return
      next.click()
      next.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
.insight-sub-tabs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

// ป้ายกลุ่มแท็บข้อมูล = คำบรรยาย ไม่ใช่ปุ่ม: ไม่อยู่ใน tab order, ไม่มี hover/พื้น, เล็กและจางกว่าปุ่ม
.insight-sub-tabs__divider {
  align-self: stretch;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-sm);
  margin: 0 var(--sp-xs);
  cursor: default;
  user-select: none;

  // เส้นคั่นบางๆ ด้วย pseudo-element
  &::before {
    content: '';
    align-self: stretch;
    width: 1px;
    margin: var(--sp-xs) 0;
    background: var(--color-border);
  }
}

.insight-sub-tabs__group-label {
  font-size: var(--fs-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--base-sub-color);
  pointer-events: none;
}
</style>
