<template>
  <div class="app-container">
    <headerBar></headerBar>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'

//const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import headerBar from './components/headerView.vue'

export default {
  components: {
    //pageTitle,
    headerBar
  }
}
</script>

<style lang="scss" scoped></style>
