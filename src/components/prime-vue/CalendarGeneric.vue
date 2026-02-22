<template>
  <Calendar
    v-model="localValue"
    :dateFormat="dateFormat"
    :placeholder="placeholder"
    :showIcon="showIcon"
    :showButtonBar="showButtonBar"
    :showClear="showClear"
    :manualInput="manualInput"
    :disabled="disabled"
    :minDate="minDate"
    :maxDate="maxDate"
    :selectionMode="selectionMode"
    :showTime="showTime"
    :hourFormat="hourFormat"
    :class="customClass"
    @date-select="onDateSelect"
  />
</template>

<script>
import Calendar from 'primevue/calendar'

export default {
  name: 'CalendarGeneric',

  components: {
    Calendar
  },

  props: {
    modelValue: {
      type: [Date, String],
      default: null
    },
    dateFormat: {
      type: String,
      default: 'dd/mm/yy'
    },
    placeholder: {
      type: String,
      default: 'เลือกวันที่'
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    showButtonBar: {
      type: Boolean,
      default: false
    },
    showClear: {
      type: Boolean,
      default: false
    },
    manualInput: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    minDate: {
      type: Date,
      default: null
    },
    maxDate: {
      type: Date,
      default: null
    },
    selectionMode: {
      type: String,
      default: 'single'
    },
    showTime: {
      type: Boolean,
      default: false
    },
    hourFormat: {
      type: String,
      default: '24'
    },
    customClass: {
      type: String,
      default: ''
    }
  },

  emits: ['update:modelValue', 'date-select'],

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
  },

  methods: {
    onDateSelect(event) {
      this.$emit('date-select', event)
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.p-calendar) {
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

  .p-datepicker-trigger {
    background: transparent;
    border: 1px solid #e0e0e0;
    border-left: none;
    color: #666;
    border-radius: 0 8px 8px 0;
  }
}
</style>
