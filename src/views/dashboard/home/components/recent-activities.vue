<template>
  <SectionCardGeneric :title="$t('view.dashboard.home.recentActivities.title')" icon="bi-clock-history" accent="main" headerStyle="legend">
    <div v-if="activities.length" class="activity-list">
      <div v-for="activity in activities" :key="activity.id" class="activity-row">
        <div class="activity-icon"><i class="bi bi-gear-fill"></i></div>
        <div class="activity-content">
          <div class="activity-title">{{ activity.woText }} — {{ activity.productName }}</div>
          <div class="activity-meta">
            <span class="activity-status">{{ activity.statusName }}</span>
            <span class="activity-time">{{ formatDateTime(activity.updateDate) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <i class="bi bi-inbox"></i>
      <span>{{ $t('view.dashboard.home.recentActivities.empty') }}</span>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { formatDateTime } from '@/services/utils/dayjs.js'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'RecentActivities',

  components: {
    SectionCardGeneric
  },

  props: {
    activities: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    formatDateTime
  }
}
</script>

<style lang="scss" scoped>
.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.activity-row {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-md);
  padding: var(--sp-sm) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: var(--fs-base);
  color: var(--base-font-color);
  font-weight: 600;
}

.activity-meta {
  display: flex;
  gap: var(--sp-sm);
  margin-top: 2px;
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-sm);
  padding: var(--sp-xl) 0;
  color: var(--base-sub-color);

  i {
    font-size: 28px;
  }
}
</style>
