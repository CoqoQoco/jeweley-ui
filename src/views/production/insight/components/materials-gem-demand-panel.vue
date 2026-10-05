<!--
  materials-gem-demand-panel — ตาราง "ความต้องการเทียบสต็อกพลอย" (reportRef: matDemand) ของหมวด "วัตถุดิบที่
  กระทบการผลิต" — เรียก ProductionInsight/MaterialGemDemand (DataSourceRequest + status) — ไม่มี start/end
  (snapshot เทียบความต้องการกับสต็อกตอนนี้) — status เป็น local toggle ของกล่องนี้เอง (ทั้งหมด|พร้อม|ไม่พอ|
  ไม่พบสเปก) เหมือน gemStatus ของ materials-waiting-plans-panel.vue

  ชื่อพลอย/ทรง resolve ผ่าน useMasterApiStore().gem/gemShape เหมือนกัน (ไม่ยิง fetchGem/fetchGemShape ซ้ำ —
  cache-aware อยู่แล้วจาก fetchWithCache) — status='unmatched' แยก 2 แบบตาม unmatchedReason เหมือน
  materials-waiting-plans-panel.vue เป๊ะ (resolveGemStatusLabelKey)
-->
<template>
  <div id="insight-report-matDemand" class="materials-gem-demand-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.materials.demandTitle')" icon="bi-boxes" accent="main" headerStyle="legend">
      <div class="materials-gem-demand-panel__toolbar">
        <ToggleGroupGeneric v-model="status" :options="statusOptions" :ariaLabel="$t('view.productionInsight.materials.demandStatusFilter')" />
      </div>

      <div class="responsive-table-wrapper">
        <BaseDataTable
          :items="tableRows"
          :totalRecords="total"
          :columns="columns"
          :perPage="take"
          dataKey="rowKey"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
          <template #waitingPlansTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.waitingPlans) }}</div>
          </template>
          <template #upcomingPlansTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.upcomingPlans) }}</div>
          </template>
          <template #requiredQtyTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.requiredQty) }}</div>
          </template>
          <template #availableTemplate="{ data }">
            <div class="text-right">{{ data.available != null ? formatCount(data.available) : '—' }}</div>
          </template>
          <template #usedPerMonthTemplate="{ data }">
            <div class="text-right">{{ data.usedPerMonth != null ? formatCount(data.usedPerMonth) : '—' }}</div>
          </template>
          <template #coverDaysTemplate="{ data }">
            <div class="text-right">{{ data.coverDays != null ? formatCount(data.coverDays) : '—' }}</div>
          </template>
          <template #statusTemplate="{ data }">
            <span class="materials-gem-demand-panel__chip" :class="`materials-gem-demand-panel__chip--${statusVariant(data.status)}`">
              {{ $t(`view.productionInsight.materials.gemStatus.${statusLabelKey(data)}`) }}
            </span>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { resolveGemName, resolveGemShapeName, resolveGemStatusVariant, resolveGemStatusLabelKey, MATERIALS_GEM_STATUS_VALUES } from './materials-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'MaterialsGemDemandPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    ToggleGroupGeneric,
    BaseDataTable
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    const masterStore = useMasterApiStore()
    return { productionInsightStore, masterStore }
  },

  data() {
    return {
      items: [],
      total: 0,
      status: ''
    }
  },

  computed: {
    tableRows() {
      return this.items.map((row, index) => ({
        ...row,
        rowKey: `${row.gem}-${row.shape}-${row.size}-${row.metal}-${index}`,
        gemLabel: this.gemLabel(row)
      }))
    },

    statusOptions() {
      return [
        { value: '', label: this.$t('common.label.all') },
        ...MATERIALS_GEM_STATUS_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.materials.gemStatus.${value}`) }))
      ]
    },

    columns() {
      return [
        { field: 'gemLabel', header: this.$t('view.productionInsight.materials.demandColGem'), sortable: false, minWidth: '180px' },
        { field: 'waitingPlans', header: this.$t('view.productionInsight.materials.demandColWaitingPlans'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'upcomingPlans', header: this.$t('view.productionInsight.materials.demandColUpcomingPlans'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'requiredQty', header: this.$t('view.productionInsight.materials.demandColRequiredQty'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'available', header: this.$t('view.productionInsight.materials.demandColAvailable'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'usedPerMonth', header: this.$t('view.productionInsight.materials.demandColUsedPerMonth'), sortable: false, minWidth: '100px', align: 'right' },
        { field: 'coverDays', header: this.$t('view.productionInsight.materials.demandColCoverDays'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'status', header: this.$t('view.productionInsight.materials.demandColStatus'), sortable: false, minWidth: '100px' }
      ]
    }
  },

  watch: {
    status() {
      this.resetPaging()
    }
  },

  methods: {
    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    gemLabel(row) {
      const name = resolveGemName(this.masterStore.gem, row.gem)
      const shape = resolveGemShapeName(this.masterStore.gemShape, row.shape)
      const metal = row.metal ? this.$t(`view.productionInsight.gold.metalLabel.${row.metal}`) : ''
      return [name, shape, row.size, metal].filter(Boolean).join(' ')
    },

    statusVariant(status) {
      return resolveGemStatusVariant(status)
    },

    statusLabelKey(data) {
      return resolveGemStatusLabelKey(data.status, data.unmatchedReason)
    },

    async fetchData() {
      const res = await this.productionInsightStore.fetchMaterialGemDemand({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        status: this.status
      })
      this.items = res?.data || []
      this.total = res?.total || 0
    }
  },

  mounted() {
    this.masterStore.fetchGem()
    this.masterStore.fetchGemShape()
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
.materials-gem-demand-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.materials-gem-demand-panel__toolbar {
  margin-bottom: var(--sp-lg);
}

.materials-gem-demand-panel__chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  font-weight: 600;

  &--green {
    color: var(--base-green);
    border: 1px solid var(--base-green);
  }

  &--warning {
    color: var(--base-warning);
    border: 1px solid var(--base-warning);
  }

  &--grey {
    color: var(--base-sub-color);
    border: 1px solid var(--color-border);
  }
}
</style>
