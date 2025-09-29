<template>
  <div class="index-view-container">
    <!-- Header -->
    <div class="header-section">
      <h4 class="page-title">ใบสั่งผลิต (Production Order)</h4>
      <p class="page-subtitle">จัดการใบสั่งผลิตสินค้าจากใบสั่งขาย</p>
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
//import SaleOrderSearchModal from './modal/sale-order-search-modal.vue'

export default {
  name: 'ProductionOrderIndexView',

  components: {
    SearchView,
    ProductionOrderView,
    //SaleOrderSearchModal
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
      console.log('Search triggered:', searchData)
      
      if (searchData.searchType === 'saleOrder' && searchData.saleOrderNumber) {
        this.searchSaleOrder(searchData.saleOrderNumber)
      } else if (searchData.searchType === 'product' && searchData.productNumber) {
        this.searchProduct(searchData.productNumber)
      } else {
        // Open modal for selection
        this.isShowSaleOrderModal = true
      }
    },

    async searchSaleOrder(saleOrderNumber) {
      try {
        // TODO: API call to load sale order
        console.log('Loading sale order:', saleOrderNumber)
        
        // Mock data
        this.modelSaleOrderData = {
          saleOrderId: 1,
          number: saleOrderNumber,
          customerName: 'บริษัท ABC จำกัด',
          orderDate: '2025-01-15',
          items: [
            {
              itemId: 1,
              productId: 2,
              productNumber: 'N002',
              productName: 'Custom Gold Necklace',
              itemType: 'Production',
              quantity: 1,
              unitPrice: 25000,
              estimatedProductionDays: 14
            }
          ]
        }
      } catch (error) {
        console.error('Error loading sale order:', error)
      }
    },

    async searchProduct(productNumber) {
      console.log('Search product:', productNumber)
      // TODO: Implement product search
    },

    onSelectSaleOrder(saleOrder) {
      this.modelSaleOrderData = saleOrder
      this.isShowSaleOrderModal = false
    },

    onCloseSaleOrderModal() {
      this.isShowSaleOrderModal = false
    },

    onSave(productionOrderData) {
      console.log('Save production order:', productionOrderData)
      // TODO: API call to save
    },

    onConfirm(productionOrderData) {
      console.log('Confirm production order:', productionOrderData)
      // TODO: API call to confirm
    },

    onCancel() {
      console.log('Cancel production order')
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