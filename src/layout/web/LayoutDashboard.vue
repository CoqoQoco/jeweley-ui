<template>
  <div id="layoutDashboard">
    <!-- 1.Sidebar -->
    <div id="mySidenav" :class="[isShowSidenav ? 'active-sidenav' : 'inactive-sidenav']">
      <!-- Logo -->
      <div class="logo-layout">
        <!-- <div class="logo-wrapper">
          <img src="@/assets/logo.svg" />
        </div>
        <div class="show-version">V.{{ version }}</div> -->
        <img
          src="@/assets/duangkaew-logo.png"
          class="avatar"
          :class="{ 'hidden-avatar': !isShowSidenav }"
        />
      </div>

      <!-- ขีดเส้น -->
      <div class="bottom-logo-line"></div>

      <div class="employee-container" :class="{ 'hidden-avatar': !isShowSidenav }">
        <!-- <div class="title">สวัสดี</div> -->
        <div>
          <span class="employee-name bi bi-person-hearts mr-2"></span>
          <span class="employee-name">{{ `${user.firstName} ${user.lastName}` }}</span>
        </div>
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
      <!-- 2.1. Navbar -->
      <!-- <nav class="layout-header">
        <div class="breadcrumb-wrapper">
          <span class="menu-toggle bi bi-justify" @click="isShowSidenav = !isShowSidenav"></span>
          <Breadcrumb />
        </div>
        <div class="logo-and-search">
          <div class="logo">
            <img src="@/assets/duangkaew-logo.png" alt="Logo Image" />
          </div>
          <div class="search-bar">
            <input type="text" placeholder="ค้นหา ..." />
            <span class="bi bi-search"></span>
          </div>
        </div>
        <UserProfile></UserProfile>
      </nav> -->
      <!-- 2.2. Router Render -->
      <div class="layout-content">
        <router-view :key="$route.fullPath"></router-view>
        <!-- <BaseLoading /> -->
      </div>
    </div>
  </div>
</template>

<script>
import SlideBar from '@/components/layout/SideBar.vue'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
//import Breadcrumb from '@/components/layout/BreadcrumbName.vue'
export default {
  components: {
    SlideBar
    //Breadcrumb
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  computed: {
    user() {
      return this.authStore.user
    }
  },

  data() {
    return {
      isShowSidenav: true
    }
  },

  watch: {}
}
</script>

<style lang="scss" scoped>
//------ Slide Bar -----
#mySidenav {
  height: 100%;
  background-color: var(--base-color);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* เพิ่มเงา */

  position: fixed;
  top: 0;
  left: 0;

  display: flex;
  flex-direction: column;

  transition-duration: 0.5s;
  z-index: 1;
  border-right: 1px solid var(--base-font-color); /* เพิ่มเส้นขอบด้านขวา */

  .inactive-main {
    opacity: 0;
    transition: 0.5s;
    transform: translateX(-100%);
  }
  //opacity: 0;
  //transition: 0.5s;
  //transform: translateX(-100%);
}
.sidebar-wrapper {
  padding-top: 5px;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    /* Chrome, Safari, Edge */
    display: none;
  }
  -ms-overflow-style: none; /* IE/Edge */
}
.sidebar-wrapper:hover {
  //overflow-y: overlay;
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

  //opacity: 0;
  //transition: 0.5s;
  //transform: translateX(-100%);
}
.inactive-main {
  margin-left: 0;
  width: 100%;

  //opacity: 0;
  //transition: 0.5s;
  //transform: translateX(-100%);
}
.active-main {
  margin-left: 230px;
  width: calc(100% - 230px);
}
.layout-header {
  height: 50px;
  width: inherit;
  background-color: var(--base-color);
  position: fixed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 97;
  top: 0;
  right: 0;
  border-bottom: 1px solid var(--base-font-color); /* เพิ่มเส้นขอบด้านขวา */

  .breadcrumb-wrapper {
    display: flex;
    align-items: center;
  }
  .menu-toggle {
    cursor: pointer;
    color: var(--base-font-color);
    padding: 10px;
  }

  .logo-and-search {
    display: flex;
    align-items: center;
  }

  .logo {
    margin-right: 20px; /* ระยะห่างระหว่างโลโก้กับเส้นค้นหา */
  }

  .logo img {
    max-width: 70px; /* ขนาดสูงสุดของโลโก้ */
    height: auto;
  }

  //search bar
  .search-bar {
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 5px;
    padding: 2px 5px;
    margin-right: 10px;
    border: 1px solid var(--base-font-color);
  }
  .search-bar input {
    border: none;
    outline: none;
    padding: 5px;
    font-size: 15px;
  }
  .search-bar .bi-search {
    font-size: 15px;
    margin-left: 5px;
    cursor: pointer;
  }
}
.layout-content {
  //padding-top: 50px;
}

.employee-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 10px 0px;
  .title {
    font-size: 18px;
    font-weight: 400;
    color: var(--base-sub-color);
  }
  .employee-name {
    font-size: 15px;
    font-weight: 200;
    color: var(--base-font-color);
  }
}

// Custom Style
.bottom-logo-line {
  // เพิ่ม border ด้านล่าง
  border-bottom: 3px solid var(--base-font-color);
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 50%; /* ทำให้เส้นขอบเป็นเส้นกลม */
}
.logo-layout {
  padding-top: 10px;
  //height: 160px;
  //padding-bottom: 5px;
  position: relative;
  text-align: center;
  //align-items: flex-end; /* ตำแหน่งของขีดเส้นใต้ */

  // เพิ่ม border ด้านล่าง
  //border-bottom: 2px solid var(--base-font-color);
  //width: 80%; /* ความกว้างของเส้นขอบ */

  .avatar {
    text-align: center;
    vertical-align: middle;
    width: 100px;
    height: 100px;
    //border-radius: 50%;
    //border: 1px solid var(--base-font-color);
    //border-style: ridge;
    opacity: 1; /* เริ่มต้นเป็นรูปแสดงออกมา */
    transition:
      opacity 0.5s ease-in-out,
      transform 0.3s ease-in-out; /* เพิ่มเอฟเฟกต์การเปลี่ยน opacity */
  }
  .avatar-wrapper:hover .avatar {
    opacity: 0.8;
    transform: scale(1.05);
  }
  .hidden-avatar {
    opacity: 0;
    transition: 0.5s;
    transform: translateX(-100%); /* เลื่อนรูปไปทางซ้าย */
  }

  .logo-wrapper {
    text-align: center;

    // img {
    //   height: 30px;
    //   transform: translateY(-3px) translateX(-10px);
    // }
  }

  .show-stagging {
    position: absolute;
    top: 5px;
    right: 10px;
    color: var(--base-color);
    font-size: 10px;
    z-index: 3;
  }

  .show-version {
    position: absolute;
    bottom: 5px;
    right: 10px;
    color: var(--base-color);
    font-size: 10px;
  }
}
.hidden-SlideBar {
  opacity: 0;
  transition: 0.5s;
  transform: translateX(-100%); /* เลื่อนรูปไปทางซ้าย */
}
</style>
