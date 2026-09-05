<template>
  <div class="ps-history-wrapper">
    <SearchBarGeneric
      :title="$t('view.printStation.historyTitle')"
      :description="$t('view.printStation.historyDesc')"
      icon="bi-clock-history"
      @search="onSearch"
      @clear="onClear"
    >
      <template #fields>
        <div>
          <span class="title-text">{{ $t('view.printStation.dateRange') }}</span>
          <DateRangeGeneric
            :startDate="form.dateFrom"
            :endDate="form.dateTo"
            :startPlaceholder="$t('common.label.start')"
            :endPlaceholder="$t('common.label.end')"
            @update:startDate="form.dateFrom = $event"
            @update:endDate="form.dateTo = $event"
          />
        </div>

        <div>
          <span class="title-text">{{ $t('common.field.status') }}</span>
          <DropdownGeneric
            v-model="form.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            :ariaLabel="$t('common.field.status')"
            :placeholder="$t('common.label.all')"
            :showClear="true"
          />
        </div>

        <div class="ps-history-checkbox-field">
          <CheckboxGeneric v-model="form.includeDeleted" :label="$t('view.printStation.showDeletedLabel')" />
        </div>
      </template>

      <template #actions-right>
        <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
        <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      </template>
    </SearchBarGeneric>

    <div class="responsive-table-wrapper ps-history-table-wrapper">
      <BaseDataTable
        :items="jobs"
        :totalRecords="total"
        :columns="columns"
        :perPage="take"
        dataKey="id"
        :emptyMessage="$t('view.printStation.emptyHistoryMsg')"
        @page="handlePageChange"
        @sort="handleSortChange"
      >
        <template #statusTemplate="{ data }">
          <span v-if="data.isDeleted" class="ps-history-badge is-deleted">
            <i class="bi bi-trash"></i>
            {{ $t('view.printStation.statusDeleted') }}
          </span>
          <span v-else class="ps-history-badge" :class="statusClass(data.status)" :title="data.errorMessage || ''">
            <i :class="['bi', statusIcon(data.status)]"></i>
            {{ statusLabel(data.status) }}
          </span>
        </template>
      </BaseDataTable>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { usePrintJobApiStore } from '@/stores/modules/api/print/print-job-store.js'
import { formatISOString } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const STATUS_META = {
  PENDING: { icon: 'bi-hourglass-split', className: 'is-pending' },
  PRINTING: { icon: 'bi-arrow-repeat', className: 'is-printing' },
  PRINTED: { icon: 'bi-check-circle-fill', className: 'is-printed' },
  FAILED: { icon: 'bi-x-circle-fill', className: 'is-failed' }
}

const defaultForm = () => ({
  dateFrom: dayjs().startOf('day').toDate(),
  dateTo: dayjs().endOf('day').toDate(),
  status: null,
  includeDeleted: false
})

export default {
  name: 'PrintHistoryTable',

  components: {
    SearchBarGeneric,
    ButtonGeneric,
    DropdownGeneric,
    CheckboxGeneric,
    DateRangeGeneric,
    BaseDataTable
  },

  mixins: [dataTablePaging],

  setup() {
    const printJobStore = usePrintJobApiStore()
    return { printJobStore }
  },

  data() {
    return {
      form: defaultForm(),
      jobs: [],
      total: 0
    }
  },

  computed: {
    columns() {
      return [
        { field: 'invoiceNumber', header: this.$t('view.printStation.colInvoice'), minWidth: '160px' },
        { field: 'createBy', header: this.$t('view.printStation.colCreateBy'), minWidth: '120px' },
        {
          field: 'createDate',
          header: this.$t('common.field.createDate'),
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'printedDate',
          header: this.$t('view.printStation.colPrintedDate'),
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'status',
          header: this.$t('common.field.status'),
          minWidth: '130px',
          sortable: false
        }
      ]
    },

    statusOptions() {
      return [
        { value: 'PENDING', label: this.$t('view.printStation.statusPending') },
        { value: 'PRINTING', label: this.$t('view.printStation.statusPrinting') },
        { value: 'PRINTED', label: this.$t('view.printStation.statusPrinted') },
        { value: 'FAILED', label: this.$t('view.printStation.statusFailed') }
      ]
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const res = await this.printJobStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          dateFrom: this.form.dateFrom ? formatISOString(this.form.dateFrom) : null,
          dateTo: this.form.dateTo ? formatISOString(this.form.dateTo) : null,
          status: this.form.status || null,
          includeDeleted: this.form.includeDeleted || false
        }
      })
      if (res) {
        this.jobs = res.data || []
        this.total = res.total || 0
      }
    },

    onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.form = defaultForm()
      this.resetPaging()
    },

    statusLabel(status) {
      const map = {
        PENDING: this.$t('view.printStation.statusPending'),
        PRINTING: this.$t('view.printStation.statusPrinting'),
        PRINTED: this.$t('view.printStation.statusPrinted'),
        FAILED: this.$t('view.printStation.statusFailed')
      }
      return map[status] || status
    },

    statusIcon(status) {
      return STATUS_META[status]?.icon || 'bi-question-circle'
    },

    statusClass(status) {
      return STATUS_META[status]?.className || ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';

.ps-history-checkbox-field {
  display: flex;
  align-items: flex-end;
  padding-bottom: var(--sp-sm);
}

.ps-history-table-wrapper {
  margin-top: var(--sp-lg);
}

.ps-history-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;

  &.is-pending {
    background: var(--status-open-bg);
    color: var(--status-open);
  }

  &.is-printing {
    background: var(--status-progress-bg);
    color: var(--status-progress);
  }

  &.is-printed {
    background: var(--status-resolved-bg);
    color: var(--status-resolved);
  }

  &.is-failed {
    background: var(--status-cancelled-bg);
    color: var(--status-cancelled);
  }

  &.is-deleted {
    background: var(--status-closed-bg);
    color: var(--status-closed);
  }
}
</style>
