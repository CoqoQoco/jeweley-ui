<template>
  <!-- 1.Sidebar -->
  <div id="layoutDashboard">
    <div id="mySidenav" :class="[isShowSidenav ? 'active-sidenav' : 'inactive-sidenav']">
      <!-- Logo -->
      <div class="logo-layout">
        <img
          src="@/assets/duangkaew-logo.png"
          class="avatar"
          :class="{ 'hidden-avatar': !isShowSidenav }"
        />
      </div>

      <!-- ขีดเส้น -->
      <div class="bottom-logo-line"></div>

      <div class="employee-container" :class="{ 'hidden-avatar': !isShowSidenav }">
        <div>
          <span class="employee-name bi bi-person-hearts mr-2"></span>
          <span class="employee-name">{{ `${user?.firstName} ${user?.lastName}` }}</span>
        </div>
        <div class="employee-role">{{ `[ ${userRole} ]` }}</div>
      </div>

      <!-- ขีดเส้น -->
      <div class="bottom-logo-line"></div>

      <!-- Side Menu -->
      <div class="sidebar-wrapper">
        <SlideBar :class="{ 'hidden-SlideBar': !isShowSidenav }"></SlideBar>
      </div>
    </div>

    <!-- 2.Main Workspace -->
    <div id="main" :class="[isShowSidenav ? 'active-main' : 'inactive-main']">
      <div class="layout-content">
        <router-view :key="$route.fullPath"></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import SlideBar from '@/components/layout/SideBar.vue'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
export default {
  components: {
    SlideBar
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  computed: {
    user() {
      return this.authStore.user
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

  data() {
    return {
      isShowSidenav: true
    }
  }
}
</script>

<style lang="scss" scoped>
//------ Slide Bar -----
#mySidenav {
  height: 100%;
  background-color: var(--base-color);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  transition-duration: 0.5s;
  z-index: 1;
  border-right: 1px solid var(--base-font-color);
}

.sidebar-wrapper {
  padding-top: 5px;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
}

.sidebar-wrapper:hover {
  z-index: 300;
}

.sidebar-wrapper::-webkit-scrollbar {
  width: 10px;
}

.sidebar-wrapper::-webkit-scrollbar-track {
  background-color: var(--base-color);
}

.sidebar-wrapper::-webkit-scrollbar-thumb {
  background-color: var(--base-color);
  border-radius: 10px;
}

.inactive-sidenav {
  width: 0;
}

.active-sidenav {
  width: 230px;
}

//----- Main -----
#main {
  transition-duration: 0.5s;
}

.inactive-main {
  margin-left: 0;
  width: 100%;
}

.active-main {
  margin-left: 230px;
  width: calc(100% - 230px);
}

.employee-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 10px 0px;

  .employee-name {
    font-size: 15px;
    font-weight: 200;
    color: var(--base-font-color);
  }

  .employee-role {
    font-size: 13px;
    color: var(--base-font-color);
  }
}

// Custom Style
.bottom-logo-line {
  border-bottom: 3px solid var(--base-font-color);
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 50%;
}

.logo-layout {
  padding-top: 10px;
  position: relative;
  text-align: center;

  .avatar {
    text-align: center;
    vertical-align: middle;
    width: 100px;
    height: 100px;
    opacity: 1;
    transition:
      opacity 0.5s ease-in-out,
      transform 0.3s ease-in-out;
  }

  .avatar-wrapper:hover .avatar {
    opacity: 0.8;
    transform: scale(1.05);
  }

  .hidden-avatar {
    opacity: 0;
    transition: 0.5s;
    transform: translateX(-100%);
  }
}

.hidden-SlideBar {
  opacity: 0;
  transition: 0.5s;
  transform: translateX(-100%);
}
</style>
