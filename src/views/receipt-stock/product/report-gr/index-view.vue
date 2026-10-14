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
  receiptDateStart: new Date(new Date().setDate(new Date().getDate())),
  receiptDateEnd: new Date(),
  receiptType: ['production'],

  stockNumber: null,
  mold: null,

  productNumber: null,
  productNameEn: null,
  productNameTh: null,

  woText: null,
  size: null,

  productType: []
}

export default {
  name: 'ReportGr',

  components: {
    search,
    dataTable
  },

  computed: {},

  data() {
    return {
      isLoading: false,
      isExport: false,
      form: { ...interfaceForm },
      formExport: { ...interfaceForm },
      formPdf: { ...interfaceForm },
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
    },

    onExport(data) {
      //console.log('onExport', data)
      this.formExport = { ...data }
    },

    onPdf(data) {
      this.formPdf = { ...data }
    }
  },

  async created() {
    this.$nextTick(async () => {})
  }
}
</script>
