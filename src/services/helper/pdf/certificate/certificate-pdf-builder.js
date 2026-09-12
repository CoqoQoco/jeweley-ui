import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'
import { PDF_FONT, PDF_COLORS } from '@/services/helper/pdf/shared/pdf-theme.js'
import { prepareItemImages, loadCompanyLogo } from '@/services/helper/pdf/shared/pdf-images.js'
import { COMPANY_INFO } from '@/config/company-info.js'

// A4 แนวนอน พับกลาง — 1 ใบรับรอง = 1 หน้า แบ่งซ้าย-ขวาเท่ากัน
const PAGE_WIDTH = 841.89
const PAGE_HEIGHT = 595.28
const MARGIN_X = 40
const MARGIN_TOP = 28
const MARGIN_BOTTOM = 28
const PANEL_GAP = 30
const PANEL_WIDTH = (PAGE_WIDTH - MARGIN_X * 2 - PANEL_GAP) / 2
const IMAGE_BOX_W = 320
const IMAGE_BOX_H = 240
const QR_SIZE = 66

// กันดักเดียวกับที่ guarantee-card เคยเจอ: node ที่ absolutePosition ยังถูก pdfmake คำนวณ
// availableHeight จาก y เป้าหมายถึงขอบล่างจริงของหน้า (pageHeight - marginBottom) — ถ้าเนื้อหาสูงเกินพื้นที่นั้น
// pdfmake จะ paginate เนื้อหาส่วนเกินไปพิมพ์ทับหัวกระดาษหน้าถัดไปทันที (ไม่ตัดคำตกบรรทัดใหม่ในหน้าเดิม)
// จึงต้องคำนวณ FOOTER_ZONE_Y จาก (PAGE_HEIGHT - MARGIN_BOTTOM) เป็นฐานเสมอ ไม่ใช่ PAGE_HEIGHT ตรงๆ
// และเผื่อ FOOTER_ZONE_HEIGHT ให้กว้างพอสำหรับข้อความ 3 ย่อหน้าที่ตัดคำจริง (วัดจาก harness แล้ว)
const FOOTER_ZONE_HEIGHT = 100
const FOOTER_ZONE_Y = PAGE_HEIGHT - MARGIN_BOTTOM - FOOTER_ZONE_HEIGHT

// กล่องลายเซ็นแยก anchor ออกจาก terms เพื่อดันลงไปชิดขอบล่าง — ที่ว่างเหนือเส้นคือพื้นที่เซ็นจริง
// ห้ามตั้ง SIGNATURE_BLOCK_HEIGHT ต่ำกว่าความสูงจริงของกล่อง (วัดจาก render ได้ 51 pt) เพราะ pdfmake
// คำนวณ availableHeight ของ node ที่ absolutePosition จาก y ถึง (PAGE_HEIGHT - MARGIN_BOTTOM)
// ถ้าเนื้อหาสูงเกินพื้นที่นั้นจะ paginate ไปพิมพ์ทับหัวกระดาษหน้าถัดไปทันที
const SIGNATURE_BLOCK_HEIGHT = 60
const SIGNATURE_ZONE_Y = PAGE_HEIGHT - MARGIN_BOTTOM - SIGNATURE_BLOCK_HEIGHT

const CERTIFICATE_TERMS = [
  'This certificate describes the item stated herein as manufactured and inspected by Duangkaew Jewelry Manufacturer Co., Ltd.',
  'Gemstone and metal information is based on the production and material records of this item. It is not a laboratory gemological analysis.',
  'This certificate is valid only for the item bearing the number shown above and shall not be reproduced except in full.'
]

export class CertificatePdfBuilder {
  constructor(certificates, options = {}) {
    this.certificates = Array.isArray(certificates) ? certificates : []
    this.signerTitle = options.signerTitle || 'General Manager'
    this.invoiceNumber = options.invoiceNumber || ''
    this.logoBase64 = null
  }

  async preparePDF() {
    if (!this.logoBase64) {
      this.logoBase64 = await loadCompanyLogo().catch(() => null)
    }

    await prepareItemImages(this.getSelectedCertificates())

    return this
  }

  getSelectedCertificates() {
    return this.certificates.filter((c) => c.selected !== false)
  }

  normalizeImage(imageBase64) {
    if (!imageBase64) return null
    return imageBase64.startsWith('data:image') ? imageBase64 : `data:image/png;base64,${imageBase64}`
  }

  noBorderLayout() {
    return {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 3.5,
      paddingBottom: () => 3.5
    }
  }

  // label:value table ที่กรองแถวว่างทิ้ง — ใช้กับข้อมูลชิ้นงานหลักที่ปกติมีค่าอยู่แล้ว
  buildLabelValueTable(rows, fontSize = 9, labelWidth = 100) {
    const body = rows
      .filter(([, value]) => value !== '' && value !== null && value !== undefined)
      .map(([label, value]) => [
        { text: label, bold: true, fontSize },
        { text: String(value), fontSize }
      ])

    if (!body.length) return null

    return {
      table: { widths: [labelWidth, '*'], body },
      layout: this.noBorderLayout()
    }
  }

  // label:value table ที่แสดงครบทุกแถวเสมอ ใส่ "-" แทนค่าว่าง — ใช้กับ block ที่ต้องโชว์ให้เห็นว่ามีช่องนี้อยู่
  // แม้ยังไม่กรอกข้อมูล (Diamond / Gemstone) ให้ดูสม่ำเสมอกับตาราง Species/Variety/Origin ฝั่งซ้าย
  buildFilledLabelValueTable(rows, fontSize = 9, labelWidth = 100) {
    const body = rows.map(([label, value]) => [
      { text: label, bold: true, fontSize },
      { text: value || '-', fontSize }
    ])

    return {
      table: { widths: [labelWidth, '*'], body },
      layout: this.noBorderLayout()
    }
  }

  buildHeaderRow() {
    return {
      columns: [
        this.logoBase64
          ? { width: 30, image: this.logoBase64, height: 30 }
          : { width: 30, text: '' },
        {
          width: '*',
          stack: [
            { text: 'Duangkaew Jewelry', fontSize: 14, bold: true, color: PDF_COLORS.primary, margin: [8, 0, 0, 0] },
            { text: 'Manufacturer Co., Ltd.', fontSize: 9, color: PDF_COLORS.darkGray, margin: [8, 2, 0, 0] }
          ]
        }
      ],
      margin: [0, 0, 0, 20]
    }
  }

  buildImageBlock(certificate) {
    const imageData = this.normalizeImage(certificate.imageBase64)

    const inner = imageData
      ? { image: imageData, fit: [IMAGE_BOX_W, IMAGE_BOX_H] }
      : {
          canvas: [
            { type: 'rect', x: 0, y: 0, w: IMAGE_BOX_W, h: IMAGE_BOX_H, lineWidth: 1, lineColor: '#cccccc' }
          ]
        }

    return {
      columns: [
        { width: '*', text: '' },
        { width: IMAGE_BOX_W, stack: [inner] },
        { width: '*', text: '' }
      ],
      margin: [0, 0, 0, 20]
    }
  }

  buildGemInfoTable(certificate) {
    if (!certificate.hasGem) return null

    const rows = [
      ['Species/Group', certificate.gemSpecies || '-'],
      ['Variety', certificate.gemVariety || '-'],
      ['Origin', certificate.gemOrigin || '-'],
      ['Treatment(s)', certificate.treatment || '-'],
      ['Comment(s)', certificate.comment || '-']
    ]

    return {
      table: {
        widths: [90, '*'],
        body: rows.map(([label, value]) => [
          { text: label, bold: true, fontSize: 9.5 },
          { text: value, fontSize: 9.5 }
        ])
      },
      layout: this.noBorderLayout(),
      margin: [0, 8, 0, 0]
    }
  }

  buildTermsBlock() {
    return {
      columns: [
        {
          width: PANEL_WIDTH,
          stack: CERTIFICATE_TERMS.map((line) => ({
            text: line,
            fontSize: 7,
            lineHeight: 1.25,
            color: PDF_COLORS.darkGray,
            margin: [0, 0, 0, 5]
          }))
        }
      ],
      absolutePosition: { x: MARGIN_X, y: FOOTER_ZONE_Y }
    }
  }

  buildLeftPanel(certificate) {
    const nodes = [this.buildHeaderRow(), this.buildImageBlock(certificate)]
    const gemInfoTable = this.buildGemInfoTable(certificate)
    if (gemInfoTable) nodes.push(gemInfoTable)
    return nodes
  }

  // ชื่อเรื่องอยู่ใน normal flow เสมอ ไม่ว่าจะมี QR หรือไม่ — ความสูงของแถวนี้ต้องคงที่
  // QR วางแยกเป็น absolutePosition ต่างหาก (ดู buildQrOverlay) กันไม่ให้ QR ดันเนื้อหาด้านล่างไหลลงจนชนกับ
  // signature block ที่ปักหมุดด้วย absolutePosition อยู่แล้ว (มี QR vs ไม่มี ต้องได้ layout สูงเท่ากันเป๊ะ)
  buildTitleRow() {
    return {
      text: 'CERTIFICATE OF AUTHENTICITY',
      bold: true,
      fontSize: 17,
      color: PDF_COLORS.primary,
      margin: [0, 0, QR_SIZE + 10, 20]
    }
  }

  // มุมขวาบนของ panel ขวา — ไม่กินพื้นที่ใน flow (เหมือน fold line/signature) จึงไม่ทำให้หน้าถัดไปงอกขึ้นมา
  buildQrOverlay(certificate) {
    const qrImage = this.normalizeImage(certificate.qrDataUrl)
    if (!qrImage) return null

    return {
      image: qrImage,
      fit: [QR_SIZE, QR_SIZE],
      absolutePosition: { x: PAGE_WIDTH - MARGIN_X - QR_SIZE, y: MARGIN_TOP }
    }
  }

  buildDiamondBlock(certificate) {
    if (!certificate.hasDiamond) return null

    const table = this.buildFilledLabelValueTable(
      [
        ['Pieces', certificate.diamondPcs],
        ['Total Weight', certificate.diamondWeight],
        ['Quality', certificate.diamondQuality]
      ],
      9.5,
      110
    )

    return {
      stack: [
        { text: 'Diamond', bold: true, fontSize: 11, color: PDF_COLORS.primary, margin: [0, 8, 0, 6] },
        table
      ]
    }
  }

  buildGemMainBlock(certificate) {
    if (!certificate.hasGem) return null

    const table = this.buildFilledLabelValueTable(
      [
        ['Gemstone', certificate.gemVariety],
        ['Weight', certificate.gemWeight],
        ['Measurement', certificate.gemMeasurement],
        ['Shape', certificate.gemShape],
        ['Cut', certificate.gemCut],
        ['Color', certificate.gemColor]
      ],
      9.5,
      110
    )

    return {
      stack: [
        { text: 'Gemstone', bold: true, fontSize: 11, color: PDF_COLORS.primary, margin: [0, 8, 0, 6] },
        table
      ]
    }
  }

  buildSignatureBlock(certificate) {
    const lineWidth = 150

    return {
      columns: [
        {
          width: PANEL_WIDTH,
          stack: [
            {
              canvas: [{ type: 'line', x1: 0, y1: 0, x2: lineWidth, y2: 0, lineWidth: 0.8, lineColor: '#333333' }],
              margin: [0, 0, 0, 5]
            },
            { text: certificate.signerTitle || this.signerTitle, fontSize: 9.5, bold: true },
            { text: COMPANY_INFO.name, fontSize: 7.5, color: PDF_COLORS.darkGray, margin: [0, 10, 0, 1] },
            { text: COMPANY_INFO.address, fontSize: 7, color: PDF_COLORS.darkGray, lineHeight: 1.2 }
          ]
        }
      ],
      absolutePosition: {
        x: PAGE_WIDTH - MARGIN_X - PANEL_WIDTH,
        y: SIGNATURE_ZONE_Y
      }
    }
  }

  buildRightPanel(certificate) {
    const infoTable = this.buildLabelValueTable(
      [
        ['Certificate No.', certificate.certificateNo],
        ['Date', certificate.issueDate],
        ['Item No.', certificate.itemNo],
        ['Description', certificate.description],
        ['Model', certificate.model],
        ['Metal', certificate.metal],
        ['Metal Weight', certificate.metalWeight],
        ['Size', certificate.itemSize]
      ],
      9.5,
      110
    )

    const nodes = [this.buildTitleRow()]
    if (infoTable) nodes.push(infoTable)

    const diamondBlock = this.buildDiamondBlock(certificate)
    if (diamondBlock) nodes.push(diamondBlock)

    const gemBlock = this.buildGemMainBlock(certificate)
    if (gemBlock) nodes.push(gemBlock)

    return nodes
  }

  buildFoldLine() {
    return {
      canvas: [
        {
          type: 'line',
          x1: PAGE_WIDTH / 2,
          y1: 0,
          x2: PAGE_WIDTH / 2,
          y2: PAGE_HEIGHT,
          lineWidth: 1,
          lineColor: PDF_COLORS.muted,
          dash: { length: 4 }
        }
      ],
      absolutePosition: { x: 0, y: 0 }
    }
  }

  buildPageNodes(certificate) {
    const nodes = [
      {
        columns: [
          { width: PANEL_WIDTH, stack: this.buildLeftPanel(certificate) },
          { width: PANEL_GAP, text: '' },
          { width: PANEL_WIDTH, stack: this.buildRightPanel(certificate) }
        ],
        columnGap: 0
      },
      this.buildTermsBlock(),
      this.buildSignatureBlock(certificate),
      this.buildFoldLine()
    ]

    const qrOverlay = this.buildQrOverlay(certificate)
    if (qrOverlay) nodes.push(qrOverlay)

    return nodes
  }

  getDocDefinition() {
    const selectedCertificates = this.getSelectedCertificates()
    const content = []

    selectedCertificates.forEach((certificate, index) => {
      if (index > 0) content.push({ text: '', pageBreak: 'before' })
      content.push(...this.buildPageNodes(certificate))
    })

    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [MARGIN_X, MARGIN_TOP, MARGIN_X, MARGIN_BOTTOM],
      content,
      defaultStyle: {
        font: PDF_FONT,
        fontSize: 9,
        color: '#000000'
      }
    }
  }

  async generatePDF() {
    try {
      await this.preparePDF()
      const pdfMake = initPdfMake()
      const docDefinition = this.getDocDefinition()
      return pdfMake.createPdf(docDefinition)
    } catch (error) {
      console.error('Error generating certificate PDF:', error)
      throw error
    }
  }

  async downloadPDF() {
    try {
      const pdf = await this.generatePDF()
      const fileName = `Certificate_${this.invoiceNumber}_${dayjs().format('YYYYMMDD')}.pdf`
      pdf.download(fileName)
    } catch (error) {
      console.error('Error downloading certificate PDF:', error)
      throw error
    }
  }

  async openPDF() {
    try {
      const pdf = await this.generatePDF()
      pdf.open()
    } catch (error) {
      console.error('Error opening certificate PDF:', error)
      throw error
    }
  }

  async getPreviewUrl() {
    const pdf = await this.generatePDF()
    return new Promise((resolve) => {
      pdf.getBlob((blob) => resolve(URL.createObjectURL(blob)))
    })
  }
}
