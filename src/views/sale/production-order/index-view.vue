<template>
  <div class="index-view-container">
    <!-- Header -->
    <div class="header-section">
      <h4 class="page-title">{{ $t('view.sale.productionOrder.title') }}</h4>
      <p class="page-subtitle">{{ $t('view.sale.productionOrder.subtitle') }}</p>
    </div>

    <!-- Search Section -->
    <SearchView 
      v-model:modelForm="modelSearchForm"
      @search="onSearch" 
    />

    <!-- Main Content -->
    <ProductionOrderView
      v-model:modelForm="modelProductionOrderForm"
      v-model:modelSaleOrder="modelSaleOrderData"
      @save="onSave"
      @confirm="onConfirm"
      @cancel="onCancel"
    />

    <!-- Sale Order Search Modal -->
    <SaleOrderSearchModal
      v-model:isShow="isShowSaleOrderModal"
      @select="onSelectSaleOrder"
      @close="onCloseSaleOrderModal"
    />
  </div>
</template>

<script>
import SearchView from './components/search-view.vue'
import ProductionOrderView from './components/production-order-view.vue'
import SaleOrderSearchModal from './modal/sale-order-search-modal.vue'

export default {
  name: 'ProductionOrderIndexView',

  components: {
    SearchView,
    ProductionOrderView,
    SaleOrderSearchModal
  },

  data() {
    return {
      // Search form model
      modelSearchForm: {
        saleOrderNumber: '',
        productNumber: '',
        searchType: 'saleOrder'
      },

      // Production Order form model
      modelProductionOrderForm: {
        productionOrderId: null,
        saleOrderId: null,
        number: '',
        orderDate: new Date(),
        requiredDate: null,
        priority: 'normal',
        status: 'Draft',
        remark: ''
      },

      // Sale Order data
      modelSaleOrderData: {},

      // Modal states
      isShowSaleOrderModal: false
    }
  },

  methods: {
    onSearch(searchData) {
      if (searchData.searchType === 'saleOrder' && searchData.saleOrderNumber) {
        this.searchSaleOrder(searchData.saleOrderNumber)
      } else if (searchData.searchType === 'product' && searchData.productNumber) {
        this.searchProduct(searchData.productNumber)
      } else {
        this.isShowSaleOrderModal = true
      }
    },

    async searchSaleOrder() {
      // TODO: API call to load sale order by saleOrderNumber
    },

    async searchProduct() {
      // TODO: Implement product search by productNumber
    },

    onSelectSaleOrder(saleOrder) {
      this.modelSaleOrderData = saleOrder
      this.isShowSaleOrderModal = false
    },

    onCloseSaleOrderModal() {
      this.isShowSaleOrderModal = false
    },

    onSave() {
      // TODO: API call to save
    },

    onConfirm() {
      // TODO: API call to confirm
    },

    onCancel() {
      // Clear forms or navigate back
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.index-view-container {
  padding: 1rem;
}

.header-section {
  margin-bottom: 1.5rem;
  
  .page-title {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .page-subtitle {
    color: #6c757d;
    margin-bottom: 0;
    font-size: 0.9rem;
  }
}
</style>