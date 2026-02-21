import dayjs from 'dayjs'
import 'dayjs/locale/en'
import { initPdfMake } from '@/services/utils/pdf-make'
import { formatDecimal } from '@/services/utils/decimal.js'

export class AppraisalHistoryPdfBuilder {
  constructor(stockData, versionData) {
    this.stockData = stockData || {}
    this.versionData = versionData || {}
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Phayathai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: ' (+662) 2710834',
      email: 'info@dkbangkok.com'
    }
    this.logoBase64 = null
    this.groupOrder = {
      Gold: 1,
      Gem: 2,
      Worker: 3,
      Embed: 4,
      ETC: 5
    }
  }

  async preparePDF() {
    if (!this.logoBase64) {
      try {
        const logoPath = new URL('@/assets/duangkaew-icon.png', import.meta.url).href
        this.logoBase64 = await this.loadImageAsBase64(logoPath)
      } catch (error) {
        console.error('Failed to load logo:', error)
      }
    }
    return this
  }

  async loadImageAsBase64(path) {
    try {
      const response = await fetch(path)
      const blob = await response.blob()

      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error loading image:', error)
      return null
    }
  }

  getHeaderContent() {
    return {
      stack: [
        // Main Header
        {
          margin: [-10, -10, -10, 0],
          table: {
            widths: ['70%', '30%'],
            body: [
              [
                {
                  fillColor: '#e0e0e0',
                  stack: [
                    {
                      columns: [
                        this.logoBase64
                          ? {
                              image: this.logoBase64,
                              width: 35,
                              height: 35,
                              margin: [15, 10, 10, 0]
                            }
                          : {
                              text: 'LOGO',
                              fontSize: 14,
                              color: 'white',
                              margin: [15, 20, 10, 0]
                            },
                        {
                          stack: [
                            {
                              text: 'Duang Kaew Jewelry',
                              fontSize: 30,
                              bold: true,
                              color: '#8B0000',
                              margin: [25, 5, 0, 0]
                            },
                            {
                              text: 'The first step is always the hardest',
                              fontSize: 12,
                              color: '#8B0000',
                              margin: [25, -10, 0, 0]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  stack: [
                    {
                      text: 'APPRAISAL HISTORY',
                      fontSize: 20,
                      color: '#393939',
                      alignment: 'center',
                      margin: [0, 10, 0, 0]
                    },
                    {
                      columns: [
                        {
                          text: 'Version:',
                          fontSize: 9,
                          color: '#393939',
                          alignment: 'right',
                          width: '45%'
                        },
                        {
                          text: this.versionData.running || '',
                          fontSize: 12,
                          bold: true,
                          color: '#8B0000',
                          alignment: 'left',
                          width: '55%',
                          margin: [5, 0, 0, 0]
                        }
                      ]
                    },
                    {
                      columns: [
                        {
                          text: 'Date:',
                          fontSize: 9,
                          color: '#393939',
                          alignment: 'right',
                          width: '45%'
                        },
                        {
                          text: dayjs(this.versionData.createDate).locale('en').format('MMMM DD, YYYY'),
                          fontSize: 12,
                          bold: true,
                          color: '#8B0000',
                          alignment: 'left',
                          width: '55%',
                          margin: [5, 0, 0, 0]
                        }
                      ]
                    }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
        },

        // Horizontal line
        {
          margin: [0, 0, 0, 5],
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 675,
              y2: 0,
              lineWidth: 2,
              lineColor: '#E0E0E0'
            }
          ]
        },

        // Company info and Created by
        {
          margin: [0, 0, 0, 0],
          columns: [
            {
              width: '50%',
              stack: [
                {
                  text: 'Company: Duang Kaew Jewelry Manufacturer Co.,Ltd.',
                  fontSize: 14,
                  bold: true,
                  color: '#8B0000',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'Address: ' + (this.companyInfo.address || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'TEL: ' + (this.companyInfo.phone || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'E-Mail: ' + (this.companyInfo.email || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                }
              ]
            },
            {
              width: '50%',
              stack: [
                {
                  text: `Created By: ${this.versionData.createBy || '-'}`,
                  fontSize: 14,
                  bold: true,
                  color: '#8B0000',
                  margin: [0, 0, 0, 5]
                },
                this.versionData.remark
                  ? {
                      text: 'Remark: ' + this.versionData.remark,
                      fontSize: 10,
                      color: '#393939',
                      margin: [0, 0, 0, 0]
                    }
                  : null
              ].filter(Boolean)
            }
          ]
        },

        // Horizontal line
        {
          margin: [0, 5, 0, 5],
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 575,
              y2: 0,
              lineWidth: 2,
              lineColor: '#E0E0E0'
            }
          ]
        }
      ].filter(Boolean)
    }
  }

  getStockInfoSection() {
    return {
      margin: [0, 10, 0, 10],
      stack: [
        {
          text: 'ข้อมูลสินค้า',
          fontSize: 14,
          bold: true,
          color: '#8B0000',
          margin: [0, 0, 0, 5]
        },
        {
          columns: [
            {
              width: '33%',
              stack: [
                {
                  text: [
                    { text: 'เลขที่ผลิต: ', bold: true, fontSize: 10 },
                    { text: this.stockData.stockNumber || '-', fontSize: 10 }
                  ]
                },
                {
                  text: [
                    { text: 'รหัสสินค้า: ', bold: true, fontSize: 10 },
                    { text: this.stockData.productNumber || '-', fontSize: 10 }
                  ],
                  margin: [0, 3, 0, 0]
                }
              ]
            },
            {
              width: '33%',
              stack: [
                {
                  text: [
                    { text: 'ชื่อสินค้า (TH): ', bold: true, fontSize: 10 },
                    { text: this.stockData.productNameTh || '-', fontSize: 10 }
                  ]
                },
                {
                  text: [
                    { text: 'ชื่อสินค้า (EN): ', bold: true, fontSize: 10 },
                    { text: this.stockData.productNameEn || '-', fontSize: 10 }
                  ],
                  margin: [0, 3, 0, 0]
                }
              ]
            },
            {
              width: '34%',
              stack: [
                {
                  text: [
                    { text: 'ประเภทสินค้า: ', bold: true, fontSize: 10 },
                    { text: this.stockData.productTypeName || '-', fontSize: 10 }
                  ]
                },
                {
                  text: [
                    { text: 'W.O.: ', bold: true, fontSize: 10 },
                    {
                      text:
                        this.stockData.wo && this.stockData.woNumber
                          ? `${this.stockData.wo}-${this.stockData.woNumber}`
                          : '-',
                      fontSize: 10
                    }
                  ],
                  margin: [0, 3, 0, 0]
                }
              ]
            }
          ]
        }
      ]
    }
  }

  getCustomerInfoSection() {
    if (!this.hasCustomerInfo()) {
      return null
    }

    return {
      margin: [0, 5, 0, 10],
      stack: [
        {
          text: 'ข้อมูลลูกค้า',
          fontSize: 14,
          bold: true,
          color: '#8B0000',
          margin: [0, 0, 0, 5]
        },
        {
          columns: [
            {
              width: '33%',
              text: [
                { text: 'ชื่อลูกค้า: ', bold: true, fontSize: 10 },
                { text: this.versionData.customerName || '-', fontSize: 10 }
              ]
            },
            {
              width: '33%',
              text: [
                { text: 'รหัสลูกค้า: ', bold: true, fontSize: 10 },
                {
                  text: this.versionData.customerCode || this.versionData.customerNumber || '-',
                  fontSize: 10
                }
              ]
            },
            {
              width: '34%',
              text: [
                { text: 'เบอร์โทร: ', bold: true, fontSize: 10 },
                { text: this.versionData.customerTel || '-', fontSize: 10 }
              ]
            }
          ]
        }
      ]
    }
  }

  hasCustomerInfo() {
    return (
      this.versionData.customerCode ||
      this.versionData.customerName ||
      this.versionData.customerNumber
    )
  }

  getAppraisalTableContent() {
    const priceTransactions = this.versionData.prictransection || []

    // Sort by group
    const sortedTransactions = [...priceTransactions].sort((a, b) => {
      const orderA = this.groupOrder[a.nameGroup] || 999
      const orderB = this.groupOrder[b.nameGroup] || 999
      return orderA - orderB
    })

    // Group by nameGroup
    const groupedData = {}
    sortedTransactions.forEach((item) => {
      if (!groupedData[item.nameGroup]) {
        groupedData[item.nameGroup] = []
      }
      groupedData[item.nameGroup].push(item)
    })

    const tableBody = []

    // Header
    tableBody.push([
      this.setTableHeader('รายการ'),
      this.setTableHeader('จำนวน'),
      this.setTableHeader('ราคา/หน่วย'),
      this.setTableHeader('น้ำหนัก'),
      this.setTableHeader('ราคา/น้ำหนัก'),
      this.setTableHeader('รวม')
    ])

    // Group rows
    Object.keys(groupedData).forEach((groupName) => {
      // Group header
      tableBody.push([
        {
          text: this.getGroupLabel(groupName),
          bold: true,
          fontSize: 11,
          fillColor: '#e0e0e0',
          color: '#8B0000',
          colSpan: 6,
          margin: [5, 5, 5, 5]
        },
        {},
        {},
        {},
        {},
        {}
      ])

      // Group items
      groupedData[groupName].forEach((item) => {
        tableBody.push([
          this.setTableCell(item.nameDescription),
          this.setTableCellRight(this.formatNumber(item.qty)),
          this.setTableCellRight(this.formatCurrency(item.qtyPrice)),
          this.setTableCellRight(this.formatNumber(item.qtyWeight)),
          this.setTableCellRight(this.formatCurrency(item.qtyWeightPrice)),
          this.setTableCellRight(this.formatCurrency(item.totalPrice))
        ])
      })
    })

    // Total row
    const totalPrice = priceTransactions.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    tableBody.push([
      {
        text: 'รวมราคาทุกรายการ',
        bold: true,
        fontSize: 12,
        alignment: 'right',
        fillColor: '#8B0000',
        color: 'white',
        colSpan: 5,
        margin: [5, 5, 5, 5]
      },
      {},
      {},
      {},
      {},
      {
        text: this.formatCurrency(totalPrice),
        bold: true,
        fontSize: 12,
        alignment: 'right',
        fillColor: '#8B0000',
        color: 'white',
        margin: [5, 5, 5, 5]
      }
    ])

    return {
      margin: [0, 10, 0, 10],
      table: {
        headerRows: 1,
        widths: ['*', 70, 70, 70, 70, 80],
        body: tableBody
      },
      layout: {
        hLineWidth: function () {
          return 0.5
        },
        vLineWidth: function () {
          return 0.5
        }
      }
    }
  }

  getGroupLabel(group) {
    const labels = {
      Gold: 'รายการทอง',
      Gem: 'รายการวัถุดิบ',
      Worker: 'รายการงานช่าง',
      Embed: 'รายการงานฝัง',
      ETC: 'รายการเพิ่มเติม'
    }
    return labels[group] || group
  }

  setTableHeader(text) {
    return {
      text: text,
      bold: true,
      fontSize: 10,
      alignment: 'center',
      fillColor: '#8B0000',
      color: 'white',
      margin: [5, 5, 5, 5]
    }
  }

  setTableCell(text) {
    return {
      text: text || '',
      fontSize: 10,
      margin: [5, 5, 5, 5]
    }
  }

  setTableCellRight(text) {
    return {
      text: text || '',
      fontSize: 10,
      alignment: 'right',
      margin: [5, 5, 5, 5]
    }
  }

  formatCurrency(value) {
    if (value === null || value === undefined || value === '') return '-'
    return formatDecimal(Number(value), 2)
  }

  formatNumber(value) {
    if (value === null || value === undefined || value === '') return '-'
    return formatDecimal(Number(value), 2)
  }

  getDocDefinition() {
    const content = [
      this.getHeaderContent(),
      this.getStockInfoSection(),
      this.getCustomerInfoSection(),
      this.getAppraisalTableContent()
    ].filter(Boolean)

    return {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      content: content,
      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              text: `Printed: ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`,
              alignment: 'left',
              fontSize: 9,
              margin: [40, 10, 0, 0]
            },
            {
              text: currentPage.toString() + ' / ' + pageCount,
              alignment: 'right',
              fontSize: 9,
              margin: [0, 10, 40, 0]
            }
          ]
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 12
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        }
      }
    }
  }

  async generatePDF() {
    try {
      await this.preparePDF()
      const pdfMake = initPdfMake()
      const docDefinition = this.getDocDefinition()
      return pdfMake.createPdf(docDefinition)
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }
}
