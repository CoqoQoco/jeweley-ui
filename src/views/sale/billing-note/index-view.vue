<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
      @create="onCreate"
    ></search>
    <dataTable v-model:modelForm="search"></dataTable>
  </div>
</template>

<script>
import search from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'

const interfaceForm = {
  running: null,
  customerName: null,
  customerCode: null,
  documentDateFrom: null,
  documentDateTo: null
}

export default {
  name: 'BillingNoteListView',

  components: {
    search,
    dataTable
  },

  data() {
    return {
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
    },

    onCreate() {
      this.$router.push({ name: 'sale-billing-note-create' })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
