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
          <button class="btn btn-sm btn btn-main ml-2" title="แก้ไข" @click="onUpdate(data)">
            <i class="bi bi-brush"></i>
          </button>
          <button class="btn btn-sm btn-green ml-2" title="ดูต้นทุนสินค้า" @click="onViewCost(data)">
            <i class="bi bi-calculator"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-main ml-2"
            title="ดูประวัติตีราคา"
            @click="onViewHistory(data)"
          >
            <i class="bi bi-clock-history"></i>
          </button>
        </div>
      </template>

      <!-- Image Column -->
      <template #imageTemplate="{ data }">
        <div class="image-container">
          <div v-if="data.imagePath">
            <imagePreview
              :imageName="data.imagePath"
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
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useStockBalanceApiStore } from '@/stores/modules/api/stock/stock-balance-api.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'

import dataExpand from './data-expand-view.vue'
import barcode from '../modal/barcode-view.vue'
import update from '../modal/update-view.vue'

const interfaceShow = {
  isBarcode: false,
  isUpdate: false
}

export default {
  mixins: [dataTablePaging],

  components: {
    BaseDataTable,
    imagePreview,
    dataExpand,
    barcode,
    update
  },

  setup() {
    const productStore = usrStockProductApiStore()
    const balanceStore = useStockBalanceApiStore()
    const locationStore = useStockLocationApiStore()
    return { productStore, balanceStore, locationStore }
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
    },
    columns() {
      return [
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
          header: this.$t('view.stock.product.stockNumberNew'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'stockNumberOrigin',
          header: this.$t('view.stock.product.stockNumberOld'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNumber',
          header: this.$t('view.stock.product.productNumber'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'mold',
          header: this.$t('view.stock.product.mold'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNameEn',
          header: this.$t('view.stock.product.productNameEn'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productNameTh',
          header: this.$t('view.stock.product.productNameTh'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productTypeName',
          header: this.$t('view.stock.product.productType'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'size',
          header: this.$t('view.stock.product.size'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productionType',
          header: this.$t('view.stock.product.goldColor'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productionTypeSize',
          header: this.$t('view.stock.product.goldType'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'woText',
          header: this.$t('view.stock.product.wo'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'location',
          header: this.$t('view.stock.product.locationHeader'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'productPrice',
          header: this.$t('common.field.price'),
          sortable: true,
          minWidth: '150px',
          format: 'decimal2'
        },
        {
          field: 'createBy',
          header: this.$t('view.stock.product.receiver'),
          sortable: true,
          minWidth: '150px'
        },
        {
          field: 'remark',
          header: this.$t('common.field.remark'),
          sortable: true,
          minWidth: '150px'
        }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.resetPaging()
    },
    async modelFormExport() {
      await this.fetchDataExport()
    }
  },

  data() {
    return {
      isShow: { ...interfaceShow },
      modelStock: {},

      type: 'STOCK-PRODUCT'
    }
  },

  methods: {
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
    onViewCost(val) {
      this.$emit('view-cost', val)
    },
    onViewHistory(val) {
      this.$emit('view-history', val)
    },

    async fetchData() {
      await this.productStore.fetchDataSearch({
        skip: this.skip,
        take: this.take,
        sort: this.sort,
        formValue: this.form,
        skipLoading: false
      })
      await this.mergeBalanceIntoItems()
    },

    async mergeBalanceIntoItems() {
      const items = this.productStore.dataSearch?.data || []
      const stockNumbers = items.map((i) => i.stockNumber).filter(Boolean)
      if (!stockNumbers.length) return

      let nameMap = {}
      try {
        const allLocs = await this.locationStore.fetchAllForMap()
        for (const loc of allLocs) {
          nameMap[loc.code] = `${loc.code} — ${loc.nameTh}`
        }
      } catch {
        // fallback: use code as name
      }

      const map = await this.balanceStore.fetchByStockNumbers(stockNumbers)
      for (const item of items) {
        const b = map[item.stockNumber]
        item.qtyOnHand = b?.qtyOnHand ?? null
        item.qtyReserved = b?.qtyReserved ?? null
        item.qtyAvailable = b?.qtyAvailable ?? null
        if (b?.rows) {
          item.slocBalances = b.rows.map((row) => ({
            ...row,
            location: nameMap[row.locationCode] || row.locationCode
          }))
        } else {
          item.slocBalances = []
        }
      }
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
