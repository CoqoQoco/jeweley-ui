/**
 * Fixture ใบแจ้งหนี้ (Invoice/Get + SaleOrder/Get) สำหรับหน้า /invoice-detail
 *
 * หน้าประกอบรายการสินค้าจาก SaleOrder/Get (data JSON + stockConfirm) แล้วกรองเฉพาะบรรทัดที่ confirm
 * ให้ invoice นี้ — ดังนั้นต้องมีทั้ง stockConfirm.invoice === invoiceNumber และ data.stockItems
 *
 * @param {Object} o
 * @param {Array<{stockNumber:string, price:number, qty?:number, discount?:number}>} o.lines
 */
export function buildInvoiceFixture({
  invoiceNumber = 'INV-E2E-001',
  soNumber = 'SO-E2E-001',
  currencyUnit = 'THB',
  currencyRate = 1,
  specialDiscount = 0,
  specialAddition = 0,
  freightAndInsurance = 0,
  vat = 0,
  lines
}) {
  const stockItems = lines.map((l, i) => ({
    lineKey: `L${i + 1}`,
    stockNumber: l.stockNumber,
    productName: `สินค้าทดสอบ ${i + 1}`,
    qty: l.qty ?? 1,
    appraisalPrice: l.price,
    discountPercent: l.discount ?? 0
  }))

  const stockConfirm = lines.map((l, i) => ({
    id: i + 1,
    lineKey: `L${i + 1}`,
    invoice: invoiceNumber,
    invoiceItem: i + 1,
    dkInvoiceNumber: null,
    stockNumber: l.stockNumber,
    priceOrigin: l.price,
    qty: l.qty ?? 1,
    discount: l.discount ?? 0
  }))

  const invoice = {
    invoiceNumber,
    soNumber,
    invoiceType: 'STOCK',
    statusName: 'Active',
    currencyUnit,
    currencyRate,
    specialDiscount,
    specialAddition,
    freightAndInsurance,
    vat,
    deposit: 0,
    payments: [],
    confirmedItems: []
  }

  const saleOrder = {
    soNumber,
    currencyUnit,
    currencyRate,
    markup: 3.5,
    goldRate: 2000,
    customerName: 'ลูกค้าทดสอบ',
    createDate: '2026-01-15T00:00:00Z',
    data: JSON.stringify({ stockItems }),
    stockConfirm
  }

  return { invoice, saleOrder }
}

/** mock ที่หน้า /invoice-detail ยิงตอน mount นอกเหนือจาก Invoice/Get + SaleOrder/Get (ครอบคลุม print bridge ด้วย) */
export const INVOICE_PAGE_MOCKS = {
  'Invoice/Version/List': { data: [], total: 0 },
  'MasterBank/List': { data: [], total: 0 },
  'User/List': { data: [], total: 0 },
  'PrintLayout/bill': { layoutJson: null },
  'PrintLayout/vat': { layoutJson: null },
  printers: [],
  health: { status: 'ok' }
}
