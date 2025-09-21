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
  number: null,
  customerName: null,
  createDateStart: null,
  createDateEnd: null,
  quotationDateStart: null,
  quotationDateEnd: null,
  currency: null,
  createBy: null
}

export default {
  name: 'QuotationListView',

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