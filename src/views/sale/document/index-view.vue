<template>
  <div class="app-container">
    <search
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
    />

    <dataTable
      v-model:modelForm="search"
      @upload="onShowUpload"
      @tag="onShowTag"
      ref="dataTable"
    />

    <uploadModal
      :isShowModal="isShow.upload"
      @close="closeModal"
      @saved="onSaved"
    />

    <tagModal
      :isShowModal="isShow.tag"
      :data="selectedDoc"
      @close="closeModal"
      @saved="onSaved"
    />
  </div>
</template>

<script>
import search from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'
import uploadModal from './modal/upload-modal.vue'
import tagModal from './modal/tag-modal.vue'

const interfaceForm = {
  month: null,
  year: null,
  keyword: null
}

const interfaceIsShow = {
  upload: false,
  tag: false
}

export default {
  name: 'SaleDocumentView',

  components: {
    search,
    dataTable,
    uploadModal,
    tagModal
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: {},
      isShow: { ...interfaceIsShow },
      selectedDoc: {}
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
      this.search = {}
    },

    onShowUpload() {
      this.isShow.upload = true
    },

    onShowTag(data) {
      this.selectedDoc = { ...data }
      this.isShow.tag = true
    },

    closeModal() {
      this.isShow = { ...interfaceIsShow }
      this.selectedDoc = {}
    },

    async onSaved() {
      if (this.$refs.dataTable) {
        await this.$refs.dataTable.fetchData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
