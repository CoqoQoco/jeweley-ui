import QRCode from 'qrcode'

import { CertificatePdfBuilder } from './certificate-pdf-builder.js'
import { usrStockProductApiStore } from '@/stores/modules/api/stock/product-api.js'
import { buildPublicUrl } from '@/config/public-site-config.js'

// สร้าง QR ชี้หน้าสาธารณะของสินค้า — ฟีเจอร์นี้ fail-closed เมื่อ env ไม่ได้เปิด
// ต้อง fail-safe เสมอ: error อะไรก็ตาม ให้ข้าม QR ไปเลย ไม่ทำให้พิมพ์ใบรับรองไม่ได้
async function attachQrCode(certificate, productStore) {
  if (!certificate.stockNumber) return certificate

  try {
    const res = await productStore.fetchPublicLink(certificate.stockNumber)
    if (!res?.path) return certificate

    const url = buildPublicUrl(res.path)
    const qrDataUrl = await QRCode.toDataURL(url, { width: 240, margin: 1 })
    return { ...certificate, qrDataUrl }
  } catch {
    return certificate
  }
}

export class CertificatePdfIntegration {
  constructor() {
    this.pdfBuilder = null
  }

  /**
   * สร้าง PDF ใบรับรองสินค้า (Certificate of Authenticity)
   * @param {Array} certificates - รายการใบรับรองที่จะพิมพ์
   * @param {Object} options - { preview, download, signerTitle, invoiceNumber }
   */
  async generateCertificatePDF(certificates, options = {}) {
    const selectedCertificates = Array.isArray(certificates)
      ? certificates.filter((c) => c.selected !== false)
      : []

    if (selectedCertificates.length === 0) {
      throw new Error('กรุณาเลือกสินค้าอย่างน้อย 1 รายการสำหรับพิมพ์ใบรับรอง')
    }

    const productStore = usrStockProductApiStore()
    const certificatesWithQr = await Promise.all(
      selectedCertificates.map((certificate) => attachQrCode(certificate, productStore))
    )

    this.pdfBuilder = new CertificatePdfBuilder(certificatesWithQr, {
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
      message: 'สร้างใบรับรองสินค้า PDF สำเร็จ'
    }
  }
}

// Export singleton instance
export const certificatePdfService = new CertificatePdfIntegration()
