import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'
import { formatMoney } from '@/services/utils/decimal.js'
import { computeDocumentTotals, convertedUnitPrice, lineAmount } from '@/services/utils/money.js'
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'
import { formatItemStyleCode } from '@/services/utils/item-code.js'
import { i18n } from '@/plugins/i18n/config.js'

export class SaleOrderPdfBuilder {
  constructor(soData, options = {}) {
    this.soData = soData || {}
    this.items = soData?.items || []
    // รายการรอผลิต/รอแปลง — ยังไม่มี stockNumber จริง พิมพ์แยกส่วนหลังตาราง stock (P2-5)
    // เติมของครบแล้ว (qty 0) ไม่ต้องพิมพ์ซ้ำในเอกสาร — ยังอยู่ใน SO JSON เพื่อ traceability แต่ตัดออกจากหน้าพิมพ์ (P4-2)
    this.copyItems = (soData?.copyItems || []).filter((item) => (Number(item.qty) || 0) > 0)
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd., Phayathai, Phayathai, Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: ' (+662) 2710834',
      email: 'info@dkbkk.com'
    }
    this.logoBase64 = null
    this.currencyUnit = options.currencyUnit || 'THB'
    this.currencyRate = Number(options.currencyRate) || 1
    this.itemsPerPage = Number(options.itemsPerPage) || 10
    this.showCifLabel = options.showCifLabel !== undefined ? options.showCifLabel : true
    this.showDecimals = options.showDecimals != null ? options.showDecimals : true
    // T6: 'customer' (ค่าเริ่มต้น) = เอกสารที่ลูกค้าเห็น ไม่มีเครื่องหมายต้องผลิต/รอแปลงใดๆ
    // 'internal' = ฉบับภายใน — เอกสารเดียวกัน บวกคอลัมน์ "สถานะของ" ต่อบรรทัด
    this.printMode = options.printMode === 'internal' ? 'internal' : 'customer'
    // T6: ใบแปลงสินค้าที่ยังไม่เสร็จของบรรทัดรอผลิต/รอแปลง — ใช้โชว์เลขที่เอกสาร CV ในคอลัมน์สถานะของ (ฉบับภายในเท่านั้น)
    this.pendingConversions = soData?.pendingConversions || []

    // Financial adjustments
    this.specialDiscount = Number(soData.specialDiscount) || 0
    this.specialAddition = Number(soData.specialAddition) || 0
    this.freightAndInsurance = Number(soData.freight) || Number(soData.freightAndInsurance) || 0
    this.vatPercent = Number(soData.vatPercent) || Number(soData.vat) || 0

    // Calculate totals — ปัดเศษที่ราคาต่อชิ้นก่อนเสมอผ่านตัวกลาง money.js
    // รวม copyItems ด้วยเสมอ (P2-3) ให้ตรงกับยอดรวมที่หน้าจอ/หัวใบสั่งขายเก็บไว้
    const totals = computeDocumentTotals({
      items: this.allItems,
      currencyRate: this.currencyRate,
      currencyUnit: this.currencyUnit,
      specialDiscount: this.specialDiscount,
      specialAddition: this.specialAddition,
      freight: this.freightAndInsurance,
      vatPercent: this.vatPercent
    })
    this.subtotal = totals.subTotal
    this.specialDiscount = totals.specialDiscount
    this.specialAddition = totals.specialAddition
    this.freightAndInsurance = totals.freight
    this.totalAfterDiscountAndAddition = this.subtotal - this.specialDiscount + this.specialAddition
    this.totalBeforeVat = totals.afterSpecial
    this.vatAmount = totals.vatAmount
    this.totalAmount = totals.grandTotalRaw
    this.grandTotalRaw = totals.grandTotalRaw
    this.grandTotalRounded = totals.grandTotalRounded
    this.roundingAdjustment = totals.roundingAdjustment
  }

  // stock items + copy items รวมกัน — ใช้คิดยอดรวม/น้ำหนักรวมทั้งใบ (P2-3)
  get allItems() {
    return [...this.items, ...this.copyItems]
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

  async prepareImages() {
    const items = this.allItems
    if (!items || !Array.isArray(items) || items.length === 0) return

    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')

    await Promise.all(
      items.map(async (item) => {
        if (item.imageBase64) return

        // ใช้ imageBlobPath ก่อน, ถ้าไม่มีใช้ imagePath
        const blobPath = item.imageBlobPath || item.imagePath
        if (!blobPath) return

        try {
          const base64Image = await getAzureBlobAsBase64(blobPath, 'stock')
          if (base64Image && base64Image.length > 0) {
            item.imageBase64 = base64Image
          }
        } catch (error) {
          console.error('Error loading image:', blobPath, error)
        }
      })
    )
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

  roundToTwo(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
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
                              fontSize: 11,
                              color: 'white',
                              margin: [15, 20, 10, 0]
                            },
                        {
                          stack: [
                            {
                              text: 'Duang Kaew Jewelry',
                              fontSize: 22,
                              bold: true,
                              color: '#8B0000',
                              margin: [25, 5, 0, 0]
                            },
                            {
                              text: 'The first step is always the hardest',
                              fontSize: 10,
                              color: '#8B0000',
                              margin: [25, -2, 0, 0]
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
                      text: 'SALE ORDER',
                      fontSize: 16,
                      color: '#393939',
                      alignment: 'center',
                      margin: [0, 10, 0, 0]
                    },
                    {
                      columns: [
                        {
                          text: 'SO No.:',
                          fontSize: 8,
                          color: '#393939',
                          alignment: 'right',
                          width: '30%'
                        },
                        {
                          text: this.soData.soNumber || '',
                          fontSize: 10,
                          bold: true,
                          color: '#8B0000',
                          alignment: 'left',
                          width: '70%',
                          margin: [5, 0, 0, 0]
                        }
                      ]
                    },
                    {
                      columns: [
                        {
                          text: 'Date:',
                          fontSize: 8,
                          color: '#393939',
                          alignment: 'right',
                          width: '30%'
                        },
                        {
                          text: dayjs(this.soData.createDate).locale('en').format('MMMM DD, YYYY'),
                          fontSize: 10,
                          bold: true,
                          color: '#8B0000',
                          alignment: 'left',
                          width: '70%',
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

        // Company info and Customer info
        {
          margin: [0, 0, 0, 0],
          columns: [
            {
              width: '50%',
              stack: [
                {
                  text: 'From: Duang Kaew Jewelry Manufacturer Co.,Ltd.',
                  fontSize: 11,
                  bold: true,
                  color: '#8B0000',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'Address: ' + (this.companyInfo.address || ''),
                  fontSize: 9,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'TEL: ' + (this.companyInfo.phone || ''),
                  fontSize: 9,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'FAX: ' + (this.companyInfo.fax || ''),
                  fontSize: 9,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                },
                {
                  text: 'E-Mail: ' + (this.companyInfo.email || ''),
                  fontSize: 9,
                  color: '#393939',
                  margin: [0, 0, 0, 0]
                }
              ]
            },
            {
              width: '50%',
              stack: [
                {
                  text: `Customer: ${this.soData.customerName || ''}`,
                  fontSize: 11,
                  bold: true,
                  color: '#8B0000',
                  margin: [0, 0, 0, 0]
                },
                this.soData.customerAddress
                  ? {
                      text: 'Address: ' + this.soData.customerAddress,
                      fontSize: 9,
                      color: '#393939',
                      margin: [0, 0, 0, 0]
                    }
                  : null,
                this.soData.customerTel
                  ? {
                      text: 'TEL: ' + this.soData.customerTel,
                      fontSize: 9,
                      color: '#393939',
                      margin: [0, 0, 0, 0]
                    }
                  : null,
                this.soData.remark
                  ? {
                      text: 'Remark: ' + this.soData.remark,
                      fontSize: 9,
                      color: '#393939',
                      margin: [0, 5, 0, 0]
                    }
                  : null,
                this.soData.salePerson
                  ? {
                      text: 'SALE: ' + this.soData.salePerson,
                      fontSize: 9,
                      color: '#393939',
                      margin: [0, 5, 0, 0]
                    }
                  : null,
                this.soData.saleSupport
                  ? {
                      text: 'SUPPORT: ' + this.soData.saleSupport,
                      fontSize: 9,
                      color: '#393939',
                      margin: [0, 5, 0, 0]
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

  // T1/T6: บรรทัดสินค้าจริงตามด้วยบรรทัดลูก (copy line ที่ parentLineKey ตรงกัน) เรียงตามลำดับที่สร้าง
  // แล้วต่อท้ายด้วย copy line ที่ไม่มีบรรทัดแม่ — ตารางเดียว ไม่มี section แยก ไม่มี page break บังคับระหว่าง stock/copy
  get mergedPrintItems() {
    const rows = []
    const childKeysUsed = new Set()

    this.items.forEach((parent) => {
      rows.push(parent)
      this.copyItems
        .filter((child) => child.parentLineKey && child.parentLineKey === parent.lineKey)
        .forEach((child) => {
          childKeysUsed.add(child.lineKey)
          rows.push(child)
        })
    })

    this.copyItems
      .filter((child) => !childKeysUsed.has(child.lineKey))
      .forEach((child) => rows.push(child))

    return rows
  }

  // T6: ฉบับภายในเท่านั้น — สถานะของแต่ละบรรทัด (มีของ/ต้องผลิต/รอแปลง พร้อมเลขที่เอกสาร CV ถ้ามี)
  getStockStatusLabel(item) {
    const isCopyLine = this.copyItems.includes(item)
    if (!isCopyLine) return i18n.global.t('view.sale.saleOrder.internalStatusInStock')

    const pending = this.pendingConversions.find((p) => p.soLineKey === item.lineKey)
    if (pending) {
      return i18n.global.t('view.sale.saleOrder.internalStatusPendingConvertWithDoc', {
        running: pending.running
      })
    }
    return i18n.global.t('view.sale.saleOrder.needsProduction')
  }

  // T6: เติมคอลัมน์ "สถานะของ" ท้ายแถว เฉพาะฉบับภายใน (printMode === 'internal') — customer ไม่มีคอลัมน์นี้เลย
  withStatusColumn(cells, extraCell) {
    if (this.printMode !== 'internal') return cells
    return [...cells, extraCell !== undefined ? extraCell : {}]
  }

  get tableColumnWidths() {
    const base = [15, 43, 100, 49, 50, 58, '*', 20, 62, 72]
    return this.printMode === 'internal' ? [...base, 60] : base
  }

  createPages() {
    const itemsPerPage = this.itemsPerPage
    const pages = []
    const allRows = this.mergedPrintItems
    const totalItems = allRows.length

    if (totalItems === 0) {
      pages.push(this.getEmptyPageContent())
      pages.push(...this.getSummarySection())
      return pages
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      const startIdx = pageNum * itemsPerPage
      const endIdx = Math.min(startIdx + itemsPerPage, totalItems)
      const pageItems = allRows.slice(startIdx, endIdx)
      const isLastPage = pageNum === totalPages - 1

      const pageContent = []

      if (pageNum > 0) {
        pageContent.push(this.getHeaderContent())
      }

      if (isLastPage) {
        pageContent.push(this.getFinalPageTableContent(pageItems, pageNum, totalPages > 1))
      } else {
        pageContent.push(this.getRegularPageTableContent(pageItems, pageNum))
      }

      pageContent.push(...this.getSummarySection())

      if (pageNum < totalPages - 1) {
        pageContent.push({ text: '', pageBreak: 'after' })
      }

      pages.push(...pageContent)
    }

    return pages
  }

  getEmptyPageContent() {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: this.tableColumnWidths,
        body: [
          this.withStatusColumn(
            [
              this.setTableHeader('No.'),
              this.setTableHeader(''),
              this.setTableHeader('Style/Product'),
              this.setTableHeader('Description'),
              this.setTableHeader('Gold (gms)'),
              this.setTableHeader('Diamond (cts)'),
              this.setTableHeader('Gem (cts)'),
              this.setTableHeader('Qty'),
              this.setTableHeader('Price (' + this.currencyUnit + ')'),
              this.setTableHeader('Amount')
            ],
            this.setTableHeader(i18n.global.t('view.sale.saleOrder.internalStatusColLabel'))
          )
        ]
      },
      layout: {
        hLineWidth: function () {
          return 0.5
        },
        vLineWidth: function () {
          return 0
        },
        paddingLeft: function () {
          return 2
        },
        paddingRight: function () {
          return 2
        }
      }
    }
  }

  getRegularPageTableContent(items, pageNum) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: this.tableColumnWidths,
        body: this.buildRegularTableBody(items, pageNum)
      },
      layout: {
        hLineWidth: function () {
          return 0.5
        },
        vLineWidth: function () {
          return 0.5
        },
        paddingLeft: function () {
          return 2
        },
        paddingRight: function () {
          return 2
        },
        paddingTop: function () {
          return 0
        },
        paddingBottom: function () {
          return 0
        }
      }
    }
  }

  getFinalPageTableContent(items, pageNum, showGrandTotalRow) {
    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: this.tableColumnWidths,
        body: this.buildFinalTableBody(items, pageNum, showGrandTotalRow)
      },
      layout: {
        hLineWidth: function () {
          return 0.5
        },
        vLineWidth: function () {
          return 0.5
        },
        paddingLeft: function () {
          return 2
        },
        paddingRight: function () {
          return 2
        },
        paddingTop: function () {
          return 0
        },
        paddingBottom: function () {
          return 0
        }
      }
    }
  }

  buildRegularTableBody(items, pageNum) {
    const body = []

    // Header
    body.push(
      this.withStatusColumn(
        [
          this.setTableHeader(''),
          this.setTableHeader(''),
          this.setTableHeader('Style/Product'),
          this.setTableHeader('Description'),
          this.setTableHeader('Gold (gms)'),
          this.setTableHeader('Diamond (cts)'),
          this.setTableHeader('Gem (cts)'),
          this.setTableHeader('Qty'),
          this.setTableHeader('Price (' + this.currencyUnit + ')'),
          this.setTableHeader('Amount (' + this.currencyUnit + ')')
        ],
        this.setTableHeader(i18n.global.t('view.sale.saleOrder.internalStatusColLabel'))
      )
    )

    // Content rows
    let sumGold = 0,
      sumDiamond = 0,
      sumGem = 0,
      sumQty = 0,
      sumAmount = 0
    items = items || []

    items.forEach((item, index) => {
      const actualIndex = pageNum * this.itemsPerPage + index

      // ปัดที่ราคาต่อชิ้นก่อนเสมอผ่านตัวกลาง money.js
      const qty = Number(item.qty) || 0
      const convertedPrice = convertedUnitPrice(item, this.currencyRate, this.currencyUnit)
      const amount = lineAmount(item, this.currencyRate, this.currencyUnit)

      sumQty += qty
      sumAmount += amount

      if (item.materials && Array.isArray(item.materials)) {
        item.materials.forEach((m) => {
          if (m.type === 'Gold') sumGold += Number(m.weight) || 0
          if (m.type === 'Diamond') sumDiamond += Number(m.weight) || 0
          if (m.type === 'Gem') sumGem += Number(m.weight) || 0
        })
      }

      body.push(
        this.withStatusColumn(
          [
            this.setTableCell((actualIndex + 1).toString()),
            item.imageBase64 || item.imageBlobPath || item.imagePath
              ? this.setTabImageCell(item.imageBase64, item.imageBlobPath || item.imagePath)
              : this.setTableCell(''),
            this.setTableCell(formatItemStyleCode(item)),
            this.setTableCell(this.getDescription(item)),
            this.buildMaterialTable(item.materials, 'Gold'),
            this.buildMaterialTable(item.materials, 'Diamond'),
            this.buildMaterialTable(item.materials, 'Gem'),
            this.setTableCellRight(qty ? qty.toString() : '0'),
            this.setTableCellRight(this.formatPrice(Number(convertedPrice))),
            this.setTableCellRight(this.roundNoDecimal(amount))
          ],
          this.setTableCell(this.getStockStatusLabel(item))
        )
      )
    })

    // Footer: Total weight, qty, amount
    body.push(
      this.withStatusColumn([
        { text: 'Total', style: 'summaryLabelColored', alignment: 'right', colSpan: 4 },
        { text: '', style: 'summaryLabelColored', alignment: 'right' },
        { text: '', style: 'summaryLabelColored', alignment: 'right' },
        { text: '', style: 'summaryLabelColored', alignment: 'right' },
        { text: this.formatWeight(sumGold), style: 'summaryLabelColored', alignment: 'right' },
        { text: this.formatWeight(sumDiamond), style: 'summaryLabelColored', alignment: 'right' },
        { text: this.formatWeight(sumGem), style: 'summaryLabelColored', alignment: 'right' },
        { text: sumQty, style: 'summaryLabelColored', alignment: 'right' },
        { text: '', style: 'summaryLabelColored', alignment: 'right' },
        { text: this.roundNoDecimal(sumAmount), style: 'summaryLabelColored', alignment: 'right' }
      ], { text: '', style: 'summaryLabelColored' })
    )

    return body
  }

  buildFinalTableBody(items, pageNum, showGrandTotalRow) {
    const body = this.buildRegularTableBody(items, pageNum)

    // Grand Total row (น้ำหนักรวม + จำนวนชิ้นรวมทุกหน้า ของทั้งเอกสาร รวม copyItems) — แสดงเฉพาะเมื่อเอกสารมีมากกว่า 1 หน้า
    if (showGrandTotalRow) {
      let sumGoldAll = 0,
        sumDiamondAll = 0,
        sumGemAll = 0,
        sumQtyAll = 0

      this.allItems.forEach((item) => {
        sumQtyAll += Number(item.qty) || 0
        if (item.materials && Array.isArray(item.materials)) {
          item.materials.forEach((m) => {
            if (m.type === 'Gold') sumGoldAll += Number(m.weight) || 0
            if (m.type === 'Diamond') sumDiamondAll += Number(m.weight) || 0
            if (m.type === 'Gem') sumGemAll += Number(m.weight) || 0
          })
        }
      })

      body.push(
        this.withStatusColumn([
          { text: 'Grand Total', style: 'grandTotalLabel', alignment: 'right', colSpan: 4 },
          {},
          {},
          {},
          { text: this.formatWeight(sumGoldAll), style: 'grandTotalLabel', alignment: 'right' },
          { text: this.formatWeight(sumDiamondAll), style: 'grandTotalLabel', alignment: 'right' },
          { text: this.formatWeight(sumGemAll), style: 'grandTotalLabel', alignment: 'right' },
          { text: sumQtyAll, style: 'grandTotalLabel', alignment: 'right' },
          {},
          {}
        ])
      )
    }

    // SUBTOTAL row (F.O.B Bangkok)
    body.push(
      this.withStatusColumn([
        {
          text: '',
          style: 'summaryLabel',
          alignment: 'right',
          colSpan: 7,
          border: [true, false, false, false]
        },
        {},
        {},
        {},
        {},
        {},
        {},
        { text: 'F.O.B Bangkok', style: 'totalSummaryLabelColored', alignment: 'right', colSpan: 2 },
        {},
        {
          text: this.roundNoDecimal(this.subtotal),
          style: 'totalSummaryLabelColored',
          alignment: 'right'
        }
      ])
    )

    // SPECIAL DISCOUNT
    if (this.specialDiscount > 0) {
      body.push(
        this.withStatusColumn([
          {
            text: '',
            style: 'summaryLabel',
            alignment: 'right',
            colSpan: 7,
            border: [true, false, false, false]
          },
          {},
          {},
          {},
          {},
          {},
          {},
          {
            text: 'SPECIAL DISCOUNT',
            style: 'totalSummaryLabelColored',
            alignment: 'right',
            colSpan: 2
          },
          {},
          {
            text: '-' + this.roundNoDecimal(this.specialDiscount),
            style: 'totalSummaryLabelColored',
            alignment: 'right',
            color: '#ff4d4d'
          }
        ])
      )
    }

    // SPECIAL ADDITION
    if (this.specialAddition > 0) {
      body.push(
        this.withStatusColumn([
          {
            text: '',
            style: 'summaryLabel',
            alignment: 'right',
            colSpan: 7,
            border: [true, false, false, false]
          },
          {},
          {},
          {},
          {},
          {},
          {},
          {
            text: 'SPECIAL ADDITION',
            style: 'totalSummaryLabelColored',
            alignment: 'right',
            colSpan: 2
          },
          {},
          {
            text: '+' + this.roundNoDecimal(this.specialAddition),
            style: 'totalSummaryLabelColored',
            alignment: 'right',
            color: '#038387'
          }
        ])
      )
    }

    // FREIGHT & INSURANCE
    if (this.freightAndInsurance > 0) {
      body.push(
        this.withStatusColumn([
          {
            text: '',
            style: 'summaryLabel',
            alignment: 'right',
            colSpan: 7,
            border: [true, false, false, false]
          },
          {},
          {},
          {},
          {},
          {},
          {},
          {
            text: 'FREIGHT & INSURANCE',
            style: 'totalSummaryLabelColored',
            alignment: 'right',
            colSpan: 2
          },
          {},
          {
            text: this.roundNoDecimal(this.freightAndInsurance),
            style: 'totalSummaryLabelColored',
            alignment: 'right'
          }
        ])
      )
    }

    // VAT
    if (this.vatPercent > 0) {
      body.push(
        this.withStatusColumn([
          {
            text: '',
            style: 'summaryLabel',
            alignment: 'right',
            colSpan: 7,
            border: [true, false, false, false]
          },
          {},
          {},
          {},
          {},
          {},
          {},
          {
            text: `VAT (${this.vatPercent}%)`,
            style: 'totalSummaryLabelColored',
            alignment: 'right',
            colSpan: 2
          },
          {},
          {
            text: this.roundNoDecimal(this.vatAmount),
            style: 'totalSummaryLabelColored',
            alignment: 'right'
          }
        ])
      )
    }

    // GRAND TOTAL (C.I.F)
    const grandTotal = this.grandTotalRounded

    body.push(
      this.withStatusColumn([
        {
          text: this.convertNumberToWords(grandTotal),
          style: 'summaryLabelColored',
          alignment: 'left',
          colSpan: 7
        },
        {},
        {},
        {},
        {},
        {},
        {},
        { text: this.showCifLabel ? 'C.I.F' : '', style: 'totalSummaryLabelColored', alignment: 'right', colSpan: 2 },
        {},
        {
          text: this.roundNoDecimal(grandTotal),
          style: 'totalSummaryLabelColored',
          alignment: 'right'
        }
      ])
    )

    return body
  }

  getSummarySection() {
    // Calculate net weight — รวม copyItems ด้วย (P2-3)
    let gold = 0
    let diamond = 0
    let gem = 0
    this.allItems.forEach((item) => {
      if (item.materials) {
        item.materials.forEach((m) => {
          if (m.type === 'Gold') gold += Number(m.weight) || 0
          if (m.type === 'Diamond') diamond += Number(m.weight) || 0
          if (m.type === 'Gem') gem += Number(m.weight) || 0
        })
      }
    })
    const net = (diamond + gem) / 5 + gold
    const netWeightText = `NET WEIGHT OF MERCHANDISES ${net ? net.toFixed(2) : (0).toFixed(2)} (gms.)`

    return [
      {
        columns: [
          {
            stack: [
              {
                columns: [
                  { text: 'ONE PARCEL ONLY', style: 'parcelText', alignment: 'left', width: '60%' },
                  {
                    text: 'Confirm and Accept',
                    style: 'parcelText',
                    alignment: 'center',
                    width: '40%'
                  }
                ]
              },
              {
                columns: [
                  {
                    text: 'WE CERTIFY THAT THIS SALE ORDER IS TRUE AND CORRECT.',
                    style: 'certifyText',
                    alignment: 'left'
                  }
                ]
              },
              {
                columns: [
                  { text: netWeightText, width: '50%', style: 'weightText' },
                  { text: '', width: '50%', style: 'madeInText' }
                ]
              },
              {
                columns: [
                  { text: 'ORIGIN THAILAND', style: 'parcelText', alignment: 'left', width: '60%' },
                  {
                    text: '______________________________',
                    style: 'parcelText',
                    alignment: 'center',
                    width: '40%',
                    margin: [0, 18, 0, 0]
                  }
                ]
              },
              {
                columns: [
                  { text: '', style: 'parcelText', alignment: 'left', width: '60%' },
                  {
                    text: '(Authorized Signature and Company Stamp)',
                    style: 'parcelText',
                    alignment: 'center',
                    width: '40%'
                  }
                ]
              },
              // Conditions
              // {
              //   margin: [0, 10, 0, 0],
              //   stack: [
              //     { text: 'Price is F.O.B. Bangkok not inclued freight and insurance', style: 'conditionText' },
              //     { text: 'Production time within 5-7 weeks', style: 'conditionText' },
              //     { text: '40% payment of tt, 60% before the shipment.', style: 'conditionText' },
              //     { text: 'Gold weight, Diamond weight and Stones weight are approximately, the actual weight will be known after production is completed', style: 'conditionText' },
              //     { text: 'Minimun order 10 pcs per design / Minimun purchase US$ 5,000', style: 'conditionText' },
              //     { text: 'The price quotation is current gold price market at www.kitco.com (please confirm within 2 days)', style: 'conditionText' }
              //   ]
              // }
            ],
            width: '100%'
          }
        ],
        margin: [0, 6, 0, 0],
        unbreakable: true,
        pageBreakBefore: false
      }
    ]
  }

  getDescription(item) {
    return item.description || item.productNumber || ''
  }

  buildMaterialTable(materials, type) {
    if (!materials || !Array.isArray(materials)) return ''
    const rows = materials
      .filter((m) => m.type === type)
      .map((m) => [
        {
          text:
            type === 'Gold'
              ? m.typeCode || ''
              : (m.qty ? '(' + m.qty + ') ' : '') + (m.typeCode || ''),
          alignment: 'left',
          fontSize: 7,
          margin: [0, 0, 0, 0]
        },
        {
          text: m.weight ? Number(m.weight).toFixed(2) : Number(0).toFixed(2),
          alignment: 'right',
          fontSize: 7,
          margin: [0, 0, 0, 0]
        }
      ])
    if (!rows.length) return ''
    return {
      table: {
        widths: ['*', 'auto'],
        body: rows
      },
      layout: {
        hLineWidth: function () {
          return 0
        },
        vLineWidth: function () {
          return 0
        },
        paddingLeft: function () {
          return 0
        },
        paddingRight: function () {
          return 0
        },
        paddingTop: function () {
          return 0
        },
        paddingBottom: function () {
          return 0
        }
      },
      margin: [5, 2, 0, 0]
    }
  }

  convertNumberToWords(number) {
    const prefix = this.currencyUnit ? `(${this.currencyUnit})` : ''
    const numInWords = prefix + ' ' + this.numberToWords(Math.floor(number)) + ' ONLY'
    return numInWords
  }

  numberToWords(num) {
    const units = [
      '',
      'ONE',
      'TWO',
      'THREE',
      'FOUR',
      'FIVE',
      'SIX',
      'SEVEN',
      'EIGHT',
      'NINE',
      'TEN',
      'ELEVEN',
      'TWELVE',
      'THIRTEEN',
      'FOURTEEN',
      'FIFTEEN',
      'SIXTEEN',
      'SEVENTEEN',
      'EIGHTEEN',
      'NINETEEN'
    ]
    const tens = [
      '',
      '',
      'TWENTY',
      'THIRTY',
      'FORTY',
      'FIFTY',
      'SIXTY',
      'SEVENTY',
      'EIGHTY',
      'NINETY'
    ]

    if (num === 0) return 'ZERO'

    function convertLessThanThousand(num) {
      if (num === 0) return ''
      if (num < 20) return units[num]

      const unit = num % 10
      const ten = Math.floor(num / 10) % 10
      const hundred = Math.floor(num / 100) % 10

      let result = ''
      if (hundred > 0) {
        result += units[hundred] + ' HUNDRED'
        if (ten > 0 || unit > 0) result += ' '
      }

      if (ten > 1) {
        result += tens[ten]
        if (unit > 0) result += '-' + units[unit]
      } else {
        result += units[ten * 10 + unit]
      }

      return result
    }

    let words = ''
    const billion = Math.floor(num / 1000000000)
    const million = Math.floor((num % 1000000000) / 1000000)
    const thousand = Math.floor((num % 1000000) / 1000)
    const remainder = num % 1000

    if (billion > 0) {
      words += convertLessThanThousand(billion) + ' BILLION'
      if (million > 0 || thousand > 0 || remainder > 0) words += ' '
    }

    if (million > 0) {
      words += convertLessThanThousand(million) + ' MILLION'
      if (thousand > 0 || remainder > 0) words += ' '
    }

    if (thousand > 0) {
      words += convertLessThanThousand(thousand) + ' THOUSAND'
      if (remainder > 0) words += ' '
    }

    if (remainder > 0) {
      words += convertLessThanThousand(remainder)
    }

    return words
  }

  setTableHeader(text) {
    return {
      text: text,
      bold: true,
      fontSize: 7.5,
      alignment: 'center',
      fillColor: '#8B0000',
      color: 'white',
      margin: [2, 3, 2, 3]
    }
  }

  setTableCell(text) {
    return {
      text: text || '',
      fontSize: 8,
      margin: [2, 3, 2, 3]
    }
  }

  setTabImageCell(imageBase64, imageBlobPath = null) {
    if (!imageBase64 && !imageBlobPath) {
      return {
        text: '',
        alignment: 'center'
      }
    }

    if (imageBase64) {
      const imageData = imageBase64.startsWith('data:image')
        ? imageBase64
        : `data:image/png;base64,${imageBase64}`

      return {
        image: imageData,
        width: 38,
        height: 38,
        alignment: 'center',
        margin: [2, 3, 2, 3]
      }
    }

    if (imageBlobPath) {
      return {
        text: 'No Image',
        fontSize: 8,
        color: '#999999',
        alignment: 'center',
        margin: [2, 3, 2, 3]
      }
    }
  }

  setTableCellRight(text) {
    return {
      text: text || '',
      fontSize: 8,
      alignment: 'right',
      margin: [2, 3, 2, 3]
    }
  }

  formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) return '0.00'
    return formatMoney(price, { showDecimals: this.showDecimals, locale: 'th-TH' })
  }

  // Note: previously misnamed (always emitted 2 decimals) — now honors showDecimals like formatPrice.
  roundNoDecimal(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0.00'
    return formatMoney(num, { showDecimals: this.showDecimals, locale: 'th-TH' })
  }

  // น้ำหนักรวม — บังคับ 2 ตำแหน่งเสมอ ไม่ขึ้นกับ showDecimals (ให้ตรงกับแถวสินค้าที่ใช้ toFixed(2))
  formatWeight(num) {
    const value = Number(num)
    if (isNaN(value)) return '0.00'
    return formatMoney(value, { showDecimals: true, locale: 'th-TH' })
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [10, 10, 10, 30],
      content: [this.getHeaderContent(), ...this.createPages()],
      footer: function (currentPage, pageCount) {
        return {
          text: currentPage.toString() + ' / ' + pageCount,
          alignment: 'center',
          margin: [0, 8, 0, 0]
        }
      },
      defaultStyle: {
        font: PDF_FONT,
        fontSize: 13
      },
      styles: {
        headerCompanyName: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 2]
        },
        companyName: {
          fontSize: 16,
          bold: true,
          color: '#8B0000',
          margin: [0, 0, 0, 0]
        },
        companyInfo: {
          fontSize: 10,
          bold: true,
          margin: [0, 0, 0, 0]
        },
        summaryLabel: {
          fontSize: 12,
          bold: true
        },
        grandTotalLabel: {
          fontSize: 10,
          bold: true
        },
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
          fontSize: 9
        },
        certifyText: {
          fontSize: 9
        },
        weightText: {
          fontSize: 9
        },
        madeInText: {
          fontSize: 9
        },
        conditionText: {
          fontSize: 8,
          color: '#393939',
          margin: [0, 1, 0, 1]
        }
      }
    }
  }

  async generatePDF() {
    await this.preparePDF()
    const pdfMake = initPdfMake()
    const docDefinition = this.getDocDefinition()
    return pdfMake.createPdf(docDefinition)
  }

  async downloadPDF() {
    const pdf = await this.generatePDF()
    const filename = `SO_${this.soData.soNumber || 'DRAFT'}_${dayjs().format('YYYYMMDD')}.pdf`
    pdf.download(filename)
  }

  async openPDF() {
    const pdf = await this.generatePDF()
    pdf.open()
  }
}
