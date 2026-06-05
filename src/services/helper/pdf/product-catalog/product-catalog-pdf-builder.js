// ProductCatalogPdfBuilder — generates a per-product-page catalog PDF using pdfmake.
//
// Active font: AcherusGrotesque (single TTF — all four pdfmake variants map to the same file).
// Optional accent fonts (Montserrat, Inter, BaskervilleDisplayPT) are not yet embedded;
// register them in src/services/utils/pdf-make.js once their TTF files are available.

import { initPdfMake } from '@/services/utils/pdf-make'

// AcherusGrotesque is now active (single weight — bold/italics all map to the same TTF).
// Montserrat, Inter, and BaskervilleDisplayPT remain optional accents not yet embedded.
const CATALOG_FONT = 'AcherusGrotesque'

export class ProductCatalogPdfBuilder {
  constructor(catalog, items, options = {}) {
    this.catalog = catalog || {}
    this.items = items ? [...items].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) : []
    this.goldColorMap = options.goldColorMap || {}
    this.productMaterialMap = options.productMaterialMap || {}

    this.logoBase64 = null
  }

  // ---------- image helpers ----------

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
      console.error('ProductCatalogPdfBuilder: Error loading image:', error)
      return null
    }
  }

  async prepareImages() {
    if (!this.items || !this.items.length) return

    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')

    await Promise.all(
      this.items.map(async (item) => {
        const code = item.productNumber
        if (!code) {
          item.catalogImages = [null, null, null]
          return
        }

        const results = await Promise.all(
          [1, 2, 3].map(async (n) => {
            const blobPath = `Stock/Product/${code}-${n}.jpg`
            try {
              const b64 = await getAzureBlobAsBase64(blobPath, 'stock')
              return b64 && b64.length > 0 ? b64 : null
            } catch {
              return null
            }
          })
        )
        item.catalogImages = results
      })
    )
  }

  async preparePDF() {
    if (!this.logoBase64) {
      try {
        const logoPath = new URL('@/assets/duangkaew-logo.png', import.meta.url).href
        this.logoBase64 = await this.loadImageAsBase64(logoPath)
      } catch (error) {
        console.error('ProductCatalogPdfBuilder: Failed to load logo:', error)
      }
    }

    await this.prepareImages()
    return this
  }

  // ---------- data helpers ----------

  getKaratFromHeaderLabel(headerLabel) {
    if (!headerLabel) return '18K'
    const m = (headerLabel + '').match(/^(\d+K)/i)
    return m ? m[1].toUpperCase() : '18K'
  }

  getGoldColorEn(productionType) {
    if (!productionType) return 'GOLD'
    const mapped = this.goldColorMap[productionType]
    if (mapped) return mapped.toUpperCase()
    return productionType.toUpperCase()
  }

  getMaterialSummary(productNumber) {
    const mat = this.productMaterialMap[productNumber]
    if (!mat) return { goldWeight: null, diamondPcs: null, diamondCarat: null, goldColor: 'GOLD' }
    return mat
  }

  // ---------- layout blocks ----------

  getLogoCell(logoWidth = 50) {
    if (this.logoBase64 && this.logoBase64.length > 0) {
      return { image: this.logoBase64, width: logoWidth, height: logoWidth, margin: [0, 0, 0, 0] }
    }
    return { text: 'DUANGKAEW', fontSize: 10, bold: true, color: '#8B0000' }
  }

  getCoverPage() {
    const catalog = this.catalog
    const headerLabel = catalog.headerLabel || ''
    const collectionTitle = catalog.collectionTitle || ''

    return {
      stack: [
        // top spacer
        { text: '', margin: [0, 80, 0, 0] },

        // logo centered
        {
          columns: [
            { width: '*', text: '' },
            this.logoBase64 && this.logoBase64.length > 0
              ? { image: this.logoBase64, width: 120, height: 120, alignment: 'center' }
              : { text: 'DUANGKAEW JEWELRY', fontSize: 20, bold: true, color: '#8B0000', alignment: 'center' },
            { width: '*', text: '' }
          ]
        },

        { text: '', margin: [0, 30, 0, 0] },

        // main title: headerLabel (e.g. "18K RING")
        {
          text: headerLabel.toUpperCase(),
          fontSize: 36,
          bold: true,
          color: '#1a1a1a',
          alignment: 'center',
          margin: [0, 0, 0, 8]
        },

        // collection title (e.g. "NEW COLLECTION 2025")
        collectionTitle
          ? {
              text: collectionTitle.toUpperCase(),
              fontSize: 18,
              color: '#555555',
              alignment: 'center',
              margin: [0, 0, 0, 0]
            }
          : { text: '' },

        // bottom push + footer
        { text: '', margin: [0, 120, 0, 0] },

        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#cccccc' }],
          margin: [0, 0, 0, 10]
        },

        {
          columns: [
            { text: 'info@dkbkk.com', fontSize: 9, color: '#888888', alignment: 'left' },
            { text: 'www.dkbangkok.com', fontSize: 9, color: '#888888', alignment: 'center' },
            { text: 'DUANGKAEW JEWELRY', fontSize: 9, bold: true, color: '#8B0000', alignment: 'right' }
          ]
        }
      ]
    }
  }

  getProductPage(item, isLast) {
    const catalog = this.catalog
    const headerLabel = catalog.headerLabel || ''
    const collectionTitle = catalog.collectionTitle || ''
    const karat = this.getKaratFromHeaderLabel(headerLabel)

    const mat = this.getMaterialSummary(item.productNumber)
    const goldColorEn = this.getGoldColorEn(mat.goldColor)

    // Description line 1: e.g. "18K GOLD RING 1.91 G"
    const desc1Parts = [karat, goldColorEn, 'RING']
    if (mat.goldWeight !== null && mat.goldWeight !== undefined) {
      desc1Parts.push(`${mat.goldWeight} G`)
    }
    const desc1 = desc1Parts.join(' ')

    // Description line 2: e.g. "17PCS DIAMOND 0.09 CT" (omit if no diamond)
    let desc2 = null
    if (mat.diamondPcs && mat.diamondPcs > 0) {
      desc2 = `${mat.diamondPcs}PCS DIAMOND ${mat.diamondCarat} CT`
    }

    // Images: up to 3
    const catalogImages = item.catalogImages || [null, null, null]
    const dimensions = [item.dimension1, item.dimension2, item.dimension3]

    // Build image columns (only include slots that have a base64 image)
    const imageCols = []
    for (let i = 0; i < 3; i++) {
      const b64 = catalogImages[i]
      const dim = dimensions[i]
      if (b64 && b64.length > 0) {
        const imgCell = {
          stack: [
            {
              image: b64,
              width: 150,
              height: 150,
              alignment: 'center',
              margin: [0, 0, 0, 4]
            },
            dim
              ? { text: dim.toUpperCase(), fontSize: 9, color: '#666666', alignment: 'center' }
              : { text: '' }
          ],
          alignment: 'center',
          margin: [5, 0, 5, 0]
        }
        imageCols.push(imgCell)
      }
    }

    // If no images at all, show placeholder
    if (!imageCols.length) {
      imageCols.push({
        stack: [
          { text: '[No Image]', fontSize: 12, color: '#cccccc', alignment: 'center', margin: [0, 60, 0, 60] }
        ],
        alignment: 'center'
      })
    }

    const pageContent = {
      stack: [
        // --- page header band ---
        {
          columns: [
            // left: logo + brand name
            {
              columns: [
                this.logoBase64 && this.logoBase64.length > 0
                  ? { image: this.logoBase64, width: 36, height: 36, margin: [0, 0, 8, 0] }
                  : { text: '' },
                {
                  stack: [
                    { text: 'DUANGKAEW JEWELRY', fontSize: 11, bold: true, color: '#8B0000' },
                    { text: 'info@dkbkk.com', fontSize: 8, color: '#888888' }
                  ],
                  margin: [0, 4, 0, 0]
                }
              ],
              width: '*'
            },
            // right: headerLabel + collection
            {
              stack: [
                { text: headerLabel.toUpperCase(), fontSize: 10, bold: true, color: '#1a1a1a', alignment: 'right' },
                collectionTitle
                  ? { text: collectionTitle.toUpperCase(), fontSize: 8, color: '#888888', alignment: 'right' }
                  : { text: '' }
              ],
              width: 'auto',
              margin: [0, 4, 0, 0]
            }
          ],
          margin: [0, 0, 0, 8]
        },

        // divider
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }],
          margin: [0, 0, 0, 16]
        },

        // --- product images row ---
        {
          columns: imageCols,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },

        // --- product label ---
        {
          text: 'PRODUCT',
          fontSize: 10,
          color: '#888888',
          alignment: 'center',
          letterSpacing: 4,
          margin: [0, 0, 0, 2]
        },
        {
          text: `#${item.productNumber || ''}`,
          fontSize: 22,
          bold: true,
          color: '#1a1a1a',
          alignment: 'center',
          margin: [0, 0, 0, 12]
        },

        // --- description ---
        {
          text: desc1,
          fontSize: 12,
          color: '#333333',
          alignment: 'center',
          margin: [0, 0, 0, 4]
        },
        desc2
          ? { text: desc2, fontSize: 12, color: '#333333', alignment: 'center', margin: [0, 0, 0, 4] }
          : { text: '' },

        // --- spacer then footer ---
        { text: '', margin: [0, 40, 0, 0] },

        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cccccc' }],
          margin: [0, 0, 0, 8]
        },

        {
          columns: [
            { text: 'duangkaewjewelry', fontSize: 8, color: '#888888' },
            { text: '@duangkaewjewelry.official', fontSize: 8, color: '#888888', alignment: 'center' },
            { text: 'info@dkbkk.com', fontSize: 8, color: '#888888', alignment: 'right' },
            { text: 'www.dkbangkok.com', fontSize: 8, color: '#888888', alignment: 'right' },
            { text: 'DUANGKAEW JEWELRY', fontSize: 8, bold: true, color: '#8B0000', alignment: 'right' }
          ],
          columnGap: 4
        }
      ]
    }

    if (!isLast) {
      pageContent.pageBreak = 'after'
    }

    return pageContent
  }

  getDocDefinition() {
    const cover = this.getCoverPage()
    cover.pageBreak = 'after'

    const productPages = this.items.map((item, idx) =>
      this.getProductPage(item, idx === this.items.length - 1)
    )

    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 40, 40, 40],
      content: [cover, ...productPages],
      defaultStyle: {
        font: CATALOG_FONT,
        fontSize: 11
      },
      styles: {
        coverTitle: {
          fontSize: 36,
          bold: true,
          color: '#1a1a1a'
        },
        coverSubtitle: {
          fontSize: 18,
          color: '#555555'
        }
      }
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    const docDefinition = this.getDocDefinition()
    return pdfMake.createPdf(docDefinition)
  }

  openPDF() {
    this.generatePDF().open()
  }

  downloadPDF(filename) {
    const name = filename || `catalog-${this.catalog.code || 'export'}.pdf`
    this.generatePDF().download(name)
  }
}
