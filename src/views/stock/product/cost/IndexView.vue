<template>
  <div class="app-container">
    <headerView></headerView>
  </div>
</template>

<script>
//import { defineAsyncComponent } from 'vue'

import headerView from './components/HeaderView.vue'

export default {
  components: {
    headerView
  },
  created() {
    this.$nextTick(() => {
      const id = this.$route.params.id
      const wo = id.split('-')

      console.log(wo)
    })
  }
}
</script>

<style></style>
