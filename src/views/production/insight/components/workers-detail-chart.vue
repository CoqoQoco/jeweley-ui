<!--
  workers-detail-chart — กราฟรายเดือนของช่างคนเดียว (คลิกแถวในตารางช่าง) — เรียก ProductionInsight/WorkerMonthly
  เอง (ไม่ได้มากับ Workers response หลัก) แท่งจำนวนงาน + เส้นค่าแรง (แกนขวา) — deptKey ต้องส่งคู่กับ code เสมอ
  (ช่างคนเดียวกันอาจทำงานมากกว่า 1 แผนกในช่วงที่เลือกได้) — แกน x ใช้ formatBucketMonthLabels เหมือนกราฟอื่น

  Props:
    code    — String (required) — รหัสช่างที่เลือก
    deptKey — String (required) — แผนกของแถวที่เลือก (ช่างคนเดียวกันอาจมีได้หลายแถวคนละแผนก)
    start   — Date (required)
    end     — Date (required)
-->
<template>
  <ChartGeneric type="line" :series="chartSeries" :options="options" :height="260" :loading="loading" :emptyText="$t('common.label.noData')" />
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { formatBucketMonthLabels } from '@/components/insight/insight-helpers.js'

import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'

export default {
  name: 'WorkersDetailChart',

  components: {
    ChartGeneric
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    code: {
      type: String,
      required: true
    },
    deptKey: {
      type: String,
      required: true
    },
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },

  data() {
    return {
      loading: false,
      series: []
    }
  },

  computed: {
    chartSeries() {
      return [
        { name: this.$t('view.productionInsight.workers.detailSeriesJobs'), type: 'bar', data: this.series.map((p) => p?.jobs ?? null) },
        { name: this.$t('view.productionInsight.workers.detailSeriesWages'), type: 'line', data: this.series.map((p) => p?.wages ?? null) }
      ]
    },

    options() {
      return {
        chart: { type: 'line', toolbar: { show: false } },
        colors: [CHART_TOKENS.primary, CHART_TOKENS.warning],
        stroke: { width: [0, 3], curve: 'smooth' },
        plotOptions: { bar: { columnWidth: '45%' } },
        xaxis: { categories: formatBucketMonthLabels(this.series.map((p) => p?.bucketEnd)) },
        yaxis: [
          { seriesName: this.$t('view.productionInsight.workers.detailSeriesJobs'), title: { text: this.$t('view.productionInsight.workers.jobsUnit') }, labels: { formatter: (v) => this.formatCount(v) } },
          {
            seriesName: this.$t('view.productionInsight.workers.detailSeriesWages'),
            opposite: true,
            title: { text: this.$t('view.productionInsight.workers.wagesUnit') },
            labels: { formatter: (v) => this.formatMoney(v) }
          }
        ],
        tooltip: { y: [{ formatter: (v) => this.formatCount(v) }, { formatter: (v) => this.formatMoney(v) }] }
      }
    },

    // รวม code+deptKey+start+end เป็น key เดียว กัน fetchData() ยิงซ้ำตอนเปลี่ยนหลายค่าพร้อมกัน (เช่นคลิกแถว
    // ใหม่ขณะที่ preset เปลี่ยน start+end พร้อมกันในจังหวะเดียว) — pattern เดียวกับที่แก้บั๊กยิงซ้ำทั่ว insight
    fetchKey() {
      return JSON.stringify([this.code, this.deptKey, this.start, this.end])
    }
  },

  watch: {
    fetchKey() {
      this.fetchData()
    }
  },

  methods: {
    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatMoney(value) {
      return value != null ? `฿${new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(value)}` : '—'
    },

    async fetchData() {
      this.loading = true
      const res = await this.productionInsightStore.fetchWorkerMonthly({
        code: this.code,
        deptKey: this.deptKey,
        start: this.start,
        end: this.end
      })
      this.series = res?.series || []
      this.loading = false
    }
  },

  mounted() {
    this.fetchData()
  }
}
</script>
