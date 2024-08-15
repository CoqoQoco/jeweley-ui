<template>
  <div class="app-container">
    <headerBar
      ref="headerBarRef"
      v-model:modelForm="form"
      @search="onSearchFilter"
      @clear="onClearFilter"
    ></headerBar>
  </div>
</template>

<script>
import headerBar from './components/headerView.vue'
//import dataTable from './components/DataTableView.vue'

const interfaceForm = {}

export default {
  components: {
    headerBar
    //dataTable
  },
  data() {
    return {
      form: { ...interfaceForm },
      search: {},
      headerHeight: 0
    }
  },
  methods: {
    updateHeaderHeight() {
      if (this.$refs.headerBarRef) {
        this.headerHeight = this.$refs.headerBarRef.$el.offsetHeight
      }
    },
    onSearchFilter(data) {
      console.log('onSearchFilter', data)
      this.search = { ...data }
    },
    onClearFilter() {
      console.log('onClearFilter')
      this.form = { ...interfaceForm }
    }
  },
  mounted() {
    this.updateHeaderHeight()
    window.addEventListener('resize', this.updateHeaderHeight)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateHeaderHeight)
  }
}
</script>

<style lang="scss" scoped></style>
