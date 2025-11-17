<template>
  <div class="expnad-container">
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
      //console.log('modelForm', this.modelForm)
      return this.modelForm.data
    },

    masterGold() {
      return this.masterStore.gold
    },
    masterGem() {
      return this.masterStore.gem
    }
  },

  data() {
    return {
      columns: [
        {
          field: 'type',
          header: '',
          sortable: false,
          width: '150px',
          className: 'text-focus-main'
        },
        // {
        //   field: 'typeName',
        //   header: 'รหัส',
        //   sortable: false,
        //   width: '100px'
        // },
        {
          field: 'size',
          header: 'ขนาด',
          sortable: false,
          width: '100px'
        },
        {
          field: 'qty',
          header: 'จำนวน',
          sortable: false,
          width: '100px',
          align: 'right'
        },
        {
          field: 'weight',
          header: 'น้ำหนัก',
          sortable: false,
          width: '100px',
          align: 'right'
        },
        {
          field: 'price',
          header: 'ราคา',
          sortable: false,
          width: '150px',
          format: 'decimal2',
          align: 'right'
        }
      ]
    }
  },

  methods: {
    getGoldType(type) {
      return this.masterGold.find((item) => item.code === type)?.nameEn ?? 'Gold'
    },
    getGemType(type) {
      //return this.masterGem.find((item) => item.code === type)?.description ?? 'Gem'
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
  width: 650px;
  z-index: 0 !important;

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
      background-color: #460505 !important;
      color: #ffffff !important;
      //padding: 0.15rem 0.5rem !important;

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
