import { describe, it, expect } from 'vitest'
import {
  buildCertificatesFromItems,
  parseCertificateLogs,
  buildCertificateIssueStats
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

describe('parseCertificateLogs / buildCertificateIssueStats', () => {
  const logs = [
    {
      running: 2,
      paperType: 'certificate',
      printedAt: '2026-09-05T10:00:00Z',
      printedBy: 'user2',
      data: JSON.stringify({ signerTitle: 'GM', count: 1, stockNumbers: ['DK-1'] })
    },
    {
      running: 1,
      paperType: 'certificate',
      printedAt: '2026-09-01T10:00:00Z',
      printedBy: 'user1',
      data: JSON.stringify({ signerTitle: 'GM', count: 2, stockNumbers: ['DK-1', 'DK-2'] })
    },
    {
      running: 3,
      paperType: 'guarantee-card',
      printedAt: '2026-09-06T10:00:00Z',
      printedBy: 'user3',
      data: JSON.stringify({ stockNumbers: ['DK-1'] })
    }
  ]

  it('กรองเฉพาะ paperType certificate และเรียงเก่า→ใหม่พร้อมเลขรอบ', () => {
    const parsed = parseCertificateLogs(logs)

    expect(parsed.length).toBe(2)
    expect(parsed[0].round).toBe(1)
    expect(parsed[0].printedBy).toBe('user1')
    expect(parsed[1].round).toBe(2)
    expect(parsed[1].printedBy).toBe('user2')
  })

  it('สถิติการออกใบรับรองต่อ stockNumber', () => {
    const parsed = parseCertificateLogs(logs)
    const stats = buildCertificateIssueStats([{ stockNumber: 'DK-1' }, { stockNumber: 'DK-2' }], parsed)

    expect(stats['DK-1'].count).toBe(2)
    expect(stats['DK-1'].lastBy).toBe('user2')
    expect(stats['DK-2'].count).toBe(1)
  })
})
