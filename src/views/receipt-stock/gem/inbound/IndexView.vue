<template>
  <div class="app-container">
    <loading :isLoading="isLoading"></loading>
    <div class="filter-container">
      <pageTitle
        title="สร้างใบรับเพชรเเละพลอย"
        description="รับเพชรเเละพลอยเข้าคลัง ระบุรหัส จำนวน และรายละเอียดอื่นๆ"
        :isShowBtnClose="false"
        :isShowRightSlot="false"
      >
        <template #rightSlot> </template>
      </pageTitle>
      <div class="form-col-container">
        <div>
          <span class="title-text">สเเกนรหัส</span>
          <scanInput
            v-model.trim="formScan.code"
            class="w-100"
            :id="'inputListStockID'"
            :funcForSingleItem="onScan"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const scanInput = defineAsyncComponent(() => import('@/components/custom/scanInput.vue'))
const loading = defineAsyncComponent(() => import('@/components/overlay/loading-overlay.vue'))

const interfaceFormScan = {
  code: null
}
export default {
  components: {
    pageTitle,
    loading,
    scanInput
  },
  data() {
    return {
      isLoading: false,
      formScan: { ...interfaceFormScan }
    }
  },
  methods: {
    onScan(scan) {
      console.log('onSubmitScan', scan)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/custom-style/standard-data-table';
</style>
