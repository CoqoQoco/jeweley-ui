<template>
  <div class="modern-menu-container">
    <!-- STEP 1 : MAIN MENU -->
    <!-- Render List Menu -->
    <div class="menu-list-container">
      <div
        v-for="(mainMenu, index) in menuForPermission"
        :key="index"
        class="cursor menu-item-container"
      >
        <!-- Wrapper -->
        <div class="main-menu">
          <div v-if="mainMenu.meta.tpLineShow" class="bottom-line-menu"></div>

          <!-- Has SubMenu -->
          <div
            v-if="mainMenu.subMenu.length"
            :class="['main-menu-wrapper', mainMenu.isOpen ? 'main-menu-active' : null]"
            @click="onToggleMainMenu(index)"
          >
            <div class="btn-link btn-main-menu flex-between-center">
              <div class="menu-title">
                <span :class="[mainMenu.meta.classIcon, 'menu-icon']"></span>
                <span class="menu-label">
                  {{ showMenuName(mainMenu) }}
                </span>
              </div>

              <div class="menu-right">
                <span class="menu-counter" v-if="mainMenu.meta && mainMenu.meta.counter">{{
                  mainMenu.meta.counter
                }}</span>
                <i
                  :class="[
                    'bi',
                    mainMenu.isOpen ? 'bi-caret-up-fill' : 'bi-caret-down-fill',
                    'menu-arrow'
                  ]"
                ></i>
              </div>
            </div>
          </div>

          <!-- No SubMenu -->
          <div v-if="!mainMenu.subMenu.length" class="main-menu-wrapper">
            <router-link :to="{ name: mainMenu.name }" v-slot="{ href, navigate }">
              <button class="btn-link btn-main-menu" :href="href" @click="navigate">
                <div class="menu-title">
                  <span :class="[mainMenu.meta.classIcon, 'menu-icon']"></span>
                  <span class="menu-label">
                    {{ showMenuName(mainMenu) }}
                  </span>
                </div>
                <span class="menu-counter" v-if="mainMenu.meta && mainMenu.meta.counter">{{
                  mainMenu.meta.counter
                }}</span>
              </button>
            </router-link>
          </div>

          <div v-if="mainMenu.meta.btLineShow" class="bottom-line-menu"></div>
        </div>

        <!-- STEP 2 : SUB MENU -->
        <div v-if="mainMenu.subMenu.length">
          <!-- Hidden Menu (Toggle with Flag:isOpen ) -->
          <div v-show="mainMenu.isOpen" class="submenu-container">
            <div
              v-for="(subMenu, indexSubMenu) in mainMenu.subMenu"
              :key="indexSubMenu"
              :class="[
                mainMenu.subMenu.length - 1 === indexSubMenu ? 'bottom-menu-border' : null,
                'submenu-item'
              ]"
            >
              <!-- Wrapper -->
              <div class="sub-menu">
                <div
                  v-if="subMenu.children"
                  :class="['sub-menu-wrapper', subMenu.isOpen ? 'sub-menu-active' : null]"
                  @click="onToggleSubMenu(index, indexSubMenu)"
                >
                  <div class="btn-link btn-sub-menu flex-between-center">
                    <span class="submenu-text">
                      {{ showMenuName(subMenu) }}
                    </span>

                    <div class="menu-right">
                      <span class="menu-counter" v-if="subMenu.meta && subMenu.meta.counter">{{
                        subMenu.meta.counter
                      }}</span>
                      <i
                        :class="[
                          'bi',
                          subMenu.isOpen ? 'bi-chevron-double-up' : 'bi-chevron-double-down',
                          'menu-arrow'
                        ]"
                      ></i>
                    </div>
                  </div>
                </div>

                <!-- No children -->
                <div v-if="!subMenu.children" class="sub-menu-wrapper">
                  <router-link :to="{ name: subMenu.name }" v-slot="{ href, navigate }">
                    <button class="btn-link btn-sub-menu" :href="href" @click="navigate">
                      <span class="submenu-text">
                        <i class="bi bi-arrow-right-circle submenu-icon"></i>
                        {{ showMenuName(subMenu) }}
                      </span>
                      <span class="menu-counter" v-if="subMenu.meta && subMenu.meta.counter">{{
                        subMenu.meta.counter
                      }}</span>
                    </button>
                  </router-link>
                </div>
              </div>

              <!-- STEP 3 : CHILDREN MENU -->
              <!-- Check Has List Data -->
              <div v-if="subMenu.children && subMenu.children.length">
                <!-- Hidden Menu (Toggle with Flag:isOpen ) -->
                <div v-show="subMenu.isOpen" class="children-container">
                  <!-- Render List Menu -->
                  <div
                    v-for="(childrenMenu, indexChildren) in subMenu.children"
                    :key="indexChildren"
                    class="children-item"
                  >
                    <!-- Wrapper -->
                    <div class="children-menu">
                      <!-- No Children (Only this condition) -->
                      <div class="children-menu-wrapper">
                        <span class="w-100">
                          <router-link
                            :to="{ name: childrenMenu.name }"
                            v-slot="{ href, navigate }"
                          >
                            <button
                              class="btn-link btn-children-menu"
                              :href="href"
                              @click="navigate"
                            >
                              <i class="bi bi-arrow-return-right mr-2"></i>
                              <span>{{ showMenuName(childrenMenu) }}</span>
                              <span
                                class="menu-counter children-counter"
                                v-if="childrenMenu.meta && childrenMenu.meta.counter"
                                >{{ childrenMenu.meta.counter }}</span
                              >
                            </button>
                          </router-link>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- end : children menu -->
            </div>
          </div>
        </div>
      </div>

      <div class="menu-separator"></div>

      <div class="main-menu">
        <div class="main-menu-wrapper logout-item">
          <button class="btn-link btn-main-menu" @click="handleLogout">
            <div class="menu-title">
              <span class="menu-icon bi bi-power"></span>
              <span class="menu-label">ออกจากระบบ</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Banner -->
    <!-- <div class="social-banner">
      <h2>ติดตามเราได้ที่</h2>
      <p>รับข่าวสารและข้อมูลอัพเดทล่าสุดของระบบ</p>
      <div class="social-icons">
        <a href="#" class="social-icon">
          <i class="bi bi-facebook"></i>
        </a>
        <a href="#" class="social-icon">
          <i class="bi bi-line"></i>
        </a>
        <a href="#" class="social-icon">
          <i class="bi bi-instagram"></i>
        </a>
      </div>
    </div> -->
  </div>
</template>

<script>
//import _ from 'lodash'
import swAlert from '@/services/alert/sweetAlerts.js'

import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
//import { PERMISSIONS } from '@/services/permission/config.js'
export default {
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      // DATA
      pageList: [],
      menuForPermission: []
    }
  },
  methods: {
    // ------------ Business Logic ------------
    // ใน Menu Component
    async setMenuBar() {
      const allList = this.$router.getRoutes()
      const user = this.authStore.getUser

      // ถ้าไม่มี user หรือไม่มี role ให้แสดงแค่ dashboard และ user-account
      if (!user?.role || user.role.length === 0) {
        const dashboardRoute = allList.find((route) => route.name === 'dashboard')
        const settingRoute = allList.find((route) => route.name === 'data-setting')

        if (dashboardRoute) {
          // เพิ่ม counter ตัวอย่าง (คุณสามารถลบหรือปรับแต่งตรงนี้ได้)
          dashboardRoute.meta = {
            ...dashboardRoute.meta,
            counter: 0
          }

          this.menuForPermission.push({
            ...dashboardRoute,
            isOpen: false,
            subMenu: []
          })
        }

        if (settingRoute) {
          // กรองเอาแค่ user-account submenu
          const userAccountMenu = settingRoute.children.find(
            (child) => child.name === 'user-account'
          )

          if (userAccountMenu) {
            this.menuForPermission.push({
              ...settingRoute,
              isOpen: false,
              subMenu: [
                {
                  ...userAccountMenu,
                  isOpen: false
                }
              ]
            })
          }
        }
        return
      }

      // กรณีมี role ทำงานปกติ
      const permissionService = new PermissionService(user)
      allList.forEach((route) => {
        if (route.meta.majorShow) {
          const hasAccess = permissionService.hasAnyPermission(route.meta.permissions)

          if (hasAccess || route.name === 'dashboard') {
            // เพิ่ม counter ตัวอย่าง (คุณสามารถลบหรือปรับแต่งตรงนี้ได้)
            if (!route.meta.counter && route.name !== 'dashboard') {
              route.meta = {
                ...route.meta,
                counter: 0
                //counter: Math.floor(Math.random() * 1000)
              }
            }

            const subMenu = this.getAuthorizedSubMenus(route, permissionService)
            this.menuForPermission.push({
              ...route,
              isOpen: false,
              subMenu
            })
          }
        }
      })
    },
    getAuthorizedSubMenus(route, permissionService) {
      if (route.name === 'dashboard') return []

      return route.children
        .filter((child) => {
          if (!child.meta.minorShow) return false
          // อนุญาต user-account เสมอ
          if (child.name === 'user-account') return true
          return permissionService.hasAnyPermission(child.meta.permissions)
        })
        .map((menu) => {
          // เพิ่ม counter ตัวอย่าง (คุณสามารถลบหรือปรับแต่งตรงนี้ได้)
          if (!menu.meta.counter) {
            menu.meta = {
              ...menu.meta,
              counter: 0
              //counter: Math.floor(Math.random() * 0)
            }
          }

          return {
            ...menu,
            isOpen: false
          }
        })
    },
    // ------------ Actions (Open hidden menu) ------------
    onToggleMainMenu(mainIndex) {
      this.menuForPermission[mainIndex].isOpen = !this.menuForPermission[mainIndex].isOpen
    },
    onToggleSubMenu(mainIndex, subIndex) {
      this.menuForPermission[mainIndex].subMenu[subIndex].isOpen =
        !this.menuForPermission[mainIndex].subMenu[subIndex].isOpen
    },
    async handleLogout() {
      console.log('Logout')
      //this.$store.dispatch('auth/logout')
      swAlert.confirmSubmit('', 'ออกจากระบบ', async () => {
        await this.authStore.logout()
        const redirectPath = this.$route.query.redirect
        this.$router.push(redirectPath || '/')
      })
    },

    // ------------ Utils ------------
    showMenuName(data) {
      return data.meta.Displayname.th
    }
  },
  async created() {
    await this.setMenuBar()
  }
}
</script>

<style lang="scss" scoped>
// Vriable & Mixin
@mixin flex-between-center {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@mixin menu-wrapper {
  @include flex-between-center;
  width: 100%;
  color: var(--base-font-color);
  transition-duration: 0.3s;
  > a {
    width: inherit;
  }
}

/* Modern Styling for Full Page Menu */
.modern-menu-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px);
  padding: 0;
  margin: 0;
  background-color: var(--base-sub-color);
  color: #ffffff;
}

.menu-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  scrollbar-width: thin;
  scrollbar-color: #555 var(--base-font-sub-color);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--base-font-sub-color);
  }

  &::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 4px;
  }
}

.menu-item-container {
  margin-bottom: 6px;
}

.bottom-line-menu {
  border-bottom: 2px solid #555;
  margin: 5px 0;
}

/* Main Menu Styling */
.main-menu-wrapper {
  @include menu-wrapper;
  background-color: #2d2d2d;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #3a3a3a;
  }

  &.main-menu-active {
    background-color: #404040;
  }
}

.btn-main-menu {
  padding: 12px 16px;
  border-radius: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-title {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
}

.menu-label {
  font-size: 0.95rem;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-counter {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  min-width: 30px;
  text-align: center;
}

.menu-arrow {
  font-size: 0.7rem;
  color: #888;
}

/* Submenu Styling */
.submenu-container {
  padding-left: 10px;
  margin-bottom: 8px;
}

.submenu-item {
  margin-bottom: 2px;
}

.sub-menu-wrapper {
  @include menu-wrapper;
  background-color: #2d2d2d;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #333333;
  }

  &.sub-menu-active {
    background-color: #383838;
  }
}

.btn-sub-menu {
  padding: 10px 14px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.submenu-text {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.submenu-icon {
  font-size: 0.8rem;
  color: #888;
  margin-right: 4px;
}

/* Children Menu Styling */
.children-container {
  padding-left: 15px;
  margin-bottom: 4px;
}

.children-item {
  margin-bottom: 2px;
}

.children-menu-wrapper {
  background-color: #2d2d2d;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #333333;
  }
}

.btn-children-menu {
  padding: 8px 12px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
}

.children-counter {
  font-size: 0.7rem;
}

/* Menu Separator */
.menu-separator {
  height: 1px;
  background-color: #444;
  margin: 15px 0;
}

/* Logout Button */
.logout-item {
  margin-top: 10px;
  background-color: rgba(220, 53, 69, 0.2);

  &:hover {
    background-color: rgba(220, 53, 69, 0.3);
  }

  .menu-icon {
    color: #dc3545;
  }
}

/* Active Route Styling */
.router-link-active {
  > .btn-link {
    background-color: var(--base-font-color);
    color: white !important;
    font-weight: 500;

    .menu-counter {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

/* Social Banner */
.social-banner {
  background: linear-gradient(135deg, #6f42c1, #007bff);
  padding: 20px;
  margin: 15px 10px;
  border-radius: 12px;
  color: white;

  h2 {
    font-size: 1.2rem;
    margin-bottom: 8px;
    font-weight: 500;
  }

  p {
    margin-bottom: 15px;
    font-size: 0.9rem;
    opacity: 0.9;
  }
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icon {
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  i {
    font-size: 1.1rem;
    color: white;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
}

/* General Button Styling */
.btn-link {
  background-color: transparent;
  border: none;
  outline: none;
  text-align: left;
  text-decoration: none;
  color: #ffffff;

  &:hover,
  &:focus {
    color: #ffffff !important;
    text-decoration: none !important;
  }
}

.flex-between-center {
  @include flex-between-center;
}
</style>
