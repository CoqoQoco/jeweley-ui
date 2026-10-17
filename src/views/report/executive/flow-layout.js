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

// ระยะเลื่อนของแต่ละโซนจากผังตั้งต้น [x, z] — โซนถูกแยกห่างกันให้เห็นเป็นอาคารคนละหลัง (สายพาน/ประตูคำนวณตามสถานี)
export const ZONE_OFFSET = {
  'z-mold': [0, 0],
  'z-prod': [0, 6],
  'z-mat': [6, 6],
  'z-recv': [0, 13],
  'z-stock': [4, 13],
  'z-sales': [44.4, 1.8]
}

// tone 1..3 = เฉดพื้นโซน, d = ระยะกล้องตอนบินเข้าโซน (ขอบเขตก่อนเลื่อนตาม ZONE_OFFSET)
export const SCENE_ZONES = [
  { id: 'z-mold', x0: -3.6, x1: 23.2, z0: -3.4, z1: 9.9, tone: 1, d: 34 },
  { id: 'z-prod', x0: -3.6, x1: 23.2, z0: 14.0, z1: 27.3, tone: 2, d: 36 },
  { id: 'z-recv', x0: -3.6, x1: 10.2, z0: 30.0, z1: 36.9, tone: 3, d: 26 },
  { id: 'z-stock', x0: 13.6, x1: 44.9, z0: 28.6, z1: 36.9, tone: 1, d: 36 },
  { id: 'z-mat', x0: 28.6, x1: 42.9, z0: 14.0, z1: 22.6, tone: 3, d: 28 },
  { id: 'z-sales', x0: 13.6, x1: 40.3, z0: 41.0, z1: 50.0, tone: 2, d: 32 }
].map((z) => {
  const [ox, oz] = ZONE_OFFSET[z.id]
  const x0 = z.x0 + ox
  const x1 = z.x1 + ox
  const z0 = z.z0 + oz
  const z1 = z.z1 + oz
  return { ...z, x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2 }
})

export const ZONE_BOUNDS = Object.fromEntries(SCENE_ZONES.map((z) => [z.id, z]))

export const OVERVIEW_TARGET = [40.5, 0, 24.3]
export const OVERVIEW_DISTANCE = 88
export const FLOOR = { w: 170, d: 140, cx: 42, cz: 28 }

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

const shifted = (zone, [x, z]) => [x + ZONE_OFFSET[zone][0], 0, z + ZONE_OFFSET[zone][1]]

export const STATIONS = [
  ...MOLD_STATIONS.map((s) => ({ id: s.id, zone: 'z-mold', kind: 'moldDept', status: s.status, pos: shifted('z-mold', s.pos), w: PAD_W, d: PAD_D })),
  ...PROD_STATIONS.map((s) => ({ id: s.id, zone: 'z-prod', kind: 'prodDept', key: s.key, pos: shifted('z-prod', s.pos), w: PAD_W, d: PAD_D })),
  { id: 'recv', zone: 'z-recv', kind: 'recv', pos: shifted('z-recv', [6.5, 33.2]), w: PAD_W, d: PAD_D },
  ...Array.from({ length: STOCK_PAD_COUNT }, (_, slot) => ({
    id: `sk${slot}`,
    zone: 'z-stock',
    kind: 'stockPad',
    slot,
    pos: shifted('z-stock', [17.2 + 4.9 * slot, 33.2]),
    w: 4.2,
    d: PAD_D
  })),
  { id: 'mat-gold', zone: 'z-mat', kind: 'mat', pos: shifted('z-mat', [32.5, 17.4]), w: PAD_W, d: PAD_D },
  { id: 'mat-gem', zone: 'z-mat', kind: 'mat', pos: shifted('z-mat', [39.0, 17.4]), w: PAD_W, d: PAD_D },
  { id: 'sale-quote', zone: 'z-sales', kind: 'sales', pos: shifted('z-sales', [17.2, 44.4]), w: PAD_W, d: PAD_D },
  { id: 'sale-so', zone: 'z-sales', kind: 'sales', pos: shifted('z-sales', [23.7, 44.4]), w: PAD_W, d: PAD_D },
  { id: 'sale-inv', zone: 'z-sales', kind: 'sales', pos: shifted('z-sales', [30.2, 44.4]), w: PAD_W, d: PAD_D },
  { id: 'sale-pay', zone: 'z-sales', kind: 'sales', pos: shifted('z-sales', [36.7, 44.4]), w: PAD_W, d: PAD_D }
]

export const STATION_BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s]))
export const STATION_IDS = STATIONS.map((s) => s.id)

const padRadius = (st) => (Math.min(st.w, st.d) / 2) * 1.08

// สายพานเชื่อมสถานีตามลำดับงาน — [จาก, ไปยัง]; ปลายสายพานเว้นรัศมีแท่นของแต่ละสถานี
const BELT_LINKS = [
  ['m-design', 'm-resin'],
  ['m-resin', 'm-silver'],
  ['m-silver', 'm-trim'],
  ['m-trim', 'm-cut'],
  ['m-cut', 'm-store'],
  ['m-melt', 'm-trim'],
  ['m-store', 'p-design'],
  ['p-design', 'p-trim'],
  ['p-trim', 'p-raw'],
  ['p-raw', 'p-gem'],
  ['p-gem', 'p-set'],
  ['p-set', 'p-plate'],
  ['p-plate', 'p-cost'],
  ['p-cost', 'recv'],
  ['recv', 'sk0'],
  ['mat-gold', 'p-gem'],
  ['sale-quote', 'sale-so'],
  ['sale-so', 'sale-inv']
]

function beltBetween(a, b) {
  const A = STATION_BY_ID[a]
  const B = STATION_BY_ID[b]
  const dx = B.pos[0] - A.pos[0]
  const dz = B.pos[2] - A.pos[2]
  if (Math.abs(dx) >= Math.abs(dz)) {
    const dir = dx >= 0 ? 1 : -1
    return [A.pos[0] + dir * padRadius(A), A.pos[2], B.pos[0] - dir * padRadius(B), A.pos[2]]
  }
  const dir = dz >= 0 ? 1 : -1
  return [A.pos[0], A.pos[2] + dir * padRadius(A), A.pos[0], B.pos[2] - dir * padRadius(B)]
}

const STOCK_ROW_Z = STATION_BY_ID.sk0.pos[2]
const SALES_ENTRY_X = STATION_BY_ID['sale-quote'].pos[0] - padRadius(STATION_BY_ID['sale-quote'])

// สายพาน [x1, z1, x2, z2] — คลัง → งานขายต่อจากขอบโซนคลัง
export const BELTS = [...BELT_LINKS.map(([a, b]) => beltBetween(a, b)), [ZONE_BOUNDS['z-stock'].x1 - 0.2, STOCK_ROW_Z, SALES_ENTRY_X, STOCK_ROW_Z]]

// ประตู: pos = [x, z], rot = หมุนรอบแกน y (ประตู C ตั้งขวางสายพานแนวนอน)
export const GATES = [
  { id: 'A', pos: [STATION_BY_ID['m-store'].pos[0], (STATION_BY_ID['m-store'].pos[2] + STATION_BY_ID['p-design'].pos[2]) / 2], rot: 0 },
  { id: 'B', pos: [STATION_BY_ID.recv.pos[0], (STATION_BY_ID['p-cost'].pos[2] + STATION_BY_ID.recv.pos[2]) / 2], rot: 0 },
  { id: 'C', pos: [(ZONE_BOUNDS['z-stock'].x1 + SALES_ENTRY_X) / 2, STOCK_ROW_Z], rot: Math.PI / 2 }
]

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
