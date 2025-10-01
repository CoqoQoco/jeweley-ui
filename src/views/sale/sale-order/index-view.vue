<template>
  <div class="app-container">
    <search
      v-model:quotation="formQuotation"
      @convertQuotation="onConvertQuotation"
      @clear="onClearFilter"
    ></search>
    <saleOrder
      v-model:modelQuotation="quotation"
      v-model:modelSaleOrder="saleOrderData"
    ></saleOrder>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import saleOrder from './components/sale-order-view.vue'
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'

const interfaceSearchQuotation = {
  Number: null
}

const interfaceSaleOrder = {
  number: null,
  date: new Date(),
  expectedDeliveryDate: null,
  status: 'draft',
  quotationNumber: null,
  paymentTerms: null,
  depositRequired: false,
  depositAmount: 0,
  priority: 'normal',
  discount: 0,
  freight: 0,
  remark: null,
  items: [],
  customer: {
    name: null,
    address: null,
    phone: null,
    email: null
  }
}

export default {
  name: 'SaleOrderIndexView',
  components: {
    search,
    saleOrder
  },
  data() {
    return {
      formQuotation: { ...interfaceSearchQuotation },
      quotation: {},
      saleOrderData: { ...interfaceSaleOrder }
    }
  },
  methods: {
    async onConvertQuotation(formValue) {
      console.log('Convert quotation:', formValue)
      this.quotation = { ...formValue }

      // Call API to fetch quotation data
      await this.loadQuotationData(formValue.Number)
    },

    async loadQuotationData(quotationNumber) {
      try {
        const quotationStore = usrQuotationApiStore()
        const response = await quotationStore.fetchGet({
          formValue: { number: quotationNumber }
        })

        if (response) {
          const quotationData = response

          // Update sale order data with quotation info
          this.saleOrderData = {
            ...this.saleOrderData,
            quotationNumber: quotationNumber,
            customer: {
              name: quotationData.customerName || '',
              address: quotationData.customerAddress || '',
              phone: quotationData.customerPhone || '',
              email: quotationData.customerEmail || ''
            },
            discount: quotationData.discount || 0,
            freight: quotationData.freight || 0,
            items: quotationData.data ? JSON.parse(quotationData.data) : []
          }

          console.log('Loaded quotation data:', this.saleOrderData)
        } else {
          console.warn('No quotation data found for number:', quotationNumber)
        }
      } catch (error) {
        console.error('Error loading quotation:', error)
        // Reset sale order data on error
        this.saleOrderData = { ...interfaceSaleOrder }
      }
    },

    onClearFilter() {
      this.formQuotation = { ...interfaceSearchQuotation }
      this.quotation = {}
      this.saleOrderData = { ...interfaceSaleOrder }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
