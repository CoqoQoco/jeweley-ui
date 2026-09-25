<template>
  <div class="app-container">
    <search
      v-model:quotation="formQuotation"
      @searchQuotation="onSearchQuotation"
    ></search>
    <quotation ref="quotationView" v-model:modelForm="search" v-model:modelQuotation="quotation">
      <template #productSearch>
        <product-search
          v-model:modelForm="form"
          @search="onSearchFilter"
          @clear="onClearFilter"
        />
      </template>
    </quotation>
  </div>
</template>

<script>
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

import search from './components/search-view.vue'
import quotation from './components/quotation-view.vue'
import productSearch from './components/product-search-view.vue'

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
  number: null
}

export default {
  name: 'QuotationIndexView',
  components: {
    search,
    quotation,
    productSearch
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
    onSearchFilter(data) {
      this.search = { ...data }
    },
    onSearchQuotation(data) {
      this.quotation = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
    },

    handleRouteParams() {
      const { number } = this.$route.query
      if (number) {
        this.formQuotation.number = number
        this.quotation = { number: number }
      }
    }
  },

  mounted() {
    // Check for route parameters when component mounts
    this.handleRouteParams()
  },

  watch: {
    '$route.query': {
      handler() {
        // Handle route changes
        this.handleRouteParams()
      },
      immediate: true
    }
  },

  beforeRouteLeave(to, from, next) {
    if (!this.$refs.quotationView?.hasUnsavedItems) {
      next()
      return
    }
    confirmThenSubmit(
      this.$t('view.sale.quotation.leaveUnsavedMessage'),
      this.$t('view.sale.quotation.leaveUnsavedTitle'),
      () => next()
    )
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';
</style>
