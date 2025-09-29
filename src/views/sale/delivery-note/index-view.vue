<template>
  <div class="index-view-container">
    <!-- Header -->
    <div class="header-section">
      <h4 class="page-title">ใบส่งของ (Delivery Note)</h4>
      <p class="page-subtitle">จัดการการส่งมอบสินค้าให้ลูกค้า</p>
    </div>

    <!-- Search Section -->
    <SearchView 
      v-model:modelForm="modelSearchForm"
      @search="onSearch" 
    />

    <!-- Main Content -->
    <DeliveryNoteView
      v-model:modelForm="modelDeliveryNoteForm"
      v-model:modelSaleOrder="modelSaleOrderData"
      @save="onSave"
      @confirm="onConfirm"
      @print="onPrint"
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
//import DeliveryNoteView from './components/delivery-note-view.vue'
//import SaleOrderSearchModal from './modal/sale-order-search-modal.vue'

export default {
  name: 'DeliveryNoteIndexView',

  components: {
    SearchView,
    //DeliveryNoteView,
    //SaleOrderSearchModal
  },

  mounted() {
    // Load data from URL query parameters (from Sale Order navigation)
    this.loadFromQueryParams()
  },

  data() {
    return {
      // Search form model
      modelSearchForm: {
        saleOrderNumber: '',
        deliveryNoteNumber: '',
        customerName: '',
        searchType: 'saleOrder'
      },

      // Delivery Note form model
      modelDeliveryNoteForm: {
        deliveryNoteId: null,
        saleOrderId: null,
        number: '',
        deliveryDate: new Date(),
        deliveryAddress: '',
        recipientName: '',
        recipientPhone: '',
        deliveryMethod: 'pickup',
        trackingNumber: '',
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
    loadFromQueryParams() {
      const query = this.$route.query
      
      if (query.saleOrderNumber) {
        // Load sale order data from query params
        this.modelSearchForm.saleOrderNumber = query.saleOrderNumber
        this.modelDeliveryNoteForm.saleOrderId = query.saleOrderId
        
        // Set delivery information from Sale Order
        if (query.customerName) {
          this.modelDeliveryNoteForm.recipientName = query.customerName
        }
        
        // Generate delivery note number
        if (!this.modelDeliveryNoteForm.number) {
          this.modelDeliveryNoteForm.number = 'DN-2025-' + String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')
        }
        
        // Load sale order details
        this.searchSaleOrder(query.saleOrderNumber)
        
        console.log('โหลดข้อมูลจากใบสั่งขาย:', query.saleOrderNumber)
      }
    },

    onSearch(searchData) {
      console.log('Search triggered:', searchData)
      
      if (searchData.searchType === 'saleOrder' && searchData.saleOrderNumber) {
        this.searchSaleOrder(searchData.saleOrderNumber)
      } else if (searchData.searchType === 'deliveryNote' && searchData.deliveryNoteNumber) {
        this.searchDeliveryNote(searchData.deliveryNoteNumber)
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
          customerAddress: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          customerPhone: '02-123-4567',
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
              isReady: true,
              readyQuantity: 2,
              deliveredQuantity: 0
            },
            {
              itemId: 2,
              productId: 3,
              productNumber: 'B001',
              productName: 'Gold Bracelet',
              itemType: 'Stock',
              quantity: 1,
              unitPrice: 12000,
              isReady: true,
              readyQuantity: 1,
              deliveredQuantity: 0
            },
            {
              itemId: 3,
              productId: 2,
              productNumber: 'N002',
              productName: 'Custom Gold Necklace',
              itemType: 'Production',
              quantity: 1,
              unitPrice: 25000,
              isReady: false,
              readyQuantity: 0,
              deliveredQuantity: 0
            }
          ]
        }
      } catch (error) {
        console.error('Error loading sale order:', error)
      }
    },

    async searchDeliveryNote(deliveryNoteNumber) {
      console.log('Search delivery note:', deliveryNoteNumber)
      // TODO: Implement delivery note search
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

    onSave(deliveryNoteData) {
      console.log('Save delivery note:', deliveryNoteData)
      // TODO: API call to save
    },

    onConfirm(deliveryNoteData) {
      console.log('Confirm delivery note:', deliveryNoteData)
      // TODO: API call to confirm
    },

    onPrint(deliveryNoteData) {
      console.log('Print delivery note:', deliveryNoteData)
      // TODO: API call to print
    },

    onCancel() {
      console.log('Cancel delivery note')
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