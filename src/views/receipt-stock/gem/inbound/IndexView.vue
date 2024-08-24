<template>
  <div class="app-container">
    <headerBar
      ref="headerRef"
      v-model:modelForm="formHeaderScan"
      @scan="onScan"
      @clear="onClearScan"
    ></headerBar>
    <dataTable v-model:modelFormScan="formDataScan" class="mt-2"></dataTable>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'
import headerBar from './components/HeaderView.vue'
import dataTable from './components/DataTableView.vue'

const interfaceFormScan = {
  code: null
}
export default {
  components: {
    headerBar,
    dataTable
  },
  data() {
    return {
      isLoading: false,
      formHeaderScan: { ...interfaceFormScan },
      formDataScan: null
    }
  },
  methods: {
    onScan(data) {
      console.log('onScan', data)
      this.formDataScan = { ...data }
    },
    onClearScan() {
      console.log('onClearScan')
      this.formHeaderScan = { ...interfaceFormScan }
    }
  }
}
</script>

<style lang="scss" scoped></style>
