<template>
  <div class="expnad-container">
    <BaseDataTable :items="modelFormVlue.receiptStocks" 
    :columns="columns" :paginator="false">
      <template #statusTemplate="{ data }">
        <div class="vertical-center-container">
          <div :class="getStatusSeverity(data.isReceipt)">
            {{ getStatusName(data.isReceipt) }}
          </div>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
export default {
  name: 'DataExpand',

  components: {
    BaseDataTable
  },

  props: {
    modelForm: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },

  computed: {
    modelFormVlue() {
      console.log('modelForm', this.modelForm)
      return this.modelForm.data
    }
  },

  data() {
    return {
      columns: [
        // {
        //   field: 'no',
        //   header: 'ลำดับ',
        //   sortable: false,
        //   width: '50px'
        // },
        {
          field: 'stockNumber',
          header: 'รหัสตั้งรับสินค้า',
          sortable: false,
          width: '150px'
        },
        {
          field: '',
          header: 'เลขที่ผลิต',
          sortable: false,
          width: '150px'
        },
        {
          field: '',
          header: 'รหัสสินค้า',
          sortable: false,
          width: '150px'
        },
        {
          field: 'status',
          header: 'สถานะ',
          sortable: false,
          width: '150px'
        },
        {
          header: 'ชื่อสินค้า',
          sortable: false,
          width: '150px'
        },
        {
          header: 'จำนวน',
          sortable: false,
          width: '50px'
        },
        {
          header: 'ไซส์',
          sortable: false,
          width: '150px'
        },
        {
          header: 'น้้ำหนักทอง',
          sortable: false,
          width: '150px'
        },
        {
          header: 'น้้ำหนักเพชร',
          sortable: false,
          width: '150px'
        },
        {
          header: 'น้้ำหนักพลอย',
          sortable: false,
          width: '150px'
        },
        {
          header: 'คลังจัดเก็บ',
          sortable: false,
          width: '150px'
        },
        {
          header: 'ราคาขาย',
          sortable: false,
          width: '150px'
        },
        {
          header: 'หมายเหตุ',
          sortable: false,
          minWidth: '150px'
        }
      ]
    }
  },

  methods: {
    getStatusSeverity(isReceipt) {
      switch (isReceipt) {
        case true:
          return 'box-status-success'
        case false:
          return 'box-status-process'
      }
    },
    getStatusName(isReceipt) {
      switch (isReceipt) {
        case true:
          return 'รับเเล้ว'
        case false:
          return 'รอรับ'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.expnad-container {
  :deep(.p-datatable) {
    .p-datatable-tbody > tr {
      // ปิด hover effect
      &:hover {
        background-color: transparent !important;
      }

      // ถ้ามี striped rows ก็ยังคงไว้
      &:nth-child(even) {
        background-color: #f8f9fa !important;
      }
    }

    // ส่วนของ header ยังคงเหมือนเดิม
    .p-datatable-thead > tr > th {
      background-color: #460505 !important;
      color: #ffffff !important;
      //padding: 0.15rem 0.5rem !important;

      .p-column-title {
        color: #ffffff !important;
      }
    }

    // ส่วนของ cells ยังคงเหมือนเดิม
    .p-datatable-tbody > tr > td {
      //padding: 0.1rem 0.5rem !important;
      //line-height: 1 !important;
    }
  }
}
</style>
