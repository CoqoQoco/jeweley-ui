import { describe, it, expect } from 'vitest'

import routes from './report-routes.js'
import { PERMISSIONS } from '@/services/permission/config.js'

describe('report-routes — executive overview', () => {
  const executiveParent = routes.find((r) => r.name === 'report-executive')

  it('has its own parent menu entry gated by executive:view only (not report:view)', () => {
    expect(executiveParent).toBeTruthy()
    expect(executiveParent.meta.majorShow).toBe(true)
    expect(executiveParent.meta.menuSection).toBe('report')
    expect(executiveParent.meta.permissions).toEqual([PERMISSIONS.EXECUTIVE_VIEW])
    expect(executiveParent.meta.permissions).not.toContain(PERMISSIONS.REPORT_VIEW)
  })

  it('has exactly one child route for the /executive page, gated the same way', () => {
    expect(executiveParent.children).toHaveLength(1)

    const child = executiveParent.children[0]
    expect(child.name).toBe('executive')
    expect(child.path).toBe('/executive')
    expect(child.meta.minorShow).toBe(true)
    expect(child.meta.permissions).toEqual([PERMISSIONS.EXECUTIVE_VIEW])
  })

  it('redirects the parent path straight to /executive', () => {
    expect(executiveParent.redirect).toBe('/executive')
  })
})
