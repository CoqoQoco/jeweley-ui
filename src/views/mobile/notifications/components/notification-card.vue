<template>
  <div class="notification-card">
    <div class="notification-card-header">
      <span class="mobile-badge" :class="severityBadgeClass">{{ severityLabel }}</span>
      <span v-if="item.overdueDays > 0" class="notification-overdue">
        <i class="bi bi-alarm"></i>
        {{ $t('view.mobile.notifications.overdueDays', { days: item.overdueDays }) }}
      </span>
    </div>

    <div class="notification-card-body">
      <div class="notification-title">{{ item.title }}</div>
      <div v-if="item.amount !== null && item.amount !== undefined" class="notification-amount">
        {{ formatCurrency(item.amount) }} {{ item.currencyUnit }}
      </div>
    </div>

    <div class="notification-card-actions">
      <ButtonGeneric
        variant="green"
        icon="bi-box-arrow-up-right"
        :label="$t('view.mobile.notifications.openBtn')"
        :disabled="!canOpen"
        :title="canOpen ? '' : $t('view.mobile.notifications.openUnsupportedHint')"
        @click="$emit('open')"
      />
      <ButtonGeneric
        variant="dark"
        icon="bi-clock-history"
        :label="$t('view.mobile.notifications.snoozeBtn')"
        @click="$emit('snooze')"
      />
      <ButtonGeneric
        variant="main"
        icon="bi-check2-circle"
        :label="$t('view.mobile.notifications.doneBtn')"
        @click="$emit('done')"
      />
    </div>
  </div>
</template>

<script>
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

const SEVERITY_BADGE_CLASS = {
  CRIT: 'mobile-badge-danger',
  WARN: 'mobile-badge-warning',
  INFO: 'mobile-badge-secondary'
}

export default {
  name: 'NotificationCard',

  components: {
    ButtonGeneric
  },

  props: {
    item: {
      type: Object,
      required: true
    },
    // true เมื่อ refDocType ของ item นี้มีหน้ามือถือรองรับแล้ว — ปุ่มเปิดเอกสารถูก disable เมื่อ false
    canOpen: {
      type: Boolean,
      default: false
    }
  },

  emits: ['open', 'snooze', 'done'],

  computed: {
    severityBadgeClass() {
      return SEVERITY_BADGE_CLASS[this.item.severity] || 'mobile-badge-secondary'
    },

    severityLabel() {
      const map = {
        CRIT: this.$t('view.mobile.notifications.severityCrit'),
        WARN: this.$t('view.mobile.notifications.severityWarn'),
        INFO: this.$t('view.mobile.notifications.severityInfo')
      }
      return map[this.item.severity] || this.item.severity || '-'
    }
  },

  methods: {
    formatCurrency(value) {
      if (value === null || value === undefined) return '0.00'
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(value))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.notification-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--sp-md);
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.notification-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-sm);
}

.notification-overdue {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--base-red);
}

.notification-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.notification-title {
  font-weight: 600;
  color: var(--base-font-color);
  line-height: var(--lh-sm);
}

.notification-amount {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--base-font-color);
}

.notification-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-xs);

  > * {
    flex: 1 1 auto;
    min-width: 96px;
  }
}
</style>
