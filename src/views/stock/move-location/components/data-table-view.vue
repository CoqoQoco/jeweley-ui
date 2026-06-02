<template>
  <div class="mt-2">
    <BaseDataTable
      :items="moveStore.dataSearch.data"
      :totalRecords="moveStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      dataKey="stockNumber"
      :selectionMode="true"
      selectionType="multiple"
      @page="handlePageChange"
      @sort="handleSortChange"
      @update:itemsSelection="onSelectionChange"
    >
      <template #qtyAvailableTemplate="{ data }">
        <span :class="data.qtyAvailable > 0 ? 'badge-ready' : 'badge-not-ready'">
          {{ data.qtyAvailable > 0 ? 'พร้อมขาย' : 'ไม่พร้อม' }}
        </span>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { useStockMoveLocationApiStore } from '@/stores/modules/api/stock/stock-move-location-api.js'

export default {
  name: 'MoveLocationDataTableView',

  components: {
    BaseDataTable
  },

  setup() {
    const moveStore = useStockMoveLocationApiStore()
    return { moveStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['update:selection'],

  watch: {
    async modelForm() {
      this.take = 10
      this.skip = 0
      await this.fetchData()
    }
  },

  data() {
    return {
      take: 10,
      skip: 0,
      sort: [],
      columns: [
        { field: 'stockNumber', header: 'เลขที่ผลิต', sortable: true, minWidth: '140px' },
        { field: 'productNumber', header: 'รหัสสินค้า', sortable: true, minWidth: '120px' },
        { field: 'productNameTh', header: 'ชื่อสินค้า', sortable: true, minWidth: '160px' },
        { field: 'location', header: 'จัดเก็บ', sortable: true, minWidth: '100px' },
        { field: 'qtyAvailable', header: 'พร้อมขาย', sortable: false, minWidth: '100px', align: 'center' }
      ]
    }
  },

  methods: {
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },

    handleSortChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchData()
    },

    onSelectionChange(selected) {
      this.$emit('update:selection', selected)
    },

    async fetchData() {
      await this.moveStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.badge-ready {
  background: #d4edda;
  color: #155724;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.badge-not-ready {
  background: #f8d7da;
  color: #721c24;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}
</style>
