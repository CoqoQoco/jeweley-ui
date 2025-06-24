<template>
  <div class="horizontal-bar-chart">
    <div class="chart-container">
      <h4 v-if="title" class="chart-title">{{ title }}</h4>
      <Chart 
        type="bar" 
        :data="chartData" 
        :options="chartOptions" 
        :width="width"
        :height="height"
        class="chart-component"
      />
    </div>
  </div>
</template>

<script>
import Chart from 'primevue/chart'

export default {
  name: 'HorizontalBarChart',
  components: {
    Chart
  },
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({ report: [] })
    },
    title: {
      type: String,
      default: 'Chart'
    },
    height: {
      type: [String, Number],
      default: 800
    },
    width: {
      type: [String, Number],
      default: '100%'
    },
    useThaiLabels: {
      type: Boolean,
      default: true
    },
    showDataLabels: {
      type: Boolean,
      default: true
    },
    colors: {
      type: Array,
      default: () => ['#038387', '#921313']
    }
  },
  computed: {
    chartOptions() {
      return {
        indexAxis: 'y', // This makes it horizontal
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false // We handle title separately
          },
          legend: {
            display: false // Single dataset doesn't need legend
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex
                const report = this.data.report[index]
                return this.useThaiLabels ? report.statusNameTH : report.statusNameEN
              },
              label: (context) => {
                const index = context.dataIndex
                const report = this.data.report[index]
                return [
                  `Count: ${context.parsed.x}`,
                  `Status Code: ${report.status}`,
                  `Description: ${report.description || 'N/A'}`
                ]
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count',
              color: 'var(--base-font-color)',
              font: {
                size: 14,
                //weight: 'bold'
              }
            },
            grid: {
              color: 'var(--base-color)',
              borderColor: 'var(--base-sub-color)'
            },
            ticks: {
              color: 'var(--base-sub-color)',
              font: {
                size: 12
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Description',
              color: 'var(--base-font-color)',
              font: {
                size: 14,
                //weight: 'bold'
              }
            },
            grid: {
              display: false
            },
            ticks: {
              color: 'var(--base-sub-color)',
              font: {
                size: 12
              }
            }
          }
        },
        elements: {
          bar: {
            borderWidth: 1,
            borderColor: 'var(--base-sub-color)'
          }
        }
      }
    },
    chartData() {
      if (!this.data || !this.data.report) return { labels: [], datasets: [] }
      
      const labels = this.data.report.map(item => 
        this.useThaiLabels ? item.statusNameTH : item.statusNameEN
      )
      
      const counts = this.data.report.map(item => item.count)
      
      return {
        labels: labels,
        datasets: [
          {
            label: 'Count',
            data: counts,
            backgroundColor: this.backgroundColors,
            borderColor: this.borderColors,
            borderWidth: 1,
            barThickness: 30
          }
        ]
      }
    },
    backgroundColors() {
      const baseColors = this.colors.length > 0 ? this.colors : [
        '#921313', '#038387', '#fabc3f', '#ff4d4d', '#e0e0e0', '#393939', '#DAD4B5'
      ]
      return this.data.report.map((_, index) => 
        baseColors[index % baseColors.length] + '80' // Add transparency
      )
    },
    borderColors() {
      const baseColors = this.colors.length > 0 ? this.colors : [
        '#921313', '#038387', '#fabc3f', '#ff4d4d', '#e0e0e0', '#393939', '#DAD4B5'
      ]
      return this.data.report.map((_, index) => 
        baseColors[index % baseColors.length]
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.horizontal-bar-chart {
  width: 100%;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: ChakraPetch-Regular, sans-serif;

  .chart-container {
    position: relative;
    width: 100%;

    .chart-title {
      color: $base-font-color;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid $base-color;
    }

    .chart-component {
      position: relative;
      width: 100%;
      min-height: 400px;
    }
  }

  // Responsive design
  @media (max-width: 768px) {
    padding: 10px;
    
    .chart-container {
      .chart-title {
        font-size: 16px;
        margin-bottom: 15px;
      }
      
      .chart-component {
        min-height: 300px;
      }
    }
  }

  @media (max-width: 480px) {
    padding: 8px;
    
    .chart-container {
      .chart-title {
        font-size: 14px;
        margin-bottom: 10px;
      }
      
      .chart-component {
        min-height: 250px;
      }
    }
  }
}

// Chart.js specific overrides
:deep(.chartjs-render-monitor) {
  background: transparent;
}

:deep(.chart-component canvas) {
  max-width: 100% !important;
  height: auto !important;
}
</style>