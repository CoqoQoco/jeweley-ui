<!--
  TextareaGeneric — wrap native <textarea class="form-control">
  ใช้ @include input-control จาก mixin.scss → padding sync กับ DropdownGeneric

  ตัวอย่างการใช้งาน:
  <TextareaGeneric
    v-model="form.remark"
    placeholder="หมายเหตุ"
    :rows="4"
    :maxlength="500"
  />

  Props:
    modelValue  — v-model value
    rows        — number of rows (default: 3)
    placeholder — placeholder text
    disabled    — disable textarea
    required    — mark as required
    maxlength   — max character length

  Emits: update:modelValue
-->
<template>
  <textarea
    class="form-control"
    :value="modelValue"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :maxlength="maxlength || undefined"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script>
export default {
  name: 'TextareaGeneric',

  props: {
    modelValue: {
      default: ''
    },
    rows: {
      type: Number,
      default: 3
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number,
      default: null
    }
  },

  emits: ['update:modelValue']
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

textarea.form-control {
  @include input-control;
  resize: vertical;
}
</style>
