<template>
  <SectionCardGeneric
    :title="$t('view.stock.product.quickPrice.historyTitle', { count: items.length })"
    headerStyle="legend"
    icon="bi-clock-history"
    accent="main"
  >
    <BaseDataTable
      :items="items"
      :columns="columns"
      :paginator="false"
      :emptyMessage="$t('view.stock.product.quickPrice.historyEmpty')"
    >
      <template #goldPriceTemplate="{ data }">
        <span>{{ formatPlainNumber(data.goldPrice) }}</span>
      </template>
      <template #markupTemplate="{ data }">
        <span>{{ formatPlainNumber(data.markup) }}</span>
      </template>
      <template #percentTemplate="{ data }">
        <span>{{ formatPlainNumber(data.percent ?? 0) }}%</span>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { formatPlainNumber } from '@/services/helper/quick-price.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'QuickPriceHistory',

  components: { SectionCardGeneric, BaseDataTable },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    showCost: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    columns() {
      const t = (key) => this.$t(`view.stock.product.quickPrice.${key}`)
      const cols = [
        { field: 'createDate', header: t('colDate'), sortable: false, minWidth: '150px', format: 'datetime' },
        { field: 'createBy', header: t('colBy'), sortable: false, minWidth: '110px' },
        { field: 'goldPrice', header: t('colGoldPrice'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'markup', header: t('markup'), sortable: false, minWidth: '80px', align: 'right' }
      ]
      if (this.showCost) {
        cols.push({ field: 'costExGold', header: t('costExGold'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' })
      }
      cols.push(
        { field: 'percent', header: t('colPercent'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'quickPrice', header: t('colQuickPrice'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'remark', header: this.$t('common.field.remark'), sortable: false, minWidth: '160px' }
      )
      return cols
    }
  },

  methods: {
    formatPlainNumber
  }
}
</script>
