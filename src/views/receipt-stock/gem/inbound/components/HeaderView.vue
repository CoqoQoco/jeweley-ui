<template>
  <div class="filter-container-search">
    <pageTitle
      :title="$t('view.receiptStock.gem.inbound.headerTitle')"
      :description="$t('view.receiptStock.gem.inbound.headerSubtitle')"
      :isShowBtnClose="false"
      :isShowRightSlot="false"
    >
      <template #rightSlot> </template>
    </pageTitle>
    <div class="form-col-container">
      <div>
        <span class="title-text">{{ $t('view.receiptStock.gem.inbound.headerScan') }}</span>
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
const pageTitle = defineAsyncComponent(() => import('@/components/custom/page-title.vue'))
const scanInput = defineAsyncComponent(() => import('@/components/custom/scan-input.vue'))

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
      this.onClearScan()
    },
    onClearScan() {
      this.formScan.code = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
