<template>
  <div class="mt-2">
    <BaseDataTable
      :items="moveStore.dataSearch.data"
      :totalRecords="moveStore.dataSearch.total"
      :columns="columns"
      :perPage="take"
      :itemsSelection="selectedItems"
      dataKey="stockNumber"
      :selectionMode="true"
      selectionType="multiple"
      @page="handlePageChange"
      @sort="handleSortChange"
      @update:itemsSelection="onSelectionChange"
    >
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

      <template #qtyAvailableTemplate="{ data }">
        <span :class="data.qtyAvailable > 0 ? 'badge-ready' : 'badge-not-ready'">
          {{ data.qtyAvailable > 0 ? $t('view.stock.moveLocation.readyLabel') : $t('view.stock.moveLocation.notReadyLabel') }}
        </span>
      </template>

      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <ButtonGeneric
            variant="green"
            icon="bi-clock-history"
            :title="$t('view.stock.moveLocation.historyBtn')"
            @click="$emit('history', data)"
          />
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useStockMoveLocationApiStore } from '@/stores/modules/api/stock/stock-move-location-api.js'

export default {
  name: 'MoveLocationDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable,
    imagePreview,
    ButtonGeneric
  },

  setup() {
    const moveStore = useStockMoveLocationApiStore()
    return { moveStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    },
    modelFormExport: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['update:selection', 'history'],

  computed: {
    columns() {
      return [
        { field: 'image', header: '', minWidth: '50px', sortable: false, align: 'center' },
        { field: 'location', header: this.$t('view.stock.product.locationHeader'), sortable: true, minWidth: '150px' },
        { field: 'stockNumber', header: this.$t('view.stock.product.stockNumberNew'), sortable: true, minWidth: '150px' },
        { field: 'stockNumberOrigin', header: this.$t('view.stock.product.stockNumberOld'), sortable: true, minWidth: '150px' },
        { field: 'productNumber', header: this.$t('view.stock.product.productNumber'), sortable: true, minWidth: '150px' },
        { field: 'mold', header: this.$t('view.stock.product.mold'), sortable: true, minWidth: '150px' },
        { field: 'productNameEn', header: this.$t('view.stock.product.productNameEn'), sortable: true, minWidth: '150px' },
        { field: 'productNameTh', header: this.$t('view.stock.product.productNameTh'), sortable: true, minWidth: '150px' },
        { field: 'productTypeName', header: this.$t('view.stock.product.productType'), sortable: true, minWidth: '150px' },
        { field: 'size', header: this.$t('view.stock.product.size'), sortable: true, minWidth: '150px' },
        { field: 'productionType', header: this.$t('view.stock.product.goldColor'), sortable: true, minWidth: '150px' },
        { field: 'productionTypeSize', header: this.$t('view.stock.product.goldType'), sortable: true, minWidth: '150px' },
        { field: 'woText', header: this.$t('view.stock.product.wo'), sortable: true, minWidth: '150px' },
        { field: 'productPrice', header: this.$t('common.field.price'), sortable: true, minWidth: '150px', format: 'decimal2' },
        { field: 'createBy', header: this.$t('view.stock.product.receiver'), sortable: true, minWidth: '150px' },
        { field: 'remark', header: this.$t('common.field.remark'), sortable: true, minWidth: '150px' },
        { field: 'qtyAvailable', header: this.$t('view.stock.moveLocation.readyLabel'), sortable: false, minWidth: '100px', align: 'center' },
        { field: 'action', header: this.$t('common.field.action'), sortable: false, minWidth: '80px', align: 'center' }
      ]
    }
  },

  watch: {
    async modelForm() {
      this.selectedItems = []
      this.resetPaging()
    },
    async modelFormExport() {
      await this.moveStore.fetchDataSearchReceiptExport({
        sort: this.sort,
        formValue: this.modelFormExport
      })
    }
  },

  data() {
    return {
      selectedItems: [],
      type: 'STOCK-PRODUCT'
    }
  },

  methods: {
    onSelectionChange(selected) {
      this.selectedItems = selected
      this.$emit('update:selection', selected)
    },

    async fetchData() {
      await this.moveStore.fetchDataSearch({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        formValue: this.modelForm
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

%badge-base {
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
}

.badge-ready {
  @extend %badge-base;
  background: #d4edda;
  color: #155724;
}

.badge-not-ready {
  @extend %badge-base;
  background: #f8d7da;
  color: #721c24;
}
</style>
