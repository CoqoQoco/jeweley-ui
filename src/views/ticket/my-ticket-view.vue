<template>
  <div class="app-container">
    <SearchBarGeneric
      :title="$t('view.ticket.myTicketTitle')"
      @search="onSearch"
      @clear="onClear"
    >
      <template #fields>
        <div class="form-field">
          <span class="title-text">{{ $t('view.ticket.field.status') }}</span>
          <DropdownGeneric
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
          <DropdownGeneric
            :modelValue="filter.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.ticket.placeholder.type')"
            :showClear="true"
            @update:modelValue="filter.type = $event"
          />
        </div>
      </template>
    </SearchBarGeneric>

    <div class="mt-2">
      <BaseDataTable
        :items="dataList"
        :totalRecords="total"
        :columns="columns"
        :perPage="take"
        @page="handlePageChange"
        @sort="handleSortChange"
      >
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
          <ButtonGeneric variant="green" icon="bi-eye" @click="onViewDetail(data)" />
        </template>
      </BaseDataTable>
    </div>

    <ticketDetailModal
      :isShow="isShowModal"
      :ticket="selectedTicket"
      @closeModal="isShowModal = false"
    />
  </div>
</template>

<script>
import { useTicketStore } from '@/stores/modules/api/ticket-store.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import ticketDetailModal from './modal/ticket-detail-modal.vue'

export default {
  name: 'TicketMyView',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DropdownGeneric,
    BaseDataTable,
    ticketDetailModal
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
        status: null,
        type: null
      },
      isShowModal: false,
      selectedTicket: {}
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
        { value: 4, label: this.$t('view.ticket.status.closed') }
      ]
    },

    columns() {
      return [
        { field: 'ticketNo', header: this.$t('view.ticket.field.ticketNo'), minWidth: '100px' },
        { field: 'type', header: this.$t('view.ticket.field.type'), minWidth: '120px', sortable: false },
        { field: 'topicName', header: this.$t('view.ticket.field.topic'), minWidth: '150px' },
        { field: 'title', header: this.$t('view.ticket.field.title'), minWidth: '200px' },
        { field: 'status', header: this.$t('view.ticket.field.status'), minWidth: '120px', sortable: false },
        { field: 'createDate', header: this.$t('view.ticket.field.createDate'), minWidth: '120px', format: 'datetime' },
        { field: 'action', header: this.$t('common.field.action'), minWidth: '80px', sortable: false }
      ]
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const res = await this.ticketStore.fetchMyTickets({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        status: this.filter.status || undefined,
        type: this.filter.type || undefined
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
      this.filter = { status: null, type: null }
      this.resetPaging()
    },

    onViewDetail(ticket) {
      this.selectedTicket = ticket
      this.isShowModal = true
    },

    getStatusLabel(statusId, fallback) {
      const map = {
        1: this.$t('view.ticket.status.open'),
        2: this.$t('view.ticket.status.inProgress'),
        3: this.$t('view.ticket.status.resolved'),
        4: this.$t('view.ticket.status.closed')
      }
      return map[statusId] || fallback || '-'
    },

    getStatusClass(statusId) {
      const map = {
        1: 'status-open',
        2: 'status-in-progress',
        3: 'status-resolved',
        4: 'status-closed'
      }
      return map[statusId] || ''
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
