<template>
  <div class="main-bar-container">
    <div class="main-container">
      <div class="main-left-container">
        <div class="navbar-brand">
          <img src="@/assets/duangkaew-icon.png" alt="DK Logo" class="logo-img" />
          <!-- <span class="brand-text">DK Management</span> -->
        </div>
        <div class="navbar-links">
          <div class="nav-item" :class="{ active: isActive('menu') }" @click="onOpenSideBar">
            <i class="bi bi-grid"></i>
            <span>หัวข้องาน</span>
          </div>
          <div
            class="nav-item"
            :class="{ active: isActive('home') }"
            @click="navigateTo('home', 'dashboard')"
          >
            <i class="bi bi-house-door"></i>
            <span>{{ $t('breadcrumb.dashboard') }}</span>
          </div>
          <div
            class="nav-item nav-item--badge"
            :class="{ active: isActive('report') }"
            @click="navigateTo('report', 'ticket-create')"
          >
            <i class="bi bi-megaphone"></i>
            <span>{{ $t('breadcrumb.report') }}</span>
            <span v-if="reportUnreadCount > 0" class="nav-badge">{{ reportUnreadCount }}</span>
          </div>
          <div
            v-if="hasTicketPermission"
            class="nav-item nav-item--badge"
            :class="{ active: isActive('ticket') }"
            @click="navigateTo('ticket', 'ticket-manage')"
          >
            <i class="bi bi-card-checklist"></i>
            <span>{{ $t('breadcrumb.ticketManage') }}</span>
            <span v-if="ticketOpenCount > 0" class="nav-badge">{{ ticketOpenCount }}</span>
          </div>
          <div
            class="nav-item"
            :class="{ active: isActive('profile') }"
            @click="navigateTo('profile', 'user-account')"
          >
            <i class="bi bi-person"></i>
            <span>{{ $t('breadcrumb.userAccount') }}</span>
          </div>
        </div>
      </div>
      <div class="main-right-container">
        <div class="lang-switcher">
          <button
            class="lang-btn"
            :class="{ 'lang-btn--active': currentLang === 'th' }"
            @click="switchLang('th')"
          >TH</button>
          <span class="lang-divider">|</span>
          <button
            class="lang-btn"
            :class="{ 'lang-btn--active': currentLang === 'en' }"
            @click="switchLang('en')"
          >EN</button>
        </div>
        <div class="user-profile">
          <div class="avatar">
            <div v-if="userImage" class="avatar-image">
              <img :src="userImage" alt="User Avatar" />
            </div>
            <i v-else class="bi bi-person-circle"></i>
          </div>
          <div class="user-profile-role">
            <span class="user-name">{{ userName || 'ผู้ใช้งาน' }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <div>
            <span class="text-border"></span>
          </div>
        </div>
        <div class="logout-container">
          <span class="menu-icon bi bi-power" @click="handleLogout"></span>
        </div>
      </div>
    </div>

    <!-- Custom Sidebar -->
    <div class="custom-sidebar-overlay" v-if="isSideBarVisible" @click="closeSidebar"></div>
    <div class="custom-sidebar" :class="{ 'sidebar-visible': isSideBarVisible }">
      <div class="sidebar-header">
        <div class="sidebar-title">
          <span class="sidebar-icon-box">
            <i class="bi bi-grid-fill menu-icon"></i>
          </span>
          <span>{{ $t('sidebar.title') }}</span>
        </div>
        <button class="close-sidebar-btn" @click="closeSidebar" :title="$t('common.btn.close')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="sidebar-content">
        <SidebarView class="sidebar-view-component"></SidebarView>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarView from '@/components/layout/side-bar.vue'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { useTicketStore } from '@/stores/modules/api/ticket-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { setLocale } from '@/plugins/i18n/config.js'
import { storage } from '@/services/storage.js'

export default {
  components: {
    SidebarView
  },

  setup() {
    const authStore = useAuthStore()
    const ticketStore = useTicketStore()
    return { authStore, ticketStore }
  },

  computed: {
    hasTicketPermission() {
      return this.authStore.hasPermission('ticket:manage')
    },

    ticketOpenCount() {
      return this.ticketStore.openCount
    },

    reportUnreadCount() {
      return this.ticketStore.myUnreadCount
    },

    userName() {
      return `${this.authStore?.user.firstName} ${this.authStore?.user.lastName}`
    },

    userImage() {
      return this.authStore?.user.image
    },

    userRole() {
      const user = this.authStore.user

      // เช็คว่ามี user และ role หรือไม่
      if (!user || !user.role) {
        return 'รออนุมัติสิทธิ์'
      }

      // ถ้า role เป็น array เปล่า
      if (Array.isArray(user.role) && user.role.length === 0) {
        return 'รออนุมัติสิทธิ์'
      }

      // ถ้ามี role เดียว
      if (!Array.isArray(user.role)) {
        return user.role.name
      }

      // หา role ที่มี level สูงสุด
      const highestRole = user.role.reduce((highest, current) => {
        if (!highest || current.level > highest.level) {
          return current
        }
        return highest
      }, null)

      return highestRole ? highestRole.name : 'รออนุมัติสิทธิ์'
    }
  },

  watch: {
    $route(to, from) {
      if (to.name === 'dashboard') {
        this.setActive('home')
      } else if (to.name === 'user-account') {
        this.setActive('profile')
      } else if (to.name === 'ticket-create') {
        this.setActive('report')
      } else if (to.name === 'ticket-manage' || to.name === 'ticket-manage-detail') {
        this.setActive('ticket')
      } else {
        this.setActive('menu')
      }

      // refresh badge เมื่อออกจากหน้า ticket-manage
      if (
        this.hasTicketPermission &&
        from &&
        (from.name === 'ticket-manage' || from.name === 'ticket-manage-detail') &&
        to.name !== 'ticket-manage' &&
        to.name !== 'ticket-manage-detail'
      ) {
        this.ticketStore.fetchOpenCount()
      }

      if (from && from.name === 'ticket-my' && to.name !== 'ticket-my') {
        this.ticketStore.fetchMyUnreadCount()
      }

      this.closeSidebar()
    }
  },

  data() {
    return {
      isSideBarVisible: false,
      activePage: 'home',
      currentLang: storage.getItem('lang', 'th'),
      ticketPollId: null,
      reportPollId: null
    }
  },

  methods: {
    switchLang(lang) {
      setLocale(lang)
      this.currentLang = lang
    },

    navigateTo(activeTab, routeName) {
      this.setActive(activeTab)
      this.$router.push({ name: routeName })
    },
    isActive(page) {
      return this.activePage === page
    },

    setActive(page) {
      this.activePage = page
    },

    onOpenSideBar() {
      this.isSideBarVisible = true
      //this.setActive('menu')
      document.body.style.overflow = 'hidden' // ป้องกันการเลื่อนหน้าเว็บเมื่อ sidebar เปิด
    },

    closeSidebar() {
      this.isSideBarVisible = false
      document.body.style.overflow = '' // คืนค่าการเลื่อนหน้าเว็บเมื่อปิด sidebar
    },

    async handleLogout() {
      //this.$store.dispatch('auth/logout')
      swAlert.confirmSubmit(
        '',
        this.$t('common.btn.logout'),
        async () => {
          await this.authStore.logout()
          const redirectPath = this.$route.query.redirect
          this.$router.push(redirectPath || '/')
        },
        '',
        '',
        ''
      )
    }
  },

  // Cleanup event listeners เมื่อ component ถูกทำลาย
  beforeUnmount() {
    document.body.style.overflow = '' // คืนค่าการเลื่อนหน้าเว็บ

    if (this.ticketPollId) {
      clearInterval(this.ticketPollId)
    }

    if (this.reportPollId) {
      clearInterval(this.reportPollId)
    }

    // เพิ่ม event listener สำหรับการกด ESC เพื่อปิด sidebar
    document.removeEventListener('keydown', this.handleKeyDown)
  },

  mounted() {
    // ตรวจสอบ route ปัจจุบันและตั้งค่า activePage
    if (this.$route.name === 'dashboard') {
      this.setActive('home')
    } else if (this.$route.name === 'user-account') {
      this.setActive('profile')
    } else if (this.$route.name === 'ticket-create') {
      this.setActive('report')
    } else if (
      this.$route.name === 'ticket-manage' ||
      this.$route.name === 'ticket-manage-detail'
    ) {
      this.setActive('ticket')
    } else {
      this.setActive('menu')
    }

    // fetch badge + start polling ถ้ามีสิทธิ์
    if (this.hasTicketPermission) {
      this.ticketStore.fetchOpenCount()
      this.ticketPollId = setInterval(() => this.ticketStore.fetchOpenCount(), 60000)
    }

    this.ticketStore.fetchMyUnreadCount()
    this.reportPollId = setInterval(() => this.ticketStore.fetchMyUnreadCount(), 60000)

    // เพิ่ม event listener สำหรับการกด ESC เพื่อปิด sidebar
    document.addEventListener('keydown', this.handleKeyDown)
  },

  created() {
    // Cleanup เมื่อ component ถูกทำลาย
    this.handleKeyDown = (e) => {
      if (e.key === 'Escape' && this.isSideBarVisible) {
        this.closeSidebar()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixin.scss';

.main-bar-container {
  border-bottom: 1px solid var(--base-font-color);
  //background-color: var(--base-color);
  background: var(--surface-inverse-gradient-bar);
  padding: 5px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative; /* สำคัญสำหรับการจัดวาง sidebar */
}

.main-container {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr minmax(250px, 350px);
  align-items: center;
}

.main-left-container {
  display: flex;
  align-items: center;
  padding-left: 20px;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 30px;
  width: auto;
}

.navbar-links {
  display: flex;
  gap: 5px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--base-font-color);
  color: white;

  i {
    margin-right: 8px;
    font-size: 1.1rem;
  }

  &:hover {
    background-color: rgba(7, 7, 7, 0.05);
  }

  &.active {
    background-color: var(--base-font-sub-color);
    color: white;
  }
}

.nav-item--badge {
  position: relative;
}

.nav-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--base-red);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
}

.main-right-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
  padding-right: 20px;
}

.lang-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
}

.lang-btn {
  background: none;
  border: none;
  color: var(--on-inverse-dim);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  line-height: 1;

  &:hover {
    color: var(--on-inverse);
    background-color: var(--overlay-white-hover);
  }

  &--active {
    color: var(--on-inverse);
    font-weight: 700;
    background-color: var(--overlay-white-solid);
  }
}

.lang-divider {
  color: var(--on-inverse-label);
  font-size: 0.75rem;
  line-height: 1;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;

  .user-profile-role {
    display: flex;
    justify-content: center;
    flex-direction: column;
  }

  .user-name {
    font-size: 0.9rem;
    color: var(--on-inverse);
  }
  .user-role {
    font-size: 0.7rem;
    color: var(--on-inverse);
  }

  .avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: var(--base-font-sub-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    overflow: hidden;

    i {
      font-size: 1.2rem;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      //border: 1px solid blue;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  border-right: 2px solid var(--on-inverse);
}

.menu-icon {
  font-size: 1.2rem;
  //margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  //color: var(--base-font-color);
  color: var(--on-inverse);
  transition: color 0.2s ease; // เพิ่ม transition เพื่อให้การเปลี่ยนสีดูนุ่มนวล
  cursor: pointer;

  &:hover {
    color: var(--menu-hover-color, #ff6b6b); // ใช้ตัวแปรสำรองเป็นสีแดงอ่อน
    // หรือจะใช้แบบนี้
    // color: rgba(var(--base-font-color-rgb), 0.7); // ถ้ามีตัวแปร RGB components
    // หรือ
    // filter: brightness(1.5); // ทำให้สว่างขึ้นโดยใช้ filter
  }
}

/* Custom Sidebar Styles */
.custom-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.2s ease-in-out;
}

.custom-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 320px;
  @include filled-surface;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
}

.sidebar-visible {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-lg);
  border-bottom: 1px solid var(--overlay-white-hover);
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--sp-sm);

  .sidebar-icon-box {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: var(--overlay-white-solid);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-icon {
    margin-right: 0;
  }
}

.close-sidebar-btn {
  background: none;
  border: none;
  color: var(--on-inverse);
  font-size: 1.2rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--overlay-white-hover);
  }
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--overlay-white-strong);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--overlay-white-strong);
  }
}

.sidebar-view-component {
  height: 100%;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
