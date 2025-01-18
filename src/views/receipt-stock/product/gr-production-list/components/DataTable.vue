<template>
  <div class="mt-2">
    <!-- @view="viewplan" -->
    <div class="filter-container-highlight">
      <span class="title-text-lg-bg">{{
        `จำนวนแผนผลิตรอรับ ${receiptProductionStore.dataListPlan.total ?? `0`} รายการ`
      }}</span>
    </div>
    <BaseDataTable
      :items="receiptProductionStore.dataListPlan.data"
      :totalRecords="receiptProductionStore.dataListPlan.total"
      :expandable="true"
      v-model:expandedRows="expandedRows"
      :columns="columns"
      :perPage="take"
      :scrollHeight="'calc(100vh - 340px)'"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- action -->
      <!-- <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-green" @click="viewplan(data)">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </template> -->

      <!-- Image Column -->
      <!-- <template #imageTemplate="{ data }">
        <div class="image-container">
          <imagePreview :imageName="data.mold" :type="mold" :width="30" :height="30" />
        </div>
      </template> -->
      <template #actionTemplate="{ data }">
        <div class="vertical-center-container">
          <button class="btn btn-sm btn-main" @click="receipt(data)" title="รับสินค้า">
            <span><i class="bi bi-receipt"></i></span>
          </button>
          <div class="ml-2" style="width: 120px" :class="getStatusSeverity(data.isRunning)">
            {{ getStatusName(data.isRunning) }}
          </div>
        </div>
      </template>

      <!-- WO Column -->
      <template #woTextTemplate="{ data }">
        {{ `${data.wo}-${data.woNumber}` }}
      </template>

      <template #productQtyTemplate="{ data }">
        <div class="d-flex justify-content-end p-1">
          <span>{{ data.qtyRunning }}</span>
          <span>/</span>
          <span>{{ data.productQty }}</span>
        </div>
      </template>

      <!-- Request Date Column -->
      <!-- <template #receiptDateTemplate="{ data }">
        <div class="notification">
          <span>{{ formatDate(data.receiptDate) }}</span>
        </div>
      </template> -->

      <!-- Custom Expansion Template -->
      <template #expansion="slotProps">
        <div class="p-1">
          <dataExpand :modelForm="slotProps"></dataExpand>
        </div>
      </template>

      <!-- Custom Footer/Paginator Buttons -->
      <!-- <template #paginator-buttons>
       
      </template> -->
    </BaseDataTable>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'
//import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

//const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

//import { mapState, mapActions } from 'pinia'
import { useReceiptProductionApiStore } from '@/stores/modules/api/receipt/receipt-production-api.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
//import swAlert from '@/services/alert/sweetAlerts.js'

import dataExpand from './DataExpand.vue'

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    dataExpand
    //imagePreview
    //TransferJob,
    //TransferProduct
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
      mold: 'MOLD',
      take: 10,
      skip: 0,
      sort: [],
      expandedRows: [],

      // Columns Configuration
      columns: [
        {
          field: 'action',
          header: '',
          minWidth: '50px',
          sortable: false
          //align: 'center',
        },
        {
          field: 'woText',
          header: 'W.O.',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productQty',
          header: 'จำนวน',
          sortable: true,
          minWidth: '100px',
          backgroundColor: '#dad4b5'
        },
        {
          field: 'receiptNumber',
          header: 'เลขที่ตั้งรับสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'receiptDate',
          header: 'วันที่ผลิตสำเร็จ',
          sortable: true,
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
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
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'gold',
          header: 'สีของทอง/เงิน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'goldSize',
          header: 'ประเภททอง/เงิน',
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  setup() {
    const receiptProductionStore = useReceiptProductionApiStore()
    return { receiptProductionStore }
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
      await this.receiptProductionStore.fetchDataListPlan({
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

    receipt(data) {
      console.log('receipt', data)
      this.$router.push({ name: 'goods-receipt-production', params: { id: data.receiptNumber } })
    },

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
