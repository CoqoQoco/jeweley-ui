// export-shipment-shared.js
// Shared header/company block + weight totals reused by all 4 ExportShipment PDF builders
// (Invoice / Summary / Packing List / Photo Sheet) so the 4 documents look consistent.

import { formatMoney, isForeignCurrency } from '@/services/utils/decimal.js'
import { formatDate } from '@/services/utils/dayjs.js'

export const EXPORT_SHIPMENT_COMPANY = {
  name: 'DUANG KAEW JEWELRY MANUFACTURER CO., LTD.',
  address: '200/16 RAMA 6 RD., PHAYATHAI, PHAYATHAI, BANGKOK 10400 THAILAND',
  telFax: 'TEL: (662)6196601-4 FAX: (662)2710834',
  email: 'E-Mail : info@dkjwl.com'
}

/**
 * pdfmake `header` callback content — repeats on every page.
 * @param {string} title - document title e.g. 'INVOICE', 'SUMMARY', 'PACKING LIST', 'PHOTO SHEET'
 * @param {number} currentPage
 */
export function buildDocHeader(title, currentPage) {
  return {
    margin: [40, 24, 40, 0],
    stack: [
      { text: EXPORT_SHIPMENT_COMPANY.name, bold: true, fontSize: 13, alignment: 'center' },
      { text: EXPORT_SHIPMENT_COMPANY.address, fontSize: 8, alignment: 'center' },
      { text: EXPORT_SHIPMENT_COMPANY.telFax, fontSize: 8, alignment: 'center' },
      { text: EXPORT_SHIPMENT_COMPANY.email, fontSize: 8, alignment: 'center' },
      { text: String(currentPage), fontSize: 8, alignment: 'right', margin: [0, 2, 0, 0] },
      { text: title, bold: true, fontSize: 13, alignment: 'center', margin: [0, 2, 0, 8] }
    ]
  }
}

/**
 * CONSIGNED TO / reference no. + date block — shown once at the top of page 1 content
 * (not part of the repeating page header) per the invoice sample layout.
 * @param {Object} header - export shipment header fields
 * @param {string} refLabel - label for the right-column reference no. e.g. 'INVOICE NO' | 'REF NO'
 */
export function buildConsigneeBlock(header, refLabel = 'INVOICE NO') {
  const h = header || {}
  return {
    margin: [0, 0, 0, 10],
    columns: [
      {
        width: '62%',
        stack: [
          { text: 'CONSIGNED TO : ' + (h.consigneeName || ''), bold: true, fontSize: 9 },
          { text: 'C/O ' + (h.eventName || ''), fontSize: 9 },
          { text: h.consigneeAddress || '', fontSize: 9 },
          { text: 'BOOTH NO. ' + (h.boothNo || ''), fontSize: 9 },
          {
            text: `Attn: ${h.attnName || ''}   Passport No. ${h.attnPassport || ''}   Tel: ${h.attnTel || ''}`,
            fontSize: 9
          }
        ]
      },
      {
        width: '38%',
        stack: [
          { text: `${refLabel}: ` + (h.customNumber || ''), fontSize: 9, bold: true },
          { text: 'DATE: ' + (h.documentDate ? formatDate(h.documentDate) : ''), fontSize: 9, bold: true }
        ]
      }
    ]
  }
}

/**
 * Sums weight/qty/amount fields across ExportShipment items.
 */
export function sumItems(items) {
  const list = Array.isArray(items) ? items : []
  return list.reduce(
    (acc, it) => {
      acc.netWeight += Number(it.netWeight) || 0
      acc.goldWeight += Number(it.goldWeight) || 0
      acc.stoneWeight += Number(it.stoneWeight) || 0
      acc.diamondWeight += Number(it.diamondWeight) || 0
      acc.qty += Number(it.qty) || 0
      acc.amount += Number(it.amount) || 0
      return acc
    },
    { netWeight: 0, goldWeight: 0, stoneWeight: 0, diamondWeight: 0, qty: 0, amount: 0 }
  )
}

export function fmtWeight(value, decimals = 2) {
  return (Number(value) || 0).toFixed(decimals)
}

/**
 * Foreign currencies (anything other than THB) are shown without decimals,
 * matching the existing convention in invoice-pdf-builder.js / decimal.js.
 */
export function fmtDocMoney(value, currency) {
  return formatMoney(value, { showDecimals: !isForeignCurrency(currency) })
}

export const TABLE_LAYOUT_THIN = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => '#cccccc',
  vLineColor: () => '#cccccc'
}
