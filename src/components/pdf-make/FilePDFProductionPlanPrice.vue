<template>
  <div>
    <button
      :class="['btn btn-sm ml-2', isVisible ? 'btn-primary' : 'btn-secondary']"
      title="พิมพ์แบบ"
      @click="generatePDF"
      :disabled="!visible"
      type="button"
    >
      <span class="bi bi-printer"></span>
    </button>
  </div>
</template>

<script>
import { formatDate, formatDateTime } from '@/services/utils/dayjs'
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
    modelPrice: {
      type: Object,
      required: true,
      default: () => {}
    },
    isVisible: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  computed: {
    model() {
      return this.modelValue
    },
    price() {
      return this.modelPrice
    },
    visible() {
      return this.isVisible
    }
  },
  data() {
    return {
      urlImage: ''
    }
  },
  methods: {
    formatDate(date) {
      return formatDate(date)
    },
    formatDateTime(date) {
      return formatDateTime(date)
    },
    async fetchIamge() {
      try {
        const param = {
          imageName: `${this.model.mold}-Mold.png`
        }
        const res = await api.jewelry.get('FileExtension/GetMoldImage', param)
        this.urlImage = `data:image/png;base64,${res}`
      } catch (error) {
        console.log(error)
        return null
      }
    },
    textToBase64Barcode(text) {
      var canvas = document.createElement('canvas')
      jsbarcode(canvas, text, { format: 'CODE128', displayValue: false })
      return canvas.toDataURL('image/png')
    },

    groupItems() {
      return this.price.reduce((groups, item) => {
        const group = groups[item.nameGroup] || []
        group.push(item)
        groups[item.nameGroup] = group
        return groups
      }, {})
    },

    getGroupTitle(groupName) {
      const titles = {
        Gold: 'รายการทอง',
        Worker: 'รายการงานช่าง',
        Gem: 'รายการเพชรและพลอย',
        ETC: 'รายการเพิ่มเติม'
      }
      return titles[groupName] || groupName
    },

    formatNumber(num, decimals = 0) {
      if (!num) return '0' + (decimals > 0 ? '.'.padEnd(decimals + 1, '0') : '')
      return Number(num)
        .toFixed(decimals)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },

    calculateTotal() {
      return this.price.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    },

    async generatePDF() {
      await this.fetchIamge()

      pdfMake.vfs = vfs
      pdfMake.fonts = {
        THSarabunNew: {
          normal: 'THSarabunNew.ttf',
          bold: 'THSarabunNew Bold.ttf',
          italics: 'THSarabunNew Italic.ttf',
          bolditalics: 'THSarabunNew BoldItalic.ttf'
        }
      }

      try {
        const docDefinition = {
          pageSize: 'A4',
          //   pageSize: {
          //     width: 575.28,
          //     height: 'auto'
          //   }
          pageMargins: [10, 10, 10, 10],

          content: [
            // --- header --- //
            {
              columns: [
                'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
                { text: 'บัตรต้นทุน', alignment: 'right' }
              ],
              bold: true,
              fontSize: 15,
              margin: [0, 0, 0, 0],
              border: [false, false, false, true]
            },

            //underline
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      columns: [
                        ` ใบจ่าย-รับคืนงาน เลขที่ : ${this.model.wo}-${this.model.woNumber}`,
                        { text: this.formatDate(this.price[0].date), alignment: 'right' }
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

            // ------- img -------
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
                          text: this.model.wo,
                          style: 'desc'
                        }
                      ]
                    },
                    //wo number
                    {
                      stack: [
                        { text: 'ลำดับ W.O.', style: 'title' },
                        {
                          text: this.model.woNumber,
                          style: 'desc'
                        }
                      ]
                    },
                    //create date
                    {
                      stack: [
                        { text: 'วันสร้างใบงาน', style: 'title' },
                        {
                          text: formatDate(this.model.createDate),
                          style: 'desc'
                        }
                      ]
                    },
                    //send date
                    {
                      stack: [
                        { text: 'วันส่งงาน', style: 'title' },
                        {
                          text: formatDate(this.model.requestDate),
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
                          text: this.model.mold,
                          style: 'desc'
                        }
                      ]
                    },
                    //product code
                    {
                      stack: [
                        { text: 'รหัสสินค้า', style: 'title' },
                        {
                          text: this.model.productNumber,
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
                          text: this.model.productName,
                          style: 'desc'
                        }
                      ]
                    },
                    //product type
                    {
                      stack: [
                        { text: 'จำนวนสินค้า', style: 'title' },
                        {
                          text: `${this.model.productQty} ${this.model.productQtyUnit}`,
                          style: 'desc'
                        }
                      ]
                    }
                  ],
                  //row 3
                  [
                    //image
                    {
                      image: this.textToBase64Barcode(`${this.model.wo}-${this.model.woNumber}`),
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
                            this.model.customerName
                              ? `${this.model.customerNumber} : ${this.model.customerName}`
                              : this.model.customerNumber
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
                          text: `${this.model.customerTypeName}`,
                          style: 'desc'
                        }
                      ]
                    },
                    //remark
                    {
                      stack: [
                        { text: 'ประเภทสินค้า', style: 'title' },
                        {
                          text: this.model.productTypeName,
                          style: 'desc'
                        }
                      ]
                    },
                    {
                      //colSpan: 2,
                      stack: [
                        { text: 'หมายเหตุ', style: 'title' },
                        {
                          text: this.model.remark,
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
                        { text: 'รายละเอียดสินค้า', style: '' },
                        {
                          text: this.model.productDetail,
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
              margin: [0, 0, 0, 10]
            },

            //Table price
            {
              table: {
                headerRows: 1,
                widths: [20, '*', 60, 60, 60, 60, 80],
                body: [
                  // Header Row (with bottom border)
                  [
                    { text: 'รายละเอียดงาน', style: 'tableHeader', alignment: 'left', colSpan: 2 },
                    {},
                    { text: 'จำนวน', style: 'tableHeader', alignment: 'right' },
                    { text: 'ราคา/จำนวน', style: 'tableHeader', alignment: 'right' },
                    { text: 'น้ำหนัก', style: 'tableHeader', alignment: 'right' },
                    { text: 'ราคา/น้ำหนัก', style: 'tableHeader', alignment: 'right' },
                    { text: 'ราคารวม', style: 'tableHeader', alignment: 'right' }
                  ],

                  // Group Headers and Data
                  ...Object.entries(this.groupItems()).flatMap(([groupName, items]) => [
                    // Group Header
                    [
                      {
                        text: this.getGroupTitle(groupName),
                        bold: true,
                        colSpan: 7
                      },
                      {},
                      {},
                      {},
                      {},
                      {},
                      {}
                    ],
                    // Group Items
                    ...items.map((item) => [
                      { text: item.no, alignment: 'center' },
                      { text: item.nameDescription },
                      { text: this.formatNumber(item.qty), alignment: 'right' },
                      { text: this.formatNumber(item.qtyPrice, 2), alignment: 'right' },
                      { text: this.formatNumber(item.qtyWeight, 2), alignment: 'right' },
                      { text: this.formatNumber(item.qtyWeightPrice, 2), alignment: 'right' },
                      { text: this.formatNumber(item.totalPrice, 2), alignment: 'right' }
                    ])
                  ]),
                  // Total Row
                  [
                    { text: 'ต้นทุนรวม', colSpan: 6, alignment: 'right', style: 'tableHeader' },
                    {},
                    {},
                    {},
                    {},
                    {},
                    {
                      text: this.formatNumber(this.calculateTotal(), 2),
                      alignment: 'right',
                      style: 'tableHeader'
                    }
                  ]
                ]
              },
              layout: {
                hLineWidth: function (i, node) {
                  if (i === 0) return 1
                  if (i === 1) return 1
                  if (i === node.table.body.length - 1) return 1
                  if (i === node.table.body.length) return 1
                  return 0
                },
                vLineWidth: function (i) {
                  return 0
                },
                paddingLeft: function (i) {
                  return 4
                },
                paddingRight: function (i) {
                  return 4
                },
                // ปรับ padding top และ bottom แบบมีเงื่อนไข
                paddingTop: function (i, node) {
                  // สำหรับ header row
                  if (i === 0) return 4
                  // สำหรับ row ที่เป็น group name
                  if (
                    node.table.body[i] &&
                    node.table.body[i][0].text &&
                    (node.table.body[i][0].text === 'รายการทอง' ||
                      node.table.body[i][0].text === 'รายการงานช่าง' ||
                      node.table.body[i][0].text === 'รายการเพชรและพลอย' ||
                      node.table.body[i][0].text === 'รายการเพิ่มเติม')
                  ) {
                    return 8 // เพิ่มระยะห่างด้านบนสำหรับ group name
                  }
                  // สำหรับ row ปกติ
                  return 1 // ลดระยะห่างสำหรับ row ทั่วไป
                },
                paddingBottom: function (i, node) {
                  // สำหรับ header row
                  if (i === 0) return 4
                  // สำหรับ row ที่เป็น group name
                  if (
                    node.table.body[i] &&
                    node.table.body[i][0].text &&
                    (node.table.body[i][0].text === 'รายการทอง' ||
                      node.table.body[i][0].text === 'รายการงานช่าง' ||
                      node.table.body[i][0].text === 'รายการเพชรและพลอย' ||
                      node.table.body[i][0].text === 'รายการเพิ่มเติม')
                  ) {
                    return 4 // เพิ่มระยะห่างด้านล่างสำหรับ group name
                  }
                  // สำหรับ row ปกติ
                  return 1 // ลดระยะห่างสำหรับ row ทั่วไป
                },
                hLineColor: function (i, node) {
                  return '#000000'
                }
              }
            }
          ],

          styles: {
            tableHeader: {
              fontSize: 12,
              bold: true,
              alignment: 'center',
              margin: [0, 4, 0, 4]
            },
            desc: {
              fontSize: 12,
              bold: true
            },
            title: {
              fontSize: 10,
            },
          },

          defaultStyle: {
            font: 'THSarabunNew',
            fontSize: 12
          }
        }

        pdfMake.createPdf(docDefinition).open()
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
