import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'

export class InvoicePdfBuilder {
  constructor(
    data,
    customer,
    invoiceDate,
    saleOrderData,
    currencyUnit,
    currencyRate,
    invoiceNo,
    itemsPerPage
  ) {
    this.data = data // ข้อมูลสินค้าที่เลือก
    this.customer = customer || {}
    this.saleOrderData = saleOrderData || {}
    this.invoiceDate = invoiceDate || dayjs()
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: 'FAX: (+662) 2710834',
      email: 'admin@dkbangkok.com'
    }
    this.invoiceNo = invoiceNo || this.generateInvoiceNumber()
    this.logoBase64 = null
    this.currencyUnit = currencyUnit || 'THB'
    this.currencyRate = Number(currencyRate) || 1

    // Financial adjustments from invoice data
    this.specialDiscount = Number(saleOrderData.specialDiscount) || 0
    this.specialAddition = Number(saleOrderData.specialAddition) || 0
    this.freightAndInsurance = Number(saleOrderData.freightAndInsurance) || 0
    this.vatPercent = Number(saleOrderData.vatPercent) || Number(saleOrderData.vat) || 0

    // Legacy fields for backward compatibility
    this.freight = Number(saleOrderData.freight) || this.freightAndInsurance
    this.discount = Number(saleOrderData.discount) || 0
    this.itemsPerPage = Number(itemsPerPage) || 10

    // Calculate totals with new fields
    this.subtotal = this.calculateSubtotal()
    this.totalAfterDiscountAndAddition = this.subtotal - this.specialDiscount + this.specialAddition
    this.totalBeforeVat = this.totalAfterDiscountAndAddition + this.freightAndInsurance
    this.vatAmount = (this.totalBeforeVat * this.vatPercent) / 100
    this.totalAmount = this.totalBeforeVat + this.vatAmount
  }

  calculateSubtotal() {
    if (!this.data || !Array.isArray(this.data)) return 0

    let total = 0
    this.data.forEach(item => {
      const price = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      // Apply item-level discount
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = price * (1 - discountPercent / 100)
      // Convert currency
      const convertedPrice = priceAfterDiscount / this.currencyRate
      total += convertedPrice * qty
    })
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
        // ถ้ามี imageBlobPath ให้โหลดเป็น Base64
        if (item.imageBlobPath && !item.imageBase64) {
          try {
            const base64Image = await getAzureBlobAsBase64(item.imageBlobPath, 'mold')

            if (base64Image && base64Image.length > 0) {
              item.imageBase64 = base64Image
            } else {
              console.warn('No image found for blob path:', item.imageBlobPath)
            }
          } catch (error) {
            console.error('Error loading image:', item.imageBlobPath, error)
          }
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
                  // Right side - Invoice title
                  stack: [
                    {
                      text: 'INVOICE',
                      fontSize: 20,
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
                    },
                    {
                      columns: [
                        {
                          text: 'SO#:',
                          fontSize: 9,
                          color: '#393939',
                          alignment: 'right',
                          width: '45%'
                        },
                        {
                          text: this.saleOrderData.soNumber || this.saleOrderData.number || '',
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

        // --- Company details and Invoice To section ---
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
                  text: `Invoice To: ${this.customer.name || ''}`,
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
                {
                  text: 'TEL: ' + (this.customer.phone || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'E-mail: ' + (this.customer.email || ''),
                  fontSize: 10,
                  color: '#393939'
                },
                {
                  text: `Currency: ${this.currencyUnit} (Rate: ${this.currencyRate})`,
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 5, 0, 0]
                }
              ]
            }
          ]
        },

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

      // คำนวณ pageTotal สำหรับแต่ละหน้า (ไม่ได้ใช้ในขณะนี้ แต่เก็บไว้สำหรับอนาคต)
      // let pageTotal = 0
      // pageItems.forEach((item) => {
      //   const appraisalPrice = Number(item.appraisalPrice) || 0
      //   const discountPercent = Number(item.discountPercent) || 0
      //   const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)
      //   const convertedPrice = priceAfterDiscount / this.currencyRate
      //   const totalConverted = convertedPrice * (item.qty || 0)
      //   pageTotal += totalConverted
      // })

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
        widths: [15, 30, 70, 70, 35, 45, '*', 20, 60, 60], // 10 columns
        body: this.buildRegularTableBody(items, pageNum)
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
  getFinalPageTableContent(items, pageNum) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [15, 30, 70, 70, 35, 45, '*', 20, 60, 60], // 10 columns
        body: this.buildFinalTableBody(items, pageNum)
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
      const actualIndex = pageNum * 10 + index

      // คำนวณราคาและจำนวน
      const appraisalPrice = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      // Use item-level discount percent
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)
      const convertedPrice = priceAfterDiscount / this.currencyRate
      const amount = convertedPrice * qty

      sumQty += qty
      sumAmount += amount

      body.push([
        this.setTableCell((actualIndex + 1).toString()),
        item.imageBase64 || item.imageBlobPath
          ? this.setTabImageCell(item.imageBase64, item.imageBlobPath)
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

  // สร้าง body ตาราง (หน้าสุดท้าย)
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
      {}, {}, {}, {}, {}, {},
      { text: 'F.O.B Bangkok', style: 'totalSummaryLabelColored', alignment: 'right', colSpan: 2 },
      {},
      {
        text: this.roundNoDecimal(this.subtotal),
        style: 'totalSummaryLabelColored',
        alignment: 'right'
      }
    ])

    // SPECIAL DISCOUNT - แสดงเฉพาะเมื่อมีค่า
    if (this.specialDiscount > 0) {
      body.push([
        {
          text: '',
          style: 'summaryLabel',
          alignment: 'right',
          colSpan: 7,
          border: [true, false, false, false]
        },
        {}, {}, {}, {}, {}, {},
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

    // SPECIAL ADDITION - แสดงเฉพาะเมื่อมีค่า
    if (this.specialAddition > 0) {
      body.push([
        {
          text: '',
          style: 'summaryLabel',
          alignment: 'right',
          colSpan: 7,
          border: [true, false, false, false]
        },
        {}, {}, {}, {}, {}, {},
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

    // FREIGHT & INSURANCE - แสดงเฉพาะเมื่อมีค่า
    if (this.freightAndInsurance > 0) {
      body.push([
        {
          text: '',
          style: 'summaryLabel',
          alignment: 'right',
          colSpan: 7,
          border: [true, false, false, false]
        },
        {}, {}, {}, {}, {}, {},
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

    // VAT - แสดงเฉพาะเมื่อมีค่า
    if (this.vatPercent > 0) {
      body.push([
        {
          text: '',
          style: 'summaryLabel',
          alignment: 'right',
          colSpan: 7,
          border: [true, false, false, false]
        },
        {}, {}, {}, {}, {}, {},
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
      {}, {}, {}, {}, {}, {},
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
     const netWeightText = `NET WEIGHT OF MERCHANDISES ${net ? net.toFixed(2) : (0).toFixed(2)} (gms.)`
    // const netWeightText = `${
    //   net ? net.toFixed(2) : (0).toFixed(2)
    // } NET WEIGHT OF MERCHANDISES (gms.)`
    
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

  roundNoDecimal(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0.00'
    return Math.round(num).toFixed(2)
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
        invoiceTitle: {
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

  generateInvoiceNumber() {
    const date = dayjs()
    const timestamp = date.format('YYMMDDHHmmss')
    return `INV-${timestamp}`
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
      const invoiceFileName = `Invoice_${this.invoiceNo}_${dayjs().format('YYYYMMDD')}.pdf`
      pdf.download(invoiceFileName)
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