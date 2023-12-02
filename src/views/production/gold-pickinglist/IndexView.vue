<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <pageTitle
      title="ใบผสมทอง"
      description="ข้อมูลการใบผสม เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
      isShowRightSlot
    >
    </pageTitle>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
export default {
  components: {
    loading,
    pageTitle
  },
  data() {
    return {
      // ----- flag --------
      isLoading: false
    }
  }
}
</script>

<style lang="scss" scoped></style>
