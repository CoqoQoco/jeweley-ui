<template>
  <div class="app-container">
    <searchView
      v-model:modelForm="form"
      @search="onSearchFilter"
      @create="onCreate"
      @clear="onClearFilter"
    />
    <dataTable v-model:modelForm="search" class="mt-2" />
    <create
      :isShow="isShowCreate"
      :modelMasterGold="masterGold"
      :modelMasterGoldSize="masterGoldSize"
      @fetch="onSearchFilterByCreate"
      @closeModal="onCloseModal"
    />
  </div>
</template>

<script>
import searchView from './components/search-view.vue'
import dataTable from './components/data-table-view.vue'
import create from './modal/create-view.vue'

import { useMasterApiStore } from '@/stores/modules/api/master-store.js'

const interfaceForm = {
  type: 'ZILL',
  text: null
}

export default {
  components: {
    searchView,
    dataTable,
    create
  },

  setup() {
    const masterStore = useMasterApiStore()
    return { masterStore }
  },

  computed: {
    masterGold() {
      return this.masterStore.gold
    },
    masterGoldSize() {
      return this.masterStore.goldSize
    }
  },

  data() {
    return {
      form: { ...interfaceForm },
      search: {},
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
    onCloseModal() {
      this.isShowCreate = false
    },
    onCreate() {
      this.isShowCreate = true
    }
  },

  created() {
    this.$nextTick(() => {
      this.masterStore.fetchGold()
      this.masterStore.fetchGoldSize()
      this.search = { ...this.form }
    })
  }
}
</script>

<style lang="scss" scoped></style>
