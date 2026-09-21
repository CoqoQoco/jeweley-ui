// สร้าง context/pdf-data สำหรับ "ใบกำกับสินค้า A4" — ใช้ร่วมกันระหว่างหน้า invoice-detail (web/mobile)
// และหน้า POS มือถือตอนขายสำเร็จ ห้ามก๊อปโค้ด logic นี้ซ้ำที่อื่น
import { isMaterialInvoice } from '@/constants/invoice-types.js'

// ย้ายมาจาก loadInvoiceData() ใน views/mobile/sale/invoice-detail-view.vue แบบตรงตัว
// P4-3: แก้ step 4-5 ให้ scope ด้วย invoice === invoiceNumber ก่อนเสมอ (เดิม match stockNumber ตรงๆ ปนข้าม invoice ได้)
export async function loadInvoiceContext(invoiceNumber, { invoiceStore, saleOrderStore }) {
  // 1. Get Invoice data
  const invoiceResponse = await invoiceStore.fetchGet({
    formValue: { invoiceNumber }
  })

  if (!invoiceResponse) return null

  // MATERIAL: ไม่มี SO product ผูกอยู่ (soNumber เป็น running ของ SM) — เรียก SaleOrder/Get ต่อจะพัง (axios error เปล่าๆ)
  // คืน shape ต่างจากปกติ (invoiceResponse แทน invoiceData) เพื่อบังคับให้ผู้เรียกเช็ค isMaterial ก่อนใช้เสมอ
  if (isMaterialInvoice(invoiceResponse)) {
    return { invoiceResponse, invoiceItems: [], isMaterial: true }
  }

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

  // 4. เฉพาะบรรทัดที่เป็นของ invoice นี้จริงๆ (invoice === invoiceNumber) ก่อนเสมอ — กันสองบรรทัดเลขสินค้าเดียวกัน
  // ที่ confirm ให้คนละใบแจ้งหนี้ปนกัน (ห้าม match ด้วย stockNumber ตรงๆ ข้าม invoice)
  const stockConfirmPool = (soResponse.stockConfirm || []).filter(
    (ci) => ci.invoice === invoiceResponse.invoiceNumber
  )

  // 5. จับคู่ SO JSON line กับ stockConfirmPool แบบ "ใช้แล้วตัดออก" (lineKey ก่อน แล้ว fallback stockNumber)
  // set id, appraisalPrice, qty, discountPercent, isConfirm, isInvoice — เก็บเฉพาะ line ที่จับคู่ได้จริง
  const invoiceItems = stockItems.filter((item) => {
    let matchIndex = stockConfirmPool.findIndex(
      (ci) => ci.lineKey && item.lineKey && ci.lineKey === item.lineKey
    )
    if (matchIndex === -1) {
      matchIndex = stockConfirmPool.findIndex(
        (ci) => !ci.lineKey && ci.stockNumber === item.stockNumber
      )
    }
    if (matchIndex === -1) return false

    const [confirmed] = stockConfirmPool.splice(matchIndex, 1)
    item.id = confirmed.id
    item.appraisalPrice = confirmed.priceOrigin
    item.qty = confirmed.qty
    item.discountPercent = confirmed.discount
    item.isConfirm = true
    item.isInvoice = true
    return true
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
      vatPercent: invoiceData.vatPercent || 0,
      salePerson: invoiceData.salePerson || null,
      saleSupport: invoiceData.saleSupport || null,
      // D6: มัดจำที่หักตอนออก invoice + เงินที่รับชำระเพิ่มเติมแล้ว — ให้ InvoicePdfBuilder หักออกจากยอดสุทธิ
      deposit: invoiceData.deposit || 0,
      amountPaid: Array.isArray(invoiceData.payments)
        ? invoiceData.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
        : 0
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
