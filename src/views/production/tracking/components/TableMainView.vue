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
      scrollHeight="calc(100vh - 270px)"
      columnResizeMode="expand"
      resizableColumns
      :paginator="true"
      :lazy="true"
      sortMode="multiple"
      stripedRows
      removableSort
      @page="handlePageChange"
      @sort="handlePageChangeSort"
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
      <Column field="wo" :sortable="false" header="W.O." style="min-width: 150px">
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
      <Column header="จำนวนสินค้า" sortable field="productQty" style="min-width: 150px"></Column>
      <Column header="รหัสลูกค้า" sortable field="customerNumber" style="min-width: 150px"></Column>
      <Column header="วันสร้างใบสินค้า" sortable field="createDate" style="min-width: 150px">
        <template #body="prop">
          {{ formatDate(prop.data.createDate) }}
        </template>
      </Column>
      <!-- <template #expansion="slotProps">
        <div class="p-3">
          <h6 style="color: var(--base-font-color)">
            <span class="mr-2"><i class="bi bi-gem"></i></span>
            <span>ส่วนประกอบสินค้า</span>
          </h6>
          <tableExpand v-model:formValue="slotProps.data"></tableExpand>
          <DataTable
            class="expnad-table-container"
            :value="slotProps.data.tbtProductionPlanMaterial"
            showGridlines
          >
            <Column header="รายการ" field="material"></Column>
            <Column header="ประเภท" field="materialType"></Column>
            <Column header="รูปร่าง" field="materialShape"></Column>
            <Column header="ขนาด" field="materialSize"></Column>
            <Column header="จำนวน" field="materialQty"></Column>
            <Column header="หมายเหตุ" field="materialRemark"></Column>
          </DataTable>
        </div>
      </template> -->
    </DataTable>
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

const imagePreview = defineAsyncComponent(() => import('@/components/image/PreviewImage.vue'))

export default {
  components: {
    DataTable,
    Column,
    loading,
    imagePreview
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
      isShowUpdateStatusModal: false,
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
      dataExcel: {},
      expnadData: [],

      //test
      urlImg: null,

      modelUpdateStatus: {},
      export: null

      //master
      //masterStatus: []
    }
  },
  computed: {
    isData() {
      return this.modelValue.length ? false : true
    },
    masterStatus() {
      return this.masterStatusValue
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
    async fetchData() {
      try {
        this.isLoading = true
        this.data = {}
        //console.log(this.formValue)
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
            customerCode: this.formValue.customerCode
          }
        }

        console.log(param)
        const res = await api.jewelry.post('ProductionPlan/ProductionPlanSearch', param)
        if (res) {
          this.data = { ...res }
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
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

        console.log('fetchDataExport', this.formValue)
        const params = {
          take: 0,
          skip: 0,
          sort: [],
          search: {
            start: this.formValue.start ? formatISOString(this.formValue.start) : null,
            end: this.formValue.end ? formatISOString(this.formValue.end) : null,
            sendStart: this.formValue.sendStart ? formatISOString(this.formValue.sendStart) : null,
            sendEnd: this.formValue.sendEnd ? formatISOString(this.formValue.sendEnd) : null,
            text: this.formValue.text,
            status: this.formValue.status ? [...this.formValue.status] : null,
            isOverPlan: this.formValue.isOverPlan?.id
          }
        }
        console.log('params', params)
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
              จำนวนสินค้า: item.productQty,
              รหัสลูกค้า: item.customerNumber,
              วันสร้างใบสินค้า: formatDate(item.createDate)
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
