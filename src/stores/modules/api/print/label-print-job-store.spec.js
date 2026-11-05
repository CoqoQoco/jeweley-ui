// ยืนยันว่า station endpoint ส่ง X-Device-Key ผ่าน axios-public (ไม่มี interceptor) และ 401 ล้างคีย์ ไม่ logout
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const publicPost = vi.fn()
const jewelryPost = vi.fn()
const errorAlert = vi.fn()
vi.mock('@/axios/axios-public.js', () => ({ default: { post: (...a) => publicPost(...a) } }))
vi.mock('@/axios/axios-helper.js', () => ({
  default: { jewelry: { post: (...a) => jewelryPost(...a) } }
}))
vi.mock('@/services/alert/sweetAlerts.js', () => ({ error: (...a) => errorAlert(...a) }))

import {
  useLabelPrintJobApiStore,
  LABEL_STATION_DEVICE_KEY_STORAGE_KEY
} from './label-print-job-store.js'

describe('label-print-job-store (device key)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    publicPost.mockReset()
    jewelryPost.mockReset()
    errorAlert.mockReset()
    localStorage.clear()
    localStorage.setItem(LABEL_STATION_DEVICE_KEY_STORAGE_KEY, 'KEY123')
  })

  it('sends X-Device-Key on claim/ack/list/retry/delete via axios-public', async () => {
    publicPost.mockResolvedValue({ data: { ok: true } })
    const store = useLabelPrintJobApiStore()
    await store.fetchClaim({ stationId: 's', labelType: 'GEM' })
    await store.fetchAck({ id: 1, success: true, errorMessage: null })
    await store.fetchList({})
    await store.fetchRetry({ id: 1 })
    await store.fetchDelete({ id: 1 })

    expect(publicPost.mock.calls.map((c) => c[0])).toEqual([
      'LabelPrint/Claim',
      'LabelPrint/Ack',
      'LabelPrint/List',
      'LabelPrint/Retry',
      'LabelPrint/Delete'
    ])
    publicPost.mock.calls.forEach((c) => {
      expect(c[2].headers['X-Device-Key']).toBe('KEY123')
    })
    expect(jewelryPost).not.toHaveBeenCalled()
  })

  it('fetchEnqueue still uses the JWT instance', async () => {
    jewelryPost.mockResolvedValue({})
    await useLabelPrintJobApiStore().fetchEnqueue({
      labelType: 'GEM',
      referenceCode: 'A',
      payload: '{}',
      copies: 1
    })
    expect(jewelryPost).toHaveBeenCalledOnce()
    expect(publicPost).not.toHaveBeenCalled()
  })

  it('401 clears the key, flags keyInvalid and shows no modal', async () => {
    publicPost.mockRejectedValue({ response: { status: 401 } })
    const store = useLabelPrintJobApiStore()
    await expect(store.fetchClaim({ stationId: 's', labelType: 'GEM' })).rejects.toBeTruthy()
    expect(store.keyInvalid).toBe(true)
    expect(localStorage.getItem(LABEL_STATION_DEVICE_KEY_STORAGE_KEY)).toBeNull()
    expect(errorAlert).not.toHaveBeenCalled()
  })

  it('other errors show a modal unless skipError', async () => {
    publicPost.mockRejectedValue({ response: { status: 500, data: { message: 'boom' } } })
    const store = useLabelPrintJobApiStore()
    await expect(store.fetchRetry({ id: 1 })).rejects.toBeTruthy()
    expect(errorAlert).toHaveBeenCalledOnce()
    expect(store.keyInvalid).toBe(false)

    errorAlert.mockReset()
    await expect(store.fetchList({ skipError: true })).rejects.toBeTruthy()
    expect(errorAlert).not.toHaveBeenCalled()
  })
})
