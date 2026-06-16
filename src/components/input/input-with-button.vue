<template>
  <div class="input-group" :style="width ? { width } : {}">
    <input
      class="form-control bg-input input-bg"
      :class="inputClass"
      :type="type"
      :value="modelValue"
      :readonly="readonly"
      :disabled="disabled"
      :min="min !== null ? min : undefined"
      :max="max !== null ? max : undefined"
      :step="step !== null ? step : undefined"
      :placeholder="placeholder"
      @input="onInput"
    />
    <div class="input-group-append">
      <button
        :class="btnClass"
        type="button"
        :title="btnTitle"
        :disabled="disabled || btnDisabled"
        @click="$emit('btn-click')"
      >
        <slot name="btn-content" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InputWithButton',

  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: null
    },
    min: {
      type: [String, Number],
      default: null
    },
    max: {
      type: [String, Number],
      default: null
    },
    step: {
      type: [String, Number],
      default: null
    },
    inputClass: {
      type: String,
      default: ''
    },
    btnClass: {
      type: String,
      default: 'btn btn-main btn-sm'
    },
    btnTitle: {
      type: String,
      default: ''
    },
    btnDisabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'btn-click'],

  methods: {
    onInput(event) {
      const value = this.type === 'number' ? Number(event.target.value) : event.target.value
      this.$emit('update:modelValue', value)
    }
  }
}
</script>

<style scoped>
.input-group .form-control {
  border-right: 0;
  height: 35px !important;
}

.input-group .btn {
  margin-top: 5px;
  height: 35px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}


</style>
