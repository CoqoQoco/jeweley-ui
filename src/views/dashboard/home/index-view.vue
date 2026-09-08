<template>
  <div class="app-container home-dashboard">
    <component v-for="widget in visibleWidgets" :is="widget.component" :key="widget.key" class="home-dashboard-widget" />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'

import { DASHBOARD_WIDGETS } from './dashboard-registry.js'

export default {
  name: 'HomeDashboardView',

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  computed: {
    permissionService() {
      return new PermissionService(this.authStore.getUser, this.authStore.permissions)
    },

    visibleWidgets() {
      return DASHBOARD_WIDGETS.filter((w) => this.permissionService.hasAnyPermission(w.permissions)).sort(
        (a, b) => a.order - b.order
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.home-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}
</style>
