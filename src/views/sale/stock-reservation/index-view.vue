<template>
  <div class="index-view-container">
    <!-- Header -->
    <div class="header-section">
      <h4 class="page-title">การจองสต็อกสินค้า (Stock Reservation)</h4>
      <p class="page-subtitle">จัดการการจองและคืนสต็อกสินค้าจากใบสั่งขาย</p>
    </div>

    <!-- Search Section -->
    <SearchView 
      v-model:modelForm="modelSearchForm"
      @search="onSearch" 
    />

    <!-- Main Content -->
    <StockReservationView
      v-model:modelForm="modelReservationForm"
      v-model:modelSaleOrder="modelSaleOrderData"
      @reserve="onReserve"
      @unreserve="onUnreserve"
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
import StockReservationView from './components/stock-reservation-view.vue'
//import SaleOrderSearchModal from './modal/sale-order-search-modal.vue'

export default {
  name: 'StockReservationIndexView',

  components: {
    SearchView,
    StockReservationView,
    //SaleOrderSearchModal
  },

  data() {
    return {
      // Search form model
      modelSearchForm: {
        saleOrderNumber: '',
        productNumber: '',
        customerName: '',
        searchType: 'saleOrder'
      },

      // Reservation form model
      modelReservationForm: {
        reservationId: null,
        saleOrderId: null,
        reservationDate: new Date(),
        expiryDate: null,
        status: 'Active',
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
      } else if (searchData.searchType === 'customer' && searchData.customerName) {
        this.searchCustomer(searchData.customerName)
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
          expectedDeliveryDate: '2025-02-15',
          items: [
            {
              itemId: 1,
              productId: 1,
              productNumber: 'R001',
              productName: 'Diamond Ring Set',
              itemType: 'Stock',
              quantity: 2,
              unitPrice: 15000,
              stockAvailable: 5,
              reserved: 0,
              isReserved: false
            },
            {
              itemId: 2,
              productId: 3,
              productNumber: 'B001',
              productName: 'Gold Bracelet',
              itemType: 'Stock',
              quantity: 1,
              unitPrice: 12000,
              stockAvailable: 3,
              reserved: 0,
              isReserved: false
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

    async searchCustomer(customerName) {
      console.log('Search customer:', customerName)
      // TODO: Implement customer search
    },

    onSelectSaleOrder(saleOrder) {
      this.modelSaleOrderData = saleOrder
      this.isShowSaleOrderModal = false
    },

    onCloseSaleOrderModal() {
      this.isShowSaleOrderModal = false
    },

    onReserve(reservationData) {
      console.log('Reserve stock:', reservationData)
      // TODO: API call to reserve stock
    },

    onUnreserve(reservationData) {
      console.log('Unreserve stock:', reservationData)
      // TODO: API call to unreserve stock
    },

    onConfirm(reservationData) {
      console.log('Confirm reservation:', reservationData)
      // TODO: API call to confirm
    },

    onCancel() {
      console.log('Cancel reservation')
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