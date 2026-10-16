// ยืนยันว่า Flow 3D เรียก endpoint ถูกตัว body ถูกรูป และไม่เติม metal scope ของทั้งหน้า
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const postMock = vi.fn()
vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...args) => postMock(...args), get: vi.fn() } }
}))

import { useMetalScopeStore } from '@/stores/modules/ui/metal-scope-store.js'
import { useExecutiveReportApiStore } from './executive-report-api.js'

describe('executive flow requests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    postMock.mockReset()
    postMock.mockResolvedValue({})
  })

  it('flowBoard posts an empty body to ExecutiveReport/FlowBoard', async () => {
    useMetalScopeStore().setMetal('SILVER')
    await useExecutiveReportApiStore().flowBoard()
    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postMock.mock.calls[0][0]).toBe('ExecutiveReport/FlowBoard')
    expect(postMock.mock.calls[0][1]).toEqual({})
  })

  it('flowZone posts the zone name to ExecutiveReport/FlowZone', async () => {
    useMetalScopeStore().setMetal('GOLD')
    await useExecutiveReportApiStore().flowZone('production')
    expect(postMock.mock.calls[0][0]).toBe('ExecutiveReport/FlowZone')
    expect(postMock.mock.calls[0][1]).toEqual({ zone: 'production' })
  })
})
