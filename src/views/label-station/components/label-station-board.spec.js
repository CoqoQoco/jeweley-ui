// executePrint: ส่ง payload ของงานไป bridge /print/label พร้อมเครื่องพิมพ์ + จำนวนสำเนา
import { describe, it, expect, vi, beforeEach } from 'vitest'

const printLabel = vi.fn()
let failWith = null
vi.mock('@/services/api/print-bridge-service.js', () => ({
  getPrinters: vi.fn(),
  checkBridgeHealth: vi.fn(),
  printLabel: async (...args) => {
    if (failWith) throw new Error(failWith)
    return printLabel(...args)
  }
}))
vi.mock('@/stores/modules/api/print/label-print-job-store.js', () => ({
  useLabelPrintJobApiStore: () => ({})
}))

import Board from './label-station-board.vue'

const run = (job, selectedPrinter = 'PC42t') =>
  Board.methods.executePrint.call(
    { parsePayload: Board.methods.parsePayload, selectedPrinter, $t: (k) => k },
    job
  )

const payload = {
  stockCode: '*G1*',
  barcode: 'G1',
  description: 'Ruby Oval 3x4 AA',
  date: '05/11/2026',
  goldType: 'AA',
  price: '[C] 10.00'
}

describe('label-station-board executePrint', () => {
  beforeEach(() => {
    printLabel.mockReset()
    failWith = null
  })

  it('calls printLabel with payload, printer and copies', async () => {
    printLabel.mockResolvedValue({ success: true })
    const out = await run({ payload: JSON.stringify(payload), copies: 3 })
    expect(out).toEqual({ success: true, errorMessage: null })
    expect(printLabel).toHaveBeenCalledWith({ ...payload, printerName: 'PC42t', copies: 3 })
  })

  it('defaults copies to 1', async () => {
    printLabel.mockResolvedValue({ success: true })
    await run({ payload: JSON.stringify(payload) })
    expect(printLabel.mock.calls[0][0].copies).toBe(1)
  })

  it('returns the error message when printLabel throws', async () => {
    failWith = 'boom'
    const out = await run({ payload: JSON.stringify(payload), copies: 1 })
    expect(out).toEqual({ success: false, errorMessage: 'boom' })
  })

  it('fails without a printer or with invalid payload and does not print', async () => {
    expect((await run({ payload: JSON.stringify(payload) }, '')).success).toBe(false)
    expect((await run({ payload: 'not json' })).errorMessage).toBe('view.labelStation.invalidPayload')
    expect(printLabel).not.toHaveBeenCalled()
  })
})
