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
  text: null
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
      this.search = { ...data }
    },
    onClearFilter() {
      this.form = { ...interfaceForm }
    }
  },

  async created() {
    this.$nextTick(() => {
      this.search = { ...this.form }
    })
  }
}
</script>

<style lang="scss" scoped></style>
