<template>
  <div>
    <div class="stat-grid">
      <StatCardGeneric
        icon="bi-collection"
        :value="totalTypes"
        :label="$t('view.stock.gold.statTotalTypes')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-box-seam"
        :value="formatWeight(totalWeight)"
        :label="$t('view.stock.gold.statTotalWeight')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-arrow-up-square"
        :value="formatWeight(totalWeightOnProcess)"
        :label="$t('view.stock.gold.statTotalOnProcess')"
        variant="warning"
      />
    </div>

    <SectionCardGeneric
      class="mt-3"
      :title="$t('view.stock.gold.summaryTitle')"
      icon="bi-pie-chart"
      accent="main"
      headerStyle="legend"
    >
      <BaseDataTable
        :items="groupedItems"
        :columns="columns"
        :paginator="false"
        dataKey="goldCode"
        :emptyMessage="$t('common.label.noData')"
      />
    </SectionCardGeneric>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'StockGoldSummaryView',

  components: {
    BaseDataTable,
    SectionCardGeneric,
    StatCardGeneric
  },

  props: {
    totalTypes: {
      type: Number,
      default: 0
    },
    totalWeight: {
      type: Number,
      default: 0
    },
    totalWeightOnProcess: {
      type: Number,
      default: 0
    },
    groupedItems: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    columns() {
      return [
        { field: 'goldCode', header: this.$t('view.stock.gold.colGoldCode'), minWidth: '120px' },
        { field: 'goldNameTh', header: this.$t('view.stock.gold.colGoldName'), minWidth: '180px' },
        {
          field: 'weight',
          header: this.$t('view.stock.gold.colWeight'),
          minWidth: '140px',
          align: 'right',
          format: 'decimal3'
        },
        {
          field: 'weightOnProcess',
          header: this.$t('view.stock.gold.colWeightOnProcess'),
          minWidth: '140px',
          align: 'right',
          format: 'decimal3'
        }
      ]
    }
  },

  methods: {
    formatWeight(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      }).format(value || 0)
    }
  }
}
</script>

<style lang="scss" scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--sp-lg);
}
</style>
