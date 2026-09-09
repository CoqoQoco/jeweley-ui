<template>
  <div class="material-table-container">
    <div v-if="!items.length" class="material-empty">
      {{ $t('view.stock.product.materialsEmpty') }}
    </div>
    <template v-else>
      <div class="table-scroll">
        <BaseDataTable :items="items" :columns="columns" :paginator="false">
          <template #typeTemplate="{ data }">
            <span class="type-label">{{ typeLabel(data) }}</span>
          </template>

          <template #typeCodeTemplate="{ data }">
            <span>{{ data.type === 'Diamond' ? '—' : data.typeCode || '—' }}</span>
          </template>

          <template v-if="variant === 'full'" #gradeTemplate="{ data }">
            <span>{{ data.type === 'Diamond' ? data.typeCode || '—' : '—' }}</span>
          </template>

          <template #qtyTemplate="{ data }">
            <span>{{ qtyText(data) }}</span>
          </template>

          <template #weightTemplate="{ data }">
            <span>{{ weightText(data) }}</span>
          </template>
        </BaseDataTable>
      </div>
      <div class="material-total">
        {{ $t('view.stock.product.materialTotalPrice') }}: {{ formatDecimal(totalPrice, 2) }}
      </div>
    </template>
  </div>
</template>

<script>
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { formatDecimal } from '@/services/utils/decimal.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'MaterialTable',

  components: {
    BaseDataTable
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    variant: {
      type: String,
      default: 'compact',
      validator: (v) => ['compact', 'full'].includes(v)
    }
  },

  computed: {
    columns() {
      const cols = [
        { field: 'type', header: this.$t('view.stock.product.materialType'), sortable: false, minWidth: '150px' },
        { field: 'typeCode', header: this.$t('view.stock.product.materialCode'), sortable: false, minWidth: '150px' }
      ]

      if (this.variant === 'full') {
        cols.push({ field: 'grade', header: this.$t('view.stock.product.materialGrade'), sortable: false, minWidth: '120px' })
      }

      cols.push(
        { field: 'size', header: this.$t('view.stock.product.size'), sortable: false, minWidth: '100px' },
        { field: 'region', header: this.$t('view.stock.product.origin'), sortable: false, minWidth: '120px' },
        { field: 'qty', header: this.$t('common.field.quantity'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'weight', header: this.$t('common.field.weight'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'price', header: this.$t('common.field.price'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' }
      )

      return cols
    },

    totalPrice() {
      return this.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
    }
  },

  created() {
    if (!this.masterStore.gold.length) {
      this.masterStore.fetchGold()
    }
  },

  methods: {
    formatDecimal,

    typeLabel(item) {
      if (item.type === 'Gold' || item.type === 'Silver') {
        return this.masterStore.gold.find((g) => g.code === item.typeCode)?.nameEn ?? 'Gold'
      }
      if (item.type === 'Gem') return item.typeCode
      if (item.type === 'Diamond') return `Diamond${item.typeCode ? ` (${item.typeCode})` : ''}`
      return item.type
    },

    qtyText(data) {
      return `${data.qty ?? 0}${data.qtyUnit ? ` ${data.qtyUnit}` : ''}`
    },

    weightText(data) {
      const weight = (data.weight ?? 0).toFixed(3)
      return `${weight}${data.weightUnit ? ` ${data.weightUnit}` : ''}`
    }
  }
}
</script>

<style lang="scss" scoped>
.table-scroll {
  overflow-x: auto;
}

.type-label {
  font-weight: 700;
  color: var(--base-font-color);
}

.material-total {
  text-align: right;
  margin-top: var(--sp-sm);
  font-weight: 600;
}

.material-empty {
  text-align: center;
  color: var(--base-sub-color);
  padding: var(--sp-lg);
}
</style>
