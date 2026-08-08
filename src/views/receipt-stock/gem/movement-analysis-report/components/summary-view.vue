<template>
  <div class="gem-movement-summary-grid">
    <StatCardGeneric
      icon="bi-fire"
      :value="formatCount(gemMovementAnalysisStore.summary.fastCount)"
      :label="$t('view.stock.gemMovementAnalysis.statusType.fast')"
      variant="green"
    />
    <StatCardGeneric
      icon="bi-hourglass-split"
      :value="formatCount(gemMovementAnalysisStore.summary.slowCount)"
      :label="$t('view.stock.gemMovementAnalysis.statusType.slow')"
      variant="warning"
    />
    <StatCardGeneric
      icon="bi-pause-circle"
      :value="formatCount(gemMovementAnalysisStore.summary.deadCount)"
      :label="$t('view.stock.gemMovementAnalysis.statusType.dead')"
      variant="grey"
    />
    <StatCardGeneric
      icon="bi-exclamation-triangle"
      :value="formatCount(gemMovementAnalysisStore.summary.lowOutCount)"
      :label="$t('view.stock.gemMovementAnalysis.summaryLowOut')"
      variant="warning"
    />
  </div>
</template>

<script>
import { useGemMovementAnalysisApiStore } from '@/stores/modules/api/stock/gem-movement-analysis-api.js'

import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'GemMovementAnalysisSummaryView',

  components: {
    StatCardGeneric
  },

  setup() {
    const gemMovementAnalysisStore = useGemMovementAnalysisApiStore()
    return { gemMovementAnalysisStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        this.gemMovementAnalysisStore.fetchSummary({ formValue: val })
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    formatCount(value) {
      const count = value || 0
      return `${new Intl.NumberFormat('th-TH').format(count)} ${this.$t('view.stock.gemMovementAnalysis.unitCode')}`
    }
  }
}
</script>

<style lang="scss" scoped>
.gem-movement-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-lg);
  margin: var(--sp-lg) 0;
}

@media (max-width: 1024px) {
  .gem-movement-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
