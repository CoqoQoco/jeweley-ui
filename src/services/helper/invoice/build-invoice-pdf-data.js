// สร้าง context/pdf-data สำหรับ "ใบกำกับสินค้า A4" — ใช้ร่วมกันระหว่างหน้า invoice-detail (web/mobile)
// และหน้า POS มือถือตอนขายสำเร็จ ห้ามก๊อปโค้ด logic นี้ซ้ำที่อื่น

// ย้ายมาจาก loadInvoiceData() ใน views/mobile/sale/invoice-detail-view.vue แบบตรงตัว — ห้ามปรับ logic
export async function loadInvoiceContext(invoiceNumber, { invoiceStore, saleOrderStore }) {
  // 1. Get Invoice data
  const invoiceResponse = await invoiceStore.fetchGet({
    formValue: { invoiceNumber }
  })

  if (!invoiceResponse) return null

  // 2. Get Sale Order data (for items + stockConfirm)
  const soResponse = await saleOrderStore.fetchGet({
    formValue: { soNumber: invoiceResponse.soNumber }
  })

  if (!soResponse) return null

  // Set invoice data
  const invoiceData = {
    ...invoiceResponse,
    vatPercent: invoiceResponse.vat || 0,
    // Currency from SO
    currencyUnit: soResponse.currencyUnit || invoiceResponse.currencyUnit || 'THB',
    currencyRate: soResponse.currencyRate || invoiceResponse.currencyRate || 1
  }

  // 3. Parse SO data → items
  let parsedData = null
  if (soResponse.data && typeof soResponse.data === 'string') {
    try {
      parsedData = JSON.parse(soResponse.data)
    } catch (e) {
      // parse fail → parsedData remains null
    }
  } else if (soResponse.data && typeof soResponse.data === 'object') {
    parsedData = soResponse.data
  }

  // parse ไม่สำเร็จ: ไม่ throw/null ทั้งก้อน — invoiceData/soData ประกอบสำเร็จแล้ว
  // ให้คืนออกไปพร้อม invoiceItems ว่าง เพื่อให้หน้ายังแสดงหัวใบ (ชื่อลูกค้า/ยอดรวม/เลขที่บิล) ได้ตามพฤติกรรมเดิม
  if (!parsedData) return { invoiceData, soData: soResponse, invoiceItems: [] }

  let stockItems = []
  if (parsedData.stockItems || parsedData.copyItems) {
    stockItems = parsedData.stockItems || []
  } else if (Array.isArray(parsedData.allItems)) {
    stockItems = parsedData.allItems.filter((item) => item.stockNumber != null)
  } else if (Array.isArray(parsedData)) {
    stockItems = parsedData.filter((item) => item.stockNumber != null)
  }

  // 4. Filter: only items that are in confirmedItems
  const confirmedItems = invoiceResponse.confirmedItems || []
  const invoiceItems = stockItems.filter((item) => {
    return confirmedItems.some((ci) => ci.stockNumber === item.stockNumber)
  })

  // 5. Map stockConfirm → set id, appraisalPrice, qty, discountPercent, isConfirm, isInvoice
  const stockConfirm = soResponse.stockConfirm || []
  invoiceItems.forEach((item) => {
    const confirmed = stockConfirm.find((c) => c.stockNumber === item.stockNumber)
    if (confirmed) {
      item.id = confirmed.id
      item.appraisalPrice = confirmed.priceOrigin
      item.qty = confirmed.qty
      item.discountPercent = confirmed.discount
      item.isConfirm = true
      item.isInvoice = true
    }
  })

  return { invoiceData, soData: soResponse, invoiceItems }
}

// ย้ายมาจาก generatePDF() ใน views/mobile/sale/invoice-detail-view.vue แบบตรงตัว — ห้ามปรับ logic
export function toInvoicePdfData({ invoiceData, invoiceItems }) {
  return {
    saleOrder: {
      soNumber: invoiceData.soNumber,
      date: invoiceData.createDate,
      specialDiscount: invoiceData.specialDiscount || 0,
      specialAddition: invoiceData.specialAddition || 0,
      freightAndInsurance: invoiceData.freightAndInsurance || 0,
      vatPercent: invoiceData.vatPercent || 0
    },
    customer: {
      name: invoiceData.customerName,
      address: invoiceData.customerAddress,
      tel: invoiceData.customerTel,
      email: invoiceData.customerEmail,
      phone: invoiceData.customerTel
    },
    currency: {
      unit: invoiceData.currencyUnit || 'THB',
      rate: invoiceData.currencyRate || 1
    },
    items: invoiceItems
  }
}
