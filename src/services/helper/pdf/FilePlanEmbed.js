//import dayjs from 'dayjs'
import { formatDate } from '@/services/utils/dayjs'

import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'

// src/services/pdf/embedSlipPdf.js
//import dayjs from 'dayjs'
//import { formatDate } from '@/services/utils/dayjs'

export class EmbedSlipPdfBuilder {
  constructor(data, urlImage) {
    this.data = data
    this.urlImage = urlImage
  }

  getHeaderContent() {
    return {
      columns: [
        'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
        { text: 'สลิปจ่ายฝัง', alignment: 'right' }
      ],
      bold: true,
      fontSize: 15,
      margin: [5, 0, 5, 0],
      border: [false, false, false, true]
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
                `วัตถุดิบ : ${this.data.gold}`,
                { text: dayjs().format('DD/MM/YYYY HH:mm:ss'), alignment: 'right' }
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

  buildTablePriceBody() {
    const body = []

    // Header
    body.push([
      this.setTablePriceTitle('รายละเอียด'),
      this.setTablePriceTitleTextRight('จำนวนจ่าย'),
      this.setTablePriceTitleTextRight('น้ำหนักจ่าย'),
      this.setTablePriceTitleTextRight('น้ำหนักรับ'),
      this.setTablePriceTitleTextRight('จำนวนรับ'),
      this.setTablePriceTitleTextRight('ราคา/หน่วย'),
      this.setTablePriceTitleTextRight('ราคา')
    ])

    // Content rows
    let total = 0
    this.data.values.forEach((item) => {
      total += item.totalWages
      body.push([
        this.setTablePriceRow(
          `${formatDate(item.requestDate)} ${item.description ? `[${item.description}]` : ''}`
        ),
        this.setTablePriceRowTextRight(item.goldQtySend),
        this.setTablePriceRowTextRight(item.goldWeightSend),
        this.setTablePriceRowTextRight(item.goldWeightCheck),
        this.setTablePriceRowTextRight(item.goldQtyCheck),
        this.setTablePriceRowTextRight(
          item.wages ? Number(item.wages).toFixed(2).toLocaleString() : '0.00'
        ),
        this.setTablePriceRowTextRight(
          item.totalWages ? Number(item.totalWages).toFixed(2).toLocaleString() : '0.00'
        )
      ])
    })

    // Footer
    body.push([
      this.setTablePriceFooter(''),
      this.setTablePriceFooter(''),
      this.setTablePriceFooter(''),
      this.setTablePriceFooter(''),
      this.setTablePriceFooter(''),
      this.setTablePriceFooterTextRight('รวมราคา'),
      this.setTablePriceFooterTextRight(total ? Number(total).toFixed(2).toLocaleString() : '0.00')
    ])

    return body
  }

  getTablePriceContent() {
    return {
      fontSize: 11, // ลดขนาด font
      margin: [2, 2, 0, 0], // ลด margin
      table: {
        headerRows: 1,
        widths: ['*', 40, 40, 35, 45, 45, 35], // ลดความกว้างคอลัมน์
        body: this.buildTablePriceBody(),
        layout: {
          defaultBorder: false,
          paddingLeft: function (i) {
            return 1
          }, // ลด padding
          paddingRight: function (i) {
            return 1
          },
          paddingTop: function (i) {
            return 1
          },
          paddingBottom: function (i) {
            return 1
          }
        }
      }
    }
  }

  getMainContentTable() {
    // Get first value for item details
    const firstItem = this.data.values[0]

    return {
      table: {
        widths: [70, '*'],
        margin: [0, 0, 0, 0],
        body: [
          [
            // Image cell
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      stack: [
                        {
                          image: this.urlImage,
                          width: 70,
                          height: 70,
                          alignment: 'center',
                          margin: [0, 2, 0, 2]
                        }
                      ]
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: true
              },
              margin: [0, 0, 0, 0]
            },
            // Information cell
            {
              table: {
                widths: ['*', '*', '*', 60],
                body: [
                  [
                    // WO Info
                    {
                      margin: [5, 0, 0, 0],
                      stack: [
                        { text: 'เลขที่ W.O.', style: 'title' },
                        { text: `${this.data.wo}`, style: 'desc' },
                        { text: `[ ${this.data.mold} ]`, style: 'desc' }
                      ]
                    },
                    // Gold Info
                    {
                      margin: [0, 0, 0, 0],
                      stack: [
                        { text: 'รหัสสินค้าสินค้า', style: 'title' },
                        { text: this.data.product, style: 'desc' }
                      ]
                    },
                    // Worker Info
                    {
                      stack: [
                        { text: 'ช่างรับงาน', style: 'title' },
                        { text: this.data.worker, style: 'desc' }
                      ]
                    },
                    {
                      stack: [
                        { text: '', style: 'title' },
                        { text: '', style: 'desc' }
                      ]
                    }
                  ],
                  [
                    {
                      colSpan: 4,
                      stack: [this.getTablePriceContent()]
                    },
                    {},
                    {},
                    {}
                  ]
                ]
              },
              layout: {
                defaultBorder: false
              }
            }
          ]
        ]
      },
      layout: {
        defaultBorder: false
      }
    }
  }

  getSignatureSection() {
    return {
      table: {
        widths: ['*', 120, 10, 120],
        body: [
          [
            { stack: [{ text: 'หมายเหตุ', style: 'boldText' }] },
            { stack: [{ text: 'ผู้รับ', style: 'boldText' }] },
            {},
            { stack: [{ text: 'ผู้ส่ง', style: 'boldText' }] }
          ],
          [
            { stack: [{ text: '', style: 'boldText' }] },
            {
              stack: [{ text: '', style: 'boldText' }],
              border: [true, true, true, true],
              margin: [0, 0, 0, 20]
            },
            {},
            {
              stack: [{ text: '', style: 'boldText' }],
              border: [true, true, true, true]
            }
          ]
        ]
      },
      layout: {
        defaultBorder: false
      }
    }
  }

  setTablePriceTitle(text) {
    return {
      text,
      bold: true,
      border: [false, false, false, true]
    }
  }

  setTablePriceTitleTextRight(text) {
    return {
      text,
      fontSize: 12,
      bold: true,
      alignment: 'right',
      border: [false, false, false, true]
    }
  }

  setTablePriceRow(text) {
    return {
      text,
      border: [false, false, false, false]
    }
  }

  setTablePriceRowTextRight(text) {
    return {
      text,
      fontSize: 12,
      bold: true,
      alignment: 'right',
      border: [false, false, false, false]
    }
  }

  setTablePriceFooter(text) {
    return {
      text,
      bold: true,
      border: [false, true, false, false]
    }
  }

  setTablePriceFooterTextRight(text) {
    return {
      text,
      bold: true,
      alignment: 'right',
      border: [false, true, false, false]
    }
  }

  getDocDefinition() {
    return {
      pageSize: {
        // ปรับขนาดกระดาษให้ตอบโจทย์การใช้งาน
        width: 595.28, // A4 width
        height: 'auto' // ความสูงอัตโนมัติ
      },
      // ลด margins ลง
      pageMargins: [10, 10, 10, 10], // [left, top, right, bottom]

      // ปรับ layout ให้กระชับขึ้น
      content: [
        this.getHeaderContent(),
        {
          ...this.getSubHeaderContent(),
          margin: [0, 0, 0, 2] // ลด margin ด้านล่าง
        },
        {
          ...this.getMainContentTable(),
          margin: [0, 0, 0, 2] // ลด margin ด้านล่าง
        },
        this.getSignatureSection()
      ],

      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 11 // ลดขนาด font ลงเล็กน้อย
      },

      styles: {
        title: {
          fontSize: 10, // ลดขนาด font ลง
          margin: [0, 1, 0, 1] // ลด margin
        },
        desc: {
          fontSize: 10, // ลดขนาด font ลง
          bold: true,
          margin: [0, 1, 0, 1] // ลด margin
        },
        boldText: { bold: true }
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
