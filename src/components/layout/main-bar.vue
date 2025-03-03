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
            <span>หน้าแรก</span>
          </div>
          <div
            class="nav-item"
            :class="{ active: isActive('profile') }"
            @click="navigateTo('profile', 'user-account')"
          >
            <i class="bi bi-person"></i>
            <span>ข้อมูลบุคคล</span>
          </div>
        </div>
      </div>
      <div class="main-right-container">
        <div class="user-profile">
          <div class="avatar">
            <div v-if="userImage" class="avatar-image">
              <img :src="`data:image/png;base64,${userImage}`" alt="User Avatar" />
            </div>
            <i v-else class="bi bi-person-circle"></i>
          </div>
          <div class="user-profile-role">
            <span class="user-name">{{ userName || 'ผู้ใช้งาน' }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Sidebar -->
    <div class="custom-sidebar-overlay" v-if="isSideBarVisible" @click="closeSidebar"></div>
    <div class="custom-sidebar" :class="{ 'sidebar-visible': isSideBarVisible }">
      <div class="sidebar-header">
        <div class="sidebar-title">
          <i class="bi bi-grid-fill menu-icon"></i>
          <span> เลือกงาน</span>
        </div>
        <button class="close-sidebar-btn" @click="closeSidebar">
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

export default {
  components: {
    SidebarView
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  computed: {
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
        return user.role.name.toUpperCase()
      }

      // หา role ที่มี level สูงสุด
      const highestRole = user.role.reduce((highest, current) => {
        if (!highest || current.level > highest.level) {
          return current
        }
        return highest
      }, null)

      return highestRole ? highestRole.name.toUpperCase() : 'รออนุมัติสิทธิ์'
    }
  },

  watch: {
    $route(to) {
      //console.log('Route Changed to:', to)
      if (to.name === 'dashboard') {
        this.setActive('home')
      }
    }
  },

  data() {
    return {
      isSideBarVisible: false,
      activePage: 'home'
    }
  },

  methods: {
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
      this.setActive('menu')
      document.body.style.overflow = 'hidden' // ป้องกันการเลื่อนหน้าเว็บเมื่อ sidebar เปิด
    },

    closeSidebar() {
      this.isSideBarVisible = false
      document.body.style.overflow = '' // คืนค่าการเลื่อนหน้าเว็บเมื่อปิด sidebar
    }
  },

  // Cleanup event listeners เมื่อ component ถูกทำลาย
  beforeUnmount() {
    document.body.style.overflow = '' // คืนค่าการเลื่อนหน้าเว็บ

    // เพิ่ม event listener สำหรับการกด ESC เพื่อปิด sidebar
    document.removeEventListener('keydown', this.handleKeyDown)
  },

  mounted() {
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
.main-bar-container {
  border-bottom: 1px solid var(--base-font-color);
  //background-color: var(--base-color);
  background: linear-gradient(to right, var(--base-font-color), var(--base-font-sub-color));
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

.main-right-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
  padding-right: 20px;
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
    color: white;
  }
  .user-role {
    font-size: 0.7rem;
    color: white;
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
  background-color: var(--base-sub-color);
  color: #fff;
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
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: 500;
  display: flex;
  align-items: center;

  .menu-icon {
    margin-right: 10px;
  }
}

.close-sidebar-btn {
  background: none;
  border: none;
  color: #fff;
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
    background-color: rgba(255, 255, 255, 0.1);
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
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
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
