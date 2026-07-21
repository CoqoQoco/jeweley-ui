<template>
  <div class="mt-2">
    <BaseDataTable
      :items="report.rows"
      :columns="columns"
      :paginator="false"
      dataKey="goldType"
    >
      <template #footer>
        <div class="result-footer">
          <div class="result-footer-left">
            <span v-if="report.hasSavedData" class="badge-saved">
              {{ $t('view.production.goldLossMonthly.savedBadge') }}
            </span>
          </div>
          <div class="result-footer-right">
            <span class="total-money-diff">
              {{ $t('view.production.goldLossMonthly.totalMoneyDiff', { amount: formattedTotal }) }}
            </span>
          </div>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { useGoldLossMonthlyApiStore } from '@/stores/modules/api/production/gold-loss-monthly-api.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'GoldLossMonthlyReportResultView',

  components: {
    BaseDataTable
  },

  setup() {
    const goldLossMonthlyStore = useGoldLossMonthlyApiStore()
    return { goldLossMonthlyStore }
  },

  props: {
    modelForm: {
      type: Object,
      default: null
    }
  },

  computed: {
    report() {
      return this.goldLossMonthlyStore.reportData
    },

    columns() {
      return [
        { field: 'goldTypeName', header: this.$t('view.production.goldLossMonthly.colGoldType'), sortable: false, minWidth: '110px' },
        { field: 'sumGoldWeightSend', header: this.$t('view.production.goldLossMonthly.colSumGoldWeightSend'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'sumGoldWeightCheck', header: this.$t('view.production.goldLossMonthly.colSumGoldWeightCheck'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'rawLoss', header: this.$t('view.production.goldLossMonthly.colRawLoss'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'lossPercent', header: this.$t('view.production.goldLossMonthly.colLossPercent'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'goldLossPrice', header: this.$t('view.production.goldLossMonthly.colGoldLossPrice'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'weightLossAllowed', header: this.$t('view.production.goldLossMonthly.colWeightLossAllowed'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'weightLossActual', header: this.$t('view.production.goldLossMonthly.colWeightLossActual'), sortable: false, minWidth: '130px', align: 'right', format: 'decimal2' },
        { field: 'moneyDiff', header: this.$t('view.production.goldLossMonthly.colMoneyDiff'), sortable: false, minWidth: '120px', align: 'right', format: 'decimal2' },
        { field: 'lossRemark', header: this.$t('common.field.remark'), sortable: false, minWidth: '160px' }
      ]
    },

    formattedTotal() {
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(this.report.totalMoneyDiff || 0)
    }
  },

  watch: {
    modelForm: {
      handler(val) {
        if (val) {
          this.fetchData()
        }
      },
      deep: true
    }
  },

  methods: {
    async fetchData() {
      await this.goldLossMonthlyStore.fetchReport(this.modelForm)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-data-table';

.result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-sm);
  width: 100%;
}

.result-footer-right {
  display: flex;
  align-items: center;
}

.total-money-diff {
  font-weight: 600;
  color: var(--base-font-color);
}

.badge-saved {
  display: inline-block;
  background: var(--base-green);
  color: #ffffff;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
  font-weight: 600;
}
</style>
