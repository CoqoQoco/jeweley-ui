// quality.config.js — config ของแท็บ "คุณภาพข้อมูล" (executive) สำหรับ InsightPage — endpoint ExecutiveReport/DataQuality ยิงครั้งเดียวป้อน findings/KPI/ตารางตัวตรวจ
// metal ถูกเติมโดย store (metal-scope) ทุก request · source เป็น optional: ยิงพลาดไม่กระทบหน้า (ตารางขึ้นข้อความว่าง)
// ไม่มีคาดการณ์ (forecasts ว่างเสมอ) → แท็บ ◔ แสดงสถานะว่างมาตรฐาน · [ดู ›] ของ finding/ตัวตรวจ ไม่เปิดแท็บในนี้ แต่ส่งขึ้น parent ผ่าน filter.onNavigate
// ข้อความ rules อยู่ที่ view.productionInsight.qualityInsight.rules (config.i18nPrefix)
import { markRaw } from 'vue'

import * as col from '@/components/insight/page/columns.js'
import {
  DATA_QUALITY_ENDPOINT,
  STATUS_COLOR,
  buildOverviewParams,
  buildKpi,
  buildCheckRows,
  resolveStatusVariant,
  resolveFindingNavigation,
  formatQualityFindings
} from './quality-helpers.js'

const S = 'view.productionInsight.qualityInsight'

const overviewOf = (ctx) => ctx.data.Overview || {}
const kpiOf = (ctx) => buildKpi(overviewOf(ctx))
const hasData = (ctx) => !!ctx.data.Overview

const navigate = (payload, ctx) => ctx.filter?.onNavigate?.(payload)

const checkColumns = [
  col.text('label', `${S}.colCheck`, { minWidth: '220px', strong: true }),
  col.number('count', `${S}.colCount`, 'count', { tip: `${S}.colCountTip`, minWidth: '90px' }),
  col.percent('ratio', `${S}.colRatio`, { digits: 1 }),
  col.chip('statusText', `${S}.colStatus`, (row) => resolveStatusVariant(row.severity), (row) => row.statusText, {
    color: (variant) => STATUS_COLOR[variant],
    borderColor: (variant) => STATUS_COLOR[variant],
    minWidth: '110px'
  }),
  col.text('impactText', `${S}.colImpact`, { minWidth: '180px' }),
  col.text('viewText', '', {
    render: (row, t) => t(`${S}.viewLabel`),
    onClick: (row, ctx) => navigate(row.navigation, ctx),
    actionIcon: 'bi-chevron-right',
    actionTitle: `${S}.viewTitle`,
    minWidth: '90px'
  })
]

export const qualityConfig = markRaw({
  titleKey: `${S}.title`,
  i18nPrefix: `${S}.rules`,
  findings: { source: 'Overview' },
  filterFindings: formatQualityFindings,
  tabFor: (reportRef, params, ctx) => {
    navigate(resolveFindingNavigation(reportRef, params), ctx)
    return null
  },

  tabs: [{ key: 'overview', label: `${S}.tabs.overview` }],

  sources: {
    Overview: { endpoint: DATA_QUALITY_ENDPOINT, optional: true, params: () => buildOverviewParams() }
  },

  blocks: [
    {
      type: 'kpi',
      id: 'dqKpi',
      tab: 'overview',
      source: 'Overview',
      title: `${S}.kpiGroupTitle`,
      icon: 'bi-speedometer2',
      gridColumns: 4,
      asOf: (ctx) => overviewOf(ctx).asOf,
      cards: [
        {
          id: 'problems',
          icon: 'bi-exclamation-triangle',
          label: `${S}.kpi.problems`,
          value: (ctx) => (hasData(ctx) ? kpiOf(ctx).problems : null),
          sub: (ctx, t) => t(`${S}.kpi.problemsSub`),
          tone: (ctx) => (kpiOf(ctx).problems > 0 ? 'warning' : 'green')
        },
        {
          id: 'critical',
          icon: 'bi-exclamation-octagon',
          label: `${S}.kpi.critical`,
          value: (ctx) => (hasData(ctx) ? kpiOf(ctx).critical : null),
          sub: (ctx, t) => t(`${S}.kpi.criticalSub`),
          tone: (ctx) => (kpiOf(ctx).critical > 0 ? 'warning' : 'green')
        },
        {
          id: 'passed',
          icon: 'bi-check-circle',
          label: `${S}.kpi.passed`,
          value: (ctx) => (hasData(ctx) ? kpiOf(ctx).passed : null),
          sub: (ctx, t) => t(`${S}.kpi.passedSub`, { total: kpiOf(ctx).total }),
          tone: () => 'green'
        },
        {
          id: 'affected',
          icon: 'bi-window-stack',
          label: `${S}.kpi.affected`,
          value: (ctx) => (hasData(ctx) ? kpiOf(ctx).affectedTabs.length : null),
          sub: (ctx, t) => t(`${S}.kpi.affectedSub`),
          tone: (ctx) => (kpiOf(ctx).affectedTabs.length > 0 ? 'warning' : 'green')
        }
      ]
    },

    {
      type: 'table',
      id: 'dqChecks',
      tab: 'overview',
      source: 'Overview',
      title: `${S}.checksTitle`,
      icon: 'bi-table',
      emptyText: `${S}.emptyChecks`,
      sections: [{ rows: (ctx) => buildCheckRows(overviewOf(ctx), ctx.t), columns: checkColumns, dataKey: 'key' }]
    }
  ]
})

export default qualityConfig
