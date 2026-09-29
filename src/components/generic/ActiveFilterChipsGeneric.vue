<!--
  ActiveFilterChipsGeneric — แถว chip แสดงค่าตัวกรองที่ใช้อยู่ ใต้ header ของ dashboard (Dashboard v2)
  ใช้คู่กับ FilterPanelGeneric — ไม่ render อะไรเลยเมื่อ chips ว่าง

  ตัวอย่างการใช้งาน:
  <ActiveFilterChipsGeneric :chips="activeChips" @remove="onRemoveChip" @clear-all="onClearFilter" />

  Props:
    chips — Array ของ { key, label, value, dimmed? } (required)
            label — ชื่อฟิลด์ (เว้นว่างได้ถ้าไม่ต้องการ prefix)
            value — ค่าที่แสดง (ข้อความ resolve แล้ว)
            dimmed — true = ตัวกรองนี้ไม่มีผลกับหมวดที่เปิดอยู่ (opacity .45 + tooltip)

  Emits: remove(key), clear-all
-->
<template>
  <div v-if="chips.length" class="active-filter-chips">
    <div class="active-filter-chips__list">
      <span
        v-for="chip in chips"
        :key="chip.key"
        class="active-filter-chips__chip"
        :class="{ 'active-filter-chips__chip--dimmed': chip.dimmed }"
        :title="chip.dimmed ? $t('view.productionInsight.filter.chipDimmedHint') : null"
      >
        <span class="active-filter-chips__text">
          <template v-if="chip.label">{{ chip.label }}: </template>{{ chip.value }}
        </span>
        <ButtonGeneric
          variant="plain"
          icon="bi-x"
          class="active-filter-chips__remove"
          :title="$t('common.btn.clear')"
          @click="$emit('remove', chip.key)"
        />
      </span>
    </div>
    <ButtonGeneric variant="plain" class="active-filter-chips__clear-all" :label="$t('view.productionInsight.filter.clearAll')" @click="$emit('clear-all')" />
  </div>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'ActiveFilterChipsGeneric',

  components: {
    ButtonGeneric
  },

  props: {
    chips: {
      type: Array,
      required: true
    }
  },

  emits: ['remove', 'clear-all']
}
</script>

<style lang="scss" scoped>
.active-filter-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-top: var(--sp-sm);
}

.active-filter-chips__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.active-filter-chips__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  border: 1px solid var(--base-green);
  border-radius: var(--radius-lg);
  padding: var(--sp-xs) var(--sp-sm);
  color: var(--base-green);
  font-size: var(--fs-sm);
  font-weight: 600;
  background: transparent;

  &--dimmed {
    opacity: 0.45;
  }
}

.active-filter-chips__text {
  white-space: nowrap;
}

.active-filter-chips__remove.btn {
  padding: 0;
  width: 18px;
  height: 18px;
  min-width: 18px;
  font-size: var(--fs-sm);
  color: inherit;
}

.active-filter-chips__clear-all.btn {
  font-size: var(--fs-sm);
  font-weight: 600;
  text-decoration: underline;
  padding: 0;
}
</style>
