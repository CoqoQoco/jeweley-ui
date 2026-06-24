<template>
  <modal
    :showModal="isShow"
    @closeModal="$emit('closeModal')"
    width="800px"
    :fitHeight="true"
    :clickToClose="true"
  >
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">
        {{ $t('view.ticket.detailTitle') }}
        <span v-if="ticket.ticketNo" class="ticket-no ml-2">#{{ ticket.ticketNo }}</span>
      </span>
    </template>

    <template #content>
      <div class="p-3" v-if="ticket.id">
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">{{ $t('view.ticket.field.type') }}:</span>
            <span class="detail-value">{{ typeLabel }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ $t('view.ticket.field.topic') }}:</span>
            <span class="detail-value">{{ ticket.topicName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ $t('view.ticket.field.title') }}:</span>
            <span class="detail-value">{{ ticket.title }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ $t('view.ticket.field.status') }}:</span>
            <span :class="['status-badge', statusClass]">{{ statusLabel }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ $t('view.ticket.field.createDate') }}:</span>
            <span class="detail-value">{{ formatDate(ticket.createDate) }}</span>
          </div>
        </div>

        <div class="mt-3">
          <span class="detail-label">{{ $t('view.ticket.field.description') }}:</span>
          <div class="description-box">{{ ticket.description }}</div>
        </div>

        <div class="mt-3" v-if="hasImages">
          <span class="detail-label">{{ $t('view.ticket.field.screenshot') }}:</span>
          <div class="image-gallery mt-2">
            <img
              v-for="(url, idx) in imageUrls"
              :key="idx"
              :src="url"
              class="screenshot-img"
              :alt="`${$t('view.ticket.field.screenshot')} ${idx + 1}`"
            />
          </div>
        </div>
        <div class="mt-3" v-else-if="ticket.id">
          <span class="detail-label">{{ $t('view.ticket.field.screenshot') }}:</span>
          <span class="no-image-hint ml-2">{{ $t('view.ticket.label.noImage') }}</span>
        </div>

        <div class="mt-3 dev-response-box" v-if="ticket.devResponse">
          <span class="detail-label">{{ $t('view.ticket.field.devResponse') }}:</span>
          <div class="response-content">{{ ticket.devResponse }}</div>
        </div>

        <div class="mt-3" v-if="ticket.logs && ticket.logs.length">
          <span class="detail-label">{{ $t('view.ticket.log.title') }}</span>
          <div class="log-timeline mt-2">
            <div v-for="log in ticket.logs" :key="log.id" class="log-entry">
              <span class="log-dot"></span>
              <div class="log-body">
                <div class="log-meta">
                  <span class="log-date">{{ formatDate(log.createDate) }}</span>
                  <span class="log-author">{{ log.createBy }}</span>
                  <span :class="['log-action-badge', `log-action-${log.action}`]">
                    {{ getActionLabel(log.action) }}
                  </span>
                </div>
                <div class="log-text">{{ logText(log) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import dayjs from 'dayjs'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'TicketDetailModal',

  components: { modal },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    ticket: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['closeModal'],

  computed: {
    imageUrls() {
      if (this.ticket.imageUrls?.length) return this.ticket.imageUrls
      if (this.ticket.screenshotUrl) return [this.ticket.screenshotUrl]
      return []
    },

    hasImages() {
      return this.imageUrls.length > 0
    },

    typeLabel() {
      if (this.ticket.type === 1) return this.$t('view.ticket.type.bug')
      if (this.ticket.type === 2) return this.$t('view.ticket.type.feature')
      return '-'
    },

    statusLabel() {
      const map = {
        1: this.$t('view.ticket.status.open'),
        2: this.$t('view.ticket.status.inProgress'),
        3: this.$t('view.ticket.status.resolved'),
        4: this.$t('view.ticket.status.closed')
      }
      return map[this.ticket.statusId] || this.ticket.statusNameTh || '-'
    },

    statusClass() {
      const map = {
        1: 'status-open',
        2: 'status-in-progress',
        3: 'status-resolved',
        4: 'status-closed'
      }
      return map[this.ticket.statusId] || ''
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    getStatusLabelById(statusId) {
      const map = {
        1: this.$t('view.ticket.status.open'),
        2: this.$t('view.ticket.status.inProgress'),
        3: this.$t('view.ticket.status.resolved'),
        4: this.$t('view.ticket.status.closed')
      }
      return map[statusId] || String(statusId)
    },

    getActionLabel(action) {
      if (action === 'status') return this.$t('view.ticket.log.actionStatus')
      if (action === 'dev') return this.$t('view.ticket.log.actionDev')
      return this.$t('view.ticket.log.actionNote')
    },

    logText(log) {
      if (log.action === 'status') {
        return `${this.$t('view.ticket.log.actionStatus')}: ${this.getStatusLabelById(Number(log.oldValue))} → ${this.getStatusLabelById(Number(log.newValue))}`
      }
      return log.detail
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.ticket-no {
  font-size: var(--fs-base);
  font-weight: 400;
  color: #666;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-sm) var(--sp-lg);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-weight: 600;
  color: var(--base-font-color);
  font-size: var(--fs-sm);
}

.detail-value {
  color: #333;
  font-size: var(--fs-base);
}

.description-box {
  background: #f9f9f9;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  white-space: pre-wrap;
  line-height: var(--lh-md);
  font-size: var(--fs-base);
  margin-top: var(--sp-xs);
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-md);
}

.screenshot-img {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  object-fit: contain;
}

.no-image-hint {
  font-size: var(--fs-base);
  color: #888;
}

.dev-response-box {
  background: #f0f9f0;
  border: 1px solid #b8ddb8;
  border-radius: var(--radius-md);
  padding: var(--sp-md);

  .detail-label {
    color: #2d7d2d;
  }

  .response-content {
    margin-top: var(--sp-xs);
    white-space: pre-wrap;
    line-height: var(--lh-md);
    color: #1a4a1a;
  }
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &.status-open {
    background: #fff3cd;
    color: #856404;
  }

  &.status-in-progress {
    background: #cce5ff;
    color: #004085;
  }

  &.status-resolved {
    background: #d4edda;
    color: #155724;
  }

  &.status-closed {
    background: #e2e3e5;
    color: #383d41;
  }
}

.mt-2 {
  margin-top: var(--sp-sm);
}

.mt-3 {
  margin-top: var(--sp-lg);
}

.ml-2 {
  margin-left: var(--sp-sm);
}

.log-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.log-entry {
  display: flex;
  gap: var(--sp-md);
  align-items: flex-start;
}

.log-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--base-font-color);
  margin-top: 5px;
}

.log-body {
  flex: 1;
  min-width: 0;
}

.log-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  align-items: center;
  margin-bottom: var(--sp-xs);
}

.log-date {
  font-size: var(--fs-sm);
  color: #666;
}

.log-author {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-font-color);
}

.log-action-badge {
  display: inline-block;
  padding: 1px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &.log-action-status {
    background: #cce5ff;
    color: #004085;
  }

  &.log-action-dev {
    background: #d4edda;
    color: #155724;
  }

  &.log-action-note {
    background: #f0f0f0;
    color: #555;
  }
}

.log-text {
  font-size: var(--fs-base);
  color: var(--base-font-color);
  line-height: var(--lh-md);
}
</style>
