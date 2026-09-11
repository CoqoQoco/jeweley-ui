<template>
  <span :class="['status-badge', badgeClass]">{{ label }}</span>
</template>

<script>
import { SEVERITY_META } from '../constants/notification-severity.js'

export default {
  name: 'NotificationSeverityBadge',

  props: {
    severity: {
      type: String,
      default: null
    }
  },

  computed: {
    meta() {
      return SEVERITY_META[this.severity] || null
    },

    label() {
      return this.meta ? this.$t(this.meta.i18nKey) : this.severity || '-'
    },

    badgeClass() {
      return this.meta ? this.meta.badgeClass : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.status-badge {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
  white-space: nowrap;

  &.severity-crit {
    background: var(--status-cancelled-bg);
    color: var(--status-cancelled);
  }

  &.severity-warn {
    background: var(--status-open-bg);
    color: var(--status-open);
  }

  &.severity-info {
    background: var(--status-closed-bg);
    color: var(--status-closed);
  }
}
</style>
