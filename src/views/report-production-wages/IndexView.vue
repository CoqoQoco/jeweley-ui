<template>
  <div class="app-container">
    <div class="filter-container-searchBar">
      <form @submit.prevent="onSubmit">
        <div>
          <div>
            <pageTitle
              title="รายงานช่าง"
              description="รายงานช่าง เเละรายละเอียดต่างๆ"
              :isShowBtnClose="false"
              isShowRightSlot
            >
            </pageTitle>
          </div>
          <div class="form-col-container">
            <div>
              <span class="title-text">{{ $t('reportProduction.wages.dateLabel') }}</span>
              <span class="text-required"> *</span>
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
            <div class="form-col-container">
              <div>
                <span class="title-text">W.O.</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.woText"
                  placeholder="หมายเลขใบงาน....."
                />
              </div>
              <div>
                <span class="title-text">{{ $t('reportProduction.wages.productCode') }}</span>
                <input
                  :class="['form-control bg-input']"
                  type="text"
                  v-model.trim="form.productNumber"
                  placeholder="รหัสสินค้า"
                />
              </div>
            </div>
          </div>

          <div class="form-col-container mt-2">
            <div>
              <span class="title-text">{{ $t('reportProduction.wages.goldType') }}</span>
              <MultiSelectGeneric
                v-model="form.gold"
                :options="gold"
                optionLabel="nameTh"
                optionValue="code"
                :placeholder="$t('reportProduction.wages.selectGoldType')"
              />
            </div>
            <div>
              <span class="title-text">{{ $t('reportProduction.wages.goldColor') }}</span>
              <MultiSelectGeneric
                v-model="form.goldSize"
                :options="goldSize"
                optionLabel="nameTh"
                optionValue="nameTh"
                :placeholder="$t('reportProduction.wages.selectGoldColor')"
              />
            </div>
            <div>
              <span class="title-text">{{ $t('reportProduction.wages.department') }}</span>
              <MultiSelectGeneric
                v-model="form.status"
                :options="planStatus"
                optionLabel="nameTh"
                optionValue="id"
                :placeholder="$t('reportProduction.wages.selectDepartment')"
              />
            </div>
            <div>
              <span class="title-text">{{ $t('reportProduction.wages.worker') }}</span>
              <AutoCompleteGeneric
                v-model="form.worker"
                apiEndpoint="Worker/Search"
                searchField="text"
                :additionalSearchParams="{ type: null, active: 1 }"
                optionLabel="nameTh"
                :forceSelection="true"
                :placeholder="$t('reportProduction.wages.searchWorker')"
              />
            </div>
            <div>
              <span class="title-text">{{ $t('reportProduction.wages.mold') }}</span>
              <input
                :class="['form-control bg-input']"
                type="text"
                v-model.trim="form.mold"
                placeholder="แม่พิม"
              />
            </div>
          </div>

          <div class="btn-submit-container-between mt-2">
            <div></div>
            <div>
              <button class="btn btn-sm btn-main mr-2" type="submit" :title="$t('common.btn.search')">
                <span><i class="bi bi-search"></i></span>
              </button>
              <button class="btn btn-sm btn-dark mr-2" type="button" @click="onClear" :title="$t('common.btn.clear')">
                <span><i class="bi bi-x-circle"></i></span>
              </button>
              <button
                class="btn btn-sm btn-green"
                type="button"
                :disabled="!isShowTable"
                @click="onExport($event)"
                :title="$t('common.btn.export')"
              >
                <span><i class="bi bi-filetype-csv"></i></span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div v-if="isShowTable" class="mt-2">
      <BaseDataTable
        :items="data.data"
        :totalRecords="data.total"
        :columns="columns"
        :perPage="take"
        :paginator="true"
        dataKey="id"
        @page="handlePageChange"
        @sort="handleSortChange"
        :scrollHeight="'calc(100vh - 460px)'"
      >
        <template #woTemplate="slotProps">
          {{ `${slotProps.data.wo}${slotProps.data.woNumber}` }}
        </template>
        <template #workerCodeTemplate="slotProps">
          {{ `${slotProps.data.workerCode}-${slotProps.data.workerName}` }}
        </template>
        <template #goldTemplate="slotProps">
          {{
            `${slotProps.data.gold} ${
              slotProps.data.description ? `[${slotProps.data.description}]` : ``
            }`
          }}
        </template>

        <template #footer>
          <div class="summary-footer">
            <span><strong>{{ $t('reportProduction.wages.totalAll') }}</strong></span>
            <span>{{ $t('reportProduction.wages.qtySend') }}: <strong>{{ summery.totalGoldQtySend || 0 }}</strong></span>
            <span>{{ $t('reportProduction.wages.weightSend') }}: <strong>{{ summery.totalGoldWeightSend || 0 }}</strong></span>
            <span>{{ $t('reportProduction.wages.qtyCheck') }}: <strong>{{ summery.totalGoldQtyCheck || 0 }}</strong></span>
            <span>{{ $t('reportProduction.wages.weightCheck') }}: <strong>{{ summery.totalGoldWeightCheck || 0 }}</strong></span>
            <span>{{ $t('reportProduction.wages.price') }}: <strong>{{ formatDecimal2(summery.totalWages) }}</strong></span>
          </div>
        </template>
      </BaseDataTable>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))

import CalendarGeneric from '@/components/prime-vue/CalendarGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import Papa from 'papaparse'

import dataTablePaging from '@/composables/useDataTablePaging.js'
import { mapState } from 'pinia'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { formatDate, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-helper.js'

const interfaceForm = {
  woText: null,
  start: null,
  end: null,
  gold: [],
  goldSize: [],
  status: [],
  worker: null,
  productNumber: null,
  mold: null
}
const interfaceIsValid = {
  isValDateStart: false,
  isValDateEnd: false
}
export default {
  mixins: [dataTablePaging],

  components: {
    pageTitle,
    CalendarGeneric,
    BaseDataTable,
    MultiSelectGeneric,
    AutoCompleteGeneric
  },
  computed: {
    ...mapState(useMasterApiStore, ['gold', 'goldSize', 'planStatus']),
    columns() {
      return [
        { field: 'wo', header: this.$t('reportProduction.wages.colWo'), minWidth: '150px' },
        { field: 'jobDate', header: this.$t('reportProduction.wages.colJobDate'), minWidth: '150px', format: 'date' },
        { field: 'productNumber', header: this.$t('reportProduction.wages.colProductNumber'), minWidth: '150px' },
        { field: 'workerCode', header: this.$t('reportProduction.wages.colWorker'), minWidth: '150px' },
        { field: 'statusName', header: this.$t('reportProduction.wages.colDepartment'), minWidth: '150px' },
        { field: 'gold', header: this.$t('reportProduction.wages.colGoldDetail'), minWidth: '150px' },
        { field: 'goldSize', header: this.$t('reportProduction.wages.colGoldColor'), minWidth: '120px' },
        { field: 'goldQtySend', header: this.$t('reportProduction.wages.colQtySend'), minWidth: '120px', align: 'right' },
        { field: 'goldWeightSend', header: this.$t('reportProduction.wages.colWeightSend'), minWidth: '120px', align: 'right' },
        { field: 'goldQtyCheck', header: this.$t('reportProduction.wages.colQtyCheck'), minWidth: '120px', align: 'right' },
        { field: 'goldWeightCheck', header: this.$t('reportProduction.wages.colWeightCheck'), minWidth: '120px', align: 'right' },
        { field: 'wages', header: this.$t('reportProduction.wages.colWagesUnit'), minWidth: '120px', format: 'decimal2', align: 'right' },
        { field: 'totalWages', header: this.$t('reportProduction.wages.colTotalWages'), minWidth: '120px', format: 'decimal2', align: 'right' }
      ]
    }
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
  async created() {
    const masterStore = useMasterApiStore()
    await Promise.all([
      masterStore.fetchGold(),
      masterStore.fetchGoldSize(),
      masterStore.fetchPlanStatus()
    ])
  },
  data() {
    return {
      isShowTable: false,

      data: {},
      summery: {},
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

    formatDate(date) {
      return formatDate(date)
    },
    formatDecimal2(val) {
      return Number(val || 0).toFixed(2).toLocaleString()
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
        this.resetPaging()
      }
    },
    onExport() {
      if (this.validateForm()) {
        this.fetchExportData()
      }
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
          woText: this.form.woText,
          gold: this.form.gold,
          goldSize: this.form.goldSize,
          status: this.form.status,
          workerCode: this.form.worker?.code || null,
          productNumber: this.form.productNumber,
          mold: this.form.mold
        }
      }
      const res = await api.jewelry.post('Worker/ReportWorkerWages', param)
      const summery = await api.jewelry.post('Worker/ReportWorkerSummeryReportWages', param)
      if (res) {
        this.data = { ...res }
        this.isShowTable = true
        this.summery = { ...summery }
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

    async fetchExportData() {
      const param = {
        take: 0,
        search: {
          createStart: this.form.start ? formatISOString(this.form.start) : null,
          createEnd: this.form.end ? formatISOString(this.form.end) : null,
          woText: this.form.woText,
          gold: this.form.gold,
          goldSize: this.form.goldSize,
          status: this.form.status,
          workerCode: this.form.worker?.code || null,
          productNumber: this.form.productNumber,
          mold: this.form.mold
        }
      }
      const res = await api.jewelry.post('Worker/ReportWorkerWages', param)
      if (res) {
        const dataExcel = res.data.map((item) => ({
          เลขที่ใบงาน: `${item.wo}-${item.woNumber}`,
          วันที่ส่งงาน: formatDate(item.jobDate),
          รหัสสินค้า: item.productNumber,
          ช่าง: `${item.workerCode}-${item.workerName}`,
          แผนกงาน: item.statusName,
          รายละเอียด: `${item.gold} ${item.description ? `[${item.description}]` : ``}`,
          สีทอง: item.goldSize,
          จำนวนจ่าย: item.goldQtySend,
          น้ำหนักจ่าย: item.goldWeightSend,
          จำนวนรับ: item.goldQtyCheck,
          น้ำหนักรับ: item.goldWeightCheck,
          ราคาต่อหน่วย: this.formatDecimal2(item.wages),
          ราคา: this.formatDecimal2(item.totalWages)
        }))
        this.exportWithCustomColumnCSV(
          dataExcel,
          `รายงานผลิต[${formatDate(this.form.start)} - ${formatDate(this.form.end)}].csv`
        )
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
.summary-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: var(--sp-sm) var(--sp-md);
  font-size: var(--fs-base);
  background: var(--color-highlight-bg);
  border-top: 1px solid var(--color-border);
}
</style>
