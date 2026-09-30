<!--
  RangePresetGeneric — segmented date-range presets [1M][3M][6M][1Y] (ToggleGroupGeneric ภายใน) + ข้อความ
  ช่วงที่ resolve แล้วต่อท้าย — ใช้เมื่อหน้า dashboard ต้องการเลือกช่วงเวลาเร็วๆ จากแถบเครื่องมือ แทนต้อง
  เปิด filter panel ทุกครั้ง

  โหมด "custom": ส่ง modelValue.preset = 'custom' เข้ามา (เช่น ผู้ใช้กำหนดวันเองจาก filter panel แล้วกด
  "ใช้ตัวกรอง") — ToggleGroupGeneric จะไม่ highlight ปุ่มไหนเลยเพราะไม่มี option ไหนตรงกับ 'custom'
  (พฤติกรรมเดิมของ ToggleGroupGeneric) — component นี้แค่แสดงผล ไม่ได้เป็นคนกำหนดช่วง custom เอง

  ตัวอย่างการใช้งาน:
  <RangePresetGeneric
    :modelValue="{ preset: filter.rangePreset, start: filter.start, end: filter.end }"
    :ariaLabel="$t('view.x.rangeAriaLabel')"
    @update:modelValue="onRangeChange"
  />

  Props:
    modelValue — { preset: '1m'|'3m'|'6m'|'1y'|'custom', start: Date, end: Date } (required)
    ariaLabel  — String ('') — aria-label ของ ToggleGroupGeneric ภายใน
    helpText   — String ('') — ถ้ามี แสดงไอคอน ⓘ (InfoTipGeneric) ต่อท้ายข้อความช่วง อธิบายผลของการเลือกช่วง

  Emits: update:modelValue({ preset, start, end }) — ยิงเฉพาะตอนกดปุ่ม preset (ไม่ยิงตอนแค่แสดงผล custom)
-->
<template>
  <div class="range-preset-generic">
    <ToggleGroupGeneric :modelValue="modelValue.preset" :options="options" :ariaLabel="ariaLabel" @update:modelValue="onSelect" />
    <span class="range-preset-generic__label">{{ rangeLabel }}</span>
    <InfoTipGeneric v-if="helpText" :text="helpText" />
  </div>
</template>

<script>
import { RANGE_PRESET_VALUES, RANGE_PRESET_LABELS, resolvePresetRange, formatRangeLabel } from '@/services/utils/range-presets.js'

import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'

export default {
  name: 'RangePresetGeneric',

  components: {
    ToggleGroupGeneric,
    InfoTipGeneric
  },

  props: {
    modelValue: {
      type: Object,
      required: true
    },
    ariaLabel: {
      type: String,
      default: ''
    },
    helpText: {
      type: String,
      default: ''
    }
  },

  emits: ['update:modelValue'],

  computed: {
    options() {
      return RANGE_PRESET_VALUES.map((value) => ({
        value,
        label: RANGE_PRESET_LABELS[value],
        title: this.$t(`common.rangePreset.title.${value}`)
      }))
    },

    rangeLabel() {
      return formatRangeLabel(this.modelValue.start, this.modelValue.end)
    }
  },

  methods: {
    onSelect(preset) {
      const resolved = resolvePresetRange(preset)
      if (!resolved) return
      this.$emit('update:modelValue', { preset, start: resolved.start, end: resolved.end })
    }
  }
}
</script>

<style lang="scss" scoped>
.range-preset-generic {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  flex-shrink: 0;
}

.range-preset-generic__label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  white-space: nowrap;
}
</style>
