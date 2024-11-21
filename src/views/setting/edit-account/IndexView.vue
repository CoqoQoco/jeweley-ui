<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
      @export="onExport"
    ></search>
    <dataTable
      v-model:modelForm="search"
      v-model:modelFormExport="formExport"
      class="mt-2"
    ></dataTable>
  </div>
</template>

<script>
import search from './components/SearchBar.vue'
import dataTable from './components/DataTable.vue'

const interfaceForm = {
  username: null,
  isActive: null,
  isNew: null
}

export default {
  components: {
    search,
    dataTable
  },

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
      console.log('onSearchFilter', data)
      this.search = { ...data }
    },
    onClearFilter() {
      console.log('onClearFilter')
      this.form = { ...interfaceForm }
    },
    onExport(data) {
      console.log('onExport', data)
      this.formExport = { ...data }
    }
  },

  async created() {
    this.$nextTick(() => {
      this.search = { ...this.form }
    })
  }
}
</script>

<style scoped></style>
