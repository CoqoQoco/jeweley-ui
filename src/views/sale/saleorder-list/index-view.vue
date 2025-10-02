<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
    ></search>
    <dataTable 
      v-model:modelForm="search"
    ></dataTable>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'

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
    dataTable
  },

  data() {
    return {
      isLoading: false,
      form: { ...interfaceForm },
      search: {}
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>