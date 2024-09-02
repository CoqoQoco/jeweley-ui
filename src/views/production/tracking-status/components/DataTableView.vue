<template>
  <div>
    <loading :isLoading="isLoading"></loading>
    <DataTable
      :totalRecords="data.total"
      :value="data.data"
      v-model:expandedRows="expnadData"
      dataKey="id"
      ref="dt"
      class="p-datatable-sm"
      scrollable
      scrollHeight="calc(100vh - 340px)"
      resizableColumns
      :paginator="true"
      showGridlines
      :lazy="true"
      @page="handlePageChange"
      @sort="handlePageChangeSort"
      :rows="take"
      removableSort
      sortMode="multiple"
      :rowsPerPageOptions="[100, 200, 300]"
      paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
    >
      <Column field="receiveDate" header="วันที่ จ่ายงาน/รับงาน" sortable style="min-width: 150px">
        <template #body="slotProps">
          {{ formatDateTime(slotProps.data.receiveDate) }}
        </template>
      </Column>
      <Column field="jobDate" header="วันที่ช่างรับงาน" sortable style="min-width: 150px">
        <template #body="slotProps">
          {{ formatDateTime(slotProps.data.jobDate) }}
        </template>
      </Column>

      <Column field="wo" header="เลขที่ใบงาน" sortable style="min-width: 150px"> </Column>
      <Column field="woNumber" header="ลำดับ" sortable style="min-width: 50px"> </Column>
      <Column field="statusName" header="สถานะใบงาน" sortable style="min-width: 150px"> </Column>

      <Column field="typeStatusName" header="แผนก" sortable style="min-width: 150px"> </Column>
      <Column field="mold" header="เเม่พิมพ์" sortable style="min-width: 150px"> </Column>
      <Column field="productNumber" header="รหัสสินค้า" sortable style="min-width: 150px"> </Column>
      <Column field="productName" header="ชื่อสินค้า" sortable style="min-width: 150px"> </Column>
      <Column field="description" header="รายละเอียด" sortable style="min-width: 150px"> </Column>

      <Column field="gold" header="ประเภททอง" sortable style="min-width: 100px"> </Column>

      <Column field="goldQtySend" header="จำนวนรับ" sortable style="min-width: 100px">
        <template #body="slotProps">
          <div>
            <span>
              {{
                slotProps.data.goldQtySend
                  ? Number(slotProps.data.goldQtySend).toFixed(2).toLocaleString()
                  : '0.000'
              }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="goldWeightSend" header="นำหนักจ่าย" sortable style="min-width: 100px">
        <template #body="slotProps">
          <div>
            <span>
              {{
                slotProps.data.goldWeightSend
                  ? Number(slotProps.data.goldWeightSend).toFixed(2).toLocaleString()
                  : '0.000'
              }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="goldQtyCheck" header="จำนวนรับ" sortable style="min-width: 100px">
        <template #body="slotProps">
          <div>
            <span>
              {{
                slotProps.data.goldQtyCheck
                  ? Number(slotProps.data.goldQtyCheck).toFixed(2).toLocaleString()
                  : '0.000'
              }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="goldWeightCheck" header="นำหนักรับ" sortable style="min-width: 100px">
        <template #body="slotProps">
          <div>
            <span>
              {{
                slotProps.data.goldWeightCheck
                  ? Number(slotProps.data.goldWeightCheck).toFixed(2).toLocaleString()
                  : '0.000'
              }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="workerName" header="ช่าง" sortable style="min-width: 150px"> </Column>
    </DataTable>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Papa from 'papaparse'

import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-config.js'

export default {
  components: {
    loading,
    DataTable,
    Column
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    },
    modelMasterType: {
      type: Array,
      default: () => []
    },
    headerHeight: {
      type: Number,
      default: 0
    }
  },
  watch: {
    modelForm: {
      handler(val) {
        this.form = { ...val }
        this.fetchData()
      },
      deep: true
    },
    modelFormExport: {
      handler(val) {
        console.log('watch modelFormExport', val)
        this.export = { ...val }
        this.fetchDataExport()
      },
      deep: true
    },
    data: {
      handler(val) {
        console.log('watch data', val)
        val.data && val.data.length > 0 ? this.$emit('export', true) : this.$emit('export', false)
      },
      deep: true
    }
  },
  computed: {
    masterType() {
      return this.modelMasterType
    }
  },
  data() {
    return {
      isLoading: false,

      //--------- table ---------//
      totalRecords: 0,
      take: 100, //all
      skip: 0,
      //sortField: 'updateDate',
      //sortOrder: -1, // หรือ -1 สำหรับ descending
      sort: [],
      //sort: [],
      data: {},
      dataExcel: {},
      expnadData: [],
      form: { ...this.modelForm },
      export: null
    }
  },
  methods: {
    // ----------- table ----------- //
    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = e.multiSortMeta.map((item) => {
        return { field: item.field, dir: item.order === 1 ? 'asc' : 'desc' }
      })
      //console.log(e)
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

    // ----------- APIs ----------- //
    async fetchData() {
      try {
        this.isLoading = true

        console.log('fetchData', this.form)

        const params = {
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          search: {
            start: this.form.requestDateStart ? formatISOString(this.form.requestDateStart) : null,
            end: this.form.requestDateEnd ? formatISOString(this.form.requestDateEnd) : null,

            status: this.form.status.length > 0 ? this.form.status : null,
            gold: this.form.gold.length > 0 ? this.form.gold : null,

            woText: this.form.wo ?? null,
            productNumber: this.form.productNo ?? null
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('ProductionPlan/ListProductionPlanStatus', params)
        if (res) {
          this.data = { ...res }
          //this.$emit('export', true)
        } else {
          //this.$emit('export', true)
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },
    async fetchDataExport() {
      try {
        this.isLoading = true

        console.log('fetchDataExport', this.form)
        const params = {
          take: 0,
          skip: 0,
          sort: [],
          search: {
            start: this.form.requestDateStart ? formatISOString(this.form.requestDateStart) : null,
            end: this.form.requestDateEnd ? formatISOString(this.form.requestDateEnd) : null,

            status: this.form.status.length > 0 ? this.form.status : null,
            gold: this.form.gold.length > 0 ? this.form.gold : null,

            woText: this.form.wo ?? null,
            productNumber: this.form.productNo ?? null
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('ProductionPlan/ListProductionPlanStatus', params)
        if (res) {
          const dataExcel = res.data.map((item) => {
            return {
              'วันที่ จ่ายงาน/รับงาน': this.formatDateTime(item.receiveDate),
              วันที่ช่างรับงาน: this.formatDateTime(item.jobDate),
              เลขที่ใบงาน: item.wo,
              ลำดับ: item.woNumber,
              สถานะใบงานล่าสุด: item.statusName,
              แผนก: item.typeStatusName,
              เเม่พิมพ์: item.mold,
              รหัสสินค้า: item.productNumber,
              ชื่อสินค้า: item.productName,
              รายละเอียด: item.description,
              ประเภททอง: item.gold,
              จำนวนรับ: item.goldQtySend ? Number(item.goldQtySend).toFixed(2) : '0.000',
              นำหนักจ่าย: item.goldWeightSend ? Number(item.goldWeightSend).toFixed(2) : '0.000',
              จำนวนรับ: item.goldQtyCheck ? Number(item.goldQtyCheck).toFixed(2) : '0.000',
              นำหนักรับ: item.goldWeightCheck ? Number(item.goldWeightCheck).toFixed(2) : '0.000',
              ช่าง: item.workerName
            }
          })
          this.exportWithCustomColumnCSV(
            dataExcel,
            `ตรวจสอบสถานะงานผลิต[${this.formatDate(this.form.requestDateStart)} - ${this.formatDate(
              this.form.requestDateEnd
            )}].csv`
          )
        }
        this.isLoading = false
      } catch (error) {
        this.isLoading = false
        console.log(error)
      }
    },

    // -------- helper function -------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    stringToArray(str) {
      console.log('stringToArray', str)
      if (str && typeof str === 'string') {
        // ตัดช่องว่างหน้าและหลังสตริง
        str = str.trim()
        //console.log('stringToArray', str)

        // ถ้าไม่มีเครื่องหมายจุลภาค ให้คืนค่าเป็น array ที่มีสมาชิกเดียว
        if (!str.includes(',')) {
          return str ? [str] : []
        }

        // แยกด้วยเครื่องหมายจุลภาค, ตัดช่องว่าง, และกรองค่าว่างออก
        const res = str
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item !== '')
        return res
      } else {
        return []
      }
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
    getTypeName(type) {
      return this.masterType.find((item) => item.id === type)?.description
    },
    getIconQty(type) {
      switch (type) {
        case 1:
        case 2:
        case 3:
          return 'bi bi-arrow-down-square-fill text-success'
        case 4:
          return 'bi bi-arrow-up-square-fill text-danger'
        default:
          return ''
      }
    }

    // -------- event -------- //
  },
  created() {
    this.$nextTick(() => {
      this.fetchData()
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.box-image-show {
  display: flex;
  gap: 5px;
}
</style>
