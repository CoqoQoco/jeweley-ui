import { printService } from './PrintService.js'

/**
 * GemBarcodeService - Service for generating and printing jewelry barcode labels
 * Supports Honeywell PC42t printer with 4cm x 3cm sticker size
 * Supports both ZPL and EPL printer languages
 */
class GemBarcodeService {
  constructor() {
    // Sticker dimensions in dots (203 DPI)
    // 4cm x 3cm = 1.57" x 1.18" = 319 x 240 dots
    this.labelWidth = 319
    this.labelHeight = 240

    // Printer language: 'EPL' or 'ZPL'
    // PC42t default is EPL
    this.printerLanguage = 'EPL'
  }

  /**
   * Set printer language
   * @param {string} language - 'EPL' or 'ZPL'
   */
  setPrinterLanguage(language) {
    if (language !== 'EPL' && language !== 'ZPL') {
      throw new Error('Printer language must be EPL or ZPL')
    }
    console.log('[GemBarcodeService] Setting printer language to:', language)
    this.printerLanguage = language
  }

  /**
   * Generate EPL command for jewelry barcode (PC42t default)
   * @param {Object} data - Barcode data
   * @param {string} data.stockCode - Stock code (e.g., "*SA0126*")
   * @param {string} data.barcode - Barcode value (e.g., "SA0126")
   * @param {string} data.description - Product description
   * @param {string} data.date - Date string
   * @param {string} data.goldType - Gold type (e.g., "18K-A")
   * @returns {string} - EPL command string
   */
  generateEPL(data) {
    const { stockCode, barcode, description, date, goldType } = data

    // EPL Template for 4cm x 3cm sticker (Honeywell PC42t - 203 DPI)
    // Label size: 319 x 240 dots
    const epl = `
N
q319
Q240,24
S4

A10,10,0,3,1,1,N,"${this.escapeEPL(stockCode)}"

B90,50,0,1,2,3,60,N,"${this.escapeEPL(barcode)}"

A10,120,0,2,1,1,N,"${this.escapeEPL(description)}"

A10,150,0,1,1,1,N,"${this.escapeEPL(date)}"
A200,150,0,1,1,1,N,"${this.escapeEPL(goldType)}"

A10,180,0,1,1,1,N,"Duang Kaew Jewelry"

P1
`

    return epl.trim()
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
   * Generate command based on selected printer language
   * @param {Object} data - Barcode data
   * @returns {string} - EPL or ZPL command string
   */
  generateCommand(data) {
    console.log('[GemBarcodeService] Generating command in', this.printerLanguage, 'format')
    if (this.printerLanguage === 'EPL') {
      return this.generateEPL(data)
    } else {
      return this.generateZPL(data)
    }
  }

  /**
   * Escape special characters for EPL
   * @param {string} text - Input text
   * @returns {string} - Escaped text
   */
  escapeEPL(text) {
    if (!text) return ''
    // EPL uses quotes, so escape them
    return text.replace(/"/g, '\\"')
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
      console.log('[GemBarcodeService] ========== PRINT BARCODE START ==========')
      console.log('[GemBarcodeService] Barcode data:', JSON.stringify(data, null, 2))

      // Validate data
      console.log('[GemBarcodeService] Validating barcode data...')
      this.validateBarcodeData(data)
      console.log('[GemBarcodeService] ✓ Validation passed')

      // Generate command (EPL or ZPL)
      console.log('[GemBarcodeService] Generating', this.printerLanguage, 'command...')
      const command = this.generateCommand(data)
      console.log('[GemBarcodeService] ✓', this.printerLanguage, 'command generated')
      console.log('[GemBarcodeService] Command length:', command.length, 'characters')
      console.log('[GemBarcodeService] Command preview:', command.substring(0, 150))

      // Connect to QZ Tray if not connected
      if (!printService.isConnected()) {
        console.log('[GemBarcodeService] QZ Tray not connected, connecting...')
        await printService.connect()
      } else {
        console.log('[GemBarcodeService] QZ Tray already connected')
      }

      // Auto-detect printer/device if not specified
      if (printService.useUSB) {
        if (!printService.usbDevice) {
          console.log('[GemBarcodeService] No USB device selected, auto-detecting...')
          await printService.detectHoneywellUSB()
        } else {
          console.log('[GemBarcodeService] Using USB device:', printService.usbDevice)
        }
      } else {
        if (!printerName && !printService.selectedPrinter) {
          console.log('[GemBarcodeService] No printer selected, auto-detecting...')
          await printService.detectHoneywellPrinter()
        } else {
          console.log('[GemBarcodeService] Using printer:', printerName || printService.selectedPrinter)
        }
      }

      // Print
      console.log('[GemBarcodeService] Sending to printer...')
      await printService.print(command, printerName)

      console.log('[GemBarcodeService] ✓ Print completed successfully')
      console.log('[GemBarcodeService] ========== PRINT BARCODE END ==========')

      return {
        success: true,
        message: 'พิมพ์บาร์โค้ดสำเร็จ'
      }
    } catch (error) {
      console.error('[GemBarcodeService] ========== PRINT BARCODE FAILED ==========')
      console.error('[GemBarcodeService] ✗ Error printing barcode:', error)
      console.error('[GemBarcodeService] Error message:', error.message)
      console.error('[GemBarcodeService] Error stack:', error.stack)
      console.error('[GemBarcodeService] ================================================')
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
      console.log('[GemBarcodeService] ========== BATCH PRINT START ==========')
      console.log('[GemBarcodeService] Items to print:', dataArray.length)
      console.log('[GemBarcodeService] Copies per item:', copiesPerItem)
      console.log('[GemBarcodeService] Total labels:', dataArray.length * copiesPerItem)

      // Validate all data
      console.log('[GemBarcodeService] Validating all barcode data...')
      dataArray.forEach((data, index) => {
        console.log(`[GemBarcodeService] Validating item ${index + 1}:`, data.barcode)
        this.validateBarcodeData(data)
      })
      console.log('[GemBarcodeService] ✓ All validations passed')

      // Connect to QZ Tray if not connected
      if (!printService.isConnected()) {
        console.log('[GemBarcodeService] QZ Tray not connected, connecting...')
        await printService.connect()
      }

      // Auto-detect printer/device if not specified
      if (printService.useUSB) {
        if (!printService.usbDevice) {
          console.log('[GemBarcodeService] No USB device selected, auto-detecting...')
          await printService.detectHoneywellUSB()
        }
      } else {
        if (!printerName && !printService.selectedPrinter) {
          console.log('[GemBarcodeService] No printer selected, auto-detecting...')
          await printService.detectHoneywellPrinter()
        }
      }

      // Generate commands for all items with copies
      console.log('[GemBarcodeService] Generating', this.printerLanguage, 'commands...')
      const commands = []
      dataArray.forEach((data, index) => {
        console.log(`[GemBarcodeService] Generating ${copiesPerItem} copies for item ${index + 1}`)
        for (let i = 0; i < copiesPerItem; i++) {
          commands.push(this.generateCommand(data))
        }
      })
      console.log('[GemBarcodeService] ✓ Generated', commands.length, this.printerLanguage, 'commands')

      // Print batch
      console.log('[GemBarcodeService] Starting batch print...')
      const results = await printService.printBatch(commands, printerName)

      // Count successes and failures
      const successCount = results.filter((r) => r.success).length
      const failCount = results.filter((r) => !r.success).length

      console.log('[GemBarcodeService] ========== BATCH PRINT RESULTS ==========')
      console.log('[GemBarcodeService] Total:', results.length)
      console.log('[GemBarcodeService] Success:', successCount)
      console.log('[GemBarcodeService] Failed:', failCount)
      console.log('[GemBarcodeService] ============================================')

      return {
        success: failCount === 0,
        total: results.length,
        successCount,
        failCount,
        details: results,
        message: `พิมพ์สำเร็จ ${successCount} จาก ${results.length} รายการ`
      }
    } catch (error) {
      console.error('[GemBarcodeService] ========== BATCH PRINT FAILED ==========')
      console.error('[GemBarcodeService] ✗ Error printing barcodes:', error)
      console.error('[GemBarcodeService] Error message:', error.message)
      console.error('[GemBarcodeService] =============================================')
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
   * Preview barcode data (return command for testing)
   * @param {Object} data - Barcode data
   * @returns {string} - EPL or ZPL command string
   */
  previewCommand(data) {
    try {
      this.validateBarcodeData(data)
      return this.generateCommand(data)
    } catch (error) {
      console.error('[GemBarcodeService] Error generating preview:', error)
      throw error
    }
  }

  /**
   * Preview ZPL command (backward compatibility)
   * @param {Object} data - Barcode data
   * @returns {string} - ZPL command string
   */
  previewZPL(data) {
    try {
      this.validateBarcodeData(data)
      return this.generateZPL(data)
    } catch (error) {
      console.error('[GemBarcodeService] Error generating ZPL preview:', error)
      throw error
    }
  }

  /**
   * Preview EPL command
   * @param {Object} data - Barcode data
   * @returns {string} - EPL command string
   */
  previewEPL(data) {
    try {
      this.validateBarcodeData(data)
      return this.generateEPL(data)
    } catch (error) {
      console.error('[GemBarcodeService] Error generating EPL preview:', error)
      throw error
    }
  }

  /**
   * Test printer connection
   * @returns {Promise<Object>} - Test result
   */
  async testPrinter() {
    try {
      console.log('[GemBarcodeService] ========== PRINTER TEST START ==========')

      if (!printService.isConnected()) {
        console.log('[GemBarcodeService] Connecting to QZ Tray...')
        await printService.connect()
      }

      console.log('[GemBarcodeService] Getting printer list...')
      const printers = await printService.getPrinters()

      console.log('[GemBarcodeService] Detecting Honeywell printer...')
      const honeywellPrinter = await printService.detectHoneywellPrinter()

      const qzVersion = await printService.getVersion()

      console.log('[GemBarcodeService] ========== PRINTER TEST RESULTS ==========')
      console.log('[GemBarcodeService] QZ Tray version:', qzVersion)
      console.log('[GemBarcodeService] Available printers:', printers)
      console.log('[GemBarcodeService] Selected printer:', honeywellPrinter)
      console.log('[GemBarcodeService] ✓ Test completed successfully')
      console.log('[GemBarcodeService] ============================================')

      return {
        success: true,
        connected: true,
        qzVersion: qzVersion,
        printers: printers,
        selectedPrinter: honeywellPrinter,
        message: 'เชื่อมต่อเครื่องพิมพ์สำเร็จ'
      }
    } catch (error) {
      console.error('[GemBarcodeService] ========== PRINTER TEST FAILED ==========')
      console.error('[GemBarcodeService] ✗ Error:', error.message)
      console.error('[GemBarcodeService] ==========================================')

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
    console.log('[GemBarcodeService] ========== TEST LABEL PRINT ==========')

    const testData = {
      stockCode: '*TEST001*',
      barcode: 'TEST001',
      description: 'Test Label',
      date: new Date().toLocaleDateString('th-TH'),
      goldType: 'TEST'
    }

    console.log('[GemBarcodeService] Test data:', testData)
    console.log('[GemBarcodeService] Printing test label...')

    const result = await this.printBarcode(testData)

    console.log('[GemBarcodeService] ========== TEST LABEL COMPLETE ==========')

    return result
  }
}

// Export singleton instance
export const gemBarcodeService = new GemBarcodeService()
