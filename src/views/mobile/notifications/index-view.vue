<template>
  <div class="mobile-notifications-view">
    <div class="mobile-container mobile-mt-2">
      <h2 class="mobile-title">การแจ้งเตือน</h2>

      <div class="mobile-empty-state mobile-mt-3">
        <i class="bi bi-bell"></i>
        <div class="empty-title">ไม่มีการแจ้งเตือน</div>
        <div class="empty-subtitle">Feature นี้จะพัฒนาในอนาคต</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileNotificationsView'
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-notifications-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}
</style>
