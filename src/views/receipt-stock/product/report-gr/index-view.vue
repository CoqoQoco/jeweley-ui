<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
      @export="onExport"
    ></search>
    <dataTable v-model:modelForm="search" v-model:modelFormExport="formExport"></dataTable>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'

const interfaceForm = {
  receiptDateStart: new Date(new Date().setDate(new Date().getDate() - 7)),
  receiptDateEnd: new Date(),
  receiptType: null,

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
      console.log('onExport', data)
      this.formExport = { ...data }
    }
  },

  async created() {
    this.$nextTick(async () => {})
  }
}
</script>
