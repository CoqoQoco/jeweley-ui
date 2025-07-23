<template>
  <div class="dashboard-chart-section">
    <!-- Production Status Chart -->
    <div class="chart-card-body">
      <HorizontalBarChart
        v-if="chartData && chartData.report.length > 0"
        :data="chartData"
        :title="$t('view.production.dashboard.productionStatus')"
        :use-thai-labels="$i18n.locale === 'th'"
        :height="600"
        :show-data-labels="true"
      />
      <div v-else-if="isLoading" class="chart-loading">
        <div class="loading-spinner">
          <i class="bi bi-arrow-repeat"></i>
        </div>
        <p>{{ $t('view.production.dashboard.loadingChart') }}</p>
      </div>
      <div v-else class="chart-empty">
        <i class="bi bi-graph-up"></i>
        <p>{{ $t('view.production.dashboard.noData') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import HorizontalBarChart from '@/components/prime-vue/HorizontalBarChart.vue'

export default {
  name: 'DashboardChartSection',
  components: {
    HorizontalBarChart
  },
  props: {
    chartData: {
      type: Object,
      default: () => null
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.dashboard-chart-section {
  .chart-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .chart-card-body {
    //padding: 20px;

    .chart-loading,
    .chart-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: $base-sub-color;

      i {
        font-size: 48px;
        margin-bottom: 15px;
      }

      .loading-spinner i {
        animation: spin 1s linear infinite;
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
