<template>
  <div class="app-container backdate-close">
    <SectionCardGeneric
      :title="$t('view.production.backdateClose.inputTitle')"
      icon="bi-list-check"
      accent="main"
      headerStyle="legend"
    >
      <p class="field-hint">{{ $t('view.production.backdateClose.inputHint') }}</p>
      <TextareaGeneric
        v-model="inputText"
        :rows="8"
        :placeholder="$t('view.production.backdateClose.inputPlaceholder')"
      />
      <div class="input-footer">
        <div class="input-counts">
          <span class="count-chip">
            {{ $t('view.production.backdateClose.parsedCount', { count: parsed.jobs.length }) }}
          </span>
          <span v-if="parsed.duplicateCount > 0" class="field-hint">
            {{
              $t('view.production.backdateClose.duplicateRemoved', {
                count: parsed.duplicateCount
              })
            }}
          </span>
        </div>
        <ButtonGeneric
          variant="green"
          icon="bi-search"
          :label="$t('view.production.backdateClose.btnPreview')"
          :disabled="parsed.jobs.length === 0"
          @click="onPreview"
        />
      </div>
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('view.production.backdateClose.resultTitle')"
      icon="bi-clipboard-check"
      accent="green"
      headerStyle="legend"
    >
      <div v-if="items.length > 0" class="result-toolbar">
        <div class="summary-chips">
          <span class="chip chip-ok">
            {{ $t('view.production.backdateClose.summaryClosable', { count: summary.closable }) }}
          </span>
          <span v-if="summary.skipped > 0" class="chip chip-skip">
            {{ $t('view.production.backdateClose.summarySkipped', { count: summary.skipped }) }}
          </span>
          <span v-for="reason in skippedReasons" :key="reason.code" class="chip chip-muted">
            {{ reasonLabel(reason.code) }} {{ reason.count }}
          </span>
        </div>
        <ToggleGroupGeneric v-model="filterMode" :options="filterOptions" />
      </div>

      <BaseDataTable
        :items="visibleItems"
        :columns="columns"
        :paginator="false"
        :showActions="false"
        :rowClass="rowClass"
        dataKey="input"
        scrollHeight="420px"
        :emptyMessage="$t('view.production.backdateClose.emptyResult')"
      >
        <template #jobTemplate="{ data }">{{ jobLabel(data) }}</template>
        <template #lastMoveDateTemplate="{ data }">{{ formatLastMove(data.lastMoveDate) }}</template>
        <template #resultTemplate="{ data }">
          <span v-if="data.canClose" class="chip chip-ok">
            {{ $t('view.production.backdateClose.chipClosable') }}
          </span>
          <span v-else class="chip chip-skip">{{ reasonLabel(data.reasonCode) }}</span>
        </template>
      </BaseDataTable>
    </SectionCardGeneric>

    <SectionCardGeneric
      :title="$t('view.production.backdateClose.closeTitle')"
      icon="bi-check2-circle"
      accent="main"
      headerStyle="legend"
    >
      <FormFieldGeneric :label="$t('view.production.backdateClose.remark')" :required="true">
        <TextareaGeneric
          v-model="remark"
          :rows="3"
          :placeholder="$t('view.production.backdateClose.remarkPlaceholder')"
        />
      </FormFieldGeneric>

      <ul class="close-notes">
        <li>{{ $t('view.production.backdateClose.noteStatus') }}</li>
        <li>{{ $t('view.production.backdateClose.noteNoStock') }}</li>
        <li>{{ $t('view.production.backdateClose.noteStats') }}</li>
        <li>{{ $t('view.production.backdateClose.noteIrreversible') }}</li>
      </ul>

      <ButtonGeneric
        variant="main"
        icon="bi-check2-circle"
        :label="$t('view.production.backdateClose.btnClose', { count: summary.closable })"
        :disabled="!canSubmit"
        @click="onClose"
      />
    </SectionCardGeneric>

    <SectionCardGeneric
      v-if="closeResult"
      :title="$t('view.production.backdateClose.doneTitle')"
      icon="bi-flag"
      accent="green"
      headerStyle="legend"
    >
      <p class="done-line">
        {{ $t('view.production.backdateClose.doneClosed', { count: closeResult.closed.length }) }}
      </p>
      <p v-if="closeResult.transferNumber" class="done-line">
        {{
          $t('view.production.backdateClose.doneTransfer', {
            transferNumber: closeResult.transferNumber
          })
        }}
      </p>
      <template v-if="closeResult.errors.length > 0">
        <p class="done-line done-error">
          {{ $t('view.production.backdateClose.doneErrors', { count: closeResult.errors.length }) }}
        </p>
        <ul class="close-notes">
          <li v-for="err in closeResult.errors" :key="err.id">
            {{
              $t('view.production.backdateClose.doneErrorLine', {
                job: errorJobLabel(err.id),
                reason: reasonLabel(err.reasonCode)
              })
            }}
          </li>
        </ul>
      </template>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { mapActions } from 'pinia'
import { usePlanBackdateCloseApiStore } from '@/stores/modules/api/production/plan-backdate-close-api.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { formatDate } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import {
  parseJobNumbers,
  summarizePreview,
  filterPreview,
  buildClosePayload,
  formatJobNumber,
  REASON_CODES
} from './backdate-close-helpers.js'

export default {
  name: 'PlanBackdateClose',

  components: {
    SectionCardGeneric,
    FormFieldGeneric,
    TextareaGeneric,
    ButtonGeneric,
    ToggleGroupGeneric,
    BaseDataTable
  },

  data() {
    return {
      inputText: '',
      remark: '',
      items: [],
      filterMode: 'all',
      closeResult: null
    }
  },

  computed: {
    parsed() {
      return parseJobNumbers(this.inputText)
    },

    summary() {
      return summarizePreview(this.items)
    },

    skippedReasons() {
      return Object.entries(this.summary.byReason).map(([code, count]) => ({ code, count }))
    },

    visibleItems() {
      return filterPreview(this.items, this.filterMode)
    },

    canSubmit() {
      return this.summary.closable > 0 && this.remark.trim().length > 0
    },

    filterOptions() {
      return [
        { value: 'all', label: this.$t('view.production.backdateClose.filterAll') },
        { value: 'closable', label: this.$t('view.production.backdateClose.filterClosable') },
        { value: 'skipped', label: this.$t('view.production.backdateClose.filterSkipped') }
      ]
    },

    columns() {
      const t = (key) => this.$t(`view.production.backdateClose.${key}`)
      return [
        { field: 'input', header: t('colInput'), minWidth: '120px', sortable: false },
        { field: 'job', header: t('colJob'), minWidth: '130px', sortable: false },
        { field: 'mold', header: t('colMold'), minWidth: '110px', sortable: false },
        { field: 'productNumber', header: t('colProduct'), minWidth: '140px', sortable: false },
        { field: 'statusName', header: t('colStatus'), minWidth: '140px', sortable: false },
        { field: 'lastMoveDate', header: t('colLastMove'), minWidth: '110px', sortable: false },
        { field: 'result', header: t('colResult'), minWidth: '150px', sortable: false }
      ]
    }
  },

  methods: {
    ...mapActions(usePlanBackdateCloseApiStore, ['preview', 'close']),

    jobLabel(item) {
      return item.found ? formatJobNumber(item) : '-'
    },

    formatLastMove(date) {
      return date ? formatDate(date) : '-'
    },

    reasonLabel(code) {
      const key = REASON_CODES.includes(code) ? code : 'UNKNOWN'
      return this.$t(`view.production.backdateClose.reason.${key}`)
    },

    errorJobLabel(id) {
      const item = this.items.find((row) => row.id === id)
      return item ? formatJobNumber(item) : String(id)
    },

    rowClass(data) {
      return data.canClose ? '' : 'row-muted'
    },

    async onPreview() {
      this.items = await this.preview(this.parsed.jobs)
      this.filterMode = 'all'
      this.closeResult = null
    },

    onClose() {
      confirmThenSubmit(
        this.$t('view.production.backdateClose.confirmMessage', { count: this.summary.closable }),
        this.$t('view.production.backdateClose.confirmTitle'),
        () => this.submitClose()
      )
    },

    async submitClose() {
      const res = await this.close(buildClosePayload(this.items, this.remark))
      if (!res) return
      this.closeResult = {
        closed: res.closed || [],
        errors: res.errors || [],
        transferNumber: res.transferNumber || ''
      }
      this.items = await this.preview(this.parsed.jobs)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.backdate-close {
  display: flex;
  flex-direction: column;
  gap: var(--sp-lg);
}

.field-hint {
  display: block;
  margin-bottom: var(--sp-sm);
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-md);
  margin-top: var(--sp-md);
}

.input-counts {
  display: flex;
  align-items: center;
  gap: var(--sp-md);

  .field-hint {
    margin-bottom: 0;
  }
}

.count-chip {
  font-weight: 700;
  color: var(--base-font-color);
}

.result-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-md);
  margin-bottom: var(--sp-md);
}

.summary-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-sm);
}

.chip {
  display: inline-block;
  padding: var(--sp-xs) var(--sp-md);
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  font-weight: 600;
  line-height: var(--lh-sm);
}

.chip-ok {
  color: var(--status-resolved);
  background: var(--status-resolved-bg);
  border-color: var(--status-resolved);
}

.chip-skip {
  color: var(--status-cancelled);
  background: var(--status-cancelled-bg);
  border-color: var(--status-cancelled);
}

.chip-muted {
  color: var(--status-closed);
  background: var(--status-closed-bg);
  border-color: var(--color-border);
}

:deep(tr.row-muted > td) {
  opacity: 0.55;
}

.close-notes {
  margin: var(--sp-md) 0;
  padding-left: var(--sp-2xl);
  color: var(--base-sub-color);
  font-size: var(--fs-base);
  line-height: var(--lh-md);
}

.done-line {
  margin: 0 0 var(--sp-sm);
  color: var(--base-font-color);
  font-weight: 600;
}

.done-error {
  color: var(--status-cancelled);
}
</style>
