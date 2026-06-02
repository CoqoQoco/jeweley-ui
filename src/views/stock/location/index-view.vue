<template>
  <div class="app-container">
    <searchView
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
      @create="onCreate"
    />
    <dataTableView
      v-model:modelForm="search"
      :triggerCreate="triggerCreate"
      @createHandled="triggerCreate = false"
    />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'

const interfaceForm = {
  code: null,
  nameTh: null,
  type: null,
  isActive: null
}

export default {
  name: 'StockLocationIndexView',

  components: {
    searchView,
    dataTableView
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: { ...interfaceForm },
      triggerCreate: false
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
      this.search = { ...interfaceForm }
    },

    onCreate() {
      this.triggerCreate = true
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
