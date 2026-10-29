<template>
  <div class="unit-list">
    <div
      role="button"
      tabindex="0"
      class="unit-item unit-auto"
      :class="{ selected: chosenUnitId === null }"
      @click="$emit('choose', null)"
      @keyup.enter="$emit('choose', null)"
    >
      <i class="bi" :class="chosenUnitId === null ? 'bi-check-circle-fill' : 'bi-circle'"></i>
      <span>{{ $t('view.mobile.rfidBind.unitAuto') }}</span>
    </div>

    <div
      v-for="unit in units"
      :key="unit.unitId"
      :role="isFree(unit) ? 'button' : undefined"
      :tabindex="isFree(unit) ? 0 : undefined"
      class="unit-item"
      :class="{ selected: chosenUnitId === unit.unitId, disabled: !isFree(unit) }"
      @click="isFree(unit) && $emit('choose', unit.unitId)"
      @keyup.enter="isFree(unit) && $emit('choose', unit.unitId)"
    >
      <i v-if="isFree(unit)" class="bi" :class="chosenUnitId === unit.unitId ? 'bi-check-circle-fill' : 'bi-circle'"></i>
      <i v-else class="bi" :class="unit.status === 'SOLD' ? 'bi-slash-circle' : 'bi-tag-fill'"></i>
      <span class="unit-body">
        <span class="unit-title">
          {{ $t('view.mobile.rfidBind.unitTitle', { unit: label(unit) }) }}
          <span class="unit-status">{{ statusText(unit.status) }}</span>
        </span>
        <span v-if="unit.locationName || unit.locationCode" class="unit-meta">
          {{ $t('view.mobile.rfidBind.pieceLocation') }}: {{ unit.locationName || unit.locationCode }}
        </span>
        <span v-if="unit.epc" class="unit-meta unit-epc">{{ unit.epc }}</span>
        <span v-else class="unit-meta">{{ $t('view.mobile.rfidBind.unitUntagged') }}</span>
      </span>
      <ButtonGeneric
        v-if="unit.epc && unit.status !== 'SOLD'"
        variant="red"
        icon="bi-link-45deg"
        :title="$t('view.mobile.rfidBind.unbindBtn')"
        @click.stop="$emit('unbind', unit)"
      />
    </div>
  </div>
</template>

<script>
import { formatUnit, isSelectableUnit } from '../rfid-bind-helpers.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'RfidUnitList',

  components: { ButtonGeneric },

  props: {
    units: { type: Array, default: () => [] },
    lotQty: { type: Number, default: 0 },
    chosenUnitId: { type: [Number, String], default: null }
  },

  emits: ['choose', 'unbind'],

  methods: {
    isFree: isSelectableUnit,

    label(unit) {
      return formatUnit(unit.unitNo, this.lotQty)
    },

    statusText(status) {
      const key = { IN_STOCK: 'unitInStock', RESERVED: 'unitReserved', SOLD: 'unitSold' }[status]
      return key ? this.$t(`view.mobile.rfidBind.${key}`) : status || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.unit-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.unit-item {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  min-height: 52px;
  padding: var(--sp-md);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--base-font-sub-color);

  > i {
    font-size: 1.4rem;
    flex-shrink: 0;
  }

  &.selected {
    border-color: var(--base-green);
    background: var(--color-green-bg);

    > i {
      color: var(--base-green);
    }
  }

  &.disabled {
    opacity: 0.75;
  }
}

.unit-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  min-width: 0;
  flex: 1;
}

.unit-title {
  font-weight: 600;
}

.unit-status {
  margin-left: var(--sp-sm);
  font-weight: 400;
  color: var(--base-sub-color);
}

.unit-meta {
  font-size: 0.85rem;
  color: var(--base-sub-color);
}

.unit-epc {
  font-family: monospace;
  word-break: break-all;
}
</style>
