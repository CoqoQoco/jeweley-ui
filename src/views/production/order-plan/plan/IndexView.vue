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
import formView from './components/FormView.vue'
import pageTitle from '@/components/custom/PageTitle.vue'
export default {
  components: {
    pageTitle,
    formView
  }
}
</script>

<style lang="scss" scoped></style>
