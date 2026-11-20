import { convertAmountToThaiText } from '@/services/utils/thai-baht-text.js'
import { roundHalfUp } from '@/services/utils/money.js'
import { formatQtyText } from '@/services/helper/pdf/shared/pdf-format.js'
import { getVatLayoutDefaults, VAT_LAYOUT_KEY } from '@/services/helper/print/vat-layout-defaults.js'

const MM_TO_INCH = 1 / 25.4
const RIGHT_ALIGN_WIDTH = 0.9

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
 * @param {object} [options] - { printerName, showDecimals, layoutKey ('vat' | 'vat-v2') }
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

  const currencyRate = Number(invoice.currencyRate) || 1

  let subtotal = 0
  for (const item of invoice.items || []) {
    const priceAfterDisc = Number(item.appraisalPrice) * (1 - Number(item.discountPercent) / 100)
    const convertedPrice = priceAfterDisc / currencyRate
    subtotal += convertedPrice * Number(item.qty)
  }

  const rawVatPercent = Number(invoice.vatPercent) !== 0 ? Number(invoice.vatPercent) : (Number(invoice.vat) || 0)
  const vatPercent = Math.min(100, Math.max(0, rawVatPercent))
  const totalAfterDiscount = subtotal - Number(invoice.specialDiscount || 0) + Number(invoice.specialAddition || 0)
  const totalBeforeVat = totalAfterDiscount + Number(invoice.freightAndInsurance || 0)

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
    left(customerAddress, L.xCustomerAddress, L.yCustomerAddress, hfs)

    const pageItems = items.slice(currentPage * L.maxRowsPerPage, (currentPage + 1) * L.maxRowsPerPage)
    let y = L.yItemsStart
    let itemNo = currentPage * L.maxRowsPerPage + 1

    for (const item of pageItems) {
      left(String(itemNo), L.xItemNo, y, ifs)
      left(item.productNameEN || '', L.xItemDesc, y, ifs)

      right(formatQtyText(item.qty), L.xItemQty, y, ifs)
      right(money(item.appraisalPrice), L.xItemPrice, y, ifs)

      const lineAmount = Number(item.appraisalPrice) * (1 - Number(item.discountPercent) / 100) / currencyRate * Number(item.qty)
      right(money(lineAmount), L.xItemAmount, y, ifs)

      y += L.rowHeight
      itemNo++
    }

    if (currentPage === totalPages - 1) {
      // ยอดต้องบวกกันลงตัวบนกระดาษ: ปัด subtotal ก่อน แล้ว VAT คิดจากยอดที่ปัดแล้ว ปัดอีกครั้ง รวม = subtotal + VAT
      const scale = showDecimals ? 2 : 0
      const totalBeforeVatRounded = roundHalfUp(totalBeforeVat, scale)
      const vatAmountRounded = roundHalfUp(totalBeforeVatRounded * vatPercent / 100, scale)
      const totalAmountRounded = roundHalfUp(totalBeforeVatRounded + vatAmountRounded, scale)

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
