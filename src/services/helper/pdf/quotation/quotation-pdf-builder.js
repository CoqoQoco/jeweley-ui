//import { formatDate } from '@/services/utils/dayjs'
import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'
//import logoImage from '@/assets/duangkaew-logo.png'

export class InvoicePdfBuilder {
  constructor(data, customerName, note, invoiceDate) {
    this.data = data // ข้อมูลสินค้า
    this.customerName = customerName || '' // ชื่อลูกค้า
    this.note = note || '' // หมายเหตุ
    this.invoiceDate = invoiceDate || dayjs().format('YYYY-MM-DD') // วันที่ออกใบกำกับ
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '206/19 Rama 9 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6730580-4',
      fax: 'FAX: (+662) 6-271-4614',
      email: 'info@dukaek.com'
    }
    this.invoiceNo = 'INV' + dayjs().format('YYMMDDHHmm')
    this.logoBase64 = null // จะถูกตั้งค่าภายหลัง
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
        {
          columns: [
            {
              width: '65%',
              stack: [
                {
                  columns: [
                    this.logoBase64
                      ? {
                          image: this.logoBase64,
                          width: 20, // ปรับขนาดตามที่ต้องการ
                          height: 20,
                          margin: [0, 0, 0, 0]
                        }
                      : {},
                    {
                      width: '*',
                      text: this.companyInfo.name,
                      style: 'companyName',
                      margin: [10, 0, 0, 0]
                    }
                  ],
                  margin: [0, 0, 0, 10]
                },

                { text: this.companyInfo.address, style: 'companyInfo' },
                { text: 'TEL: ' + this.companyInfo.phone, style: 'companyInfo' },
                { text: 'E-Mail: ' + this.companyInfo.email, style: 'companyInfo' }
              ]
            },
            {
              width: '35%',
              alignment: 'right',
              stack: [
                {
                  table: {
                    widths: [100], // กำหนดความกว้างชัดเจน (ปรับตามต้องการ)
                    heights: [30], // กำหนดความสูงชัดเจน (ปรับตามต้องการ)
                    body: [
                      [
                        {
                          text: 'INVOICE',
                          style: 'invoiceTitle',
                          fillColor: '#8B0000', // สีพื้นหลังแดงเข้ม
                          color: 'white', // สีตัวหนังสือขาว
                          alignment: 'center'
                        }
                      ]
                    ]
                  },
                  layout: {
                    hLineWidth: function () {
                      return 0
                    }, // ซ่อนเส้นแนวนอน
                    vLineWidth: function () {
                      return 0
                    }, // ซ่อนเส้นแนวตั้ง
                    paddingLeft: function () {
                      return 0
                    }, // เพิ่ม padding ซ้าย
                    paddingRight: function () {
                      return 0
                    }, // เพิ่ม padding ขวา
                    paddingTop: function () {
                      return 0
                    }, // เพิ่ม padding บน
                    paddingBottom: function () {
                      return 0
                    } // เพิ่ม padding ล่าง
                  },
                  margin: [90, 10, 0, 0] // เพิ่ม margin รอบกรอบ
                }
              ]
            }
          ]
        },

        {
          canvas: [
            { type: 'line', x1: 0, y1: 2, x2: 555, y2: 2, lineWidth: 1 } // เพิ่มความยาวของเส้น
          ],
          margin: [0, 5, 0, 5]
        },
        {
          columns: [
            {
              width: '80%',
              text: 'Consigned to: ' + this.customerName,
              style: 'customerInfo'
            },
            {
              width: '20%',
              stack: [
                {
                  columns: [
                    {
                      text: 'Invoice No.',
                      width: '40%',
                      alignment: 'left',
                      style: 'invoiceInfoLabel'
                    },
                    {
                      text: this.invoiceNo,
                      width: '60%',
                      alignment: 'right',
                      style: 'invoiceInfoValue'
                    }
                  ]
                },
                {
                  columns: [
                    { text: 'Date', width: '30%', alignment: 'left', style: 'invoiceInfoLabel' },
                    {
                      text: dayjs(this.invoiceDate).format('DD/MM/YYYY'),
                      width: '70%',
                      alignment: 'right',
                      style: 'invoiceInfoValue'
                    }
                  ]
                }
              ],
              alignment: 'right'
            }
          ],
          margin: [0, 0, 0, 10]
        }
      ]
    }
  }

  getCustomerInfoSection() {
    // ไม่ใช้ฟังก์ชันนี้แล้ว เนื่องจากย้ายข้อมูลไปที่ header
    return null
  }

  // แก้ไขเมธอด createPages ให้ทุกหน้ามี total และ getSummarySection
  createPages() {
    const itemsPerPage = 10 // จำนวนรายการต่อหน้า
    const pages = []
    const totalItems = this.data.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      // ดึงข้อมูลสำหรับหน้านี้
      const startIdx = pageNum * itemsPerPage
      const endIdx = Math.min(startIdx + itemsPerPage, totalItems)
      const pageItems = this.data.slice(startIdx, endIdx)
      const isLastPage = pageNum === totalPages - 1

      // คำนวณ pageTotal สำหรับแต่ละหน้า
      let pageTotal = 0
      pageItems.forEach((item) => {
        const price = Number(item.price || item.productPrice || 0)
        pageTotal += price * item.qty
      })

      // สร้างตารางสำหรับหน้านี้
      const pageContent = []

      // ใส่ส่วนหัวตารางในทุกหน้า (ถ้าไม่ใช่หน้าแรก)
      if (pageNum > 0) {
        pageContent.push(this.getHeaderContent())
      }

      // เพิ่มตารางพร้อม total
      if (isLastPage) {
        // หน้าสุดท้ายมี total, freight, dismount และ grand total
        pageContent.push(this.getFinalPageTableContent(pageItems, pageNum, totalPages, pageTotal))
      } else {
        // หน้าอื่นๆ มีเฉพาะ total
        pageContent.push(this.getRegularPageTableContent(pageItems, pageNum, totalPages, pageTotal))
      }

      // เพิ่ม Summary Section ในทุกหน้า
      pageContent.push(...this.getSummarySection())

      // เพิ่ม pageBreak ในทุกหน้ายกเว้นหน้าสุดท้าย
      if (pageNum < totalPages - 1) {
        pageContent.push({ text: '', pageBreak: 'after' })
      }

      pages.push(...pageContent)
    }

    return pages
  }

  // สร้างตารางพร้อม total สำหรับหน้าทั่วไป (ไม่ใช่หน้าสุดท้าย)
  getRegularPageTableContent(items, pageNum, totalPages, pageTotal) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [30, '*', '*', '*', '*', '*', 40, 60, 60],
        body: this.buildRegularTableBody(items, pageNum, totalPages, pageTotal)
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

  // สร้างตารางพร้อม total, freight, dismount และ grand total สำหรับหน้าสุดท้าย
  getFinalPageTableContent(items, pageNum, totalPages, pageTotal) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [30, '*', '*', '*', '*', '*', 40, 60, 60],
        body: this.buildFinalTableBody(items, pageNum, totalPages, pageTotal)
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

  // แยก buildTableBody เป็น 2 เมธอด - หนึ่งสำหรับหน้าทั่วไป และอีกเมธอดสำหรับหน้าสุดท้าย
  buildRegularTableBody(items, pageNum, totalPages, pageTotal) {
    const body = []

    // Header with color
    body.push([
      this.setTableHeader('No.'),
      this.setTableHeader('Style/Product'),
      this.setTableHeader('Description'),
      this.setTableHeader('Gold'),
      this.setTableHeader('Diamond'),
      this.setTableHeader('Stone'),
      this.setTableHeader('Quantity'),
      this.setTableHeader('Unit Price (THB)'),
      this.setTableHeader('Amount (THB)')
    ])

    // Content rows
    items = items || [] // ป้องกันกรณี items เป็น undefined

    items.forEach((item, index) => {
      // คำนวณ index จริงในกรณีที่มีหลายหน้า
      const actualIndex = pageNum * 10 + index

      const price = Number(item.price || item.productPrice || 0)
      const amount = price * item.qty

      // ถ้าเป็นหน้าแรกและรายการแรก ให้เริ่มคำนวณ totalAmount ใหม่
      if (pageNum === 0 && index === 0) {
        this.totalAmount = 0
        this.totalWeight = 0
      }

      // สะสมค่า totalAmount และ totalWeight
      this.totalAmount += amount

      // ส่วนที่เหลือเหมือนเดิม...
      const styleNo =
        item.stockNumber && item.productNumber
          ? `${item.stockNumber}/${item.productNumber}`
          : item.stockNumber || item.productNumber || ''

      const goldTexts = []
      const diamondTexts = []
      const gemTexts = []

      if (item.materials) {
        item.materials.forEach((material) => {
          if (material.type === 'Gold' && material.textGold) {
            goldTexts.push(material.textGold.trim())
          } else if (material.type === 'Diamond' && material.textDiamond) {
            diamondTexts.push(material.textDiamond.replace('Diamond', '').trim())
          } else if (material.type === 'Gem' && material.textGem) {
            gemTexts.push(material.textGem.trim())
          }
        })

        // คำนวณน้ำหนักรวม
        item.materials.forEach((material) => {
          if (material.type === 'Gold' && material.weight) {
            this.totalWeight += material.weight * item.qty
          }
        })
      }

      body.push([
        this.setTableCell((actualIndex + 1).toString()),
        this.setTableCell(styleNo),
        this.setTableCell(this.getDescription(item)),
        this.setTableCell(goldTexts.join(', ')),
        this.setTableCell(diamondTexts.join(', ')),
        this.setTableCell(gemTexts.join(', ')),
        this.setTableCellRight(item.qty.toString()),
        this.setTableCellRight(this.formatPrice(price)),
        this.setTableCellRight(this.formatPrice(amount))
      ])
    })

    // เพิ่มแถวว่าง
    const emptyRowsToAdd = Math.max(0, 10 - items.length)

    for (let i = 0; i < emptyRowsToAdd; i++) {
      body.push([
        this.setTableCell(''),
        this.setTableCell(''),
        this.setTableCell(''),
        this.setTableCell(''),
        this.setTableCell(''),
        this.setTableCell(''),
        this.setTableCell(''),
        this.setTableCell(''),
        this.setTableCell('')
      ])
    }

    // เพิ่ม TOTAL row
    body.push([
      { text: 'TOTAL', style: 'summaryLabelColored', alignment: 'right', colSpan: 7 },
      {},
      {},
      {},
      {},
      {},
      {},
      {
        text: this.formatPrice(pageTotal),
        style: 'summaryLabelColored',
        alignment: 'right'
      },
      {
        text: this.formatPrice(pageTotal),
        style: 'summaryLabelColored',
        alignment: 'right'
      }
    ])

    return body
  }

  buildFinalTableBody(items, pageNum, totalPages, pageTotal) {
    const body = this.buildRegularTableBody(items, pageNum, totalPages, pageTotal)

    // เพิ่ม FREIGHT & INSURANCE, DISMOUNT, GRAND TOTAL ในหน้าสุดท้าย
    // FREIGHT & INSURANCE
    body.push([
      { text: 'FREIGHT & INSURANCE', style: 'summaryLabel', alignment: 'right', colSpan: 7 },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { text: this.formatPrice(this.totalAmount), style: 'summaryLabel', alignment: 'right' }
    ])

    // DISMOUNT
    body.push([
      { text: 'DISMOUNT', style: 'summaryLabel', alignment: 'right', colSpan: 7 },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      { text: this.formatPrice(this.totalAmount), style: 'summaryLabel', alignment: 'right' }
    ])

    // GRAND TOTAL
    body.push([
      { text: 'GRAND TOTAL', style: 'summaryLabelColored', alignment: 'right', colSpan: 7 },
      {},
      {},
      {},
      {},
      {},
      {},
      {
        text: this.formatPrice(this.totalAmount),
        style: 'summaryLabelColored',
        alignment: 'right'
      },
      {
        text: this.formatPrice(this.totalAmount),
        style: 'summaryLabelColored',
        alignment: 'right'
      }
    ])

    return body
  }

  getSummarySection() {
    return [
      // ส่วนแสดงจำนวนเงินเป็นตัวอักษรและข้อความเพิ่มเติม
      {
        alignment: 'right',
        text: this.convertNumberToWords(this.totalAmount),
        style: 'totalWords',
        margin: [0, 5, 0, 5]
      },
      {
        columns: [
          {
            stack: [
              { text: 'ONE PARCEL ONLY', style: 'parcelText', alignment: 'left' },
              {
                text: 'WE CERTIFY THAT THIS INVOICE TRUE AND CORRECT.',
                style: 'certifyText',
                alignment: 'left'
              },
              {
                columns: [
                  { text: '1.020 NET WEIGHT OF MERCHANDISES', width: '50%', style: 'weightText' },
                  { text: 'MADE IN THAILAND', width: '30%', style: 'madeInText' },
                  { text: 'Goods Received By', width: '20%', style: 'receivedByText' }
                ]
              }
            ],
            width: '90%'
          }
        ],
        margin: [0, 10, 0, 0],
        pageBreakBefore: false
      }
    ]
  }

  // แก้ไขเมธอด buildTableBody ให้รองรับการเพิ่ม total
  buildTableBody(items, pageNum, totalPages, includeSummary = false) {
    const body = []

    // Header with color
    body.push([
      this.setTableHeader('No.'),
      this.setTableHeader('Style/Product'),
      this.setTableHeader('Description'),
      this.setTableHeader('Gold'),
      this.setTableHeader('Diamond'),
      this.setTableHeader('Stone'),
      this.setTableHeader('Quantity'),
      this.setTableHeader('Unit Price (THB)'),
      this.setTableHeader('Amount (THB)')
    ])

    // Content rows
    let pageTotal = 0

    items = items || [] // ป้องกันกรณี items เป็น undefined

    items.forEach((item, index) => {
      // คำนวณ index จริงในกรณีที่มีหลายหน้า
      const actualIndex = pageNum * 10 + index

      const price = Number(item.price || item.productPrice || 0)
      const amount = price * item.qty
      pageTotal += amount

      // ถ้าเป็นหน้าแรก ให้คำนวณ totalAmount และ totalWeight
      if (pageNum === 0 && index === 0) {
        this.totalAmount = 0
        this.totalWeight = 0
      }

      // สะสมค่า totalAmount และ totalWeight
      this.totalAmount += amount

      // ส่วนที่เหลือเหมือนเดิม...
      const styleNo =
        item.stockNumber && item.productNumber
          ? `${item.stockNumber}/${item.productNumber}`
          : item.stockNumber || item.productNumber || ''

      const goldTexts = []
      const diamondTexts = []
      const gemTexts = []

      if (item.materials) {
        item.materials.forEach((material) => {
          if (material.type === 'Gold' && material.textGold) {
            goldTexts.push(material.textGold.trim())
          } else if (material.type === 'Diamond' && material.textDiamond) {
            diamondTexts.push(material.textDiamond.replace('Diamond', '').trim())
          } else if (material.type === 'Gem' && material.textGem) {
            gemTexts.push(material.textGem.trim())
          }
        })

        // คำนวณน้ำหนักรวม
        item.materials.forEach((material) => {
          if (material.type === 'Gold' && material.weight) {
            this.totalWeight += material.weight * item.qty
          }
        })
      }

      body.push([
        this.setTableCell((actualIndex + 1).toString()),
        this.setTableCell(styleNo),
        this.setTableCell(this.getDescription(item)),
        this.setTableCell(goldTexts.join(', ')),
        this.setTableCell(diamondTexts.join(', ')),
        this.setTableCell(gemTexts.join(', ')),
        this.setTableCellRight(item.qty.toString()),
        this.setTableCellRight(this.formatPrice(price)),
        this.setTableCellRight(this.formatPrice(amount))
      ])
    })

    // เพิ่มแถวว่างให้เต็ม 10 แถวสำหรับหน้าสุดท้าย
    if (includeSummary) {
      //const emptyRowsToAdd = Math.max(0, 10 - items.length)

      //   for (let i = 0; i < emptyRowsToAdd; i++) {
      //     body.push([
      //       this.setTableCell(''),
      //       this.setTableCell(''),
      //       this.setTableCell(''),
      //       this.setTableCell(''),
      //       this.setTableCell(''),
      //       this.setTableCell(''),
      //       this.setTableCell(''),
      //       this.setTableCell(''),
      //       this.setTableCell('')
      //     ])
      //   }

      // เพิ่ม Summary rows
      // TOTAL
      body.push([
        { text: 'TOTAL', style: 'summaryLabelColored', alignment: 'right', colSpan: 7 },
        {},
        {},
        {},
        {},
        {},
        {},
        {
          text: this.formatPrice(this.totalAmount),
          style: 'summaryLabelColored',
          alignment: 'right'
        },
        {
          text: this.formatPrice(this.totalAmount),
          style: 'summaryLabelColored',
          alignment: 'right'
        }
      ])

      // FREIGHT & INSURANCE
      body.push([
        { text: 'FREIGHT & INSURANCE', style: 'summaryLabel', alignment: 'right', colSpan: 7 },
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        { text: this.formatPrice(this.totalAmount), style: 'summaryLabel', alignment: 'right' }
      ])

      // DISMOUNT
      body.push([
        { text: 'DISMOUNT', style: 'summaryLabel', alignment: 'right', colSpan: 7 },
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        { text: this.formatPrice(this.totalAmount), style: 'summaryLabel', alignment: 'right' }
      ])

      // GRAND TOTAL
      body.push([
        { text: 'GRAND TOTAL', style: 'summaryLabelColored', alignment: 'right', colSpan: 7 },
        {},
        {},
        {},
        {},
        {},
        {},
        {
          text: this.formatPrice(this.totalAmount),
          style: 'summaryLabelColored',
          alignment: 'right'
        },
        {
          text: this.formatPrice(this.totalAmount),
          style: 'summaryLabelColored',
          alignment: 'right'
        }
      ])
    }

    return body
  }

  getSummaryTable() {
    // แสดงเฉพาะส่วน TOTAL ไม่รวม FREIGHT & INSURANCE และอื่นๆ
    return {
      pageBreakBefore: false,
      pageBreakAfter: false,
      margin: [0, 0, 0, 0],
      table: {
        widths: [30, '*', '*', '*', '*', '*', 40, 60, 60],
        body: [
          [
            { text: 'TOTAL', style: 'summaryLabelColored', alignment: 'right', colSpan: 7 },
            {},
            {},
            {},
            {},
            {},
            {},
            {
              text: this.formatPrice(this.totalAmount),
              style: 'summaryLabelColored',
              alignment: 'right'
            },
            {
              text: this.formatPrice(this.totalAmount),
              style: 'summaryLabelColored',
              alignment: 'right'
            }
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
      },
      keepTogether: true
    }
  }

  getAdditionalSummaryTable() {
    return {
      pageBreakBefore: false,
      pageBreakAfter: false,
      margin: [0, 0, 0, 0],
      table: {
        widths: [30, '*', '*', '*', '*', '*', 40, 60, 60],
        body: [
          [
            { text: 'FREIGHT & INSURANCE', style: 'summaryLabel', alignment: 'right', colSpan: 7 },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            { text: this.formatPrice(this.totalAmount), style: 'summaryLabel', alignment: 'right' }
          ],
          [
            { text: 'DISMOUNT', style: 'summaryLabel', alignment: 'right', colSpan: 7 },
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            { text: this.formatPrice(this.totalAmount), style: 'summaryLabel', alignment: 'right' }
          ],
          [
            { text: 'GRAND TOTAL', style: 'summaryLabelColored', alignment: 'right', colSpan: 7 },
            {},
            {},
            {},
            {},
            {},
            {},
            {
              text: this.formatPrice(this.totalAmount),
              style: 'summaryLabelColored',
              alignment: 'right'
            },
            {
              text: this.formatPrice(this.totalAmount),
              style: 'summaryLabelColored',
              alignment: 'right'
            }
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
      },
      keepTogether: true
    }
  }

  // ------- helper functions -------

  getDescription(item) {
    let description = item.productNameEn || ''
    if (item.size) {
      description += ' ' + item.size
    }
    return description
  }

  getMaterialInfo(materials, type) {
    if (!materials) return null
    return materials.find((m) => m.type === type)
  }

  getTableContent(items, pageNum, totalPages) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [30, '*', '*', '*', '*', '*', 40, 60, 60],
        body: this.buildTableBody(items, pageNum, totalPages, false) // ส่งพารามิเตอร์ false เพื่อไม่ให้เพิ่ม summary
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

  convertNumberToWords(number) {
    // แปลงตัวเลขเป็นคำอ่านภาษาอังกฤษ (ตัวอย่างเท่านั้น)
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    const formattedAmount = formatter.format(number)
    const numInWords = 'THAI BAHT ' + this.numberToWords(Math.floor(number)) + ' ONLY'
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
      fillColor: '#8B0000', // สีแดงเข้ม (Maroon)
      color: 'white',
      margin: [2, 5, 2, 5]
    }
  }

  setTableCell(text) {
    return {
      text: text,
      fontSize: 10,
      margin: [2, 5, 2, 5]
    }
  }

  setTableCellRight(text) {
    return {
      text: text,
      fontSize: 10,
      alignment: 'right',
      margin: [2, 5, 2, 5]
    }
  }

  setTableFooterRight(text) {
    return {
      text: text,
      bold: true,
      fontSize: 10,
      alignment: 'right',
      fillColor: '#8B0000', // สีแดงเข้ม (Maroon)
      color: 'white',
      margin: [2, 5, 2, 5]
    }
  }

  formatPrice(price) {
    return price.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // เพิ่มการแสดงเลขหน้า
  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 40], // เพิ่ม margin ล่างเพื่อรองรับเลขหน้า

      content: [this.getHeaderContent(), ...this.createPages()],

      // เพิ่มเลขหน้า
      footer: function (currentPage, pageCount) {
        return {
          text: currentPage.toString() + ' / ' + pageCount,
          alignment: 'center',
          margin: [0, 10, 0, 0]
        }
      },

      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 10
      },

      styles: {
        headerCompanyName: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 2]
        },
        companyName: {
          fontSize: 14,
          bold: true,
          color: '#8B0000', // สีแดงเข้ม
          margin: [0, 0, 0, 1]
        },
        companyInfo: {
          fontSize: 10,
          margin: [0, 0, 0, 1]
        },
        invoiceTitle: {
          fontSize: 22, // ปรับขนาดตัวอักษรให้ใหญ่ขึ้น
          bold: true,
          alignment: 'center', // ตัวหนังสืออยู่ตรงกลาง
          margin: [0, 8, 0, 8] // เพิ่ม margin ภายในเพื่อให้กรอบใหญ่ขึ้น
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
          fontSize: 10,
          bold: true
        },
        summaryValue: {
          fontSize: 10,
          bold: true
        },
        summaryLabelColored: {
          fontSize: 10,
          bold: true,
          color: 'white', // สีตัวอักษรขาว
          fillColor: '#8B0000' // สีพื้นหลังแดงเข้ม
          //margin: [2, 5, 2, 5]
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

// ตัวอย่างการใช้งาน
/*
const invoiceBuilder = new InvoicePdfBuilder(
  itemsData,          // ข้อมูลสินค้า
  'คุณสมชาย',        // ชื่อลูกค้า
  'ส่งด่วน',          // หมายเหตุ
  new Date()          // วันที่
);
const pdf = invoiceBuilder.generatePDF();
pdf.download('invoice.pdf'); // ดาวน์โหลด PDF
// หรือ pdf.open(); // เปิดในแท็บใหม่
*/
