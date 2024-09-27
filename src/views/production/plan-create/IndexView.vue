<template>
  <div class="app-container">
    <div class="filter-container-searchBar">
      <pageTitle
        title="สร้างใบจ่าย-รับคืนงาน"
        description="หน้าสร้างใบจ่าย-รับคืนงาน เเละรายละเอียดต่างๆ"
        :isShowBtnClose="false"
      >
      </pageTitle>
    </div>
    <formCreate class="mt-2"></formCreate>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

//import pageTitle from '@/components/custom/PageTitle.vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
import formCreate from './components/CreateView.vue'
export default {
  components: {
    pageTitle,
    formCreate
  }
}
</script>

<style lang="scss" scoped>
.filter-container-searchBar {
  border: 1px solid #dddddd;
  border-radius: 5px;

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: #f7f7f7;
  //background-color: var(--base-color);
  padding: 10px;
  //margin-top: 10px;
  //overflow: auto;
}
</style>
