<template>
  <div class="mobile-scan-view">
    <div class="mobile-container mobile-mt-3">
      <div class="mobile-empty-state">
        <i class="bi bi-qr-code-scan"></i>
        <div class="empty-title">สแกน QR Code</div>
        <div class="empty-subtitle">Feature นี้จะพัฒนาในอนาคต</div>
      </div>

      <div class="mobile-mt-3">
        <button class="mobile-btn mobile-btn-primary" @click="goBack">
          <i class="bi bi-arrow-left"></i>
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileScanView',

  methods: {
    goBack() {
      this.$router.push('/mobile/dashboard')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-scan-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}
</style>
