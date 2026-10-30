// material-gem.config.js — config แท็บ "คลังวัตถุดิบ" ชนิดพลอย (GEM) ของ executive — โครงเดียวกับ material.config.js (ทอง) แต่
//  - ปริมาณมีหลายหน่วย (เม็ด/กะรัต) ห้ามบวกรวม → การ์ด/ตารางกลุ่มแสดงเป็นข้อความต่อหน่วย (byUnit) · แถวรายการมีหน่วยของตัวเอง
//  - หัวตัวเลขของการ์ด/โดนัท/กราฟกลุ่มเป็น "มูลค่า (บาท)" · รายการไม่มีราคา = มูลค่า 0 (ป้าย "ไม่มีราคา")
//  - มียอดที่อยู่ในกระบวนการ (onProcess) · ไม่มีทองค้างที่ช่าง/ตารางตามขนาด/ป้ายเตือนยอดติดลบของคลังทอง
//  - กราฟเคลื่อนไหว 1 กราฟต่อหน่วย (ซ่อนหน่วยที่ไม่มีข้อมูล) + กราฟมูลค่า THB
// ข้อความ rules อยู่ที่ view.productionInsight.materialInsight.rulesGem (ยอดรวมต่อหน่วยประกอบเป็นข้อความมาแล้วใน {totalWeight}/{totalOnHand}/{totalOnProcess})
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
  buildGemItemRows,
  buildGemGroupRows,
  buildGemGroupBarRows,
  buildGemGroupSlices,
  remapGemFindings,
  itemFilterCounts,
  resolveStatusVariant,
  resolveMaterialReportTarget,
  buildUsageHint,
  buildMonthLabels,
  formatDays,
  formatQtyUnit,
  formatMoney,
  kpiUnitEntries,
  formatUnitField,
  seriesPointsForUnit,
  hasUnit
} from './material-helpers.js'

const S = 'view.productionInsight.materialInsight'
const G = `${S}.gem`

const overviewOf = (ctx) => ctx.data.Overview || {}
const kpiOf = (ctx) => overviewOf(ctx).kpi || {}
const kindOf = (ctx) => ctx.filter?.kind || 'GEM'
const countText = (value) => new Intl.NumberFormat('th-TH').format(value || 0)
const unitTotals = (ctx, t, field, abs) => formatUnitField(kpiUnitEntries(kpiOf(ctx)), field, t, abs)

const qty = (row, t, raw) => formatQtyUnit(raw, row.unit, t)
const moneyCell = (row, t, raw) => (raw > 0 ? formatMoney(raw) : '—')
const noPriceBadge = (row, t) => (row.noPrice ? t(`${G}.noPrice`) : '')

const openMinModal = (row, ctx) => ctx.setState('minModal', row)

const redWhenNegative = { color: (row) => (row.onHand < 0 ? 'var(--base-red)' : ''), bold: (row) => row.onHand < 0 }

const itemColumns = [
  col.text('label', `${S}.colItem`, { minWidth: '200px', strong: true }),
  col.text('groupName', `${G}.colType`, { minWidth: '120px' }),
  col.number('onHand', `${G}.colOnHand`, 'count', { display: qty, minWidth: '140px', ...redWhenNegative, badge: (row) => row.onHandHint }),
  col.number('onProcess', `${G}.colOnProcess`, 'count', { display: qty, minWidth: '140px' }),
  col.number('value', `${G}.colValue`, 'count', { display: moneyCell, minWidth: '130px', badge: noPriceBadge }),
  col.number('avgMonthlyUsage', `${G}.colAvgMonthly`, 'count', { display: qty, minWidth: '140px' }),
  col.number('coverDays', `${S}.colCoverDays`, 'count', { display: (row, t, raw) => formatDays(raw), tip: `${S}.colCoverDaysTip`, minWidth: '100px' }),
  col.number('autoMin', `${G}.colAutoMin`, 'count', { display: qty, minWidth: '140px' }),
  col.number('effectiveMin', `${G}.colEffectiveMin`, 'count', { display: qty, badge: (row) => row.minSourceText, minWidth: '170px' }),
  col.chip('statusText', `${S}.colStatus`, (row) => resolveStatusVariant(row.status), (row) => row.statusText, {
    color: (variant) => STATUS_COLOR[variant],
    borderColor: (variant) => STATUS_COLOR[variant],
    tip: `${S}.colStatusTip`,
    minWidth: '130px'
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
    { rows: (ctx) => buildGemItemRows(overviewOf(ctx).items, ctx.state.itemsFilter, ctx.t), columns, dataKey: 'rowKey' },
    { kind: 'text', tone: 'foot', text: (ctx, t) => [buildUsageHint(overviewOf(ctx).usageHistory, t), t(`${G}.unitNote`)].filter(Boolean).join(' ') }
  ]
})

const groupColumns = [
  col.text('label', `${G}.colType`, { minWidth: '180px', strong: true }),
  col.days('itemCount', `${S}.colItemCount`),
  col.text('onHandText', `${G}.colOnHand`, { minWidth: '200px' }),
  col.text('onProcessText', `${G}.colOnProcess`, { minWidth: '200px' }),
  col.number('value', `${G}.colValue`, 'count', { display: (row, t, raw) => formatMoney(raw), minWidth: '130px' }),
  col.days('negativeCount', `${S}.colNegativeCount`)
]

const ItemsToolbar = markRaw(MaterialItemsToolbar)
const MinModal = markRaw(MaterialMinModal)
const PolicyDrawer = markRaw(MaterialPolicyDrawer)

// กราฟเคลื่อนไหวของ 1 หน่วย — ซ่อนเมื่อ response ไม่มีหน่วยนั้น
const unitTrend = (id, unit, format) => ({
  type: 'trend',
  id,
  tab: 'trend',
  source: 'Overview',
  title: `${G}.trendTitle.${unit}`,
  icon: 'bi-graph-up-arrow',
  height: 340,
  columnWidth: '60%',
  visible: (ctx) => hasUnit(overviewOf(ctx), unit),
  axisTitles: [`${G}.axisFlow.${unit}`, `${G}.axisStock.${unit}`],
  points: (ctx) => seriesPointsForUnit(overviewOf(ctx), unit),
  categories: (points) => buildMonthLabels(points),
  series: [
    { field: 'inflow', type: 'bar', label: `${S}.seriesInflow`, color: 'green', axis: 0, format },
    { field: 'consumed', type: 'bar', label: `${S}.seriesConsumed`, color: 'warning', axis: 0, format },
    { field: 'returned', type: 'bar', label: `${S}.seriesReturned`, color: 'primary', axis: 0, format },
    { field: 'other', type: 'bar', label: `${S}.seriesOther`, color: 'border', axis: 0, format, hidden: true },
    { field: 'endStock', type: 'line', label: `${S}.seriesEndStock`, color: 'sub', axis: 1, format }
  ],
  hint: (ctx, t) => `${t(`${S}.trendHintNet`)} ${buildUsageHint(overviewOf(ctx).usageHistory, t)}`
})

export const materialGemConfig = markRaw({
  titleKey: `${S}.title`,
  i18nPrefix: `${S}.rulesGem`,
  findings: { source: 'Overview' },
  filterFindings: remapGemFindings,
  tabFor: (reportRef, params, ctx) => resolveMaterialReportTarget(reportRef, params, ctx),

  tabs: [
    { key: 'overview', label: `${S}.tabs.overview` },
    { key: 'groups', label: `${G}.tabGroups` },
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
      title: `${G}.kpiGroupTitle`,
      icon: 'bi-speedometer2',
      gridColumns: 4,
      footNote: `${G}.kpi.footNote`,
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
          icon: 'bi-gem',
          label: `${G}.kpi.value`,
          value: (ctx) => formatMoney(kpiOf(ctx).totalValue),
          format: 'text',
          sub: (ctx, t) => t(`${G}.kpi.valueSub`, { qty: unitTotals(ctx, t, 'totalOnHand') }),
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
          id: 'negative',
          icon: 'bi-slash-circle',
          label: `${S}.kpi.negative`,
          value: (ctx) => kpiOf(ctx).negativeCount,
          sub: (ctx, t) => t(`${G}.kpi.negativeSub`, { weight: unitTotals(ctx, t, 'negativeWeight', true) }),
          tone: (ctx) => ((kpiOf(ctx).negativeCount || 0) > 0 ? 'warning' : 'green'),
          reportRef: 'matItems',
          reportParams: { itemFilter: 'negative' }
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
          sub: (ctx, t) => t(`${G}.kpi.deadSub`, { qty: unitTotals(ctx, t, 'deadOnHand'), value: formatMoney(kpiOf(ctx).deadValue), days: overviewOf(ctx).policy?.deadStockDays ?? '—' }),
          tone: (ctx) => ((kpiOf(ctx).deadCount || 0) > 0 ? 'warning' : 'green'),
          reportRef: 'matItems',
          reportParams: { itemFilter: 'dead' }
        },
        {
          id: 'onProcess',
          icon: 'bi-arrow-repeat',
          label: `${G}.kpi.onProcess`,
          value: (ctx) => formatMoney(kpiOf(ctx).totalOnProcessValue),
          format: 'text',
          sub: (ctx, t) => t(`${G}.kpi.onProcessSub`, { qty: unitTotals(ctx, t, 'totalOnProcess'), stale: countText(kpiOf(ctx).onProcessStaleCount) }),
          tone: (ctx) => ((kpiOf(ctx).onProcessStaleCount || 0) > 0 ? 'warning' : 'main'),
          reportRef: 'matOnProcess'
        }
      ]
    },

    {
      type: 'donut',
      id: 'matShare',
      tab: 'overview',
      source: 'Overview',
      title: `${G}.shareTitle`,
      icon: 'bi-pie-chart',
      height: 300,
      valueFormat: 'money0',
      center: { label: `${G}.centerTotal`, value: (total) => formatMoney(total) },
      slices: (ctx) => buildGemGroupSlices(overviewOf(ctx).groups, ctx.t)
    },

    {
      type: 'bar',
      id: 'matGroups',
      tab: 'groups',
      source: 'Overview',
      title: `${G}.groupsChartTitle`,
      icon: 'bi-bar-chart',
      horizontal: true,
      dataLabels: true,
      valueFormat: 'moneyAbbr',
      rows: (ctx) => buildGemGroupBarRows(overviewOf(ctx).groups, ctx.t),
      category: (row) => row.label,
      series: [{ label: `${G}.seriesValue`, value: (row) => row.value, color: 'token:green' }]
    },

    {
      type: 'table',
      id: 'matGroupTable',
      tab: 'groups',
      source: 'Overview',
      title: `${G}.groupsTableTitle`,
      icon: 'bi-table',
      sections: [{ rows: (ctx) => buildGemGroupRows(overviewOf(ctx).groups, ctx.t), columns: groupColumns, dataKey: 'key' }]
    },

    unitTrend('matTrendPcs', 'pcs', 'count'),
    unitTrend('matTrendCt', 'ct', 'gram'),

    {
      type: 'trend',
      id: 'matTrend',
      tab: 'trend',
      source: 'Overview',
      title: `${G}.trendTitle.value`,
      icon: 'bi-cash-stack',
      height: 340,
      columnWidth: '60%',
      axisTitles: [`${G}.axisFlow.value`, `${G}.axisStock.value`],
      points: (ctx) => overviewOf(ctx).valueSeries || [],
      categories: (points) => buildMonthLabels(points),
      series: [
        { field: 'inflowValue', type: 'bar', label: `${S}.seriesInflow`, color: 'green', axis: 0, format: 'money' },
        { field: 'consumedValue', type: 'bar', label: `${S}.seriesConsumed`, color: 'warning', axis: 0, format: 'money' },
        { field: 'returnedValue', type: 'bar', label: `${S}.seriesReturned`, color: 'primary', axis: 0, format: 'money' },
        { field: 'endStockValue', type: 'line', label: `${S}.seriesEndStock`, color: 'sub', axis: 1, format: 'money' }
      ],
      hint: (ctx, t) => t(`${G}.trendValueHint`)
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

export default materialGemConfig
