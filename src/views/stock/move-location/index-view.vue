<template>
  <div class="app-container">
    <searchView
      v-model:modelForm="form"
      :selectedCount="selectedItems.length"
      @search="onSearchFilter"
      @clear="onClearFilter"
      @move="onMove"
      @manual="isShowManual = true"
    />
    <dataTableView
      v-model:modelForm="search"
      @update:selection="onSelectionChange"
    />
    <moveLocationView
      :isShow="isShowMove"
      :selectedItems="selectedItems"
      @closeModal="onCloseModal"
      @fetch="onFetch"
    />
    <manualView
      :isShow="isShowManual"
      @closeModal="isShowManual = false"
    />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import dataTableView from './components/data-table-view.vue'
import moveLocationView from './modal/move-location-view.vue'
import manualView from './modal/manual-view.vue'
import { warning } from '@/services/alert/sweetAlerts.js'

const interfaceForm = {
  stockNumber: null,
  productNumber: null,
  location: null
}

export default {
  name: 'MoveLocationIndexView',

  components: {
    searchView,
    dataTableView,
    moveLocationView,
    manualView
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: { ...interfaceForm },
      selectedItems: [],
      isShowMove: false,
      isShowManual: false
    }
  },

  methods: {
    onSearchFilter(data) {
      this.search = { ...data }
    },

    onClearFilter() {
      this.form = { ...interfaceForm }
      this.search = { ...interfaceForm }
      this.selectedItems = []
    },

    onSelectionChange(items) {
      this.selectedItems = items || []
    },

    onMove() {
      if (this.selectedItems.length === 0) {
        warning('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ', 'ยังไม่ได้เลือกสินค้า')
        return
      }
      this.isShowMove = true
    },

    onCloseModal() {
      this.isShowMove = false
    },

    onFetch() {
      this.selectedItems = []
      this.search = { ...this.form }
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
