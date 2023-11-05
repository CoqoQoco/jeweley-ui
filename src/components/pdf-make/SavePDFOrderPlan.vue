<template>
  <div>
    <div @click="generatePDF" title="พิมพ์เอกสาร">
      <span class="mr-2"> <i class="bi bi-printer"></i></span>
      <span>พิมพ์เอกสาร</span>
    </div>
  </div>
</template>

<script>
import { formatDate } from '@/utils/moment'
import pdfMake from 'pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'
import api from '@/axios/axios-config.js'
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

      // data.forEach(function (row) {
      //   let dataRow = []

      //   columns.forEach(function (column) {
      //     dataRow.push(row[column].toString())
      //   })

      //   body.push(dataRow)
      // })

      // const res = body.map((item) => {
      //   return { ...item, fontSize: 15 }
      // })

      //console.log(body)
      //console.log(res)

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
        // download default Roboto font from cdnjs.com
        // Roboto: {
        //   normal:
        //     'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        //   bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        //   italics:
        //     'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        //   bolditalics:
        //     'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
        // },
        THSarabunNew: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew Bold.ttf',
          italics: 'THSarabunNew Italic.ttf',
          bolditalics: 'THSarabunNew BoldItalic.ttf'
        }
      }

      // ----- set status from ------
      // const goldJobStatus = {
      //   style: 'tableExample',
      //   table: {
      //     widths: [40, 100, '*', '*', '*'],
      //     body: [
      //       // header
      //       [
      //         {
      //           colSpan: 5,
      //           stack: [
      //             {
      //               text: `วันที่หล่องาน  ${this.dotShort}     เปอร์เซ็นทอง  WG${this.dotShort}  YG${this.dotShort}`,
      //               style: 'title'
      //             }
      //           ]
      //         },
      //         '',
      //         '',
      //         '',
      //         ''
      //       ],

      //       // จ่ายเเต่ง
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายแต่ง',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้จ่าย', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'จ่ายวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: [15, '*', '*', '*'],
      //             //height: 100,
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: 'WG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'YG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'PG', style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //               //   }
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: '',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้รับ', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'รับวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: [15, '*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: 'WG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'YG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'PG', style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //               //   }
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],

      //       // จ่ายขัดดิบ
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายขัดดิบ',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้จ่าย', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'จ่ายวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: [15, '*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: 'WG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'YG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'PG', style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //               //   }
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: '',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้รับ', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'รับวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: [15, '*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: 'WG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'YG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'PG', style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //               //   }
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],

      //       // จ่ายคัดพลอย
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายคัดพลอย',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้คัดพลอย', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'คัดวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: [15, '*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: 'WG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 }
      //                 // {
      //                 //   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 // }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'YG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 }
      //                 // {
      //                 //   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 // }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'PG', style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //               //   }
      //               //   // {
      //               //   //   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //               //   // }
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],

      //       // จ่ายเจียพลอย
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายเจียพลอย',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           colSpan: 4,
      //           stack: [
      //             {
      //               text: `วันที่: ${this.dotShort}      ชื่อช่าง: ${this.dotShort}`,
      //               style: 'descAction'
      //             }
      //           ]
      //         },
      //         '',
      //         '',
      //         ''
      //       ],

      //       // จ่ายฝัง
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายฝัง',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้จ่าย', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'จ่ายวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: [15, '*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: 'WG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'YG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'PG', style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //               //   }
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: '',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้รับ', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'รับวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: [15, '*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: 'WG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'YG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'PG', style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //               //   }
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],
      //       [
      //         {
      //           colSpan: 5,
      //           style: 'tableExample',
      //           //margin: [0, 0, 0, 20],
      //           table: {
      //             widths: [100, 100, 100, 100, 100],
      //             body: [
      //               [
      //                 {
      //                   stack: [
      //                     {
      //                       text: 'เตยยอด: ........................',
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                   //border: [false, false, false, true]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: 'หุ้มยอด/หัวเรือ: ..................',
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                   //border: [false, false, false, true]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: 'เตยเล็ก: ........................',
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                   //border: [false, false, false, true]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: 'เตยล้อม: ........................',
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                   //border: [false, false, false, true]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: 'เตยร่วม/ภาคี: ........................',
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                   //border: [false, false, false, true]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [
      //                     { text: 'เล็บเหยี่ยว: ........................', style: 'descAction' }
      //                   ]
      //                 },

      //                 {
      //                   stack: [
      //                     { text: 'สี่เหลี่ยม: ........................', style: 'descAction' }
      //                   ]
      //                 },

      //                 {
      //                   stack: [{ text: 'ล้อม: ..................', style: 'descAction' }]
      //                 },

      //                 {
      //                   stack: [{ text: 'ไร้หนาม: ..................', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: 'อื่นๆ: ..................', style: 'descAction' }]
      //                 }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'อื่นๆ: ..................', style: 'descAction' }]
      //               //   },
      //               //   '',
      //               //   '',
      //               //   ''
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         '',
      //         '',
      //         ''
      //       ],

      //       // ตรวจ CVD
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'ตรวจ CVD',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           colSpan: 4,
      //           stack: [
      //             {
      //               text: `ผู้ตรวจ: ${this.dotShort}      ตรวจวันที่: ${this.dotShort}`,
      //               style: 'descAction'
      //             }
      //           ]
      //         },
      //         '',
      //         '',
      //         ''
      //       ],

      //       // จ่ายขัดชุบ
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายขัดชุบ',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้จ่าย', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'จ่ายวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: [15, '*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: 'WG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'YG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'PG', style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //               //   }
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: '',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้รับ', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'รับวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: [15, '*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: 'WG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'YG', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'PG', style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //               //   },
      //               //   {
      //               //     stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //               //   }
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],

      //       // ตรวจ CVD
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'ตรวจ CVD',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           colSpan: 4,
      //           stack: [
      //             {
      //               text: `ผู้ตรวจ: ${this.dotShort}      ตรวจวันที่: ${this.dotShort}`,
      //               style: 'descAction'
      //             }
      //           ]
      //         },
      //         '',
      //         '',
      //         ''
      //       ]
      //     ]
      //   },
      //   layout: {
      //     defaultBorder: false
      //   },
      //   margin: [0, 0, 0, 0]
      // }

      // const silerverStatus = {
      //   style: 'tableExample',
      //   table: {
      //     widths: [40, '*', '*', '*', '*'],
      //     body: [
      //       // header
      //       [
      //         {
      //           colSpan: 5,
      //           stack: [
      //             {
      //               text: `วันที่หล่องาน  ${this.dotShort}`,
      //               style: 'title'
      //             }
      //           ]
      //         },
      //         '',
      //         '',
      //         '',
      //         ''
      //       ],

      //       // จ่ายเเต่ง
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายแต่ง',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้จ่าย', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'จ่ายวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: ['*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: '',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้รับ', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'รับวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: ['*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],

      //       // จ่ายขัดดิบ
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายขัดดิบ',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้จ่าย', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'จ่ายวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: ['*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: '',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้รับ', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'รับวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: ['*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],

      //       // จ่ายคัดพลอย
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายคัดพลอย',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้คัด', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'วันที่คัด', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: ['*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 ''
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],

      //       // จ่ายเจียพลอย
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายเจียพลอย',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           colSpan: 4,
      //           stack: [
      //             {
      //               text: `วันที่: ${this.dotShort}      ชื่อช่าง: ${this.dotShort}`,
      //               style: 'descAction'
      //             }
      //           ]
      //         },
      //         '',
      //         '',
      //         ''
      //       ],

      //       // จ่ายฝัง
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายฝัง',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้จ่าย', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'จ่ายวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: ['*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: '',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้รับ', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'รับวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: ['*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],
      //       [
      //         {
      //           colSpan: 5,
      //           style: 'tableExample',
      //           table: {
      //             widths: [50, 50, 50, 50, 50],
      //             body: [
      //               [
      //                 {
      //                   stack: [
      //                     {
      //                       text: 'เตยยอด: ...................',
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                   //border: [false, false, false, true]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: 'หุ้มยอด/หัวเรือ: .............',
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                   //border: [false, false, false, true]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: 'เตยเล็ก: ..................',
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                   //border: [false, false, false, true]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: 'เตยล้อม: ..................',
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                   //border: [false, false, false, true]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: 'เตยร่วม/ภาคี: .................',
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                   //border: [false, false, false, true]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'เล็บเหยี่ยว: ..................', style: 'descAction' }]
      //                 },

      //                 {
      //                   stack: [{ text: 'สี่เหลี่ยม: ..................', style: 'descAction' }]
      //                 },

      //                 {
      //                   stack: [{ text: 'ล้อม: ...............', style: 'descAction' }]
      //                 },

      //                 {
      //                   stack: [{ text: 'ไร้หนาม: .............', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: 'อื่นๆ: .............', style: 'descAction' }]
      //                 }
      //               ]
      //               // [
      //               //   {
      //               //     stack: [{ text: 'อื่นๆ: ..................', style: 'descAction' }]
      //               //   },
      //               //   '',
      //               //   '',
      //               //   ''
      //               // ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         '',
      //         '',
      //         ''
      //       ],

      //       // ตรวจ CVD
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'ตรวจ CVD',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           colSpan: 4,
      //           stack: [
      //             {
      //               text: `ผู้ตรวจ: ${this.dotShort}      ตรวจวันที่: ${this.dotShort}`,
      //               style: 'descAction'
      //             }
      //           ]
      //         },
      //         '',
      //         '',
      //         ''
      //       ],

      //       // จ่ายขัดชุบ
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'จ่ายขัดชุบ',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้จ่าย', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'จ่ายวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: ['*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ชื่อช่าง${this.dotLong}`, style: 'descAction' }]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: '',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           //colSpan: 2,
      //           style: 'tableStatus',
      //           table: {
      //             widths: [30, '*'],
      //             body: [
      //               //row 1
      //               [
      //                 {
      //                   stack: [{ text: 'ผู้รับ', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ],
      //               [
      //                 {
      //                   stack: [{ text: 'รับวันที่', style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [
      //                     {
      //                       text: this.dotShort,
      //                       style: 'descAction'
      //                     }
      //                   ]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         {
      //           colSpan: 3,
      //           table: {
      //             widths: ['*', '*', '*'],
      //             body: [
      //               [
      //                 {
      //                   stack: [{ text: `จำนวน${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `น้ำหนัก${this.dotLong}`, style: 'descAction' }]
      //                 },
      //                 {
      //                   stack: [{ text: `ขาด${this.dotLong}...`, style: 'descAction' }]
      //                 }
      //               ]
      //             ]
      //           },
      //           layout: {
      //             defaultBorder: false
      //           }
      //         },
      //         '',
      //         ''
      //       ],

      //       // ตรวจ CVD
      //       [
      //         {
      //           //colSpan: 4,
      //           stack: [
      //             {
      //               text: 'ตรวจ CVD',
      //               style: 'titleAction'
      //             }
      //           ]
      //         },
      //         {
      //           colSpan: 4,
      //           stack: [
      //             {
      //               text: `ผู้ตรวจ: ${this.dotShort}      ตรวจวันที่: ${this.dotShort}`,
      //               style: 'descAction'
      //             }
      //           ]
      //         },
      //         '',
      //         '',
      //         ''
      //       ]
      //     ]
      //   },
      //   layout: {
      //     defaultBorder: false
      //   },
      //   margin: [0, 0, 0, 0]
      // }

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [20, 10, 20, 10],

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
              widths: [80, '*', '*', '*', '*'],
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
                        text: this.modelValue.customerNumber,
                        style: 'desc'
                      }
                    ]
                  },
                  //customer type
                  {
                    stack: [
                      { text: 'ชื่อลูกค้า', style: 'title' },
                      {
                        text: this.modelValue.customerType,
                        style: 'desc'
                      }
                    ]
                  },
                  //remark
                  {
                    stack: [
                      { text: 'ประเภทสินค้า', style: 'title' },
                      {
                        text: this.modelValue.productTypeNavigation.nameTh,
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
