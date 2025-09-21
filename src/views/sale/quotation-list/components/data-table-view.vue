<template>
  <div class="mt-2">
    <BaseDataTable
      :items="quotationStore.dataList.data"
      :totalRecords="quotationStore.dataList.total"
      dataKey="number"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 340px)'"
      class="base-data-table"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button 
            class="btn btn-sm btn-main" 
            title="แก้ไข" 
            @click="onEdit(data)"
          >
            <i class="bi bi-brush"></i>
          </button>
          <button 
            class="btn btn-sm btn-green ml-2" 
            title="ดูรายละเอียด" 
            @click="onView(data)"
          >
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </template>

      <template #statusTemplate>
        <div class="status-container">
          <span class="badge badge-success">สำเร็จ</span>
        </div>
      </template>

      <template #dateTemplate="{ data }">
        <div>
          {{ formatDate(data.date) }}
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
        <div class="text-right">
          {{ Number(data.markUp || 0).toFixed(2) }}%
        </div>
      </template>

      <template #discountTemplate="{ data }">
        <div class="text-right">
          {{ Number(data.discount || 0).toFixed(2) }}%
        </div>
      </template>

      <template #freightTemplate="{ data }">
        <div class="text-right">
          {{ data.freight ? Number(data.freight).toFixed(2) : '-' }}
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

export default {
  name: 'QuotationListDataTableView',

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
    const quotationStore = usrQuotationApiStore()
    return { quotationStore }
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
          width: '120px',
          sortable: false
        },
        {
          field: 'number',
          header: 'เลขที่ใบเสนอราคา',
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
          field: 'customerPhone',
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
          field: 'currency',
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
        {
          field: 'markUp',
          header: 'Markup (%)',
          sortable: true,
          minWidth: '100px',
          template: 'markupTemplate'
        },
        {
          field: 'discount',
          header: 'ส่วนลด (%)',
          sortable: true,
          minWidth: '100px',
          template: 'discountTemplate'
        },
        {
          field: 'freight',
          header: 'ค่าขนส่ง',
          sortable: true,
          minWidth: '100px',
          template: 'freightTemplate'
        },
        {
          field: 'date',
          header: 'วันที่ใบเสนอราคา',
          sortable: true,
          minWidth: '140px',
          template: 'dateTemplate'
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
      // Navigate to edit quotation
      this.$router.push({
        path: '/sale/quotation',
        query: { number: data.number }
      })
    },

    onView(data) {
      // Navigate to view quotation
      this.$router.push({
        path: '/sale/quotation',
        query: { number: data.number, mode: 'view' }
      })
    },

    // API Methods
    async fetchData() {
      await this.quotationStore.fetchList({
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
</style>