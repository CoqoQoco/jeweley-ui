import { describe, it, expect } from 'vitest'
import { loadInvoiceContext } from './build-invoice-pdf-data.js'

function makeStores({ confirmedItems, stockConfirm, soItems, invoiceNumber = 'INV-002', soNumber = 'SO-0001' }) {
  const invoiceStore = {
    fetchGet: async () => ({
      invoiceNumber,
      soNumber,
      vat: 0,
      confirmedItems
    })
  }
  const saleOrderStore = {
    fetchGet: async () => ({
      currencyUnit: 'THB',
      currencyRate: 1,
      data: JSON.stringify({ stockItems: soItems, copyItems: [] }),
      stockConfirm
    })
  }
  return { invoiceStore, saleOrderStore }
}

describe('loadInvoiceContext — P4-3 สองบรรทัดเลขสินค้าเดียวกัน คนละ invoice', () => {
  it('จับคู่เฉพาะบรรทัดที่ invoice === invoiceNumber ของใบนี้เท่านั้น ไม่ดึงบรรทัดของใบอื่นมาปน', async () => {
    const soItems = [
      { lineKey: 'lk-1', stockNumber: 'STK-001', description: 'Line 1' },
      { lineKey: 'lk-2', stockNumber: 'STK-001', description: 'Line 2' }
    ]
    const stockConfirm = [
      { id: 10, lineKey: 'lk-1', stockNumber: 'STK-001', invoice: 'INV-001', priceOrigin: 100, qty: 1, discount: 0 },
      { id: 20, lineKey: 'lk-2', stockNumber: 'STK-001', invoice: 'INV-002', priceOrigin: 200, qty: 1, discount: 0 }
    ]
    const confirmedItems = [{ id: 20, stockNumber: 'STK-001', lineKey: 'lk-2', invoice: 'INV-002' }]

    const { invoiceStore, saleOrderStore } = makeStores({ confirmedItems, stockConfirm, soItems })

    const { invoiceItems } = await loadInvoiceContext('INV-002', { invoiceStore, saleOrderStore })

    expect(invoiceItems).toHaveLength(1)
    expect(invoiceItems[0].lineKey).toBe('lk-2')
    expect(invoiceItems[0].id).toBe(20)
    expect(invoiceItems[0].appraisalPrice).toBe(200)
  })

  it('ไม่มี lineKey (ข้อมูลเก่า) แต่ stockConfirm scope ด้วย invoice ไว้แล้ว → fallback stockNumber ปลอดภัย', async () => {
    const soItems = [{ stockNumber: 'STK-002', description: 'Legacy line' }]
    const stockConfirm = [
      { id: 30, lineKey: null, stockNumber: 'STK-002', invoice: 'INV-002', priceOrigin: 300, qty: 2, discount: 5 }
    ]
    const confirmedItems = [{ id: 30, stockNumber: 'STK-002', lineKey: null, invoice: 'INV-002' }]

    const { invoiceStore, saleOrderStore } = makeStores({ confirmedItems, stockConfirm, soItems })

    const { invoiceItems } = await loadInvoiceContext('INV-002', { invoiceStore, saleOrderStore })

    expect(invoiceItems).toHaveLength(1)
    expect(invoiceItems[0].id).toBe(30)
    expect(invoiceItems[0].qty).toBe(2)
  })
})

describe('loadInvoiceContext — MATERIAL short-circuit (ไม่มี SO product ผูกอยู่)', () => {
  it('invoiceType MATERIAL → คืน { invoiceResponse, invoiceItems: [], isMaterial: true } โดยไม่เรียก SaleOrder/Get', async () => {
    let saleOrderGetCalled = false
    const invoiceStore = {
      fetchGet: async () => ({
        invoiceNumber: 'INVM260921001',
        invoiceType: 'MATERIAL',
        soNumber: 'SM260921-RUN-001',
        materialSaleDocumentNo: 'SM260921001',
        vat: 7
      })
    }
    const saleOrderStore = {
      fetchGet: async () => {
        saleOrderGetCalled = true
        throw new Error('SaleOrder/Get ไม่ควรถูกเรียกสำหรับ MATERIAL invoice')
      }
    }

    const context = await loadInvoiceContext('INVM260921001', { invoiceStore, saleOrderStore })

    expect(saleOrderGetCalled).toBe(false)
    expect(context.isMaterial).toBe(true)
    expect(context.invoiceItems).toEqual([])
    expect(context.invoiceResponse.invoiceNumber).toBe('INVM260921001')
    expect(context.invoiceResponse.materialSaleDocumentNo).toBe('SM260921001')
  })
})
