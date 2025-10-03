import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'

export class InvoicePdfBuilder {
  constructor(
    data,
    customer,
    invoiceDate,
    saleOrderData,
    currencyUnit,
    currencyRate,
    invoiceNo
  ) {
    this.data = data // ข้อมูลสินค้าที่เลือก
    this.customer = customer || {}
    this.saleOrderData = saleOrderData || {}
    this.invoiceDate = invoiceDate || dayjs().format('DD/MM/YYYY')
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: 'FAX: (+662) 2710834',
      email: 'admin@dkbangkok.com'
    }
    this.invoiceNo = invoiceNo || this.generateInvoiceNumber()
    this.logoBase64 = null
    this.currencyUnit = currencyUnit || 'THB'
    this.currencyRate = Number(currencyRate) || 1

    // Calculate totals
    this.subtotal = this.calculateSubtotal()
    this.totalAmount = this.subtotal
  }

  generateInvoiceNumber() {
    const now = dayjs()
    const dateStr = now.format('YYYYMMDD')
    const timeStr = now.format('HHmmss')
    return `INV${dateStr}${timeStr}`
  }

  calculateSubtotal() {
    let total = 0
    if (this.data && Array.isArray(this.data)) {
      this.data.forEach((item) => {
        const appraisalPrice = Number(item.appraisalPrice) || 0
        const qty = Number(item.qty) || 0
        const convertedPrice = appraisalPrice / this.currencyRate
        total += convertedPrice * qty
      })
    }
    return total
  }

  roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  async generatePDF() {
    await initPdfMake()

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      
      content: [
        // Header
        {
          table: {
            widths: ['*', 100],
            body: [
              [
                {
                  stack: [
                    {
                      text: this.companyInfo.name,
                      style: 'companyName'
                    },
                    {
                      text: this.companyInfo.address,
                      style: 'companyAddress'
                    },
                    {
                      text: `${this.companyInfo.phone} ${this.companyInfo.fax}`,
                      style: 'companyContact'
                    },
                    {
                      text: this.companyInfo.email,
                      style: 'companyEmail'
                    }
                  ]
                },
                {
                  text: 'INVOICE',
                  style: 'invoiceTitle',
                  alignment: 'right'
                }
              ]
            ]
          },
          layout: 'noBorders'
        },

        { text: '', margin: [0, 20] },

        // Invoice Info and Customer Info
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  stack: [
                    {
                      text: 'Invoice Information',
                      style: 'sectionHeader'
                    },
                    {
                      table: {
                        widths: [80, '*'],
                        body: [
                          ['Invoice No:', this.invoiceNo],
                          ['Invoice Date:', this.invoiceDate],
                          ['SO Number:', this.saleOrderData.soNumber || '-'],
                          ['Currency:', this.currencyUnit]
                        ]
                      },
                      layout: 'noBorders',
                      style: 'infoTable'
                    }
                  ]
                },
                {
                  stack: [
                    {
                      text: 'Bill To',
                      style: 'sectionHeader'
                    },
                    {
                      text: this.customer.name || '',
                      style: 'customerName'
                    },
                    {
                      text: this.customer.address || '',
                      style: 'customerAddress'
                    },
                    {
                      text: this.customer.phone || '',
                      style: 'customerContact'
                    },
                    {
                      text: this.customer.email || '',
                      style: 'customerContact'
                    }
                  ]
                }
              ]
            ]
          },
          layout: 'noBorders'
        },

        { text: '', margin: [0, 20] },

        // Items Table
        {
          text: 'Invoice Items',
          style: 'sectionHeader'
        },

        { text: '', margin: [0, 10] },

        {
          table: {
            headerRows: 1,
            widths: [30, 80, 80, '*', 40, 60, 80],
            body: [
              [
                { text: '#', style: 'tableHeader' },
                { text: 'Stock No.', style: 'tableHeader' },
                { text: 'Product No.', style: 'tableHeader' },
                { text: 'Description', style: 'tableHeader' },
                { text: 'Qty', style: 'tableHeader' },
                { text: 'Price', style: 'tableHeader' },
                { text: 'Amount', style: 'tableHeader' }
              ],
              ...this.generateItemRows()
            ]
          },
          layout: {
            fillColor: function (rowIndex) {
              return rowIndex === 0 ? '#f8f9fa' : null
            }
          }
        },

        { text: '', margin: [0, 20] },

        // Total Section
        {
          table: {
            widths: ['*', 120, 80],
            body: [
              [
                '',
                { text: 'Subtotal:', style: 'totalLabel' },
                { text: this.formatCurrency(this.subtotal) + ` ${this.currencyUnit}`, style: 'totalAmount' }
              ],
              [
                '',
                { text: 'Total:', style: 'totalLabelFinal' },
                { text: this.formatCurrency(this.totalAmount) + ` ${this.currencyUnit}`, style: 'totalAmountFinal' }
              ]
            ]
          },
          layout: 'noBorders'
        },

        { text: '', margin: [0, 30] },

        // Footer
        {
          text: 'Thank you for your business!',
          style: 'footer',
          alignment: 'center'
        }
      ],

      styles: {
        companyName: {
          fontSize: 16,
          bold: true,
          color: '#2c3e50'
        },
        companyAddress: {
          fontSize: 10,
          color: '#666'
        },
        companyContact: {
          fontSize: 10,
          color: '#666'
        },
        companyEmail: {
          fontSize: 10,
          color: '#666'
        },
        invoiceTitle: {
          fontSize: 24,
          bold: true,
          color: '#e74c3c'
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          color: '#2c3e50',
          margin: [0, 0, 0, 5]
        },
        infoTable: {
          fontSize: 10
        },
        customerName: {
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 3]
        },
        customerAddress: {
          fontSize: 10,
          color: '#666',
          margin: [0, 0, 0, 2]
        },
        customerContact: {
          fontSize: 10,
          color: '#666',
          margin: [0, 0, 0, 2]
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          margin: [0, 5, 0, 5]
        },
        tableCell: {
          fontSize: 9,
          margin: [0, 3, 0, 3]
        },
        tableCellCenter: {
          fontSize: 9,
          alignment: 'center',
          margin: [0, 3, 0, 3]
        },
        tableCellRight: {
          fontSize: 9,
          alignment: 'right',
          margin: [0, 3, 0, 3]
        },
        totalLabel: {
          fontSize: 10,
          bold: true,
          alignment: 'right',
          margin: [0, 5, 5, 5]
        },
        totalAmount: {
          fontSize: 10,
          alignment: 'right',
          margin: [0, 5, 0, 5]
        },
        totalLabelFinal: {
          fontSize: 12,
          bold: true,
          alignment: 'right',
          margin: [0, 10, 5, 5],
          color: '#e74c3c'
        },
        totalAmountFinal: {
          fontSize: 12,
          bold: true,
          alignment: 'right',
          margin: [0, 10, 0, 5],
          color: '#e74c3c'
        },
        footer: {
          fontSize: 12,
          italic: true,
          color: '#666'
        }
      }
    }

    return docDefinition
  }

  generateItemRows() {
    const rows = []
    
    if (this.data && Array.isArray(this.data)) {
      this.data.forEach((item, index) => {
        const appraisalPrice = Number(item.appraisalPrice) || 0
        const qty = Number(item.qty) || 0
        const convertedPrice = this.roundToTwo(appraisalPrice / this.currencyRate)
        const amount = this.roundToTwo(convertedPrice * qty)

        rows.push([
          { text: (index + 1).toString(), style: 'tableCellCenter' },
          { text: item.stockNumber || '-', style: 'tableCell' },
          { text: item.productNumber || '-', style: 'tableCell' },
          { text: item.description || '-', style: 'tableCell' },
          { text: qty.toString(), style: 'tableCellCenter' },
          { text: this.formatCurrency(convertedPrice), style: 'tableCellRight' },
          { text: this.formatCurrency(amount), style: 'tableCellRight' }
        ])
      })
    }

    return rows
  }

  async downloadPDF() {
    const docDefinition = await this.generatePDF()
    const pdfMake = window.pdfMake
    
    return new Promise((resolve, reject) => {
      try {
        pdfMake.createPdf(docDefinition).download(`Invoice_${this.invoiceNo}.pdf`)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  async openPDF() {
    const docDefinition = await this.generatePDF()
    const pdfMake = window.pdfMake
    
    return new Promise((resolve, reject) => {
      try {
        pdfMake.createPdf(docDefinition).open()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}