<!--
  gold-stage-pending-return-panel — ตาราง "ค้างไม่รับคืน" (reportRef: goldStagePending) ของส่วน "Loss ตามใบงาน
  รายแผนก" — เรียก ProductionInsight/GoldStagePendingReturn (DataSourceRequest +
  metal/start/end/departmentKeys/olderThanDays) — olderThanDays ใช้ตัวเดียวกับ filter.olderThanDays ของหมวด
  gold (เหมือน gold-uncovered-jobs-panel.vue) ไม่มีตัวกรองแผนกใน UI (ส่ง departmentKeys ว่างเสมอ)

  คอลัมน์ "รหัสช่าง" โชว์ชื่อช่างใต้รหัสด้วย (field workerName ใหม่) แยกคนละบรรทัดภายในเซลล์เดียวกันเสมอ (ไม่ต่อ
  เป็นสตริงเดียว) กันข้อความเซลล์ถัดไปดูเหมือนไหลติดกันตอนรหัส+ชื่อยาวกว่าความกว้างคอลัมน์เดิม (ยืนยันจาก user
  ตรวจบน prod) — แถวที่ isQueue=true คือใบที่ยังไม่ได้จ่ายให้ช่างคนไหนเลย รอคิวอยู่ (เช่น รหัส "CG9K" ไม่ใช่รหัส
  ช่างจริง เป็นคิวที่ยังไม่มีคนรับ) ซ่อนแถวกลุ่มนี้เป็นค่าเริ่มต้น (ส่ง includeQueue=false ให้ backend กรองออกให้
  เลย) — กดสวิตช์ด้านบนตารางเพื่อดู ยืนยันจาก API agent 2026-10-01

  Props:
    metal         — String ('GOLD') — 'GOLD'|'SILVER'
    olderThanDays — Number (14)
    start         — Date (required)
    end           — Date (required)
-->
<template>
  <div id="insight-report-goldStagePending" class="gold-stage-pending-return-panel">
    <SectionCardGeneric :title="$t('view.productionInsight.gold.stagePendingTitle')" icon="bi-hourglass-split" accent="warning" headerStyle="legend">
      <CheckboxGeneric v-model="includeQueue" :label="$t('view.productionInsight.gold.stagePendingIncludeQueueToggle')" class="gold-stage-pending-return-panel__toggle" />

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
            <span v-else class="gold-stage-pending-return-panel__plan-no">
              {{ data.woText || data.woNumber || data.wo }}
              <InfoTipGeneric :text="$t('view.productionInsight.wip.planLinkNoPermission')" />
            </span>
          </template>

          <template #workerCodeTemplate="{ data }">
            <div class="gold-stage-pending-return-panel__worker">
              <span v-if="data.isQueue" class="gold-stage-pending-return-panel__queue">
                <i class="bi bi-hourglass-split"></i>
                {{ data.workerCode || '—' }}
              </span>
              <span v-else>{{ data.workerCode || '—' }}</span>
              <span v-if="data.workerName" class="gold-stage-pending-return-panel__worker-name">{{ data.workerName }}</span>
            </div>
          </template>
          <template #sentDateTemplate="{ data }">{{ data.sentDate ? formatDate(data.sentDate) : '—' }}</template>
          <template #sendGramTemplate="{ data }">
            <div class="text-right">{{ formatGram(data.sendGram) }}</div>
          </template>
          <template #daysSinceTemplate="{ data }">
            <div class="text-right">{{ formatCount(data.daysSince) }}</div>
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
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

export default {
  name: 'GoldStagePendingReturnPanel',

  mixins: [dataTablePaging],

  components: {
    SectionCardGeneric,
    InfoTipGeneric,
    ButtonGeneric,
    CheckboxGeneric,
    BaseDataTable
  },

  setup() {
    const productionInsightStore = useProductionInsightApiStore()
    const authStore = useAuthStore()
    return { productionInsightStore, authStore }
  },

  props: {
    metal: {
      type: String,
      default: 'GOLD'
    },
    olderThanDays: {
      type: Number,
      default: 14
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
      total: 0,
      includeQueue: false
    }
  },

  computed: {
    tableRows() {
      return this.items.map((row) => ({ ...row, deptLabel: this.$t(`view.executive.department.${row.deptKey}`) }))
    },

    columns() {
      return [
        { field: 'wo', header: this.$t('view.executive.production.colWo'), sortable: false, minWidth: '130px' },
        { field: 'deptLabel', header: this.$t('view.productionInsight.gold.stageColDept'), sortable: false, minWidth: '90px' },
        { field: 'workerCode', header: this.$t('view.productionInsight.gold.workersColWorkerCode'), sortable: false, minWidth: '120px' },
        { field: 'sentDate', header: this.$t('view.productionInsight.gold.stagePendingColSentDate'), sortable: false, minWidth: '110px' },
        { field: 'sendGram', header: this.$t('view.productionInsight.gold.stageColSend'), sortable: false, minWidth: '90px', align: 'right' },
        { field: 'daysSince', header: this.$t('view.productionInsight.gold.stagePendingColDaysSince'), sortable: false, minWidth: '100px', align: 'right' }
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
    },

    // รวมตัวกรองทั้งหมดเป็น key เดียว กัน resetPaging() ยิงซ้ำตอนเปลี่ยนหลายค่าพร้อมกัน (เช่น preset เปลี่ยน
    // start+end พร้อมกัน) — pattern เดียวกับบั๊กจริงที่เจอบน delivery-late-plans-panel.vue 2026-10-01
    resetPagingKey() {
      return JSON.stringify([this.metal, this.olderThanDays, this.start, this.end, this.includeQueue])
    }
  },

  watch: {
    resetPagingKey() {
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

    formatGram(value) {
      return value != null ? new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value) : '—'
    },

    async fetchData() {
      const res = await this.productionInsightStore.fetchGoldStagePendingReturnJobs({
        take: this.take,
        skip: this.skip,
        sort: this.sort,
        metal: this.metal,
        start: this.start,
        end: this.end,
        olderThanDays: this.olderThanDays,
        includeQueue: this.includeQueue
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
.gold-stage-pending-return-panel {
  scroll-margin-top: calc(var(--mainbar-height) + 64px);
  min-width: 0;
}

.gold-stage-pending-return-panel__plan-no {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.gold-stage-pending-return-panel__toggle {
  margin-bottom: var(--sp-md);
}

.gold-stage-pending-return-panel__queue {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
  color: var(--base-sub-color);
  font-style: italic;
}

.gold-stage-pending-return-panel__worker {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.gold-stage-pending-return-panel__worker-name {
  font-size: var(--fs-sm);
  color: var(--base-sub-color);
}
</style>
