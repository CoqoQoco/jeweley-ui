import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'

export class SaleOrderPdfBuilder {
  constructor(soData, options = {}) {
    this.soData = soData || {}
    this.items = soData?.items || []
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: 'FAX: (+662) 2710834',
      email: 'admin@dkbangkok.com'
    }
    this.logoBase64 = null
    this.currencyUnit = options.currencyUnit || 'THB'
    this.currencyRate = Number(options.currencyRate) || 1
    this.itemsPerPage = Number(options.itemsPerPage) || 10

    // Financial adjustments
    this.specialDiscount = Number(soData.specialDiscount) || 0
    this.specialAddition = Number(soData.specialAddition) || 0
    this.freightAndInsurance = Number(soData.freight) || Number(soData.freightAndInsurance) || 0
    this.vatPercent = Number(soData.vatPercent) || Number(soData.vat) || 0

    // Calculate totals
    this.subtotal = this.calculateSubtotal()
    this.totalAfterDiscountAndAddition = this.subtotal - this.specialDiscount + this.specialAddition
    this.totalBeforeVat = this.totalAfterDiscountAndAddition + this.freightAndInsurance
    this.vatAmount = (this.totalBeforeVat * this.vatPercent) / 100
    this.totalAmount = this.totalBeforeVat + this.vatAmount
  }

  calculateSubtotal() {
    if (!this.items || !Array.isArray(this.items)) return 0

    let total = 0
    this.items.forEach((item) => {
      const price = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = price * (1 - discountPercent / 100)
      const convertedPrice = priceAfterDiscount / this.currencyRate
      total += convertedPrice * qty
    })
    return total
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

    await this.prepareImages()

    return this
  }

  async prepareImages() {
    if (!this.items || !Array.isArray(this.items)) return

    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')

    await Promise.all(
      this.items.map(async (item) => {
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
    return {
      stack: [
        // Main Header
        {
          margin: [-10, -10, -10, 0],
          table: {
            widths: ['70%', '30%'],
            body: [
              [
                {
                  fillColor: '#e0e0e0',
                  stack: [
                    {
                      columns: [
                        this.logoBase64
                          ? {
                              image: this.logoBase64,
                              width: 35,
                              height: 35,
                              margin: [15, 10, 10, 0]
                            }
                          : {
                              text: 'LOGO',
                              fontSize: 14,
                              color: 'white',
                              margin: [15, 20, 10, 0]
                            },
                        {
                          stack: [
                            {
                              text: 'Duang Kaew Jewelry',
                              fontSize: 30,
                              bold: true,
                              color: '#8B0000',
                              margin: [25, 5, 0, 0]
                            },
                            {
                              text: 'The first step is always the hardest',
                              fontSize: 12,
                              color: '#8B0000',
                              margin: [25, -10, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  stack: [
                    {
                      text: 'SALE ORDER',
                      fontSize: 20,
                      color: '#393939',
                      alignment: 'center',
                      margin: [0, 10, 0, 0]
                    },
                    {
                      columns: [
                        {
                          text: 'SO No.:',
                          fontSize: 9,
                          color: '#393939',
                          alignment: 'right',
                          width: '45%'
                        },
                        {
                          text: this.soData.soNumber || '',
                          fontSize: 12,
                          bold: true,
                          color: '#8B0000',
                          alignment: 'left',
                          width: '55%',
                          margin: [5, 0, 0, 0]
                        }
                      ]
                    },
                    {
                      columns: [
                        {
                          text: 'Date:',
                          fontSize: 9,
                          color: '#393939',
                          alignment: 'right',
                          width: '45%'
                        },
                        {
                          text: dayjs(this.soData.createDate).locale('en').format('MMMM DD, YYYY'),
                          fontSize: 12,
                          bold: true,
                          color: '#8B0000',
                          alignment: 'left',
                          width: '55%',
                          margin: [5, 0, 0, 0]
                        }
                      ]
                    }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
        },

        // Horizontal line
        {
          margin: [0, 0, 0, 5],
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 675,
              y2: 0,
              lineWidth: 2,
              lineColor: '#E0E0E0'
            }
          ]
        },

        // Company info and Customer info
        {
          margin: [0, 0, 0, 0],
          columns: [
            {
              width: '50%',
              stack: [
                {
                  text: 'From: Duang Kaew Jewelry Manufacturer Co.,Ltd.',
                  fontSize: 14,
                  bold: true,
                  color: '#8B0000',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'Address: ' + (this.companyInfo.address || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'TEL: ' + (this.companyInfo.phone || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'FAX: ' + (this.companyInfo.fax || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'E-Mail: ' + (this.companyInfo.email || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                }
              ]
            },
            {
              width: '50%',
              stack: [
                {
                  text: `Customer: ${this.soData.customerName || ''}`,
                  fontSize: 14,
                  bold: true,
                  color: '#8B0000',
                  margin: [0, 0, 0, 0]
                },
                this.soData.customerAddress
                  ? {
                      text: 'Address: ' + this.soData.customerAddress,
                      fontSize: 10,
                      color: '#393939',
                      margin: [0, 0, 0, 0]
                    }
                  : null,
                this.soData.customerTel
                  ? {
                      text: 'TEL: ' + this.soData.customerTel,
                      fontSize: 10,
                      color: '#393939',
                      margin: [0, 0, 0, 0]
                    }
                  : null,
                this.soData.remark
                  ? {
                      text: 'Remark: ' + this.soData.remark,
                      fontSize: 10,
                      color: '#393939',
                      margin: [0, 5, 0, 0]
                    }
                  : null,
                {
                  //text: `Currency: ${this.currencyUnit} (Rate: ${this.currencyRate})`,
                    text: "",
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 5, 0, 0]
                }
              ].filter(Boolean)
            }
          ]
        },

        // Horizontal line
        {
          margin: [0, 5, 0, 5],
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 575,
              y2: 0,
              lineWidth: 2,
              lineColor: '#E0E0E0'
            }
          ]
        }
      ].filter(Boolean)
    }
  }

  createPages() {
    const itemsPerPage = this.itemsPerPage
    const pages = []
    const totalItems = this.items ? this.items.length : 0
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    if (totalPages === 0) {
      pages.push(this.getEmptyPageContent())
      return pages
    }

    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const startIdx = pageNum * itemsPerPage
      const endIdx = Math.min(startIdx + itemsPerPage, totalItems)
      const pageItems = this.items.slice(startIdx, endIdx)
      const isLastPage = pageNum === totalPages - 1

      const pageContent = []

      if (pageNum > 0) {
        pageContent.push(this.getHeaderContent())
      }

      if (isLastPage) {
        pageContent.push(this.getFinalPageTableContent(pageItems, pageNum))
      } else {
        pageContent.push(this.getRegularPageTableContent(pageItems, pageNum))
      }

      pageContent.push(...this.getSummarySection())

      if (pageNum < totalPages - 1) {
        pageContent.push({ text: '', pageBreak: 'after' })
      }

      pages.push(...pageContent)
    }

    return pages
  }

  getEmptyPageContent() {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [15, 30, '*', '*', '*', '*', '*', 20, 60, 60],
        body: [
          [
            this.setTableHeader('No.'),
            this.setTableHeader(''),
            this.setTableHeader('Style/Product'),
            this.setTableHeader('Description'),
            this.setTableHeader('Gold (gms)'),
            this.setTableHeader('Diamond (cts)'),
            this.setTableHeader('Gem (cts)'),
            this.setTableHeader('Qty'),
            this.setTableHeader('Price (' + this.currencyUnit + ')'),
            this.setTableHeader('Amount')
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

  getRegularPageTableContent(items, pageNum) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [15, 30, 70, 70, 35, 45, '*', 20, 60, 60],
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

  getFinalPageTableContent(items, pageNum) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [15, 30, 70, 70, 35, 45, '*', 20, 60, 60],
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
      this.setTableHeader('Qty'),
      this.setTableHeader('Price (' + this.currencyUnit + ')'),
      this.setTableHeader('Amount (' + this.currencyUnit + ')')
    ])

    // Content rows
    let sumGold = 0,
      sumDiamond = 0,
      sumGem = 0,
      sumQty = 0,
      sumAmount = 0
    items = items || []

    items.forEach((item, index) => {
      const actualIndex = pageNum * this.itemsPerPage + index

      const appraisalPrice = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)
      const convertedPrice = priceAfterDiscount / this.currencyRate
      const amount = convertedPrice * qty

      sumQty += qty
      sumAmount += amount

      body.push([
        this.setTableCell((actualIndex + 1).toString()),
        item.imageBase64 || item.imageBlobPath || item.imagePath
          ? this.setTabImageCell(item.imageBase64, item.imageBlobPath || item.imagePath)
          : this.setTableCell(''),
        this.setTableCell(
          item.stockNumber && item.productNumber
            ? `${item.stockNumber}/${item.productNumber}`
            : item.stockNumber || item.productNumber || ''
        ),
        this.setTableCell(this.getDescription(item)),
        this.buildMaterialTable(item.materials, 'Gold'),
        this.buildMaterialTable(item.materials, 'Diamond'),
        this.buildMaterialTable(item.materials, 'Gem'),
        this.setTableCellRight(qty ? qty.toString() : '0'),
        this.setTableCellRight(this.formatPrice(Number(convertedPrice))),
        this.setTableCellRight(this.roundNoDecimal(amount))
      ])
    })

    // Footer: Total weight, qty, amount
    body.push([
      { text: 'Total', style: 'summaryLabelColored', alignment: 'right', colSpan: 4 },
      { text: '', style: 'summaryLabelColored', alignment: 'right' },
      { text: '', style: 'summaryLabelColored', alignment: 'right' },
      { text: '', style: 'summaryLabelColored', alignment: 'right' },
      { text: this.formatPrice(sumGold), style: 'summaryLabelColored', alignment: 'right' },
      { text: this.formatPrice(sumDiamond), style: 'summaryLabelColored', alignment: 'right' },
      { text: this.formatPrice(sumGem), style: 'summaryLabelColored', alignment: 'right' },
      { text: sumQty, style: 'summaryLabelColored', alignment: 'right' },
      { text: '', style: 'summaryLabelColored', alignment: 'right' },
      { text: this.roundNoDecimal(sumAmount), style: 'summaryLabelColored', alignment: 'right' }
    ])

    return body
  }

  buildFinalTableBody(items, pageNum) {
    const body = this.buildRegularTableBody(items, pageNum)

    // SUBTOTAL row (F.O.B Bangkok)
    body.push([
      {
        text: '',
        style: 'summaryLabel',
        alignment: 'right',
        colSpan: 7,
        border: [true, false, false, false]
      },
      {},
      {},
      {},
      {},
      {},
      {},
      { text: 'F.O.B Bangkok', style: 'totalSummaryLabelColored', alignment: 'right', colSpan: 2 },
      {},
      {
        text: this.roundNoDecimal(this.subtotal),
        style: 'totalSummaryLabelColored',
        alignment: 'right'
      }
    ])

    // SPECIAL DISCOUNT
    if (this.specialDiscount > 0) {
      body.push([
        {
          text: '',
          style: 'summaryLabel',
          alignment: 'right',
          colSpan: 7,
          border: [true, false, false, false]
        },
        {},
        {},
        {},
        {},
        {},
        {},
        {
          text: 'SPECIAL DISCOUNT',
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          colSpan: 2
        },
        {},
        {
          text: '-' + this.roundNoDecimal(this.specialDiscount),
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          color: '#ff4d4d'
        }
      ])
    }

    // SPECIAL ADDITION
    if (this.specialAddition > 0) {
      body.push([
        {
          text: '',
          style: 'summaryLabel',
          alignment: 'right',
          colSpan: 7,
          border: [true, false, false, false]
        },
        {},
        {},
        {},
        {},
        {},
        {},
        {
          text: 'SPECIAL ADDITION',
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          colSpan: 2
        },
        {},
        {
          text: '+' + this.roundNoDecimal(this.specialAddition),
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          color: '#038387'
        }
      ])
    }

    // FREIGHT & INSURANCE
    if (this.freightAndInsurance > 0) {
      body.push([
        {
          text: '',
          style: 'summaryLabel',
          alignment: 'right',
          colSpan: 7,
          border: [true, false, false, false]
        },
        {},
        {},
        {},
        {},
        {},
        {},
        {
          text: 'FREIGHT & INSURANCE',
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          colSpan: 2
        },
        {},
        {
          text: this.roundNoDecimal(this.freightAndInsurance),
          style: 'totalSummaryLabelColored',
          alignment: 'right'
        }
      ])
    }

    // VAT
    if (this.vatPercent > 0) {
      body.push([
        {
          text: '',
          style: 'summaryLabel',
          alignment: 'right',
          colSpan: 7,
          border: [true, false, false, false]
        },
        {},
        {},
        {},
        {},
        {},
        {},
        {
          text: `VAT (${this.vatPercent}%)`,
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          colSpan: 2
        },
        {},
        {
          text: this.roundNoDecimal(this.vatAmount),
          style: 'totalSummaryLabelColored',
          alignment: 'right'
        }
      ])
    }

    // GRAND TOTAL (C.I.F)
    const grandTotal = this.totalAmount

    body.push([
      {
        text: this.convertNumberToWords(grandTotal),
        style: 'summaryLabelColored',
        alignment: 'left',
        colSpan: 7
      },
      {},
      {},
      {},
      {},
      {},
      {},
      { text: 'C.I.F', style: 'totalSummaryLabelColored', alignment: 'right', colSpan: 2 },
      {},
      {
        text: this.roundNoDecimal(grandTotal),
        style: 'totalSummaryLabelColored',
        alignment: 'right'
      }
    ])

    return body
  }

  getSummarySection() {
    // Calculate net weight
    let gold = 0
    let diamond = 0
    let gem = 0
    if (this.items && Array.isArray(this.items)) {
      this.items.forEach((item) => {
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
                  { text: 'ONE PARCEL ONLY', style: 'parcelText', alignment: 'left', width: '70%' },
                  {
                    text: 'Confirm and Accept',
                    style: 'parcelText',
                    alignment: 'center',
                    width: '30%'
                  }
                ]
              },
              {
                columns: [
                  {
                    text: 'WE CERTIFY THAT THIS SALE ORDER IS TRUE AND CORRECT.',
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
                  { text: 'ORIGIN THAILAND', style: 'parcelText', alignment: 'left', width: '70%' },
                  {
                    text: '______________________________',
                    style: 'parcelText',
                    alignment: 'center',
                    width: '30%'
                  }
                ]
              },
              {
                columns: [
                  { text: '', style: 'parcelText', alignment: 'left', width: '70%' },
                  {
                    text: '(Authorized Signature and Company Stamp)',
                    style: 'parcelText',
                    alignment: 'center',
                    width: '30%'
                  }
                ]
              }
            ],
            width: '90%'
          }
        ],
        margin: [0, 15, 0, 0],
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
        widths: ['*', 15],
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

  convertNumberToWords(number) {
    const prefix = this.currencyUnit ? `(${this.currencyUnit})` : ''
    const numInWords = prefix + ' ' + this.numberToWords(Math.floor(number)) + ' ONLY'
    return numInWords
  }

  numberToWords(num) {
    const units = [
      '',
      'ONE',
      'TWO',
      'THREE',
      'FOUR',
      'FIVE',
      'SIX',
      'SEVEN',
      'EIGHT',
      'NINE',
      'TEN',
      'ELEVEN',
      'TWELVE',
      'THIRTEEN',
      'FOURTEEN',
      'FIFTEEN',
      'SIXTEEN',
      'SEVENTEEN',
      'EIGHTEEN',
      'NINETEEN'
    ]
    const tens = [
      '',
      '',
      'TWENTY',
      'THIRTY',
      'FORTY',
      'FIFTY',
      'SIXTY',
      'SEVENTY',
      'EIGHTY',
      'NINETY'
    ]

    if (num === 0) return 'ZERO'

    function convertLessThanThousand(num) {
      if (num === 0) return ''
      if (num < 20) return units[num]

      const unit = num % 10
      const ten = Math.floor(num / 10) % 10
      const hundred = Math.floor(num / 100) % 10

      let result = ''
      if (hundred > 0) {
        result += units[hundred] + ' HUNDRED'
        if (ten > 0 || unit > 0) result += ' '
      }

      if (ten > 1) {
        result += tens[ten]
        if (unit > 0) result += '-' + units[unit]
      } else {
        result += units[ten * 10 + unit]
      }

      return result
    }

    let words = ''
    const billion = Math.floor(num / 1000000000)
    const million = Math.floor((num % 1000000000) / 1000000)
    const thousand = Math.floor((num % 1000000) / 1000)
    const remainder = num % 1000

    if (billion > 0) {
      words += convertLessThanThousand(billion) + ' BILLION'
      if (million > 0 || thousand > 0 || remainder > 0) words += ' '
    }

    if (million > 0) {
      words += convertLessThanThousand(million) + ' MILLION'
      if (thousand > 0 || remainder > 0) words += ' '
    }

    if (thousand > 0) {
      words += convertLessThanThousand(thousand) + ' THOUSAND'
      if (remainder > 0) words += ' '
    }

    if (remainder > 0) {
      words += convertLessThanThousand(remainder)
    }

    return words
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

  setTabImageCell(imageBase64, imageBlobPath = null) {
    if (!imageBase64 && !imageBlobPath) {
      return {
        text: '',
        alignment: 'center'
      }
    }

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

  roundNoDecimal(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0.00'
    return Math.round(num).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [10, 10, 10, 40],
      content: [this.getHeaderContent(), ...this.createPages()],
      footer: function (currentPage, pageCount) {
        return {
          text: currentPage.toString() + ' / ' + pageCount,
          alignment: 'center',
          margin: [0, 10, 0, 0]
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
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
        totalSummaryLabelColored: {
          fontSize: 12,
          bold: true,
          color: '#8B0000',
          fillColor: '#e0e0e0'
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

  async generatePDF() {
    await this.preparePDF()
    const pdfMake = initPdfMake()
    const docDefinition = this.getDocDefinition()
    return pdfMake.createPdf(docDefinition)
  }

  async downloadPDF() {
    const pdf = await this.generatePDF()
    const filename = `SO_${this.soData.soNumber || 'DRAFT'}_${dayjs().format('YYYYMMDD')}.pdf`
    pdf.download(filename)
  }

  async openPDF() {
    const pdf = await this.generatePDF()
    pdf.open()
  }
}
