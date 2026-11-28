import { convertAmountToThaiText } from '@/services/utils/thai-baht-text.js'
import { roundHalfUp, computeInvoiceTotals, vatIncludedUnitEx, vatIncludedRowEx, VAT_INCLUDED_PERCENT } from '@/services/utils/money.js'
import { formatQtyText } from '@/services/helper/pdf/shared/pdf-format.js'
import { wrapAddressLines } from '@/services/helper/print/print-text.js'
import { getVatLayoutDefaults, VAT_LAYOUT_KEY } from '@/services/helper/print/vat-layout-defaults.js'

const MM_TO_INCH = 1 / 25.4
const RIGHT_ALIGN_WIDTH = 0.9
// ที่อยู่ลูกค้าห่อที่ 70 ตัวอักษร/บรรทัด จำนวนบรรทัดสูงสุดคิดจากช่องว่างถึงช่องถัดไปที่อยู่ต่ำกว่า (เลขผู้เสียภาษี/ชื่อ/เริ่มรายการ) ตาม layout (clamp 1-3)
// ถ้าได้ 1 บรรทัด (เช่น vat-v2 ที่เลขผู้เสียภาษีอยู่ใต้ที่อยู่) พิมพ์ทั้งที่อยู่บรรทัดเดียว ไม่ตัดข้อความ (TK202611280003)
const ADDRESS_LINES_CAP = 3
// ประมาณ 12 ตัวอักษร/นิ้ว ที่ฟอนต์ 12pt (TH Sarabun) — ค่าประมาณ ต้องยืนยันบนกระดาษจริง
const CHARS_PER_INCH_AT_12PT = 12
const ADDRESS_RIGHT_GAP_INCH = 0.1
const PAGE_RIGHT_EDGE_INCH = 8.5
const MIN_ADDRESS_FONT_SIZE = 8

function addressMaxChars(L, lines) {
  const top = L.yCustomerAddress - L.rowHeight
  const bottom = L.yCustomerAddress + lines * L.rowHeight
  const xs = [[L.xDate, L.yDate], [L.xInvoiceNo, L.yInvoiceNo]]
    .filter(([x, y]) => x > L.xCustomerAddress && y >= top && y <= bottom)
    .map(([x]) => x)
  const room = (xs.length ? Math.min(...xs) - ADDRESS_RIGHT_GAP_INCH : PAGE_RIGHT_EDGE_INCH) - L.xCustomerAddress
  return Math.max(1, Math.floor(room * CHARS_PER_INCH_AT_12PT * 12 / L.headerFontSize))
}

function addressLineLimit(L) {
  const next = [L.yCustomerTaxId, L.yCustomerName, L.yItemsStart].filter(y => y > L.yCustomerAddress)
  if (next.length === 0) return ADDRESS_LINES_CAP
  const gap = Math.min(...next) - L.yCustomerAddress
  return Math.min(ADDRESS_LINES_CAP, Math.max(1, Math.floor(gap / L.rowHeight + 1e-6)))
}

function n0(val) {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function n2(val) {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

function resolveLayout(layout, layoutKey) {
  const L = layout || {}
  const D = getVatLayoutDefaults(layoutKey)
  const pos = (name, axis) => Number(L[name]?.[axis] ?? D[name][axis]) || 0
  const flat = (name) => Number(L[name] ?? D[name]) || 0
  const hasTotalQty = !!D.totalQty
  return {
    xInvoiceNo: pos('invoiceNo', 'x'),
    yInvoiceNo: pos('invoiceNo', 'y'),
    xDate: pos('date', 'x'),
    yDate: pos('date', 'y'),
    xCustomerName: pos('customerName', 'x'),
    yCustomerName: pos('customerName', 'y'),
    xCustomerTaxId: pos('customerTaxId', 'x'),
    yCustomerTaxId: pos('customerTaxId', 'y'),
    xCustomerAddress: pos('customerAddress', 'x'),
    yCustomerAddress: pos('customerAddress', 'y'),
    xItemNo: flat('itemNoX'),
    xItemDesc: flat('itemDescX'),
    xItemQty: flat('itemQtyX'),
    xItemPrice: flat('itemPriceX'),
    xItemAmount: flat('itemAmountX'),
    yItemsStart: pos('itemsStart', 'y'),
    rowHeight: Number(L.rowHeight ?? D.rowHeight) || D.rowHeight,
    maxRowsPerPage: Number(L.maxRowsPerPage ?? D.maxRowsPerPage) || D.maxRowsPerPage,
    headerFontSize: Number(L.headerFontSize ?? D.headerFontSize) || D.headerFontSize,
    itemFontSize: Number(L.itemFontSize ?? D.itemFontSize) || D.itemFontSize,
    xSubtotal: pos('subtotal', 'x'),
    ySubtotal: pos('subtotal', 'y'),
    xVat: pos('vat', 'x'),
    yVat: pos('vat', 'y'),
    xTotal: pos('total', 'x'),
    yTotal: pos('total', 'y'),
    xAmountText: pos('amountText', 'x'),
    yAmountText: pos('amountText', 'y'),
    hasTotalQty,
    xTotalQty: hasTotalQty ? pos('totalQty', 'x') : 0,
    yTotalQty: hasTotalQty ? pos('totalQty', 'y') : 0,
    offsetXInch: (Number(L.offsetX ?? 0) || 0) * MM_TO_INCH,
    offsetYInch: (Number(L.offsetY ?? 0) || 0) * MM_TO_INCH
  }
}

/**
 * Build a generic print model for the VAT invoice format.
 * @param {object} invoice - invoice data matching the shape used in index-view.vue
 * @param {object|null} layout - saved layout JSON from getVatLayout() (may already have offset applied)
 * @param {object} [options] - { printerName, showDecimals, layoutKey ('vat' | 'vat-v2'), vatMode ('include' | 'exclude', default 'exclude') }
 * @returns {{ printerName: string|null, paper: object, pages: Array }}
 */
export function buildVatPrintModel(invoice, layout, options = {}) {
  const L = resolveLayout(layout, options?.layoutKey || VAT_LAYOUT_KEY)
  const ox = L.offsetXInch
  const oy = L.offsetYInch
  const hfs = L.headerFontSize
  const ifs = L.itemFontSize
  const showDecimals = options?.showDecimals ?? true
  const money = (val) => showDecimals ? n2(val) : n0(val)

  const addressLines = addressLineLimit(L)
  const currencyRate = Number(invoice.currencyRate) || 1

  const rawVatPercent = Number(invoice.vatPercent) !== 0 ? Number(invoice.vatPercent) : (Number(invoice.vat) || 0)
  const vatPercent = Math.min(100, Math.max(0, rawVatPercent))
  const isInclude = options?.vatMode === 'include' && vatPercent > 0
  const divisor = isInclude ? 1 + vatPercent / 100 : 1

  // ใบ vatIncluded โหมด include ที่ VAT 7%: ตัวเลขทุกช่องต้องตรงกับ invoice (ถอด VAT ทีละแถว ปัดครึ่งขึ้น 2 ตำแหน่ง รวม special)
  const useInvoiceFigures = !!invoice.vatIncluded && isInclude && vatPercent === VAT_INCLUDED_PERCENT
  const invoiceTotals = useInvoiceFigures
    ? computeInvoiceTotals(invoice.items || [], {
      vatIncluded: true,
      specialDiscount: invoice.specialDiscount,
      specialAddition: invoice.specialAddition,
      freight: invoice.freightAndInsurance
    })
    : null

  const unitNet = (item) => useInvoiceFigures
    ? vatIncludedUnitEx(item)
    : Number(item.appraisalPrice) * (1 - Number(item.discountPercent) / 100) / currencyRate / divisor

  let subtotal = 0
  for (const item of invoice.items || []) {
    subtotal += unitNet(item) * Number(item.qty)
  }

  const adjustments = -Number(invoice.specialDiscount || 0) + Number(invoice.specialAddition || 0) + Number(invoice.freightAndInsurance || 0)
  const totalBeforeVat = isInclude
    ? subtotal + adjustments / divisor
    : subtotal - Number(invoice.specialDiscount || 0) + Number(invoice.specialAddition || 0) + Number(invoice.freightAndInsurance || 0)

  const items = invoice.items || []
  const totalPages = Math.max(1, Math.ceil(items.length / L.maxRowsPerPage))
  const invoiceDateFormatted = formatDate(invoice.invoiceDate)

  const pages = []

  for (let currentPage = 0; currentPage < totalPages; currentPage++) {
    const primitives = []

    const left = (text, x, y, fontSize) => {
      primitives.push({ text: String(text), x: Number(x) + ox, y: Number(y) + oy, fontSize: Number(fontSize) || ifs, align: 'left', width: 0 })
    }

    const right = (text, x, y, fontSize) => {
      primitives.push({ text: String(text), x: Number(x) + ox, y: Number(y) + oy, fontSize: Number(fontSize) || ifs, align: 'right', width: RIGHT_ALIGN_WIDTH })
    }

    left(invoice.invoiceNo || '', L.xInvoiceNo, L.yInvoiceNo, hfs)
    left(invoiceDateFormatted, L.xDate, L.yDate, hfs)

    const customerName = invoice.customer?.name || ''
    const customerTaxId = invoice.customerTaxId || invoice.taxId || invoice.customer?.taxId || ''
    const customerAddress = invoice.customer?.address || ''
    left(customerName, L.xCustomerName, L.yCustomerName, hfs)
    left(customerTaxId, L.xCustomerTaxId, L.yCustomerTaxId, hfs)
    if (addressLines === 1) {
      const oneLine = String(customerAddress).split(/\r?\n/).map(t => t.trim()).filter(Boolean).join(' ')
      const maxChars = addressMaxChars(L, 1)
      const fit = oneLine.length > maxChars ? Math.max(MIN_ADDRESS_FONT_SIZE, hfs * maxChars / oneLine.length) : hfs
      if (oneLine) left(oneLine, L.xCustomerAddress, L.yCustomerAddress, fit)
    } else {
      wrapAddressLines(customerAddress, addressMaxChars(L, addressLines), addressLines).forEach((line, i) => {
        left(line, L.xCustomerAddress, L.yCustomerAddress + i * L.rowHeight, hfs)
      })
    }

    const pageItems = items.slice(currentPage * L.maxRowsPerPage, (currentPage + 1) * L.maxRowsPerPage)
    let y = L.yItemsStart
    let itemNo = currentPage * L.maxRowsPerPage + 1

    for (const item of pageItems) {
      left(String(itemNo), L.xItemNo, y, ifs)
      left(item.productNameEN || '', L.xItemDesc, y, ifs)

      right(formatQtyText(item.qty), L.xItemQty, y, ifs)
      right(money(isInclude ? unitNet(item) : item.appraisalPrice), L.xItemPrice, y, ifs)

      const lineAmount = useInvoiceFigures
        ? vatIncludedRowEx(item)
        : isInclude
        ? unitNet(item) * Number(item.qty)
        : Number(item.appraisalPrice) * (1 - Number(item.discountPercent) / 100) / currencyRate * Number(item.qty)
      right(money(lineAmount), L.xItemAmount, y, ifs)

      y += L.rowHeight
      itemNo++
    }

    if (currentPage === totalPages - 1) {
      // ใบ vatIncluded (โหมด include 7%) ใช้ตัวเลขชุดเดียวกับ invoice ทุกช่อง (ปัดครึ่งขึ้นทีละแถว)
      // ใบอื่น: กติกาปัดทศนิยมของใบกำกับภาษี = ร้านเป็นผู้ตัดสินใจเลือก (TK202611250002) ไม่ใช่ dev — ปัดจากยอดเต็มครั้งเดียว ห้ามแก้จนกว่าร้านสั่ง
      // ยอดต้องบวกกันลงตัวบนกระดาษ: ปัด subtotal ก่อน แล้ว VAT คิดจากยอดที่ปัดแล้ว ปัดอีกครั้ง รวม = subtotal + VAT
      const scale = showDecimals ? 2 : 0
      const totalBeforeVatRounded = invoiceTotals ? invoiceTotals.afterSpecial : roundHalfUp(totalBeforeVat, scale)
      const vatAmountRounded = invoiceTotals ? invoiceTotals.vatAmount : roundHalfUp(totalBeforeVatRounded * vatPercent / 100, scale)
      const totalAmountRounded = invoiceTotals ? invoiceTotals.grandTotalRounded : roundHalfUp(totalBeforeVatRounded + vatAmountRounded, scale)

      right(money(totalBeforeVatRounded), L.xSubtotal, L.ySubtotal, hfs)
      right(money(vatAmountRounded), L.xVat, L.yVat, hfs)
      right(money(totalAmountRounded), L.xTotal, L.yTotal, hfs)
      const bahtText = convertAmountToThaiText(totalAmountRounded)
      left(bahtText, L.xAmountText, L.yAmountText, hfs)
      if (L.hasTotalQty) {
        const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
        right(formatQtyText(totalQty), L.xTotalQty, L.yTotalQty, hfs)
      }
    }

    pages.push(primitives)
  }

  return {
    printerName: options.printerName ?? null,
    paper: { widthHundredthInch: 900, heightHundredthInch: 1100 },
    pages
  }
}
