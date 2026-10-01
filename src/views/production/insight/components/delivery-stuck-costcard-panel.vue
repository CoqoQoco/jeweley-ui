<!--
  delivery-stuck-costcard-panel — ตาราง "ค้างหลังบัตรต้นทุน" (reportRef: stuckCostCard) ของหมวด
  "ส่งงานตรงเวลา" — เรียก ProductionInsight/StuckAfterCostCardPlans (DataSourceRequest) — item = stale-plan
  base fields + costCardDate/daysSinceCostCard — ไม่มีตัวกรองแผนก/ช่วงเวลา (ใบงานหลังออกบัตรต้นทุนทั้งหมดที่
  ยังไม่ปิด ไม่ขึ้นกับช่วงเวลาที่เลือก เหมือนตาราง "ใบงานค้าง"/"เสี่ยงเลยกำหนด") — endpoint นี้ไม่ส่ง
  lastUpdateBy/lastAction/workers มาด้วย (null/[] เสมอ ตามคอนแทรคจริง) จึงไม่มีคอลัมน์ "อัปเดตล่าสุด"/"ช่าง"
  ต่างจาก delivery-at-risk-panel.vue ที่มี
-->
<template>
  <div id="insight-report-stuckCostCard" class="delivery-stuck-costcard-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.delivery.stuckCostCardTitle')" icon="bi-clipboard-x" accent="warning" headerStyle="legend">
      <p class="delivery-stuck-costcard-panel__note">{{ $t('view.productionInsight.wip.asOfTodayNote') }}</p>

      <div class="responsive-table-wrapper">
        <BaseDataTable
          :items="items"
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
            <span v-else class="delivery-stuck-costcard-panel__plan-no">
              {{ data.woText || data.woNumber || data.wo }}
              <InfoTipGeneric :text="$t('view.productionInsight.wip.planLinkNoPermission')" />
            </span>
          </template>

          <template #productTemplate="{ data }">
            <strong>{{ data.productNumber }}</strong>
            <br v-if="data.productName" />
            <small v-if="data.productName" class="text-muted">{{ data.productName }}</small>
          </template>

          <template #costCardDateTemplate="{ data }">
            {{ data.costCardDate ? formatDate(data.costCardDate) : '—' }}
          </template>

          <template #daysSinceCostCardTemplate="{ data }">
            <div class="text-right">{{ data.daysSinceCostCard }}</div>
          </template>
        </BaseDataTable>
      </div>
    </SectionCardGeneric>
  </div>
</template>

<script>
import { useProductionInsightApiStore } from '@/stores/modules/api/production/production-insight-api.js'
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { formatDate } from '@/services/utils/dayjs.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'
import { resolvePlanLinkState, PLAN_DETAIL_ROUTE_NAME, EXECUTIVE_PLAN_DETAIL_ROUTE_NAME } from './wip-plan-table-helpers.js'

import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'DeliveryStuckCostcardPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    InfoTipGeneric,
    ButtonGeneric,
    BaseDataTable
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    const authStore = useAuthStore()
    return { productionInsightStore, authStore }
  },

  data() {
    return {
      items: [],
      total: 0
    }
  },

  computed: {
    columns() {
      return [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'mold', header: this.$t('view.executive.production.colMold'), sortable: false, minWidth: '110px' },
        { field: 'product', header: this.$t('view.executive.production.colProduct'), sortable: false, minWidth: '160px' },
        { field: 'costCardDate', header: this.$t('view.productionInsight.delivery.stuckCostCardColDate'), sortable: false, minWidth: '120px' },
        { field: 'daysSinceCostCard', header: this.$t('view.productionInsight.delivery.stuckCostCardColDays'), sortable: false, minWidth: '90px', align: 'right' }
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

    async fetchData() {
      const res = await this.productionInsightStore.fetchStuckAfterCostCardPlans({
        take: this.take,
        skip: this.skip,
        sort: this.sort
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

.delivery-stuck-costcard-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.delivery-stuck-costcard-panel__note {
  margin: 0 0 var(--sp-sm);
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
  font-style: italic;
}

.delivery-stuck-costcard-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}
</style>
