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
          {{ data.qtyAvailable > 0 ? 'พร้อมขาย' : 'ไม่พร้อม' }}
        </span>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import imagePreview from '@/components/prime-vue/ImagePreview.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import { useStockMoveLocationApiStore } from '@/stores/modules/api/stock/stock-move-location-api.js'

export default {
  name: 'MoveLocationDataTableView',

  mixins: [dataTablePaging],

  components: {
    BaseDataTable,
    imagePreview
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

  emits: ['update:selection'],

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
      type: 'STOCK-PRODUCT',
      columns: [
        {
          field: 'image',
          header: '',
          minWidth: '50px',
          sortable: false,
          align: 'center'
        },
        {
          field: 'location',
          header: 'จัดเก็บ',
          sortable: true,
          minWidth: '150px'
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
          field: 'mold',
          header: 'เเม่พิมพ์',
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
        },
        {
          field: 'qtyAvailable',
          header: 'พร้อมขาย',
          sortable: false,
          minWidth: '100px',
          align: 'center'
        }
      ]
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
