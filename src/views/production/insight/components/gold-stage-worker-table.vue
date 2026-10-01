<!--
  gold-stage-worker-table — ตารางช่างของแผนกที่เลือก (ส่วนที่ 2 ของ reportRef: goldStage ต่อจากกราฟรายละเอียด)
  — มาจาก GoldByStage.departments[].workers[] โดยตรง (ไม่ยิง endpoint แยก, ไม่ paginate — backend ส่งมาให้
  ครบแล้ว)

  Props:
    workers — Array (required) จาก departments[].workers ของแผนกที่เลือกอยู่
    loading — Boolean (false)
-->
<template>
  <div class="responsive-table-wrapper">
    <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="workerCode" :loading="loading">
      <template #rowsTemplate="{ data }">
        <div class="text-right">{{ formatCount(data.rows) }}</div>
      </template>
      <template #returnedSendGramTemplate="{ data }">
        <div class="text-right">{{ formatGram(data.returnedSendGram) }}</div>
      </template>
      <template #diffGramTemplate="{ data }">
        <div class="text-right">{{ formatGram(data.diffGram) }}</div>
      </template>
      <template #diffPercentTemplate="{ data }">
        <div class="text-right">{{ formatPercent(data.diffPercent) }}</div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'GoldStageWorkerTable',

  components: {
    BaseDataTable
  },

  props: {
    workers: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    rows() {
      return this.workers
    },

    columns() {
      return [
        { field: 'workerCode', header: this.$t('view.productionInsight.gold.workersColWorkerCode'), sortable: false, minWidth: '100px' },
        { field: 'rows', header: this.$t('view.productionInsight.gold.stageWorkerColRows'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'returnedSendGram', header: this.$t('view.productionInsight.gold.stageWorkerColReturned'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'diffGram', header: this.$t('view.productionInsight.gold.stageColDiffGram'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'diffPercent', header: this.$t('view.productionInsight.gold.stageColDiffPercent'), sortable: false, minWidth: '80px', align: 'right' }
      ]
    }
  },

  methods: {
    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatGram(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value) : '—'
    },

    formatPercent(value) {
      return value != null ? `${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value)}%` : '—'
    }
  }
}
</script>
