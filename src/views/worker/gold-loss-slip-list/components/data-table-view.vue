<template>
  <div class="mt-2">
    <BaseDataTable
      :items="items"
      :totalRecords="items.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="calc(100vh - 340px)"
    >
      <template #actionTemplate="{ data }">
        <button class="btn btn-sm btn-green" @click="$emit('print', data)" :title="$t('common.btn.export')">
          <i class="bi bi-printer"></i>
        </button>
        <button class="btn btn-sm btn-red ml-2" @click="$emit('cancel', data)" :title="$t('common.btn.cancel')">
          <i class="bi bi-x-circle"></i>
        </button>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'GoldLossSlipListDataTableView',

  components: { BaseDataTable },

  props: {
    items: {
      type: Array,
      default: () => []
    }
  },

  emits: ['print', 'cancel'],

  computed: {
    columns() {
      return [
        { field: 'documentNo', header: this.$t('view.worker.goldLossSlipList.colDocumentNo'), minWidth: '140px' },
        { field: 'workerCode', header: this.$t('view.worker.goldLossSlipList.colWorkerCode'), minWidth: '100px' },
        { field: 'workerName', header: this.$t('view.worker.goldLossSlipList.colWorkerName'), minWidth: '150px' },
        { field: 'requestDateStart', header: this.$t('view.worker.goldLossSlipList.colDateStart'), minWidth: '110px', format: 'date' },
        { field: 'requestDateEnd', header: this.$t('view.worker.goldLossSlipList.colDateEnd'), minWidth: '110px', format: 'date' },
        { field: 'totalWeightLoss', header: this.$t('view.worker.goldLossSlipList.colTotalWeightLoss'), minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'goldReturn', header: this.$t('view.worker.goldLossSlipList.colGoldReturn'), minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'netWeightLoss', header: this.$t('view.worker.goldLossSlipList.colNetWeightLoss'), minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'totalMoneyDiff', header: this.$t('view.worker.goldLossSlipList.colTotalMoney'), minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'createDate', header: this.$t('view.worker.goldLossSlipList.colCreateDate'), minWidth: '110px', format: 'date' },
        { field: 'action', header: '', minWidth: '80px', sortable: false }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
