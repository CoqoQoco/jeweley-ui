<!--
  workers-table — ตาราง "ช่างรายคน" (ส่วนแรกของ reportRef: wrkTable) ของหมวด "ช่างและค่าแรง" — รับ workers[]
  มาจาก Workers response ที่ workers-section.vue ยิงแล้ว (ไม่ยิง endpoint เอง, ไม่ paginate เพราะเป็น array
  เต็มในก้อนเดียวกับ kpi/series ไม่ใช่ endpoint แยกแบบตาราง outlier/pending ของหมวดอื่น)

  ตัวกรอง "แผนก"/"ประเภท" ในกล่องนี้เป็น client-side ล้วน กรองเฉพาะ workers[] ที่โหลดมาแล้ว ไม่ยิง request ใหม่
  (แยกจากตัวกรองแผนก/ประเภทของแผงตัวกรองหลักที่ส่งไป server กรองทั้งก้อน kpi/series/workers/concentration) —
  ตัวเลือกแผนกในดรอปดาวน์มาจาก deptKey ที่ปรากฏจริงใน workers[] เท่านั้น (ไม่ใช่ลิสต์แผนกคงที่ทั้งหมด)

  คอลัมน์ "ทอง" โชว์ goldLossPercent (มาจากใบ slip จริง, มีเครื่องหมาย "s" กำกับ) ก่อนเสมอถ้ามี ไม่งั้นโชว์
  goldDiffPercent (มาจากแผนกจ่าย-รับ, ไม่มีเครื่องหมาย) ไม่มีทั้งคู่โชว์ "—" (resolveGoldColumnValue) — คัดพลอย
  (gemSort) ไม่ได้ชั่งน้ำหนักทองเลยโชว์ "—" เสมอแม้ backend ส่ง goldDiffPercent=0 มา (ยืนยัน bug จริงที่เจอบน
  prod 2026-10-02) — แถวที่ isRateOutlier (ต่องาน) / isConcentrated (สัดส่วนงาน) เน้นด้วยสีตัวอักษร/ตัวหนา
  (token, ไม่ใช่แถบซ้าย) — เรียงค่าแรงมากไปน้อยเป็นค่าเริ่มต้นเสมอ (sortWorkersByWagesDesc)

  Props:
    workers     — Array (required) จาก Workers.workers
    selectedKey — Object|null (null) — { code, deptKey } ของแถวที่เลือกอยู่ (highlight แถว)
    loading     — Boolean (false)

  Emits: select-worker({ code, deptKey, name })
-->
<template>
  <div class="workers-table">
    <div class="workers-table__toolbar">
      <MultiSelectGeneric
        v-model="localDeptFilter"
        :options="deptOptions"
        optionLabel="label"
        optionValue="value"
        :placeholder="$t('view.productionInsight.workers.tableFilterDept')"
        :showClear="true"
        class="workers-table__dept-filter"
      />
      <ToggleGroupGeneric v-model="localEmploymentType" :options="employmentTypeOptions" :ariaLabel="$t('view.productionInsight.workers.tableFilterType')" />
    </div>

    <div class="responsive-table-wrapper">
      <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="rowKey" :rowClass="rowClass" :loading="loading" @row-click="onRowClick">
        <template #nameTemplate="{ data }">
          <span class="workers-table__worker">
            <strong>{{ data.name }}</strong>
            <small class="text-muted">{{ data.code }}</small>
          </span>
        </template>

        <template #employmentTypeTemplate="{ data }">
          <span class="workers-table__type-chip">{{ employmentTypeLabel(data.employmentType) }}</span>
        </template>

        <template #jobsTemplate="{ data }">
          <div class="text-right">{{ formatCount(data.jobs) }}</div>
        </template>
        <template #plansTemplate="{ data }">
          <div class="text-right">{{ formatCount(data.plans) }}</div>
        </template>
        <template #wagesTemplate="{ data }">
          <div class="text-right">{{ formatMoney(data.wages) }}</div>
        </template>
        <template #wagePerJobTemplate="{ data }">
          <div class="text-right" :class="{ 'workers-table__cell--emphasis': data.isRateOutlier }">{{ formatMoney(data.wagePerJob) }}</div>
        </template>
        <template #shareOfDeptJobsTemplate="{ data }">
          <div class="text-right" :class="{ 'workers-table__cell--emphasis': data.isConcentrated }">{{ formatPercent(data.shareOfDeptJobs) }}</div>
        </template>
        <template #goldTemplate="{ data }">
          <div class="text-right">
            <template v-if="goldColumnOf(data)">
              {{ formatPercent(goldColumnOf(data).percent) }}
              <sup v-if="goldColumnOf(data).fromSlip">s</sup>
            </template>
            <template v-else>—</template>
          </div>
        </template>
      </BaseDataTable>
    </div>

    <p class="workers-table__note">{{ $t('view.productionInsight.workers.tableWageComparableNote') }}</p>
  </div>
</template>

<script>
import { filterWorkersByDept, filterWorkersByEmploymentType, resolveGoldColumnValue, collectWageDeptKeys, sortWorkersByWagesDesc } from './workers-helpers.js'
import { WORKERS_EMPLOYMENT_TYPE_VALUES } from '../insight-filters.js'

import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'WorkersTable',

  components: {
    MultiSelectGeneric,
    ToggleGroupGeneric,
    BaseDataTable
  },

  props: {
    workers: {
      type: Array,
      required: true
    },
    selectedKey: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['select-worker'],

  data() {
    return {
      localDeptFilter: [],
      localEmploymentType: 'ALL'
    }
  },

  computed: {
    deptOptions() {
      return collectWageDeptKeys(this.workers).map((key) => ({ value: key, label: this.$t(`view.executive.department.${key}`) }))
    },

    employmentTypeOptions() {
      return [
        { value: 'ALL', label: this.$t('common.label.all') },
        ...WORKERS_EMPLOYMENT_TYPE_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.workers.employmentType.${value}`) }))
      ]
    },

    filteredWorkers() {
      return filterWorkersByEmploymentType(filterWorkersByDept(this.workers, this.localDeptFilter), this.localEmploymentType)
    },

    // ค่าเริ่มต้นเรียงค่าแรงมากไปน้อยเสมอ (ไม่ sortable แบบ interactive ในตารางนี้)
    rows() {
      return sortWorkersByWagesDesc(this.filteredWorkers).map((w) => ({
        ...w,
        rowKey: `${w.code}-${w.deptKey}`,
        deptLabel: this.$t(`view.executive.department.${w.deptKey}`)
      }))
    },

    columns() {
      return [
        { field: 'name', header: this.$t('view.productionInsight.workers.colWorker'), sortable: false, minWidth: '150px' },
        { field: 'deptLabel', header: this.$t('view.productionInsight.workers.colDept'), sortable: false, minWidth: '100px' },
        { field: 'employmentType', header: this.$t('view.productionInsight.workers.colEmploymentType'), sortable: false, minWidth: '100px' },
        { field: 'jobs', header: this.$t('view.productionInsight.workers.colJobs'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'plans', header: this.$t('view.productionInsight.workers.colPlans'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'wages', header: this.$t('view.productionInsight.workers.colWages'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'wagePerJob', header: this.$t('view.productionInsight.workers.colWagePerJob'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'shareOfDeptJobs', header: this.$t('view.productionInsight.workers.colShareOfDeptJobs'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'gold', header: this.$t('view.productionInsight.workers.colGold'), sortable: false, minWidth: '90px', align: 'right' }
      ]
    }
  },

  methods: {
    employmentTypeLabel(employmentType) {
      return this.$t(`view.productionInsight.workers.employmentType.${employmentType || 'UNKNOWN'}`)
    },

    goldColumnOf(data) {
      return resolveGoldColumnValue(data)
    },

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatMoney(value) {
      return value != null ? `฿${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)}` : '—'
    },

    formatPercent(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value)}%` : '—'
    },

    rowClass(data) {
      return { 'workers-table__row--selected': !!this.selectedKey && data.code === this.selectedKey.code && data.deptKey === this.selectedKey.deptKey }
    },

    onRowClick(event) {
      const data = event?.data
      if (!data) return
      this.$emit('select-worker', { code: data.code, deptKey: data.deptKey, name: data.name })
    }
  }
}
</script>

<style lang="scss" scoped>
.workers-table__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-md);
  margin-bottom: var(--sp-lg);
}

.workers-table__dept-filter {
  min-width: 220px;
}

.workers-table__worker {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.workers-table__type-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.workers-table__cell--emphasis {
  color: var(--base-warning);
  font-weight: 700;
}

.workers-table__note {
  margin: var(--sp-sm) 0 0;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

:deep(.workers-table__row--selected) {
  background-color: var(--color-highlight-bg) !important;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
