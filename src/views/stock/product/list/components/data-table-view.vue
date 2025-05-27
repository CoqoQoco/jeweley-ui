<template>
  <div class="mt-2">
    <BaseDataTable
      :items="productStore.dataSearch.data"
      :totalRecords="productStore.dataSearch.total"
      dataKey="stockNumber"
      :columns="columns"
      :perPage="take"
      :expandable="true"
      class="base-data-table"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <button class="btn btn-sm btn btn-green" title="พิมพ์ป้าย" @click="onPrintBarcode(data)">
            <i class="bi bi-upc-scan"></i>
          </button>
          <button class="btn btn-sm btn btn-main ml-2" title="เเก้ไข" @click="onUpdate(data)">
            <i class="bi bi-brush"></i>
          </button>
        </div>
      </template>

      <!-- Image Column -->
      <template #imageTemplate="{ data }">
        <div class="image-container">
          <div v-if="data.imagePath">
            <imagePreview
              :imageName="data.imagePath"
              :path="data.imagePath"
              :type="type"
              :width="25"
              :height="25"
            />
          </div>
        </div>
      </template>

      <template #woTextTemplate="{ data }">
        <div>
          {{ `${data.wo}-${data.woNumber}` }}
        </div>
      </template>

      <template #expansion="slotProps">
        <div>
          <dataExpand :modelForm="slotProps"></dataExpand>
        </div>
      </template>
    </BaseDataTable>

    <barcode
      :isShow="isShow.isBarcode"
      :modelStock="modelStock"
      @closeModal="onCloseModal"
    ></barcode>
    <update :isShow="isShow.isUpdate" :modelStock="modelStock" @closeModal="onCloseModal"></update>
  </div>
</template>

<script>
import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'

import dataExpand from './data-expand-view.vue'
import barcode from '../modal/barcode-view.vue'
import update from '../modal/update-view.vue'

const interfaceShow = {
  isBarcode: false,
  isUpdate: false
}

export default {
  components: {
    BaseDataTable,
    imagePreview,
    dataExpand,
    barcode,
    update
  },

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({}),
      required: true
    },
    modelFormExport: {
      type: Object,
      default: () => ({}),
      required: true
    }
  },

  computed: {
    form() {
      return this.modelForm || {}
    }
  },

  watch: {
    async modelForm() {
      //console.log(this.modelForm)
      this.take = 10
      this.skip = 0
      await this.fetchData()
    },
    async modelFormExport() {
      //console.log(this.modelForm)
      await this.fetchDataExport()
    }
  },

  data() {
    return {
      isShow: { ...interfaceShow },
      modelStock: {},

      take: 10,
      skip: 0,
      sort: [],
      columns: [
        {
          field: 'action',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center',
          bodyTemplate: 'actionTemplate'
        },
        {
          field: 'image',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center'
        },

        {
          field: 'stockNumber',
          header: 'เลขที่ผลิต (ใหม่)',
          sortable: true,
          minWidth: '150px'
        },
         {
          field: 'stockNumberOrigin',
          header: 'เลขที่ผลิต (เก่า)',
          sortable: true,
          minWidth: '150px'
        },

        {
          field: 'productNumber',
          header: 'รหัสสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNameEn',
          header: 'ชื่อสินค้า EN',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNameTh',
          header: 'ชื่อสินค้า TH',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: 'ประเภทสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'size',
          header: 'ขนาด',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'mold',
          header: 'เเม่พิมพ์',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productionType',
          header: 'สีของทอง/เงิน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productionTypeSize',
          header: 'ประเภททอง/เงิน',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'woText',
          header: 'W.O.',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'location',
          header: 'จัดเก็บ',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productPrice',
          header: 'ราคา',
          sortable: true,
          minWidth: '150px',
          format: 'decimal2'
        },
        {
          field: 'createBy',
          header: 'ผู้รับสินค้า',
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'remark',
          header: 'หมายเหตุ',
          sortable: true,
          minWidth: '150px'
        }
      ],

      type: 'STOCK-PRODUCT'
    }
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

    onCloseModal(action) {
      this.isShow = { ...interfaceShow }
      this.modelStock = {}

      if (action === 'fetch') {
        this.fetchData()
      }
    },
    onPrintBarcode(val) {
      this.modelStock = val
      this.isShow.isBarcode = true
    },
    onUpdate(val) {
      this.modelStock = val
      this.isShow.isUpdate = true
    },

    async fetchData() {
      await this.productStore.fetchDataSearch({
        skip: this.skip,
        take: this.take,
        sort: this.sort,
        formValue: this.form,
        skipLoading: false
      })
    },

    async fetchDataExport() {
      //console.log('fetchDataExport')
      await this.productStore.fetchDataSearchReceiptExport({
        sort: this.sort,
        formValue: this.form
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.base-data-table {
  :deep(.p-datatable) {
    z-index: 0 !important;
  }
}
</style>
