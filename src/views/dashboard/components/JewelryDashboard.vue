<template>
  <div class="jewelry-dashboard">
    <div class="row">
      <div class="col-md-6 chart">
        <apexchart :options="chartOptions" :series="series" type="bar" />
      </div>
      <div class="col-md-6 chart">
        <apexchart :options="chartOptions" :series="series" type="bar" />
      </div>
    </div>
    <div class="row" style="padding-top: 100px">
      <div class="col-md-6 chart">
        <apexchart :options="chartOptions" :series="series" type="bar" />
      </div>
      <div class="col-md-6 chart">
        <apexchart :options="chartOptions" :series="series" type="bar" />
      </div>
    </div>
  </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

export default {
  components: {
    apexchart: VueApexCharts
  },
  computed: {
    chartOptions() {
      return {
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        chart: {
          height: 350,
          type: 'bar'
        },
        title: {
          text: 'Jewelry Production and Sales'
        }
      }
    },
    series() {
      return [
        {
          name: 'Production',
          data: [30, 50, 45, 60, 55, 70]
        },
        {
          name: 'Sales',
          data: [20, 40, 35, 50, 45, 60]
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.jewelry-dashboard {
  padding-top: 35px;
  /* display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; */
}
.chart {
  width: 600px;
  //height: 400px;
}
</style>
