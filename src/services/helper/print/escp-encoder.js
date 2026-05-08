import dayjs from 'dayjs'
import { convertAmountToThaiText } from '@/services/utils/thai-baht-text.js'
import {
  CHAR_WIDTH_UNITS,
  LINE_SPACING_216,
  COL_INVOICE_NO,
  COL_CUSTOMER_NAME,
  COL_CUSTOMER_TAX_ID,
  COL_CUSTOMER_ADDRESS,
  COL_PAGE_NUMBER,
  ROW_PAGE_NUMBER,
  ROW_CUSTOMER_NAME,
  ROW_CUSTOMER_TAX_ID,
  ROW_CUSTOMER_ADDRESS,
  ROW_ITEMS_START,
  MAX_ROWS_PER_PAGE,
  COL_ITEM_NO,
  COL_ITEM_DESC,
  COL_ITEM_QTY,
  COL_ITEM_PRICE,
  COL_ITEM_AMOUNT,
  ROW_TOTAL_QTY,
  ROW_VAT,
  ROW_GRAND_TOTAL,
  COL_TOTAL_QTY,
  COL_SUMMARY_AMOUNT,
  COL_AMOUNT_TEXT
} from './escp-vat-layout.js'

/**
 * แปลง string → Uint8Array ด้วย TIS-620 encoding
 * ASCII 0x00-0x7F → ตรงๆ
 * Thai Unicode U+0E00-U+0E7F → 0xA0-0xFF (TIS-620)
 * ตัวอักษรอื่นที่ map ไม่ได้ → '?' (0x3F)
 */
export function encodeTIS620(str) {
  if (!str) return new Uint8Array(0)
  const bytes = []
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code <= 0x7f) {
      bytes.push(code)
    } else if (code >= 0x0e00 && code <= 0x0e7f) {
      bytes.push(code - 0x0e00 + 0xa0)
    } else {
      bytes.push(0x3f)
    }
  }
  return new Uint8Array(bytes)
}

/**
 * ESC/P command builders — return Uint8Array
 */
export const ESCP = {
  init: () => new Uint8Array([0x1b, 0x40]),
  formFeed: () => new Uint8Array([0x0c]),
  crlf: () => new Uint8Array([0x0d, 0x0a]),
  setLineSpacing216: (n) => new Uint8Array([0x1b, 0x33, n]),
  setAbsoluteX: (units) => {
    const nL = units & 0xff
    const nH = (units >> 8) & 0xff
    return new Uint8Array([0x1b, 0x24, nL, nH])
  },
  selectThaiCharTable: () => new Uint8Array([0x1b, 0x74, 0x01]),
  text: (str) => encodeTIS620(str)
}

/**
 * concat หลาย Uint8Array เข้าด้วยกัน
 */
export function concatBytes(...arrays) {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(totalLen)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

function colToUnits(col) {
  return col * CHAR_WIDTH_UNITS
}

function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0.00'
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function padLeft(str, len) {
  str = String(str || '')
  while (str.length < len) str = ' ' + str
  return str.substring(str.length - len)
}

function buildPageOrdered(params) {
  const { pageIndex, totalPages, chunk, saleOrderData, isLastPage, calc } = params
  const parts = []

  parts.push(ESCP.init())
  parts.push(ESCP.selectThaiCharTable())
  parts.push(ESCP.setLineSpacing216(LINE_SPACING_216))

  const invoiceNo = saleOrderData.invoiceNo || ''
  const invoiceDate = saleOrderData.invoiceDate
    ? dayjs(saleOrderData.invoiceDate).format('DD/MM/YYYY')
    : ''
  const pageLabel = `${pageIndex + 1}/${totalPages}`
  const customerName = (saleOrderData.customer && saleOrderData.customer.name) || ''
  const customerTaxId =
    saleOrderData.customerTaxId ||
    saleOrderData.taxId ||
    (saleOrderData.customer && saleOrderData.customer.taxId) ||
    ''
  const customerAddress = (saleOrderData.customer && saleOrderData.customer.address) || ''

  let currentRow = 1

  // Row ROW_CUSTOMER_NAME (= ROW_INVOICE_NO): Customer Name + Invoice No
  const linesTo4 = ROW_CUSTOMER_NAME - currentRow
  for (let i = 0; i < linesTo4; i++) parts.push(ESCP.crlf())
  currentRow = ROW_CUSTOMER_NAME

  parts.push(ESCP.setAbsoluteX(colToUnits(COL_CUSTOMER_NAME)))
  parts.push(ESCP.text(customerName))
  parts.push(ESCP.setAbsoluteX(colToUnits(COL_INVOICE_NO)))
  parts.push(ESCP.text(invoiceNo))

  // Row ROW_CUSTOMER_TAX_ID: Tax ID
  const linesTo5 = ROW_CUSTOMER_TAX_ID - currentRow
  for (let i = 0; i < linesTo5; i++) parts.push(ESCP.crlf())
  currentRow = ROW_CUSTOMER_TAX_ID

  parts.push(ESCP.setAbsoluteX(colToUnits(COL_CUSTOMER_TAX_ID)))
  parts.push(ESCP.text(customerTaxId))

  // Row ROW_CUSTOMER_ADDRESS (= ROW_INVOICE_DATE): Address + Invoice Date
  const linesTo6 = ROW_CUSTOMER_ADDRESS - currentRow
  for (let i = 0; i < linesTo6; i++) parts.push(ESCP.crlf())
  currentRow = ROW_CUSTOMER_ADDRESS

  parts.push(ESCP.setAbsoluteX(colToUnits(COL_CUSTOMER_ADDRESS)))
  parts.push(ESCP.text(customerAddress))
  parts.push(ESCP.setAbsoluteX(colToUnits(COL_INVOICE_NO)))
  parts.push(ESCP.text(invoiceDate))

  // Row ROW_PAGE_NUMBER: Page X/Y
  const linesTo7 = ROW_PAGE_NUMBER - currentRow
  for (let i = 0; i < linesTo7; i++) parts.push(ESCP.crlf())
  currentRow = ROW_PAGE_NUMBER

  parts.push(ESCP.setAbsoluteX(colToUnits(COL_PAGE_NUMBER)))
  parts.push(ESCP.text(pageLabel))

  // Item rows
  const linesToItems = ROW_ITEMS_START - currentRow
  for (let i = 0; i < linesToItems; i++) parts.push(ESCP.crlf())
  currentRow = ROW_ITEMS_START

  const currencyRate = Number(saleOrderData.currencyRate) || 1

  chunk.forEach((item, rowIndex) => {
    if (rowIndex > 0) {
      parts.push(ESCP.crlf())
      currentRow++
    }

    const itemNo = pageIndex * MAX_ROWS_PER_PAGE + rowIndex + 1
    const appraisalPrice = Number(item.appraisalPrice) || 0
    const qty = Number(item.qty) || 0
    const discountPercent = Number(item.discountPercent) || 0
    const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)
    const unitPrice = priceAfterDiscount / currencyRate
    const amount = unitPrice * qty
    const description = item.description || item.productNumber || ''

    parts.push(ESCP.setAbsoluteX(colToUnits(COL_ITEM_NO)))
    parts.push(ESCP.text(String(itemNo)))
    parts.push(ESCP.setAbsoluteX(colToUnits(COL_ITEM_DESC)))
    parts.push(ESCP.text(description))
    parts.push(ESCP.setAbsoluteX(colToUnits(COL_ITEM_QTY)))
    parts.push(ESCP.text(padLeft(qty ? String(qty) : '', 8)))
    parts.push(ESCP.setAbsoluteX(colToUnits(COL_ITEM_PRICE)))
    parts.push(ESCP.text(padLeft(formatNumber(unitPrice), 10)))
    parts.push(ESCP.setAbsoluteX(colToUnits(COL_ITEM_AMOUNT)))
    parts.push(ESCP.text(padLeft(formatNumber(amount), 10)))
  })

  currentRow = ROW_ITEMS_START + Math.max(chunk.length - 1, 0)

  // Summary (last page only)
  if (isLastPage) {
    const linesToSummary = ROW_TOTAL_QTY - currentRow
    for (let i = 0; i < linesToSummary; i++) parts.push(ESCP.crlf())
    currentRow = ROW_TOTAL_QTY

    parts.push(ESCP.setAbsoluteX(colToUnits(COL_TOTAL_QTY)))
    parts.push(ESCP.text(padLeft(String(calc.totalQty), 8)))
    parts.push(ESCP.setAbsoluteX(colToUnits(COL_SUMMARY_AMOUNT)))
    parts.push(ESCP.text(padLeft(formatNumber(calc.totalBeforeVat), 10)))

    // Row ROW_VAT: VAT + amount text
    const linesTo36 = ROW_VAT - currentRow
    for (let i = 0; i < linesTo36; i++) parts.push(ESCP.crlf())
    currentRow = ROW_VAT

    parts.push(ESCP.setAbsoluteX(colToUnits(COL_AMOUNT_TEXT)))
    parts.push(ESCP.text(convertAmountToThaiText(calc.totalAmount)))
    parts.push(ESCP.setAbsoluteX(colToUnits(COL_SUMMARY_AMOUNT)))
    parts.push(ESCP.text(padLeft(formatNumber(calc.vatAmount), 10)))

    // Row ROW_GRAND_TOTAL: Grand total
    const linesTo37 = ROW_GRAND_TOTAL - currentRow
    for (let i = 0; i < linesTo37; i++) parts.push(ESCP.crlf())

    parts.push(ESCP.setAbsoluteX(colToUnits(COL_SUMMARY_AMOUNT)))
    parts.push(ESCP.text(padLeft(formatNumber(calc.totalAmount), 10)))
  }

  parts.push(ESCP.formFeed())

  return concatBytes(...parts)
}

function calculateTotals(saleOrderData) {
  const items = Array.isArray(saleOrderData.items) ? saleOrderData.items : []
  const currencyRate = Number(saleOrderData.currencyRate) || 1
  const specialDiscount = Number(saleOrderData.specialDiscount) || 0
  const specialAddition = Number(saleOrderData.specialAddition) || 0
  const freightAndInsurance = Number(saleOrderData.freightAndInsurance) || 0
  const vatPercent = Number(saleOrderData.vatPercent) || Number(saleOrderData.vat) || 0

  let subtotal = 0
  let totalQty = 0
  items.forEach((item) => {
    const price = Number(item.appraisalPrice) || 0
    const qty = Number(item.qty) || 0
    const discountPercent = Number(item.discountPercent) || 0
    const priceAfterDiscount = price * (1 - discountPercent / 100)
    const convertedPrice = priceAfterDiscount / currencyRate
    subtotal += convertedPrice * qty
    totalQty += qty
  })

  const totalAfterDiscountAndAddition = subtotal - specialDiscount + specialAddition
  const totalBeforeVat = totalAfterDiscountAndAddition + freightAndInsurance
  const vatAmount = (totalBeforeVat * vatPercent) / 100
  const totalAmount = totalBeforeVat + vatAmount

  return { subtotal, totalQty, totalBeforeVat, vatAmount, totalAmount }
}

/**
 * build VAT invoice ESC/P bytes — รับ saleOrderData → Uint8Array
 * saleOrderData shape เดียวกับ InvoiceContinuousPdfBuilder:
 * { invoiceNo, invoiceDate, items[], customer{name,address,taxId}, currencyRate,
 *   customerTaxId, specialDiscount, specialAddition, freightAndInsurance, vatPercent }
 */
export function buildVatEscP(saleOrderData) {
  const items = Array.isArray(saleOrderData.items) ? saleOrderData.items : []
  const totalPages = items.length === 0 ? 1 : Math.ceil(items.length / MAX_ROWS_PER_PAGE)
  const calc = calculateTotals(saleOrderData)

  const pages = []
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const start = pageIndex * MAX_ROWS_PER_PAGE
    const chunk = items.slice(start, start + MAX_ROWS_PER_PAGE)
    const isLastPage = pageIndex === totalPages - 1

    pages.push(buildPageOrdered({ pageIndex, totalPages, chunk, saleOrderData, isLastPage, calc }))
  }

  return concatBytes(...pages)
}
