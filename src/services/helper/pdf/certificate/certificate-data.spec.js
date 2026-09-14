import { describe, it, expect } from 'vitest'
import {
  buildCertificatesFromItems,
  groupCertificateHistory,
  buildCertificateIssueStatsFromHistory,
  buildCertificateSnapshot,
  restoreCertificateFromSnapshot,
  isWalkInCustomer
} from './certificate-data.js'

function baseItem(overrides = {}) {
  return {
    stockNumber: 'DK-18K-20A-19960',
    stockNumberOrigin: 'AH36566',
    productNumber: 'PN-001',
    productNameEn: 'Sapphire ring',
    mold: 'M-100',
    imagePath: 'AH36566.jpg',
    size: '#56',
    productionType: 'Yellow Gold',
    productionTypeSize: '18K',
    qty: 1,
    materials: [],
    ...overrides
  }
}

describe('buildCertificatesFromItems — metal & weight', () => {
  it('ใช้ productionTypeSize + productionType เมื่อมีข้อมูล', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({ materials: [{ type: 'Gold', typeCode: 'YG', weight: 3.456 }] })
    ])

    expect(cert.metal).toBe('18K Yellow Gold')
    expect(cert.metalWeight).toBe('3.46 g')
  })

  it('ไม่มี productionType → map จาก typeCode ของ Gold', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({
        productionType: '',
        productionTypeSize: '',
        materials: [{ type: 'Gold', typeCode: 'WG', weight: 2 }]
      })
    ])

    expect(cert.metal).toBe('White Gold')
  })

  it('รวมน้ำหนักทองหลายก้อน', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({
        materials: [
          { type: 'Gold', typeCode: 'YG', weight: 1.111 },
          { type: 'Gold', typeCode: 'YG', weight: 2.222 }
        ]
      })
    ])

    expect(cert.metalWeight).toBe('3.33 g')
  })
})

describe('buildCertificatesFromItems — diamond', () => {
  it('รวม pcs และ weight ของเพชร ใช้ typeCode ตัวแรกเป็น quality', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({
        materials: [
          { type: 'Diamond', typeCode: 'G,VS1', qty: 10, weight: 0.1 },
          { type: 'Diamond', typeCode: 'F,VVS', qty: 5, weight: 0.05 }
        ]
      })
    ])

    expect(cert.hasDiamond).toBe(true)
    expect(cert.diamondPcs).toBe(15)
    expect(cert.diamondWeight).toBe('0.15 ct')
    expect(cert.diamondQuality).toBe('G,VS1')
  })
})

describe('buildCertificatesFromItems — แยกพลอยเม็ดหลัก', () => {
  it('เลือกพลอยที่ weight มากที่สุดเป็นเม็ดหลัก', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({
        materials: [
          { type: 'Gem', typeOrigin: 'Sapphire', weight: 0.5, size: '4x3 OV' },
          { type: 'Gem', typeOrigin: 'Ruby(BUR)', weight: 1.5, size: '5x4 OV ' }
        ]
      })
    ])

    expect(cert.hasGem).toBe(true)
    expect(cert.gemVariety).toBe('Ruby')
    expect(cert.gemWeight).toBe('1.50 ct')
  })

  it('แปลง "5x4 OV " เป็น measurement + shape', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({
        materials: [{ type: 'Gem', typeOrigin: 'Ruby(BUR)', weight: 1, size: '5x4 OV ' }]
      })
    ])

    expect(cert.gemMeasurement).toBe('5.0 x 4.0 mm')
    expect(cert.gemShape).toBe('Oval')
  })

  it('รองรับทศนิยม เช่น "5.5x4.2"', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({
        materials: [{ type: 'Gem', typeOrigin: 'Sapphire', weight: 1, size: '5.5x4.2 RD' }]
      })
    ])

    expect(cert.gemMeasurement).toBe('5.5 x 4.2 mm')
    expect(cert.gemShape).toBe('Round')
  })

  it('อ่าน size ไม่ได้ → measurement และ shape เป็นค่าว่าง', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({
        materials: [{ type: 'Gem', typeOrigin: 'Sapphire', weight: 1, size: 'ไม่ทราบขนาด' }]
      })
    ])

    expect(cert.gemMeasurement).toBe('')
    expect(cert.gemShape).toBe('')
  })

  it('map โค้ด origin BUR และ CYL (case-insensitive)', () => {
    const [certBur] = buildCertificatesFromItems([
      baseItem({ materials: [{ type: 'Gem', typeOrigin: 'Ruby(bur)', weight: 1 }] })
    ])
    const [certCyl] = buildCertificatesFromItems([
      baseItem({ materials: [{ type: 'Gem', typeOrigin: 'Sapphire(CYL)', weight: 1 }] })
    ])

    expect(certBur.gemOrigin).toBe('Myanmar (Burma)')
    expect(certCyl.gemOrigin).toBe('Sri Lanka (Ceylon)')
  })

  it('โค้ด origin ที่ไม่รู้จัก → คงข้อความในวงเล็บไว้ตามเดิม', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({ materials: [{ type: 'Gem', typeOrigin: 'Spinel(XYZ)', weight: 1 }] })
    ])

    expect(cert.gemOrigin).toBe('XYZ')
  })

  it('ไม่มีวงเล็บ → gemOrigin เป็นค่าว่าง', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({ materials: [{ type: 'Gem', typeOrigin: 'Sapphire', weight: 1 }] })
    ])

    expect(cert.gemOrigin).toBe('')
  })

  it('ไม่มี typeOrigin → fallback ไปใช้ typeCode ตรงๆ', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({ materials: [{ type: 'Gem', typeCode: 'Sapphire', weight: 1 }] })
    ])

    expect(cert.gemVariety).toBe('Sapphire')
    expect(cert.gemOrigin).toBe('')
  })

  it('typeCode มีค่า → ใช้ typeCode เป็น variety เสมอ แม้ typeOrigin จะเป็นคำย่อ เช่น "Sap(Cyl)"', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({
        materials: [{ type: 'Gem', typeOrigin: 'Sap(Cyl)', typeCode: 'Sapphire', weight: 0.39, size: '5x4 OV' }]
      })
    ])

    expect(cert.gemVariety).toBe('Sapphire')
    expect(cert.gemOrigin).toBe('Sri Lanka (Ceylon)')
  })
})

describe('buildCertificatesFromItems — กรณีไม่มีพลอย', () => {
  it('hasGem = false และ field พลอยทั้งหมดเป็นค่าว่าง', () => {
    const [cert] = buildCertificatesFromItems([
      baseItem({ materials: [{ type: 'Gold', typeCode: 'YG', weight: 1 }] })
    ])

    expect(cert.hasGem).toBe(false)
    expect(cert.gemVariety).toBe('')
    expect(cert.gemSpecies).toBe('')
    expect(cert.gemOrigin).toBe('')
    expect(cert.gemWeight).toBe('')
    expect(cert.gemMeasurement).toBe('')
    expect(cert.gemShape).toBe('')
  })
})

describe('buildCertificatesFromItems — certificateNo / itemNo', () => {
  it('ใช้ stockNumberOrigin นำหน้าด้วย DKC-', () => {
    const [cert] = buildCertificatesFromItems([baseItem()])
    expect(cert.itemNo).toBe('AH36566')
    expect(cert.certificateNo).toBe('DKC-AH36566')
  })

  it('ไม่มี stockNumberOrigin → fallback ไปใช้ productNumber', () => {
    const [cert] = buildCertificatesFromItems([baseItem({ stockNumberOrigin: '' })])
    expect(cert.itemNo).toBe('PN-001')
    expect(cert.certificateNo).toBe('DKC-PN-001')
  })
})

describe('buildCertificatesFromItems — qty > 1', () => {
  it('สร้างหลายใบ ใช้ certificateNo และ itemNo เดียวกันทุกใบ', () => {
    const certs = buildCertificatesFromItems([baseItem({ qty: 3 })])

    expect(certs.length).toBe(3)
    certs.forEach((cert) => {
      expect(cert.certificateNo).toBe('DKC-AH36566')
      expect(cert.stockNumber).toBe('DK-18K-20A-19960')
      expect(cert.selected).toBe(true)
    })
  })
})

describe('groupCertificateHistory', () => {
  function snapshotJson(overrides = {}) {
    return JSON.stringify({
      certificateNo: 'DKC-AH1',
      stockNumber: 'DK-1',
      brand: { mode: 'dk', name: '', logoPath: null, showManufacturer: true, showQr: true },
      signerTitle: 'GM',
      ...overrides
    })
  }

  const rows = [
    // batch B (รอบใหม่กว่า) — API คืนใหม่สุดก่อน
    {
      running: 3,
      batch: 'B',
      certificateNo: 'DKC-AH2',
      issueNo: 1,
      stockNumber: 'DK-2',
      createBy: 'user2',
      createDate: '2026-09-06T10:00:00Z',
      brandName: 'HARISH',
      data: snapshotJson({ certificateNo: 'DKC-AH2', stockNumber: 'DK-2' })
    },
    // batch A (รอบเก่ากว่า) — 2 แถว
    {
      running: 2,
      batch: 'A',
      certificateNo: 'DKC-AH1',
      issueNo: 2,
      stockNumber: 'DK-1',
      createBy: 'user1',
      createDate: '2026-09-01T10:00:00Z',
      data: snapshotJson()
    },
    {
      running: 1,
      batch: 'A',
      certificateNo: 'DKC-AH1',
      issueNo: 1,
      stockNumber: 'DK-1',
      createBy: 'user1',
      createDate: '2026-09-01T10:00:00Z',
      data: snapshotJson()
    }
  ]

  it('จัดกลุ่มตาม batch และนับ round เก่า→ใหม่ แต่คืนผลใหม่สุดก่อน', () => {
    const groups = groupCertificateHistory(rows)

    expect(groups.length).toBe(2)
    expect(groups[0].batch).toBe('B')
    expect(groups[0].round).toBe(2)
    expect(groups[0].count).toBe(1)
    expect(groups[0].brandName).toBe('HARISH')

    expect(groups[1].batch).toBe('A')
    expect(groups[1].round).toBe(1)
    expect(groups[1].count).toBe(2)
    expect(groups[1].rows[0].issueNo).toBe(1)
    expect(groups[1].rows[1].issueNo).toBe(2)
  })

  it('parse snapshot(data) ให้แต่ละแถว และตั้ง isLegacy จาก snapshot.legacy', () => {
    const legacyRows = [
      {
        running: 1,
        batch: 'C',
        stockNumber: 'DK-9',
        createDate: '2026-09-01T10:00:00Z',
        data: JSON.stringify({ legacy: true })
      }
    ]

    const groups = groupCertificateHistory(legacyRows)
    expect(groups[0].rows[0].isLegacy).toBe(true)
  })

  it('data พังหรือว่าง → snapshot เป็น {} ไม่ throw', () => {
    const brokenRows = [{ running: 1, batch: 'D', stockNumber: 'DK-9', createDate: '2026-09-01T10:00:00Z', data: 'not-json' }]
    const groups = groupCertificateHistory(brokenRows)
    expect(groups[0].rows[0].snapshot).toEqual({})
    expect(groups[0].rows[0].isLegacy).toBe(false)
  })

  it('ไม่มีแถวเลย → คืน array ว่าง', () => {
    expect(groupCertificateHistory([])).toEqual([])
  })
})

describe('buildCertificateIssueStatsFromHistory', () => {
  const rows = [
    { stockNumber: 'DK-1', createBy: 'user2', createDate: '2026-09-05T10:00:00Z' },
    { stockNumber: 'DK-1', createBy: 'user1', createDate: '2026-09-01T10:00:00Z' },
    { stockNumber: 'DK-2', createBy: 'user1', createDate: '2026-09-01T10:00:00Z' }
  ]

  it('นับจำนวนครั้งต่อ stockNumber และเก็บครั้งล่าสุด', () => {
    const stats = buildCertificateIssueStatsFromHistory([{ stockNumber: 'DK-1' }, { stockNumber: 'DK-2' }], rows)

    expect(stats['DK-1'].count).toBe(2)
    expect(stats['DK-1'].lastBy).toBe('user2')
    expect(stats['DK-2'].count).toBe(1)
  })

  it('ไม่มีประวัติ → count 0', () => {
    const stats = buildCertificateIssueStatsFromHistory([{ stockNumber: 'DK-9' }], rows)
    expect(stats['DK-9']).toEqual({ count: 0, lastAt: null, lastBy: '' })
  })
})

describe('buildCertificateSnapshot / restoreCertificateFromSnapshot', () => {
  const certificate = {
    certificateNo: 'DKC-AH1',
    itemNo: 'AH1',
    issueDate: '1 January 2026',
    description: 'Ring',
    model: 'M-1',
    metal: '18K Yellow Gold',
    metalWeight: '3.00 g',
    itemSize: '#56',
    diamondPcs: 5,
    diamondWeight: '0.15 ct',
    diamondQuality: 'G,VS1',
    hasDiamond: true,
    hasGem: false,
    gemVariety: '',
    gemSpecies: '',
    gemOrigin: '',
    gemWeight: '',
    gemMeasurement: '',
    gemShape: '',
    gemCut: '',
    gemColor: '',
    treatment: '',
    comment: '',
    stockNumber: 'DK-1',
    productNumber: 'PN-1',
    imagePath: 'AH1.jpg',
    imageBlobPath: 'Stock/Product/AH1.jpg',
    photoSource: 'new',
    customImagePath: null,
    imageBase64: 'data:image/png;base64,abc',
    newPhotoDataUrl: 'data:image/png;base64,new',
    selected: true
  }

  const brand = { mode: 'customer', name: 'HARISH', logoPath: 'Certificate/logo-1.jpg', logoFile: null, logoDataUrl: 'data:image/png;base64,logo', showManufacturer: true, showQr: false }

  it('snapshot ไม่มี base64 ปนอยู่เลย', () => {
    const snapshot = buildCertificateSnapshot(certificate, brand, 'GM', 'Certificate/photo-9.jpg')

    expect(JSON.stringify(snapshot)).not.toContain('base64')
    expect(snapshot.customImagePath).toBe('Certificate/photo-9.jpg')
    expect(snapshot.brand).toEqual({
      mode: 'customer',
      name: 'HARISH',
      logoPath: 'Certificate/logo-1.jpg',
      showManufacturer: true,
      showQr: false
    })
    expect(snapshot.signerTitle).toBe('GM')
    expect(snapshot.stockNumber).toBe('DK-1')
  })

  it('restore แบบ reprint (resetIssueDate false) — คงวันที่เดิม', () => {
    const snapshot = buildCertificateSnapshot(certificate, brand, 'GM', null)
    const restored = restoreCertificateFromSnapshot(snapshot, { resetIssueDate: false })

    expect(restored.issueDate).toBe('1 January 2026')
    expect(restored.selected).toBe(true)
    expect(restored.brand).toBeUndefined()
    expect(restored.signerTitle).toBeUndefined()
  })

  it('restore แบบโหลดมาแก้ไข (resetIssueDate true) — วันที่ออกใบเป็นวันนี้', () => {
    const snapshot = buildCertificateSnapshot(certificate, brand, 'GM', null)
    const restored = restoreCertificateFromSnapshot(snapshot, { resetIssueDate: true })

    expect(restored.issueDate).not.toBe('1 January 2026')
    expect(restored.stockNumber).toBe('DK-1')
  })
})

describe('isWalkInCustomer', () => {
  it('รหัส WALKIN (case-insensitive, มี/ไม่มี whitespace) → true', () => {
    expect(isWalkInCustomer('WALKIN')).toBe(true)
    expect(isWalkInCustomer('walkin')).toBe(true)
    expect(isWalkInCustomer(' WalkIn ')).toBe(true)
  })

  it('รหัสลูกค้าปกติ → false', () => {
    expect(isWalkInCustomer('CUST001')).toBe(false)
  })

  it('ค่าว่าง/null/undefined → false', () => {
    expect(isWalkInCustomer('')).toBe(false)
    expect(isWalkInCustomer(null)).toBe(false)
    expect(isWalkInCustomer(undefined)).toBe(false)
  })
})
