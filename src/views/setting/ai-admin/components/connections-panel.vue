<template>
  <div class="connections-panel">
    <div v-if="loading" class="state-text" role="status">
      <i class="bi bi-arrow-repeat spin"></i> {{ $t('view.aiAdmin.connections.loading') }}
    </div>
    <div v-else-if="failed" class="state-text state-text--error" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ $t('view.aiAdmin.connections.loadFailed') }}
      <ButtonGeneric variant="outline" icon="bi-arrow-clockwise" :label="$t('view.aiAdmin.connections.retry')" @click="load" />
    </div>
    <div v-else-if="!items.length" class="state-text">{{ $t('view.aiAdmin.connections.empty') }}</div>

    <BaseDataTable
      v-else
      :items="items"
      :columns="columns"
      :totalRecords="items.length"
      :paginator="false"
      :showGridlines="false"
      scrollHeight="none"
    >
      <template #nameTemplate="{ data }"><strong>{{ data.name }}</strong></template>

      <template #kindTemplate="{ data }">
        {{ data.kind === 'PAT' ? $t('view.aiAdmin.connections.kindPat') : $t('view.aiAdmin.connections.kindOauth') }}
      </template>

      <template #lastUsedAtTemplate="{ data }">
        <span v-if="data.lastUsedAt">{{ formatDateTime(data.lastUsedAt) }}</span>
        <span v-else class="muted">{{ $t('view.aiAdmin.connections.neverUsed') }}</span>
      </template>

      <template #expiresAtTemplate="{ data }">
        <span v-if="data.expiresAt">{{ formatDate(data.expiresAt) }}</span>
        <span v-else class="muted">{{ $t('view.aiAdmin.connections.noExpiry') }}</span>
      </template>

      <template #actionTemplate="{ data }">
        <ButtonGeneric variant="red" icon="bi-x-circle" :label="$t('view.aiAdmin.connections.revokeBtn')" @click="onRevoke(data)" />
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { useAiAdminStore } from '@/stores/modules/api/ai-admin/ai-admin-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { error as showError, success } from '@/services/alert/sweetAlerts.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { extractErrorText } from '../ai-admin-helpers.js'

export default {
  name: 'AiAdminConnectionsPanel',

  components: { ButtonGeneric, BaseDataTable },

  props: {
    userId: { type: [Number, String], required: true },
    name: { type: String, default: '' }
  },

  emits: ['changed'],

  setup() {
    return { store: useAiAdminStore() }
  },

  data() {
    return { items: [], loading: true, failed: false }
  },

  computed: {
    columns() {
      return [
        { field: 'name', header: this.$t('view.aiAdmin.connections.colApp'), minWidth: '160px', sortable: false },
        { field: 'kind', header: this.$t('view.aiAdmin.connections.colKind'), minWidth: '80px', sortable: false },
        { field: 'lastUsedAt', header: this.$t('view.aiAdmin.connections.colLastUsed'), minWidth: '140px', sortable: false },
        { field: 'expiresAt', header: this.$t('view.aiAdmin.connections.colExpires'), minWidth: '120px', sortable: false },
        { field: 'action', header: this.$t('view.aiAdmin.connections.colAction'), minWidth: '130px', sortable: false }
      ]
    }
  },

  mounted() {
    this.load()
  },

  methods: {
    formatDate,
    formatDateTime,

    // try/catch เฉพาะหน้านี้: API ตอบ error เป็นข้อความล้วน (store ปิด popup กลาง) ต้องแสดง error ในพื้นที่ขยายแถวเอง
    async load() {
      this.loading = true
      this.failed = false
      try {
        const res = await this.store.listConnections(this.userId)
        this.items = res?.items || []
      } catch {
        this.failed = true
      } finally {
        this.loading = false
      }
    },

    onRevoke(item) {
      confirmThenSubmit(
        this.$t('view.aiAdmin.connections.revokeConfirmMessage', { app: item.name, name: this.name }),
        this.$t('view.aiAdmin.connections.revokeConfirmTitle'),
        () => this.revoke(item),
        { confirmText: this.$t('view.aiAdmin.connections.revokeConfirmBtn'), cancelText: this.$t('common.btn.cancel') }
      )
    },

    async revoke(item) {
      try {
        await this.store.revokeConnection(item.id)
      } catch (err) {
        showError(extractErrorText(err, this.$t('view.aiAdmin.unknownError')))
        return
      }
      success(this.$t('view.aiAdmin.connections.revokeDone'))
      await this.load()
      this.$emit('changed')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.connections-panel {
  padding: var(--sp-md) var(--sp-lg);
}

.state-text {
  padding: var(--sp-md) 0;
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

.muted {
  color: var(--base-sub-color);
}

.spin {
  animation: ai-admin-panel-spin 0.8s linear infinite;
}

@keyframes ai-admin-panel-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
