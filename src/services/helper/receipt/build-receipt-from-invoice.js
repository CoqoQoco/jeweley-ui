import { useInvoiceApiStore } from '@/stores/modules/api/sale/invoice-store.js'
import { usrSaleOrderApiStore } from '@/stores/modules/api/sale/sale-order-store.js'
import { loadCompanyInfo } from '@/config/company-info.js'
import { fetchReceiptMaterials } from '@/services/helper/receipt/fetch-receipt-materials.js'

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

  // 4. เฉพาะบรรทัดที่เป็นของ invoice นี้จริงๆ (invoice === invoiceNumber) ก่อนเสมอ — กันสองบรรทัดเลขสินค้าเดียวกัน
  // ที่ confirm ให้คนละใบแจ้งหนี้ปนกัน (ห้าม match ด้วย stockNumber ตรงๆ ข้าม invoice)
  const stockConfirmPool = (soResponse.stockConfirm || []).filter(
    (ci) => ci.invoice === invoiceResponse.invoiceNumber
  )

  // 5. จับคู่ SO JSON line กับ stockConfirmPool แบบ "ใช้แล้วตัดออก" (lineKey ก่อน แล้ว fallback stockNumber)
  // appraisalPrice = confirmed.priceOrigin, qty = confirmed.qty, discountPercent = confirmed.discount
  // item ที่จับคู่ไม่เจอ (ไม่ได้เป็นของ invoice นี้) — ข้ามไป
  const items = []
  stockItems.forEach((item) => {
    let matchIndex = stockConfirmPool.findIndex(
      (ci) => ci.lineKey && item.lineKey && ci.lineKey === item.lineKey
    )
    if (matchIndex === -1) {
      matchIndex = stockConfirmPool.findIndex(
        (ci) => !ci.lineKey && ci.stockNumber === item.stockNumber
      )
    }
    if (matchIndex === -1) return

    const [confirmed] = stockConfirmPool.splice(matchIndex, 1)
    const appraisalPrice = confirmed.priceOrigin ?? item.price
    if (appraisalPrice === undefined || appraisalPrice === null) return

    items.push({
      stockNumber: item.stockNumber,
      stockNumberOrigin: item.stockNumberOrigin,
      description: item.description,
      appraisalPrice,
      discountPercent: confirmed.discount || 0,
      qty: confirmed.qty || item.qty || 1
    })
  })

  const itemsWithMaterials = await fetchReceiptMaterials(items)

  const payments = (invoiceResponse.payments || []).map((p) => ({
    payment: p.payment,
    paymentName: p.paymentName,
    bankCode: p.bankCode,
    amount: p.amount
  }))

  // ให้พิมพ์ซ้ำบิลเก่าได้ footer ช่องทางติดต่อเหมือนบิลใหม่
  const companyInfo = await loadCompanyInfo()

  return {
    invoiceNumber: invoiceResponse.invoiceNumber,
    soNumber: invoiceResponse.soNumber,
    // วันที่บิลจริง (พิมพ์ซ้ำบิลเก่า) — ไม่ใช่ new Date() แบบ POS
    date: invoiceResponse.createDate,
    customer: { name: invoiceResponse.customerName || '' },
    seller: invoiceResponse.createBy || '',
    items: itemsWithMaterials,
    payments,
    currencyUnit: soResponse.currencyUnit || invoiceResponse.currencyUnit || 'THB',
    currencyRate: soResponse.currencyRate || invoiceResponse.currencyRate || 1,
    specialDiscount: invoiceResponse.specialDiscount,
    specialAddition: invoiceResponse.specialAddition,
    freightAndInsurance: invoiceResponse.freightAndInsurance,
    vatPercent: invoiceResponse.vat,
    // ยอดจริงถูกปัดขึ้นด้วย CeilMoney ที่ backend แล้ว — ห้ามคำนวณเองฝั่ง client
    grandTotal: invoiceResponse.grandTotalRounded ?? invoiceResponse.grandTotalRaw,
    // D6: มัดจำที่หักจากใบสั่งขาย (SO deposit) มากับ Invoice/Get ตรงๆ — ต้องส่งต่อให้ builder หักออกจากยอดคงเหลือ
    // ไม่งั้นพิมพ์ซ้ำบิลที่มีมัดจำจะโชว์ยอดคงเหลือเกินจริง (ไม่รวมมัดจำ)
    deposit: invoiceResponse.deposit,
    // paidAmount / remainingAmount ไม่ส่ง — ปล่อยให้ buildReceiptText() คำนวณเอง
    company: { website: companyInfo.info?.website, social: companyInfo.social }
  }
}
