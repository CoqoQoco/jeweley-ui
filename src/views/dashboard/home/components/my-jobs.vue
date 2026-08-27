<template>
  <SectionCardGeneric :title="$t('view.dashboard.home.myJobs.title')" icon="bi-list-check" accent="green" headerStyle="legend">
    <div v-if="jobs.length" class="job-list">
      <div v-for="job in jobs" :key="job.id" class="job-row">
        <div class="job-main">
          <span class="job-code">{{ job.jobRunning }}</span>
          <span class="job-desc">{{ jobTypeLabel(job) }}</span>
        </div>
        <div class="job-meta">
          <span class="job-status" :style="{ background: statusColor(job.statusId) }">{{ job.statusName }}</span>
          <span class="job-date">{{ formatDateTime(job.createDate) }}</span>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <i class="bi bi-inbox"></i>
      <span>{{ $t('view.dashboard.home.myJobs.empty') }}</span>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { getJobTypeName, getJobTypeNameEn } from '@/constants/job-type.js'
import { formatDateTime } from '@/services/utils/dayjs.js'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

export default {
  name: 'MyJobs',

  components: {
    SectionCardGeneric
  },

  props: {
    jobs: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    formatDateTime,

    jobTypeLabel(job) {
      return this.$i18n.locale === 'en' ? getJobTypeNameEn(job.jobTypeId) : getJobTypeName(job.jobTypeId)
    },

    statusColor(statusId) {
      switch (statusId) {
        case 500:
          return 'var(--base-red)'
        case 100:
          return 'var(--base-green)'
        case 50:
        case 40:
          return 'var(--base-warning)'
        default:
          return 'var(--base-sub-color)'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.job-list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.job-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  padding: var(--sp-sm) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.job-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.job-code {
  font-weight: 600;
  color: var(--base-font-color);
  font-size: var(--fs-base);
}

.job-desc {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}

.job-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.job-status {
  padding: 2px var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  color: #fff;
}

.job-date {
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
