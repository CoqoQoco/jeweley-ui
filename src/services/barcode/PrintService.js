import qz from 'qz-tray'

/**
 * PrintService - Service for managing QZ Tray printer connections
 * Handles connection, printer detection, and print job management
 */
class PrintService {
  constructor() {
    this.connected = false
    this.selectedPrinter = null
  }

  /**
   * Connect to QZ Tray
   * @returns {Promise<boolean>} - Connection status
   */
  async connect() {
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect()
        this.connected = true
        console.log('QZ Tray connected successfully')
        return true
      }
      this.connected = true
      return true
    } catch (error) {
      console.error('Failed to connect to QZ Tray:', error)
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
      if (qz.websocket.isActive()) {
        await qz.websocket.disconnect()
        this.connected = false
        console.log('QZ Tray disconnected')
      }
    } catch (error) {
      console.error('Error disconnecting QZ Tray:', error)
    }
  }

  /**
   * Get list of available printers
   * @returns {Promise<Array<string>>} - Array of printer names
   */
  async getPrinters() {
    try {
      if (!this.connected) {
        await this.connect()
      }
      const printers = await qz.printers.find()
      return printers
    } catch (error) {
      console.error('Error getting printers:', error)
      throw new Error('ไม่สามารถดึงรายชื่อเครื่องพิมพ์ได้')
    }
  }

  /**
   * Auto-detect Honeywell printer
   * @returns {Promise<string|null>} - Printer name or null if not found
   */
  async detectHoneywellPrinter() {
    try {
      const printers = await this.getPrinters()

      // Search for Honeywell or PC42t in printer names
      const honeywellPrinter = printers.find(
        (printer) =>
          printer.toLowerCase().includes('honeywell') ||
          printer.toLowerCase().includes('pc42t') ||
          printer.toLowerCase().includes('pc42')
      )

      if (honeywellPrinter) {
        this.selectedPrinter = honeywellPrinter
        console.log('Honeywell printer detected:', honeywellPrinter)
        return honeywellPrinter
      }

      // If no Honeywell found, use first printer
      if (printers.length > 0) {
        this.selectedPrinter = printers[0]
        console.log('Using first available printer:', printers[0])
        return printers[0]
      }

      return null
    } catch (error) {
      console.error('Error detecting Honeywell printer:', error)
      throw new Error('ไม่พบเครื่องพิมพ์ Honeywell')
    }
  }

  /**
   * Set selected printer
   * @param {string} printerName - Name of the printer
   */
  setSelectedPrinter(printerName) {
    this.selectedPrinter = printerName
  }

  /**
   * Print data to selected printer
   * @param {string} data - ZPL command string
   * @param {string} printerName - Optional printer name (uses selectedPrinter if not provided)
   * @returns {Promise<void>}
   */
  async print(data, printerName = null) {
    try {
      if (!this.connected) {
        await this.connect()
      }

      const printer = printerName || this.selectedPrinter

      if (!printer) {
        throw new Error('ไม่ได้เลือกเครื่องพิมพ์')
      }

      const config = qz.configs.create(printer)
      const printData = [
        {
          type: 'raw',
          format: 'command',
          data: data
        }
      ]

      await qz.print(config, printData)
      console.log('Print job sent successfully to:', printer)
    } catch (error) {
      console.error('Print error:', error)
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
    const results = []

    for (let i = 0; i < dataArray.length; i++) {
      try {
        await this.print(dataArray[i], printerName)
        results.push({ success: true, index: i })

        // Add small delay between prints
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        results.push({ success: false, index: i, error: error.message })
      }
    }

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
