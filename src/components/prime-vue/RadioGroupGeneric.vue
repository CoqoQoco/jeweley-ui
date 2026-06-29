<template>
  <div class="radio-group-wrapper" :class="{ 'is-inline': inline }">
    <div
      v-for="option in options"
      :key="getOptionValue(option)"
      class="radio-option"
      :class="{ 'is-inline': inline }"
    >
      <RadioButton
        :inputId="`${groupId}-${getOptionValue(option)}`"
        :value="getOptionValue(option)"
        v-model="localValue"
        :disabled="disabled"
      />
      <label
        :for="`${groupId}-${getOptionValue(option)}`"
        class="radio-label"
        :class="{ 'is-disabled': disabled }"
      >
        {{ getOptionLabel(option) }}
      </label>
    </div>
  </div>
</template>

<script>
import RadioButton from 'primevue/radiobutton'

let _uid = 0

export default {
  name: 'RadioGroupGeneric',

  components: {
    RadioButton
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
    inline: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue'],

  data() {
    _uid++
    return {
      localValue: this.modelValue,
      groupId: `radio-group-${_uid}`
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
    getOptionLabel(option) {
      if (typeof option === 'object' && option !== null) {
        return option[this.optionLabel] ?? String(option)
      }
      return String(option)
    },

    getOptionValue(option) {
      if (this.optionValue && typeof option === 'object' && option !== null) {
        return option[this.optionValue]
      }
      if (this.optionValue === null && typeof option === 'object' && option !== null) {
        return JSON.stringify(option)
      }
      return option
    }
  }
}
</script>

<style lang="scss" scoped>
.radio-group-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);

  &.is-inline {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--sp-md);
  }
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.radio-label {
  margin: 0;
  cursor: pointer;
  font-size: var(--fs-base);
  line-height: var(--lh-sm);
  user-select: none;
  color: var(--base-font-color);

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

:deep(.p-radiobutton) {
  .p-radiobutton-box {
    border-color: var(--color-border);

    &.p-highlight {
      background: var(--base-font-color);
      border-color: var(--base-font-color);
    }

    &:not(.p-disabled):hover {
      border-color: var(--base-font-color);
    }
  }

  &:not(.p-radiobutton-disabled) .p-radiobutton-box.p-focus {
    box-shadow: none;
    border-color: var(--base-font-color);
  }
}
</style>
