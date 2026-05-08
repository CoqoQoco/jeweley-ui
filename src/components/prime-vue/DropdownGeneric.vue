<template>
  <Dropdown
    v-model="localValue"
    :options="options"
    :optionLabel="optionLabel"
    :optionValue="optionValue"
    :placeholder="placeholder"
    :showClear="showClear"
    :disabled="disabled"
    :class="customClass"
    :style="customStyle"
    @change="onChange"
  >
    <template #option="slotProps" v-if="hasOptionSlot">
      <slot name="option" :option="slotProps.option" />
    </template>
  </Dropdown>
</template>

<script>
import Dropdown from 'primevue/dropdown'

export default {
  name: 'DropdownGeneric',

  components: {
    Dropdown
  },

  props: {
    modelValue: {
      default: null
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
    disabled: {
      type: Boolean,
      default: false
    },
    customClass: {
      type: String,
      default: ''
    },
    customStyle: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['update:modelValue', 'change'],

  data() {
    return {
      localValue: this.modelValue
    }
  },

  computed: {
    hasOptionSlot() {
      return !!this.$slots.option
    }
  },

  watch: {
    modelValue(newVal) {
      this.localValue = newVal
    },
    localValue(newVal) {
      this.$emit('update:modelValue', newVal)
    }
  },

  methods: {
    onChange(event) {
      this.$emit('change', event)
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.p-dropdown) {
  width: 100%;

  .p-inputtext {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.9rem;

    &:focus {
      border-color: var(--base-font-color);
      box-shadow: none;
    }
  }

  &:not(.p-disabled):hover {
    border-color: #e0e0e0;
  }

  &:not(.p-disabled).p-focus {
    border-color: var(--base-font-color);
    box-shadow: none;
  }
}
</style>
