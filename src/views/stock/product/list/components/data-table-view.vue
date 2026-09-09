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
          <ButtonGeneric variant="main" icon="bi-eye" :title="$t('common.btn.view')" @click="onView(data)" />
          <ButtonGeneric variant="outline" icon="bi-pencil" :title="$t('common.btn.edit')" @click="onUpdate(data)" />
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

      <template #stockNumberTemplate="{ data }">
        <div class="stock-number-cell">
          <span>{{ data.stockNumber }}</span>
          <BarcodeButtonGeneric :value="data.stockNumber" />
        </div>
      </template>

      <template #stockNumberOriginTemplate="{ data }">
        <div class="stock-number-cell">
          <span>{{ data.stockNumberOrigin }}</span>
          <BarcodeButtonGeneric :value="data.stockNumberOrigin" />
        </div>
      </template>

      <!-- ยอดของ "ล็อตนี้" (piece เดียว) — ยอดรวม SKU ทั้งหมดดูได้ที่แถบขยาย -->
      <template #pieceQtyTemplate="{ data }">
        <span>{{ formatDecimal(getPieceQty(data), 2) }}</span>
      </template>

      <template #pieceQtyReservedTemplate="{ data }">
        <span>{{ formatDecimal(getPieceQtyReserved(data), 2) }}</span>
      </template>

      <template #pieceQtyAvailableTemplate="{ data }">
        <span>{{ formatDecimal(getPieceQtyAvailable(data), 2) }}</span>
      </template>

      <template #expansion="slotProps">
        <div>
          <dataExpand :modelForm="slotProps"></dataExpand>
        </div>
      </template>
    </BaseDataTable>

    <update :isShow="isShow.isUpdate" :modelStock="modelStock" @closeModal="onCloseModal"></update>
  </div>
</template>

<script>
import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import BarcodeButtonGeneric from '@/components/generic/BarcodeButtonGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { formatDecimal } from '@/services/utils/decimal.js'
import { getPieceQty, getPieceQtyReserved, getPieceQtyAvailable } from '@/services/utils/stock-piece-qty.js'
import { mergeBalanceIntoItems } from '@/composables/useStockBalanceMerge.js'

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { useStockBalanceApiStore } from '@/stores/modules/api/stock/stock-balance-api.js'
import { useStockLocationApiStore } from '@/stores/modules/api/stock/stock-location-api.js'

import dataExpand from './data-expand-view.vue'
import update from '../modal/update-view.vue'

const interfaceShow = {
  isUpdate: false
}

export default {
  mixins: [dataTablePaging],

  components: {
    BaseDataTable,
    imagePreview,
    BarcodeButtonGeneric,
    ButtonGeneric,
    dataExpand,
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
          minWidth: '90px',
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
          minWidth: '180px'
        },
        {
          field: 'stockNumberOrigin',
          header: this.$t('view.stock.product.stockNumberOld'),
          sortable: true,
          minWidth: '180px'
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
          field: 'qty',
          header: this.$t('view.stock.product.qtyOnHand'),
          sortable: false,
          minWidth: '100px',
          align: 'right',
          bodyTemplate: 'pieceQtyTemplate'
        },
        {
          field: 'qtyReserved',
          header: this.$t('view.stock.product.qtyReserved'),
          sortable: false,
          minWidth: '100px',
          align: 'right',
          bodyTemplate: 'pieceQtyReservedTemplate'
        },
        {
          field: 'qtyAvailable',
          header: this.$t('view.stock.product.qtyAvailable'),
          sortable: false,
          minWidth: '100px',
          align: 'right',
          bodyTemplate: 'pieceQtyAvailableTemplate'
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
    formatDecimal,
    getPieceQty,
    getPieceQtyReserved,
    getPieceQtyAvailable,

    onCloseModal(action) {
      this.isShow = { ...interfaceShow }
      this.modelStock = {}

      if (action === 'fetch') {
        this.fetchData()
      }
    },
    onView(val) {
      this.$router.push({ name: 'stock-product-detail', params: { stockNumber: val.stockNumber } })
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
      await this.mergeBalanceIntoItems()
    },

    async mergeBalanceIntoItems() {
      const items = this.productStore.dataSearch?.data || []
      await mergeBalanceIntoItems(items, { balanceStore: this.balanceStore, locationStore: this.locationStore })
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

  // แถวขยาย: td ต้อง overflow visible — ไม่งั้น position: sticky ของ .expand-container
  // ไป "ติด" กับ td (ancestor ที่ overflow hidden) แทน .p-datatable-wrapper ที่เป็นตัวเลื่อนจริง
  :deep(.p-datatable-row-expansion > td) {
    overflow: visible;
  }
}

.stock-number-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
}
</style>
