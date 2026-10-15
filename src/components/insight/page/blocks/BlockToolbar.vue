<!--
  BlockToolbar — แถบเครื่องมือใต้หัวกรอบของ block (TableBlock/TrendBlock): บรรทัดแนะนำ + ชิป (เช่น "ร่าง") + ปุ่ม action
  toolbar config: { hint: key|fn(ctx,t), chip: fn(ctx,t) → ข้อความชิป ('' = ไม่แสดง), actions: [{ type:'targetDrawer', preset }],
    multiselect{ stateKey, options(ctx,t), placeholder }, toggle{ stateKey, options, aria } } — ตัวกรอง client-side (การกรองจริงอยู่ที่ TableBlock)

  Props: toolbar (Object), ctx (Object)
-->
<template>
  <div v-if="hasFilters" class="block-toolbar block-toolbar--filters">
    <MultiSelectGeneric
      v-if="toolbar.multiselect"
      :modelValue="ctx.state[toolbar.multiselect.stateKey]"
      :options="multiselectOptions"
      optionLabel="label"
      optionValue="value"
      :placeholder="$t(toolbar.multiselect.placeholder)"
      :showClear="true"
      class="block-toolbar__multiselect"
      @update:modelValue="ctx.setState(toolbar.multiselect.stateKey, $event)"
    />
    <ToggleGroupGeneric
      v-if="toolbar.toggle"
      :modelValue="toggleValue"
      :options="toggleOptions"
      :ariaLabel="$t(toolbar.toggle.aria)"
      @update:modelValue="onToggle"
    />
  </div>

  <div v-if="hasHint || (toolbar.actions || []).length" class="block-toolbar">
    <p v-if="hasHint" class="block-toolbar__hint">
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

import { buildToggleOptions } from './plan-table-block-helpers.js'

import TargetDrawer from './TargetDrawer.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

export default {
  name: 'BlockToolbar',

  components: { TargetDrawer, MultiSelectGeneric, ToggleGroupGeneric },

  props: {
    toolbar: { type: Object, required: true },
    ctx: { type: Object, required: true }
  },

  methods: {
    onToggle(value) {
      const toggle = this.toolbar.toggle
      if (toggle.onChange) toggle.onChange(this.ctx, value)
      else this.ctx.setState(toggle.stateKey, value)
    }
  },

  computed: {
    hasFilters() {
      return !!(this.toolbar.multiselect || this.toolbar.toggle)
    },

    hasHint() {
      return !!(this.hintText || this.chipText)
    },

    multiselectOptions() {
      return this.toolbar.multiselect.options(this.ctx, (key, params) => this.$t(key, params))
    },

    // toggle เขียน state ของหน้า (default) หรือ value(ctx)/onChange(ctx,v) เมื่อค่าอยู่นอก state (เช่น filter ของหน้า)
    toggleValue() {
      const toggle = this.toolbar.toggle
      return toggle.value ? toggle.value(this.ctx) : this.ctx.state[toggle.stateKey]
    },

    toggleOptions() {
      return buildToggleOptions(this.toolbar.toggle, (key, params) => this.$t(key, params), this.ctx)
    },

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

.block-toolbar--filters {
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: var(--sp-lg);
}

.block-toolbar__multiselect {
  min-width: 220px;
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
