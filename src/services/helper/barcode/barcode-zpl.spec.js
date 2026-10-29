import { describe, it, expect } from 'vitest'
import {
  resolveLabelCode,
  formatGemText,
  abbreviateGemText,
  formatLabelPrice,
  generateLegacyZPL,
  generateLegacyZPLVertical,
  generateGt800ZPL,
  generateGt800ZPLVertical,
  generateGt800ZPLQr,
  generateGt800ZPLSmall,
  layoutGt800Small,
  formatPriceCode,
  buildGemLabelMeta,
  detectGemCode,
  sortGt800LabelGems,
  buildGt800SmallLine2,
  pickQrMagnification,
  layoutGt800,
  layoutGt800Qr,
  REMARK_SYMBOLS,
  buildRemarkSymbolZpl,
  getRemarkPreviewChar
} from './barcode-zpl.js'

// สำเนาฟังก์ชันเดิมจาก commit 7048e5a^ (ก่อนย้ายไป DK Print Bridge) ไว้เทียบผลลัพธ์ตรงตัวอักษร
// ต้นฉบับใช้ formValue.stockNumber ตรงๆ (ไม่มี concept ของ stockNumberOrigin)
// ข้อความราคาใช้ formatLabelPrice (จำนวนเต็ม ตัดหลักสุดท้ายแทนด้วย R) ตามรูปแบบใหม่ — จุดเดียวที่ตั้งใจให้ต่างจากโค้ดต้นฉบับจริง
function originalGenerateZPLs(formValue) {
  let zpl = '^XA^LL200^MD25^LT40^XZ'
  zpl += '^XA'

  zpl += `^FO248,35^BY1,3.0:1,25^BCN,Y,N,N^FD${formValue.stockNumber || ''}^FS`

  const salePriceText = formatLabelPrice(formValue.salePrice)
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

  const priceText = hasPrice ? formatLabelPrice(formValue.price) : ''
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

// ไม่มี stockNumberOrigin → ป้ายตัดขีดออกจากเลขสินค้า (ตัวเลขพิกัดยังเหมือนต้นฉบับทุกตัวอักษร)
function stripDashForm(form) {
  return { ...form, stockNumber: String(form.stockNumber || '').replace(/-/g, '') }
}

describe('resolveLabelCode', () => {
  it('คืน stockNumberOrigin (trim แล้ว) ถ้ามีค่า', () => {
    expect(resolveLabelCode({ stockNumber: 'NEW-001', stockNumberOrigin: '  OLD-001  ' })).toBe('OLD-001')
  })

  it('ไม่มี stockNumberOrigin → คืน stockNumber', () => {
    expect(resolveLabelCode({ stockNumber: 'NEW001' })).toBe('NEW001')
  })

  it('ไม่มี stockNumberOrigin → ตัดขีดออกจาก stockNumber', () => {
    expect(resolveLabelCode({ stockNumber: 'DK-20G-123' })).toBe('DK20G123')
    expect(resolveLabelCode({ stockNumber: 'DK20I969' })).toBe('DK20I969')
  })

  it('stockNumberOrigin ชนะ stockNumber เสมอ แม้ stockNumber มีขีด', () => {
    expect(resolveLabelCode({ stockNumber: 'DK-20G-123', stockNumberOrigin: 'OLD123' })).toBe('OLD123')
  })

  it('stockNumberOrigin เป็นช่องว่างล้วน → fallback เป็น stockNumber', () => {
    expect(resolveLabelCode({ stockNumber: 'NEW-001', stockNumberOrigin: '   ' })).toBe('NEW001')
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

describe('formatLabelPrice', () => {
  it('23000 → 2300R', () => {
    expect(formatLabelPrice(23000)).toBe('2300R')
  })

  it('3050 → 305R', () => {
    expect(formatLabelPrice(3050)).toBe('305R')
  })

  it('87600.00 → 8760R', () => {
    expect(formatLabelPrice(87600.0)).toBe('8760R')
  })

  it('3050.75 → 305R (ตัดสตางค์ทิ้ง ไม่ปัดเศษ)', () => {
    expect(formatLabelPrice(3050.75)).toBe('305R')
  })

  it('23000.99 → 2300R (ตัดสตางค์ทิ้ง ไม่ปัดเศษขึ้น)', () => {
    expect(formatLabelPrice(23000.99)).toBe('2300R')
  })

  it('1234.9999999 (float error) → 123R', () => {
    expect(formatLabelPrice(1234.9999999)).toBe('123R')
  })

  it('3050.0000001 (float error) → 305R', () => {
    expect(formatLabelPrice(3050.0000001)).toBe('305R')
  })

  it('7 → R (หลักเดียว)', () => {
    expect(formatLabelPrice(7)).toBe('R')
  })

  it('0 → ค่าว่าง', () => {
    expect(formatLabelPrice(0)).toBe('')
  })

  it('ค่าติดลบ → ค่าว่าง', () => {
    expect(formatLabelPrice(-100)).toBe('')
  })

  it('null → ค่าว่าง', () => {
    expect(formatLabelPrice(null)).toBe('')
  })

  it('undefined → ค่าว่าง', () => {
    expect(formatLabelPrice(undefined)).toBe('')
  })

  it('string ตัวเลข "23000.50" → 2300R (coerce ด้วย Number())', () => {
    expect(formatLabelPrice('23000.50')).toBe('2300R')
  })

  it('string ตัวเลข "3050" → 305R', () => {
    expect(formatLabelPrice('3050')).toBe('305R')
  })

  it('string ไม่ใช่ตัวเลข → ค่าว่าง', () => {
    expect(formatLabelPrice('abc')).toBe('')
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
      expect(generateLegacyZPL(form)).toBe(originalGenerateZPLs(stripDashForm(form)))
    })

    it(`generateLegacyZPL: ${name} — มี stockNumberOrigin แทนเลขที่ผลิต`, () => {
      const withOrigin = { ...form, stockNumberOrigin: 'OLD-0007' }
      const expected = originalGenerateZPLs({ ...form, stockNumber: 'OLD-0007' })
      expect(generateLegacyZPL(withOrigin)).toBe(expected)
    })

    it(`generateLegacyZPLVertical: ${name} — ไม่มี stockNumberOrigin`, () => {
      expect(generateLegacyZPLVertical(form)).toBe(originalGenerateZPLVertical(stripDashForm(form)))
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

  it('แนวตั้ง: คอลัมน์พลอย x=428 ทั้งรหัสสั้นและรหัสยาว (ไม่มี level แล้ว)', () => {
    ;['BF300DI7WL4', 'DK-18K-1XR-1747'].forEach((stockNumber) => {
      const layout = layoutGt800({ stockNumber, gems: ['D-1.00'], salePrice: 1000 }, 'vertical')
      expect(layout.gemColumnX).toBe(428)
      expect(layout.levelName).toBeUndefined()
    })
  })

  it('DK-18K-1XR-1747 (รหัสยาว) แท็บ original → ROOMY (ไม่พิจารณาความยาวบาร์โค้ดแล้ว เพราะบาร์โค้ดอยู่ในซีกซ้าย)', () => {
    const form = {
      stockNumber: 'DK-18K-1XR-1747',
      gems: ['D-1.00'],
      salePrice: 1000
    }
    const layout = layoutGt800(form, 'original')
    expect(layout.levelName).toBe('ROOMY')
    expect(layout.gemColumnX).toBe(428)
  })

  it('รหัสสั้น ไม่มีพลอย → ROOMY', () => {
    const form = { stockNumber: 'A1', gems: [] }
    const layout = layoutGt800(form, 'original')
    expect(layout.levelName).toBe('ROOMY')
  })

  it('พลอย 3 บรรทัด แต่บรรทัดราคายาวเกิน 20 ตัวอักษร → TIGHT', () => {
    const form = {
      stockNumber: 'AB123',
      salePrice: 1234567890123.99, // ดันให้ codeLine ยาวเกิน 20 ตัวอักษร (ราคาแบบใหม่ตัดหลักท้าย ต้องใช้ตัวเลขหลักเยอะขึ้น)
      gems: ['0.24ct.', '0.15ct.', '0.10ct.']
    }
    const layout = layoutGt800(form, 'original')
    expect(layout.codeLine.length).toBeGreaterThan(20)
    expect(layout.levelName).toBe('TIGHT')
  })

  it('พลอยบรรทัดยาวเกิน 24 ตัวอักษร (หลัง formatGemText) → TIGHT แต่คอลัมน์พลอยยัง x=428 เท่าเดิม', () => {
    const form = {
      stockNumber: 'AB123',
      gems: ['ThisIsAVeryLongGemNameCt.5.00']
    }
    const layout = layoutGt800(form, 'original')
    expect(layout.levelName).toBe('TIGHT')
    expect(layout.gemColumnX).toBe(428)
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
    expect(zpl).toContain('^FO25,50^A0N,17,17^FD')
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

describe('layoutGt800 / generateGt800ZPL — แท็บ original ใหม่ (ชื่อสินค้า + gold line ไม่มี goldType + พลอย x=428)', () => {
  const form = {
    stockNumber: 'AH21142',
    salePrice: 12345,
    gold: 'PG',
    size: '55',
    goldType: '18K',
    madeIn: 'MADE IN THAILAND',
    productNameEn: 'Ring Test',
    gems: ['0.24ct.', '0.15ct.']
  }

  it('layoutGt800: ชื่อสั้นไม่ย่อฟอนต์ + คอลัมน์พลอยคงที่ x=428', () => {
    const layout = layoutGt800(form, 'original')
    expect(layout.productNameEn).toBe('Ring Test')
    expect(layout.nameFont).toEqual([16, 16])
    expect(layout.goldLine).toBe('PG #55')
    expect(layout.gemColumnX).toBe(428)
  })

  it('layoutGt800: ชื่อยาว 32 ตัวอักษร (เกินพื้นที่ 164 dots) → ย่อฟอนต์เหลือ [10,10]', () => {
    const layout = layoutGt800({ ...form, productNameEn: 'A'.repeat(32) }, 'original')
    expect(layout.nameFont).toEqual([10, 10])
  })

  it('layoutGt800: ฟอนต์พลอย — 1-4 รายการ → 16 สูง, 5+ จับคู่เป็นแถว สูง = floor(73/แถว) ไม่ต่ำกว่า 8', () => {
    const gems = (n) => Array.from({ length: n }, () => '0.10ct.')
    ;[1, 2, 3, 4].forEach((n) => {
      const l = layoutGt800({ ...form, gems: gems(n) }, 'original')
      expect(l.gemFont).toEqual([16, 16])
      expect(l.gemLineHeight).toBe(16)
      expect(l.gemRows.length).toBe(n)
    })
    const five = layoutGt800({ ...form, gems: gems(5) }, 'original')
    expect(five.gemRows.length).toBe(3)
    expect(five.gemFont).toEqual([16, 16])
    const seven = layoutGt800({ ...form, gems: gems(7) }, 'original')
    expect(seven.gemRows.length).toBe(4)
    expect(seven.gemFont).toEqual([16, 16])
    expect(31 + seven.gemRows.length * seven.gemLineHeight).toBeLessThanOrEqual(104)
    const twelve = layoutGt800({ ...form, gems: gems(12) }, 'original')
    expect(twelve.gemRows.length).toBe(6)
    expect(twelve.gemFont[0]).toBe(12)
    expect(layoutGt800({ ...form, gems: gems(30) }, 'original').gemFont[0]).toBe(8)
  })

  it('layoutGt800: บรรทัดพลอยยาวไม่ถูกตัด ย่อความกว้างให้พอดีขอบขวา และไม่ต่ำกว่า 9', () => {
    const long = layoutGt800({ ...form, gems: ['19Ruby 0.365 ct., RD - 1.5', '1Diamond 0.02 ct., G,VS1'] }, 'original')
    expect(long.formattedGems[0]).toBe('19RU 0.365ct RD - 1.5')
    expect(long.gemFont[0]).toBe(16)
    expect(long.gemFont[1]).toBeGreaterThanOrEqual(9)
    expect(428 + long.formattedGems[0].length * long.gemFont[1] * 0.46).toBeLessThanOrEqual(594)
    const huge = layoutGt800({ ...form, gems: ['ThisIsAVeryLongGemNameCt.5.00'] }, 'original')
    expect(huge.gemFont[1]).toBeGreaterThanOrEqual(9)
    expect(huge.gemFont[1]).toBeLessThan(16)
  })

  it('layoutGt800: lineHeight = ความสูงฟอนต์ ทั้ง original และแนวตั้ง ทุกจำนวนพลอย/ความยาว', () => {
    ;['original', 'vertical'].forEach((tpl) => {
      for (let n = 0; n <= 10; n++) {
        ;['0.10ct.', '19Ruby 0.365 ct., RD - 1.5', 'X'.repeat(40)].forEach((g) => {
          const l = layoutGt800({ ...form, price: 100, gems: Array.from({ length: n }, () => g) }, tpl)
          expect(l.gemLineHeight).toBe(l.gemFont[0])
          expect(l.gemFont[1]).toBeGreaterThanOrEqual(9)
          expect(31 + l.gemRows.length * l.gemLineHeight).toBeLessThanOrEqual(104)
        })
      }
    })
  })

  it('layoutGt800: แนวตั้ง 1-4 พลอย → 16, 5 พลอยจับคู่ 3 แถว', () => {
    const gems = (n) => Array.from({ length: n }, () => '0.10ct.')
    ;[1, 4].forEach((n) => {
      expect(layoutGt800({ ...form, price: 100, gems: gems(n) }, 'vertical').gemFont).toEqual([16, 16])
    })
    expect(layoutGt800({ ...form, price: 100, gems: gems(5) }, 'vertical').gemRows.length).toBe(3)
  })

  it('abbreviateGemText: ย่อชื่อพลอยเป็นรหัส master + ct', () => {
    expect(abbreviateGemText('120Diamond 0.297 ct., 0.8 RD')).toBe('120DI 0.297ct 0.8 RD')
    expect(abbreviateGemText(formatGemText('24Diamond0.24 ct. G,VS1'))).toBe('24DI 0.24ct G,VS1')
    expect(abbreviateGemText('4Yellow Sapphire 0.33 ct., 2.5 RD')).toBe('4YS 0.33ct 2.5 RD')
    expect(abbreviateGemText('4Sapphire 0.32 ct., 2.5 RD')).toBe('4SA 0.32ct 2.5 RD')
    expect(abbreviateGemText('3Burmese Ruby 0.15 ct.')).toBe('3RU 0.15ct')
    expect(abbreviateGemText('2Diamond CVD 0.10 ct.')).toBe('2DC 0.10ct')
    expect(abbreviateGemText('1diamond 0.02 CT., VVS2')).toBe('1DI 0.02ct VVS2')
  })

  it('abbreviateGemText: ไม่แตะเกรด และชื่อที่ไม่รู้จักคงเดิม', () => {
    expect(abbreviateGemText('1Diamond 0.02 ct., SI1')).toBe('1DI 0.02ct SI1')
    expect(abbreviateGemText('5Moonlight 0.5ct')).toBe('5Moonlight 0.5ct')
    expect(abbreviateGemText('2Rubyx 0.1 ct.')).toBe('2Rubyx 0.1ct')
    expect(abbreviateGemText('')).toBe('')
    expect(abbreviateGemText(null)).toBe('')
  })

  it('จับคู่พลอย: 4 รายการ → 4 แถว, 5 รายการ → 3 แถว คั่น 2 ช่องว่าง', () => {
    const four = layoutGt800({ ...form, gems: ['1Ruby 0.1ct.', '2Ruby 0.1ct.', '3Ruby 0.1ct.', '4Ruby 0.1ct.'] }, 'original')
    expect(four.gemRows).toEqual(four.formattedGems)
    const five = layoutGt800({ ...form, gems: ['1Ruby 0.1ct.', '2Ruby 0.1ct.', '3Ruby 0.1ct.', '4Ruby 0.1ct.', '5Ruby 0.1ct.'] }, 'original')
    expect(five.gemRows).toEqual(['1RU 0.1ct  2RU 0.1ct', '3RU 0.1ct  4RU 0.1ct', '5RU 0.1ct'])
  })

  it('พลอยจริง 7 รายการ → 4 แถว ความสูงฟอนต์ >= 14 และไม่ล้นล่างป้าย', () => {
    const real = [
      '2Diamond 0.03 ct., 1.5 RD',
      '120Diamond 0.297 ct., 0.8 RD',
      '4Fancy Sapphire 0.33 ct., 2.5 RD',
      '4Yellow Sapphire 0.33 ct., 2.5 RD',
      '4Yellow Sapphire 0.34 ct., 2.5 RD',
      '4Pink Sapphire 0.33 ct., 2.5 RD',
      '4Sapphire 0.32 ct., 2.5 RD'
    ]
    ;['original', 'vertical'].forEach((tpl) => {
      const l = layoutGt800({ ...form, price: 100, gems: real }, tpl)
      expect(l.gemRows.length).toBe(4)
      expect(l.gemFont[0]).toBeGreaterThanOrEqual(14)
      expect(31 + 4 * l.gemLineHeight).toBeLessThanOrEqual(104)
      expect(428 + Math.max(...l.gemRows.map((r) => r.length)) * l.gemFont[1] * 0.46).toBeLessThanOrEqual(594)
    })
  })

  it('layoutGt800: ฝั่งซ้าย (codeLineFont) ไม่เปลี่ยนตามฟอนต์พลอยใหม่', () => {
    expect(layoutGt800(form, 'original').codeLineFont).toEqual([18, 18])
  })

  it('layoutGt800: ชื่อว่าง → ไม่ย่อฟอนต์ (ยังเป็น [16,16] แม้ไม่ได้ใช้)', () => {
    const layout = layoutGt800({ ...form, productNameEn: '' }, 'original')
    expect(layout.productNameEn).toBe('')
    expect(layout.nameFont).toEqual([16, 16])
  })

  it('layoutGt800: goldLine ตัวอย่างจาก spec — gold "0.61 g. Gold" + size "#55" → "0.61 g. Gold #55"', () => {
    expect(layoutGt800({ gold: '0.61 g. Gold', size: '#55' }, 'original').goldLine).toBe('0.61 g. Gold #55')
  })

  it('layoutGt800: goldLine — size "55" (ไม่มี #) → เติม # ให้เป็น "0.61 g. Gold #55" เหมือนกัน', () => {
    expect(layoutGt800({ gold: '0.61 g. Gold', size: '55' }, 'original').goldLine).toBe('0.61 g. Gold #55')
  })

  it('layoutGt800: goldLine — size "#" หรือว่าง → ตัดไซซ์ทิ้งเหลือ "0.61 g. Gold"', () => {
    expect(layoutGt800({ gold: '0.61 g. Gold', size: '#' }, 'original').goldLine).toBe('0.61 g. Gold')
    expect(layoutGt800({ gold: '0.61 g. Gold', size: '' }, 'original').goldLine).toBe('0.61 g. Gold')
  })

  it('layoutGt800: goldLine ตัดช่องว่างหัว-ท้ายไซซ์ก่อนเช็ค', () => {
    expect(layoutGt800({ gold: '0.61 g. Gold', size: '  55  ' }, 'original').goldLine).toBe('0.61 g. Gold #55')
    expect(layoutGt800({ gold: '0.61 g. Gold', size: '  #  ' }, 'original').goldLine).toBe('0.61 g. Gold')
  })

  it('generateGt800ZPL: มีชื่อสินค้า → ฟิลด์ชื่อที่ x256,y31 font 16,16', () => {
    const zpl = generateGt800ZPL(form, 1)
    expect(zpl).toContain('^FO256,31^A0N,16,16^FDRing Test^FS')
  })

  it('generateGt800ZPL: ไม่มีชื่อสินค้า → ไม่มีฟิลด์ที่ x256,y31', () => {
    const zpl = generateGt800ZPL({ ...form, productNameEn: '' }, 1)
    expect(zpl).not.toContain('^FO256,31')
  })

  it('generateGt800ZPL: บาร์โค้ดที่ x262,y47 สูง 18', () => {
    const zpl = generateGt800ZPL(form, 1)
    expect(zpl).toContain('^FO262,47^BY1,3.0:1,18^BCN,18,N,N^FDAH21142^FS')
  })

  it('generateGt800ZPL: เลขที่ผลิต-ราคา ที่ x256,y68', () => {
    const zpl = generateGt800ZPL(form, 1)
    expect(zpl).toContain('^FO256,68^A0N,18,18^FDAH21142 - 1234R^FS')
  })

  it('generateGt800ZPL: บรรทัดทอง x256,y86 ไม่มี goldType นำหน้าอีกแล้ว', () => {
    const zpl = generateGt800ZPL(form, 1)
    expect(zpl).toContain('^FO256,86^A0N,16,16^FDPG #55^FS')
    expect(zpl).not.toContain('18K')
  })

  it('generateGt800ZPL: คอลัมน์พลอยอยู่ที่ x=428 (ไม่ใช่ 422/472 เหมือนเดิม)', () => {
    const zpl = generateGt800ZPL(form, 1)
    expect(zpl).toContain('^FO428,31^A0N,16,16^FD0.24ct^FS')
    expect(zpl).toContain('^FO428,47^A0N,16,16^FD0.15ct^FS')
  })

  it('generateGt800ZPL: บรรทัดพลอยพิมพ์ครั้งเดียวต่อบรรทัด (ไม่พิมพ์ซ้ำจำลองตัวหนา)', () => {
    const zpl = generateGt800ZPL(form, 1)
    expect(zpl).toContain('^FO428,31^A0N,16,16^FD0.24ct^FS')
    expect(zpl).toContain('^FO428,47^A0N,16,16^FD0.15ct^FS')
    expect(zpl).not.toContain('^FO441,')
    expect(zpl.split('^FD0.24ct^FS').length - 1).toBe(1)
  })

  it('generateGt800ZPL/Vertical: ที่ dpiScale 1.5 พลอยพิมพ์ครั้งเดียว', () => {
    const scale = 1.5
    const x = Math.round(428 * scale)
    const y = Math.round(31 * scale)
    const font = `${Math.round(16 * scale)},${Math.round(16 * scale)}`
    const zpl = generateGt800ZPL(form, scale)
    expect(zpl).toContain(`^FO${x},${y}^A0N,${font}^FD0.24ct^FS`)
    expect(zpl.split('^FD0.24ct^FS').length - 1).toBe(1)
    const vertical = generateGt800ZPLVertical(form, scale)
    expect(vertical.split('^FD0.24ct^FS').length - 1).toBe(1)
  })

  it('generateGt800ZPLVertical: พลอยพิมพ์ครั้งเดียวที่ x=428', () => {
    const zpl = generateGt800ZPLVertical(form, 1)
    expect(zpl).toContain('^FO428,31^A0N,16,16^FD0.24ct^FS')
    expect(zpl).not.toContain('^FO422,31')
    expect(zpl.split('^FD0.24ct^FS').length - 1).toBe(1)
  })

  it('generateGt800ZPLVertical: ฝั่งซ้ายทุกฟิลด์ (ชื่อ/ทอง/รหัส) ประมาณความกว้างแล้วไม่เกิน 420', () => {
    const cases = [
      form,
      { ...form, productNameEn: 'A'.repeat(30), gold: '12.35 g. Gold', size: '52', productNumber: 'BF300DI7WL4', price: 1234567 },
      { ...form, stockNumber: 'DK18K1XR1747', productNumber: 'X'.repeat(16), price: 99999999 }
    ]
    cases.forEach((f) => {
      const l = layoutGt800({ ...f, price: f.price ?? 58420 }, 'vertical')
      expect(l.nameFont[0]).toBe(l.nameFont[1])
      expect(256 + l.productNameEn.length * 7.2 * (l.nameFont[0] / 14)).toBeLessThanOrEqual(420)
      expect(256 + l.goldSizeLine.length * 7.1 * (l.goldFont[0] / 16)).toBeLessThanOrEqual(420)
      expect(256 + l.codeLine.length * 8.9 * (l.codeLineFont[0] / 17)).toBeLessThanOrEqual(420)
      expect(l.gemColumnX).toBe(428)
    })
  })

  it('layoutGt800 แนวตั้ง: ชื่อ/ทอง/รหัสสั้นคงฟอนต์เดิม 16/16/17 และบาร์โค้ด ≤11 ตัวจบก่อน 420, 12 ตัวจบก่อนแนวพับ 425', () => {
    const l = layoutGt800({ ...form, stockNumber: 'BF300DI7WL4', productNameEn: '18K BRACELET WG D', price: 58420 }, 'vertical')
    expect(l.nameFont).toEqual([16, 16])
    expect(l.goldFont).toEqual([16, 16])
    expect(l.codeLineFont).toEqual([17, 17])
    expect(l.barcodeEnd).toBeLessThanOrEqual(420)
    expect(layoutGt800({ stockNumber: 'DK18K1XR1747' }, 'vertical').barcodeEnd).toBeLessThan(425)
  })

  it('generateGt800ZPL: ไม่แตะบรรทัดอื่น (ชื่อ/ทอง/บาร์โค้ด พิมพ์ครั้งเดียว)', () => {
    const zpl = generateGt800ZPL(form, 1)
    expect(zpl.split('^FDRing Test^FS').length - 1).toBe(1)
    expect(zpl.split('^FDPG #55^FS').length - 1).toBe(1)
  })

  it('generateGt800ZPL: ชื่อยาว 32 ตัวอักษร → ฟิลด์ชื่อใช้ฟอนต์ 10,10', () => {
    const longName = 'A'.repeat(32)
    const zpl = generateGt800ZPL({ ...form, productNameEn: longName }, 1)
    expect(zpl).toContain(`^FO256,31^A0N,10,10^FD${longName}^FS`)
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

  it('layoutGt800Qr: กรณี typical → blockRight≈395.4, qrX=466', () => {
    const layout = layoutGt800Qr(typical)
    expect(layout.blockRight).toBeCloseTo(395.4, 1)
    expect(layout.qrX).toBe(466)
  })

  it('layoutGt800Qr: กรณี worst → qrX=528', () => {
    const layout = layoutGt800Qr(worst)
    expect(layout.qrX).toBe(528)
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
    expect(zpl).toContain(`^FO25,50^A0N,17,17^FD${worst.madeIn}^FS`)
  })

  it('generateGt800ZPLQr: 4 บรรทัดข้อความตรงตำแหน่งที่กำหนด และไม่มี goldType นำหน้าบรรทัดทอง', () => {
    const zpl = generateGt800ZPLQr(worst, 1)
    const code = 'DK18K20A12810'
    expect(zpl).toContain(`^FO256,31^A0N,16,16^FD${worst.productNameEn}^FS`)
    expect(zpl).toContain(`^FO262,47^BY1,3.0:1,18^BCN,18,N,N^FD${code}^FS`)
    expect(zpl).toContain(`^FO256,68^A0N,17,17^FD${code} - 123456R^FS`)
    expect(zpl).toContain('^FO256,86^A0N,16,16^FD12.35 g. Gold #52^FS')
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

  it('generateGt800ZPLQr: กรณี typical → ^FO466,13^BQN,2,2^FDLA,<url>^FS', () => {
    const zpl = generateGt800ZPLQr(typical, 1)
    expect(zpl).toContain(`^FO466,13^BQN,2,2^FDLA,${typical.publicUrl}^FS`)
  })

  it('generateGt800ZPLQr: กรณี worst → ^FO528,13^BQN,2,2^FDLA,<url>^FS', () => {
    const zpl = generateGt800ZPLQr(worst, 1)
    expect(zpl).toContain(`^FO528,13^BQN,2,2^FDLA,${worst.publicUrl}^FS`)
  })

  it('generateGt800ZPLQr: dpiScale 1.5 คูณทั้งตำแหน่งข้อความและ QR (ตำแหน่ง+magnification)', () => {
    const scale = 1.5
    const layout = layoutGt800Qr(worst)
    const zpl = generateGt800ZPLQr(worst, scale)
    const expectedMag = Math.max(1, Math.round(layout.mag * scale))

    expect(zpl).toContain(`^FO${Math.round(256 * scale)},${Math.round(31 * scale)}^A0N,${Math.round(16 * scale)},${Math.round(16 * scale)}^FD`)
    expect(zpl).toContain(
      `^FO${Math.round(layout.qrX * scale)},${Math.round(13 * scale)}^BQN,2,${expectedMag}^FDLA,${worst.publicUrl}^FS`
    )
  })

  it('generateGt800ZPLQr: publicUrl ว่าง → ไม่มี ^BQ', () => {
    const zpl = generateGt800ZPLQr({ ...worst, publicUrl: '' }, 1)
    expect(zpl).not.toContain('^BQ')
  })
})

describe('GT800 rotate180 — ^POI^PW600 หลัง ^XA ตัวที่สอง', () => {
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

  const qrForm = {
    productNameEn: '18K BRACELET WG D',
    stockNumberOrigin: 'AH21142',
    stockNumber: 'AH21142-XXXX',
    salePrice: 87600,
    gold: '5.19 g. Gold',
    madeIn: 'MADE IN THAILAND',
    publicUrl: 'https://app.duangkeaw.com/p/DK-18K-1XR-1747-EDTWQT5A'
  }

  it('rotate180 ปิด (ไม่ส่ง options) → เอาต์พุตเหมือนเดิมทุกตัวอักษร ทั้ง 3 builder', () => {
    expect(generateGt800ZPL(form, 1)).toBe(generateGt800ZPL(form, 1, { rotate180: false }))
    expect(generateGt800ZPLVertical(form, 1)).toBe(generateGt800ZPLVertical(form, 1, { rotate180: false }))
    expect(generateGt800ZPLQr(qrForm, 1)).toBe(generateGt800ZPLQr(qrForm, 1, { rotate180: false }))

    expect(generateGt800ZPL(form, 1, { rotate180: false })).not.toContain('^POI^PW600')
    expect(generateGt800ZPLVertical(form, 1, { rotate180: false })).not.toContain('^POI^PW600')
    expect(generateGt800ZPLQr(qrForm, 1, { rotate180: false })).not.toContain('^POI^PW600')
  })

  it('rotate180 เปิด → มี ^POI^PW600 ต่อท้าย ^XA ตัวที่สอง ทั้ง 3 builder', () => {
    const zpl = generateGt800ZPL(form, 1, { rotate180: true })
    const zplVertical = generateGt800ZPLVertical(form, 1, { rotate180: true })
    const zplQr = generateGt800ZPLQr(qrForm, 1, { rotate180: true })

    expect(zpl).toContain('^XA^LL104^MD15^LT0^XZ^XA^POI^PW600')
    expect(zplVertical).toContain('^XA^LL104^MD15^LT0^XZ^XA^POI^PW600')
    expect(zplQr).toContain('^XA^LL104^MD15^LT0^XZ^XA^POI^PW600')
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

describe('GT800 original — สัญลักษณ์หมายเหตุ (remarkSymbol)', () => {
  const form = {
    stockNumber: 'AH21142',
    salePrice: 12345,
    gold: 'PG',
    size: '55',
    madeIn: 'MADE IN THAILAND',
    productNameEn: 'Ring Test',
    gems: ['0.24ct.']
  }

  it('ไม่ระบุ/none/ไม่รู้จัก → ZPL เหมือนเดิมทุกตัวอักษร และไม่มี flag no-room', () => {
    const base = generateGt800ZPL(form, 1)
    expect(generateGt800ZPL({ ...form, remarkSymbol: '' }, 1)).toBe(base)
    expect(generateGt800ZPL({ ...form, remarkSymbol: 'none' }, 1)).toBe(base)
    expect(generateGt800ZPL({ ...form, remarkSymbol: 'bogus' }, 1)).toBe(base)
    expect(base).not.toContain('^GC')
    expect(base).not.toContain('^GB')
    const layout = layoutGt800({ ...form, remarkSymbol: 'bogus' }, 'original')
    expect(layout.remark).toBeNull()
    expect(layout.remarkNoRoom).toBe(false)
  })

  it('ทั้ง 8 สัญลักษณ์ที่ dpiScale=1', () => {
    expect(REMARK_SYMBOLS).toEqual([
      'star', 'hash', 'plus', 'at', 'circle-filled', 'circle-outline', 'square-filled', 'square-outline'
    ])
    expect(buildRemarkSymbolZpl('star', 100, 31)).toBe('^FO100,31^A0N,16,16^FD*^FS')
    expect(buildRemarkSymbolZpl('hash', 100, 31)).toBe('^FO100,31^A0N,16,16^FD#^FS')
    expect(buildRemarkSymbolZpl('plus', 100, 31)).toBe('^FO100,31^A0N,16,16^FD+^FS')
    expect(buildRemarkSymbolZpl('at', 100, 31)).toBe('^FO100,31^A0N,16,16^FD@^FS')
    expect(buildRemarkSymbolZpl('circle-filled', 100, 31)).toBe('^FO100,31^GC14,14,B^FS')
    expect(buildRemarkSymbolZpl('circle-outline', 100, 31)).toBe('^FO100,31^GC14,2,B^FS')
    expect(buildRemarkSymbolZpl('square-filled', 100, 31)).toBe('^FO100,31^GB14,14,14^FS')
    expect(buildRemarkSymbolZpl('square-outline', 100, 31)).toBe('^FO100,31^GB14,14,2^FS')
    expect(buildRemarkSymbolZpl('none', 100, 31)).toBe('')
    REMARK_SYMBOLS.forEach((k) => expect(getRemarkPreviewChar(k)).not.toBe(''))
  })

  it('คูณ dpiScale (300dpi ~1.478)', () => {
    expect(buildRemarkSymbolZpl('circle-filled', 100, 31, 2)).toBe('^FO200,62^GC28,28,B^FS')
    expect(buildRemarkSymbolZpl('square-outline', 100, 31, 2)).toBe('^FO200,62^GB28,28,4^FS')
  })

  it('ชื่อสั้น → วางท้ายชื่อบนแถวชื่อ และ ZPL ของสัญลักษณ์อยู่ใน output ครั้งเดียว ไม่ปนในบาร์โค้ด', () => {
    const layout = layoutGt800({ ...form, remarkSymbol: 'circle-filled' }, 'original')
    // 'Ring Test' 9 ตัว × 7.2 × 16/14 = 74.06 + gap 10 → 256 + 84.06 = 340
    expect(layout.remark).toEqual({ key: 'circle-filled', x: 340, y: 31, row: 'name' })
    const zpl = generateGt800ZPL({ ...form, remarkSymbol: 'circle-filled' }, 1)
    expect(zpl.split('^GC14,14,B').length - 1).toBe(1)
    expect(zpl).toContain('^FO340,31^GC14,14,B^FS')
    expect(zpl).toContain('^FD' + 'AH21142' + '^FS')
    expect(zpl).not.toMatch(/\^BCN[^^]*\^FD[^^]*[*#+@]/)
  })

  it('ชื่อยาวเต็มพื้นที่ → fallback ท้ายบรรทัดทอง (y=86)', () => {
    const layout = layoutGt800({ ...form, productNameEn: 'A'.repeat(32), remarkSymbol: 'star' }, 'original')
    // 'PG #55' 6 ตัว × 7.1 = 42.6 + 10 → 256 + 52.6 = 309
    expect(layout.remark).toEqual({ key: 'star', x: 309, y: 86, row: 'gold' })
    expect(layout.remarkNoRoom).toBe(false)
  })

  it('ไม่มีที่ทั้งสองแถว → ไม่พิมพ์ + remarkNoRoom=true', () => {
    const f = { ...form, productNameEn: 'A'.repeat(32), gold: 'G'.repeat(22), size: '', remarkSymbol: 'star' }
    const layout = layoutGt800(f, 'original')
    expect(layout.remark).toBeNull()
    expect(layout.remarkNoRoom).toBe(true)
    const withoutRemark = generateGt800ZPL({ ...f, remarkSymbol: '' }, 1)
    expect(generateGt800ZPL(f, 1)).toBe(withoutRemark)
  })

  it('ไม่กระทบแท็บอื่น (vertical / QR) และตำแหน่งสัญลักษณ์จบก่อนแนวพับ 420', () => {
    const v = generateGt800ZPLVertical(form, 1)
    expect(generateGt800ZPLVertical({ ...form, remarkSymbol: 'star' }, 1)).toBe(v)
    const q = generateGt800ZPLQr({ ...form, publicUrl: 'https://a.co/x' }, 1)
    expect(generateGt800ZPLQr({ ...form, publicUrl: 'https://a.co/x', remarkSymbol: 'star' }, 1)).toBe(q)
    for (let n = 0; n <= 40; n++) {
      const l = layoutGt800({ ...form, productNameEn: 'A'.repeat(n), remarkSymbol: 'at' }, 'original')
      if (l.remark) expect(l.remark.x + 14).toBeLessThanOrEqual(420)
    }
  })
})

describe('hidePrice — ไม่แสดงราคาบนป้าย', () => {
  const form = {
    stockNumber: 'AH21142',
    productNumber: 'PN-001',
    salePrice: 12345,
    price: 12345,
    gold: 'PG',
    size: '55',
    madeIn: 'MADE IN THAILAND',
    productNameEn: 'Ring Test',
    gems: ['0.24ct.'],
    publicUrl: 'https://a.co/x'
  }
  const PRICE_TEXT = '1234R'

  it('legacy original: hidePrice=true ไม่มีราคา เหลือแค่รหัส / false และไม่ระบุ = ของเดิม', () => {
    const base = generateLegacyZPL(form)
    expect(base).toContain(`^FDAH21142 - ${PRICE_TEXT}^FS`)
    expect(generateLegacyZPL({ ...form, hidePrice: false })).toBe(base)
    const hidden = generateLegacyZPL({ ...form, hidePrice: true })
    expect(hidden).not.toContain(PRICE_TEXT)
    expect(hidden).toContain('^FO248,65^A0N,20,18^FDAH21142^FS')
  })

  it('legacy vertical: hidePrice=true ไม่มีราคา + ความสูงป้ายแบบไม่มีราคา (200) / false = ของเดิม (220)', () => {
    const base = generateLegacyZPLVertical(form)
    expect(base).toContain('^LL220')
    expect(base).toContain(`PN-001 - ${PRICE_TEXT}`)
    expect(generateLegacyZPLVertical({ ...form, hidePrice: false })).toBe(base)
    const hidden = generateLegacyZPLVertical({ ...form, hidePrice: true })
    expect(hidden).not.toContain(PRICE_TEXT)
    expect(hidden).toContain('^LL200')
    expect(hidden).toContain('^FO250,100^A0N,14,16,B^FDPN-001^FS')
  })

  it('gt800 original: hidePrice=true ไม่มีราคาใน layout/ZPL / false = ของเดิม', () => {
    const base = generateGt800ZPL(form, 1)
    expect(layoutGt800(form, 'original').codeLine).toBe(`AH21142 - ${PRICE_TEXT}`)
    expect(generateGt800ZPL({ ...form, hidePrice: false }, 1)).toBe(base)
    const layout = layoutGt800({ ...form, hidePrice: true }, 'original')
    expect(layout.codeLine).toBe('AH21142')
    expect(generateGt800ZPL({ ...form, hidePrice: true }, 1)).not.toContain(PRICE_TEXT)
  })

  it('gt800 vertical: hidePrice=true เหลือแค่ productNumber / false = ของเดิม', () => {
    const base = generateGt800ZPLVertical(form, 1)
    expect(layoutGt800(form, 'vertical').codeLine).toBe(`PN-001 - ${PRICE_TEXT}`)
    expect(generateGt800ZPLVertical({ ...form, hidePrice: false }, 1)).toBe(base)
    expect(layoutGt800({ ...form, hidePrice: true }, 'vertical').codeLine).toBe('PN-001')
    const hidden = generateGt800ZPLVertical({ ...form, hidePrice: true }, 1)
    expect(hidden).not.toContain(PRICE_TEXT)
    expect(hidden).toContain('^FDPN-001^FS')
  })

  it('gt800 QR: hidePrice=true ไม่มีราคา / false = ของเดิม', () => {
    const base = generateGt800ZPLQr(form, 1)
    expect(layoutGt800Qr(form).codeLine).toBe(`AH21142 - ${PRICE_TEXT}`)
    expect(generateGt800ZPLQr({ ...form, hidePrice: false }, 1)).toBe(base)
    expect(layoutGt800Qr({ ...form, hidePrice: true }).codeLine).toBe('AH21142')
    expect(generateGt800ZPLQr({ ...form, hidePrice: true }, 1)).not.toContain(PRICE_TEXT)
  })
})

describe('GT800 original — เลขลำดับชิ้น (unitMark) ตัวเลือก ค่าเริ่มต้นไม่พิมพ์', () => {
  const form = {
    stockNumber: 'AH21142',
    salePrice: 12345,
    gold: 'PG',
    size: '55',
    madeIn: 'MADE IN THAILAND',
    productNameEn: 'Ring Test',
    gems: ['0.24ct.']
  }

  it('ไม่ระบุ/ว่าง → ZPL เหมือนเดิมทุกตัวอักษร', () => {
    const base = generateGt800ZPL(form, 1)
    expect(generateGt800ZPL({ ...form, unitMark: '' }, 1)).toBe(base)
    expect(generateGt800ZPL({ ...form, unitMark: null }, 1)).toBe(base)
    expect(generateGt800ZPL({ ...form, unitMark: '   ' }, 1)).toBe(base)
    expect(layoutGt800(form, 'original').unitMark).toBeNull()
    expect(layoutGt800(form, 'original').unitMarkNoRoom).toBe(false)
  })

  it('ระบุ → เพิ่มเฉพาะฟิลด์เลขชิ้นท้ายบรรทัดทอง ส่วนอื่นไม่เปลี่ยน', () => {
    const base = generateGt800ZPL(form, 1)
    const withMark = generateGt800ZPL({ ...form, unitMark: '3/6' }, 1)
    const layout = layoutGt800({ ...form, unitMark: '3/6' }, 'original')
    expect(layout.unitMark).toMatchObject({ text: '3/6', row: 'gold', y: 86 })
    const field = `^FO${layout.unitMark.x},86^A0N,16,16^FD3/6^FS`
    expect(withMark).toContain(field)
    expect(withMark.replace(field, '')).toBe(base)
  })

  it('dpiScale คูณพิกัดและฟอนต์', () => {
    const layout = layoutGt800({ ...form, unitMark: '3/6' }, 'original')
    const zpl = generateGt800ZPL({ ...form, unitMark: '3/6' }, 1.5)
    expect(zpl).toContain(`^FO${Math.round(layout.unitMark.x * 1.5)},129^A0N,24,24^FD3/6^FS`)
  })

  it('อยู่แถวทองเดียวกับสัญลักษณ์หมายเหตุ → เลื่อนหลบ', () => {
    const longName = { ...form, productNameEn: 'A very long product name that fills the row', remarkSymbol: 'star' }
    const layout = layoutGt800({ ...longName, unitMark: '3/6' }, 'original')
    if (layout.remark?.row === 'gold' && layout.unitMark) {
      expect(layout.unitMark.x).toBeGreaterThan(layout.remark.x)
    }
  })

  it('ไม่มีที่ทั้งสองแถว → ไม่พิมพ์ + unitMarkNoRoom=true', () => {
    const crowded = { ...form, gold: 'PG PG PG PG PG PG PG', size: '55555', salePrice: 123456789012, unitMark: '80/80' }
    const layout = layoutGt800(crowded, 'original')
    expect(layout.unitMark).toBeNull()
    expect(layout.unitMarkNoRoom).toBe(true)
    expect(generateGt800ZPL(crowded, 1)).not.toContain('^FD80/80^FS')
  })
})

describe('ป้าย 50×14 มม. (GT800)', () => {
  const base = {
    stockNumber: 'DK21AH047',
    stockNumberOrigin: 'AH21047',
    mold: 'NF6121SW',
    salePrice: 409500,
    goldWeight: '11.78',
    goldColorCode: 'WG',
    goldKarat: '18K',
    gems: ['24Diamond0.24 ct. G,VS1', '1Ruby 0.50 ct., OV']
  }

  describe('formatPriceCode', () => {
    it.each([
      [409500, '040950'],
      [409551, '040955'],
      ['5200', '0520'],
      [12345.9, '01234']
    ])('%s -> %s', (value, expected) => {
      expect(formatPriceCode(value)).toBe(expected)
    })

    it.each([0, -5, null, undefined, '', 'abc', 7])('%s -> ไม่มีรหัสราคา', (value) => {
      expect(formatPriceCode(value)).toBe('')
    })
  })

  describe('บรรทัด 2', () => {
    it('ราคา + สี + กะรัต + น้ำหนัก', () => {
      expect(buildGt800SmallLine2(base)).toBe('040950WG18K  11.78g')
    })

    it('ซ่อนราคา -> เหลือสี กะรัต น้ำหนัก', () => {
      expect(buildGt800SmallLine2({ ...base, hidePrice: true })).toBe('WG18K  11.78g')
    })

    it('เงิน/ไม่มีข้อมูลทอง -> ไม่ต่อสีกับกะรัต', () => {
      expect(buildGt800SmallLine2({ ...base, goldColorCode: '', goldKarat: '' })).toBe('040950  11.78g')
    })

    it('ซ่อนราคา + ไม่มีข้อมูลทอง -> เหลือแต่น้ำหนัก', () => {
      expect(buildGt800SmallLine2({ ...base, hidePrice: true, goldColorCode: '', goldKarat: '' })).toBe('11.78g')
    })
  })

  describe('การเรียงพลอย', () => {
    const gems = ['1Peridot 0.7 ct.', '1Ruby 0.5 ct.', '1Tanzanite 0.5 ct.', '1Diamond 0.1 ct.', '1Onyx 1 ct.', '1Emerald 0.3 ct.']

    it('API เก่า (ไม่มี meta) ใช้ลำดับสำรอง DI,RU,SA,EM,PS,YS,AM,BT,CI,GA,PE แล้วที่เหลือเรียงตามรหัส', () => {
      expect(sortGt800LabelGems(gems)).toEqual(['1 DI 0.1ct', '1 RU 0.5ct', '1 EM 0.3ct', '1 PE 0.7ct', '1 ON 1ct', '1 TZ 0.5ct'])
    })

    it('meta จาก API: labelSort ชนะ, null ต่อท้ายเรียงตาม labelCode, ใช้ labelCode แทน code', () => {
      const meta = buildGemLabelMeta([
        { code: 'DI', labelCode: 'DM', labelSort: 5 },
        { code: 'RU', labelCode: 'RU', labelSort: 1 },
        { code: 'PE', labelCode: 'PE', labelSort: null },
        { code: 'TZ', labelCode: 'AA', labelSort: null }
      ])
      expect(sortGt800LabelGems(['1Diamond 0.1 ct.', '1Peridot 0.7 ct.', '1Tanzanite 0.5 ct.', '1Ruby 0.5 ct.'], meta)).toEqual([
        '1 RU 0.5ct',
        '1 DM 0.1ct',
        '1 AA 0.5ct',
        '1 PE 0.7ct'
      ])
    })

    it('detectGemCode เจอชื่อเต็มและรหัสย่อ', () => {
      expect(detectGemCode('3Pink Sapphire 0.4 ct.')).toBe('PS')
      expect(detectGemCode('24DI 0.24ct')).toBe('DI')
      expect(detectGemCode('')).toBe('')
    })

    it('ไม่มีพลอย -> ไม่มีแถว', () => {
      expect(sortGt800LabelGems([])).toEqual([])
      expect(sortGt800LabelGems(undefined)).toEqual([])
    })
  })

  describe('layout และ ZPL', () => {
    it('บรรทัด 1 แม่พิมพ์ - เลขที่ผลิต และบาร์โค้ดเดียวกับป้าย original', () => {
      const layout = layoutGt800Small(base)
      expect(layout.line1).toBe('NF6121SW - AH21047')
      expect(layout.code).toBe(layoutGt800(base, 'original').code)
    })

    it('hideMold หรือไม่มี mold -> บรรทัด 1 เหลือเลขที่ผลิต', () => {
      expect(layoutGt800Small({ ...base, hideMold: true }).line1).toBe('AH21047')
      expect(layoutGt800Small({ ...base, mold: '' }).line1).toBe('AH21047')
    })

    it('แม่พิมพ์ยาว ย่อฟอนต์ ไม่ล้ำแนวพับ', () => {
      const layout = layoutGt800Small({ ...base, mold: 'CN-24000XXWPG-LONG', stockNumberOrigin: 'DK18K1XR1747' })
      expect(layout.line1Font[1]).toBeLessThan(22)
      expect(layout.line1.length * layout.line1Font[1] * 0.54).toBeLessThanOrEqual(185)
    })

    it('แม่พิมพ์ยาวเกินจนฟอนต์ถึงขั้นต่ำ -> ตัดท้ายแม่พิมพ์ ไม่ตัดเลขที่ผลิต', () => {
      const layout = layoutGt800Small({ ...base, mold: 'M'.repeat(60) })
      expect(layout.line1.endsWith(' - AH21047')).toBe(true)
      expect(layout.line1.length * layout.line1Font[1] * 0.54).toBeLessThanOrEqual(185)
    })

    it('พลอย 11 รายการ ยังพอดีพื้นที่หลังป้าย', () => {
      const gems = Array.from({ length: 11 }, (_, i) => `${i + 1}Diamond 0.${i + 10} ct., G,VS1`)
      const layout = layoutGt800Small({ ...base, gems })
      expect(layout.gemRows.length * layout.gemLineHeight).toBeLessThanOrEqual(96)
      layout.gemRows.forEach((row) => {
        expect(row.length * layout.gemFont[1] * 0.46).toBeLessThanOrEqual(185)
      })
    })

    it('ZPL: ^LL112, บรรทัดข้อความ, บาร์โค้ด, พลอยเริ่ม x=208 เรียงตาม labelSort', () => {
      const meta = buildGemLabelMeta([
        { code: 'RU', labelCode: 'RU', labelSort: 1 },
        { code: 'DI', labelCode: 'DI', labelSort: 2 }
      ])
      const zpl = generateGt800ZPLSmall({ ...base, gemLabelMeta: meta })
      expect(zpl.startsWith('^XA^LL112^MD15^LT0^XZ^XA')).toBe(true)
      expect(zpl).toContain('^FO10,8^A0N,22,19^FDNF6121SW - AH21047^FS')
      expect(zpl).toContain('^BCN,32,N,N^FDAH21047^FS')
      expect(zpl).toContain('^FD040950WG18K  11.78g^FS')
      expect(zpl).toContain('^FO208,8^A0N,18,18^FD1 RU 0.50ct OV^FS')
      expect(zpl.endsWith('^XZ')).toBe(true)
    })

    it('rotate180 ใช้ ^PW400', () => {
      expect(generateGt800ZPLSmall(base, 1, { rotate180: true })).toContain('^POI^PW400')
    })

    it('dpiScale 300 คูณพิกัดทุกจุด', () => {
      const zpl = generateGt800ZPLSmall(base, 300 / 203)
      expect(zpl).toContain('^LL166')
      expect(zpl).toContain('^FO15,12')
    })

    it('ป้ายเดิมไม่เปลี่ยน: header เดิมยังเป็น ^LL104 และ rotate180 ยังเป็น ^PW600', () => {
      expect(generateGt800ZPL(base, 1)).toContain('^XA^LL104^MD15^LT0^XZ^XA')
      expect(generateGt800ZPL(base, 1, { rotate180: true })).toContain('^POI^PW600')
    })
  })
})
