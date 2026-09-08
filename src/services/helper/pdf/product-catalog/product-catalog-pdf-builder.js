// ProductCatalogPdfBuilder — generates Lookbook PDF matching the brand reference layout.
//
// Layout reference: docs/RING 18K เพชรล้วน_260520_204430.pdf
// Font: PDF_FONT (ChakraPetch, registered in pdf-make.js)
//
// TODO: Replace LOGO_ASSET path with a white-on-transparent PNG version for cover page.
//       Currently using duangkaew-logo.png (coloured). If the cover background is #9B2C20
//       the coloured logo may not be visible — provide duangkaew-logo-white.png and swap below.

import { initPdfMake } from '@/services/utils/pdf-make'
import { summarizeMaterials } from '@/services/utils/material-summary.js'
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'

// Brand colour constants — adjust once confirmed with client
const CATALOG_MAROON = '#9B2C20'
const CATALOG_FONT = PDF_FONT

// Page dimensions — landscape 16:9 based on A4 width
const PAGE_W = 842
const PAGE_H = 474
const CONTENT_W = 762 // PAGE_W - 40 (left margin) - 40 (right margin)

// Dimension-line layout constants (right column, all image-count layouts)
const DIMTXT_W = 36 // width reserved for the dimension label text beside the vertical measure line
const VLINE_W = 10 // width of the vertical measure line column

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
   * Each item may have imageBlobPaths: string[] (1-3 entries, continuous — no gaps)
   * or a legacy item.images: [{ sortOrder, blobPath }] array (e.g. views/catalog callers).
   * Populated into item.catalogImages: string[] (base64 dataURL), length matches the
   * number of real images (0-3) — no padding.
   */
  async prepareImages() {
    if (!this.items || !this.items.length) return

    const baseUrl = import.meta.env.VITE_JEWELRY_API_URL || 'https://localhost:7001/'

    await Promise.all(
      this.items.map(async (item) => {
        let blobPaths = item.imageBlobPaths
        if (!blobPaths || !blobPaths.length) {
          blobPaths = [...(item.images || [])]
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((img) => img.blobPath)
        }
        blobPaths = blobPaths.filter(Boolean)

        const results = await Promise.all(
          blobPaths.map(async (blobPath) => {
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
        item.catalogImageRatios = await Promise.all(results.map((u) => this.getImageRatio(u)))
      })
    )
  }

  getImageRatio(dataUrl) {
    if (!dataUrl) return Promise.resolve(1)
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1)
      img.onerror = () => resolve(1)
      img.src = dataUrl
    })
  }

  fitBox(ratio, side) {
    const ar = ratio || 1
    return ar >= 1 ? { w: side, h: side / ar } : { w: side * ar, h: side }
  }

  /**
   * Fetch productCode + materials for catalog items directly from StockProduct/List
   * (bypasses the Pinia store to avoid mutating the product list page's search state).
   */
  async prepareProductDetails() {
    const nums = [...new Set((this.items || []).map((i) => i.productNumber).filter(Boolean))]
    if (!nums.length) return

    const baseUrl = import.meta.env.VITE_JEWELRY_API_URL || 'https://localhost:7001/'
    const res = await fetch(`${baseUrl}StockProduct/List`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: localStorage.getItem('token-dk') },
      body: JSON.stringify({ take: nums.length + 10, skip: 0, sort: [], search: { productNumbers: nums } })
    })
    if (!res.ok) return

    const json = await res.json().catch(() => null)
    const byNum = {}
    ;((json && json.data) || []).forEach((p) => {
      if (p.productNumber) byNum[p.productNumber] = p
    })

    this.items.forEach((item) => {
      const p = byNum[item.productNumber]
      item.materialSummary = summarizeMaterials(p ? p.materials || [] : [])
      if (p && p.productCode) item.productCode = p.productCode
    })
  }

  async preparePDF() {
    // Load logo
    const logoPath = new URL('@/assets/duangkaew-logo.png', import.meta.url).href
    this.logoBase64 = await this.loadImageAsBase64(logoPath).catch(() => null)

    await Promise.all([this.prepareImages(), this.prepareProductDetails()])
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
    const code = item.productCode || item.productNumber || ''
    const desc1 = item.descriptionLine1 || ''
    const desc2 = item.descriptionLine2 || ''
    const dim1 = item.dimension1 || ''
    const dim2 = item.dimension2 || ''
    const dim3 = item.dimension3 || ''
    const catalogImages = item.catalogImages || []
    const ratios = item.catalogImageRatios || []

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

    const leftStack = [
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
    ]

    // --- Material summary: 1 row per material (ชื่อวัสดุจริง, PDF_FONT, no-wrap) ---
    const materials = Array.isArray(item.materialSummary) ? item.materialSummary : summarizeMaterials([])
    if (materials.length) {
      const nameCell = (t) => ({ text: t, fontSize: 9, color: '#1a1a1a' })
      const qtyCell = (t) => ({ text: t, fontSize: 9, color: '#1a1a1a', alignment: 'right', noWrap: true })
      const weightCell = (t) => ({ text: t, fontSize: 9, color: '#1a1a1a', alignment: 'right', noWrap: true, margin: [8, 0, 0, 0] })
      leftStack.push({
        margin: [0, 12, 0, 0],
        table: {
          widths: ['*', 'auto', 'auto'],
          body: materials.map((m) => [nameCell(m.name), qtyCell(m.qty), weightCell(m.weight)])
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 4,
          paddingBottom: () => 4
        }
      })
    }

    const leftCol = {
      width: '30%',
      stack: leftStack,
      margin: [0, 0, 16, 0]
    }

    // --- Right column (~70%): layout adapts to number of real images (0 / 1 / 2 / 3) ---
    const rightCol = this.buildImagesRightColumn(catalogImages, ratios, dim1, dim2, dim3)

    const bodyRow = {
      columns: [leftCol, rightCol],
      margin: [0, 0, 0, 10]
    }

    const pageContent = {
      stack: [headerBand, divider, bodyRow]
    }

    if (!isLast) {
      pageContent.pageBreak = 'after'
    }

    return pageContent
  }

  // ---------- right column layouts (adaptive by image count) ----------

  emptyImageBox(size) {
    return { canvas: [{ type: 'rect', x: 0, y: 0, w: size, h: size, lineColor: '#dddddd', lineWidth: 0.5 }] }
  }

  buildImagesRightColumn(catalogImages, ratios, dim1, dim2, dim3) {
    const count = catalogImages.length

    if (count >= 3) {
      return this.buildThreeImageRightColumn(catalogImages, ratios, dim1, dim2, dim3)
    }
    if (count === 2) {
      return this.buildTwoImageRightColumn(catalogImages, ratios, dim1, dim2, dim3)
    }
    if (count === 1) {
      return this.buildOneImageRightColumn(catalogImages, ratios, dim1, dim2)
    }
    return this.buildEmptyRightColumn()
  }

  // Shared builder for a single image + its dimension-line cluster (used by the 1-image
  // and 2-image layouts). Row A = horizontal measure line (dim2) above the image,
  // Row B = image + vertical measure line (dim1) on the left, Row C (optional) = caption below.
  buildDimensionCluster({ image, ratio, size, dim1, dim2, caption }) {
    const box = this.fitBox(ratio || 1, size)
    const rows = []

    rows.push({
      columns: [
        { width: DIMTXT_W + VLINE_W, text: '' },
        {
          width: box.w,
          stack: [
            dim2
              ? { text: dim2.toUpperCase(), fontSize: 9, color: '#cf6a5c', alignment: 'center', margin: [0, 0, 0, 1] }
              : { text: '' },
            dim2
              ? {
                  canvas: [
                    { type: 'line', x1: 0, y1: 3, x2: box.w, y2: 3, lineWidth: 0.6, lineColor: '#cf6a5c' },
                    { type: 'line', x1: 0, y1: 0, x2: 0, y2: 6, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } },
                    { type: 'line', x1: box.w, y1: 0, x2: box.w, y2: 6, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } }
                  ],
                  margin: [0, 0, 0, 2]
                }
              : { text: '' }
          ]
        }
      ]
    })

    rows.push({
      columns: [
        dim1
          ? { width: DIMTXT_W, text: dim1.toUpperCase(), fontSize: 9, color: '#cf6a5c', alignment: 'right', margin: [0, Math.max(0, box.h / 2 - 6), 4, 0] }
          : { width: DIMTXT_W, text: '' },
        dim1
          ? {
              width: VLINE_W,
              canvas: [
                { type: 'line', x1: 5, y1: 0, x2: 5, y2: box.h, lineWidth: 0.6, lineColor: '#cf6a5c' },
                { type: 'line', x1: 2, y1: 0, x2: 8, y2: 0, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } },
                { type: 'line', x1: 2, y1: box.h, x2: 8, y2: box.h, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } }
              ]
            }
          : { width: VLINE_W, text: '' },
        image ? { width: box.w, image, height: box.h } : { width: box.w, ...this.emptyImageBox(box.w) }
      ]
    })

    if (caption) {
      rows.push({
        columns: [
          { width: DIMTXT_W + VLINE_W, text: '' },
          { width: box.w, text: caption.toUpperCase(), fontSize: 8, color: '#cf6a5c', alignment: 'center', margin: [0, 2, 0, 0] }
        ]
      })
    }

    return { rows, box, headerH: dim2 ? 12 : 0, captionH: caption ? 10 : 0 }
  }

  // A·1 — single image (290pt), horizontally centred in the right column,
  // dimension lines attached directly to this image, no caption.
  buildOneImageRightColumn(catalogImages, ratios, dim1, dim2) {
    const cluster = this.buildDimensionCluster({
      image: catalogImages[0],
      ratio: ratios[0],
      size: 290,
      dim1,
      dim2,
      caption: null
    })

    return {
      width: '70%',
      columns: [
        { width: '*', text: '' },
        { width: 'auto', stack: cluster.rows },
        { width: '*', text: '' }
      ]
    }
  }

  // A·2 — main image (260pt, plain) + second image (175pt, dimension-lined + caption),
  // arranged horizontally and vertically centred against each other.
  buildTwoImageRightColumn(catalogImages, ratios, dim1, dim2, dim3) {
    const MAIN = 260
    const box1 = this.fitBox(ratios[0] || 1, MAIN)
    const cluster = this.buildDimensionCluster({
      image: catalogImages[1],
      ratio: ratios[1],
      size: 175,
      dim1,
      dim2,
      caption: dim3
    })

    const clusterH = cluster.headerH + cluster.box.h + cluster.captionH
    const mainOffset = Math.max(0, (clusterH - box1.h) / 2)
    const clusterOffset = Math.max(0, (box1.h - clusterH) / 2)

    const mainImage = catalogImages[0]
      ? { image: catalogImages[0], width: box1.w, height: box1.h }
      : this.emptyImageBox(box1.w)

    return {
      width: '70%',
      columns: [
        { stack: [mainImage], width: 'auto', margin: [0, mainOffset, 16, 0] },
        { stack: cluster.rows, width: 'auto', margin: [0, clusterOffset, 0, 0] }
      ]
    }
  }

  // A·3 — original 3-image layout (230 + 135 + 135), unchanged output for legacy catalogs.
  buildThreeImageRightColumn(catalogImages, ratios, dim1, dim2, dim3) {
    const img1 = catalogImages[0]
    const img2 = catalogImages[1]
    const img3 = catalogImages[2]

    const img1Block = img1 ? { image: img1, fit: [230, 230] } : this.emptyImageBox(230)

    // img2 + img3 right cluster with dimension lines
    // Uses fixed-width columns (no negative margin) for precise alignment.
    // IMG=135, DIMTXT_W=36, VLINE_W=10 → spacer = 46 = DIMTXT_W + VLINE_W
    // Row A: horizontal measure line (width IMG) starts exactly at left edge of img2 column
    // Row B: vertical measure line canvas (height IMG) starts at same top as img2 → exact symmetry
    const IMG = 135

    const box2 = img2 ? this.fitBox(ratios[1], IMG) : { w: IMG, h: IMG }

    const img2ClusterRows = []

    if (img2) {
      // Row A — horizontal measure line above img2 (1.6 CM label)
      img2ClusterRows.push({
        columns: [
          { width: DIMTXT_W + VLINE_W, text: '' },
          {
            width: box2.w,
            stack: [
              dim2
                ? { text: dim2.toUpperCase(), fontSize: 9, color: '#cf6a5c', alignment: 'center', margin: [0, 0, 0, 1] }
                : { text: '' },
              dim2
                ? {
                    canvas: [
                      { type: 'line', x1: 0, y1: 3, x2: box2.w, y2: 3, lineWidth: 0.6, lineColor: '#cf6a5c' },
                      { type: 'line', x1: 0, y1: 0, x2: 0, y2: 6, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } },
                      { type: 'line', x1: box2.w, y1: 0, x2: box2.w, y2: 6, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } }
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
            ? { width: DIMTXT_W, text: dim1.toUpperCase(), fontSize: 9, color: '#cf6a5c', alignment: 'right', margin: [0, Math.max(0, box2.h / 2 - 6), 4, 0] }
            : { width: DIMTXT_W, text: '' },
          dim1
            ? {
                width: VLINE_W,
                canvas: [
                  { type: 'line', x1: 5, y1: 0, x2: 5, y2: box2.h, lineWidth: 0.6, lineColor: '#cf6a5c' },
                  { type: 'line', x1: 2, y1: 0, x2: 8, y2: 0, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } },
                  { type: 'line', x1: 2, y1: box2.h, x2: 8, y2: box2.h, lineWidth: 0.6, lineColor: '#cf6a5c', dash: { length: 2 } }
                ]
              }
            : { width: VLINE_W, text: '' },
          { width: box2.w, image: img2, height: box2.h }
        ]
      })
    } else {
      // placeholder for img2 (defensive — count>=3 normally guarantees img2 is present)
      img2ClusterRows.push({
        columns: [
          { width: DIMTXT_W + VLINE_W, text: '' },
          { width: IMG, ...this.emptyImageBox(IMG) }
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
              { image: img3, fit: [IMG, IMG], margin: [0, 8, 0, 0] },
              dim3
                ? { text: dim3.toUpperCase(), fontSize: 8, color: '#cf6a5c', alignment: 'center', margin: [0, 2, 0, 0] }
                : { text: '' }
            ]
          }
        ]
      })
    } else {
      // placeholder for img3 (defensive — count>=3 normally guarantees img3 is present)
      img2ClusterRows.push({
        columns: [
          { width: DIMTXT_W + VLINE_W, text: '' },
          {
            width: IMG,
            stack: [{ ...this.emptyImageBox(IMG), margin: [0, 8, 0, 0] }]
          }
        ]
      })
    }

    return {
      width: '70%',
      columns: [
        { stack: [img1Block], width: 'auto', margin: [0, 0, 16, 0] },
        { stack: img2ClusterRows, width: '*' }
      ]
    }
  }

  // 0 images — single dashed placeholder box, no text, centred in the right column.
  buildEmptyRightColumn() {
    return {
      width: '70%',
      columns: [
        { width: '*', text: '' },
        { width: 'auto', ...this.emptyImageBox(230) },
        { width: '*', text: '' }
      ]
    }
  }

  // ---------- footer ----------

  getSocialFooterContent() {
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

    return {
      margin: [40, 6, 40, 0],
      stack: [
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_W, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }], margin: [0, 0, 0, 6] },
        socialColumns
      ]
    }
  }

  // ---------- doc definition ----------

  getDocDefinition() {
    const cover = this.getCoverPage()

    const productPages = this.items.map((item, idx) =>
      this.getProductPage(item, idx === this.items.length - 1)
    )

    const self = this

    return {
      pageSize: { width: PAGE_W, height: PAGE_H },
      pageMargins: [40, 30, 40, 54],
      content: [cover, ...productPages],
      footer: (currentPage) => (currentPage === 1 ? null : self.getSocialFooterContent()),
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
