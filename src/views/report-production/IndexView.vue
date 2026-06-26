<template>
  <div class="app-container">
    <div class="filter-container">
      <pageTitle
        title="รายงานผลิต"
        description="รายงานผลิต เเละรายละเอียดต่างๆ"
        :isShowBtnClose="false"
        isShowRightSlot
      >
      </pageTitle>
      <form @submit.prevent="onSubmit">
        <div class="search-bar-container">
          <div>
            <div>
              <span class="text-title">{{ $t('reportProduction.dateLabel') }}</span>
              <span class="text-required"> *</span>
            </div>
            <div class="flex-group">
              <CalendarGeneric
                class="w-100"
                v-model="form.start"
                :max-date="form.end"
                placeholder="เริ่มต้น"
                :customClass="val.isValDateStart === true ? 'p-invalid' : ''"
              />
              <div class="mx-2"><i class="bi bi-arrow-right"></i></div>
              <CalendarGeneric
                class="w-100"
                v-model="form.end"
                :min-date="form.start"
                placeholder="สิ้นสุด"
                :customClass="val.isValDateEnd === true ? 'p-invalid' : ''"
              />
            </div>
          </div>
          <div>
            <span class="text-title">{{ $t('reportProduction.woLabel') }}</span>
            <InputTextGeneric
              id="inputStockID"
              v-model="form.text"
              :trim="true"
              icon="bi-upc-scan"
            />
          </div>
          <div></div>
          <div class="btn-container">
            <button class="btn btn-sm btn-main mr-2" type="submit">
              <span><i class="bi bi-search"></i></span>
              <span class="ml-2">{{ $t('common.btn.search') }}</span>
            </button>
            <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear">
              <span><i class="bi bi-x-circle"></i></span>
              <span class="ml-2">{{ $t('common.btn.clear') }}</span>
            </button>
            <button
              class="btn btn-sm btn-green"
              type="button"
              :disabled="!isShowTable"
              @click="onExport($event)"
            >
              <span><i class="bi bi-filetype-csv"></i></span>
              <span class="ml-2">{{ $t('common.btn.export') }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
    <div v-if="isShowTable" class="mt-2">
      <!-- eslint-disable-next-line no-restricted-imports -->
      <DataTable
        :totalRecords="data.total"
        :value="data.data"
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
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="วันสร้างใบสินค้า" sortable field="createDate" style="min-width: 150px">
          <template #body="prop">
            {{ formatDate(prop.data.createDate) }}
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column field="wo" sortable header="W.O." style="min-width: 150px">
          <template #body="slotProps">
            {{ `${slotProps.data.wo}-${slotProps.data.woNumber}` }}
          </template>
        </Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="เเม่พิมพ์" sortable field="mold" style="min-width: 150px"></Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="รหัสสินค้า" field="productNumber" sortable style="min-width: 150px"></Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="ชื่อสินค้า" field="productName" sortable style="min-width: 150px"></Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="ประเภทสินค้า" field="productTypeName" sortable style="min-width: 150px"></Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="จำนวน" field="productQty" sortable style="min-width: 150px"></Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="หน่วย" field="productQtyUnit" sortable style="min-width: 150px"></Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="รหัสลูกค้า" field="customerNumber" sortable style="min-width: 150px"></Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="ชื่อลูกค้า" field="customerName" sortable style="min-width: 150px"></Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="ประเภทลูกค้า" field="customerTypeName" sortable style="min-width: 150px"></Column>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <Column header="วันส่งงานลูกค้า" field="requestDate" sortable style="min-width: 150px">
          <template #body="prop">
            {{ formatDate(prop.data.requestDate) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
// eslint-disable-next-line no-restricted-imports
import DataTable from 'primevue/datatable'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'
import Papa from 'papaparse'

import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-helper.js'

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
    CalendarGeneric,
    InputTextGeneric,
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
      isShowTable: false,

      totalRecords: 0,
      take: 10,
      skip: 0,
      sort: [],
      data: {},
      dataExcel: {},

      form: {
        ...interfaceForm
      },
      val: {
        ...interfaceIsValid
      }
    }
  },
  methods: {
    onClear() {
      this.form = { ...interfaceForm }
      this.val = { ...interfaceIsValid }
      this.isShowTable = false
      this.data = []
      this.dataExcel = []
      this.sort = []
    },

    handlePageChange(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = (e.multiSortMeta || []).map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchData()
    },
    handlePageChangeSort(e) {
      this.skip = e.first
      this.take = e.rows
      this.sort = (e.multiSortMeta || []).map((item) => ({
        field: item.field,
        dir: item.order === 1 ? 'asc' : 'desc'
      }))
      this.fetchData()
    },

    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },

    validateForm() {
      if (!this.form.start) {
        this.val = { isValDateStart: true }
        return false
      }
      if (!this.form.end) {
        this.val = { isValDateEnd: true }
        return false
      }
      return true
    },

    onSubmit() {
      if (this.validateForm()) {
        this.dataExcel = []
        this.fetchData()
      }
    },
    onExport() {
      if (this.validateForm()) {
        this.fetchExportData()
      }
    },
    exportWithCustomColumnCSV(data, filename) {
      const utf8BOM = '﻿'
      const csv = Papa.unparse(data, {
        quotes: false,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ',',
        header: true,
        newline: '\r\n',
        skipEmptyLines: false,
        columns: null
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

    async fetchData() {
      this.data = {}
      const param = {
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          createStart: this.form.start ? formatISOString(this.form.start) : null,
          createEnd: this.form.end ? formatISOString(this.form.end) : null,
          woText: this.form.text
        }
      }
      const res = await api.jewelry.post('ProductionPlan/ReportProductionPlan', param)
      if (res) {
        this.data = { ...res }
        this.isShowTable = true
      }
    },
    async fetchExportData() {
      const param = {
        take: 0,
        search: {
          createStart: this.form.start ? formatISOString(this.form.start) : null,
          createEnd: this.form.end ? formatISOString(this.form.end) : null,
          woText: this.form.text
        }
      }
      const res = await api.jewelry.post('ProductionPlan/ReportProductionPlan', param)
      if (res) {
        const dataExcel = res.data.map((item) => ({
          วันที่สร้างใบสินค้า: formatDate(item.createDate),
          'W.O.': `${item.wo}-${item.woNumber}`,
          เเม่พิมพ์: item.mold,
          รหัสสินค้า: item.productNumber,
          ชื่อสินค้า: item.productName,
          ประเภทสินค้า: item.productTypeName,
          จำนวน: item.productQty,
          หน่วย: item.productQtyUnit,
          รหัสลูกค้า: item.customerNumber,
          ชื่อลูกค้า: item.customerName,
          ประเภทลูกค้า: item.customerTypeName,
          วันส่งงานลูกค้า: formatDate(item.requestDate)
        }))
        this.exportWithCustomColumnCSV(
          dataExcel,
          `รายงานผลิต[${this.formatDate(this.form.start)} - ${this.formatDate(this.form.end)}].csv`
        )
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
