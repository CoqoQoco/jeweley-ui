import { describe, it, expect } from 'vitest'
import { normalizeGrade, getDiamondGradeChanges, buildGradeSyncPlan } from './diamond-grade-sync.js'

describe('normalizeGrade', () => {
  it('uppercase และตัดช่องว่างออก แต่คงจุลภาคไว้', () => {
    expect(normalizeGrade('g, vs1')).toBe('G,VS1')
    expect(normalizeGrade('  VS , SI ')).toBe('VS,SI')
    expect(normalizeGrade(null)).toBe('')
    expect(normalizeGrade(undefined)).toBe('')
  })
})

describe('buildGradeSyncPlan', () => {
  it('ไม่มีการเปลี่ยนเกรด — plan ต้องว่าง', () => {
    const materials = [{ type: 'Diamond', typeCode: 'G,VS1' }]
    const originalGrades = [{ index: 0, typeCode: 'G,VS1' }]
    const tranItems = [{ nameGroup: 'Gem', nameDescription: 'G,VS1' }]

    expect(getDiamondGradeChanges(materials, originalGrades)).toEqual([])
    expect(buildGradeSyncPlan({ materials, originalGrades, tranItems })).toEqual([])
  })

  it('exact match — แถวเป็นเกรดล้วนๆ ต้องเสนอเกรดใหม่', () => {
    const materials = [{ type: 'Diamond', typeCode: 'VS,SI' }]
    const originalGrades = [{ index: 0, typeCode: 'G,VS1' }]
    const tranItems = [{ nameGroup: 'Gem', nameDescription: 'G,VS1' }]

    const plan = buildGradeSyncPlan({ materials, originalGrades, tranItems })
    expect(plan).toEqual([{ rowIndex: 0, current: 'G,VS1', suggested: 'VS,SI', mode: 'exact' }])
  })

  it('exact match — ตัวพิมพ์และช่องว่างต่างกันก็ต้อง match', () => {
    const materials = [{ type: 'Diamond', typeCode: 'VS,SI' }]
    const originalGrades = [{ index: 0, typeCode: 'G,VS1' }]
    const tranItems = [{ nameGroup: 'Gem', nameDescription: 'g, vs1' }]

    const plan = buildGradeSyncPlan({ materials, originalGrades, tranItems })
    expect(plan).toEqual([{ rowIndex: 0, current: 'g, vs1', suggested: 'VS,SI', mode: 'exact' }])
  })

  it('coded — แทนเฉพาะ segment แรกของข้อความที่มีขีดกลาง', () => {
    const materials = [{ type: 'Diamond', typeCode: 'VS,SI' }]
    const originalGrades = [{ index: 0, typeCode: 'G,VS1' }]
    const tranItems = [
      { nameGroup: 'Gem', nameDescription: 'VS1GR15-Diamond-RD-1.50-18K' }
    ]

    const plan = buildGradeSyncPlan({ materials, originalGrades, tranItems })
    expect(plan).toEqual([
      {
        rowIndex: 0,
        current: 'VS1GR15-Diamond-RD-1.50-18K',
        suggested: 'VS,SI-Diamond-RD-1.50-18K',
        mode: 'coded'
      }
    ])
  })

  it('coded — segment แรกตรงกับเกรดใหม่อยู่แล้วให้ข้ามแถวนั้น', () => {
    const materials = [{ type: 'Diamond', typeCode: 'VS,SI' }]
    const originalGrades = [{ index: 0, typeCode: 'G,VS1' }]
    const tranItems = [
      { nameGroup: 'Gem', nameDescription: 'VS,SI-Diamond-RD-1.50-18K' }
    ]

    expect(buildGradeSyncPlan({ materials, originalGrades, tranItems })).toEqual([])
  })

  it('manual — พูดถึงเพชรแต่ไม่เข้ารูปแบบ exact/coded ต้องได้ suggested null', () => {
    const materials = [{ type: 'Diamond', typeCode: 'VS,SI' }]
    const originalGrades = [{ index: 0, typeCode: 'G,VS1' }]
    const tranItems = [{ nameGroup: 'Gem', nameDescription: 'DIA,0.8' }]

    const plan = buildGradeSyncPlan({ materials, originalGrades, tranItems })
    expect(plan).toEqual([{ rowIndex: 0, current: 'DIA,0.8', suggested: null, mode: 'manual' }])
  })

  it('manual — รูปแบบ "SI1IR11 DIA 1.1 RD" ก็ต้องเป็น manual', () => {
    const materials = [{ type: 'Diamond', typeCode: 'VS,SI' }]
    const originalGrades = [{ index: 0, typeCode: 'G,VS1' }]
    const tranItems = [{ nameGroup: 'Gem', nameDescription: 'SI1IR11 DIA 1.1 RD' }]

    const plan = buildGradeSyncPlan({ materials, originalGrades, tranItems })
    expect(plan).toEqual([
      { rowIndex: 0, current: 'SI1IR11 DIA 1.1 RD', suggested: null, mode: 'manual' }
    ])
  })

  it('เพชร 2 รายการเปลี่ยนคนละเกรด ต้องจับคู่ตาม change ของตัวเอง', () => {
    const materials = [
      { type: 'Diamond', typeCode: 'VS,SI' },
      { type: 'Diamond', typeCode: 'D,IF' }
    ]
    const originalGrades = [
      { index: 0, typeCode: 'G,VS1' },
      { index: 1, typeCode: 'F,VVS1' }
    ]
    const tranItems = [
      { nameGroup: 'Gem', nameDescription: 'G,VS1' },
      { nameGroup: 'Gem', nameDescription: 'F,VVS1' }
    ]

    const plan = buildGradeSyncPlan({ materials, originalGrades, tranItems })
    expect(plan).toEqual([
      { rowIndex: 0, current: 'G,VS1', suggested: 'VS,SI', mode: 'exact' },
      { rowIndex: 1, current: 'F,VVS1', suggested: 'D,IF', mode: 'exact' }
    ])
  })

  it('แถว nameGroup อื่น (Gold/Worker/Embed) ต้องไม่ถูกแตะแม้เกรดเพชรเปลี่ยน', () => {
    const materials = [{ type: 'Diamond', typeCode: 'VS,SI' }]
    const originalGrades = [{ index: 0, typeCode: 'G,VS1' }]
    const tranItems = [
      { nameGroup: 'Gold', nameDescription: 'G,VS1' },
      { nameGroup: 'Worker', nameDescription: 'Diamond setting' },
      { nameGroup: 'Embed', nameDescription: 'G,VS1' }
    ]

    expect(buildGradeSyncPlan({ materials, originalGrades, tranItems })).toEqual([])
  })

  it('หลัง apply แถว exact/coded แล้ว เรียกซ้ำด้วย snapshot เดิม ต้องเหลือเฉพาะแถว manual', () => {
    const materials = [{ type: 'Diamond', typeCode: 'VS,SI' }]
    const originalGrades = [{ index: 0, typeCode: 'G,VS1' }]
    const tranItems = [
      { nameGroup: 'Gem', nameDescription: 'G,VS1' },
      { nameGroup: 'Gem', nameDescription: 'VS1GR15-Diamond-RD-1.50-18K' },
      { nameGroup: 'Gem', nameDescription: 'DIA,0.8' }
    ]

    const firstPlan = buildGradeSyncPlan({ materials, originalGrades, tranItems })
    expect(firstPlan).toEqual([
      { rowIndex: 0, current: 'G,VS1', suggested: 'VS,SI', mode: 'exact' },
      {
        rowIndex: 1,
        current: 'VS1GR15-Diamond-RD-1.50-18K',
        suggested: 'VS,SI-Diamond-RD-1.50-18K',
        mode: 'coded'
      },
      { rowIndex: 2, current: 'DIA,0.8', suggested: null, mode: 'manual' }
    ])

    // จำลอง applyGradeSync() — เขียนทับเฉพาะแถวที่มี suggested โดยไม่ rebase originalGrades
    firstPlan
      .filter((row) => row.suggested !== null)
      .forEach((row) => {
        tranItems[row.rowIndex].nameDescription = row.suggested
      })

    const secondPlan = buildGradeSyncPlan({ materials, originalGrades, tranItems })
    expect(secondPlan).toEqual([
      { rowIndex: 2, current: 'DIA,0.8', suggested: null, mode: 'manual' }
    ])
  })
})
