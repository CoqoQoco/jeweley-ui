<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
    ></search>
    <dataTable 
      v-model:modelForm="search"
      @create-invoice="onCreateInvoice"
    ></dataTable>

    <!-- Invoice Modal -->
    <invoiceModal
      :isShowModal="showInvoiceModal"
      :saleOrderData="selectedSaleOrder"
      @close-modal="closeInvoiceModal"
    />
  </div>
</template>

<script>
import search from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'
import invoiceModal from './modal/invoice-modal.vue'

const interfaceForm = {
  soNumber: null,
  customerName: null,
  createDateStart: null,
  createDateEnd: null,
  deliveryDateStart: null,
  deliveryDateEnd: null,
  currencyUnit: null,
  createBy: null,
  status: null,
  refQuotation: null
}

export default {
  name: 'SaleOrderListView',

  components: {
    search,
    dataTable,
    invoiceModal
  },

  data() {
    return {
      isLoading: false,
      form: { ...interfaceForm },
      search: {},
      showInvoiceModal: false,
      selectedSaleOrder: {}
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
    },

    onCreateInvoice(saleOrderData) {
      console.log('Creating invoice for sale order:', saleOrderData)
      this.selectedSaleOrder = saleOrderData
      this.showInvoiceModal = true
    },

    closeInvoiceModal() {
      this.showInvoiceModal = false
      this.selectedSaleOrder = {}
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>