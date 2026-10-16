<!--
  FlowPanel — แผงรายละเอียดใต้ฉาก: วาด blocks ที่ flow-panel-models.js สร้างไว้ตามลำดับ
  Props: blocks — array ของ block   Emits: go (id สถานี/โซนที่กดจากแถวตาราง)
-->
<template>
  <div class="flow-panel" aria-live="polite">
    <FlowBlock v-for="(block, i) in blocks" :key="block.key || `${block.type}-${i}`" :block="block" @go="$emit('go', $event)" />
  </div>
</template>

<script>
import FlowBlock from './flow-block.vue'

export default {
  name: 'FlowPanel',

  components: { FlowBlock },

  props: {
    blocks: { type: Array, default: () => [] }
  },

  emits: ['go']
}
</script>

<style lang="scss" scoped>
.flow-panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
  min-width: 0;
}
</style>
