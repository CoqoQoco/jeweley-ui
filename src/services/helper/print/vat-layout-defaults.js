export const VAT_LAYOUT_KEY = 'vat'
export const VAT_V2_LAYOUT_KEY = 'vat-v2'

// พิกัดเป็นนิ้ว (กระดาษ 9x11) — ที่เดียวที่ทั้ง builder และหน้าตั้งค่าใช้ร่วมกัน
// 'vat' = ฟอร์มเดิม (ห้ามเปลี่ยนค่า) · 'vat-v2' = ฟอร์มใบกำกับภาษีแบบใหม่ ประมาณจากรูปถ่ายฟอร์ม (ปรับละเอียดที่หน้าตั้งค่า)
export const VAT_LAYOUT_DEFAULTS = {
  [VAT_LAYOUT_KEY]: {
    invoiceNo: { x: 6.0, y: 1.8 },
    date: { x: 6.0, y: 2.2 },
    customerName: { x: 1.2, y: 1.75 },
    customerTaxId: { x: 1.2, y: 1.95 },
    customerAddress: { x: 1.2, y: 2.15 },
    itemsStart: { x: 0, y: 3.1 },
    itemNoX: 0.6,
    itemDescX: 1.1,
    itemQtyX: 4.15,
    itemPriceX: 5.15,
    itemAmountX: 6.48,
    subtotal: { x: 6.5, y: 7.6 },
    vat: { x: 6.5, y: 7.98 },
    total: { x: 6.5, y: 8.3 },
    amountText: { x: 1.0, y: 8.3 },
    rowHeight: 0.17,
    maxRowsPerPage: 25,
    headerFontSize: 12,
    itemFontSize: 10,
    printerName: '',
    offsetX: 0,
    offsetY: 0
  },
  [VAT_V2_LAYOUT_KEY]: {
    invoiceNo: { x: 6.6, y: 1.55 },
    date: { x: 6.6, y: 1.75 },
    customerName: { x: 1.5, y: 1.5 },
    customerTaxId: { x: 1.5, y: 1.95 },
    customerAddress: { x: 1.5, y: 1.75 },
    itemsStart: { x: 0, y: 2.85 },
    itemNoX: 0.65,
    itemDescX: 1.6,
    itemQtyX: 4.25,
    itemPriceX: 5.73,
    itemAmountX: 7.05,
    subtotal: { x: 7.15, y: 7.65 },
    vat: { x: 7.15, y: 8.05 },
    total: { x: 7.15, y: 8.45 },
    amountText: { x: 0.85, y: 8.05 },
    totalQty: { x: 4.25, y: 7.65 },
    rowHeight: 0.162,
    maxRowsPerPage: 28,
    headerFontSize: 12,
    itemFontSize: 10,
    printerName: '',
    offsetX: 0,
    offsetY: 0
  }
}

export function getVatLayoutDefaults(layoutKey) {
  return VAT_LAYOUT_DEFAULTS[layoutKey] || VAT_LAYOUT_DEFAULTS[VAT_LAYOUT_KEY]
}
