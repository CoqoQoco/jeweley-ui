import dayjs from 'dayjs'
import { InvoiceSummaryPdfBuilder } from './invoice-summary-builder.js'

export class InvoiceSummaryPdfIntegration {
  constructor() {
    this.pdfBuilder = null
  }

  /**
   * Generate invoice-summary PDF from sale order data.
   * Mirrors invoice-pdf-integration.js exactly — same validation, same constructor wiring,
   * same options.preview / options.download / options.open handling.
   *
   * @param {Object} invoiceData - { saleOrder, items, customer, currency }
   * @param {Object} options     - { invoiceDate, invoiceNo, showCifLabel, preview, download, open, itemsPerPage }
   */
  async generateInvoiceSummaryPDF(invoiceData, options = {}) {
    try {
      const { saleOrder, items, customer, currency } = invoiceData

      // Validate required data
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('ไม่พบข้อมูลสินค้าสำหรับสร้าง Invoice')
      }

      if (!customer || !customer.name) {
        throw new Error('ไม่พบข้อมูลลูกค้าสำหรับสร้าง Invoice')
      }

      const invoiceDate = options.invoiceDate || dayjs()
      const invoiceNo = options.invoiceNo || this.generateInvoiceNumber()
      const currencyUnit = currency?.unit || 'THB'
      const currencyRate = currency?.rate || 1

      this.pdfBuilder = new InvoiceSummaryPdfBuilder(
        items,
        customer,
        invoiceDate,
        { ...saleOrder, showCifLabel: options.showCifLabel !== undefined ? options.showCifLabel : true },
        currencyUnit,
        currencyRate,
        invoiceNo,
        options.itemsPerPage || 10
      )

      // Preview mode — return blob URL
      if (options.preview) {
        const previewUrl = await this.pdfBuilder.getPreviewUrl()
        return {
          success: true,
          invoiceNo: invoiceNo,
          previewUrl: previewUrl
        }
      }

      // Download
      if (options.download !== false) {
        await this.pdfBuilder.downloadPDF()
      }

      // Open in new tab
      if (options.open) {
        await this.pdfBuilder.openPDF()
      }

      return {
        success: true,
        invoiceNo: invoiceNo,
        message: 'สร้าง Invoice PDF สำเร็จ'
      }

    } catch (error) {
      console.error('Error generating invoice summary PDF:', error)
      throw new Error(`เกิดข้อผิดพลาดในการสร้าง Invoice PDF: ${error.message}`)
    }
  }

  generateInvoiceNumber() {
    const now = dayjs()
    const dateStr = now.format('YYYYMMDD')
    const timeStr = now.format('HHmmss')
    return `INV${dateStr}${timeStr}`
  }
}

// Singleton instance
export const invoiceSummaryPdfService = new InvoiceSummaryPdfIntegration()
