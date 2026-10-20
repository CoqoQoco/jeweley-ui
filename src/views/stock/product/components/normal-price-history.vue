<template>
  <SectionCardGeneric
    :title="$t('view.stock.product.quickPrice.normalHistoryTitle', { count: items.length })"
    headerStyle="legend"
    icon="bi-clipboard-data"
    accent="main"
  >
    <BaseDataTable
      :items="rows"
      :columns="columns"
      dataKey="running"
      :paginator="false"
      :emptyMessage="$t('view.stock.product.quickPrice.normalHistoryEmpty')"
    >
      <template #actionTemplate="{ data }">
        <ButtonGeneric
          variant="plain"
          icon="bi-eye"
          :title="$t('view.stock.product.quickPrice.viewNormalDetail')"
          :aria-label="$t('view.stock.product.quickPrice.viewNormalDetail')"
          @click="$emit('view', data.running)"
        />
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'NormalPriceHistory',

  components: { SectionCardGeneric, ButtonGeneric, BaseDataTable },

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

  emits: ['view'],

  computed: {
    rows() {
      return [...this.items]
        .sort((a, b) => new Date(b.createDate || 0) - new Date(a.createDate || 0))
        .map((v) => {
          const multiplier = Number(v.tagPriceMultiplier)
          const unit = String(v.currencyUnit || '').trim()
          return {
            running: v.running,
            createDate: v.createDate,
            createBy: v.createBy || '-',
            customerLabel: v.customerName || v.customerCode || '-',
            multiplierText: Number.isFinite(multiplier) && multiplier > 0 ? `× ${multiplier.toFixed(2)}` : '-',
            currencyLabel: unit && unit.toUpperCase() !== 'THB' ? unit : '-',
            totalPrice: v.totalPrice,
            remark: v.remark || '-'
          }
        })
    },

    columns() {
      const t = (key) => this.$t(`view.stock.product.quickPrice.${key}`)
      const cols = [
        { field: 'createDate', header: t('colDate'), sortable: false, minWidth: '150px', format: 'datetime' },
        { field: 'createBy', header: t('colBy'), sortable: false, minWidth: '110px' },
        { field: 'running', header: t('colRunning'), sortable: false, minWidth: '130px' },
        { field: 'customerLabel', header: t('colCustomer'), sortable: false, minWidth: '140px' },
        { field: 'multiplierText', header: t('colMultiplier'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'currencyLabel', header: t('colCurrency'), sortable: false, minWidth: '90px', align: 'center' }
      ]
      if (this.showCost) {
        cols.push({ field: 'totalPrice', header: t('colTotalPrice'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' })
      }
      cols.push(
        { field: 'remark', header: this.$t('common.field.remark'), sortable: false, minWidth: '160px' },
        { field: 'action', header: '', sortable: false, minWidth: '60px', align: 'center' }
      )
      return cols
    }
  }
}
</script>
