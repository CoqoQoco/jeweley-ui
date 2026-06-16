<template>
  <div>
    <BaseDataTable
      :items="data.data"
      :totalRecords="data.total"
      dataKey="id"
      :columns="columns"
      :perPage="take"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #typeTemplate="{ data: rowData }">
        <div>
          <span><i class="mr-1" :class="getIconQty(rowData.type)"></i></span>
          <span>
            {{ getTypeName(rowData.type) }}
          </span>
        </div>
      </template>

      <template #qtyTemplate="{ data: rowData }">
        <div>
          <span><i class="mr-1" :class="getIconQty(rowData.type)"></i></span>
          <span>
            {{ rowData.qty ? Number(rowData.qty).toFixed(3).toLocaleString() : '0.000' }}
          </span>
        </div>
      </template>

      <template #qtyWeightTemplate="{ data: rowData }">
        <div>
          <span><i class="mr-1" :class="getIconQty(rowData.type)"></i></span>
          <span>
            {{
              rowData.qtyWeight ? Number(rowData.qtyWeight).toFixed(3).toLocaleString() : '0.000'
            }}
          </span>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import Papa from 'papaparse'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { formatDate, formatDateTime, formatISOString } from '@/services/utils/dayjs.js'
import api from '@/axios/axios-helper.js'

export default {
  components: {
    BaseDataTable
  },

  mixins: [dataTablePaging],

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
        //console.log('watch modelFormExport', val)
        this.export = { ...val }
        this.fetchDataExport()
      },
      deep: true
    },
    data: {
      handler(val) {
        //console.log('watch data', val)
        val.data && val.data.length > 0 ? this.$emit('export', true) : this.$emit('export', false)
      },
      deep: true
    }
  },

  data() {
    return {
      take: 100,
      data: {},
      dataExcel: {},
      expnadData: [],
      form: { ...this.modelForm },
      export: null
    }
  },

  computed: {
    masterType() {
      return this.modelMasterType
    },
    columns() {
      return [
        {
          field: 'requestDate',
          header: this.$t('view.receiptStock.gem.transaction.transactionDate'),
          sortable: true,
          minWidth: '200px',
          format: 'datetime'
        },
        {
          field: 'name',
          header: this.$t('view.receiptStock.gem.transaction.gem'),
          minWidth: '200px'
        },
        {
          field: 'woText',
          header: this.$t('view.receiptStock.gem.transaction.wo'),
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'mold',
          header: this.$t('view.receiptStock.gem.transaction.mold'),
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'type',
          header: this.$t('view.receiptStock.gem.transaction.type'),
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'qty',
          header: this.$t('view.receiptStock.gem.transaction.qty'),
          sortable: true,
          minWidth: '200px',
          format: 'decimal3'
        },
        {
          field: 'qtyWeight',
          header: this.$t('view.receiptStock.gem.transaction.weight'),
          sortable: true,
          minWidth: '200px',
          format: 'decimal3'
        },
        {
          field: 'running',
          header: this.$t('view.receiptStock.gem.transaction.running'),
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'refRunning1',
          header: this.$t('view.receiptStock.gem.transaction.refRunning1'),
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'refRunning2',
          header: this.$t('view.receiptStock.gem.transaction.refRunning2'),
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'previousRemianQty',
          header: this.$t('view.receiptStock.gem.transaction.prevQty'),
          sortable: true,
          minWidth: '200px',
          format: 'decimal3'
        },
        {
          field: 'previousRemianQtyWeight',
          header: this.$t('view.receiptStock.gem.transaction.prevWeight'),
          sortable: true,
          minWidth: '200px',
          format: 'decimal3'
        },
        {
          field: 'pointRemianQty',
          header: this.$t('view.receiptStock.gem.transaction.remainQty'),
          sortable: true,
          minWidth: '200px',
          format: 'decimal3'
        },
        {
          field: 'pointRemianQtyWeight',
          header: this.$t('view.receiptStock.gem.transaction.remainWeight'),
          sortable: true,
          minWidth: '200px',
          format: 'decimal3'
        },
        {
          field: 'remark1',
          header: this.$t('view.receiptStock.gem.transaction.remark1'),
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'remark2',
          header: this.$t('view.receiptStock.gem.transaction.remark2'),
          sortable: true,
          minWidth: '200px'
        },
        {
          field: 'jobOrPo',
          header: this.$t('view.receiptStock.gem.transaction.jobOrPo'),
          minWidth: '200px'
        },
        {
          field: 'subpplierName',
          header: this.$t('view.receiptStock.gem.transaction.supplierName'),
          minWidth: '200px'
        },
        {
          field: 'supplierCost',
          header: this.$t('view.receiptStock.gem.transaction.supplierCost'),
          minWidth: '200px',
          format: 'decimal2'
        },
        {
          field: 'price',
          header: this.$t('view.receiptStock.gem.transaction.pricePerWeight'),
          sortable: true,
          minWidth: '150px',
          format: 'decimal3'
        },
        {
          field: 'priceQty',
          header: this.$t('view.receiptStock.gem.transaction.pricePerQty'),
          sortable: true,
          minWidth: '150px',
          format: 'decimal3'
        },
        {
          field: 'unitCode',
          header: this.$t('view.receiptStock.gem.transaction.unitCode'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'unit',
          header: this.$t('view.receiptStock.gem.transaction.unit'),
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  methods: {
    async fetchData() {
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
          status: ['completed'],
          running: this.form.running ?? null
        }
      }
      const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListTransection', params)
      if (res) {
        this.data = { ...res }
      }
    },
    async fetchDataExport() {
      const params = {
        take: 0,
        skip: 0,
        sort: [],
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
          status: ['completed'],
          running: this.form.running ?? null
        }
      }
      const res = await api.jewelry.post('ReceiptAndIssueStockGem/ListTransection', params)
      if (res) {
        const dataExcel = res.data.map((item) => {
          return {
            วันทำรายการ: formatDate(item.requestDate),
            เลขที่รายการ: item.running,
            เลขที่อ้างอิง: item.refRunning,
            ประเภท: this.getTypeName(item.type),
            'พลอย/เพชร': item.name,
            จำนวน: item.qty,
            น้ำหนัก: item.qtyWeight,
            'JOB/PO No.': item.jobOrPo,
            'ร้านผลิต/ชื่อร้าน': item.subpplierName,
            ราคาทุน: item.supplierCost,
            รหัส: item.code,
            หมวดหมู่: item.groupName,
            ขนาด: item.size,
            รูปร่าง: item.shape,
            เกรด: item.grade,
            ราคา: item.price,
            ราคาต่อหน่วย: item.priceQty,
            หน่วย: item.unitCode,
            รหัสหน่วย: item.unit,
            'W.O.': item.woText,
            เแม่พิมพ์: item.mold,
            'หมายเหตุ-1': item.remark1,
            'หมายเหตุ-2': item.remark2
          }
        })
        this.exportWithCustomColumnCSV(
          dataExcel,
          `รายการเคลื่อนไหววัตถุดิบ[${this.formatDate(
            this.form.requestDateStart
          )} - ${this.formatDate(this.form.requestDateEnd)}].csv`
        )
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
      //console.log('stringToArray', str)
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
        case 6:
          return 'bi bi-arrow-down-square-fill text-success'
        case 4:
        case 7:
          return 'bi bi-arrow-up-square-fill text-danger'
        case 5:
          return 'bi bi-arrow-right-square-fill text-secondary'
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
