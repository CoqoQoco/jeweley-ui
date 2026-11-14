/**
 * transport-hid — เชื่อมเครื่องอ่าน A500 ผ่าน WebHID (USB, Chrome/Edge)
 * ส่ง: sendReport(0, 64 ไบต์) ไบต์แรก = ความยาว chunk (≤ 63) ตามด้วยข้อมูล
 * รับ: inputreport 64 ไบต์ ไบต์แรก = ความยาว payload ตามด้วยข้อมูล
 */
export const HID_VENDOR_ID = 0x1a86
export const HID_PRODUCT_ID = 0xe429
const HID_REPORT_SIZE = 64
const HID_CHUNK = HID_REPORT_SIZE - 1

export function createHidTransport() {
  let device = null
  let dataCallback = () => {}
  let disconnectCallback = () => {}

  function handleReport(event) {
    const view = event.data
    const raw = new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
    const length = Math.min(raw[0], HID_CHUNK)
    dataCallback(raw.slice(1, 1 + length))
  }

  function handleHidDisconnect(event) {
    if (event.device !== device) return
    detach()
    disconnectCallback()
  }

  async function attach(selected) {
    device = selected
    if (!device.opened) await device.open()
    device.addEventListener('inputreport', handleReport)
    navigator.hid.addEventListener('disconnect', handleHidDisconnect)
  }

  function detach() {
    if (device) device.removeEventListener('inputreport', handleReport)
    if (typeof navigator !== 'undefined' && navigator.hid) {
      navigator.hid.removeEventListener('disconnect', handleHidDisconnect)
    }
  }

  const filters = [{ vendorId: HID_VENDOR_ID, productId: HID_PRODUCT_ID }]

  return {
    kind: 'hid',

    get deviceName() {
      return device?.productName || ''
    },

    isSupported() {
      return typeof navigator !== 'undefined' && !!navigator.hid
    },

    async connect() {
      const [selected] = await navigator.hid.requestDevice({ filters })
      if (!selected) throw new Error('No device selected')
      await attach(selected)
    },

    // ต่อกลับกับเครื่องที่เคยอนุญาตแล้ว — คืน false ถ้าไม่มี
    async reconnect() {
      const devices = await navigator.hid.getDevices()
      const known = devices.find((d) => d.vendorId === HID_VENDOR_ID && d.productId === HID_PRODUCT_ID)
      if (!known) return false
      await attach(known)
      return true
    },

    async write(bytes) {
      if (!device) throw new Error('HID not connected')
      for (let i = 0; i < bytes.length; i += HID_CHUNK) {
        const chunk = bytes.slice(i, i + HID_CHUNK)
        const report = new Uint8Array(HID_REPORT_SIZE)
        report[0] = chunk.length
        report.set(chunk, 1)
        await device.sendReport(0, report)
      }
    },

    onData(callback) {
      dataCallback = callback
    },

    onDisconnect(callback) {
      disconnectCallback = callback
    },

    async disconnect() {
      const current = device
      detach()
      device = null
      if (current?.opened) await current.close()
    }
  }
}
