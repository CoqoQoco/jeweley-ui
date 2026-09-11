<!--
  by-gold-type-view — มุม "ชนิดทอง" ของแท็บแยกตาม Stage
  ยิง GoldLossMonthlyReport (endpoint เดิมของรายงานรายเดือนที่ยกเลิกแล้ว) แต่เอาเฉพาะคอลัมน์น้ำหนัก
  ห้ามเอาช่องเงิน (goldLossPrice/weightLossAllowed/weightLossActual/moneyDiff) หรือปุ่มบันทึกค่าตั้งต้นมาด้วย — ฟีเจอร์นั้นยกเลิกแล้ว
  endpoint นี้รับแผนกได้ทีละ 1 ค่าเท่านั้น จึงต้องมี dropdown แผนกของตัวเอง แยกจาก MultiSelect แผนกของ shared filter
-->
<template>
  <div>
    <div class="gold-type-dept-row">
      <span class="title-text">{{ $t('view.production.goldLossDashboard.goldTypeDeptLabel') }}</span>
      <DropdownGeneric
        v-model="selectedDept"
        :options="deptOptions"
        optionLabel="nameTh"
        optionValue="id"
        :placeholder="$t('view.production.goldLossDashboard.goldTypeDeptPlaceholder')"
      />
    </div>

    <BaseDataTable
      :items="rowsWithComputedPercent"
      :columns="columns"
      :paginator="false"
      dataKey="goldType"
    >
      <template #lossPercentTemplate="{ data }">
        <div class="text-right">{{ formatPercentValue(data.lossPercent) }}</div>
      </template>
      <template #pendingReturnTemplate>—</template>
    </BaseDataTable>
  </div>
</template>

<script>
import { useGoldLossMonthlyApiStore } from '@/stores/modules/api/production/gold-loss-monthly-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

// แผนกที่มีการคืนทองจริง — เหมือนกับแท็บ Stage
const GOLD_LOSS_STAGE_CODES = [50, 60, 70, 80, 90]

export default {
  name: 'GoldLossByGoldTypeView',

  components: {
    DropdownGeneric,
    BaseDataTable
  },

  setup() {
    const goldLossMonthlyStore = useGoldLossMonthlyApiStore()
    const masterApiStore = useMasterApiStore()
    return { goldLossMonthlyStore, masterApiStore }
  },

  props: {
    period: {
      // { year, month } มาจากแท็บแม่ (derive จาก shared date range)
      type: Object,
      required: true
    },
    defaultDept: {
      type: Number,
      default: 50
    }
  },

  data() {
    return {
      selectedDept: this.defaultDept
    }
  },

  computed: {
    deptOptions() {
      return this.masterApiStore.planStatus.filter((item) => GOLD_LOSS_STAGE_CODES.includes(item.id))
    },

    report() {
      return this.goldLossMonthlyStore.reportData
    },

    columns() {
      return [
        { field: 'goldTypeName', header: this.$t('view.production.goldLossMonthly.colGoldType'), sortable: false, minWidth: '110px' },
        { field: 'sumGoldWeightSend', header: this.$t('view.production.goldLossMonthly.colSumGoldWeightSend'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'sumGoldWeightCheck', header: this.$t('view.production.goldLossMonthly.colSumGoldWeightCheck'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'rawLoss', header: this.$t('view.production.goldLossMonthly.colRawLoss'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'lossPercent', header: this.$t('view.production.goldLossMonthly.colLossPercent'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'pendingReturn', header: this.$t('view.production.goldLossDashboard.goldTypePendingReturn'), sortable: false, minWidth: '110px', align: 'right' }
      ]
    },

    // report.rows แต่ละแถวคำนวณ %loss เอง — ห้ามใช้ res.lossPercent จาก backend
    // เพราะฟิลด์นั้นคือ "เกณฑ์ % ที่ยอมให้เสีย" (config ที่ไม่มีใครตั้งค่า จึงเป็น 0 เสมอ) ไม่ใช่อัตราส่วนที่หายจริง
    rowsWithComputedPercent() {
      return this.report.rows.map((row) => ({
        ...row,
        lossPercent: this.computeLossPercent(row.rawLoss, row.sumGoldWeightSend)
      }))
    }
  },

  watch: {
    period: {
      handler() {
        this.fetchData()
      },
      deep: true
    },
    selectedDept() {
      this.fetchData()
    }
  },

  methods: {
    async fetchData() {
      if (!this.selectedDept) return
      await this.goldLossMonthlyStore.fetchReport({
        year: this.period.year,
        month: this.period.month,
        status: this.selectedDept
      })
    },

    computeLossPercent(rawLoss, sumGoldWeightSend) {
      if (!sumGoldWeightSend) return 0
      return Math.round(((rawLoss || 0) / sumGoldWeightSend) * 100 * 100) / 100
    },

    formatPercentValue(value) {
      return `${new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)}%`
    }
  },

  created() {
    this.masterApiStore.fetchPlanStatus()
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.gold-type-dept-row {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  max-width: 320px;
  margin-bottom: var(--sp-md);

  .title-text {
    white-space: nowrap;
  }
}
</style>
