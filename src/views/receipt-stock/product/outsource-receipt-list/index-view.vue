<template>
  <div class="app-container">
    <searchView
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
      @export="onExport"
    />
    <dataTableView
      v-model:modelForm="search"
      v-model:modelFormExport="formExport"
    />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'

const interfaceForm = {
  receiptDateStart: new Date(new Date().setDate(new Date().getDate())),
  receiptDateEnd: new Date(),
  stockNumber: null,
  productNumber: null,
  productNameEn: null,
  productNameTh: null,
  vendor: null,
  poNumber: null,
  productType: [],
  size: null
}

export default {
  name: 'OutsourceReceiptList',

  components: {
    searchView,
    dataTableView
  },

  data() {
    return {
      form: { ...interfaceForm },
      formExport: { ...interfaceForm },
      search: {}
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },
    onClearFilter() {
      this.form = { ...interfaceForm }
    },
    onExport(data) {
      this.formExport = { ...data }
    }
  },

  created() {
    this.$nextTick(async () => {})
  }
}
</script>
