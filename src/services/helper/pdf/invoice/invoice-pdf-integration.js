import { InvoicePdfBuilder } from './invoice-pdf-builder.js'
import dayjs from 'dayjs'

export class InvoicePdfIntegration {
  constructor() {
    this.pdfBuilder = null
  }

  /**
   * Generate invoice PDF from sale order data
   * @param {Object} invoiceData - Invoice data containing items, customer, etc.
   * @param {Object} options - PDF generation options
   */
  async generateInvoicePDF(invoiceData, options = {}) {
    try {
      const {
        saleOrder,
        items,
        customer,
        currency
      } = invoiceData

      // Validate required data
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('ไม่พบข้อมูลสินค้าสำหรับสร้าง Invoice')
      }

      if (!customer || !customer.name) {
        throw new Error('ไม่พบข้อมูลลูกค้าสำหรับสร้าง Invoice')
      }

      // Prepare data for PDF builder
      const invoiceDate = options.invoiceDate || dayjs().format('DD/MM/YYYY')
      const invoiceNo = options.invoiceNo || this.generateInvoiceNumber()
      const currencyUnit = currency?.unit || 'THB'
      const currencyRate = currency?.rate || 1

      // Create PDF builder instance
      this.pdfBuilder = new InvoicePdfBuilder(
        items,
        customer,
        invoiceDate,
        saleOrder,
        currencyUnit,
        currencyRate,
        invoiceNo,
        10 // itemsPerPage
      )

      // Generate and download PDF
      if (options.download !== false) {
        await this.pdfBuilder.downloadPDF()
      }

      // Open PDF in new tab if requested
      if (options.open) {
        await this.pdfBuilder.openPDF()
      }

      return {
        success: true,
        invoiceNo: invoiceNo,
        message: 'สร้าง Invoice PDF สำเร็จ'
      }

    } catch (error) {
      console.error('Error generating invoice PDF:', error)
      throw new Error(`เกิดข้อผิดพลาดในการสร้าง Invoice PDF: ${error.message}`)
    }
  }

  /**
   * Generate invoice number
   */
  generateInvoiceNumber() {
    const now = dayjs()
    const dateStr = now.format('YYYYMMDD')
    const timeStr = now.format('HHmmss')
    return `INV${dateStr}${timeStr}`
  }

  /**
   * Validate invoice data structure
   * @param {Object} invoiceData 
   */
  validateInvoiceData(invoiceData) {
    const errors = []

    if (!invoiceData) {
      errors.push('ไม่พบข้อมูล Invoice')
      return errors
    }

    if (!invoiceData.items || !Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
      errors.push('ไม่พบข้อมูลสินค้า')
    }

    if (!invoiceData.customer) {
      errors.push('ไม่พบข้อมูลลูกค้า')
    } else {
      if (!invoiceData.customer.name) {
        errors.push('ไม่พบชื่อลูกค้า')
      }
    }

    if (!invoiceData.saleOrder) {
      errors.push('ไม่พบข้อมูลใบสั่งขาย')
    } else {
      if (!invoiceData.saleOrder.soNumber) {
        errors.push('ไม่พบเลขที่ใบสั่งขาย')
      }
    }

    // Validate items structure
    if (invoiceData.items && Array.isArray(invoiceData.items)) {
      invoiceData.items.forEach((item, index) => {
        if (!item.appraisalPrice && item.appraisalPrice !== 0) {
          errors.push(`สินค้ารายการที่ ${index + 1}: ไม่พบราคาประเมิน`)
        }
        if (!item.qty && item.qty !== 0) {
          errors.push(`สินค้ารายการที่ ${index + 1}: ไม่พบจำนวน`)
        }
      })
    }

    return errors
  }

  /**
   * Preview invoice data before generating PDF
   * @param {Object} invoiceData 
   */
  previewInvoiceData(invoiceData) {
    const errors = this.validateInvoiceData(invoiceData)
    
    if (errors.length > 0) {
      return {
        valid: false,
        errors: errors
      }
    }

    // Calculate preview totals
    const items = invoiceData.items || []
    const currencyRate = invoiceData.currency?.rate || 1
    
    let subtotal = 0
    const itemPreviews = items.map((item, index) => {
      const appraisalPrice = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      const convertedPrice = appraisalPrice / currencyRate
      const amount = convertedPrice * qty
      
      subtotal += amount

      return {
        index: index + 1,
        stockNumber: item.stockNumber || '-',
        productNumber: item.productNumber || '-',
        description: item.description || '-',
        qty: qty,
        price: convertedPrice,
        amount: amount
      }
    })

    return {
      valid: true,
      preview: {
        items: itemPreviews,
        subtotal: subtotal,
        total: subtotal,
        currency: invoiceData.currency?.unit || 'THB',
        itemCount: items.length
      }
    }
  }
}

// Export singleton instance
export const invoicePdfService = new InvoicePdfIntegration()