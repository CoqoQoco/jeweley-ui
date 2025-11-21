import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'
import JsBarcode from 'jsbarcode'

export class GemBarcodePdfBuilder {
  constructor(barcodeData) {
    this.stockCode = barcodeData.stockCode || ''
    this.barcode = barcodeData.barcode || ''
    this.description = barcodeData.description || ''
    this.date = barcodeData.date || dayjs().format('DD/MM/YYYY')
    this.goldType = barcodeData.goldType || ''
  }

  /**
   * Generate barcode image as base64
   */
  generateBarcodeImage() {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas element
        const canvas = document.createElement('canvas')

        // Generate barcode
        JsBarcode(canvas, this.barcode, {
          format: 'CODE128',
          width: 2,
          height: 30,
          displayValue: false,
          margin: 0
        })

        // Convert to base64
        const base64 = canvas.toDataURL('image/png')
        resolve(base64)
      } catch (error) {
        console.error('Error generating barcode image:', error)
        reject(error)
      }
    })
  }

  /**
   * Prepare PDF - generate barcode image
   */
  async preparePDF() {
    this.barcodeImage = await this.generateBarcodeImage()
    return this
  }

  /**
   * Get PDF document definition
   * Paper size: 2.36 x 0.98 inches (59.944 x 24.892 mm)
   * Exposed Liner: Left 0.05, Right 0.05 inches (1.27 mm each)
   */
  getDocDefinition() {
    // Convert inches to points (1 inch = 72 points)
    const pageWidth = 2.36 * 72 // 169.92 points
    const pageHeight = 0.98 * 72 // 70.56 points
    const exposedLiner = 0.05 * 72 // 3.6 points

    return {
      pageSize: {
        width: pageWidth,
        height: pageHeight
      },
      pageMargins: [exposedLiner, 2, exposedLiner, 2], // [left, top, right, bottom]
      content: [
        {
          stack: [
            // Row 1: Stock Code and Date
            {
              columns: [
                {
                  text: this.stockCode,
                  fontSize: 12,
                  bold: true,
                  width: '*',
                  alignment: 'left'
                },
                {
                  text: this.date,
                  fontSize: 12,
                  bold: true,
                  width: 'auto',
                  alignment: 'right'
                }
              ],
              margin: [0, 0, 0, 1]
            },

            // Row 2: Barcode Image
            {
              image: this.barcodeImage,
              width: pageWidth - (/* `exposedLiner` is a variable used to define the margin size in
              points for the exposed liner on the PDF document. In this case, it
              is set to 0.05 inches, which is then converted to points (1 inch =
              72 points) to determine the actual margin size in points. This
              margin is applied to the left and right sides of the document to
              ensure proper spacing for the content within the PDF. */
              /* `exposedLiner` is a variable used to define the margin size in
              points for the exposed liner on the PDF document. In this case, it
              is set to 0.05 inches, which is then converted to points (1 inch =
              72 points) to determine the actual margin size in the PDF
              document. */
              /* `exposedLiner` is a variable used to define the margin size in
              points for the exposed liner on the PDF document. In this case, it
              is set to 0.05 inches, which is then converted to points (1 inch =
              72 points) to determine the margin size in points. This margin is
              applied to the left and right sides of the document to ensure
              proper spacing and alignment of the content within the PDF. */
              exposedLiner * 2) - 4, // Full width minus margins
              height: 30,
              alignment: 'center',
              margin: [0, 0, 0, 1]
            },

            // Row 3: Description
            {
              text: this.description,
              fontSize: 12,
              bold: true,
              alignment: 'left',
              margin: [0, 0, 0, 0]
            }
          ]
        }
      ],
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 8
      }
    }
  }

  /**
   * Generate PDF object
   */
  async generatePDF() {
    try {
      await this.preparePDF()
      const pdfMake = initPdfMake()
      const docDefinition = this.getDocDefinition()
      return pdfMake.createPdf(docDefinition)
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }

  /**
   * Download PDF file
   */
  async downloadPDF() {
    try {
      const pdf = await this.generatePDF()
      const fileName = `GemBarcode_${this.barcode}_${dayjs().format('YYYYMMDD')}.pdf`
      pdf.download(fileName)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      throw error
    }
  }

  /**
   * Open PDF in new tab
   */
  async openPDF() {
    try {
      const pdf = await this.generatePDF()
      pdf.open()
    } catch (error) {
      console.error('Error opening PDF:', error)
      throw error
    }
  }

  /**
   * Get PDF as blob for printing
   */
  async getPDFBlob() {
    try {
      const pdf = await this.generatePDF()
      return new Promise((resolve) => {
        pdf.getBlob((blob) => {
          resolve(blob)
        })
      })
    } catch (error) {
      console.error('Error getting PDF blob:', error)
      throw error
    }
  }

  /**
   * Print PDF directly
   */
  async printPDF() {
    try {
      const pdf = await this.generatePDF()
      pdf.print()
    } catch (error) {
      console.error('Error printing PDF:', error)
      throw error
    }
  }
}
