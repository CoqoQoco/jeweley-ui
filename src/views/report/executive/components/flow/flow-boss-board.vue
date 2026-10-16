<!--
  FlowBossBoard — กระดานผู้บริหาร 6 tile ของแท็บ Flow (กดแล้วตั้ง zone + lens + compare)
  Props: tiles — [{ key, title, confidence: 'high'|'med'|'low', value, lines: [string], target: 'zone|lens|compare' }]
  Emits: select (target string)
-->
<template>
  <SectionCardGeneric :title="$t('view.executive.flow.boss.title')" icon="bi-speedometer2" accent="main" headerStyle="dashboard">
    <div class="flow-boss">
      <button v-for="tile in tiles" :key="tile.key" type="button" class="flow-tile" @click="$emit('select', tile.target)">
        <span class="flow-tile__head">
          <b class="flow-tile__title">{{ tile.title }}</b>
          <i :class="['flow-tile__conf', `flow-tile__conf--${tile.confidence}`]" :title="$t('view.executive.flow.boss.confidence')">
            {{ $t(`view.executive.flow.boss.conf.${tile.confidence}`) }}
          </i>
        </span>
        <span class="flow-tile__value">{{ tile.value }}</span>
        <span v-for="(line, i) in tile.lines" :key="i" class="flow-tile__line">{{ line }}</span>
      </button>
    </div>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'FlowBossBoard',

  components: { SectionCardGeneric },

  props: {
    tiles: { type: Array, default: () => [] }
  },

  emits: ['select']
}
</script>

<style lang="scss" scoped>
.flow-boss {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.flow-tile {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  min-width: 0;
  padding: var(--sp-md) var(--sp-lg);
  text-align: left;
  font: inherit;
  color: var(--base-sub-color);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: var(--base-font-color);
    box-shadow: var(--shadow-md);
  }

  &:focus-visible {
    outline: 2px solid var(--base-font-color);
    outline-offset: 2px;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--sp-sm);
    font-size: var(--fs-sm);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__title {
    font-weight: 700;
  }

  &__conf {
    padding: 0 var(--sp-sm);
    font-style: normal;
    font-weight: 700;
    font-size: var(--fs-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);

    &--high {
      background: var(--base-green);
      border-color: var(--base-green);
      color: var(--on-inverse);
    }

    &--low {
      border-style: dashed;
      border-color: var(--base-warning);
      color: var(--base-font-color);
    }
  }

  &__value {
    font-size: var(--fs-xl);
    font-weight: 700;
    color: var(--base-font-color);
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  &__line {
    font-size: var(--fs-sm);
    line-height: var(--lh-sm);
  }
}
</style>
