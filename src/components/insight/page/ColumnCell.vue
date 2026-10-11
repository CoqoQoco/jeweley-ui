<!--
  ColumnCell — เรนเดอร์เซลล์ 1 ช่องตาม column definition ของ columns.js (ใช้ใน TableBlock/PlanTableBlock) —
  logic ตัดสินว่าแสดงอะไรอยู่ใน resolveCell() (pure + มีเทส) ไฟล์นี้แค่ map เป็น template

  Props:
    col  — Object (required) — column definition
    data — Object (required) — แถวข้อมูล
    ctx  — Object ({}) — context ของ InsightPage (ใช้กับ onClick ของ column แบบ action)
-->
<template>
  <ButtonGeneric
    v-if="cell.kind === 'planLink' && linkState.canOpen"
    variant="plain"
    icon="bi-box-arrow-up-right"
    :label="cell.label"
    :title="$t('view.productionInsight.wip.planLinkTitle')"
    @click="openPlanDetail"
  />
  <span v-else-if="cell.kind === 'planLink'" class="column-cell__inline">
    {{ cell.label }}
    <InfoTipGeneric :text="$t('view.productionInsight.wip.planLinkNoPermission')" />
  </span>

  <template v-else-if="cell.kind === 'product'">
    <strong>{{ cell.primary }}</strong>
    <br v-if="cell.secondary" />
    <small v-if="cell.secondary" class="text-muted">{{ cell.secondary }}</small>
  </template>

  <template v-else-if="cell.kind === 'dept'">
    <strong v-if="col.bold">{{ cell.text }}</strong>
    <template v-else>{{ cell.text }}</template>
    <br v-if="cell.sub" />
    <small v-if="cell.sub" class="text-muted">{{ cell.sub }}</small>
  </template>

  <div v-else-if="cell.kind === 'lastUpdate'" :title="cell.title">
    {{ cell.text }}
    <br />
    <small class="text-muted">{{ cell.sub }}</small>
  </div>

  <PlanWorkersCell v-else-if="cell.kind === 'workers'" :workers="data.workers" :worker-items="data.workerItems" />

  <div v-else-if="cell.kind === 'number'" :class="numberClass">
    <ButtonGeneric v-if="cell.asAction" variant="plain" :label="cell.text" :title="col.actionTitle ? $t(col.actionTitle) : ''" @click.stop="col.onClick(data, ctx)" />
    <template v-else>
      <span :style="cell.color ? { color: cell.color } : null">{{ cell.text }}</span>
      <InfoTipGeneric v-if="cell.tip" :text="cell.tip" />
      <template v-if="cell.suffix">
        {{ ' ' }}<span class="column-cell__suffix">{{ cell.suffix }}</span>
      </template>
      <span v-if="cell.badge" :class="['column-cell__badge', `column-cell__badge--${cell.badgeTone}`]">{{ cell.badge }}</span>
    </template>
  </div>

  <div v-else-if="cell.kind === 'percent'" class="text-right">{{ cell.text }}</div>

  <span v-else-if="cell.kind === 'chip'" class="column-cell__chip" :style="{ color: cell.color, borderColor: cell.color }">{{ cell.text }}</span>

  <template v-else-if="cell.kind === 'shareBar'">
    <span v-if="!cell.hasData" class="column-cell__no-data">
      —
      <InfoTipGeneric v-if="cell.tip" :text="cell.tip" />
    </span>
    <div v-else class="column-cell__share-bar" :title="cell.title">
      <span class="column-cell__share-wait" :style="{ width: cell.waitPercent + '%' }"></span>
      <span class="column-cell__share-work" :style="{ width: cell.workPercent + '%' }"></span>
    </div>
  </template>

  <ChartGeneric v-else-if="cell.kind === 'sparkline'" type="line" :series="[{ data: cell.values }]" :options="sparklineOptions" :height="32" />

  <template v-else>{{ cell.text }}</template>
</template>

<script>
import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'
import { CHART_TOKENS } from '@/services/utils/chart-colors.js'
import { resolvePlanLinkState, PLAN_DETAIL_ROUTE_NAME, EXECUTIVE_PLAN_DETAIL_ROUTE_NAME } from '@/components/insight/plan-table-helpers.js'
import { resolveCell } from './columns.js'

import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import InfoTipGeneric from '@/components/generic/InfoTipGeneric.vue'
import ChartGeneric from '@/components/prime-vue/ChartGeneric.vue'
import PlanWorkersCell from '@/components/insight/plan-workers-cell.vue'

export default {
  name: 'ColumnCell',

  components: { ButtonGeneric, InfoTipGeneric, ChartGeneric, PlanWorkersCell },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  props: {
    col: { type: Object, required: true },
    data: { type: Object, required: true },
    ctx: { type: Object, default: () => ({}) }
  },

  computed: {
    cell() {
      return resolveCell(this.col, this.data, (key, params) => this.$t(key, params), this.ctx)
    },

    numberClass() {
      return [{ 'text-right': this.col.align === 'right', 'column-cell__negative': this.cell.negative }]
    },

    permissionService() {
      return new PermissionService(this.authStore.getUser, this.authStore.permissions)
    },

    linkState() {
      if (this.col.kind !== 'planLink') return { canOpen: false, routeLocation: null }
      const full = this.permissionService.hasAnyPermission(this.$router.resolve({ name: PLAN_DETAIL_ROUTE_NAME, params: { id: 0 } }).meta.permissions)
      const readOnly = this.permissionService.hasAnyPermission(this.$router.resolve({ name: EXECUTIVE_PLAN_DETAIL_ROUTE_NAME, params: { id: 0 } }).meta.permissions)
      return resolvePlanLinkState(this.data.planId, full, readOnly)
    },

    sparklineOptions() {
      return { chart: { sparkline: { enabled: true } }, stroke: { width: 2, curve: 'smooth' }, colors: [CHART_TOKENS.sub], tooltip: { enabled: false } }
    }
  },

  methods: {
    openPlanDetail() {
      if (!this.linkState.routeLocation) return
      window.open(this.$router.resolve(this.linkState.routeLocation).href, '_blank', 'noopener')
    }
  }
}
</script>

<style lang="scss" scoped>
.column-cell__inline {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-xs);
}

.column-cell__suffix {
  color: var(--base-sub-color);
  font-size: var(--fs-sm);
}

.column-cell__negative {
  color: var(--base-red);
}

.column-cell__badge {
  display: inline-flex;
  align-items: center;
  margin-left: var(--sp-xs);
  padding: 1px var(--sp-xs);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;

  &--warning {
    background: var(--base-warning);
    color: var(--base-font-color);
  }

  &--danger {
    background: var(--base-red);
    color: var(--on-inverse);
  }
}

.column-cell__chip {
  display: inline-flex;
  align-items: center;
  padding: var(--sp-xs) var(--sp-sm);
  border: 1px solid;
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  font-weight: 700;
}

.column-cell__no-data {
  color: var(--base-sub-color);
}

.column-cell__share-bar {
  display: flex;
  width: 100%;
  height: 6px;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--color-border);
}

.column-cell__share-wait {
  background: var(--base-sub-color);
}

.column-cell__share-work {
  background: var(--base-green);
}
</style>
