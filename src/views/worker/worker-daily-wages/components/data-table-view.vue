<template>
  <div class="mt-2">
    <BaseDataTable
      :items="filteredItems"
      :totalRecords="filteredItems.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="calc(100vh - 340px)"
    >
      <template #woTextTemplate="{ data }">
        <span>{{ data.wo }}{{ data.woNumber ? ' - ' + data.woNumber : '' }}</span>
      </template>

      <template #statusNameTemplate="{ data }">
        <template v-if="data.isGoldLoss">
          <span class="badge-gold-loss">Gold Loss (งานฝัง)</span>
          <span v-if="data.workerGoldLossSlipId" class="badge-slipped ml-1">ลง slip {{ data.workerGoldLossSlipDocumentNo }}</span>
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
              <template #footer>จำนวน {{ filteredItems.length }} รายการ</template>
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
              <template #footer>จำนวน {{ filteredItems.length }} รายการ</template>
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

export default {
  name: 'WorkerDailyWagesDataTableView',

  components: {
    BaseDataTable,
    ColumnGroup,
    Row,
    Column
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
        { field: 'goldWeightSend', header: this.$t('view.worker.workerDailyWages.colGoldWeightSend'), minWidth: '100px', align: 'right', format: 'decimal3' },
        { field: 'goldQtyCheck', header: this.$t('view.worker.workerDailyWages.colGoldQtyCheck'), minWidth: '90px', align: 'right', format: 'number' },
        { field: 'goldWeightCheck', header: this.$t('view.worker.workerDailyWages.colGoldWeightCheck'), minWidth: '100px', align: 'right', format: 'decimal3' },
        { field: 'wages', header: this.$t('view.worker.workerDailyWages.colWages'), minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'totalWages', header: this.$t('view.worker.workerDailyWages.colTotalWages'), minWidth: '110px', align: 'right', format: 'decimal2' }
      ]
    },
    goldLossExtraColumns() {
      return [
        { field: 'lossPercent', header: this.$t('view.worker.workerDailyWages.colLossPercent'), minWidth: '90px', align: 'right', format: 'number' },
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

    filteredItems() {
      const items = this.items || []
      let filtered
      if (this.wageTypeFilter === 'goldLoss') {
        filtered = items.filter((r) => r.isGoldLoss)
      } else {
        filtered = items.filter((r) => !r.isGoldLoss)
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
