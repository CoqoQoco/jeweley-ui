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
      scrollHeight="calc(100vh - 280px)"
      resizableColumns
      showGridlines
      :paginator="true"
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
      <column style="width: 80px">
        <template #body="slotProps">
          <div class="d-flex justify-content-center">
            <button
              class="btn btn-sm btn-main mr-2"
              title="ประวัติ"
              @click="onShowHistory(slotProps.data)"
            >
              <span class="bi bi-search"></span>
            </button>
            <button class="btn btn-sm btn-green" title="ราคา" @click="onShowPrice(slotProps.data)">
              <span class="bi bi-cash-coin"></span>
            </button>
          </div>
        </template>
      </column>
      <!-- <Column field="name" header="พลอย/เพชร" style="min-width: 150px"> </Column> -->
      <Column field="code" header="รหัส" sortable style="min-width: 150px"> </Column>
      <Column field="groupName" header="หมวดหมู่" sortable style="min-width: 150px"> </Column>
      <Column field="size" header="ขนาด" sortable style="min-width: 150px"> </Column>
      <Column field="shape" header="รูปร่าง" sortable style="min-width: 150px"> </Column>
      <Column field="grade" header="เกรด" sortable style="min-width: 150px"> </Column>
      <Column field="quantity" sortable header="จำนวนคงคลัง" style="min-width: 150px">
        <template #body="slotProps">
          {{
            slotProps.data.quantity
              ? Number(slotProps.data.quantity).toFixed(3).toLocaleString()
              : '0.000'
          }}
        </template>
      </Column>
      <Column field="quantityOnProcess" sortable header="จำนวนยืมคลัง" style="min-width: 150px">
        <template #body="slotProps">
          {{
            slotProps.data.quantityOnProcess
              ? Number(slotProps.data.quantityOnProcess).toFixed(3).toLocaleString()
              : '0.000'
          }}
        </template>
      </Column>
      <Column field="quantityWeight" sortable header="น้ำหนักคงคลัง" style="min-width: 150px">
        <template #body="slotProps">
          {{
            slotProps.data.quantityWeight
              ? Number(slotProps.data.quantityWeight).toFixed(3).toLocaleString()
              : '0.000'
          }}
        </template>
      </Column>
      <Column
        field="quantityWeightOnProcess"
        sortable
        header="น้ำหนักยืมคลัง"
        style="min-width: 150px"
      >
        <template #body="slotProps">
          {{
            slotProps.data.quantityWeightOnProcess
              ? Number(slotProps.data.quantityWeightOnProcess).toFixed(3).toLocaleString()
              : '0.000'
          }}
        </template>
      </Column>
      <Column field="price" header="ราคาต่อนำหนัก" sortable style="min-width: 150px">
        <template #body="slotProps">
          {{
            slotProps.data.price ? Number(slotProps.data.price).toFixed(3).toLocaleString() : '0.00'
          }}
        </template>
      </Column>
      <Column field="priceQty" header="ราคาต่อจำนวน" sortable style="min-width: 150px">
        <template #body="slotProps">
          {{
            slotProps.data.priceQty
              ? Number(slotProps.data.priceQty).toFixed(3).toLocaleString()
              : '0.00'
          }}
        </template>
      </Column>
      <Column field="unitCode" header="หน่วย" sortable style="min-width: 150px"> </Column>
      <Column field="unit" header="รหัสหน่วย" sortable style="min-width: 150px"> </Column>
      <Column field="remark1" header="หมายเหตุ-1" sortable style="min-width: 150px"> </Column>
      <!-- <Column field="remark2" header="หมายเหตุ-2" sortable style="min-width: 150px"> </Column> -->
    </DataTable>

    <priceView :isShow="isShow.isPrice" :modelGem="price" @closeModal="closeModal"></priceView>
    <historyView
      :isShow="isShow.isHistory"
      :modelGem="history"
      @closeModal="closeModal"
    ></historyView>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Papa from 'papaparse'

import priceView from './PriceView.vue'
import historyView from './HistoryView.vue'

import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-config.js'

const isShowModal = {
  isPrice: false,
  isHistory: false
}

export default {
  components: {
    loading,
    DataTable,
    Column,
    priceView,
    historyView
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
    //  ---------------- computed --------
    headerHeightPx() {
      console.log('headerHeightPx', this.headerHeight)
      return `${this.headerHeight}px`
    }
  },
  data() {
    return {
      isLoading: false,
      isShow: { ...isShowModal },
      price: {},
      history: {},

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
      form: null,
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

        const params = {
          take: this.take,
          skip: this.skip,
          sort: this.sort,
          search: {
            code: this.form.code ?? null,
            groupName: this.form.groupName ?? null,
            grade: this.form.grade ?? null,
            shape: this.form.shape ?? null,
            size: this.form.size ?? null
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/SearchData', params)
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
            code: this.form.code ?? null,
            groupName: this.form.groupName ?? null,
            grade: this.form.grade ?? null,
            shape: this.form.shape ?? null,
            size: this.form.size ?? null
          }
        }
        console.log('params', params)
        const res = await api.jewelry.post('StockGem/SearchData', params)
        if (res) {
          const dataExcel = res.data.map((item) => {
            return {
              รหัส: item.code,
              หมวดหมู่: item.groupName,
              ขนาด: item.size,
              รูปร่าง: item.shape,
              เกรด: item.grade,
              จำนวน: item.quantity ? Number(item.quantity).toFixed(3).toLocaleString() : '0.000',
              ราคา: item.price ? Number(item.price).toFixed(2).toLocaleString() : '0.00',
              ราคาต่อหน่วย: item.priceQty
                ? Number(item.priceQty).toFixed(2).toLocaleString()
                : '0.00',
              หน่วย: item.unit,
              รหัสหน่วย: item.unitCode,
              หมายเหตุ: item.remark1
            }
          })
          this.exportWithCustomColumnCSV(
            dataExcel,
            `เอกสารตรวจคลัง[${this.formatDateTime(new Date())}].csv`
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

    // -------- event -------- //
    closeModal(event) {
      this.isShow = { ...isShowModal }
      //this.price = null
      if (event === 'fetch') {
        this.fetchData()
      }
    },
    onShowPrice(data) {
      console.log('onShowPrice', data)
      this.price = {}
      this.price = { ...data }
      this.isShow.isPrice = true
    },
    onShowHistory(data) {
      console.log('onShowHistory', data)
      this.history = {}
      this.history = { ...data }
      this.isShow.isHistory = true
    }
  },
  created() {
    console.log('created', this.modelForm)
    this.form = { ...this.modelForm }
    this.$nextTick(() => {
      //this.fetchData()
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
