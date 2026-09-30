<!--
  plan-cost-section — กล่อง "ต้นทุน" ของ executive/plan-detail (read-only) — ตารางบัตรต้นทุน
  (ProductionPlanGet.priceItems) + ยอดรวม — ไม่มีปุ่มประเมิน/แก้ไขใดๆ

  Props:
    priceItems — Array (required) จาก ProductionPlanGet.priceItems
-->
<template>
  <SectionCardGeneric :title="$t('view.executive.planDetail.sectionCost')" icon="bi-cash-coin" accent="green" headerStyle="legend">
    <div class="responsive-table-wrapper">
      <BaseDataTable :items="rows" :columns="columns" :paginator="false" dataKey="key">
        <template #groupTemplate="{ data }">{{ $t(`view.executive.planDetail.priceGroup.${data.group}`) }}</template>
      </BaseDataTable>
    </div>
    <div class="plan-cost-section__total">
      <span>{{ $t('view.executive.planDetail.costTotalLabel') }}</span>
      <span class="plan-cost-section__total-value">{{ formatMoney(total) }}</span>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { resolvePriceGroupKey, sumPriceItemsTotal } from '../plan-detail-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'PlanCostSection',

  components: {
    SectionCardGeneric,
    BaseDataTable
  },

  props: {
    priceItems: {
      type: Array,
      required: true
    }
  },

  computed: {
    rows() {
      return this.priceItems.map((item, index) => ({
        key: `${item.nameGroup}-${index}`,
        group: resolvePriceGroupKey(item.nameGroup),
        nameDescription: item.nameDescription,
        qty: item.qty,
        qtyPrice: item.qtyPrice,
        qtyWeight: item.qtyWeight,
        qtyWeightPrice: item.qtyWeightPrice,
        totalPrice: item.totalPrice
      }))
    },

    total() {
      return sumPriceItemsTotal(this.priceItems)
    },

    columns() {
      return [
        { field: 'group', header: this.$t('view.executive.planDetail.costColGroup'), sortable: false, minWidth: '110px' },
        { field: 'nameDescription', header: this.$t('view.executive.planDetail.costColDescription'), sortable: false, minWidth: '180px' },
        { field: 'qty', header: this.$t('view.executive.planDetail.costColQty'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'qtyPrice', header: this.$t('view.executive.planDetail.costColQtyPrice'), sortable: false, minWidth: '100px', align: 'right', format: 'decimal2' },
        { field: 'qtyWeight', header: this.$t('view.executive.planDetail.costColWeight'), sortable: false, minWidth: '100px', align: 'right', format: 'decimal3' },
        { field: 'qtyWeightPrice', header: this.$t('view.executive.planDetail.costColWeightPrice'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' },
        { field: 'totalPrice', header: this.$t('view.executive.planDetail.costColTotal'), sortable: false, minWidth: '110px', align: 'right', format: 'decimal2' }
      ]
    }
  },

  methods: {
    formatMoney(value) {
      return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.plan-cost-section__total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--sp-md);
  margin-top: var(--sp-md);
  padding-top: var(--sp-md);
  border-top: 1px solid var(--color-border);
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--base-font-color);
}

.plan-cost-section__total-value {
  color: var(--base-green);
}
</style>
