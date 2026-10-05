<!--
  materials-waiting-plans-panel — ตาราง "ใบงานรอเบิกพลอย" (reportRef: matWaiting) ของหมวด "วัตถุดิบที่กระทบ
  การผลิต" — เรียก ProductionInsight/MaterialWaitingPlans (DataSourceRequest + gemStatus) — ไม่มี start/end
  (snapshot ใบที่ "รอเบิกอยู่ตอนนี้" เหมือน StalePlans/DueRiskPlans ของหมวด wip ไม่ใช่ query ตามช่วงเวลา) —
  gemStatus เป็น local toggle ของกล่องนี้เอง (ทั้งหมด|พร้อม|ไม่พอ|ไม่พบสเปก) ตาม pattern mode ของ
  wip-due-risk-panel.vue

  คอลัมน์ "พลอย" โชว์ทุกบรรทัดพลอยที่ใบงานนี้ต้องใช้ ("{ชื่อพลอย} {ทรง} {ขนาด} ×{จำนวน}") พร้อมชิปสถานะต่อ
  บรรทัด (พร้อม/ไม่พอ: มี n/ไม่พบสเปก) — ชื่อพลอย/ทรง resolve ผ่าน useMasterApiStore().gem/gemShape ถ้ามี
  ไม่งั้นโชว์ code ดิบ (resolveGemName/resolveGemShapeName) — metal แปลผ่าน namespace เดียวกับหมวด "ทองและ
  Loss" (gold.metalLabel) ไม่สร้างคำแปลซ้ำ — status='unmatched' แยก 2 แบบตาม unmatchedReason ('gem'=ไม่รู้จัก
  ชนิดพลอยเลย → "ไม่พบสเปก (ชนิด)", 'spec'=รู้จักชนิดแต่รูปทรง/ขนาดไม่ตรง → "ไม่พบสเปก (ขนาด/รูปทรง)" — ยืนยัน
  จาก API agent 2026-10-02, resolveGemStatusLabelKey) — available เป็น null เสมอสำหรับ unmatched, status
  short มี available จริงเสมอ (≥0 ไม่ใช่ null)

  Props: (ไม่มี — ตัวกรองเป็น local state ทั้งหมด)
-->
<template>
  <div id="insight-report-matWaiting" class="materials-waiting-plans-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.materials.waitingTitle')" icon="bi-hourglass-split" accent="warning" headerStyle="legend">
      <div class="materials-waiting-plans-panel__toolbar">
        <ToggleGroupGeneric v-model="gemStatus" :options="statusOptions" :ariaLabel="$t('view.productionInsight.materials.waitingStatusFilter')" />
      </div>

      <div class="responsive-table-wrapper">
        <BaseDataTable
          :items="tableRows"
          :totalRecords="total"
          :columns="columns"
          :perPage="take"
          dataKey="planId"
          @page="handlePageChange"
          @sort="handleSortChange"
        >
          <template #woTemplate="{ data }">
            <ButtonGeneric
              v-if="planLinkState(data).canOpen"
              variant="plain"
              icon="bi-box-arrow-up-right"
              :label="data.woText || data.woNumber || data.wo"
              :title="$t('view.productionInsight.wip.planLinkTitle')"
              @click="openPlanDetail(data)"
            />
            <span v-else class="materials-waiting-plans-panel__plan-no">
              {{ data.woText || data.woNumber || data.wo }}
              <InfoTipGeneric :text="$t('view.productionInsight.wip.planLinkNoPermission')" />
            </span>
          </template>

          <template #productTemplate="{ data }">
            <strong>{{ data.productNumber }}</strong>
            <br v-if="data.productName" />
            <small v-if="data.productName" class="text-muted">{{ data.productName }}</small>
          </template>

          <template #requestDateTemplate="{ data }">{{ data.requestDate ? formatDate(data.requestDate) : '—' }}</template>
          <template #enteredGemSortDateTemplate="{ data }">{{ data.enteredGemSortDate ? formatDate(data.enteredGemSortDate) : '—' }}</template>
          <template #waitingDaysTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.waitingDays) }}</div>
          </template>

          <template #gemsTemplate="{ data }">
            <div class="materials-waiting-plans-panel__gems">
              <div v-for="(gem, idx) in data.gems || []" :key="idx" class="materials-waiting-plans-panel__gem-line">
                <span>{{ gemLineLabel(gem) }}</span>
                <span class="materials-waiting-plans-panel__chip" :class="`materials-waiting-plans-panel__chip--${statusVariant(gem.status)}`">
                  {{ gemStatusChipLabel(gem) }}
                </span>
              </div>
              <span v-if="!data.gems || !data.gems.length">—</span>
            </div>
          </template>

          <template #dueDateTemplate="{ data }">{{ data.dueDate ? formatDate(data.dueDate) : '—' }}</template>

          <template #workersTemplate="{ data }">
            <PlanWorkersCell :workers="data.workers" :worker-items="data.workerItems" />
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { formatDate } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { resolvePlanLinkState, PLAN_DETAIL_ROUTE_NAME, EXECUTIVE_PLAN_DETAIL_ROUTE_NAME } from './wip-plan-table-helpers.js'
import { resolveGemName, resolveGemShapeName, resolveGemStatusVariant, resolveGemStatusLabelKey, MATERIALS_GEM_STATUS_VALUES } from './materials-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import ToggleGroupGeneric from '@/components/generic/ToggleGroupGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import PlanWorkersCell from './plan-workers-cell.vue'

export default {
  name: 'MaterialsWaitingPlansPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    InfoTipGeneric,
    ButtonGeneric,
    ToggleGroupGeneric,
    BaseDataTable,
    PlanWorkersCell
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    const authStore = useAuthStore()
    const masterStore = useMasterApiStore()
    return { productionInsightStore, authStore, masterStore }
  },

  data() {
    return {
      items: [],
      total: 0,
      gemStatus: ''
    }
  },

  computed: {
    tableRows() {
      return this.items
    },

    statusOptions() {
      return [
        { value: '', label: this.$t('common.label.all') },
        ...MATERIALS_GEM_STATUS_VALUES.map((value) => ({ value, label: this.$t(`view.productionInsight.materials.gemStatus.${value}`) }))
      ]
    },

    // BaseDataTable/PrimeVue เรนเดอร์ทั้ง `header` prop และ `#header-<field>` slot คู่กันเสมอ — คอลัมน์นี้ไม่มี
    // custom header slot เลย (แค่ body template) จึงไม่ต้องเคลียร์ header ตัวไหนทิ้ง
    columns() {
      return [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'product', header: this.$t('view.executive.production.colProduct'), sortable: false, minWidth: '150px' },
        { field: 'requestDate', header: this.$t('view.productionInsight.materials.waitingColRequestDate'), sortable: false, minWidth: '100px' },
        { field: 'enteredGemSortDate', header: this.$t('view.productionInsight.materials.waitingColEnteredDate'), sortable: false, minWidth: '110px' },
        { field: 'waitingDays', header: this.$t('view.productionInsight.materials.waitingColWaitingDays'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'gems', header: this.$t('view.productionInsight.materials.waitingColGems'), sortable: false, minWidth: '220px' },
        { field: 'dueDate', header: this.$t('view.productionInsight.materials.waitingColDueDate'), sortable: false, minWidth: '100px' },
        { field: 'workers', header: this.$t('view.productionInsight.wip.colWorkers'), sortable: false, minWidth: '140px' }
      ]
    },

    canOpenPlanDetail() {
      const route = this.$router.resolve({ name: PLAN_DETAIL_ROUTE_NAME, params: { id: 0 } })
      return this.permissionService.hasAnyPermission(route.meta.permissions)
    },

    canOpenExecutivePlanDetail() {
      const route = this.$router.resolve({ name: EXECUTIVE_PLAN_DETAIL_ROUTE_NAME, params: { id: 0 } })
      return this.permissionService.hasAnyPermission(route.meta.permissions)
    },

    permissionService() {
      return new PermissionService(this.authStore.getUser, this.authStore.permissions)
    }
  },

  watch: {
    gemStatus() {
      this.resetPaging()
    }
  },

  methods: {
    formatDate,

    planLinkState(data) {
      return resolvePlanLinkState(data.planId, this.canOpenPlanDetail, this.canOpenExecutivePlanDetail)
    },

    openPlanDetail(data) {
      const { routeLocation } = this.planLinkState(data)
      if (!routeLocation) return
      const route = this.$router.resolve(routeLocation)
      window.open(route.href, '_blank', 'noopener')
    },

    formatCount(value) {
      return value != null ? new Intl.NumberFormat('th-TH').format(value) : '—'
    },

    gemLineLabel(gem) {
      const name = resolveGemName(this.masterStore.gem, gem.gem)
      const shape = resolveGemShapeName(this.masterStore.gemShape, gem.shape)
      const metal = gem.metal ? this.$t(`view.productionInsight.gold.metalLabel.${gem.metal}`) : ''
      const parts = [name, shape, gem.size, metal].filter(Boolean)
      return `${parts.join(' ')} ×${this.formatCount(gem.qty)}`
    },

    statusVariant(status) {
      return resolveGemStatusVariant(status)
    },

    gemStatusChipLabel(gem) {
      if (gem.status === 'short') {
        return this.$t('view.productionInsight.materials.gemStatusShortWithAvailable', { available: this.formatCount(gem.available) })
      }
      return this.$t(`view.productionInsight.materials.gemStatus.${resolveGemStatusLabelKey(gem.status, gem.unmatchedReason)}`)
    },

    async fetchData() {
      const res = await this.productionInsightStore.fetchMaterialWaitingPlans({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        gemStatus: this.gemStatus
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
.materials-waiting-plans-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.materials-waiting-plans-panel__toolbar {
  margin-bottom: var(--sp-lg);
}

.materials-waiting-plans-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.materials-waiting-plans-panel__gems {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.materials-waiting-plans-panel__gem-line {
  display: flex;
  align-items: center;
  gap: var(--sp-xs);
  flex-wrap: wrap;
}

.materials-waiting-plans-panel__chip {
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
