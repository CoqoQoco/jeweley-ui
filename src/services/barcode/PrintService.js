import qz from 'qz-tray'
import { sha256 } from 'js-sha256'

/**
 * PrintService - Service for managing QZ Tray printer connections
 * Handles connection, printer detection, and print job management via standard drivers
 * Now supports PDF printing
 */
class PrintService {
  constructor() {
    this.connected = false
    this.selectedPrinter = null
    this.certificateConfigured = false
    this.printMethod = 'driver' // Changed default to standard driver
    this.setupCertificate()
  }

  /**
   * Set printing method
   * @param {string} method - 'driver' for standard driver, 'usb' for USB, 'network' for network
   */
  setPrintMethod(method) {
    console.log('[PrintService] Setting print method to:', method)
    this.printMethod = method
  }

  /**
   * Setup QZ Tray certificate for digital signing
   */
  setupCertificate() {
    try {
      console.log('[PrintService] Setting up QZ Tray certificate...')

      qz.security.setCertificatePromise((resolve) => {
        console.log('[PrintService] Loading certificate...')
        fetch('assets/signing/digital-certificate.txt')
          .then((data) => data.text())
          .then((cert) => {
            console.log('[PrintService] Certificate loaded successfully')
            resolve(cert)
          })
          .catch((err) => {
            console.warn('[PrintService] Certificate file not found, using demo mode')
            resolve() // Will prompt for permission
          })
      })

      qz.security.setSignatureAlgorithm('SHA512')
      qz.security.setSignaturePromise((toSign) => {
        return (resolve, reject) => {
          console.log('[PrintService] Signing request...')
          fetch('assets/signing/private-key.pem')
            .then((data) => data.text())
            .then((key) => {
              console.log('[PrintService] Private key loaded, signing...')
              const signature = sha256(toSign + key)
              console.log('[PrintService] Request signed successfully')
              resolve(signature)
            })
            .catch((err) => {
              console.warn('[PrintService] Private key not found, using demo mode')
              resolve() // Will prompt for permission
            })
        }
      })

      this.certificateConfigured = true
      console.log('[PrintService] Certificate setup completed')
    } catch (error) {
      console.error('[PrintService] Error setting up certificate:', error)
      this.certificateConfigured = false
    }
  }

  /**
   * Connect to QZ Tray
   * @returns {Promise<boolean>} - Connection status
   */
  async connect() {
    try {
      console.log('[PrintService] Checking QZ Tray connection...')
      console.log('[PrintService] QZ websocket active:', qz.websocket.isActive())

      if (!qz.websocket.isActive()) {
        console.log('[PrintService] Connecting to QZ Tray...')
        await qz.websocket.connect()
        this.connected = true
        console.log('[PrintService] ✓ QZ Tray connected successfully')
        console.log('[PrintService] QZ Tray version:', await qz.api.getVersion())
        return true
      }

      console.log('[PrintService] ✓ Already connected to QZ Tray')
      this.connected = true
      return true
    } catch (error) {
      console.error('[PrintService] ✗ Failed to connect to QZ Tray:', error)
      this.connected = false
      throw new Error('ไม่สามารถเชื่อมต่อกับ QZ Tray กรุณาตรวจสอบว่าเปิดโปรแกรม QZ Tray แล้ว')
    }
  }

  /**
   * Disconnect from QZ Tray
   */
  async disconnect() {
    try {
      console.log('[PrintService] Disconnecting from QZ Tray...')
      if (qz.websocket.isActive()) {
        await qz.websocket.disconnect()
        this.connected = false
        console.log('[PrintService] ✓ QZ Tray disconnected')
      }
    } catch (error) {
      console.error('[PrintService] ✗ Error disconnecting QZ Tray:', error)
    }
  }

  /**
   * Get list of available printers (via standard drivers)
   * @returns {Promise<Array<string>>} - Array of printer names
   */
  async getPrinters() {
    try {
      console.log('[PrintService] Getting list of printers via standard drivers...')
      if (!this.connected) {
        await this.connect()
      }
      
      // Get all system printers (includes those installed via standard drivers)
      const printers = await qz.printers.find()
      console.log('[PrintService] ✓ Found printers:', printers)
      console.log('[PrintService] Total printers:', printers.length)
      return printers
    } catch (error) {
      console.error('[PrintService] ✗ Error getting printers:', error)
      throw new Error('ไม่สามารถดึงรายชื่อเครื่องพิมพ์ได้')
    }
  }

  /**
   * Auto-detect Honeywell printer via standard driver
   * @returns {Promise<string|null>} - Printer name or null if not found
   */
  async detectHoneywellPrinter() {
    try {
      console.log('[PrintService] Auto-detecting Honeywell printer via standard driver...')
      const printers = await this.getPrinters()

      console.log('[PrintService] Searching for Honeywell/PC42t printer...')
      
      // Search for Honeywell printer by driver name patterns
      const honeywellPrinter = printers.find(
        (printer) =>
          printer.toLowerCase().includes('honeywell') ||
          printer.toLowerCase().includes('pc42t') ||
          printer.toLowerCase().includes('pc42') ||
          printer.toLowerCase().includes('pc43') ||
          printer.toLowerCase().includes('intermec') // Honeywell acquired Intermec
      )

      if (honeywellPrinter) {
        this.selectedPrinter = honeywellPrinter
        console.log('[PrintService] ✓ Honeywell printer detected via driver:', honeywellPrinter)
        return honeywellPrinter
      }

      console.log('[PrintService] ⚠ Honeywell printer not found via standard driver')
      
      // If no Honeywell found, check for generic label printer drivers
      const labelPrinter = printers.find(
        (printer) =>
          printer.toLowerCase().includes('label') ||
          printer.toLowerCase().includes('thermal') ||
          printer.toLowerCase().includes('zebra') ||
          printer.toLowerCase().includes('datamax')
      )

      if (labelPrinter) {
        this.selectedPrinter = labelPrinter
        console.log('[PrintService] ⚠ Using label printer:', labelPrinter)
        return labelPrinter
      }

      // If no label printer, use default printer or first available
      if (printers.length > 0) {
        // Try to get default printer first
        const defaultPrinter = await this.getDefaultPrinter()
        if (defaultPrinter && printers.includes(defaultPrinter)) {
          this.selectedPrinter = defaultPrinter
          console.log('[PrintService] ⚠ Using default printer:', defaultPrinter)
          return defaultPrinter
        }
        
        this.selectedPrinter = printers[0]
        console.log('[PrintService] ⚠ Using first available printer:', printers[0])
        return printers[0]
      }

      console.log('[PrintService] ✗ No printers found')
      throw new Error('ไม่พบเครื่องพิมพ์ที่ใช้งานได้')
    } catch (error) {
      console.error('[PrintService] ✗ Error detecting printer:', error)
      throw new Error('ไม่สามารถตรวจจับเครื่องพิมพ์ได้: ' + error.message)
    }
  }

  /**
   * Get default printer from system
   * @returns {Promise<string|null>} - Default printer name
   */
  async getDefaultPrinter() {
    try {
      console.log('[PrintService] Getting default printer...')
      if (!this.connected) {
        await this.connect()
      }
      
      const defaultPrinter = await qz.printers.getDefault()
      console.log('[PrintService] Default printer:', defaultPrinter)
      return defaultPrinter
    } catch (error) {
      console.log('[PrintService] Could not get default printer:', error.message)
      return null
    }
  }

  /**
   * Set selected printer
   * @param {string} printerName - Name of the printer
   */
  setSelectedPrinter(printerName) {
    console.log('[PrintService] Setting printer:', printerName)
    this.selectedPrinter = printerName
    console.log('[PrintService] ✓ Selected printer updated')
  }

  /**
   * Print via standard printer driver
   * @param {string} data - EPL/ZPL command string
   * @param {string} printerName - Optional printer name
   * @returns {Promise<void>}
   */
  async printViaDriver(data, printerName = null) {
    try {
      console.log('[PrintService] ========== DRIVER PRINT JOB START ==========')
      console.log('[PrintService] Print data length:', data.length, 'characters')
      console.log('[PrintService] Command Preview (first 200 chars):', data.substring(0, 200))

      if (!this.connected) {
        console.log('[PrintService] Not connected, connecting first...')
        await this.connect()
      }

      const targetPrinter = printerName || this.selectedPrinter || (await this.detectHoneywellPrinter())
      console.log('[PrintService] Target printer:', targetPrinter)

      if (!targetPrinter) {
        throw new Error('ไม่ได้เลือกเครื่องพิมพ์หรือไม่พบเครื่องพิมพ์')
      }

      console.log('[PrintService] Creating print configuration...')
      const config = qz.configs.create(targetPrinter, {
        colorType: 'blackwhite',
        orientation: 'portrait',
        margins: { top: 0, right: 0, bottom: 0, left: 0 }
      })

      console.log('[PrintService] Preparing print data...')
      const printData = [
        {
          type: 'raw',
          format: 'command',
          data: data
        }
      ]

      console.log('[PrintService] Sending to printer via driver...')
      const result = await qz.print(config, printData)
      
      console.log('[PrintService] ✓ Print job sent successfully via driver:', targetPrinter)
      console.log('[PrintService] Print result:', result)
      console.log('[PrintService] ========== DRIVER PRINT JOB END ==========')
      
      return result
    } catch (error) {
      console.error('[PrintService] ========== DRIVER PRINT JOB FAILED ==========')
      console.error('[PrintService] ✗ Driver Print error:', error)
      console.error('[PrintService] Error message:', error.message)
      console.error('[PrintService] Error stack:', error.stack)
      console.error('[PrintService] ===========================================')
      throw new Error(`การพิมพ์ผ่าน Driver ล้มเหลว: ${error.message}`)
    }
  }

  /**
   * Print PDF via standard printer driver
   * @param {Uint8Array} pdfBuffer - PDF file buffer
   * @param {string} printerName - Optional printer name
   * @returns {Promise<void>}
   */
  async printPDF(pdfBuffer, printerName = null) {
    try {
      console.log('[PrintService] ========== PDF PRINT JOB START ==========')
      console.log('[PrintService] PDF buffer size:', pdfBuffer.length, 'bytes')

      if (!this.connected) {
        console.log('[PrintService] Not connected, connecting first...')
        await this.connect()
      }

      const targetPrinter = printerName || this.selectedPrinter || (await this.detectHoneywellPrinter())
      console.log('[PrintService] Target printer:', targetPrinter)

      if (!targetPrinter) {
        throw new Error('ไม่ได้เลือกเครื่องพิมพ์หรือไม่พบเครื่องพิมพ์')
      }

      console.log('[PrintService] Creating PDF print configuration...')
      const config = qz.configs.create(targetPrinter, {
        colorType: 'color', // PDF usually needs color support
        orientation: 'portrait',
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        density: 203, // DPI for label printers
        jobName: `Jewelry Label ${new Date().getTime()}`
      })

      console.log('[PrintService] Preparing PDF print data...')
      
      // Convert Uint8Array to base64
      const base64String = this.uint8ArrayToBase64(pdfBuffer)
      
      const printData = [
        {
          type: 'pdf',
          format: 'base64',
          data: base64String
        }
      ]

      console.log('[PrintService] Sending PDF to printer via driver...')
      const result = await qz.print(config, printData)
      
      console.log('[PrintService] ✓ PDF print job sent successfully via driver:', targetPrinter)
      console.log('[PrintService] Print result:', result)
      console.log('[PrintService] ========== PDF PRINT JOB END ==========')
      
      return result
    } catch (error) {
      console.error('[PrintService] ========== PDF PRINT JOB FAILED ==========')
      console.error('[PrintService] ✗ PDF Print error:', error)
      console.error('[PrintService] Error message:', error.message)
      console.error('[PrintService] Error stack:', error.stack)
      console.error('[PrintService] ===========================================')
      throw new Error(`การพิมพ์ PDF ล้มเหลว: ${error.message}`)
    }
  }

  /**
   * Convert Uint8Array to base64 string
   * @param {Uint8Array} buffer - Buffer to convert
   * @returns {string} - Base64 string
   */
  uint8ArrayToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Print data (auto-select method based on printMethod setting)
   * @param {string|Uint8Array} data - EPL/ZPL command string or PDF buffer
   * @param {string} target - Printer name
   * @returns {Promise<void>}
   */
  async print(data, target = null) {
    console.log('[PrintService] Print method:', this.printMethod)
    
    // Check if data is PDF buffer
    if (data instanceof Uint8Array) {
      console.log('[PrintService] Detected PDF buffer, using PDF printing')
      return await this.printPDF(data, target)
    }
    
    switch (this.printMethod) {
      case 'driver':
        return await this.printViaDriver(data, target)
      case 'usb':
        return await this.printUSB(data, target)
      case 'network':
        return await this.printNetwork(data, target)
      default:
        console.log('[PrintService] Unknown print method, using driver as default')
        return await this.printViaDriver(data, target)
    }
  }

  /**
   * Print test page to verify printer connection
   * @param {string} printerName - Optional printer name
   * @returns {Promise<void>}
   */
  async printTestPage(printerName = null) {
    const testEPL = `
N
A50,50,0,3,1,1,N,"Test Print"
A50,100,0,2,1,1,N,"Printer: ${printerName || this.selectedPrinter}"
A50,150,0,2,1,1,N,"Time: ${new Date().toLocaleString('th-TH')}"
A50,200,0,1,1,1,N,"Status: OK"
P1
`
    
    console.log('[PrintService] Printing test page...')
    await this.print(testEPL, printerName)
    console.log('[PrintService] ✓ Test page printed')
  }

  // Keep existing USB and Network methods for backward compatibility
  /**
   * Print via USB (legacy method)
   */
  async printUSB(data, device = null) {
    // ...existing USB code...
    throw new Error('USB printing is deprecated. Please use standard driver printing instead.')
  }

  /**
   * Print via Network (legacy method)
   */
  async printNetwork(data, printerName = null) {
    console.log('[PrintService] Network printing - using standard driver instead')
    return await this.printViaDriver(data, printerName)
  }

  /**
   * Print multiple jobs
   * @param {Array<string>} dataArray - Array of ZPL command strings
   * @param {string} printerName - Optional printer name
   * @returns {Promise<Array<{success: boolean, error?: string}>>}
   */
  async printBatch(dataArray, printerName = null) {
    console.log('[PrintService] ========== BATCH PRINT START ==========')
    console.log('[PrintService] Total items to print:', dataArray.length)

    const results = []

    for (let i = 0; i < dataArray.length; i++) {
      try {
        console.log(`[PrintService] Printing item ${i + 1}/${dataArray.length}`)
        await this.print(dataArray[i], printerName)
        results.push({ success: true, index: i })
        console.log(`[PrintService] ✓ Item ${i + 1} printed successfully`)

        // Add small delay between prints
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`[PrintService] ✗ Item ${i + 1} failed:`, error.message)
        results.push({ success: false, index: i, error: error.message })
      }
    }

    console.log('[PrintService] ========== BATCH PRINT END ==========')
    console.log('[PrintService] Results:', {
      total: dataArray.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length
    })

    return results
  }

  /**
   * Get printer capabilities
   * @param {string} printerName - Optional printer name
   * @returns {Promise<Object>} - Printer capabilities
   */
  async getPrinterCapabilities(printerName = null) {
    try {
      const targetPrinter = printerName || this.selectedPrinter
      if (!targetPrinter) {
        throw new Error('ไม่ได้เลือกเครื่องพิมพ์')
      }

      console.log('[PrintService] Getting printer capabilities for:', targetPrinter)
      
      // Create a configuration to query capabilities
      const config = qz.configs.create(targetPrinter)
      const capabilities = await qz.printers.getCapabilities(config)
      
      console.log('[PrintService] Printer capabilities:', capabilities)
      return capabilities
    } catch (error) {
      console.error('[PrintService] Error getting printer capabilities:', error)
      return {
        resolutions: ['203dpi'],
        paperSizes: ['Label'],
        features: ['raw']
      }
    }
  }

  /**
   * Check if QZ Tray is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && qz.websocket.isActive()
  }

  /**
   * Get QZ Tray version
   * @returns {Promise<string>}
   */
  async getVersion() {
    try {
      if (!this.connected) {
        await this.connect()
      }
      return await qz.api.getVersion()
    } catch (error) {
      console.error('Error getting QZ Tray version:', error)
      return 'Unknown'
    }
  }
}

// Export singleton instance
export const printService = new PrintService()
