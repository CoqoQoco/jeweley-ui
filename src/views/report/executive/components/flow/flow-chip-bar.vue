<!--
  FlowChipBar — แถวเลือกใต้ฉาก: Zone (All + 6) · Station (ของโซนที่เลือก) · Z4 lens (มุมมองของคลังสินค้า)
  Props: selected, stockLens, stations — [{ id, zone, name, trust: { level } }]
  Emits: select (id), update:stockLens
-->
<template>
  <div class="flow-chips">
    <div class="flow-chips__row">
      <span class="flow-chips__label">{{ $t('view.executive.flow.chips.zone') }}</span>
      <ToggleGroupGeneric :modelValue="zoneValue" :options="zoneOptions" :ariaLabel="$t('view.executive.flow.chips.zone')" @update:modelValue="$emit('select', $event)" />
    </div>
    <div v-if="stationOptions.length" class="flow-chips__row">
      <span class="flow-chips__label">{{ $t('view.executive.flow.chips.station') }}</span>
      <ToggleGroupGeneric :modelValue="stationValue" :options="stationOptions" :ariaLabel="$t('view.executive.flow.chips.station')" @update:modelValue="$emit('select', $event)" />
    </div>
    <div class="flow-chips__row">
      <span class="flow-chips__label">{{ $t('view.executive.flow.chips.stockLens') }}</span>
      <ToggleGroupGeneric :modelValue="stockLens" :options="stockLensOptions" :ariaLabel="$t('view.executive.flow.chips.stockLens')" @update:modelValue="$emit('update:stockLens', $event)" />
    </div>
  </div>
</template>

<script>
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'

import { ZONE_IDS, ZONE_CODE, STOCK_LENS_KEYS } from '../../flow-layout.js'
import { zoneOf } from '../../flow-helpers.js'

export default {
  name: 'FlowChipBar',

  components: { ToggleGroupGeneric },

  props: {
    selected: { type: String, default: 'all' },
    stockLens: { type: String, default: 'sloc' },
    stations: { type: Array, default: () => [] }
  },

  emits: ['select', 'update:stockLens'],

  computed: {
    zoneValue() {
      return this.selected === 'all' || ZONE_IDS.includes(this.selected) ? this.selected : ''
    },

    zoneOptions() {
      return [{ value: 'all', label: this.$t('view.executive.flow.chips.all') }, ...ZONE_IDS.map((id) => ({ value: id, label: ZONE_CODE[id] }))]
    },

    stationValue() {
      return this.selected === 'all' || ZONE_IDS.includes(this.selected) ? '' : this.selected
    },

    stationOptions() {
      const zone = zoneOf(this.selected)
      if (!zone) return []
      return this.stations
        .filter((s) => s.zone === zone && s.name)
        .map((s) => ({ value: s.id, label: s.trust.level === 'fail' ? `${s.name} !` : s.name, title: s.fullName || undefined }))
    },

    stockLensOptions() {
      return STOCK_LENS_KEYS.map((value) => ({ value, label: this.$t(`view.executive.flow.stockLens.${value}`) }))
    }
  }
}
</script>

<style lang="scss" scoped>
.flow-chips {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);

  :deep(.toggle-group) {
    max-width: 100%;
    overflow-x: auto;
  }

  &__row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--sp-sm);
  }

  &__label {
    flex: none;
    min-width: calc(var(--sp-2xl) * 3);
    font-size: var(--fs-sm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--base-sub-color);
  }
}
</style>
