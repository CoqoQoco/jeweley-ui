<template>
  <SectionCardGeneric
    :title="$t('view.sale.billingNote.typeSummaryTitle')"
    icon="bi-pie-chart"
    accent="main"
    headerStyle="legend"
  >
    <div class="summary-header-line">
      <span>
        {{ $t('view.sale.billingNote.billCountLabel') }} {{ billCount }}
        {{ $t('view.sale.billingNote.bills') }}
      </span>
      <span class="summary-divider">•</span>
      <span>
        {{ $t('view.sale.billingNote.totalPieces') }} {{ formatNumber(totalQty) }}
        {{ $t('view.sale.billingNote.pieces') }}
      </span>
    </div>

    <BaseDataTable
      :items="groupByType"
      :totalRecords="groupByType.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="220px"
      dataKey="productTypeName"
    >
      <template #qtyTemplate="{ data: row }">
        <div class="text-right">{{ formatNumber(row.qty) }}</div>
      </template>

      <template #footer>
        <div class="summary-footer-row">
          <span class="footer-label">{{ $t('view.sale.billingNote.totalRow') }}</span>
          <span class="footer-value">{{ formatNumber(totalQty) }}</span>
        </div>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
// External dependencies
import { formatNumber } from '@/services/utils/decimal.js'

// Local components
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'BillingNoteTypeSummarySection',

  components: {
    SectionCardGeneric,
    BaseDataTable
  },

  props: {
    products: { type: Array, default: () => [] },
    billCount: { type: Number, default: 0 }
  },

  computed: {
    columns() {
      return [
        { field: 'productTypeName', header: this.$t('view.sale.billingNote.productTypeName'), sortable: false },
        {
          field: 'qty',
          header: `${this.$t('view.sale.billingNote.qty')} (${this.$t('view.sale.billingNote.pieces')})`,
          align: 'right',
          sortable: false,
          template: 'qtyTemplate'
        }
      ]
    },

    groupByType() {
      const noTypeLabel = this.$t('view.sale.billingNote.noType')
      const map = new Map()

      this.products.forEach((p) => {
        const key = p.productTypeName && String(p.productTypeName).trim() ? p.productTypeName : noTypeLabel
        const qty = Number(p.qty) || 0
        map.set(key, (map.get(key) || 0) + qty)
      })

      return Array.from(map.entries()).map(([productTypeName, qty]) => ({ productTypeName, qty }))
    },

    totalQty() {
      return this.groupByType.reduce((sum, g) => sum + g.qty, 0)
    }
  },

  methods: {
    formatNumber(val) {
      return formatNumber(val, 2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.summary-header-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-md);
  font-weight: 700;
  font-size: var(--fs-base);
  color: var(--base-font-color);
}

.summary-divider {
  opacity: 0.4;
}

.summary-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-sm) var(--sp-lg);
  font-weight: 700;
  font-size: var(--fs-base);
  color: var(--base-font-color);
}
</style>
