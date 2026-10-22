// material.config.js — config ของแท็บ "คลังวัตถุดิบ" (executive) สำหรับ InsightPage — MaterialInsight/Overview (kind GOLD, หน่วย g) ยิงครั้งเดียวป้อน findings/KPI/ทุกแท็บ
// ไม่ผูกกับ metal scope ของทั้งหน้า (source.scoped:false → body = {kind, months} เท่านั้น) · ctx.filter = { kind, canManage } (canManage = มีสิทธิ์ material:manage-min)
// ของที่ทองไม่มี: ยอดที่อยู่ในกระบวนการ (onProcess = 0 เสมอ ledger ไม่ดูแล) และพยากรณ์ (ต้องมีประวัติเบิกใช้ ≥ minHistoryMonths) → ไม่มี KPI/คอลัมน์ onProcess; พยากรณ์ขึ้นเองเมื่อ API ส่งมา
// ข้อความ rules อยู่ที่ view.productionInsight.materialInsight.rules (config.i18nPrefix)
import { markRaw } from 'vue'

import * as col from '@/components/insight/page/columns.js'
import MaterialItemsToolbar from './material-items-toolbar.vue'
import MaterialMinModal from './material-min-modal.vue'
import MaterialPolicyDrawer from './material-policy-drawer.vue'
import {
  MATERIAL_ENDPOINT,
  ITEM_FILTERS,
  DEFAULT_ITEM_FILTER,
  STATUS_COLOR,
  buildOverviewParams,
  buildItemRows,
  buildGroupRows,
  buildGroupSlices,
  aggregateBySize,
  itemFilterCounts,
  resolveStatusVariant,
  resolveMaterialReportTarget,
  buildUsageHint,
  buildMonthLabels,
  formatGram,
  formatDays
} from './material-helpers.js'

const S = 'view.productionInsight.materialInsight'

const overviewOf = (ctx) => ctx.data.Overview || {}
const kpiOf = (ctx) => overviewOf(ctx).kpi || {}
const kindOf = (ctx) => ctx.filter?.kind || 'GOLD'
const countText = (value) => new Intl.NumberFormat('th-TH').format(value || 0)
const gram = (row, t, raw) => formatGram(raw)
const gramUnit = (value) => `${formatGram(value)} g`

const openMinModal = (row, ctx) => ctx.setState('minModal', row)

// ตารางรายการ: คอลัมน์เหมือนกัน 2 ชุด — ชุดอ่านอย่างเดียว (ทุกคน) กับชุดมีปุ่มแก้ไข (ผู้มีสิทธิ์) สลับกันด้วย node.visible
const itemColumns = [
  col.text('label', `${S}.colItem`, { minWidth: '200px', strong: true }),
  col.number('onHand', `${S}.colOnHand`, 'count', { display: gram, minWidth: '110px' }),
  col.number('avgMonthlyUsage', `${S}.colAvgMonthly`, 'count', { display: gram, minWidth: '120px' }),
  col.number('coverDays', `${S}.colCoverDays`, 'count', { display: (row, t, raw) => formatDays(raw), tip: `${S}.colCoverDaysTip`, minWidth: '100px' }),
  col.number('autoMin', `${S}.colAutoMin`, 'count', { display: gram, minWidth: '120px' }),
  col.number('effectiveMin', `${S}.colEffectiveMin`, 'count', { display: gram, badge: (row) => row.minSourceText, minWidth: '150px' }),
  col.chip('statusText', `${S}.colStatus`, (row) => resolveStatusVariant(row.status), (row) => row.statusText, {
    color: (variant) => STATUS_COLOR[variant],
    borderColor: (variant) => STATUS_COLOR[variant],
    minWidth: '110px'
  }),
  col.text('lastMoveText', `${S}.colLastMove`, { minWidth: '170px' })
]

const editColumn = col.text('editText', `${S}.colEdit`, { minWidth: '70px', onClick: openMinModal, actionIcon: 'bi-pencil', actionTitle: `${S}.editTitle` })

const itemsTable = (id, columns, visible) => ({
  type: 'table',
  id,
  tab: 'items',
  source: 'Overview',
  title: `${S}.itemsTitle`,
  icon: 'bi-table',
  visible,
  sections: [
    { rows: (ctx) => buildItemRows(overviewOf(ctx).items, ctx.state.itemsFilter, ctx.t), columns, dataKey: 'rowKey' },
    { kind: 'text', tone: 'foot', text: (ctx, t) => buildUsageHint(overviewOf(ctx).usageHistory, t) }
  ]
})

const groupColumns = [
  col.text('label', `${S}.colGroup`, { minWidth: '180px', strong: true }),
  col.days('itemCount', `${S}.colItemCount`),
  col.number('onHand', `${S}.colOnHand`, 'count', { display: gram, minWidth: '120px' })
]

const sizeColumns = [
  col.text('label', `${S}.colSize`, { minWidth: '180px', strong: true }),
  col.days('itemCount', `${S}.colItemCount`),
  col.number('onHand', `${S}.colOnHand`, 'count', { display: gram, minWidth: '120px' })
]

// ตัวสลับ + ปุ่มตั้งค่าเกณฑ์ (component เป็น markRaw — config ผ่าน data()/props แล้วถูกห่อ reactive)
const ItemsToolbar = markRaw(MaterialItemsToolbar)
const MinModal = markRaw(MaterialMinModal)
const PolicyDrawer = markRaw(MaterialPolicyDrawer)

export const materialGoldConfig = markRaw({
  titleKey: `${S}.title`,
  i18nPrefix: `${S}.rules`,
  findings: { source: 'Overview' },
  // matItems/matOnProcess มีตารางที่เลือกด้วยตัวสลับ → เลือกแท็บ + ตัวสลับตามชนิด finding / การ์ด KPI (ref อื่นจับคู่ block id)
  tabFor: (reportRef, params, ctx) => resolveMaterialReportTarget(reportRef, params, ctx),

  tabs: [
    { key: 'overview', label: `${S}.tabs.overview` },
    { key: 'groups', label: `${S}.tabs.groups` },
    { key: 'trend', label: `${S}.tabs.trend` },
    { key: 'items', label: `${S}.tabs.items` }
  ],

  sources: {
    Overview: { endpoint: MATERIAL_ENDPOINT, scoped: false, params: (f) => buildOverviewParams(f.kind) }
  },

  state: {
    itemsFilter: { initial: DEFAULT_ITEM_FILTER },
    minModal: { initial: null },
    policyDrawer: { initial: false }
  },

  blocks: [
    {
      type: 'kpi',
      id: 'matKpi',
      tab: 'overview',
      source: 'Overview',
      title: `${S}.kpiGroupTitle`,
      icon: 'bi-speedometer2',
      gridColumns: 5,
      asOf: (ctx) => overviewOf(ctx).asOf,
      cards: [
        {
          id: 'items',
          icon: 'bi-collection',
          label: `${S}.kpi.items`,
          value: (ctx) => kpiOf(ctx).itemCount,
          sub: (ctx, t) => t(`${S}.kpi.itemsSub`, { withUsage: countText(kpiOf(ctx).withUsageCount) }),
          reportRef: 'matItems',
          reportParams: { itemFilter: 'all' }
        },
        {
          id: 'onHand',
          icon: 'bi-box-seam',
          label: `${S}.kpi.onHand`,
          value: (ctx) => gramUnit(kpiOf(ctx).totalOnHand),
          format: 'text',
          sub: (ctx, t) => t(`${S}.kpi.onHandSub`),
          reportRef: 'matGroups'
        },
        {
          id: 'attention',
          icon: 'bi-exclamation-octagon',
          label: `${S}.kpi.attention`,
          value: (ctx) => (kpiOf(ctx).zeroCount || 0) + (kpiOf(ctx).belowMinCount || 0),
          sub: (ctx, t) => t(`${S}.kpi.attentionSub`, { zero: countText(kpiOf(ctx).zeroCount), below: countText(kpiOf(ctx).belowMinCount) }),
          tone: (ctx) => ((kpiOf(ctx).zeroCount || 0) + (kpiOf(ctx).belowMinCount || 0) > 0 ? 'warning' : 'green'),
          reportRef: 'matItems',
          reportParams: { itemFilter: 'attention' }
        },
        {
          id: 'near',
          icon: 'bi-hourglass-split',
          label: `${S}.kpi.near`,
          value: (ctx) => kpiOf(ctx).nearMinCount,
          tone: (ctx) => ((kpiOf(ctx).nearMinCount || 0) > 0 ? 'warning' : 'green'),
          reportRef: 'matItems',
          reportParams: { itemFilter: 'near' }
        },
        {
          id: 'dead',
          icon: 'bi-moon',
          label: `${S}.kpi.dead`,
          value: (ctx) => kpiOf(ctx).deadCount,
          sub: (ctx, t) => t(`${S}.kpi.deadSub`, { weight: gramUnit(kpiOf(ctx).deadOnHand), days: overviewOf(ctx).policy?.deadStockDays ?? '—' }),
          tone: (ctx) => ((kpiOf(ctx).deadCount || 0) > 0 ? 'warning' : 'green'),
          reportRef: 'matItems',
          reportParams: { itemFilter: 'dead' }
        }
      ]
    },

    {
      type: 'donut',
      id: 'matShare',
      tab: 'overview',
      source: 'Overview',
      title: `${S}.shareTitle`,
      icon: 'bi-pie-chart',
      height: 300,
      valueFormat: 'decimal',
      center: { label: `${S}.centerTotal`, value: (total) => gramUnit(total) },
      slices: (ctx) => buildGroupSlices(overviewOf(ctx).groups)
    },

    {
      type: 'bar',
      id: 'matGroups',
      tab: 'groups',
      source: 'Overview',
      title: `${S}.groupsChartTitle`,
      icon: 'bi-bar-chart',
      horizontal: true,
      dataLabels: true,
      valueFormat: 'decimal',
      rows: (ctx) => buildGroupRows(overviewOf(ctx).groups),
      category: (row) => row.label,
      series: [{ label: `${S}.seriesOnHand`, value: (row) => row.onHand, color: 'token:green' }]
    },

    {
      type: 'table',
      id: 'matGroupTable',
      tab: 'groups',
      source: 'Overview',
      title: `${S}.groupsTableTitle`,
      icon: 'bi-table',
      sections: [{ rows: (ctx) => buildGroupRows(overviewOf(ctx).groups), columns: groupColumns, dataKey: 'key' }]
    },

    {
      type: 'table',
      id: 'matSizeTable',
      tab: 'groups',
      source: 'Overview',
      title: `${S}.sizesTableTitle`,
      icon: 'bi-rulers',
      sections: [{ rows: (ctx) => aggregateBySize(overviewOf(ctx).items), columns: sizeColumns, dataKey: 'key' }]
    },

    {
      type: 'trend',
      id: 'matTrend',
      tab: 'trend',
      source: 'Overview',
      title: `${S}.trendTitle`,
      icon: 'bi-graph-up-arrow',
      height: 340,
      columnWidth: '60%',
      axisTitles: [`${S}.axisFlow`, `${S}.axisStock`],
      points: (ctx) => overviewOf(ctx).series || [],
      categories: (points) => buildMonthLabels(points),
      series: [
        { field: 'inflow', type: 'bar', label: `${S}.seriesInflow`, color: 'green', axis: 0, format: 'gram' },
        { field: 'consumed', type: 'bar', label: `${S}.seriesConsumed`, color: 'warning', axis: 0, format: 'gram' },
        { field: 'returned', type: 'bar', label: `${S}.seriesReturned`, color: 'primary', axis: 0, format: 'gram' },
        { field: 'other', type: 'bar', label: `${S}.seriesOther`, color: 'border', axis: 0, format: 'gram', hidden: true },
        { field: 'endStock', type: 'line', label: `${S}.seriesEndStock`, color: 'sub', axis: 1, format: 'gram' }
      ],
      hint: (ctx, t) => `${t(`${S}.trendHintNet`)} ${buildUsageHint(overviewOf(ctx).usageHistory, t)}`
    },

    {
      type: 'slot',
      id: 'matItemsToolbar',
      tab: 'items',
      component: ItemsToolbar,
      props: (ctx) => {
        const counts = itemFilterCounts(kpiOf(ctx))
        return {
          modelValue: ctx.state.itemsFilter,
          ariaLabel: ctx.t(`${S}.filterAria`),
          canManage: !!ctx.filter?.canManage,
          options: ITEM_FILTERS.map((value) => ({ value, label: ctx.t(`${S}.filter.${value}`, { count: countText(counts[value]) }) }))
        }
      },
      events: {
        'update:modelValue': (ctx, value) => ctx.setState('itemsFilter', value),
        'open-policy': (ctx) => ctx.setState('policyDrawer', true)
      }
    },

    itemsTable('matItems', itemColumns, (ctx) => !ctx.filter?.canManage),
    itemsTable('matItemsEdit', [...itemColumns, editColumn], (ctx) => !!ctx.filter?.canManage)
  ],

  // อยู่นอกแท็บ — โมดัลตั้งขั้นต่ำ/ลิ้นชักตั้งค่าเกณฑ์ (บันทึกสำเร็จ → ยิง Overview ซ้ำ)
  floating: [
    {
      type: 'slot',
      id: 'matMinModal',
      component: MinModal,
      props: (ctx) => ({ isShow: !!ctx.state.minModal, item: ctx.state.minModal, kind: kindOf(ctx), policy: overviewOf(ctx).policy || null }),
      events: {
        closeModal: (ctx) => ctx.setState('minModal', null),
        saved: (ctx) => {
          ctx.setState('minModal', null)
          ctx.reload(['Overview'])
        }
      }
    },
    {
      type: 'slot',
      id: 'matPolicyDrawer',
      component: PolicyDrawer,
      props: (ctx) => ({ isShow: !!ctx.state.policyDrawer, kind: kindOf(ctx), policy: overviewOf(ctx).policy || null }),
      events: {
        close: (ctx) => ctx.setState('policyDrawer', false),
        saved: (ctx) => {
          ctx.setState('policyDrawer', false)
          ctx.reload(['Overview'])
        }
      }
    }
  ]
})

// kind → config (GEM จะเพิ่มภายหลัง)
export const MATERIAL_CONFIGS = { GOLD: materialGoldConfig }

export function getMaterialConfig(kind) {
  return MATERIAL_CONFIGS[kind] || materialGoldConfig
}

export default materialGoldConfig
