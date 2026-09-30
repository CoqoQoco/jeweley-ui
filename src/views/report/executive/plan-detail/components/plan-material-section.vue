<!--
  plan-material-section — กล่อง "วัตถุดิบ" ของ executive/plan-detail (read-only) — ตาราง BOM
  (ProductionPlan/ProductionPlaMateriaGet) + ตารางใบเบิกผสมทอง (ProductionPlanCost/ListGoldCostItem) ต่อกัน

  Props:
    materials     — Array (required) จาก ProductionPlan/ProductionPlanMateriaGet
    goldCostItems — Array (required) จาก ProductionPlanCost/ListGoldCostItem
-->
<template>
  <SectionCardGeneric :title="$t('view.executive.planDetail.sectionMaterial')" icon="bi-boxes" accent="main" headerStyle="legend">
    <div class="responsive-table-wrapper">
      <BaseDataTable :items="materials" :columns="materialColumns" :paginator="false" dataKey="id">
        <template #goldNavigationTemplate="{ data }">
          <span v-if="data.goldNavigation?.code">{{ data.goldNavigation.code }}: {{ data.goldNavigation.nameTh }}</span>
          <span v-else>-</span>
        </template>
        <template #goldSizeNavigationTemplate="{ data }">
          <span v-if="data.goldSizeNavigation?.code">{{ data.goldSizeNavigation.nameTh }}</span>
          <span v-else>-</span>
        </template>
        <template #gemNavigationTemplate="{ data }">
          <span v-if="data.gemNavigation?.code">{{ data.gemNavigation.code }}: {{ data.gemNavigation.nameTh }}</span>
          <span v-else>-</span>
        </template>
        <template #gemShapeNavigationTemplate="{ data }">
          <span v-if="data.gemShapeNavigation?.code">{{ data.gemShapeNavigation.code }}: {{ data.gemShapeNavigation.nameTh }} {{ data.gemSize || '' }}</span>
          <span v-else>-</span>
        </template>
      </BaseDataTable>
    </div>

    <p class="plan-material-section__ledger-title">{{ $t('view.executive.planDetail.goldLedgerTitle') }}</p>
    <div class="responsive-table-wrapper">
      <BaseDataTable :items="goldCostItems" :columns="goldLedgerColumns" :paginator="false" dataKey="no">
        <template #goldCodeTemplate="{ data }">
          <span v-if="data.goldCode">{{ data.goldCode }}: {{ data.goldName }}</span>
          <span v-else>-</span>
        </template>
        <template #assignDateTemplate="{ data }">{{ formatDate(data.assignDate) }}</template>
      </BaseDataTable>
    </div>
  </SectionCardGeneric>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'PlanMaterialSection',

  components: {
    SectionCardGeneric,
    BaseDataTable
  },

  props: {
    materials: {
      type: Array,
      required: true
    },
    goldCostItems: {
      type: Array,
      required: true
    }
  },

  computed: {
    materialColumns() {
      return [
        { field: 'goldNavigation', header: this.$t('view.executive.planDetail.matColGoldType'), sortable: false, minWidth: '120px' },
        { field: 'goldSizeNavigation', header: this.$t('view.executive.planDetail.matColGoldPercent'), sortable: false, minWidth: '100px' },
        { field: 'goldQty', header: this.$t('view.executive.planDetail.matColGoldQty'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'gemNavigation', header: this.$t('view.executive.planDetail.matColGemType'), sortable: false, minWidth: '120px' },
        { field: 'gemShapeNavigation', header: this.$t('view.executive.planDetail.matColGemShape'), sortable: false, minWidth: '150px' },
        { field: 'gemQty', header: this.$t('view.executive.planDetail.matColGemQty'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'gemWeight', header: this.$t('view.executive.planDetail.matColGemWeight'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'diamondQty', header: this.$t('view.executive.planDetail.matColDiamondQty'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'diamondWeight', header: this.$t('view.executive.planDetail.matColDiamondWeight'), sortable: false, minWidth: '110px', align: 'right' },
        { field: 'diamondSize', header: this.$t('view.executive.planDetail.matColDiamondSize'), sortable: false, minWidth: '90px' },
        { field: 'diamondQuality', header: this.$t('view.executive.planDetail.matColDiamondQuality'), sortable: false, minWidth: '100px' }
      ]
    },

    goldLedgerColumns() {
      return [
        { field: 'goldCode', header: this.$t('view.executive.planDetail.goldLedgerColGoldType'), sortable: false, minWidth: '140px' },
        { field: 'goldSizeName', header: this.$t('view.executive.planDetail.goldLedgerColGoldPercent'), sortable: false, minWidth: '100px' },
        { field: 'goldReceipt', header: this.$t('view.executive.planDetail.goldLedgerColReceipt'), sortable: false, minWidth: '110px' },
        { field: 'bookNo', header: this.$t('view.executive.planDetail.goldLedgerColBookNo'), sortable: false, minWidth: '80px' },
        { field: 'no', header: this.$t('view.executive.planDetail.goldLedgerColCode'), sortable: false, minWidth: '80px' },
        { field: 'cost', header: this.$t('view.executive.planDetail.goldLedgerColCost'), sortable: false, minWidth: '90px', align: 'right', format: 'decimal2' },
        { field: 'assignDate', header: this.$t('view.executive.planDetail.goldLedgerColAssignDate'), sortable: false, minWidth: '110px' }
      ]
    }
  },

  methods: {
    formatDate(date) {
      return date ? formatDate(date) : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.plan-material-section__ledger-title {
  margin: var(--sp-lg) 0 var(--sp-sm);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--base-font-color);
}
</style>
