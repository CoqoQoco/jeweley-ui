<template>
  <div>
    <BaseDataTable
      :items="receiptOutsourceStore.dataReceiptHistory.data"
      :totalRecords="receiptOutsourceStore.dataReceiptHistory.total"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 310px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #imagePathTemplate="{ data }">
        <imagePreview
          :imageName="data.imagePath"
          type="STOCK"
          :width="35"
          :height="35"
        />
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import imagePreview from '@/components/prime-vue/ImagePreview.vue'

import { useReceiptOutsourceApiStore } from '@/stores/modules/api/receipt/receipt-outsource-api.js'

export default {
  name: 'data-table-view',

  components: {
    BaseDataTable,
    imagePreview
  },

  setup() {
    const receiptOutsourceStore = useReceiptOutsourceApiStore()
    return { receiptOutsourceStore }
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
      this.take = 10
      this.skip = 0
      await this.fetchData()
    },
    async modelFormExport() {
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
          field: 'imagePath',
          header: 'รูป',
          sortable: false,
          width: '60px',
          align: 'center'
        },
        {
          field: 'stockNumber',
          header: 'รหัสสต็อก',
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
          field: 'vendor',
          header: 'ผู้ขาย',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'poNumber',
          header: 'เลขที่ PO',
          sortable: true,
          minWidth: '130px'
        },
        {
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          sortable: true,
          minWidth: '130px'
        },
        {
          field: 'size',
          header: 'ขนาด',
          sortable: true,
          minWidth: '100px'
        },
        {
          field: 'productPrice',
          header: 'ราคา',
          sortable: true,
          minWidth: '120px',
          format: 'decimal2',
          align: 'right'
        },
        {
          field: 'receiptDate',
          header: 'วันที่รับ',
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'status',
          header: 'สถานะ',
          sortable: true,
          minWidth: '100px'
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
      await this.receiptOutsourceStore.fetchHistory({
        skip: this.skip,
        take: this.take,
        sort: this.sort,
        formValue: this.form,
        skipLoading: false
      })
    },
    async fetchDataExport() {
      await this.receiptOutsourceStore.fetchHistoryExport({
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
