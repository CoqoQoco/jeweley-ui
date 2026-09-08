import { GuaranteeCardPdfBuilder } from './guarantee-card-pdf-builder.js'

export class GuaranteeCardPdfIntegration {
  constructor() {
    this.pdfBuilder = null
  }

  /**
   * สร้าง PDF ใบรับประกันสินค้า (Guarantee Card)
   * @param {Array} cards - รายการการ์ดที่จะพิมพ์
   * @param {Object} options - { preview, download, signerTitle, invoiceNumber }
   */
  async generateGuaranteeCardPDF(cards, options = {}) {
    const selectedCards = Array.isArray(cards) ? cards.filter((c) => c.selected !== false) : []

    if (selectedCards.length === 0) {
      throw new Error('กรุณาเลือกสินค้าอย่างน้อย 1 รายการสำหรับพิมพ์ใบรับประกัน')
    }

    this.pdfBuilder = new GuaranteeCardPdfBuilder(selectedCards, {
      signerTitle: options.signerTitle,
      invoiceNumber: options.invoiceNumber
    })

    // Preview mode — return blob URL instead of downloading
    if (options.preview) {
      const previewUrl = await this.pdfBuilder.getPreviewUrl()
      return {
        success: true,
        previewUrl
      }
    }

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
      message: 'สร้างใบรับประกันสินค้า PDF สำเร็จ'
    }
  }
}

// Export singleton instance
export const guaranteeCardPdfService = new GuaranteeCardPdfIntegration()
