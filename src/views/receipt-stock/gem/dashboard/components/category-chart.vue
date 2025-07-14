<template>
  <div class="row">
    <div class="col-lg-12 col-md-12 mb-4">
      <div class="chart-card-body">
        <HorizontalBarChart
          v-if="categoryChartData && categoryChartData.report?.length > 0"
          :data="categoryChartData"
          :title="$t('view.stock.gem.dashboard.categoryBreakdown')"
          :height="1000"
          :show-data-labels="true"
          :datasetFields="datasetFields"
          :chartName="chartName"
          :maxBarThickness="2"
        />
        <div v-else-if="isLoading" class="chart-loading">
          <div class="loading-spinner">
            <i class="bi bi-arrow-repeat"></i>
          </div>
          <p>{{ $t('view.stock.gem.dashboard.loadingChart') }}</p>
        </div>
        <div v-else class="chart-empty">
          <i class="bi bi-graph-up"></i>
          <p>{{ $t('view.stock.gem.dashboard.noData') }}</p>
        </div>
      </div>
      <!-- <div class="chart-card">
        <div class="chart-card-header">
          <h5>{{ $t('view.stock.gem.dashboard.categoryBreakdown') }}</h5>
        </div>
        <div class="chart-card-body">
          <HorizontalBarChart
            v-if="categoryChartData && categoryChartData.report?.length > 0"
            :data="categoryChartData"
            :title="$t('view.stock.gem.dashboard.categoryBreakdown')"
            :height="1000"
            :show-data-labels="true"
            :datasetFields="datasetFields"
            :chartName="chartName"
            :maxBarThickness="2"
          />
          <div v-else-if="isLoading" class="chart-loading">
            <div class="loading-spinner">
              <i class="bi bi-arrow-repeat"></i>
            </div>
            <p>{{ $t('view.stock.gem.dashboard.loadingChart') }}</p>
          </div>
          <div v-else class="chart-empty">
            <i class="bi bi-graph-up"></i>
            <p>{{ $t('view.stock.gem.dashboard.noData') }}</p>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import HorizontalBarChart from '@/components/prime-vue/HorizontalBarChart.vue'

export default {
  name: 'CategoryChart',
  components: {
    HorizontalBarChart
  },
  props: {
    categoryChartData: {
      type: Object,
      default: () => ({})
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    datasetFields: {
      type: Array,
      default: () => []
    },
    chartName: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.chart-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .chart-card-header {
    padding: 20px;
    border-bottom: 1px solid $base-color;

    h5 {
      color: $base-font-color;
      font-weight: bold;
      margin: 0;
    }
  }

  .chart-card-body {
    padding: 20px 20px;

    .chart-loading,
    .chart-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
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
