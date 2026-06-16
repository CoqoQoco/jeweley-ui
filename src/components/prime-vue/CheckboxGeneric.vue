<!--
  CheckboxGeneric — wrap PrimeVue Checkbox
  รองรับทั้ง binary mode (true/false) และ array mode (push value)

  ตัวอย่างการใช้งาน:
  Binary mode (default):
  <CheckboxGeneric v-model="form.isActive" label="เปิดใช้งาน" />

  Array mode (checklist):
  <CheckboxGeneric
    v-model="form.selectedIds"
    :value="item.id"
    :binary="false"
    :label="item.name"
  />

  Disabled:
  <CheckboxGeneric v-model="form.isLocked" label="ล็อค" :disabled="true" />

  Props:
    modelValue — v-model (Boolean เมื่อ binary=true, Array เมื่อ binary=false)
    value      — value ที่ push เข้า array (ใช้เมื่อ binary=false)
    binary     — true/false mode (default: true)
    label      — label text ที่แสดงข้างๆ checkbox
    disabled   — disable checkbox

  Emits: update:modelValue
-->
<template>
  <div class="checkbox-wrapper">
    <Checkbox
      v-model="localValue"
      :value="value"
      :binary="binary"
      :disabled="disabled"
      :inputId="inputId"
    />
    <label v-if="label" :for="inputId" class="checkbox-label">{{ label }}</label>
  </div>
</template>

<script>
import Checkbox from 'primevue/checkbox'

let _uid = 0

export default {
  name: 'CheckboxGeneric',

  components: {
    Checkbox
  },

  props: {
    modelValue: {
      default: false
    },
    value: {
      default: null
    },
    binary: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: ''
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
      inputId: `checkbox-generic-${_uid}`
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
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-sm);

  .checkbox-label {
    margin: 0;
    cursor: pointer;
    font-size: var(--fs-base);
    line-height: var(--lh-sm);
    user-select: none;
  }
}

:deep(.p-checkbox) {
  .p-checkbox-box {
    border-radius: var(--radius-sm);

    &.p-highlight {
      background: var(--base-font-color);
      border-color: var(--base-font-color);
    }

    &:not(.p-disabled):hover {
      border-color: var(--base-font-color);
    }
  }

  &:not(.p-checkbox-disabled) .p-checkbox-box.p-focus {
    box-shadow: none;
    border-color: var(--base-font-color);
  }
}
</style>
