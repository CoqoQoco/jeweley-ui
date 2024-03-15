<template>
  <div class="app-container">
    <loading :isLoading="isLoading"> </loading>
    <div class="filter-container">
      <pageTitle
        title="รายงานค่าเเรง"
        description="รายงานค่าเเรง เเละรายละเอียดต่างๆ"
        :isShowBtnClose="false"
        isShowRightSlot
      >
      </pageTitle>
      <form @submit.prevent="onSubmit">
        <div class="search-bar-container">
          <div>
            <div>
              <span class="text-title">วันที่สร้างใบจ่าย-รับคืน</span>
              <span class="text-required"> *</span>
              <span></span>
            </div>
            <div class="flex-group">
              <Calendar
                class="w-100"
                v-model="form.start"
                :max-date="form.end"
                showIcon
                placeholder="เริ่มต้น"
                :class="val.isValDateStart === true ? `p-invalid` : ``"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <Calendar
                class="w-100"
                v-model="form.end"
                :min-date="form.start"
                showIcon
                placeholder="สิ้นสุด"
                :class="val.isValDateEnd === true ? `p-invalid` : ``"
              />
            </div>
          </div>
          <!-- <div>
            <span class="text-title">หมายเลขใบผสมทอง</span>
            <div class="input-group input-group-inner">
              <input
                id="inputStockID"
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.text"
              />
              <div class="input-group-append">
                <span class="input-group-text">
                  <i class="bi bi-upc-scan text-main-color"></i>
                </span>
              </div>
            </div>
          </div> -->
          <div>
            <span class="text-title">คำค้นหา</span>
            <div class="input-group input-group-inner">
              <input
                id="inputStockID"
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.text"
                placeholder="ชื่อช่าง, รหัสช่าง, หมายเลขใบงาน ....."
              />
              <!-- <div class="input-group-append">
                <span class="input-group-text">
                  <i class="bi bi-upc-scan text-main-color"></i>
                </span>
              </div> -->
            </div>
          </div>
          <div></div>
          <div class="btn-container">
            <button class="btn btn-sm btn-main mr-2" type="submit">
              <span><i class="bi bi-search"></i></span>
              <span class="ml-2">ค้นหา</span>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear">
              <span><i class="bi bi-x-circle"></i></span>
              <span class="ml-2">ล้างค้นหา</span>
            </button>
            <button
              class="btn btn-sm btn-primary"
              type="button"
              :disabled="!isShowTable"
              @click="onExport($event)"
            >
              <span><i class="bi bi-filetype-csv"></i></span>
              <span class="ml-2">ออกเอกสาร</span>
            </button>
          </div>
        </div>
      </form>
    </div>
    <div v-if="isShowTable" class="mt-2">
      <DataTable
        :totalRecords="data.total"
        :value="data.data"
        v-model:expandedRows="expnadData"
        dataKey="id"
        ref="dt"
        class="p-datatable-sm"
        scrollable
        scrollHeight="calc(100vh - 310px)"
        resizableColumns
        showGridlines
        :paginator="true"
        :lazy="true"
        @page="handlePageChange"
        @sort="handlePageChangeSort"
        :rows="take"
        removableSort
        sortMode="multiple"
        :rowsPerPageOptions="[10, 20, 50, 100]"
        paginatorTemplate="FirstPageLink PrevPageLink  CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        :currentPageReportTemplate="`เเสดงข้อมูล {first} - {last} จากทั้งหมด {totalRecords} รายการ`"
      >
        <Column field="wo" header="เลขที่ใบงาน" sortable style="min-width: 150px">
          <template #body="slotProps">
            {{ `${slotProps.data.wo}-${slotProps.data.woNumber}` }}
          </template>
        </Column>
        <Column header="วันที่ส่งงาน" sortable field="jobDate" style="min-width: 150px">
          <template #body="prop">
            {{ formatDate(prop.data.jobDate) }}
          </template>
        </Column>
        <Column
          header="รหัสสินค้า"
          sortable
          field="productNumber"
          style="min-width: 150px"
        ></Column>
        <Column header="ช่าง" sortable field="workerCode" style="min-width: 150px">
          <template #body="slotProps">
            {{ `${slotProps.data.workerCode}-${slotProps.data.workerName}` }}
          </template>
        </Column>
        <Column header="เเผนกงาน" sortable field="statusName" style="min-width: 150px"></Column>
        <Column header="รายละเอียด" sortable field="desc" style="min-width: 150px">
          <template #body="slotProps">
            {{
              `${slotProps.data.gold} ${
                slotProps.data.description ? `[${slotProps.data.description}]` : ``
              }`
            }}
          </template>
        </Column>
        <Column header="จำนวนจ่าย" sortable field="goldQtySend" style="min-width: 150px"></Column>
        <Column
          header="น้ำหนักจ่าย"
          sortable
          field="goldWeightSend"
          style="min-width: 150px"
        ></Column>
        <Column header="จำนวนรับ" sortable field="goldQtyCheck" style="min-width: 150px"></Column>
        <Column
          header="น้ำหนักรับ"
          sortable
          field="goldWeightCheck"
          style="min-width: 150px"
        ></Column>
        <Column header="ราคาต่อหน่วย" sortable field="wages" style="min-width: 150px">
          <template #body="slotProps">
            <div>
              {{
                `${
                  slotProps.data.wages
                    ? Number(slotProps.data.wages).toFixed(2).toLocaleString()
                    : Number(0).toFixed(2).toLocaleString()
                }`
              }}
            </div>
          </template>
        </Column>
        <Column header="ราคา" sortable field="totalWages" style="min-width: 150px">
          <template #body="slotProps">
            <div>
              {{
                `${
                  slotProps.data.totalWages
                    ? Number(slotProps.data.totalWages).toFixed(2).toLocaleString()
                    : Number(0).toFixed(2).toLocaleString()
                }`
              }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Papa from 'papaparse'

import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-config.js'

const interfaceForm = {
  text: null,
  start: null,
  end: null
}
const interfaceIsValid = {
  isValDateStart: false,
  isValDateEnd: false
}
export default {
  components: {
    pageTitle,
    loading,
    Calendar,
    DataTable,
    Column
  },
  watch: {
    'form.start'() {
      if (this.form.start) {
        this.val.isValDateStart = false
      }
    },
    'form.end'() {
      if (this.form.end) {
        this.val.isValDateEnd = false
      }
    }
  },
  data() {
    return {
      isLoading: false,
      isShowTable: false,
      isShowExcel: false,

      //--------- table ---------//
      totalRecords: 0,
      take: 10, //all
      skip: 0,
      //sort: [{ field: 'id', dir: 'asc' }],
      sort: [],
      data: {},
      dataExcel: {},
      expnadData: [],

      // ----- form -----//
      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      }
    }
  },
  methods: {
    focusInputText() {
      this.$refs.inputText.focus()
    },
    onClear() {
      this.form = { ...interfaceForm }
      this.val = { ...interfaceIsValid }
      this.isShowTable = false
      this.data = []
      this.dataExcel = []
      this.sort = []
    },

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
      //console.log(e.multiSortMeta)
      this.fetchData()
    },

    // -------- helper function -------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    // ----- validate ----- //
    validateForm() {
      if (!this.form.start) {
        this.val = {
          isValDateStart: true
        }
        return false
      }
      if (!this.form.end) {
        this.val = {
          isValDateEnd: true
        }
        return false
      }

      return true
    },

    // ----- submit ----- //
    onSubmit() {
      if (this.validateForm()) {
        console.log('form', this.form)
        this.dataExcel = []
        this.fetchData()
      }
    },
    onExport() {
      if (this.validateForm()) {
        console.log('form', this.form)
        this.fetchExportData()
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
    //create excel file with set width column 150px

    // --------- APIs --------- //
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
            createStart: this.form.start ? formatISOString(this.form.start) : null,
            createEnd: this.form.end ? formatISOString(this.form.end) : null,
            text: this.form.text
          }
        }
        const res = await api.jewelry.post('Worker/ReportWorkerWages', param)
        if (res) {
          this.data = { ...res }
          this.isShowTable = true
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    },
    async fetchExportData() {
      try {
        this.isLoading = true
        //console.log(this.formValue)
        const param = {
          take: 0,
          //skip: this.skip,
          search: {
            createStart: this.form.start ? formatISOString(this.form.start) : null,
            createEnd: this.form.end ? formatISOString(this.form.end) : null,
            Text: this.form.text
          }
        }
        const res = await api.jewelry.post('Worker/ReportWorkerWages', param)
        if (res) {
          //this.dataExcel = { ...res }
          //this.isShowTable = true
          console.log('res', res)

          const dataExcel = res.data.map((item) => {
            return {
              เลขที่ใบงาน: `${item.wo}-${item.woNumber}`,
              วันที่ส่งงาน: formatDate(item.jobDate),
              รหัสสินค้า: item.productNumber,
              ช่าง: `${item.workerCode}-${item.workerName}`,
              เเผนกงาน: item.statusName,
              รายละเอียด: `${item.gold} ${item.description ? `[${item.description}]` : ``}`,
              จำนวนจ่าย: item.goldQtySend,
              น้ำหนักจ่าย: item.goldWeightSend,
              จำนวนรับ: item.goldQtyCheck,
              น้ำหนกรับ: item.goldWeightCheck,
              ราคาต่อหน่วย: item.wages
                ? Number(item.wages).toFixed(2).toLocaleString()
                : Number(0).toFixed(2).toLocaleString(),
              ราคา: item.totalWages
                ? Number(item.totalWages).toFixed(2).toLocaleString()
                : Number(0).toFixed(2).toLocaleString()
            }
          })
          this.exportWithCustomColumnCSV(
            dataExcel,
            `รายงานผลิต[${this.formatDate(this.form.start)} - ${this.formatDate(
              this.form.end
            )}].csv`
          )
        }
        this.isLoading = false
      } catch (error) {
        console.log(error)
        this.isLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';
@import '@/assets/scss/custom-style/table-data.scss';
.search-bar-container {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
