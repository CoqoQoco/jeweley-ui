<template>
  <div class="search-stock-container">
    <div class="filter-container mt-2">
      <div class="flex-group mb-2">
        <div class="vertical-center-container">
          <span class="title-text-lg bi bi-search mr-2"></span>
          <span class="title-text-lg">ค้นหาสินค้า</span>
        </div>

        <!-- Plan List Button with Badge -->
        <button
          type="button"
          class="btn btn-warning btn-sm position-relative"
          @click="openPlanModal"
          title="ดูรายการแผนตีราคา"
        >
          <i class="bi bi-list-ul mr-1"></i>
          รายการแผนตีราคา
          <span
            v-if="planCount > 0"
            class="badge badge-danger position-absolute top-0 start-100 translate-middle"
          >
            {{ planCount }}
          </span>
        </button>
      </div>

      <!-- Search Form -->
      <form @submit.prevent="onSearch">
        <div class="form-col-container">
          <!-- Stock Number Input -->
          <div>
            <span class="title-text">เลขที่ผลิต / รหัสสินค้า</span>
            <div class="input-group input-group-sm">
              <input
                class="form-control"
                type="text"
                v-model="form.stockNumber"
                placeholder="ค้นหาด้วยเลขที่ผลิตหรือรหัสสินค้า"
                autocomplete="off"
              />
              <div class="input-group-append">
                <button
                  type="submit"
                  class="btn btn-main btn-sm btn-input-group mt-1"
                >
                  <span class="bi bi-search"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Stock Cost Plan Modal -->
    <StockCostPlanModal
      v-model:visible="showPlanModal"
      @plan-selected="onPlanSelected"
    />
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { warning } from '@/services/alert/sweetAlerts.js'
import StockCostPlanModal from './stock-cost-plan-modal.vue'

export default {
  name: 'SearchStockView',

  components: {
    StockCostPlanModal
  },

  emits: ['stock-selected', 'plan-selected'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      form: {
        stockNumber: null
      },
      showPlanModal: false,
      planCount: 0
    }
  },

  mounted() {
    this.fetchPlanCount()
  },

  methods: {
    async onSearch() {
      if (!this.form.stockNumber) {
        warning('กรุณากรอกเลขที่ผลิตหรือรหัสสินค้า', 'ข้อมูลไม่ครบถ้วน')
        return
      }

      const data = await this.productStore.fetchDataGet({
        formValue: this.form
      })

      if (data) {
        // แปลงข้อมูลให้ตรงกับรูปแบบที่ใช้ในหน้าตีราคา
        const stockData = {
          ...data,
          price: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
          appraisalPrice: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
          description: data.productNameEn,
          group: 'product',
          planQty: data.planQty || 1,
          stockNumberOrigin: data.stockNumberOrigin || data.stockNumber,
          materials: data.materials || [],
          priceTransactions: data.priceTransactions || []
        }

        this.$emit('stock-selected', stockData)
        this.form.stockNumber = null
      }
    },

    async fetchPlanCount() {
      try {
        const response = await this.productStore.fetchListStockCostPlan({
          take: 1,
          skip: 0,
          sort: [],
          formValue: {
            isActive: true,
            statusId: 10 // Pending status (JobStatus.Pending = 10)
          }
        })

        if (response && response.total) {
          this.planCount = response.total
        }
      } catch (error) {
        console.error('Error fetching plan count:', error)
      }
    },

    openPlanModal() {
      this.showPlanModal = true
    },

    onPlanSelected(plan) {
      // Emit plan data to parent component
      this.$emit('plan-selected', plan)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.search-stock-container {
  margin-top: 10px;
}

.btn-input-group {
  //height: 35px;
  padding: 6px 12px;
  margin-top: 5px !important;
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.top-0 {
  top: 0;
}

.start-100 {
  left: 100%;
}

.translate-middle {
  transform: translate(-50%, -50%);
}

.badge {
  display: inline-block;
  padding: 0.25em 0.5em;
  font-size: 0.75em;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem;

  &.badge-danger {
    color: #fff;
    background-color: #dc3545;
  }
}
</style>
