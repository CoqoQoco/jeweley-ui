<template>
  <div class="mt-2">
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 340px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="vertical-center-container">
          <button class="btn btn-sm btn-secondary" @click="onUpdate(data)" title="เเก้ไข" disabled>
            <span><i class="bi bi-brush"></i></span>
          </button>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { useCustomerDetailApiStore } from '@/stores/modules/api/customer/customer-detail-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

export default {
  name: 'customer-list-data-table',

  components: {
    BaseDataTable
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}), // ให้ default เป็น empty object แทน
      required: true
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      take: 10,
      skip: 0,
      sort: [],
      expandedRows: [],
      data: {},

      // Columns Configuration
      columns: [
        {
          field: 'action',
          header: '',
          width: '50px',
          sortable: false
          //align: 'center',
        },
        {
          field: 'code',
          header: 'รหัส',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameTh',
          header: 'ชื่อ TH',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'nameEn',
          header: 'ชื่อ EN',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productionPlanCount',
          header: 'ยอดผลิต',
          sortable: true,
          minWidth: '50px',
          format: 'number'
        },
        {
          field: 'address',
          header: 'ที่อยู่',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'typeName',
          header: 'ประเภท',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'telephone1',
          header: 'โทรศัพท์ 1',
          sortable: true,
          minWidth: '100px'
        },
        {
          field: 'telephone2',
          header: 'โทรศัพท์ 2',
          sortable: true,
          minWidth: '100px'
        },
        {
          field: 'email',
          header: 'E-mail',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'contactName',
          header: 'ชื่อผู้ติดต่อ',
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

  setup() {
    const customerStore = useCustomerDetailApiStore()
    return { customerStore }
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

  methods: {
    // ----- data table hnadle
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

    // ---- APIs
    async fetchData() {
      this.data = await this.customerStore.fetchCustomerSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },
    // async fetchDataExport() {
    //   console.log('fetchDataExport')
    //   await this.stockProductStore.fetchDataSearchExport({
    //     sort: this.sort,
    //     form: this.form
    //   })
    // },

    // handle page
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    getStatusSeverity(isRunning) {
      switch (isRunning) {
        case true:
          return 'box-status-show'
        case false:
          return 'box-status-process'
      }
    },
    getStatusName(isRunning) {
      switch (isRunning) {
        case true:
          return 'อยู่ระหว่างรับสินค้า'
        case false:
          return 'รอรับสินค้า'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form';

.notification {
  display: inline-flex;
  align-items: center;
  //background-color: #ffe6e6; /* ส้มอ่อน */
  //padding: 4px 8px;
  //border-radius: 4px;
}

.overdue-tag {
  background-color: #ff4d4d; /* สีแดง */
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  margin-left: 4px;
  font-size: 12px;
}
</style>
