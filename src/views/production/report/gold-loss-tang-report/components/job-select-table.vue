<template>
  <SectionCardGeneric
    :title="$t('view.production.goldLossTang.selectJobsTitle')"
    icon="bi-list-check"
    accent="main"
    headerStyle="legend"
  >
    <div class="job-table-header mb-2">
      <span class="count-badge-wrap">
        <span v-if="jobs.length > 0" class="count-badge">{{ selectedCount }}/{{ displayedJobs.length }}</span>
      </span>
      <div class="header-right-group">
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
          <span v-if="hiddenSlippedCount > 0" class="hidden-count-text">
            {{ $t('view.production.goldLossTang.hiddenSlippedCount', { count: hiddenSlippedCount }) }}
          </span>
        </div>
        <ButtonGeneric
          variant="main"
          icon="bi-plus-circle"
          :label="$t('view.production.goldLossTang.addManualJob')"
          @click="openAddManualJob"
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
      :rowClass="rowClass"
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
        <div v-if="data._manual" class="manual-actions">
          <span class="manual-badge">
            <i class="bi bi-pencil-square"></i>
            {{ $t('view.production.goldLossTang.manualJobBadge') }}
          </span>
          <ButtonGeneric
            variant="outline"
            icon="bi-pencil"
            class="manual-icon-btn"
            @click="openEditManualJob(data)"
          />
          <ButtonGeneric
            variant="red"
            icon="bi-trash"
            class="manual-icon-btn"
            @click="onManualJobDelete(data)"
          />
        </div>
        <span
          v-else-if="data.goldLossTangSlipId"
          class="slipped-badge"
          :title="$t('view.production.goldLossTang.lockedTooltip', { doc: data.goldLossTangSlipDocumentNo || '-' })"
        >
          <i class="bi bi-lock-fill"></i>
          {{ data.goldLossTangSlipDocumentNo || $t('view.production.goldLossTang.alreadySlipped') }}
        </span>
        <span v-else class="text-muted">-</span>
      </template>
    </BaseDataTable>

    <ManualJobModal
      :isShow="isShowManualModal"
      :editingRow="editingManualRow"
      @closeModal="isShowManualModal = false"
      @save="onManualJobSave"
    />
  </SectionCardGeneric>
</template>

<script>
import dayjs from 'dayjs'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import ManualJobModal from '../modal/manual-job-modal.vue'

export default {
  name: 'GoldLossTangJobSelectTable',

  components: {
    SectionCardGeneric,
    ButtonGeneric,
    BaseDataTable,
    MultiSelectGeneric,
    CheckboxGeneric,
    ManualJobModal
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

  emits: ['update:selectedJobs', 'add-manual-job', 'update-manual-job', 'remove-manual-job'],

  data() {
    return {
      filterGoldTypes: [],
      hideAlreadySlipped: true,
      isShowManualModal: false,
      editingManualRow: null
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
        if (j._manual) return true
        if (this.hideAlreadySlipped && j.goldLossTangSlipId && j.goldLossTangSlipId !== this.editingSlipId) return false
        if (this.filterGoldTypes.length > 0) {
          const label = [j.gold, j.goldSize].filter(Boolean).join(' ')
          if (!this.filterGoldTypes.includes(label)) return false
        }
        return true
      })
    },

    disabledJobs() {
      return this.jobs.filter(
        (j) => !j._manual && j.goldLossTangSlipId && j.goldLossTangSlipId !== this.editingSlipId
      )
    },

    selectedCount() {
      return this.selectedJobs.length
    },

    hiddenSlippedCount() {
      if (!this.hideAlreadySlipped) return 0
      return this.jobs.filter((j) => {
        if (!(j.goldLossTangSlipId && j.goldLossTangSlipId !== this.editingSlipId)) return false
        if (this.filterGoldTypes.length > 0) {
          const label = [j.gold, j.goldSize].filter(Boolean).join(' ')
          if (!this.filterGoldTypes.includes(label)) return false
        }
        return true
      }).length
    },

    columns() {
      return [
        { field: 'wo', header: this.$t('view.production.goldLossTang.colWo'), minWidth: '120px', sortable: false },
        { field: 'jobDate', header: this.$t('view.production.goldLossTang.colJobDate'), minWidth: '100px', sortable: false },
        { field: 'gold', header: this.$t('view.production.goldLossTang.colGold'), minWidth: '100px', sortable: false },
        { field: 'goldWeightSend', header: this.$t('view.production.goldLossTang.colGoldWeightSend'), minWidth: '100px', align: 'right', sortable: false },
        { field: 'goldWeightCheck', header: this.$t('view.production.goldLossTang.colGoldWeightCheck'), minWidth: '100px', align: 'right', sortable: false },
        { field: 'status', header: this.$t('view.production.goldLossTang.colStatus'), minWidth: '190px', sortable: false }
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
    },

    rowClass(data) {
      return data.goldLossTangSlipId && data.goldLossTangSlipId !== this.editingSlipId
        ? 'row-slipped'
        : null
    },

    openAddManualJob() {
      this.editingManualRow = null
      this.isShowManualModal = true
    },

    openEditManualJob(row) {
      this.editingManualRow = row
      this.isShowManualModal = true
    },

    onManualJobSave(formData) {
      if (this.editingManualRow) {
        this.$emit('update-manual-job', { ...formData, _uid: this.editingManualRow._uid })
      } else {
        this.$emit('add-manual-job', formData)
      }
      this.isShowManualModal = false
      this.editingManualRow = null
    },

    onManualJobDelete(row) {
      const label = `${row.wo || ''}${row.woNumber ? '-' + row.woNumber : ''}`
      confirmThenSubmit(
        label,
        this.$t('view.production.goldLossTang.manualJobDeleteConfirm'),
        () => {
          this.$emit('remove-manual-job', row._uid)
        }
      )
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

.header-right-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
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
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  background: var(--color-highlight-bg);
  color: var(--base-font-color);
  border: 1px solid var(--base-font-color);
  border-radius: var(--radius-sm);
  padding: 1px var(--sp-xs);
  font-size: var(--fs-sm);
  font-weight: 600;
  opacity: 0.8;
}

.hidden-count-text {
  color: var(--base-font-color);
  opacity: 0.7;
  font-size: var(--fs-sm);
}

.manual-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-xs);
}

.manual-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  background: var(--color-highlight-bg);
  color: var(--base-green);
  border: 1px solid var(--base-green);
  border-radius: var(--radius-sm);
  padding: 1px var(--sp-xs);
  font-size: var(--fs-sm);
  font-weight: 600;
}

.manual-icon-btn {
  padding: 0.15rem 0.4rem !important;
}

:deep(tr.row-slipped) {
  opacity: 0.55;
  cursor: not-allowed;
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
