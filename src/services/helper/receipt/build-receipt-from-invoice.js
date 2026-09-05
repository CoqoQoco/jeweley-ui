import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'

// สร้าง receiptData shape เดียวกับ computed.receiptData ใน pos-done-view.vue จากเลข invoice ที่ออกไปแล้ว
// ใช้พิมพ์ซ้ำ/ดูใบเสร็จย้อนหลังจากหน้ารายการบิล (ไม่ต้องขายใหม่)
// ลอก flow ดึง+ประกอบข้อมูลจาก invoice-detail-view.vue (loadInvoiceData) — ต้องคง flow เดียวกันเป๊ะ
// คืน null เมื่อดึงข้อมูลไม่ได้ (invoice/SO หาไม่เจอ) ให้ caller จัดการเอง — ห้าม throw ให้จอขาว
export async function buildReceiptFromInvoice(invoiceNumber) {
  const invoiceStore = useInvoiceApiStore()
  const saleOrderStore = usrSaleOrderApiStore()

  // 1. Get Invoice data
  const invoiceResponse = await invoiceStore.fetchGet({ formValue: { invoiceNumber } })
  if (!invoiceResponse) return null

  // 2. Get Sale Order data (สำหรับ items + stockConfirm) — payments มากับ Invoice/Get แล้ว ห้ามยิง Invoice/Payment/List เพิ่ม
  const soResponse = await saleOrderStore.fetchGet({ formValue: { soNumber: invoiceResponse.soNumber } })
  if (!soResponse) return null

  // 3. Parse SO data → items
  let parsedData = null
  if (soResponse.data && typeof soResponse.data === 'string') {
    try {
      parsedData = JSON.parse(soResponse.data)
    } catch (e) {
      parsedData = null
    }
  } else if (soResponse.data && typeof soResponse.data === 'object') {
    parsedData = soResponse.data
  }

  let stockItems = []
  if (parsedData) {
    if (parsedData.stockItems || parsedData.copyItems) {
      stockItems = parsedData.stockItems || []
    } else if (Array.isArray(parsedData.allItems)) {
      stockItems = parsedData.allItems.filter((item) => item.stockNumber != null)
    } else if (Array.isArray(parsedData)) {
      stockItems = parsedData.filter((item) => item.stockNumber != null)
    }
  }

  // 4. Filter: เฉพาะตัวที่อยู่ใน confirmedItems
  const confirmedItems = invoiceResponse.confirmedItems || []
  const stockConfirm = soResponse.stockConfirm || []

  // 5. Map จาก stockConfirm: appraisalPrice = confirmed.priceOrigin, qty = confirmed.qty, discountPercent = confirmed.discount
  // item ที่ match stockConfirm ไม่เจอ — fallback ไปราคาป้าย (item.price) และ qty 1 ชิ้น, ข้าม item ถ้ายังไม่มีราคาเลย
  const items = stockItems
    .filter((item) => confirmedItems.some((ci) => ci.stockNumber === item.stockNumber))
    .map((item) => {
      const confirmed = stockConfirm.find((c) => c.stockNumber === item.stockNumber)
      const appraisalPrice = confirmed ? confirmed.priceOrigin : item.price
      if (appraisalPrice === undefined || appraisalPrice === null) return null

      return {
        stockNumber: item.stockNumber,
        stockNumberOrigin: item.stockNumberOrigin,
        description: item.description,
        appraisalPrice,
        discountPercent: confirmed ? confirmed.discount : 0,
        qty: confirmed ? confirmed.qty : item.qty || 1
      }
    })
    .filter((item) => item !== null)

  const payments = (invoiceResponse.payments || []).map((p) => ({
    payment: p.payment,
    paymentName: p.paymentName,
    bankCode: p.bankCode,
    amount: p.amount
  }))

  return {
    invoiceNumber: invoiceResponse.invoiceNumber,
    soNumber: invoiceResponse.soNumber,
    // วันที่บิลจริง (พิมพ์ซ้ำบิลเก่า) — ไม่ใช่ new Date() แบบ POS
    date: invoiceResponse.createDate,
    customer: { name: invoiceResponse.customerName || '' },
    items,
    payments,
    currencyUnit: soResponse.currencyUnit || invoiceResponse.currencyUnit || 'THB',
    currencyRate: soResponse.currencyRate || invoiceResponse.currencyRate || 1,
    specialDiscount: invoiceResponse.specialDiscount,
    specialAddition: invoiceResponse.specialAddition,
    freightAndInsurance: invoiceResponse.freightAndInsurance,
    vatPercent: invoiceResponse.vat,
    // ยอดจริงถูกปัดขึ้นด้วย CeilMoney ที่ backend แล้ว — ห้ามคำนวณเองฝั่ง client
    grandTotal: invoiceResponse.grandTotalRounded ?? invoiceResponse.grandTotalRaw
    // paidAmount / remainingAmount ไม่ส่ง — ปล่อยให้ buildReceiptText() คำนวณเอง
  }
}
