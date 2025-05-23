<template>
  <div class="app-container">
    <search v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter"></search>
    <quotation v-model:modelForm="search"></quotation>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import quotation from './components/quotation-view.vue'

const interfaceForm = {
  stockNumber: 'DK-1XL-6396',
  mold: null,

  productNumber: null,
  productNameEn: null,
  productNameTh: null,

  woText: null,
  size: null,

  productType: []
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
      search: {}
    }
  },
  methods: {
    onSearchFilter(data) {
      //console.log('onSearchFilter', data)
      this.search = { ...data }
    },

    onClearFilter() {
      //console.log('onClearFilter')
      this.form = { ...interfaceForm }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form';
</style>
