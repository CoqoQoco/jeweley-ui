<template>
  <div class="filter-container">
    <div>
      <div class="title-text">รายงาน Gold Loss แต่ง (รายเดือน)</div>
      <div class="form-col-container mt-2">
        <div>
          <label class="form-label">เลือกเดือน</label>
          <Calendar
            v-model="selectedMonth"
            view="month"
            dateFormat="MM - yy"
            showIcon
            showButtonBar
            :manualInput="false"
            placeholder="เลือกเดือนและปี"
          />
        </div>
        <div class="d-flex align-items-end">
          <button
            @click="onSearch"
            class="btn btn-sm btn-green"
            :disabled="!selectedMonth"
          >
            <i class="bi bi-search"></i>
            {{ $t('button.search') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Calendar from 'primevue/calendar'

export default {
  name: 'GoldLossTangSearchView',

  components: {
    Calendar
  },

  emits: ['search'],

  data() {
    return {
      selectedMonth: new Date()
    }
  },

  methods: {
    onSearch() {
      if (!this.selectedMonth) return

      const year = this.selectedMonth.getFullYear()
      const month = this.selectedMonth.getMonth() + 1

      this.$emit('search', { year, month })
    }
  },

  mounted() {
    this.onSearch()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>
