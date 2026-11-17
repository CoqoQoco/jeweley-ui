import { describe, it, expect, vi } from 'vitest'

const confirmSubmit = vi.hoisted(() => vi.fn())
vi.mock('@/services/alert/sweetAlerts.js', () => ({ confirmSubmit }))
import { isBarcodePrinter, pickDocumentPrinter } from './document-printer-guard.js'

describe('document-printer-guard', () => {
  it('ไม่เลือกเครื่องที่ตั้งเป็นเครื่องพิมพ์ป้ายบาร์โค้ดเป็นค่าตั้งต้น', () => {
    expect(pickDocumentPrinter(['GT800 RAW', 'HP LaserJet'], 'GT800 RAW')).toBe('HP LaserJet')
    expect(pickDocumentPrinter(['gt800 raw ', null], 'GT800 RAW')).toBeNull()
  })

  it('ใช้ค่าแรกตามลำดับเมื่อไม่ชนกับเครื่องป้าย', () => {
    expect(pickDocumentPrinter(['Bill Printer', 'Other'], 'GT800 RAW')).toBe('Bill Printer')
  })

  it('ไม่ได้ตั้งเครื่องป้าย → ไม่กรองอะไร · ไม่มีค่า → null', () => {
    expect(pickDocumentPrinter(['GT800 RAW'], '')).toBe('GT800 RAW')
    expect(pickDocumentPrinter([], 'GT800 RAW')).toBeNull()
  })

  it('isBarcodePrinter ไม่สนตัวพิมพ์เล็กใหญ่/ช่องว่างหัวท้าย', () => {
    expect(isBarcodePrinter(' gt800 raw', 'GT800 RAW')).toBe(true)
    expect(isBarcodePrinter('', '')).toBe(false)
  })
})

describe('confirmIfBarcodePrinter', () => {
  const texts = { message: 'm', title: 't', confirmText: 'ok', cancelText: 'no' }

  it('ไม่ใช่เครื่องป้าย → พิมพ์ต่อทันที ไม่ถาม', async () => {
    const { confirmIfBarcodePrinter } = await import('./document-printer-guard.js')
    const proceed = vi.fn()
    confirmIfBarcodePrinter('HP', 'GT800', texts, proceed)
    expect(proceed).toHaveBeenCalledTimes(1)
  })

  it('เป็นเครื่องป้าย → ถามยืนยัน ยังไม่พิมพ์จนกว่าจะยืนยัน', async () => {
    const { confirmIfBarcodePrinter } = await import('./document-printer-guard.js')
    const proceed = vi.fn()
    confirmIfBarcodePrinter('gt800', 'GT800', texts, proceed)
    expect(proceed).not.toHaveBeenCalled()
    expect(confirmSubmit).toHaveBeenCalledWith('m', 't', proceed, { confirmText: 'ok', cancelText: 'no' }, undefined, undefined)
  })
})
