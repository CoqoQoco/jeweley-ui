import { convertAmountToThaiText } from '@/services/utils/thai-baht-text.js'

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

function resolveLayout(layout) {
  const L = layout || {}
  return {
    xInvoiceNo: Number(L.invoiceNo?.x ?? 6.0) || 0,
    yInvoiceNo: Number(L.invoiceNo?.y ?? 1.8) || 0,
    xDate: Number(L.date?.x ?? 6.0) || 0,
    yDate: Number(L.date?.y ?? 2.2) || 0,
    xCustomerName: Number(L.customerName?.x ?? 1.2) || 0,
    yCustomerName: Number(L.customerName?.y ?? 1.75) || 0,
    xCustomerTaxId: Number(L.customerTaxId?.x ?? 1.2) || 0,
    yCustomerTaxId: Number(L.customerTaxId?.y ?? 1.95) || 0,
    xCustomerAddress: Number(L.customerAddress?.x ?? 1.2) || 0,
    yCustomerAddress: Number(L.customerAddress?.y ?? 2.15) || 0,
    xItemNo: Number(L.itemNoX ?? 0.6) || 0,
    xItemDesc: Number(L.itemDescX ?? 1.1) || 0,
    xItemQty: Number(L.itemQtyX ?? 4.15) || 0,
    xItemPrice: Number(L.itemPriceX ?? 5.15) || 0,
    xItemAmount: Number(L.itemAmountX ?? 6.48) || 0,
    yItemsStart: Number(L.itemsStart?.y ?? 3.1) || 0,
    rowHeight: Number(L.rowHeight ?? 0.17) || 0.17,
    maxRowsPerPage: Number(L.maxRowsPerPage ?? 25) || 25,
    headerFontSize: Number(L.headerFontSize ?? 12) || 12,
    itemFontSize: Number(L.itemFontSize ?? 10) || 10,
    xSubtotal: Number(L.subtotal?.x ?? 6.5) || 0,
    ySubtotal: Number(L.subtotal?.y ?? 7.6) || 0,
    xVat: Number(L.vat?.x ?? 6.5) || 0,
    yVat: Number(L.vat?.y ?? 7.98) || 0,
    xTotal: Number(L.total?.x ?? 6.5) || 0,
    yTotal: Number(L.total?.y ?? 8.3) || 0,
    xAmountText: Number(L.amountText?.x ?? 1.0) || 0,
    yAmountText: Number(L.amountText?.y ?? 8.3) || 0,
    offsetXInch: (Number(L.offsetX ?? 0) || 0) * MM_TO_INCH,
    offsetYInch: (Number(L.offsetY ?? 0) || 0) * MM_TO_INCH
  }
}

/**
 * Build a generic print model for the VAT invoice format.
 * @param {object} invoice - invoice data matching the shape used in index-view.vue
 * @param {object|null} layout - saved layout JSON from getVatLayout() (may already have offset applied)
 * @param {object} [options] - { printerName }
 * @returns {{ printerName: string|null, paper: object, pages: Array }}
 */
export function buildVatPrintModel(invoice, layout, options = {}) {
  const L = resolveLayout(layout)
  const ox = L.offsetXInch
  const oy = L.offsetYInch
  const hfs = L.headerFontSize
  const ifs = L.itemFontSize

  const currencyRate = Number(invoice.currencyRate) || 1

  let subtotal = 0
  for (const item of invoice.items || []) {
    const priceAfterDisc = Number(item.appraisalPrice) * (1 - Number(item.discountPercent) / 100)
    const convertedPrice = priceAfterDisc / currencyRate
    subtotal += convertedPrice * Number(item.qty)
  }

  const vatPercent = Number(invoice.vatPercent) !== 0 ? Number(invoice.vatPercent) : (Number(invoice.vat) || 0)
  const totalAfterDiscount = subtotal - Number(invoice.specialDiscount || 0) + Number(invoice.specialAddition || 0)
  const totalBeforeVat = totalAfterDiscount + Number(invoice.freightAndInsurance || 0)
  const vatAmount = totalBeforeVat * vatPercent / 100
  const totalAmount = totalBeforeVat + vatAmount

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

      right(n0(item.qty), L.xItemQty, y, ifs)
      right(n2(item.appraisalPrice), L.xItemPrice, y, ifs)

      const lineAmount = Number(item.appraisalPrice) * (1 - Number(item.discountPercent) / 100) / currencyRate * Number(item.qty)
      right(n2(lineAmount), L.xItemAmount, y, ifs)

      y += L.rowHeight
      itemNo++
    }

    if (currentPage === totalPages - 1) {
      right(n2(totalBeforeVat), L.xSubtotal, L.ySubtotal, hfs)
      right(n2(vatAmount), L.xVat, L.yVat, hfs)
      right(n2(totalAmount), L.xTotal, L.yTotal, hfs)
      const bahtText = convertAmountToThaiText(totalAmount)
      left(bahtText, L.xAmountText, L.yAmountText, hfs)
    }

    pages.push(primitives)
  }

  return {
    printerName: options.printerName ?? null,
    paper: { widthHundredthInch: 900, heightHundredthInch: 1100 },
    pages
  }
}
