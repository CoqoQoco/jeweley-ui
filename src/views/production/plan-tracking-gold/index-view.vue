<template>
  <div class="app-container">
    <headerBar v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter"></headerBar>
    <dataTable v-model:modelForm="search" class="mt-2"></dataTable>
  </div>
</template>

<script>
import headerBar from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'

const interfaceForm = {
  bookNo: null,
  no: null,
  text: null,
  runningNumber: null,
  createStart: new Date(new Date().setDate(new Date().getDate() - 7)),
  createEnd: new Date()
}
export default {
  components: {
    headerBar,
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
      console.log('onSearchFilter')
      this.search = { ...data }
    },
    onClearFilter() {
      //console.log('onClearFilter')
      this.form = { ...interfaceForm }
    }
  }
}
</script>

<style lang="scss" scoped></style>
