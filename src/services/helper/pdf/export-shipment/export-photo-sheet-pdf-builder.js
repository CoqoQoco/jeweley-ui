// ExportPhotoSheetPdfBuilder — 3 x 4 photo grid per page (STOCK NO / description / qty)
// Images are fetched + downscaled in batches to avoid freezing the browser on
// documents with hundreds/thousands of items.

import { initPdfMake } from '@/services/utils/pdf-make'
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'
import { paginate } from '@/services/helper/pdf/shared/pdf-sections.js'
import { buildDocHeader } from './export-shipment-shared.js'

const BATCH_SIZE = 15
const COLS = 3
const ROWS = 4
const PER_PAGE = COLS * ROWS
const THUMB_MAX_WIDTH = 400
const THUMB_QUALITY = 0.7
const CELL_IMAGE_SIZE = 140

function resizeImage(dataUrl, maxWidth = THUMB_MAX_WIDTH, quality = THUMB_QUALITY) {
  return new Promise((resolve) => {
    if (!dataUrl) {
      resolve(null)
      return
    }
    const img = new Image()
    img.onload = () => {
      try {
        const ratio = img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1
        const w = Math.min(maxWidth, img.naturalWidth || maxWidth)
        const h = Math.max(1, Math.round(w / (ratio || 1)))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

export class ExportPhotoSheetPdfBuilder {
  constructor(header, items) {
    this.header = header || {}
    this.items = Array.isArray(items) ? items : []
  }

  async loadThumb(imagePath) {
    if (!imagePath) return null
    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')
    const base64 = await getAzureBlobAsBase64(imagePath, 'stock').catch(() => '')
    if (!base64) return null
    return await resizeImage(base64)
  }

  /**
   * @param {(loaded:number, total:number) => void} [onProgress]
   */
  async prepareImages(onProgress) {
    const total = this.items.length
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = this.items.slice(i, i + BATCH_SIZE)
      await Promise.all(
        batch.map(async (item) => {
          item._photo = await this.loadThumb(item.imagePath)
        })
      )
      if (onProgress) onProgress(Math.min(i + BATCH_SIZE, total), total)
    }
  }

  async preparePDF(onProgress) {
    await this.prepareImages(onProgress)
    return this
  }

  buildCell(item) {
    if (!item) return { text: '', width: '*' }

    return {
      width: '*',
      margin: [4, 4, 4, 12],
      stack: [
        item._photo
          ? { image: item._photo, fit: [CELL_IMAGE_SIZE, CELL_IMAGE_SIZE], alignment: 'center' }
          : {
              canvas: [
                { type: 'rect', x: 0, y: 0, w: CELL_IMAGE_SIZE, h: CELL_IMAGE_SIZE, lineColor: '#dddddd', lineWidth: 0.5 }
              ],
              alignment: 'center'
            },
        { text: item.stockNumber || '', bold: true, fontSize: 8, alignment: 'center', margin: [0, 4, 0, 0] },
        { text: item.description || '', fontSize: 7, alignment: 'center' },
        { text: `QTY: ${item.qty ?? ''}`, fontSize: 7, alignment: 'center' }
      ]
    }
  }

  buildPageContent(pageItems) {
    const rows = []
    for (let r = 0; r < ROWS; r++) {
      const rowItems = pageItems.slice(r * COLS, r * COLS + COLS)
      if (!rowItems.length) break
      const columns = rowItems.map((it) => this.buildCell(it))
      while (columns.length < COLS) columns.push({ text: '', width: '*' })
      rows.push({ columns, columnGap: 8 })
    }
    return rows
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [40, 130, 40, 40],
      defaultStyle: { font: PDF_FONT, fontSize: 9 },
      header: (currentPage) => buildDocHeader('PHOTO SHEET', currentPage),
      content: paginate(this.items, PER_PAGE, (pageItems) => this.buildPageContent(pageItems))
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }

  openPDF() {
    this.generatePDF().open()
  }

  downloadPDF(filename) {
    const name = filename || `ExportPhotoSheet_${this.header.documentNumber || this.header.customNumber || 'export'}.pdf`
    this.generatePDF().download(name)
  }
}
