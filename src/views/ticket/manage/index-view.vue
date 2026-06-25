<template>
  <div class="app-container">
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
        </template>
      </BaseDataTable>
    </div>
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

export default {
  name: 'TicketManageIndexView',

  components: {
    SearchBarGeneric,
    InputTextGeneric,
    ButtonGeneric,
    MultiSelectGeneric,
    BaseDataTable
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
        { value: 4, label: this.$t('view.ticket.status.closed') }
      ]
    },

    columns() {
      return [
        { field: 'action', header: this.$t('common.field.action'), width: '90px', align: 'center', sortable: false },
        { field: 'ticketNo', header: this.$t('view.ticket.field.ticketNo'), minWidth: '100px' },
        { field: 'type', header: this.$t('view.ticket.field.type'), minWidth: '120px', sortable: false },
        { field: 'topicName', header: this.$t('view.ticket.field.topic'), minWidth: '150px' },
        { field: 'title', header: this.$t('view.ticket.field.title'), minWidth: '200px' },
        { field: 'createBy', header: this.$t('view.ticket.field.createBy'), minWidth: '120px' },
        { field: 'status', header: this.$t('view.ticket.field.status'), minWidth: '120px', sortable: false },
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
