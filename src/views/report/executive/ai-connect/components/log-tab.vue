<template>
  <div class="log-tab">
    <SearchBarGeneric
      :title="$t('view.aiConnector.tabs.log')"
      :description="$t('view.aiConnector.log.searchDesc')"
      icon="bi-clock-history"
      @search="onSearch"
      @clear="onClear"
    >
      <template #fields>
        <div>
          <span class="title-text">{{ $t('view.aiConnector.log.filterAi') }}</span>
          <MultiSelectGeneric
            v-model="filter.tokenIds"
            :options="connectionOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.aiConnector.log.filterAiPlaceholder')"
            :showClear="true"
          />
        </div>
        <div>
          <span class="title-text">{{ $t('view.aiConnector.log.filterRange') }}</span>
          <DateRangeGeneric
            :startDate="filter.start"
            :endDate="filter.end"
            :startPlaceholder="$t('view.aiConnector.log.rangeFrom')"
            :endPlaceholder="$t('view.aiConnector.log.rangeTo')"
            :showButtonBar="false"
            @update:startDate="filter.start = $event"
            @update:endDate="filter.end = $event"
          />
        </div>
      </template>
      <template #actions-right>
        <ButtonGeneric variant="main" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
        <ButtonGeneric variant="dark" icon="bi-arrow-counterclockwise" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      </template>
    </SearchBarGeneric>

    <ActiveFilterChipsGeneric :chips="activeChips" @remove="onRemoveChip" @clear-all="onClear" />

    <SectionCardGeneric class="log-tab__table">
      <BaseDataTable
        :items="dataList"
        :columns="columns"
        :totalRecords="total"
        :perPage="take"
        :emptyMessage="emptyMessage"
        @page="handlePageChange"
        @sort="handleSortChange"
      >
        <template #createDateTemplate="{ data }">{{ formatDateTime(data.createDate) }}</template>

        <template #toolTitleThTemplate="{ data }">{{ data.toolTitleTh }}</template>

        <template #successTemplate="{ data }">
          <div v-if="resultOf(data) === 'success'" class="result result--success">
            <i class="bi bi-check-circle-fill"></i> {{ $t('view.aiConnector.log.resultSuccess') }}
          </div>
          <template v-else>
            <div class="result result--error">
              <i class="bi bi-x-circle-fill"></i> {{ $t('view.aiConnector.log.resultError') }}
            </div>
            <div class="result-reason">{{ data.errorMessageTh || $t('view.aiConnector.log.errorUnknown') }}</div>
          </template>
        </template>

        <template #rowCountTemplate="{ data }">
          <div>{{ data.rowCount }}</div>
          <div v-if="maskedLabel(data)" class="masked">
            {{ maskedLabel(data) }}
            <InfoTipGeneric :text="$t('view.aiConnector.log.maskedTip')" />
          </div>
        </template>

        <template #durationMsTemplate="{ data }">{{ $t('view.aiConnector.log.durationMs', { ms: data.durationMs }) }}</template>
      </BaseDataTable>
    </SectionCardGeneric>
  </div>
</template>

<script>
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { useAiConnectorStore } from '@/stores/modules/api/ai-connector/ai-connector-store.js'
import { formatDateTime, formatDate } from '@/services/utils/dayjs.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ActiveFilterChipsGeneric from '@/components/generic/ActiveFilterChipsGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import {
  buildAccessLogParams,
  buildConnectionOptions,
  buildDefaultLogRange,
  buildMaskedLabel,
  isLogFilterDefault,
  resolveLogResult
} from '../ai-connect-helpers.js'

const defaultFilter = () => ({ tokenIds: [], ...buildDefaultLogRange() })

export default {
  name: 'LogTab',

  components: {
    SearchBarGeneric,
    SectionCardGeneric,
    ButtonGeneric,
    InfoTipGeneric,
    ActiveFilterChipsGeneric,
    DateRangeGeneric,
    MultiSelectGeneric,
    BaseDataTable
  },

  mixins: [dataTablePaging],

  props: {
    connections: { type: Array, default: () => [] }
  },

  setup() {
    return { store: useAiConnectorStore() }
  },

  data() {
    return {
      filter: defaultFilter(),
      dataList: [],
      total: 0,
      searchedIsDefault: true
    }
  },

  computed: {
    connectionOptions() {
      return buildConnectionOptions(this.connections)
    },

    columns() {
      return [
        { field: 'createDate', header: this.$t('view.aiConnector.log.colTime'), minWidth: '160px', sortable: false },
        { field: 'connectionName', header: this.$t('view.aiConnector.log.colAi'), minWidth: '160px', sortable: false },
        { field: 'toolTitleTh', header: this.$t('view.aiConnector.log.colTopic'), minWidth: '200px', sortable: false },
        { field: 'success', header: this.$t('view.aiConnector.log.colResult'), minWidth: '200px', sortable: false },
        { field: 'rowCount', header: this.$t('view.aiConnector.log.colRows'), minWidth: '160px', align: 'right', sortable: false },
        { field: 'durationMs', header: this.$t('view.aiConnector.log.colDuration'), minWidth: '100px', align: 'right', sortable: false }
      ]
    },

    emptyMessage() {
      return this.searchedIsDefault ? this.$t('view.aiConnector.log.empty') : this.$t('view.aiConnector.log.emptyFiltered')
    },

    activeChips() {
      const chips = [
        {
          key: 'range',
          label: this.$t('view.aiConnector.log.filterRange'),
          value: `${formatDate(this.filter.start)} - ${formatDate(this.filter.end)}`
        }
      ]
      this.filter.tokenIds.forEach((id) => {
        const option = this.connectionOptions.find((item) => item.value === id)
        chips.push({ key: `ai-${id}`, label: this.$t('view.aiConnector.log.filterAi'), value: option?.label || String(id) })
      })
      return chips
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    formatDateTime,

    async fetchData() {
      this.searchedIsDefault = isLogFilterDefault({ start: this.filter.start, end: this.filter.end }, this.filter.tokenIds)
      const res = await this.store.searchAccessLog(
        buildAccessLogParams({
          skip: this.skip,
          take: this.take,
          range: { start: this.filter.start, end: this.filter.end },
          tokenIds: this.filter.tokenIds
        })
      )
      if (res) {
        this.dataList = res.data || []
        this.total = res.total || 0
      }
    },

    onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.filter = defaultFilter()
      this.resetPaging()
    },

    onRemoveChip(key) {
      if (key === 'range') {
        Object.assign(this.filter, buildDefaultLogRange())
      } else {
        const id = key.replace('ai-', '')
        this.filter.tokenIds = this.filter.tokenIds.filter((item) => String(item) !== id)
      }
      this.resetPaging()
    },

    resultOf: resolveLogResult,

    maskedLabel(row) {
      return buildMaskedLabel(row.maskedCount, (key, params) => this.$t(key, params))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-search-bar';
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.log-tab__table {
  margin-top: var(--sp-lg);
}

.result {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  font-weight: 600;

  &--success {
    color: var(--base-green);
  }

  &--error {
    color: var(--base-font-color);

    i {
      color: var(--base-red);
    }
  }
}

.result-reason,
.masked {
  font-size: var(--fs-base);
  color: var(--base-sub-color);
}
</style>
