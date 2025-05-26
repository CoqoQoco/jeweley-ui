import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'

export class BreakdownPdfBuilder {
  constructor({ items, customer, invoiceDate, invoiceNo, currencyUnit, currencyMultiplier }) {
    this.data = items || []
    this.customer = customer || {}
    this.invoiceDate = invoiceDate || dayjs().format('YYYY-MM-DD')
    this.invoiceNo = invoiceNo
    this.currencyUnit = currencyUnit || 'THB'
    this.currencyMultiplier = Number(currencyMultiplier) || 1
    this.logoBase64 = null
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: 'FAX: (+662) 2710834',
      email: 'admin@dkbangkok.com'
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

  getBreakdownDocDefinition() {
    const breakdownHeader = {
      stack: [
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
                      text: 'BREAKDOWN',
                      fontSize: 20,
                      color: '#393939',
                      alignment: 'center',
                      margin: [0, 10, 0, 0]
                    },
                    {
                      columns: [
                        {
                          text: 'No.:',
                          fontSize: 9,
                          color: '#393939',
                          alignment: 'right',
                          width: '45%'
                        },
                        {
                          text: this.invoiceNo || '',
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
                          text: dayjs(this.invoiceDate).format('MMM DD, YYYY'),
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
        {
          margin: [0, 0, 0, 5],
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 955,
              y2: 0,
              lineWidth: 2,
              lineColor: '#E0E0E0'
            }
          ]
        },
        {
          margin: [0, 0, 0, 0],
          columns: [
            {
              width: '50%',
              stack: [
                {
                  text: 'Form: Duang Kaew Jewelry Manufacturer Co.,Ltd.',
                  fontSize: 14,
                  bold: true,
                  color: '#8B0000',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: this.companyInfo.address || '',
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
                  text: 'FAX: ' + (this.companyInfo.fax || ''),
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
                  text: `Consigned To: ${this.customer.name || ''}`,
                  fontSize: 14,
                  bold: true,
                  color: '#8B0000',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'Address: ' + (this.customer.address || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                // เพิ่ม ardders (ถ้ามี)
                this.customer.ardders
                  ? {
                      text: this.customer.ardders,
                      fontSize: 10,
                      color: '#393939',
                      margin: [0, 0, 0, 0]
                    }
                  : null,
                {
                  text: 'TEl: ' + (this.customer.tel || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                { text: 'E-mail: ' + (this.customer.email || ''), fontSize: 10, color: '#393939' }
              ]
            }
          ]
        },
        this.customer.remark
          ? {
              margin: [0, 5, 0, 0],
              text: 'Note: ' + this.customer.remark,
              fontSize: 10,
              color: '#0000FF'
            }
          : null,
        {
          margin: [0, 5, 0, 5],
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 975,
              y2: 0,
              lineWidth: 2,
              lineColor: '#E0E0E0'
            }
          ]
        }
      ].filter(Boolean)
    }

    const tableHeader = [
      { text: 'No.', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Style/Product', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Type', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Description', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Qty', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Price/Qty', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Weight', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Price/Weight', style: 'summaryLabelColored', alignment: 'center' },
      {
        text: `Price/Unit (${this.currencyUnit})`,
        style: 'summaryLabelColored',
        alignment: 'center'
      },
      { text: 'Qty (product)', style: 'summaryLabelColored', alignment: 'center' },
      { text: `Total (${this.currencyUnit})`, style: 'summaryLabelColored', alignment: 'center' }
    ]

    const body = [tableHeader]
    let rowIndex = 1

    console.log('Generating breakdown PDF with data:', this.data)
    ;(this.data || []).forEach((item) => {
      const planQty = Number(item.planQty || item.qty || 1)
      const priceTransactions = Array.isArray(item.priceTransactions) ? item.priceTransactions : []
      const goldList = priceTransactions.filter((t) => (t.nameGroup || '').toLowerCase() === 'gold')
      const gemList = priceTransactions.filter((t) => (t.nameGroup || '').toLowerCase() === 'gem')
      const etcList = priceTransactions.filter((t) => {
        const group = (t.nameGroup || '').toLowerCase()
        return (
          group !== 'gold' &&
          group !== 'setting' &&
          group !== 'worker' &&
          group !== 'gem' &&
          group !== 'embed'
        )
      })
      const workList = priceTransactions.filter(
        (t) => (t.nameGroup || '').toLowerCase() === 'worker'
      )
      const embedList = priceTransactions.filter(
        (t) => (t.nameGroup || '').toLowerCase() === 'embed'
      )
      const totalRows =
        goldList.length +
        gemList.length +
        etcList.length +
        (workList.length ? 1 : 0) +
        (embedList.length ? 1 : 0)
      let currentRow = 0
      goldList.forEach((gold, idx) => {
        body.push([
          currentRow === 0 ? { text: rowIndex, alignment: 'center', rowSpan: totalRows } : {},
          currentRow === 0
            ? {
                text: item.stockNumber || item.productNumber || '',
                alignment: 'center',
                rowSpan: totalRows
              }
            : {},
          { text: 'Gold', alignment: 'center', rowSpan: idx === 0 ? goldList.length : undefined },
          { text: gold.name || '-', alignment: 'left' },
          { text: gold.qty ? this.formatPrice(gold.qty) : '', alignment: 'center' },
          { text: gold.qtyPrice ? this.formatPrice(gold.qtyPrice) : '', alignment: 'center' },
          { text: gold.qtyWeight ? this.formatPrice(gold.qtyWeight) : '', alignment: 'center' },
          {
            text: gold.qtyWeightPrice ? this.formatPrice(gold.qtyWeightPrice) : '',
            alignment: 'center'
          },
          {
            text: this.formatPrice((gold.totalPrice || 0) * this.currencyMultiplier),
            alignment: 'right'
          },
          { text: item.qty || 1, alignment: 'center' },
          {
            text: this.formatPrice(
              (gold.totalPrice || 0) * this.currencyMultiplier * (item.qty || 1)
            ),
            alignment: 'right'
          }
        ])
        currentRow++
      })

      gemList.forEach((gem, idx) => {
        body.push([
          {},
          {},
          idx === 0
            ? { text: 'Diamond / C. Stone', alignment: 'center', rowSpan: gemList.length }
            : {},
          { text: gem.name || '-', alignment: 'left' },
          { text: gem.qty ? this.formatPrice(gem.qty) : '', alignment: 'center' },
          { text: gem.qtyPrice ? this.formatPrice(gem.qtyPrice) : '', alignment: 'center' },
          { text: gem.qtyWeight ? this.formatPrice(gem.qtyWeight) : '', alignment: 'center' },
          {
            text: gem.qtyWeightPrice ? this.formatPrice(gem.qtyWeightPrice) : '',
            alignment: 'center'
          },
          {
            text: this.formatPrice((gem.totalPrice || 0) * this.currencyMultiplier),
            alignment: 'right'
          },
          { text: item.qty || 1, alignment: 'center' },
          {
            text: this.formatPrice(
              (gem.totalPrice || 0) * this.currencyMultiplier * (item.qty || 1)
            ),
            alignment: 'right'
          }
        ])
        currentRow++
      })

      if (workList.length) {
        const sumWork = workList.reduce((sum, t) => sum + Number(t.totalPrice || 0), 0)
        body.push([
          {},
          {},
          { text: 'Labor', alignment: 'center' },
          { text: '-', alignment: 'left' },
          { text: '1', alignment: 'center' },
          { text: '', alignment: 'center' },
          { text: '', alignment: 'center' },
          { text: '', alignment: 'center' },
          { text: this.formatPrice(sumWork * this.currencyMultiplier), alignment: 'right' },
          { text: item.qty || 1, alignment: 'center' },
          {
            text: this.formatPrice(sumWork * this.currencyMultiplier * (item.qty || 1)),
            alignment: 'right'
          }
        ])
        currentRow++
      }

      if (embedList.length) {
        const sumEmbed = embedList.reduce((sum, t) => sum + Number(t.totalPrice || 0), 0)
        body.push([
          {},
          {},
          { text: 'Setting', alignment: 'center' },
          { text: '-', alignment: 'left' },
          { text: '1', alignment: 'center' },
          { text: '', alignment: 'center' },
          { text: '', alignment: 'center' },
          { text: '', alignment: 'center' },
          { text: this.formatPrice(sumEmbed * this.currencyMultiplier), alignment: 'right' },
          { text: item.qty || 1, alignment: 'center' },
          {
            text: this.formatPrice(sumEmbed * this.currencyMultiplier * (item.qty || 1)),
            alignment: 'right'
          }
        ])
        currentRow++
      }
      etcList.forEach((etc, idx) => {
        body.push([
          {},
          {},
          idx === 0 ? { text: 'Etc', alignment: 'center', rowSpan: etcList.length } : {},
          { text: etc.name || '-', alignment: 'left' },
          { text: etc.qty ? this.formatPrice(etc.qty) : '', alignment: 'center' },
          { text: etc.qtyPrice ? this.formatPrice(etc.qtyPrice) : '', alignment: 'center' },
          { text: etc.qtyWeight ? this.formatPrice(etc.qtyWeight) : '', alignment: 'center' },
          {
            text: etc.qtyWeightPrice ? this.formatPrice(etc.qtyWeightPrice) : '',
            alignment: 'center'
          },
          {
            text: this.formatPrice((etc.totalPrice || 0) * this.currencyMultiplier),
            alignment: 'right'
          },
          { text: item.qty || 1, alignment: 'center' },
          {
            text: this.formatPrice(
              (etc.totalPrice || 0) * this.currencyMultiplier * (item.qty || 1)
            ),
            alignment: 'right'
          }
        ])
        currentRow++
      })

      // ...existing code above...
      // รวมราคาทั้งหมดแบบถูกต้อง (แต่ละรายการต้อง * currencyMultiplier * item.qty)
      const totalGold = goldList.reduce(
        (sum, t) => sum + Number(t.totalPrice || 0) * this.currencyMultiplier * (item.qty || 1),
        0
      )
      const totalGem = gemList.reduce(
        (sum, t) => sum + Number(t.totalPrice || 0) * this.currencyMultiplier * (item.qty || 1),
        0
      )
      const totalEtc = etcList.reduce(
        (sum, t) => sum + Number(t.totalPrice || 0) * this.currencyMultiplier * (item.qty || 1),
        0
      )
      const totalWork = workList.length
        ? workList.reduce((sum, t) => sum + Number(t.totalPrice || 0), 0) *
          this.currencyMultiplier *
          (item.qty || 1)
        : 0
      const totalEmbed = embedList.length
        ? embedList.reduce((sum, t) => sum + Number(t.totalPrice || 0), 0) *
          this.currencyMultiplier *
          (item.qty || 1)
        : 0

      const totalItemPrice = totalGold + totalGem + totalEtc + totalWork + totalEmbed
      // ...existing code below...

      body.push([
        {
          text: `Total of ${item.productNumber} `,
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          colSpan: 10
        },
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {
          text: this.formatPrice(totalItemPrice * this.currencyMultiplier),
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          bold: true
        }
      ])
      rowIndex++
    })
    return {
      pageOrientation: 'landscape',
      pageSize: 'A4',
      pageMargins: [10, 10, 10, 40],
      content: [
        breakdownHeader,
        {
          margin: [0, 10, 0, 0],
          table: {
            headerRows: 1,
            widths: [20, 50, 50, '*', 40, 40, 40, 40, 60, 40, 60],
            body
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
      ],
      footer: function (currentPage, pageCount) {
        return {
          text: currentPage.toString() + ' / ' + pageCount,
          alignment: 'center',
          margin: [0, 10, 0, 0]
        }
      },
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 10
      },
      styles: {
        summaryLabelColored: {
          fontSize: 10,
          bold: true,
          color: 'white',
          fillColor: '#8B0000'
        },
        totalSummaryLabelColored: {
          fontSize: 10,
          bold: true,
          color: '#8B0000',
          fillColor: '#e0e0e0'
        }
      }
    }
  }

  formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) return '0.00'
    return price.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  async generatePDF() {
    await this.preparePDF()
    const pdfMake = (await import('@/services/utils/pdf-make')).initPdfMake()
    const docDefinition = this.getBreakdownDocDefinition()
    return pdfMake.createPdf(docDefinition)
  }
}
