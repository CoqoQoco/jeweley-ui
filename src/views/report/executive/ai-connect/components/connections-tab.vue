<template>
  <SectionCardGeneric :title="$t('view.aiConnector.tabs.connections', { count: items.length })" icon="bi-plug" headerStyle="legend">
    <div class="connections-toolbar">
      <ButtonGeneric variant="main" icon="bi-plus-lg" :label="$t('view.aiConnector.connections.createBtn')" @click="$emit('create')" />
    </div>

    <BaseDataTable
      :items="items"
      :columns="columns"
      :totalRecords="items.length"
      :paginator="false"
      :showGridlines="false"
      scrollHeight="none"
      :emptyMessage="$t('view.aiConnector.connections.empty')"
    >
      <template #nameTemplate="{ data }">
        <strong>{{ data.name }}</strong>
      </template>

      <template #kindTemplate="{ data }">
        {{ data.kind === 'PAT' ? $t('view.aiConnector.connect.methodPat') : $t('view.aiConnector.connect.methodOauth') }}
      </template>

      <template #scopesTemplate="{ data }">
        <span class="chips">
          <span v-for="code in chipsOf(data).visible" :key="code" class="chip">{{ scopeName(code) }}</span>
          <span v-if="chipsOf(data).hidden.length" class="chip chip--more" :title="hiddenTitle(data)">
            {{ $t('view.aiConnector.connections.moreScopes', { count: chipsOf(data).hidden.length }) }}
          </span>
        </span>
      </template>

      <template #lastUsedAtTemplate="{ data }">
        <span v-if="data.lastUsedAt">{{ formatDateTime(data.lastUsedAt) }}</span>
        <span v-else class="muted">{{ $t('view.aiConnector.connections.neverUsed') }}</span>
      </template>

      <template #expiresAtTemplate="{ data }">
        <span v-if="expiryOf(data).status === 'none'" class="muted">{{ $t('view.aiConnector.connections.noExpiry') }}</span>
        <template v-else>
          <div>{{ formatDate(data.expiresAt) }}</div>
          <div v-if="expiryOf(data).status === 'expired'" class="expiry expiry--expired">
            <i class="bi bi-x-circle-fill"></i> {{ $t('view.aiConnector.connections.expired') }}
          </div>
          <div v-else-if="expiryOf(data).status === 'soon'" class="expiry expiry--soon">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ $t('view.aiConnector.connections.expiresSoon', { days: expiryOf(data).daysLeft }) }}
          </div>
        </template>
      </template>

      <template #actionTemplate="{ data }">
        <ButtonGeneric variant="red" icon="bi-x-circle" :label="$t('view.aiConnector.connections.revokeBtn')" @click="onRevoke(data)" />
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { formatDate, formatDateTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { getExpiryStatus, splitScopeChips, formatScopeName } from '../ai-connect-helpers.js'

export default {
  name: 'ConnectionsTab',

  components: { SectionCardGeneric, ButtonGeneric, BaseDataTable },

  props: {
    items: { type: Array, default: () => [] }
  },

  emits: ['create', 'revoke'],

  computed: {
    columns() {
      return [
        { field: 'name', header: this.$t('view.aiConnector.connections.colName'), minWidth: '160px', sortable: false },
        { field: 'kind', header: this.$t('view.aiConnector.connections.colMethod'), minWidth: '160px', sortable: false },
        { field: 'scopes', header: this.$t('view.aiConnector.connections.colScopes'), minWidth: '220px', sortable: false },
        { field: 'lastUsedAt', header: this.$t('view.aiConnector.connections.colLastUsed'), minWidth: '150px', sortable: false },
        { field: 'expiresAt', header: this.$t('view.aiConnector.connections.colExpires'), minWidth: '160px', sortable: false },
        { field: 'action', header: this.$t('view.aiConnector.connections.colAction'), minWidth: '170px', sortable: false }
      ]
    }
  },

  methods: {
    formatDate,
    formatDateTime,

    expiryOf(item) {
      return getExpiryStatus(item.expiresAt)
    },

    chipsOf(item) {
      return splitScopeChips(item.scopes)
    },

    scopeName(code) {
      return formatScopeName(code, (key) => this.$t(key))
    },

    hiddenTitle(item) {
      return this.chipsOf(item).hidden.map((code) => this.scopeName(code)).join(', ')
    },

    onRevoke(item) {
      confirmThenSubmit(
        this.$t('view.aiConnector.connections.revokeConfirm', { name: item.name }),
        this.$t('view.aiConnector.connections.revokeTitle'),
        () => this.$emit('revoke', item),
        { confirmText: this.$t('view.aiConnector.connections.revokeConfirmBtn'), cancelText: this.$t('common.btn.cancel') }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.connections-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--sp-md);
}

.chips {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--sp-xs);
}

.chip {
  padding: 0 var(--sp-sm);
  border: 1px solid var(--base-green);
  border-radius: var(--radius-lg);
  color: var(--base-green);
  font-size: var(--fs-sm);
  white-space: nowrap;

  &--more {
    border-color: var(--color-border);
    color: var(--base-sub-color);
    cursor: help;
  }
}

.muted {
  color: var(--base-sub-color);
}

.expiry {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--base-font-color);

  &--expired i {
    color: var(--base-red);
  }
}
</style>
