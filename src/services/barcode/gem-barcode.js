import { printService } from './PrintService.js'

/**
 * GemBarcodeService - Service for generating and printing jewelry barcode labels
 * Supports Honeywell PC42t printer with 4cm x 3cm sticker size
 */
class GemBarcodeService {
  constructor() {
    // Sticker dimensions in dots (203 DPI)
    // 4cm x 3cm = 1.57" x 1.18" = 319 x 240 dots
    this.labelWidth = 319
    this.labelHeight = 240
  }

  /**
   * Generate ZPL command for jewelry barcode
   * @param {Object} data - Barcode data
   * @param {string} data.stockCode - Stock code (e.g., "*SA0126*")
   * @param {string} data.barcode - Barcode value (e.g., "SA0126")
   * @param {string} data.description - Product description
   * @param {string} data.date - Date string
   * @param {string} data.goldType - Gold type (e.g., "18K-A")
   * @returns {string} - ZPL command string
   */
  generateZPL(data) {
    const { stockCode, barcode, description, date, goldType } = data

    // ZPL Template for 4cm x 3cm sticker (Honeywell PC42t)
    const zpl = `
^XA
^PW319
^LL240

~TA000
~JSN
^LT0
^MNW
^MTD
^PON
^PMN
^LH0,0
^JMA
^PR4,4
~SD15
^JUS
^LRN
^CI27
^PA0,1,1,0
^XZ

^XA
^MMT
^PW319
^LL240
^LS0

^FT10,30^A0N,28,28^FB300,1,0,C^FH^CI28^FD${this.escapeZPL(stockCode)}^FS^CI27

^BY2,3,60^FT90,110^BCN,,N,N
^FH^FD${this.escapeZPL(barcode)}^FS

^FT10,140^A0N,20,20^FB300,1,0,C^FH^CI28^FD${this.escapeZPL(description)}^FS^CI27

^FT10,170^A0N,18,18^FH^CI28^FD${this.escapeZPL(date)}^FS^CI27
^FT200,170^A0N,18,18^FH^CI28^FD${this.escapeZPL(goldType)}^FS^CI27

^FT10,200^A0N,16,16^FH^CI28^FDDuang Kaew Jewelry^FS^CI27

^PQ1,0,1,Y
^XZ
`

    return zpl.trim()
  }

  /**
   * Escape special characters for ZPL
   * @param {string} text - Input text
   * @returns {string} - Escaped text
   */
  escapeZPL(text) {
    if (!text) return ''

    return text
      .replace(/\\/g, '\\\\')
      .replace(/\^/g, '\\^')
      .replace(/~/g, '\\~')
      .replace(/"/g, '\\"')
  }

  /**
   * Print single barcode
   * @param {Object} data - Barcode data
   * @param {string} printerName - Optional printer name
   * @returns {Promise<void>}
   */
  async printBarcode(data, printerName = null) {
    try {
      // Validate data
      this.validateBarcodeData(data)

      // Generate ZPL
      const zpl = this.generateZPL(data)

      // Connect to QZ Tray if not connected
      if (!printService.isConnected()) {
        await printService.connect()
      }

      // Auto-detect printer if not specified
      if (!printerName && !printService.selectedPrinter) {
        await printService.detectHoneywellPrinter()
      }

      // Print
      await printService.print(zpl, printerName)

      return {
        success: true,
        message: 'พิมพ์บาร์โค้ดสำเร็จ'
      }
    } catch (error) {
      console.error('Error printing barcode:', error)
      throw error
    }
  }

  /**
   * Print multiple barcodes
   * @param {Array<Object>} dataArray - Array of barcode data
   * @param {number} copiesPerItem - Number of copies per item
   * @param {string} printerName - Optional printer name
   * @returns {Promise<Object>} - Print results
   */
  async printBarcodes(dataArray, copiesPerItem = 1, printerName = null) {
    try {
      // Validate all data
      dataArray.forEach((data) => this.validateBarcodeData(data))

      // Connect to QZ Tray if not connected
      if (!printService.isConnected()) {
        await printService.connect()
      }

      // Auto-detect printer if not specified
      if (!printerName && !printService.selectedPrinter) {
        await printService.detectHoneywellPrinter()
      }

      // Generate ZPL commands for all items with copies
      const zplCommands = []
      dataArray.forEach((data) => {
        for (let i = 0; i < copiesPerItem; i++) {
          zplCommands.push(this.generateZPL(data))
        }
      })

      // Print batch
      const results = await printService.printBatch(zplCommands, printerName)

      // Count successes and failures
      const successCount = results.filter((r) => r.success).length
      const failCount = results.filter((r) => !r.success).length

      return {
        success: failCount === 0,
        total: results.length,
        successCount,
        failCount,
        details: results,
        message: `พิมพ์สำเร็จ ${successCount} จาก ${results.length} รายการ`
      }
    } catch (error) {
      console.error('Error printing barcodes:', error)
      throw error
    }
  }

  /**
   * Validate barcode data
   * @param {Object} data - Barcode data
   * @throws {Error} - If data is invalid
   */
  validateBarcodeData(data) {
    if (!data) {
      throw new Error('ไม่พบข้อมูลบาร์โค้ด')
    }

    if (!data.barcode || data.barcode.trim() === '') {
      throw new Error('กรุณาระบุรหัสบาร์โค้ด')
    }

    if (!data.stockCode || data.stockCode.trim() === '') {
      throw new Error('กรุณาระบุรหัสสต็อก')
    }
  }

  /**
   * Preview barcode data (return ZPL for testing)
   * @param {Object} data - Barcode data
   * @returns {string} - ZPL command string
   */
  previewZPL(data) {
    try {
      this.validateBarcodeData(data)
      return this.generateZPL(data)
    } catch (error) {
      console.error('Error generating preview:', error)
      throw error
    }
  }

  /**
   * Test printer connection
   * @returns {Promise<Object>} - Test result
   */
  async testPrinter() {
    try {
      if (!printService.isConnected()) {
        await printService.connect()
      }

      const printers = await printService.getPrinters()
      const honeywellPrinter = await printService.detectHoneywellPrinter()

      return {
        success: true,
        connected: true,
        qzVersion: await printService.getVersion(),
        printers: printers,
        selectedPrinter: honeywellPrinter,
        message: 'เชื่อมต่อเครื่องพิมพ์สำเร็จ'
      }
    } catch (error) {
      return {
        success: false,
        connected: false,
        error: error.message,
        message: 'ไม่สามารถเชื่อมต่อเครื่องพิมพ์ได้'
      }
    }
  }

  /**
   * Print test label
   * @returns {Promise<void>}
   */
  async printTestLabel() {
    const testData = {
      stockCode: '*TEST001*',
      barcode: 'TEST001',
      description: 'Test Label',
      date: new Date().toLocaleDateString('th-TH'),
      goldType: 'TEST'
    }

    return await this.printBarcode(testData)
  }
}

// Export singleton instance
export const gemBarcodeService = new GemBarcodeService()
