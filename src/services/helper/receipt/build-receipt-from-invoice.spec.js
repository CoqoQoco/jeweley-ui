import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildReceiptFromInvoice } from './build-receipt-from-invoice.js'

const mockInvoiceFetchGet = vi.fn()
vi.mock('@/stores/modules/api/sale/invoice-store.js', () => ({
  useInvoiceApiStore: vi.fn(() => ({ fetchGet: mockInvoiceFetchGet }))
}))

const mockSoFetchGet = vi.fn()
vi.mock('@/stores/modules/api/sale/sale-order-store.js', () => ({
  usrSaleOrderApiStore: vi.fn(() => ({ fetchGet: mockSoFetchGet }))
}))

vi.mock('@/config/company-info.js', () => ({
  loadCompanyInfo: vi.fn().mockResolvedValue({ info: { website: '' }, social: {} })
}))

vi.mock('@/services/helper/receipt/fetch-receipt-materials.js', () => ({
  fetchReceiptMaterials: vi.fn(async (items) => items)
}))

describe('buildReceiptFromInvoice — P4-3 สองบรรทัดเลขสินค้าเดียวกัน คนละ invoice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('เลือกเฉพาะบรรทัดที่เป็นของ invoice นี้จริงๆ ไม่ดึงบรรทัดของใบอื่นที่เลขสินค้าเดียวกันมาปน', async () => {
    mockInvoiceFetchGet.mockResolvedValue({
      invoiceNumber: 'INV-002',
      soNumber: 'SO-0001',
      createDate: '2026-01-01',
      customerName: 'Test Customer',
      createBy: 'tester',
      payments: [],
      grandTotalRounded: 200
    })
    mockSoFetchGet.mockResolvedValue({
      currencyUnit: 'THB',
      currencyRate: 1,
      data: JSON.stringify({
        stockItems: [
          { lineKey: 'lk-1', stockNumber: 'STK-001', stockNumberOrigin: 'STK-001', description: 'Line 1' },
          { lineKey: 'lk-2', stockNumber: 'STK-001', stockNumberOrigin: 'STK-001', description: 'Line 2' }
        ],
        copyItems: []
      }),
      stockConfirm: [
        { id: 10, lineKey: 'lk-1', stockNumber: 'STK-001', invoice: 'INV-001', priceOrigin: 100, qty: 1, discount: 0 },
        { id: 20, lineKey: 'lk-2', stockNumber: 'STK-001', invoice: 'INV-002', priceOrigin: 200, qty: 1, discount: 0 }
      ]
    })

    const receipt = await buildReceiptFromInvoice('INV-002')

    expect(receipt.items).toHaveLength(1)
    expect(receipt.items[0].appraisalPrice).toBe(200)
    expect(receipt.items[0].stockNumber).toBe('STK-001')
  })
})

describe('buildReceiptFromInvoice — D6 มัดจำ (deposit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ส่ง deposit จาก Invoice/Get ต่อให้ receiptData เพื่อให้พิมพ์ซ้ำบิลหักมัดจำถูกต้อง', async () => {
    mockInvoiceFetchGet.mockResolvedValue({
      invoiceNumber: 'INV-003',
      soNumber: 'SO-0002',
      createDate: '2026-01-01',
      customerName: 'Test Customer',
      createBy: 'tester',
      payments: [],
      deposit: 500,
      grandTotalRounded: 1000
    })
    mockSoFetchGet.mockResolvedValue({
      currencyUnit: 'THB',
      currencyRate: 1,
      data: JSON.stringify({
        stockItems: [
          { lineKey: 'lk-1', stockNumber: 'STK-002', stockNumberOrigin: 'STK-002', description: 'Line 1' }
        ],
        copyItems: []
      }),
      stockConfirm: [
        { id: 10, lineKey: 'lk-1', stockNumber: 'STK-002', invoice: 'INV-003', priceOrigin: 1000, qty: 1, discount: 0 }
      ]
    })

    const receipt = await buildReceiptFromInvoice('INV-003')

    expect(receipt.deposit).toBe(500)
  })

  it('deposit เป็น 0 หรือไม่มี ต้องไม่เพิ่มบรรทัดมัดจำ (ไม่ส่งค่าที่ทำให้ผลลัพธ์ต่างจากเดิม)', async () => {
    mockInvoiceFetchGet.mockResolvedValue({
      invoiceNumber: 'INV-004',
      soNumber: 'SO-0003',
      createDate: '2026-01-01',
      customerName: 'Test Customer',
      createBy: 'tester',
      payments: [],
      deposit: 0,
      grandTotalRounded: 1000
    })
    mockSoFetchGet.mockResolvedValue({
      currencyUnit: 'THB',
      currencyRate: 1,
      data: JSON.stringify({
        stockItems: [
          { lineKey: 'lk-1', stockNumber: 'STK-003', stockNumberOrigin: 'STK-003', description: 'Line 1' }
        ],
        copyItems: []
      }),
      stockConfirm: [
        { id: 10, lineKey: 'lk-1', stockNumber: 'STK-003', invoice: 'INV-004', priceOrigin: 1000, qty: 1, discount: 0 }
      ]
    })

    const receipt = await buildReceiptFromInvoice('INV-004')

    expect(receipt.deposit).toBe(0)
  })
})
