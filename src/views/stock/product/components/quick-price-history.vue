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
      <template #saleGoldPriceTemplate="{ data }">
        <span>{{ formatPlainNumber(data.saleGoldPrice) }}</span>
      </template>
      <template #markupTemplate="{ data }">
        <span>{{ formatPlainNumber(data.markup) }}</span>
      </template>
      <template #percentTemplate="{ data }">
        <span>{{ formatPlainNumber(data.percent ?? 0) }}%</span>
      </template>
      <template #goldLossPercentTemplate="{ data }">
        <span>{{ hasValue(data.goldLossPercent) ? `${formatPlainNumber(data.goldLossPercent)}%` : '—' }}</span>
      </template>
      <template #goldLossCostTotalTemplate="{ data }">
        <span>{{ formatMoney2(data.goldLossCostTotal) }}</span>
      </template>
      <template #goldLossTotalPriceTemplate="{ data }">
        <span>{{ formatMoney2(data.goldLossTotalPrice) }}</span>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { formatMoney2, formatPlainNumber } from '@/services/helper/quick-price.js'

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
        { field: 'saleGoldPrice', header: t('colSaleGoldPrice'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'markup', header: t('markup'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'karat', header: t('colKarat'), sortable: false, minWidth: '70px', align: 'center' },
        { field: 'alloyWeight', header: t('colAlloyWeight'), sortable: false, minWidth: '90px', align: 'right', format: 'decimal3' },
        { field: 'goldCostTotal', header: t('goldCostTotal'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' }
      ]
      if (this.showCost) {
        cols.push({ field: 'costExGold', header: t('costExGold'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' })
      }
      cols.push(
        { field: 'percent', header: t('colPercent'), sortable: false, minWidth: '80px', align: 'right' },
        { field: 'quickPrice', header: t('colQuickPrice'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'totalPrice', header: t('colTotalPriceQuick'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'goldLossPercent', header: t('colGoldLossPercent'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'goldLossCostTotal', header: t('goldLossCostTotal'), sortable: false, minWidth: '150px', align: 'right' },
        { field: 'goldLossTotalPrice', header: t('totalPriceGoldLossShort'), sortable: false, minWidth: '170px', align: 'right' },
        { field: 'remark', header: this.$t('common.field.remark'), sortable: false, minWidth: '160px' }
      )
      return cols
    }
  },

  methods: {
    formatMoney2,
    formatPlainNumber,

    hasValue(value) {
      return value !== null && value !== undefined && value !== ''
    }
  }
}
</script>
