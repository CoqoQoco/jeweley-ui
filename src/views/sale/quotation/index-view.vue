<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      v-model:quotation="formQuotation"
      @search="onSearchFilter"
      @searchQuotation="onSearchQuotation"
      @clear="onClearFilter"
    ></search>
    <quotation v-model:modelForm="search" v-model:modelQuotation="quotation"></quotation>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import quotation from './components/quotation-view.vue'

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
    quotation
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
      //console.log('onSearchFilter', data)
      this.search = { ...data }
    },
    onSearchQuotation(data) {
      //console.log('onSearchQuotation', data)
      this.quotation = { ...data }
    },

    onClearFilter() {
      //console.log('onClearFilter')
      this.form = { ...interfaceForm }
    },

    handleRouteParams() {
      // Handle route query parameters for viewing/editing specific quotation
      const { number, mode } = this.$route.query
      if (number) {
        
        this.formQuotation.number = number
        this.quotation = { number: number }
        
        // If mode is 'view', set to read-only mode
        if (mode === 'view') {
          // TODO: Implement read-only mode logic if needed
          console.log('View mode for quotation:',  this.quotation)
        }
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
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';
</style>
