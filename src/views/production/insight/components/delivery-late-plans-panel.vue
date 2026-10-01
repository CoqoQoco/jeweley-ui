<!--
  delivery-late-plans-panel — ตาราง "ส่งช้าในช่วงนี้" (reportRef: latePlans) ของหมวด "ส่งงานตรงเวลา" —
  เรียก ProductionInsight/DeliveryLatePlans (DataSourceRequest + ช่วงเวลา) — item = stale-plan base fields +
  requestDate/doneDate/lateDays — ใบงานที่เสร็จแล้วแต่เสร็จช้ากว่าวันกำหนดส่งในช่วงที่เลือก — endpoint นี้ไม่ส่ง
  lastUpdateBy/lastAction/workers มาด้วย (null/[] เสมอ ตามคอนแทรคจริง) จึงไม่มีคอลัมน์ "อัปเดตล่าสุด"/"ช่าง"
  ต่างจาก delivery-at-risk-panel.vue ที่มี

  ช่วงเวลามาจาก props (คุมจาก RangePresetGeneric/FilterPanelGeneric ของ ProductionInsightView)

  Props:
    start — Date (required)
    end   — Date (required)
-->
<template>
  <div id="insight-report-latePlans" class="delivery-late-plans-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.delivery.latePlansTitle')" icon="bi-clock-history" accent="warning" headerStyle="legend">
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
            <span v-else class="delivery-late-plans-panel__plan-no">
              {{ data.woText || data.woNumber || data.wo }}
              <InfoTipGeneric :text="$t('view.productionInsight.wip.planLinkNoPermission')" />
            </span>
          </template>

          <template #productTemplate="{ data }">
            <strong>{{ data.productNumber }}</strong>
            <br v-if="data.productName" />
            <small v-if="data.productName" class="text-muted">{{ data.productName }}</small>
          </template>

          <template #requestDateTemplate="{ data }">
            {{ data.requestDate ? formatDate(data.requestDate) : '—' }}
          </template>

          <template #doneDateTemplate="{ data }">
            {{ data.doneDate ? formatDate(data.doneDate) : '—' }}
          </template>

          <template #lateDaysTemplate="{ data }">
            <div class="text-right delivery-late-plans-panel__overdue">{{ data.lateDays }}</div>
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
  name: 'DeliveryLatePlansPanel',

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

  props: {
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
    columns() {
      return [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'mold', header: this.$t('view.executive.production.colMold'), sortable: false, minWidth: '110px' },
        { field: 'product', header: this.$t('view.executive.production.colProduct'), sortable: false, minWidth: '160px' },
        { field: 'requestDate', header: this.$t('view.productionInsight.delivery.latePlansColRequestDate'), sortable: false, minWidth: '100px' },
        { field: 'doneDate', header: this.$t('view.productionInsight.delivery.latePlansColDoneDate'), sortable: false, minWidth: '100px' },
        { field: 'lateDays', header: this.$t('view.productionInsight.delivery.latePlansColLateDays'), sortable: false, minWidth: '90px', align: 'right' }
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
    start() {
      this.resetPaging()
    },
    end() {
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

    async fetchData() {
      const res = await this.productionInsightStore.fetchDeliveryLatePlans({
        start: this.start,
        end: this.end,
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

.delivery-late-plans-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.delivery-late-plans-panel__overdue {
  color: var(--base-red);
  font-weight: 700;
}

.delivery-late-plans-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}
</style>
