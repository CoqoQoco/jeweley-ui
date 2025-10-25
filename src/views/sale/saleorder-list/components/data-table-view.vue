<template>
  <div class="mt-2">
    <BaseDataTable
      :items="saleOrderStore.dataList.data"
      :totalRecords="saleOrderStore.dataList.total"
      dataKey="soNumber"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 340px)'"
      class="base-data-table"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn-main" title="แก้ไข" @click="onEdit(data)">
            <i class="bi bi-brush"></i>
          </button>
          <!-- <button 
            class="btn btn-sm btn-green ml-2" 
            title="ดูรายละเอียด" 
            @click="onView(data)"
          >
            <i class="bi bi-eye"></i>
          </button>
          <button 
            class="btn btn-sm btn-info ml-2" 
            title="สร้าง Invoice" 
            @click="onCreateInvoice(data)"
          >
            <i class="bi bi-receipt"></i>
          </button> -->
        </div>
      </template>

      <template #statusTemplate="{ data }">
        <div class="status-container">
          <span :class="getStatusBadgeClass(data.status)">{{ data.statusName }}</span>
        </div>
      </template>

      <template #deliveryDateTemplate="{ data }">
        <div>
          {{ formatDate(data.deliveryDate) }}
        </div>
      </template>

      <template #createDateTemplate="{ data }">
        <div>
          {{ formatDateTime(data.createDate) }}
        </div>
      </template>

      <template #currencyRateTemplate="{ data }">
        <div class="text-right">
          {{ Number(data.currencyRate || 0).toFixed(2) }}
        </div>
      </template>

      <template #markupTemplate="{ data }">
        <div class="text-right">{{ Number(data.markup || 0).toFixed(2) }}%</div>
      </template>

      <template #discountTemplate="{ data }">
        <div class="text-right">{{ Number(data.discount || 0).toFixed(2) }}%</div>
      </template>

      <template #depositPercentTemplate="{ data }">
        <div class="text-right">
          {{ data.depositPercent ? Number(data.depositPercent).toFixed(0) + '%' : '-' }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

export default {
  name: 'SaleOrderListDataTableView',

  components: {
    BaseDataTable
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  setup() {
    const saleOrderStore = usrSaleOrderApiStore()
    return { saleOrderStore }
  },

  data() {
    return {
      take: 10,
      skip: 0,
      sort: [],

      // Columns Configuration
      columns: [
        {
          field: 'action',
          header: '',
          width: '50px',
          sortable: false
        },
        {
          field: 'soNumber',
          header: 'เลขที่ใบสั่งขาย',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'running',
          header: 'เลขที่รัน',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'customerName',
          header: 'ชื่อลูกค้า',
          sortable: true,
          minWidth: '180px'
        },
        {
          field: 'customerTel',
          header: 'เบอร์โทร',
          sortable: true,
          minWidth: '120px'
        },
        {
          field: 'customerEmail',
          header: 'อีเมล',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'refQuotation',
          header: 'อ้างอิงใบเสนอราคา',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'currencyUnit',
          header: 'สกุลเงิน',
          sortable: true,
          minWidth: '80px'
        },
        {
          field: 'currencyRate',
          header: 'อัตราแลกเปลี่ยน',
          sortable: true,
          minWidth: '120px',
          template: 'currencyRateTemplate'
        },
        // {
        //   field: 'markup',
        //   header: 'Markup (%)',
        //   sortable: true,
        //   minWidth: '100px',
        //   template: 'markupTemplate'
        // },
        // {
        //   field: 'discount',
        //   header: 'ส่วนลด (%)',
        //   sortable: true,
        //   minWidth: '100px',
        //   template: 'discountTemplate'
        // },
        // {
        //   field: 'depositPercent',
        //   header: 'มัดจำ (%)',
        //   sortable: true,
        //   minWidth: '100px',
        //   template: 'depositPercentTemplate'
        // },
        {
          field: 'status',
          header: 'สถานะ',
          sortable: true,
          minWidth: '100px',
          template: 'statusTemplate'
        },
        {
          field: 'deliveryDate',
          header: 'วันที่จัดส่ง',
          sortable: true,
          minWidth: '140px',
          template: 'deliveryDateTemplate'
        },
        {
          field: 'createDate',
          header: 'วันที่สร้าง',
          sortable: true,
          minWidth: '140px',
          template: 'createDateTemplate'
        },
        {
          field: 'createBy',
          header: 'ผู้สร้าง',
          sortable: true,
          minWidth: '120px'
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
    }
  },

  methods: {
    // Data table handlers
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

    // Action handlers
    onEdit(data) {
      // Navigate to edit sale order
      this.$router.push({
        path: '/sale-order',
        query: { soNumber: data.soNumber }
      })
    },

    onView(data) {
      // Navigate to view sale order
      this.$router.push({
        path: '/sale-order',
        query: { soNumber: data.soNumber, mode: 'view' }
      })
    },

    onCreateInvoice(data) {
      // Show invoice modal for creating invoice from sale order
      this.$emit('create-invoice', data)
    },

    // Status styling
    getStatusBadgeClass(status) {
      const statusClasses = {
        1: 'badge badge-warning', // รอดำเนินการ
        2: 'badge badge-info', // กำลังดำเนินการ
        3: 'badge badge-success', // เสร็จสิ้น
        4: 'badge badge-danger' // ยกเลิก
      }
      return statusClasses[status] || 'badge badge-secondary'
    },

    // API Methods
    async fetchData() {
      await this.saleOrderStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },

    // Format helpers
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },

    formatDate(date) {
      return date ? formatDate(date) : ''
    }
  },

  async mounted() {
    await this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.btn-action-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-container {
  text-align: center;
}

.badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: #212529;
}

.badge-info {
  background-color: #17a2b8;
  color: white;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
}

.badge-secondary {
  background-color: #6c757d;
  color: white;
}
</style>
