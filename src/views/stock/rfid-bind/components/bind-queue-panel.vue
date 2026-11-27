<template>
  <SectionCardGeneric class="queue-panel" :title="$t('view.stock.rfidBind.queue.title')" icon="bi-list-ol" accent="main" headerStyle="legend">
    <div class="queue-panel__head">
      <span class="queue-panel__remaining">{{ $t('view.stock.rfidBind.queue.remaining', { count: remaining }) }}</span>
      <CheckboxGeneric :modelValue="hideBound" :label="$t('view.stock.rfidBind.queue.hideBound')" @update:modelValue="$emit('update:hideBound', $event)" />
      <ButtonGeneric
        class="ml-auto"
        variant="dark"
        icon="bi-trash"
        :title="$t('view.stock.rfidBind.queue.clear')"
        :aria-label="$t('view.stock.rfidBind.queue.clear')"
        :disabled="!queue.length"
        @click="$emit('clear')"
      />
    </div>

    <div ref="list" class="queue-list" role="listbox" :aria-label="$t('view.stock.rfidBind.queue.title')" @keydown="onListKey">
      <div
        v-for="row in rows"
        :key="row.unit.unitId"
        role="option"
        :aria-selected="row.isCurrent"
        :tabindex="row.index === focusIndex ? 0 : -1"
        :data-index="row.index"
        :class="['queue-row', { 'queue-row--current': row.isCurrent, 'queue-row--bound': row.bound }]"
        @click="$emit('select', row.index)"
        @focus="focusIndex = row.index"
      >
        <span :class="['queue-row__badge', { 'queue-row__badge--bound': row.bound, 'queue-row__badge--current': row.isCurrent }]">
          {{ row.badge }}
        </span>
        <span class="queue-row__main">
          <span class="queue-row__no">
            {{ row.no }}
            <span v-if="row.unitText" class="queue-row__unit">{{ $t('view.stock.rfidBind.queue.unit', { unit: row.unitText }) }}</span>
          </span>
          <span v-if="row.secondary" class="queue-row__sub">{{ row.secondary }}</span>
          <span class="queue-row__sub">{{ row.name }}</span>
          <span v-if="row.plan" class="queue-row__sub">{{ $t('view.stock.rfidBind.plan.colPlan') }} {{ row.plan }}</span>
        </span>
        <span class="queue-row__tail">
          <span v-if="row.unit.unitStatus === 'RESERVED'" class="queue-tag queue-tag--reserved">{{ $t('view.stock.rfidBind.queue.reserved') }}</span>
          <span v-if="row.bound" class="queue-tag queue-tag--bound">{{ $t('view.stock.rfidBind.queue.bound') }}</span>
          <span v-else class="queue-row__loc">{{ $t('view.stock.rfidBind.queue.location', { code: row.unit.locationCode }) }}</span>
        </span>
        <ButtonGeneric
          v-if="!row.bound"
          variant="plain"
          icon="bi-x-lg"
          :title="$t('view.stock.rfidBind.queue.remove')"
          :aria-label="$t('view.stock.rfidBind.queue.remove')"
          @click="onRemove($event, row.index)"
        />
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import { isUnitBound, planTextOf, labelNumber, labelSecondary, unitOfLot, productName } from '../rfid-bind-logic.js'

export default {
  name: 'RfidBindQueuePanel',

  components: { SectionCardGeneric, ButtonGeneric, CheckboxGeneric },

  props: {
    queue: { type: Array, default: () => [] },
    currentIndex: { type: Number, default: -1 },
    hideBound: { type: Boolean, default: false }
  },

  emits: ['select', 'remove', 'clear', 'update:hideBound'],

  data() {
    return { focusIndex: -1 }
  },

  computed: {
    remaining() {
      return this.queue.filter((unit) => !isUnitBound(unit)).length
    },

    rows() {
      return this.queue
        .map((unit, index) => {
          const bound = isUnitBound(unit)
          const isCurrent = index === this.currentIndex
          return {
            unit,
            index,
            bound,
            isCurrent,
            badge: bound ? '✓' : isCurrent ? '▶' : String(index + 1),
            no: labelNumber(unit),
            secondary: labelSecondary(unit),
            unitText: unitOfLot(unit),
            name: productName(unit, this.$i18n.locale),
            plan: planTextOf(unit)
          }
        })
        .filter((row) => !(this.hideBound && row.bound && !row.isCurrent))
    }
  },

  watch: {
    currentIndex: {
      immediate: true,
      handler(value) {
        this.focusIndex = value
        this.scrollToCurrent()
      }
    },

    'queue.length'() {
      this.scrollToCurrent()
    },

    hideBound() {
      this.scrollToCurrent()
    }
  },

  methods: {
    scrollToCurrent() {
      this.$nextTick(() => {
        const row = this.$refs.list?.querySelector(`[data-index="${this.currentIndex}"]`)
        if (row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' })
      })
    },

    onRemove(event, index) {
      event.stopPropagation()
      this.$emit('remove', index)
    },

    onListKey(event) {
      const indexes = this.rows.map((row) => row.index)
      const pos = indexes.indexOf(this.focusIndex)
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const next = indexes[Math.min(indexes.length - 1, Math.max(0, pos + (event.key === 'ArrowDown' ? 1 : -1)))]
        if (next === undefined) return
        this.focusIndex = next
        this.$nextTick(() => this.$refs.list.querySelector(`[data-index="${next}"]`)?.focus())
      } else if ((event.key === 'Enter' || event.key === ' ') && event.target.getAttribute('role') === 'option') {
        event.preventDefault()
        this.$emit('select', Number(event.target.dataset.index))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.queue-panel__head {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  flex-wrap: wrap;
  margin-bottom: var(--sp-sm);
}

.queue-panel__remaining {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
  font-weight: 600;
}

.queue-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 38vh;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.queue-row {
  display: flex;
  align-items: center;
  gap: var(--sp-md);
  padding: var(--sp-sm) var(--sp-md);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  background: var(--color-card-bg);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-highlight-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--base-font-color);
    outline-offset: -2px;
  }

  &--current {
    background: var(--color-highlight-bg);
    outline: 2px solid var(--base-font-color);
    outline-offset: -2px;
  }
}

.queue-row__badge {
  width: var(--sp-2xl);
  height: var(--sp-2xl);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-size: var(--fs-base);
  font-weight: 700;
  background: var(--status-closed-bg);
  color: var(--base-sub-color);

  &--current {
    background: var(--base-font-color);
    color: var(--on-inverse);
  }

  &--bound {
    background: var(--base-green);
    color: var(--on-inverse);
  }
}

.queue-row__main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.queue-row__no {
  font-weight: 700;
  color: var(--base-font-sub-color);
  font-size: var(--fs-base);
}

.queue-row__unit {
  font-weight: 400;
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
  margin-left: var(--sp-xs);
}

.queue-row__sub {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-row__tail {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--sp-xs);
}

.queue-row__loc {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.queue-tag {
  font-size: var(--fs-sm);
  font-weight: 600;
  border-radius: var(--radius-lg);
  padding: 0 var(--sp-sm);
  border: 1px solid currentColor;

  &--reserved {
    color: var(--base-font-color);
    background: var(--status-open-bg);
  }

  &--bound {
    color: var(--base-green);
    background: var(--status-resolved-bg);
  }
}

@media (max-height: 800px) {
  .queue-list {
    max-height: 17vh;
  }
}
</style>
