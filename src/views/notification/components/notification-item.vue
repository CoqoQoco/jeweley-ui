<template>
  <div class="notification-item">
    <div class="notification-item__top">
      <NotificationSeverityBadge :severity="item.severity" />
      <i v-if="item.icon" :class="['bi', item.icon, 'notification-item__type-icon']"></i>
      <span class="notification-item__title">{{ item.title }}</span>
    </div>

    <p v-if="item.body" class="notification-item__body">{{ item.body }}</p>

    <span v-if="item.overdueDays > 0" class="notification-item__overdue">
      <i class="bi bi-alarm"></i>
      {{ $t('view.notification.item.overdueDays', { days: item.overdueDays }) }}
    </span>

    <NotificationActions
      @open="$emit('open', item)"
      @snooze="$emit('snooze', item)"
      @done="$emit('done', item)"
    />
  </div>
</template>

<script>
import NotificationSeverityBadge from './notification-severity-badge.vue'
import NotificationActions from './notification-actions.vue'

export default {
  name: 'NotificationItem',

  components: {
    NotificationSeverityBadge,
    NotificationActions
  },

  props: {
    item: {
      type: Object,
      required: true
    }
  },

  emits: ['open', 'snooze', 'done']
}
</script>

<style lang="scss" scoped>
.notification-item {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
  padding: var(--sp-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);

  &__top {
    display: flex;
    align-items: center;
    gap: var(--sp-sm);
  }

  &__type-icon {
    color: var(--base-font-color);
    font-size: var(--fs-base);
  }

  &__title {
    font-weight: 700;
    color: var(--base-font-color);
    line-height: var(--lh-sm);
  }

  &__body {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--base-sub-color);
    line-height: var(--lh-md);
    white-space: pre-line;
  }

  &__overdue {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-xs);
    width: fit-content;
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--base-red);
  }
}
</style>
