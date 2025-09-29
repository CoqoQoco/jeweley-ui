<template>
  <div class="index-view-container">
    <!-- Header -->
    <div class="header-section">
      <h4 class="page-title">ใบแจ้งหนี้ / ใบกำกับภาษี (Invoice)</h4>
      <p class="page-subtitle">สร้างใบแจ้งหนี้และใบกำกับภาษีสำหรับลูกค้า</p>
    </div>

    <!-- Search Section -->
    <SearchView 
      v-model:modelForm="modelSearchForm"
      @search="onSearch" 
    />

    <!-- Main Content -->
    <InvoiceView
      v-model:modelForm="modelInvoiceForm"
      v-model:modelDeliveryNote="modelDeliveryNoteData"
      @save="onSave"
      @confirm="onConfirm"
      @print="onPrint"
      @email="onEmail"
      @cancel="onCancel"
    />

    <!-- Delivery Note Search Modal -->
    <!-- <DeliveryNoteSearchModal
      v-model:isShow="isShowDeliveryNoteModal"
      @select="onSelectDeliveryNote"
      @close="onCloseDeliveryNoteModal"
    /> -->
  </div>
</template>

<script>
import SearchView from './components/search-view.vue'
import InvoiceView from './components/invoice-view.vue'
//import DeliveryNoteSearchModal from './modal/delivery-note-search-modal.vue'

export default {
  name: 'InvoiceIndexView',

  components: {
    SearchView,
    InvoiceView,
    //DeliveryNoteSearchModal
  },

  mounted() {
    // Load data from URL query parameters (from Sale Order navigation)
    this.loadFromQueryParams()
  },

  data() {
    return {
      // Search form model
      modelSearchForm: {
        deliveryNoteNumber: '',
        invoiceNumber: '',
        customerName: '',
        searchType: 'deliveryNote'
      },

      // Invoice form model
      modelInvoiceForm: {
        invoiceId: null,
        deliveryNoteId: null,
        number: '',
        invoiceDate: new Date(),
        dueDate: null,
        paymentTerms: 'cash',
        taxRate: 7,
        discountRate: 0,
        shippingCost: 0,
        status: 'Draft',
        remark: ''
      },

      // Delivery Note data
      modelDeliveryNoteData: {},

      // Modal states
      isShowDeliveryNoteModal: false
    }
  },

  methods: {
    loadFromQueryParams() {
      const query = this.$route.query
      
      if (query.saleOrderNumber) {
        // Set invoice information from Sale Order
        this.modelInvoiceForm.saleOrderId = query.saleOrderId
        this.modelInvoiceForm.paymentTerms = query.paymentTerms || 'cash'
        
        // Generate invoice number
        if (!this.modelInvoiceForm.number) {
          this.modelInvoiceForm.number = 'INV-2025-' + String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')
        }
        
        // Set due date based on payment terms
        this.calculateDueDate()
        
        // Create mock delivery note data from Sale Order
        this.modelDeliveryNoteData = {
          deliveryNoteId: 'DN-DEMO',
          number: 'DN-2025-001',
          saleOrderNumber: query.saleOrderNumber,
          customerName: query.customerName,
          totalValue: parseFloat(query.totalAmount) || 0,
          depositAmount: parseFloat(query.depositAmount) || 0,
          depositRequired: query.depositRequired === 'true'
        }
        
        console.log('โหลดข้อมูลจากใบสั่งขาย:', query.saleOrderNumber)
      }
    },

    calculateDueDate() {
      const invoiceDate = new Date(this.modelInvoiceForm.invoiceDate)
      let daysToAdd = 0
      
      switch (this.modelInvoiceForm.paymentTerms) {
        case 'cash':
          daysToAdd = 0
          break
        case 'credit30':
          daysToAdd = 30
          break
        case 'credit60':
          daysToAdd = 60
          break
        default:
          daysToAdd = 7
      }
      
      const dueDate = new Date(invoiceDate)
      dueDate.setDate(dueDate.getDate() + daysToAdd)
      this.modelInvoiceForm.dueDate = dueDate
    },

    onSearch(searchData) {
      console.log('Search triggered:', searchData)
      
      if (searchData.searchType === 'deliveryNote' && searchData.deliveryNoteNumber) {
        this.searchDeliveryNote(searchData.deliveryNoteNumber)
      } else if (searchData.searchType === 'invoice' && searchData.invoiceNumber) {
        this.searchInvoice(searchData.invoiceNumber)
      } else if (searchData.searchType === 'customer' && searchData.customerName) {
        this.searchCustomer(searchData.customerName)
      } else {
        // Open modal for selection
        this.isShowDeliveryNoteModal = true
      }
    },

    async searchDeliveryNote(deliveryNoteNumber) {
      try {
        // TODO: API call to load delivery note
        console.log('Loading delivery note:', deliveryNoteNumber)
        
        // Mock data
        this.modelDeliveryNoteData = {
          deliveryNoteId: 1,
          number: deliveryNoteNumber,
          saleOrderNumber: 'SO-2025-001',
          customerName: 'บริษัท ABC จำกัด',
          customerAddress: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
          customerPhone: '02-123-4567',
          customerTaxId: '0105537000111',
          deliveryDate: '2025-01-20',
          totalValue: 42000,
          items: [
            {
              itemId: 1,
              productNumber: 'R001',
              productName: 'Diamond Ring Set',
              deliveredQuantity: 2,
              unitPrice: 15000,
              lineTotal: 30000
            },
            {
              itemId: 2,
              productNumber: 'B001',
              productName: 'Gold Bracelet',
              deliveredQuantity: 1,
              unitPrice: 12000,
              lineTotal: 12000
            }
          ]
        }
      } catch (error) {
        console.error('Error loading delivery note:', error)
      }
    },

    async searchInvoice(invoiceNumber) {
      console.log('Search invoice:', invoiceNumber)
      // TODO: Implement invoice search
    },

    async searchCustomer(customerName) {
      console.log('Search customer:', customerName)
      // TODO: Implement customer search
    },

    onSelectDeliveryNote(deliveryNote) {
      this.modelDeliveryNoteData = deliveryNote
      this.isShowDeliveryNoteModal = false
    },

    onCloseDeliveryNoteModal() {
      this.isShowDeliveryNoteModal = false
    },

    onSave(invoiceData) {
      console.log('Save invoice:', invoiceData)
      // TODO: API call to save
    },

    onConfirm(invoiceData) {
      console.log('Confirm invoice:', invoiceData)
      // TODO: API call to confirm
    },

    onPrint(invoiceData) {
      console.log('Print invoice:', invoiceData)
      // TODO: API call to print
    },

    onEmail(invoiceData) {
      console.log('Email invoice:', invoiceData)
      // TODO: API call to email
    },

    onCancel() {
      console.log('Cancel invoice')
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