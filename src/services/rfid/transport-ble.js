/**
 * transport-ble — เชื่อมเครื่องอ่าน A500 ผ่าน Web Bluetooth (Chrome/Edge)
 * service 0xFFF1 / characteristic 0xFFF2 ตัวเดียว ใช้ทั้งเขียน (without response, ทีละ ≤ 20 ไบต์) และ notify
 */
export const BLE_SERVICE = 0xfff1
export const BLE_CHARACTERISTIC = 0xfff2
export const BLE_NAME_PREFIX = 'A500'
const BLE_CHUNK = 20

export function createBleTransport() {
  let device = null
  let characteristic = null
  let dataCallback = () => {}
  let disconnectCallback = () => {}

  function handleValue(event) {
    const view = event.target.value
    dataCallback(new Uint8Array(view.buffer, view.byteOffset, view.byteLength))
  }

  function handleGattDisconnect() {
    characteristic = null
    disconnectCallback()
  }

  async function attach(selected) {
    device = selected
    device.addEventListener('gattserverdisconnected', handleGattDisconnect)
    try {
      const server = await device.gatt.connect()
      const service = await server.getPrimaryService(BLE_SERVICE)
      characteristic = await service.getCharacteristic(BLE_CHARACTERISTIC)
      characteristic.addEventListener('characteristicvaluechanged', handleValue)
      await characteristic.startNotifications()
    } catch (error) {
      const gatt = device.gatt
      detach()
      if (gatt?.connected) gatt.disconnect()
      device = null
      throw error
    }
  }

  function detach() {
    if (characteristic) characteristic.removeEventListener('characteristicvaluechanged', handleValue)
    if (device) device.removeEventListener('gattserverdisconnected', handleGattDisconnect)
    characteristic = null
  }

  return {
    kind: 'ble',

    get deviceName() {
      return device?.name || ''
    },

    isSupported() {
      return typeof navigator !== 'undefined' && !!navigator.bluetooth
    },

    async connect() {
      const selected = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: BLE_NAME_PREFIX }],
        optionalServices: [BLE_SERVICE]
      })
      await attach(selected)
    },

    // ต่อกลับกับเครื่องที่เคยอนุญาตแล้ว — คืน false ถ้าไม่มี (หรือเบราว์เซอร์ไม่รองรับ getDevices)
    async reconnect() {
      if (!navigator.bluetooth?.getDevices) return false
      const devices = await navigator.bluetooth.getDevices()
      const known = devices.find((d) => d.name && d.name.startsWith(BLE_NAME_PREFIX))
      if (!known) return false
      await attach(known)
      return true
    },

    async write(bytes) {
      if (!characteristic) throw new Error('BLE not connected')
      for (let i = 0; i < bytes.length; i += BLE_CHUNK) {
        await characteristic.writeValueWithoutResponse(bytes.slice(i, i + BLE_CHUNK))
      }
    },

    onData(callback) {
      dataCallback = callback
    },

    onDisconnect(callback) {
      disconnectCallback = callback
    },

    disconnect() {
      const gatt = device?.gatt
      detach()
      if (gatt?.connected) gatt.disconnect()
      device = null
    }
  }
}
