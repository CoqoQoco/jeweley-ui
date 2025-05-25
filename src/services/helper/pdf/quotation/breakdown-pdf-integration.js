// src/services/helper/pdf/quotation/breakdown-pdf-integration.js

import { BreakdownPdfBuilder } from '@/services/helper/pdf/quotation/breakdown-pdf-builder.js'

/**
 * Generate Breakdown PDF for quotation items.
 * @param {Object} options
 * @param {Array} options.items - Quotation items
 * @param {Object} options.customer - Customer info
 * @param {Date|String} options.invoiceDate - Invoice date
 * @param {String} options.filename - PDF filename
 * @param {Boolean} options.openInNewTab - Open in new tab (true) or download (false)
 * @param {Object} options.targetWindow - Target window for new tab
 * @returns {Promise}
 */
export function generateBreakdownPdf({
  items,
  customer,
  invoiceDate,
  filename = 'breakdown.pdf',
  openInNewTab = false,
  targetWindow = null
}) {
  return new Promise(async (resolve, reject) => {
    try {
      const builder = new BreakdownPdfBuilder({
        items,
        customer,
        invoiceDate,
        invoiceNo: customer.invoiceNumber,
        currencyUnit: customer.currencyUnit,
        currencyMultiplier: customer.currencyMultiplier
      })
      await builder.preparePDF()
      const pdf = await builder.generatePDF()
      if (openInNewTab && targetWindow) {
        pdf.getBlob((blob) => {
          const url = URL.createObjectURL(blob)
          targetWindow.location.href = url
          setTimeout(() => {
            resolve({ success: true, message: 'Breakdown PDF opened in new tab' })
          }, 1000)
        })
      } else {
        pdf.download(filename)
        resolve({ success: true, message: 'Breakdown PDF downloaded' })
      }
    } catch (err) {
      reject(err)
    }
  })
}
