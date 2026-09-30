<!--
  executive/plan-detail — รายละเอียดใบงาน (ดูอย่างเดียว) สำหรับ boss ที่มี executive:view แต่ไม่มี
  production:edit — เปิดจากลิงก์เลขที่ใบงานในตาราง insight (wip-plan-table-helpers resolvePlanLinkState)
  ไม่มี BOM tab / ปุ่มแก้ไข-โอนงาน-CVD-ลบ-บันทึก / เรียก endpoint เขียนข้อมูลใดๆ ทั้งสิ้น — อ่านอย่างเดียว
  4 กล่อง: (1) ข้อมูลใบงาน (2) ประวัติการเดินงาน (3) วัตถุดิบ (4) ต้นทุน — (3)+(4) วางคู่กันแบบ charts-row-b
-->
<template>
  <div class="executive-plan-detail">
    <PageHeaderGeneric :title="pageTitle" backRoute="executive">
      <template #actions>
        <span class="executive-plan-detail__status-badge" :class="`executive-plan-detail__status-badge--${statusVariant}`">
          {{ statusName }}
        </span>
        <span class="executive-plan-detail__readonly-tag">
          <i class="bi bi-eye"></i>
          {{ $t('view.executive.planDetail.readOnlyTag') }}
        </span>
      </template>
    </PageHeaderGeneric>

    <PlanInfoSection :info="planInfo" />

    <PlanHistorySection :rows="historyRows" />

    <div class="executive-plan-detail__split">
      <PlanMaterialSection :materials="materials" :goldCostItems="goldCostItems" />
      <PlanCostSection :priceItems="priceItems" />
    </div>
  </div>
</template>

<script>
import { useExecutivePlanDetailApiStore } from '@/stores/modules/api/report/executive-plan-detail-api.js'
import { useMasterApiStore } from '@/stores/modules/api/master-store.js'
import {
  resolvePlanStatusVariant,
  resolveCurrentStatusHeader,
  buildPlanHistoryRows,
  findStatusMasterById
} from './plan-detail-helpers.js'

import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import PlanInfoSection from './components/plan-info-section.vue'
import PlanHistorySection from './components/plan-history-section.vue'
import PlanMaterialSection from './components/plan-material-section.vue'
import PlanCostSection from './components/plan-cost-section.vue'

export default {
  name: 'ExecutivePlanDetailView',

  components: {
    PageHeaderGeneric,
    PlanInfoSection,
    PlanHistorySection,
    PlanMaterialSection,
    PlanCostSection
  },

  setup() {
    const planDetailStore = useExecutivePlanDetailApiStore()
    const masterStore = useMasterApiStore()
    return { planDetailStore, masterStore }
  },

  data() {
    return {
      plan: {},
      materials: [],
      goldCostItems: []
    }
  },

  computed: {
    planId() {
      return this.$route.params.id
    },

    pageTitle() {
      return this.$t('view.executive.planDetail.pageTitle', {
        wo: this.plan.wo || '',
        woNumber: this.plan.woNumber || '',
        mold: this.plan.mold || ''
      })
    },

    statusVariant() {
      return resolvePlanStatusVariant(this.plan.status)
    },

    statusName() {
      return findStatusMasterById(this.masterStore.planStatus, this.plan.status)?.nameTh || this.plan.statusName || ''
    },

    // header ที่ตรงกับสถานะปัจจุบัน — ใช้หา "ผู้แก้ไขล่าสุด/วันที่แก้ไขล่าสุด" ของ section ข้อมูลใบงาน
    // (ProductionPlanGet ไม่มี updateBy/updateDate ของตัวเองที่ root — ดู plan-detail-helpers.js)
    currentHeader() {
      return resolveCurrentStatusHeader(this.plan.tbtProductionPlanStatusHeader, this.plan.status)
    },

    planInfo() {
      return {
        mold: this.plan.mold || '',
        productNumber: this.plan.productNumber || '',
        productName: this.plan.productName || '',
        customerName: this.plan.customerName || '',
        customerNumber: this.plan.customerNumber || '',
        productQty: this.plan.productQty ?? null,
        productQtyUnit: this.plan.productQtyUnit || '',
        gold: this.plan.gold || '',
        goldSize: this.plan.goldSize || '',
        requestDate: this.plan.requestDate || null,
        createDate: this.plan.createDate || null,
        lastUpdateBy: this.currentHeader?.updateBy || this.currentHeader?.createBy || '',
        lastUpdateDate: this.currentHeader?.updateDate || this.currentHeader?.createDate || null
      }
    },

    priceItems() {
      return this.plan.priceItems || []
    },

    historyRows() {
      const rows = buildPlanHistoryRows(this.plan.tbtProductionPlanStatusHeader, this.plan.status)
      return rows.map((row) => ({
        ...row,
        statusName: findStatusMasterById(this.masterStore.planStatus, row.status)?.nameTh || row.status
      }))
    }
  },

  methods: {
    async fetchPlan() {
      this.plan = (await this.planDetailStore.fetchPlan(this.planId)) || {}
    },

    async fetchMaterial() {
      this.materials = (await this.planDetailStore.fetchMaterial(this.planId)) || []
    },

    async fetchGoldCostItems() {
      if (!this.plan.wo) return
      const res = await this.planDetailStore.fetchGoldCostItems(`${this.plan.wo}-${this.plan.woNumber}`)
      this.goldCostItems = res?.data || []
    }
  },

  async created() {
    await this.fetchPlan()
    await Promise.all([this.fetchMaterial(), this.fetchGoldCostItems(), this.masterStore.fetchPlanStatus()])
  }
}
</script>

<style lang="scss" scoped>
// legend-style SectionCardGeneric ต้องการ margin-top var(--sp-2xl) เสมอ (เผื่อชิป title คร่อมขอบบน) —
// container sibling-spacing ห้ามเล็กกว่านี้ ดู insight-tab-layout.vue comment + Decision Log
.executive-plan-detail > * + * {
  margin-top: var(--sp-2xl);
}

.executive-plan-detail__status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--sp-xs) var(--sp-md);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  font-weight: 700;

  &--success {
    background: var(--base-green);
    color: var(--on-inverse);
  }

  &--cancelled {
    background: var(--base-sub-color);
    color: var(--on-inverse);
  }

  &--process {
    background: var(--base-warning);
    color: var(--base-font-color);
  }
}

.executive-plan-detail__readonly-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  padding: var(--sp-xs) var(--sp-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--on-inverse);
  color: var(--on-inverse);
  font-size: var(--fs-sm);
  font-weight: 600;
}

// เหมือน .charts-row-b ที่อื่น — เผื่อ clearance ของ legend chip ที่ระดับ container แทน margin-top ของ
// .section-card--legend เอง ให้ทั้ง 2 กล่องในแถวเริ่ม y เดียวกันเป๊ะ (ดู Decision Log)
.executive-plan-detail__split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  gap: var(--sp-md);
  padding-top: var(--sp-2xl);

  > * {
    min-width: 0;
  }

  :deep(.section-card--legend) {
    margin-top: 0 !important;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding-top: 0;

    :deep(.section-card--legend) {
      margin-top: var(--sp-2xl) !important;
    }
  }
}
</style>
