<!--
  ButtonGeneric — wrap native <button class="btn btn-sm btn-{variant}">
  variant prop map:
    main       → btn-main
    outline    → btn-outline-main
    green      → btn-green
    red        → btn-red
    dark       → btn-dark
    sub-main   → btn-sub-main

  ตัวอย่างการใช้งาน:
  <ButtonGeneric variant="main" icon="bi-save" label="บันทึก" @click="onSave" />
  <ButtonGeneric variant="outline" label="ยกเลิก" class="ml-2" @click="onCancel" />
  <ButtonGeneric variant="green" icon="bi-search" label="ค้นหา" type="submit" />
  <ButtonGeneric variant="red" icon="bi-trash" :loading="isDeleting" @click="onDelete" />
  <ButtonGeneric variant="main" :block="true">
    <i class="bi bi-plus"></i> เพิ่มรายการ
  </ButtonGeneric>

  Props:
    variant  — 'main' | 'outline' | 'green' | 'red' | 'dark' | 'sub-main' (default: 'main')
    icon     — bootstrap icon class เช่น 'bi-save' (render <i class="bi {icon}">)
    label    — text label (i18n caller ส่ง $t(...) มา)
    type     — 'button' | 'submit' | 'reset' (default: 'button')
    disabled — disable button
    loading  — show spinner + disable button
    block    — w-100 (full width)

  Default slot: override label ได้
  Emits: click
-->
<template>
  <button
    :type="type"
    class="btn btn-sm"
    :class="[variantClass, { 'w-100': block }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <i v-if="loading" class="bi bi-arrow-repeat spin"></i>
    <i v-else-if="icon" :class="['bi', icon]"></i>
    <slot v-if="$slots.default" />
    <span v-else-if="label">{{ label }}</span>
  </button>
</template>

<script>
const VARIANT_MAP = {
  main: 'btn-main',
  outline: 'btn-outline-main',
  green: 'btn-green',
  red: 'btn-red',
  dark: 'btn-dark',
  'sub-main': 'btn-sub-main'
}

export default {
  name: 'ButtonGeneric',

  props: {
    variant: {
      type: String,
      default: 'main'
    },
    icon: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'button'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    }
  },

  emits: ['click'],

  computed: {
    variantClass() {
      return VARIANT_MAP[this.variant] || 'btn-main'
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.spin {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

.btn {
  i + span,
  i + :deep(*) {
    margin-left: var(--sp-xs);
  }
}
</style>
