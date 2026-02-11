<template>
  <div class="mobile-tasks-view">
    <div class="mobile-container mobile-mt-2">
      <h2 class="mobile-title">งานของฉัน</h2>

      <div class="mobile-empty-state mobile-mt-3">
        <i class="bi bi-list-task"></i>
        <div class="empty-title">ไม่มีงานในขณะนี้</div>
        <div class="empty-subtitle">Feature นี้จะพัฒนาในอนาคต</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileTasksView'
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-tasks-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}
</style>
