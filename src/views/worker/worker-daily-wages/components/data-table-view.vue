<template>
  <div class="mt-2">
    <div class="gold-type-filter-bar">
      <span class="title-text filter-label">{{ $t('view.worker.workerDailyWages.filterGoldTypeLabel') }}</span>
      <MultiSelectGeneric
        v-model="selectedGoldTypes"
        :options="goldTypeOptions"
        optionLabel="label"
        optionValue="value"
        :filter="true"
        :showClear="true"
        :placeholder="$t('view.worker.workerDailyWages.filterGoldTypePlaceholder')"
      />
    </div>
    <BaseDataTable
      :items="filteredItems"
      :totalRecords="filteredItems.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="calc(100vh - 360px)"
    >
      <template #woTextTemplate="{ data }">
        <span>{{ data.wo }}{{ data.woNumber ? ' - ' + data.woNumber : '' }}</span>
      </template>

      <template #statusNameTemplate="{ data }">
        <template v-if="data.isGoldLoss">
          <span class="badge-gold-loss">{{ $t('view.worker.workerDailyWages.badgeGoldLoss') }}</span>
          <span v-if="data.workerGoldLossSlipId" class="badge-slipped ml-1">{{ $t('view.worker.workerDailyWages.slipLabel', { docNo: data.workerGoldLossSlipDocumentNo }) }}</span>
        </template>
        <span v-else>{{ data.statusName }}</span>
      </template>

      <template #descriptionTemplate="{ data }">
        <span>{{ [data.gold, data.goldSize].filter((v) => v).join(' - ') }}</span>
      </template>

      <template #weightLossActualTemplate="{ data }">
        <span
          v-if="data.weightLossActual > 0"
          class="loss-positive"
        >{{ formatLoss(data.weightLossActual) }}</span>
        <span
          v-else-if="data.weightLossActual < 0"
          class="loss-negative"
        >{{ formatLoss(data.weightLossActual) }}</span>
        <span v-else>{{ formatLoss(data.weightLossActual) }}</span>
      </template>

      <template #footerGroup>
        <!-- eslint-disable-next-line no-restricted-imports -->
        <ColumnGroup type="footer">
          <Row v-if="wageTypeFilter === 'wages'">
            <Column :colspan="9" footerStyle="text-align: left">
              <template #footer>{{ $t('view.worker.workerDailyWages.footerTotal', { count: filteredItems.length }) }}</template>
            </Column>
            <Column footerStyle="text-align: right">
              <template #footer>{{ totalGoldQtyCheck }}</template>
            </Column>
            <Column :colspan="2">
              <template #footer></template>
            </Column>
            <Column footerStyle="text-align: right">
              <template #footer>{{ formatDecimal(totalWages) }}</template>
            </Column>
          </Row>
          <Row v-else>
            <Column :colspan="9" footerStyle="text-align: left">
              <template #footer>{{ $t('view.worker.workerDailyWages.footerTotal', { count: filteredItems.length }) }}</template>
            </Column>
            <Column footerStyle="text-align: right">
              <template #footer>{{ totalGoldQtyCheck }}</template>
            </Column>
            <Column :colspan="2">
              <template #footer></template>
            </Column>
            <Column :colspan="2">
              <template #footer></template>
            </Column>
            <Column footerStyle="text-align: right">
              <template #footer>
                <span
                  v-if="totalWeightLoss > 0"
                  class="loss-positive"
                >{{ formatLoss(totalWeightLoss) }}</span>
                <span
                  v-else-if="totalWeightLoss < 0"
                  class="loss-negative"
                >{{ formatLoss(totalWeightLoss) }}</span>
                <span v-else>{{ formatLoss(totalWeightLoss) }}</span>
              </template>
            </Column>
            <Column>
              <template #footer></template>
            </Column>
            <Column footerStyle="text-align: right">
              <template #footer>{{ formatDecimal(totalWages) }}</template>
            </Column>
          </Row>
        </ColumnGroup>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
// eslint-disable-next-line no-restricted-imports
import ColumnGroup from 'primevue/columngroup'
// eslint-disable-next-line no-restricted-imports
import Row from 'primevue/row'
// eslint-disable-next-line no-restricted-imports
import Column from 'primevue/column'
import { calculateGoldLossMetrics } from '@/services/utils/gold-loss-calc.js'

// Local components
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'

export default {
  name: 'WorkerDailyWagesDataTableView',

  components: {
    BaseDataTable,
    ColumnGroup,
    Row,
    Column,
    MultiSelectGeneric
  },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    wageTypeFilter: {
      type: String,
      default: 'wages'
    }
  },

  data() {
    return {
      selectedGoldTypes: []
    }
  },

  watch: {
    wageTypeFilter() {
      this.selectedGoldTypes = []
    },
    items() {
      this.selectedGoldTypes = []
    }
  },

  computed: {
    baseColumns() {
      return [
        { field: 'woText', header: this.$t('view.worker.workerDailyWages.colWoText'), minWidth: '130px' },
        { field: 'statusActiveName', header: this.$t('view.worker.workerDailyWages.colStatusActive'), minWidth: '120px', align: 'center' },
        { field: 'jobDate', header: this.$t('view.worker.workerDailyWages.colJobDate'), minWidth: '110px', format: 'date' },
        { field: 'productNumber', header: this.$t('view.worker.workerDailyWages.colProductNumber'), minWidth: '120px' },
        { field: 'statusName', header: this.$t('view.worker.workerDailyWages.colStatusName'), minWidth: '140px', align: 'center' },
        { field: 'statusDescription', header: this.$t('view.worker.workerDailyWages.colStatusDescription'), minWidth: '120px' },
        { field: 'description', header: this.$t('view.worker.workerDailyWages.colDescription'), minWidth: '160px' },
        { field: 'goldQtySend', header: this.$t('view.worker.workerDailyWages.colGoldQtySend'), minWidth: '90px', align: 'right', format: 'number' },
        { field: 'goldWeightSend', header: this.$t('view.worker.workerDailyWages.colGoldWeightSend'), minWidth: '100px', align: 'right', format: 'decimal2' },
        { field: 'goldQtyCheck', header: this.$t('view.worker.workerDailyWages.colGoldQtyCheck'), minWidth: '90px', align: 'right', format: 'number' },
        { field: 'goldWeightCheck', header: this.$t('view.worker.workerDailyWages.colGoldWeightCheck'), minWidth: '100px', align: 'right', format: 'decimal2' },
        { field: 'wages', header: this.$t('view.worker.workerDailyWages.colWages'), minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'totalWages', header: this.$t('view.worker.workerDailyWages.colTotalWages'), minWidth: '110px', align: 'right', format: 'decimal2' }
      ]
    },
    goldLossExtraColumns() {
      return [
        { field: 'lossPercent', header: this.$t('view.worker.workerDailyWages.colLossPercent'), minWidth: '90px', align: 'right', format: 'decimal2' },
        { field: 'weightLossAllowed', header: this.$t('view.worker.workerDailyWages.colWeightLossAllowed'), minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'weightLossActual', header: this.$t('view.worker.workerDailyWages.colWeightLossActual'), minWidth: '110px', align: 'right' },
        { field: 'goldLossPrice', header: this.$t('view.worker.workerDailyWages.colGoldLossPrice'), minWidth: '110px', align: 'right', format: 'decimal2' }
      ]
    },
    columns() {
      if (this.wageTypeFilter === 'goldLoss') {
        const cols = [...this.baseColumns]
        cols.splice(cols.length - 1, 0, ...this.goldLossExtraColumns)
        return cols
      }
      return this.baseColumns
    },

    goldTypeOptions() {
      const items = this.items || []
      let modeFiltered
      if (this.wageTypeFilter === 'goldLoss') {
        modeFiltered = items.filter((r) => r.isGoldLoss)
      } else {
        modeFiltered = items.filter((r) => !r.isGoldLoss)
      }
      const seen = new Set()
      modeFiltered.forEach((r) => {
        const combined = [r.gold, r.goldSize].filter(Boolean).join(' - ')
        if (combined) seen.add(combined)
      })
      return Array.from(seen).map((v) => ({ label: v, value: v }))
    },

    filteredItems() {
      const items = this.items || []
      let filtered
      if (this.wageTypeFilter === 'goldLoss') {
        filtered = items.filter((r) => r.isGoldLoss)
      } else {
        filtered = items.filter((r) => !r.isGoldLoss)
      }

      if (this.selectedGoldTypes.length > 0) {
        filtered = filtered.filter((r) => {
          const combined = [r.gold, r.goldSize].filter(Boolean).join(' - ')
          return this.selectedGoldTypes.includes(combined)
        })
      }

      return filtered.map((row) => {
        if (!row.isGoldLoss) return row
        const m = calculateGoldLossMetrics(row.goldWeightSend, row.goldWeightCheck, row.lossPercent, row.goldLossPrice)
        return { ...row, weightLossAllowed: m.weightLossAllowed, weightLossActual: m.weightLossActual, totalWages: m.moneyDiff }
      })
    },

    totalGoldQtyCheck() {
      return this.filteredItems.reduce((sum, row) => sum + (row.goldQtyCheck || 0), 0)
    },

    totalGoldWeightCheck() {
      return this.filteredItems.reduce((sum, row) => sum + (row.goldWeightCheck || 0), 0)
    },

    totalWages() {
      return this.filteredItems.reduce((sum, row) => sum + (row.totalWages || 0), 0)
    },

    totalWeightLoss() {
      return this.filteredItems.reduce((sum, row) => sum + (row.weightLossActual || 0), 0)
    }
  },

  methods: {
    formatDecimal(value) {
      if (!value) return Number(0).toFixed(2)
      return Number(value).toFixed(2).toLocaleString()
    },

    formatLoss(value) {
      if (value == null) return ''
      const v = Number(value)
      const abs = Math.abs(v).toFixed(2)
      if (v > 0) return `+${abs}`
      if (v < 0) return `-${abs}`
      return abs
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.gold-type-filter-bar {
  display: flex;
  align-items: center;
  gap: var(--sp-sm);
  margin-bottom: var(--sp-sm);
  padding: var(--sp-sm) var(--sp-md);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  .filter-label {
    white-space: nowrap;
    font-size: var(--fs-base);
    flex-shrink: 0;
  }
}

.badge-gold-loss {
  display: inline-block;
  background: var(--base-warning);
  color: #5a3e00;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
}

.badge-slipped {
  background: #6c757d;
  color: #fff;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  display: inline-block;
}

.loss-positive {
  color: var(--base-green);
  font-weight: 600;
}

.loss-negative {
  color: var(--base-red);
  font-weight: 600;
}
</style>
