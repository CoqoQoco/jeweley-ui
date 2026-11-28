<template>
  <SectionCardGeneric :title="$t('view.aiAdmin.suspensions.title')" icon="bi-slash-circle" headerStyle="dashboard">
    <div v-if="error" class="state-text state-text--error" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ $t('view.aiAdmin.loadFailed') }}
    </div>
    <BaseDataTable
      v-else
      :items="dataList"
      :columns="columns"
      :totalRecords="total"
      :perPage="take"
      :emptyMessage="$t('view.aiAdmin.suspensions.empty')"
      @page="handlePageChange"
      @sort="handleSortChange"
    >
      <template #userTemplate="{ data }">
        <div class="user-name">{{ data.username }}</div>
      </template>

      <template #activeTemplate="{ data }">
        <div v-if="data.active" class="status status--active">
          <i class="bi bi-slash-circle-fill" aria-hidden="true"></i> {{ $t('view.aiAdmin.suspensions.statusActive') }}
        </div>
        <div v-else class="status status--lifted">
          <i class="bi bi-check-circle-fill" aria-hidden="true"></i> {{ $t('view.aiAdmin.suspensions.statusLifted') }}
        </div>
      </template>

      <template #sourceTemplate="{ data }">
        {{ data.source === 'auto' ? $t('view.aiAdmin.suspensions.sourceAuto') : $t('view.aiAdmin.suspensions.sourceManual') }}
      </template>

      <template #createdAtTemplate="{ data }">{{ formatDateTime(data.createdAt) }}</template>

      <template #liftedAtTemplate="{ data }">
        <span v-if="data.liftedAt">{{ formatDateTime(data.liftedAt) }}</span>
      </template>

      <template #actionTemplate="{ data }">
        <ButtonGeneric v-if="data.active" variant="main" icon="bi-play-circle" :label="$t('view.aiAdmin.users.liftBtn')" @click="onLift(data)" />
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { useAiAdminStore } from '@/stores/modules/api/ai-admin/ai-admin-store.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { error as showError, success } from '@/services/alert/sweetAlerts.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import { buildSuspensionParams, extractErrorText } from '../ai-admin-helpers.js'

export default {
  name: 'AiAdminSuspensionsTab',

  components: { SectionCardGeneric, ButtonGeneric, BaseDataTable },

  mixins: [dataTablePaging],

  props: {
    refreshKey: { type: Number, default: 0 }
  },

  emits: ['changed'],

  setup() {
    return { store: useAiAdminStore() }
  },

  data() {
    return { dataList: [], total: 0, error: false }
  },

  computed: {
    columns() {
      return [
        { field: 'user', header: this.$t('view.aiAdmin.suspensions.colUser'), minWidth: '110px', sortable: false },
        { field: 'active', header: this.$t('view.aiAdmin.suspensions.colStatus'), minWidth: '120px', sortable: false },
        { field: 'source', header: this.$t('view.aiAdmin.suspensions.colSource'), minWidth: '90px', sortable: false },
        { field: 'reasonText', header: this.$t('view.aiAdmin.suspensions.colReason'), minWidth: '220px', sortable: false },
        { field: 'createdBy', header: this.$t('view.aiAdmin.suspensions.colBy'), minWidth: '110px', sortable: false },
        { field: 'createdAt', header: this.$t('view.aiAdmin.suspensions.colAt'), minWidth: '140px', sortable: false },
        { field: 'liftedBy', header: this.$t('view.aiAdmin.suspensions.colLiftedBy'), minWidth: '110px', sortable: false },
        { field: 'liftedAt', header: this.$t('view.aiAdmin.suspensions.colLiftedAt'), minWidth: '140px', sortable: false },
        { field: 'action', header: this.$t('view.aiAdmin.suspensions.colAction'), minWidth: '100px', sortable: false }
      ]
    }
  },

  watch: {
    refreshKey() {
      this.fetchData()
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    formatDateTime,

    // try/catch เฉพาะหน้านี้: API ตอบ error เป็นข้อความล้วน (store ปิด popup กลาง) ต้องแสดง error ในแท็บเอง
    async fetchData() {
      this.error = false
      try {
        const res = await this.store.searchSuspensions(buildSuspensionParams({ skip: this.skip, take: this.take, sort: this.sort }))
        this.dataList = res?.data || []
        this.total = res?.total || 0
      } catch {
        this.error = true
        this.dataList = []
        this.total = 0
      }
    },

    onLift(row) {
      confirmThenSubmit(
        this.$t('view.aiAdmin.users.liftConfirmMessage', { name: row.username }),
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
      success(this.$t('view.aiAdmin.users.liftDone', { name: row.username }))
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

.status {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  font-weight: 600;

  &--active i {
    color: var(--base-red);
  }

  &--lifted i {
    color: var(--base-green);
  }
}
</style>
