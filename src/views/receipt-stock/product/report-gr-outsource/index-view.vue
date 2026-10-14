<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
      @export="onExport"
      @pdf="onPdf"
    ></search>
    <dataTable
      v-model:modelForm="search"
      v-model:modelFormExport="formExport"
      v-model:modelFormPdf="formPdf"
    ></dataTable>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'

const interfaceForm = {
  receiptDateStart: new Date(),
  receiptDateEnd: new Date(),

  vendor: null,
  poNumber: null,

  stockNumber: null,
  mold: null,

  productNumber: null,
  productNameEn: null,
  productNameTh: null,

  size: null,

  productType: []
}

export default {
  name: 'ReportGrOutsource',

  components: {
    search,
    dataTable
  },

  data() {
    return {
      form: { ...interfaceForm },
      formExport: { ...interfaceForm },
      formPdf: { ...interfaceForm },
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
    },

    onPdf(data) {
      this.formPdf = { ...data }
    }
  }
}
</script>
