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
      scrollHeight="calc(100vh - 400px)"
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
      <Column field="requestDate" header="วันทำรายการ" sortable style="min-width: 200px">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.requestDate) }}
        </template>
      </Column>
      <Column field="running" header="เลขที่รายการ" sortable style="min-width: 200px"> </Column>
      <Column field="type" header="ประเภท" sortable style="min-width: 200px">
        <template #body="slotProps">
          {{ getTypeName(slotProps.data.type) }}
        </template>
      </Column>

      <Column field="name" header="พลอย/เพชร" style="min-width: 200px"> </Column>
      <Column field="qty" header="จำนวน" sortable style="min-width: 200px">
        <template #body="slotProps">
          <div>
            <span><i class="mr-1" :class="getIconQty(slotProps.data.type)"></i></span>
            <span>
              {{
                slotProps.data.qty
                  ? Number(slotProps.data.qty).toFixed(3).toLocaleString()
                  : '0.000'
              }}
            </span>
          </div>
        </template>
      </Column>
      <Column field="jobOrPo" header="JOB/PO No." style="min-width: 200px"> </Column>
      <Column field="subpplierName" header="ร้านผลิต/ชื่อร้าน" style="min-width: 200px"> </Column>
      <Column field="supplierCost" header="ราคาทุน" style="min-width: 200px">
        <template #body="slotProps">
          <div>
            <span>
              {{
                slotProps.data.supplierCost
                  ? Number(slotProps.data.supplierCost).toFixed(2).toLocaleString()
                  : '0.000'
              }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="code" header="รหัส" sortable style="min-width: 200px"> </Column>
      <Column field="groupName" header="หมวดหมู่" sortable style="min-width: 200px"> </Column>
      <Column field="size" header="ขนาด" sortable style="min-width: 200px"> </Column>
      <Column field="shape" header="รูปร่าง" sortable style="min-width: 200px"> </Column>
      <Column field="grade" header="เกรด" sortable style="min-width: 200px"> </Column>

      <Column field="remark1" header="หมายเหตุ-1" sortable style="min-width: 200px"> </Column>
      <Column field="remark2" header="หมายเหตุ-2" sortable style="min-width: 200px"> </Column>
      <!-- <Column field="remark2" header="หมายเหตุ-2" sortable style="min-width: 200px"> </Column> -->
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
            requestDateStart: this.form.requestDateStart
              ? formatISOString(this.form.requestDateStart)
              : null,
            requestDateEnd: this.form.requestDateEnd
              ? formatISOString(this.form.requestDateEnd)
              : null,
            type: this.form.type.length > 0 ? this.form.type : null,

            code: this.form.code ?? null,
            groupName: this.form.groupName ?? null,
            grade: this.form.grade ?? null,
            shape: this.form.shape ?? null,
            size: this.form.size ?? null,
            status: 'completed'
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListTransection', params)
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
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          search: {
            requestDateStart: this.form.requestDateStart
              ? formatISOString(this.form.requestDateStart)
              : null,
            requestDateEnd: this.form.requestDateEnd
              ? formatISOString(this.form.requestDateEnd)
              : null,
            type: this.form.type.length > 0 ? this.form.type : null,

            code: this.form.code ?? null,
            groupName: this.form.groupName ?? null,
            grade: this.form.grade ?? null,
            shape: this.form.shape ?? null,
            size: this.form.size ?? null,
            status: 'completed'
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListTransection', params)
        if (res) {
          const dataExcel = res.data.map((item) => {
            return {
              วันทำรายการ: formatDate(item.requestDate),
              เลขที่รายการ: item.running,
              ประเภท: this.getTypeName(item.type),
              'พลอย/เพชร': item.name,
              จำนวน: item.qty,
              'JOB/PO No.': item.jobOrPo,
              'ร้านผลิต/ชื่อร้าน': item.subpplierName,
              ราคาทุน: item.supplierCost,
              รหัส: item.code,
              หมวดหมู่: item.groupName,
              ขนาด: item.size,
              รูปร่าง: item.shape,
              เกรด: item.grade,
              'หมายเหตุ-1': item.remark1,
              'หมายเหตุ-2': item.remark2
            }
          })
          this.exportWithCustomColumnCSV(
            dataExcel,
            `รายการเคลื่อนไหวเพชรเเละพลอย[${this.formatDate(
              this.form.requestDateStart
            )} - ${this.formatDate(this.form.requestDateEnd)}].csv`
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
