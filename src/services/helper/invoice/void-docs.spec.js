import { describe, it, expect } from 'vitest'
import { isClientRejection, fetchVoidDocCounts, formatCertificateNos, buildVoidDocsHtml } from './void-docs.js'

describe('isClientRejection', () => {
  it('4xx เป็นการปฏิเสธจาก server', () => {
    expect(isClientRejection({ response: { status: 400 } })).toBe(true)
    expect(isClientRejection({ response: { status: 422 } })).toBe(true)
  })
  it('5xx / network error / ไม่มี error ไม่ใช่การปฏิเสธ', () => {
    expect(isClientRejection({ response: { status: 500 } })).toBe(false)
    expect(isClientRejection({ response: { status: 504 } })).toBe(false)
    expect(isClientRejection(new Error('Network Error'))).toBe(false)
    expect(isClientRejection(null)).toBe(false)
    expect(isClientRejection(undefined)).toBe(false)
  })
})

describe('fetchVoidDocCounts', () => {
  it('คืนจำนวนและเลขใบรับรองจาก store (dedupe certificateNo)', async () => {
    const res = await fetchVoidDocCounts({
      certificateStore: {
        fetchByInvoice: async () => ({
          data: [{ certificateNo: 'DKC-1' }, { certificateNo: 'DKC-2' }, { certificateNo: 'DKC-1' }, {}],
          total: 4
        })
      },
      invoiceStore: { fetchGuaranteePrintCount: async () => 2 },
      invoiceNumber: 'INV-1'
    })
    expect(res).toEqual({ certificateCount: 2, certificateNos: ['DKC-1', 'DKC-2'], guaranteeCount: 2 })
  })
  it('ล้มเหลวแล้วถือเป็น 0', async () => {
    const res = await fetchVoidDocCounts({
      certificateStore: { fetchByInvoice: async () => { throw new Error('x') } },
      invoiceStore: { fetchGuaranteePrintCount: () => { throw new Error('y') } },
      invoiceNumber: 'INV-1'
    })
    expect(res).toEqual({ certificateCount: 0, certificateNos: [], guaranteeCount: 0 })
  })
})

describe('formatCertificateNos', () => {
  const more = (n) => `+${n}`
  it('ไม่เกิน 10 ใบแสดงครบ', () => {
    expect(formatCertificateNos(['A', 'B'], more)).toBe('A, B')
  })
  it('เกิน 10 ใบแสดง 10 แรก + จำนวนที่เหลือ', () => {
    const nos = Array.from({ length: 13 }, (_, i) => `C${i + 1}`)
    expect(formatCertificateNos(nos, more)).toBe('C1, C2, C3, C4, C5, C6, C7, C8, C9, C10 +3')
  })
})

describe('buildVoidDocsHtml', () => {
  it('เลขใบรับรองขึ้นบรรทัดใหม่ตัวหนา และ escape HTML', () => {
    const html = buildVoidDocsHtml({ docsMsg: 'msg', certLabel: 'label:', certList: 'A<b>, B' })
    expect(html).toContain('label:<br/><b>A&lt;b&gt;, B</b>')
  })
  it('ไม่มีใบรับรองไม่ต้องมีบรรทัดเลข', () => {
    expect(buildVoidDocsHtml({ docsMsg: 'msg', certLabel: 'label:', certList: '' })).not.toContain('label:')
  })
})
