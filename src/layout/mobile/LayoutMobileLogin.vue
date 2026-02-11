<template>
  <div id="mobile-login-layout">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'LayoutMobileLogin',

  mounted() {
    // เพิ่ม class สำหรับ mobile login specific styling
    document.body.classList.add('mobile-login-view')
  },

  beforeUnmount() {
    document.body.classList.remove('mobile-login-view')
  }
}
</script>

<style lang="scss" scoped>
#mobile-login-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--base-font-color) 0%, var(--base-font-sub-color) 100%);
}
</style>

<style lang="scss">
// Global styles for mobile login view
body.mobile-login-view {
  // ป้องกัน text selection
  -webkit-user-select: none;
  user-select: none;

  // ป้องกัน tap highlight
  -webkit-tap-highlight-color: transparent;

  // ป้องกัน zoom on input focus (iOS Safari)
  input,
  textarea {
    font-size: 16px !important;
  }

  // Prevent overscroll
  overscroll-behavior: none;
}
</style>
