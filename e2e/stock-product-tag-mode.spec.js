import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth } from './support/auth.js'

// หน้าตรวจคลัง โหมดอ่านแท็ก — ตารางต้องกรองเหลือเฉพาะชิ้นที่อ่านได้ (ใช้ mock ทั้งหมด + เครื่องอ่านปลอม)

const EPC_1 = 'E2801160600002054CBA0001'
const EPC_X = 'E2801160600002054CBA0099'

const ROW = (stockNumber, productCode, tagTotalUnits, tagBoundUnits) => ({
  stockNumber,
  productCode,
  stockNumberOrigin: null,
  productNumber: productCode,
  productNameTh: `สินค้า ${stockNumber}`,
  qty: 1,
  tagTotalUnits,
  tagBoundUnits
})

const ALL_ROWS = [ROW('DK20H001', 'R1', 1, 1), ROW('DK20H002', 'R2', 2, 1), ROW('DK20H003', 'R3', 1, 0)]

function installFakeReader() {
  function crc16(bytes) {
    let crc = 0
    for (const b of bytes) {
      crc ^= b << 8
      for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x8005) & 0xffff : (crc << 1) & 0xffff
    }
    return crc
  }
  function escapeBytes(bytes) {
    const out = []
    for (const b of bytes) {
      if (b === 0x55) out.push(0x56, 0x56)
      else if (b === 0x56) out.push(0x56, 0x57)
      else out.push(b)
    }
    return out
  }
  function inventoryFrame(epcHex) {
    const epc = epcHex.match(/../g).map((h) => parseInt(h, 16))
    const body = [0x00, epc.length, ...epc, 0x01, 0xca]
    const len = 2 + body.length
    const core = [0x00, len >> 8, len & 0xff, 0x06, 0x02, ...body]
    const crc = crc16(core)
    return Uint8Array.from([0x55, ...escapeBytes([...core, crc >> 8, crc & 0xff])])
  }
  let reading = false
  let tags = []
  const listeners = {}
  const characteristic = {
    addEventListener(type, handler) {
      listeners[type] = handler
    },
    removeEventListener(type) {
      delete listeners[type]
    },
    async startNotifications() {},
    async writeValueWithoutResponse(bytes) {
      if (bytes[4] === 0x06 && bytes[5] === 0x02) reading = true
      else if (bytes[4] === 0x02 && bytes[5] === 0x12) reading = false
    }
  }
  const service = { getCharacteristic: async () => characteristic }
  const server = { getPrimaryService: async () => service }
  const device = {
    name: 'A500_TEST',
    gatt: { connected: true, connect: async () => server, disconnect() {} },
    addEventListener() {},
    removeEventListener() {}
  }
  setInterval(() => {
    if (!reading || !listeners.characteristicvaluechanged) return
    for (const epc of tags) {
      const bytes = inventoryFrame(epc)
      listeners.characteristicvaluechanged({ target: { value: new DataView(bytes.buffer) } })
    }
  }, 100)
  window.__fakeTray = {
    set(next) {
      tags = next
    }
  }
  Object.defineProperty(navigator, 'bluetooth', {
    configurable: true,
    value: { requestDevice: async () => device, getDevices: async () => [device] }
  })
}

test('โหมดอ่านแท็ก -> ตารางเหลือเฉพาะชิ้นที่อ่านได้ และไม่ยิง List ก่อนมีชิ้นที่รู้จัก', async ({ page }) => {
  const api = await installApiMocks(page, {
    'StockLocation/List': { data: [], total: 0 },
    'StockBalance/ByStockNumbers': [],
    'Master/MasterGold': [],
    'Master/MasterGoldSize': [],
    'Master/MasterGem': [],
    'Master/MasterProductType': [],
    'StockProduct/List': (request, { body }) => {
      const pieces = body.search?.pieces
      const data = pieces ? ALL_ROWS.filter((row) => pieces.some((p) => p.stockNumber === row.stockNumber && p.productCode === row.productCode)) : ALL_ROWS
      return { data, total: data.length }
    },
    'StockRfid/GetByEpcs': (request, { body }) => {
      const known = { [EPC_1]: { stockNumber: 'DK20H002', productCode: 'R2', status: 'IN_STOCK' } }
      const items = body.epcs.filter((epc) => known[epc]).map((epc) => ({ epc, ...known[epc] }))
      return { items, notFound: body.epcs.filter((epc) => !known[epc]) }
    }
  })
  await seedAuth(page, { permissions: ['dashboard', 'stock-product:view', 'stock-rfid:view'] })
  await page.addInitScript(installFakeReader)
  await page.goto('/stock-product-list')

  await page.getByRole('button', { name: /อ่านแท็ก/ }).click()
  await expect(page.locator('.reader-bar')).toContainText('A500_TEST')
  await expect(page.locator('.tag-mode-bar')).toContainText('กำลังกรองจากแท็ก')

  // ยังไม่มีแท็ก -> ไม่ยิง List
  await page.waitForTimeout(1000)
  expect(api.callsTo('StockProduct/List')).toHaveLength(0)

  await page.getByRole('button', { name: /เริ่มอ่าน/ }).click()
  await page.evaluate((list) => window.__fakeTray.set(list), [EPC_1, EPC_X])

  await expect(page.locator('.tag-mode-bar')).toContainText('อ่านได้ 2')
  await expect(page.locator('.tag-mode-bar')).toContainText('พบสินค้า 1')
  await expect(page.locator('.tag-mode-bar')).toContainText('ไม่รู้จัก 1')
  await expect(page.getByText('DK20H002').first()).toBeVisible()
  await expect(page.getByText('DK20H001')).toHaveCount(0)
  await expect(page.getByText('DK20H003')).toHaveCount(0)

  const calls = api.callsTo('StockProduct/List')
  expect(calls.length).toBeGreaterThan(0)
  for (const call of calls) expect(call.body.search.pieces).toEqual([{ stockNumber: 'DK20H002', productCode: 'R2' }])
  api.assertNoLeak()
})
