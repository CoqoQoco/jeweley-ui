<template>
  <div>
    <div @click="generatePDF" title="พิมพ์เเบบ">
      <span class=""> <i class="bi bi-printer"></i></span>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import { formatDate, formatDateTime } from '@/services/utils/dayjs'
import pdfMake from 'pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'
//import api from '@/axios/axios-config.js'
//import jsbarcode from 'jsbarcode'

export default {
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  computed: {
    model() {
      return this.modelValue
    }
  },
  methods: {
    formatDate(date) {
      return formatDate(date)
    },
    formatDateTime(date) {
      return formatDateTime(date)
    },

    tablePickOff(data) {
      return {
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', 50, 50, 50, 50, 40, 40],
          body: this.buildTablePickOff(data),
          layout: {
            defaultBorder: true
          }
        }
      }
    },
    setTableTitle(text) {
      return {
        text: text,
        bold: true,
        border: [false, true, false, true]
      }
    },
    setTableTitleTextRight(text) {
      return {
        text: text,
        fontSize: 12,
        bold: true,
        alignment: 'right',
        border: [false, true, false, true]
      }
    },
    setTableRow(text) {
      return {
        text: text,
        border: [false, false, false, false]
      }
    },
    setTableRowTextRight(text) {
      return {
        text: text,
        alignment: 'right',
        border: [false, false, false, false]
      }
    },
    buildTablePickOff(data) {
      //console.log(data)
      let body = []
      const title = [
        this.setTableTitle('พลอย/เพชร'),
        this.setTableTitleTextRight('จำนวน'),
        this.setTableTitleTextRight('น้ำหนัก'),
        this.setTableTitleTextRight('ราคา/จำนวน'),
        this.setTableTitleTextRight('ราคา/น้ำหนัก'),
        this.setTableTitleTextRight('หน่วย'),
        this.setTableTitleTextRight('รหัสหน่วย')
      ]

      //title
      body.push(title)

      //body
      data.forEach((item) => {
        const row = [
          this.setTableRow(item.name),
          this.setTableRowTextRight(item.qty),
          this.setTableRowTextRight(item.qtyWeight),
          this.setTableRowTextRight(item.priceQty),
          this.setTableRowTextRight(item.priceQty),
          this.setTableRowTextRight(item.unit),
          this.setTableRowTextRight(item.unitCode)
        ]
        body.push(row)
      })
      return body
    },

    async generatePDF() {
      pdfMake.vfs = vfs // 2. set vfs pdf font
      pdfMake.fonts = {
        THSarabunNew: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew Bold.ttf',
          italics: 'THSarabunNew Italic.ttf',
          bolditalics: 'THSarabunNew BoldItalic.ttf'
        }
      }

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [20, 20, 20, 10],

        content: [
          // ------- header -------
          {
            columns: [
              'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
              { text: `ใบยืมเพชรเเละพลอย`, alignment: 'right' }
            ],
            margin: [0, 0, 0, 0],
            bold: true,
            fontSize: 15
          },

          //underline
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    columns: [
                      `ใบยืมเลขที่: ${this.model.running}`,
                      { text: dayjs().format('DD/MM/YYYY HH:mm:ss'), alignment: 'right' }
                    ],
                    //bold: true,
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
          },

          // ------- detail -------
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*'],
              body: [
                [
                  {
                    stack: [
                      { text: 'วันที่ยืม', style: 'title' },
                      {
                        text: formatDateTime(this.model.requestDate),
                        style: 'desc'
                      }
                    ]
                  },
                  {
                    stack: [
                      { text: 'กำหนดคืน', style: 'title' },
                      {
                        text: formatDateTime(this.model.returnDate),
                        style: 'desc'
                      }
                    ]
                  },
                  {
                    stack: [
                      { text: 'ผู้ยืม', style: 'title' },
                      {
                        text: this.model.operatorBy ?? `-`,
                        style: 'desc'
                      }
                    ]
                  },
                  {
                    stack: [
                      { text: 'หมายเหตุ', style: 'title' },
                      {
                        text: this.model.remark ?? `-`,
                        style: 'desc'
                      }
                    ]
                  }
                ]
              ],
              layout: {
                defaultBorder: [false, false, false, false]
              },
              margin: [0, 0, 0, 10]
            },
            layout: 'lightHorizontalLines'
          },

          //   table gem
          this.tablePickOff(this.model.items),

          //underline
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    columns: [],
                    border: [false, false, false, true]
                  }
                ]
              ]
            },
            layout: {
              defaultBorder: false
            },
            margin: [0, 0, 0, 5]
          },

          //   signed
          {
            table: {
              widths: ['*', 120, 10, 120],
              body: [
                [
                  {},
                  {},
                  {},
                  {
                    stack: [{ text: 'ผู้อนุมัติ', style: 'boldText' }]
                  }
                ],
                [
                  {},
                  {},
                  {},
                  {
                    stack: [{ text: '', style: 'boldText' }],
                    border: [true, true, true, true],
                    margin: [0, 0, 0, 40]
                  }
                ]
              ]
            },
            layout: {
              defaultBorder: false
            }
          }
        ],
        defaultStyle: {
          font: 'THSarabunNew'
        },
        styles: {
          tableExample: {
            margin: [0, 0, 0, 0]
          },
          title: {
            fontSize: 10
          },
          titleAction: {
            fontSize: 14,
            bold: true,
            decoration: 'underline', // เพิ่มขีดเส้นใต้ข้อความ
            decorationStyle: 'solid' // รูปแบบของขีดเส้น (solid, double, dashed, etc.)
          },
          desc: {
            fontSize: 14,
            bold: true
          },
          descAction: {
            fontSize: 10
          }
        }
      }

      try {
        pdfMake.createPdf(docDefinition).open()
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
