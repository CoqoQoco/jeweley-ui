<template>
  <div class="mt-2">
    <!-- @view="viewplan" -->
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 290px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- WO Column -->
      <template #woTextTemplate="{ data }">
        {{ `${data.wo}-${data.woNumber}` }}
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { usePlanStatusDetailApiStore } from '@/stores/modules/api/plan/plan-status-detail-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  name: 'ProductionPlanList',

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
    },
    formValueExport: {
      type: Object,
      default: () => ({})
    },
    masterPlanStatus: {
      type: Array,
      default: () => [],
      required: true
    }
  },

  data() {
    return {
      data: {},
      take: 10,
      skip: 0,
      sort: [],

      // Columns Configuration

      columns: [
        {
          field: 'woText',
          header: 'W.O.',
          sortable: true
        },
        {
          field: 'receiveDate',
          header: 'วันที่รับโอนงานงาน',
          sortable: true,
          format: 'datetime'
        },
        {
          field: 'receiveWorkDate',
          header: 'วันที่ช่างรับงาน',
          sortable: true,
          format: 'datetime'
        },
        {
          field: 'statusName',
          header: 'สถานะงาน',
          sortable: true
        },
        {
          field: 'typeStatusName',
          header: 'แผนก',
          sortable: true
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
          sortable: true
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: true
        },
        {
          field: 'productName',
          header: 'ชื่อสินค้า',
          sortable: true
        },
        {
          field: 'description',
          header: 'รายละเอียด',
          sortable: true
        },
        {
          field: 'gold',
          header: 'ประเภททอง',
          sortable: true,
          minWidth: '100px'
        },
        {
          field: 'goldQtySend',
          header: 'จำนวนจ่าย',
          sortable: true,
          format: 'decimal2',
          minWidth: '100px'
        },
        {
          field: 'goldWeightSend',
          header: 'นำหนักจ่าย',
          sortable: true,
          format: 'decimal2',
          minWidth: '100px'
        },
        {
          field: 'goldQtyCheck',
          header: 'จำนวนรับ',
          sortable: true,
          format: 'decimal2',
          minWidth: '100px'
        },
        {
          field: 'goldWeightCheck',
          header: 'นำหนักรับ',
          sortable: true,
          format: 'decimal2',
          minWidth: '100px'
        },
        {
          field: 'workerName',
          header: 'ช่าง',
          sortable: true
        }
      ]
    }
  },

  setup() {
    const planStatusDetailStore = usePlanStatusDetailApiStore()
    return { planStatusDetailStore }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    planStatus() {
      return this.masterPlanStatus
    }
  },

  watch: {
    async modelForm() {
      console.log(this.modelForm)
      this.take = 10
      this.skip = 0
      await this.fetchData()
    },
    async modelFormExport() {
      console.log(this.modelForm)
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
      console.log('fetchData', this.form)
      const res = await this.planStatusDetailStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        form: this.form
      })

      this.data = { ...res }
    },
    async fetchDataExport() {
      await this.planStatusDetailStore.fetchDataSearchExport({
        sort: this.sort,
        form: this.form
      })
    },

    // handle page
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

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
