<template>
  <div class="dashboard-stats-cards">
    <div class="stats-grid">
      <StatCardGeneric
        icon="bi-diagram-3"
        :value="totalPlans"
        :label="$t('view.production.dashboard.totalPlans')"
        variant="main"
      />
      <StatCardGeneric
        icon="bi-gear-wide-connected"
        :value="inProgressPlans"
        :label="$t('view.production.dashboard.inProcess')"
        variant="grey"
      />
      <StatCardGeneric
        icon="bi-check-circle-fill"
        :value="completedPlans"
        :label="$t('view.production.dashboard.completedYesterday')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-calendar-check"
        :value="summary.completedToday || 0"
        :label="$t('view.production.dashboard.completedToday')"
        variant="green"
      />
      <StatCardGeneric
        icon="bi-exclamation-triangle-fill"
        :value="pendingPlans"
        :label="$t('view.production.dashboard.overduePlans')"
        variant="warning"
      />
      <StatCardGeneric
        icon="bi-percent"
        :value="completionRateValue"
        :label="$t('view.production.dashboard.completionRate')"
        variant="main"
      />
    </div>
  </div>
</template>

<script>
import StatCardGeneric from '@/components/generic/StatCardGeneric.vue'

export default {
  name: 'DashboardStatsCards',

  components: {
    StatCardGeneric
  },

  props: {
    totalPlans: {
      type: Number,
      default: 0
    },
    inProgressPlans: {
      type: Number,
      default: 0
    },
    completedPlans: {
      type: Number,
      default: 0
    },
    pendingPlans: {
      type: Number,
      default: 0
    },
    summary: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    completionRateValue() {
      const rate = Number(this.summary?.percentageCompleted || 0)
      return `${rate.toFixed(2)}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-stats-cards {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: var(--sp-md);
    margin-bottom: var(--sp-lg);

    @media (max-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
