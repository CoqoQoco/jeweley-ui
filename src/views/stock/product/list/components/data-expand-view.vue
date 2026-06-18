<template>
  <div class="expnad-container">
    <h6>{{ $t('view.stock.product.slocBalanceTitle') }}</h6>
    <BaseDataTable
      :items="slocBalanceRows"
      :columns="slocColumns"
      :paginator="false"
      dataKey="location"
      class="sloc-table mb-3"
    />

    <BaseDataTable :items="modelFormValue.materials" :columns="columns" :paginator="false">
      <template #typeTemplate="{ data }">
        <div class="text-focus-main">
          <div v-if="data.type === 'Diamond'">
            <span>{{ getDiamondType(data.typeCode) }}</span>
          </div>
          <div v-if="data.type === 'Gold' || data.type === 'Silver'">
            <span>{{ getGoldType(data.typeCode) }}</span>
          </div>
          <div v-if="data.type === 'Gem'">
            <span>{{ getGemType(data.typeCode) }}</span>
          </div>
        </div>
      </template>

      <template #qtyTemplate="{ data }">
        <div>
          <span>{{ getQty(data) }}</span>
        </div>
      </template>

      <template #weightTemplate="{ data }">
        <div>
          <span>{{ getWeight(data) }}</span>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
export default {
  name: 'DataExpand',

  components: {
    BaseDataTable
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    modelForm: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },

  computed: {
    modelFormValue() {
      return this.modelForm.data
    },

    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    },

    slocColumns() {
      return [
        {
          field: 'location',
          header: 'Storage Location',
          sortable: false,
          minWidth: '200px'
        },
        {
          field: 'qtyOnHand',
          header: this.$t('view.stock.product.slocQtyOnHand'),
          sortable: false,
          minWidth: '100px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'qtyReserved',
          header: this.$t('view.stock.product.slocQtyReserved'),
          sortable: false,
          minWidth: '100px',
          align: 'right',
          format: 'decimal2'
        },
        {
          field: 'qtyAvailable',
          header: this.$t('view.stock.product.slocQtyAvailable'),
          sortable: false,
          minWidth: '100px',
          align: 'right',
          format: 'decimal2'
        }
      ]
    },

    columns() {
      return [
        {
          field: 'type',
          header: '',
          sortable: false,
          width: '150px',
          className: 'text-focus-main'
        },
        {
          field: 'size',
          header: this.$t('view.stock.product.size'),
          sortable: false,
          width: '100px'
        },
        {
          field: 'qty',
          header: this.$t('common.field.quantity'),
          sortable: false,
          width: '100px',
          align: 'right'
        },
        {
          field: 'weight',
          header: this.$t('common.field.weight'),
          sortable: false,
          width: '100px',
          align: 'right'
        },
        {
          field: 'price',
          header: this.$t('common.field.price'),
          sortable: false,
          width: '150px',
          format: 'decimal2',
          align: 'right'
        }
      ]
    },

    slocBalanceRows() {
      const rows = this.modelFormValue?.slocBalances || []
      const totalOnHand = rows.reduce((s, r) => s + (r.qtyOnHand ?? 0), 0)
      const totalReserved = rows.reduce((s, r) => s + (r.qtyReserved ?? 0), 0)
      const totalAvailable = rows.reduce((s, r) => s + (r.qtyAvailable ?? 0), 0)
      return [
        ...rows,
        {
          location: this.$t('view.stock.product.slocTotal'),
          qtyOnHand: totalOnHand,
          qtyReserved: totalReserved,
          qtyAvailable: totalAvailable
        }
      ]
    }
  },

  data() {
    return {}
  },

  methods: {
    getGoldType(type) {
      return this.masterGold.find((item) => item.code === type)?.nameEn ?? 'Gold'
    },
    getGemType(type) {
      return type
    },
    getDiamondType(type) {
      return `Diamond  ${type ? `(${type})` : ''}`
    },

    getQty(data) {
      return `${data.qty ?? `0`}${data.qtyUnit ? ` ${data.qtyUnit}` : ''}`
    },
    getWeight(data) {
      return `${data.weight.toFixed(3) ?? `0`}${data.weightUnit ? ` ${data.weightUnit}` : ''}`
    }
  }
}
</script>

<style lang="scss" scoped>
.expnad-container {
  padding: 10px 20px;
  width: 750px;
  z-index: 0 !important;

  h6 {
    color: var(--base-font-color);
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
    background: transparent !important;
    margin-bottom: 8px;
  }

  .text-focus-main {
    font-weight: 700;
    color: var(--base-font-color);
  }

  :deep(.p-datatable) {
    .p-datatable-tbody > tr {
      // ปิด hover effect
      &:hover {
        background-color: transparent !important;
      }

      // ถ้ามี striped rows ก็ยังคงไว้
      &:nth-child(even) {
        background-color: #f8f9fa !important;
      }
    }

    // ส่วนของ header ยังคงเหมือนเดิม
    .p-datatable-thead > tr > th {
      background-color: var(--base-font-color) !important;
      color: #ffffff !important;

      .p-column-title {
        color: #ffffff !important;
      }
    }

    // ส่วนของ cells ยังคงเหมือนเดิม
    .p-datatable-tbody > tr > td {
      //padding: 0.1rem 0.5rem !important;
      //line-height: 1 !important;
    }
  }
}
</style>
