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
  />

  Props:
    modelValue  — v-model value
    type        — 'text' | 'number' | 'email' | 'tel' (default: 'text')
    placeholder — placeholder text
    disabled    — disable input
    readonly    — readonly input
    required    — mark as required (HTML attr)
    trim        — auto-trim value on update:modelValue
    bgInput     — adds class bg-input (bg #f5f5f5)

  Emits: update:modelValue, blur, focus
-->
<template>
  <input
    :type="type"
    class="form-control"
    :class="{ 'bg-input': bgInput }"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    @input="onInput"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  />
</template>

<script>
export default {
  name: 'InputTextGeneric',

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
</style>
