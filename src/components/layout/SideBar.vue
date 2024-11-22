<template>
  <div>
    <!-- STEP 1 : MAIN MENU -->
    <!-- Render List Menu -->
    <div v-for="(mainMenu, index) in menuForPermission" :key="index" class="cursor">
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
            <div>
              <span :class="[mainMenu.meta.classIcon, 'mr-2']"></span>
              <span>
                {{ showMenuName(mainMenu) }}
              </span>
            </div>

            <i :class="['bi', mainMenu.isOpen ? 'bi-caret-up-fill' : 'bi-caret-down-fill']"></i>
          </div>
        </div>

        <!-- No SubMenu -->
        <div v-if="!mainMenu.subMenu.length" class="main-menu-wrapper">
          <router-link :to="{ name: mainMenu.name }" v-slot="{ href, navigate }">
            <button class="btn-link btn-main-menu" :href="href" @click="navigate">
              <span :class="[mainMenu.meta.classIcon, 'mr-2']"></span>
              <span>
                {{ showMenuName(mainMenu) }}
              </span>
            </button>
          </router-link>
        </div>

        <div v-if="mainMenu.meta.btLineShow" class="bottom-line-menu"></div>
        <!-- <div v-if="mainMenu.meta.tpLineShow" class="top-line-menu"></div> -->
      </div>

      <!-- STEP 2 : SUB MENU -->
      <!-- Check Has List Data -->
      <div v-if="mainMenu.subMenu.length">
        <!-- Hidden Menu (Toggle with Flag:isOpen ) -->
        <div v-show="mainMenu.isOpen">
          <!-- Render List Menu -->
          <div
            v-for="(subMenu, indexSubMenu) in mainMenu.subMenu"
            :key="indexSubMenu"
            :class="[mainMenu.subMenu.length - 1 === indexSubMenu ? 'bottom-menu-border' : null]"
          >
            <!-- Wrapper -->
            <div class="sub-menu">
              <!-- Has children -->
              <div
                v-if="subMenu.children"
                :class="['sub-menu-wrapper', subMenu.isOpen ? 'sub-menu-active' : null]"
                @click="onToggleSubMenu(index, indexSubMenu)"
              >
                <div class="btn-link btn-sub-menu flex-between-center">
                  <span>
                    {{ showMenuName(subMenu) }}
                  </span>

                  <i
                    :class="[
                      'bi',
                      subMenu.isOpen ? 'bi-chevron-double-up' : 'bi-chevron-double-down'
                    ]"
                  ></i>
                </div>
              </div>

              <!-- No children -->
              <div v-if="!subMenu.children" class="sub-menu-wrapper">
                <router-link :to="{ name: subMenu.name }" v-slot="{ href, navigate }">
                  <button class="btn-link btn-sub-menu" :href="href" @click="navigate">
                    <span class="">
                      <i class="bi bi-dash"></i>
                      {{ showMenuName(subMenu) }}
                    </span>
                  </button>
                </router-link>
              </div>
            </div>

            <!-- STEP 3 : CHILDREM MENU -->
            <!-- Check Has List Data -->
            <div v-if="subMenu.children && subMenu.children.length">
              <!-- Hidden Menu (Toggle with Flag:isOpen ) -->
              <div v-show="subMenu.isOpen">
                <!-- Render List Menu -->
                <div v-for="(childrenMenu, indexChildren) in subMenu.children" :key="indexChildren">
                  <!-- Wrapper -->
                  <div class="children-menu">
                    <!-- No Children (Only this condition) -->
                    <div class="children-menu-wrapper">
                      <span class="w-100">
                        <router-link :to="{ name: childrenMenu.name }" v-slot="{ href, navigate }">
                          <button class="btn-link btn-children-menu" :href="href" @click="navigate">
                            <i class="bi bi-arrow-return-right mr-2"></i>
                            <span>{{ showMenuName(childrenMenu) }}</span>
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
          <!-- <div v-if="mainMenu.meta.btsubLineShow" class="bottom-line-menu"></div> -->
        </div>
      </div>
      <!-- end : sub menu -->
    </div>

    <div class="main-menu">
      <div class="main-menu-wrapper">
        <button class="btn-link btn-main-menu" @click="handleLogout">
          <span class="mr-2 bi bi-power"></span>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <!-- <div class="main-footer"><label>version 1.0.0 (beta)</label></div> -->
    <!-- end : main menu -->
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
        .map((menu) => ({
          ...menu,
          isOpen: false
        }))
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
  color: base-color;
  transition-duration: 0.5s;
  > a {
    width: inherit;
  }
}
.bottom-line-menu {
  // //height: 20px;
  // border-bottom: solid 1px var(--base-font-color);
  // margin-left: 10px;
  // margin-right: 10px;
  // padding-top: 5px;

  // เพิ่ม border ด้านล่าง
  border-bottom: 3px solid var(--base-font-color);
  margin-left: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  margin-top: 5px;
  border-radius: 50%; /* ทำให้เส้นขอบเป็นเส้นกลม */
}
.top-line-menu {
  //height: 20px;
  border-top: solid 1px var(--base-font-color);
  margin-left: 10px;
  margin-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

// Main Menu (Level 1)
.main-menu-wrapper {
  @include menu-wrapper;
  border-bottom: 2px solid base-color;
}

.main-menu-wrapper:hover {
  //transform: translateY(0%) translateZ(0) scale(1.1);
  //background-color: #fefefe;
  //color: var(--base-font-color);
  //border-bottom: 1px solid transparent;
}

.main-menu-active {
  //background-color: #252525;
}

.sub-menu {
  //background-color: #fefefe;
}

// Sub Menu (Level 2)
.sub-menu-wrapper {
  @include menu-wrapper;
}

.sub-menu-wrapper:hover {
  //transform: translateY(0%) translateZ(0) scale(1.1);
  background-color: #fefefe;
}

.sub-menu-active {
  //background-color: #252525;
}

// Children Menu (Level 3)
.children-menu-wrapper {
  transition-duration: 0.2s;
}

.children-menu-wrapper:hover {
  background-color: #09283bb4;
}

// Customs
.flex-between-center {
  @include flex-between-center;
}

.bottom-menu-border {
  border-bottom: 1px solid base-color;
}

.btn-link {
  width: 100%;
  background-color: transparent;
  border: none;
  outline: none;
  text-align: left;
  text-decoration: none;
  color: var(--base-font-color);
}
.btn-link:hover {
  color: var(--base-font-color) !important;
  text-decoration: none !important;
}
.btn-link:focus {
  color: var(--base-font-color) !important;
  text-decoration: none !important;
}

.btn-main-menu {
  padding: 0.75rem 1rem;
}

.btn-sub-menu,
.btn-children-menu {
  padding: 0.75rem 1rem 0.75rem 1.85rem;
}

// Overwrite
button {
  padding: 0;
}

.router-link-active {
  > .btn-link {
    //background: linear-gradient(90deg, base-color 8px, base-color 0);
    //border-radius: 15px;

    // border-bottom-left-radius: 15px;
    // border-bottom-right-radius: 15px;

    //font-size: 15px;
    color: var(--base-color) !important;
    //font-weight: 400;
    transition-duration: 0.5s;
    background-color: var(--base-font-color);
    border-bottom: solid 3px var(--base-color);
    border-bottom-style: double;
    border-top: solid 3px var(--base-color);
    border-top-style: double;
  }
}

.main-footer {
  padding-top: 10px;
  text-align: center;
  //background-color: red;
  color: var(--base-font-color);
  height: 40px;
  width: 100%;
  position: absolute;
  bottom: 0;
}
</style>
