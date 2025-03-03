<template>
  <div id="app-layout">
    <!-- Fixed Main Bar on top -->
    <div class="mainbar-container">
      <mainBar></mainBar>
    </div>

    <div id="modal-container"></div>

    <!-- Content Area (includes sidebar and main content) -->
    <div class="content-container">
      <div id="main" class="main-content">
        <router-view :key="$route.fullPath"></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import mainBar from '@/components/layout/main-bar.vue'
//import SlideBar from '@/components/layout/SideBar.vue'

import { useAuthStore } from '@/stores/modules/authen/authen-store.js'

export default {
  components: {
    mainBar
    //SlideBar
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
      isShowSidenav: false
    }
  }
}
</script>

<style lang="scss" scoped>
/* Layout Structure */
#app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.mainbar-container {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.content-container {
  display: flex;
  flex: 1;
  position: relative;
}

/* Main Content Area */
.main-content {
  flex: 1;
  //padding: 20px;
  width: 100%;
  //margin-top: 10px; /* เพิ่มระยะห่างจาก mainbar */
  min-height: calc(100vh - 60px); /* ปรับความสูงตามความสูงของ mainbar */
}

/* Sidebar Styles (คอมเม้นต์ไว้แต่ยังคงไว้เผื่อต้องใช้ในอนาคต) */
#mySidenav {
  height: 100%;
  background-color: var(--base-color);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 60px; /* ปรับตำแหน่งให้อยู่ใต้ mainbar */
  left: 0;
  display: flex;
  flex-direction: column;
  transition-duration: 0.5s;
  z-index: 900;
  border-right: 1px solid var(--base-font-color);
  height: calc(100vh - 60px); /* ปรับความสูงตามความสูงของ mainbar */
}

.sidebar-wrapper {
  padding-top: 5px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;

  &:hover {
    z-index: 300;
  }

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background-color: var(--base-color);
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--base-color);
    border-radius: 10px;
  }
}

.inactive-sidenav {
  width: 0;
}

.active-sidenav {
  width: 230px;
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

/* Custom Style */
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
