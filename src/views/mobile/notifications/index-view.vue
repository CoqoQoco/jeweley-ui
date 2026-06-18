<template>
  <div class="mobile-notifications-view">
    <div class="mobile-container mobile-mt-2">
      <h2 class="mobile-title">{{ $t('view.mobile.notifications.pageTitle') }}</h2>

      <div class="mobile-empty-state mobile-mt-3">
        <i class="bi bi-bell"></i>
        <div class="empty-title">{{ $t('view.mobile.notifications.emptyTitle') }}</div>
        <div class="empty-subtitle">{{ $t('view.mobile.notifications.emptySubtitle') }}</div>
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
