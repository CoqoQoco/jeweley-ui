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
    buildTableBody(data) {
      console.log(data)
      let body = []
      const title = [
        'ประเภททอง',
        'เปอร์เซ็นทอง',
        'ประเภทพลอย',
        'รูปร่าง/ขนาด พลอย',
        'จำนวนพลอย',
        'น้ำหนักพลอย',
        'จำนวนเพชร',
        'น้ำหนักเพชร',
        'คุณภาพเพชร'
      ]
      body.push(title)

      data.forEach((item) => {
        const row = [
          `${item.goldNavigation?.code ?? ``} - ${item.goldNavigation?.nameEn ?? ``}`,
          `${item.goldSizeNavigation?.nameEn ?? `-`}`,
          `${item.gemNavigation?.code ?? ``} - ${item.gemNavigation?.nameEn ?? ``}`,
          `${item.gemShapeNavigation?.code ?? ``} - ${item.gemSize ?? ``}`,
          `${item.gemQty ?? ``} ${item.gemUnit ?? ``}`,
          `${item.gemWeight ?? ``} ${item.gemWeightUnit ?? ``}`,
          `${item.diamondQty ?? ``} ${item.diamondUnit ?? ``}`,
          `${item.diamondWeight ?? ``} ${item.diamondWeightUnit ?? ``}`,
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
        fontSize: 10,
        margin: [20, 0, 20, 10],
        table: {
          headerRows: 1,
          widths: [60, '*', '*', 60, '*', '*', '*', '*', '*'],
          body: this.buildTableBody(data)
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
              'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
              { text: 'ใบจ่าย-รับคืนงาน', alignment: 'right' }
            ],
            margin: [0, 0, 0, 0],
            bold: true,
            fontSize: 15
          },
          //detail
          {
            style: 'tableExample',
            table: {
              widths: [150, '*', '*', '*', '*'],
              body: [
                //row 1
                [
                  //image
                  {
                    rowSpan: 3,
                    image: this.urlImage,
                    //fit: [100, 100],
                    margin: [0, 0, 0, 0],
                    width: 80,
                    height: 80,
                    border: [true, true, true, true],
                    alignment: 'center'
                  },
                  //wo
                  {
                    margin: [5, 0, 0, 0],
                    stack: [
                      { text: 'เลขที่ W.O.', style: 'title' },
                      {
                        text: this.modelValue.wo,
                        style: 'desc'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  //wo number
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
                  //create date
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
                  //send date
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
                  //image
                  '',
                  //mode
                  {
                    //colSpan: 2,
                    margin: [5, 0, 0, 0],
                    border: [false, false, false, false],
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
                    border: [false, false, false, false],
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
                    border: [false, false, false, false],
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
                    border: [false, false, false, false],
                    stack: [
                      { text: 'ประเภทสินค้า', style: 'title' },
                      {
                        text: this.modelValue.productTypeNavigation.nameTh,
                        style: 'desc'
                      }
                    ]
                  }
                ],
                //row 3
                [
                  //image
                  '',
                  //customer code
                  {
                    margin: [5, 0, 0, 0],
                    border: [false, false, false, false],
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
                    border: [false, false, false, false],
                    stack: [
                      { text: 'ชื่อลูกค้า', style: 'title' },
                      {
                        text: this.modelValue.customerTypeNavigation.nameTh,
                        style: 'desc'
                      }
                    ]
                  },
                  //remark
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
          // {
          //   style: 'tableExample',
          //   alignment: 'center',
          //   margin: [50, 0, 50, 10],
          //   table: {
          //     widths: ['*', '*', '*', '*', '*'],
          //     body: [
          //       //row 1 titel
          //       [
          //         { text: 'ยอดสั่ง', style: 'title', border: [false, false, false, false] },
          //         { text: 'สำเร็จรูป', style: 'title', border: [false, false, false, false] },
          //         { text: 'กึ่งสำเร็จรูป', style: 'title', border: [false, false, false, false] },
          //         { text: 'ต้องหล่อ', style: 'title', border: [false, false, false, false] },
          //         { text: 'หน่วย', style: 'title', border: [false, false, false, false] }
          //       ],
          //       [
          //         {
          //           text: this.modelValue.qty,
          //           style: 'desc',
          //           alignment: 'center'
          //         },
          //         {
          //           text: this.modelValue.qtyFinish,
          //           style: 'desc',
          //           alignment: 'center'
          //         },
          //         {
          //           text: this.modelValue.qtySemiFinish,
          //           style: 'desc',
          //           alignment: 'center'
          //         },
          //         {
          //           text: this.modelValue.qtyCast,
          //           style: 'desc',
          //           alignment: 'center'
          //         },
          //         {
          //           text: this.modelValue.qtyUnit,
          //           style: 'desc',
          //           alignment: 'center'
          //         }
          //       ]
          //     ]
          //   }
          // },

          //product detail
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
            margin: [20, 0, 20, 10]
          },

          // product detail
          // raw mat
          this.table(this.matValue),

          //action
          {
            style: 'tableExample',
            table: {
              widths: [40, 170, '*', '*', '*'],
              body: [
                //row 1
                [
                  {
                    colSpan: 5,
                    stack: [
                      {
                        text: 'วันที่หล่องาน ........................................                      เปอร์เซ็นทอง    WG .............................. YG .............................. PG ..............................',
                        style: 'title'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  '',
                  '',
                  '',
                  ''
                ],
                //จ่ายเเต่ง
                [
                  {
                    //colSpan: 4,
                    stack: [
                      {
                        text: 'จ่ายแต่ง',
                        style: 'titleAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  {
                    //colSpan: 2,
                    style: 'tableExample',
                    table: {
                      widths: [40, '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [{ text: 'ผู้จ่าย', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ],
                        [
                          {
                            stack: [{ text: 'จ่ายวันที่', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  {
                    colSpan: 3,
                    stack: [
                      {
                        text: 'WG  จำนวน .....................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'YG  จำนวน ......................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'PG  จำนวน ......................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  '',
                  ''
                ],
                [
                  '',
                  {
                    //colSpan: 2,
                    style: 'tableExample',
                    table: {
                      widths: [40, '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [{ text: 'ผู้รับ', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ],
                        [
                          {
                            stack: [{ text: 'รับวันที่', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  {
                    colSpan: 3,
                    stack: [
                      {
                        text: 'WG  จำนวน .....................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'YG  จำนวน ......................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'PG  จำนวน ......................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  '',
                  ''
                ],

                //จ่ายขัดดิบ
                [
                  {
                    //colSpan: 4,
                    stack: [
                      {
                        text: 'จ่ายขัดดิบ',
                        style: 'titleAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  {
                    //colSpan: 2,
                    style: 'tableExample',
                    table: {
                      widths: [40, '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [{ text: 'ผู้จ่าย', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ],
                        [
                          {
                            stack: [{ text: 'จ่ายวันที่', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  {
                    colSpan: 3,
                    stack: [
                      {
                        text: 'WG  จำนวน .....................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'YG  จำนวน ......................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'PG  จำนวน ......................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  '',
                  ''
                ],
                [
                  '',
                  {
                    //colSpan: 2,
                    style: 'tableExample',
                    table: {
                      widths: [40, '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [{ text: 'ผู้รับ', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ],
                        [
                          {
                            stack: [{ text: 'รับวันที่', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  {
                    colSpan: 3,
                    stack: [
                      {
                        text: 'WG  จำนวน .....................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'YG  จำนวน ......................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'PG  จำนวน ......................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  '',
                  ''
                ],

                //คัดพลอยพลอย
                [
                  {
                    //colSpan: 4,
                    stack: [
                      {
                        text: 'จ่ายคัดพลอย',
                        style: 'titleAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  {
                    //colSpan: 2,
                    style: 'tableExample',
                    table: {
                      widths: [40, '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [{ text: 'ผู้คัดพลอย', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ],
                        [
                          {
                            stack: [{ text: 'คัดวันที่', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  {
                    colSpan: 3,
                    stack: [
                      {
                        text: 'WG  จำนวน .....................................        น้ำหนัก ......................................      ',
                        style: 'descAction'
                      },
                      {
                        text: 'YG  จำนวน ......................................        น้ำหนัก ......................................      ',
                        style: 'descAction'
                      },
                      {
                        text: 'PG  จำนวน ......................................        น้ำหนัก ......................................      ',
                        style: 'descAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  '',
                  ''
                ],

                //จ่ายฝัง
                [
                  {
                    //colSpan: 4,
                    stack: [
                      {
                        text: 'จ่ายฝัง',
                        style: 'titleAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  {
                    //colSpan: 2,
                    style: 'tableExample',
                    table: {
                      widths: [40, '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [{ text: 'ผู้จ่าย', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ],
                        [
                          {
                            stack: [{ text: 'จ่ายวันที่', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  {
                    colSpan: 3,
                    stack: [
                      {
                        text: 'WG  จำนวน .....................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'YG  จำนวน ......................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'PG  จำนวน ......................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  '',
                  ''
                ],
                [
                  '',
                  {
                    //colSpan: 2,
                    style: 'tableExample',
                    table: {
                      widths: [40, '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [{ text: 'ผู้รับ', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ],
                        [
                          {
                            stack: [{ text: 'รับวันที่', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  {
                    colSpan: 3,
                    stack: [
                      {
                        text: 'WG  จำนวน .....................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'YG  จำนวน ......................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'PG  จำนวน ......................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  '',
                  ''
                ],
                [
                  {
                    colSpan: 5,
                    style: 'tableExample',
                    table: {
                      widths: ['*', '*', '*', '*', '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [
                              {
                                text: 'เตยยอด .........................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: 'หุ้มยอด/หัวเรือ .....................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: 'เตยเล็ก ...............................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: 'ล้อม ..............................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: 'เตยร่วม/มาคี .......................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  '',
                  '',
                  '',
                  ''
                ],
                [
                  {
                    colSpan: 5,
                    style: 'tableExample',
                    table: {
                      widths: ['*', '*', '*', '*', '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [
                              {
                                text: 'เล็บเหยี่ยว .....................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: 'สี่เหลี่ยม ...............................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: 'ล็อค ....................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: 'ไร้หนาม .........................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: 'อื่นๆ .....................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  '',
                  '',
                  '',
                  ''
                ],

                //จ่ายขัดชุบ
                [
                  {
                    //colSpan: 4,
                    stack: [
                      {
                        text: 'จ่ายขัดชุบ',
                        style: 'titleAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  {
                    //colSpan: 2,
                    style: 'tableExample',
                    table: {
                      widths: [40, '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [{ text: 'ผู้จ่าย', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ],
                        [
                          {
                            stack: [{ text: 'จ่ายวันที่', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  {
                    colSpan: 3,
                    stack: [
                      {
                        text: 'WG  จำนวน .....................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'YG  จำนวน ......................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'PG  จำนวน ......................................        น้ำหนัก ......................................      ชื่อช่าง ......................................',
                        style: 'descAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  '',
                  ''
                ],
                [
                  '',
                  {
                    //colSpan: 2,
                    style: 'tableExample',
                    table: {
                      widths: [40, '*'],
                      body: [
                        //row 1
                        [
                          {
                            stack: [{ text: 'ผู้รับ', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ],
                        [
                          {
                            stack: [{ text: 'รับวันที่', style: 'descAction' }],
                            border: [false, false, false, false]
                          },
                          {
                            stack: [
                              {
                                text: '..........................................................',
                                style: 'descAction'
                              }
                            ],
                            border: [false, false, false, false]
                          }
                        ]
                      ]
                    },
                    layout: {
                      defaultBorder: false
                    }
                  },
                  {
                    colSpan: 3,
                    stack: [
                      {
                        text: 'WG  จำนวน .....................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'YG  จำนวน ......................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      },
                      {
                        text: 'PG  จำนวน ......................................        น้ำหนัก ......................................      ขาด ......................................',
                        style: 'descAction'
                      }
                    ],
                    border: [false, false, false, false]
                  },
                  '',
                  ''
                ]

                //หมายเหตุ
              ]
            },
            layout: {
              defaultBorder: false
            },
            margin: [0, 0, 0, 0]
          },

          //หมายเหตุ
          {
            style: 'tableExample',
            table: {
              widths: ['*'],
              body: [
                //row 1
                [
                  {
                    stack: [
                      { text: 'หมายเหตุ', style: 'title' },
                      {
                        text: '',
                        style: 'desc'
                      },
                      {
                        text: '',
                        style: 'desc'
                      }
                    ],
                    border: [false, true, false, false]
                  }
                ]
              ]
            },
            layout: {
              defaultBorder: false
            },
            margin: [0, 10, 0, 0]
          }
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
            fontSize: 10,
            bold: true
          },
          titleAction: {
            fontSize: 10,
            bold: true,
            decoration: 'underline', // เพิ่มขีดเส้นใต้ข้อความ
            decorationStyle: 'solid' // รูปแบบของขีดเส้น (solid, double, dashed, etc.)
          },
          desc: {
            fontSize: 10
            //bold: true
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

      // pdfMake.createPdf(docDefinition).open({}, () => {
      //   // หากต้องการกำหนดชื่อไฟล์ PDF ที่เปิด
      //   const pdfWindow = pdfMake.createPdf(docDefinition)
      //   pdfWindow.getBlob((blob) => {
      //     const url = URL.createObjectURL(blob)
      //     const a = document.createElement('a')
      //     a.href = url
      //     a.download = fileName
      //     a.click()
      //     URL.revokeObjectURL(url)
      //   })
      // })
    }
  }
}
</script>
