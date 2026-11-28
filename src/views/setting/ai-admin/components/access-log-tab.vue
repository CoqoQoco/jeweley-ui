<template>
  <div class="log-tab">
    <SearchBarGeneric
      :title="$t('view.aiAdmin.log.title')"
      :description="$t('view.aiAdmin.log.searchDesc')"
      icon="bi-clock-history"
      @search="onSearch"
      @clear="onClear"
    >
      <template #fields>
        <div>
          <span class="title-text">{{ $t('view.aiAdmin.log.filterUser') }}</span>
          <MultiSelectGeneric
            v-model="filter.userIds"
            :options="userOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.aiAdmin.log.filterUserPlaceholder')"
            :showClear="true"
          />
        </div>
        <div>
          <span class="title-text">{{ $t('view.aiAdmin.log.filterTool') }}</span>
          <MultiSelectGeneric
            v-model="filter.tools"
            :options="toolOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('view.aiAdmin.log.filterToolPlaceholder')"
            :showClear="true"
          />
        </div>
        <div>
          <span class="title-text">{{ $t('view.aiAdmin.log.filterRange') }}</span>
          <DateRangeGeneric
            :startDate="filter.start"
            :endDate="filter.end"
            :startPlaceholder="$t('view.aiAdmin.log.rangeFrom')"
            :endPlaceholder="$t('view.aiAdmin.log.rangeTo')"
            :showButtonBar="false"
            @update:startDate="filter.start = $event"
            @update:endDate="filter.end = $event"
          />
        </div>
      </template>
      <template #actions-right>
        <ButtonGeneric variant="green" icon="bi-search" type="submit" :label="$t('common.btn.search')" />
        <ButtonGeneric variant="dark" icon="bi-arrow-counterclockwise" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
      </template>
    </SearchBarGeneric>

    <SectionCardGeneric class="log-tab__table" :title="$t('view.aiAdmin.log.title')" icon="bi-clock-history" headerStyle="dashboard">
      <div v-if="error" class="state-text state-text--error" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i> {{ $t('view.aiAdmin.loadFailed') }}
      </div>
      <BaseDataTable
        v-else
        :items="dataList"
        :columns="columns"
        :totalRecords="total"
        :perPage="take"
        :emptyMessage="emptyMessage"
        @page="handlePageChange"
        @sort="handleSortChange"
      >
        <template #successTemplate="{ data }">
          <div v-if="resultOf(data) === 'success'" class="result result--success">
            <i class="bi bi-check-circle-fill" aria-hidden="true"></i> {{ $t('view.aiAdmin.log.resultSuccess') }}
          </div>
          <template v-else>
            <div class="result result--error">
              <i class="bi bi-x-circle-fill" aria-hidden="true"></i> {{ $t('view.aiAdmin.log.resultError') }}
            </div>
            <div class="muted" :title="data.errorCode || null">{{ errorText(data) }}</div>
          </template>
        </template>

        <template #createDateTemplate="{ data }">{{ formatDateTime(data.createDate) }}</template>

        <template #toolTitleThTemplate="{ data }">{{ data.toolTitleTh || data.tool }}</template>

        <template #durationMsTemplate="{ data }">{{ data.durationMs }}</template>

        <template #scopesTemplate="{ data }">
          <span class="chips">
            <span v-for="code in chipsOf(data).visible" :key="code" class="chip">{{ scopeName(code) }}</span>
            <span v-if="chipsOf(data).hidden.length" class="chip chip--more" :title="hiddenTitle(data)">
              {{ $t('view.aiAdmin.log.moreScopes', { count: chipsOf(data).hidden.length }) }}
            </span>
          </span>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>
  </div>
</template>

<script>
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { useAiAdminStore } from '@/stores/modules/api/ai-admin/ai-admin-store.js'
import { formatDateTime } from '@/services/utils/dayjs.js'

import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

import {
  GUIDE_TOOL_VALUES,
  buildAccessLogParams,
  formatLogError,
  isLogFilterEmpty,
  resolveLogResult,
  scopeKey,
  splitScopeChips
} from '../ai-admin-helpers.js'

const defaultFilter = () => ({ userIds: [], tools: [], start: null, end: null })

export default {
  name: 'AiAdminAccessLogTab',

  components: { SearchBarGeneric, SectionCardGeneric, ButtonGeneric, DateRangeGeneric, MultiSelectGeneric, BaseDataTable },

  mixins: [dataTablePaging],

  props: {
    users: { type: Array, default: () => [] },
    refreshKey: { type: Number, default: 0 }
  },

  setup() {
    return { store: useAiAdminStore() }
  },

  data() {
    return {
      filter: defaultFilter(),
      dataList: [],
      total: 0,
      error: false,
      searchedEmpty: true
    }
  },

  computed: {
    userOptions() {
      return this.users.map((user) => ({ value: user.userId, label: `${user.displayName} (${user.username})` }))
    },

    toolOptions() {
      return GUIDE_TOOL_VALUES.map((tool) => ({ value: tool, label: this.$t(`view.aiAdmin.tools.${tool}`) }))
    },

    columns() {
      return [
        { field: 'success', header: this.$t('view.aiAdmin.log.colResult'), minWidth: '170px', sortable: false },
        { field: 'createDate', header: this.$t('view.aiAdmin.log.colTime'), minWidth: '150px' },
        { field: 'username', header: this.$t('view.aiAdmin.log.colUser'), minWidth: '110px', sortable: false },
        { field: 'toolTitleTh', header: this.$t('view.aiAdmin.log.colTool'), minWidth: '170px', sortable: false },
        { field: 'clientName', header: this.$t('view.aiAdmin.log.colApp'), minWidth: '110px', sortable: false },
        { field: 'rowCount', header: this.$t('view.aiAdmin.log.colRows'), minWidth: '60px', align: 'right', sortable: false },
        { field: 'maskedCount', header: this.$t('view.aiAdmin.log.colMasked'), minWidth: '70px', align: 'right', sortable: false },
        { field: 'durationMs', header: this.$t('view.aiAdmin.log.colDuration'), minWidth: '60px', align: 'right', sortable: false },
        { field: 'scopes', header: this.$t('view.aiAdmin.log.colScopes'), minWidth: '190px', sortable: false }
      ]
    },

    emptyMessage() {
      return this.searchedEmpty ? this.$t('view.aiAdmin.log.empty') : this.$t('view.aiAdmin.log.emptyFiltered')
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

    resultOf: resolveLogResult,

    // try/catch เฉพาะหน้านี้: API ตอบ error เป็นข้อความล้วน (store ปิด popup กลาง) ต้องแสดง error ในแท็บเอง
    async fetchData() {
      this.searchedEmpty = isLogFilterEmpty(this.filter)
      this.error = false
      try {
        const res = await this.store.searchAccessLog(
          buildAccessLogParams({
            skip: this.skip,
            take: this.take,
            sort: this.sort,
            userIds: this.filter.userIds,
            tools: this.filter.tools,
            start: this.filter.start,
            end: this.filter.end
          })
        )
        this.dataList = res?.data || []
        this.total = res?.total || 0
      } catch {
        this.error = true
        this.dataList = []
        this.total = 0
      }
    },

    onSearch() {
      this.resetPaging()
    },

    onClear() {
      this.filter = defaultFilter()
      this.resetPaging()
    },

    errorText(row) {
      return formatLogError(row, this.$t('view.aiAdmin.log.errorUnknown'))
    },

    chipsOf(row) {
      return splitScopeChips(row.scopes)
    },

    scopeName(code) {
      const key = scopeKey(code)
      const text = this.$t(key)
      return text && text !== key ? text : code
    },

    hiddenTitle(row) {
      return this.chipsOf(row).hidden.map((code) => this.scopeName(code)).join(', ')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.log-tab__table {
  margin-top: var(--sp-lg);
}

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

.result {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  font-weight: 600;

  &--success i {
    color: var(--base-green);
  }

  &--error i {
    color: var(--base-red);
  }
}

.muted {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
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
</style>
