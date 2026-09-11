import { describe, it, expect, vi } from 'vitest'
import { InvoicePdfBuilder } from './invoice-pdf-builder.js'

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

describe('InvoicePdfBuilder — money rounding reconciliation', () => {
  const items = [
    { appraisalPrice: 90300, discountPercent: 67, qty: 1 }, // ราคาต่อชิ้นต้องได้ 917 (เคสจริงจาก prod)
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

  it('ราคาต่อชิ้นหลังหักส่วนลด 67% ที่เรต 32.5 ต้องได้ 917 ไม่ใช่ 916', () => {
    const builder = makeBuilder([items[0]], {}, 10)
    const body = builder.buildRegularTableBody(builder.data, 0)
    // แถวที่ 1 (index 1, หลัง header) คอลัมน์ Price อยู่ index 8
    expect(body[1][8].text).toBe('917')
  })

  it('1) ผลบวกยอดทุกแถว = F.O.B', () => {
    const builder = makeBuilder(items, saleOrderData, 10)
    const body = builder.buildFinalTableBody(items, 0, 1)

    // แถวสินค้า = ทุกแถวระหว่าง header (index 0) กับแถว Total (label ที่ cell[0])
    const totalFooterIndex = body.findIndex((row) => row?.[0]?.text === 'Total')
    const itemRows = body.slice(1, totalFooterIndex)
    const sumOfRows = itemRows.reduce((sum, row) => sum + cellAmount(row), 0)

    const fobRow = findRow(body, (t) => t === 'F.O.B Bangkok')
    const fobAmount = cellAmount(fobRow)

    expect(sumOfRows).toBeCloseTo(fobAmount, 5)
    expect(fobAmount).toBe(builder.subtotal)
  })

  it('2) ผลบวกยอดท้ายหน้าทุกหน้า = F.O.B (itemsPerPage=2 → 2 หน้า)', () => {
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

    expect(sumOfPageTotals).toBeCloseTo(fobAmount, 5)
  })

  it('3) F.O.B − ส่วนลด + ส่วนเพิ่ม + ค่าขนส่ง + VAT + ROUNDING = C.I.F เป๊ะ', () => {
    const builder = makeBuilder(items, saleOrderData, 10)
    const body = builder.buildFinalTableBody(items, 0, 1)

    const fob = cellAmount(findRow(body, (t) => t === 'F.O.B Bangkok'))
    const specialDiscountRow = findRow(body, (t) => t === 'SPECIAL DISCOUNT')
    const specialAdditionRow = findRow(body, (t) => t === 'SPECIAL ADDITION')
    const freightRow = findRow(body, (t) => t === 'FREIGHT & INSURANCE')
    const vatRow = findRow(body, (t) => t.startsWith('VAT'))
    const roundingRow = findRow(body, (t) => t === 'ROUNDING')
    const cifRow = findRow(body, (t) => t === 'C.I.F')

    const specialDiscount = specialDiscountRow ? cellAmount(specialDiscountRow) : 0
    const specialAddition = specialAdditionRow ? cellAmount(specialAdditionRow) : 0
    const freight = freightRow ? cellAmount(freightRow) : 0
    const vat = vatRow ? cellAmount(vatRow) : 0
    const rounding = roundingRow ? cellAmount(roundingRow) : 0
    const cif = cellAmount(cifRow)

    // specialDiscount ถูกพิมพ์เป็นค่าติดลบอยู่แล้ว (เช่น "-250") จึงบวกตรงๆ ได้เลย
    const printedSum = fob + specialDiscount + specialAddition + freight + vat + rounding

    expect(printedSum).toBeCloseTo(cif, 5)
    expect(cif).toBe(builder.grandTotalRounded)
  })

  it('ไม่มีบรรทัด ROUNDING เมื่อ roundingAdjustment = 0', () => {
    const builder = makeBuilder(
      [{ appraisalPrice: 1000, discountPercent: 0, qty: 1 }],
      {},
      10
    )
    const body = builder.buildFinalTableBody(builder.data, 0, 1)
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
