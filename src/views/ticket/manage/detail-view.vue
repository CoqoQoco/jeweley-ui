<template>
  <div class="app-container">
    <PageHeaderGeneric
      :title="$t('view.ticket.detailTitle')"
      backRoute="ticket-manage"
    />

    <div v-if="ticket.id" class="mt-2">
      <!-- Ticket Info Card -->
      <SectionCardGeneric :title="$t('view.ticket.detailTitle')" class="mb-3">
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
            <img
              v-for="(url, idx) in ticketImageUrls"
              :key="idx"
              :src="url"
              class="screenshot-img"
              :alt="`${$t('view.ticket.field.screenshot')} ${idx + 1}`"
            />
          </div>
        </div>
        <div class="mt-3" v-else>
          <span class="detail-label">{{ $t('view.ticket.field.screenshot') }}:</span>
          <span class="no-image-hint ml-2">{{ $t('view.ticket.label.noImage') }}</span>
        </div>
      </SectionCardGeneric>

      <!-- Status Update Card -->
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

      <!-- Dev Analysis & Response Card -->
      <SectionCardGeneric :title="$t('view.ticket.field.devAnalysis')" class="mb-3">
        <FormFieldGeneric :label="$t('view.ticket.field.devAnalysis')">
          <TextareaGeneric
            v-model="editAnalysis"
            :rows="5"
            :placeholder="$t('view.ticket.field.devAnalysis')"
          />
        </FormFieldGeneric>

        <FormFieldGeneric :label="$t('view.ticket.field.devResponse')" class="mt-3">
          <TextareaGeneric
            v-model="editResponse"
            :rows="4"
            :placeholder="$t('view.ticket.field.devResponse')"
          />
        </FormFieldGeneric>

        <div class="mt-3">
          <ButtonGeneric
            variant="main"
            icon="bi-save"
            :label="$t('view.ticket.btn.saveDev')"
            @click="onSaveDev"
          />
        </div>
      </SectionCardGeneric>

      <!-- Work Log Card -->
      <SectionCardGeneric :title="$t('view.ticket.log.title')">
        <div class="log-add-row">
          <TextareaGeneric
            v-model="newLogDetail"
            :rows="2"
            :placeholder="$t('view.ticket.log.placeholder')"
          />
          <div class="log-add-btn">
            <ButtonGeneric
              variant="main"
              icon="bi-plus"
              :label="$t('view.ticket.log.addBtn')"
              :disabled="!newLogDetail || !newLogDetail.trim()"
              @click="onAddLog"
            />
          </div>
        </div>

        <div class="log-divider"></div>

        <div v-if="ticket.logs && ticket.logs.length" class="log-timeline">
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
        <div v-else class="log-empty">
          {{ $t('view.ticket.log.empty') }}
        </div>
      </SectionCardGeneric>
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
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'

export default {
  name: 'TicketManageDetailView',

  components: {
    PageHeaderGeneric,
    SectionCardGeneric,
    FormFieldGeneric,
    TextareaGeneric,
    ButtonGeneric,
    DropdownGeneric
  },

  setup() {
    const ticketStore = useTicketStore()
    return { ticketStore }
  },

  data() {
    return {
      ticket: {},
      editStatus: null,
      editAnalysis: '',
      editResponse: '',
      newLogDetail: ''
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
        { value: 4, label: this.$t('view.ticket.status.closed') }
      ]
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
        this.editAnalysis = t.devAnalysis || ''
        this.editResponse = t.devResponse || ''
      }
    },

    formatDate(date) {
      if (!date) return '-'
      return dayjs(date).format('DD/MM/YYYY HH:mm')
    },

    getStatusLabel(statusId) {
      const opt = this.statusOptions.find((s) => s.value === statusId)
      return opt ? opt.label : String(statusId)
    },

    getActionLabel(action) {
      if (action === 'status') return this.$t('view.ticket.log.actionStatus')
      if (action === 'dev') return this.$t('view.ticket.log.actionDev')
      return this.$t('view.ticket.log.actionNote')
    },

    logText(log) {
      if (log.action === 'status') {
        return `${this.$t('view.ticket.log.actionStatus')}: ${this.getStatusLabel(Number(log.oldValue))} → ${this.getStatusLabel(Number(log.newValue))}`
      }
      return log.detail
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

    onSaveDev() {
      confirmThenSubmit(
        this.ticket.ticketNo,
        this.$t('view.ticket.confirm.saveDev'),
        async () => {
          const res = await this.ticketStore.updateDev(
            this.ticket.id,
            this.editAnalysis,
            this.editResponse
          )
          if (res !== undefined) {
            success(this.$t('view.ticket.success.saveDev'))
            this.loadTicket()
          }
        }
      )
    },

    async onAddLog() {
      if (!this.newLogDetail || !this.newLogDetail.trim()) return

      const res = await this.ticketStore.addTicketLog(this.ticket.id, this.newLogDetail)
      if (res !== undefined) {
        success(this.$t('view.ticket.log.success.add'))
        this.newLogDetail = ''
        this.loadTicket()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

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

.log-add-row {
  display: flex;
  flex-direction: column;
  gap: var(--sp-sm);
}

.log-add-btn {
  display: flex;
  justify-content: flex-end;
}

.log-divider {
  margin: var(--sp-lg) 0;
  border-top: 1px solid var(--color-border);
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

.log-empty {
  font-size: var(--fs-base);
  color: #888;
  padding: var(--sp-md) 0;
}
</style>
