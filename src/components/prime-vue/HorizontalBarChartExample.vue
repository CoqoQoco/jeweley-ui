<template>
  <div class="chart-example">
    <h3>Horizontal Bar Chart Example</h3>
    
    <!-- Thai Labels -->
    <div class="mb-4">
      <HorizontalBarChart 
        :data="sampleData"
        title="Production Status Report (Thai)"
        :use-thai-labels="true"
        :height="500"
      />
    </div>

    <!-- English Labels -->
    <div class="mb-4">
      <HorizontalBarChart 
        :data="sampleData"
        title="Production Status Report (English)"
        :use-thai-labels="false"
        :height="500"
      />
    </div>

    <!-- Custom Colors -->
    <div class="mb-4">
      <HorizontalBarChart 
        :data="sampleData"
        title="Production Status Report (Custom Colors)"
        :use-thai-labels="true"
        :colors="customColors"
        :height="500"
      />
    </div>
  </div>
</template>

<script>
import HorizontalBarChart from './HorizontalBarChart.vue'

export default {
  name: 'HorizontalBarChartExample',
  components: {
    HorizontalBarChart
  },
  data() {
    return {
      customColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'],
      sampleData: {
        "report": [
          {
            "status": 10,
            "statusNameTH": "ออกเเบบ",
            "statusNameEN": "Designed",
            "description": null,
            "reference": null,
            "count": 8
          },
          {
            "status": 49,
            "statusNameTH": "รอเเต่ง",
            "statusNameEN": "WaitCasting",
            "description": null,
            "reference": null,
            "count": 7
          },
          {
            "status": 50,
            "statusNameTH": "เเต่ง",
            "statusNameEN": "Casting",
            "description": "ช่างแต่ง",
            "reference": null,
            "count": 8
          },
          {
            "status": 59,
            "statusNameTH": "รอขัดดิบ",
            "statusNameEN": "WaitScrubb",
            "description": "",
            "reference": null,
            "count": 0
          },
          {
            "status": 60,
            "statusNameTH": "ขัดดิบ",
            "statusNameEN": "Scrubb",
            "description": "ช่างขัดดิบ",
            "reference": null,
            "count": 2
          },
          {
            "status": 69,
            "statusNameTH": "รอคัดพลอย",
            "statusNameEN": "WaitGems",
            "description": "",
            "reference": null,
            "count": 0
          },
          {
            "status": 70,
            "statusNameTH": "คัดพลอย",
            "statusNameEN": "Gems",
            "description": "ช่างคัดพลอย",
            "reference": null,
            "count": 6
          },
          {
            "status": 79,
            "statusNameTH": "รอฝัง",
            "statusNameEN": "WaitEmbedd",
            "description": "",
            "reference": null,
            "count": 0
          },
          {
            "status": 80,
            "statusNameTH": "ฝัง",
            "statusNameEN": "Embedd",
            "description": "ช่างฝัง",
            "reference": null,
            "count": 1
          },
          {
            "status": 89,
            "statusNameTH": "รอขัดชุบ",
            "statusNameEN": "WaitPlated",
            "description": null,
            "reference": null,
            "count": 1
          },
          {
            "status": 90,
            "statusNameTH": "ขัดชุบ",
            "statusNameEN": "Plated",
            "description": "ช่างชุบ",
            "reference": null,
            "count": 0
          },
          {
            "status": 94,
            "statusNameTH": "รอบัตรต้นทุน",
            "statusNameEN": "WaitPrice",
            "description": "",
            "reference": null,
            "count": 9
          },
          {
            "status": 95,
            "statusNameTH": "บัตรต้นทุน",
            "statusNameEN": "Price",
            "description": null,
            "reference": null,
            "count": 2
          },
          {
            "status": 100,
            "statusNameTH": "สำเร็จ",
            "statusNameEN": "Completed",
            "description": null,
            "reference": "สำเร็จ | ตรวจ CVD",
            "count": 17
          }
        ]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.chart-example {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: ChakraPetch-Regular, sans-serif;

  h3 {
    color: $base-font-color;
    text-align: center;
    margin-bottom: 30px;
    font-size: 24px;
    font-weight: bold;
  }
}

.mb-4 {
  margin-bottom: 2rem;
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

// Responsive adjustments
@media (max-width: 768px) {
  .chart-example {
    padding: 15px;
    
    h3 {
      font-size: 20px;
      margin-bottom: 20px;
    }
  }
  
  .mb-4 {
    margin-bottom: 1.5rem;
    padding: 8px;
  }
}
</style>