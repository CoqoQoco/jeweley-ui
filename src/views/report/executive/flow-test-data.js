// flow-test-data.js — ข้อมูลตัวอย่างรูปตาม API (ExecutiveReport/FlowBoard + FlowZone) ใช้เฉพาะใน spec ของ Flow
// ตัวเลขเป็นของสมมติเพื่อทดสอบ logic ไม่ใช่ข้อมูลจริง

export const t = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)

const mix = (gold, size, productType, totalPcs) => ({ totalPcs, gold, size, productType })

export const board = {
  asOf: '2026-10-15T12:47:00Z',
  flow: {
    months: [
      { month: '2026-07', createdPcs: 100, completedPcs: 90, newStockPieces: 1, invoiceCount: 5, invoiceThb: 10 },
      { month: '2026-08', createdPcs: 100, completedPcs: 40, newStockPieces: 2, invoiceCount: 3, invoiceThb: 20 },
      { month: '2026-09', createdPcs: 100, completedPcs: 80, newStockPieces: 3, invoiceCount: 4, invoiceThb: null },
      { month: '2026-10', createdPcs: 50, completedPcs: 10, newStockPieces: 4, invoiceCount: 6, invoiceThb: 30 }
    ],
    createdPcs12m: 350,
    completedPcs12m: 220,
    backlogPcs: 130
  },
  goldLoss: { windowDays: 90, sendG: 1000, receivedG: 900, lossG: 100, lossPercent: 10, goldLossPercent: 6.5, silverLossPercent: 9.5, excessOverTargetG: 12.34, workersOverTargetCount: 3 },
  goldNotReturned: { goldG: 500, silverG: 250, queueSharePercent: 77.4 },
  sales: {
    thbTotalWithAmount: 2557576,
    firstDateWithTotal: '2026-06-23T00:00:00',
    currentMonthThb: 920,
    previousMonthThb: 1000,
    currentVsPreviousPercent: 92,
    top2CustomerSharePercent: 38.8,
    topCustomers: [],
    usdInvoiceCount: 3,
    usdAmountsHeld: true,
    paymentHeld: true
  },
  mix: {
    wip: mix(
      [
        { label: 'YG', pcs: 10, percent: 10 },
        { label: 'SV', pcs: 40, percent: 40 },
        { label: 'Unknown', pcs: 50, percent: 50 }
      ],
      [],
      [],
      100
    ),
    stock: mix(
      [
        { label: 'YG', pcs: 60, percent: 60 },
        { label: 'WG', pcs: 30, percent: 30 },
        { label: 'NG', pcs: 10, percent: 10 }
      ],
      [
        { label: '18K', pcs: 70, percent: 70 },
        { label: '9K', pcs: 20, percent: 20 },
        { label: 'Silver', pcs: 5, percent: 5 },
        { label: '22K', pcs: 5, percent: 5 }
      ],
      [
        { label: 'R', pcs: 50, percent: 50 },
        { label: 'P', pcs: 30, percent: 30 },
        { label: 'ES', pcs: 10, percent: 10 },
        { label: 'Other', pcs: 10, percent: 10 }
      ],
      100
    ),
    sold: mix(
      [
        { label: 'YG', pcs: 5, percent: 50 },
        { label: 'SV', pcs: 1, percent: 10 }
      ],
      [{ label: '18K', pcs: 4, percent: 40 }],
      [
        { label: 'R', pcs: 6, percent: 60 },
        { label: 'P', pcs: 1, percent: 10 }
      ],
      10
    )
  },
  trust: [
    { level: 'fail', zone: 'material', key: 'gold-negative', title: 'Negative gold', evidence: 'YG -1', owner: 'keeper' },
    { level: 'warn', zone: 'production', key: 'stale', title: 'Stale work', evidence: '64%', owner: 'prod' },
    { level: 'warn', zone: 'sales', key: 'no-sale-person', title: 'No sale person', evidence: '47 of 69', owner: 'sales' },
    { level: 'info', zone: 'stock', key: 'age', title: 'Old stock', evidence: '1998', owner: '-' }
  ]
}

const dept = (key, extra = {}) => ({
  key,
  openPlans: 10,
  openPcs: 100,
  waitPcs: 1800,
  workPcs: 50,
  agePcs: [10, 20, 30, 40],
  agePlans: [1, 2, 3, 4],
  overduePcs: 90,
  medianDays: 20,
  maxDays: 500,
  workers: null,
  dims: {
    gold: [
      { label: 'YG', plans: 2, pcs: 40 },
      { label: 'Yellow', plans: 1, pcs: 10 },
      { label: '', plans: 1, pcs: 30 },
      { label: 'NG', plans: 1, pcs: 20 }
    ],
    size: [
      { label: '18K', plans: 3, pcs: 60 },
      { label: 'Silver', plans: 2, pcs: 40 }
    ],
    ptype: [
      { label: 'R', plans: 3, pcs: 50 },
      { label: 'ZZ', plans: 1, pcs: 30 },
      { label: 'N/A', plans: 1, pcs: 20 }
    ]
  },
  goldLoss: null,
  ...extra
})

const goldLoss = (extra = {}) => ({
  win90: { rows: 10, sendG: 100, checkG: 90 },
  allTime: { rows: 100, sendG: 1000, checkG: 900 },
  pending: { rows: 5, g: 50, queueRows: 3, queueG: 30, workerRows: 2, workerG: 20 },
  notWeighed: false,
  includesScrap: false,
  dims: {
    gold: [
      { label: 'YG', rows90: 5, sendG90: 60, checkG90: 55, pendingG: 10 },
      { label: 'SV', rows90: 5, sendG90: 40, checkG90: 35, pendingG: 5 }
    ],
    size: [],
    ptype: []
  },
  ...extra
})

export const production = {
  departments: [
    dept('design'),
    dept('trim', { goldLoss: goldLoss({ includesScrap: true }), workers: { namedPlans: 5, queuePlans: 1, nonePlans: 2, testPlans: 3, names: [{ name: 'A', plans: 5 }] } }),
    dept('rawPolish', { goldLoss: goldLoss(), workers: { namedPlans: 5, queuePlans: 0, nonePlans: 0, testPlans: 0, names: [] } }),
    dept('gemSort', { goldLoss: goldLoss({ notWeighed: true }), workers: { namedPlans: 1, queuePlans: 0, nonePlans: 0, testPlans: 0, names: [] } }),
    dept('setting', { goldLoss: goldLoss(), workers: { namedPlans: 5, queuePlans: 0, nonePlans: 0, testPlans: 0, names: [] } }),
    dept('plating', { goldLoss: goldLoss(), workers: { namedPlans: 5, queuePlans: 0, nonePlans: 0, testPlans: 0, names: [] } }),
    dept('costCard')
  ],
  totals: { openPlans: 70, openPcs: 700, stalePlans: 28, stalePcs: 280, overduePcs: 630 },
  done: { createdThisMonthPcs: 50, completedThisMonthPcs: 10, meltedPcs: 5, donePcs: 1000 },
  lossVsTarget: [
    {
      dept: 'setting',
      metal: 'GOLD',
      targetPercent: 4.3,
      isSystemDefault: true,
      rows: [
        { name: 'whole', code: '', isTotal: true, rows: 50, sendG: 500, lossPercent: 4.4, deltaPp: 0.1, excessG: 0.5 },
        { name: 'W1', code: 'W1', isTotal: false, rows: 10, sendG: 100, lossPercent: 5.7, deltaPp: 1.4, excessG: 1.4 },
        { name: 'W2', code: 'W2', isTotal: false, rows: 10, sendG: 100, lossPercent: 4.8, deltaPp: 0.5, excessG: 0.5 }
      ]
    },
    {
      dept: 'ขัดชุบ',
      metal: 'SILVER',
      targetPercent: 4.7,
      isSystemDefault: true,
      rows: [
        { name: 'whole', code: '', isTotal: true, rows: 50, sendG: 500, lossPercent: 6.0, deltaPp: 1.3, excessG: 6.5 },
        { name: 'Shop', code: 'S', isTotal: false, rows: 10, sendG: 100, lossPercent: 6.4, deltaPp: 1.7, excessG: 1.7 }
      ]
    },
    {
      dept: 'rawPolish',
      metal: 'GOLD',
      targetPercent: 3.2,
      isSystemDefault: true,
      rows: [
        { name: 'whole', code: '', isTotal: true, rows: 5, sendG: 50, lossPercent: 3.3, deltaPp: 0.1, excessG: 0.1 },
        { name: 'R1', code: 'R1', isTotal: false, rows: 5, sendG: 50, lossPercent: 5.1, deltaPp: 1.9, excessG: 1 }
      ]
    }
  ],
  castCost: {
    win90: { rows: 4, castWeightG: 100, castLossG: 1, meltWeightG: 10, meltLossG: 0.1 },
    byGold90: [{ gold: 'SV', rows: 3, castWeightG: 80, castLossG: 0.8 }],
    allTime: { rows: 40, castWeightG: 1000, castLossG: 10, meltWeightG: 100, meltLossG: 1 },
    note: 'note'
  }
}

export const mold = {
  stages: [
    { status: 10, name: 'design', isTerminal: false, open: 100, stale180: 80, within14d: 0, medianDays: 400, maxDays: 800, newProcess: 5 },
    { status: 20, name: 'resin', isTerminal: false, open: 10, stale180: 10, within14d: 0, medianDays: 500, maxDays: 600, newProcess: 0 },
    { status: 30, name: 'silver', isTerminal: false, open: 0, stale180: 0, within14d: 0, medianDays: null, maxDays: null, newProcess: 0 },
    { status: 60, name: 'store', isTerminal: true, open: 800, stale180: 500, within14d: 2, medianDays: 400, maxDays: 700, newProcess: 300 },
    { status: 500, name: 'melt', isTerminal: true, open: 50, stale180: 40, within14d: 0, medianDays: 400, maxDays: 700, newProcess: 1 }
  ],
  catalog: { activeMolds: 1000, categories: [{ category: 'ring', molds: 600, new90d: 40 }, { category: 'pendant', molds: 300, new90d: 10 }] }
}

export const receive = {
  notReceivedPcs: 4429,
  notReceivedJobs: 683,
  receivedPcs: 67947,
  receivedJobs: 7090,
  completedThisMonthPcs: 1923,
  completedThisMonthJobs: 268,
  receivedThisMonthPieces: 793,
  months: [{ month: '2026-10', newStockPieces: 793 }]
}

export const stock = {
  totals: { inStock: 100, reserved: 2, sold: 7, costRecordedPcs: 20, costMissingPcs: 80, designsInStock: 50 },
  locations: [
    { code: 'MAIN', name: 'Main', isSalesPoint: false, pcs: 60 },
    { code: 'ST09', name: 'Ring point', isSalesPoint: true, pcs: 40 }
  ],
  lenses: {
    sloc: [
      { label: 'MAIN', pcs: 60 },
      { label: 'Other 1', pcs: 40 }
    ],
    gold: [
      { label: 'Yellow', pcs: 70 },
      { label: 'White', pcs: 30 }
    ],
    size: [
      { label: '18K', pcs: 90 },
      { label: '9K', pcs: 10 }
    ],
    type: [
      { label: 'R ring', pcs: 100 }
    ],
    age: [
      { label: '<=90d', pcs: 10 },
      { label: '91-365d', pcs: 30 },
      { label: '>365d', pcs: 60 },
      { label: 'Unknown', pcs: 0 }
    ]
  },
  matrix: [
    { gold: 'Yellow', size: '18K', pcs: 60 },
    { gold: 'Yellow', size: '9K', pcs: 10 },
    { gold: 'White', size: '18K', pcs: 30 }
  ]
}

export const material = {
  goldRows: [
    { code: 'YG', sizeCode: '7', sizeName: '18K', weight: -1363.16, weightOnProcess: 0 },
    { code: 'YG', sizeCode: '3', sizeName: '9K', weight: -403.03, weightOnProcess: 0 },
    { code: 'SV', sizeCode: '9', sizeName: 'Silver', weight: -5175.04, weightOnProcess: 0 },
    { code: 'ZG', sizeCode: '1', sizeName: '22K', weight: -1, weightOnProcess: 0 }
  ],
  goldTx30d: [{ goldCode: 'YG', type: 3, rows: 10, weight: 3521.7 }],
  gemGroups: [{ group: 'Ruby', rows: 662, rowsWithStock: 224, qtyK: 384745, qtyQ: 0 }],
  totals: { gemRows: 5282, gemRowsWithStock: 2102 }
}

export const sales = {
  months: [
    { month: '2026-09', quotes: 28, soThbCount: 29, soThbAmount: 1671047, soUsdCount: 23, invThbCount: 27, invThbAmount: 1092168, invUsdCount: 15 },
    { month: '2026-10', quotes: 2, soThbCount: 5, soThbAmount: 542149, soUsdCount: 0, invThbCount: 6, invThbAmount: 1007383, invUsdCount: 0 }
  ],
  channels: [{ code: 'SHOP', thbInvoices: 8, thbAmount: 1308494, usdInvoices: 4 }, { code: '', thbInvoices: 16, thbAmount: 459623, usdInvoices: 6 }],
  customers: [{ code: 'WALKIN', name: 'walk-in', invoiceCount: 18, thb: 447959, sharePercent: 17.5, isBucket: true }],
  salePersons: [{ name: '', invoices: 47, thb: 1778905 }],
  totals: { quotations: 99, salesOrders: 92, invoices: 69 },
  usdAmountsHeld: true,
  paymentHeld: true
}

export const zones = { mold, production, receive, stock, material, sales }
