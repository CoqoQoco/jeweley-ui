<template>
  <div class="ticket-thread">
    <div v-if="title" class="thread-title">{{ title }}</div>

    <div v-if="!entries || entries.length === 0" class="thread-empty">
      {{ emptyText || $t('view.ticket.thread.empty') }}
    </div>

    <template v-else>
      <!-- Timeline variant -->
      <div v-if="variant === 'timeline'" class="thread-timeline">
        <div v-for="entry in entries" :key="entry.id" class="timeline-entry">
          <span class="timeline-dot"></span>
          <div class="timeline-body">
            <div class="timeline-meta">
              <span class="meta-author">{{ entry.createBy }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-date">{{ formatDate(entry.createDate) }}</span>
              <span v-if="entry.authorRole === 'system'" class="system-badge">
                {{ $t('view.ticket.thread.systemBadge') }}
              </span>
              <ButtonGeneric
                v-if="canDelete(entry)"
                variant="red"
                icon="bi-trash"
                class="delete-btn ml-auto"
                :title="$t('view.ticket.thread.deleteBtn')"
                @click="$emit('delete', entry)"
              />
            </div>
            <div class="timeline-message">{{ entry.message }}</div>
          </div>
        </div>
      </div>

      <!-- Chat variant -->
      <div v-else-if="variant === 'chat'" class="thread-chat">
        <div
          v-for="entry in entries"
          :key="entry.id"
          :class="['chat-row', entry.authorRole === meRole ? 'chat-row--right' : 'chat-row--left']"
        >
          <div class="chat-bubble-wrap">
            <div class="chat-meta">
              <span class="meta-author">{{ entry.createBy }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-role">{{ getRoleLabel(entry.authorRole) }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-date">{{ formatDate(entry.createDate) }}</span>
              <ButtonGeneric
                v-if="canDelete(entry)"
                variant="red"
                icon="bi-trash"
                class="delete-btn ml-2"
                :title="$t('view.ticket.thread.deleteBtn')"
                @click="$emit('delete', entry)"
              />
            </div>
            <div :class="['chat-bubble', entry.authorRole === meRole ? 'chat-bubble--me' : 'chat-bubble--other']">
              {{ entry.message }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Composer -->
    <div v-if="canPost" class="thread-composer">
      <TextareaGeneric
        v-model="draft"
        :rows="2"
        :placeholder="placeholder || $t('view.ticket.thread.placeholder')"
        :disabled="posting"
      />
      <div class="composer-actions">
        <ButtonGeneric
          variant="main"
          icon="bi-send"
          :label="$t('view.ticket.thread.sendBtn')"
          :disabled="!draft || !draft.trim() || posting"
          @click="onPost"
        />
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'TicketThread',

  components: {
    TextareaGeneric,
    ButtonGeneric
  },

  props: {
    title: {
      type: String,
      default: ''
    },
    entries: {
      type: Array,
      default: () => []
    },
    variant: {
      type: String,
      default: 'timeline'
    },
    canPost: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    emptyText: {
      type: String,
      default: ''
    },
    meRole: {
      type: String,
      default: 'dev'
    },
    posting: {
      type: Boolean,
      default: false
    },
    deleteMode: {
      type: String,
      default: 'none'
    }
  },

  emits: ['post', 'delete'],

  data() {
    return {
      draft: ''
    }
  },

  methods: {
    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    getRoleLabel(role) {
      if (role === 'dev') return this.$t('view.ticket.thread.roleDev')
      if (role === 'user') return this.$t('view.ticket.thread.roleUser')
      return this.$t('view.ticket.thread.systemBadge')
    },

    canDelete(entry) {
      if (this.deleteMode === 'all') return entry.authorRole !== 'system'
      if (this.deleteMode === 'own') return entry.authorRole === 'user'
      return false
    },

    onPost() {
      if (!this.draft || !this.draft.trim()) return
      this.$emit('post', this.draft)
      this.draft = ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.ticket-thread {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.thread-title {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
  padding-bottom: var(--sp-sm);
  border-bottom: 1px solid var(--color-border);
}

.thread-empty {
  font-size: var(--fs-base);
  color: #888;
  padding: var(--sp-sm) 0;
}

// Timeline
.thread-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.timeline-entry {
  display: flex;
  gap: var(--sp-md);
  align-items: flex-start;
}

.timeline-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--base-font-color);
  margin-top: 5px;
}

.timeline-body {
  flex: 1;
  min-width: 0;
}

.timeline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-xs);
  align-items: center;
  margin-bottom: var(--sp-xs);

  .ml-auto {
    margin-left: auto;
  }
}

.timeline-message {
  font-size: var(--fs-base);
  color: #333;
  line-height: var(--lh-md);
  white-space: pre-wrap;
}

// Chat
.thread-chat {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}

.chat-row {
  display: flex;

  &--right {
    justify-content: flex-end;
  }

  &--left {
    justify-content: flex-start;
  }
}

.chat-bubble-wrap {
  max-width: 72%;
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.chat-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-xs);
  align-items: center;
  font-size: var(--fs-sm);
  color: #666;
}

.chat-row--right .chat-meta {
  justify-content: flex-end;
}

.chat-bubble {
  padding: var(--sp-sm) var(--sp-md);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  line-height: var(--lh-md);
  white-space: pre-wrap;

  &--me {
    background: var(--color-highlight-bg);
    border: 1px solid var(--base-font-color);
    color: var(--base-font-color);
    border-radius: var(--radius-md) var(--radius-sm) var(--radius-md) var(--radius-md);
  }

  &--other {
    background: #f4f4f4;
    border: 1px solid var(--color-border);
    color: #333;
    border-radius: var(--radius-sm) var(--radius-md) var(--radius-md) var(--radius-md);
  }
}

// Meta shared
.meta-author {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--base-font-color);
}

.meta-sep {
  font-size: var(--fs-sm);
  color: #bbb;
}

.meta-date {
  font-size: var(--fs-sm);
  color: #666;
}

.meta-role {
  font-size: var(--fs-sm);
  color: #888;
}

.system-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: #e8f4fd;
  color: #0066a1;
  font-size: var(--fs-sm);
  font-weight: 600;
}

// Delete button subtle override
.delete-btn {
  opacity: 0.6;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
}

// Composer
.thread-composer {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
  padding-top: var(--sp-md);
  border-top: 1px solid var(--color-border);
}

.composer-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
