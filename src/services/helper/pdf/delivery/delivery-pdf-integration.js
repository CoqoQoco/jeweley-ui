import { DeliveryPdfBuilder } from './delivery-pdf-builder.js'
import dayjs from 'dayjs'

export class DeliveryPdfIntegration {
  constructor() {
    this.pdfBuilder = null
  }

  /**
   * Generate delivery note PDF from invoice data
   * @param {Object} deliveryData - Delivery data containing items, customer, etc.
   * @param {Object} options - PDF generation options
   */
  async generateDeliveryPDF(deliveryData, options = {}) {
    try {
      const { saleOrder, items, customer, currency } = deliveryData

      // Validate required data
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('ไม่พบข้อมูลสินค้าสำหรับสร้าง Delivery Note')
      }

      if (!customer || !customer.name) {
        throw new Error('ไม่พบข้อมูลลูกค้าสำหรับสร้าง Delivery Note')
      }

      // Prepare data for PDF builder
      const deliveryDate = options.deliveryDate || dayjs()
      const deliveryNo = options.deliveryNo || this.generateDeliveryNumber()
      const currencyUnit = currency?.unit || 'THB'
      const currencyRate = currency?.rate || 1

      // Create PDF builder instance
      this.pdfBuilder = new DeliveryPdfBuilder(
        items,
        customer,
        deliveryDate,
        saleOrder,
        currencyUnit,
        currencyRate,
        deliveryNo,
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
        deliveryNo: deliveryNo,
        message: 'สร้าง Delivery Note PDF สำเร็จ'
      }
    } catch (error) {
      console.error('Error generating delivery note PDF:', error)
      throw new Error(`เกิดข้อผิดพลาดในการสร้าง Delivery Note PDF: ${error.message}`)
    }
  }

  /**
   * Generate delivery number
   */
  generateDeliveryNumber() {
    const now = dayjs()
    const dateStr = now.format('YYYYMMDD')
    const timeStr = now.format('HHmmss')
    return `DN${dateStr}${timeStr}`
  }

  /**
   * Validate delivery data structure
   * @param {Object} deliveryData
   */
  validateDeliveryData(deliveryData) {
    const errors = []

    if (!deliveryData) {
      errors.push('ไม่พบข้อมูล Delivery Note')
      return errors
    }

    if (!deliveryData.items || !Array.isArray(deliveryData.items) || deliveryData.items.length === 0) {
      errors.push('ไม่พบข้อมูลสินค้า')
    }

    if (!deliveryData.customer) {
      errors.push('ไม่พบข้อมูลลูกค้า')
    } else {
      if (!deliveryData.customer.name) {
        errors.push('ไม่พบชื่อลูกค้า')
      }
    }

    if (!deliveryData.saleOrder) {
      errors.push('ไม่พบข้อมูลใบสั่งขาย')
    } else {
      if (!deliveryData.saleOrder.soNumber) {
        errors.push('ไม่พบเลขที่ใบสั่งขาย')
      }
    }

    // Validate items structure
    if (deliveryData.items && Array.isArray(deliveryData.items)) {
      deliveryData.items.forEach((item, index) => {
        if (!item.qty && item.qty !== 0) {
          errors.push(`สินค้ารายการที่ ${index + 1}: ไม่พบจำนวน`)
        }
      })
    }

    return errors
  }

  /**
   * Preview delivery data before generating PDF
   * @param {Object} deliveryData
   */
  previewDeliveryData(deliveryData) {
    const errors = this.validateDeliveryData(deliveryData)

    if (errors.length > 0) {
      return {
        valid: false,
        errors: errors
      }
    }

    // Calculate preview totals
    const items = deliveryData.items || []

    const itemPreviews = items.map((item, index) => {
      const qty = Number(item.qty) || 0

      return {
        index: index + 1,
        stockNumber: item.stockNumber || '-',
        productNumber: item.productNumber || '-',
        description: item.description || '-',
        qty: qty
      }
    })

    return {
      valid: true,
      preview: {
        items: itemPreviews,
        itemCount: items.length
      }
    }
  }
}

// Export singleton instance
export const deliveryPdfService = new DeliveryPdfIntegration()
