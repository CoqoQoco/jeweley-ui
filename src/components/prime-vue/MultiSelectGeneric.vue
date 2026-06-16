<!--
  MultiSelectGeneric — wrap PrimeVue MultiSelect
  ตามแบบ DropdownGeneric pattern

  ตัวอย่างการใช้งาน:
  <MultiSelectGeneric
    v-model="form.tags"
    :options="tagOptions"
    optionLabel="label"
    optionValue="value"
    placeholder="เลือกแท็ก"
    :filter="true"
  />

  <MultiSelectGeneric
    v-model="form.categories"
    :options="categoryList"
    optionLabel="name"
    placeholder="เลือกหมวดหมู่"
  />

  Props:
    modelValue  — v-model value (array)
    options     — array of option objects
    optionLabel — field to display (default: 'label')
    optionValue — field to use as value (default: null = full object)
    placeholder — placeholder text
    showClear   — show clear button (default: false)
    filter      — show filter input (default: true)
    disabled    — disable component

  Emits: update:modelValue
-->
<template>
  <MultiSelect
    v-model="localValue"
    :options="options"
    :optionLabel="optionLabel"
    :optionValue="optionValue"
    :placeholder="placeholder"
    :showClear="showClear"
    :filter="filter"
    :disabled="disabled"
    display="chip"
  />
</template>

<script>
import MultiSelect from 'primevue/multiselect'

export default {
  name: 'MultiSelectGeneric',

  components: {
    MultiSelect
  },

  props: {
    modelValue: {
      default: () => []
    },
    options: {
      type: Array,
      default: () => []
    },
    optionLabel: {
      type: String,
      default: 'label'
    },
    optionValue: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: ''
    },
    showClear: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue'],

  data() {
    return {
      localValue: this.modelValue
    }
  },

  watch: {
    modelValue(newVal) {
      this.localValue = newVal
    },
    localValue(newVal) {
      this.$emit('update:modelValue', newVal)
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.p-multiselect) {
  width: 100%;

  .p-multiselect-label {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  &:not(.p-disabled):hover {
    border-color: var(--color-border);
  }

  &:not(.p-disabled).p-focus {
    border-color: var(--base-font-color);
    box-shadow: none;
  }
}
</style>
