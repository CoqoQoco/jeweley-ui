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
          <a
            :href="getDetailHref(data)"
            target="_blank"
            rel="noopener"
            class="btn btn-sm view-link"
            :title="$t('common.btn.view')"
          >
            <i class="bi bi-eye"></i>
          </a>
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
          <BarcodeButtonGeneric :value="stripStockNumberDash(data.stockNumber)" />
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

      <template #quickPriceTotalTemplate="{ data }">
        <span>{{ formatMoney2(data.quickPriceTotal) }}</span>
      </template>

      <template #quickPriceTemplate="{ data }">
        <div v-if="data.quickPrice !== null && data.quickPrice !== undefined" class="quick-price-cell">
          <span class="quick-price-value">{{ formatMoney2(data.quickPrice) }}</span>
          <span class="quick-price-meta">{{ quickPriceMeta(data) }}</span>
          <span v-if="isQuickPriceStale(data.quickPriceDate)" class="tag-chip tag-chip--stale">
            {{ $t('view.stock.product.quickPrice.staleDays', { days: getQuickPriceAgeDays(data.quickPriceDate) }) }}
          </span>
        </div>
        <span v-else>—</span>
      </template>

      <template #hasNormalAppraisalTemplate="{ data }">
        <span
          class="tag-chip"
          :class="data.hasNormalAppraisal ? 'tag-chip--ok' : 'tag-chip--none'"
        >
          {{ data.hasNormalAppraisal ? $t('view.stock.product.quickPrice.appraisedYes') : $t('view.stock.product.quickPrice.appraisedNo') }}
        </span>
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
import { formatDate } from '@/services/utils/dayjs.js'
import { stripStockNumberDash } from '@/services/helper/stock-number.js'
import {
  formatMoney2,
  formatPlainNumber,
  getQuickPriceAgeDays,
  isQuickPriceStale
} from '@/services/helper/quick-price.js'

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
          field: 'quickPrice',
          header: this.$t('view.stock.product.quickPrice.colQuickPrice'),
          sortable: false,
          minWidth: '200px',
          align: 'right'
        },
        {
          field: 'quickPriceTotal',
          header: this.$t('view.stock.product.quickPrice.colTotalPriceQuick'),
          sortable: false,
          minWidth: '150px',
          align: 'right'
        },
        {
          field: 'hasNormalAppraisal',
          header: this.$t('view.stock.product.quickPrice.normalAppraisal'),
          sortable: false,
          minWidth: '110px',
          align: 'center'
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
    stripStockNumberDash,

    formatDecimal,
    getPieceQty,
    getPieceQtyReserved,
    getPieceQtyAvailable,
    formatMoney2,
    getQuickPriceAgeDays,
    isQuickPriceStale,

    quickPriceMeta(data) {
      const date = data.quickPriceDate ? formatDate(data.quickPriceDate) : ''
      const gold = this.$t('view.stock.product.quickPrice.saleGoldPerGram', {
        price: formatPlainNumber(data.quickPriceSaleGoldPrice ?? data.quickPriceGoldPrice)
      })
      return date ? `${date} · ${gold}` : gold
    },

    onCloseModal(action) {
      this.isShow = { ...interfaceShow }
      this.modelStock = {}

      if (action === 'fetch') {
        this.fetchData()
      }
    },
    getDetailHref(val) {
      return this.$router.resolve({ name: 'stock-product-detail', params: { stockNumber: val.stockNumber } }).href
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

.view-link {
  background-color: var(--base-font-color);
  color: var(--on-inverse);
  text-decoration: none;

  &:hover {
    color: var(--on-inverse);
    filter: brightness(0.92);
  }
}

.quick-price-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--sp-xs);
}

.quick-price-value {
  font-weight: 700;
}

.quick-price-meta {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.tag-chip {
  display: inline-flex;
  padding: 0 var(--sp-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  line-height: var(--lh-md);
  white-space: nowrap;

  &--ok {
    border-color: var(--base-green);
    color: var(--base-green);
  }

  &--none {
    color: var(--base-sub-color);
  }

  &--stale {
    border-color: var(--base-warning);
    color: var(--base-sub-color);
  }
}
</style>
