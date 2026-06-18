<template>
  <div class="appraisal-job-list">
    <!-- Job List -->
    <div v-if="jobs.length > 0" class="job-list">
      <JobCard
        v-for="job in jobs"
        :key="job.id"
        :job="job"
        :selected="isSelected(job)"
        :compact="true"
        @click="selectJob"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="mobile-empty-state">
      <i class="bi bi-calculator"></i>
      <div class="empty-title">{{ $t('view.mobile.sale.emptyAppraisalTitle') }}</div>
      <div class="empty-subtitle">{{ $t('view.mobile.sale.emptyAppraisalSubtitle') }}</div>
    </div>
  </div>
</template>

<script>
import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { JOB_TYPE } from '@/constants/job-type.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import JobCard from '@/views/mobile/components/job-card.vue'

export default {
  name: 'AppraisalJobList',

  components: {
    JobCard
  },

  props: {
    selectedItems: {
      type: Array,
      default: () => []
    }
  },

  emits: ['add-item'],

  setup() {
    const userApiStore = useUserApiStore()
    const productStore = usrStockProductApiStore()
    return { userApiStore, productStore }
  },

  data() {
    return {
      jobs: []
    }
  },

  mounted() {
    this.loadJobs()
  },

  methods: {
    async loadJobs() {
      const result = await this.userApiStore.fetchListMyJob({
        take: 10,
        skip: 0,
        sort: [{ field: 'createDate', dir: 'desc' }],
        search: {
          jobTypeId: [JOB_TYPE.PLAN_STOCK_COST],
          statusId: [100]
        }
      })

      if (result && result.data) {
        this.jobs = result.data
      }
    },

    isSelected(job) {
      return this.selectedItems.some((item) => item.jobRunning === job.jobRunning)
    },

    async selectJob(job) {
      if (this.isSelected(job)) {
        warning(this.$t('view.mobile.sale.warnItemAlreadyAdded'))
        return
      }

      // Fetch cost version data for this job
      const costData = await this.productStore.fetchGetCostVersion(job.jobRunning)

      if (costData) {
        // Also fetch stock data for product info
        let stockData = null
        if (costData.stockNumber) {
          stockData = await this.productStore.fetchDataGet({
            formValue: { stockNumber: costData.stockNumber }
          })
        }

        // Check if already added by stockNumber
        const alreadyExists = this.selectedItems.some(
          (item) => item.stockNumber === costData.stockNumber
        )

        if (alreadyExists) {
          warning(this.$t('view.mobile.sale.warnProductAlreadyAdded'))
          return
        }

        // Calculate total cost from appraisal
        const totalCost = costData.prictransection
          ? costData.prictransection.reduce((sum, t) => sum + (t.totalPrice || 0), 0)
          : 0

        const tagPriceMultiplier = Number(costData.tagPriceMultiplier) || 1
        const tagPrice = totalCost * tagPriceMultiplier

        this.$emit('add-item', {
          stockNumber: costData.stockNumber,
          productNumber: stockData?.productNumber || '',
          description: stockData?.productNameTh || stockData?.productNameEn || '',
          costPrice: totalCost,
          price: tagPrice,
          appraisalPrice: tagPrice,
          tagPriceMultiplier: tagPriceMultiplier,
          discountPercent: 0,
          qty: 1,
          materials: stockData?.materials || [],
          source: 'appraisal',
          jobRunning: job.jobRunning,
          imagePath: stockData?.imagePath || ''
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.appraisal-job-list {
  margin-bottom: 16px;
}

.job-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  text-align: center;

  i {
    font-size: 3rem;
    color: #ddd;
    margin-bottom: 12px;
  }

  .empty-title {
    font-size: 1rem;
    font-weight: 600;
    color: #666;
    margin-bottom: 4px;
  }

  .empty-subtitle {
    font-size: 0.8rem;
    color: #999;
  }
}
</style>
