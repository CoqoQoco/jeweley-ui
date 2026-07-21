<!--
  DateRangeGeneric — wrapper รอบ CalendarGeneric ×2 + .flex-group (ui-layout skill §1.1)
  รวม pattern "ช่วงวันที่เริ่มต้น-สิ้นสุด" ที่ประกอบมือซ้ำในหลาย search bar

  ตัวอย่างการใช้งาน:
  <DateRangeGeneric
    :startDate="form.start"
    :endDate="form.end"
    :startPlaceholder="$t('view.report.common.dateFrom')"
    :endPlaceholder="$t('view.report.common.dateTo')"
    :maxRangeDays="90"
    @update:startDate="form.start = $event"
    @update:endDate="form.end = $event"
  />

  Props:
    startDate / endDate       — v-model คู่ (Date object)
    startPlaceholder / endPlaceholder — placeholder แต่ละช่อง
    disabled                  — ปิดการใช้งานทั้งคู่
    showButtonBar             — แสดง button bar ของ CalendarGeneric (default: true)
    maxRangeDays              — จำกัดช่วงวันสูงสุด (วัน); 0 = ไม่จำกัด

  Emits: update:startDate, update:endDate, change ({ startDate, endDate })
-->
<template>
  <div class="flex-group date-range-generic">
    <CalendarGeneric
      class="w-100"
      :modelValue="startDate"
      :maxDate="endDate"
      :placeholder="startPlaceholder"
      :disabled="disabled"
      :showButtonBar="showButtonBar"
      @update:modelValue="onStartChange"
    />
    <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
    <CalendarGeneric
      class="w-100"
      :modelValue="endDate"
      :minDate="startDate"
      :placeholder="endPlaceholder"
      :disabled="disabled"
      :showButtonBar="showButtonBar"
      @update:modelValue="onEndChange"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import { warning } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'DateRangeGeneric',

  components: {
    CalendarGeneric
  },

  props: {
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    startPlaceholder: {
      type: String,
      default: ''
    },
    endPlaceholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showButtonBar: {
      type: Boolean,
      default: true
    },
    maxRangeDays: {
      type: Number,
      default: 0
    }
  },

  emits: ['update:startDate', 'update:endDate', 'change'],

  methods: {
    isRangeExceeded(start, end) {
      if (!this.maxRangeDays || this.maxRangeDays <= 0) return false
      if (!start || !end) return false
      return Math.abs(dayjs(end).diff(dayjs(start), 'day')) > this.maxRangeDays
    },

    onStartChange(value) {
      if (this.isRangeExceeded(value, this.endDate)) {
        warning(
          this.$t('alert.dateRangeExceeded', { days: this.maxRangeDays }),
          this.$t('alert.alertTitle.warning')
        )
        return
      }
      this.$emit('update:startDate', value)
      this.$emit('change', { startDate: value, endDate: this.endDate })
    },

    onEndChange(value) {
      if (this.isRangeExceeded(this.startDate, value)) {
        warning(
          this.$t('alert.dateRangeExceeded', { days: this.maxRangeDays }),
          this.$t('alert.alertTitle.warning')
        )
        return
      }
      this.$emit('update:endDate', value)
      this.$emit('change', { startDate: this.startDate, endDate: value })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
</style>
