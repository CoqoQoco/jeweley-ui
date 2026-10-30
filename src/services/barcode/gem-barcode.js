import { printRaw, getPrinterState, checkBridgeHealth } from '@/services/api/print-bridge-service.js'
import { getMaterialLabelPrinterName } from '@/services/api/barcode-printer-config.js'

// bridge ส่งข้อความเป็น ASCII และฟอนต์ EPL ไม่มีอักษรไทย — ตัดอักขระนอก ASCII ทิ้งก่อนส่งพิมพ์
export function sanitizeLabelText(text) {
  if (text === null || text === undefined) return ''
  return String(text)
    .replace(/[^ -~]/g, ' ')
    .replace(/\(\s*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([)\]])/g, '$1')
    .trim()
}

// Code128 เข้ารหัสอักษรไทยไม่ได้ — ตัดทิ้งและเก็บเฉพาะ ASCII ที่พิมพ์ได้ ไม่เว้นวรรค
export function sanitizeBarcodeValue(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[^!-~]/g, '')
}

export const MATERIAL_PRINTER_NOT_CONFIGURED_MESSAGE =
  'ยังไม่ได้ตั้งค่าเครื่องพิมพ์ฉลากวัตถุดิบ กรุณาไปตั้งค่าที่หน้าตั้งค่าเครื่องพิมพ์บาร์โค้ดก่อนพิมพ์ครับ'

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
    const stockCode = sanitizeLabelText(data.stockCode)
    const barcode = sanitizeBarcodeValue(data.barcode)
    const description = sanitizeLabelText(data.description)
    const date = sanitizeLabelText(data.date)
    const goldType = sanitizeLabelText(data.goldType)

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
   * Send commands to the configured material label printer via DK Print Bridge
   * @param {Array<string>} commands - EPL/ZPL command strings (one per label)
   */
  async sendToBridge(commands) {
    const printerName = getMaterialLabelPrinterName()
    if (!printerName) {
      throw new Error(MATERIAL_PRINTER_NOT_CONFIGURED_MESSAGE)
    }
    await printRaw({ printerName, text: commands.join('\n') + '\n' })
  }

  /**
   * Print single barcode
   * @param {Object} data - Barcode data
   * @returns {Promise<Object>}
   */
  async printBarcode(data) {
    this.validateBarcodeData(data)
    await this.sendToBridge([this.generateCommand(data)])
    return {
      success: true,
      message: 'พิมพ์บาร์โค้ดสำเร็จ'
    }
  }

  /**
   * Print multiple barcodes
   * @param {Array<Object>} dataArray - Array of barcode data
   * @param {number} copiesPerItem - Number of copies per item
   * @returns {Promise<Object>} - Print results
   */
  async printBarcodes(dataArray, copiesPerItem = 1) {
    dataArray.forEach((data) => this.validateBarcodeData(data))

    const commands = []
    dataArray.forEach((data) => {
      for (let i = 0; i < copiesPerItem; i++) {
        commands.push(this.generateCommand(data))
      }
    })

    await this.sendToBridge(commands)

    return {
      success: true,
      total: commands.length,
      successCount: commands.length,
      failCount: 0,
      message: `พิมพ์สำเร็จ ${commands.length} จาก ${commands.length} รายการ`
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
   * Check bridge + configured material label printer
   * @returns {Promise<Object>} - { success, connected, notConfigured?, printerName?, message }
   */
  async testPrinter() {
    const printerName = getMaterialLabelPrinterName()
    if (!printerName) {
      return {
        success: false,
        connected: false,
        notConfigured: true,
        message: MATERIAL_PRINTER_NOT_CONFIGURED_MESSAGE
      }
    }

    const bridgeOk = await checkBridgeHealth()
    if (!bridgeOk) {
      return { success: false, connected: false, printerName, message: 'ไม่สามารถเชื่อมต่อ DK Print Bridge ได้' }
    }

    const state = await getPrinterState(printerName)
    if (state && (state.offline || state.paused || state.error)) {
      return { success: false, connected: true, printerName, message: 'เครื่องพิมพ์ไม่พร้อมใช้งาน' }
    }

    return { success: true, connected: true, printerName, message: 'เชื่อมต่อเครื่องพิมพ์สำเร็จ' }
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
