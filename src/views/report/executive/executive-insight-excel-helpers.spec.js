// executive-insight-excel-helpers.spec.js — เทส row builder ของ 7 sheet Production Insight ในปุ่ม "Excel ทั้งหมด"
// ใช้ vue-i18n จริง (th) เพื่อให้ข้อความ finding/action/ป้ายแผนกตรงกับที่แสดงบนจอ
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'

import productionInsightTh from '@/language/view/production-insight/th.js'
import executiveTh from '@/language/view/executive/th.js'
import executiveEn from '@/language/view/executive/en.js'
import {
  formatExcelRangeText,
  buildRangeLeadRows,
  buildTopicRangeTexts,
  buildBlockRows,
  buildPositionalColumns,
  renderInsightText,
  buildInsightFindingsExcelRows,
  buildStageLeadTimeExcelRows,
  buildDeliveryPlansExcelRows,
  buildCapacityExcelRows,
  buildGoldExcelRows,
  buildWorkersExcelRows,
  buildMaterialsWaitingExcelRows,
  formatGemLine
} from './executive-insight-excel-helpers.js'

const i18n = createI18n({
  legacy: false,
  locale: 'th',
  messages: { th: { view: { productionInsight: productionInsightTh, executive: executiveTh } } }
})
const t = (key, params) => i18n.global.t(key, params)

const START = '2026-07-01T00:00:00'
const END = '2026-09-30T00:00:00'

describe('range helpers', () => {
  it('formatExcelRangeText prints both dates dd/MM/yyyy', () => {
    expect(formatExcelRangeText(t, START, END)).toBe('ช่วงเวลา: 01/07/2026 – 30/09/2026')
  })

  it('formatExcelRangeText appends the selected metal when given', () => {
    expect(formatExcelRangeText(t, START, END, 'เงิน')).toBe('ช่วงเวลา: 01/07/2026 – 30/09/2026 · โลหะ: เงิน')
  })

  it('buildTopicRangeTexts lists topics separately when their metal labels differ even with the same range', () => {
    const entries = [
      { key: 'wip', start: START, end: END, metalLabel: 'รวม' },
      { key: 'gold', start: START, end: END, metalLabel: 'ทอง' }
    ]
    expect(buildTopicRangeTexts(entries, t)).toHaveLength(2)
    expect(buildTopicRangeTexts(entries.map((e) => ({ ...e, metalLabel: 'รวม' })), t)).toHaveLength(1)
  })

  it('buildRangeLeadRows accepts string or array and ends with a blank row', () => {
    expect(buildRangeLeadRows('a', 'x')).toEqual([{ x: 'a' }, {}])
    expect(buildRangeLeadRows(['a', 'b'], 'x')).toEqual([{ x: 'a' }, { x: 'b' }, {}])
  })

  it('buildTopicRangeTexts collapses identical ranges and lists per topic when they differ', () => {
    const same = ['wip', 'gold'].map((key) => ({ key, start: START, end: END }))
    expect(buildTopicRangeTexts(same, t)).toHaveLength(1)
    const differ = [
      { key: 'wip', start: START, end: END },
      { key: 'gold', start: '2026-01-01T00:00:00', end: END }
    ]
    const texts = buildTopicRangeTexts(differ, t)
    expect(texts).toHaveLength(2)
    expect(texts[0]).toContain('งานค้างและคอขวด')
  })

  it('buildBlockRows yields title, header, rows and a blank separator with positional keys', () => {
    expect(buildBlockRows('T', ['a', 'b'], [[1, 2]])).toEqual([{ c1: 'T' }, { c1: 'a', c2: 'b' }, { c1: 1, c2: 2 }, {}])
    expect(buildPositionalColumns('R', 3)).toEqual([
      { header: 'R', key: 'c1' },
      { header: '', key: 'c2' },
      { header: '', key: 'c3' }
    ])
  })
})

describe('sheet 1: buildInsightFindingsExcelRows', () => {
  it('renders problems, forecasts and actions with the same text as on screen', () => {
    const rows = buildInsightFindingsExcelRows(
      [
        {
          key: 'materials',
          problems: [{ code: 'MAT_GEM_SHORT', severity: 'critical', params: { plans: 8, lines: 15 } }],
          forecasts: [{ code: 'FC_GEM_STOCKOUT', severity: 'warning', params: { count: 3, days: 14 } }],
          actions: [{ code: 'ACT_BUY_GEMS', ownerRole: 'purchasing', params: { lines: 15 } }]
        }
      ],
      t
    )
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ topic: 'วัตถุดิบที่กระทบการผลิต', kind: 'ปัญหา', severity: 'วิกฤต', owner: '' })
    expect(rows[0].text).toBe(t('view.productionInsight.rules.MAT_GEM_SHORT', { plans: 8, lines: 15 }))
    expect(rows[1]).toMatchObject({ kind: 'คาดการณ์', severity: 'ต้องระวัง' })
    expect(rows[2]).toMatchObject({ kind: 'วิธีแก้', severity: '', owner: 'จัดซื้อ' })
  })

  it('translates deptKey params like the screen does', () => {
    const text = renderInsightText(t, 'ACT_ADD_GEM_SORTER', { deptKey: 'gemSort' })
    expect(text).toContain(t('view.executive.department.gemSort'))
    expect(text).not.toContain('{')
  })

  it('returns no rows for empty topics', () => {
    expect(buildInsightFindingsExcelRows([{ key: 'wip' }], t)).toEqual([])
    expect(buildInsightFindingsExcelRows(null, t)).toEqual([])
  })
})

describe('sheet 2: buildStageLeadTimeExcelRows', () => {
  it('merges lead-time departments with capacity departments by key', () => {
    const rows = buildStageLeadTimeExcelRows(
      [
        {
          key: 'setting',
          standardDays: 5,
          median: { total: 7.26, wait: 3, work: 4.26 },
          p90: { total: 12 },
          overStandardPercent: 45.456,
          exitedCount: 30,
          currentWaitingCount: 9,
          abnormalCount: 2
        }
      ],
      [{ key: 'setting', activeWip: 40, queueDaysCurrent: 11.33, queueDaysAtStandard: 8, isBottleneckCurrent: true }],
      t
    )
    expect(rows).toEqual([
      {
        dept: t('view.executive.department.setting'),
        standard: 5,
        medianTotal: 7.3,
        p90: 12,
        wait: 3,
        work: 4.3,
        overStandardPercent: '45.46',
        exited: 30,
        currentWaiting: 9,
        abnormal: 2,
        activeWip: 40,
        queueDaysCurrent: 11.3,
        queueDaysAtStandard: 8,
        bottleneck: 'ใช่'
      }
    ])
  })

  it('leaves missing values blank instead of 0', () => {
    const [row] = buildStageLeadTimeExcelRows([{ key: 'trim', median: {} }], [], t)
    expect(row.wait).toBe('')
    expect(row.activeWip).toBe('')
    expect(row.bottleneck).toBe('')
  })
})

describe('sheet 3: buildDeliveryPlansExcelRows', () => {
  it('lists at-risk plans then late plans with worker names', () => {
    const rows = buildDeliveryPlansExcelRows(
      [
        {
          woText: 'WO-1',
          productNumber: 'P1',
          productName: 'แหวน',
          requestDate: '2026-09-01T00:00:00',
          projectedFinishDate: '2026-09-10T00:00:00',
          projectedLateDays: 9,
          currentDeptKey: 'plating',
          workerItems: [{ code: 'C1', name: 'หนิง', isQueue: false }]
        }
      ],
      [{ woNumber: 'WO-2', productNumber: 'P2', requestDate: '2026-08-01T00:00:00', doneDate: '2026-08-05T00:00:00', lateDays: 4, workers: ['ก', 'ข'] }],
      t
    )
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({
      type: 'เสี่ยงส่งช้า',
      wo: 'WO-1',
      product: 'P1 แหวน',
      dueDate: '01/09/2026',
      finishDate: '10/09/2026',
      lateDays: 9,
      dept: t('view.executive.department.plating'),
      workers: 'หนิง'
    })
    expect(rows[1]).toMatchObject({ type: 'ส่งช้าแล้ว', wo: 'WO-2', lateDays: 4, dept: '', workers: 'ก, ข' })
  })

  it('handles empty inputs', () => {
    expect(buildDeliveryPlansExcelRows(null, undefined, t)).toEqual([])
  })
})

describe('sheet 4: buildCapacityExcelRows', () => {
  const rows = buildCapacityExcelRows(
    { inflowPerMonth: 120, outputPerMonth: 100, netPerMonth: 20, backlogMonths: 2.54, activeWip: 250, bottleneckDepts: ['setting'] },
    { medianDays: 6, p90Days: 14.04, pendingNow: 12 },
    [{ key: 'setting', exitsPerMonth: 90, workersMedian: 5, plansPerWorker: 18, waitingNow: 30, workingNow: 10, queueDays: 12.34, isBottleneck: true }],
    t
  )

  it('puts the KPI block on top and the department block below', () => {
    expect(rows[0]).toEqual({ c1: 'ตัวชี้วัดกำลังการผลิต' })
    expect(rows[1]).toEqual({ c1: 'รายการ', c2: 'ค่า' })
    expect(rows[2]).toEqual({ c1: 'งานเข้า (ใบ/เดือน)', c2: 120 })
    const bottleneck = rows.find((r) => r.c1 === 'แผนกคอขวด')
    expect(bottleneck.c2).toBe(t('view.executive.department.setting'))
    expect(rows.find((r) => r.c1 === 'งานเข้า (ชิ้น/เดือน)').c2).toBe('')
    expect(rows.find((r) => r.c1 === 'งานค้างเทียบกำลังผลิต (เดือน)').c2).toBe(2.5)
  })

  it('lists each department with queue and bottleneck flag', () => {
    const header = rows.findIndex((r) => r.c1 === 'รายแผนก')
    expect(rows[header + 2]).toEqual({
      c1: t('view.executive.department.setting'),
      c2: 90,
      c3: 5,
      c4: 18,
      c5: 30,
      c6: 10,
      c7: 12.3,
      c8: 'ใช่'
    })
  })
})

describe('sheet 4 (breakdown block): buildCapacityExcelRows', () => {
  const breakdown = {
    by: 'productType',
    rows: [
      { key: 'RING', name: 'แหวน', unit: 'วง', inflowPieces: 360, outputPieces: 300, inflowPiecesPerMonth: 120, outputPiecesPerMonth: 100, netPiecesPerMonth: 20, activeWipPieces: 300, activeWipPlans: 40 },
      { key: '', name: 'ไม่ระบุ', unit: 'mixed', inflowPieces: 30, outputPieces: 36, inflowPiecesPerMonth: 10, outputPiecesPerMonth: 12, netPiecesPerMonth: -2, activeWipPieces: 30, activeWipPlans: 6 }
    ]
  }

  it('appends a breakdown block for the current dimension after the department block', () => {
    const rows = buildCapacityExcelRows({ outputPiecesPerMonth: 90, netPiecesPerMonth: 5, activeWipPieces: 400 }, {}, [], t, breakdown)
    const title = rows.findIndex((r) => r.c1 === 'แยกตามสินค้า: ประเภทสินค้า')
    expect(title).toBeGreaterThan(0)
    expect(rows[title + 1]).toMatchObject({ c1: 'ประเภทสินค้า', c2: 'หน่วย', c5: 'สุทธิ ±' })
    expect(rows[title + 2]).toEqual({ c1: 'แหวน', c2: 'วง', c3: 120, c4: 100, c5: 20, c6: 300, c7: 40 })
    expect(rows[title + 3]).toMatchObject({ c1: 'ไม่ระบุ', c2: 'ชิ้น/คู่', c5: -2 })
  })

  it('adds the piece KPI rows and omits the breakdown block when there is no breakdown', () => {
    const rows = buildCapacityExcelRows({ outputPiecesPerMonth: 90, netPiecesPerMonth: 5, activeWipPieces: 400 }, {}, [], t, null)
    expect(rows.find((r) => r.c1 === 'ผลิตเสร็จ (ชิ้น/เดือน)').c2).toBe(90)
    expect(rows.find((r) => r.c1 === 'งานค้างทั้งหมด (ชิ้น)').c2).toBe(400)
    expect(rows.some((r) => String(r.c1 || '').startsWith('แยกตามสินค้า'))).toBe(false)
  })

  it('renders CAP_GROUP_BACKLOG_GROWING with the translated dimension in the findings sheet', () => {
    const rows = buildInsightFindingsExcelRows(
      [{ key: 'capacity', problems: [{ code: 'CAP_GROUP_BACKLOG_GROWING', severity: 'warning', params: { by: 'productType', key: 'RING', name: 'แหวน', months: 3, addedPieces: 120, unit: 'คู่' } }] }],
      t
    )
    expect(rows[0].text).toBe('แหวน (ประเภทสินค้า) งานเข้ามากกว่าผลิตออก 3 เดือนติด งานค้างเพิ่ม 120 คู่')
  })
})

describe('sheet 5: buildGoldExcelRows', () => {
  const rows = buildGoldExcelRows(
    [
      {
        workerType: 80,
        workerCode: 'C001',
        workerName: 'จันทรา',
        slipCount: 4,
        receivedGram: 123.456,
        lossPercent: 1.234,
        allowedPercent: 1,
        targetPercent: 0.8,
        excessGram: 0.5,
        excessMoney: 1234.5,
        netMoney: -200,
        overBuckets: 2,
        qualifyingBuckets: 3
      }
    ],
    [
      { deptKey: 'gemSort', notWeighed: true },
      {
        deptKey: 'setting',
        returnedSendGram: 50,
        receivedGram: 49.5,
        diffGram: 0.5,
        diffPercent: 1,
        targetPercent: 0.8,
        slipLossPercent: 0.9,
        pendingWithWorkerCount: 3,
        pendingWithWorkerGram: 12.5,
        pendingQueueCount: 0
      }
    ],
    t
  )

  it('has a worker block then a stage block', () => {
    expect(rows[0].c1).toBe('ช่าง (ทองคำ)')
    const worker = rows[2]
    expect(worker.c1).toBe(t('view.productionInsight.gold.workerType.80'))
    expect(worker).toMatchObject({ c2: 'C001', c3: 'จันทรา', c4: 4, c5: '123.46', c6: '1.23', c10: '1,234.50', c11: '-200.00', c12: '2/3' })
    const stageTitle = rows.findIndex((r) => r.c1 && r.c1.startsWith('Loss ตามใบงานรายแผนก'))
    expect(stageTitle).toBeGreaterThan(2)
  })

  it('shows gemSort as not weighed and formats pending as count / gram', () => {
    const stageTitle = rows.findIndex((r) => r.c1 && r.c1.startsWith('Loss ตามใบงานรายแผนก'))
    expect(rows[stageTitle + 2]).toMatchObject({ c1: t('view.executive.department.gemSort'), c2: 'ไม่ได้ชั่ง' })
    expect(rows[stageTitle + 3]).toMatchObject({ c1: t('view.executive.department.setting'), c2: '50.00', c8: '3 / 12.50', c9: '' })
  })
})

describe('sheet 6: buildWorkersExcelRows', () => {
  it('sorts by wages desc, translates codes and hides gold for gemSort', () => {
    const rows = buildWorkersExcelRows(
      [
        { code: 'A', name: 'ต่ำ', deptKey: 'setting', employmentType: 'OUTSIDE', jobs: 5, plans: 4, wages: 100, wagePerJob: 20, shareOfDeptJobs: 10, goldDiffPercent: 0.5 },
        { code: 'B', name: 'สูง', deptKey: 'gemSort', employmentType: 'IN_HOUSE', jobs: 50, plans: 40, wages: 5000, wagePerJob: 100, shareOfDeptJobs: 55.56, goldDiffPercent: 0 }
      ],
      t
    )
    expect(rows.map((r) => r.code)).toEqual(['B', 'A'])
    expect(rows[0]).toMatchObject({
      dept: t('view.executive.department.gemSort'),
      employmentType: 'ในบ้าน',
      wages: '5,000.00',
      shareOfDeptJobs: '55.6',
      gold: ''
    })
    expect(rows[1].gold).toBe('0.50')
    expect(rows[1].employmentType).toBe('นอกบ้าน')
  })

  it('falls back to the unknown employment type label', () => {
    const [row] = buildWorkersExcelRows([{ code: 'X', name: 'x' }], t)
    expect(row.employmentType).toBe('ไม่ระบุ')
    expect(row.wages).toBe('')
  })
})

describe('sheet 7: buildMaterialsWaitingExcelRows', () => {
  const masterGem = [{ code: 'RB', nameTh: 'ทับทิม' }]
  const masterShape = [{ code: 'RD', description: 'กลม' }]

  it('joins gem lines with their status and resolves master names', () => {
    const rows = buildMaterialsWaitingExcelRows(
      [
        {
          woText: 'WO-9',
          productNumber: 'P9',
          productName: 'ต่างหู',
          waitingDays: 12,
          dueDate: '2026-10-01T00:00:00',
          gemStatus: 'short',
          gems: [
            { gem: 'RB', shape: 'RD', size: '3mm', metal: 'GOLD', qty: 4, available: 1, status: 'short' },
            { gem: 'ZZ', shape: 'RD', size: '2mm', qty: 2, status: 'unmatched', unmatchedReason: 'gem' }
          ]
        }
      ],
      masterGem,
      masterShape,
      t
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].wo).toBe('WO-9')
    expect(rows[0].product).toBe('P9 ต่างหู')
    expect(rows[0].waitingDays).toBe(12)
    expect(rows[0].gemStatus).toBe(t('view.productionInsight.materials.gemStatus.short'))
    expect(rows[0].dueDate).toBe('01/10/2026')
    const lines = rows[0].gems.split('; ')
    expect(lines[0]).toContain('ทับทิม กลม 3mm')
    expect(lines[0]).toContain('×4')
    expect(lines[1]).toContain('ZZ กลม 2mm ×2')
    expect(lines[1]).toContain(t('view.productionInsight.materials.gemStatus.unmatchedGem'))
  })

  it('formatGemLine falls back to raw codes without master data', () => {
    expect(formatGemLine({ gem: 'RB', shape: 'RD', size: '1', qty: 1, status: 'ready' }, [], [], t)).toContain('RB RD 1 ×1')
  })

  it('returns an empty list for no rows', () => {
    expect(buildMaterialsWaitingExcelRows(undefined, [], [], t)).toEqual([])
  })
})

describe('excel insight i18n coverage', () => {
  it('has th and en keys for every label', () => {
    const flatten = (obj, prefix = '') =>
      Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]))
    const thKeys = flatten(executiveTh.excel.insight)
    const enKeys = flatten(executiveEn.excel.insight)
    expect(enKeys.sort()).toEqual(thKeys.sort())
  })
})
