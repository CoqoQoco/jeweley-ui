<template>
  <div>
    <button
      :class="['btn btn-sm ml-2', isVisible ? 'btn-primary' : 'btn-secondary']"
      title="พิมพ์แบบวัถุดิบ"
      @click="generatePDF"
      :disabled="!visible"
      type="button"
    >
      <span class="bi bi-receipt"></span>
    </button>
  </div>
</template>

<script>
import { formatDate, formatDateTime } from '@/services/utils/dayjs'
import pdfMake from 'pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'
import api from '@/axios/axios-helper.js'
import jsbarcode from 'jsbarcode'
import { getAzureBlobAsBase64 } from '@/config/azure-storage-config.js'

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
        // Build Azure Blob path and convert to Base64 for pdfMake
        const blobPath = `Mold/${this.model.mold}-Mold.png`
        const base64Image = await getAzureBlobAsBase64(blobPath)

        // ตรวจสอบว่าได้ Base64 กลับมาหรือไม่
        if (base64Image && base64Image.length > 0) {
          this.urlImage = base64Image
        } else {
          console.warn('No image found for mold:', this.model.mold)
          this.urlImage = null
        }
      } catch (error) {
        console.error('Error fetching image:', error)
        this.urlImage = null
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
        ETC: 'รายการเพิ่มเติม',
        Embed: 'รายการฝัง'
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
    calculateTotalPerQty() {
      return this.calculateTotal() / (this.model.productQty || 1)
      //return '0.00'
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
                { text: 'วัตถุดิบ', alignment: 'right' }
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
                        ` เลขที่แผนผลิต [W.O.] : ${this.model.wo}-${this.model.woNumber}`,
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

            // ------- img & details -------
            {
              style: 'tableExample',
              table: {
                widths: [80, '*', '*', '*', '*'], // เปลี่ยนเป็น 5 columns
                body: [
                  [
                    // รูป
                    this.urlImage
                      ? {
                          rowSpan: 2,
                          image: this.urlImage,
                          width: 50,
                          height: 50,
                          border: [true, true, true, true],
                          alignment: 'center',
                          margin: [0, 5, 0, 0]
                        }
                      : {
                          rowSpan: 2,
                          text: 'ไม่มีรูป',
                          width: 50,
                          height: 50,
                          border: [true, true, true, true],
                          alignment: 'center',
                          margin: [0, 5, 0, 0],
                          fontSize: 8,
                          color: '#999999'
                        },

                    // Column 2
                    {
                      //margin: [30, 0, 0, 0],
                      stack: [
                        { text: 'เเม่พิมพ์', style: 'title' },
                        { text: this.model.mold, style: 'desc' }
                      ]
                    },
                    // Column 3
                    {
                      stack: [
                        { text: 'รหัสสินค้า', style: 'title' },
                        { text: this.model.productNumber, style: 'desc' }
                      ]
                    },
                    // Column 4
                    {
                      stack: [
                        { text: 'ชื่อสินค้า', style: 'title' },
                        { text: this.model.productName, style: 'desc' }
                      ]
                    },
                    // Column 5
                    {
                      stack: [
                        { text: 'จำนวนสินค้า', style: 'title' },
                        {
                          text: `${this.model.productQty} ${this.model.productQtyUnit}`,
                          style: 'desc'
                        }
                      ]
                      //border: [true, true, true, true]
                    }
                  ],
                  [
                    '', // สำหรับ rowSpan ของรูป
                    // Column 2
                    {
                      //margin: [30, 0, 0, 0],
                      stack: [
                        { text: 'รหัสลูกค้า', style: 'title' },
                        { text: this.model.customerNumber, style: 'desc' }
                      ]
                    },
                    // Column 3
                    {
                      stack: [
                        { text: 'ประเภทลูกค้า', style: 'title' },
                        { text: this.model.customerTypeName, style: 'desc' }
                      ]
                    },
                    // Column 4
                    {
                      stack: [
                        { text: 'วันสร้างใบงาน', style: 'title' },
                        { text: formatDate(this.model.createDate), style: 'desc' }
                      ]
                    },
                    // Column 5
                    {
                      stack: [
                        { text: 'วันส่งงาน', style: 'title' },
                        { text: formatDate(this.model.requestDate), style: 'desc' }
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

            // ------- barcode & product detail ---------
            {
              table: {
                widths: [80, '*'],
                body: [
                  [
                    // barcode
                    {
                      image: this.textToBase64Barcode(`${this.model.wo}${this.model.woNumber}`),
                      width: 70,
                      height: 25,
                      alignment: 'center',
                      border: [false, false, false, false]
                    },
                    // product detail
                    {
                      stack: [
                        { text: 'รายละเอียดสินค้า', style: 'title' },
                        {
                          text: this.model.productDetail,
                          style: 'desc',
                          // เพิ่มการจัดการข้อความยาว
                          maxHeight: 100,
                          lineHeight: 1.2,
                          wrap: true // เพิ่มการ wrap text
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
                widths: [15, '*', 50, 50, 50, 50, 70, 50], // ปรับขนาดคอลัมน์ให้แคบลง
                body: [
                  // Header Row (with bottom border)
                  [
                    { text: 'รายละเอียดงาน', style: 'tableHeader', alignment: 'left', colSpan: 2 },
                    {},
                    { text: 'จำนวน', style: 'tableHeader', alignment: 'right' },
                    { text: 'ราคา/จำนวน', style: 'tableHeader', alignment: 'right' },
                    { text: 'น้ำหนัก', style: 'tableHeader', alignment: 'right' },
                    { text: 'ราคา/น้ำหนัก', style: 'tableHeader', alignment: 'right' },
                    { text: 'ราคา/สินค้า', style: 'tableHeader', alignment: 'right' },
                    { text: 'ราคารวม', style: 'tableHeader', alignment: 'right' }
                  ],

                  // แก้ไขส่วนการสร้าง body ของตาราง
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
                      {},
                      {}
                    ],
                    // Group Items
                    ...items.map((item) => [
                      { text: item.no, alignment: 'center' },
                      { text: item.nameDescription },
                      { text: this.formatNumber(item.qty), alignment: 'right' },
                      { text: this.formatNumber(item.qtyPrice, 2), alignment: 'right' },
                      { text: this.formatNumber(item.qtyWeight, 3), alignment: 'right' },
                      { text: this.formatNumber(item.qtyWeightPrice, 2), alignment: 'right' },
                      {
                        text: this.formatNumber(0, 2),
                        alignment: 'right'
                      },
                      { text: this.formatNumber(item.totalPrice, 2), alignment: 'right' }
                    ]),
                    // Subtotal Row สำหรับแต่ละกลุ่ม
                    [
                      {
                        text: `รวม${this.getGroupTitle(groupName)}`,
                        colSpan: 2,
                        alignment: 'right',
                        bold: true,
                        fontSize: 11
                      },
                      {},
                      {
                        text: this.formatNumber(
                          items.reduce((sum, item) => sum + (item.qty || 0), 0)
                        ),
                        alignment: 'right',
                        bold: true
                      },
                      {
                        text: this.formatNumber(
                          items.reduce((sum, item) => sum + (item.qtyPrice || 0), 0),
                          2
                        ),
                        alignment: 'right',
                        bold: true
                      },
                      {
                        text: this.formatNumber(
                          items.reduce((sum, item) => sum + (item.qtyWeight || 0), 0),
                          3
                        ),
                        alignment: 'right',
                        bold: true
                      },
                      {
                        text: this.formatNumber(
                          items.reduce((sum, item) => sum + (item.qtyWeightPrice || 0), 0),
                          2
                        ),
                        alignment: 'right',
                        bold: true
                      },
                      {
                        text: this.formatNumber(
                          items.reduce((sum, item) => sum + (item.totalPrice || 0), 0) /
                            (this.model.productQty || 1),
                          2
                        ),
                        alignment: 'right',
                        bold: true
                      },
                      {
                        text: this.formatNumber(
                          items.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
                          2
                        ),
                        alignment: 'right',
                        bold: true
                      }
                    ]
                  ]),
                  [
                    //ต้นทุนต่อชิ้น
                    {
                      // text: 'ต้นทุน/สินค้า',
                      // colSpan: 6,
                      // alignment: 'right',
                      // style: 'tableHeader'
                    },
                    {},
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
                  if (i === 0) return 1 // เส้นบนสุดของตาราง
                  if (i === 1) return 1 // เส้นใต้ header
                  if (i === node.table.body.length) return 1 // เส้นล่างสุดของตาราง

                  // เพิ่มเส้นเหนือแถวย่อยของแต่ละกลุ่ม (top line)
                  if (
                    node.table.body[i] &&
                    node.table.body[i][0].text &&
                    node.table.body[i][0].text.toString().startsWith('ต้นทุน')
                  ) {
                    return 1
                  }

                  // เพิ่มเส้นใต้แถวย่อยของแต่ละกลุ่ม (bottom line)
                  if (
                    node.table.body[i - 1] &&
                    node.table.body[i - 1][0].text &&
                    node.table.body[i - 1][0].text.toString().startsWith('ต้นทุน')
                  ) {
                    return 1
                  }

                  return 0
                },
                vLineWidth: function () {
                  return 0
                },
                paddingLeft: function () {
                  return 2 // ลดจาก 4
                },
                paddingRight: function () {
                  return 2 // ลดจาก 4
                },
                paddingTop: function (i, node) {
                  // สำหรับ header row
                  if (i === 0) return 2 // ลดจาก 4
                  // สำหรับ row ที่เป็น group name
                  if (
                    node.table.body[i] &&
                    node.table.body[i][0].text &&
                    (node.table.body[i][0].text === 'รายการทอง' ||
                      node.table.body[i][0].text === 'รายการงานช่าง' ||
                      node.table.body[i][0].text === 'รายการเพชรและพลอย' ||
                      node.table.body[i][0].text === 'รายการเพิ่มเติม' ||
                      node.table.body[i][0].text === 'รายการฝัง')
                  ) {
                    return 4 // ลดจาก 8
                  }
                  // สำหรับ row ปกติ
                  return 1
                },
                paddingBottom: function (i, node) {
                  // สำหรับ header row
                  if (i === 0) return 2 // ลดจาก 4
                  // สำหรับ row ที่เป็น group name
                  if (
                    node.table.body[i] &&
                    node.table.body[i][0].text &&
                    (node.table.body[i][0].text === 'รายการทอง' ||
                      node.table.body[i][0].text === 'รายการงานช่าง' ||
                      node.table.body[i][0].text === 'รายการเพชรและพลอย' ||
                      node.table.body[i][0].text === 'รายการเพิ่มเติม' ||
                      node.table.body[i][0].text === 'รายการฝัง')
                  ) {
                    return 2 // ลดจาก 4
                  }
                  // สำหรับ row ปกติ
                  return 1
                },
                hLineColor: function () {
                  return '#000000'
                }
              }
            }
          ],

          styles: {
            tableHeader: {
              fontSize: 11, // ลดจาก 12
              bold: true,
              alignment: 'center',
              margin: [0, 2, 0, 2] // ลดจาก [0, 4, 0, 4]
            },
            desc: {
              fontSize: 11, // ลดจาก 12
              bold: true
            },
            title: {
              fontSize: 10
            }
          },

          defaultStyle: {
            font: 'THSarabunNew',
            fontSize: 11 // ลดจาก 12
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
