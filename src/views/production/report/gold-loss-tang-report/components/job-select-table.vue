<template>
  <SectionCardGeneric
    :title="$t('view.production.goldLossTang.selectJobsTitle')"
    icon="bi-list-check"
    accent="main"
    headerStyle="legend"
  >
    <div class="job-table-header mb-2">
      <span class="count-badge-wrap">
        <span v-if="jobs.length > 0" class="count-badge">{{ selectedCount }}/{{ jobs.length }}</span>
      </span>
      <div v-if="jobs.length > 0" class="filter-row">
        <MultiSelectGeneric
          v-model="filterGoldTypes"
          :options="goldTypeOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('view.production.goldLossTang.filterGoldType')"
          :filter="true"
          :showClear="true"
          class="gold-filter-ms"
        />
        <CheckboxGeneric
          v-model="hideAlreadySlipped"
          :label="$t('view.production.goldLossTang.hideAlreadySlipped')"
          class="ml-2"
        />
      </div>
    </div>

    <div v-if="jobs.length === 0" class="empty-jobs-state">
      <i class="bi bi-inbox empty-jobs-icon"></i>
      <span class="empty-jobs-text">{{ $t('view.production.goldLossTang.emptyJobsHint') }}</span>
    </div>

    <BaseDataTable
      v-else
      :items="displayedJobs"
      :totalRecords="displayedJobs.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="320px"
      dataKey="_uid"
      :selectionMode="true"
      selectionType="multiple"
      :itemsSelection="selectedJobs"
      :disabledItems="disabledJobs"
      @update:itemsSelection="$emit('update:selectedJobs', $event)"
    >
      <template #woTemplate="{ data }">
        <span>{{ data.wo }}{{ data.woNumber ? '-' + data.woNumber : '' }}</span>
      </template>

      <template #jobDateTemplate="{ data }">
        <span>{{ formatDate(data.jobDate) }}</span>
      </template>

      <template #goldTemplate="{ data }">
        <span>{{ [data.gold, data.goldSize].filter(Boolean).join(' ') }}</span>
      </template>

      <template #goldWeightSendTemplate="{ data }">
        <span>{{ fmt2(data.goldWeightSend) }}</span>
      </template>

      <template #goldWeightCheckTemplate="{ data }">
        <span>{{ fmt2(data.goldWeightCheck) }}</span>
      </template>

      <template #statusTemplate="{ data }">
        <span v-if="data.goldLossTangSlipId" class="slipped-badge">
          {{ data.goldLossTangSlipDocumentNo || $t('view.production.goldLossTang.alreadySlipped') }}
        </span>
        <span v-else class="text-muted">-</span>
      </template>
    </BaseDataTable>
  </SectionCardGeneric>
</template>

<script>
import dayjs from 'dayjs'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'

export default {
  name: 'GoldLossTangJobSelectTable',

  components: {
    SectionCardGeneric,
    BaseDataTable,
    MultiSelectGeneric,
    CheckboxGeneric
  },

  props: {
    jobs: {
      type: Array,
      default: () => []
    },
    selectedJobs: {
      type: Array,
      default: () => []
    },
    editingSlipId: {
      type: Number,
      default: null
    }
  },

  emits: ['update:selectedJobs'],

  data() {
    return {
      filterGoldTypes: [],
      hideAlreadySlipped: false
    }
  },

  computed: {
    goldTypeOptions() {
      const seen = new Set()
      const result = []
      for (const j of this.jobs) {
        const label = [j.gold, j.goldSize].filter(Boolean).join(' ')
        if (label && !seen.has(label)) {
          seen.add(label)
          result.push({ label, value: label })
        }
      }
      return result
    },

    displayedJobs() {
      return this.jobs.filter((j) => {
        if (this.hideAlreadySlipped && j.goldLossTangSlipId) return false
        if (this.filterGoldTypes.length > 0) {
          const label = [j.gold, j.goldSize].filter(Boolean).join(' ')
          if (!this.filterGoldTypes.includes(label)) return false
        }
        return true
      })
    },

    disabledJobs() {
      return this.jobs.filter(
        (j) => j.goldLossTangSlipId && j.goldLossTangSlipId !== this.editingSlipId
      )
    },

    selectedCount() {
      return this.selectedJobs.length
    },

    columns() {
      return [
        { field: 'wo', header: this.$t('view.production.goldLossTang.colWo'), minWidth: '120px', sortable: false },
        { field: 'jobDate', header: this.$t('view.production.goldLossTang.colJobDate'), minWidth: '100px', sortable: false },
        { field: 'gold', header: this.$t('view.production.goldLossTang.colGold'), minWidth: '100px', sortable: false },
        { field: 'goldWeightSend', header: this.$t('view.production.goldLossTang.colGoldWeightSend'), minWidth: '100px', align: 'right', sortable: false },
        { field: 'goldWeightCheck', header: this.$t('view.production.goldLossTang.colGoldWeightCheck'), minWidth: '100px', align: 'right', sortable: false },
        { field: 'status', header: this.$t('view.production.goldLossTang.colStatus'), minWidth: '140px', sortable: false }
      ]
    }
  },

  methods: {
    formatDate(val) {
      if (!val) return ''
      return dayjs(val).format('DD/MM/YYYY')
    },

    fmt2(val) {
      if (val == null) return '0.00'
      return Number(val).toFixed(2)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
@import '@/assets/scss/custom-style/standard-form.scss';

.job-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.count-badge-wrap {
  display: flex;
  align-items: center;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.gold-filter-ms {
  min-width: 200px;
}

.count-badge {
  display: inline-block;
  background: var(--base-font-color);
  color: #ffffff;
  border-radius: var(--radius-sm);
  padding: 1px var(--sp-sm);
  font-size: var(--fs-sm);
  margin-left: var(--sp-xs);
  font-weight: 600;
}

.slipped-badge {
  display: inline-block;
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
  border: 1px solid var(--base-font-color);
  border-radius: var(--radius-sm);
  padding: 1px var(--sp-xs);
  font-size: var(--fs-sm);
  font-weight: 600;
  opacity: 0.8;
}

:deep(tr.p-datatable-row-odd),
:deep(tr.p-datatable-row-even) {
  &[data-slipped='true'] {
    opacity: 0.5;
  }
}

.empty-jobs-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-2xl) var(--sp-lg);
  gap: var(--sp-sm);
}

.empty-jobs-icon {
  font-size: 2.5rem;
  color: var(--base-green);
  opacity: 0.5;
}

.empty-jobs-text {
  color: var(--base-font-color);
  opacity: 0.6;
  font-size: var(--fs-base);
}
</style>
