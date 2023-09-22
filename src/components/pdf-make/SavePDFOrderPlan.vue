<template>
  <div>
    <div @click="generatePDF" title="บันทึก">
      <i class="bi bi-printer"></i>
    </div>
  </div>
</template>

<script>
import { formatDate } from '@/utils/moment'
import pdfMake from 'pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'
import api from '@/axios/axios-config.js'

export default {
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      urlImage: null
    }
  },
  methods: {
    formatDate(date) {
      return formatDate(date)
    },
    async fetchIamge() {
      //console.log(item.data.tbtProductionPlanImage[0].path)

      if (this.modelValue.tbtProductionPlanImage && this.modelValue.tbtProductionPlanImage.length) {
        try {
          const param = {
            imageName: this.modelValue.tbtProductionPlanImage[0].path
          }

          const res = await api.jewelry.get('FileExtension/GetPlanImage', param)
          this.urlImage = `data:image/png;base64,${res}`
        } catch (error) {
          console.log(error)
          return null
        }
      }
    },

    //dynamic table for pdf make
    buildTableBody(data, columns) {
      let body = []
      const title = ['รายการ', 'ประเภท', 'รูปร่าง', 'ขนาด', 'จำนวน']
      body.push(title)

      data.forEach(function (row) {
        let dataRow = []

        columns.forEach(function (column) {
          dataRow.push(row[column].toString())
        })

        body.push(dataRow)
      })

      // const res = body.map((item) => {
      //   return { ...item, fontSize: 15 }
      // })

      //console.log(body)
      //console.log(res)

      return body
    },
    table(data, columns) {
      return {
        fontSize: 15,
        margin: [20, 0, 20, 10],
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*', '*'],
          body: this.buildTableBody(data, columns)
        }
      }
    },

    async generatePDF() {
      await this.fetchIamge()

      pdfMake.vfs = vfs // 2. set vfs pdf font
      pdfMake.fonts = {
        // download default Roboto font from cdnjs.com
        Roboto: {
          normal:
            'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
          bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
          italics:
            'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
          bolditalics:
            'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
        },
        THSarabunNew: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew Bold.ttf',
          italics: 'THSarabunNew Italic.ttf',
          bolditalics: 'THSarabunNew BoldItalic.ttf'
        }
      }

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [10, 10, 10, 10],
        //header: 'simple text',
        // header: {
        //   columns: [
        //     'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอร์ จำกัด',
        //     { text: 'ใบจ่าย-รับคืนงาน', alignment: 'right' }
        //   ],
        //   margin: [5, 5],
        //   bold: true,
        //   fontSize: 25
        // },
        content: [
          //header
          {
            columns: [
              'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอร์ จำกัด',
              { text: 'ใบจ่าย-รับคืนงาน', alignment: 'right' }
            ],
            margin: [0, 0, 0, 10],
            bold: true,
            fontSize: 18
          },
          //detail
          {
            style: 'tableExample',
            table: {
              widths: [150, '*', '*', '*', '*'],
              body: [
                //row 1
                [
                  {
                    rowSpan: 3,
                    image: this.urlImage,
                    //fit: [100, 100],
                    margin: [0, 0, 0, 0],
                    width: 150,
                    height: 150,
                    border: [true, true, true, true]
                  },
                  {
                    stack: [
                      { text: 'เลขที่ W.O.', style: 'title' },
                      {
                        text: this.modelValue.wo,
                        style: 'desc'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  {
                    stack: [
                      { text: 'ลำดับ W.O.', style: 'title' },
                      {
                        text: this.modelValue.woNumber,
                        style: 'desc'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  {
                    stack: [
                      { text: 'วันสร้างใบงาน', style: 'title' },
                      {
                        text: formatDate(this.modelValue.createDate),
                        style: 'desc'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  {
                    stack: [
                      { text: 'วันส่งงาน', style: 'title' },
                      {
                        text: formatDate(this.modelValue.requestDate),
                        style: 'desc'
                      }
                    ],
                    border: [false, false, false, false]
                  }
                ],
                //row 2
                [
                  '',
                  {
                    colSpan: 2,
                    border: [false, false, false, false],
                    stack: [
                      { text: 'เเม่พิมพ์', style: 'title' },
                      {
                        text: this.modelValue.mold,
                        style: 'desc'
                      }
                    ]
                  },
                  '',
                  {
                    colSpan: 2,
                    border: [false, false, false, false],
                    stack: [
                      { text: 'รายละเอียดสินค้า', style: 'title' },
                      {
                        text: this.modelValue.productDetail,
                        style: 'desc'
                      }
                    ]
                  },
                  ''
                ],
                //row 3
                [
                  '',
                  {
                    border: [false, false, false, false],
                    stack: [
                      { text: 'รหัสสินค้า', style: 'title' },
                      {
                        text: this.modelValue.productNumber,
                        style: 'desc'
                      }
                    ]
                  },
                  {
                    border: [false, false, false, false],
                    stack: [
                      { text: 'รหัสลูกค้า', style: 'title' },
                      {
                        text: this.modelValue.customerNumber,
                        style: 'desc'
                      }
                    ]
                  },
                  {
                    colSpan: 2,
                    border: [false, false, false, false],
                    stack: [
                      { text: 'หมายเหตุ', style: 'title' },
                      {
                        text: this.modelValue.remark,
                        style: 'desc'
                      }
                    ]
                  },
                  ''
                ]
              ]
            },
            layout: {
              defaultBorder: false
            },
            margin: [0, 0, 0, 10]
          },
          // qty
          {
            style: 'tableExample',
            alignment: 'center',
            margin: [50, 0, 50, 10],
            table: {
              widths: ['*', '*', '*', '*', '*'],
              body: [
                //row 1 titel
                [
                  { text: 'ยอดสั่ง', style: 'title', border: [false, false, false, false] },
                  { text: 'สำเร็จรูป', style: 'title', border: [false, false, false, false] },
                  { text: 'กึ่งสำเร็จรูป', style: 'title', border: [false, false, false, false] },
                  { text: 'ต้องหล่อ', style: 'title', border: [false, false, false, false] },
                  { text: 'หน่วย', style: 'title', border: [false, false, false, false] }
                ],
                [
                  {
                    text: this.modelValue.qty,
                    style: 'desc',
                    alignment: 'center'
                  },
                  {
                    text: this.modelValue.qtyFinish,
                    style: 'desc',
                    alignment: 'center'
                  },
                  {
                    text: this.modelValue.qtySemiFinish,
                    style: 'desc',
                    alignment: 'center'
                  },
                  {
                    text: this.modelValue.qtyCast,
                    style: 'desc',
                    alignment: 'center'
                  },
                  {
                    text: this.modelValue.qtyUnit,
                    style: 'desc',
                    alignment: 'center'
                  }
                ]
              ]
            }
          },
          // raw mat
          this.table(this.modelValue.tbtProductionPlanMaterial, [
            'material',
            'materialType',
            'materialShape',
            'materialSize',
            'materialQty'
          ])
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
            fontSize: 15,
            bold: true
          },
          desc: {
            fontSize: 15
            //bold: true
          }
        }
      }
      pdfMake.createPdf(docDefinition).open()

      //same tab
      //pdfMake.createPdf(docDefinition).open({}, window)

      //pdfMake.createPdf(docDefinition).print({}, window)
      // const doc = pdfMake.createPdf(docDefinition)
      // const pdfDataUrl = doc.getDataUrl()
      // // เปิดเอกสาร PDF ในหน้าต่างหรือแท็บใหม่
      // window.open(pdfDataUrl, '_blank')
    }
  }
}
</script>
