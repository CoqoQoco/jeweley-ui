<template>
  <div class="mobile-profile-view">
    <div class="profile-header">
      <div class="avatar-container">
        <div v-if="userImage" class="avatar">
          <img :src="`data:image/png;base64,${userImage}`" alt="User Avatar" />
        </div>
        <div v-else class="avatar avatar-placeholder">
          <i class="bi bi-person-fill"></i>
        </div>
      </div>
      <h2 class="user-name">{{ userName }}</h2>
      <p class="user-role">{{ userRole }}</p>
    </div>

    <div class="mobile-container">
      <div class="mobile-list">
        <div class="mobile-list-item mobile-list-item-clickable" @click="navigateTo('/user-account')">
          <div class="list-icon">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="list-content">
            <div class="list-title">ข้อมูลส่วนตัว</div>
          </div>
          <div class="list-action">
            <i class="bi bi-chevron-right"></i>
          </div>
        </div>

        <div class="mobile-list-item">
          <div class="list-icon">
            <i class="bi bi-shield-check"></i>
          </div>
          <div class="list-content">
            <div class="list-title">เปลี่ยนรหัสผ่าน</div>
          </div>
          <div class="list-action">
            <i class="bi bi-chevron-right"></i>
          </div>
        </div>

        <div class="mobile-list-item">
          <div class="list-icon">
            <i class="bi bi-bell"></i>
          </div>
          <div class="list-content">
            <div class="list-title">การแจ้งเตือน</div>
          </div>
          <div class="list-action">
            <i class="bi bi-chevron-right"></i>
          </div>
        </div>
      </div>

      <div class="mobile-mt-3">
        <button class="mobile-btn mobile-btn-danger" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i>
          ออกจากระบบ
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { confirmSubmit } from '@/services/alert/sweetAlerts.js'

export default {
  name: 'MobileProfileView',

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  computed: {
    userName() {
      const user = this.authStore.user
      return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'ผู้ใช้งาน'
    },

    userRole() {
      const user = this.authStore.user

      if (!user || !user.role) return 'รออนุมัติสิทธิ์'
      if (Array.isArray(user.role) && user.role.length === 0) return 'รออนุมัติสิทธิ์'

      if (!Array.isArray(user.role)) {
        return user.role.name
      }

      const highestRole = user.role.reduce((highest, current) => {
        if (!highest || current.level > highest.level) return current
        return highest
      }, null)

      return highestRole ? highestRole.name : 'รออนุมัติสิทธิ์'
    },

    userImage() {
      return this.authStore?.user?.image
    }
  },

  methods: {
    navigateTo(path) {
      this.$router.push(path)
    },

    handleLogout() {
      confirmSubmit('', 'ออกจากระบบ', async () => {
        await this.authStore.logout()
        this.$router.push('/login')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-profile-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

.profile-header {
  background: linear-gradient(135deg, var(--base-font-color) 0%, var(--base-font-sub-color) 100%);
  padding: 40px 16px 32px;
  text-align: center;
  color: white;

  .avatar-container {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid rgba(255, 255, 255, 0.3);
    background: white;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      color: white;

      i {
        font-size: 3rem;
      }
    }
  }

  .user-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 4px 0;
  }

  .user-role {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0;
  }
}
</style>
