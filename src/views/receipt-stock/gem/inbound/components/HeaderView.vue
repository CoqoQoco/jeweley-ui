<template>
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
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))
const scanInput = defineAsyncComponent(() => import('@/components/custom/scanInput.vue'))

export default {
  components: {
    pageTitle,
    scanInput
  },
  props: {
    modelForm: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    modelForm: {
      handler(val) {
        this.formScan = { ...val }
      },
      deep: true
    }
  },
  data() {
    return {
      formScan: { ...this.modelForm }
    }
  },
  methods: {
    onScan() {
      console.log('onSubmitScan', this.formScan)
      this.$emit('scan', this.formScan)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
