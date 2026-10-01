<!--
  gold-over-slips-panel — ตาราง "ใบงานที่ทองเกินเกณฑ์" (reportRef: goldOverSlips) ของหมวด "ทองและ Loss" —
  เรียก ProductionInsight/GoldOverSlips (DataSourceRequest + workerTypes/workerCodes/metal/start/end) —
  ตัวกรองประเภทช่าง/ช่าง/โลหะมาจาก props (คุมจาก FilterPanelGeneric ของ ProductionInsightView) — start/end
  (ช่วงเวลาเดียวกับ Gold) เป็น required เสมอ ห้ามส่ง request โดยไม่มีช่วงเวลา (ทำให้ได้ 0 แถวเงียบๆ มาแล้ว)

  ช่างแต่ง (50) = 1 แถวต่อ 1 ใบ slip จริง ส่วนช่างฝัง (80) = 1 แถวต่อ 1 รายการที่เกินเกณฑ์ (job) ภายใต้ slip
  เดียวกัน (documentNo ซ้ำกันได้หลายแถว) — โชว์ hint กำกับเฉพาะแถวช่างฝัง กันเข้าใจผิดว่านับจำนวนใบซ้ำ

  Props:
    workerTypes — Array (default []) — ตัวกรองประเภทช่างจาก FilterPanelGeneric
    workerCodes — Array (default []) — ตัวกรองช่างจาก FilterPanelGeneric
    metal       — String ('GOLD') — 'GOLD'|'SILVER'
    start       — Date (required)
    end         — Date (required)
-->
<template>
  <div id="insight-report-goldOverSlips" class="gold-over-slips-panel">
    <SectionCardGeneric
      :title="$t('view.productionInsight.gold.overSlipsTitle', { metal: metalLabel })"
      :titleTip="$t('view.productionInsight.help.goldMoneySemantics', { metal: metalLabel })"
      icon="bi-exclamation-triangle"
      accent="warning"
      headerStyle="legend"
    >
      <div class="responsive-table-wrapper">
        <BaseDataTable
          :items="tableRows"
          :totalRecords="total"
          :columns="columns"
          :perPage="take"
          dataKey="slipId"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
          <template #documentNoTemplate="{ data }">
            <span class="gold-over-slips-panel__doc-no">
              {{ data.documentNo }}
              <InfoTipGeneric v-if="data.workerType === 80" :text="$t('view.productionInsight.gold.overSlipsSettingRowHint')" />
            </span>
          </template>

          <template #requestRangeTemplate="{ data }">
            {{ data.requestDateStart ? formatDate(data.requestDateStart) : '—' }} - {{ data.requestDateEnd ? formatDate(data.requestDateEnd) : '—' }}
          </template>
          <template #rawLossGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.rawLossGram) }}</div>
          </template>
          <template #allowedGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.allowedGram) }}</div>
          </template>
          <template #excessGramTemplate="{ data }">
            <div class="text-right gold-over-slips-panel__excess">{{ formatGram(data.excessGram) }}</div>
          </template>
          <template #excessMoneyTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.excessMoney) }}</div>
          </template>
          <template #netMoneyTemplate="{ data }">
            <div class="text-right" :class="`gold-over-slips-panel__net--${netVariant(data.netMoney)}`">{{ netMoneyLabel(data.netMoney) }}</div>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { formatDate } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { resolveNetMoneyVariant } from './gold-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'GoldOverSlipsPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    InfoTipGeneric,
    BaseDataTable
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    return { productionInsightStore }
  },

  props: {
    workerTypes: {
      type: Array,
      default: () => []
    },
    workerCodes: {
      type: Array,
      default: () => []
    },
    metal: {
      type: String,
      default: 'GOLD'
    },
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },

  data() {
    return {
      items: [],
      total: 0
    }
  },

  computed: {
    metalLabel() {
      return this.$t(`view.productionInsight.gold.metalLabel.${this.metal}`)
    },

    tableRows() {
      return this.items.map((row) => ({ ...row, workerTypeLabel: this.$t(`view.productionInsight.gold.workerType.${row.workerType}`) }))
    },

    columns() {
      return [
        { field: 'documentNo', header: this.$t('view.productionInsight.gold.overSlipsColDocumentNo'), sortable: false, minWidth: '120px' },
        { field: 'workerTypeLabel', header: this.$t('view.productionInsight.gold.overSlipsColWorkerType'), sortable: false, minWidth: '100px' },
        { field: 'workerName', header: this.$t('view.productionInsight.gold.overSlipsColWorker'), sortable: false, minWidth: '140px' },
        { field: 'requestRange', header: this.$t('view.productionInsight.gold.overSlipsColRequestRange'), sortable: false, minWidth: '160px' },
        { field: 'rawLossGram', header: this.$t('view.productionInsight.gold.overSlipsColRawLoss'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'allowedGram', header: this.$t('view.productionInsight.gold.overSlipsColAllowedLoss'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'excessGram', header: this.$t('view.productionInsight.gold.overSlipsColExcessGram'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'excessMoney', header: this.$t('view.productionInsight.gold.overSlipsColExcessMoney'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'netMoney', header: this.$t('view.productionInsight.gold.overSlipsColNetMoney'), sortable: false, minWidth: '140px', align: 'right' }
      ]
    }
  },

  watch: {
    workerTypes: {
      handler() {
        this.resetPaging()
      },
      deep: true
    },
    workerCodes: {
      handler() {
        this.resetPaging()
      },
      deep: true
    },
    metal() {
      this.resetPaging()
    },
    start() {
      this.resetPaging()
    },
    end() {
      this.resetPaging()
    }
  },

  methods: {
    formatDate,

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    formatGram(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value) : '—'
    },

    netVariant(netMoney) {
      return resolveNetMoneyVariant(netMoney)
    },

    netMoneyLabel(netMoney) {
      if (netMoney == null || netMoney === 0) return '—'
      const amount = this.formatCount(Math.abs(netMoney))
      return netMoney > 0
        ? this.$t('view.productionInsight.gold.netMoneyPositive', { amount })
        : this.$t('view.productionInsight.gold.netMoneyNegative', { amount })
    },

    async fetchData() {
      const res = await this.productionInsightStore.fetchGoldOverSlips({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        workerTypes: this.workerTypes,
        workerCodes: this.workerCodes,
        metal: this.metal,
        start: this.start,
        end: this.end
      })
      this.items = res?.data || []
      this.total = res?.total || 0
    }
  },

  mounted() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.gold-over-slips-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.gold-over-slips-panel__excess {
  color: var(--base-red);
  font-weight: 700;
}

.gold-over-slips-panel__doc-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.gold-over-slips-panel__net--green {
  color: var(--base-green);
  font-weight: 700;
}

.gold-over-slips-panel__net--warning {
  color: var(--base-warning);
  font-weight: 700;
}
</style>
