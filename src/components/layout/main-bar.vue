<template>
  <div class="main-bar-container" :class="{ 'is-scrolled': scrolled }">
    <div class="main-container">
      <div class="main-left-container">
        <div class="navbar-brand">
          <img src="@/assets/duangkaew-icon.png" alt="DK Logo" class="logo-img" />
          <!-- <span class="brand-text">DK Management</span> -->
        </div>
        <span class="page-title-inline show-tablet-only">{{ currentPageTitle }}</span>
        <div class="navbar-links">
          <button
            class="nav-item"
            type="button"
            :class="{ active: isActive('menu') }"
            :title="$t('breadcrumb.menu')"
            @click="onOpenSideBar"
          >
            <i class="bi bi-grid"></i>
            <span class="show-desktop-only">{{ $t('breadcrumb.menu') }}</span>
          </button>
          <router-link
            class="nav-item"
            :to="{ name: 'dashboard' }"
            :class="{ active: isActive('home') }"
            :title="$t('breadcrumb.dashboard')"
          >
            <i class="bi bi-house-door"></i>
            <span class="show-desktop-only">{{ $t('breadcrumb.dashboard') }}</span>
          </router-link>
          <router-link
            class="nav-item nav-item--badge"
            :to="{ name: 'ticket-create' }"
            :class="{ active: isActive('report') }"
            :title="$t('breadcrumb.report')"
          >
            <i class="bi bi-megaphone"></i>
            <span class="show-desktop-only">{{ $t('breadcrumb.report') }}</span>
            <span v-if="reportUnreadCount > 0" class="nav-badge">{{ reportUnreadCount }}</span>
          </router-link>
          <router-link
            v-if="hasTicketPermission"
            class="nav-item nav-item--badge"
            :to="{ name: 'ticket-manage' }"
            :class="{ active: isActive('ticket') }"
            :title="$t('breadcrumb.ticketManage')"
          >
            <i class="bi bi-card-checklist"></i>
            <span class="show-desktop-only">{{ $t('breadcrumb.ticketManage') }}</span>
            <span v-if="ticketOpenCount > 0" class="nav-badge">{{ ticketOpenCount }}</span>
          </router-link>
          <router-link
            class="nav-item"
            :to="{ name: 'user-account' }"
            :class="{ active: isActive('profile') }"
            :title="$t('breadcrumb.userAccount')"
          >
            <i class="bi bi-person"></i>
            <span class="show-desktop-only">{{ $t('breadcrumb.userAccount') }}</span>
          </router-link>
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
          <div class="user-profile-role hide-tablet">
            <span class="user-name">{{ userName || $t('common.label.user') }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <div>
            <span class="text-border"></span>
          </div>
        </div>
        <div class="logout-container">
          <ButtonGeneric
            variant="red"
            icon="bi-power"
            :title="$t('common.btn.logout')"
            @click="handleLogout"
          />
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
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { useTicketStore } from '@/stores/modules/api/ticket-store.js'
import swAlert from '@/services/alert/sweetAlerts.js'
import { setLocale } from '@/plugins/i18n/config.js'
import { storage } from '@/services/storage.js'

import SidebarView from '@/components/layout/side-bar.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  components: {
    SidebarView,
    ButtonGeneric
  },

  setup() {
    const authStore = useAuthStore()
    const ticketStore = useTicketStore()
    return { authStore, ticketStore }
  },

  computed: {
    activePage() {
      const routeMap = {
        dashboard: 'home',
        'user-account': 'profile',
        'ticket-create': 'report',
        'ticket-manage': 'ticket',
        'ticket-manage-detail': 'ticket'
      }
      return routeMap[this.$route.name] || 'menu'
    },

    currentPageTitle() {
      return this.$route.meta?.Displayname?.[this.$i18n.locale] || this.$route.meta?.Displayname?.th || ''
    },

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
        return this.$t('common.label.pendingRole')
      }

      // ถ้า role เป็น array เปล่า
      if (Array.isArray(user.role) && user.role.length === 0) {
        return this.$t('common.label.pendingRole')
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

      return highestRole ? highestRole.name : this.$t('common.label.pendingRole')
    }
  },

  watch: {
    $route(to, from) {
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
      scrolled: false,
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

    isActive(page) {
      return this.activePage === page
    },

    handleScroll() {
      this.scrolled = window.scrollY > 0
    },

    onOpenSideBar() {
      this.isSideBarVisible = true
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

    // ลบ event listener สำหรับการกด ESC เพื่อปิด sidebar
    document.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('scroll', this.handleScroll)
  },

  mounted() {
    // fetch badge + start polling ถ้ามีสิทธิ์
    if (this.hasTicketPermission) {
      this.ticketStore.fetchOpenCount()
      this.ticketPollId = setInterval(() => this.ticketStore.fetchOpenCount(), 60000)
    }

    this.ticketStore.fetchMyUnreadCount()
    this.reportPollId = setInterval(() => this.ticketStore.fetchMyUnreadCount(), 60000)

    // เพิ่ม event listener สำหรับการกด ESC เพื่อปิด sidebar
    document.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('scroll', this.handleScroll, { passive: true })
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
@import '@/assets/scss/responsive-style/web';

.main-bar-container {
  border-bottom: 1px solid var(--base-font-color);
  @include filled-surface;
  padding: 5px 0;
  box-shadow: var(--shadow-sm);
  position: relative; /* สำคัญสำหรับการจัดวาง sidebar */
  transition: box-shadow 0.2s ease;

  &.is-scrolled {
    box-shadow: var(--shadow-md);
  }
}

.page-title-inline {
  margin-left: var(--sp-md);
  color: var(--on-inverse);
  font-size: var(--fs-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
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
  border: none;
  border-radius: 5px;
  background: transparent;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--on-inverse);

  i {
    margin-right: 8px;
    font-size: 1.1rem;
  }

  &:hover {
    background-color: var(--overlay-white-hover);
  }

  &.active {
    background: var(--nav-active-gradient);
    color: var(--nav-active-on);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 16px var(--nav-active-glow);

    i {
      color: var(--nav-active-on);
      opacity: 1;
    }
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  color: var(--on-inverse);
  transition: color 0.2s ease; // เพิ่ม transition เพื่อให้การเปลี่ยนสีดูนุ่มนวล
  cursor: pointer;

  &:hover {
    color: var(--on-inverse-muted);
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
