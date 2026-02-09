<template>
  <div class="search-stock-container">
    <div class="filter-container mt-2">
      <div class="vertical-center-container mb-2">
        <span class="title-text-lg bi bi-search mr-2"></span>
        <span class="title-text-lg">ค้นหาสินค้า</span>
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
  </div>
</template>

<script>
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { warning } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'SearchStockView',

  emits: ['stock-selected'],

  setup() {
    const productStore = usrStockProductApiStore()
    return { productStore }
  },

  data() {
    return {
      form: {
        stockNumber: null
      }
    }
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


</style>
