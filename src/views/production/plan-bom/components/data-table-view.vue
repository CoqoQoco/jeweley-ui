<template>
  <div class="mt-2">
    <!-- @view="viewplan" -->
    <BaseDataTable
      :items="planBOMApiStore.bomData.data"
      :totalRecords="planBOMApiStore.bomData.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-green" @click="viewplan(data)">
            <i class="bi bi-search"></i>
          </button>
        
        </div>
      </template> -->

      <!-- WO Column -->
      <template #woTextTemplate="{ data }">
        {{ `${data.wo}-${data.woNumber}` }}
      </template>

      <!-- Last Update Status Column -->
      <template #totalTemplate="{ data }">
        <div class="notification">
          <span>
            {{
              Number(data.qty * data.qtyPrice + data.qtyWeight * data.qtyWeightPrice).toFixed(2)
            }}</span
          >
        </div>
      </template>

      <!-- Custom Footer/Paginator Buttons -->
      <template #paginator-buttons> </template>
    </BaseDataTable>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'
//import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
//import swAlert from '@/services/alert/sweetAlerts'

//const transferJobView = defineAsyncComponent(() => import('../modal/JobTransfer.vue'))

//import { mapState, mapActions } from 'pinia'
import { usePlanBOMApiStore } from '@/stores/modules/api/plan/plan-bom-store.js'
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
      take: 10,
      skip: 0,
      sort: [],

      // Columns Configuration

      columns: [
        {
          field: 'completedDate',
          header: 'วันที่',
          sortable: true,
          width: '120px',
          format: 'datetime'
        },
        {
          field: 'woText',
          header: 'W.O.',
          sortable: true,
          width: '120px'
        },
        {
          field: 'mold',
          header: 'แม่พิมพ์',
          sortable: true,
          width: '120px'
        },
        {
          field: 'productTypeName',
          header: 'สินค้า',
          sortable: true,
          minWidth: '120px'
        },
        // {
        //   field: 'productType',
        //   header: 'ประเภทสินค้า',
        //   sortable: true,
        //   minWidth: '120px'
        // },
        {
          field: 'name',
          header: 'รายการ',
          sortable: false,
          minWidth: '200px'
        },
        // {
        //   field: 'nameGroup',
        //   header: 'ประเภท',
        //   sortable: true,
        //   minWidth: '80px',
        //   maxWidth: '100px',
        //   align: 'center'
        // },
        {
          field: 'qty',
          header: 'จำนวน',
          sortable: true,
          width: '110px',
          align: 'right',
          format: 'number'
        },
        {
          field: 'qtyPrice',
          header: 'ราคา/จำนวน',
          sortable: true,
          width: '110px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'qtyWeight',
          header: 'น้ำหนัก',
          sortable: true,
          width: '110px',
          maxWidth: '110px',
          align: 'right',
          format: 'decimal3'
        },
        {
          field: 'qtyWeightPrice',
          header: 'ราคา/น้ำหนัก',
          sortable: true,
          width: '110px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'total',
          header: 'ราคารวม',
          sortable: true,
          width: '110px',
          align: 'right',
          format: 'decimal2'
        }
        // {
        //   field: 'gold',
        //   header: 'สีทอง/เงิน',
        //   sortable: true,
        //   minWidth: '110px'
        // },
        // {
        //   field: 'goldSize',
        //   header: 'ประเภททอง',
        //   sortable: true,
        //   minWidth: '100px'
        // },
        // {
        //   field: 'customerCode',
        //   header: 'รหัสลูกค้า',
        //   sortable: true,
        //   minWidth: '100px'
        // },
        // {
        //   field: 'customerName',
        //   header: 'ชื่อลูกค้า',
        //   sortable: true,
        //   minWidth: '150px'
        // },

        // {
        //   field: 'date',
        //   header: 'วันที่สร้าง',
        //   sortable: true,
        //   minWidth: '130px',
        //   format: 'datetime'
        // }
      ]
    }
  },

  setup() {
    const planBOMApiStore = usePlanBOMApiStore()
    return { planBOMApiStore }
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
      await this.planBOMApiStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },
    async fetchDataExport() {
      await this.planBOMApiStore.fetchListReport({
        take: 0,
        skip: 0,
        sort: this.sort,
        formValue: this.form
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
</style>
