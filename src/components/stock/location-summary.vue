<template>
  <div class="location-summary">
    <span :title="breakdown ? null : tooltip">{{ label }}</span>
    <ul v-if="breakdown && rows.length > 1" class="location-summary-list">
      <li v-for="row in rows" :key="row.code">
        <span class="location-code">{{ row.name ? `${row.code} — ${row.name}` : row.code }}</span>
        <span class="location-qty">
          {{ $t('view.stock.product.qtyOnHand') }} {{ row.qty }}
          · {{ $t('view.stock.product.qtyReserved') }} {{ row.reserved ?? 0 }}
          · {{ $t('view.stock.product.qtyAvailable') }} {{ row.available ?? row.qty }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import { getExtraLocationCount, getLocationRows } from '@/services/utils/stock-location.js'

export default {
  name: 'LocationSummary',

  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    breakdown: {
      type: Boolean,
      default: false
    },
    empty: {
      type: String,
      default: '—'
    }
  },

  computed: {
    rows() {
      return getLocationRows(this.item)
    },
    label() {
      const code = this.item.location || this.empty
      const extra = getExtraLocationCount(this.item)
      return extra > 0 ? this.$t('view.stock.product.locationExtra', { code, n: extra }) : code
    },
    tooltip() {
      if (this.rows.length < 2) return null
      return this.rows.map((r) => `${r.code}: ${r.qty} (${this.$t('view.stock.product.qtyAvailable')} ${r.available ?? r.qty})`).join('\n')
    }
  }
}
</script>

<style lang="scss" scoped>
.location-summary-list {
  list-style: none;
  margin: var(--sp-xs, 4px) 0 0;
  padding: 0;
  font-size: 0.85rem;

  li {
    display: flex;
    flex-direction: column;
    padding: var(--sp-xs, 4px) 0;
  }
}

.location-qty {
  color: var(--base-font-color);
  opacity: 0.8;
}
</style>
