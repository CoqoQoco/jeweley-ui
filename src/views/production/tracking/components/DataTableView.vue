<template>
  <div class="mt-2">
    <loading :isLoading="isLoading"></loading>
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      v-model:expandedRows="expnadData"
      dataKey="id"
      class="p-datatable-sm"
      scrollable
      scrollHeight="calc(100vh - 310px)"
      columnResizeMode="expand"
      resizableColumns
      :paginator="true"
      @page="handlePageChange"
      :lazy="true"
      sortMode="multiple"
      @sort="handlePageChangeSort"
      stripedRows
      removableSort
      :rows="take"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
    >
      <Column style="width: 80px">
        <template #body="slotProps">
          <div class="btn-action-container">
            <button class="btn btn-sm btn btn-green" @click="viewplan(slotProps.data)">
              <i class="bi bi-search"></i>
            </button>
            <!-- <button class="ml-1 btn btn-sm btn btn-dark" title="โหมดดูรายละเอียด">
              <i class="bi bi-clipboard2-data-fill"></i>
            </button> -->
          </div>
        </template>
      </Column>
      <Column field="tbtProductionPlanImage" header="รูปสินค้า" style="min-width: 100px">
        <template #body="slotProps">
          <div class="image-container">
            <loading :isLoading="isLoadingImage"></loading>
            <!-- <img :src="fetchIamge(slotProps)" alt="Preview Image" /> -->
            <imagePreview
              :imageName="slotProps.data.mold"
              :type="mold"
              :width="30"
              :height="30"
            ></imagePreview>
          </div>
        </template>
      </Column>
      <Column field="woText" :sortable="true" header="W.O." style="min-width: 150px">
        <template #body="slotProps">
          {{ `${slotProps.data.wo}-${slotProps.data.woNumber}` }}
        </template>
      </Column>
      <Column field="mold" sortable header="เเม่พิมพ์" style="min-width: 150px"></Column>
      <Column field="status" sortable header="สถานะใบงาน" style="min-width: 150px">
        <template #body="slotProps">
          <div
            class="text-center"
            style="width: 100px"
            :class="getStatusSeverity(slotProps.data.status)"
            @click="onUpdateStatus(slotProps)"
          >
            {{ slotProps.data.statusName }}
          </div>
        </template>
      </Column>
      <Column
        header="สถานะใบงาน (วันที่)"
        sortable
        field="lastUpdateStatus"
        style="min-width: 150px"
      >
        <template #body="prop">
          <div class="notification">
            <span>{{ formatDate(prop.data.lastUpdateStatus) }}</span>
          </div>
        </template>
      </Column>
      <Column header="วันส่งงานลูกค้า" sortable field="requestDate" style="min-width: 150px">
        <template #body="prop">
          <div class="notification">
            <span>{{ formatDate(prop.data.requestDate) }}</span>
            <span v-if="prop.data.isOverPlan" class="overdue-tag">เกินกำหนด</span>
          </div>
        </template>
      </Column>
      <Column header="รหัสสินค้า" sortable field="productNumber" style="min-width: 150px"></Column>
      <Column
        header="ประเภทสินค้า"
        sortable
        field="productTypeName"
        style="min-width: 150px"
      ></Column>
      <Column header="จำนวนสินค้า" sortable field="productQty" style="min-width: 150px"></Column>
      <Column header="ประเภททอง/เงิน" sortable field="gold" style="min-width: 150px"></Column>
      <Column header="ขนาดทอง/เงิน" sortable field="goldSize" style="min-width: 150px"></Column>
      <Column header="รหัสลูกค้า" sortable field="customerNumber" style="min-width: 150px"></Column>
      <Column header="ชื่อลูกค้า" sortable field="customerName" style="min-width: 150px"></Column>
      <Column
        header="ประเภทลูกค้า"
        sortable
        field="customerTypeName"
        style="min-width: 150px"
      ></Column>
      <Column header="วันสร้างใบสินค้า" sortable field="createDate" style="min-width: 150px">
        <template #body="prop">
          {{ formatDate(prop.data.createDate) }}
        </template>
      </Column>
      <template #footer>
        <div class="d-flex justify-content-between">
          <div>
            <button
              :class="['btn btn-sm', this.isTransferJob ? 'btn-secondary' : 'btn-main']"
              type="button"
              :disabled="isTransferJob"
              title="โอนงาน"
              @click="onTransferJob"
            >
              <span><i class="bi bi-arrow-left-right"></i></span>
              <span class="ml-2">โอนงาน</span>
            </button>
            <button
              :class="['btn btn-sm ml-2', this.isTransferProduct ? 'btn-secondary' : 'btn-main']"
              type="button"
              :disabled="isTransferProduct"
              title="โอนงาน"
            >
              <span><i class="bi bi-arrow-left-right"></i></span>
              <span class="ml-2">โอนสินค้า</span>
            </button>
          </div>
          <div></div>
        </div>
      </template>
    </DataTable>

    <transferJobView
      :isShow="isShow.transferJob"
      :modelTransferValue="dataTransfer"
      :masterStatusValue="masterStatus"
      :stausTransferValue="statusTransfer"
      @closeModal="closeModal"
    ></transferJobView>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
//import tableMain from '@/components/table/HtmlTable.vue'
import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

//prime table
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Papa from 'papaparse'

import api from '@/axios/axios-config.js'
import swAlert from '@/services/alert/sweetAlerts.js'

import transferJobView from './JobTransferView.vue'

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

const interfaceIsShow = {
  transferJob: false
}

export default {
  components: {
    DataTable,
    Column,
    loading,
    imagePreview,
    transferJobView
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    formValueExport: {
      type: Object,
      default: () => ({})
    },
    formValue: {
      type: Object,
      default: () => {}
    },
    masterStatusValue: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isLoading: false,
      isLoadingImage: false,
      isShow: { ...interfaceIsShow },
      orderplan: 'ORDERPLAN',
      mold: 'MOLD',

      // table
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      //sortField: 'updateDate',
      //sortOrder: -1, // หรือ -1 สำหรับ descending
      //sort: [{ field: 'updateDate', dir: 'desc' }],
      sort: [],
      data: {},
      dataTransfer: {},
      dataExcel: {},
      expnadData: [],

      //update
      statusTransfer: 0,
      totalTransferAllow: 10,

      //test
      urlImg: null,

      modelUpdateStatus: {},
      export: null

      //master
      //masterStatus: []
    }
  },
  computed: {
    model() {
      return this.modelValue
    },
    isData() {
      return this.modelValue.length ? false : true
    },
    masterStatus() {
      return this.masterStatusValue
    },
    isTransferJob() {
      let res = true
      //console.log('isTransferJob', this.formValue)
      //console.log('isTransferJob', this.data)
      if (this.formValue && this.formValue.status && this.formValue.status.length === 1) {
        const allow = [10, 50, 60, 70, 80, 85, 90]
        allow.includes(this.formValue.status[0]) && this.totalRecords > 0
          ? (res = false)
          : (res = true)
      }
      return res
    },
    isTransferProduct() {
      let res = true
      //console.log('isTransferProduct', this.formValue)
      //console.log('isTransferProduct', this.data)
      if (this.formValue && this.formValue.status && this.formValue.status.length === 1) {
        this.formValue.status[0] === 95 && this.totalRecords > 0 ? (res = false) : (res = true)
      }

      return res
    }
  },
  watch: {
    async formValue() {
      //console.log(this.formValue)
      this.take = 10
      this.skip = 0
      await this.fetchData()
    },
    formValueExport: {
      handler(val) {
        console.log('watch modelFormExport', val)
        //this.export = { ...val }
        this.fetchDataExport()
      },
      deep: true
    }
  },
  methods: {
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.fetchData()
    },
    handlePageChangeSort(e) {
      //console.log("handlePageChangeSort", e)
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => {
        return { field: item.field, dir: item.order === 1 ? 'asc' : 'desc' }
      })
      this.fetchData()
    },

    // ----- tag ------ //
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

    // ------ helper ------//
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    exportWithCustomColumnCSV(data, filename) {
      const utf8BOM = '\uFEFF'
      const csv = Papa.unparse(data, {
        quotes: false, //or array of booleans
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ',',
        header: true,
        newline: '\r\n',
        skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
        columns: null //or array of strings
      })
      const csvData = utf8BOM + csv
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    // ----- Api ----- //
    initRequest() {
      const param = {
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          start: this.formValue.start ? formatISOString(this.formValue.start) : null,
          end: this.formValue.end ? formatISOString(this.formValue.end) : null,
          sendStart: this.formValue.sendStart ? formatISOString(this.formValue.sendStart) : null,
          sendEnd: this.formValue.sendEnd ? formatISOString(this.formValue.sendEnd) : null,
          text: this.formValue.text,
          status: this.formValue.status ? [...this.formValue.status] : null,
          isOverPlan: this.formValue.isOverPlan?.id,
          customerCode: this.formValue.customerCode,
          productType: this.formValue.productType ? [...this.formValue.productType] : null,
          customerType: this.formValue.customerType ? [...this.formValue.customerType] : null,
          gold: this.formValue.gold ? [...this.formValue.gold] : null,
          goldSize: this.formValue.goldSize ? [...this.formValue.goldSize] : null,
          mold: this.formValue.mold,
          productNumber: this.formValue.productNumber
        }
      }

      return param
    },
    async fetchData() {
      try {
        this.isLoading = true
        this.data = {}
        //console.log(this.formValue)
        const param = {
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          ...this.initRequest()
        }

        //console.log(param)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          this.data = { ...res }
          this.totalRecords = res.total
        } else {
          this.data = {}
          this.totalRecords = 0
        }

        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchDataTransfer() {
      this.isLoading = true
      try {
        this.dataTransfer = {}
        //console.log(this.formValue)
        const param = {
          take: 0,
          skip: 0,
          sort: this.sort,
          ...this.initRequest()
        }

        console.log(param)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          this.dataTransfer = { ...res }
        }

        this.isLoading = false
      } catch (error) {
        console.log(error)
      }
      this.isLoading = false
    },
    async fetchIamge(item) {
      if (item.data.tbtProductionPlanImage && item.data.tbtProductionPlanImage.length) {
        try {
          const param = {
            imageName: item.data.tbtProductionPlanImage[0].path
          }

          const res = await api.jewelry.get('FileExtension/GetPlanImage', param)
          const response = `data:image/png;base64,${res}`
          return response
        } catch (error) {
          console.log(error)
          return null
        }
      }
    },
    async fetchMaterStatus() {
      try {
        this.isLoading = true
        const res = await api.jewelry.get('ProductionPlan/GetProductionPlanStatus')
        if (res) {
          this.masterStatus = [...res]
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchDataExport() {
      try {
        this.isLoading = true

        const params = {
          take: 0,
          skip: 0,
          sort: this.sort,
          ...this.initRequest()
        }
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', params)
        if (res) {
          const dataExcel = res.data.map((item) => {
            return {
              //WO: `${item.wo}-${item.woNumber}`,
              WO: item.wo,
              'WO No.': item.woNumber,
              เเม่พิมพ์: item.mold,
              สถานะใบงาน: item.statusName,
              'สถานะใบงาน (วันที่)': formatDate(item.lastUpdateStatus),
              วันส่งงานลูกค้า: formatDate(item.requestDate),
              รหัสสินค้า: item.productNumber,
              ประเภทสินค้า: item.productTypeName,
              จำนวนสินค้า: item.productQty,
              รหัสลูกค้า: item.customerNumber,
              ชื่อลูกค้า: item.customerName,
              วันสร้างใบสินค้า: formatDate(item.createDate),
              ประเภททอง_เงิน: item.gold,
              ขนาดทอง_เงิน: item.goldSize
            }
          })
          this.exportWithCustomColumnCSV(
            dataExcel,
            `เอกสารใบจ่ายข-รับคืนงาน[${this.formatDateTime(new Date())}].csv`
          )
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },

    // ----- update status ----- //
    closeModalUpdatestatus() {
      this.isShowUpdateStatusModal = false
    },
    onUpdateStatus(item) {
      this.isShowUpdateStatusModal = true
      this.modelUpdateStatus = { ...item }
    },
    async fetchDataByupdateStatus() {
      //console.log(e)
      this.isShowUpdateStatusModal = false
      await this.fetchData()
    },

    // ---- event
    closeModal(action) {
      this.isShow = { ...interfaceIsShow }

      if (action === 'fetch') {
        this.fetchData()
      }
    },
    async onTransferJob() {
      this.statusTransfer = 0

      if (this.data.total > this.totalTransferAllow) {
        swAlert.warning(
          `สามารถโอนงานได้ไม่เกินครั้งละ ${this.totalTransferAllow} รายการ`,
          'จำนวนงานเกินกำหนด'
        )
      } else {
        await this.fetchDataTransfer()
        this.statusTransfer = this.formValue.status[0]
        this.isShow.transferJob = true
      }
    },

    // ---- view plan ---- //
    viewplan(item) {
      //console.log(item.id)
      const id = item.id
      window.open(`/plan-order-tracking-update/${id}`, '_blank')
      //this.$router.push({ name: 'plan-order-tracking-detail', params: { id: 123 } })
    }
  },
  created() {
    //this.fetchMaterStatus()
    //this.fetchData()
  },
  async mounted() {
    //this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/table-data.scss';
@import '@/assets/scss/custom-style/standard-data-table';

.btn-link:hover {
  color: var(--base-color) !important;
  text-decoration: none !important;
}
.expnad-table-container {
  .p-datatable thead th {
    background-color: var(--base-color) !important;
    color: #ffffff;
    //font-weight: bold;
  }
}

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
