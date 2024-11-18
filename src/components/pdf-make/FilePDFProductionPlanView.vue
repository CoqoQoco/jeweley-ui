<template>
  <div>
    <div @click="generatePDF" title="พิมพ์เเบบ">
      <span class=""> <i class="bi bi-printer"></i></span>
      <!-- <span>พิมพ์เเบบ</span> -->
    </div>
  </div>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs'
import pdfMake from 'pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'
import api from '@/axios/axios-helper.js'
import jsbarcode from 'jsbarcode'

export default {
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    matValue: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      urlImage: null,
      dotShort: '........................',
      dotLong: '..........................................'
    }
  },
  computed: {
    isGoldJob() {
      let isGold = false
      this.matValue.forEach((x) => {
        if (
          x.goldNavigation?.code === 'WG' ||
          x.goldNavigation?.code === 'YG' ||
          x.goldNavigation?.code === 'PG'
        ) {
          // ทำอะไรสักอย่างเมื่อ x.goldNavigation.code เท่ากับ 'SV'
          isGold = true
        }
      })

      return isGold
    }
  },
  methods: {
    formatDate(date) {
      return formatDate(date)
    },
    async fetchIamge() {
      //console.log(item.data.tbtProductionPlanImage[0].path)

      try {
        const param = {
          imageName: `${this.modelValue.mold}-Mold.png`
        }

        const res = await api.jewelry.get('FileExtension/GetMoldImage', param)
        this.urlImage = `data:image/png;base64,${res}`
      } catch (error) {
        console.log(error)
        return null
      }
    },

    //dynamic table for pdf make
    buildTableBody(data) {
      //console.log(data)
      let body = []
      const title = [
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
      body.push(title)

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

      return body
    },
    table(data) {
      return {
        fontSize: 9,
        bold: true,
        margin: [0, 0, 0, 20],
        table: {
          headerRows: 1,
          widths: [60, '*', '*', 60, 50, '*', '*', '*', '*', '*', '*'],
          body: this.buildTableBody(data)
        }
      }
    },
    textToBase64Barcode(text) {
      var canvas = document.createElement('canvas')
      jsbarcode(canvas, text, { format: 'CODE128', displayValue: false })
      return canvas.toDataURL('image/png')
    },

    async generatePDF() {
      await this.fetchIamge()

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
              { text: 'ใบจ่าย-รับคืนงาน', alignment: 'right' }
            ],
            margin: [0, 0, 0, 0],
            bold: true,
            fontSize: 15
          },

          // ------- detail -------
          {
            style: 'tableExample',
            table: {
              widths: [80, 160, '*', '*', '*'],
              body: [
                //row 1
                [
                  //image
                  {
                    rowSpan: 2,
                    image: this.urlImage,
                    //fit: [50, 50],
                    margin: [0, 5, 0, 0],
                    width: 70,
                    height: 70,
                    border: [true, true, true, true],
                    alignment: 'center'
                  },
                  //wo
                  {
                    margin: [30, 0, 0, 0],
                    stack: [
                      { text: 'เลขที่ W.O.', style: 'title' },
                      {
                        text: this.modelValue.wo,
                        style: 'desc'
                      }
                    ]
                  },
                  //wo number
                  {
                    stack: [
                      { text: 'ลำดับ W.O.', style: 'title' },
                      {
                        text: this.modelValue.woNumber,
                        style: 'desc'
                      }
                    ]
                  },
                  //create date
                  {
                    stack: [
                      { text: 'วันสร้างใบงาน', style: 'title' },
                      {
                        text: formatDate(this.modelValue.createDate),
                        style: 'desc'
                      }
                    ]
                  },
                  //send date
                  {
                    stack: [
                      { text: 'วันส่งงาน', style: 'title' },
                      {
                        text: formatDate(this.modelValue.requestDate),
                        style: 'desc'
                      }
                    ]
                  }
                ],
                //row 2
                [
                  //image
                  '',
                  //mode
                  {
                    //colSpan: 2,
                    margin: [30, 0, 0, 0],
                    stack: [
                      { text: 'เเม่พิมพ์', style: 'title' },
                      {
                        text: this.modelValue.mold,
                        style: 'desc'
                      }
                    ]
                  },
                  //product code
                  {
                    stack: [
                      { text: 'รหัสสินค้า', style: 'title' },
                      {
                        text: this.modelValue.productNumber,
                        style: 'desc'
                      }
                    ]
                  },
                  //product name
                  {
                    //colSpan: 2,
                    stack: [
                      { text: 'ชื่อสินค้า', style: 'title' },
                      {
                        text: this.modelValue.productName,
                        style: 'desc'
                      }
                    ]
                  },
                  //product type
                  {
                    stack: [
                      { text: 'จำนวนสินค้า', style: 'title' },
                      {
                        text: `${this.modelValue.productQty} ${this.modelValue.productQtyUnit}`,
                        style: 'desc'
                      }
                    ]
                  }
                ],
                //row 3
                [
                  //image
                  {
                    image: this.textToBase64Barcode(
                      `${this.modelValue.wo}-${this.modelValue.woNumber}`
                    ),
                    //fit: [50, 50],
                    margin: [0, 5, 0, 0],
                    width: 80,
                    height: 30,
                    border: [false, false, false, false],
                    alignment: 'center'
                  },
                  //customer code
                  {
                    margin: [30, 0, 0, 0],
                    stack: [
                      { text: 'รหัสลูกค้า', style: 'title' },
                      {
                        text: ` ${
                          this.modelValue.customerName
                            ? `${this.modelValue.customerNumber} : ${this.modelValue.customerName}`
                            : this.modelValue.customerNumber
                        }`,
                        style: 'desc'
                      }
                    ]
                  },
                  //customer type
                  {
                    stack: [
                      { text: 'ประเภทลูกค้า', style: 'title' },
                      {
                        text: `${this.modelValue.customerTypeName}`,
                        style: 'desc'
                      }
                    ]
                  },
                  //remark
                  {
                    stack: [
                      { text: 'ประเภทสินค้า', style: 'title' },
                      {
                        text: this.modelValue.productTypeName,
                        style: 'desc'
                      }
                    ]
                  },
                  {
                    //colSpan: 2,
                    stack: [
                      { text: 'หมายเหตุ', style: 'title' },
                      {
                        text: this.modelValue.remark,
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
          },

          // ------- product detail ---------
          {
            style: 'tableExample',
            table: {
              widths: ['*'],
              body: [
                //row 1
                [
                  {
                    stack: [
                      { text: 'รายละเอียดสินค้า', style: 'title' },
                      {
                        text: this.modelValue.productDetail,
                        style: 'desc'
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
            margin: [0, 0, 0, 5]
          },

          // ------- product detail ---------
          this.table(this.matValue)

          // ------ status ------
          //this.isGoldJob ? goldJobStatus : silerverStatus,

          // ------ remark -------
          // {
          //   style: 'tableExample',
          //   table: {
          //     widths: ['*'],
          //     body: [
          //       //row 1
          //       [
          //         {
          //           stack: [
          //             { text: 'หมายเหตุ', style: 'title' },
          //             {
          //               text: '',
          //               style: 'desc'
          //             },
          //             {
          //               text: '',
          //               style: 'desc'
          //             }
          //           ],
          //           border: [false, true, false, false]
          //         }
          //       ]
          //     ]
          //   },
          //   layout: {
          //     defaultBorder: false
          //   },
          //   margin: [0, 10, 0, 0]
          // }
        ],
        defaultStyle: {
          // 4. default style 'KANIT' font to test
          font: 'THSarabunNew'
        },
        styles: {
          tableExample: {
            margin: [0, 0, 0, 0]
          },
          title: {
            fontSize: 10
            //bold: true
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
            //bold: true
          }
        }
      }

      //const fileName = `${this.modelValue.wo}-${this.modelValue.woNumber}.pdf`

      //new tab
      pdfMake.createPdf(docDefinition).open()
      //same tab
      //pdfMake.createPdf(docDefinition).open({}, window)
      //download
      //pdfMake.createPdf(docDefinition).download('coqo.pdf')
    }
  }
}
</script>
