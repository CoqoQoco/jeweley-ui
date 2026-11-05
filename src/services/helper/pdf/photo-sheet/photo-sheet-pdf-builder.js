// PhotoSheetPdfBuilder — ใบรูปอย่างเดียว (SO / Quotation / Invoice): เลขเอกสารหัวกระดาษ + รูปสินค้า 4 ใบต่อแถว + caption "{ลำดับ}){รหัสแม่พิมพ์}"

import { initPdfMake } from '@/services/utils/pdf-make'
import { normalizeDocNo } from '@/services/helper/pdf/photo-sheet/photo-sheet-doc-no.js'

const FONT = 'THSarabunNew'
export const PHOTO_SHEET_COLS = 4
const PAGE_MARGIN = 30
const COLUMN_GAP = 10
const PAGE_WIDTH_A4 = 595.28
const CELL_WIDTH = (PAGE_WIDTH_A4 - PAGE_MARGIN * 2 - COLUMN_GAP * (PHOTO_SHEET_COLS - 1)) / PHOTO_SHEET_COLS
const IMAGE_BOX = Math.floor(CELL_WIDTH)

export function buildPhotoCaption(seq, moldCode) {
  return `${seq}) ${moldCode || ''}`
}

export function chunkRows(list, size = PHOTO_SHEET_COLS) {
  const rows = []
  for (let i = 0; i < list.length; i += size) rows.push(list.slice(i, i + size))
  return rows
}

/**
 * แปลงรายการของเอกสารขายเป็นรายการสำหรับใบรูป — รหัสแม่พิมพ์ = mold ถอยไป productNumber (เหมือน formatItemStyleCode)
 */
export function toPhotoSheetItems(items) {
  return (items || []).map((item, index) => ({
    seq: index + 1,
    moldCode: item?.mold || item?.productNumber || item?.stockNumberOrigin || item?.stockNumber || '',
    imageBase64: item?.imageBase64 || null,
    imagePath: item?.imageBlobPath || item?.imagePath || null
  }))
}

export class PhotoSheetPdfBuilder {
  constructor({ docNo, items }) {
    this.docNo = normalizeDocNo(docNo)
    this.items = Array.isArray(items) ? items : []
  }

  buildCell(item) {
    if (!item) return { text: '', width: '*' }
    const raw = item.imageBase64
    const dataUrl = raw ? (raw.startsWith('data:image') ? raw : `data:image/png;base64,${raw}`) : null
    return {
      width: '*',
      stack: [
        dataUrl
          ? { image: dataUrl, fit: [IMAGE_BOX, IMAGE_BOX], alignment: 'center' }
          : {
              canvas: [{ type: 'rect', x: 0, y: 0, w: IMAGE_BOX, h: IMAGE_BOX, lineColor: '#cccccc', lineWidth: 0.5 }],
              alignment: 'center'
            },
        { text: buildPhotoCaption(item.seq, item.moldCode), fontSize: 12, alignment: 'center', margin: [0, 3, 0, 0] }
      ]
    }
  }

  buildRows() {
    return chunkRows(this.items).map((rowItems) => {
      const columns = rowItems.map((it) => this.buildCell(it))
      while (columns.length < PHOTO_SHEET_COLS) columns.push({ text: '', width: '*' })
      return { columns, columnGap: COLUMN_GAP, unbreakable: true, margin: [0, 0, 0, 10] }
    })
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [PAGE_MARGIN, PAGE_MARGIN, PAGE_MARGIN, PAGE_MARGIN],
      defaultStyle: { font: FONT, fontSize: 12 },
      content: [{ text: this.docNo, fontSize: 22, bold: true, margin: [0, 0, 0, 12] }, ...this.buildRows()]
    }
  }

  generatePDF() {
    return initPdfMake().createPdf(this.getDocDefinition())
  }
}
