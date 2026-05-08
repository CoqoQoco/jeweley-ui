export class WebUsbPrinter {
  constructor() {
    this.device = null
    this.endpointOut = null
    this.interfaceNumber = null
  }

  static isSupported() {
    return typeof navigator !== 'undefined' && 'usb' in navigator
  }

  async requestAndConnect() {
    if (!WebUsbPrinter.isSupported()) {
      throw new Error('WebUSB ไม่รองรับ — ใช้ Chrome/Edge บน HTTPS หรือ localhost เท่านั้น')
    }
    let device
    try {
      device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x04b8 },
          { vendorId: 0x067b },
          { vendorId: 0x0403 },
          { classCode: 7 }
        ]
      })
    } catch (err) {
      if (err.name === 'NotFoundError') {
        const e = new Error('ยังไม่ได้เลือกเครื่องพิมพ์')
        e.name = 'UserCancelled'
        throw e
      }
      if (err.name === 'SecurityError') {
        throw new Error('Browser ไม่อนุญาต WebUSB — ต้องใช้ HTTPS หรือ localhost')
      }
      throw err
    }
    this.device = device
    await this.device.open()
    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1)
    }
    const iface = this.device.configuration.interfaces.find((i) =>
      i.alternates[0].endpoints.some((e) => e.direction === 'out')
    )
    if (!iface) throw new Error('ไม่พบ USB endpoint สำหรับเขียนข้อมูล')
    this.interfaceNumber = iface.interfaceNumber
    await this.device.claimInterface(this.interfaceNumber)
    const epOut = iface.alternates[0].endpoints.find((e) => e.direction === 'out')
    this.endpointOut = epOut.endpointNumber
    console.log('[WebUSB] Connected device:', {
      vendorId: '0x' + this.device.vendorId.toString(16).padStart(4, '0'),
      productId: '0x' + this.device.productId.toString(16).padStart(4, '0'),
      manufacturerName: this.device.manufacturerName,
      productName: this.device.productName,
      serialNumber: this.device.serialNumber,
      interfaces: this.device.configuration?.interfaces.map((i) => ({
        interfaceNumber: i.interfaceNumber,
        interfaceClass: i.alternates[0].interfaceClass,
        endpoints: i.alternates[0].endpoints.map((e) => ({
          endpointNumber: e.endpointNumber,
          direction: e.direction,
          type: e.type,
          packetSize: e.packetSize
        }))
      }))
    })
    console.log('[WebUSB] Selected interface:', this.interfaceNumber, 'endpoint OUT:', this.endpointOut)
  }

  async send(bytes) {
    if (!this.device) throw new Error('ยังไม่ได้เชื่อมต่อเครื่องพิมพ์')
    const CHUNK = 64
    for (let i = 0; i < bytes.length; i += CHUNK) {
      await this.device.transferOut(this.endpointOut, bytes.slice(i, i + CHUNK))
    }
  }

  async disconnect() {
    if (!this.device) return
    try {
      if (this.interfaceNumber !== null) {
        await this.device.releaseInterface(this.interfaceNumber)
      }
      await this.device.close()
    } catch (e) {
      // ignore disconnect errors
    }
    this.device = null
    this.endpointOut = null
    this.interfaceNumber = null
  }
}
