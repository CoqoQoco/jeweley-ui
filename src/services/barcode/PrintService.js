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
    this.usbDevice = null
    this.useUSB = false // Default to USB for label printers
    this.setupCertificate()
  }

  /**
   * Set printing method (USB or Network)
   * @param {boolean} useUSB - true for USB, false for network printing
   */
  setUseUSB(useUSB) {
    console.log('[PrintService] Setting print method to:', useUSB ? 'USB' : 'Network')
    this.useUSB = useUSB
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
            console.warn(
              '[PrintService] To remove permission prompts, add certificate to assets/signing/'
            )
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

  // PrintService.js:174 (ปรับปรุง)

  /**
   * Get USB devices
   * @returns {Promise<Array>} - Array of USB devices
   */
  async getUSBDevices() {
    try {
      console.log('[PrintService] Getting USB devices...')
      if (!this.connected) {
        await this.connect()
      }

      console.log('[PrintService] Calling qz.usb.listDevices()...')

      // **** การแก้ไข: ระบุ Object ที่มีคุณสมบัติที่ชัดเจน หรือระบุ options เป็น {}
      // เพื่อให้ QZ Tray ได้รับ JSON object ที่ถูกต้อง
      // หากเวอร์ชัน QZ Tray ของคุณรองรับ options: { includeHubs: true/false }
      // คุณควรระบุค่าเหล่านี้ แต่ถ้าต้องการแค่รายการอุปกรณ์ ให้ใช้ {} หรือ { includeHubs: false }

      // แทนที่จะใช้ try-catch ที่ซับซ้อน ให้ใช้การเรียกที่ปลอดภัยที่สุด
      const options = {}

      // ในบางเวอร์ชัน อาจต้องระบุค่าที่จำเป็น
      // const options = { includeHubs: false };

      // ใช้การเรียกเพียงครั้งเดียวด้วย Object ที่ชัดเจน
      const devices = await qz.usb.listDevices(options)

      // ลบส่วน try/catch เดิมที่พยายามเรียกแบบไม่มี options ออก

      console.log('[PrintService] ✓ Found USB devices:', devices)
      // ... โค้ดส่วนที่เหลือ
      return devices
    } catch (error) {
      // ... โค้ดส่วนที่เหลือ
      throw new Error('ไม่สามารถดึงรายการ USB devices ได้: ' + error.message)
    }
  }

  /**
   * Auto-detect Honeywell USB device
   * @returns {Promise<Object|null>} - USB device object or null if not found
   */
  async detectHoneywellUSB() {
    try {
      console.log('[PrintService] Auto-detecting Honeywell USB device...')
      const devices = await this.getUSBDevices()

      console.log('[PrintService] Searching for Honeywell/PC42t USB device...')
      // Search for Honeywell in USB devices (by vendor ID or product name)
      // Honeywell vendor ID is typically 0x0C2E
      const honeywellDevice = devices.find(
        (device) =>
          device.vendorId === 3118 || // 0x0C2E in decimal
          (device.manufacturer && device.manufacturer.toLowerCase().includes('honeywell')) ||
          (device.product && device.product.toLowerCase().includes('pc42'))
      )

      if (honeywellDevice) {
        this.usbDevice = honeywellDevice
        console.log('[PrintService] ✓ Honeywell USB device detected:', honeywellDevice)
        return honeywellDevice
      }

      console.log('[PrintService] ⚠ Honeywell USB device not found')
      // If no Honeywell found, use first USB device
      if (devices.length > 0) {
        this.usbDevice = devices[0]
        console.log('[PrintService] ⚠ Using first available USB device:', devices[0])
        return devices[0]
      }

      console.log('[PrintService] ✗ No USB devices found')
      return null
    } catch (error) {
      console.error('[PrintService] ✗ Error detecting Honeywell USB device:', error)
      throw new Error('ไม่พบเครื่องพิมพ์ Honeywell USB')
    }
  }

  /**
   * Auto-detect Honeywell printer (Network)
   * @returns {Promise<string|null>} - Printer name or null if not found
   */
  async detectHoneywellPrinter() {
    try {
      console.log('[PrintService] Auto-detecting Honeywell printer...')
      const printers = await this.getPrinters()

      console.log('[PrintService] Searching for Honeywell/PC42t printer...')
      // // Search for Honeywell or PC42t in printer names
      // const honeywellPrinter = printers.find(
      //   (printer) =>
      //     printer.toLowerCase().includes('honeywell') ||
      //     printer.toLowerCase().includes('pc42t') ||
      //     printer.toLowerCase().includes('pc42')
      // )

      // PrintService.js: detectHoneywellPrinter()
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
        throw new Error('ไม่พบเครื่องพิมพ์ Honeywell ในรายการเครื่องพิมพ์ทั่วไป')
        //return printers[0]
      }

      console.log('[PrintService] ✗ No USB devices found')
      return null
    } catch (error) {
      console.error('[PrintService] ✗ Error detecting Honeywell USB device:', error)
      throw new Error('ไม่พบเครื่องพิมพ์ Honeywell USB') // <--- เก็บ Error นี้ไว้
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
   * Print via USB (for label printers like Honeywell PC42t)
   * @param {string} data - EPL/ZPL command string
   * @param {Object} device - USB device object (optional, uses detected device if not provided)
   * @returns {Promise<void>}
   */
  async printUSB(data, device = null) {
    try {
      console.log('[PrintService] ========== USB PRINT JOB START ==========')
      console.log('[PrintService] Print data length:', data.length, 'characters')
      console.log('[PrintService] Command Preview (first 200 chars):', data.substring(0, 200))

      if (!this.connected) {
        console.log('[PrintService] Not connected, connecting first...')
        await this.connect()
      }

      const usbDevice = device || this.usbDevice
      console.log('[PrintService] Target USB device:', usbDevice)

      if (!usbDevice) {
        console.log('[PrintService] No USB device selected, auto-detecting...')
        await this.detectHoneywellUSB()
        if (!this.usbDevice) {
          console.error('[PrintService] ✗ No USB device found')
          throw new Error('ไม่พบเครื่องพิมพ์ USB')
        }
      }

      console.log('[PrintService] Claiming USB device...')
      await qz.usb.claimDevice(this.usbDevice)
      console.log('[PrintService] ✓ USB device claimed')

      console.log('[PrintService] Opening USB device...')
      await qz.usb.openDevice(this.usbDevice)
      console.log('[PrintService] ✓ USB device opened')

      console.log('[PrintService] Sending data to USB device...')
      // Convert string to bytes for USB transmission
      const encoder = new TextEncoder()
      const bytes = encoder.encode(data)
      console.log('[PrintService] Data encoded to', bytes.length, 'bytes')

      await qz.usb.sendData(this.usbDevice, bytes)
      console.log('[PrintService] ✓ Data sent successfully')

      console.log('[PrintService] Closing USB device...')
      await qz.usb.closeDevice(this.usbDevice)
      console.log('[PrintService] ✓ USB device closed')

      console.log('[PrintService] Releasing USB device...')
      await qz.usb.releaseDevice(this.usbDevice)
      console.log('[PrintService] ✓ USB device released')

      console.log('[PrintService] ========== USB PRINT JOB END ==========')
    } catch (error) {
      console.error('[PrintService] ========== USB PRINT JOB FAILED ==========')
      console.error('[PrintService] ✗ USB Print error:', error)
      console.error('[PrintService] Error message:', error.message)
      console.error('[PrintService] Error stack:', error.stack)
      console.error('[PrintService] ================================================')

      // Try to clean up on error
      try {
        if (this.usbDevice) {
          await qz.usb.closeDevice(this.usbDevice)
          await qz.usb.releaseDevice(this.usbDevice)
        }
      } catch (cleanupError) {
        console.error('[PrintService] Error during cleanup:', cleanupError)
      }

      throw new Error(`การพิมพ์ผ่าน USB ล้มเหลว: ${error.message}`)
    }
  }

  // /**
  //  * Print data to selected printer (Network printing)
  //  * @param {string} data - ZPL command string
  //  * @param {string} printerName - Optional printer name (uses selectedPrinter if not provided)
  //  * @returns {Promise<void>}
  //  */
  // async printNetwork(data, printerName = null) {
  //   try {
  //     console.log('[PrintService] ========== NETWORK PRINT JOB START ==========')
  //     console.log('[PrintService] Print data length:', data.length, 'characters')
  //     console.log('[PrintService] Command Preview (first 200 chars):', data.substring(0, 200))

  //     if (!this.connected) {
  //       console.log('[PrintService] Not connected, connecting first...')
  //       await this.connect()
  //     }

  //     const printer = printerName || this.selectedPrinter
  //     console.log('[PrintService] Target printer:', printer)

  //     if (!printer) {
  //       console.error('[PrintService] ✗ No printer selected')
  //       throw new Error('ไม่ได้เลือกเครื่องพิมพ์')
  //     }

  //     console.log('[PrintService] Creating print config...')
  //     const config = qz.configs.create(printer)
  //     console.log('[PrintService] Config created:', config)

  //     const printData = [
  //       {
  //         type: 'raw',
  //         format: 'command',
  //         data: data
  //       }
  //     ]
  //     console.log('[PrintService] Print data prepared:', printData)

  //     console.log('[PrintService] Sending to printer...')
  //     await qz.print(config, printData)
  //     console.log('[PrintService] ✓ Print job sent successfully to:', printer)
  //     console.log('[PrintService] ========== NETWORK PRINT JOB END ==========')
  //   } catch (error) {
  //     console.error('[PrintService] ========== NETWORK PRINT JOB FAILED ==========')
  //     console.error('[PrintService] ✗ Print error:', error)
  //     console.error('[PrintService] Error message:', error.message)
  //     console.error('[PrintService] Error stack:', error.stack)
  //     console.error('[PrintService] =================================================')
  //     throw new Error(`การพิมพ์ล้มเหลว: ${error.message}`)
  //   }
  // }

  // ใน PrintService.js ภายในเมธอด printNetwork(data, printerName)
  // async printNetwork(printData, printerName) {
  //   if (!this.connected) {
  //     await this.connect()
  //   }

  //   // 1. ตรวจจับและเลือกชื่อเครื่องพิมพ์ที่ถูกต้อง
  //   const finalPrinterName = printerName || (await this.detectHoneywellPrinter()) // ต้องมั่นใจว่าเมธอดนี้คืนค่า 'Honeywell PC42t (203 dpi) - DP'

  //   if (!finalPrinterName) {
  //     throw new Error('ไม่พบเครื่องพิมพ์ Honeywell ในรายการเครื่องพิมพ์ทั่วไป')
  //   }

  //   console.log(`[PrintService] Sending raw data to printer: ${finalPrinterName}`)

  //   try {
  //     // 2. สร้าง Configuration Object ด้วยชื่อเครื่องพิมพ์ (Local/Network)
  //     const config = qz.configs.create(finalPrinterName)

  //     // 3. เรียกใช้ qz.print() เพื่อส่งคำสั่ง Raw Data
  //     await qz.print(config, printData)

  //     console.log('[PrintService] Print job sent successfully.')
  //     return true
  //   } catch (error) {
  //     console.error('[PrintService] Error during qz.print:', error)
  //     throw new Error('เกิดข้อผิดพลาดในการส่งงานพิมพ์: ' + error.message)
  //   }
  // }

  // ใน PrintService.js ภายในเมธอด printNetwork(data, printerName)
  async printNetwork(data, printerName) {
    // เปลี่ยนชื่อตัวแปร printData เป็น data เพื่อให้สอดคล้องกับโค้ดต้นฉบับ
    if (!this.connected) {
      await this.connect()
    }

    // 1. ตรวจจับและเลือกชื่อเครื่องพิมพ์ที่ถูกต้อง
    const finalPrinterName = printerName || (await this.detectHoneywellPrinter())

    if (!finalPrinterName) {
      throw new Error('ไม่พบเครื่องพิมพ์ Honeywell ในรายการเครื่องพิมพ์ทั่วไป')
    }

    console.log(`[PrintService] Sending raw data to printer: ${finalPrinterName}`)

    try {
      // 2. สร้าง Configuration Object ด้วยชื่อเครื่องพิมพ์ (Local/Network)
      const config = qz.configs.create(finalPrinterName)

      // **** แก้ไขโค้ดส่วนนี้เพื่อให้ข้อมูลอยู่ในรูปแบบ JSONArray ****
      const printDataArray = [
        {
          type: 'raw',
          format: 'command', // format เป็น 'command' สำหรับ ZPL/EPL
          data: data // data คือ String คำสั่ง EPL/ZPL
        }
      ]
      // ************************************************************

      // 3. เรียกใช้ qz.print() เพื่อส่งคำสั่ง Raw Data
      await qz.print(config, printDataArray) // ส่ง printDataArray แทน data (String)

      console.log('[PrintService] Print job sent successfully.')
      return true
    } catch (error) {
      console.error('[PrintService] Error during qz.print:', error)
      throw new Error('เกิดข้อผิดพลาดในการส่งงานพิมพ์: ' + error.message)
    }
  }

  /**
   * Print data (auto-select USB or Network based on useUSB setting)
   * @param {string} data - EPL/ZPL command string
   * @param {string|Object} target - Printer name (network) or USB device (usb)
   * @returns {Promise<void>}
   */
  async print(data, target = null) {
    console.log('[PrintService] Print method:', this.useUSB ? 'USB' : 'Network')
    if (this.useUSB) {
      return await this.printUSB(data, target)
    } else {
      return await this.printNetwork(data, target)
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
