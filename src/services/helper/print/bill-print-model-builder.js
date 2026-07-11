import { convertAmountToThaiText } from '@/services/utils/thai-baht-text.js'

const MM_TO_INCH = 1 / 25.4
const RIGHT_ALIGN_WIDTH = 0.9

function n0(val) {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function n2(val) {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function n3(val) {
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}

function formatDate(dateStr, useBuddhistYear) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  if (useBuddhistYear) {
    const beYear = d.getFullYear() + 543
    return `${dd}/${mm}/${beYear}`
  }
  return `${dd}/${mm}/${d.getFullYear()}`
}

function flag(L, key) {
  return L[key] !== undefined ? L[key] : true
}

function wrapText(text, maxChars) {
  if (!text) return []
  const words = String(text).split(/\s+/)
  const lines = []
  let current = ''
  for (const word of words) {
    if (word.length === 0) continue
    if (word.length > maxChars) {
      if (current.length > 0) { lines.push(current); current = '' }
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars))
      }
    } else if (current.length === 0) {
      current = word
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ' ' + word
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current.length > 0) lines.push(current)
  return lines
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
    xItemNo: Number(L.itemNoX ?? 0.25) || 0,
    xItemDesc: Number(L.itemDescX ?? 1.75) || 0,
    xItemQty: Number(L.itemQtyX ?? 3.75) || 0,
    xItemPrice: Number(L.itemPriceX ?? 6.75) || 0,
    xItemAmount: Number(L.itemAmountX ?? 8.0) || 0,
    yItemsStart: Number(L.itemsStart?.y ?? 3.1) || 0,
    rowHeight: Number(L.rowHeight ?? 0.17) || 0.17,
    maxRowsPerPage: Number(L.maxRowsPerPage ?? 25) || 25,
    headerFontSize: Number(L.headerFontSize ?? 12) || 12,
    customerFontSize: Number(L.customerFontSize ?? L.headerFontSize ?? 12) || 12,
    itemFontSize: Number(L.itemFontSize ?? 10) || 10,
    xSubtotal: Number(L.subtotal?.x ?? 6.5) || 0,
    ySubtotal: Number(L.subtotal?.y ?? 7.6) || 0,
    xVat: Number(L.vat?.x ?? 6.5) || 0,
    yVat: Number(L.vat?.y ?? 7.98) || 0,
    xTotal: Number(L.total?.x ?? 6.5) || 0,
    yTotal: Number(L.total?.y ?? 8.3) || 0,
    xAmountText: Number(L.amountText?.x ?? 1.0) || 0,
    yAmountText: Number(L.amountText?.y ?? 8.3) || 0,
    xStockNumber: Number(L.xStockNumber ?? 0.65) || 0,
    xProductNumber: Number(L.xProductNumber ?? 1.10) || 0,
    xPriceBeforeDiscount: Number(L.xPriceBeforeDiscount ?? 2.55) || 0,
    xPriceIncludingVat: Number(L.xPriceIncludingVat ?? 3.05) || 0,
    xGoldWeight: Number(L.xGoldWeight ?? 4.45) || 0,
    xStoneWeight: Number(L.xStoneWeight ?? 5.15) || 0,
    xDiamondWeight: Number(L.xDiamondWeight ?? 5.85) || 0,
    xDiamondGrade: Number(L.xDiamondGrade ?? 6.20) || 0,
    xPageNumber: Number(L.pageNumber?.x ?? 7.5) || 0,
    yPageNumber: Number(L.pageNumber?.y ?? 2.4) || 0,
    useBuddhistYear: L.useBuddhistYear !== undefined ? L.useBuddhistYear : true,
    xRemark: Number(L.xRemark ?? 2.0) || 0,
    yRemark: Number(L.yRemark ?? ((Number(L.amountText?.y ?? 8.3) || 8.3) - (Number(L.rowHeight ?? 0.17) || 0.17))) || 0,

    // Unit price mode: 'tag' | 'addVat' | 'subVat'
    unitPriceMode: L.unitPriceMode ?? 'tag',
    unitVatPercent: Number(L.unitVatPercent ?? 7) || 7,
    summaryVatPercent: Number(L.summaryVatPercent ?? 7) || 7,

    // Header flags
    showInvoiceNo: flag(L, 'showInvoiceNo'),
    showDate: flag(L, 'showDate'),
    showPageNumber: flag(L, 'showPageNumber'),
    showCustomerName: flag(L, 'showCustomerName'),
    showCustomerTaxId: flag(L, 'showCustomerTaxId'),
    showCustomerAddress: flag(L, 'showCustomerAddress'),

    // Table flags
    showItemNo: flag(L, 'showItemNo'),
    showDescription: flag(L, 'showDescription'),
    showStockNumber: flag(L, 'showStockNumber'),
    showProductNumber: flag(L, 'showProductNumber'),
    showPriceBeforeDiscount: flag(L, 'showPriceBeforeDiscount'),
    showPriceIncludingVat: flag(L, 'showPriceIncludingVat'),
    showGoldWeight: flag(L, 'showGoldWeight'),
    showStoneWeight: flag(L, 'showStoneWeight'),
    showDiamondWeight: flag(L, 'showDiamondWeight'),
    showDiamondGrade: flag(L, 'showDiamondGrade'),
    showDecimals: L.showDecimals,   // raw pass-through: undefined = not yet set on settings page
    showQty: flag(L, 'showQty'),
    showUnitPrice: flag(L, 'showUnitPrice'),
    showAmount: flag(L, 'showAmount'),
    showRemark: flag(L, 'showRemark'),

    // Footer flags
    showSubtotal: flag(L, 'showSubtotal'),
    showVat: flag(L, 'showVat'),
    showTotal: flag(L, 'showTotal'),
    showAmountText: flag(L, 'showAmountText'),

    offsetXInch: (Number(L.offsetX ?? 0) || 0) * MM_TO_INCH,
    offsetYInch: (Number(L.offsetY ?? 0) || 0) * MM_TO_INCH,

    customerAddressMaxChars: Number(L.customerAddressMaxChars ?? 70) || 70
  }
}

/**
 * Build a generic print model for the bill (K&P) format.
 * @param {object} invoice - invoice data matching the shape used in index-view.vue
 * @param {object|null} layout - saved layout JSON from getBillLayout() (may already have offset applied)
 * @param {object} [options] - { printerName }
 * @returns {{ printerName: string|null, paper: object, pages: Array }}
 */
export function buildBillPrintModel(invoice, layout, options = {}) {
  const L = resolveLayout(layout)
  const ox = L.offsetXInch
  const oy = L.offsetYInch
  const hfs = L.headerFontSize
  const cfs = L.customerFontSize
  const ifs = L.itemFontSize

  const currencyRate = Number(invoice.currencyRate) || 1
  const uv = L.unitVatPercent
  const sv = L.summaryVatPercent
  const showDecimals = L.showDecimals !== undefined ? L.showDecimals : (options?.showDecimals ?? true)
  const money = (val) => showDecimals ? n2(val) : n0(val)

  const items = invoice.items || []
  const totalPages = Math.max(1, Math.ceil(items.length / L.maxRowsPerPage))
  const invoiceDateFormatted = formatDate(invoice.invoiceDate, L.useBuddhistYear)

  const r = currencyRate

  // Compute per-item unitPrice based on mode, already converted to foreign currency
  function resolveUnitPrice(item) {
    const base = Number(item.appraisalPrice) * (1 - Number(item.discountPercent) / 100)
    let factor = 1
    if (L.unitPriceMode === 'addVat') factor = 1 + uv / 100
    else if (L.unitPriceMode === 'subVat') factor = 1 / (1 + uv / 100)
    return base * factor / r
  }

  // Summary totals
  let subtotalSum = 0
  for (const item of items) {
    const unitPrice = resolveUnitPrice(item)
    subtotalSum += unitPrice * Number(item.qty)
  }
  const vatAmount = L.showVat ? subtotalSum * sv / 100 : 0
  const grandTotal = subtotalSum + vatAmount

  const pages = []

  for (let currentPage = 0; currentPage < totalPages; currentPage++) {
    const pageLabel = `${currentPage + 1}/${totalPages}`
    const primitives = []

    const left = (text, x, y, fontSize) => {
      primitives.push({ text: String(text), x: Number(x) + ox, y: Number(y) + oy, fontSize: Number(fontSize) || ifs, align: 'left', width: 0 })
    }

    const right = (text, x, y, fontSize) => {
      primitives.push({ text: String(text), x: Number(x) + ox, y: Number(y) + oy, fontSize: Number(fontSize) || ifs, align: 'right', width: RIGHT_ALIGN_WIDTH })
    }

    // --- Header ---
    if (L.showInvoiceNo) left(invoice.invoiceNo || '', L.xInvoiceNo, L.yInvoiceNo, hfs)
    if (L.showDate) left(invoiceDateFormatted, L.xDate, L.yDate, hfs)
    if (L.showPageNumber) left(pageLabel, L.xPageNumber, L.yPageNumber, hfs)

    const customerName = invoice.customer?.name || ''
    const customerTaxId = invoice.customerTaxId || invoice.taxId || invoice.customer?.taxId || ''
    const customerAddress = invoice.customer?.address || ''
    if (L.showCustomerName) left(customerName, L.xCustomerName, L.yCustomerName, cfs)
    if (L.showCustomerTaxId) left(customerTaxId, L.xCustomerTaxId, L.yCustomerTaxId, cfs)
    if (L.showCustomerAddress) {
      const addressLines = wrapText(customerAddress, L.customerAddressMaxChars)
      addressLines.forEach((line, i) => {
        left(line, L.xCustomerAddress, L.yCustomerAddress + i * L.rowHeight, cfs)
      })
    }

    // --- Table rows ---
    const pageItems = items.slice(currentPage * L.maxRowsPerPage, (currentPage + 1) * L.maxRowsPerPage)
    let y = L.yItemsStart
    let itemNo = currentPage * L.maxRowsPerPage + 1

    for (const item of pageItems) {
      const tagAfterDisc = Number(item.appraisalPrice) * (1 - Number(item.discountPercent) / 100)
      const unitPrice = resolveUnitPrice(item)
      const lineAmount = unitPrice * Number(item.qty)

      if (L.showItemNo) left(String(itemNo), L.xItemNo, y, ifs)
      if (L.showDescription) left(item.productNameEN || '', L.xItemDesc, y, ifs)
      if (L.showStockNumber) left(item.stockNumber || '', L.xStockNumber, y, ifs)
      if (L.showProductNumber) left(item.productNumber || '', L.xProductNumber, y, ifs)

      // priceBeforeDiscount column = appraisalPrice (cost price, unchanged)
      if (L.showPriceBeforeDiscount) {
        right(money(item.appraisalPrice), L.xPriceBeforeDiscount, y, ifs)
      }

      // priceIncludingVat column = tagAfterDisc (stable tag price after discount)
      if (L.showPriceIncludingVat) {
        right(money(tagAfterDisc), L.xPriceIncludingVat, y, ifs)
      }

      const goldWeight = item.goldWeight != null ? Number(item.goldWeight) : 0
      if (L.showGoldWeight && goldWeight !== 0) {
        right(n2(goldWeight), L.xGoldWeight, y, ifs)
      }

      const stoneWeight = item.stoneWeight != null ? Number(item.stoneWeight) : 0
      if (L.showStoneWeight && stoneWeight !== 0) {
        right(n2(stoneWeight), L.xStoneWeight, y, ifs)
      }

      const diamondWeight = item.diamondWeight != null ? Number(item.diamondWeight) : 0
      if (L.showDiamondWeight && diamondWeight !== 0) {
        right(n3(diamondWeight), L.xDiamondWeight, y, ifs)
      }

      if (L.showDiamondGrade && item.diamondGrade) {
        left(String(item.diamondGrade), L.xDiamondGrade, y, ifs)   // grade is text -> left align
      }

      if (L.showQty) right(n0(item.qty), L.xItemQty, y, ifs)
      if (L.showUnitPrice) right(money(unitPrice), L.xItemPrice, y, ifs)
      if (L.showAmount) right(money(lineAmount), L.xItemAmount, y, ifs)

      y += L.rowHeight
      itemNo++
    }

    // --- Footer (last page only) ---
    if (currentPage === totalPages - 1) {
      if (L.showSubtotal) right(money(subtotalSum), L.xSubtotal, L.ySubtotal, hfs)
      right(money(vatAmount), L.xVat, L.yVat, hfs)
      if (L.showTotal) right(money(grandTotal), L.xTotal, L.yTotal, hfs)

      if (L.showRemark) {
        const remarkValues = items
          .map(item => item.earringStemSize)
          .filter(v => v && String(v).trim() !== '')
        const uniqueRemarks = [...new Set(remarkValues.map(v => String(v).trim()))]
        const remarkText = uniqueRemarks.join(', ')
        if (remarkText) {
          left(remarkText, L.xRemark, L.yRemark, ifs)
        }
      }

      if (L.showAmountText) {
        const bahtText = convertAmountToThaiText(grandTotal)
        left(bahtText, L.xAmountText, L.yAmountText, hfs)
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
