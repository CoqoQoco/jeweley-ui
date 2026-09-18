import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { zebraPrinterApi } from './zebra-store.js'

// สำเนาฟังก์ชันเดิมก่อน refactor (ไม่มี dpiScale) ไว้เทียบผลลัพธ์ตรงๆ — กันฉลากเพี้ยนตอนย้ายไป DK Print Bridge
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

// ของเดิมบางจุดเขียนเลขนำศูนย์ (^FO250,090 / ^FO025,050) — ZPL ตีความเท่ากับไม่มีเลขนำศูนย์ จึง normalize ก่อนเทียบ
function normalizeZpl(str) {
  return str.replace(/\^FO(\d+),(\d+)/g, (_, x, y) => `^FO${Number(x)},${Number(y)}`)
}

describe('zebraPrinterApi generateZPLs/generateZPLVertical ที่ dpiScale = 1 ต้องเหมือนของเดิมเป๊ะ', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const baseForm = {
    stockNumber: 'RG-1234-001',
    salePrice: 12345.5,
    gold: 'PG',
    size: '55',
    madeIn: 'MADE IN THAILAND',
    goldType: '18K',
    gems: ['D-1.00', 'R-0.50', '']
  }

  it('generateZPLs: dpiScale=1 เทียบเท่าฟังก์ชันเดิม', () => {
    const store = zebraPrinterApi()
    const actual = store.generateZPLs(baseForm, 1)
    const expected = originalGenerateZPLs(baseForm)
    expect(normalizeZpl(actual)).toBe(normalizeZpl(expected))
  })

  it('generateZPLs: ไม่ระบุ dpiScale (default) ต้องเหมือนกับระบุ 1', () => {
    const store = zebraPrinterApi()
    expect(store.generateZPLs(baseForm)).toBe(store.generateZPLs(baseForm, 1))
  })

  it('generateZPLVertical: dpiScale=1 เทียบเท่าฟังก์ชันเดิม (ไม่มีราคา)', () => {
    const store = zebraPrinterApi()
    const form = { ...baseForm, productNameEn: 'Ring Test', productNumber: 'PN-001' }
    const actual = store.generateZPLVertical(form, 1)
    const expected = originalGenerateZPLVertical(form)
    expect(normalizeZpl(actual)).toBe(normalizeZpl(expected))
  })

  it('generateZPLVertical: dpiScale=1 เทียบเท่าฟังก์ชันเดิม (มีราคา → label สูงขึ้น)', () => {
    const store = zebraPrinterApi()
    const form = { ...baseForm, productNameEn: 'Ring Test', productNumber: 'PN-001', price: 9999.99 }
    const actual = store.generateZPLVertical(form, 1)
    const expected = originalGenerateZPLVertical(form)
    expect(normalizeZpl(actual)).toBe(normalizeZpl(expected))
  })

  it('generateZPLs: dpiScale อื่น (300dpi) ต้อง scale พิกัดตามสัดส่วนจริง', () => {
    const store = zebraPrinterApi()
    const scale = 300 / 203
    const zpl = store.generateZPLs(baseForm, scale)
    expect(zpl).toContain(`^LL${Math.round(200 * scale)}`)
    expect(zpl).toContain(`^FO${Math.round(248 * scale)},${Math.round(35 * scale)}`)
  })
})
