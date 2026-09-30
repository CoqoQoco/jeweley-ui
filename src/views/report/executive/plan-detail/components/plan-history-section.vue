<!--
  plan-history-section — กล่อง "ประวัติการเดินงาน" ของ executive/plan-detail (read-only) — ตารางเรียง
  ใหม่→เก่า highlight แถวที่ตรงสถานะปัจจุบันของใบงาน (rows[].isCurrent มาจาก index-view.vue แล้ว)

  Props:
    rows — Array (required) ของ { key, date, statusName, who, worker, goldWeightText, wages, remark,
           isCurrent } — เตรียมพร้อม render ตรงๆ แล้วจาก index-view.vue (buildPlanHistoryRows + เติม
           statusName จาก master lookup)
-->
<template>
  <SectionCardGeneric :title="$t('view.executive.planDetail.sectionHistory')" icon="bi-clock-history" accent="main" headerStyle="legend">
    <p class="plan-history-section__note">{{ $t('view.executive.planDetail.historyCurrentNote') }}</p>
    <div class="responsive-table-wrapper">
      <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="key" :rowClass="rowClass">
        <template #dateTemplate="{ data }">{{ formatDate(data.date) }}</template>
        <template #wagesTemplate="{ data }">
          <div class="text-right">{{ formatWages(data.wages) }}</div>
        </template>
      </BaseDataTable>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'PlanHistorySection',

  components: {
    SectionCardGeneric,
    BaseDataTable
  },

  props: {
    rows: {
      type: Array,
      required: true
    }
  },

  computed: {
    columns() {
      return [
        { field: 'date', header: this.$t('view.executive.planDetail.historyColDate'), sortable: false, minWidth: '110px' },
        { field: 'statusName', header: this.$t('view.executive.planDetail.historyColStatus'), sortable: false, minWidth: '120px' },
        { field: 'who', header: this.$t('view.executive.planDetail.historyColWho'), sortable: false, minWidth: '130px' },
        { field: 'worker', header: this.$t('view.executive.planDetail.historyColWorker'), sortable: false, minWidth: '160px' },
        { field: 'goldWeightText', header: this.$t('view.executive.planDetail.historyColGoldWeight'), sortable: false, minWidth: '150px', align: 'right' },
        { field: 'wages', header: this.$t('view.executive.planDetail.historyColWages'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'remark', header: this.$t('view.executive.planDetail.historyColRemark'), sortable: false, minWidth: '180px' }
      ]
    }
  },

  methods: {
    formatDate(date) {
      return date ? formatDate(date) : '-'
    },

    formatWages(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) : '-'
    },

    rowClass(data) {
      return { 'plan-history-section__row--current': data.isCurrent }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.plan-history-section__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

:deep(.plan-history-section__row--current) {
  background-color: var(--color-highlight-bg) !important;
  font-weight: 600;
}
</style>
