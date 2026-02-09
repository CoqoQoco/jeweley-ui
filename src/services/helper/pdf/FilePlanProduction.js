// src/services/pdf/productionPlanPdf.js
import { formatDate, formatDateTime } from '@/services/utils/dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'
import jsbarcode from 'jsbarcode'

export class FilePlanProduction {
  constructor(data, dataMat, urlImage) {
    this.data = data
    this.dataMat = dataMat
    this.urlImage = urlImage
  }

  getHeaderContent() {
    return {
      columns: [
        'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
        { text: 'ใบจ่าย-รับคืนงาน', alignment: 'right' }
      ],
      bold: true,
      fontSize: 15,
      margin: [0, 0, 0, 0]
    }
  }

  getSubHeaderContent() {
    return {
      table: {
        widths: ['*'],
        body: [
          [
            {
              columns: [
                ` เลขที่แผนผลิต [W.O.] : ${this.data.wo}-${this.data.woNumber}   [${formatDate(
                  this.data.createDate
                )}]`,
                {
                  text: `กำหนดส่ง: ${formatDate(this.data.requestDate)}`,
                  alignment: 'right'
                }
              ],
              fontSize: 13,
              border: [false, false, false, true]
            }
          ]
        ]
      },
      layout: {
        defaultBorder: false
      },
      margin: [0, 0, 0, 5]
    }
  }

  getDetailsContent() {
    return {
      style: 'tableExample',
      table: {
        widths: [80, '*', '*', '*', '*'],
        body: [
          [
            // รูป
            {
              rowSpan: 2,
              image: this.urlImage,
              width: 65,
              height: 65,
              border: [true, true, true, true],
              alignment: 'center',
              margin: [0, 0, 0, 0]
            },

            // Column 2
            {
              margin: [30, 0, 0, 0], // เพิ่ม margin ด้านซ้าย 30 พิกเซล
              stack: [
                { text: 'เเม่พิมพ์', style: 'title' },
                { text: this.data.mold, style: 'desc' }
              ]
            },

            // Column 3
            {
              stack: [
                { text: 'รหัสลูกค้า', style: 'title' },
                { text: this.data.customerNumber, style: 'desc' }
              ]
            },
            // Column 4
            {
              stack: [
                { text: 'ประเภทลูกค้า', style: 'title' },
                { text: this.data.customerTypeName, style: 'desc' }
              ]
            },

            // Column 5
            {}
          ],
          [
            '', // สำหรับ rowSpan ของรูป
            // Column 2
            {
              margin: [30, 0, 0, 0], // เพิ่ม margin ด้านซ้าย 30 พิกเซล
              stack: [
                { text: 'รหัสสินค้า', style: 'title' },
                { text: this.data.productNumber, style: 'desc' }
              ]
            },
            // Column 3
            {
              stack: [
                { text: 'ชื่อสินค้า', style: 'title' },
                { text: this.data.productName, style: 'desc' }
              ]
            },
            // Column 4
            {
              stack: [
                { text: 'ประเภทสินค้า', style: 'title' },
                {
                  text: this.data.productTypeName,
                  style: 'desc'
                }
              ]
            },
            // Column 5
            // Column 5
            {
              stack: [
                { text: 'จำนวนสินค้า', style: 'title' },
                {
                  text: `${this.data.productQty} ${this.data.productQtyUnit}`,
                  style: 'desc'
                }
              ]
            }
          ]
        ]
      },
      layout: {
        defaultBorder: false
      },
      margin: [0, 0, 0, 5]
    }
  }

  getBarcodeAndDetailContent() {
    return {
      table: {
        widths: [80, '*'],
        body: [
          [
            // barcode
            {
              image: this.textToBase64Barcode(`${this.data.wo}${this.data.woNumber}`),
              width: 70,
              height: 30,
              alignment: 'center',
              border: [false, false, false, false]
            },
            // product detail
            {
              stack: [
                { text: 'รายละเอียดสินค้า', style: 'title' },
                {
                  text: this.data.productDetail,
                  style: 'desc',
                  maxHeight: 100,
                  lineHeight: 1.2,
                  wrap: true
                }
              ],
              border: [true, true, true, true]
            }
          ]
        ]
      },
      layout: {
        defaultBorder: false
      },
      margin: [0, 0, 0, 10]
    }
  }

  buildTableBody(data) {
    let body = []

    // ส่วนหัวตาราง (ตามภาพที่ 1)
    const headers = [
      'ประเภททอง-เงิน',
      'เปอร์เซ็นทอง',
      'จำนวน',
      'ประเภทพลอย',
      'รูปร่าง/ขนาด พลอย',
      'จำนวนพลอย',
      'น้ำหนักพลอย',
      'จำนวนเพชร/CZ',
      'น้ำหนักเพชร/CZ',
      'ขนาดเพชร/CZ',
      'คุณภาพเพชร/CZ'
    ]

    body.push(headers)

    // ข้อมูลในตาราง
    if (data && data.length > 0) {
      data.forEach((item) => {
        const row = [
          `${item.goldNavigation?.code ?? ``} - ${item.goldNavigation?.nameEn ?? ``}`,
          `${item.goldSizeNavigation?.nameEn ?? `-`}`,
          `${item.goldQty ?? `-`}`,
          `${item.gemNavigation?.code ?? ``} - ${item.gemNavigation?.nameTh ?? ``}`,
          `${item.gemShapeNavigation?.code ?? ``} - ${item.gemSize ?? ``}`,
          `${item.gemQty ?? ``}`,
          `${item.gemWeight ?? `-`} ${item.gemWeight ? item.gemWeightUnit : ``}`,
          `${item.diamondQty ?? ``}`,
          `${item.diamondWeight ?? `-`} ${item.diamondWeight ? item.diamondWeightUnit : ``}`,
          `${item.diamondSize ?? `-`}`,
          `${item.diamondQuality ?? `-`}`
        ]
        body.push(row)
      })
    } else {
      // ถ้าไม่มีข้อมูล เพิ่มแถวว่าง
      body.push(Array(headers.length).fill('-'))
    }

    return body
  }

  getTableContent(matValue) {
    return {
      fontSize: 9,
      bold: true,
      margin: [0, 0, 0, 20],
      table: {
        headerRows: 1,
        // กำหนดความกว้างคอลัมน์โดยให้คอลัมน์แรกกว้างกว่าที่เหลือ
        widths: [
          '*',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto'
        ],
        body: this.buildTableBody(matValue),
        dontBreakRows: true
      },
      layout: {
        hLineWidth: function (i, node) {
          // เฉพาะเส้นบนและล่างของหัวตาราง (index 0 และ 1)
          return i === 0 || i === 1 ? 1 : 0
        },
        vLineWidth: function (i, node) {
          // ไม่มีเส้นแนวตั้ง
          return 0
        },
        hLineColor: function (i, node) {
          return 'black'
        },
        paddingLeft: function (i) {
          return 4
        },
        paddingRight: function (i) {
          return 4
        },
        paddingTop: function (i) {
          return 3
        },
        paddingBottom: function (i) {
          return 3
        },
        // เพิ่มฟังก์ชันกำหนดสีพื้นหลัง
        fillColor: function (rowIndex, node, columnIndex) {
          // ใส่สีพื้นหลังเฉพาะแถวแรก (หัวตาราง)
          return rowIndex === 0 ? '#f2f2f2' : null // สีเทาอ่อน
        }
      }
    }
  }

  textToBase64Barcode(text) {
    var canvas = document.createElement('canvas')
    jsbarcode(canvas, text, { format: 'CODE128', displayValue: false })
    return canvas.toDataURL('image/png')
  }

  getDocDefinition(matValue) {
    return {
      pageSize: 'A4',
      pageMargins: [10, 10, 10, 10],

      content: [
        this.getHeaderContent(),
        this.getSubHeaderContent(),
        this.getDetailsContent(),
        this.getBarcodeAndDetailContent(),
        this.getTableContent(matValue)
      ],

      styles: {
        tableExample: {
          margin: [0, 0, 0, 0]
        },
        tableHeader: {
          fontSize: 11,
          bold: true,
          alignment: 'center',
          margin: [0, 2, 0, 2]
        },
        desc: {
          fontSize: 14,
          bold: true
        },
        title: {
          fontSize: 10
        }
      },

      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 11
      }
    }
  }

  generatePDF() {
    try {
      const pdfMake = initPdfMake()
      const docDefinition = this.getDocDefinition(this.dataMat)
      return pdfMake.createPdf(docDefinition)
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }
}
