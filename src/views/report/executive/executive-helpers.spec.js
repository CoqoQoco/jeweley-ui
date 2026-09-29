import { describe, it, expect } from 'vitest'

import {
  EXECUTIVE_TABS,
  resolveActiveTab,
  KPI_TAB_MAP,
  resolveKpiTab,
  buildReceivablesDonutSeries,
  buildDonutCenterLabel,
  buildDonutCenterLabelsOptions,
  DONUT_SLICE_FILTER_MAP,
  resolveDonutSliceFilter,
  resolveKpiVariant,
  formatMoneyAbbreviated,
  formatMoneyFull,
  formatGramAmount,
  calcPercent,
  resolveGoldLossKpiVariant,
  resolveLatestGoldLossRow,
  formatMonthLabel,
  formatMoneyWithCurrency,
  buildMonthlyCompletedSeriesData,
  buildSummaryExcelRows,
  buildStalePlansExcelRows,
  buildReceivablesExcelRows,
  buildSalesOrdersExcelRows,
  buildStockAgingExcelRows,
  buildGoldLossMonthlyExcelRows,
  buildGoldLossByWorkerExcelRows
} from './executive-helpers.js'
import { normalizeTangRow, normalizeSetterRow } from '@/services/utils/gold-loss/slip-monthly-helpers.js'

describe('executive-helpers', () => {
  describe('resolveActiveTab', () => {
    it('returns the tab value when it is one of the known tabs', () => {
      EXECUTIVE_TABS.forEach((tab) => {
        expect(resolveActiveTab(tab)).toBe(tab)
      })
    })

    it('falls back to production for invalid/missing values', () => {
      expect(resolveActiveTab('bogus')).toBe('production')
      expect(resolveActiveTab(undefined)).toBe('production')
      expect(resolveActiveTab(null)).toBe('production')
      expect(resolveActiveTab('')).toBe('production')
    })
  })

  describe('resolveKpiTab', () => {
    it('maps every known KPI key to its tab per KPI_TAB_MAP', () => {
      Object.entries(KPI_TAB_MAP).forEach(([kpiKey, tab]) => {
        expect(resolveKpiTab(kpiKey)).toBe(tab)
      })
    })

    it('falls back to production for an unknown KPI key', () => {
      expect(resolveKpiTab('unknownKpi')).toBe('production')
    })
  })

  describe('buildReceivablesDonutSeries', () => {
    const labels = { paid: 'รับแล้ว/บางส่วน', unpaidNotDue: 'ยังไม่รับ ยังไม่เลย', overdue: 'ยังไม่รับ เลยกำหนด' }

    it('orders series as [paidOrPartialThb, unpaidNotOverdueThb, overdueThb]', () => {
      const result = buildReceivablesDonutSeries(
        { paidOrPartialThb: 100, unpaidNotOverdueThb: 200, overdueThb: 300 },
        labels
      )
      expect(result.series).toEqual([100, 200, 300])
      expect(result.labels).toEqual([labels.paid, labels.unpaidNotDue, labels.overdue])
    })

    it('defaults missing amounts to 0 and missing labels to empty string', () => {
      const result = buildReceivablesDonutSeries(null, {})
      expect(result.series).toEqual([0, 0, 0])
      expect(result.labels).toEqual(['', '', ''])
    })
  })

  describe('buildDonutCenterLabel', () => {
    it('returns abbreviated total and raw invoice count', () => {
      expect(buildDonutCenterLabel({ invoiceTotalThb: 5000000, invoiceCount: 62 })).toEqual({
        totalAbbrev: '฿5.00M',
        invoiceCount: 62
      })
    })

    it('defaults to 0 for missing/empty summary', () => {
      expect(buildDonutCenterLabel(null)).toEqual({ totalAbbrev: '฿0', invoiceCount: 0 })
    })
  })

  describe('buildDonutCenterLabelsOptions', () => {
    it('name.show/value.show ต้อง true คู่กับ total.show เสมอ (ไม่งั้น ApexCharts ไม่สร้าง element แสดง center label)', () => {
      const options = buildDonutCenterLabelsOptions('62 ใบ', '฿5.00M')

      expect(options.show).toBe(true)
      expect(options.name.show).toBe(true)
      expect(options.value.show).toBe(true)
      expect(options.total.show).toBe(true)
      expect(options.total.showAlways).toBe(true)
      expect(options.total.label).toBe('62 ใบ')
      expect(options.total.formatter()).toBe('฿5.00M')
    })
  })

  describe('resolveDonutSliceFilter', () => {
    it('maps slice index to the DONUT_SLICE_FILTER_MAP order', () => {
      expect(DONUT_SLICE_FILTER_MAP).toEqual(['all', 'unpaid', 'overdue'])
      expect(resolveDonutSliceFilter(0)).toBe('all')
      expect(resolveDonutSliceFilter(1)).toBe('unpaid')
      expect(resolveDonutSliceFilter(2)).toBe('overdue')
    })

    it('returns null for an out-of-range index', () => {
      expect(resolveDonutSliceFilter(3)).toBeNull()
      expect(resolveDonutSliceFilter(-1)).toBeNull()
    })
  })

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

  describe('resolveGoldLossKpiVariant', () => {
    it('คืน green เมื่อ lossPercent <= allowedPercent', () => {
      expect(resolveGoldLossKpiVariant(1.5, 1.5)).toBe('green')
      expect(resolveGoldLossKpiVariant(1.0, 1.5)).toBe('green')
    })

    it('คืน warning เมื่อ lossPercent > allowedPercent', () => {
      expect(resolveGoldLossKpiVariant(2.0, 1.5)).toBe('warning')
    })

    it('ค่า falsy/undefined ถือเป็น 0 ไม่พัง', () => {
      expect(resolveGoldLossKpiVariant(undefined, undefined)).toBe('green')
      expect(resolveGoldLossKpiVariant(0.1, undefined)).toBe('warning')
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
      stockAgedOver1yCount: 'สินค้าอายุเกิน 1 ปี',
      goldLossPercent: '% loss ทองช่างแต่ง',
      goldLossAllowedPercent: '% เกณฑ์ในใบ',
      goldLossOverSlipCount: 'จำนวนใบที่เกินเกณฑ์',
      goldLossOverAllowedGram: 'เกินเกณฑ์รวม (กรัม)'
    }

    it('flattens every summary field into label/value rows (รวมแถวทองเดือนล่าสุด)', () => {
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
        goldLoss: [
          { month: '2026-08', lossPercent: 1.1, allowedPercent: 1.5, overSlipCount: 1, overAllowedGram: 2 },
          { month: '2026-09', lossPercent: 1.8, allowedPercent: 1.5, overSlipCount: 3, overAllowedGram: 4.5678 }
        ]
      }

      const rows = buildSummaryExcelRows(summary, labels)

      expect(rows).toHaveLength(27)
      expect(rows[0]).toEqual({ label: 'ข้อมูล ณ', value: '28/09/2026' })
      expect(rows.find((r) => r.label === labels.unpaidThb).value).toBe('4,560,000.00')
      expect(rows.find((r) => r.label === labels.stockNoCostCount).value).toBe(850)
      // ใช้แถวเดือนล่าสุด (2026-09) ไม่ใช่แถวแรก
      expect(rows.find((r) => r.label === labels.goldLossPercent).value).toBe('1.8%')
      expect(rows.find((r) => r.label === labels.goldLossAllowedPercent).value).toBe('1.5%')
      expect(rows.find((r) => r.label === labels.goldLossOverSlipCount).value).toBe(3)
      expect(rows.find((r) => r.label === labels.goldLossOverAllowedGram).value).toBe('4.57')
    })

    it('handles a missing/empty summary without throwing', () => {
      expect(() => buildSummaryExcelRows(null, labels)).not.toThrow()
      const rows = buildSummaryExcelRows(null, labels)
      expect(rows[0]).toEqual({ label: 'ข้อมูล ณ', value: '' })
      expect(rows.find((r) => r.label === labels.goldLossPercent).value).toBe('0%')
    })
  })

  describe('resolveLatestGoldLossRow', () => {
    it('คืนแถวสุดท้ายของ array (เดือนล่าสุด)', () => {
      const rows = [{ month: '2026-08' }, { month: '2026-09' }]
      expect(resolveLatestGoldLossRow(rows)).toBe(rows[1])
    })

    it('array ว่าง/undefined คืนแถว default ทุก field เป็น 0', () => {
      expect(resolveLatestGoldLossRow([])).toEqual({
        month: '',
        slipCount: 0,
        issuedGram: 0,
        rawLossGram: 0,
        allowedGram: 0,
        overAllowedGram: 0,
        overSlipCount: 0,
        lossPercent: 0,
        allowedPercent: 0,
        overAllowedPercent: 0
      })
      expect(resolveLatestGoldLossRow(undefined).month).toBe('')
    })
  })

  describe('buildStalePlansExcelRows', () => {
    const departmentLabels = { trim: 'แต่ง', setting: 'ฝัง' }
    const createdFallbackLabel = 'สร้างใบงาน'

    it('maps rows using woText fallback chain, department label lookup, and the new last-action/workers fields', () => {
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
            lastUpdateBy: 'สมชาย',
            lastAction: 'ส่งขัด',
            lastActionDate: '2026-01-10T09:00:00',
            workers: ['สมชาย', 'สมหญิง'],
            daysSinceMove: 260
          }
        ],
        departmentLabels,
        createdFallbackLabel
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
          lastUpdateBy: 'สมชาย',
          lastAction: 'ส่งขัด',
          lastActionDate: '10/01/2026',
          workers: 'สมชาย, สมหญิง',
          daysSinceMove: 260
        }
      ])
    })

    it('falls back to the raw departmentKey when no label is found', () => {
      const rows = buildStalePlansExcelRows([{ departmentKey: 'unknownDept' }], departmentLabels)
      expect(rows[0].department).toBe('unknownDept')
    })

    it('falls back lastAction to createdFallbackLabel when the plan has no status history yet', () => {
      const rows = buildStalePlansExcelRows([{ departmentKey: 'trim', lastAction: null }], departmentLabels, createdFallbackLabel)
      expect(rows[0].lastAction).toBe(createdFallbackLabel)
    })

    it('defaults lastUpdateBy/lastActionDate/workers to empty when missing', () => {
      const rows = buildStalePlansExcelRows([{ departmentKey: 'trim' }], departmentLabels)
      expect(rows[0].lastUpdateBy).toBe('')
      expect(rows[0].lastActionDate).toBe('')
      expect(rows[0].workers).toBe('')
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

    it('falls back to running when dkInvoiceNumber is null (legacy invoices with no dk number)', () => {
      const rows = buildReceivablesExcelRows([{ dkInvoiceNumber: null, running: 'RUN-62', outstanding: 100 }], paymentStateLabels)
      expect(rows[0].dkInvoiceNumber).toBe('RUN-62')
    })

    it('uses empty string when both dkInvoiceNumber and running are missing', () => {
      const rows = buildReceivablesExcelRows([{ outstanding: 100 }], paymentStateLabels)
      expect(rows[0].dkInvoiceNumber).toBe('')
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

  describe('buildGoldLossMonthlyExcelRows', () => {
    const deptLabels = { tang: 'ช่างแต่ง', setter: 'ช่างฝัง' }

    it('สร้าง 2 แถวต่อเดือน (tang+setter) ตามลำดับ monthKeys ที่ให้มา', () => {
      const tangRows = [normalizeTangRow({ workerCode: 'A', workerName: 'A', year: 2026, month: 7, slipCount: 1, totalIssued: 1000, totalRawLoss: 10, totalAllowedLoss: 15, totalAllowedLossBase: 1000 })]
      const setterRows = [normalizeSetterRow({ workerCode: 'X', workerName: 'X', year: 2026, month: 7, slipCount: 1, totalWeightSend: 200, totalWeightCheck: 198, totalWeightLossAllowed: 3 })]

      const rows = buildGoldLossMonthlyExcelRows(['2026-07', '2026-08'], tangRows, setterRows, deptLabels)

      expect(rows).toEqual([
        { month: '07/2026', dept: 'ช่างแต่ง', issuedGram: '1000.00', lossGram: '10.00', allowedGram: '15.00', lossPercent: '1.00' },
        { month: '07/2026', dept: 'ช่างฝัง', issuedGram: '200.00', lossGram: '2.00', allowedGram: '3.00', lossPercent: '1.00' },
        { month: '08/2026', dept: 'ช่างแต่ง', issuedGram: '0.00', lossGram: '0.00', allowedGram: '0.00', lossPercent: '0.00' },
        { month: '08/2026', dept: 'ช่างฝัง', issuedGram: '0.00', lossGram: '0.00', allowedGram: '0.00', lossPercent: '0.00' }
      ])
    })
  })

  describe('buildGoldLossByWorkerExcelRows', () => {
    it('รวม 2 แผนกเป็นชุดเดียว rank เริ่มใหม่ที่ 1 ต่อแผนก เรียง loss มากไปน้อย', () => {
      const tangRows = [
        normalizeTangRow({ workerCode: 'A', workerName: 'A', year: 2026, month: 8, slipCount: 1, totalIssued: 500, totalRawLoss: 5, totalAllowedLoss: 7.5, totalAllowedLossBase: 500 }),
        normalizeTangRow({ workerCode: 'B', workerName: 'B', year: 2026, month: 8, slipCount: 1, totalIssued: 1000, totalRawLoss: 20, totalAllowedLoss: 15, totalAllowedLossBase: 1000 })
      ]
      const setterRows = [normalizeSetterRow({ workerCode: 'X', workerName: 'X', year: 2026, month: 8, slipCount: 1, totalWeightSend: 200, totalWeightCheck: 198, totalWeightLossAllowed: 3 })]

      const rows = buildGoldLossByWorkerExcelRows(tangRows, setterRows, { tang: 'ช่างแต่ง', setter: 'ช่างฝัง' })

      expect(rows).toEqual([
        { rank: 1, dept: 'ช่างแต่ง', workerCode: 'B', workerName: 'B', issuedGram: '1000.00', lossGram: '20.00', allowedGram: '15.00', lossPercent: '2.00' },
        { rank: 2, dept: 'ช่างแต่ง', workerCode: 'A', workerName: 'A', issuedGram: '500.00', lossGram: '5.00', allowedGram: '7.50', lossPercent: '1.00' },
        { rank: 1, dept: 'ช่างฝัง', workerCode: 'X', workerName: 'X', issuedGram: '200.00', lossGram: '2.00', allowedGram: '3.00', lossPercent: '1.00' }
      ])
    })
  })
})
