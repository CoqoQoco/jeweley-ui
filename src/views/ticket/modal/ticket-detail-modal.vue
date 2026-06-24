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
        <span v-if="localTicket.ticketNo" class="ticket-no ml-2">#{{ localTicket.ticketNo }}</span>
      </span>
    </template>

    <template #content>
      <div class="p-3" v-if="localTicket.id">
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">{{ $t('view.ticket.field.type') }}:</span>
            <span class="detail-value">{{ typeLabel }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ $t('view.ticket.field.topic') }}:</span>
            <span class="detail-value">{{ localTicket.topicName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ $t('view.ticket.field.title') }}:</span>
            <span class="detail-value">{{ localTicket.title }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ $t('view.ticket.field.status') }}:</span>
            <span :class="['status-badge', statusClass]">{{ statusLabel }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ $t('view.ticket.field.createDate') }}:</span>
            <span class="detail-value">{{ formatDate(localTicket.createDate) }}</span>
          </div>
        </div>

        <div class="mt-3">
          <span class="detail-label">{{ $t('view.ticket.field.description') }}:</span>
          <div class="description-box">{{ localTicket.description }}</div>
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
        <div class="mt-3" v-else-if="localTicket.id">
          <span class="detail-label">{{ $t('view.ticket.field.screenshot') }}:</span>
          <span class="no-image-hint ml-2">{{ $t('view.ticket.label.noImage') }}</span>
        </div>

        <!-- Response Thread (user can reply) -->
        <div class="mt-3">
          <TicketThread
            :title="$t('view.ticket.thread.replyTitle')"
            variant="chat"
            :entries="responseComments"
            :canPost="true"
            deleteMode="own"
            meRole="user"
            :placeholder="$t('view.ticket.thread.placeholder')"
            :emptyText="$t('view.ticket.thread.empty')"
            @post="onPostReply"
            @delete="onDeleteMyComment"
          />
        </div>

        <!-- Progress / Change Thread (read-only) -->
        <div class="mt-3">
          <TicketThread
            :title="$t('view.ticket.thread.progressTitle')"
            variant="timeline"
            :entries="changeComments"
            :canPost="false"
            deleteMode="none"
            :emptyText="$t('view.ticket.thread.empty')"
          />
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useTicketStore } from '@/stores/modules/api/ticket-store.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import dayjs from 'dayjs'

import TicketThread from '../components/ticket-thread.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'TicketDetailModal',

  components: { modal, TicketThread },

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

  emits: ['closeModal', 'refresh'],

  setup() {
    const ticketStore = useTicketStore()
    return { ticketStore }
  },

  data() {
    return {
      localTicket: {}
    }
  },

  watch: {
    ticket: {
      immediate: true,
      handler(val) {
        this.localTicket = val ? { ...val, comments: [...(val.comments || [])] } : {}
      }
    }
  },

  computed: {
    imageUrls() {
      if (this.localTicket.imageUrls?.length) return this.localTicket.imageUrls
      if (this.localTicket.screenshotUrl) return [this.localTicket.screenshotUrl]
      return []
    },

    hasImages() {
      return this.imageUrls.length > 0
    },

    typeLabel() {
      if (this.localTicket.type === 1) return this.$t('view.ticket.type.bug')
      if (this.localTicket.type === 2) return this.$t('view.ticket.type.feature')
      return '-'
    },

    statusLabel() {
      const map = {
        1: this.$t('view.ticket.status.open'),
        2: this.$t('view.ticket.status.inProgress'),
        3: this.$t('view.ticket.status.resolved'),
        4: this.$t('view.ticket.status.closed')
      }
      return map[this.localTicket.statusId] || this.localTicket.statusNameTh || '-'
    },

    statusClass() {
      const map = {
        1: 'status-open',
        2: 'status-in-progress',
        3: 'status-resolved',
        4: 'status-closed'
      }
      return map[this.localTicket.statusId] || ''
    },

    responseComments() {
      return (this.localTicket.comments || []).filter((c) => c.type === 'response')
    },

    changeComments() {
      return (this.localTicket.comments || []).filter((c) => c.type === 'change')
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    async onPostReply(msg) {
      const res = await this.ticketStore.addMyTicketComment(this.localTicket.id, msg)
      if (res !== undefined) {
        success(this.$t('view.ticket.thread.success.add'))
        // Optimistically push new comment into localTicket so thread updates instantly
        const newComment = {
          id: Date.now(),
          type: 'response',
          authorRole: 'user',
          message: msg,
          createBy: '',
          createDate: new Date().toISOString()
        }
        this.localTicket.comments = [...(this.localTicket.comments || []), newComment]
        // Signal parent to reload its list so next open has fresh data
        this.$emit('refresh')
      }
    },

    onDeleteMyComment(entry) {
      confirmThenSubmit(
        this.$t('view.ticket.thread.confirmDelete'),
        this.$t('common.btn.delete'),
        async () => {
          await this.ticketStore.deleteMyTicketComment(entry.id)
          success(this.$t('view.ticket.thread.success.delete'))
          this.localTicket.comments = (this.localTicket.comments || []).filter(
            (c) => c.id !== entry.id
          )
          this.$emit('refresh')
        }
      )
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
</style>
