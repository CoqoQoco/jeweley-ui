// ProductCatalogPdfBuilder — generates Lookbook PDF matching the brand reference layout.
//
// Layout reference: docs/RING 18K เพชรล้วน_260520_204430.pdf
// Font: AcherusGrotesque (registered in pdf-make.js)
//
// TODO: Replace LOGO_ASSET path with a white-on-transparent PNG version for cover page.
//       Currently using duangkaew-logo.png (coloured). If the cover background is #9B2C20
//       the coloured logo may not be visible — provide duangkaew-logo-white.png and swap below.

import { initPdfMake } from '@/services/utils/pdf-make'

// Brand colour constants — adjust once confirmed with client
const CATALOG_MAROON = '#9B2C20'
const CATALOG_FONT = 'AcherusGrotesque'

// Page dimensions — landscape 16:9 based on A4 width
const PAGE_W = 842
const PAGE_H = 474
const CONTENT_W = 762 // PAGE_W - 40 (left margin) - 40 (right margin)

export class ProductCatalogPdfBuilder {
  constructor(catalog, items) {
    this.catalog = catalog || {}
    this.items = items
      ? [...items].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      : []

    this.logoBase64 = null
  }

  // ---------- image helpers ----------

  async loadImageAsBase64(path) {
    const response = await fetch(path)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Load catalog item images from SaleDocumentCatalog/GetImage endpoint.
   * Each item must have imageBlobPaths: string[] (up to 3 entries).
   * Populated into item.catalogImages: string[] (base64 dataURL or null).
   */
  async prepareImages() {
    if (!this.items || !this.items.length) return

    const baseUrl = import.meta.env.VITE_JEWELRY_API_URL || 'https://localhost:7001/'

    await Promise.all(
      this.items.map(async (item) => {
        let blobPaths = item.imageBlobPaths
        if (!blobPaths || !blobPaths.some(Boolean)) {
          const slots = [null, null, null]
          ;(item.images || []).forEach((img) => {
            const i = img.sortOrder ?? 0
            if (i >= 0 && i < 3) slots[i] = img.blobPath
          })
          blobPaths = slots
        }
        const results = await Promise.all(
          [0, 1, 2].map(async (idx) => {
            const blobPath = blobPaths[idx]
            if (!blobPath) return null
            const url = `${baseUrl}SaleDocumentCatalog/GetImage?blobPath=${encodeURIComponent(blobPath)}`
            const res = await fetch(url, {
              headers: { Authorization: localStorage.getItem('token-dk') }
            })
            if (!res.ok) return null
            const blob = await res.blob()
            return new Promise((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result)
              reader.onerror = () => resolve(null)
              reader.readAsDataURL(blob)
            })
          })
        )
        item.catalogImages = results
      })
    )
  }

  async preparePDF() {
    // Load logo
    const logoPath = new URL('@/assets/duangkaew-logo.png', import.meta.url).href
    this.logoBase64 = await this.loadImageAsBase64(logoPath).catch(() => null)

    await this.prepareImages()
    return this
  }

  // ---------- cover page ----------

  getCoverPage() {
    const { headerLabel = '', collectionTitle = '' } = this.catalog

    // Split headerLabel into up to 2 lines for large cover title (e.g. "18K" / "RING")
    const parts = headerLabel.toUpperCase().split(/\s+/)
    const titleLine1 = parts[0] || ''
    const titleLine2 = parts.slice(1).join(' ')

    const content = [
      // Full-page maroon background rect — landscape dimensions
      {
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: PAGE_W,
            h: PAGE_H,
            color: CATALOG_MAROON
          }
        ],
        absolutePosition: { x: 0, y: 0 }
      },

      // Top spacer — reduced for shorter landscape page
      { text: '', margin: [0, 40, 0, 0] },

      // Logo centred
      {
        columns: [
          { width: '*', text: '' },
          this.logoBase64
            ? { image: this.logoBase64, width: 80, height: 80, alignment: 'center' }
            : { text: 'DUANGKAEW', fontSize: 18, bold: true, color: '#ffffff', alignment: 'center' },
          { width: '*', text: '' }
        ]
      },

      { text: '', margin: [0, 16, 0, 0] },

      // Title line 1 (large)
      {
        text: titleLine1,
        fontSize: 44,
        bold: true,
        color: '#ffffff',
        alignment: 'center',
        margin: [0, 0, 0, 4]
      },

      // Title line 2 (large)
      titleLine2
        ? {
            text: titleLine2,
            fontSize: 44,
            bold: true,
            color: '#ffffff',
            alignment: 'center',
            margin: [0, 0, 0, 12]
          }
        : { text: '' },

      // Collection subtitle
      collectionTitle
        ? {
            text: collectionTitle.toUpperCase(),
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            alignment: 'center',
            characterSpacing: 4,
            margin: [0, 0, 0, 0]
          }
        : { text: '' },

      // Push to bottom — reduced spacer for landscape height
      { text: '', margin: [0, 50, 0, 0] },

      // Footer divider
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: CONTENT_W, y2: 0, lineWidth: 0.5, lineColor: 'rgba(255,255,255,0.4)' }
        ],
        margin: [0, 0, 0, 10]
      },

      // Footer contacts
      {
        columns: [
          { text: 'info@dkbkk.com', fontSize: 9, color: '#ffffff', alignment: 'left' },
          { text: 'www.dkbangkok.com', fontSize: 9, color: '#ffffff', alignment: 'right' }
        ]
      }
    ]

    return { stack: content, pageBreak: 'after' }
  }

  // ---------- helpers ----------

  getSocialIcon(type) {
    let innerSvg
    if (type === 'facebook') {
      innerSvg = `<text x="8" y="12" font-size="10" fill="#fff" text-anchor="middle" font-family="Helvetica" font-weight="bold">f</text>`
    } else if (type === 'instagram') {
      innerSvg = `<rect x="4" y="4" width="8" height="8" rx="2" fill="none" stroke="#fff" stroke-width="1.2"/><circle cx="8" cy="8" r="2" fill="none" stroke="#fff" stroke-width="1.2"/><circle cx="11" cy="5" r="0.7" fill="#fff"/>`
    } else {
      innerSvg = `<rect x="3.5" y="5" width="9" height="6" rx="1" fill="none" stroke="#fff" stroke-width="1.2"/><path d="M3.5 5.5 L8 9 L12.5 5.5" fill="none" stroke="#fff" stroke-width="1.2"/>`
    }
    const svg = `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="16" height="16" rx="4" fill="${CATALOG_MAROON}"/>${innerSvg}</svg>`
    return { svg, width: 16, height: 16 }
  }

  // ---------- product page ----------

  getProductPage(item, isLast) {
    const { headerLabel = '' } = this.catalog
    const code = item.productNumber || ''
    const desc1 = item.descriptionLine1 || ''
    const desc2 = item.descriptionLine2 || ''
    const dim1 = item.dimension1 || ''
    const dim2 = item.dimension2 || ''
    const dim3 = item.dimension3 || ''
    const catalogImages = item.catalogImages || [null, null, null]

    // --- Header band: 3 columns ---
    const headerBand = {
      columns: [
        // Left (140): logo only — logo already has text baked in
        {
          stack: [
            this.logoBase64
              ? { image: this.logoBase64, width: 64, height: 64 }
              : { text: 'DK', fontSize: 18, bold: true, color: CATALOG_MAROON }
          ],
          width: 140,
          alignment: 'center'
        },
        // Centre: website
        {
          text: 'www.dkbangkok.com',
          fontSize: 13,
          color: CATALOG_MAROON,
          alignment: 'center',
          margin: [0, 32, 0, 0],
          width: '*'
        },
        // Right: brand name (large) + headerLabel (smaller) tight together
        {
          stack: [
            { text: 'DUANG KAEW JEWELRY', fontSize: 16, bold: true, color: CATALOG_MAROON, alignment: 'right' },
            {
              text: headerLabel.toUpperCase(),
              fontSize: 13,
              color: CATALOG_MAROON,
              alignment: 'right',
              margin: [0, -2, 0, 0]
            }
          ],
          width: 'auto'
        }
      ],
      margin: [0, 0, 0, 6]
    }

    // Divider line
    const divider = {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_W, y2: 0, lineWidth: 0.8, lineColor: '#cccccc' }],
      margin: [0, 0, 0, 14]
    }

    // --- Left column (~30%): PRODUCT block + red info box ---
    const infoBoxContent = [
      { text: desc1, fontSize: 9, color: '#ffffff', margin: [0, 0, 0, 3] }
    ]
    if (desc2) {
      infoBoxContent.push({ text: desc2, fontSize: 9, color: '#ffffff' })
    }

    const leftCol = {
      width: '30%',
      stack: [
        { text: 'PRODUCT', fontSize: 11, bold: true, italics: true, color: '#1a1a1a', margin: [0, 0, 0, 0] },
        { text: '#' + code, fontSize: 13, bold: true, italics: true, color: '#1a1a1a', margin: [0, 0, 0, 8] },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: infoBoxContent,
                  fillColor: CATALOG_MAROON,
                  color: '#ffffff',
                  margin: [8, 7, 8, 7],
                  border: [false, false, false, false]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0
          }
        }
      ],
      margin: [0, 0, 16, 0]
    }

    // --- Right column (~70%): img1 (large) + img2/img3 cluster with dimension lines ---
    const img1 = catalogImages[0]
    const img2 = catalogImages[1]
    const img3 = catalogImages[2]

    // img1 large left
    const img1Stack = []
    if (img1) {
      img1Stack.push({ image: img1, width: 230, height: 230 })
    } else {
      img1Stack.push({
        canvas: [{ type: 'rect', x: 0, y: 0, w: 230, h: 230, lineColor: '#dddddd', lineWidth: 0.5 }]
      })
      img1Stack.push({ text: '[รูป 1]', fontSize: 10, color: '#cccccc', alignment: 'center', margin: [0, -125, 0, 0] })
    }

    // img2 + img3 right cluster with dimension lines
    // Uses fixed-width columns (no negative margin) for precise alignment.
    // IMG=135, DIMTXT_W=36, VLINE_W=10 → spacer = 46 = DIMTXT_W + VLINE_W
    // Row A: horizontal measure line (width IMG) starts exactly at left edge of img2 column
    // Row B: vertical measure line canvas (height IMG) starts at same top as img2 → exact symmetry

    const IMG = 135
    const DIMTXT_W = 36
    const VLINE_W = 10

    const img2ClusterRows = []

    if (img2) {
      // Row A — horizontal measure line above img2 (1.6 CM label)
      img2ClusterRows.push({
        columns: [
          { width: DIMTXT_W + VLINE_W, text: '' },
          {
            width: IMG,
            stack: [
              dim2
                ? { text: dim2.toUpperCase(), fontSize: 9, color: '#cf6a5c', alignment: 'center', margin: [0, 0, 0, 1] }
                : { text: '' },
              dim2
                ? {
                    canvas: [
                      { type: 'line', x1: 0, y1: 3, x2: IMG, y2: 3, lineWidth: 0.6, lineColor: '#cf6a5c' },
                      { type: 'line', x1: 0, y1: 0, x2: 0, y2: 6, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } },
                      { type: 'line', x1: IMG, y1: 0, x2: IMG, y2: 6, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } }
                    ],
                    margin: [0, 0, 0, 2]
                  }
                : { text: '' }
            ]
          }
        ]
      })

      // Row B — img2 + vertical measure line on the left (1.8 CM label)
      img2ClusterRows.push({
        columns: [
          dim1
            ? { width: DIMTXT_W, text: dim1.toUpperCase(), fontSize: 9, color: '#cf6a5c', alignment: 'right', margin: [0, 62, 4, 0] }
            : { width: DIMTXT_W, text: '' },
          dim1
            ? {
                width: VLINE_W,
                canvas: [
                  { type: 'line', x1: 5, y1: 0, x2: 5, y2: IMG, lineWidth: 0.6, lineColor: '#cf6a5c' },
                  { type: 'line', x1: 2, y1: 0, x2: 8, y2: 0, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } },
                  { type: 'line', x1: 2, y1: IMG, x2: 8, y2: IMG, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } }
                ]
              }
            : { width: VLINE_W, text: '' },
          { width: IMG, image: img2, height: IMG }
        ]
      })
    } else {
      // placeholder for img2
      img2ClusterRows.push({
        columns: [
          { width: DIMTXT_W + VLINE_W, text: '' },
          {
            width: IMG,
            stack: [
              { canvas: [{ type: 'rect', x: 0, y: 0, w: IMG, h: IMG, lineColor: '#dddddd', lineWidth: 0.5 }] },
              { text: '[รูป 2]', fontSize: 9, color: '#cccccc', alignment: 'center', margin: [0, -73, 0, 0] }
            ]
          }
        ]
      })
    }

    // img3 below img2 — offset left DIMTXT_W+VLINE_W to align with img2 column
    if (img3) {
      img2ClusterRows.push({
        columns: [
          { width: DIMTXT_W + VLINE_W, text: '' },
          {
            width: IMG,
            stack: [
              { image: img3, width: IMG, height: IMG, margin: [0, 8, 0, 0] },
              dim3
                ? { text: dim3.toUpperCase(), fontSize: 8, color: '#cf6a5c', alignment: 'center', margin: [0, 2, 0, 0] }
                : { text: '' }
            ]
          }
        ]
      })
    } else {
      img2ClusterRows.push({
        columns: [
          { width: DIMTXT_W + VLINE_W, text: '' },
          {
            width: IMG,
            stack: [
              { canvas: [{ type: 'rect', x: 0, y: 0, w: IMG, h: IMG, lineColor: '#dddddd', lineWidth: 0.5 }], margin: [0, 8, 0, 0] },
              { text: '[รูป 3]', fontSize: 9, color: '#cccccc', alignment: 'center', margin: [0, -73, 0, 0] }
            ]
          }
        ]
      })
    }

    const rightCol = {
      width: '70%',
      columns: [
        { stack: [img1Stack[0], ...(img1Stack.slice(1))], width: 'auto', margin: [0, 0, 16, 0] },
        { stack: img2ClusterRows, width: '*' }
      ]
    }

    const bodyRow = {
      columns: [leftCol, rightCol],
      margin: [0, 0, 0, 10]
    }

    // --- Footer social bar ---
    const socialIcon = (type) => ({ ...this.getSocialIcon(type), margin: [0, 2, 0, 0] })
    let socialColumns
    try {
      socialColumns = {
        columns: [
          // ซ้าย: ชิดซ้าย
          {
            width: '*',
            columns: [
              socialIcon('facebook'),
              { text: 'duangkaewjewelry', fontSize: 9, color: '#333333', margin: [5, 3, 0, 0], width: 'auto' }
            ]
          },
          // กลาง: spacer 2 ข้าง ดันให้อยู่กลาง
          {
            width: '*',
            columns: [
              { text: '', width: '*' },
              socialIcon('instagram'),
              { text: '@duangkaewjewelry.official', fontSize: 9, color: '#333333', margin: [5, 3, 0, 0], width: 'auto' },
              { text: '', width: '*' }
            ]
          },
          // ขวา: spacer ซ้าย ดันไปขวา
          {
            width: '*',
            columns: [
              { text: '', width: '*' },
              socialIcon('email'),
              { text: 'info@dkbkk.com', fontSize: 9, color: '#333333', margin: [5, 3, 0, 0], width: 'auto' }
            ]
          }
        ]
      }
    } catch {
      socialColumns = {
        columns: [
          { text: 'f  duangkaewjewelry', fontSize: 9, color: '#333333', bold: true, width: '*' },
          { text: 'IG  @duangkaewjewelry.official', fontSize: 9, color: '#333333', bold: true, alignment: 'center', width: '*' },
          { text: '✉  info@dkbkk.com', fontSize: 9, color: '#333333', bold: true, alignment: 'right', width: '*' }
        ]
      }
    }

    const socialFooter = {
      stack: [
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: CONTENT_W, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }
          ],
          margin: [0, 0, 0, 6]
        },
        socialColumns
      ]
    }

    const pageContent = {
      stack: [headerBand, divider, bodyRow, socialFooter]
    }

    if (!isLast) {
      pageContent.pageBreak = 'after'
    }

    return pageContent
  }

  // ---------- doc definition ----------

  getDocDefinition() {
    const cover = this.getCoverPage()

    const productPages = this.items.map((item, idx) =>
      this.getProductPage(item, idx === this.items.length - 1)
    )

    return {
      pageSize: { width: PAGE_W, height: PAGE_H },
      pageMargins: [40, 30, 40, 30],
      content: [cover, ...productPages],
      defaultStyle: {
        font: CATALOG_FONT,
        fontSize: 10
      }
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
    const name = filename || `catalog-${this.catalog.headerLabel || 'export'}.pdf`
    this.generatePDF().download(name)
  }
}
