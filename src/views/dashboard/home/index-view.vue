<template>
  <div class="app-container home-dashboard">
    <component
      v-for="widget in visibleWidgets"
      :is="widget.component"
      :key="widget.key"
      class="home-dashboard-widget"
      v-bind="widgetProps[widget.key] || {}"
      v-on="widgetListeners[widget.key] || {}"
    />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { useHomeDashboardStore } from '@/stores/modules/api/dashboard/home-dashboard-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { PERMISSIONS } from '@/services/permission/config.js'

import { DASHBOARD_WIDGETS } from './dashboard-registry.js'

export default {
  name: 'HomeDashboardView',

  setup() {
    const authStore = useAuthStore()
    const homeDashboardStore = useHomeDashboardStore()
    return { authStore, homeDashboardStore }
  },

  computed: {
    permissionService() {
      return new PermissionService(this.authStore.getUser, this.authStore.permissions)
    },

    visibleWidgets() {
      return DASHBOARD_WIDGETS.filter((w) => this.permissionService.hasAnyPermission(w.permissions)).sort(
        (a, b) => a.order - b.order
      )
    },

    canManageAnnouncement() {
      return this.permissionService.hasPermission(PERMISSIONS.ANNOUNCEMENT_MANAGE)
    },

    widgetProps() {
      return {
        'announcement-feed': {
          items: this.homeDashboardStore.announcementFeed.data,
          total: this.homeDashboardStore.announcementFeed.total,
          canManage: this.canManageAnnouncement
        }
      }
    },

    widgetListeners() {
      return {
        'announcement-feed': {
          'load-more': this.loadMoreAnnouncements
        }
      }
    }
  },

  mounted() {
    this.loadDashboard()
  },

  methods: {
    loadDashboard() {
      this.homeDashboardStore.loadDashboard({})
    },

    loadMoreAnnouncements() {
      this.homeDashboardStore.fetchAnnouncementFeed(this.homeDashboardStore.announcementFeed.data.length)
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
