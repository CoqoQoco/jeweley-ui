import { formatDate } from '@/services/utils/dayjs'
import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'

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
  }

  getHeaderContent() {
    return {
      stack: [
        {
          columns: [
            {
              width: '65%',
              stack: [
                { text: this.companyInfo.name, style: 'headerCompanyName' },
                { text: this.companyInfo.address, style: 'companyInfo' },
                { text: 'TEL: ' + this.companyInfo.phone, style: 'companyInfo' },
                { text: 'E-Mail: ' + this.companyInfo.email, style: 'companyInfo' }
              ]
            },
            {
              width: '35%',
              alignment: 'right',
              stack: [{ text: 'INVOICE', style: 'invoiceTitle' }]
            }
          ]
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 2, x2: 535, y2: 2, lineWidth: 1 } // เพิ่มความยาวของเส้น
          ],
          margin: [0, 5, 0, 5]
        },
        {
          columns: [
            {
              width: '50%',
              text: 'Consigned to: ' + this.customerName,
              style: 'customerInfo'
            },
            {
              width: '50%',
              stack: [
                {
                  columns: [
                    {
                      text: 'Invoice No.',
                      width: '30%',
                      alignment: 'left',
                      style: 'invoiceInfoLabel'
                    },
                    {
                      text: this.invoiceNo,
                      width: '70%',
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

  buildTableBody() {
    const body = []

    // Header with color
    body.push([
      this.setTableHeader('Item#'),
      this.setTableHeader('Style No.'),
      this.setTableHeader('Description'),
      this.setTableHeader('Gold'),
      this.setTableHeader('Diamond'),
      this.setTableHeader('Stone'),
      this.setTableHeader('Quantity'),
      this.setTableHeader('Unit Price (THB)'),
      this.setTableHeader('Amount (THB)')
    ])

    // Content rows
    let total = 0
    let totalWeight = 0

    this.data.forEach((item, index) => {
      const price = Number(item.price || item.productPrice || 0)
      const amount = price * item.qty
      total += amount

      // Combine stockNumber and productNumber for Style No.
      const styleNo =
        item.stockNumber && item.productNumber
          ? `${item.stockNumber}/${item.productNumber}`
          : item.stockNumber || item.productNumber || ''

      // ใช้ textGold, textDiamond, textGem โดยตรง
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
            totalWeight += material.weight * item.qty
          }
        })
      }

      body.push([
        this.setTableCell((index + 1).toString()),
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

    // เพิ่มแถวว่างเพิ่มจนกว่าจะมีจำนวนแถวรวม 15 แถว
    const totalRows = 15
    const currentRows = this.data.length
    const emptyRowsToAdd = Math.max(0, totalRows - currentRows)

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

    // เพิ่ม Summary rows ที่ตารางหลัก
    body.push([
      { text: 'Sub Total', style: 'summaryLabel', alignment: 'right', colSpan: 7 },
      {},
      {},
      {},
      {},
      {},
      {},
      { text: this.formatPrice(total), style: 'summaryValue', alignment: 'right' },
      { text: this.formatPrice(total), style: 'summaryValue', alignment: 'right' }
    ])

    body.push([
      { text: 'FREIGHT&INSURANCE', style: 'summaryLabel', alignment: 'center', colSpan: 9 },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {}
    ])

    body.push([
      { text: 'Grand Total', style: 'summaryLabel', alignment: 'right', colSpan: 7 },
      {},
      {},
      {},
      {},
      {},
      {},
      { text: this.formatPrice(total), style: 'summaryValue', alignment: 'right' },
      { text: this.formatPrice(total), style: 'summaryValue', alignment: 'right' }
    ])

    // Store totals
    this.totalAmount = total
    this.totalWeight = totalWeight

    return body
  }

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

  getTableContent() {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [30, 100, '*', 40, 60, 40, 40, 60, 60], // ปรับความกว้างให้ Style No., Unit Price และ Amount มีความกว้างคงที่
        body: this.buildTableBody()
      },
      layout: {
        hLineWidth: function (i, node) {
          return 0.5
        },
        vLineWidth: function (i, node) {
          return 0.5
        }
      }
    }
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
            text: dayjs(this.invoiceDate).format('DD/MM/YYYY'),
            style: 'dateSmall',
            width: '10%',
            alignment: 'left',
            margin: [0, 30, 0, 0]
          },
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
        margin: [0, 10, 0, 0]
      }
    ]
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
      margin: [2, 5, 2, 5]
    }
  }

  formatPrice(price) {
    return price.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 20], // ลดขอบกระดาษ

      content: [
        this.getHeaderContent(),
        this.getTableContent(),
        ...this.getSummarySection() // ใช้ spread operator เพื่อรวมอาร์เรย์
      ],

      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 11
      },

      styles: {
        headerCompanyName: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 2]
        },
        companyInfo: {
          fontSize: 10,
          margin: [0, 0, 0, 1]
        },
        invoiceTitle: {
          fontSize: 18,
          bold: true,
          color: '#800000',
          margin: [0, 0, 0, 5]
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

  generatePDF() {
    try {
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
