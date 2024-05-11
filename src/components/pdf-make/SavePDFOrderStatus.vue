<template>
  <div>
    <div @click="generatePDF" title="พิมพ์รายละเอียดงานผลิต">
      <span class="mr-2"> <i class="bi bi-printer"></i></span>
      <span>พิมพ์สถานะการผลิต</span>
    </div>
  </div>
</template>

<script>
import { formatDate } from '@/services/utils/dayjs'
import moment from 'dayjs'
import pdfMake from 'pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'
import api from '@/axios/axios-config.js'
import jsbarcode from 'jsbarcode'
import _ from 'lodash'

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
    },
    statusValue: {
      type: Array,
      required: true,
      default: () => []
    },
    statusMasterValue: {
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
      return date ? formatDate(date) : null
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
        'จำนวนทอง',
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
          `${item.gemNavigation?.code ?? ``} - ${item.gemNavigation?.nameEn ?? ``}`,
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
        margin: [0, 0, 0, 5],
        table: {
          headerRows: 1,
          widths: [60, '*', '*', 60, 50, '*', '*', '*', '*', '*', '*'],
          body: this.buildTableBody(data)
        }
      }
    },

    // build รายละเอียดการผลิต
    tableStatus(data, master) {
      return {
        fontSize: 9,
        bold: true,
        margin: [0, 0, 0, 10],
        table: {
          headerRows: 1,
          widths: [70, '*'],
          body: this.buildStatusData(data, master)
        }
      }
    },
    buildStatusData(data, master) {
      let body = []
      const title = ['สถานะ', 'รายละเอียด']
      body.push(title)

      data.forEach((item) => {
        const status = master.filter((x) => x.id === item.status)

        const row = [
          {
            alignment: 'justify',
            margin: [10, 5, 0, 0],
            columns: [
              {
                text: [
                  { text: `${status[0].nameTh}\n`, fontSize: 14, bold: true },
                  { text: `${formatDate(data.createDate)}`, fontSize: 9 }
                ],
                margin: [0, 0, 0, 0]
              }
            ]
          },
          [
            this.buildDetailStausColumnsDetail(item),
            this.tableGold(item),
            //this.tableGold(item),
            this.tableGem(item),
            this.setRemark(item.remark1, 'หมายเหตุ - 1'),
            this.setRemark(item.remark2, 'หมายเหตุ - 2')
          ]
        ]
        body.push(row)
      })
      return body
    },
    buildDetailStausColumnsDetail(data) {
      const style = {
        alignment: 'justify',
        margin: [10, 5, 0, 5]
      }
      const styleTitle = {
        fontSize: 9
      }
      const styleDesc = {
        fontSize: 14,
        bold: true
      }
      if ([50, 60, 80, 90].includes(data.status)) {
        return {
          ...style,
          columns: [
            {
              text: [
                { text: 'จ่ายงาน\n', ...styleTitle },
                { text: `${data.sendName ?? ''}`, ...styleDesc }
              ]
            },
            {
              text: [
                { text: 'จ่ายวันที่\n', ...styleTitle },
                { text: `${formatDate(data.sendDate)}`, ...styleDesc }
              ]
            },
            {
              text: [
                { text: '', ...styleTitle },
                { text: ``, ...styleDesc }
              ]
            },
            {
              text: [
                { text: '', ...styleTitle },
                { text: ``, ...styleDesc }
              ]
            }
          ]
        }
      } else if (data.status === 70) {
        return {
          ...style,
          columns: [
            {
              text: [
                { text: 'ผู้คัดพลอย\n', ...styleTitle },
                { text: `${data.checkName}`, ...styleDesc }
              ]
            },
            {
              text: [
                { text: 'วันคัดพลอย\n', ...styleTitle },
                { text: `${formatDate(data.checkDate)}`, ...styleDesc }
              ]
            },
            {
              text: []
            },
            {
              text: []
            }
          ]
        }
      } else if (data.status === 85) {
        return {
          ...style,
          columns: [
            {
              text: [
                { text: 'ผู้ตรวจ CVD\n', ...styleTitle },
                { text: `${data.checkName}`, ...styleDesc }
              ]
            },
            {
              text: [
                { text: 'วันตรวจ CVD\n', ...styleTitle },
                { text: `${formatDate(data.checkDate)}`, ...styleDesc }
              ]
            },
            {
              text: [],
              margin: [0, 0, 0, 0]
            },
            {
              text: [],
              margin: [0, 0, 0, 0]
            }
          ]
        }
      } else if (data.status === 95) {
        return {
          ...style,
          columns: [
            {
              text: [
                { text: 'ผู้ประเมินราคา\n', ...styleTitle },
                { text: `${data.checkName}`, ...styleDesc }
              ]
            },
            {
              text: [
                { text: 'วันประเมินราคา\n', ...styleTitle },
                { text: `${formatDate(data.checkDate)}`, ...styleDesc }
              ]
            },
            {
              text: [],
              margin: [0, 0, 0, 0]
            },
            {
              text: [],
              margin: [0, 0, 0, 0]
            }
          ]
        }
      }
    },
    tableGold(data) {
      const style = {
        fontSize: 9,
        bold: true,
        margin: [5, 0, 5, 5]
      }
      if ([50, 60, 80, 90].includes(data.status)) {
        return {
          ...style,
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*', '*', 90],
            body: this.buildTableGoldBody(data)
          }
        }
      } else if (data.status === 70) {
        return {
          ...style,
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', 90, 90],
            body: this.buildTableGoldBodyForGem(data)
          }
        }
      }
    },
    tableGem(data) {
      const style = {
        fontSize: 9,
        bold: true,
        margin: [5, 0, 5, 5]
      }
      if ([50, 60, 80, 90].includes(data.status)) {
        return {}
      } else if (data.status === 70) {
        return {
          ...style,
          table: {
            headerRows: 1,
            widths: ['*', 100, 100],
            body: this.buildTableGoldBodyForGemDetail(data)
          }
        }
      }
    },
    buildTableGoldBody(data) {
      //console.log(data)
      let body = []
      const title = [
        'ทอง',
        'วันที่',
        'จำนวนจ่าย',
        'นำหนักจ่าย',
        'จำนวนรับ',
        'น้ำหนักรับ',
        'ขาด',
        'ช่างรับงาน'
      ]
      body.push(title)
      if (!_.isEmpty(data.tbtProductionPlanStatusDetail)) {
        data.tbtProductionPlanStatusDetail.forEach((item) => {
          const row = [
            `${item.gold ? item.gold : ''}`,
            `${item.requestDate ? this.formatDate(item.requestDate) : ``}`,
            `${item.goldQtySend ? item.goldQtySend : ''}`,
            `${item.goldWeightSend ? item.goldWeightSend : ''}`,
            `${item.goldQtyCheck ? item.goldQtyCheck : ''}`,
            `${item.goldWeightCheck ? item.goldWeightCheck : ''}`,
            `${
              item.goldWeightDiff
                ? `${item.goldWeightDiff} (${item.goldWeightDiffPercent.toLocaleString()}%)`
                : ''
            }`,
            `${item.worker ? item.worker : ``}-${item.workerName ? item.workerName : ``}`
          ]
          body.push(row)
        })
      }
      return body
    },
    buildTableGoldBodyForGem(data) {
      //console.log(data)
      let body = []
      const title = ['ทอง', 'วันที่', 'จำนวนรับ', 'น้ำหนักรับ', 'ช่างคัดพลอย', 'ช่างคัดเพชร']
      body.push(title)
      if (!_.isEmpty(data.tbtProductionPlanStatusDetail)) {
        data.tbtProductionPlanStatusDetail.forEach((item) => {
          const row = [
            `${item.gold ? item.gold : ''}`,
            `${item.requestDate ? this.formatDate(item.requestDate) : ``}`,
            `${item.goldQtyCheck ? item.goldQtyCheck : ''}`,
            `${item.goldWeightCheck ? item.goldWeightCheck : ''}`,
            `${item.worker ? item.worker : ''}-${item.workerName ? item.workerName : ''}`,
            `${item.workerSub ? item.workerSub : ''}-${
              item.workerSubName ? item.workerSubName : ''
            }`
          ]
          body.push(row)
        })
      }
      return body
    },
    buildTableGoldBodyForGemDetail(data) {
      //console.log(data)
      let body = []
      const title = ['พลอย', 'จำนวน', 'น้ำหนัก']
      body.push(title)
      if (!_.isEmpty(data.tbtProductionPlanStatusGem)) {
        data.tbtProductionPlanStatusGem.forEach((item) => {
          const row = [
            `${item.name ? item.name : ''}`,
            `${item.qty ? item.qty : ''}`,
            `${item.weight ? item.weight : ''}`
          ]
          body.push(row)
        })
      }
      return body
    },
    setRemark(text, title) {
      const style = {
        alignment: 'start',
        margin: [10, 5, 0, 5]
      }
      if (text) {
        return {
          ...style,
          columns: [
            {
              text: [
                { text: `${title} : `, fontSize: 9 },
                { text: `${text}`, fontSize: 9, bold: true }
              ],
              margin: [0, 0, 0, 0]
            }
          ]
        }
      } else {
        return null
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
          // ------- header -------
          {
            columns: [
              'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
              { text: 'รายละเอียดสถานะการผลิต', alignment: 'right' }
            ],
            margin: [0, 0, 0, 0],
            bold: true,
            fontSize: 15
          },

          // ------- detail -------
          {
            style: 'tableExample',
            table: {
              widths: [80, 150, '*', '*', '*'],
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
                    image: this.textToBase64Barcode(this.modelValue.productNumber),
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
                      { text: 'ประเภทสินค้า', style: 'title' },
                      {
                        text: this.modelValue.customerTypeName,
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
          { text: 'รายละเอียดสินค้า', bold: true, fontSize: 14 },
          {
            style: 'tableExample',
            table: {
              widths: ['*'],
              body: [
                //row 1
                [
                  {
                    stack: [
                      null,
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

          // ------- mat detail ---------
          { text: 'ส่วนประกอบงานผลิต', bold: true, fontSize: 14 },
          this.table(this.matValue),

          // ----------- status -------------- //
          {
            text: `สถานะการดำเนินงานผลิต - ${moment().format('DD/MM/YYYY HH:mm:ss')}`,
            bold: true,
            fontSize: 14
          },
          this.tableStatus(this.statusValue, this.statusMasterValue)
          //   { text: 'สถานะการดำเนินงานผลิต', bold: true, fontSize: 15 },
          //   {
          //     style: 'tableExample',
          //     table: {
          //       widths: [70, '*'],
          //       body: [
          //         ['สถานะ', 'รายละเอียด'],
          //         ['จ่ายคัดพลอย', { text: 'nothing interesting here', italics: true, color: 'gray' }]
          //       ]
          //     }
          //   }
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
