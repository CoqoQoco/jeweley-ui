<template>
  <div class="filter-container">
    <pageTitle
      title="กระบวนการสร้างเเบบเเม่พิมพ์"
      description=""
      :isShowBtnClose="false"
      :isShowRightSlot="true"
    >
      <template #rightSlot>
        <button class="btn btn-sm btn-main" @click="onCreate">สร้างเเบบเเม่พิมพ์ใหม่</button>
      </template>
    </pageTitle>
    <div class="header-bar-container"></div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const pageTitle = defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))

export default {
  components: {
    pageTitle
  },
  methods: {
    onCreate() {
      this.$router.push({ name: 'design-create' })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/search-bar.scss';

.header-bar-container {
  display: grid;
  grid-template-columns: 2fr 2fr 2fr 2fr;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
