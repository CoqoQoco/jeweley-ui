<template>
  <div class="mt-2">
    <!-- @view="viewplan" -->
    <BaseDataTable
      :items="planSearchStore.dataPlanSearch.data"
      :totalRecords="planSearchStore.dataPlanSearch.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-green" @click="viewplan(data)">
            <i class="bi bi-search"></i>
          </button>
          <!-- <button class="ml-1 btn btn-sm btn btn-dark" title="โหมดดูรายละเอียด">
              <i class="bi bi-clipboard2-data-fill"></i>
            </button> -->
        </div>
      </template>

      <!-- Image Column -->
      <template #imageTemplate="{ data }">
        <div class="image-container">
          <div>
            <imagePreview :imageName="data.mold" :type="mold" :width="25" :height="25" />
          </div>
          <div v-if="data.moldSub" class="ml-2">
            <imagePreview :imageName="data.moldSub" :type="mold" :width="25" :height="25" />
          </div>
        </div>
      </template>

      <!-- WO Column -->
      <template #woTextTemplate="{ data }">
        {{ `${data.wo}-${data.woNumber}` }}
      </template>

      <!-- Status Column -->
      <template #statusTemplate="{ data }">
        <div style="width: 150px" :class="getStatusSeverity(data.status)">
          {{ data.statusName }}
        </div>
      </template>

      <!-- Last Update Status Column -->
      <template #lastUpdateStatusTemplate="{ data }">
        <div class="notification">
          <span>{{ data.lastUpdateStatus ? formatDate(data.lastUpdateStatus) : `` }}</span>
        </div>
      </template>

      <!-- Request Date Column -->
      <template #requestDateTemplate="{ data }">
        <div class="notification">
          <span>{{ formatDate(data.requestDate) }}</span>
          <span v-if="data.isOverPlan" class="overdue-tag">เกินกำหนด</span>
        </div>
      </template>

      <!-- Custom Footer/Paginator Buttons -->
      <template #paginator-buttons>
        <button
          :class="['btn btn-sm', isTranferJob ? 'btn-secondary' : 'btn-main']"
          type="button"
          :disabled="isTranferJob"
          title="โอนงาน"
          @click="onTrnsferJob"
        >
          <span><i class="bi bi-arrow-down-up"></i></span>
          <span class="ml-2">โอนงาน</span>
        </button>
        <button
          :class="['btn btn-sm ml-2', isTransferProduct ? 'btn-secondary' : 'btn-main']"
          type="button"
          :disabled="isTransferProduct"
          title="โอนงาน"
          @click="onTrnsferProduct"
        >
          <span><i class="bi bi-cart-check-fill"></i></span>
          <span class="ml-2">โอนสินค้า</span>
        </button>
      </template>
    </BaseDataTable>

    <TransferJob
      :isShow="isShow.transferJob"
      :masterStatusValue="planStatus"
      :stausTransferValue="statusTransfer"
      @closeModal="closeModal"
    />
    <TransferProduct
      :isShow="isShow.transferProduct"
      :masterStatusValue="planStatus"
      :stausTransferValue="statusTransfer"
      @closeModal="closeModal"
    ></TransferProduct>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
//import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
//import swAlert from '@/services/alert/sweetAlerts'

const imagePreview = defineAsyncComponent(() => import('@/components/prime-vue/ImagePreview.vue'))
//const transferJobView = defineAsyncComponent(() => import('../modal/JobTransfer.vue'))

//import { mapState, mapActions } from 'pinia'
import { usePlanSearchApiStore } from '@/stores/modules/api/plan-search-store.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import TransferJob from '../modal/TransferJob.vue'
import TransferProduct from '../modal/TransferProduct.vue'

const interfaceIsShow = {
  transferJob: false,
  transferProduct: false
}

export default {
  name: 'ProductionPlanList',

  components: {
    BaseDataTable,
    imagePreview,
    TransferJob,
    TransferProduct
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
      isShow: { ...interfaceIsShow },
      mold: 'MOLD',
      take: 10,
      skip: 0,
      sort: [],
      statusTransfer: 0,

      // Columns Configuration
      columns: [
        {
          field: 'action',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center',
          bodyTemplate: 'actionTemplate'
        },
        {
          field: 'image',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'woText',
          header: 'W.O.',
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
          field: 'status',
          header: 'สถานะใบงาน',
          sortable: true,
          minWidth: '150px',
          align: 'center'
        },
        {
          field: 'lastUpdateStatus',
          header: 'สถานะใบงาน (วันที่)',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'requestDate',
          header: 'วันส่งงานลูกค้า',
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
          field: 'productQty',
          header: 'จำนวนสินค้า',
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
        },
        {
          field: 'customerNumber',
          header: 'รหัสลูกค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerName',
          header: 'ชื่อลูกค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'customerTypeName',
          header: 'ประเภทลูกค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'createDate',
          header: 'วันสร้างใบสินค้า',
          sortable: true,
          minWidth: '150px',
          format: 'date'
        }
      ]
    }
  },

  setup() {
    const planSearchStore = usePlanSearchApiStore()
    return { planSearchStore }
  },

  computed: {
    form() {
      return this.modelForm || {}
    },
    planStatus() {
      return this.masterPlanStatus
    },
    isTranferJob() {
      let res = true
      //console.log('isTranferJob', this.modelForm)
      if (this.modelForm && this.modelForm.status && this.modelForm.status.length === 1) {
        const allow = [10, 50, 60, 70, 80, 85, 90, 94, 95]
        allow.includes(this.modelForm.status[0]) && this.planSearchStore.dataPlanSearch.total > 0
          ? (res = false)
          : (res = true)
      }
      return res
    },
    isTransferProduct() {
      //return true
      let res = true
      if (this.modelForm && this.modelForm.status && this.modelForm.status.length === 1) {
        const allow = [95]
        allow.includes(this.modelForm.status[0]) && this.planSearchStore.dataPlanSearch.total > 0
          ? (res = false)
          : (res = true)
      }
      return res
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

    // ----- event
    viewplan(item) {
      console.log('viewplan', item)
      const id = item.id
      window.open(`/plan-order-tracking-update/${id}`, '_blank')
      //this.$router.push({ name: 'plan-order-tracking-detail', params: { id: 123 } })
    },
    async onTrnsferJob() {
      //console.log('onTrnsferJob')
      if (this.planSearchStore.dataPlanSearcTotalRecord > this.planSearchStore.totalTransferAllow) {
        swAlert.warning(
          `สามารถโอนงานได้ไม่เกินครั้งละ ${this.planSearchStore.totalTransferAllow} รายการ`,
          'จำนวนงานเกินกำหนด'
        )
      } else {
        console.log('onTrnsferJob', this.modelForm)
        this.statusTransfer = this.modelForm.status[0]
        await this.fetchDataTransfer()
        this.isShow.transferJob = true
      }
    },
    async onTrnsferProduct() {
      if (this.planSearchStore.dataPlanSearcTotalRecord > this.planSearchStore.totalTransferAllow) {
        swAlert.warning(
          `สามารถโอนงานได้ไม่เกินครั้งละ ${this.planSearchStore.totalTransferAllow} รายการ`,
          'จำนวนงานเกินกำหนด'
        )
      } else {
        console.log('onTrnsferJob', this.modelForm)
        this.statusTransfer = this.modelForm.status[0]
        await this.fetchDataTransfer()
        this.isShow.transferProduct = true
      }
    },
    closeModal(action) {
      this.isShow = { ...interfaceIsShow }

      if (action === 'fetch') {
        this.fetchData()
      }
    },

    // ---- APIs
    async fetchData() {
      await this.planSearchStore.fetchData({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.form
      })
    },
    async fetchDataExport() {
      const res = await this.planSearchStore.fetchDataExport({
        sort: this.sort,
        formValue: this.form
      })

      if (res.success) {
        //excel
      }
    },
    async fetchDataTransfer() {
      console.log('fetchDataTransfer', this.form)
      await this.planSearchStore.fetchDataTransfer({
        sort: this.sort,
        formValue: this.form
      })
    },

    // handle page
    getStatusSeverity(status) {
      switch (status) {
        case 9999:
          return 'box-status-process'
        case 500:
          return 'box-status-disable'
        case 100:
        case 95:
          return 'box-status-success'
        case 10:
          return 'box-status-process'
        case 49:
        case 54:
        case 59:
        case 69:
        case 79:
        case 84:
        case 89:
        case 94:
          return 'box-status-process'
        case 50:
        case 55:
        case 60:
        case 70:
        case 80:
        case 85:
        case 90:
          return 'box-status-show'
      }
    },
    getStatusName(status) {
      return status
    },
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

.image-container {
  display: flex;
  justify-content: start;
  align-items: center;
  margin-left: 4px;
}
</style>
