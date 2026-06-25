<!--
  InputTextGeneric — wrap native <input class="form-control">
  ใช้ @include input-control จาก mixin.scss → padding sync กับ DropdownGeneric

  ตัวอย่างการใช้งาน:
  <InputTextGeneric
    v-model="form.name"
    placeholder="กรอกชื่อ"
    :required="true"
    :trim="true"
    @blur="onBlur"
  />

  <InputTextGeneric
    v-model="form.price"
    type="number"
    placeholder="0.00"
    :bgInput="true"
    :step="0.01"
    :min="0"
    :max="100"
  />

  <InputTextGeneric
    id="tel1"
    type="tel"
    icon="bi-telephone-fill"
    v-model.trim="form.tel1"
  />

  Props:
    modelValue   — v-model value
    type         — 'text' | 'number' | 'email' | 'tel' (default: 'text')
    placeholder  — placeholder text
    disabled     — disable input
    readonly     — readonly input
    required     — mark as required (HTML attr)
    trim         — auto-trim value on update:modelValue
    bgInput      — adds class bg-input (bg #f5f5f5)
    step         — HTML step attribute (Number/String, default null — only bound when provided)
    min          — HTML min attribute (Number/String, default null — only bound when provided)
    max          — HTML max attribute (Number/String, default null — only bound when provided)
    maxlength    — HTML maxlength attribute (Number/String, default null — only bound when provided)
    icon         — Bootstrap icon class name e.g. 'bi-telephone-fill' (default '' = no icon)
    iconPosition — 'left' (default) — 'right' support reserved for future use

  Emits: update:modelValue, blur, focus
-->
<template>
  <div
    v-if="icon"
    class="input-icon-group"
    :class="{ 'is-disabled': disabled }"
  >
    <i :class="['bi', icon, 'input-icon']"></i>
    <input
      v-bind="$attrs"
      :type="type"
      class="form-control has-icon-left"
      :class="{ 'bg-input': bgInput }"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :step="step !== null ? step : undefined"
      :min="min !== null ? min : undefined"
      :max="max !== null ? max : undefined"
      :maxlength="maxlength !== null ? maxlength : undefined"
      @input="onInput"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
  </div>
  <input
    v-else
    v-bind="$attrs"
    :type="type"
    class="form-control"
    :class="{ 'bg-input': bgInput }"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :step="step !== null ? step : undefined"
    :min="min !== null ? min : undefined"
    :max="max !== null ? max : undefined"
    :maxlength="maxlength !== null ? maxlength : undefined"
    @input="onInput"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  />
</template>

<script>
export default {
  name: 'InputTextGeneric',

  inheritAttrs: false,

  props: {
    modelValue: {
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
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    trim: {
      type: Boolean,
      default: false
    },
    bgInput: {
      type: Boolean,
      default: false
    },
    step: {
      type: [Number, String],
      default: null
    },
    min: {
      type: [Number, String],
      default: null
    },
    max: {
      type: [Number, String],
      default: null
    },
    maxlength: {
      type: [Number, String],
      default: null
    },
    icon: {
      type: String,
      default: ''
    },
    iconPosition: {
      type: String,
      default: 'left'
    }
  },

  emits: ['update:modelValue', 'blur', 'focus'],

  methods: {
    onInput(event) {
      const val = event.target.value
      this.$emit('update:modelValue', this.trim ? val.trim() : val)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

input.form-control {
  @include input-control;
}

.input-icon-group {
  position: relative;
  width: 100%;

  .input-icon {
    position: absolute;
    left: var(--sp-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--base-font-color);
    font-size: 0.95rem;
    pointer-events: none;
  }

  input.form-control.has-icon-left {
    padding-left: calc(var(--sp-md) + 20px);
  }

  &.is-disabled .input-icon {
    opacity: 0.5;
  }
}
</style>
