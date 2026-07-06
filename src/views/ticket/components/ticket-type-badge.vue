<template>
  <span :class="['type-badge', type === 1 ? 'type-bug' : 'type-feature']">
    {{ type === 1 ? $t('view.ticket.type.bug') : $t('view.ticket.type.feature') }}
  </span>
</template>

<script>
export default {
  name: 'TicketTypeBadge',

  props: {
    type: {
      type: [Number, String],
      default: null
    }
  }
}
</script>

<style lang="scss" scoped>
.type-badge {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &.type-bug {
    background: var(--color-highlight-bg);
    color: var(--base-font-color);
  }

  &.type-feature {
    background: var(--color-green-bg);
    color: var(--base-green);
  }
}
</style>
