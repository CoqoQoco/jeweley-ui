<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      v-model:quotation="formQuotation"
      @search="onSearchFilter"
      @searchQuotation="onSearchQuotation"
      @clear="onClearFilter"
    ></search>
    <saleOrder v-model:modelForm="search" v-model:modelQuotation="quotation"></saleOrder>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import saleOrder from './components/sale-order-view.vue'

const interfaceForm = {
  stockNumber: null,
  stockNumberOrigin: null,  
  mold: null,

  productNumber: null,
  productNameEn: null,
  productNameTh: null,

  woText: null,
  size: null,

  productType: []
}

const interfaceSearchQuotation = {
  Number: null
}

export default {
  name: 'SaleOrderIndexView',
  components: {
    search,
    saleOrder
  },
  data() {
    return {
      form: { ...interfaceForm },
      search: {},

      formQuotation: { ...interfaceSearchQuotation },
      quotation: {}
    }
  },
  methods: {
    onSearchFilter(formValue) {
      console.log('Search product:', formValue)
      this.search = { ...formValue }
    },

    onSearchQuotation(formValue) {
      console.log('Search quotation:', formValue)
      this.quotation = { ...formValue }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
      this.search = {}
      this.formQuotation = { ...interfaceSearchQuotation }
      this.quotation = {}
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>