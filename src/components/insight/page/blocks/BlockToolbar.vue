<!--
  BlockToolbar — แถบเครื่องมือใต้หัวกรอบของ block (TableBlock/TrendBlock): บรรทัดแนะนำ + ชิป (เช่น "ร่าง") + ปุ่ม action
  toolbar config: { hint: key|fn(ctx,t), chip: fn(ctx,t) → ข้อความชิป ('' = ไม่แสดง), actions: [{ type:'targetDrawer', preset }] }

  Props: toolbar (Object), ctx (Object)
-->
<template>
  <div class="block-toolbar">
    <p v-if="hintText || chipText" class="block-toolbar__hint">
      {{ hintText }}
      <span v-if="chipText" class="block-toolbar__chip">{{ chipText }}</span>
    </p>
    <template v-for="(action, index) in toolbar.actions || []" :key="index">
      <TargetDrawer v-if="action.type === 'targetDrawer'" :preset="action.preset" :ctx="ctx" />
    </template>
  </div>
</template>

<script>
import { resolveText } from '../insight-page-helpers.js'

import TargetDrawer from './TargetDrawer.vue'

export default {
  name: 'BlockToolbar',

  components: { TargetDrawer },

  props: {
    toolbar: { type: Object, required: true },
    ctx: { type: Object, required: true }
  },

  computed: {
    hintText() {
      return resolveText(this.toolbar.hint, this.ctx, (key, params) => this.$t(key, params))
    },

    chipText() {
      return this.toolbar.chip ? this.toolbar.chip(this.ctx, (key, params) => this.$t(key, params)) : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.block-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);
}

.block-toolbar__hint {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.block-toolbar__chip {
  display: inline-flex;
  align-items: center;
  padding: 1px var(--sp-xs);
  border-radius: var(--radius-sm);
  background: var(--base-warning);
  color: var(--base-font-color);
  font-size: 10px;
  font-weight: 700;
  font-style: normal;
}
</style>
