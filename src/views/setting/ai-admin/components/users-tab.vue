<template>
  <SectionCardGeneric :title="$t('view.aiAdmin.users.sectionTitle')" icon="bi-people" headerStyle="dashboard">
    <div v-if="loading" class="state-text" role="status">
      <i class="bi bi-arrow-repeat spin"></i> {{ $t('view.aiAdmin.loading') }}
    </div>
    <div v-else-if="error" class="state-text state-text--error" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ $t('view.aiAdmin.loadFailed') }}
    </div>

    <BaseDataTable
      v-else
      :items="users"
      :columns="columns"
      :totalRecords="users.length"
      dataKey="userId"
      :expandable="true"
      :paginator="false"
      :showGridlines="false"
      scrollHeight="none"
      :emptyMessage="$t('view.aiAdmin.users.empty')"
    >
      <template #userTemplate="{ data }">
        <div class="user-name">{{ data.displayName }}</div>
        <div class="muted">{{ data.username }}</div>
      </template>

      <template #connectionsTemplate="{ data }">
        {{ $t('view.aiAdmin.users.connectedCount', { count: data.activeConnections }) }}
      </template>

      <template #rolesTemplate="{ data }">{{ (data.roles || []).join(', ') }}</template>

      <template #statusTemplate="{ data }">
        <div v-if="data.suspended" class="status status--suspended">
          <i class="bi bi-slash-circle-fill" aria-hidden="true"></i> {{ $t('view.aiAdmin.users.statusSuspended') }}
        </div>
        <div v-else class="status status--active">
          <i class="bi bi-check-circle-fill" aria-hidden="true"></i> {{ $t('view.aiAdmin.users.statusActive') }}
        </div>
        <div v-if="data.suspended" class="muted" :title="data.suspendedReason">
          {{ sourceLabel(data.suspendedSource) }}
        </div>
        <div v-if="data.suspended && data.suspendedReason" class="muted note-wrap" :title="data.suspendedReason">
          {{ data.suspendedReason }}
        </div>
      </template>

      <template v-for="col in grantColumns" #[`${col.field}Template`]="{ data }" :key="col.field">
        <div class="grant-cell">
          <div class="grant-cell__row">
            <CheckboxGeneric
              :modelValue="grantOf(data, col.scope).enabled"
              :disabled="isGrantDisabled(data, col.scope)"
              :label="grantOf(data, col.scope).enabled ? $t('view.aiAdmin.users.toggleOn') : $t('view.aiAdmin.users.toggleOff')"
              @update:modelValue="onToggle(data, col, $event)"
            />
          </div>
          <div v-if="isPending(data, col.scope)" class="muted" role="status">
            <i class="bi bi-arrow-repeat spin"></i> {{ $t('view.aiAdmin.users.saving') }}
          </div>
          <div v-else-if="isSaved(data, col.scope)" class="saved" role="status">
            <i class="bi bi-check2"></i> {{ $t('view.aiAdmin.users.saved') }}
          </div>
          <div v-else-if="!grantOf(data, col.scope).canGrant && !grantOf(data, col.scope).enabled" class="muted">
            {{ $t('view.aiAdmin.users.noGrantRole') }}
          </div>
        </div>
      </template>

      <template #lastUsedAtTemplate="{ data }">
        <span v-if="data.lastUsedAt">{{ formatDateTime(data.lastUsedAt) }}</span>
        <span v-else class="muted">{{ $t('view.aiAdmin.users.neverUsed') }}</span>
      </template>

      <template #actionTemplate="{ data }">
        <template v-if="data.suspended">
          <ButtonGeneric variant="main" icon="bi-play-circle" :label="$t('view.aiAdmin.users.liftBtn')" @click="onLift(data)" />
        </template>
        <template v-else>
          <ButtonGeneric
            variant="red"
            icon="bi-slash-circle"
            :disabled="isSelf(data)"
            :label="$t('view.aiAdmin.users.suspendBtn')"
            @click="onSuspend(data)"
          />
          <div v-if="isSelf(data)" class="muted note-wrap">{{ $t('view.aiAdmin.users.selfSuspend') }}</div>
        </template>
      </template>

      <template #expansion="{ data }">
        <connectionsPanel :userId="data.userId" :name="data.displayName" @changed="$emit('changed')" />
      </template>
    </BaseDataTable>

    <suspendModal :isShow="isShowSuspend" :user="suspendTarget" @closeModal="isShowSuspend = false" @suspended="$emit('changed')" />
  </SectionCardGeneric>
</template>

<script>
import { useAiAdminStore } from '@/stores/modules/api/ai-admin/ai-admin-store.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { error as showError, success } from '@/services/alert/sweetAlerts.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import connectionsPanel from './connections-panel.vue'
import suspendModal from '../modal/suspend-modal.vue'
import { GRANT_COLUMNS, extractErrorText, findGrant, isSelfUser, scopeKey } from '../ai-admin-helpers.js'

const SAVED_MS = 2500

export default {
  name: 'AiAdminUsersTab',

  components: { SectionCardGeneric, ButtonGeneric, CheckboxGeneric, BaseDataTable, connectionsPanel, suspendModal },

  props: {
    users: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    error: { type: Boolean, default: false }
  },

  emits: ['changed'],

  setup() {
    return { store: useAiAdminStore(), authStore: useAuthStore() }
  },

  data() {
    return {
      pending: {},
      saved: {},
      isShowSuspend: false,
      suspendTarget: null
    }
  },

  computed: {
    grantColumns() {
      return GRANT_COLUMNS
    },

    columns() {
      return [
        { field: 'user', header: this.$t('view.aiAdmin.users.colUser'), minWidth: '150px', sortable: false },
        { field: 'connections', header: this.$t('view.aiAdmin.users.colConnections'), minWidth: '70px', sortable: false },
        { field: 'roles', header: this.$t('view.aiAdmin.users.colRole'), minWidth: '90px', sortable: false },
        { field: 'status', header: this.$t('view.aiAdmin.users.colStatus'), minWidth: '170px', sortable: false },
        { field: 'receivables', header: this.$t('view.aiAdmin.users.colReceivables'), minWidth: '90px', sortable: false },
        { field: 'cost', header: this.$t('view.aiAdmin.users.colCost'), minWidth: '90px', sortable: false },
        { field: 'customerNames', header: this.$t('view.aiAdmin.users.colCustomerNames'), minWidth: '90px', sortable: false },
        { field: 'workerNames', header: this.$t('view.aiAdmin.users.colWorkerNames'), minWidth: '90px', sortable: false },
        { field: 'lastUsedAt', header: this.$t('view.aiAdmin.users.colLastUsed'), minWidth: '110px', sortable: false },
        { field: 'action', header: this.$t('view.aiAdmin.users.colAction'), minWidth: '150px', sortable: false }
      ]
    }
  },

  methods: {
    formatDateTime,

    grantOf: findGrant,

    isSelf(row) {
      return isSelfUser(row, this.authStore.user)
    },

    sourceLabel(source) {
      return source === 'auto' ? this.$t('view.aiAdmin.users.sourceAuto') : this.$t('view.aiAdmin.users.sourceManual')
    },

    keyOf(row, scope) {
      return `${row.userId}:${scope}`
    },

    isPending(row, scope) {
      return !!this.pending[this.keyOf(row, scope)]
    },

    isSaved(row, scope) {
      return !!this.saved[this.keyOf(row, scope)]
    },

    // เปิดไม่ได้เมื่อ role ไม่รองรับ — ปิดได้เสมอ
    isGrantDisabled(row, scope) {
      const grant = findGrant(row, scope)
      return this.isPending(row, scope) || (!grant.canGrant && !grant.enabled)
    },

    onToggle(row, col, value) {
      if (value) {
        confirmThenSubmit(
          this.$t('view.aiAdmin.users.enableConfirmMessage', { name: row.displayName, category: this.$t(scopeKey(col.scope)) }),
          this.$t('view.aiAdmin.users.enableConfirmTitle'),
          () => this.applyGrant(row, col.scope, true),
          { confirmText: this.$t('view.aiAdmin.users.enableConfirmBtn'), cancelText: this.$t('common.btn.cancel') }
        )
        return
      }
      this.applyGrant(row, col.scope, value)
    },

    // try/catch เฉพาะหน้านี้: ต้องคงค่าเดิมของ toggle + แสดงข้อความ error ของ API (ข้อความล้วน ไม่ใช่ JSON)
    async applyGrant(row, scope, enabled) {
      const key = this.keyOf(row, scope)
      this.pending = { ...this.pending, [key]: true }
      try {
        await this.store.setGrant({ userId: row.userId, scope, enabled })
        this.saved = { ...this.saved, [key]: true }
        setTimeout(() => {
          this.saved = { ...this.saved, [key]: false }
        }, SAVED_MS)
        this.$emit('changed')
      } catch (err) {
        showError(extractErrorText(err, this.$t('view.aiAdmin.users.grantFailed')), this.$t('view.aiAdmin.users.grantFailed'))
      } finally {
        this.pending = { ...this.pending, [key]: false }
      }
    },

    onSuspend(row) {
      this.suspendTarget = row
      this.isShowSuspend = true
    },

    onLift(row) {
      confirmThenSubmit(
        this.$t('view.aiAdmin.users.liftConfirmMessage', { name: row.displayName }),
        this.$t('view.aiAdmin.users.liftConfirmTitle'),
        () => this.lift(row),
        { confirmText: this.$t('view.aiAdmin.users.liftConfirmBtn'), cancelText: this.$t('common.btn.cancel') }
      )
    },

    async lift(row) {
      try {
        await this.store.lift(row.userId)
      } catch (err) {
        showError(extractErrorText(err, this.$t('view.aiAdmin.unknownError')))
        return
      }
      success(this.$t('view.aiAdmin.users.liftDone', { name: row.displayName }))
      this.$emit('changed')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.state-text {
  padding: var(--sp-xl) 0;
  text-align: center;
  color: var(--base-sub-color);
  font-size: var(--fs-base);

  &--error {
    color: var(--base-font-color);
    font-weight: 600;

    i {
      color: var(--base-red);
    }
  }
}

.user-name {
  font-weight: 600;
}

.muted {
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.note-wrap {
  max-width: 190px;
  white-space: normal;
  overflow-wrap: anywhere;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  font-weight: 600;
  color: var(--base-font-color);

  &--active i {
    color: var(--base-green);
  }

  &--suspended i {
    color: var(--base-red);
  }
}

.grant-cell {
  &__row {
    display: flex;
    align-items: center;
  }

  :deep(.checkbox-wrapper) {
    min-height: 32px;
    min-width: 72px;
  }

  :deep(.checkbox-label) {
    display: flex;
    align-items: center;
    min-height: 32px;
    padding-right: var(--sp-sm);
    cursor: pointer;
  }
}

.saved {
  color: var(--base-green);
  font-size: var(--fs-sm);
  font-weight: 600;
}

.spin {
  animation: ai-admin-spin 0.8s linear infinite;
}

@keyframes ai-admin-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
