<template>
  <div class="mt-2">
    <BaseDataTable
      :items="report.rows"
      :columns="columns"
      :paginator="false"
      dataKey="goldType"
    >
      <template #lossPercentTemplate="{ data }">
        <InputTextGeneric v-model="data.lossPercent" type="number" step="any" />
      </template>

      <template #goldLossPriceTemplate="{ data }">
        <InputTextGeneric v-model="data.goldLossPrice" type="number" step="any" />
      </template>

      <template #lossRemarkTemplate="{ data }">
        <InputTextGeneric v-model="data.lossRemark" type="text" />
      </template>

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
            <ButtonGeneric
              variant="main"
              icon="bi-save"
              class="ml-2"
              :label="$t('common.btn.save')"
              :disabled="!modelForm || !report.rows.length"
              @click="onSave"
            />
          </div>
        </div>
      </template>
    </BaseDataTable>
  </div>
</template>

<script>
import { useGoldLossMonthlyApiStore } from '@/stores/modules/api/production/gold-loss-monthly-api.js'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import { success, warning } from '@/services/alert/sweetAlerts.js'

import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'

export default {
  name: 'GoldLossMonthlyReportResultView',

  components: {
    BaseDataTable,
    InputTextGeneric,
    ButtonGeneric
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
        { field: 'lossPercent', header: this.$t('view.production.goldLossMonthly.colLossPercent'), sortable: false, minWidth: '110px' },
        { field: 'goldLossPrice', header: this.$t('view.production.goldLossMonthly.colGoldLossPrice'), sortable: false, minWidth: '120px' },
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
    },

    onSave() {
      if (!this.modelForm || !this.report.rows.length) {
        warning(this.$t('view.production.goldLossMonthly.warningNoData'))
        return
      }

      confirmThenSubmit(
        this.$t('view.production.goldLossMonthly.confirmSaveMessage', {
          month: this.modelForm.month,
          year: this.modelForm.year
        }),
        this.$t('view.production.goldLossMonthly.confirmSaveTitle'),
        async () => {
          await this.goldLossMonthlyStore.saveReport({
            year: this.modelForm.year,
            month: this.modelForm.month,
            status: this.modelForm.status,
            items: this.report.rows.map((row) => ({
              goldType: row.goldType,
              lossPercent: row.lossPercent,
              goldLossPrice: row.goldLossPrice,
              lossRemark: row.lossRemark
            }))
          })
          success(this.$t('view.production.goldLossMonthly.saveSuccess'))
          await this.fetchData()
        }
      )
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
