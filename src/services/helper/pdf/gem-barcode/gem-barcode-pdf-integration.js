import { GemBarcodePdfBuilder } from './gem-barcode-pdf-builder.js'

export class GemBarcodePdfIntegration {
  constructor() {
    this.pdfBuilder = null
  }

  /**
   * Generate gem barcode PDF
   * @param {Object} barcodeData - Barcode data containing stockCode, barcode, description, date, goldType
   * @param {Object} options - PDF generation options
   */
  async generateGemBarcodePDF(barcodeData, options = {}) {
    try {
      // Validate required data
      if (!barcodeData || !barcodeData.barcode) {
        throw new Error('ไม่พบข้อมูล barcode สำหรับสร้าง PDF')
      }

      // Create PDF builder instance
      this.pdfBuilder = new GemBarcodePdfBuilder(barcodeData)

      // Handle different actions based on options
      if (options.print) {
        // Print directly
        await this.pdfBuilder.printPDF()
      } else if (options.open) {
        // Open in new tab
        await this.pdfBuilder.openPDF()
      } else {
        // Default: download PDF
        await this.pdfBuilder.downloadPDF()
      }

      return {
        success: true,
        message: 'สร้าง PDF Barcode สำเร็จ'
      }
    } catch (error) {
      console.error('Error generating gem barcode PDF:', error)
      throw new Error(`เกิดข้อผิดพลาดในการสร้าง PDF: ${error.message}`)
    }
  }

  /**
   * Validate barcode data structure
   * @param {Object} barcodeData
   */
  validateBarcodeData(barcodeData) {
    const errors = []

    if (!barcodeData) {
      errors.push('ไม่พบข้อมูล barcode')
      return errors
    }

    if (!barcodeData.barcode) {
      errors.push('ไม่พบรหัส barcode')
    }

    if (!barcodeData.stockCode) {
      errors.push('ไม่พบรหัสสินค้า')
    }

    return errors
  }

  /**
   * Preview barcode data before generating PDF
   * @param {Object} barcodeData
   */
  previewBarcodeData(barcodeData) {
    const errors = this.validateBarcodeData(barcodeData)

    if (errors.length > 0) {
      return {
        valid: false,
        errors: errors
      }
    }

    return {
      valid: true,
      preview: {
        stockCode: barcodeData.stockCode,
        barcode: barcodeData.barcode,
        description: barcodeData.description,
        date: barcodeData.date,
        goldType: barcodeData.goldType,
        price: barcodeData.price
      }
    }
  }

  /**
   * Generate multiple barcode PDFs
   * @param {Array} barcodeDataArray - Array of barcode data objects
   * @param {Object} options - PDF generation options
   */
  async generateMultipleBarcodePDFs(barcodeDataArray, options = {}) {
    try {
      if (!barcodeDataArray || !Array.isArray(barcodeDataArray) || barcodeDataArray.length === 0) {
        throw new Error('ไม่พบข้อมูล barcode สำหรับสร้าง PDF')
      }

      const results = []
      for (const barcodeData of barcodeDataArray) {
        try {
          const result = await this.generateGemBarcodePDF(barcodeData, options)
          results.push({ success: true, barcode: barcodeData.barcode })
        } catch (error) {
          results.push({ success: false, barcode: barcodeData.barcode, error: error.message })
        }
      }

      const successCount = results.filter((r) => r.success).length
      const failCount = results.filter((r) => !r.success).length

      return {
        success: failCount === 0,
        message: `สร้าง PDF สำเร็จ ${successCount} รายการ${failCount > 0 ? `, ล้มเหลว ${failCount} รายการ` : ''}`,
        results: results
      }
    } catch (error) {
      console.error('Error generating multiple barcode PDFs:', error)
      throw error
    }
  }
}

// Export singleton instance
export const gemBarcodePdfService = new GemBarcodePdfIntegration()
