<template>
  <div class="mt-3">
    <BaseDataTable
      :items="items"
      :totalRecords="total"
      :columns="columns"
      :perPage="take"
      dataKey="running"
      :emptyMessage="$t('view.sale.materialSale.noData')"
      @page="$emit('page', $event)"
      @sort="$emit('sort', $event)"
    >
      <template #noTemplate="{ index }">
        <div>{{ skip + index + 1 }}</div>
      </template>

      <template #documentDateTemplate="{ data }">
        <div>{{ formatDate(data.documentDate) }}</div>
      </template>

      <template #totalWeightTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.totalWeight) }}</div>
      </template>

      <template #grandTotalTemplate="{ data }">
        <div class="text-right">{{ formatNumber(data.grandTotal) }}</div>
      </template>

      <template #statusTemplate="{ data }">
        <span :class="['status-pill', `status-pill--${statusVariant(data.status)}`]">
          {{ statusLabel(data.status) }}
        </span>
      </template>

      <template #actionTemplate="{ data }">
        <div class="btn-action-container">
          <ButtonGeneric variant="green" icon="bi-eye" :title="$t('common.btn.view')" @click="$emit('view', data)" />
          <ButtonGeneric
            v-if="data.status === 10"
            variant="main"
            icon="bi-pencil"
            :title="$t('common.btn.edit')"
            @click="$emit('edit', data)"
          />
          <ButtonGeneric
            v-if="data.status === 10"
            variant="red"
            icon="bi-trash"
            :title="$t('common.btn.delete')"
            @click="$emit('delete', data)"
          />
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
// External dependencies
import { formatDate } from '@/services/utils/dayjs.js'
import { formatNumber } from '@/services/utils/decimal.js'

// Local components
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'MaterialSaleDataTableView',

  components: {
    BaseDataTable,
    ButtonGeneric
  },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    take: {
      type: Number,
      default: 10
    },
    skip: {
      type: Number,
      default: 0
    }
  },

  emits: ['page', 'sort', 'view', 'edit', 'delete'],

  computed: {
    columns() {
      return [
        { field: 'no', header: this.$t('view.sale.materialSale.colNo'), minWidth: '60px', sortable: false },
        { field: 'documentNo', header: this.$t('view.sale.materialSale.colDocumentNo'), minWidth: '140px', sortable: true },
        { field: 'documentDate', header: this.$t('view.sale.materialSale.colDocumentDate'), minWidth: '110px', sortable: true },
        { field: 'customerName', header: this.$t('view.sale.materialSale.colCustomerName'), minWidth: '180px', sortable: true },
        { field: 'itemCount', header: this.$t('view.sale.materialSale.colItemCount'), minWidth: '110px', align: 'right', sortable: false },
        { field: 'totalWeight', header: this.$t('view.sale.materialSale.colTotalWeight'), minWidth: '130px', align: 'right', sortable: false },
        { field: 'grandTotal', header: this.$t('view.sale.materialSale.colGrandTotal'), minWidth: '130px', align: 'right', sortable: true },
        { field: 'status', header: this.$t('view.sale.materialSale.colStatus'), minWidth: '120px', sortable: false },
        { field: 'action', header: this.$t('view.sale.materialSale.colAction'), minWidth: '140px', sortable: false }
      ]
    }
  },

  methods: {
    formatDate(val) {
      return val ? formatDate(val) : ''
    },

    formatNumber(val) {
      return formatNumber(val, 2)
    },

    statusLabel(status) {
      if (status === 100) return this.$t('view.sale.materialSale.statusConfirmed')
      if (status === 500) return this.$t('view.sale.materialSale.statusCancelled')
      return this.$t('view.sale.materialSale.statusDraft')
    },

    statusVariant(status) {
      if (status === 100) return 'green'
      if (status === 500) return 'red'
      return 'gray'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.status-pill {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 700;

  &--gray {
    color: var(--status-closed);
    background: var(--status-closed-bg);
  }

  &--green {
    color: var(--status-resolved);
    background: var(--status-resolved-bg);
  }

  &--red {
    color: var(--status-cancelled);
    background: var(--status-cancelled-bg);
  }
}
</style>
