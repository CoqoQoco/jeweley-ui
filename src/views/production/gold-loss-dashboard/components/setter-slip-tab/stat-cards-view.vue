<template>
  <div class="stats-grid mt-2">
    <StatCardGeneric
      icon="bi-journal-text"
      :value="formatNumberValue(totals.slipCount)"
      :label="$t('view.production.goldLossSlipByWorker.statTotalSlips')"
      variant="main"
    />
    <StatCardGeneric
      icon="bi-box-arrow-up"
      :value="formatDecimalValue(totals.weightSend)"
      :label="$t('view.production.goldLossSlipByWorker.statTotalWeightSend')"
      variant="main"
    />
    <StatCardGeneric
      icon="bi-box-arrow-in-down"
      :value="formatDecimalValue(totals.weightCheck)"
      :label="$t('view.production.goldLossSlipByWorker.statTotalWeightCheck')"
      variant="green"
    />
    <StatCardGeneric
      icon="bi-arrow-left-right"
      :value="formatDecimalValue(totals.weightLossActual)"
      :label="$t('view.production.goldLossSlipByWorker.statTotalWeightLossActual')"
      variant="warning"
    />
    <StatCardGeneric
      icon="bi-cash-coin"
      :value="formatDecimalValue(totals.moneyDiff)"
      :label="$t('view.production.goldLossSlipByWorker.statTotalMoneyDiff')"
      variant="grey"
    />
  </div>
</template>

<script>
import { useGoldLossSlipByWorkerApiStore } from '@/stores/modules/api/production/gold-loss-slip-by-worker-api.js'
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'GoldLossSlipByWorkerStatCardsView',

  components: {
    StatCardGeneric
  },

  setup() {
    const goldLossSlipByWorkerStore = useGoldLossSlipByWorkerApiStore()
    return { goldLossSlipByWorkerStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    totals() {
      return this.goldLossSlipByWorkerStore.summaryData.data.reduce(
        (acc, row) => {
          acc.slipCount += row.slipCount || 0
          acc.weightSend += row.totalWeightSend || 0
          acc.weightCheck += row.totalWeightCheck || 0
          acc.weightLossActual += row.totalWeightLossActual || 0
          acc.moneyDiff += row.totalMoneyDiff || 0
          return acc
        },
        { slipCount: 0, weightSend: 0, weightCheck: 0, weightLossActual: 0, moneyDiff: 0 }
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
      await this.goldLossSlipByWorkerStore.fetchReportSummary({ formValue: this.modelForm })
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
