<template>
  <div class="app-container">
    <search v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter"></search>
    <dataTable v-model:modelForm="search" v-model:modelFormExport="formExport"></dataTable>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'

const interfaceForm = {
  text: null,
  typeCodes: [],
  discountMin: null,
  discountMax: null
}

export default {
  name: 'customer-list-view',

  components: {
    search,
    dataTable
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
    }
  }
}
</script>
