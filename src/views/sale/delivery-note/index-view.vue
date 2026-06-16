<template>
  <div class="index-view-container">
    <!-- Search Section -->
    <SearchView
      v-model:modelForm="modelSearchForm"
      @search="onSearch"
    />
  </div>
</template>

<script>
import SearchView from './components/search-view.vue'

export default {
  name: 'DeliveryNoteIndexView',

  components: {
    SearchView
  },

  mounted() {
    this.loadFromQueryParams()
  },

  data() {
    return {
      modelSearchForm: {
        saleOrderNumber: '',
        deliveryNoteNumber: '',
        customerName: '',
        searchType: 'saleOrder'
      },

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

      modelSaleOrderData: {},

      isShowSaleOrderModal: false
    }
  },

  methods: {
    loadFromQueryParams() {
      const query = this.$route.query

      if (query.saleOrderNumber) {
        this.modelSearchForm.saleOrderNumber = query.saleOrderNumber
        this.modelDeliveryNoteForm.saleOrderId = query.saleOrderId

        if (query.customerName) {
          this.modelDeliveryNoteForm.recipientName = query.customerName
        }

        if (!this.modelDeliveryNoteForm.number) {
          this.modelDeliveryNoteForm.number = 'DN-2025-' + String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')
        }

        this.searchSaleOrder(query.saleOrderNumber)
      }
    },

    onSearch(searchData) {
      if (searchData.searchType === 'saleOrder' && searchData.saleOrderNumber) {
        this.searchSaleOrder(searchData.saleOrderNumber)
      } else if (searchData.searchType === 'deliveryNote' && searchData.deliveryNoteNumber) {
        this.searchDeliveryNote(searchData.deliveryNoteNumber)
      } else if (searchData.searchType === 'customer' && searchData.customerName) {
        this.searchCustomer(searchData.customerName)
      } else {
        this.isShowSaleOrderModal = true
      }
    },

    async searchSaleOrder(saleOrderNumber) {
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
    },

    async searchDeliveryNote() {},

    async searchCustomer() {},

    onSelectSaleOrder(saleOrder) {
      this.modelSaleOrderData = saleOrder
      this.isShowSaleOrderModal = false
    },

    onCloseSaleOrderModal() {
      this.isShowSaleOrderModal = false
    },

    onSave() {},

    onConfirm() {},

    onPrint() {},

    onCancel() {}
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.index-view-container {
  padding: 1rem;
}
</style>
