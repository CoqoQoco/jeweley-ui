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
          <button class="btn btn-sm btn-main mr-2" title="ประวัติ" @click="onShowHistory(rowData)">
            <span class="bi bi-search"></span>
          </button>
          <button class="btn btn-sm btn-green mr-2" title="เเก้ไข" @click="onShowUpdate(rowData)">
            <span class="bi bi-pencil"></span>
          </button>
          <button class="btn btn-sm btn-green mr-2" title="ราคา" @click="onShowPrice(rowData)">
            <span class="bi bi-cash-coin"></span>
          </button>
          <!-- <button
            class="btn btn-sm btn-green mr-2"
            title="พิมพ์ป้าย"
            @click="onPrintBarcode(rowData)"
          >
            <i class="bi bi-upc-scan"></i>
          </button> -->

          <button
            class="btn btn-sm btn-green"
            title="พิมพ์ป้าย PDF"
            @click="onPrintBarcodePDF(rowData)"
          >
            <i class="bi bi-upc-scan"></i>
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
//import { defineAsyncComponent } from 'vue'

//
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import priceView from './price-view.vue'
import historyView from './history-view.vue'
import updateView from './update-view.vue'
import barcodePreviewModal from './barcode-preview-modal.vue'

import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'
import { usrStockGemApiStore } from '@/stores/modules/api/stock/gem-api.js'
import { gemBarcodeService } from '@/services/barcode/gem-barcode.js'
import { gemBarcodePdfService } from '@/services/helper/pdf/gem-barcode/gem-barcode-pdf-integration.js'
import { success, error, warning } from '@/services/alert/sweetAlerts.js'

const isShowModal = {
  isPrice: false,
  isHistory: false,
  update: false,
  barcodePreview: false
}

export default {
  components: {
    //loading,
    BaseDataTable,
    priceView,
    historyView,
    updateView,
    barcodePreviewModal
  },

  setup() {
    const stockGemSearchStore = usrStockGemApiStore()
    return { stockGemSearchStore }
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
      handler(val) {
        this.form = { ...val }
        this.fetchData()
      },
      deep: true
    },
    modelFormExport: {
      handler(val) {
        console.log('watch modelFormExport', val)
        //this.export = { ...val }
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
    }
  },

  data() {
    return {
      isLoading: false,
      isShow: { ...isShowModal },
      price: {},
      history: {},
      updateGem: {},
      barcodePreviewData: {},
      currentRowData: null,

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
      export: null,

      columns: [
        {
          field: 'actions',
          //header: 'Actions',
          sortable: false,
          minWidth: '80px'
        },
        {
          field: 'code',
          header: 'รหัส',
          sortable: true
        },
        {
          field: 'quantity',
          header: 'จำนวนคงคลัง',
          sortable: true,
          format: 'number' // custom format with 3 decimal places
        },
        {
          field: 'quantityOnProcess',
          header: 'จำนวนยืมคลัง',
          sortable: true,
          format: 'number'
        },
        {
          field: 'quantityWeight',
          header: 'น้ำหนักคงคลัง',
          sortable: true,
          format: 'decimal3'
        },
        {
          field: 'quantityWeightOnProcess',
          header: 'น้ำหนักยืมคลัง',
          sortable: true,
          format: 'decimal3'
        },
        {
          field: 'price',
          header: 'ราคาต่อนำหนัก',
          sortable: true,
          format: 'decimal3'
        },
        {
          field: 'priceQty',
          header: 'ราคาต่อจำนวน',
          sortable: true,
          format: 'decimal3'
        },
        {
          field: 'unitCode',
          header: 'หน่วย',
          sortable: true
        },
        {
          field: 'unit',
          header: 'รหัสหน่วย',
          sortable: true
        },

        {
          field: 'groupName',
          header: 'หมวดหมู่',
          sortable: true
        },
        {
          field: 'size',
          header: 'ขนาด',
          sortable: true
        },
        {
          field: 'shape',
          header: 'รูปร่าง',
          sortable: true
        },
        {
          field: 'grade',
          header: 'เกรด',
          sortable: true
        },
        {
          field: 'region',
          header: 'แหล่งผลิต',
          sortable: true
        },
        {
          field: 'remark1',
          header: 'หมายเหตุ-1',
          sortable: true
        }
      ]
    }
  },

  methods: {
    // ----------- table ----------- //
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
    },
    onShowUpdate(data) {
      console.log('onShowUpdate', data)
      this.updateGem = {}
      this.updateGem = { ...data }
      this.isShow.update = true
    },
    onPrintBarcode(rowData) {
      console.log('onPrintBarcode', rowData)

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!rowData.code) {
        warning('ไม่พบรหัสพัสดุ', 'ข้อมูลไม่ครบถ้วน')
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
      console.log('onConfirmPrint', copies)

      // พิมพ์บาร์โค้ดตามจำนวนที่ระบุ
      if (copies === 1) {
        // พิมพ์ 1 ใบ
        const result = await gemBarcodeService.printBarcode(this.barcodePreviewData)
        if (result.success) {
          success('พิมพ์ป้ายสำเร็จ')
          this.closeBarcodePreview()
        }
      } else {
        // พิมพ์หลายใบ
        const result = await gemBarcodeService.printBarcodes([this.barcodePreviewData], copies)
        if (result.success) {
          success(result.message)
          this.closeBarcodePreview()
        }
      }
    },

    async onPrintBarcodePDF(rowData) {
      console.log('onPrintBarcodePDF', rowData)

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!rowData.code) {
        warning('ไม่พบรหัสพัสดุ', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      // เตรียมข้อมูลสำหรับ PDF
      const barcodeData = {
        stockCode: `*${rowData.code}*`,
        barcode: rowData.code,
        description:
          `${rowData.groupName || ''} ${rowData.shape || ''} ${rowData.size || ''}`.trim() || 'N/A',
        date: formatDate(new Date()),
        goldType: rowData.grade || 'N/A'
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
