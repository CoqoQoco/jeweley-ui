import dayjs from 'dayjs'

export class BreakdownPdfBuilder {
  constructor(data, customer, invoiceDate, invoiceNo) {
    this.data = data
    this.customer = customer || {}
    this.invoiceDate = invoiceDate || dayjs().format('YYYY-MM-DD')
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: 'FAX: (+662) 2710834',
      email: 'admin@dkbangkok.com'
    }
    this.invoiceNo = invoiceNo
    this.logoBase64 = null
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
              x2: 575,
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
                  text: this.customer.address || '',
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
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
}

// This file is now deprecated as breakdown is included in the main quotation PDF.
// You may safely remove this file from the project.