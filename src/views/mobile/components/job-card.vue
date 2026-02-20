<template>
  <div
    class="job-card"
    :class="{
      'job-card--clickable': clickable,
      'job-card--selected': selected,
      'job-card--compact': compact
    }"
    @click="$emit('click', job)"
  >
    <!-- Icon -->
    <div class="job-card__icon" :style="iconStyle">
      <i :class="iconClass" :style="{ color: iconColor }"></i>
    </div>

    <!-- Content -->
    <div class="job-card__content">
      <div class="job-card__title">{{ jobTypeName }}</div>
      <div class="job-card__running">{{ job.jobRunning }}</div>

      <!-- Appraisal Info: stockNumber / stockNumberOrigin -->
      <div v-if="isAppraisalJob && hasStockInfo" class="job-card__appraisal-info">
        <i class="bi bi-tag"></i>
        <span> {{ stockNumber }}{{ stockNumberOrigin ? ' / ' + stockNumberOrigin : '' }}</span>
      </div>

      <!-- Meta: status + date -->
      <div v-if="!compact" class="job-card__meta">
        <span class="job-card__status" :style="{ background: statusColor }">
          {{ job.statusName }}
        </span>
        <span class="job-card__date">{{ formattedDate }}</span>
      </div>
      <div v-else class="job-card__date-only">{{ formattedDate }}</div>
    </div>

    <!-- Action -->
    <div class="job-card__action">
      <span v-if="selected" class="job-card__check">
        <i class="bi bi-check-circle-fill"></i>
      </span>
      <i v-else class="bi bi-chevron-right"></i>
    </div>
  </div>
</template>

<script>
import { JOB_TYPE, getJobTypeName } from '@/constants/job-type.js'
import dayjs from 'dayjs'

export default {
  name: 'JobCard',

  props: {
    job: {
      type: Object,
      required: true
    },
    clickable: {
      type: Boolean,
      default: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    compact: {
      type: Boolean,
      default: false
    }
  },

  emits: ['click'],

  computed: {
    parsedDataJob() {
      if (!this.job.dataJob) return null
      try {
        return typeof this.job.dataJob === 'string'
          ? JSON.parse(this.job.dataJob)
          : this.job.dataJob
      } catch {
        return null
      }
    },

    isAppraisalJob() {
      return this.job.jobTypeId === JOB_TYPE.PLAN_STOCK_COST
    },

    stockNumber() {
      return this.parsedDataJob?.stockNumber || ''
    },

    stockNumberOrigin() {
      return this.parsedDataJob?.stockNumberOrigin || ''
    },

    hasStockInfo() {
      return !!(this.stockNumber || this.stockNumberOrigin)
    },

    jobTypeName() {
      return getJobTypeName(this.job.jobTypeId)
    },

    statusColor() {
      switch (this.job.statusId) {
        case 500: return '#f44336'
        case 100: return '#4caf50'
        case 50:
        case 40: return '#ff9800'
        case 30:
        case 20: return '#2196f3'
        case 10:
        default: return '#9e9e9e'
      }
    },

    iconClass() {
      return this.isAppraisalJob ? 'bi bi-calculator' : 'bi bi-briefcase'
    },

    iconColor() {
      return this.compact ? '#fff' : this.statusColor
    },

    iconStyle() {
      if (this.compact) {
        return {
          background: `linear-gradient(135deg, var(--base-font-color) 0%, var(--base-font-sub-color) 100%)`
        }
      }
      return { background: this.statusColor + '20' }
    },

    formattedDate() {
      if (!this.job.createDate) return '-'
      return dayjs(this.job.createDate).format('DD/MM/YYYY HH:mm')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.job-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
  border: 1.5px solid #e8e8e8;
  transition: all 0.2s ease;

  &--clickable {
    cursor: pointer;

    &:active {
      transform: scale(0.99);
    }
  }

  &--selected {
    border-color: var(--base-font-color);
    background: rgba(146, 19, 19, 0.03);
  }

  &__icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
    line-height: 1.2;
  }

  &__running {
    font-size: 0.8rem;
    color: #666;
    margin-top: 1px;
  }

  &__appraisal-info {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 0.75rem;
    color: var(--base-font-color);
    font-weight: 500;

    i {
      font-size: 0.7rem;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  &__status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    color: white;
    font-weight: 500;
  }

  &__date,
  &__date-only {
    font-size: 0.7rem;
    color: #999;
  }

  &__date-only {
    margin-top: 2px;
  }

  &__action {
    .job-card__check {
      color: var(--base-font-color);
      font-size: 1.2rem;
    }

    i {
      color: #ccc;
      font-size: 1rem;
    }
  }
}
</style>
