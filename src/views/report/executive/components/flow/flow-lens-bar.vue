<!--
  FlowLensBar — แถบ lens (default|time|worker|trust) + compare (off|gold|size|ptype) เหนือฉาก
  v-model:lens / v-model:compare   Emits: update:lens, update:compare
-->
<template>
  <div class="flow-lensbar">
    <div class="flow-lensbar__group">
      <span class="flow-lensbar__label">{{ $t('view.executive.flow.lens.label') }}</span>
      <ToggleGroupGeneric :modelValue="lens" :options="lensOptions" :ariaLabel="$t('view.executive.flow.lens.label')" @update:modelValue="$emit('update:lens', $event)" />
    </div>
    <div class="flow-lensbar__group">
      <span class="flow-lensbar__label">{{ $t('view.executive.flow.compare.label') }}</span>
      <ToggleGroupGeneric :modelValue="compare" :options="compareOptions" :ariaLabel="$t('view.executive.flow.compare.label')" @update:modelValue="$emit('update:compare', $event)" />
    </div>
  </div>
</template>

<script>
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

import { LENS_KEYS, COMPARE_KEYS } from '../../flow-layout.js'

export default {
  name: 'FlowLensBar',

  components: { ToggleGroupGeneric },

  props: {
    lens: { type: String, default: 'default' },
    compare: { type: String, default: '' }
  },

  emits: ['update:lens', 'update:compare'],

  computed: {
    lensOptions() {
      return LENS_KEYS.map((value) => ({ value, label: this.$t(`view.executive.flow.lens.${value}`) }))
    },

    compareOptions() {
      return ['', ...COMPARE_KEYS].map((value) => ({ value, label: this.$t(`view.executive.flow.compare.${value || 'off'}`) }))
    }
  }
}
</script>

<style lang="scss" scoped>
.flow-lensbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-sm) var(--sp-xl);

  :deep(.toggle-group) {
    max-width: 100%;
    overflow-x: auto;
  }

  &__group {
    display: flex;
    align-items: center;
    gap: var(--sp-sm);
    flex-wrap: wrap;
  }

  &__label {
    font-size: var(--fs-sm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--base-sub-color);
  }
}
</style>
