<!--
  FlowBlock — วาด block หนึ่งชิ้นของแผงรายละเอียด (heading | metrics | table | note | flags | lens)
  ชนิดและรูปของ block ดู flow-panel-models.js — lens ซ้อน block ลูกได้ (เรียกตัวเองซ้ำ)
  Emits: go (id สถานี/โซนที่กดจากแถวตาราง)
-->
<template>
  <div v-if="block.type === 'heading'" class="flow-heading">
    <h2 class="flow-heading__title">{{ block.title }}</h2>
    <p v-if="block.role" class="flow-heading__role">{{ block.role }}</p>
  </div>

  <div v-else-if="block.type === 'metrics'" class="flow-metrics">
    <div v-for="m in block.items" :key="m.key" class="flow-metric" :class="{ 'flow-metric--bad': m.bad }">
      <div class="flow-metric__label">{{ m.label }}</div>
      <div class="flow-metric__value">
        {{ m.value }}<small v-if="m.unit"> {{ m.unit }}</small>
      </div>
      <div v-if="m.def" class="flow-metric__def">{{ m.def }}</div>
    </div>
  </div>

  <div v-else-if="block.type === 'table'" class="flow-section">
    <p v-if="block.title" class="flow-section__title">{{ block.title }}</p>
    <ul v-if="block.legend" class="flow-legend">
      <li v-for="n in 4" :key="n" :class="`flow-legend__item flow-legend__item--${n}`">{{ $t(`view.executive.flow.legend.age${n}`) }}</li>
    </ul>
    <p v-if="block.note" class="flow-section__note">{{ block.note }}</p>
    <FlowTable :columns="block.columns" :rows="block.rows" :clickable="!!block.clickable" @go="$emit('go', $event)" />
  </div>

  <p v-else-if="block.type === 'note'" class="flow-section__note">{{ block.text }}</p>

  <div v-else-if="block.type === 'flags'" class="flow-section">
    <p class="flow-section__title">{{ block.title }}</p>
    <div class="flow-flags">
      <div v-for="(f, i) in block.items" :key="i" class="flow-flag">
        <b v-if="f.strong">{{ f.strong }}</b>
        {{ f.text }}
      </div>
    </div>
  </div>

  <div v-else-if="block.type === 'lens'" class="flow-lens">
    <p v-if="block.title" class="flow-section__title">{{ block.title }}</p>
    <FlowBlock v-for="(child, i) in block.blocks" :key="child.key || i" :block="child" @go="$emit('go', $event)" />
  </div>
</template>

<script>
import FlowTable from './flow-table.vue'

export default {
  name: 'FlowBlock',

  components: { FlowTable },

  props: {
    block: { type: Object, required: true }
  },

  emits: ['go']
}
</script>

<style lang="scss" scoped>
.flow-heading {
  &__title {
    margin: 0;
    font-size: var(--fs-xl);
    font-weight: 700;
  }

  &__role {
    margin: var(--sp-xs) 0 0;
    color: var(--base-sub-color);
    font-size: var(--fs-base);
  }
}

.flow-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(var(--sp-2xl) * 9), 1fr));
  gap: var(--sp-md) var(--sp-xl);
}

.flow-metric {
  border-top: 1px solid var(--color-border);
  padding-top: var(--sp-sm);
  min-width: 0;

  &__label {
    font-size: var(--fs-base);
    color: var(--base-sub-color);
  }

  &__value {
    font-size: var(--fs-xl);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;

    small {
      font-size: var(--fs-sm);
      font-weight: 400;
      color: var(--base-sub-color);
    }
  }

  &__def {
    margin-top: var(--sp-xs);
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
  }

  &--bad &__value {
    color: var(--base-font-color);
  }
}

.flow-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);

  &__title {
    margin: 0;
    font-size: var(--fs-sm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--base-sub-color);
  }

  &__note {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
  }
}

.flow-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-xs) var(--sp-lg);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);

  &__item::before {
    content: '';
    display: inline-block;
    width: var(--sp-md);
    height: var(--sp-md);
    margin-right: var(--sp-xs);
    border-radius: var(--radius-sm);
    vertical-align: middle;
  }

  &__item--1::before {
    background: var(--base-green);
  }

  &__item--2::before {
    background: var(--base-sub-color);
  }

  &__item--3::before {
    background: var(--status-closed-bg);
    border: 1px solid var(--color-border);
  }

  &__item--4::before {
    background: var(--base-warning);
  }
}

.flow-flags {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.flow-flag {
  background: var(--status-open-bg);
  border: 1px solid var(--base-warning);
  border-radius: var(--radius-md);
  padding: var(--sp-sm) var(--sp-md);
  font-size: var(--fs-base);
  color: var(--base-sub-color);

  b {
    color: var(--base-font-color);
  }
}

.flow-lens {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
}
</style>
