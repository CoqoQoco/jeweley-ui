import { describe, it, expect } from 'vitest'
import {
  ON_TRAY_MS,
  updateTray,
  onTrayEpcs,
  classifyCheckResult,
  findCandidates,
  nextStreak,
  evaluateTray,
  manualBindEpc,
  releaseBlocked,
  nextUnboundIndex,
  mergeQueue,
  markBound,
  markUnbound,
  decideLabelResult,
  labelNumber,
  labelSecondary,
  buildListRequest,
  receiptRange,
  applySelectionChange,
  epcsOutsideBackoff,
  parsePlanCode,
  mergePlanUnits,
  normalizePlanSearch,
  blockEpcsOnTray,
  planTextOf,
  isPlanQueued,
  epcsNeedingCheck,
  isKnownStale,
  KNOWN_TTL_MS,
  indexAfterBound,
  indexAfterMerge,
  shouldBlockAfterRecheck
} from './rfid-bind-logic.js'

const free = { state: 'free' }
const read = (epc, t) => ({ epc, hits: 1, firstSeen: t, lastSeen: t })
const unit = (unitId, extra = {}) => ({ unitId, unitNo: unitId, stockNumber: `DK${unitId}`, productCode: 'P', ...extra })

function run({ onTray, known = new Map(), blocked = new Set(), streak, inFlight = false, autoBind = true, current = unit(1) }) {
  return evaluateTray({
    onTray,
    known,
    blocked,
    current,
    inFlight,
    autoBind,
    streak: streak || { epc: onTray[0] || '', count: 2 }
  })
}

describe('ผูกอัตโนมัติ', () => {
  it('แท็กใหม่ใบเดียว ติดกัน >=2 batch -> ผูก', () => {
    const known = new Map([['A', free]])
    expect(run({ onTray: ['A'], known, streak: { epc: 'A', count: 2 } }).bindEpc).toBe('A')
  })

  it('batch เดียว ยังไม่ผูก', () => {
    const known = new Map([['A', free]])
    const result = run({ onTray: ['A'], known, streak: { epc: 'A', count: 1 } })
    expect(result.status).toBe('pending')
    expect(result.bindEpc).toBeNull()
  })

  it('ปิดออโต้ -> ไม่ผูกเอง แต่กดยืนยันได้', () => {
    const known = new Map([['A', free]])
    const result = run({ onTray: ['A'], known, autoBind: false })
    expect(result.bindEpc).toBeNull()
    expect(manualBindEpc(result, false)).toBe('A')
    expect(manualBindEpc(result, true)).toBeNull()
  })

  it('แท็กใหม่ >1 ใบ -> multi ไม่ผูก', () => {
    const known = new Map([['A', free], ['B', free]])
    const result = run({ onTray: ['A', 'B'], known })
    expect(result.status).toBe('multi')
    expect(result.bindEpc).toBeNull()
  })

  it('แท็กผูกกับชิ้นอื่น -> taken ไม่ผูก', () => {
    const known = new Map([['A', { state: 'bound', piece: { stockNumber: 'DK9' } }]])
    const result = run({ onTray: ['A'], known })
    expect(result.status).toBe('taken')
    expect(result.bindEpc).toBeNull()
    expect(result.other.stockNumber).toBe('DK9')
  })

  it('แท็กที่เพิ่งผูกในรอบนี้ค้างถาด -> ไม่เตือน taken', () => {
    const known = new Map([['A', { state: 'bound', piece: {} }]])
    const result = evaluateTray({ onTray: ['A'], known, blocked: new Set(), current: unit(2), inFlight: false, streak: { epc: '', count: 0 }, autoBind: true, ignore: new Set(['A']) })
    expect(result.status).toBe('waiting')
  })

  it('แท็กที่ผูกอยู่ค้างถาด + แท็กใหม่ใบเดียว -> ผูกใบใหม่', () => {
    const known = new Map([['OLD', { state: 'bound', piece: {} }], ['A', free]])
    expect(run({ onTray: ['OLD', 'A'], known, streak: { epc: 'A', count: 2 } }).bindEpc).toBe('A')
  })

  it('soldMismatch ไม่ใช่ candidate และเตือน', () => {
    const result = classifyCheckResult({ items: [{ epc: 'a', soldMismatch: true, stockNumber: 'DK5' }] }, ['a'])
    expect(result.get('A').state).toBe('sold')
    const decision = run({ onTray: ['A'], known: result })
    expect(findCandidates(['A'], result, new Set())).toEqual([])
    expect(decision.status).toBe('sold')
    expect(decision.bindEpc).toBeNull()
  })

  it('inFlight -> ไม่ผูกซ้อน', () => {
    const known = new Map([['A', free]])
    expect(run({ onTray: ['A'], known, inFlight: true }).bindEpc).toBeNull()
  })

  it('EPC ที่ส่งตรวจแต่ไม่อยู่ในคำตอบ = free', () => {
    const result = classifyCheckResult({ items: [], notFound: [] }, ['X'])
    expect(result.get('X').state).toBe('free')
  })

  it('ไม่มีชิ้นปัจจุบัน -> done', () => {
    expect(run({ onTray: ['A'], current: null }).status).toBe('done')
  })
})

describe('streak', () => {
  it('นับต่อเมื่อ candidate เดิมในแต่ละ batch และรีเซ็ตเมื่อเปลี่ยน/หาย', () => {
    let s = nextStreak({ epc: '', count: 0 }, ['A'], true)
    expect(s).toEqual({ epc: 'A', count: 1 })
    s = nextStreak(s, ['A'], false)
    expect(s.count).toBe(1)
    s = nextStreak(s, ['A'], true)
    expect(s.count).toBe(2)
    expect(nextStreak(s, ['A', 'B'], true).count).toBe(0)
    expect(nextStreak(s, [], false).count).toBe(0)
    expect(nextStreak(s, ['B'], true)).toEqual({ epc: 'B', count: 1 })
  })
})

describe('ถาด และ undo', () => {
  it('onTray = เห็นภายใน 1500ms', () => {
    const tray = updateTray(new Map(), [read('A', 1000), read('B', 2000)])
    expect(onTrayEpcs(tray, 2400).sort()).toEqual(['A', 'B'])
    expect(onTrayEpcs(tray, 1000 + ON_TRAY_MS + 1)).toEqual(['B'])
  })

  it('undo: แท็กถูกบล็อกจนหายจากถาด >1500ms', () => {
    const known = new Map([['A', free]])
    const blocked = new Set(['A'])
    expect(run({ onTray: ['A'], known, blocked }).bindEpc).toBeNull()
    const tray = updateTray(new Map(), [read('A', 1000)])
    expect(releaseBlocked(blocked, tray, 2000).has('A')).toBe(true)
    expect(releaseBlocked(blocked, tray, 1000 + ON_TRAY_MS + 1).has('A')).toBe(false)
    expect(releaseBlocked(blocked, new Map(), 5000).size).toBe(0)
  })
})

describe('คิว', () => {
  const queue = [unit(1, { epc: 'E1' }), unit(2), unit(3, { epc: 'E3' }), unit(4)]

  it('nextUnboundIndex ไปข้างหน้า แล้ววนกลับต้นคิว', () => {
    expect(nextUnboundIndex(queue, 1)).toBe(3)
    expect(nextUnboundIndex(queue, 3)).toBe(1)
    expect(nextUnboundIndex([unit(1, { epc: 'E' })], 0)).toBe(-1)
  })

  it('mergeQueue ตัดชิ้นซ้ำ / replace', () => {
    expect(mergeQueue(queue, [unit(2), unit(5)], 'append').map((u) => u.unitId)).toEqual([1, 2, 3, 4, 5])
    expect(mergeQueue(queue, [unit(9), unit(9)], 'replace').map((u) => u.unitId)).toEqual([9])
  })

  it('markBound / markUnbound', () => {
    const bound = markBound(queue, 2, 'E2')
    expect(bound[1].epc).toBe('E2')
    expect('epc' in markUnbound(bound, 2)[1]).toBe(false)
  })
})

describe('ยิงป้าย', () => {
  const queue = [unit(1), unit(2)]

  it('ไม่เจอ', () => expect(decideLabelResult([], queue).kind).toBe('notFound'))

  it('ผูกครบแล้ว', () => {
    expect(decideLabelResult([unit(1, { epc: 'E' })], queue).kind).toBe('allBound')
  })

  it('ชิ้นแรกที่ยังไม่ผูก อยู่ในคิว -> jump', () => {
    const items = [unit(1, { epc: 'E', stockNumber: 'S', productCode: 'P' }), unit(2, { stockNumber: 'S' })]
    items[1].productCode = 'P'
    const result = decideLabelResult(items, queue)
    expect(result).toEqual({ kind: 'jump', unitId: 2 })
  })

  it('ไม่อยู่ในคิว -> append', () => {
    const result = decideLabelResult([unit(7, { stockNumber: 'S' })], queue)
    expect(result.kind).toBe('append')
    expect(result.unit.unitId).toBe(7)
  })

  it('หลายล็อต -> multi', () => {
    const result = decideLabelResult([unit(7, { stockNumber: 'S1' }), unit(8, { stockNumber: 'S2' })], queue)
    expect(result.kind).toBe('multi')
    expect(result.lots).toHaveLength(2)
  })
})

describe('เลขที่แสดง', () => {
  it('เลขเก่าเด่นถ้ามี', () => {
    expect(labelNumber({ stockNumber: 'DK1', stockNumberOrigin: 'A9' })).toBe('A9')
    expect(labelSecondary({ stockNumber: 'DK1', stockNumberOrigin: 'A9' })).toBe('DK1')
    expect(labelNumber({ stockNumber: 'DK1' })).toBe('DK1')
    expect(labelSecondary({ stockNumber: 'DK1' })).toBe('')
  })
})

describe('buildListRequest', () => {
  it('ส่งเฉพาะ key ที่มีค่า + ช่วงวันที่', () => {
    const body = buildListRequest(
      { stockNumber: ' DK1 ', locationCodes: ['A1'], tagStatus: 'unbound', receiptPreset: 'today', gold: [] },
      { skip: 50, take: 50 },
      new Date('2026-11-27T10:00:00')
    )
    expect(body.stockNumber).toBe('DK1')
    expect(body.locationCodes).toEqual(['A1'])
    expect(body.gold).toBeUndefined()
    expect(body.skip).toBe(50)
    expect(body.receiptDateFrom).toBeTruthy()
    expect(body.receiptDateFrom).toMatch(/\+07:00$/)
    expect(body.receiptDateTo).toMatch(/\+07:00$/)
    expect(receiptRange('').receiptDateFrom).toBeUndefined()
  })
})

describe('selection / backoff', () => {
  it('ติ๊กหัวตารางออก -> เอาออกเฉพาะแถวของหน้านี้', () => {
    const prev = [unit(1), unit(2), unit(3)]
    expect(applySelectionChange(prev, [], [unit(1), unit(2)]).map((u) => u.unitId)).toEqual([3])
    expect(applySelectionChange(prev, [unit(1)], [unit(1)]).map((u) => u.unitId)).toEqual([1])
  })

  it('EPC ที่อยู่ในช่วงพัก ไม่ถูกส่งซ้ำ', () => {
    const backoff = new Map([['A', 5000]])
    expect(epcsOutsideBackoff(['A', 'B'], backoff, 4000)).toEqual(['B'])
    expect(epcsOutsideBackoff(['A', 'B'], backoff, 5001)).toEqual(['A', 'B'])
  })
})

describe('แผนผลิต', () => {
  it('parsePlanCode: <wo>/<woNumber> และตัด prefix WO', () => {
    expect(parsePlanCode('6906025/21')).toEqual({ wo: '6906025', woNumber: 21, label: '6906025/21' })
    expect(parsePlanCode(' wo 6906025 / 021 ')).toEqual({ wo: '6906025', woNumber: 21, label: '6906025/21' })
    expect(parsePlanCode('DK20H015')).toBeNull()
    expect(parsePlanCode('6906025')).toBeNull()
    expect(parsePlanCode('6906025/ab')).toBeNull()
    expect(parsePlanCode('')).toBeNull()
  })

  it('mergePlanUnits: ต่อท้ายคิว ตัดซ้ำ และชี้ชิ้นแรกของแผนที่ยังไม่ผูก', () => {
    const queue = [unit(1), unit(2, { epc: 'E' })]
    const result = mergePlanUnits(queue, [unit(2, { epc: 'E' }), unit(5), unit(6)])
    expect(result.queue.map((u) => u.unitId)).toEqual([1, 2, 5, 6])
    expect(result.added).toBe(2)
    expect(result.firstIndex).toBe(2)
    expect(mergePlanUnits(queue, [unit(1)]).firstIndex).toBe(0)
    expect(mergePlanUnits(queue, []).firstIndex).toBe(-1)
  })

  it('buildListRequest ส่ง wo + woNumber เป็นตัวเลขเมื่อมีทั้งคู่', () => {
    const body = buildListRequest({ wo: '6906025', woNumber: '21', tagStatus: 'unbound' })
    expect(body.wo).toBe('6906025')
    expect(body.woNumber).toBe(21)
    expect(buildListRequest({ wo: '6906025', woNumber: '', tagStatus: 'unbound' }).wo).toBeUndefined()
  })
})

describe('สลับชิ้นจากสแกนแผน', () => {
  it('blockEpcsOnTray: แท็กบนถาดทุกใบถูกบล็อก -> ไม่เป็น candidate กับชิ้นใหม่ จนกว่าจะหายจากถาด', () => {
    const known = new Map([['A', free]])
    const blocked = blockEpcsOnTray(new Set(), ['A', 'U'])
    expect(findCandidates(['A', 'U'], known, blocked)).toEqual([])
    expect(run({ onTray: ['A'], known, blocked, current: unit(11), streak: { epc: '', count: 0 } }).bindEpc).toBeNull()
    const tray = updateTray(new Map(), [read('A', 1000)])
    expect(releaseBlocked(blocked, tray, 1000 + ON_TRAY_MS + 1).has('A')).toBe(false)
    expect(findCandidates(['A'], known, releaseBlocked(blocked, tray, 1000 + ON_TRAY_MS + 1))).toEqual(['A'])
  })

  it('normalizePlanSearch ตัด WO นำหน้า', () => {
    expect(normalizePlanSearch(' WO 6906025/21')).toBe('6906025/21')
    expect(normalizePlanSearch('6906025')).toBe('6906025')
  })

  it('planTextOf / isPlanQueued', () => {
    expect(planTextOf({ wo: '69', woNumber: 3 })).toBe('69/3')
    expect(planTextOf({})).toBe('')
    const queue = [unit(1, { wo: '69', woNumber: 3 }), unit(2, { wo: '69', woNumber: 3 }), unit(3, { wo: '69', woNumber: 3, epc: 'E' })]
    expect(isPlanQueued(queue, { wo: '69', woNumber: 3, unboundUnits: 2 })).toBe(true)
    expect(isPlanQueued(queue, { wo: '69', woNumber: 3, unboundUnits: 3 })).toBe(false)
    expect(isPlanQueued(queue, { wo: '70', woNumber: 1, unboundUnits: 1 })).toBe(false)
  })
})

describe('TTL ของผลตรวจแท็ก', () => {
  const T0 = 100000
  const taken = { state: 'bound', checkedAt: T0, piece: { stockNumber: 'DK9' } }

  it('bound/sold หมดอายุหลัง TTL แล้วถูกตรวจใหม่ ส่วน free ไม่หมดอายุ', () => {
    const known = new Map([['A', taken], ['B', { state: 'sold', checkedAt: T0, piece: {} }], ['C', { state: 'free', checkedAt: T0 }]])
    expect(epcsNeedingCheck(['A', 'B', 'C'], known, new Set(), T0 + KNOWN_TTL_MS)).toEqual([])
    expect(epcsNeedingCheck(['A', 'B', 'C'], known, new Set(), T0 + KNOWN_TTL_MS + 1)).toEqual(['A', 'B'])
    expect(epcsNeedingCheck(['A'], known, new Set(['A']), T0 + KNOWN_TTL_MS + 1)).toEqual([])
  })

  it('แท็กที่ผูกในรอบนี้ (session) ไม่หมดอายุ', () => {
    expect(isKnownStale({ ...taken, session: true }, T0 + 999999)).toBe(false)
  })

  it('หมดอายุ -> ตรวจใหม่ได้ free -> เป็น candidate (ยังเคารพ blocked)', () => {
    const known = new Map([['A', taken]])
    expect(findCandidates(['A'], known, new Set())).toEqual([])
    const recheck = classifyCheckResult({ items: [], notFound: ['A'] }, ['A'], T0 + KNOWN_TTL_MS + 1)
    for (const [epc, entry] of recheck) known.set(epc, entry)
    expect(findCandidates(['A'], known, new Set())).toEqual(['A'])
    expect(findCandidates(['A'], known, new Set(['A']))).toEqual([])
    expect(run({ onTray: ['A'], known, streak: { epc: 'A', count: 2 } }).bindEpc).toBe('A')
  })
})

describe('รอบแก้ไขท้าย', () => {
  const queue = [unit(1), unit(2), unit(3)]

  it('indexAfterBound: ขยับต่อเมื่อยังอยู่ที่ชิ้นที่เพิ่งผูก ไม่งั้นอยู่ที่เดิม', () => {
    const after = markBound(queue, 1, 'E1')
    expect(indexAfterBound(after, 0, 1)).toBe(1)
    expect(indexAfterBound(after, 2, 1)).toBe(2)
  })

  it('indexAfterMerge: append คงชิ้นปัจจุบันที่ยังไม่ผูก, replace/ผูกแล้ว -> ชิ้นแรกที่ยังไม่ผูก', () => {
    const merged = mergeQueue(queue, [unit(9)], 'append')
    expect(indexAfterMerge(merged, 2, 'append')).toBe(1)
    expect(indexAfterMerge(markBound(merged, 2, 'E'), 2, 'append')).toBe(0)
    expect(indexAfterMerge(merged, 2, 'replace')).toBe(0)
    expect(indexAfterMerge(merged, undefined, 'append')).toBe(0)
  })

  it('shouldBlockAfterRecheck: bound/sold (ไม่ใช่ session) -> free ต้องบล็อก', () => {
    expect(shouldBlockAfterRecheck({ state: 'bound' }, { state: 'free' })).toBe(true)
    expect(shouldBlockAfterRecheck({ state: 'sold' }, { state: 'free' })).toBe(true)
    expect(shouldBlockAfterRecheck({ state: 'bound', session: true }, { state: 'free' })).toBe(false)
    expect(shouldBlockAfterRecheck({ state: 'free' }, { state: 'free' })).toBe(false)
    expect(shouldBlockAfterRecheck(undefined, { state: 'free' })).toBe(false)
    expect(shouldBlockAfterRecheck({ state: 'bound' }, { state: 'bound' })).toBe(false)
  })
})
