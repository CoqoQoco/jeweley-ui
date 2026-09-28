import { describe, it, expect } from 'vitest'

import {
  GOLD_LOSS_OVER_ALLOWED_THRESHOLD,
  resolveKpiVariant,
  formatMoneyAbbreviated,
  formatMoneyFull,
  formatGramAmount,
  calcPercent,
  isGoldLossOverThreshold,
  formatMonthLabel,
  formatMoneyWithCurrency,
  buildMonthlyCompletedSeriesData,
  buildSummaryExcelRows,
  buildStalePlansExcelRows,
  buildReceivablesExcelRows,
  buildSalesOrdersExcelRows,
  buildStockAgingExcelRows,
  buildGoldLossExcelRows
} from './executive-helpers.js'

describe('executive-helpers', () => {
  describe('resolveKpiVariant', () => {
    it('returns warning when isBad is true', () => {
      expect(resolveKpiVariant(true)).toBe('warning')
      expect(resolveKpiVariant(true, 'green')).toBe('warning')
    })

    it('returns the good variant when isBad is false', () => {
      expect(resolveKpiVariant(false)).toBe('main')
      expect(resolveKpiVariant(false, 'green')).toBe('green')
    })
  })

  describe('formatMoneyAbbreviated', () => {
    it('abbreviates millions with 2 decimals', () => {
      expect(formatMoneyAbbreviated(4560000)).toBe('฿4.56M')
      expect(formatMoneyAbbreviated(1000000)).toBe('฿1.00M')
    })

    it('abbreviates thousands with 1 decimal', () => {
      expect(formatMoneyAbbreviated(4500)).toBe('฿4.5K')
    })

    it('formats small values as plain number', () => {
      expect(formatMoneyAbbreviated(500)).toBe('฿500')
    })

    it('handles null/undefined/NaN as 0', () => {
      expect(formatMoneyAbbreviated(null)).toBe('฿0')
      expect(formatMoneyAbbreviated(undefined)).toBe('฿0')
    })
  })

  describe('formatMoneyFull', () => {
    it('formats with thousands separator and 2 decimals', () => {
      expect(formatMoneyFull(1234.5)).toBe('1,234.50')
    })

    it('defaults falsy values to 0', () => {
      expect(formatMoneyFull(null)).toBe('0.00')
      expect(formatMoneyFull(undefined)).toBe('0.00')
    })
  })

  describe('formatGramAmount', () => {
    it('formats with thousands separator and 2 decimals (no currency symbol)', () => {
      expect(formatGramAmount(1234.5)).toBe('1,234.50')
      expect(formatGramAmount(0.5)).toBe('0.50')
    })

    it('defaults falsy values to 0', () => {
      expect(formatGramAmount(null)).toBe('0.00')
      expect(formatGramAmount(undefined)).toBe('0.00')
    })
  })

  describe('calcPercent', () => {
    it('computes percent rounded to 1 decimal', () => {
      expect(calcPercent(85, 100)).toBe(85)
      expect(calcPercent(1, 3)).toBe(33.3)
    })

    it('returns 0 when total is 0 or falsy (no divide-by-zero)', () => {
      expect(calcPercent(5, 0)).toBe(0)
      expect(calcPercent(5, null)).toBe(0)
      expect(calcPercent(5, undefined)).toBe(0)
    })
  })

  describe('isGoldLossOverThreshold', () => {
    it('exposes the 0.4 default threshold constant', () => {
      expect(GOLD_LOSS_OVER_ALLOWED_THRESHOLD).toBe(0.4)
    })

    it('returns true when percent >= threshold', () => {
      expect(isGoldLossOverThreshold(0.45)).toBe(true)
      expect(isGoldLossOverThreshold(0.4)).toBe(true)
    })

    it('returns false when percent < threshold', () => {
      expect(isGoldLossOverThreshold(0.39)).toBe(false)
    })

    it('accepts a custom threshold', () => {
      expect(isGoldLossOverThreshold(0.5, 1)).toBe(false)
      expect(isGoldLossOverThreshold(1.5, 1)).toBe(true)
    })
  })

  describe('formatMonthLabel', () => {
    it('formats YYYY-MM to MM/YYYY', () => {
      expect(formatMonthLabel('2026-09')).toBe('09/2026')
    })

    it('returns empty string when month is falsy', () => {
      expect(formatMonthLabel('')).toBe('')
      expect(formatMonthLabel(null)).toBe('')
    })
  })

  describe('formatMoneyWithCurrency', () => {
    it('appends the currency unit after the formatted amount', () => {
      expect(formatMoneyWithCurrency(1234, 'US$')).toBe('1,234.00 US$')
    })

    it('falls back to plain formatted amount when currencyUnit is missing', () => {
      expect(formatMoneyWithCurrency(1234, '')).toBe('1,234.00')
      expect(formatMoneyWithCurrency(1234, null)).toBe('1,234.00')
    })

    it('defaults falsy value to 0', () => {
      expect(formatMoneyWithCurrency(null, 'THB')).toBe('0.00 THB')
    })
  })

  describe('buildMonthlyCompletedSeriesData', () => {
    it('splits rows into a completed series (all but last) and a current series (last only)', () => {
      const rows = [
        { month: '2026-06', completedCount: 10 },
        { month: '2026-07', completedCount: 20 },
        { month: '2026-08', completedCount: 5 }
      ]

      const { completed, current } = buildMonthlyCompletedSeriesData(rows)

      expect(completed).toEqual([10, 20, null])
      expect(current).toEqual([null, null, 5])
    })

    it('returns empty arrays for empty/undefined input', () => {
      expect(buildMonthlyCompletedSeriesData([])).toEqual({ completed: [], current: [] })
      expect(buildMonthlyCompletedSeriesData(undefined)).toEqual({ completed: [], current: [] })
    })

    it('treats a single-row input as the current (partial) month only', () => {
      const { completed, current } = buildMonthlyCompletedSeriesData([{ month: '2026-08', completedCount: 3 }])
      expect(completed).toEqual([null])
      expect(current).toEqual([3])
    })
  })

  describe('buildSummaryExcelRows', () => {
    const labels = {
      asOf: 'ข้อมูล ณ',
      productionOpenCount: 'ใบงานเปิดอยู่',
      productionMoved30d: 'ขยับใน 30 วัน',
      productionStale180d: 'ไม่ขยับเกิน 180 วัน',
      productionMeltedOpen: 'งานหลอมที่เปิดอยู่',
      invoiceCount: 'จำนวนใบแจ้งหนี้',
      invoiceTotalThb: 'ยอดใบแจ้งหนี้รวม',
      paidOrPartialThb: 'รับแล้ว/บางส่วน',
      unpaidCount: 'จำนวนบิลค้างรับ',
      unpaidThb: 'ยอดค้างรับ',
      overdueCount: 'จำนวนบิลเลยกำหนด',
      overdueThb: 'ยอดเลยกำหนด',
      unpaidNotOverdueThb: 'ค้างรับยังไม่เลยกำหนด',
      noDueDateCount: 'บิลไม่มีวันครบกำหนด',
      soOpenCount: 'SO เปิดอยู่',
      soNoInvoiceCount: 'SO ยังไม่ออกบิล',
      soNoInvoiceThb: 'ยอด SO ยังไม่ออกบิล',
      soOverdueNoInvoiceCount: 'SO เลยกำหนดยังไม่ออกบิล',
      soNoDeliveryDateCount: 'SO ไม่มีวันส่งมอบ',
      stockInStockCount: 'สินค้าคงคลัง',
      stockNoCostCount: 'สินค้าไม่มีต้นทุน',
      stockCostThb: 'มูลค่าต้นทุนคงคลัง',
      stockAgedOver1yCount: 'สินค้าอายุเกิน 1 ปี'
    }

    it('flattens every summary field into label/value rows', () => {
      const summary = {
        asOf: '2026-09-28T10:00:00+07:00',
        production: { openCount: 2032, moved30dCount: 500, stale180dCount: 2032, meltedOpenCount: 3 },
        receivables: {
          invoiceCount: 100,
          invoiceTotalThb: 5000000,
          paidOrPartialThb: 440000,
          unpaidCount: 62,
          unpaidThb: 4560000,
          overdueCount: 46,
          overdueThb: 3000000,
          unpaidNotOverdueThb: 1560000,
          noDueDateCount: 46
        },
        salesOrders: { openCount: 10, noInvoiceCount: 8, noInvoiceThb: 3030000, overdueNoInvoiceCount: 2, noDeliveryDateCount: 4 },
        stock: { inStockCount: 1000, noCostCount: 850, costThb: 200000, agedOver1yCount: 100 },
        goldLoss: []
      }

      const rows = buildSummaryExcelRows(summary, labels)

      expect(rows).toHaveLength(23)
      expect(rows[0]).toEqual({ label: 'ข้อมูล ณ', value: '28/09/2026' })
      expect(rows.find((r) => r.label === labels.unpaidThb).value).toBe('4,560,000.00')
      expect(rows.find((r) => r.label === labels.stockNoCostCount).value).toBe(850)
    })

    it('handles a missing/empty summary without throwing', () => {
      expect(() => buildSummaryExcelRows(null, labels)).not.toThrow()
      const rows = buildSummaryExcelRows(null, labels)
      expect(rows[0]).toEqual({ label: 'ข้อมูล ณ', value: '' })
    })
  })

  describe('buildStalePlansExcelRows', () => {
    const departmentLabels = { trim: 'แต่ง', setting: 'ฝัง' }

    it('maps rows using woText fallback chain and department label lookup', () => {
      const rows = buildStalePlansExcelRows(
        [
          {
            wo: 'WO001',
            woNumber: 'WO001',
            woText: 'WO-2026-001',
            mold: '520009E',
            productNumber: 'DK001',
            productName: 'แหวนทอง',
            productQty: 2,
            departmentKey: 'trim',
            statusName: 'รอช่างรับงาน',
            createDate: '2026-01-01',
            lastMoveDate: '2026-01-10',
            daysSinceMove: 260
          }
        ],
        departmentLabels
      )

      expect(rows).toEqual([
        {
          wo: 'WO-2026-001',
          mold: '520009E',
          productNumber: 'DK001',
          productName: 'แหวนทอง',
          productQty: 2,
          department: 'แต่ง',
          status: 'รอช่างรับงาน',
          createDate: '01/01/2026',
          lastMoveDate: '10/01/2026',
          daysSinceMove: 260
        }
      ])
    })

    it('falls back to the raw departmentKey when no label is found', () => {
      const rows = buildStalePlansExcelRows([{ departmentKey: 'unknownDept' }], departmentLabels)
      expect(rows[0].department).toBe('unknownDept')
    })

    it('returns [] for empty/undefined input', () => {
      expect(buildStalePlansExcelRows(undefined, departmentLabels)).toEqual([])
      expect(buildStalePlansExcelRows([], departmentLabels)).toEqual([])
    })
  })

  describe('buildReceivablesExcelRows', () => {
    const paymentStateLabels = { paid: 'รับครบแล้ว', partial: 'รับบางส่วน', unpaid: 'ยังไม่รับ' }

    it('formats money fields and resolves paymentState label', () => {
      const rows = buildReceivablesExcelRows(
        [
          {
            dkInvoiceNumber: 'INV001',
            soRunning: 'SO001',
            customerCode: 'C001',
            customerName: 'ลูกค้า เอ',
            createDate: '2026-01-01',
            dueDate: '2026-02-01',
            currencyUnit: 'THB',
            grandTotal: 1000,
            grandTotalThb: 1000,
            paidAmount: 500,
            outstanding: 500,
            paymentState: 'partial',
            isOverdue: true,
            daysOverdue: 12,
            salePerson: 'สมชาย',
            saleChannelCode: 'SHOP'
          }
        ],
        paymentStateLabels
      )

      expect(rows[0]).toMatchObject({
        dkInvoiceNumber: 'INV001',
        grandTotal: '1,000.00',
        paidAmount: '500.00',
        outstanding: '500.00',
        paymentState: 'รับบางส่วน',
        isOverdue: 'Y',
        daysOverdue: 12
      })
    })
  })

  describe('buildSalesOrdersExcelRows', () => {
    it('maps SO rows without invoice', () => {
      const rows = buildSalesOrdersExcelRows([
        {
          soNumber: 'SO001',
          customerCode: 'C001',
          customerName: 'ลูกค้า เอ',
          soDate: '2026-01-01',
          deliveryDate: null,
          currencyUnit: 'THB',
          grandTotal: 3030000,
          grandTotalThb: 3030000,
          isOverdue: false,
          salePerson: 'สมหญิง',
          saleChannelCode: 'ONLINE'
        }
      ])

      expect(rows[0]).toMatchObject({
        soNumber: 'SO001',
        deliveryDate: '',
        grandTotalThb: '3,030,000.00',
        isOverdue: 'N'
      })
    })
  })

  describe('buildStockAgingExcelRows', () => {
    it('concatenates ageBuckets then receiptTypes with a section marker', () => {
      const rows = buildStockAgingExcelRows(
        [{ key: 'lt1y', count: 500, noCostCount: 50, costThb: 100000 }],
        [{ receiptType: 'GR', count: 300, noCostCount: 20 }],
        { lt1y: 'น้อยกว่า 1 ปี' },
        { ageBucket: 'อายุ', receiptType: 'ประเภทรับเข้า' }
      )

      expect(rows).toEqual([
        { section: 'อายุ', key: 'น้อยกว่า 1 ปี', count: 500, noCostCount: 50, costThb: '100,000.00' },
        { section: 'ประเภทรับเข้า', key: 'GR', count: 300, noCostCount: 20, costThb: '' }
      ])
    })
  })

  describe('buildGoldLossExcelRows', () => {
    it('formats month + gram fields', () => {
      const rows = buildGoldLossExcelRows([
        { month: '2026-07', slipCount: 40, issuedGram: 1000.5, rawLossGram: 4.5678, overAllowedGram: 0.5, overAllowedPercent: 0.45 }
      ])

      expect(rows[0]).toEqual({
        month: '07/2026',
        slipCount: 40,
        issuedGram: '1000.50',
        rawLossGram: '4.57',
        overAllowedGram: '0.50',
        overAllowedPercent: '0.45'
      })
    })
  })
})
