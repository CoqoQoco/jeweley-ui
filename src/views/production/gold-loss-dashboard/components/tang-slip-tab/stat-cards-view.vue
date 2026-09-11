<template>
  <div class="stats-grid mt-2">
    <StatCardGeneric
      icon="bi-journal-text"
      :value="formatNumberValue(totals.slipCount)"
      :label="$t('view.production.goldLossTangByWorker.statTotalSlips')"
      variant="main"
    />
    <StatCardGeneric
      icon="bi-box-arrow-up"
      :value="formatDecimalValue(totals.issuedTotal)"
      :label="$t('view.production.goldLossTangByWorker.statTotalIssued')"
      variant="main"
    />
    <StatCardGeneric
      icon="bi-box-arrow-in-down"
      :value="formatDecimalValue(totals.returnedTotal)"
      :label="$t('view.production.goldLossTangByWorker.statTotalReturned')"
      variant="green"
    />
    <StatCardGeneric
      icon="bi-arrow-left-right"
      :value="formatDecimalValue(totals.diffLoss)"
      :label="$t('view.production.goldLossTangByWorker.statTotalDiffLoss')"
      variant="warning"
    />
    <StatCardGeneric
      icon="bi-cash-coin"
      :value="formatDecimalValue(totals.moneyDiff)"
      :label="$t('view.production.goldLossTangByWorker.statTotalMoney')"
      variant="grey"
    />
  </div>
</template>

<script>
import { useGoldLossTangByWorkerApiStore } from '@/stores/modules/api/production/gold-loss-tang-by-worker-api.js'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'GoldLossTangByWorkerStatCardsView',

  components: {
    StatCardGeneric
  },

  setup() {
    const goldLossTangByWorkerStore = useGoldLossTangByWorkerApiStore()
    return { goldLossTangByWorkerStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    totals() {
      return this.goldLossTangByWorkerStore.summaryData.data.reduce(
        (acc, row) => {
          acc.slipCount += row.slipCount || 0
          acc.issuedTotal += row.totalIssued || 0
          acc.returnedTotal += row.totalReturned || 0
          acc.diffLoss += row.totalDiffLoss || 0
          acc.moneyDiff += row.totalMoneyDiff || 0
          return acc
        },
        { slipCount: 0, issuedTotal: 0, returnedTotal: 0, diffLoss: 0, moneyDiff: 0 }
      )
    }
  },

  watch: {
    modelForm: {
      handler() {
        this.fetchSummary()
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    formatNumberValue(value) {
      return new Intl.NumberFormat('th-TH').format(value || 0)
    },

    formatDecimalValue(value) {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0)
    },

    async fetchSummary() {
      await this.goldLossTangByWorkerStore.fetchReportSummary({ formValue: this.modelForm })
    }
  }
}
</script>

<style lang="scss" scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--sp-md);

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
