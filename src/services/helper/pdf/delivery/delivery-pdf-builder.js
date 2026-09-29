import dayjs from 'dayjs'
import 'dayjs/locale/en'
import { initPdfMake } from '@/services/utils/pdf-make'
import { formatItemStyleCode } from '@/services/utils/item-code.js'
import { PDF_FONT, PDF_COLORS } from '@/services/helper/pdf/shared/pdf-theme.js'
import { buildDocumentHeader } from '@/services/helper/pdf/shared/pdf-sections.js'
import { COMPANY_INFO, loadCompanyInfo } from '@/config/company-info.js'

export class DeliveryPdfBuilder {
  constructor(
    data,
    customer,
    deliveryDate,
    saleOrderData,
    currencyUnit,
    currencyRate,
    deliveryNo,
    itemsPerPage
  ) {
    this.data = data // ข้อมูลสินค้าที่เลือก
    this.customer = customer || {}
    this.saleOrderData = saleOrderData || {}
    this.deliveryDate = deliveryDate || dayjs()
    this.companyInfo = { ...COMPANY_INFO }
    this.deliveryNo = deliveryNo || this.generateDeliveryNumber()
    this.logoBase64 = null
    this.currencyUnit = currencyUnit || 'THB'
    this.currencyRate = Number(currencyRate) || 1

    this.itemsPerPage = Number(itemsPerPage) || 10
  }

  // เมธอดใหม่สำหรับเตรียมข้อมูล PDF ซึ่งจะโหลดโลโก้ก่อน
  async preparePDF() {
    if (!this.logoBase64) {
      try {
        const logoPath = new URL('@/assets/duangkaew-icon.png', import.meta.url).href
        this.logoBase64 = await this.loadImageAsBase64(logoPath)
      } catch (error) {
        console.error('Failed to load logo:', error)
      }
    }

    const company = await loadCompanyInfo()
    this.companyInfo = { ...COMPANY_INFO, ...(company?.info || {}) }

    // Pre-load all product images from Azure Blob Storage
    await this.prepareImages()

    return this
  }

  // เมธอดสำหรับโหลดรูปภาพสินค้าจาก Azure Blob Storage
  async prepareImages() {
    if (!this.data || !Array.isArray(this.data)) return

    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')

    // โหลดรูปภาพทั้งหมดพร้อมกัน
    await Promise.all(
      this.data.map(async (item) => {
        if (item.imageBase64) return

        // ใช้ imageBlobPath ก่อน, ถ้าไม่มีใช้ imagePath
        const blobPath = item.imageBlobPath || item.imagePath
        if (!blobPath) return

        try {
          const base64Image = await getAzureBlobAsBase64(blobPath, 'stock')
          if (base64Image && base64Image.length > 0) {
            item.imageBase64 = base64Image
          }
        } catch (error) {
          console.error('Error loading image:', blobPath, error)
        }
      })
    )
  }

  // เมธอดสำหรับโหลดและแปลงรูปภาพเป็น base64
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

  roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  getHeaderContent() {
    const rightStack = {
      stack: [
        { text: 'DELIVERY NOTE', fontSize: 16, color: PDF_COLORS.darkGray, alignment: 'center', margin: [0, 8, 0, 2] },
        {
          columns: [
            { text: 'No.:', fontSize: 8, color: PDF_COLORS.darkGray, alignment: 'right', width: '35%' },
            { text: this.deliveryNo || '', fontSize: 10, bold: true, color: PDF_COLORS.primary, alignment: 'left', width: '65%', margin: [5, 0, 0, 0] }
          ]
        },
        {
          columns: [
            { text: 'Date:', fontSize: 8, color: PDF_COLORS.darkGray, alignment: 'right', width: '35%' },
            { text: dayjs(this.deliveryDate).locale('en').format('MMMM DD, YYYY'), fontSize: 10, bold: true, color: PDF_COLORS.primary, alignment: 'left', width: '65%', margin: [5, 0, 0, 0] }
          ]
        },
        {
          columns: [
            { text: 'SO#:', fontSize: 8, color: PDF_COLORS.darkGray, alignment: 'right', width: '35%' },
            { text: this.saleOrderData.soNumber || this.saleOrderData.number || '', fontSize: 10, bold: true, color: PDF_COLORS.primary, alignment: 'left', width: '65%', margin: [5, 0, 0, 0] }
          ]
        }
      ]
    }

    const customerLeft = [
      { text: `Delivery To: ${this.customer.name || ''}`, fontSize: 11, bold: true, color: PDF_COLORS.primary },
      { text: 'Address: ' + (this.customer.address || ''), fontSize: 9, color: PDF_COLORS.darkGray }
    ]
    const customerRight = [
      { text: 'TEL: ' + (this.customer.phone || ''), fontSize: 9, color: PDF_COLORS.darkGray },
      { text: 'E-mail: ' + (this.customer.email || ''), fontSize: 9, color: PDF_COLORS.darkGray }
    ]

    return buildDocumentHeader({
      logoBase64: this.logoBase64,
      company: this.companyInfo,
      rightStack,
      customerLeft,
      customerRight
    })
  }

  // แก้ไขเมธอด createPages
  createPages() {
    const itemsPerPage = this.itemsPerPage
    const pages = []
    const totalItems = this.data ? this.data.length : 0
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    if (totalPages === 0) {
      pages.push(this.getEmptyPageContent())
      return pages
    }

    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const startIdx = pageNum * itemsPerPage
      const endIdx = Math.min(startIdx + itemsPerPage, totalItems)
      const pageItems = this.data.slice(startIdx, endIdx)
      const isLastPage = pageNum === totalPages - 1

      const pageContent = []

      // ใส่ส่วนหัวตารางในทุกหน้า (ถ้าไม่ใช่หน้าแรก)
      if (pageNum > 0) {
        pageContent.push(this.getHeaderContent())
      }

      // เพิ่มตารางพร้อม total
      if (isLastPage) {
        pageContent.push(this.getFinalPageTableContent(pageItems, pageNum))
      } else {
        pageContent.push(this.getRegularPageTableContent(pageItems, pageNum))
      }

      // เพิ่ม Summary Section
      pageContent.push(...this.getSummarySection())

      // เพิ่ม pageBreak ในทุกหน้ายกเว้นหน้าสุดท้าย
      if (pageNum < totalPages - 1) {
        pageContent.push({ text: '', pageBreak: 'after' })
      }

      pages.push(...pageContent)
    }

    return pages
  }

  // สร้างตารางเปล่า (Empty Page)
  getEmptyPageContent() {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [15, 30, '*', '*', '*', '*', '*', 20], // 8 columns (ไม่มี Price และ Amount)
        body: [
          [
            this.setTableHeader('No.'),
            this.setTableHeader(''),
            this.setTableHeader('Style/Product'),
            this.setTableHeader('Description'),
            this.setTableHeader('Gold (gms)'),
            this.setTableHeader('Diamond (cts)'),
            this.setTableHeader('Gem (cts)'),
            this.setTableHeader('Qty')
          ]
        ]
      },
      layout: {
        hLineWidth: function () {
          return 0.5
        },
        vLineWidth: function () {
          return 0
        }
      }
    }
  }

  // ตารางหน้าปกติ (ไม่ใช่หน้าสุดท้าย)
  getRegularPageTableContent(items, pageNum) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [15, 30, 118, 96, 52, 70, '*', 24], // 8 columns
        body: this.buildRegularTableBody(items, pageNum)
      },
      layout: {
        hLineWidth: function () {
          return 0.5
        },
        vLineWidth: function () {
          return 0.5
        }
      }
    }
  }

  // ตารางหน้าสุดท้าย
  getFinalPageTableContent(items, pageNum) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [15, 30, 118, 96, 52, 70, '*', 24], // 8 columns
        body: this.buildFinalTableBody(items, pageNum)
      },
      layout: {
        hLineWidth: function () {
          return 0.5
        },
        vLineWidth: function () {
          return 0.5
        }
      }
    }
  }

  // สร้าง body ตาราง (หน้าปกติ)
  buildRegularTableBody(items, pageNum) {
    const body = []
    // Header
    body.push([
      this.setTableHeader(''),
      this.setTableHeader(''),
      this.setTableHeader('Style/Product'),
      this.setTableHeader('Description'),
      this.setTableHeader('Gold (gms)'),
      this.setTableHeader('Diamond (cts)'),
      this.setTableHeader('Gem (cts)'),
      this.setTableHeader('Qty')
    ])

    // Content rows
    let sumGold = 0,
      sumDiamond = 0,
      sumGem = 0,
      sumQty = 0
    items = items || []

    items.forEach((item, index) => {
      const actualIndex = pageNum * this.itemsPerPage + index
      const qty = Number(item.qty) || 0
      sumQty += qty

      if (item.materials && Array.isArray(item.materials)) {
        item.materials.forEach((m) => {
          if (m.type === 'Gold') sumGold += Number(m.weight) || 0
          if (m.type === 'Diamond') sumDiamond += Number(m.weight) || 0
          if (m.type === 'Gem') sumGem += Number(m.weight) || 0
        })
      }

      body.push([
        this.setTableCell((actualIndex + 1).toString()),
        item.imageBase64 || item.imageBlobPath
          ? this.setTabImageCell(item.imageBase64, item.imageBlobPath)
          : this.setTableCell(''),
        this.setTableCell(formatItemStyleCode(item)),
        this.setTableCell(this.getDescription(item)),
        this.buildMaterialTable(item.materials, 'Gold'),
        this.buildMaterialTable(item.materials, 'Diamond'),
        this.buildMaterialTable(item.materials, 'Gem'),
        this.setTableCellRight(qty ? qty.toString() : '0')
      ])
    })

    // Footer: Total weight, qty
    body.push([
      { text: 'Total', style: 'summaryLabelColored', alignment: 'right', colSpan: 4 },
      { text: '', style: 'summaryLabelColored', alignment: 'right' },
      { text: '', style: 'summaryLabelColored', alignment: 'right' },
      { text: '', style: 'summaryLabelColored', alignment: 'right' },
      { text: this.formatPrice(sumGold), style: 'summaryLabelColored', alignment: 'right' },
      { text: this.formatPrice(sumDiamond), style: 'summaryLabelColored', alignment: 'right' },
      { text: this.formatPrice(sumGem), style: 'summaryLabelColored', alignment: 'right' },
      { text: sumQty, style: 'summaryLabelColored', alignment: 'right' }
    ])

    return body
  }

  // สร้าง body ตาราง (หน้าสุดท้าย)
  buildFinalTableBody(items, pageNum) {
    return this.buildRegularTableBody(items, pageNum)
  }

  getSummarySection() {
    // Calculate net weight
    let gold = 0
    let diamond = 0
    let gem = 0
    if (this.data && Array.isArray(this.data)) {
      this.data.forEach((item) => {
        if (item.materials) {
          item.materials.forEach((m) => {
            if (m.type === 'Gold') gold += Number(m.weight) || 0
            if (m.type === 'Diamond') diamond += Number(m.weight) || 0
            if (m.type === 'Gem') gem += Number(m.weight) || 0
          })
        }
      })
    }
    const net = (diamond + gem) / 5 + gold
    const netWeightText = `NET WEIGHT OF MERCHANDISES ${net ? net.toFixed(2) : (0).toFixed(2)} (gms.)`

    return [
      {
        columns: [
          {
            stack: [
              {
                columns: [
                  { text: 'ONE PARCEL ONLY', style: 'parcelText', alignment: 'left', width: '60%' },
                  {
                    text: 'Confirm and Accept',
                    style: 'parcelText',
                    alignment: 'center',
                    width: '40%'
                  }
                ]
              },
              {
                columns: [
                  {
                    text: 'WE CERTIFY THAT THIS DELIVERY NOTE TRUE AND CORRECT.',
                    style: 'certifyText',
                    alignment: 'left'
                  }
                ]
              },
              {
                columns: [
                  { text: netWeightText, width: '50%', style: 'weightText' },
                  { text: '', width: '50%', style: 'madeInText' }
                ]
              },
              {
                columns: [
                  { text: 'ORIGIN THAILAND', style: 'parcelText', alignment: 'left', width: '60%' },
                  {
                    text: '______________________________',
                    style: 'parcelText',
                    alignment: 'center',
                    width: '40%',
                    margin: [0, 18, 0, 0]
                  }
                ]
              },
              {
                columns: [
                  { text: '', style: 'parcelText', alignment: 'left', width: '60%' },
                  {
                    text: '(Authorized Signature and Company Stamp)',
                    style: 'parcelText',
                    alignment: 'center',
                    width: '40%'
                  }
                ]
              }
            ],
            width: '100%'
          }
        ],
        margin: [0, 6, 0, 0],
        unbreakable: true,
        pageBreakBefore: false
      }
    ]
  }

  getDescription(item) {
    return item.description || item.productNumber || ''
  }

  buildMaterialTable(materials, type) {
    if (!materials || !Array.isArray(materials)) return ''
    const rows = materials
      .filter((m) => m.type === type)
      .map((m) => [
        {
          text:
            type === 'Gold'
              ? m.typeCode || ''
              : (m.qty ? '(' + m.qty + ') ' : '') + (m.typeCode || ''),
          alignment: 'left',
          fontSize: 10,
          margin: [0, 0, 0, 0]
        },
        {
          text: m.weight ? Number(m.weight).toFixed(2) : Number(0).toFixed(2),
          alignment: 'right',
          fontSize: 10,
          margin: [0, 0, 0, 0]
        }
      ])
    if (!rows.length) return ''
    return {
      table: {
        widths: ['*', 'auto'],
        body: rows
      },
      layout: {
        hLineWidth: function () {
          return 0
        },
        vLineWidth: function () {
          return 0
        },
        paddingLeft: function () {
          return 0
        },
        paddingRight: function () {
          return 0
        },
        paddingTop: function () {
          return 0
        },
        paddingBottom: function () {
          return 0
        }
      },
      margin: [5, 5, 0, 0]
    }
  }

  setTableHeader(text) {
    return {
      text: text,
      bold: true,
      fontSize: 10,
      alignment: 'center',
      fillColor: '#8B0000',
      color: 'white',
      margin: [2, 5, 2, 5]
    }
  }

  setTableCell(text) {
    return {
      text: text || '',
      fontSize: 11,
      margin: [2, 5, 2, 5]
    }
  }

  /**
   * สร้าง image cell สำหรับตาราง PDF
   * รองรับทั้ง base64 (legacy) และ blobPath (ใหม่)
   * @param {string} imageBase64 - Base64 string (deprecated)
   * @param {string} imageBlobPath - Azure Blob path
   * @returns {object} - pdfmake table cell object
   */
  setTabImageCell(imageBase64, imageBlobPath = null) {
    // ถ้าไม่มีทั้ง base64 และ blobPath ให้ return empty cell
    if (!imageBase64 && !imageBlobPath) {
      return {
        text: '',
        alignment: 'center'
      }
    }

    // กรณีที่ 1: มี base64 (legacy support)
    if (imageBase64) {
      const imageData = imageBase64.startsWith('data:image')
        ? imageBase64
        : `data:image/png;base64,${imageBase64}`

      return {
        image: imageData,
        width: 25,
        height: 25,
        alignment: 'center',
        margin: [2, 5, 2, 5]
      }
    }

      // กรณีที่ 2: มี blobPath ให้ return empty cell
    // (ต้อง pre-load เป็น Base64 ก่อนสร้าง PDF แล้ว)
    if (imageBlobPath) {
      return {
        text: 'No Image',
        fontSize: 8,
        color: '#999999',
        alignment: 'center',
        margin: [2, 5, 2, 5]
      }
    }
  }

  setTableCellRight(text) {
    return {
      text: text || '',
      fontSize: 10,
      alignment: 'right',
      margin: [2, 5, 2, 5]
    }
  }

  formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) return '0.00'
    return price.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [10, 10, 10, 30],
      content: [this.getHeaderContent(), ...this.createPages()],
      footer: function (currentPage, pageCount) {
        return {
          text: currentPage.toString() + ' / ' + pageCount,
          alignment: 'center',
          margin: [0, 8, 0, 0]
        }
      },
      defaultStyle: {
        font: PDF_FONT,
        fontSize: 13
      },
      styles: {
        headerCompanyName: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 2]
        },
        companyName: {
          fontSize: 16,
          bold: true,
          color: '#8B0000',
          margin: [0, 0, 0, 0]
        },
        companyInfo: {
          fontSize: 10,
          bold: true,
          margin: [0, 0, 0, 0]
        },
        deliveryTitle: {
          fontSize: 22,
          bold: true,
          alignment: 'center',
          margin: [0, 8, 0, 8]
        },
        summaryLabel: {
          fontSize: 12,
          bold: true
        },
        summaryLabelColored: {
          fontSize: 12,
          bold: true,
          color: 'white',
          fillColor: '#8B0000'
        },
        parcelText: {
          fontSize: 9
        },
        certifyText: {
          fontSize: 9
        },
        weightText: {
          fontSize: 9
        },
        madeInText: {
          fontSize: 9
        }
      }
    }
  }

  generateDeliveryNumber() {
    const date = dayjs()
    const timestamp = date.format('YYMMDDHHmmss')
    return `DN-${timestamp}`
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
      const deliveryFileName = `DeliveryNote_${this.deliveryNo}_${dayjs().format('YYYYMMDD')}.pdf`
      pdf.download(deliveryFileName)
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
}
