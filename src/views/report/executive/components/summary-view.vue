<template>
  <SectionCardGeneric :title="$t('view.executive.summary.title')" icon="bi-clipboard-data" accent="main" headerStyle="dashboard" class="section-card-block">
    <div class="kpi-grid">
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-hourglass-bottom"
          :value="formatCount(summary.production.stale180dCount)"
          :label="$t('view.executive.summary.stalePlans')"
          :subLabel="stalePlansSubLabel"
          :variant="resolveKpiVariant(summary.production.stale180dCount > 0)"
          :clickable="true"
          @click="onKpiClick('stalePlans')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-receipt"
          :value="formatMoneyAbbreviated(summary.receivables.unpaidThb)"
          :label="$t('view.executive.summary.receivablesOutstanding')"
          :subLabel="receivablesOutstandingSubLabel"
          :variant="resolveKpiVariant(summary.receivables.overdueCount > 0)"
          :clickable="true"
          @click="onKpiClick('receivablesOutstanding')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-calendar-x"
          :value="formatCount(summary.receivables.noDueDateCount)"
          :label="$t('view.executive.summary.noDueDate')"
          :subLabel="noDueDateSubLabel"
          :variant="resolveKpiVariant(summary.receivables.noDueDateCount > 0)"
          :clickable="true"
          @click="onKpiClick('noDueDate')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-cart-x"
          :value="formatMoneyAbbreviated(summary.salesOrders.noInvoiceThb)"
          :label="$t('view.executive.summary.soNoInvoice')"
          :subLabel="soNoInvoiceSubLabel"
          :variant="resolveKpiVariant(summary.salesOrders.noInvoiceCount > 0)"
          :clickable="true"
          @click="onKpiClick('soNoInvoice')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-box-seam"
          :value="stockNoCostPercentLabel"
          :label="$t('view.executive.summary.stockNoCost')"
          :subLabel="stockNoCostSubLabel"
          :variant="resolveKpiVariant(stockNoCostPercent >= 50)"
          :clickable="true"
          @click="onKpiClick('stockNoCost')"
        />
      </div>
      <div class="kpi-card">
        <StatCardGeneric
          icon="bi-exclamation-triangle"
          :value="goldLossPercentLabel"
          :label="$t('view.executive.summary.goldLossOverAllowed')"
          :subLabel="goldLossOverAllowedSubLabel"
          :variant="goldLossKpiVariant"
          :clickable="true"
          @click="onKpiClick('goldLossOverAllowed')"
        />
      </div>
    </div>
  </SectionCardGeneric>
</template>

<script>
import {
  resolveKpiVariant,
  resolveKpiTab,
  formatMoneyAbbreviated,
  formatGramAmount,
  calcPercent,
  resolveGoldLossKpiVariant,
  resolveLatestGoldLossRow
} from '../executive-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'ExecutiveSummaryView',

  components: {
    SectionCardGeneric,
    StatCardGeneric
  },

  props: {
    summary: {
      type: Object,
      required: true
    }
  },

  emits: ['select-tab'],

  computed: {
    stalePlansSubLabel() {
      return this.$t('view.executive.summary.stalePlansSub', {
        openCount: this.formatCount(this.summary.production.openCount),
        moved30dCount: this.formatCount(this.summary.production.moved30dCount)
      })
    },

    receivablesOutstandingSubLabel() {
      return this.$t('view.executive.summary.receivablesOutstandingSub', {
        unpaidCount: this.formatCount(this.summary.receivables.unpaidCount),
        invoiceCount: this.formatCount(this.summary.receivables.invoiceCount),
        overdueThb: formatMoneyAbbreviated(this.summary.receivables.overdueThb),
        overdueCount: this.formatCount(this.summary.receivables.overdueCount)
      })
    },

    noDueDateSubLabel() {
      return this.$t('view.executive.summary.noDueDateSub', {
        invoiceCount: this.formatCount(this.summary.receivables.invoiceCount)
      })
    },

    soNoInvoiceSubLabel() {
      return this.$t('view.executive.summary.soNoInvoiceSub', {
        noInvoiceCount: this.formatCount(this.summary.salesOrders.noInvoiceCount),
        overdueNoInvoiceCount: this.formatCount(this.summary.salesOrders.overdueNoInvoiceCount),
        noDeliveryDateCount: this.formatCount(this.summary.salesOrders.noDeliveryDateCount)
      })
    },

    stockNoCostPercent() {
      return calcPercent(this.summary.stock.noCostCount, this.summary.stock.inStockCount)
    },

    stockNoCostPercentLabel() {
      return `${this.stockNoCostPercent}%`
    },

    stockNoCostSubLabel() {
      return this.$t('view.executive.summary.stockNoCostSub', {
        noCostCount: this.formatCount(this.summary.stock.noCostCount),
        inStockCount: this.formatCount(this.summary.stock.inStockCount)
      })
    },

    latestGoldLossRow() {
      return resolveLatestGoldLossRow(this.summary.goldLoss)
    },

    goldLossKpiVariant() {
      return resolveGoldLossKpiVariant(this.latestGoldLossRow.lossPercent, this.latestGoldLossRow.allowedPercent)
    },

    goldLossPercentLabel() {
      return `${formatGramAmount(this.latestGoldLossRow.lossPercent)}%`
    },

    goldLossOverAllowedSubLabel() {
      return this.$t('view.executive.summary.goldLossOverAllowedSub', {
        allowedPercent: formatGramAmount(this.latestGoldLossRow.allowedPercent),
        overSlipCount: this.formatCount(this.latestGoldLossRow.overSlipCount),
        overAllowedGram: formatGramAmount(this.latestGoldLossRow.overAllowedGram)
      })
    }
  },

  methods: {
    resolveKpiVariant,
    formatMoneyAbbreviated,

    formatCount(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    onKpiClick(kpiKey) {
      this.$emit('select-tab', resolveKpiTab(kpiKey))
    }
  }
}
</script>

<style lang="scss" scoped>
.section-card-block {
  margin-bottom: var(--sp-lg);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.kpi-card {
  height: 100%;

  :deep(.stat-card) {
    height: 100%;
  }
}
</style>
