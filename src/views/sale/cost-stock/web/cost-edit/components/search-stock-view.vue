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
        <div class="form-col-sm-container">
          <!-- Stock Number (New) -->
          <div>
            <span class="title-text">เลขที่ผลิต (ใหม่)</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="form.stockNumber"
              placeholder="EX: DK-2502-00X"
              autocomplete="off"
            />
          </div>

          <!-- Stock Number Origin (Old) -->
          <div>
            <span class="title-text">เลขที่ผลิต (เก่า)</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="form.stockNumberOrigin"
              placeholder="EX: AD054XX"
              autocomplete="off"
            />
          </div>

          <!-- Product Number -->
          <div>
            <span class="title-text">รหัสสินค้า</span>
            <input
              :class="['form-control bg-input']"
              type="text"
              v-model.trim="form.productNumber"
              placeholder="EX: R08X50XXXL"
              autocomplete="off"
            />
          </div>

          <div class="btn-submit-container-custom">
            <button class="btn btn-sm btn-green mr-2 mt-4" type="submit" title="ค้นหา">
              <i class="bi bi-search"></i>
              <span class="ml-2">ค้นหา</span>
            </button>
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
        stockNumber: '',
        stockNumberOrigin: '',
        productNumber: ''
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
      if (!this.form.stockNumber && !this.form.stockNumberOrigin && !this.form.productNumber) {
        warning('กรุณากรอกเลขที่ผลิตหรือรหัสสินค้าอย่างน้อย 1 ช่อง', 'ข้อมูลไม่ครบถ้วน')
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
        this.form = {
          stockNumber: '',
          stockNumberOrigin: '',
          productNumber: ''
        }
      }
    },

    async fetchPlanCount() {
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
