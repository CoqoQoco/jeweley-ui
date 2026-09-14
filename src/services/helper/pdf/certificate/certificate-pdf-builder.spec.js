import { describe, it, expect } from 'vitest'
import { CertificatePdfBuilder } from './certificate-pdf-builder.js'

function baseCertificate(overrides = {}) {
  return {
    certificateNo: 'DKC-AH1',
    itemNo: 'AH1',
    issueDate: '1 January 2026',
    description: 'Ring',
    stockNumber: 'DK-1',
    selected: true,
    ...overrides
  }
}

describe('CertificatePdfBuilder — dk mode (default, ไม่ส่ง brand)', () => {
  it('header/terms เป็น Duangkaew Jewelry เหมือนเดิม', () => {
    const builder = new CertificatePdfBuilder([baseCertificate()], { signerTitle: 'GM' })
    const json = JSON.stringify(builder.getDocDefinition())

    expect(json).toContain('CERTIFICATE OF AUTHENTICITY')
    expect(json).toContain('Duangkaew Jewelry')
    expect(json).toContain('manufactured and inspected by Duangkaew Jewelry Manufacturer Co., Ltd.')
  })
})

describe('CertificatePdfBuilder — customer mode', () => {
  it('showManufacturer=false → ไม่มี "Duangkaew Jewelry" ในเอกสารเลย ใช้ข้อความ issued by แทน', () => {
    const builder = new CertificatePdfBuilder([baseCertificate()], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH', showManufacturer: false, showQr: false }
    })
    const json = JSON.stringify(builder.getDocDefinition())

    expect(json).not.toContain('Duangkaew Jewelry')
    expect(json).toContain('HARISH')
    expect(json).toContain('issued by HARISH')
  })

  it('showManufacturer=true → มีบรรทัด manufactured by ... for {brandName} + บรรทัด Manufactured by ในลายเซ็น', () => {
    const builder = new CertificatePdfBuilder([baseCertificate()], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH', showManufacturer: true, showQr: false }
    })
    const json = JSON.stringify(builder.getDocDefinition())

    expect(json).toContain('manufactured by Duangkaew Jewelry Manufacturer Co., Ltd. for HARISH')
    expect(json).toContain('Manufactured by Duangkaew Jewelry Manufacturer Co., Ltd.')
  })

  it('showManufacturer=false → ไม่มีบรรทัด Manufactured by ในลายเซ็น', () => {
    const builder = new CertificatePdfBuilder([baseCertificate()], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH', showManufacturer: false, showQr: false }
    })
    const json = JSON.stringify(builder.getDocDefinition())

    expect(json).not.toContain('Manufactured by Duangkaew Jewelry Manufacturer Co., Ltd.')
  })

  it('มีโลโก้ (brandLogoBase64) → ใส่ fit [150,36] ไม่ตั้ง width+height พร้อมกัน', () => {
    const builder = new CertificatePdfBuilder([baseCertificate()], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH', showManufacturer: true, showQr: false },
      brandLogoBase64: 'data:image/png;base64,abc'
    })
    const doc = builder.getDocDefinition()
    const json = JSON.stringify(doc)

    expect(json).toContain('"fit":[150,36]')
    expect(json).not.toContain('"height"')
  })
})

describe('CertificatePdfBuilder — customer header: brand name font size scales by length', () => {
  function makeBuilder(name, withLogo = false) {
    return new CertificatePdfBuilder([baseCertificate()], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name, showManufacturer: true, showQr: false },
      brandLogoBase64: withLogo ? 'data:image/png;base64,abc' : null
    })
  }

  it('ชื่อสั้น (<=30 ตัวอักษร) → fontSize 14', () => {
    const builder = makeBuilder('HARISH GEMS')
    const header = builder.buildCustomerHeaderRow()
    const nameNode = header.stack[header.stack.length - 1]
    expect(nameNode.fontSize).toBe(14)
  })

  it('ชื่อยาวปานกลาง (31-55 ตัวอักษร) → fontSize 12', () => {
    const builder = makeBuilder('A'.repeat(40))
    const header = builder.buildCustomerHeaderRow()
    const nameNode = header.stack[header.stack.length - 1]
    expect(nameNode.fontSize).toBe(12)
  })

  it('ชื่อยาวมาก (>55 ตัวอักษร) → fontSize 10 (ไม่ตัดเกิน 2 บรรทัด)', () => {
    const name = 'MADAGASCAR ROYAL GEMSTONE AND FINE JEWELRY TRADING COMPANY LIMITED'
    const builder = makeBuilder(name)
    const header = builder.buildCustomerHeaderRow()
    const nameNode = header.stack[header.stack.length - 1]
    expect(nameNode.fontSize).toBe(10)
  })

  it('มีโลโก้ → fit [150, 36] เสมอในโหมด customer', () => {
    const builder = makeBuilder('HARISH', true)
    const header = builder.buildCustomerHeaderRow()
    const logoNode = header.stack[0]
    expect(logoNode.fit).toEqual([150, 36])
  })
})

describe('CertificatePdfBuilder — customer image box height/margin (FOOTER_ZONE_Y budget)', () => {
  it('customer mode: กล่องรูปสูง 200 (dk ยังเป็น 240 เดิม), margin ล่างคงที่ 12', () => {
    const cert = baseCertificate({ imageBase64: 'data:image/png;base64,abc' })

    const customerBuilder = new CertificatePdfBuilder([cert], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH', showManufacturer: true, showQr: false }
    })
    const customerImageBlock = customerBuilder.buildImageBlock(customerBuilder.getSelectedCertificates()[0])
    expect(customerImageBlock.columns[1].stack[0].fit).toEqual([320, 200])
    expect(customerImageBlock.margin[3]).toBe(12)

    const dkBuilder = new CertificatePdfBuilder([cert], { signerTitle: 'GM' })
    const dkImageBlock = dkBuilder.buildImageBlock(dkBuilder.getSelectedCertificates()[0])
    expect(dkImageBlock.columns[1].stack[0].fit).toEqual([320, 240])
    expect(dkImageBlock.margin[3]).toBe(20)
  })

  it('margin ล่างกล่องรูปโหมด customer คงที่ 12 ไม่ว่ามีโลโก้หรือไม่', () => {
    const cert = baseCertificate()

    const withLogo = new CertificatePdfBuilder([cert], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH', showManufacturer: true, showQr: false },
      brandLogoBase64: 'data:image/png;base64,abc'
    })
    const withoutLogo = new CertificatePdfBuilder([cert], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH', showManufacturer: true, showQr: false }
    })

    expect(withLogo.buildImageBlock(withLogo.getSelectedCertificates()[0]).margin[3]).toBe(12)
    expect(withoutLogo.buildImageBlock(withoutLogo.getSelectedCertificates()[0]).margin[3]).toBe(12)
  })

  it('worst case: ชื่อ 65 ตัวอักษร + โลโก้ + รูปแนวตั้ง + gem table + treatment/comment ตัดคำ 2 บรรทัด → ไม่ชน terms, จำนวนหน้า = จำนวนใบ', () => {
    const longName = 'MADAGASCAR ROYAL GEMSTONE AND FINE JEWELRY TRADING COMPANY LIMITED'
    const certs = [
      baseCertificate({
        imageBase64: 'data:image/png;base64,abc',
        hasGem: true,
        gemSpecies: 'Corundum',
        gemVariety: 'Sapphire',
        gemOrigin: 'Sri Lanka (Ceylon)',
        treatment: 'No indications of heat treatment observed under standard gemological testing conditions used.',
        comment: 'This gemstone shows natural inclusions consistent with its geographic origin as stated above in report.'
      }),
      baseCertificate({ certificateNo: 'DKC-AH2', stockNumber: 'DK-2' })
    ]

    const builder = new CertificatePdfBuilder(certs, {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: longName, showManufacturer: true, showQr: false },
      brandLogoBase64: 'data:image/png;base64,abc'
    })

    const doc = builder.getDocDefinition()
    const pageBreakCount = doc.content.filter((node) => node.pageBreak === 'before').length

    // 2 ใบ → ต้องมี pageBreak 1 ครั้ง (หน้าแรกไม่มี pageBreak) = จำนวนหน้าเท่ากับจำนวนใบเป๊ะ
    expect(pageBreakCount).toBe(certs.length - 1)

    const imageBlock = builder.buildImageBlock(certs[0])
    expect(imageBlock.columns[1].stack[0].fit).toEqual([320, 200])
    expect(imageBlock.margin[3]).toBe(12)

    const header = builder.buildCustomerHeaderRow()
    expect(header.stack[header.stack.length - 1].fontSize).toBe(10)
  })
})

describe('CertificatePdfBuilder — buildTermsLines: ตัดจุดท้ายชื่อกันจุดคู่', () => {
  it('ชื่อลงท้ายด้วย "." → ไม่ปิดประโยคด้วย ".."', () => {
    const builder = new CertificatePdfBuilder([baseCertificate()], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH GEMS & JEWELS LTD.', showManufacturer: true, showQr: false }
    })
    const [firstLine] = builder.buildTermsLines()

    expect(firstLine).toContain('for HARISH GEMS & JEWELS LTD.')
    expect(firstLine).not.toContain('LTD..')
  })

  it('ชื่อลงท้ายด้วย "." + showManufacturer=false (issued by) → ไม่ปิดประโยคด้วย ".."', () => {
    const builder = new CertificatePdfBuilder([baseCertificate()], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH GEMS LTD.', showManufacturer: false, showQr: false }
    })
    const [firstLine] = builder.buildTermsLines()

    expect(firstLine).toBe('This certificate describes the item stated herein as issued by HARISH GEMS LTD.')
  })

  it('ชื่อไม่ลงท้ายด้วย "." → ยังปิดประโยคด้วย "." เดียวตามปกติ', () => {
    const builder = new CertificatePdfBuilder([baseCertificate()], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH', showManufacturer: true, showQr: false }
    })
    const [firstLine] = builder.buildTermsLines()

    expect(firstLine).toContain('for HARISH.')
    expect(firstLine).not.toContain('HARISH..')
  })

  it('header/signature ยังคงชื่อตามที่กรอกไว้ทุกตัวอักษร (มีจุดท้ายอยู่) — ตัดเฉพาะประโยค terms', () => {
    const builder = new CertificatePdfBuilder([baseCertificate()], {
      signerTitle: 'GM',
      brand: { mode: 'customer', name: 'HARISH LTD.', showManufacturer: false, showQr: false }
    })
    const header = builder.buildCustomerHeaderRow()
    const nameNode = header.stack[header.stack.length - 1]

    expect(nameNode.text).toBe('HARISH LTD.')
  })
})
