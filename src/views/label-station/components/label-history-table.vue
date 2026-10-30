<template>
  <div class="ls-history-wrapper">
    <SearchBarGeneric
      :title="$t('view.labelStation.historyTitle')"
      :description="$t('view.labelStation.historyDesc')"
      icon="bi-clock-history"
      @search="onSearch"
      @clear="onClear"
    >
      <template #fields>
        <div>
          <span class="title-text">{{ $t('view.labelStation.dateRange') }}</span>
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

        <div class="ls-history-checkbox-field">
          <CheckboxGeneric v-model="form.includeDeleted" :label="$t('view.labelStation.showDeletedLabel')" />
        </div>
      </template>

      <template #actions-right>
        <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
        <ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      </template>
    </SearchBarGeneric>

    <div class="responsive-table-wrapper ls-history-table-wrapper">
      <BaseDataTable
        :items="jobs"
        :totalRecords="total"
        :columns="columns"
        :perPage="take"
        dataKey="id"
        :emptyMessage="$t('view.labelStation.emptyHistoryMsg')"
        @page="handlePageChange"
        @sort="handleSortChange"
      >
        <template #statusTemplate="{ data }">
          <span v-if="data.isDeleted" class="ls-history-badge is-deleted">
            <i class="bi bi-trash"></i>
            {{ $t('view.labelStation.statusDeleted') }}
          </span>
          <span v-else class="ls-history-badge" :class="statusClass(data.status)" :title="data.errorMessage || ''">
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

import { useLabelPrintJobApiStore } from '@/stores/modules/api/print/label-print-job-store.js'
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
  name: 'LabelHistoryTable',

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
    const labelPrintJobStore = useLabelPrintJobApiStore()
    return { labelPrintJobStore }
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
        { field: 'referenceCode', header: this.$t('view.labelStation.colReference'), minWidth: '160px' },
        { field: 'copies', header: this.$t('view.labelStation.colCopies'), minWidth: '100px' },
        { field: 'createBy', header: this.$t('view.labelStation.colCreateBy'), minWidth: '120px' },
        {
          field: 'createDate',
          header: this.$t('common.field.createDate'),
          minWidth: '150px',
          format: 'datetime'
        },
        {
          field: 'printedDate',
          header: this.$t('view.labelStation.colPrintedDate'),
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
        { value: 'PENDING', label: this.$t('view.labelStation.statusPending') },
        { value: 'PRINTING', label: this.$t('view.labelStation.statusPrinting') },
        { value: 'PRINTED', label: this.$t('view.labelStation.statusPrinted') },
        { value: 'FAILED', label: this.$t('view.labelStation.statusFailed') }
      ]
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      const res = await this.labelPrintJobStore.fetchList({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        search: {
          dateFrom: this.form.dateFrom ? formatISOString(this.form.dateFrom) : null,
          dateTo: this.form.dateTo ? formatISOString(this.form.dateTo) : null,
          labelType: 'GEM',
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
        PENDING: this.$t('view.labelStation.statusPending'),
        PRINTING: this.$t('view.labelStation.statusPrinting'),
        PRINTED: this.$t('view.labelStation.statusPrinted'),
        FAILED: this.$t('view.labelStation.statusFailed')
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

.ls-history-checkbox-field {
  display: flex;
  align-items: flex-end;
  padding-bottom: var(--sp-sm);
}

.ls-history-table-wrapper {
  margin-top: var(--sp-lg);
}

.ls-history-badge {
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
