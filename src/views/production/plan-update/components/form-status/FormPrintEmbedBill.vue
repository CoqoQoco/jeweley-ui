<template>
  <div class="form-container">
    <modal :showModal="isShow" @closeModal="onCloseModal" width="350px">
      <template v-slot:content>
        <div class="mb-3">
          <span class="txt-title-modal-no-padding">เลือกข้อมูลพิมพ์สลิป</span>
        </div>
        <div class="btn-gold-wrapper">
          <div v-for="(data, index) in groupGold" :key="index">
            <div class="btn-gold" @click="generatePDF(data)">{{ data.gold }}</div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'

const modal = defineAsyncComponent(() => import('@/components/modal/ModalView.vue'))

import dayjs from 'dayjs'
import pdfMake from 'pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'

import { formatDate } from '@/services/utils/dayjs'
import api from '@/axios/axios-config.js'

export default {
  components: {
    modal
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Object,
      required: true,
      default: () => {}
    },
    modelValueStatus: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  watch: {
    // modelValueStatus(value) {
    //   console.log(value)
    // }
  },
  computed: {
    groupGold() {
      //console.log(this.modelValueStatus)

      const groupedData = this.modelValueStatus.tbtProductionPlanStatusDetail.reduce(
        (groups, item) => {
          //console.log(groups)
          //console.log(item)
          const group = groups.find((g) => g.gold === item.gold)

          if (group) {
            group.values.push(item)
          } else {
            groups.push({ gold: item.gold, values: [item] })
          }

          return groups
        },
        []
      )
      //console.log(groupedData)
      return groupedData
    }
  },
  data() {
    return {
      // --- img --- //
      urlImage: null
    }
  },
  methods: {
    // --- controller --- //
    onCloseModal() {
      this.$emit('closeModal')
    },
    onConsoleLog() {
      console.log(this.groupGold)
    },
    formatDate(date) {
      //console.log(date)
      return date ? formatDate(date) : null
    },
    // --- APIs --- //
    async fetchIamge() {
      try {
        //console.log(this.modelValue)
        const param = {
          imageName: `${this.modelValue.mold}-Mold.png`
        }

        const res = await api.jewelry.get('FileExtension/GetMoldImage', param)
        this.urlImage = `data:image/png;base64,${res}`
        //console.log(this.urlImage)
      } catch (error) {
        console.log(error)
        return null
      }
    },

    // --- table --- //
    tablePrice(data) {
      return {
        fontSize: 13,
        //bold: true,
        margin: [5, 10, 0, 0],
        table: {
          headerRows: 1,
          widths: ['*', 50, 50, 50, 70, 70],
          body: this.buildTablePriceBody(data),
          layout: {
            defaultBorder: false
          }
        }
      }
    },

    buildTablePriceBody(data) {
      //console.log(data)
      let body = []
      //const title = ['รายละเอียด', 'น้ำหนักรับ', 'จำนวน', 'ราคาต่อหน่วย', 'ราคา']
      const title = [
        this.setTablePriceTitle('รายละเอียด'),
        this.setTablePriceTitleTextRight('น้ำหนักจ่าย'),
        this.setTablePriceTitleTextRight('น้ำหนักรับ'),
        this.setTablePriceTitleTextRight('จำนวนหน่วย'),
        this.setTablePriceTitleTextRight('ราคาต่อหน่วย'),
        this.setTablePriceTitleTextRight('ราคา')
      ]

      //title
      body.push(title)

      //body
      let total = 0
      data.values.forEach((item) => {
        total += item.totalWages
        const row = [
          this.setTablePriceRow(`${item.description ?? ''} [${item.worker ?? ''}]`),
          this.setTablePriceRowTextRight(item.goldWeightSend),
          this.setTablePriceRowTextRight(item.goldWeightCheck),
          this.setTablePriceRowTextRight(item.goldQtyCheck),
          this.setTablePriceRowTextRight(
            item.wages ? Number(item.wages).toFixed(2).toLocaleString() : '0.00'
          ),
          this.setTablePriceRowTextRight(
            item.totalWages ? Number(item.totalWages).toFixed(2).toLocaleString() : '0.00'
          )
        ]
        body.push(row)
      })

      //footer
      const footer = [
        this.setTablePriceFooter(''),
        this.setTablePriceFooter(''),
        this.setTablePriceFooter(''),
        this.setTablePriceFooter(''),
        this.setTablePriceFooterTextRight('รวมราคา'),
        this.setTablePriceFooterTextRight(
          total ? Number(total).toFixed(2).toLocaleString() : '0.00'
        )
      ]
      body.push(footer)

      return body
    },
    setTablePriceTitle(text) {
      return {
        text: text,
        bold: true,
        border: [false, false, false, true]
      }
    },
    setTablePriceTitleTextRight(text) {
      return {
        text: text,
        bold: true,
        alignment: 'right',
        border: [false, false, false, true]
      }
    },
    setTablePriceRow(text) {
      return {
        text: text,
        border: [false, false, false, false]
      }
    },
    setTablePriceRowTextRight(text) {
      return {
        text: text,
        alignment: 'right',
        border: [false, false, false, false]
      }
    },
    setTablePriceFooter(text) {
      return {
        text: text,
        bold: true,
        border: [false, true, false, false]
      }
    },
    setTablePriceFooterTextRight(text) {
      return {
        text: text,
        bold: true,
        alignment: 'right',
        border: [false, true, false, false]
      }
    },

    // --- PDF --- //
    async generatePDF(data) {
      //const dataValue = data.values[0]
      console.log(data)
      //console.log(this.modelValue)
      //console.log(this.modelValueStatus)

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
          //pageSize: 'FOLIO',
          //pageSize: { width: 648, height: 396 },
          // pageSize: {
          //   width: 400,
          //   height: 'auto'
          // },
          pageMargins: [20, 20, 20, 10],
          content: [
            // --- header --- //
            {
              columns: [
                'บริษัท ดวงเเก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
                { text: 'สลิปจ่ายฝัง', alignment: 'right' }
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
                        `วัตถุดิบ : ${data.gold}`,
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

            // --- data --- //
            {
              table: {
                widths: [80, '*'],
                body: [
                  //row 1
                  [
                    //image
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
                                  //border: [true, true, true, false],
                                  alignment: 'center',
                                  margin: [0, 4, 0, 4]
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

                    //data
                    {
                      table: {
                        widths: ['*', '*', 80, 80],
                        body: [
                          //row 1
                          [
                            //wo
                            {
                              margin: [10, 0, 0, 0],
                              stack: [
                                { text: 'เลขที่ W.O.', style: 'title' },
                                {
                                  text: `${this.modelValue.wo} - ${this.modelValue.woNumber}`,
                                  style: 'desc'
                                }
                              ]
                            },

                            //สินค้า
                            {
                              margin: [30, 0, 0, 0],
                              stack: [
                                { text: 'สินค้า', style: 'title' },
                                {
                                  text: `${this.modelValue.productNumber} - ${this.modelValue.productName}`,
                                  style: 'desc'
                                }
                              ]
                            },

                            //ผู้รับงาน
                            {
                              stack: [
                                { text: 'ผู้รับงาน', style: 'title' },
                                {
                                  text: this.modelValueStatus.checkName,
                                  style: 'desc'
                                }
                              ]
                            },

                            //รับวันที่
                            {
                              stack: [
                                { text: 'วันที่รับงาน', style: 'title' },
                                {
                                  text: formatDate(this.modelValueStatus.checkDate),
                                  style: 'desc'
                                }
                              ]
                            }
                          ],
                          [
                            {
                              colSpan: 4,
                              stack: [this.tablePrice(data)]
                            },
                            {},
                            {},
                            {}
                          ]
                        ]
                      },
                      layout: {
                        defaultBorder: false
                      },
                      margin: [0, 0, 0, 0]
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false
              },
              margin: [0, 0, 0, 0]
            },

            //underline
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      stack: [
                        null,
                        {
                          text: '',
                          style: 'desc'
                        }
                      ],
                      border: [false, false, false, true]
                    }
                  ]
                ]
              },
              layout: {
                defaultBorder: false
              },
              margin: [0, 0, 0, 0]
            },

            {
              table: {
                widths: ['*', 120, 10, 120],
                body: [
                  [
                    {
                      stack: [{ text: 'หมายเหตุ', style: 'boldText' }]
                    },
                    {
                      stack: [{ text: 'ผู้รับ', style: 'boldText' }]
                    },
                    {},
                    {
                      stack: [{ text: 'ผู้ส่ง', style: 'boldText' }]
                    }
                  ],
                  [
                    {
                      stack: [{ text: '', style: 'boldText' }]
                    },
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
          ],
          defaultStyle: {
            font: 'THSarabunNew'
          },
          styles: {
            title: {
              fontSize: 10
            },
            desc: {
              fontSize: 13,
              bold: true
            },
            boldText: {
              //fontSize: 15,
              bold: true
            }
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

<style lang="scss" scoped>
@import '@/assets/scss/custom-style/form-modal.scss';
.btn-gold-wrapper {
  display: grid;
  place-items: center;
  grid-template-columns: repeat(auto-fit, minmax(min(7rem, 100%), 1fr));
  grid-gap: 1rem;

  //   display: flex;
  //   flex-wrap: wrap;
  //   gap: 1rem; /* หรือค่าที่คุณต้องการ */
}
.btn-gold {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  width: 150px;
  border: 1px solid var(--secondary);
  background-color: var(--base-color);
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  transition:
    background-color 0.3s,
    border-color 0.3s;
}
.btn-gold:hover {
  background-color: var(--warning); /* เปลี่ยนสีพื้นหลังเมื่อโฮเวอร์ */
  border-color: var(--base-font-color); /* เปลี่ยนสีขอบเมื่อโฮเวอร์ */
  cursor: pointer; /* เปลี่ยนเป็นเคอร์เซอร์เมื่อโฮเวอร์ */
}
</style>
