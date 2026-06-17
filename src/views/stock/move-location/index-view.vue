<template>
  <div class="app-container">
    <searchView
      v-model:modelForm="form"
      :selectedCount="selectedItems.length"
      @search="onSearchFilter"
      @clear="onClearFilter"
      @move="onMove"
      @manual="isShowManual = true"
      @export="onExport"
    />
    <dataTableView
      v-model:modelForm="search"
      v-model:modelFormExport="formExport"
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
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  stockNumber: null,
  productNumber: null,
  location: null,
  stockNumberOrigin: null,
  mold: null,
  productNameEn: null,
  productNameTh: null,
  woText: null,
  size: null,
  productType: [],
  gold: null,
  goldSize: null,
  hasCostDetail: null,
  pieceStatus: null
}

export default {
  name: 'MoveLocationIndexView',

  components: {
    searchView,
    dataTableView,
    moveLocationView,
    manualView
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: { ...interfaceForm },
      formExport: { ...interfaceForm },
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
        warning(this.$t('view.stock.moveLocation.warnSelectItem'), this.$t('view.stock.moveLocation.warnSelectItemTitle'))
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
    },

    onExport(data) {
      this.formExport = { ...data }
    }
  },

  async created() {
    this.$nextTick(async () => {
      this.search = { ...this.form }
      await this.masterStore.fetchGold()
      await this.masterStore.fetchGoldSize()
      await this.masterStore.fetchProductType()
    })
  }
}
</script>

<style lang="scss" scoped></style>
