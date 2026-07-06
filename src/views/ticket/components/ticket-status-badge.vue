<template>
  <span :class="['status-badge', badgeClass]">{{ label }}</span>
</template>

<script>
import { STATUS_META } from '../constants/ticket-status.js'

export default {
  name: 'TicketStatusBadge',

  props: {
    statusId: {
      type: [Number, String],
      default: null
    },
    fallback: {
      type: String,
      default: '-'
    }
  },

  computed: {
    meta() {
      return STATUS_META[this.statusId] || null
    },

    label() {
      return this.meta ? this.$t(this.meta.i18nKey) : (this.fallback || '-')
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

  &.status-open {
    background: var(--status-open-bg);
    color: var(--status-open);
  }

  &.status-in-progress {
    background: var(--status-progress-bg);
    color: var(--status-progress);
  }

  &.status-resolved {
    background: var(--status-resolved-bg);
    color: var(--status-resolved);
  }

  &.status-closed {
    background: var(--status-closed-bg);
    color: var(--status-closed);
  }

  &.status-cancelled {
    background: var(--status-cancelled-bg);
    color: var(--status-cancelled);
  }
}
</style>
