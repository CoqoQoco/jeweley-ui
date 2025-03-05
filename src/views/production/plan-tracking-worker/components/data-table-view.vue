<template>
  <div class="mt-2">
    <!-- @view="viewplan" -->
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 350px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- Image Column -->
      <template #imageTemplate="{ data }">
        <div class="image-container">
          <imagePreview :imageName="data.mold" :type="mold" :width="30" :height="30" />
        </div>
      </template>

      <!-- WO Number template -->
      <template #woTemplate="{ data: rowData }">
        {{ `${rowData.wo}-${rowData.woNumber}` }}
      </template>

      <!-- Status template -->
      <template #statusTemplate="{ data: rowData }">
        {{ rowData.wagesStatus === 100 ? `สำเร็จ` : `ติดตามระหว่างผลิต` }}
      </template>

      <!-- Worker template -->
      <template #workerCodeTemplate="{ data: rowData }">
        {{ `${rowData.workerCode}-${rowData.workerName}` }}
      </template>

      <!-- Description template -->
      <template #descTemplate="{ data: rowData }">
        {{ `${rowData.gold} ${rowData.description ? `[${rowData.description}]` : ``}` }}
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { usePlanWorkerApiStore } from '@/stores/modules/api/worker/plan-worker-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    imagePreview
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
      mold: 'MOLD',

      // Columns Configuration
      columns: [
        {
          field: 'image',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'wo',
          header: 'เลขที่ใบงาน',
          minWidth: '150px'
        },
        {
          field: 'status',
          header: 'สถานะงาน',
          minWidth: '150px'
        },
        {
          field: 'workerCode',
          header: 'ช่าง',
          minWidth: '150px'
        },
        {
          field: 'jobDate',
          header: 'วันที่ส่งงาน',
          minWidth: '150px',
          format: 'date'
        },
        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          minWidth: '150px'
        },
        {
          field: 'statusName',
          header: 'เเผนกงาน',
          minWidth: '150px'
        },
        {
          field: 'desc',
          header: 'รายละเอียด',
          minWidth: '150px'
        },
        {
          field: 'goldQtySend',
          header: 'จำนวนจ่าย',
          minWidth: '150px',
          format: 'decimal3'
        },
        {
          field: 'goldWeightSend',
          header: 'น้ำหนักจ่าย',
          minWidth: '150px',
          format: 'decimal3'
        },
        {
          field: 'goldQtyCheck',
          header: 'จำนวนรับ',
          minWidth: '150px',
          format: 'decimal3'
        },
        {
          field: 'goldWeightCheck',
          header: 'น้ำหนักรับ',
          minWidth: '150px',
          format: 'decimal3'
        }
      ]
    }
  },

  setup() {
    const planWorkerStore = usePlanWorkerApiStore()
    return { planWorkerStore }
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
      const res = await this.planWorkerStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        form: this.form
      })

      this.data = { ...res }
    },
    async fetchDataExport() {
      await this.planWorkerStore.fetchDataSearchExport({
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
