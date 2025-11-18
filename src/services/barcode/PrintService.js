import qz from 'qz-tray'
import { sha256 } from 'js-sha256'

/**
 * PrintService - Service for managing QZ Tray printer connections
 * Handles connection, printer detection, and print job management
 */
class PrintService {
  constructor() {
    this.connected = false
    this.selectedPrinter = null
    this.certificateConfigured = false
    this.setupCertificate()
  }

  /**
   * Setup QZ Tray certificate for digital signing
   * This eliminates the need for permission prompts on every print
   */
  setupCertificate() {
    try {
      console.log('[PrintService] Setting up QZ Tray certificate...')

      // Private key for signing (DO NOT SHARE IN PRODUCTION)
      qz.security.setCertificatePromise((resolve) => {
        console.log('[PrintService] Loading certificate...')
        // Replace with your actual certificate
        // For development, you can use QZ Tray's demo certificate
        fetch('assets/signing/digital-certificate.txt')
          .then((data) => data.text())
          .then((cert) => {
            console.log('[PrintService] Certificate loaded successfully')
            resolve(cert)
          })
          .catch((err) => {
            console.warn('[PrintService] Certificate file not found, using demo mode')
            console.warn('[PrintService] To remove permission prompts, add certificate to assets/signing/')
            resolve() // Will prompt for permission
          })
      })

      // Private key for signing
      qz.security.setSignatureAlgorithm('SHA512')
      qz.security.setSignaturePromise((toSign) => {
        return (resolve, reject) => {
          console.log('[PrintService] Signing request...')
          // Replace with your actual signing logic
          // For development, this will trigger permission dialog
          fetch('assets/signing/private-key.pem')
            .then((data) => data.text())
            .then((key) => {
              console.log('[PrintService] Private key loaded, signing...')
              // Use js-sha256 to sign
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
      console.error('[PrintService] Error details:', {
        message: error.message,
        stack: error.stack
      })
      this.connected = false
      throw new Error(
        'ไม่สามารถเชื่อมต่อกับ QZ Tray กรุณาตรวจสอบว่าเปิดโปรแกรม QZ Tray แล้ว'
      )
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
      } else {
        console.log('[PrintService] Already disconnected')
      }
    } catch (error) {
      console.error('[PrintService] ✗ Error disconnecting QZ Tray:', error)
    }
  }

  /**
   * Get list of available printers
   * @returns {Promise<Array<string>>} - Array of printer names
   */
  async getPrinters() {
    try {
      console.log('[PrintService] Getting list of printers...')
      if (!this.connected) {
        await this.connect()
      }
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
   * Auto-detect Honeywell printer
   * @returns {Promise<string|null>} - Printer name or null if not found
   */
  async detectHoneywellPrinter() {
    try {
      console.log('[PrintService] Auto-detecting Honeywell printer...')
      const printers = await this.getPrinters()

      console.log('[PrintService] Searching for Honeywell/PC42t printer...')
      // Search for Honeywell or PC42t in printer names
      const honeywellPrinter = printers.find(
        (printer) =>
          printer.toLowerCase().includes('honeywell') ||
          printer.toLowerCase().includes('pc42t') ||
          printer.toLowerCase().includes('pc42')
      )

      if (honeywellPrinter) {
        this.selectedPrinter = honeywellPrinter
        console.log('[PrintService] ✓ Honeywell printer detected:', honeywellPrinter)
        return honeywellPrinter
      }

      console.log('[PrintService] ⚠ Honeywell printer not found')
      // If no Honeywell found, use first printer
      if (printers.length > 0) {
        this.selectedPrinter = printers[0]
        console.log('[PrintService] ⚠ Using first available printer:', printers[0])
        return printers[0]
      }

      console.log('[PrintService] ✗ No printers found')
      return null
    } catch (error) {
      console.error('[PrintService] ✗ Error detecting Honeywell printer:', error)
      throw new Error('ไม่พบเครื่องพิมพ์ Honeywell')
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
   * Print data to selected printer
   * @param {string} data - ZPL command string
   * @param {string} printerName - Optional printer name (uses selectedPrinter if not provided)
   * @returns {Promise<void>}
   */
  async print(data, printerName = null) {
    try {
      console.log('[PrintService] ========== PRINT JOB START ==========')
      console.log('[PrintService] Print data length:', data.length, 'characters')
      console.log('[PrintService] ZPL Preview (first 200 chars):', data.substring(0, 200))

      if (!this.connected) {
        console.log('[PrintService] Not connected, connecting first...')
        await this.connect()
      }

      const printer = printerName || this.selectedPrinter
      console.log('[PrintService] Target printer:', printer)

      if (!printer) {
        console.error('[PrintService] ✗ No printer selected')
        throw new Error('ไม่ได้เลือกเครื่องพิมพ์')
      }

      console.log('[PrintService] Creating print config...')
      const config = qz.configs.create(printer)
      console.log('[PrintService] Config created:', config)

      const printData = [
        {
          type: 'raw',
          format: 'command',
          data: data
        }
      ]
      console.log('[PrintService] Print data prepared:', printData)

      console.log('[PrintService] Sending to printer...')
      await qz.print(config, printData)
      console.log('[PrintService] ✓ Print job sent successfully to:', printer)
      console.log('[PrintService] ========== PRINT JOB END ==========')
    } catch (error) {
      console.error('[PrintService] ========== PRINT JOB FAILED ==========')
      console.error('[PrintService] ✗ Print error:', error)
      console.error('[PrintService] Error message:', error.message)
      console.error('[PrintService] Error stack:', error.stack)
      console.error('[PrintService] ==========================================')
      throw new Error(`การพิมพ์ล้มเหลว: ${error.message}`)
    }
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
        await new Promise((resolve) => setTimeout(resolve, 200))
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
