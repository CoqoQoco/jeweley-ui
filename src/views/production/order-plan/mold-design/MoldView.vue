<template>
  <div class="app-container">
    <pageTitle
      title="ออกเเบบ สร้างเเม่พิมพ์"
      description="ข้อมูลออกเเบบ สร้างเเม่พิมพ์ เเละรายละเอียดต่างๆ"
      :isShowBtnClose="false"
      isShowRightSlot
    >
      <!-- <template v-slot:rightSlot>
        <div class="mr-2 p-1 w-50 text-center bg-dark text-white" style="height: 31px" disable>
          สถานะ : {{ statusName }}
        </div>
        <pdf class="btn btn-sm btn-info w-50" :modelValue="data" :matValue="mat"></pdf>
      </template> -->
    </pageTitle>
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
