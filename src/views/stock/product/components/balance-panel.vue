<template>
  <div class="balance-panel">
    <div class="balance-section">
      <div class="section-label">{{ $t('view.stock.product.lotBalanceTitle') }}</div>
      <div class="lot-tiles">
        <div class="tile">
          <div class="tile-value">{{ formatDecimal(qtyOnHand, 2) }}</div>
          <div class="tile-label">{{ $t('view.stock.product.qtyOnHand') }}</div>
        </div>
        <div class="tile">
          <div class="tile-value">{{ formatDecimal(qtyReserved, 2) }}</div>
          <div class="tile-label">{{ $t('view.stock.product.qtyReserved') }}</div>
        </div>
        <div class="tile tile--available">
          <div class="tile-value">{{ formatDecimal(qtyAvailable, 2) }}</div>
          <div class="tile-label">{{ $t('view.stock.product.qtyAvailable') }}</div>
        </div>
      </div>
    </div>

    <div class="balance-section">
      <div class="section-label">{{ $t('view.stock.product.slocBalanceTitle') }}</div>
      <BaseDataTable
        v-if="hasSlocBalances"
        :items="slocBalanceRows"
        :columns="slocColumns"
        :paginator="false"
        dataKey="location"
      />
      <div v-else class="sloc-empty">{{ $t('common.label.noData') }}</div>
    </div>
  </div>
</template>

<script>
import { formatDecimal } from '@/services/utils/decimal.js'
import { getPieceQty, getPieceQtyReserved, getPieceQtyAvailable } from '@/services/utils/stock-piece-qty.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'BalancePanel',

  components: {
    BaseDataTable
  },

  props: {
    item: {
      type: Object,
      required: true
    }
  },

  computed: {
    qtyOnHand() {
      return getPieceQty(this.item)
    },

    qtyReserved() {
      return getPieceQtyReserved(this.item)
    },

    qtyAvailable() {
      return getPieceQtyAvailable(this.item)
    },

    hasSlocBalances() {
      return Array.isArray(this.item?.slocBalances) && this.item.slocBalances.length > 0
    },

    slocColumns() {
      return [
        { field: 'location', header: this.$t('view.stock.product.slocHeader'), sortable: false, minWidth: '200px' },
        { field: 'qtyOnHand', header: this.$t('view.stock.product.slocQtyOnHand'), sortable: false, minWidth: '100px', align: 'right', format: 'decimal2' },
        { field: 'qtyReserved', header: this.$t('view.stock.product.slocQtyReserved'), sortable: false, minWidth: '100px', align: 'right', format: 'decimal2' },
        { field: 'qtyAvailable', header: this.$t('view.stock.product.slocQtyAvailable'), sortable: false, minWidth: '100px', align: 'right', format: 'decimal2' }
      ]
    },

    slocBalanceRows() {
      const rows = this.item?.slocBalances || []
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

  methods: {
    formatDecimal
  }
}
</script>

<style lang="scss" scoped>
.balance-section + .balance-section {
  margin-top: var(--sp-lg);
}

.section-label {
  font-weight: 600;
  color: var(--base-font-color);
  margin-bottom: var(--sp-sm);
}

.lot-tiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sp-sm);
}

.tile {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  background: var(--color-card-bg);
  text-align: center;

  &--available {
    background: var(--color-green-bg);
  }
}

.tile-value {
  font-size: var(--fs-xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.tile-label {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.sloc-empty {
  text-align: center;
  color: var(--base-sub-color);
  padding: var(--sp-lg);
}
</style>
