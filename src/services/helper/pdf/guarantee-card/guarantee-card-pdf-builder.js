import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'
import { PDF_FONT, PDF_COLORS } from '@/services/helper/pdf/shared/pdf-theme.js'
import { prepareItemImages } from '@/services/helper/pdf/shared/pdf-images.js'

const PT_PER_MM = 72 / 25.4
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const CARD_WIDTH_MM = 85.6
const CARD_HEIGHT_MM = 54
const GUTTER = 16
const CARDS_PER_COL = 2
const CARDS_PER_ROW = 4
const CARDS_PER_PAGE = CARDS_PER_COL * CARDS_PER_ROW
const CARD_PAD = 8
const RIGHT_COL_WIDTH = 78
const COMPANY_NAME = 'Duang Kaew Jewelry Manufacturer Co.,Ltd.'
const GUARANTEE_TEXT =
  'WE HEREBY GUARANTEE THAT DESCRIPTION STATED ABOVE IS TRUE AND CORRECT.'

export class GuaranteeCardPdfBuilder {
  constructor(cards, options = {}) {
    this.cards = Array.isArray(cards) ? cards : []
    this.signerTitle = options.signerTitle || 'General Manager'
    this.invoiceNumber = options.invoiceNumber || ''

    this.logoBase64 = null

    this.cardW = CARD_WIDTH_MM * PT_PER_MM
    this.cardH = CARD_HEIGHT_MM * PT_PER_MM
    this.gutter = GUTTER
    this.leftMargin = (PAGE_WIDTH - (CARDS_PER_COL * this.cardW + this.gutter)) / 2
    this.topMargin = (PAGE_HEIGHT - (CARDS_PER_ROW * this.cardH + (CARDS_PER_ROW - 1) * this.gutter)) / 2
  }

  async preparePDF() {
    if (!this.logoBase64) {
      try {
        const logoPath = new URL('@/assets/duangkaew-icon.png', import.meta.url).href
        this.logoBase64 = await this.loadImageAsBase64(logoPath)
      } catch (error) {
        console.error('Failed to load logo:', error)
      }
    }

    await prepareItemImages(this.getSelectedCards())

    return this
  }

  async loadImageAsBase64(path) {
    try {
      const response = await fetch(path)
      const blob = await response.blob()

      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error loading image:', error)
      return null
    }
  }

  getSelectedCards() {
    return this.cards.filter((c) => c.selected !== false)
  }

  getCardPosition(indexOnPage) {
    const col = indexOnPage % CARDS_PER_COL
    const row = Math.floor(indexOnPage / CARDS_PER_COL)
    return {
      x: this.leftMargin + col * (this.cardW + this.gutter),
      y: this.topMargin + row * (this.cardH + this.gutter)
    }
  }

  noBorderLayout() {
    return {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 1
    }
  }

  normalizeImage(imageBase64) {
    if (!imageBase64) return null
    return imageBase64.startsWith('data:image') ? imageBase64 : `data:image/png;base64,${imageBase64}`
  }

  buildInfoTableBody(card, fontSize = 7.5) {
    const rows = []

    const pushRow = (label, value) => {
      if (value === '' || value === null || value === undefined) return
      rows.push([
        { text: label, bold: true, fontSize, margin: [0, 0, 0, 0] },
        { text: ':', fontSize, margin: [0, 0, 0, 0] },
        { text: value, fontSize, margin: [0, 0, 0, 0] }
      ])
    }

    pushRow('Code', card.code)
    pushRow('Goods Specify', card.goodsSpecify)
    pushRow('Gold Weight', card.goldWeight)
    ;(card.gemRows || []).forEach((g) => {
      if (!g || !g.name || g.weight === '' || g.weight === null || g.weight === undefined) return
      pushRow(`${g.name} Weight`, `${g.weight} cts.`)
    })
    pushRow('Diamond Weight', card.diamondWeight ? `${card.diamondWeight} cts.` : '')
    pushRow('Quality of Diamond', card.diamondQuality)

    return rows.length ? rows : [[{ text: '', border: [false, false, false, false] }, '', '']]
  }

  buildCardNodes(card, cardX, cardY) {
    const contentW = this.cardW - CARD_PAD * 2
    const leftColW = contentW - RIGHT_COL_WIDTH
    const rightColX = cardX + this.cardW - CARD_PAD - RIGHT_COL_WIDTH

    const headerRow = {
      columns: [
        this.logoBase64
          ? { image: this.logoBase64, width: 20, height: 20 }
          : { text: '', width: 20 },
        {
          text: COMPANY_NAME,
          font: 'AngsanaNew',
          bold: true,
          fontSize: 15,
          color: PDF_COLORS.primary,
          margin: [4, 2, 0, 0]
        }
      ],
      columnGap: 0,
      margin: [0, 0, 0, 4]
    }

    // จำนวนแถวเยอะ (รายการพลอยหลายแถว) → ลดขนาดฟอนต์เป็นขั้นบันไดเพื่อไม่ให้ล้นออกนอกการ์ด
    // (label column กว้างคงที่ 70pt — ต้องลดฟอนต์ให้พอสำหรับ label ยาวสุด เช่น "Yellow Sapphire Weight")
    const initialRows = this.buildInfoTableBody(card)
    const rowCount = initialRows.length
    const bodyFont = rowCount >= 8 ? 6 : rowCount > 6 ? 6.5 : 7.5
    const tableBody = bodyFont === 7.5 ? initialRows : this.buildInfoTableBody(card, bodyFont)

    const bodyRow = {
      columns: [
        {
          width: leftColW,
          table: {
            widths: [70, 5, '*'],
            body: tableBody
          },
          layout: this.noBorderLayout()
        }
      ]
    }

    const contentStack = {
      stack: [headerRow, bodyRow],
      absolutePosition: { x: cardX + CARD_PAD, y: cardY + CARD_PAD },
      width: contentW
    }

    // absolutePosition ไม่ honor width บน text node ตรงๆ — ต้องห่อด้วย columns เพื่อบังคับความกว้าง
    const footerNode = {
      columns: [{ width: contentW, text: GUARANTEE_TEXT, bold: true, fontSize: 5.6, alignment: 'center' }],
      absolutePosition: { x: cardX + CARD_PAD, y: cardY + this.cardH - CARD_PAD - 8 }
    }

    const nodes = [contentStack, footerNode]

    // รูปสินค้าและลายเซ็น — วางตำแหน่งแยกเป็น absolute อิสระ ยึดมุมขวาล่างของการ์ดเสมอ
    // (ไม่ปล่อยเป็น flow stack เพราะเมื่อไม่มีรูป เนื้อหาจะลอยขึ้นไปใกล้ header)
    const imageData = this.normalizeImage(card.imageBase64)
    if (imageData) {
      nodes.push({
        columns: [
          {
            width: RIGHT_COL_WIDTH,
            stack: [{ image: imageData, fit: [72, 52], alignment: 'center' }]
          }
        ],
        absolutePosition: { x: rightColX, y: cardY + CARD_PAD + 26 }
      })
    }

    const lineLength = 60
    const lineX1 = (RIGHT_COL_WIDTH - lineLength) / 2
    nodes.push({
      columns: [
        {
          width: RIGHT_COL_WIDTH,
          stack: [
            {
              canvas: [
                {
                  type: 'line',
                  x1: lineX1,
                  y1: 0,
                  x2: lineX1 + lineLength,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: '#333333'
                }
              ]
            },
            { text: this.signerTitle, fontSize: 6.5, alignment: 'center', margin: [0, 2, 0, 0] }
          ]
        }
      ],
      absolutePosition: { x: rightColX, y: cardY + this.cardH - CARD_PAD - 8 - 18 }
    })

    return nodes
  }

  getDocDefinition() {
    const selectedCards = this.getSelectedCards()
    const totalPages = Math.max(1, Math.ceil(selectedCards.length / CARDS_PER_PAGE))
    const content = []

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        content.push({ text: '', pageBreak: 'before' })
      }

      const pageCards = selectedCards.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE)

      const rects = pageCards.map((_card, idx) => {
        const { x, y } = this.getCardPosition(idx)
        return {
          type: 'rect',
          x,
          y,
          w: this.cardW,
          h: this.cardH,
          r: 8,
          lineWidth: 0.75,
          lineColor: '#333333'
        }
      })
      content.push({ canvas: rects, absolutePosition: { x: 0, y: 0 } })

      pageCards.forEach((card, idx) => {
        const { x, y } = this.getCardPosition(idx)
        content.push(...this.buildCardNodes(card, x, y))
      })
    }

    return {
      pageSize: 'A4',
      pageMargins: [0, 0, 0, 0],
      content,
      defaultStyle: {
        font: PDF_FONT,
        fontSize: 7.5,
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
      console.error('Error generating PDF:', error)
      throw error
    }
  }

  async downloadPDF() {
    try {
      const pdf = await this.generatePDF()
      const fileName = `GuaranteeCard_${this.invoiceNumber}_${dayjs().format('YYYYMMDD')}.pdf`
      pdf.download(fileName)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      throw error
    }
  }

  async openPDF() {
    try {
      const pdf = await this.generatePDF()
      pdf.open()
    } catch (error) {
      console.error('Error opening PDF:', error)
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
