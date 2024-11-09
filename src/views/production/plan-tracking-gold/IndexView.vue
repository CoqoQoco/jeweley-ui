<template>
  <div class="app-container">
    <headerBar v-model:modelForm="form" @search="onSearchFilter" @clear="onClearFilter"></headerBar>
    <dataTable v-model:modelForm="form" class="mt-2"></dataTable>
  </div>
</template>

<script>
import headerBar from './components/HeaderView.vue'
import dataTable from './components/DataTableView.vue'

const interfaceForm = {
  text: null,
  runningNumber: null,
  createStart: null,
  createEnd: null
}
export default {
  components: {
    headerBar,
    dataTable
  },
  data() {
    return {
      form: { ...interfaceForm }
    }
  },
  methods: {
    onSearchFilter(data) {
      console.log('onSearchFilter')
      this.form = { ...data }
    },
    onClearFilter() {
      //console.log('onClearFilter')
      this.form = { ...interfaceForm }
    }
  }
}
</script>

<style lang="scss" scoped></style>
