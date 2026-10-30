<template>
  <div>
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <!-- Action Column -->
      <template #actionsTemplate="{ data: rowData }">
        <div class="d-flex justify-content-center">
          <button class="btn btn-sm btn-main mr-2" :title="$t('view.stock.gem.priceHistory')" @click="onShowHistory(rowData)">
            <span class="bi bi-search"></span>
          </button>
          <button class="btn btn-sm btn-green mr-2" :title="$t('common.btn.edit')" @click="onShowUpdate(rowData)">
            <span class="bi bi-pencil"></span>
          </button>
          <button class="btn btn-sm btn-green mr-2" :title="$t('view.stock.gem.adjustPrice')" @click="onShowPrice(rowData)">
            <span class="bi bi-cash-coin"></span>
          </button>
          <button
            class="btn btn-sm btn-green mr-2"
            :title="$t('view.stock.gem.printLabel')"
            @click="onPrintBarcode(rowData)"
          >
            <i class="bi bi-upc-scan"></i>
          </button>
          <button
            class="btn btn-sm btn-green"
            :title="$t('view.stock.gem.printLabelPDF')"
            @click="onPrintBarcodePDF(rowData)"
          >
            <i class="bi bi-file-earmark-pdf"></i>
          </button>
        </div>
      </template>
    </BaseDataTable>

    <priceView :isShow="isShow.isPrice" :modelGem="price" @closeModal="closeModal"></priceView>

    <historyView
      :isShow="isShow.isHistory"
      :modelGem="history"
      @closeModal="closeModal"
    ></historyView>

    <updateView
      :isShow="isShow.update"
      :modelGem="updateGem"
      :masterGrade="masterGrade"
      :masterGemShape="masterGemShape"
      :modelGroupName="groupOptions"
      @closeModal="closeModal"
    ></updateView>

    <barcodePreviewModal
      :isShow="isShow.barcodePreview"
      :barcodeData="barcodePreviewData"
      @close="closeBarcodePreview"
      @confirm="onConfirmPrint"
    ></barcodePreviewModal>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import priceView from './price-view.vue'
import historyView from './history-view.vue'
import updateView from './update-view.vue'
import barcodePreviewModal from './barcode-preview-modal.vue'

import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import { usrStockGemApiStore } from '@/stores/modules/api/stock/gem-api.js'
import { gemBarcodeService } from '@/services/barcode/gem-barcode.js'
import { gemBarcodePdfService } from '@/services/helper/pdf/gem-barcode/gem-barcode-pdf-integration.js'
import { useLabelPrintJobApiStore } from '@/stores/modules/api/print/label-print-job-store.js'
import { getMaterialLabelPrintMode, MATERIAL_LABEL_MODES } from '@/services/api/barcode-printer-config.js'
import { success, warning, error } from '@/services/alert/sweetAlerts.js'

const isShowModal = {
  isPrice: false,
  isHistory: false,
  update: false,
  barcodePreview: false
}

export default {
  mixins: [dataTablePaging],

  components: {
    BaseDataTable,
    priceView,
    historyView,
    updateView,
    barcodePreviewModal
  },

  setup() {
    const stockGemSearchStore = usrStockGemApiStore()
    const labelPrintJobStore = useLabelPrintJobApiStore()
    return { stockGemSearchStore, labelPrintJobStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    masterGroupOptions: {
      type: Array,
      Required: true,
      default: () => []
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    },
    headerHeight: {
      type: Number,
      default: 0
    },
    masterGradeOptions: {
      type: Array,
      Required: true,
      default: () => []
    },
    masterShapeOptions: {
      type: Array,
      Required: true,
      default: () => []
    },
    masterSizeOptions: {
      type: Array,
      Required: true,
      default: () => []
    },
    masterGemShapeData: {
      type: Array,
      Required: true,
      default: () => []
    },
    masterGradeData: {
      type: Array,
      Required: true,
      default: () => []
    }
  },

  watch: {
    modelForm: {
      handler(newVal) {
        this.form = { ...newVal }
        this.resetPaging()
      },
      deep: true
    },
    modelFormExport: {
      handler() {
        this.fetchDataExport()
      },
      deep: true
    },
    data: {
      handler(newVal) {
        newVal.data && newVal.data.length > 0 ? this.$emit('export', true) : this.$emit('export', false)
      },
      deep: true
    }
  },

  computed: {
    //  ---------------- computed --------
    groupOptions() {
      return this.masterGroupOptions
    },
    shapeOptions() {
      return this.masterShapeOptions
    },
    sizeOptions() {
      return this.masterSizeOptions
    },
    gradeOptions() {
      return this.masterGradeOptions
    },
    masterGemShape() {
      return this.masterGemShapeData
    },
    masterGrade() {
      return this.masterGradeData
    },
    columns() {
      return [
        {
          field: 'actions',
          sortable: false,
          minWidth: '80px'
        },
        {
          field: 'code',
          header: this.$t('view.stock.gem.code'),
          sortable: true
        },
        {
          field: 'quantity',
          header: this.$t('view.stock.gem.stockQty'),
          sortable: true,
          format: 'number'
        },
        {
          field: 'quantityOnProcess',
          header: this.$t('view.stock.gem.borrowQty'),
          sortable: true,
          format: 'number'
        },
        {
          field: 'quantityWeight',
          header: this.$t('view.stock.gem.stockWeight'),
          sortable: true,
          format: 'decimal3'
        },
        {
          field: 'quantityWeightOnProcess',
          header: this.$t('view.stock.gem.borrowWeight'),
          sortable: true,
          format: 'decimal3'
        },
        {
          field: 'price',
          header: this.$t('view.stock.gem.pricePerWeight'),
          sortable: true,
          format: 'decimal3'
        },
        {
          field: 'priceQty',
          header: this.$t('view.stock.gem.pricePerQty'),
          sortable: true,
          format: 'decimal3'
        },
        {
          field: 'unitCode',
          header: this.$t('view.stock.gem.unit'),
          sortable: true
        },
        {
          field: 'unit',
          header: this.$t('view.stock.gem.unitCode'),
          sortable: true
        },
        {
          field: 'groupName',
          header: this.$t('view.stock.gem.groupName'),
          sortable: true
        },
        {
          field: 'size',
          header: this.$t('view.stock.gem.size'),
          sortable: true
        },
        {
          field: 'shape',
          header: this.$t('view.stock.gem.shape'),
          sortable: true
        },
        {
          field: 'grade',
          header: this.$t('view.stock.gem.grade'),
          sortable: true
        },
        {
          field: 'region',
          header: this.$t('view.stock.gem.origin'),
          sortable: true
        },
        {
          field: 'remark1',
          header: this.$t('common.field.remark') + '-1',
          sortable: true
        }
      ]
    }
  },

  data() {
    return {
      take: 100,
      isShow: { ...isShowModal },
      price: {},
      history: {},
      updateGem: {},
      barcodePreviewData: {},
      currentRowData: null,

      data: {},
      dataExcel: {},
      expnadData: [],
      form: null,
      export: null,

    }
  },

  methods: {
    // ----------- APIs ----------- //
    async fetchData() {
      const res = await this.stockGemSearchStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        form: this.form
      })

      this.data = { ...res }
    },
    async fetchDataExport() {
      await this.stockGemSearchStore.fetchDataSearchExport({
        sort: this.sort,
        form: this.form
      })
    },

    // -------- helper function -------- //
    formatDateTime(date) {
      return date ? formatDateTime(date) : ''
    },
    formatDate(date) {
      return formatDate(date)
    },
    stringToArray(str) {
      if (str && typeof str === 'string') {
        str = str.trim()

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

    // -------- event -------- //
    closeModal(event) {
      this.isShow = { ...isShowModal }
      if (event === 'fetch') {
        this.fetchData()
      }
    },
    onShowPrice(data) {
      this.price = {}
      this.price = { ...data }
      this.isShow.isPrice = true
    },
    onShowHistory(data) {
      this.history = {}
      this.history = { ...data }
      this.isShow.isHistory = true
    },
    onShowUpdate(data) {
      this.updateGem = {}
      this.updateGem = { ...data }
      this.isShow.update = true
    },
    onPrintBarcode(rowData) {

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!rowData.code) {
        warning(this.$t('view.stock.gem.warnCode'), this.$t('view.stock.gem.incomplete'))
        return
      }

      // เก็บข้อมูลสำหรับพิมพ์
      this.currentRowData = rowData

      // เตรียมข้อมูลสำหรับแสดง preview
      this.barcodePreviewData = {
        stockCode: `*${rowData.code}*`,
        barcode: rowData.code,
        description:
          `${rowData.groupName || ''} ${rowData.shape || ''} ${rowData.size || ''}`.trim() || 'N/A',
        date: formatDate(new Date()),
        goldType: rowData.grade || 'N/A'
      }

      // เปิด modal preview
      this.isShow.barcodePreview = true
    },

    closeBarcodePreview() {
      this.isShow.barcodePreview = false
      this.barcodePreviewData = {}
      this.currentRowData = null
    },

    async onConfirmPrint(copies) {
      if (getMaterialLabelPrintMode() === MATERIAL_LABEL_MODES.QUEUE) {
        await this.enqueueLabel(copies)
        return
      }
      const result = await gemBarcodeService
        .printBarcodes([this.barcodePreviewData], copies)
        .catch((err) => {
          error(err.message)
          return null
        })
      if (result?.success) {
        success(copies === 1 ? this.$t('view.stock.gem.printSuccess') : result.message)
        this.closeBarcodePreview()
      }
    },

    async enqueueLabel(copies) {
      const res = await this.labelPrintJobStore
        .fetchEnqueue({
          labelType: 'GEM',
          referenceCode: this.barcodePreviewData.barcode,
          payload: JSON.stringify(this.barcodePreviewData),
          copies
        })
        .catch(() => null)
      if (res?.id) {
        success(this.$t('view.stock.gem.queueEnqueued'))
        this.closeBarcodePreview()
      } else {
        error(this.$t('view.stock.gem.queueEnqueueFailed'))
      }
    },

    async onPrintBarcodePDF(rowData) {
      if (!rowData.code) {
        warning(this.$t('view.stock.gem.warnCode'), this.$t('view.stock.gem.incomplete'))
        return
      }

      let price = rowData.unit === 'Q' ? rowData.priceQty : rowData.price
      const displayPrice = `[${rowData.unit}] ${price ? Number(price).toFixed(2) : '0.00'}`

      // เตรียมข้อมูลสำหรับ PDF
      const barcodeData = {
        stockCode: `*${rowData.code}*`,
        barcode: rowData.code,
        description:
          `${rowData.groupName || ''} ${rowData.shape || ''} ${rowData.size || ''} ${rowData.grade || ''}`.trim() || 'N/A',
        date: formatDate(new Date()),
        goldType: rowData.grade || 'N/A',
        price: displayPrice
      }

      // สร้างและดาวน์โหลด PDF
      const result = await gemBarcodePdfService.generateGemBarcodePDF(barcodeData, {
        print: false,
        open: true
      })

      if (result.success) {
        //success('สร้าง PDF Barcode สำเร็จ')
      }
    }
  },

  created() {
    this.form = { ...this.modelForm }
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
