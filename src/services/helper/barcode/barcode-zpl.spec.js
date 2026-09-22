import { describe, it, expect } from 'vitest'
import {
  resolveLabelCode,
  formatGemText,
  generateLegacyZPL,
  generateLegacyZPLVertical,
  generateGt800ZPL,
  generateGt800ZPLVertical,
  generateGt800ZPLQr,
  pickQrMagnification,
  layoutGt800,
  layoutGt800Qr
} from './barcode-zpl.js'

// สำเนาฟังก์ชันเดิมจาก commit 7048e5a^ (ก่อนย้ายไป DK Print Bridge) ไว้เทียบผลลัพธ์ตรงตัวอักษร
// ต้นฉบับใช้ formValue.stockNumber ตรงๆ (ไม่มี concept ของ stockNumberOrigin)
function originalGenerateZPLs(formValue) {
  let zpl = '^XA^LL200^MD25^LT40^XZ'
  zpl += '^XA'

  zpl += `^FO248,35^BY1,3.0:1,25^BCN,Y,N,N^FD${formValue.stockNumber || ''}^FS`

  const salePriceText =
    formValue.salePrice != null && formValue.salePrice > 0
      ? new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
          formValue.salePrice
        )
      : ''
  const stockNumberLine = [formValue.stockNumber, salePriceText].filter(Boolean).join(' - ')
  zpl += `^FO248,65^A0N,20,18^FD${stockNumberLine}^FS`

  zpl += `^FO250,090^A0N,14,16,B^FD${formValue.gold || ''} ${formValue.size || ''}^FS`

  zpl += `^FO025,050^A0N,15,15,B^FD${formValue.madeIn || ''}^FS`

  zpl += `^FO420,045^A0N,14,16,B^FD${formValue.goldType || ''}^FS`

  if (Array.isArray(formValue.gems)) {
    let yPos = 15
    formValue.gems.forEach((gem) => {
      if (gem) {
        zpl += `^F450,${yPos}^A0N,14,16,B^FD${gem}^FS`
        yPos += 15
      }
    })
  }

  zpl += '^XZ'

  return zpl
}

function originalGenerateZPLVertical(formValue) {
  const hasPrice = formValue.price != null && formValue.price > 0
  const labelHeight = hasPrice ? 220 : 200

  let zpl = `^XA^LL${labelHeight}^MD25^LT40^XZ`
  zpl += '^XA'

  zpl += `^FO025,050^A0N,15,15,B^FD${formValue.madeIn || ''}^FS`

  zpl += `^FO252,10^A0N,20,18^FD${formValue.productNameEn || ''}^FS`

  const sizeText = formValue.size ? ` #${formValue.size}` : ''
  zpl += `^FO250,030^A0N,14,16,B^FD${formValue.gold || ''}${sizeText}^FS`

  zpl += `^FO248,048^BY1,3.0:1,25^BCN,Y,N,N^FD${formValue.stockNumber || ''}^FS`

  const priceText = hasPrice
    ? new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(formValue.price)
    : ''
  const priceLine = [formValue.productNumber, priceText].filter(Boolean).join(' - ')
  if (priceLine) {
    zpl += `^FO250,100^A0N,14,16,B^FD${priceLine}^FS`
  }

  if (Array.isArray(formValue.gems)) {
    let yPos = 15
    formValue.gems.forEach((gem) => {
      if (gem) {
        zpl += `^FO450,${yPos}^A0N,14,16,B^FD${gem}^FS`
        yPos += 15
      }
    })
  }

  zpl += '^XZ'

  return zpl
}

describe('resolveLabelCode', () => {
  it('คืน stockNumberOrigin (trim แล้ว) ถ้ามีค่า', () => {
    expect(resolveLabelCode({ stockNumber: 'NEW-001', stockNumberOrigin: '  OLD-001  ' })).toBe('OLD-001')
  })

  it('ไม่มี stockNumberOrigin → คืน stockNumber', () => {
    expect(resolveLabelCode({ stockNumber: 'NEW-001' })).toBe('NEW-001')
  })

  it('stockNumberOrigin เป็นช่องว่างล้วน → fallback เป็น stockNumber', () => {
    expect(resolveLabelCode({ stockNumber: 'NEW-001', stockNumberOrigin: '   ' })).toBe('NEW-001')
  })

  it('ไม่มีทั้งคู่ → คืนค่าว่าง', () => {
    expect(resolveLabelCode({})).toBe('')
    expect(resolveLabelCode(null)).toBe('')
  })
})

describe('formatGemText', () => {
  it('แทรกเว้นวรรคระหว่างตัวอักษรกับตัวเลขทศนิยม และตัวเลขกับ ct.', () => {
    expect(formatGemText('24Diamond0.24 ct. G,VS1')).toBe('24Diamond 0.24 ct. G,VS1')
  })

  it('1Sapphire2.27ct. → 1Sapphire 2.27 ct.', () => {
    expect(formatGemText('1Sapphire2.27ct.')).toBe('1Sapphire 2.27 ct.')
  })

  it('3Ruby0.15ct. → 3Ruby 0.15 ct.', () => {
    expect(formatGemText('3Ruby0.15ct.')).toBe('3Ruby 0.15 ct.')
  })

  it('36Diamond0.180ct. G,VS → 36Diamond 0.180 ct. G,VS', () => {
    expect(formatGemText('36Diamond0.180ct. G,VS')).toBe('36Diamond 0.180 ct. G,VS')
  })

  it('ไม่แตะเกรด', () => {
    expect(formatGemText('G,VS1')).toBe('G,VS1')
  })

  it('ข้อความที่เว้นวรรคอยู่แล้วไม่เปลี่ยน', () => {
    expect(formatGemText('1 Sapphire 2.27 ct.')).toBe('1 Sapphire 2.27 ct.')
  })

  it('null / ค่าว่าง ไม่พัง', () => {
    expect(formatGemText(null)).toBe('')
    expect(formatGemText('')).toBe('')
    expect(formatGemText(undefined)).toBe('')
  })
})

describe('generateLegacyZPL / generateLegacyZPLVertical — ต้องเหมือนของเดิมก่อน 7048e5a ทุกตัวอักษร', () => {
  const cases = [
    {
      name: 'มีราคา มีพลอย 2 (เว้นว่าง 1)',
      form: {
        stockNumber: 'RG-1234-001',
        salePrice: 12345.5,
        price: 9999.99,
        gold: 'PG',
        size: '55',
        madeIn: 'MADE IN THAILAND',
        goldType: '18K',
        productNameEn: 'Ring Test',
        productNumber: 'PN-001',
        gems: ['D-1.00', 'R-0.50', '']
      }
    },
    {
      name: 'ไม่มีราคา ไม่มีพลอย',
      form: {
        stockNumber: 'RG-9999-002',
        gold: 'YG',
        size: '',
        madeIn: 'MADE IN THAILAND',
        goldType: '',
        productNameEn: '',
        productNumber: '',
        gems: []
      }
    },
    {
      name: 'มีพลอย 3 ไม่มีไซซ์',
      form: {
        stockNumber: 'NK-0001-003',
        salePrice: 0,
        gold: 'WG 2.50 g.',
        size: '',
        madeIn: 'MADE IN THAILAND',
        goldType: '9K',
        productNameEn: 'Necklace',
        productNumber: 'PN-003',
        gems: ['D-0.10', 'S-0.20', 'R-0.30']
      }
    }
  ]

  cases.forEach(({ name, form }) => {
    it(`generateLegacyZPL: ${name} — ไม่มี stockNumberOrigin`, () => {
      expect(generateLegacyZPL(form)).toBe(originalGenerateZPLs(form))
    })

    it(`generateLegacyZPL: ${name} — มี stockNumberOrigin แทนเลขที่ผลิต`, () => {
      const withOrigin = { ...form, stockNumberOrigin: 'OLD-0007' }
      const expected = originalGenerateZPLs({ ...form, stockNumber: 'OLD-0007' })
      expect(generateLegacyZPL(withOrigin)).toBe(expected)
    })

    it(`generateLegacyZPLVertical: ${name} — ไม่มี stockNumberOrigin`, () => {
      expect(generateLegacyZPLVertical(form)).toBe(originalGenerateZPLVertical(form))
    })

    it(`generateLegacyZPLVertical: ${name} — มี stockNumberOrigin แทนเลขที่ผลิต`, () => {
      const withOrigin = { ...form, stockNumberOrigin: 'OLD-0007' }
      const expected = originalGenerateZPLVertical({ ...form, stockNumber: 'OLD-0007' })
      expect(generateLegacyZPLVertical(withOrigin)).toBe(expected)
    })
  })
})

describe('GT800 — เลือก ROOMY/TIGHT', () => {
  it('AH21142 + พลอยสั้น 3 บรรทัด → ROOMY', () => {
    const form = {
      stockNumber: 'AH21142',
      gems: ['0.24ct.', '0.15ct.', '0.10ct.'],
      salePrice: 12345
    }
    const layout = layoutGt800(form, 'original')
    expect(layout.levelName).toBe('ROOMY')
  })

  it('DK-18K-1XR-1747 (รหัสยาว) → TIGHT', () => {
    const form = {
      stockNumber: 'DK-18K-1XR-1747',
      gems: ['D-1.00'],
      salePrice: 1000
    }
    const layout = layoutGt800(form, 'original')
    expect(layout.levelName).toBe('TIGHT')
  })

  it('รหัสสั้น ไม่มีพลอย → ROOMY', () => {
    const form = { stockNumber: 'A1', gems: [] }
    const layout = layoutGt800(form, 'original')
    expect(layout.levelName).toBe('ROOMY')
  })

  it('พลอย 3 บรรทัด แต่บรรทัดราคายาวเกิน 20 ตัวอักษร → TIGHT', () => {
    const form = {
      stockNumber: 'AB123',
      salePrice: 123456789.99, // ดันให้ codeLine ยาวเกิน 20 ตัวอักษร
      gems: ['0.24ct.', '0.15ct.', '0.10ct.']
    }
    const layout = layoutGt800(form, 'original')
    expect(layout.codeLine.length).toBeGreaterThan(20)
    expect(layout.levelName).toBe('TIGHT')
  })

  it('พลอยบรรทัดยาวเกิน 24 ตัวอักษร (หลัง formatGemText) → TIGHT', () => {
    const form = {
      stockNumber: 'AB123',
      gems: ['ThisIsAVeryLongGemNameCt.5.00']
    }
    const layout = layoutGt800(form, 'original')
    expect(layout.levelName).toBe('TIGHT')
  })

  it('แนวตั้ง: ชื่อสินค้ายาวเกิน 20 ตัวอักษร + พลอย 3 บรรทัด → TIGHT', () => {
    const form = {
      stockNumber: 'AB123',
      productNameEn: 'A Very Long Product Name Here',
      gems: ['0.24ct.', '0.15ct.', '0.10ct.']
    }
    const layout = layoutGt800(form, 'vertical')
    expect(layout.levelName).toBe('TIGHT')
  })
})

describe('generateGt800ZPL / generateGt800ZPLVertical', () => {
  const form = {
    stockNumber: 'AH21142',
    salePrice: 12345,
    gold: 'PG',
    size: '55',
    goldType: '18K',
    madeIn: 'MADE IN THAILAND',
    productNameEn: 'Ring Test',
    productNumber: 'PN-001',
    price: 9999,
    gems: ['0.24ct.', '0.15ct.']
  }

  it('generateGt800ZPL: dpiScale=1 header ตรงตามสเปก', () => {
    const zpl = generateGt800ZPL(form, 1)
    expect(zpl.startsWith('^XA^LL104^MD15^LT0^XZ^XA')).toBe(true)
    expect(zpl).toContain('^FO25,50^A0N,15,15^FD')
  })

  it('generateGt800ZPL: ใช้เลขที่ผลิตเก่าก่อนเมื่อมี', () => {
    const zpl = generateGt800ZPL({ ...form, stockNumberOrigin: 'OLD-777' }, 1)
    expect(zpl).toContain('^FDOLD-777^FS')
    expect(zpl).not.toContain('^FDAH21142^FS')
  })

  it('generateGt800ZPL: dpiScale scale พิกัดตามสัดส่วน', () => {
    const scale = 300 / 203
    const zpl = generateGt800ZPL(form, scale)
    expect(zpl).toContain(`^LL${Math.round(104 * scale)}`)
  })

  it('generateGt800ZPLVertical: ไม่มี productNumber/price ไม่ต้องมีบรรทัดราคา', () => {
    const zpl = generateGt800ZPLVertical({ stockNumber: 'AH21142', gems: [] }, 1)
    expect(zpl).not.toContain('^FO256,83')
  })

  it('generateGt800ZPLVertical: มี price → มีบรรทัดราคา', () => {
    const zpl = generateGt800ZPLVertical(form, 1)
    expect(zpl).toContain('^FO256,83')
  })

  it('เอาต์พุตเป็น ASCII ล้วน', () => {
    const zpl = generateGt800ZPL(form, 1) + generateGt800ZPLVertical(form, 1)
    const isAscii = Array.from(zpl).every((ch) => ch.charCodeAt(0) <= 127)
    expect(isAscii).toBe(true)
  })

  it('ใช้ ^FO ไม่ใช่ ^F ที่คอลัมน์พลอย', () => {
    const zpl = generateGt800ZPL(form, 1)
    expect(zpl).not.toMatch(/\^F\d/)
  })
})

describe('layoutGt800Qr / generateGt800ZPLQr — layout ใหม่ (บล็อกข้อความ 4 บรรทัด + QR กลางพื้นที่ว่างขวา)', () => {
  // กรณี typical จาก spec ที่ verify กับเครื่องพิมพ์จริงแล้ว
  const typical = {
    productNameEn: '18K BRACELET WG D',
    stockNumberOrigin: 'AH21142',
    stockNumber: 'AH21142-XXXX',
    salePrice: 87600,
    gold: '5.19 g. Gold',
    madeIn: 'MADE IN THAILAND',
    publicUrl: 'https://app.duangkeaw.com/p/DK-18K-1XR-1747-EDTWQT5A'
  }

  // กรณี worst — ชื่อ/รหัส/ราคา/gold ยาวเกือบสุด
  const worst = {
    productNameEn: '18K BRACELET YG D/RU/White pearl',
    stockNumber: 'DK-18K-20A-12810',
    salePrice: 1234567,
    gold: '12.35 g. Gold',
    size: '#52',
    goldType: '18K',
    madeIn: 'MADE IN THAILAND',
    publicUrl: 'https://app.duangkeaw.com/p/DK-18K-20A-12810-ABCDEFGH'
  }

  it('layoutGt800Qr: กรณี typical → blockRight≈404.2, qrX=470', () => {
    const layout = layoutGt800Qr(typical)
    expect(layout.blockRight).toBeCloseTo(404.2, 1)
    expect(layout.qrX).toBe(470)
  })

  it('layoutGt800Qr: กรณี worst → qrX=517', () => {
    const layout = layoutGt800Qr(worst)
    expect(layout.qrX).toBe(517)
  })

  it('layoutGt800Qr: ข้อความยาวมาก → qrX ชนเพดาน 534', () => {
    const layout = layoutGt800Qr({
      productNameEn: 'X'.repeat(80),
      stockNumber: 'Y'.repeat(40),
      salePrice: 999999999,
      gold: 'Z'.repeat(40),
      publicUrl: 'https://app.duangkeaw.com/p/' + 'A'.repeat(60)
    })
    expect(layout.qrX).toBe(534)
  })

  it('generateGt800ZPLQr: header + MADE IN เหมือน generateGt800ZPL', () => {
    const zpl = generateGt800ZPLQr(worst, 1)
    expect(zpl.startsWith('^XA^LL104^MD15^LT0^XZ^XA')).toBe(true)
    expect(zpl).toContain(`^FO25,50^A0N,15,15^FD${worst.madeIn}^FS`)
  })

  it('generateGt800ZPLQr: 4 บรรทัดข้อความตรงตำแหน่งที่กำหนด และไม่มี goldType นำหน้าบรรทัดทอง', () => {
    const zpl = generateGt800ZPLQr(worst, 1)
    const code = 'DK-18K-20A-12810'
    expect(zpl).toContain(`^FO256,31^A0N,14,14^FD${worst.productNameEn}^FS`)
    expect(zpl).toContain(`^FO262,47^BY1,3.0:1,18^BCN,18,N,N^FD${code}^FS`)
    expect(zpl).toContain(`^FO256,68^A0N,15,15^FD${code} - 1,234,567.00^FS`)
    expect(zpl).toContain('^FO256,86^A0N,14,14^FD12.35 g. Gold #52^FS')
  })

  it('generateGt800ZPLQr: productNameEn ว่าง → ไม่มีฟิลด์บรรทัดชื่อ', () => {
    const zpl = generateGt800ZPLQr({ ...worst, productNameEn: '' }, 1)
    expect(zpl).not.toContain('^FO256,31')
  })

  it('generateGt800ZPLQr: ไม่มีข้อความพลอยแม้ form จะมีพลอย', () => {
    const zpl = generateGt800ZPLQr({ ...worst, gems: ['0.24ct.', '0.15ct.'] }, 1)
    expect(zpl).not.toContain('0.24')
    expect(zpl).not.toContain('ct.')
  })

  it('generateGt800ZPLQr: กรณี typical → ^FO470,13^BQN,2,2^FDLA,<url>^FS', () => {
    const zpl = generateGt800ZPLQr(typical, 1)
    expect(zpl).toContain(`^FO470,13^BQN,2,2^FDLA,${typical.publicUrl}^FS`)
  })

  it('generateGt800ZPLQr: กรณี worst → ^FO517,13^BQN,2,2^FDLA,<url>^FS', () => {
    const zpl = generateGt800ZPLQr(worst, 1)
    expect(zpl).toContain(`^FO517,13^BQN,2,2^FDLA,${worst.publicUrl}^FS`)
  })

  it('generateGt800ZPLQr: dpiScale 1.5 คูณทั้งตำแหน่งข้อความและ QR (ตำแหน่ง+magnification)', () => {
    const scale = 1.5
    const layout = layoutGt800Qr(worst)
    const zpl = generateGt800ZPLQr(worst, scale)
    const expectedMag = Math.max(1, Math.round(layout.mag * scale))

    expect(zpl).toContain(`^FO${Math.round(256 * scale)},${Math.round(31 * scale)}^A0N,${Math.round(14 * scale)},${Math.round(14 * scale)}^FD`)
    expect(zpl).toContain(
      `^FO${Math.round(layout.qrX * scale)},${Math.round(13 * scale)}^BQN,2,${expectedMag}^FDLA,${worst.publicUrl}^FS`
    )
  })

  it('generateGt800ZPLQr: publicUrl ว่าง → ไม่มี ^BQ', () => {
    const zpl = generateGt800ZPLQr({ ...worst, publicUrl: '' }, 1)
    expect(zpl).not.toContain('^BQ')
  })
})

describe('pickQrMagnification', () => {
  it('URL สั้น (≤17 ตัวอักษร) → 3', () => {
    const url = 'https://a.co/xyz'
    expect(url.length).toBeLessThanOrEqual(17)
    expect(pickQrMagnification(url)).toBe(3)
  })

  it('URL ยาว 49-53 ตัวอักษร (v3, 29 modules) → 2', () => {
    const url = 'https://app.duangkeaw.com/p/DK-18K-20A-12810-ABCDEFGH'
    expect(url.length).toBeGreaterThanOrEqual(49)
    expect(url.length).toBeLessThanOrEqual(53)
    expect(pickQrMagnification(url)).toBe(2)
  })

  it('URL ยาวมาก (เกินความจุ v6) → 2 (ไม่ต่ำกว่า 2)', () => {
    const url = 'https://app.duangkeaw.com/p/' + 'X'.repeat(150)
    expect(pickQrMagnification(url)).toBe(2)
  })
})
