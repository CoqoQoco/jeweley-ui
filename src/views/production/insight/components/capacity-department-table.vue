<!--
  capacity-department-table — ตาราง "กำลังการผลิตรายแผนก" (ส่วนแรกของ reportRef: capDepartments) ของหมวด
  "กำลังการผลิต" — คลิกแถว = เลือกแผนกไปแสดงกราฟรายละเอียด (exits/workers ต่อเดือน) — ชิปคอขวดของแผนก
  "บัตรต้นทุน" ใช้ข้อความ "คอขวด·เอกสาร" แยกจากคอขวดสายการผลิตทั่วไป (ค้างเพราะเอกสาร ไม่ใช่กำลังคนช่าง)

  Props:
    departments — Array (required) จาก Capacity.departments
    selectedKey — String ('') — key แผนกที่เลือกอยู่ (highlight แถว)
    loading     — Boolean (false)

  Emits: select-dept(key)
-->
<template>
  <div class="responsive-table-wrapper">
    <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="key" :rowClass="rowClass" :loading="loading" @row-click="onRowClick">
      <template #header-queueDays>
        <span class="capacity-department-table__col-header">
          {{ $t('view.productionInsight.capacity.deptColQueueDays') }}
          <InfoTipGeneric :text="$t('view.productionInsight.help.capacityQueueDays')" position="bottom" tone="inverse" />
        </span>
      </template>

      <template #labelTemplate="{ data }">
        <strong>{{ data.label }}</strong>
      </template>

      <template #exitsPerMonthTemplate="{ data }">
        <div class="text-right">{{ formatCount(data.exitsPerMonth) }}</div>
      </template>

      <template #workersMedianTemplate="{ data }">
        <div class="text-right">{{ formatCount(data.workersMedian) }}</div>
      </template>

      <template #plansPerWorkerTemplate="{ data }">
        <div class="text-right">{{ formatDecimal(data.plansPerWorker) }}</div>
      </template>

      <template #waitingNowTemplate="{ data }">
        <div class="text-right">{{ formatCount(data.waitingNow) }}</div>
      </template>

      <template #workingNowTemplate="{ data }">
        <div class="text-right">{{ formatCount(data.workingNow) }}</div>
      </template>

      <template #queueDaysTemplate="{ data }">
        <div class="text-right capacity-department-table__queue-cell">
          {{ formatDays(data.queueDays) }}
          <span v-if="data.isBottleneck" class="capacity-department-table__bottleneck-chip">{{ bottleneckChipText(data) }}</span>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'CapacityDepartmentTable',

  components: {
    InfoTipGeneric,
    BaseDataTable
  },

  props: {
    departments: {
      type: Array,
      required: true
    },
    selectedKey: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['select-dept'],

  computed: {
    rows() {
      return this.departments.map((d) => ({ ...d, label: this.$t(`view.executive.department.${d.key}`) }))
    },

    // คอลัมน์ queueDays มี custom header slot (label+ⓘ) ต้องเคลียร์ header prop ทิ้งเป็น '' ไม่งั้นหัวขึ้นซ้ำ
    // 2 จุด (เหมือน wip-lead-time-table.vue)
    columns() {
      return [
        { field: 'label', header: this.$t('view.productionInsight.capacity.deptColDept'), sortable: false, minWidth: '110px' },
        { field: 'exitsPerMonth', header: this.$t('view.productionInsight.capacity.deptColExitsPerMonth'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'workersMedian', header: this.$t('view.productionInsight.capacity.deptColWorkers'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'plansPerWorker', header: this.$t('view.productionInsight.capacity.deptColPlansPerWorker'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'waitingNow', header: this.$t('view.productionInsight.capacity.deptColWaiting'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'workingNow', header: this.$t('view.productionInsight.capacity.deptColWorking'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'queueDays', header: '', sortable: false, minWidth: '140px', align: 'right' }
      ]
    }
  },

  methods: {
    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatDecimal(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value) : '—'
    },

    formatDays(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)} ${this.$t('view.productionInsight.capacity.daysUnit')}` : '—'
    },

    bottleneckChipText(data) {
      return data.key === 'costCard'
        ? this.$t('view.productionInsight.capacity.deptBottleneckCostCardChip')
        : this.$t('view.productionInsight.capacity.deptBottleneckChip')
    },

    rowClass(data) {
      return { 'capacity-department-table__row--selected': data.key === this.selectedKey }
    },

    onRowClick(event) {
      if (event?.data?.key) this.$emit('select-dept', event.data.key)
    }
  }
}
</script>

<style lang="scss" scoped>
.capacity-department-table__col-header {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.capacity-department-table__queue-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-xs);
}

// ชิปคอขวด — พื้นเต็มสีแดง ไม่ใช้แถบซ้าย (ห้าม border-left accent ตาม Core Principle #14)
.capacity-department-table__bottleneck-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px var(--sp-xs);
  border-radius: var(--radius-sm);
  background: var(--base-red);
  color: var(--on-inverse);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

:deep(.capacity-department-table__row--selected) {
  background-color: var(--color-highlight-bg) !important;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
