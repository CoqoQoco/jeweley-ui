<!--
  ToggleGroupGeneric — segmented toggle (สกัดจาก `.group-by-toggle` ของหน้า gold-loss-dashboard เดิม)
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
    options    — Array (required) ของ { value, label, title?, icon? } — `title` optional: native tooltip
                 (attribute `title`) ต่อปุ่ม เช่นอธิบายว่าปุ่มนั้นหมายถึงอะไร · `icon` optional: Bootstrap icon class (เช่น 'bi-list-check') นำหน้า label
    ariaLabel  — String ('') — aria-label ของ role="tablist"
    disabled   — Boolean (false) — ปิดการกดทุกปุ่ม
    size       — 'md' | 'sm' (default 'md' = ขนาดเดิมทุกหน้า) — 'sm' = ปุ่มเล็กลง (fs-sm, padding แคบ) ใช้กับแถวลำดับชั้นล่าง
                 (เช่น แถบแท็บย่อยของ insight) เพื่อให้ลำดับชั้นอ่านออกด้วยขนาด

  โฟกัส: ไม่แสดงกรอบ focus ของ browser เมื่อคลิกเมาส์ — คีย์บอร์ดเห็นวงแหวน :focus-visible

  Emits: update:modelValue
-->
<template>
  <div class="toggle-group" :class="{ 'toggle-group--sm': size === 'sm' }" role="tablist" :aria-label="ariaLabel || null">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      class="toggle-group__btn"
      :class="{ 'toggle-group__btn--active': option.value === modelValue }"
      :aria-selected="option.value === modelValue"
      :disabled="disabled"
      :title="option.title || null"
      @click="onSelect(option.value)"
    >
      <i v-if="option.icon" :class="['bi', option.icon]"></i>
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
    },
    size: {
      type: String,
      default: 'md',
      validator: (v) => ['md', 'sm'].includes(v)
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

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(--base-font-color);
    outline-offset: -2px;
  }

  &--active,
  &--active:hover {
    background: var(--base-green);
    color: var(--on-inverse);
    cursor: default;
  }
}

// size="sm" — ปุ่มเล็กลงสำหรับแถวลำดับชั้นล่าง (default md ไม่เปลี่ยน)
.toggle-group--sm .toggle-group__btn {
  padding: var(--sp-xs) var(--sp-md);
  font-size: var(--fs-sm);
}
</style>
