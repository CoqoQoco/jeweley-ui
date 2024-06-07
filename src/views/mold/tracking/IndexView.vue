<template>
  <div class="app-container">
    <pageTitle title="ติดตามเเบบเเม่พิพม์" description="" :isShowBtnClose="false"> </pageTitle>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

export default {
  components: {
    pageTitle
  }
}
</script>

<style lang="scss" scoped></style>
