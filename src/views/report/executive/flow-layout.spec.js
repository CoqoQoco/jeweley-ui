import { describe, it, expect } from 'vitest'

import { SCENE_ZONES, STATIONS, BELTS, GATES, ZONE_BOUNDS, ZONE_OFFSET, OVERVIEW_TARGET, STATION_BY_ID } from './flow-layout.js'

describe('flow layout (landscape)', () => {
  it('keeps every station inside its own zone', () => {
    STATIONS.forEach((s) => {
      const z = ZONE_BOUNDS[s.zone]
      expect(s.pos[0] - s.w / 2).toBeGreaterThan(z.x0)
      expect(s.pos[0] + s.w / 2).toBeLessThan(z.x1)
      expect(s.pos[2] - s.d / 2).toBeGreaterThan(z.z0)
      expect(s.pos[2] + s.d / 2).toBeLessThan(z.z1)
    })
  })

  it('does not overlap zones', () => {
    SCENE_ZONES.forEach((a, i) => {
      SCENE_ZONES.slice(i + 1).forEach((b) => {
        const apart = a.x1 < b.x0 || b.x1 < a.x0 || a.z1 < b.z0 || b.z1 < a.z0
        expect(apart, `${a.id} vs ${b.id}`).toBe(true)
      })
    })
  })

  it('shifts zones by the declared offsets and places sales to the right of stock', () => {
    expect(ZONE_OFFSET['z-sales']).toEqual([44.4, 1.8])
    expect(ZONE_BOUNDS['z-sales'].x0).toBeGreaterThan(ZONE_BOUNDS['z-stock'].x1)
    expect(STATION_BY_ID['sale-quote'].pos[2]).toBeCloseTo(STATION_BY_ID.sk0.pos[2], 5)
  })

  it('builds belts with positive length and three gates on the belt path', () => {
    expect(BELTS.length).toBe(19)
    BELTS.forEach(([x1, z1, x2, z2]) => expect(Math.hypot(x2 - x1, z2 - z1)).toBeGreaterThan(0.2))
    expect(GATES.map((g) => g.id)).toEqual(['A', 'B', 'C'])
    expect(GATES[2].pos[0]).toBeGreaterThan(ZONE_BOUNDS['z-stock'].x1)
    expect(GATES[2].pos[0]).toBeLessThan(ZONE_BOUNDS['z-sales'].x0)
  })

  it('looks at the middle of the layout', () => {
    expect(OVERVIEW_TARGET).toEqual([40.5, 0, 24.3])
  })
})
