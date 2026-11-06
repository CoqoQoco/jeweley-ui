<template>
  <span :class="['deploy-badge', meta.badgeClass]">{{ label }}</span>
</template>

<script>
import { getDeployMeta } from '../constants/ticket-deploy.js'

export default {
  name: 'TicketDeployBadge',

  props: {
    deployStatus: {
      type: String,
      default: 'none'
    }
  },

  computed: {
    meta() {
      return getDeployMeta(this.deployStatus)
    },

    label() {
      return this.$t(this.meta.i18nKey)
    }
  }
}
</script>

<style lang="scss" scoped>
.deploy-badge {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &.deploy-none {
    background: var(--status-closed-bg);
    color: var(--status-closed);
  }

  &.deploy-pending {
    background: var(--status-open-bg);
    color: var(--status-open);
  }

  &.deploy-deployed {
    background: var(--color-green-bg);
    color: var(--base-green);
  }
}
</style>
