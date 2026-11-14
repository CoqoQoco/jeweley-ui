import dayjs from 'dayjs'

import { initPdfMake } from '@/services/utils/pdf-make'

const A4_WIDTH_PT = 595.28
const A4_HEIGHT_PT = 841.89
const MARGIN_PT = 24
const NOTE_AREA_PT = 28
const PT_PER_INCH = 72
const DEFAULT_RIGHT_WIDTH_IN = 0.9
const LINE_HEIGHT = 1.5
const LINE_HEIGHT_CENTER_SHIFT = (LINE_HEIGHT - 1) / 2
const BORDER_COLOR = '#cccccc'
const NOTE_COLOR = '#888888'
const NOTE_FONT_SIZE = 9
const PRINT_FONT = 'THSarabunNew'

const NO_PADDING_LAYOUT = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0
}

const round = (n) => Math.round(n * 100) / 100

const resolveFit = (paper) => {
  const widthIn = (Number(paper?.widthHundredthInch) || 900) / 100
  const heightIn = (Number(paper?.heightHundredthInch) || 1100) / 100
  const widthPt = widthIn * PT_PER_INCH
  const heightPt = heightIn * PT_PER_INCH
  const scale = Math.min(
    (A4_WIDTH_PT - 2 * MARGIN_PT) / widthPt,
    (A4_HEIGHT_PT - NOTE_AREA_PT - 2 * MARGIN_PT) / heightPt
  )
  return {
    scale,
    widthPt: widthPt * scale,
    heightPt: heightPt * scale,
    offsetX: (A4_WIDTH_PT - widthPt * scale) / 2,
    offsetY: MARGIN_PT
  }
}

const buildPrimitive = (p, fit) => {
  const fontSize = round((Number(p.fontSize) || 10) * fit.scale)
  const position = {
    x: round(fit.offsetX + (Number(p.x) || 0) * PT_PER_INCH * fit.scale),
    y: round(fit.offsetY + (Number(p.y) || 0) * PT_PER_INCH * fit.scale + fontSize * LINE_HEIGHT_CENTER_SHIFT)
  }
  const textStyle = {
    text: String(p.text ?? '').replace(/\r?\n/g, ' '),
    fontSize,
    bold: !!p.bold,
    lineHeight: LINE_HEIGHT,
    noWrap: true
  }

  if (p.align === 'right') {
    const width = round((Number(p.width) || DEFAULT_RIGHT_WIDTH_IN) * PT_PER_INCH * fit.scale)
    return {
      absolutePosition: position,
      table: {
        widths: [width],
        body: [[{ ...textStyle, alignment: 'right' }]]
      },
      layout: NO_PADDING_LAYOUT
    }
  }

  return { ...textStyle, absolutePosition: position }
}

export const buildPrintModelA4DocDefinition = (model, { generatedAt = new Date() } = {}) => {
  const fit = resolveFit(model?.paper)
  const pages = model?.pages?.length ? model.pages : [[]]
  const noteText = `ฉบับตรวจ ไม่ใช่เอกสารจริง · พิมพ์เมื่อ ${dayjs(generatedAt).format('DD/MM/YYYY HH:mm')}`

  const content = []
  pages.forEach((primitives, index) => {
    const pageBreak = index > 0 ? { pageBreak: 'before' } : {}

    content.push({
      canvas: [
        {
          type: 'rect',
          x: round(fit.offsetX),
          y: round(fit.offsetY),
          w: round(fit.widthPt),
          h: round(fit.heightPt),
          lineWidth: 0.5,
          lineColor: BORDER_COLOR
        }
      ],
      ...pageBreak
    })

    primitives.forEach((p) => content.push(buildPrimitive(p, fit)))

    content.push({
      absolutePosition: { x: 0, y: round(fit.offsetY + fit.heightPt + 8) },
      table: {
        widths: [A4_WIDTH_PT],
        body: [[{ text: noteText, fontSize: NOTE_FONT_SIZE, color: NOTE_COLOR, alignment: 'center' }]]
      },
      layout: NO_PADDING_LAYOUT
    })
  })

  return {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: 0,
    defaultStyle: { font: PRINT_FONT },
    content
  }
}

export const downloadPrintModelA4Pdf = (model, { fileName = 'invoice-ฉบับตรวจ.pdf' } = {}) => {
  const pdfMake = initPdfMake()
  pdfMake.createPdf(buildPrintModelA4DocDefinition(model)).download(fileName)
}
