<template>
  <div class="mt-2">
    <BaseDataTable
      :items="filteredItems"
      :totalRecords="filteredItems.length"
      :columns="columns"
      :paginator="false"
      scrollHeight="calc(100vh - 340px)"
    >
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
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import Column from 'primevue/column'

const BASE_COLUMNS = [
  { field: 'woText', header: 'เลขที่ใบงาน', minWidth: '120px' },
  { field: 'statusActiveName', header: 'สถานะใบงาน', minWidth: '120px', align: 'center' },
  { field: 'jobDate', header: 'วันที่ส่งงาน', minWidth: '110px', format: 'date' },
  { field: 'productNumber', header: 'รหัสสินค้า', minWidth: '120px' },
  { field: 'statusName', header: 'สถานะ', minWidth: '140px', align: 'center' },
  { field: 'statusDescription', header: 'แผนกงาน', minWidth: '120px' },
  { field: 'description', header: 'รายละเอียด', minWidth: '160px' },
  { field: 'goldQtySend', header: 'จำนวนจ่าย', minWidth: '90px', align: 'right', format: 'number' },
  { field: 'goldWeightSend', header: 'น้ำหนักจ่าย', minWidth: '100px', align: 'right', format: 'decimal3' },
  { field: 'goldQtyCheck', header: 'จำนวนรับ', minWidth: '90px', align: 'right', format: 'number' },
  { field: 'goldWeightCheck', header: 'น้ำหนักรับ', minWidth: '100px', align: 'right', format: 'decimal3' },
  { field: 'wages', header: 'ราคาต่อหน่วย', minWidth: '110px', align: 'right', format: 'decimal2' },
  { field: 'totalWages', header: 'ราคา', minWidth: '110px', align: 'right', format: 'decimal2' }
]

const GOLD_LOSS_EXTRA_COLUMNS = [
  { field: 'lossPercent', header: '%loss', minWidth: '90px', align: 'right', format: 'number' },
  { field: 'weightLossAllowed', header: 'น้ำหนักที่ loss ได้', minWidth: '130px', align: 'right', format: 'decimal2' },
  { field: 'weightLossActual', header: 'น้ำหนัก loss', minWidth: '110px', align: 'right' }
]

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
    columns() {
      if (this.wageTypeFilter === 'goldLoss') {
        const cols = [...BASE_COLUMNS]
        cols.splice(cols.length - 1, 0, ...GOLD_LOSS_EXTRA_COLUMNS)
        return cols
      }
      return BASE_COLUMNS
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
        const weightLossAllowed = (row.goldWeightSend || 0) * (row.lossPercent || 0) / 100
        const weightLossActual = weightLossAllowed - ((row.goldWeightSend || 0) - (row.goldWeightCheck || 0))
        return { ...row, weightLossAllowed, weightLossActual }
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
  background: #fabc3f;
  color: #5a3e00;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-slipped {
  background: #6c757d;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  display: inline-block;
}

.loss-positive {
  color: #038387;
  font-weight: 600;
}

.loss-negative {
  color: var(--base-red);
  font-weight: 600;
}
</style>
