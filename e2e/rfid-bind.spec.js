import { test, expect } from '@playwright/test'
import { installApiMocks } from './support/api-mocks.js'
import { seedAuth, FAKE_USER } from './support/auth.js'

// หน้าผูกแท็ก RFID ต่อเนื่อง — ผูกผิดชิ้น/ผูกซ้ำ = สต็อกกับแท็กไม่ตรงกัน ใช้เครื่องอ่านปลอม (navigator.bluetooth) + mock API ทั้งหมด

const EPC_1 = 'E2801160600002054CBA0001'
const EPC_2 = 'E2801160600002054CBA0002'
const EPC_X = 'E2801160600002054CBA0099'

const UNITS = [
  { unitId: 1, unitNo: 1, lotQty: 1, unitStatus: 'IN_STOCK', stockNumber: 'DK20H001', stockNumberOrigin: null, productCode: 'R1', productNumber: 'R1', productNameTh: 'แหวนทดสอบ 1', locationCode: 'A1' },
  { unitId: 2, unitNo: 1, lotQty: 1, unitStatus: 'RESERVED', stockNumber: 'DK20H002', stockNumberOrigin: 'OLD0002', productCode: 'R2', productNumber: 'R2', productNameTh: 'แหวนทดสอบ 2', locationCode: 'A1' },
  { unitId: 3, unitNo: 1, lotQty: 1, unitStatus: 'IN_STOCK', stockNumber: 'DK20H003', stockNumberOrigin: null, productCode: 'R3', productNumber: 'R3', productNameTh: 'แหวนทดสอบ 3', locationCode: 'A2' }
]

const PLAN_UNITS = [
  { unitId: 11, unitNo: 1, lotQty: 2, unitStatus: 'IN_STOCK', stockNumber: 'DK20H011', stockNumberOrigin: null, productCode: 'P1', productNumber: 'P1', productNameTh: 'แหวนแผน 1', locationCode: 'A1' },
  { unitId: 12, unitNo: 2, lotQty: 2, unitStatus: 'IN_STOCK', stockNumber: 'DK20H011', stockNumberOrigin: null, productCode: 'P1', productNumber: 'P1', productNameTh: 'แหวนแผน 1', locationCode: 'A1' }
]

// เครื่องอ่านปลอม: A500_TEST ที่ GATT service 0xFFF1 / char 0xFFF2 ส่งเฟรม inventory ตามโปรโตคอล A500
// ทดสอบสั่งว่าแท็กไหนอยู่บนถาดผ่าน window.__fakeTray.set([...]) (อยู่ใน init script ของเทสเท่านั้น ไม่ใช่โค้ดแอป)
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
    gatt: {
      connected: true,
      connect: async () => server,
      disconnect() {}
    },
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
    value: {
      requestDevice: async () => device,
      getDevices: async () => [device]
    }
  })
}

async function openPage(page, { initialBound = {} } = {}) {
  const bound = new Map(Object.entries(initialBound))
  const api = await installApiMocks(page, {
    'StockRfid/ListUnits': (request, { body }) =>
      body.wo
        ? { total: 2, items: body.wo === '6906025' && body.woNumber === 21 ? PLAN_UNITS : [] }
        : { total: 3, items: UNITS.filter((unit) => body.unitIds.includes(unit.unitId)) },
    'StockRfid/ResolveLabel': (request, { body }) => ({ items: UNITS.filter((unit) => unit.stockNumber === body.code) }),
    'StockRfid/GetByEpcs': (request, { body }) => {
      const items = []
      const notFound = []
      for (const epc of body.epcs) {
        if (bound.has(epc)) items.push({ epc, ...bound.get(epc) })
        else notFound.push(epc)
      }
      return { items, notFound }
    },
    'StockRfid/Bind': (request, { body }) => {
      bound.set(body.epc, { stockNumber: body.stockNumber, productCode: body.productCode, unitId: body.unitId, status: 'IN_STOCK', unitStatus: 'IN_STOCK' })
      return { id: 1, epc: body.epc, unitId: body.unitId }
    },
    'StockRfid/Unbind': (request, { body }) => {
      bound.delete(body.epc)
      return { unbound: true }
    }
  })
  await seedAuth(page, { permissions: ['dashboard', 'stock-rfid:view', 'stock-rfid:bind'] })
  await page.addInitScript(installFakeReader)
  await page.addInitScript(
    ({ key, units }) => localStorage.setItem(key, JSON.stringify(units)),
    { key: `rfid-bind-queue:${FAKE_USER.username}`, units: UNITS }
  )
  await page.goto('/stock/rfid-bind')
  await page.getByRole('button', { name: /กู้คิวเดิม 3 ชิ้น/ }).click()
  await expect(page.locator('.queue-row')).toHaveCount(3)
  await expect(page.locator('.bind-reader')).toContainText('A500_TEST')
  await expect(page.locator('.bind-reader')).toContainText('พร้อมผูก')
  api.bound = bound
  return api
}

const setTray = (page, epcs) => page.evaluate((list) => window.__fakeTray.set(list), epcs)
const bindCalls = (api) => api.callsTo('StockRfid/Bind')

test('แท็กใหม่ใบเดียว -> ผูกอัตโนมัติแล้วไปชิ้นถัดไป และแท็กที่ค้างถาดไม่ถูกผูกซ้ำ', async ({ page }) => {
  const api = await openPage(page)
  await expect(page.locator('.piece-card__no')).toHaveText('DK20H001')

  await setTray(page, [EPC_1])
  await expect.poll(() => bindCalls(api).length).toBe(1)
  expect(bindCalls(api)[0].body).toMatchObject({ epc: EPC_1, stockNumber: 'DK20H001', productCode: 'R1', unitId: 1 })

  // ชิ้นถัดไป: เลขเก่าเป็นเลขเด่น + ป้ายจองแล้ว
  await expect(page.locator('.piece-card__no')).toHaveText('OLD0002')
  await expect(page.locator('.piece-chip--reserved')).toBeVisible()

  // แท็กใบแรกค้างบนถาด ต้องไม่ผูกทับชิ้นที่ 2 และไม่ขึ้นเตือน
  await page.waitForTimeout(2000)
  expect(bindCalls(api)).toHaveLength(1)
  await expect(page.locator('.status-box')).toContainText('ติดแท็กแล้ววางบนถาดได้เลย')

  await setTray(page, [EPC_1, EPC_2])
  await expect.poll(() => bindCalls(api).length).toBe(2)
  expect(bindCalls(api)[1].body).toMatchObject({ epc: EPC_2, unitId: 2 })
  api.assertNoLeak()
})

test('แท็กใหม่ 2 ใบพร้อมกัน -> ไม่เรียก Bind จนเหลือใบเดียว', async ({ page }) => {
  const api = await openPage(page)

  await setTray(page, [EPC_1, EPC_2])
  await expect(page.locator('.status-box')).toContainText('ถาดมีแท็กใหม่ 2 ใบ')
  await page.waitForTimeout(2000)
  expect(bindCalls(api)).toHaveLength(0)

  await setTray(page, [EPC_2])
  await expect.poll(() => bindCalls(api).length).toBe(1)
  expect(bindCalls(api)[0].body.epc).toBe(EPC_2)
  api.assertNoLeak()
})

test('แท็กที่ผูกกับชิ้นอื่นอยู่แล้ว -> เตือนและไม่เรียก Bind', async ({ page }) => {
  const api = await openPage(page, {
    initialBound: { [EPC_X]: { stockNumber: 'DK99X999', productCode: 'ZZ', unitId: 99, status: 'IN_STOCK', unitStatus: 'IN_STOCK' } }
  })

  await setTray(page, [EPC_X])
  await expect(page.locator('.status-box')).toContainText('แท็กนี้ผูกกับ DK99X999 อยู่แล้ว')
  await page.waitForTimeout(2000)
  expect(bindCalls(api)).toHaveLength(0)

  await setTray(page, [])
  await expect(page.locator('.status-box')).toContainText('ติดแท็กแล้ววางบนถาดได้เลย')
  api.assertNoLeak()
})

test('เลิกผูกขณะแท็กยังอยู่บนถาด -> ไม่ผูกซ้ำ จนกว่าแท็กจะหายไปแล้ววางใหม่', async ({ page }) => {
  const api = await openPage(page)

  await setTray(page, [EPC_1])
  await expect.poll(() => bindCalls(api).length).toBe(1)

  await page.getByRole('button', { name: /เลิกผูกใบล่าสุด/ }).click()
  await expect.poll(() => api.callsTo('StockRfid/Unbind').length).toBe(1)
  await expect(page.locator('.piece-card__no')).toHaveText('DK20H001')

  // แท็กยังอยู่ -> ห้าม Bind ซ้ำ
  await page.waitForTimeout(2500)
  expect(bindCalls(api)).toHaveLength(1)

  // เอาแท็กออกจากถาดเกิน 1.5 วิ แล้ววางใหม่ -> ผูกได้อีกครั้ง
  await setTray(page, [])
  await page.waitForTimeout(2200)
  await setTray(page, [EPC_1])
  await expect.poll(() => bindCalls(api).length).toBe(2)
  api.assertNoLeak()
})

test('พิมพ์เลขแผน 6906025/21 ในช่องสแกน -> ชิ้นของแผนต่อท้ายคิวและกระโดดไปชิ้นแรกของแผน', async ({ page }) => {
  const api = await openPage(page)

  await page.locator('#rfid-bind-scan').fill('6906025/21')
  await page.locator('#rfid-bind-scan').press('Enter')

  await expect(page.locator('.queue-row')).toHaveCount(5)
  await expect(page.locator('.piece-card__no')).toHaveText('DK20H011')
  await expect(page.locator('.piece-banner')).toContainText('แผน 6906025/21')
  expect(api.callsTo('StockRfid/ListUnits').some((call) => call.body.wo === '6906025' && call.body.woNumber === 21 && call.body.tagStatus === 'unbound')).toBe(true)

  // แผนที่ไม่มี/ผูกครบ -> แจ้ง inline ไม่เพิ่มคิว
  await page.locator('#rfid-bind-scan').fill('1111111/1')
  await page.locator('#rfid-bind-scan').press('Enter')
  await expect(page.locator('.piece-banner')).toContainText('ไม่พบแผน 1111111/1')
  await expect(page.locator('.queue-row')).toHaveCount(5)
  api.assertNoLeak()
})

test('แท็กที่วางบนถาดอยู่แล้ว + สแกนแผนเปลี่ยนชิ้น -> ไม่ผูกกับชิ้นใหม่จนกว่าจะยกออกแล้ววางใหม่', async ({ page }) => {
  const api = await openPage(page)

  // ปิดผูกอัตโนมัติ เพื่อให้แท็กค้างบนถาดโดยไม่ถูกผูกกับชิ้นแรก
  await page.getByText('ผูกอัตโนมัติเมื่อเจอแท็ก').click()
  await setTray(page, [EPC_1])
  await expect(page.locator('.status-box__epc')).toContainText(EPC_1)

  await page.locator('#rfid-bind-scan').fill('6906025/21')
  await page.locator('#rfid-bind-scan').press('Enter')
  await expect(page.locator('.piece-card__no')).toHaveText('DK20H011')
  await page.getByText('ผูกอัตโนมัติเมื่อเจอแท็ก').click()

  await page.waitForTimeout(2500)
  expect(bindCalls(api)).toHaveLength(0)

  await setTray(page, [])
  await page.waitForTimeout(2200)
  await setTray(page, [EPC_1])
  await expect.poll(() => bindCalls(api).length).toBe(1)
  expect(bindCalls(api)[0].body).toMatchObject({ epc: EPC_1, unitId: 11 })
  api.assertNoLeak()
})

test('แท็กที่เคยผูกกับชิ้นอื่น แล้วถูกเลิกผูกจากที่อื่น -> ตรวจใหม่เมื่อหมดอายุ แล้วผูกกับชิ้นปัจจุบัน', async ({ page }) => {
  const api = await openPage(page, {
    initialBound: { [EPC_X]: { stockNumber: 'DK99X999', productCode: 'ZZ', unitId: 99, status: 'IN_STOCK', unitStatus: 'IN_STOCK' } }
  })

  await setTray(page, [EPC_X])
  await expect(page.locator('.status-box')).toContainText('แท็กนี้ผูกกับ DK99X999 อยู่แล้ว')
  expect(bindCalls(api)).toHaveLength(0)

  // ฝั่งอื่นเลิกผูกแท็กนี้ (แท็กยังค้างบนถาด)
  api.bound.delete(EPC_X)

  // ตรวจใหม่ได้ว่า free แต่แท็กยังค้างบนถาด -> ต้องไม่ผูกเอง
  await expect.poll(() => api.callsTo('StockRfid/GetByEpcs').length, { timeout: 15000 }).toBeGreaterThanOrEqual(2)
  await page.waitForTimeout(2000)
  expect(bindCalls(api)).toHaveLength(0)

  // ยกออกแล้ววางใหม่ -> ผูกกับชิ้นปัจจุบัน
  await setTray(page, [])
  await page.waitForTimeout(2200)
  await setTray(page, [EPC_X])
  await expect.poll(() => bindCalls(api).length, { timeout: 15000 }).toBe(1)
  expect(bindCalls(api)[0].body).toMatchObject({ epc: EPC_X, unitId: 1 })
  api.assertNoLeak()
})
