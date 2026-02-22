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
      :isViewMode="isViewMode"
      :isLoading="isLoading"
    ></saleOrder>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import saleOrder from './components/sale-order-view.vue'
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { error } from '@/services/alert/sweetAlerts.js'

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
  confirmedItems: [],
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
      saleOrderData: { ...interfaceSaleOrder },
      isViewMode: false,
      isLoading: false
    }
  },
  methods: {
    async onConvertQuotation(formValue) {
      //console.log('Convert quotation:', formValue)
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
            items: quotationData.data ? JSON.parse(quotationData.data) : [],
            // currency, markup, special items from quotation
            currencyUnit: quotationData.currency || 'US$',
            currencyRate: quotationData.currencyRate || 33.0,
            markup: quotationData.markUp || 3.5,
            goldPerOz: quotationData.goldPerOz || 0,
            specialDiscount: quotationData.specialDiscount || 0,
            specialAddition: quotationData.specialAddition || 0,
            vat: quotationData.vat || 0
          }

          //console.log('Loaded quotation data:', this.saleOrderData)
        } else {
          console.warn('No quotation data found for number:', quotationNumber)
        }
      } catch (error) {
        console.error('Error loading quotation:', error)
        // Reset sale order data on error
        this.saleOrderData = { ...interfaceSaleOrder }
      }
    },

    async loadSaleOrderData(soNumber) {
      try {
        this.isLoading = true
        const saleOrderStore = usrSaleOrderApiStore()
        const response = await saleOrderStore.fetchGet({
          formValue: { soNumber: soNumber }
        })

        if (response) {
          //console.log('Raw API response:', response)
          const saleOrderData = response

          // Update sale order data from API
          this.saleOrderData = {
            ...this.saleOrderData,
            number: saleOrderData.soNumber || '',
            date: saleOrderData.createDate ? new Date(saleOrderData.createDate) : new Date(),
            expectedDeliveryDate: saleOrderData.deliveryDate ? new Date(saleOrderData.deliveryDate) : null,
            status: saleOrderData.statusName || 'Draft',
            quotationNumber: saleOrderData.refQuotation || null,
            paymentTerms: saleOrderData.paymentName || null,
            depositRequired: saleOrderData.depositPercent ? true : false,
            depositAmount: saleOrderData.depositPercent || 0,
            priority: saleOrderData.priority || 'normal',
            discount: saleOrderData.discount || 0,
            freight: 0, // Add freight field to API response if needed
            remark: saleOrderData.remark || null,
            items: saleOrderData.data ? (() => {
              try {
                const parsedData = JSON.parse(saleOrderData.data)
                //console.log('Parsed data from API:', parsedData)
                return parsedData
              } catch (e) {
                console.error('Error parsing data:', e)
                return []
              }
            })() : [],
            confirmedItems: saleOrderData.stockConfirm || [],
            currencyUnit: saleOrderData.currencyUnit || 'US$',
            currencyRate: saleOrderData.currencyRate || 33.0,
            markup: saleOrderData.markup || 3.5,
            goldPerOz: saleOrderData.goldRate || 2000,
            customer: {
              code: saleOrderData.customerCode || '',
              name: saleOrderData.customerName || '',
              address: saleOrderData.customerAddress || '',
              phone: saleOrderData.customerTel || '',
              email: saleOrderData.customerEmail || '',
              remark: saleOrderData.customerRemark || ''
            }
          }

          //console.log('Loaded sale order data api:', this.saleOrderData)
        } else {
          console.warn('No sale order data found for number:', soNumber)
        }
      } catch (err) {
        console.error('Error loading sale order:', err)
        // Show error notification if needed
        error(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'ไม่สามารถโหลดข้อมูลใบสั่งขายได้')
      } finally {
        this.isLoading = false
      }
    },

    onClearFilter() {
      this.formQuotation = { ...interfaceSearchQuotation }
      this.quotation = {}
      this.saleOrderData = { ...interfaceSaleOrder }
    }
  },

  async mounted() {
    // Check if there are query parameters for loading sale order
    const soNumber = this.$route.query.soNumber
    const mode = this.$route.query.mode

    if (soNumber) {
      // Set view mode if specified
      this.isViewMode = mode === 'view'
      
      // Load sale order data
      await this.loadSaleOrderData(soNumber)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
