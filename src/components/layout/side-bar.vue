<template>
  <div class="modern-menu-container">
    <!-- STEP 1 : MAIN MENU -->
    <!-- Render List Menu -->
    <div class="menu-list-container">
      <div v-for="(mainMenu, index) in menuForPermission" :key="index" class="cursor menu-item-container">
        <!-- Section divider + label -->
        <div v-if="showSectionHeader(index)">
          <div v-if="index !== 0" class="menu-section-divider"></div>
          <div class="menu-section-label">
            {{ $t('sidebar.section.' + sectionOf(index)) }}
          </div>
        </div>

        <!-- Wrapper -->
        <div class="main-menu">
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
              <span class="menu-label">{{ $t('common.btn.logout') }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//import _ from 'lodash'
import swAlert from '@/services/alert/sweetAlerts.js'

import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { usePrePlanStore } from '@/stores/modules/api/production/pre-plan-store.js'
//import { PERMISSIONS } from '@/services/permission/config.js'
export default {
  setup() {
    const authStore = useAuthStore()
    const prePlanStore = usePrePlanStore()
    return { authStore, prePlanStore }
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
      const permissionService = new PermissionService(user, this.authStore.permissions)
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

      const waitingCount = await this.prePlanStore.fetchWaitingCount()
      if (waitingCount > 0) {
        for (const mainMenu of this.menuForPermission) {
          for (const sub of mainMenu.subMenu || []) {
            if (sub.name === 'plan-order') {
              sub.meta = { ...sub.meta, counter: waitingCount }
            }
          }
        }
      }
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
      //this.$store.dispatch('auth/logout')
      swAlert.confirmSubmit('', this.$t('common.btn.logout'), async () => {
        await this.authStore.logout()
        const redirectPath = this.$route.query.redirect
        this.$router.push(redirectPath || '/')
      })
    },

    // ------------ Utils ------------
    showMenuName(data) {
      return data.meta.Displayname[this.$i18n.locale] || data.meta.Displayname.th
    },
    sectionOf(index) {
      const mainMenu = this.menuForPermission[index]
      return (mainMenu && mainMenu.meta.menuSection) || 'main'
    },
    showSectionHeader(index) {
      return index === 0 || this.sectionOf(index) !== this.sectionOf(index - 1)
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
  background-color: transparent;
  color: var(--on-inverse);
}

.menu-list-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--sp-sm);
  scrollbar-width: thin;
  scrollbar-color: var(--overlay-white-strong) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--overlay-white-strong);
    border-radius: var(--radius-sm);
  }
}

.menu-item-container {
  margin-bottom: var(--sp-xs);
}

.bottom-line-menu {
  border-bottom: 2px solid var(--overlay-white-solid);
  margin: var(--sp-xs) 0;
}

/* Main Menu Styling */
.main-menu-wrapper {
  @include menu-wrapper;
  background-color: transparent;
  border-radius: var(--radius-md);
  margin-bottom: var(--sp-xs);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--overlay-white-hover);
  }

  &.main-menu-active {
    background-color: var(--overlay-white-hover);
  }
}

.btn-main-menu {
  padding: var(--sp-md) var(--sp-lg);
  border-radius: var(--radius-md);
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
  margin-right: var(--sp-md);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  color: var(--on-inverse-muted);
}

.menu-label {
  font-size: 0.95rem;
  color: var(--on-inverse);
  font-weight: 600;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
}

.menu-counter {
  /* แสดงเฉพาะเมื่อ meta.counter มีค่าจริง (v-if truthy) → ใช้สีแดงเป็นค่าเริ่มต้นเสมอ */
  background-color: var(--base-red);
  padding: 2px var(--sp-sm);
  border-radius: 10px;
  font-size: 0.75rem;
  min-width: 30px;
  text-align: center;
}

.menu-arrow {
  font-size: 0.7rem;
  color: var(--on-inverse-dim);
}

/* Submenu Styling */
.submenu-container {
  margin: var(--sp-xs) 0 var(--sp-xs) var(--sp-md);
  padding-left: var(--sp-md);
  border-left: 2px solid var(--overlay-white-solid);
}

.submenu-item {
  margin-bottom: 2px;
}

.sub-menu-wrapper {
  @include menu-wrapper;
  background-color: transparent;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--overlay-white-hover);
  }

  &.sub-menu-active {
    background-color: var(--overlay-white-subtle);
  }
}

.btn-sub-menu {
  padding: var(--sp-md) 14px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.submenu-text {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--on-inverse-dim);
}

.submenu-icon {
  font-size: 0.8rem;
  color: var(--on-inverse-dim);
  margin-right: var(--sp-xs);
}

/* Children Menu Styling */
.children-container {
  padding-left: var(--sp-md);
  margin-left: var(--sp-sm);
  border-left: 1px solid var(--overlay-white-hover);
  margin-bottom: var(--sp-xs);
}

.children-item {
  margin-bottom: 2px;
}

.children-menu-wrapper {
  background-color: transparent;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--overlay-white-hover);
  }
}

.btn-children-menu {
  padding: var(--sp-sm) var(--sp-md);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--on-inverse-dim);
}

.children-counter {
  font-size: 0.7rem;
}

/* Section Label + Divider */
.menu-section-label {
  padding: var(--sp-md) var(--sp-md) var(--sp-xs);
  color: var(--on-inverse-label);
  font-size: var(--fs-sm);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.menu-section-divider {
  border-top: 1px solid var(--overlay-white-solid);
  margin: var(--sp-sm) var(--sp-xs);
}

/* Menu Separator */
.menu-separator {
  height: 1px;
  background-color: var(--overlay-white-solid);
  margin: var(--sp-xl) 0;
}

/* Logout Button */
.logout-item {
  margin-top: var(--sp-sm);
  background-color: rgba(255, 77, 77, 0.15);

  &:hover {
    background-color: rgba(255, 77, 77, 0.25);
  }

  .menu-icon,
  .menu-label {
    color: var(--base-red);
  }
}

/* Active Route Styling */
.router-link-active {
  > .btn-link {
    background-color: var(--base-green);
    border-radius: var(--radius-md);
    color: white !important;
    font-weight: 500;

    .menu-icon,
    .submenu-icon,
    .menu-label,
    .submenu-text {
      color: #ffffff;
    }

    .menu-counter {
      background-color: var(--overlay-white-strong);
    }
  }
}

/* General Button Styling */
.btn-link {
  background-color: transparent;
  border: none;
  outline: none;
  text-align: left;
  text-decoration: none;
  color: var(--on-inverse);

  &:hover,
  &:focus {
    color: var(--on-inverse) !important;
    text-decoration: none !important;
  }
}

.flex-between-center {
  @include flex-between-center;
}
</style>
