<!--
  ToggleGroupGeneric — segmented toggle (สกัดจาก gold-loss-dashboard `.group-by-toggle`, 2nd usage)
  ใช้แทนปุ่ม toggle กลุ่ม (เช่น สลับมุมมอง/สลับแยกตาม) ที่เขียน markup เอง

  ตัวอย่างการใช้งาน:
  <ToggleGroupGeneric
    v-model="groupBy"
    :options="[
      { value: 'productType', label: $t('view.x.groupByProductType') },
      { value: 'gold', label: $t('view.x.groupByGold') }
    ]"
    :ariaLabel="$t('view.x.groupByLabel')"
  />

  Props:
    modelValue — String|Number (required) — ค่าที่เลือกอยู่
    options    — Array (required) ของ { value, label }
    ariaLabel  — String ('') — aria-label ของ role="tablist"
    disabled   — Boolean (false) — ปิดการกดทุกปุ่ม

  Emits: update:modelValue
-->
<template>
  <div class="toggle-group" role="tablist" :aria-label="ariaLabel || null">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      class="toggle-group__btn"
      :class="{ 'toggle-group__btn--active': option.value === modelValue }"
      :aria-selected="option.value === modelValue"
      :disabled="disabled"
      @click="onSelect(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'ToggleGroupGeneric',

  props: {
    modelValue: {
      type: [String, Number],
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    ariaLabel: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue'],

  methods: {
    onSelect(value) {
      if (this.disabled || value === this.modelValue) return
      this.$emit('update:modelValue', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.toggle-group {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.toggle-group__btn {
  border: none;
  background: var(--color-card-bg);
  padding: var(--sp-xs) var(--sp-lg);
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--base-sub-color);
  cursor: pointer;

  & + & {
    border-left: 1px solid var(--color-border);
  }

  &:hover:not(:disabled):not(.toggle-group__btn--active) {
    background: var(--color-highlight-bg);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &--active,
  &--active:hover {
    background: var(--base-green);
    color: var(--on-inverse);
    cursor: default;
  }
}
</style>
