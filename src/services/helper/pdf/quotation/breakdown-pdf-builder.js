import dayjs from 'dayjs'
import 'dayjs/locale/en'
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'

export class BreakdownPdfBuilder {
  constructor({
    items,
    customer,
    invoiceDate,
    invoiceNo,
    currencyUnit,
    currencyMultiplier,
    profitPercent,
    goldLossPercent,
    settingDiamondRate,
    settingStoneRate
  }) {
    this.data = items || []
    this.customer = customer || {}
    this.invoiceDate = invoiceDate || dayjs().format('YYYY-MM-DD')
    this.invoiceNo = invoiceNo
    this.currencyUnit = currencyUnit || 'THB'
    this.currencyMultiplier = Number(currencyMultiplier) || 1
    this.profitPercent = Number(profitPercent) || 15
    this.goldLossPercent = Number(goldLossPercent ?? 12)
    this.settingDiamondRate = Number(settingDiamondRate ?? 15)
    this.settingStoneRate = Number(settingStoneRate ?? 25)
    this.goldPerOz = customer.goldPerOz || 0
    // fallback ไป goldPerOz รองรับใบเสนอราคาเก่าที่ยังไม่ได้บันทึกราคา spot
    this.goldSpotPrice = customer.goldSpotPrice || customer.goldPerOz || 0
    this.logoBase64 = null
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: ' (+662) 2710834',
      email: 'info@dkbkk.com'
    }
  }

  async prepareImages() {
    if (!this.data || !Array.isArray(this.data)) return
    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')
    await Promise.all(
      this.data.map(async (item) => {
        if (item.imageBase64) return
        const blobPath = item.imageBlobPath || item.imagePath
        if (!blobPath) return
        const base64Image = await getAzureBlobAsBase64(blobPath, 'stock')
        if (base64Image && base64Image.length > 0) {
          item.imageBase64 = base64Image
        }
      })
    )
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
    await this.prepareImages()
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
                          text: dayjs(this.invoiceDate).locale('en').format('MMMM DD, YYYY'),
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
                          text: 'Gold Spot:',
                          fontSize: 9,
                          color: '#393939',
                          alignment: 'right',
                          width: '45%'
                        },
                        {
                          text: this.goldSpotPrice ? `$${this.formatPrice(this.goldSpotPrice)} /Oz.` : '-',
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
                // {
                //   text: this.goldPerOz
                //     ? `Gold Price Per Oz: ${this.formatPrice(this.goldPerOz)}`
                //     : '',
                //   fontSize: 10,
                //   color: '#393939',
                //   margin: [0, 0, 0, 0]
                // }
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

                {
                  text: 'TEl: ' + (this.customer.tel || ''),
                  fontSize: 10,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                { text: 'E-mail: ' + (this.customer.email || ''), fontSize: 10, color: '#393939' },
                {
                  text: this.goldSpotPrice
                    ? `Gold Spot: US$  ${this.formatPrice(this.goldSpotPrice)} /Oz.`
                    : '',
                  fontSize: 10,
                  color: '#393939',
                  bold: true,
                  margin: [0, 0, 0, 0]
                }
              ]
            }
          ]
        },

        // this.customer.remark
        //   ? {
        //       margin: [0, 5, 0, 0],
        //       text: 'Note: ' + this.customer.remark,
        //       fontSize: 10,
        //       color: '#0000FF'
        //     }
        //   : null,
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
      { text: 'Image', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'QTY.', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Style/Product', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Type', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Description', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Qty', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Price/Qty', style: 'summaryLabelColored', alignment: 'center' },
      { text: 'Weight', style: 'summaryLabelColored', alignment: 'center' },
      {
        text: `Net Weight with Gold Loss ${this.goldLossPercent}%`,
        style: 'summaryLabelColored',
        alignment: 'center'
      },
      { text: 'Price/Weight', style: 'summaryLabelColored', alignment: 'center' },
      {
        text: `Price/Unit (${this.currencyUnit})`,
        style: 'summaryLabelColored',
        alignment: 'center'
      }
    ]

    const body = [tableHeader]
    let rowIndex = 1

    console.log('Generating breakdown PDF with data:', this.data)
    ;(this.data || []).forEach((item) => {
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

      console.log('currencyMultiplier:', this.currencyMultiplier)

      const workList = priceTransactions.filter(
        (t) => (t.nameGroup || '').toLowerCase() === 'worker'
      )
      const embedList = priceTransactions.filter(
        (t) => (t.nameGroup || '').toLowerCase() === 'embed'
      )

      const materials = Array.isArray(item.materials) ? item.materials : []
      const diamondCount = materials
        .filter((m) => m.type === 'Diamond')
        .reduce((sum, m) => sum + (Number(m.qty) || 0), 0)
      const stoneCount = materials
        .filter((m) => m.type === 'Gem')
        .reduce((sum, m) => sum + (Number(m.qty) || 0), 0)
      const useNewSettingRows = materials.length > 0 && (diamondCount > 0 || stoneCount > 0)
      const settingRowCount = useNewSettingRows
        ? (diamondCount > 0 ? 1 : 0) + (stoneCount > 0 ? 1 : 0)
        : embedList.length

      const totalRows =
        goldList.length +
        gemList.length +
        etcList.length +
        (workList.length ? 1 : 0) +
        settingRowCount
      let currentRow = 0
      goldList.forEach((gold, idx) => {
        const qtyWeight = Number(gold.qtyWeight) || 0
        const goldLossWeight = qtyWeight * (1 + this.goldLossPercent / 100)
        const priceUnit =
          ((Number(gold.qty) || 0) * (Number(gold.qtyPrice) || 0) +
            goldLossWeight * (Number(gold.qtyWeightPrice) || 0)) /
          (this.currencyMultiplier || 1)
        body.push([
          currentRow === 0 ? { text: rowIndex, alignment: 'center', rowSpan: totalRows } : {},
          currentRow === 0
            ? { ...this.setImageCell(item.imageBase64), rowSpan: totalRows }
            : {},
          currentRow === 0
            ? { text: this.formatQty(item.qty || 1), alignment: 'center', rowSpan: totalRows }
            : {},
          currentRow === 0
            ? {
                text: item.productNumber || item.stockNumberOrigin || item.stockNumber || '',
                alignment: 'center',
                rowSpan: totalRows
              }
            : {},
          { text: 'Gold', alignment: 'center', rowSpan: idx === 0 ? goldList.length : undefined },
          { text: gold.nameDescription || '-', alignment: 'left' },
          { text: '', alignment: 'center' },
          {
            text: gold.qtyPrice
              ? this.formatPrice(gold.qtyPrice / (this.currencyMultiplier || 1))
              : '',
            alignment: 'center'
          },
          { text: gold.qtyWeight ? this.formatPrice(gold.qtyWeight) : '', alignment: 'center' },
          { text: gold.qtyWeight ? this.formatPrice(goldLossWeight) : '', alignment: 'center' },
          {
            text: gold.qtyWeightPrice
              ? this.formatPrice(gold.qtyWeightPrice / (this.currencyMultiplier || 1))
              : '',
            alignment: 'center'
          },
          {
            text: this.formatPrice(priceUnit),
            alignment: 'right'
          }
        ])
        currentRow++
      })

      gemList.forEach((gem, idx) => {
        body.push([
          {},
          {},
          {},
          {},
          idx === 0
            ? { text: 'Diamond / C. Stone', alignment: 'center', rowSpan: gemList.length }
            : {},
          { text: gem.nameDescription || '-', alignment: 'left' },
          { text: gem.qty ? this.formatQty(gem.qty) : '', alignment: 'center' },
          {
            text: gem.qtyPrice
              ? this.formatPrice(gem.qtyPrice / (this.currencyMultiplier || 1))
              : '',
            alignment: 'center'
          },
          { text: gem.qtyWeight ? this.formatPrice(gem.qtyWeight) : '', alignment: 'center' },
          { text: '', alignment: 'center' },
          {
            text: gem.qtyWeightPrice
              ? this.formatPrice(gem.qtyWeightPrice / (this.currencyMultiplier || 1))
              : '',
            alignment: 'center'
          },
          {
            text: this.formatPrice((gem.totalPrice || 0) / (this.currencyMultiplier || 1)),
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
          {},
          {},
          { text: 'Labor', alignment: 'center' },
          { text: '-', alignment: 'left' },
          { text: '', alignment: 'center' },
          { text: '', alignment: 'center' },
          { text: '', alignment: 'center' },
          { text: '', alignment: 'center' },
          { text: '', alignment: 'center' },
          { text: this.formatPrice(sumWork / (this.currencyMultiplier || 1)), alignment: 'right' }
        ])
        currentRow++
      }

      let diamondTotal = 0
      let stoneTotal = 0
      if (useNewSettingRows) {
        const diamondPriceQty = this.settingDiamondRate / (this.currencyMultiplier || 1)
        diamondTotal = (diamondCount * this.settingDiamondRate) / (this.currencyMultiplier || 1)
        const stonePriceQty = this.settingStoneRate / (this.currencyMultiplier || 1)
        stoneTotal = (stoneCount * this.settingStoneRate) / (this.currencyMultiplier || 1)

        if (diamondCount > 0) {
          body.push([
            {},
            {},
            {},
            {},
            { text: 'Setting-Diamonds', alignment: 'center' },
            { text: '-', alignment: 'left' },
            { text: this.formatQty(diamondCount), alignment: 'center' },
            { text: this.formatPrice(diamondPriceQty), alignment: 'center' },
            { text: '', alignment: 'center' },
            { text: '', alignment: 'center' },
            { text: '', alignment: 'center' },
            { text: this.formatPrice(diamondTotal), alignment: 'right' }
          ])
          currentRow++
        }
        if (stoneCount > 0) {
          body.push([
            {},
            {},
            {},
            {},
            { text: 'Setting-Stones', alignment: 'center' },
            { text: '-', alignment: 'left' },
            { text: this.formatQty(stoneCount), alignment: 'center' },
            { text: this.formatPrice(stonePriceQty), alignment: 'center' },
            { text: '', alignment: 'center' },
            { text: '', alignment: 'center' },
            { text: '', alignment: 'center' },
            { text: this.formatPrice(stoneTotal), alignment: 'right' }
          ])
          currentRow++
        }
      } else {
        embedList.forEach((embed, idx) => {
          body.push([
            {},
            {},
            {},
            {},
            idx === 0 ? { text: 'Setting', alignment: 'center', rowSpan: embedList.length } : {},
            { text: embed.nameDescription || '-', alignment: 'left' },
            { text: embed.qty ? this.formatQty(embed.qty) : '', alignment: 'center' },
            {
              text: embed.qtyPrice
                ? this.formatPrice(embed.qtyPrice / (this.currencyMultiplier || 1))
                : '',
              alignment: 'center'
            },
            { text: '', alignment: 'center' },
            { text: '', alignment: 'center' },
            { text: '', alignment: 'center' },
            {
              text: this.formatPrice((embed.totalPrice || 0) / (this.currencyMultiplier || 1)),
              alignment: 'right'
            }
          ])
          currentRow++
        })
      }

      etcList.forEach((etc, idx) => {
        body.push([
          {},
          {},
          {},
          {},
          idx === 0 ? { text: 'Etc', alignment: 'center', rowSpan: etcList.length } : {},
          { text: etc.nameDescription || '-', alignment: 'left' },
          { text: etc.qty ? this.formatQty(etc.qty) : '', alignment: 'center' },
          { text: etc.qtyPrice ? this.formatPrice(etc.qtyPrice) : '', alignment: 'center' },
          { text: etc.qtyWeight ? this.formatPrice(etc.qtyWeight) : '', alignment: 'center' },
          { text: '', alignment: 'center' },
          {
            text: etc.qtyWeightPrice ? this.formatPrice(etc.qtyWeightPrice) : '',
            alignment: 'center'
          },
          {
            text: this.formatPrice((etc.totalPrice || 0) / (this.currencyMultiplier || 1)),
            alignment: 'right'
          }
        ])
        currentRow++
      })

      // รวมราคาทั้งหมดแบบถูกต้อง (แต่ละรายการต้อง / currencyMultiplier * item.qty)
      const totalGold = goldList.reduce((sum, t) => {
        const qtyWeight = Number(t.qtyWeight) || 0
        const goldLossWeight = qtyWeight * (1 + this.goldLossPercent / 100)
        const priceUnit =
          ((Number(t.qty) || 0) * (Number(t.qtyPrice) || 0) +
            goldLossWeight * (Number(t.qtyWeightPrice) || 0)) /
          (this.currencyMultiplier || 1)
        return sum + priceUnit * (item.qty || 1)
      }, 0)
      const totalGem = gemList.reduce(
        (sum, t) =>
          sum + (Number(t.totalPrice || 0) / (this.currencyMultiplier || 1)) * (item.qty || 1),
        0
      )
      const totalEtc = etcList.reduce(
        (sum, t) =>
          sum + (Number(t.totalPrice || 0) / (this.currencyMultiplier || 1)) * (item.qty || 1),
        0
      )
      const totalWork = workList.length
        ? (workList.reduce((sum, t) => sum + Number(t.totalPrice || 0), 0) /
            (this.currencyMultiplier || 1)) *
          (item.qty || 1)
        : 0
      const totalEmbed = useNewSettingRows
        ? (diamondTotal + stoneTotal) * (item.qty || 1)
        : embedList.length
          ? (embedList.reduce((sum, t) => sum + Number(t.totalPrice || 0), 0) /
              (this.currencyMultiplier || 1)) *
            (item.qty || 1)
          : 0

      const totalItemPrice = totalGold + totalGem + totalEtc + totalWork + totalEmbed
      const profitAmount = totalItemPrice * (this.profitPercent / 100)
      const totalWithProfit = totalItemPrice + profitAmount

      body.push([
        {
          text: `Sub Total of ${item.productNumber} `,
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          colSpan: 11
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
        {},
        {
          text: this.formatPrice(totalItemPrice),
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          bold: true
        }
      ])
      body.push([
        {
          text: `Profit (${this.profitPercent}%) `,
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          colSpan: 11
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
        {},
        {
          text: this.formatPrice(profitAmount),
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          bold: true
        }
      ])
      body.push([
        {
          text: `Total of ${item.productNumber} `,
          style: 'totalSummaryLabelColored',
          alignment: 'right',
          colSpan: 11
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
        {},
        {
          text: this.formatPrice(totalWithProfit),
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
            widths: [20, 60, 30, 50, 40, '*', 40, 40, 40, 45, 40, 55],
            body
          },
          layout: {
            hLineWidth: function () {
              return 0.5
            },
            vLineWidth: function () {
              return 0.5
            },
            hLineColor: function () {
              return '#cccccc'
            },
            vLineColor: function () {
              return '#cccccc'
            }
          }
        },
        // Signature
        {
          margin: [0, 15, 0, 0],
          columns: [
            { text: 'ORIGIN THAILAND', style: 'parcelText', alignment: 'left', width: '70%' },
            {
              text: '______________________________',
              style: 'parcelText',
              alignment: 'center',
              width: '30%'
            }
          ]
        },
        {
          columns: [
            { text: '', style: 'parcelText', alignment: 'left', width: '70%' },
            {
              text: '(Authorized Signature and Company Stamp)',
              style: 'parcelText',
              alignment: 'center',
              width: '30%'
            }
          ]
        },
        // Conditions
        {
          margin: [0, 10, 0, 0],
          stack: [
            { text: 'Price is F.O.B. Bangkok not inclued freight and insurance', style: 'conditionText' },
            { text: 'Production time within 5-7 weeks', style: 'conditionText' },
            { text: '40% payment of tt, 60% before the shipment.', style: 'conditionText' },
            { text: 'Gold weight, Diamond weight and Stones weight are approximately, the actual weight will be known after production is completed', style: 'conditionText' },
            { text: 'Minimun order 10 pcs per design / Minimun purchase US$ 5,000', style: 'conditionText' },
            { text: 'The price quotation is current gold price market at www.kitco.com (please confirm within 2 days)', style: 'conditionText' }
          ]
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
        font: PDF_FONT,
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
        },
        parcelText: {
          fontSize: 10,
          color: '#393939'
        },
        conditionText: {
          fontSize: 8,
          color: '#666666'
        }
      }
    }
  }

  setImageCell(imageBase64) {
    if (!imageBase64) {
      return { text: '', alignment: 'center' }
    }
    const imageData = imageBase64.startsWith('data:image')
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`
    return {
      image: imageData,
      width: 50,
      height: 50,
      alignment: 'center',
      margin: [2, 3, 2, 3]
    }
  }

  formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) return '0.00'
    return price.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  formatQty(qty) {
    const num = Number(qty)
    if (isNaN(num)) return '0'
    return Math.round(num).toLocaleString('th-TH')
  }

  roundNoDecimal(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0.00'
    return Math.round(num).toFixed(2)
  }

  async generatePDF() {
    await this.preparePDF()
    const pdfMake = (await import('@/services/utils/pdf-make')).initPdfMake()
    const docDefinition = this.getBreakdownDocDefinition()
    return pdfMake.createPdf(docDefinition)
  }
}
