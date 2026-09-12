import { describe, it, expect, vi } from 'vitest'
import { InvoicePdfBuilder } from './invoice-pdf-builder.js'
import { roundHalfUp } from '@/services/utils/money.js'

// ตัดการพึ่งพา company-info-store → axios-helper/router/pinia ที่ต้องมี app context จริง
// เพราะเทสต์นี้ไม่เรียก preparePDF() (ไม่ต้องโหลดโลโก้/ข้อมูลบริษัทจริง)
vi.mock('@/config/company-info.js', () => ({
  COMPANY_INFO: { name: 'Test Co', address: '', phone: '', fax: '', email: '' },
  loadCompanyInfo: vi.fn().mockResolvedValue({ info: {} })
}))

// ดึงค่าตัวเลขจาก cell สุดท้าย (index 9) ของแต่ละแถวตาราง — ทั้งแถวสินค้าและแถวสรุปยอด
// ใช้ตำแหน่งเดียวกันเสมอ (ดู setTableCellRight / summary row structure ใน invoice-pdf-builder.js)
function cellAmount(row) {
  const text = row?.[9]?.text
  if (text === undefined || text === null || text === '') return null
  return parseFloat(String(text).replace(/,/g, ''))
}

// หา summary row จาก label ที่อยู่ cell index 7 (colSpan=2)
function findRow(body, labelPredicate) {
  return body.find((row) => typeof row?.[7]?.text === 'string' && labelPredicate(row[7].text))
}

function makeBuilder(items, saleOrderData, itemsPerPage = 2) {
  return new InvoicePdfBuilder(
    items,
    { name: 'Test Customer' },
    '2026-09-11',
    saleOrderData,
    'US$',
    32.5,
    'INV-TEST-001',
    itemsPerPage
  )
}

describe('InvoicePdfBuilder — money rounding reconciliation (มาตรฐานใหม่: ไม่ปัดจนถึงยอดสุดท้าย)', () => {
  const items = [
    { appraisalPrice: 90300, discountPercent: 67, qty: 1 }, // ราคาต่อชิ้นต้องได้ 916.89 (เคสจริงจาก prod — ไม่ใช่ 917)
    { appraisalPrice: 12345.67, discountPercent: 15, qty: 3 },
    { appraisalPrice: 555.55, discountPercent: 0, qty: 5 },
    { appraisalPrice: 999.99, discountPercent: 33.33, qty: 2 }
  ]

  const saleOrderData = {
    specialDiscount: 250,
    specialAddition: 75,
    freightAndInsurance: 120,
    vatPercent: 7
  }

  it('ราคาต่อชิ้นหลังหักส่วนลด 67% ที่เรต 32.5 ต้องพิมพ์ 916.89 (ไม่ปัดเป็น 917 อีกต่อไป)', () => {
    const builder = makeBuilder([items[0]], {}, 10)
    const body = builder.buildRegularTableBody(builder.data, 0)
    // แถวที่ 1 (index 1, หลัง header) คอลัมน์ Price อยู่ index 8
    expect(body[1][8].text).toBe('916.89')
  })

  it('1) ผลบวกยอดทุกแถว (อ่านจาก cell) = F.O.B ที่พิมพ์ ภายใน tolerance 0.01', () => {
    const builder = makeBuilder(items, saleOrderData, 10)
    const body = builder.buildFinalTableBody(items, 0, 1)

    // แถวสินค้า = ทุกแถวระหว่าง header (index 0) กับแถว Total (label ที่ cell[0])
    const totalFooterIndex = body.findIndex((row) => row?.[0]?.text === 'Total')
    const itemRows = body.slice(1, totalFooterIndex)
    const sumOfRows = itemRows.reduce((sum, row) => sum + cellAmount(row), 0)

    const fobRow = findRow(body, (t) => t === 'F.O.B Bangkok')
    const fobAmount = cellAmount(fobRow)

    expect(Math.abs(sumOfRows - fobAmount)).toBeLessThanOrEqual(0.01)
    expect(fobAmount).toBeCloseTo(builder.subtotal, 2)
  })

  it('2) ผลบวกยอดท้ายหน้าทุกหน้า = F.O.B ภายใน tolerance 0.01 (itemsPerPage=2 → 2 หน้า)', () => {
    const itemsPerPage = 2
    const builder = makeBuilder(items, saleOrderData, itemsPerPage)
    const totalPages = Math.ceil(items.length / itemsPerPage)

    let sumOfPageTotals = 0
    let finalBody = null

    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const pageItems = items.slice(pageNum * itemsPerPage, pageNum * itemsPerPage + itemsPerPage)
      const isLastPage = pageNum === totalPages - 1
      const body = isLastPage
        ? builder.buildFinalTableBody(pageItems, pageNum, totalPages)
        : builder.buildRegularTableBody(pageItems, pageNum)

      const totalRow = body.find((row) => row?.[0]?.text === 'Total')
      sumOfPageTotals += cellAmount(totalRow)

      if (isLastPage) finalBody = body
    }

    const fobRow = findRow(finalBody, (t) => t === 'F.O.B Bangkok')
    const fobAmount = cellAmount(fobRow)

    expect(Math.abs(sumOfPageTotals - fobAmount)).toBeLessThanOrEqual(0.01)
  })

  it('3) F.O.B − ส่วนลด + ส่วนเพิ่ม + ค่าขนส่ง + VAT = C.I.F เป๊ะ (ไม่มี ROUNDING แล้ว)', () => {
    const builder = makeBuilder(items, saleOrderData, 10)

    const printedSum =
      builder.subtotal -
      builder.specialDiscount +
      builder.specialAddition +
      builder.freightAndInsurance +
      builder.vatAmount

    expect(printedSum).toBeCloseTo(builder.grandTotalRaw, 8)
    expect(builder.grandTotalRounded).toBe(roundHalfUp(builder.grandTotalRaw, 2))
  })

  it('ไม่มีบรรทัด ROUNDING บนเอกสารอีกต่อไป แม้ grandTotalRaw จะมีเศษ', () => {
    const builder = makeBuilder(items, saleOrderData, 10)
    const body = builder.buildFinalTableBody(items, 0, 1)
    expect(findRow(body, (t) => t === 'ROUNDING')).toBeUndefined()
  })

  it('ลำดับเลขแถวสินค้าถูกต้องแม้ itemsPerPage ไม่ใช่ 10 (บั๊กพ่วง actualIndex)', () => {
    const itemsPerPage = 2
    const builder = makeBuilder(items, saleOrderData, itemsPerPage)
    const pageItems = items.slice(2, 4)
    const body = builder.buildRegularTableBody(pageItems, 1) // pageNum=1

    // แถวแรกของหน้า 2 (pageNum=1) ต้องเป็นลำดับที่ 3 (1*2 + 0 + 1) ไม่ใช่ 1*10+0+1=11
    expect(body[1][0].text).toBe('3')
    expect(body[2][0].text).toBe('4')
  })
})
