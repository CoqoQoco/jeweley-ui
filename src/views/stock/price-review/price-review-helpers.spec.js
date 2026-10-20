import { describe, it, expect } from 'vitest'
import {
  buildPriceReviewSearch,
  createStockFilter,
  buildPriceReviewExportRows,
  formatWoText
} from './price-review-helpers.js'

describe('buildPriceReviewSearch', () => {
  it('ไม่ส่งค่าว่าง และ reviewStatus เริ่มต้น PENDING', () => {
    expect(buildPriceReviewSearch({ text: '  ', reasonCode: '' }, undefined)).toEqual({
      text: undefined,
      reasonCode: undefined,
      reviewStatus: 'PENDING',
      filter: undefined
    })
  })

  it('trim ข้อความ ส่งค่าที่เลือก และแนบ filter ตามที่ได้รับ', () => {
    const filter = { mold: 'CN-1', priceMin: 10 }
    expect(
      buildPriceReviewSearch({ text: ' DK20 ', reasonCode: 'SAME_WO', reviewStatus: 'ACKED' }, filter)
    ).toEqual({ text: 'DK20', reasonCode: 'SAME_WO', reviewStatus: 'ACKED', filter })
  })

  it('reviewStatus ที่ไม่รู้จัก → PENDING', () => {
    expect(buildPriceReviewSearch({ reviewStatus: 'X' }, {}).reviewStatus).toBe('PENDING')
  })
})

describe('createStockFilter', () => {
  it('คืนออบเจ็กต์ใหม่ทุกครั้ง (array ไม่ใช้ร่วมกัน)', () => {
    const a = createStockFilter()
    a.materials.push('X')
    expect(createStockFilter().materials).toEqual([])
    expect(createStockFilter().materialMatch).toBe('all')
  })
})

describe('formatWoText', () => {
  it('รวม wo-woNumber', () => {
    expect(formatWoText({ wo: '6802', woNumber: 17 })).toBe('6802-17')
    expect(formatWoText({ wo: '6802' })).toBe('6802')
    expect(formatWoText({})).toBe('')
  })
})

describe('buildPriceReviewExportRows', () => {
  const headers = {
    stockNumberOrigin: 'old',
    stockNumber: 'new',
    productNumber: 'code',
    productName: 'name',
    productType: 'type',
    wo: 'wo',
    price: 'price',
    reasons: 'reasons',
    suggestedPrice: 'suggested'
  }
  const t = (key, p) => `${key}|${p.reference}`

  it('แปลงแถวและเหตุผล', () => {
    const rows = buildPriceReviewExportRows(
      t,
      [
        {
          stockNumber: 'DK1',
          stockNumberOrigin: 'A1',
          productNameTh: 'กำไล',
          price: 611000,
          wo: '68',
          woNumber: 2,
          reasons: [{ code: 'SAME_WO', value: 1, reference: 61000 }, { code: 'X' }],
          suggestedPrice: 61100
        }
      ],
      headers
    )
    expect(rows).toEqual([
      {
        old: 'A1',
        new: 'DK1',
        code: '',
        name: 'กำไล',
        type: '',
        wo: '68-2',
        price: 611000,
        reasons: 'common.priceCheck.reason.SAME_WO|61,000',
        suggested: 61100
      }
    ])
  })

  it('ไม่มีราคาแนะนำ → ว่าง', () => {
    const [row] = buildPriceReviewExportRows(t, [{ stockNumber: 'DK2', price: 5 }], headers)
    expect(row.suggested).toBe('')
    expect(row.reasons).toBe('')
  })
})

describe('buildPriceReviewExportRows (ack)', () => {
  const headers = {
    stockNumberOrigin: 'old',
    stockNumber: 'new',
    productNumber: 'code',
    productName: 'name',
    productType: 'type',
    wo: 'wo',
    price: 'price',
    reasons: 'reasons',
    suggestedPrice: 'suggested',
    ackStatus: 'ackStatus',
    ackBy: 'ackBy',
    ackDate: 'ackDate',
    ackNote: 'ackNote'
  }
  const labels = { acked: 'ตรวจแล้ว', pending: 'ยังไม่ตรวจ', changed: 'แก้ราคาแล้ว' }
  const t = () => ''
  const fmt = (d) => `fmt:${d}`

  it('เพิ่มคอลัมน์สถานะตรวจ', () => {
    const rows = buildPriceReviewExportRows(
      t,
      [
        { stockNumber: 'A', price: 1, isAcked: true, ackBy: 'u', ackDate: '2026-01-01', ackNote: 'ok' },
        { stockNumber: 'B', price: 1, priceChangedSinceAck: true },
        { stockNumber: 'C', price: 1 }
      ],
      headers,
      labels,
      fmt
    )
    expect(rows[0]).toMatchObject({ ackStatus: 'ตรวจแล้ว', ackBy: 'u', ackDate: 'fmt:2026-01-01', ackNote: 'ok' })
    expect(rows[1].ackStatus).toBe('แก้ราคาแล้ว')
    expect(rows[2]).toMatchObject({ ackStatus: 'ยังไม่ตรวจ', ackBy: '', ackDate: '', ackNote: '' })
  })
})
