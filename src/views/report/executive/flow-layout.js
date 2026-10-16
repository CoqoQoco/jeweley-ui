// flow-layout.js — รูปทรง/ตำแหน่งคงที่ของฉาก Flow 3D (ไม่มีตัวเลขข้อมูลอยู่ที่นี่ — ตัวเลขทุกตัวมาจาก API)
// พิกัดพอร์ตจากต้นแบบ flow3d.html: หน่วยเป็นหน่วยโลกของ three.js, x = ซ้าย→ขวา, z = หน้า→หลัง

export const ZONE_IDS = ['z-mold', 'z-prod', 'z-recv', 'z-stock', 'z-mat', 'z-sales']

// zone id ในฉาก → ชื่อ zone ของ API (FlowZone body.zone / FlowBoard.trust[].zone)
export const ZONE_API = {
  'z-mold': 'mold',
  'z-prod': 'production',
  'z-recv': 'receive',
  'z-stock': 'stock',
  'z-mat': 'material',
  'z-sales': 'sales'
}

export const API_ZONES = Object.values(ZONE_API)

export const ZONE_CODE = {
  'z-mold': 'Z1 · MOLD',
  'z-prod': 'Z2 · PRODUCTION',
  'z-recv': 'Z3 · RECEIVE',
  'z-stock': 'Z4 · STOCK',
  'z-mat': 'Z5 · MATERIAL',
  'z-sales': 'Z6 · SALES'
}

// tone 1..3 = เฉดพื้นโซน, d = ระยะกล้องตอนบินเข้าโซน
export const SCENE_ZONES = [
  { id: 'z-mold', x0: -3.6, x1: 23.2, z0: -3.4, z1: 9.9, tone: 1, d: 34 },
  { id: 'z-prod', x0: -3.6, x1: 23.2, z0: 14.0, z1: 27.3, tone: 2, d: 36 },
  { id: 'z-recv', x0: -3.6, x1: 10.2, z0: 30.0, z1: 36.9, tone: 3, d: 26 },
  { id: 'z-stock', x0: 13.6, x1: 44.9, z0: 30.0, z1: 36.9, tone: 1, d: 36 },
  { id: 'z-mat', x0: 28.6, x1: 42.9, z0: 14.0, z1: 21.0, tone: 3, d: 28 },
  { id: 'z-sales', x0: 13.6, x1: 40.3, z0: 41.0, z1: 48.0, tone: 2, d: 32 }
].map((z) => ({ ...z, cx: (z.x0 + z.x1) / 2, cz: (z.z0 + z.z1) / 2 }))

export const ZONE_BOUNDS = Object.fromEntries(SCENE_ZONES.map((z) => [z.id, z]))

export const OVERVIEW_TARGET = [20.5, 0, 22.5]
export const OVERVIEW_DISTANCE = 92
export const FLOOR = { w: 90, d: 80, cx: 20.5, cz: 22.5 }

const PAD_W = 4.6
const PAD_D = 3.8

// แผนกแม่พิมพ์ — status ตรงกับ FlowZone mold.stages[].status
export const MOLD_STATIONS = [
  { id: 'm-design', status: 10, pos: [0, 0] },
  { id: 'm-resin', status: 20, pos: [6.5, 0] },
  { id: 'm-silver', status: 30, pos: [13, 0] },
  { id: 'm-trim', status: 40, pos: [13, 6.4] },
  { id: 'm-cut', status: 50, pos: [6.5, 6.4] },
  { id: 'm-store', status: 60, pos: [0, 6.4] },
  { id: 'm-melt', status: 500, pos: [19.5, 6.4] }
]

// แผนกผลิต — key ตรงกับ FlowZone production.departments[].key
export const PROD_STATIONS = [
  { id: 'p-design', key: 'design', pos: [0, 17.4] },
  { id: 'p-trim', key: 'trim', pos: [6.5, 17.4] },
  { id: 'p-raw', key: 'rawPolish', pos: [13, 17.4] },
  { id: 'p-gem', key: 'gemSort', pos: [19.5, 17.4] },
  { id: 'p-set', key: 'setting', pos: [19.5, 23.8] },
  { id: 'p-plate', key: 'plating', pos: [13, 23.8] },
  { id: 'p-cost', key: 'costCard', pos: [6.5, 23.8] }
]

export const STOCK_PAD_COUNT = 6

export const STATIONS = [
  ...MOLD_STATIONS.map((s) => ({ id: s.id, zone: 'z-mold', kind: 'moldDept', status: s.status, pos: [s.pos[0], 0, s.pos[1]], w: PAD_W, d: PAD_D })),
  ...PROD_STATIONS.map((s) => ({ id: s.id, zone: 'z-prod', kind: 'prodDept', key: s.key, pos: [s.pos[0], 0, s.pos[1]], w: PAD_W, d: PAD_D })),
  { id: 'recv', zone: 'z-recv', kind: 'recv', pos: [6.5, 0, 33.2], w: PAD_W, d: PAD_D },
  ...Array.from({ length: STOCK_PAD_COUNT }, (_, slot) => ({
    id: `sk${slot}`,
    zone: 'z-stock',
    kind: 'stockPad',
    slot,
    pos: [17.2 + 4.9 * slot, 0, 33.2],
    w: 4.2,
    d: PAD_D
  })),
  { id: 'mat-gold', zone: 'z-mat', kind: 'mat', pos: [32.5, 0, 17.4], w: PAD_W, d: PAD_D },
  { id: 'mat-gem', zone: 'z-mat', kind: 'mat', pos: [39.0, 0, 17.4], w: PAD_W, d: PAD_D },
  { id: 'sale-quote', zone: 'z-sales', kind: 'sales', pos: [17.2, 0, 44.4], w: PAD_W, d: PAD_D },
  { id: 'sale-so', zone: 'z-sales', kind: 'sales', pos: [23.7, 0, 44.4], w: PAD_W, d: PAD_D },
  { id: 'sale-inv', zone: 'z-sales', kind: 'sales', pos: [30.2, 0, 44.4], w: PAD_W, d: PAD_D },
  { id: 'sale-pay', zone: 'z-sales', kind: 'sales', pos: [36.7, 0, 44.4], w: PAD_W, d: PAD_D }
]

export const STATION_BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s]))
export const STATION_IDS = STATIONS.map((s) => s.id)

// ประตู: [id, ตำแหน่ง x, ตำแหน่ง z]
export const GATES = [
  { id: 'A', pos: [0, 11.9] },
  { id: 'B', pos: [6.5, 28.6] },
  { id: 'C', pos: [24.5, 38.9] }
]

const HW = 2.3
const HD = 1.9

// สายพาน [x1, z1, x2, z2, จำนวนลูกบาศก์วิ่ง]
export const BELTS = [
  // แม่พิมพ์: แถวบน ซ้าย→ขวา ลงที่ x=13 แถวล่าง ขวา→ซ้าย
  [HW, 0, 6.5 - HW, 0],
  [6.5 + HW, 0, 13 - HW, 0],
  [13, HD, 13, 6.4 - HD],
  [13 - HW, 6.4, 6.5 + HW, 6.4],
  [6.5 - HW, 6.4, HW, 6.4],
  [19.5 - HW, 6.4, 13 + HW, 6.4],
  // gate A: จัดเก็บพิมพ์ → ออกแบบ
  [0, 6.4 + HD, 0, 17.4 - HD, 2],
  // ผลิต: เลน 1 ซ้าย→ขวา สลับเลน เลน 2 ขวา→ซ้าย
  [HW, 17.4, 6.5 - HW, 17.4],
  [6.5 + HW, 17.4, 13 - HW, 17.4],
  [13 + HW, 17.4, 19.5 - HW, 17.4],
  [19.5, 17.4 + HD, 19.5, 23.8 - HD],
  [19.5 - HW, 23.8, 13 + HW, 23.8],
  [13 - HW, 23.8, 6.5 + HW, 23.8],
  // gate B: บัตรต้นทุน → รับสินค้า → คลัง; gate C: คลัง → งานขาย
  [6.5, 23.8 + HD, 6.5, 33.2 - HD, 2],
  [6.5 + HW, 33.2, 17.2 - 2.1, 33.2],
  [24.5, 33.2 + HD, 24.5, 44.4 - HD, 2],
  // วัตถุดิบป้อนสายผลิต
  [32.5 - HW, 17.4, 19.5 + HW, 17.4, 2],
  // งานขาย
  [17.2 + HW, 44.4, 23.7 - HW, 44.4],
  [23.7 + HW, 44.4, 30.2 - HW, 44.4]
]

// role ของสีในฉาก → CSS custom property (อ่านค่าจริงตอน runtime เพื่อไม่ฝังสี)
export const SCENE_TOKENS = {
  floor: '--status-closed-bg',
  pad: '--color-card-bg',
  zt1: '--color-card-bg',
  zt2: '--color-green-bg',
  zt3: '--color-highlight-bg',
  dark: '--base-sub-color',
  b1: '--base-green',
  b2: '--base-sub-color',
  b3: '--color-border',
  warn: '--base-warning',
  sel: '--base-font-color',
  line: '--color-border'
}

export const LENS_KEYS = ['default', 'time', 'worker', 'trust']
export const COMPARE_KEYS = ['gold', 'size', 'ptype']
export const STOCK_LENS_KEYS = ['sloc', 'gold', 'size', 'type', 'age']

// ความมั่นใจของแต่ละ tile ในกระดานผู้บริหาร (ค่าบรรณาธิการ ไม่ใช่ข้อมูล)
export const TILE_CONFIDENCE = {
  flow: 'med',
  loss: 'med',
  notReturned: 'low',
  sales: 'med',
  mix: 'low',
  trust: 'high'
}

// tile → [zone/สถานี, lens, compare] ที่ตั้งเมื่อกด
export const TILE_TARGET = {
  flow: ['z-prod', 'time', ''],
  loss: ['z-prod', 'worker', ''],
  notReturned: ['z-prod', 'default', ''],
  sales: ['z-sales', 'time', ''],
  mix: ['z-stock', 'default', 'ptype'],
  trust: ['all', 'trust', '']
}
