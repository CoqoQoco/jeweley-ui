<template>
  <div class="mt-2">
    <div class="filter-container">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="vertical-center-container">
          <span class="title-text-lg bi bi-clock-history mr-2"></span>
          <span class="title-text-lg">รายการตีราคาล่าสุด</span>
        </div>
        <button class="btn btn-sm btn-secondary" @click="onRefresh" title="รีเฟรช">
          <i class="bi bi-arrow-clockwise mr-1"></i>
          <span>รีเฟรช</span>
        </button>
      </div>

      <form @submit.prevent="onSearch" class="mb-2">
        <div class="form-col-sm-container">
          <div>
            <span class="title-text">เลขที่ผลิต</span>
            <input class="form-control bg-input" type="text"
              v-model.trim="searchForm.stockNumber" placeholder="ค้นหาเลขที่ผลิต" />
          </div>
          <div>
            <span class="title-text">ใบตีราคา</span>
            <input class="form-control bg-input" type="text"
              v-model.trim="searchForm.running" placeholder="ค้นหาใบตีราคา" />
          </div>
          <div>
            <span class="title-text">ผู้สร้าง</span>
            <input class="form-control bg-input" type="text"
              v-model.trim="searchForm.createBy" placeholder="ค้นหาผู้สร้าง" />
          </div>
          <div class="d-flex align-items-end gap-1">
            <button class="btn btn-sm btn-green" type="submit">
              <i class="bi bi-search mr-1"></i>ค้นหา
            </button>
            <button class="btn btn-sm btn-secondary" type="button" @click="onClearSearch">
              <i class="bi bi-x-circle mr-1"></i>ล้าง
            </button>
          </div>
        </div>
      </form>

      <BaseDataTable
        :items="data.data"
        :totalRecords="data.total"
        :columns="columns"
        :perPage="take"
        :scrollHeight="'calc(100vh - 450px)'"
        @page="handlePageChange"
        @sort="handleSortChange"
      >
        <template #actionTemplate="{ data }">
          <div class="vertical-center-container gap-1">
            <button
              class="btn btn-sm btn-secondary"
              @click="onViewDetail(data)"
              title="ดูรายละเอียด"
            >
              <i class="bi bi-eye"></i>
            </button>
            <button
              class="btn btn-sm btn-main"
              @click="onExportPDF(data)"
              title="Export PDF"
            >
              <i class="bi bi-file-pdf"></i>
            </button>
            <button
              class="btn btn-sm btn-green"
              @click="onDuplicate(data)"
              title="ตีราคาใหม่จากรายการนี้"
            >
              <i class="bi bi-clipboard-plus"></i>
            </button>
          </div>
        </template>

        <template #stockNumberTemplate="{ data }">
          <span class="stock-link">{{ data.stockNumber }}</span>
        </template>

        <template #createDateTemplate="{ data }">
          {{ formatDateTime(data.createDate) }}
        </template>

        <template #totalPriceTemplate="{ data }">
          <div class="text-right">
            {{ formatCurrency(getTotalPrice(data)) }}
          </div>
        </template>

        <template #currencyUnitTemplate="{ data }">
          {{ data.currencyUnit || '' }}
        </template>
      </BaseDataTable>
    </div>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { AppraisalHistoryPdfBuilder } from '@/services/helper/pdf/appraisal/appraisal-history-pdf-builder.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import { success, error, warning } from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

export default {
  name: 'CostVersionListView',

  components: {
    BaseDataTable
  },

  emits: ['view-detail', 'duplicate'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      take: 20,
      skip: 0,
      sort: [{ field: 'createDate', dir: 'desc' }],
      data: {},
      searchForm: {
        stockNumber: '',
        running: '',
        createBy: ''
      },

      columns: [
        {
          field: 'action',
          header: '',
          width: '170px',
          sortable: false
        },
        {
          field: 'stockNumber',
          header: 'เลขที่ผลิต',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'running',
          header: 'ใบตีราคา',
          sortable: true,
          width: '140px'
        },
        {
          field: 'createDate',
          header: 'วันที่',
          sortable: true,
          width: '140px'
        },
        {
          field: 'createBy',
          header: 'ผู้สร้าง',
          sortable: true,
          width: '120px'
        },
        {
          field: 'totalPrice',
          header: 'ราคารวม',
          sortable: false,
          width: '120px'
        },
        {
          field: 'currencyUnit',
          header: 'สกุลเงิน',
          sortable: false,
          width: '80px'
        }
      ]
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
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

    async fetchData() {
      const res = await this.productStore.fetchListCostVersion({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.searchForm
      })
      if (res) {
        this.data = { ...res }
      }
    },

    getTotalPrice(item) {
      if (!item.prictransection || !Array.isArray(item.prictransection)) return 0
      return item.prictransection.reduce((sum, t) => sum + (t.totalPrice || 0), 0)
    },

    onRefresh() {
      this.skip = 0
      this.fetchData()
    },

    onSearch() {
      this.skip = 0
      this.fetchData()
    },

    onClearSearch() {
      this.searchForm = { stockNumber: '', running: '', createBy: '' }
      this.skip = 0
      this.fetchData()
    },

    onDuplicate(version) {
      this.$emit('duplicate', version)
    },

    onViewDetail(version) {
      this.$emit('view-detail', version)
    },

    async onExportPDF(version) {
      const stockData = await this.productStore.fetchDataGet({
        formValue: { stockNumber: version.stockNumber }
      })

      if (!stockData) {
        warning('ไม่พบข้อมูลสินค้า')
        return
      }

      const pdfOptions = version.currencyUnit
        ? { currencyUnit: version.currencyUnit, currencyRate: version.currencyRate }
        : {}
      const pdfBuilder = new AppraisalHistoryPdfBuilder(stockData, version, pdfOptions)
      const pdf = await pdfBuilder.generatePDF()
      const filename = `Appraisal_${version.stockNumber}_${version.running}_${dayjs().format('YYYYMMDDHHmmss')}.pdf`
      pdf.download(filename)
      success('Export PDF สำเร็จ', 'สำเร็จ')
    },

    formatDateTime(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === '') return '-'
      return formatDecimal(Number(value), 2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.stock-link {
  color: var(--base-font-color);
  font-weight: 600;
  cursor: default;
}

.gap-1 {
  gap: 4px;
}
</style>
