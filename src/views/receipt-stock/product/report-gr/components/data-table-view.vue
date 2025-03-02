<template>
  <div>
    <BaseDataTable
      :items="receiptProductionStore.dataReceiptHistory.data"
      :totalRecords="receiptProductionStore.dataReceiptHistory.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
    <template #woTextTemplate="{ data }">
        <div>
          {{ `${data.wo}-${data.woNumber}` }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'

export default {
  components: {
    BaseDataTable
  },

  setup() {
    const receiptProductionStore = useReceiptProductionApiStore()
    return { receiptProductionStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    },
    modelFormExport: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    }
  },

  watch: {
    async modelForm() {
      //console.log(this.modelForm)
      this.take = 10
      this.skip = 0
      await this.fetchData()
    },
    async modelFormExport() {
      //console.log(this.modelForm)
      await this.fetchDataExport()
    }
  },

  data() {
    return {
      take: 10,
      skip: 0,
      sort: [],
      columns: [
        {
          field: 'receiptDate',
          header: 'วันรับสินค้า',
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'stockNumber',
          header: 'เลขที่ผลิต',
          sortable: true,
          minWidth: '150px'
        },

        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNameEn',
          header: 'ชื่อสินค้า EN',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNameTh',
          header: 'ชื่อสินค้า TH',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'size',
          header: 'ขนาด',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productionType',
          header: 'สีของทอง/เงิน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productionTypeSize',
          header: 'ประเภททอง/เงิน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'woText',
          header: 'W.O.',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'location',
          header: 'จัดเก็บ',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productPrice',
          header: 'ราคา',
          sortable: true,
          minWidth: '150px',
          format: 'decimal2'
        },
        {
          field: 'createBy',
          header: 'ผู้รับสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'remark',
          header: 'หมายเหตุ',
          sortable: true,
          minWidth: '150px'
        }
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

    async fetchData() {
      await this.receiptProductionStore.fetchConfirmHistory({
        skip: this.skip,
        take: this.take,
        sort: this.sort,
        formValue: this.form,
        skipLoading: false
      })
    },

    async fetchDataExport() {
      //console.log('fetchDataExport')
      await this.receiptProductionStore.fetchConfirmHistoryExport({
        sort: this.sort,
        formValue: this.form
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
</style>
