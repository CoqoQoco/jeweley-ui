<!--
  material-items-toolbar — แถบเหนือตารางรายการของแท็บ "รายการและขั้นต่ำ": ตัวสลับสถานะ (ทั้งหมด/หมด/ต่ำกว่าขั้นต่ำ/ใกล้หมด/ค้างนิ่ง พร้อมจำนวน) + ปุ่ม "ตั้งค่าเกณฑ์" (เฉพาะผู้มีสิทธิ์ material:manage-min)
  ใช้เป็น slot block ใน materialConfig (ตัวสลับกรองฝั่งหน้าจอ ไม่ยิง request)

  Props:
    modelValue — String — ตัวสลับที่เลือก
    options    — Array<{ value, label }>
    ariaLabel  — String ('')
    canManage  — Boolean (false)
  Emits: update:modelValue · open-policy
-->
<template>
  <div class="material-items-toolbar">
    <ToggleGroupGeneric :modelValue="modelValue" :options="options" :ariaLabel="ariaLabel" @update:modelValue="$emit('update:modelValue', $event)" />
    <ButtonGeneric v-if="canManage" variant="outline" icon="bi-gear" :label="$t('view.productionInsight.materialInsight.policyButton')" @click="$emit('open-policy')" />
  </div>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

export default {
  name: 'MaterialItemsToolbar',

  components: { ButtonGeneric, ToggleGroupGeneric },

  props: {
    modelValue: { type: String, default: 'all' },
    options: { type: Array, default: () => [] },
    ariaLabel: { type: String, default: '' },
    canManage: { type: Boolean, default: false }
  },

  emits: ['update:modelValue', 'open-policy']
}
</script>

<style lang="scss" scoped>
.material-items-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
}
</style>
