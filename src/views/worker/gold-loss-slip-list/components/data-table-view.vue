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
        <button class="btn btn-sm btn-green" @click="$emit('print', data)" title="พิมพ์">
          <i class="bi bi-printer"></i>
        </button>
        <button class="btn btn-sm btn-red ml-2" @click="$emit('cancel', data)" title="ยกเลิก">
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

  data() {
    return {
      columns: [
        { field: 'documentNo', header: 'เลขที่', minWidth: '140px' },
        { field: 'workerCode', header: 'รหัสช่าง', minWidth: '100px' },
        { field: 'workerName', header: 'ชื่อช่าง', minWidth: '150px' },
        { field: 'requestDateStart', header: 'วันที่เริ่ม', minWidth: '110px', format: 'date' },
        { field: 'requestDateEnd', header: 'วันที่สิ้นสุด', minWidth: '110px', format: 'date' },
        { field: 'totalWeightLoss', header: 'รวมน้ำหนัก loss', minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'goldReturn', header: 'Gold Return', minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'netWeightLoss', header: 'loss สุทธิ', minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'totalMoneyDiff', header: 'รวมเงิน', minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'createDate', header: 'วันที่บันทึก', minWidth: '110px', format: 'date' },
        { field: 'action', header: '', minWidth: '80px', sortable: false }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
