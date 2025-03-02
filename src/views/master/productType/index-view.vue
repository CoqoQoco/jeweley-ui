<template>
  <div class="app-container">
    <searchView
      v-model:modelForm="form"
      @search="onSearchFilter"
      @export="onExport"
      @create="onCreate"
      @clear="onClearFilter"
    ></searchView>
    <dataTable v-model:modelForm="search" v-model:modelFormExport="formExport"></dataTable>
    <create
      :isShowModal="isShowCreate"
      @fetch="onSearchFilterByCreate"
      @closeModal="onCloseModal"
    ></create>
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'
import create from './modal/create-view.vue'

const interfaceForm = {
  type: 'PRODUCT-TYPE',
  text: null
}
export default {
  components: {
    searchView,
    dataTable,
    create
  },
  data() {
    return {
      form: { ...interfaceForm },
      search: {},

      isExport: false,
      formExport: { ...interfaceForm },

      isShowCreate: false
    }
  },
  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },
    onSearchFilterByCreate() {
      this.search = { ...this.form }
      this.onCloseModal()
    },
    onClearFilter() {
      this.form = { ...interfaceForm }
    },

    onExport(data) {
      //console.log('onExport', data)
      this.formExport = { ...data }
    },

    onCloseModal() {
      this.isShowCreate = false
    },
    onCreate() {
      this.isShowCreate = true
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
