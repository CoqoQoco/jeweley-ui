<template>
  <div class="cost-edit-container">
    <!-- Header Section -->
    <div class="filter-container">
      <div class="d-flex justify-content-between align-items-center">
        <div class="vertical-center-container">
          <span class="title-text-lg bi bi-calculator-fill mr-2"></span>
          <span class="title-text-lg">ตีราคาสินค้า</span>
        </div>
        <div>
          <button
            class="btn btn-sm btn-secondary"
            type="button"
            @click="onReset"
            title="รีเซ็ต"
          >
            <i class="bi bi-arrow-clockwise mr-1"></i>
            <span>รีเซ็ต</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search Stock Section -->
    <search-stock-view
      v-if="!selectedStock"
      @stock-selected="onStockSelected"
      @plan-selected="onPlanSelected"
    />

    <!-- Appraisal Form Section -->
    <appraisal-form-view
      v-if="selectedStock"
      :stock="selectedStock"
      @save="onSave"
      @save-and-new="onSaveAndNew"
      @cancel="onCancel"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const SearchStockView = defineAsyncComponent(() =>
  import('./components/search-stock-view.vue')
)
const AppraisalFormView = defineAsyncComponent(() =>
  import('./components/appraisal-form-view.vue')
)

import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { success } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'CostEditView',

  components: {
    SearchStockView,
    AppraisalFormView
  },

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      selectedStock: null
    }
  },

  methods: {
    onStockSelected(stock) {
      this.selectedStock = { ...stock }
    },

    async onPlanSelected(plan) {
      // Use the running number from plan to fetch stock data
      try {
        const data = await this.productStore.fetchDataGet({
          formValue: {
            stockNumber: plan.stockNumber
          }
        })

        if (data) {
          // แปลงข้อมูลให้ตรงกับรูปแบบที่ใช้ในหน้าตีราคา พร้อมเก็บ running เพื่อใช้ reference
          const stockData = {
            ...data,
            price: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
            appraisalPrice: data.productPrice ? Number(data.productPrice).toFixed(2) : 0,
            description: data.productNameEn,
            group: 'product',
            planQty: data.planQty || 1,
            stockNumberOrigin: data.stockNumberOrigin || data.stockNumber,
            materials: data.materials || [],
            priceTransactions: data.priceTransactions || [],
            // เก็บข้อมูลจากแผนไว้ใช้ reference และแสดงผล
            planRunning: plan.running,
            planRemark: plan.remark,
            planCreateDate: plan.createDate,
            planCreateBy: plan.createBy
          }

          this.selectedStock = stockData
        }
      } catch (error) {
        console.error('Error fetching stock from plan:', error)
      }
    },

    onSave(data) {
      success('บันทึกข้อมูลสำเร็จ', 'บันทึกราคาสินค้าเรียบร้อย')
      this.onReset()
    },

    onSaveAndNew(data) {
      success('บันทึกข้อมูลสำเร็จ', 'พร้อมตีราคาสินค้าใหม่')
      this.selectedStock = null
    },

    onCancel() {
      this.selectedStock = null
    },

    onReset() {
      this.selectedStock = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.cost-edit-container {
  padding: 10px;
}
</style>
