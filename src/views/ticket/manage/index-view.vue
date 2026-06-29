<template>
  <div class="app-container">
    <ticketDashboard />

    <SearchBarGeneric
      :title="$t('view.ticket.manageTitle')"
      :description="$t('view.ticket.manageDesc')"
      @search="onSearch"
      @clear="onClear"
    >
      <template #fields>
        <div class="form-field">
          <span class="title-text">{{ $t('view.ticket.field.status') }}</span>
          <MultiSelectGeneric
            :modelValue="filter.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.ticket.placeholder.status')"
            :showClear="true"
            @update:modelValue="filter.status = $event"
          />
        </div>
        <div class="form-field">
          <span class="title-text">{{ $t('view.ticket.field.type') }}</span>
          <MultiSelectGeneric
            :modelValue="filter.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.ticket.placeholder.type')"
            :showClear="true"
            @update:modelValue="filter.type = $event"
          />
        </div>
        <div class="form-field">
          <span class="title-text">{{ $t('view.ticket.field.keyword') }}</span>
          <InputTextGeneric
            v-model="filter.keyword"
            :placeholder="$t('view.ticket.placeholder.keyword')"
          />
        </div>
      </template>

      <template #actions-right>
        <ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
        <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      </template>
    </SearchBarGeneric>

    <div class="mt-2">
      <BaseDataTable
        :items="dataList"
        :totalRecords="total"
        :columns="columns"
        :perPage="take"
        :showColumnSettings="true"
        @page="handlePageChange"
        @sort="handleSortChange"
      >
        <template #ticketNoTemplate="{ data }">
          <span>{{ data.ticketNo }}</span>
          <span v-if="data.hasNewMessage" class="new-msg-badge">{{ $t('view.ticket.field.newMsg') }}</span>
        </template>

        <template #typeTemplate="{ data }">
          <span :class="['type-badge', data.type === 1 ? 'type-bug' : 'type-feature']">
            {{ data.type === 1 ? $t('view.ticket.type.bug') : $t('view.ticket.type.feature') }}
          </span>
        </template>

        <template #statusTemplate="{ data }">
          <span :class="['status-badge', getStatusClass(data.statusId)]">
            {{ getStatusLabel(data.statusId, data.statusNameTh) }}
          </span>
        </template>

        <template #actionTemplate="{ data }">
          <ButtonGeneric
            variant="green"
            icon="bi-eye"
            @click="onViewDetail(data)"
          />
          <ButtonGeneric
            variant="main"
            icon="bi-arrow-repeat"
            class="ml-1"
            :title="$t('view.ticket.field.changeStatus')"
            @click="onOpenStatusModal(data)"
          />
        </template>

        <template #latestAnalysisTemplate="{ data }">
          <span
            class="analysis-cell"
            :class="{ clickable: !!data.latestAnalysis }"
            :title="data.latestAnalysis || ''"
            @click="onViewAnalysis(data)"
          >
            {{ data.latestAnalysis || '-' }}
            <i v-if="data.latestAnalysis" class="bi bi-eye analysis-icon"></i>
          </span>
        </template>
      </BaseDataTable>
    </div>

    <statusChangeModal
      :isShow="statusModal.isShow"
      :ticket="statusModal.ticket"
      @closeModal="statusModal.isShow = false"
      @saved="onStatusSaved"
    />

    <analysisModal
      :isShow="analysisModal.isShow"
      :ticket="analysisModal.ticket"
      @closeModal="analysisModal.isShow = false"
    />
  </div>
</template>

<script>
import { useTicketStore } from '@/stores/modules/api/ticket-store.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import statusChangeModal from './modal/status-change-modal.vue'
import analysisModal from './modal/analysis-modal.vue'
import ticketDashboard from './components/ticket-dashboard.vue'

export default {
  name: 'TicketManageIndexView',

  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
    MultiSelectGeneric,
    BaseDataTable,
    statusChangeModal,
    analysisModal,
    ticketDashboard
  },

  mixins: [dataTablePaging],

  setup() {
    const ticketStore = useTicketStore()
    return { ticketStore }
  },

  data() {
    return {
      dataList: [],
      total: 0,
      filter: {
        status: [],
        type: [],
        keyword: null
      },
      statusModal: {
        isShow: false,
        ticket: {}
      },
      analysisModal: {
        isShow: false,
        ticket: {}
      }
    }
  },

  computed: {
    typeOptions() {
      return [
        { value: 1, label: this.$t('view.ticket.type.bug') },
        { value: 2, label: this.$t('view.ticket.type.feature') }
      ]
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

    columns() {
      return [
        { field: 'action', header: this.$t('common.field.action'), width: '110px', align: 'center', sortable: false },
        { field: 'ticketNo', header: this.$t('view.ticket.field.ticketNo'), minWidth: '100px' },
        { field: 'type', header: this.$t('view.ticket.field.type'), minWidth: '120px', sortable: false },
        { field: 'topicName', header: this.$t('view.ticket.field.topic'), minWidth: '150px' },
        { field: 'title', header: this.$t('view.ticket.field.title'), minWidth: '200px' },
        { field: 'createBy', header: this.$t('view.ticket.field.createBy'), minWidth: '120px' },
        { field: 'status', header: this.$t('view.ticket.field.status'), minWidth: '120px', sortable: false },
        { field: 'updateDate', header: this.$t('view.ticket.field.updateDate'), minWidth: '140px', format: 'datetime' },
        { field: 'latestAnalysis', header: this.$t('view.ticket.field.latestAnalysis'), minWidth: '200px', sortable: false },
        { field: 'createDate', header: this.$t('view.ticket.field.createDate'), minWidth: '120px', format: 'datetime' }
      ]
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const res = await this.ticketStore.searchTickets({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        status: this.filter.status?.length ? this.filter.status : undefined,
        type: this.filter.type?.length ? this.filter.type : undefined,
        keyword: this.filter.keyword || undefined
      })
      if (res) {
        this.dataList = res.data
        this.total = res.total
      }
    },

    onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.filter = { status: [], type: [], keyword: null }
      this.resetPaging()
    },

    onViewDetail(ticket) {
      this.$router.push({ name: 'ticket-manage-detail', params: { id: ticket.id } })
    },

    getStatusLabel(statusId, fallback) {
      const map = {
        1: this.$t('view.ticket.status.open'),
        2: this.$t('view.ticket.status.inProgress'),
        3: this.$t('view.ticket.status.resolved'),
        4: this.$t('view.ticket.status.closed'),
        5: this.$t('view.ticket.status.cancelled')
      }
      return map[statusId] || fallback || '-'
    },

    getStatusClass(statusId) {
      const map = {
        1: 'status-open',
        2: 'status-in-progress',
        3: 'status-resolved',
        4: 'status-closed',
        5: 'status-cancelled'
      }
      return map[statusId] || ''
    },

    onOpenStatusModal(row) {
      this.statusModal = { isShow: true, ticket: { ...row } }
    },

    onStatusSaved() {
      this.statusModal.isShow = false
      this.fetchData()
    },

    onViewAnalysis(data) {
      if (!data.latestAnalysis) return
      this.analysisModal.ticket = data
      this.analysisModal.isShow = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.mt-2 {
  margin-top: var(--sp-sm);
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

  &.status-cancelled {
    background: #f8d7da;
    color: #721c24;
  }
}

.new-msg-badge {
  display: inline-block;
  margin-left: var(--sp-sm);
  padding: 1px 8px;
  background: var(--base-red);
  color: #fff;
  font-size: var(--fs-sm);
  font-weight: 700;
  border-radius: var(--radius-sm);
}

.analysis-cell {
  display: inline-block;
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;

  &.clickable {
    cursor: pointer;
    color: var(--base-font-color);
  }
}

.analysis-icon {
  margin-left: var(--sp-xs);
  font-size: var(--fs-sm);
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
</style>
