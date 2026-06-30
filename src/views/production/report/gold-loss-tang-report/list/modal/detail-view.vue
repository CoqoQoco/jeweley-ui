<template>
  <modal :showModal="isShow" @closeModal="$emit('closeModal')" width="1100px" :fitHeight="true" :clickToClose="true">
    <template #title>
      <span class="title-text-lg px-3 pt-3 d-block">{{ $t('view.production.goldLossTang.detailTitle') }}</span>
    </template>

    <template #content>
      <div class="p-3" v-if="slip">
        <SectionCardGeneric :title="$t('view.production.goldLossTang.colDocumentNo')" class="modal-section">
          <div class="detail-header-grid">
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.production.goldLossTang.colDocumentNo') }}</span>
              <span class="detail-value fw-bold">{{ slip.documentNo }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.production.goldLossTang.colWorkerCode') }}</span>
              <span class="detail-value">{{ slip.workerCode }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.production.goldLossTang.colWorkerName') }}</span>
              <span class="detail-value">{{ slip.workerName }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.production.goldLossTang.fieldDateStart') }}</span>
              <span class="detail-value">{{ formatDate(slip.requestDateStart) }}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">{{ $t('view.production.goldLossTang.fieldDateEnd') }}</span>
              <span class="detail-value">{{ formatDate(slip.requestDateEnd) }}</span>
            </div>
            <div class="detail-field" v-if="slip.remark">
              <span class="detail-label">{{ $t('common.field.remark') }}</span>
              <span class="detail-value">{{ slip.remark }}</span>
            </div>
          </div>
        </SectionCardGeneric>

        <SectionCardGeneric :title="$t('view.production.goldLossTang.selectJobsTitle')" class="modal-section">
          <BaseDataTable
            :items="slip.items || []"
            :totalRecords="(slip.items || []).length"
            :columns="jobColumns"
            :paginator="false"
            scrollHeight="260px"
            dataKey="itemNo"
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
              <span>{{ fmt4(data.goldWeightSend) }}</span>
            </template>
            <template #goldWeightCheckTemplate="{ data }">
              <span>{{ fmt4(data.goldWeightCheck) }}</span>
            </template>
          </BaseDataTable>
        </SectionCardGeneric>

        <div class="form-row two-col modal-section">
          <SectionCardGeneric :title="$t('view.production.goldLossTang.issuedTitle')">
            <BaseDataTable
              :items="slip.issuedLines || []"
              :totalRecords="(slip.issuedLines || []).length"
              :columns="lineColumns"
              :paginator="false"
              scrollHeight="200px"
              dataKey="_idx"
            >
              <template #weightTemplate="{ data }">
                <span>{{ fmt4(data.weight) }}</span>
              </template>
            </BaseDataTable>
          </SectionCardGeneric>

          <SectionCardGeneric :title="$t('view.production.goldLossTang.returnedTitle')">
            <BaseDataTable
              :items="slip.returnedLines || []"
              :totalRecords="(slip.returnedLines || []).length"
              :columns="lineColumns"
              :paginator="false"
              scrollHeight="200px"
              dataKey="_idx"
            >
              <template #weightTemplate="{ data }">
                <span>{{ fmt4(data.weight) }}</span>
              </template>
            </BaseDataTable>
          </SectionCardGeneric>
        </div>

        <SectionCardGeneric :title="$t('view.production.goldLossTang.summaryTitle')" class="modal-section">
          <div class="calc-summary">
            <div class="calc-row">
              <span class="calc-label">{{ $t('view.production.goldLossTang.lossPercent') }}</span>
              <span class="calc-value">{{ fmt4(slip.lossPercent) }} %</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">{{ $t('view.production.goldLossTang.pricePerGram') }}</span>
              <span class="calc-value">{{ fmt2(slip.pricePerGram) }}</span>
            </div>
            <hr class="divider" />
            <div class="calc-row">
              <span class="calc-label">{{ $t('view.production.goldLossTang.issuedTotal') }}</span>
              <span class="calc-value">{{ fmt4(slip.issuedTotal) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">{{ $t('view.production.goldLossTang.returnedTotal') }}</span>
              <span class="calc-value">{{ fmt4(slip.returnedTotal) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
            </div>
            <div class="calc-row">
              <span class="calc-label">{{ $t('view.production.goldLossTang.rawLoss') }}</span>
              <span class="calc-value" :class="signClass((slip.issuedTotal - slip.returnedTotal) * -1)">
                {{ fmtSign4(slip.rawLoss) }} {{ $t('view.production.goldLossTang.weightUnit') }}
              </span>
            </div>
            <div class="calc-row">
              <span class="calc-label">{{ $t('view.production.goldLossTang.limitLoss') }}</span>
              <span class="calc-value">{{ fmt4(slip.allowedLoss) }} {{ $t('view.production.goldLossTang.weightUnit') }}</span>
            </div>
            <hr class="divider" />
            <div class="calc-row highlight">
              <span class="calc-label fw-bold">{{ $t('view.production.goldLossTang.diffLoss') }}</span>
              <span class="calc-value fw-bold" :class="signClass(slip.diffLoss)">
                {{ fmtSign4(slip.diffLoss) }} {{ $t('view.production.goldLossTang.weightUnit') }}
              </span>
            </div>
            <div class="calc-row money-row">
              <span class="calc-label fw-bold">{{ $t('view.production.goldLossTang.moneyLabel') }}</span>
              <span class="calc-value money-value fw-bold" :class="signClass(slip.totalMoneyDiff)">
                {{ fmtSign2(slip.totalMoneyDiff) }}
                <small class="money-hint ml-1">
                  ({{ slip.totalMoneyDiff >= 0 ? $t('view.production.goldLossTang.moneyGain') : $t('view.production.goldLossTang.moneyLoss') }})
                </small>
              </span>
            </div>
          </div>
        </SectionCardGeneric>
      </div>
    </template>
  </modal>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { useGoldLossTangStore } from '@/stores/modules/api/plan/gold-loss-tang-store.js'
import dayjs from 'dayjs'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

const modal = defineAsyncComponent(() => import('@/components/modal/modal-view.vue'))

export default {
  name: 'GoldLossTangDetailView',

  components: {
    modal,
    SectionCardGeneric,
    BaseDataTable
  },

  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    slipId: {
      type: Number,
      default: null
    }
  },

  emits: ['closeModal'],

  data() {
    return {
      slip: null
    }
  },

  computed: {
    jobColumns() {
      return [
        { field: 'wo', header: this.$t('view.production.goldLossTang.colWo'), minWidth: '120px', sortable: false },
        { field: 'jobDate', header: this.$t('view.production.goldLossTang.colJobDate'), minWidth: '100px', sortable: false },
        { field: 'gold', header: this.$t('view.production.goldLossTang.colGold'), minWidth: '100px', sortable: false },
        { field: 'goldWeightSend', header: this.$t('view.production.goldLossTang.colGoldWeightSend'), minWidth: '100px', align: 'right', sortable: false },
        { field: 'goldWeightCheck', header: this.$t('view.production.goldLossTang.colGoldWeightCheck'), minWidth: '100px', align: 'right', sortable: false }
      ]
    },

    lineColumns() {
      return [
        { field: 'name', header: this.$t('view.production.goldLossTang.lineName'), minWidth: '150px', sortable: false },
        { field: 'weight', header: this.$t('view.production.goldLossTang.lineWeight'), minWidth: '100px', align: 'right', sortable: false }
      ]
    }
  },

  watch: {
    isShow(val) {
      if (val && this.slipId) {
        this.loadSlip()
      } else if (!val) {
        this.slip = null
      }
    }
  },

  methods: {
    async loadSlip() {
      const store = useGoldLossTangStore()
      const res = await store.getSlip(this.slipId)
      if (res) {
        this.slip = res.data || res
      }
    },

    formatDate(val) {
      if (!val) return ''
      return dayjs(val).format('DD/MM/YYYY')
    },

    fmt4(val) {
      if (val == null) return '0.0000'
      return Number(val).toFixed(4)
    },

    fmt2(val) {
      if (val == null) return '0.00'
      return Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },

    fmtSign4(val) {
      if (val == null) return '0.0000'
      const v = Number(val)
      const abs = Math.abs(v).toFixed(4)
      if (v > 0) return `+${abs}`
      if (v < 0) return `-${abs}`
      return abs
    },

    fmtSign2(val) {
      if (val == null) return '0.00'
      const v = Number(val)
      const abs = Math.abs(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      if (v > 0) return `+${abs}`
      if (v < 0) return `-${abs}`
      return abs
    },

    signClass(val) {
      if (val > 0) return 'loss-positive'
      if (val < 0) return 'loss-negative'
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';

.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-header-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-md);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-xs);
}

.detail-label {
  font-size: var(--fs-sm);
  color: #666;
  font-weight: 500;
}

.detail-value {
  font-size: var(--fs-base);
  color: var(--base-font-color);
}

.form-row {
  display: grid;
  gap: var(--sp-md);

  &.two-col {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.calc-summary {
  background: var(--color-highlight-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-md) var(--sp-lg);
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-xs) 0;
}

.calc-label {
  font-weight: 500;
  color: var(--base-font-color);
}

.calc-value {
  font-weight: 600;
  text-align: right;
}

.divider {
  border-color: var(--color-border);
  margin: var(--sp-sm) 0;
}

.highlight {
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-sm);
  padding: var(--sp-sm) var(--sp-xs);
  margin: 0 calc(var(--sp-xs) * -1);
}

.money-row {
  padding-top: var(--sp-sm);
}

.money-value {
  font-size: var(--fs-lg);
}

.money-hint {
  font-size: var(--fs-sm);
  font-weight: 400;
}

.loss-positive {
  color: var(--base-green);
}

.loss-negative {
  color: var(--base-red);
}
</style>
