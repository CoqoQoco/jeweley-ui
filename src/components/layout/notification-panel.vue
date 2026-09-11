<template>
  <OverlayPanel ref="op" appendTo="body" class="notification-panel-overlay" @show="onShow">
    <div class="notification-panel">
      <div class="notification-panel__header">
        <span class="notification-panel__title">{{ $t('view.notification.panel.title') }}</span>
        <div class="notification-panel__header-actions">
          <ButtonGeneric
            variant="outline"
            icon="bi-check2-all"
            :label="$t('view.notification.panel.markAllRead')"
            @click="onMarkAllRead"
          />
          <ButtonGeneric
            variant="green"
            icon="bi-arrow-right-circle"
            :label="$t('view.notification.panel.viewAll')"
            @click="onViewAll"
          />
        </div>
      </div>

      <div v-if="items.length" class="notification-panel__list">
        <NotificationItem
          v-for="notificationItem in items"
          :key="notificationItem.id"
          :item="notificationItem"
          @open="onOpen"
          @snooze="onSnooze"
          @done="onDone"
        />
      </div>
      <div v-else class="notification-panel__empty">
        <i class="bi bi-bell-slash"></i>
        <span class="notification-panel__empty-title">{{ $t('view.notification.panel.emptyTitle') }}</span>
        <span class="notification-panel__empty-hint">{{ $t('view.notification.panel.emptyHint') }}</span>
      </div>
    </div>
  </OverlayPanel>
</template>

<script>
import OverlayPanel from 'primevue/overlaypanel'

import { useNotificationStore } from '@/stores/modules/api/notification-store.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import NotificationItem from '@/views/notification/components/notification-item.vue'

const PANEL_TAKE = 5

export default {
  name: 'NotificationPanel',

  components: {
    OverlayPanel,
    ButtonGeneric,
    NotificationItem
  },

  setup() {
    const notificationStore = useNotificationStore()
    return { notificationStore }
  },

  computed: {
    items() {
      return this.notificationStore.list
    }
  },

  methods: {
    toggle(event) {
      this.$refs.op.toggle(event)
    },

    onShow() {
      this.refreshList()
    },

    refreshList() {
      this.notificationStore.fetchList({ take: PANEL_TAKE, skip: 0 })
    },

    onOpen(item) {
      this.$refs.op.hide()
      if (item.actionUrl) {
        this.$router.push(item.actionUrl)
      }
      this.notificationStore.markRead([item.id])
    },

    async onSnooze(item) {
      await this.notificationStore.snooze(item.id, 3)
      this.refreshList()
    },

    async onDone(item) {
      await this.notificationStore.markDone(item.id)
      this.refreshList()
    },

    async onMarkAllRead() {
      await this.notificationStore.markReadAll()
      this.refreshList()
    },

    onViewAll() {
      this.$refs.op.hide()
      this.$router.push({ name: 'notification-list' })
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.p-overlaypanel) {
  width: 420px;
  max-width: calc(100vw - var(--sp-lg) * 2);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

:deep(.p-overlaypanel-content) {
  padding: 0;
}

.notification-panel {
  display: flex;
  flex-direction: column;
  max-height: 480px;
}

.notification-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
  padding: var(--sp-md) var(--sp-lg);
  border-bottom: 1px solid var(--color-border);
}

.notification-panel__title {
  font-weight: 700;
  font-size: var(--fs-lg);
  color: var(--base-font-color);
}

.notification-panel__header-actions {
  display: flex;
  gap: var(--sp-xs);
}

.notification-panel__list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  padding: var(--sp-lg);
  overflow-y: auto;
}

.notification-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
  padding: var(--sp-2xl) var(--sp-lg);
  text-align: center;

  i {
    font-size: calc(var(--fs-xl) * 1.6);
    color: var(--base-sub-color);
    opacity: 0.6;
  }
}

.notification-panel__empty-title {
  font-weight: 700;
  color: var(--base-font-color);
}

.notification-panel__empty-hint {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
