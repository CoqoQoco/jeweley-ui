<!--
  gold-dept-picker — ตัวเลือกแผนกของ lens "แยกตามแผนก" (หมวดทองและ Loss) — ผูก state.stageDept ตัวเดียวกับการคลิกแถวในตาราง
  รายแผนก (config ส่ง options/modelValue และรับ update:modelValue กลับไป ctx.setState)

  Props:
    options    — Array ของ { value: deptKey, label } (default [])
    modelValue — String — deptKey ที่เลือกอยู่ ('' = ยังไม่เลือก)
  Emits: update:modelValue
-->
<template>
  <div class="gold-dept-picker">
    <span class="gold-dept-picker__label">{{ $t('view.productionInsight.gold.deptPicker.label') }}</span>
    <ToggleGroupGeneric
      :modelValue="modelValue || ''"
      :options="options"
      :ariaLabel="$t('view.productionInsight.gold.deptPicker.ariaLabel')"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script>
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

export default {
  name: 'GoldDeptPicker',

  components: { ToggleGroupGeneric },

  props: {
    options: { type: Array, default: () => [] },
    modelValue: { type: String, default: '' }
  },

  emits: ['update:modelValue']
}
</script>

<style lang="scss" scoped>
.gold-dept-picker {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-md);
}

.gold-dept-picker__label {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
}
</style>
