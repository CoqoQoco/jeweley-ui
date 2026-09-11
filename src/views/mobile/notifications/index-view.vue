<template>
  <div class="mobile-notifications-view">
    <div class="mobile-container mobile-mt-2">
      <h2 class="mobile-title">{{ $t('view.mobile.notifications.pageTitle') }}</h2>

      <module-filter-tabs
        :model-value="selectedModule"
        :modules="modules"
        :total-count="totalCount"
        class="mobile-mt-2"
        @update:modelValue="onSelectModule"
      />

      <div v-if="items.length > 0" class="notification-list mobile-mt-2">
        <notification-card
          v-for="item in items"
          :key="item.id"
          :item="item"
          :can-open="isOpenSupported(item)"
          @open="onOpen(item)"
          @snooze="onSnooze(item)"
          @done="onDone(item)"
        />

        <button
          v-if="hasMore"
          class="mobile-btn mobile-btn-outline mobile-mt-2"
          @click="loadMore"
        >
          <i class="bi bi-arrow-down-circle"></i>
          {{ $t('view.mobile.notifications.loadMoreBtn') }}
        </button>
      </div>

      <div v-else class="mobile-empty-state mobile-mt-3">
        <i class="bi bi-bell"></i>
        <div class="empty-title">{{ $t('view.mobile.notifications.emptyTitle') }}</div>
        <div class="empty-subtitle">{{ $t('view.mobile.notifications.emptySubtitle') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { useNotificationStore } from '@/stores/modules/api/notification-store.js'

import ModuleFilterTabs from './components/module-filter-tabs.vue'
import NotificationCard from './components/notification-card.vue'

// refDocType → route มือถือ ที่รองรับแล้ว (เพิ่ม key ใหม่เมื่อมีหน้ามือถือของเอกสารชนิดนั้น)
const MOBILE_OPEN_ROUTE_BUILDERS = {
  INVOICE: (item) => ({ name: 'mobile-invoice-detail', params: { invoiceNumber: item.refDocNo } })
}

export default {
  name: 'MobileNotificationsView',

  components: {
    ModuleFilterTabs,
    NotificationCard
  },

  setup() {
    const notificationStore = useNotificationStore()
    return { notificationStore }
  },

  data() {
    return {
      take: 20,
      total: 0,
      items: [],
      selectedModule: null
    }
  },

  computed: {
    totalCount() {
      return this.notificationStore.count
    },

    modules() {
      return this.notificationStore.countByModule
    },

    hasMore() {
      return this.items.length < this.total
    }
  },

  mounted() {
    this.notificationStore.fetchCount()
    this.loadList()
  },

  methods: {
    async loadList() {
      const res = await this.notificationStore.fetchList({
        take: this.take,
        skip: 0,
        module: this.selectedModule || undefined
      })
      this.items = res?.list || []
      this.total = res?.total || 0
    },

    async loadMore() {
      const res = await this.notificationStore.fetchList({
        take: this.take,
        skip: this.items.length,
        module: this.selectedModule || undefined
      })
      this.items.push(...(res?.list || []))
      this.total = res?.total ?? this.total
    },

    onSelectModule(moduleValue) {
      if (this.selectedModule === moduleValue) return
      this.selectedModule = moduleValue
      this.loadList()
    },

    isOpenSupported(item) {
      return !!MOBILE_OPEN_ROUTE_BUILDERS[item.refDocType] && !!item.refDocNo
    },

    onOpen(item) {
      const buildRoute = MOBILE_OPEN_ROUTE_BUILDERS[item.refDocType]
      if (!buildRoute || !item.refDocNo) return

      this.$router.push(buildRoute(item))
      this.notificationStore.markRead([item.id])
    },

    async onSnooze(item) {
      await this.notificationStore.snooze(item.id, 3)
      this.loadList()
    },

    async onDone(item) {
      await this.notificationStore.markDone(item.id)
      this.loadList()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-notifications-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}
</style>
