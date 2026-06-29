<template>
  <div class="app-container">
    <PageHeaderGeneric
      :title="$t('view.ticket.detailTitle')"
      backRoute="ticket-manage"
    />

    <div v-if="ticket.id" class="mt-2">
      <!-- 2-column work grid -->
      <div class="work-grid">
        <!-- LEFT: combined detail + response panel -->
        <SectionCardGeneric class="detail-panel">
          <!-- Ticket Info section -->
          <div class="panel-section-header">{{ $t('view.ticket.detailTitle') }}</div>
          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">{{ $t('view.ticket.field.ticketNo') }}:</span>
              <span class="detail-value">{{ ticket.ticketNo }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('view.ticket.field.type') }}:</span>
              <span :class="['type-badge', ticket.type === 1 ? 'type-bug' : 'type-feature']">
                {{ ticket.type === 1 ? $t('view.ticket.type.bug') : $t('view.ticket.type.feature') }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('view.ticket.field.topic') }}:</span>
              <span class="detail-value">{{ ticket.topicName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('view.ticket.field.createBy') }}:</span>
              <span class="detail-value">{{ ticket.createBy }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('view.ticket.field.createDate') }}:</span>
              <span class="detail-value">{{ formatDate(ticket.createDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ $t('view.ticket.field.updateDate') }}:</span>
              <span class="detail-value">{{ formatDate(ticket.updateDate) }}</span>
            </div>
          </div>

          <div class="mt-3">
            <span class="detail-label">{{ $t('view.ticket.field.title') }}:</span>
            <div class="detail-value mt-1">{{ ticket.title }}</div>
          </div>

          <div class="mt-3">
            <span class="detail-label">{{ $t('view.ticket.field.description') }}:</span>
            <div class="description-box">{{ ticket.description }}</div>
          </div>

          <div class="mt-3" v-if="ticketImageUrls.length">
            <span class="detail-label">{{ $t('view.ticket.field.screenshot') }}:</span>
            <div class="image-gallery mt-2">
              <ImagePreview
                v-for="(url, idx) in ticketImageUrls"
                :key="idx"
                :src="url"
                :preview="true"
                :width="220"
                :alt="`${$t('view.ticket.field.screenshot')} ${idx + 1}`"
              />
            </div>
          </div>
          <div class="mt-3" v-else>
            <span class="detail-label">{{ $t('view.ticket.field.screenshot') }}:</span>
            <span class="no-image-hint ml-2">{{ $t('view.ticket.label.noImage') }}</span>
          </div>

          <!-- Divider -->
          <div class="panel-divider"></div>

          <!-- Response section -->
          <div class="panel-section-header">{{ $t('view.ticket.thread.responseTitle') }}</div>
          <TicketThread
            variant="chat"
            :entries="responseComments"
            :canPost="true"
            deleteMode="all"
            meRole="dev"
            :placeholder="$t('view.ticket.thread.placeholder')"
            :emptyText="$t('view.ticket.thread.empty')"
            @post="onPostResponse"
            @delete="onDeleteComment"
          />
        </SectionCardGeneric>

        <!-- RIGHT: Status + Analysis + Change -->
        <div>
          <SectionCardGeneric :title="$t('view.ticket.field.status')" class="mb-3">
            <div class="form-row two-col">
              <FormFieldGeneric :label="$t('view.ticket.field.status')" :required="true">
                <DropdownGeneric
                  :modelValue="editStatus"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="$t('view.ticket.placeholder.status')"
                  @update:modelValue="editStatus = $event"
                />
              </FormFieldGeneric>
              <div class="d-flex align-items-end">
                <ButtonGeneric
                  variant="main"
                  icon="bi-arrow-repeat"
                  :label="$t('view.ticket.btn.updateStatus')"
                  @click="onUpdateStatus"
                />
              </div>
            </div>
          </SectionCardGeneric>

          <SectionCardGeneric :title="$t('view.ticket.thread.analysisTitle')" class="mb-3">
            <TicketThread
              variant="timeline"
              :entries="analysisComments"
              :canPost="true"
              deleteMode="all"
              meRole="dev"
              :placeholder="$t('view.ticket.thread.placeholder')"
              :emptyText="$t('view.ticket.thread.empty')"
              @post="onPostAnalysis"
              @delete="onDeleteComment"
            />
          </SectionCardGeneric>

          <SectionCardGeneric :title="$t('view.ticket.thread.changeTitle')" class="mb-3">
            <TicketThread
              variant="timeline"
              :entries="changeComments"
              :canPost="true"
              deleteMode="all"
              meRole="dev"
              :placeholder="$t('view.ticket.thread.placeholder')"
              :emptyText="$t('view.ticket.thread.empty')"
              @post="onPostChange"
              @delete="onDeleteComment"
            />
          </SectionCardGeneric>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useTicketStore } from '@/stores/modules/api/ticket-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success } from '@/services/alert/sweetAlerts.js'
import dayjs from 'dayjs'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import ImagePreview from '@/components/prime-vue/ImagePreview.vue'
import TicketThread from '../components/ticket-thread.vue'

export default {
  name: 'TicketManageDetailView',

  components: {
    PageHeaderGeneric,
    SectionCardGeneric,
    FormFieldGeneric,
    ButtonGeneric,
    DropdownGeneric,
    ImagePreview,
    TicketThread
  },

  setup() {
    const ticketStore = useTicketStore()
    return { ticketStore }
  },

  data() {
    return {
      ticket: {},
      editStatus: null
    }
  },

  computed: {
    ticketImageUrls() {
      if (this.ticket.imageUrls?.length) return this.ticket.imageUrls
      if (this.ticket.screenshotUrl) return [this.ticket.screenshotUrl]
      return []
    },

    statusOptions() {
      return [
        { value: 1, label: this.$t('view.ticket.status.open') },
        { value: 2, label: this.$t('view.ticket.status.inProgress') },
        { value: 3, label: this.$t('view.ticket.status.resolved') },
        { value: 4, label: this.$t('view.ticket.status.closed') },
        { value: 5, label: this.$t('view.ticket.status.cancelled') }
      ]
    },

    analysisComments() {
      return (this.ticket.comments || []).filter((c) => c.type === 'analysis')
    },

    responseComments() {
      return (this.ticket.comments || []).filter((c) => c.type === 'response')
    },

    changeComments() {
      return (this.ticket.comments || []).filter((c) => c.type === 'change')
    }
  },

  mounted() {
    this.loadTicket()
  },

  methods: {
    async loadTicket() {
      const id = this.$route.params.id
      if (!id) return

      const res = await this.ticketStore.searchTickets({
        take: 1,
        skip: 0,
        sort: [],
        ticketId: Number(id)
      })

      if (res?.data?.length) {
        const t = res.data[0]
        this.ticket = t
        this.editStatus = t.statusId
        this.ticketStore.markTicketAsRead(t.id)
      }
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    onUpdateStatus() {
      if (!this.editStatus) return

      const statusLabel = this.statusOptions.find((s) => s.value === this.editStatus)?.label || ''

      confirmThenSubmit(
        `${this.ticket.ticketNo} → ${statusLabel}`,
        this.$t('view.ticket.confirm.updateStatus'),
        async () => {
          const res = await this.ticketStore.updateStatus(this.ticket.id, this.editStatus)
          if (res !== undefined) {
            success(this.$t('view.ticket.success.updateStatus'))
            this.loadTicket()
          }
        }
      )
    },

    async onPostAnalysis(msg) {
      const res = await this.ticketStore.addTicketComment(this.ticket.id, 'analysis', msg)
      if (res !== undefined) {
        success(this.$t('view.ticket.thread.success.add'))
        this.loadTicket()
      }
    },

    async onPostResponse(msg) {
      const res = await this.ticketStore.addTicketComment(this.ticket.id, 'response', msg)
      if (res !== undefined) {
        this.ticket.comments = [...(this.ticket.comments || []), {
          id: Date.now(), type: 'response', authorRole: 'dev', message: msg, createBy: '', createDate: new Date().toISOString()
        }]
        this.loadTicket()
      }
    },

    async onPostChange(msg) {
      const res = await this.ticketStore.addTicketComment(this.ticket.id, 'change', msg)
      if (res !== undefined) {
        success(this.$t('view.ticket.thread.success.add'))
        this.loadTicket()
      }
    },

    onDeleteComment(entry) {
      confirmThenSubmit(
        this.$t('view.ticket.thread.confirmDelete'),
        this.$t('common.btn.delete'),
        async () => {
          await this.ticketStore.deleteTicketComment(entry.id)
          success(this.$t('view.ticket.thread.success.delete'))
          this.loadTicket()
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.work-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-lg);
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

:deep(.detail-panel.section-card) {
  background: var(--color-highlight-bg);
}

.panel-section-header {
  background: var(--base-font-color);
  color: #fff;
  font-weight: 600;
  padding: var(--sp-sm) var(--sp-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--sp-md);
}

.panel-divider {
  border-top: 1px solid var(--color-border);
  margin: var(--sp-xl) 0;
}

.mt-1 {
  margin-top: var(--sp-xs);
}

.mt-2 {
  margin-top: var(--sp-sm);
}

.mt-3 {
  margin-top: var(--sp-lg);
}

.mb-3 {
  margin-bottom: var(--sp-lg);
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
  background: #fff;
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

.no-image-hint {
  font-size: var(--fs-base);
  color: #888;
}

.form-row {
  &.two-col {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--sp-lg);
    align-items: end;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &.type-bug {
    background: #fde8e8;
    color: var(--base-font-color);
  }

  &.type-feature {
    background: #e8f4fd;
    color: #0066a1;
  }
}

.d-flex {
  display: flex;
}

.align-items-end {
  align-items: flex-end;
}

.ml-2 {
  margin-left: var(--sp-sm);
}
</style>
