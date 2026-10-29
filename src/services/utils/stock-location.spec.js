import { describe, it, expect } from 'vitest'
import {
  getLocationCount,
  isMultiLocation,
  needsMoveChoice,
  getExtraLocationCount,
  buildMoveUnitsPayload,
  validateMovePlan,
  withLocationCode
} from './stock-location.js'

describe('stock-location', () => {
  it('counts locations with fallbacks', () => {
    expect(getLocationCount({})).toBe(1)
    expect(getLocationCount({ locationCount: 3 })).toBe(3)
    expect(getLocationCount({ locations: [{}, {}] })).toBe(2)
    expect(isMultiLocation({ locationCount: 2 })).toBe(true)
    expect(getExtraLocationCount({ locationCount: 3 })).toBe(2)
    expect(getExtraLocationCount({})).toBe(0)
  })

  it('needsMoveChoice for qty>1 or multi location', () => {
    expect(needsMoveChoice({ qty: 1 })).toBe(false)
    expect(needsMoveChoice({ qty: 5 })).toBe(true)
    expect(needsMoveChoice({ qty: 1, locationCount: 2 })).toBe(true)
  })

  it('builds MoveUnits payload per mode', () => {
    const payload = buildMoveUnitsPayload({
      targetLocationCode: 'B',
      remark: '',
      plans: [
        { stockNumber: 'S1', mode: 'whole' },
        { stockNumber: 'S2', mode: 'qty', fromLocationCode: 'A', qty: '3' },
        { stockNumber: 'S3', mode: 'units', unitIds: [4, 5] }
      ]
    })
    expect(payload).toEqual({
      targetLocationCode: 'B',
      remark: undefined,
      items: [
        { stockNumber: 'S1' },
        { stockNumber: 'S2', fromLocationCode: 'A', qty: 3 },
        { stockNumber: 'S3', unitIds: [4, 5] }
      ]
    })
  })

  it('validates plans', () => {
    expect(validateMovePlan({ mode: 'whole' })).toBeNull()
    expect(validateMovePlan({ mode: 'qty', fromLocationCode: 'A', qty: 2 }, 3)).toBeNull()
    expect(validateMovePlan({ mode: 'qty', fromLocationCode: 'A', qty: 4 }, 3)).toBe('qty')
    expect(validateMovePlan({ mode: 'qty', qty: 1 })).toBe('qty')
    expect(validateMovePlan({ mode: 'units', unitIds: [] })).toBe('units')
  })

  it('withLocationCode keeps payload unchanged when empty', () => {
    const p = { stockNumber: 'S1' }
    expect(withLocationCode(p, null)).toBe(p)
    expect(withLocationCode(p, 'A')).toEqual({ stockNumber: 'S1', locationCode: 'A' })
  })
})
