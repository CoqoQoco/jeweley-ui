import { BreakdownPricePdfBuilder } from '@/services/helper/pdf/quotation/breakdown-price-pdf-builder.js'
import { getBreakdownSetting } from '@/services/helper/breakdown-setting-store.js'

/**
 * Generate Break Down Price PDF (A4 landscape) for quotation items.
 * @param {Object} options
 * @param {Array} options.items - Quotation items
 * @param {Object} options.customer - Customer info
 * @param {Date|String} options.invoiceDate - Invoice date
 * @param {String} options.filename - PDF filename
 * @param {Boolean} options.openInNewTab - Open in new tab (true) or download (false)
 * @param {Object} options.targetWindow - Target window for new tab
 * @returns {Promise}
 */
export async function generateBreakdownPricePdf({
  items,
  customer,
  invoiceDate,
  filename = 'breakdown-price.pdf',
  openInNewTab = false,
  targetWindow = null,
  profitPercent = 15,
  goldLossPercent
}) {
  const breakdownSetting = await getBreakdownSetting()
  const builder = new BreakdownPricePdfBuilder({
    items,
    customer,
    invoiceDate,
    invoiceNo: customer.invoiceNumber,
    currencyUnit: customer.currencyUnit,
    currencyMultiplier: customer.currencyMultiplier,
    profitPercent,
    goldLossPercent: goldLossPercent ?? breakdownSetting.goldLossPercent,
    laborAllSettingUsd: breakdownSetting.laborAllSettingUsd,
    laborWcpfrUsd: breakdownSetting.laborWcpfrUsd
  })
  const pdf = await builder.generatePDF()
  if (openInNewTab && targetWindow) {
    return new Promise((resolve) => {
      pdf.getBlob((blob) => {
        targetWindow.location.href = URL.createObjectURL(blob)
        setTimeout(() => resolve({ success: true, message: 'Break Down Price PDF opened in new tab' }), 1000)
      })
    })
  }
  pdf.download(filename)
  return { success: true, message: 'Break Down Price PDF downloaded' }
}
