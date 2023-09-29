<template>
  <div class="app-container">
    <pageTitle
      title="สร้างใบจ่าย-รับคืนงาน"
      description="หน้าสร้างใบจ่าย-รับคืนงาน เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
    >
    </pageTitle>
    <formView></formView>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

//import pageTitle from '@/components/custom/PageTitle.vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

import formView from './components/FormView.vue'
export default {
  components: {
    pageTitle,
    formView
  }
}
</script>

<style lang="scss" scoped></style>
