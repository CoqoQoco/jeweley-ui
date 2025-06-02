import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'

export class InvoicePdfBuilder {
  constructor(
    data,
    customer,
    invoiceDate,
    freight,
    discount,
    invoiceNo,
    currencyUnit,
    currencyMultiplier,
    itemsPerPage // เพิ่ม parameter นี้
  ) {
    this.data = data // ข้อมูลสินค้า
    this.customer = customer || {}
    this.invoiceDate = invoiceDate || dayjs().format('YYYY-MM-DD')
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: 'FAX: (+662) 2710834',
      email: 'admin@dkbangkok.com'
    }
    this.invoiceNo = invoiceNo
    this.freight = Number(freight) || 0
    this.discount = Number(discount) || 0
    this.logoBase64 = null
    this.currencyUnit = currencyUnit || 'THB'
    this.currencyMultiplier = Number(currencyMultiplier) || 1
    this.itemsPerPage = Number(itemsPerPage) || 10 // default 10 ถ้าไม่ส่งมา

    // เพิ่มการคำนวณ totalAmount ใน constructor
    this.totalAmount = this.calculateTotalAmount()
  }

  // เพิ่มเมธอดคำนวณ totalAmount
  calculateTotalAmount() {
    let total = 0
    if (this.data && Array.isArray(this.data)) {
      this.data.forEach((item) => {
        const appraisalPrice = Number(item.appraisalPrice) || 0
        const discountPercent = this.customer.discountPercent || 0
        const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)

        const qtyVal = Number(item.qty) || 0
        const convertedPrice = this.roundNoDecimal(priceAfterDiscount / this.currencyMultiplier)

        total += convertedPrice * qtyVal
      })
    }
    return total
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
    return this
  }

  // เมธอดสำหรับโหลดและแปลงรูปภาพเป็น base64
  async loadImageAsBase64(path) {
    try {
      // วิธีที่ 1: ใช้ fetch API
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

  getHeaderContent() {
    return {
      stack: [
        // --- Main Header with dark blue background and green accent ---
        {
          margin: [-10, -10, -10, 0], // ขยายให้เต็มความกว้าง
          table: {
            widths: ['70%', '30%'],
            body: [
              [
                {
                  // Left side - Company info with dark blue background
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
                  // Right side - Invoice title with green background
                  //fillColor: '#7CB342', // สีเขียว
                  stack: [
                    {
                      text: 'QUOTATION',
                      fontSize: 20,
                      //bold: true,
                      color: '#393939',
                      alignment: 'center',
                      margin: [0, 10, 0, 0]
                    },
                    {
                      columns: [
                        {
                          text: 'No.:',
                          fontSize: 9,
                          color: '#393939',
                          alignment: 'right',
                          width: '45%'
                        },
                        {
                          text: this.invoiceNo || '',
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
                          text: dayjs(this.invoiceDate).format('MMM DD, YYYY'),
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

        // --- Company details and Consigned To section ---
        {
          margin: [0, 0, 0, 0],
          columns: [
            {
              width: '50%',
              stack: [
                // Company Address
                {
                  text: 'Form: Duang Kaew Jewelry Manufacturer Co.,Ltd.',
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
                  text: `Consigned To: ${this.customer.name || ''}`,
                  fontSize: 14,
                  bold: true,
                  color: '#8B0000',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'Address: ' + (this.customer.address || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                // เพิ่ม ardders (ถ้ามี)
                this.customer.ardders
                  ? {
                      text: this.customer.ardders,
                      fontSize: 10,
                      color: '#393939',
                      margin: [0, 0, 0, 0]
                    }
                  : null,
                {
                  text: 'TEl: ' + (this.customer.tel || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                { text: 'E-mail: ' + (this.customer.email || ''), fontSize: 10, color: '#393939' }
              ]
            }
          ]
        },

        // --- Note section if exists ---
        this.customer.remark
          ? {
              margin: [0, 5, 0, 0],
              text: 'Note: ' + this.customer.remark,
              fontSize: 10,
              color: '#0000FF'
            }
          : null,

        // --- Horizontal line separator ---
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
      ].filter(Boolean) // กรอง null values ออก
    }
  }

  // แก้ไขเมธอด createPages ให้ทุกหน้ามี total และ getSummarySection
  createPages() {
    const itemsPerPage = this.itemsPerPage // ใช้ค่าจาก instance
    const pages = []
    const totalItems = this.data ? this.data.length : 0 // เพิ่มการตรวจสอบ
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    if (totalPages === 0) {
      // ถ้าไม่มีข้อมูล ให้สร้างหน้าเปล่า
      pages.push(this.getEmptyPageContent())
      return pages
    }

    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const startIdx = pageNum * itemsPerPage
      const endIdx = Math.min(startIdx + itemsPerPage, totalItems)
      const pageItems = this.data.slice(startIdx, endIdx)
      const isLastPage = pageNum === totalPages - 1

      // คำนวณ pageTotal สำหรับแต่ละหน้า
      let pageTotal = 0
      pageItems.forEach((item) => {
        const discountPrice = Number(item.discountPrice || 0)
        const convertedPrice = discountPrice / this.currencyMultiplier
        const totalConverted = convertedPrice * (item.qty || 0)
        pageTotal += totalConverted
      })

      const pageContent = []

      // ใส่ส่วนหัวตารางในทุกหน้า (ถ้าไม่ใช่หน้าแรก)
      if (pageNum > 0) {
        pageContent.push(this.getHeaderContent())
      }

      // เพิ่มตารางพร้อม total
      if (isLastPage) {
        pageContent.push(this.getFinalPageTableContent(pageItems, pageNum, totalPages, pageTotal))
      } else {
        pageContent.push(this.getRegularPageTableContent(pageItems, pageNum, totalPages, pageTotal))
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
        widths: [15, 30, '*', '*', '*', '*', '*', 20, 60, 60], // 10 columns
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
        hLineWidth: function (i, node) {
          return 0.5
        },
        vLineWidth: function (i, node) {
          return 0
        }
      }
    }
  }

  // ตารางหน้าปกติ (ไม่ใช่หน้าสุดท้าย)
  getRegularPageTableContent(items, pageNum, totalPages, pageTotal) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [15, 30, 70, 70, 35, 45, '*', 20, 60, 60], // 10 columns
        body: this.buildRegularTableBody(items, pageNum, totalPages, pageTotal)
      },
      layout: {
        hLineWidth: function () {
          return 0.5
        },
        vLineWidth: function () {
          return 0.5
        } // border left/right
      }
    }
  }

  // ตารางหน้าสุดท้าย (มี total, freight, discount, grand total)
  getFinalPageTableContent(items, pageNum, totalPages, pageTotal) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [15, 30, 70, 70, 35, 45, '*', 20, 60, 60], // 10 columns
        body: this.buildFinalTableBody(items, pageNum, totalPages, pageTotal)
      },
      layout: {
        hLineWidth: function () {
          return 0.5
        },
        vLineWidth: function () {
          return 0.5
        } // border left/right
      }
    }
  }

  // สร้าง body ตาราง (หน้าปกติ)
  buildRegularTableBody(items, pageNum, totalPages, pageTotal) {
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
      const actualIndex = pageNum * 10 + index
      // Gold, Diamond, Gem columns (format like UI)
      function buildMaterialTable(materials, type) {
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
      // Calculate total weights for summary
      let goldWeight = 0,
        diamondWeight = 0,
        gemWeight = 0
      if (item.materials && Array.isArray(item.materials)) {
        item.materials.forEach((m) => {
          if (m.type === 'Gold') goldWeight += Number(m.weight) || 0
          if (m.type === 'Diamond') diamondWeight += Number(m.weight) || 0
          if (m.type === 'Gem') gemWeight += Number(m.weight) || 0
        })
      }
      sumGold += goldWeight
      sumDiamond += diamondWeight
      sumGem += gemWeight
      const qty = Number(item.qty) || 0
      // --- ปรับ logic ตรงนี้ ---

      const price = this.roundNoDecimal(
        ((Number(item.appraisalPrice) || 0) * (1 - (this.customer.discountPercent || 0) / 100)) /
          this.currencyMultiplier
      )

      // const price =
      // ((Number(item.appraisalPrice) || 0) * (1 - (this.customer.discountPercent || 0) / 100)) /
      // this.currencyMultiplier

      const amount = price * qty
      sumQty += qty
      sumAmount += amount

      body.push([
        this.setTableCell((actualIndex + 1).toString()),
        item.imageBase64 ? this.setTabImageCell(item.imageBase64) : this.setTableCell(''),
        this.setTableCell(
          item.stockNumberOrigin && item.productNumber
            ? `${item.stockNumberOrigin}/${item.productNumber}`
            : item.stockNumberOrigin || item.productNumber || ''
        ),
        this.setTableCell(this.getDescription(item)),
        buildMaterialTable(item.materials, 'Gold'),
        buildMaterialTable(item.materials, 'Diamond'),
        buildMaterialTable(item.materials, 'Gem'),
        this.setTableCellRight(qty ? qty.toString() : '0'),
        this.setTableCellRight(this.formatPrice(Number(price))),
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

  // สร้าง body ตาราง (หน้าสุดท้าย)
  buildFinalTableBody(items, pageNum, totalPages, pageTotal) {
    const body = this.buildRegularTableBody(items, pageNum, totalPages, pageTotal)
    // --- Add Total Weight (All Pages) row ---
    let sumGoldAll = 0,
      sumDiamondAll = 0,
      sumGemAll = 0,
      sumQty = 0

    if (this.data && Array.isArray(this.data)) {
      this.data.forEach((item) => {
        const qty = Number(item.qty) || 0
        sumQty += qty

        if (item.materials && Array.isArray(item.materials)) {
          item.materials.forEach((m) => {
            if (m.type === 'Gold') sumGoldAll += Number(m.weight) || 0
            if (m.type === 'Diamond') sumDiamondAll += Number(m.weight) || 0
            if (m.type === 'Gem') sumGemAll += Number(m.weight) || 0
          })
        }
      })
    }

    if (totalPages > 1) {
      body.push([
        { text: 'Grand Total', style: 'summaryLabel', alignment: 'right', colSpan: 4 },
        {},
        {},
        {},
        { text: this.formatPrice(sumGoldAll), style: 'summaryLabel', alignment: 'right' },
        { text: this.formatPrice(sumDiamondAll), style: 'summaryLabel', alignment: 'right' },
        { text: this.formatPrice(sumGemAll), style: 'summaryLabel', alignment: 'right' },
        { text: sumQty, style: 'summaryLabel', alignment: 'right' },
        {},
        {}
      ])
    }

    // TOTAL row
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
        text: this.roundNoDecimal(this.totalAmount),
        style: 'totalSummaryLabelColored',
        alignment: 'right'
      }
    ])

    // FREIGHT & INSURANCE
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
        text: this.roundNoDecimal(this.freight),
        style: 'totalSummaryLabelColored',
        alignment: 'right'
      }
    ])
    // DISCOUNT
    // body.push([
    //   { text: 'DISCOUNT', style: 'summaryLabel', alignment: 'right', colSpan: 8 },
    //   { text: '' },
    //   { text: this.formatPrice(this.discount), style: 'summaryLabel', alignment: 'right' }
    // ])
    // GRAND TOTAL (colSpan:7, 2 empty, label, value)
    const grandTotal = this.totalAmount + this.freight - this.discount

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
    // Calculate net weight like sumNetWeight in quotation-view.vue
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
    const netWeightText = `${
      net ? net.toFixed(2) : (0).toFixed(2)
    } NET WEIGHT OF MERCHANDISES (gms.)`
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
                    text: 'WE CERTIFY THAT THIS INVOICE TRUE AND CORRECT.',
                    style: 'certifyText',
                    alignment: 'left'
                  }
                ]
              },
              {
                columns: [
                  { text: netWeightText, width: '50%', style: 'weightText' },
                  { text: '', width: '50%', style: 'madeInText' }
                  // {
                  //   text: 'Signature:',
                  //   width: '20%',
                  //   style: 'receivedByText',
                  //   margin: [25, 0, 0, 0]
                  // }
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
    let description = item.productNameEn || ''
    if (item.size) {
      description += ' ' + item.size
    }
    return description
  }

  getMaterialInfo(materials, type) {
    if (!materials || !Array.isArray(materials)) return null
    return materials.find((m) => m.type === type)
  }

  convertNumberToWords(number) {
    const prefix = this.customer.currencyUnit ? `(${this.customer.currencyUnit})` : ''
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
      text: text || '', // เพิ่ม fallback
      fontSize: 11,
      margin: [2, 5, 2, 5]
    }
  }

  setTabImageCell(imageBase64) {
    if (!imageBase64) {
      return {
        text: '',
        alignment: 'center'
        //margin: [5, 5, 5, 5]
      }
    }

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

  setTableCellRight(text) {
    return {
      text: text || '', // เพิ่ม fallback
      fontSize: 10,
      alignment: 'right',
      margin: [2, 5, 2, 5]
    }
  }
  setTablePriceCellRight(text) {
    return {
      text: text || '', // เพิ่ม fallback
      fontSize: 12,
      alignment: 'right',
      margin: [2, 5, 2, 5],
      fillColor: '#e0e0e0',
      color: '#8B0000'
    }
  }

  setTableFooterRight(text) {
    return {
      text: text || '', // เพิ่ม fallback
      bold: true,
      fontSize: 12,
      alignment: 'right',
      fillColor: '#8B0000',
      color: 'white',
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
    return Math.round(num).toFixed(2)
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [10, 10, 10, 40],
      content: [this.getHeaderContent(), ...this.createPages()], // ลบ getBreakdownSection()
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
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: 'center',
          margin: [0, 8, 0, 8]
        },
        invoiceInfoLabel: {
          fontSize: 10,
          margin: [0, 2, 0, 2]
        },
        invoiceInfoValue: {
          fontSize: 10,
          bold: true,
          margin: [0, 2, 0, 2]
        },
        customerInfo: {
          fontSize: 10,
          margin: [0, 0, 0, 2]
        },
        noteText: {
          fontSize: 10,
          color: '#0000FF'
        },
        dateSmall: {
          fontSize: 9,
          color: '#000000'
        },
        summaryLabel: {
          fontSize: 12,
          bold: true
        },
        summaryValue: {
          fontSize: 10,
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
        totalWords: {
          fontSize: 10,
          bold: true
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
        },
        receivedByText: {
          fontSize: 9
        },
        totalWordsInTable: {
          fontSize: 10,
          bold: true,
          margin: [0, 2, 0, 0]
        }
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
}
