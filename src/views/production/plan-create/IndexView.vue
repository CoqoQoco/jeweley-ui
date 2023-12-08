<template>
  <div class="app-container">
    <pageTitle
      title="สร้างใบจ่าย-รับคืนงาน"
      description="หน้าสร้างใบจ่าย-รับคืนงาน เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
    >
    </pageTitle>
    <formCreate></formCreate>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

//import pageTitle from '@/components/custom/PageTitle.vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
import formCreate from './components/formCreate.vue'
export default {
  components: {
    pageTitle,
    formCreate
  }
}
</script>

<style lang="scss" scoped></style>
