import dayjs from 'dayjs'
import 'dayjs/locale/en'
import { initPdfMake } from '@/services/utils/pdf-make'
import { ceilToInteger } from '@/services/utils/decimal.js'
import { COMPANY_INFO, COMPANY_TAX_ID, COMPANY_BANK } from '@/config/company-info.js'
import { PDF_COLORS, PDF_STYLES } from '../shared/pdf-theme.js'
import { formatPrice } from '../shared/pdf-format.js'
import { loadCompanyLogo, prepareItemImages } from '../shared/pdf-images.js'
import {
  setTableCell,
  setTableCellRight,
  setImageCell,
  buildMaterialTable
} from '../shared/pdf-cells.js'
import { paginate } from '../shared/pdf-sections.js'
import {
  buildSeekHeader,
  buildStatusBand,
  buildSeekSummary,
  buildPaymentOptions,
  buildRemarks,
  buildSeekSignature
} from '../shared/pdf-seek-sections.js'

export class InvoiceSummaryPdfBuilder {
  constructor(
    data,
    customer,
    invoiceDate,
    saleOrderData,
    currencyUnit,
    currencyRate,
    invoiceNo,
    itemsPerPage
  ) {
    this.data = data
    this.customer = customer || {}
    this.saleOrderData = saleOrderData || {}
    this.invoiceDate = invoiceDate || dayjs()
    this.invoiceNo = invoiceNo || this._generateInvoiceNumber()
    this.logoBase64 = null
    this.currencyUnit = currencyUnit || 'THB'
    this.currencyRate = Number(currencyRate) || 1

    // Financial adjustments from sale order data
    this.specialDiscount = Number(saleOrderData.specialDiscount) || 0
    this.specialAddition = Number(saleOrderData.specialAddition) || 0
    this.freightAndInsurance = Number(saleOrderData.freightAndInsurance) || 0
    this.vatPercent = Number(saleOrderData.vatPercent) || Number(saleOrderData.vat) || 0

    this.freight = Number(saleOrderData.freight) || this.freightAndInsurance
    this.discount = Number(saleOrderData.discount) || 0
    this.itemsPerPage = Number(itemsPerPage) || 10
    this.showCifLabel = saleOrderData?.showCifLabel !== undefined ? saleOrderData.showCifLabel : true

    // Compute financial totals
    this.subtotal = this.calculateSubtotal()
    this.totalAfterDiscountAndAddition = this.subtotal - this.specialDiscount + this.specialAddition
    this.totalBeforeVat = this.totalAfterDiscountAndAddition + this.freightAndInsurance
    this.vatAmount = (this.totalBeforeVat * this.vatPercent) / 100
    this.totalAmount = this.totalBeforeVat + this.vatAmount
    this.grandTotalRaw = this.totalAmount
    this.grandTotalRounded = ceilToInteger(this.totalAmount)
    this.roundingAdjustment = this.grandTotalRounded - this.grandTotalRaw

    // Seek-specific fields
    this.deposit = Number(saleOrderData.deposit) || 0
    this.amountPaid = (Number(saleOrderData.amountPaid) || 0) + this.deposit
    this.thisInvoice = this.grandTotalRounded
    this.netPayable = this.grandTotalRounded - this.amountPaid
    this.createDate = saleOrderData.createDate || null
    this.paymentDay = Number(saleOrderData.paymentDay) || 0
    this.remark = saleOrderData.remark || ''
  }

  calculateSubtotal() {
    if (!this.data || !Array.isArray(this.data)) return 0

    let total = 0
    this.data.forEach(item => {
      const price = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = price * (1 - discountPercent / 100)
      const convertedPrice = priceAfterDiscount / this.currencyRate
      total += convertedPrice * qty
    })
    return total
  }

  async preparePDF() {
    this.logoBase64 = await loadCompanyLogo()
    await prepareItemImages(this.data)
  }

  _fmt(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0.00'
    return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  _money(n) {
    return this._fmt(n) + ' ' + this.currencyUnit
  }

  _dueDateText() {
    if (this.createDate && this.paymentDay > 0) {
      return dayjs(this.createDate).add(this.paymentDay, 'day').locale('en').format('MMM DD, YYYY')
    }
    return '-'
  }

  /**
   * Light, clean items table (no colored header, no financial rows).
   * Only renders header row + item rows.
   */
  getItemsTableContent(pageItems, pageNum) {
    const body = []

    // Header row — light style, no fill color
    body.push([
      { text: '', bold: true, fontSize: 7, color: PDF_COLORS.darkGray, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: '', bold: true, fontSize: 7, color: PDF_COLORS.darkGray, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: 'Style/Product', bold: true, fontSize: 7, color: PDF_COLORS.darkGray, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: 'Description', bold: true, fontSize: 7, color: PDF_COLORS.darkGray, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: 'Gold (gms)', bold: true, fontSize: 7, color: PDF_COLORS.darkGray, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: 'Diamond (cts)', bold: true, fontSize: 7, color: PDF_COLORS.darkGray, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: 'Gem (cts)', bold: true, fontSize: 7, color: PDF_COLORS.darkGray, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: 'Qty', bold: true, fontSize: 7, color: PDF_COLORS.darkGray, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: 'Price (' + this.currencyUnit + ')', bold: true, fontSize: 7, color: PDF_COLORS.darkGray, alignment: 'center', margin: [2, 4, 2, 4] },
      { text: 'Amount (' + this.currencyUnit + ')', bold: true, fontSize: 7, color: PDF_COLORS.darkGray, alignment: 'center', margin: [2, 4, 2, 4] }
    ])

    // Data rows
    const safeItems = pageItems || []

    safeItems.forEach((item, index) => {
      const actualIndex = pageNum * this.itemsPerPage + index

      const appraisalPrice = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)
      const convertedPrice = priceAfterDiscount / this.currencyRate
      const amount = convertedPrice * qty

      body.push([
        setTableCell((actualIndex + 1).toString()),
        (item.imageBase64 || item.imageBlobPath)
          ? setImageCell(item.imageBase64, item.imageBlobPath)
          : setTableCell(''),
        setTableCell(
          item.stockNumber && item.productNumber
            ? `${item.stockNumber}/${item.productNumber}`
            : item.stockNumber || item.productNumber || ''
        ),
        setTableCell(item.description || item.productNumber || ''),
        buildMaterialTable(item.materials, 'Gold'),
        buildMaterialTable(item.materials, 'Diamond'),
        buildMaterialTable(item.materials, 'Gem'),
        setTableCellRight(qty ? qty.toString() : '0'),
        setTableCellRight(formatPrice(Number(convertedPrice))),
        setTableCellRight(this._fmt(amount))
      ])
    })

    return {
      margin: [0, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [15, 45, 70, 70, 35, 45, '*', 20, 55, 50],
        body
      },
      layout: {
        hLineWidth: (i, node) =>
          i === 0 || i === 1 || i === node.table.body.length ? 0.8 : 0.4,
        vLineWidth: () => 0,
        hLineColor: (i, node) =>
          i === 0 || i === 1 || i === node.table.body.length
            ? PDF_COLORS.primary
            : PDF_COLORS.lightGray,
        paddingTop: () => 2,
        paddingBottom: () => 2
      }
    }
  }

  getDocDefinition() {
    const self = this

    // Build a FRESH signature object per call — pdfmake mutates nodes during layout.
    const makeSignature = () => buildSeekSignature({
      companyName: COMPANY_INFO.name,
      companyTaxId: COMPANY_TAX_ID,
      companyAddress: COMPANY_INFO.address,
      companyPhone: COMPANY_INFO.phone
    })

    // Build a FRESH header object per page — pdfmake mutates content nodes during
    // layout, so reusing one reference across pages renders later pages incompletely.
    const makeHeader = () => buildSeekHeader({
      logoBase64: self.logoBase64,
      companyName: COMPANY_INFO.name,
      companyTaxId: COMPANY_TAX_ID,
      title: 'INVOICE',
      meta: [
        { label: 'Date of Issue:', value: dayjs(self.invoiceDate).locale('en').format('MMM DD, YYYY') },
        { label: 'Invoice No.:', value: self.invoiceNo },
        { label: 'SO No.:', value: self.saleOrderData.soNumber || self.saleOrderData.number || '' }
      ],
      billTo: {
        name: self.customer.name || '',
        address: self.customer.address || '',
        taxId: self.customer.taxId || ''
      }
    })

    const summaryRows = []
    summaryRows.push({ label: 'Sub Total', value: self._fmt(self.subtotal) })
    if (self.specialDiscount > 0) {
      summaryRows.push({ label: 'Special Discount', value: '-' + self._fmt(self.specialDiscount), color: PDF_COLORS.red })
    }
    if (self.specialAddition > 0) {
      summaryRows.push({ label: 'Special Addition', value: '+' + self._fmt(self.specialAddition), color: PDF_COLORS.green })
    }
    if (self.freightAndInsurance > 0) {
      summaryRows.push({ label: 'Freight & Insurance', value: self._fmt(self.freightAndInsurance) })
    }
    if (self.vatPercent > 0) {
      summaryRows.push({ label: 'VAT (' + self.vatPercent + '%)', value: self._fmt(self.vatAmount) })
    }
    summaryRows.push({ label: 'Invoice Total', value: self._fmt(self.grandTotalRounded) })
    summaryRows.push({ label: 'Amount Paid', value: self._fmt(self.amountPaid) })

    return {
      pageSize: 'A4',
      pageMargins: [10, 18, 20, 95],
      defaultStyle: { font: 'Prompt', fontSize: 11 },
      styles: PDF_STYLES,
      footer: function (currentPage, pageCount) {
        const pageText = { text: 'Page ' + currentPage + ' of ' + pageCount, alignment: 'center', fontSize: 7, margin: [0, 6, 0, 0] }
        if (currentPage === pageCount) {
          return { margin: [10, 0, 20, 0], stack: [makeSignature(), pageText] }
        }
        return pageText
      },
      content: paginate(
        self.data,
        self.itemsPerPage,
        (pageItems, pageNum, isLastPage) => {
          const blocks = []

          // Header repeats on every page (fresh object each time)
          blocks.push(makeHeader())

          // Status band on first page only
          if (pageNum === 0) {
            blocks.push(buildStatusBand({
              thisInvoice: self._money(self.thisInvoice),
              amountPaid: self._money(self.amountPaid),
              totalOwed: self._money(self.netPayable),
              dueDate: self._dueDateText(),
              currencyUnit: self.currencyUnit
            }))
          }

          blocks.push(self.getItemsTableContent(pageItems, pageNum))

          if (isLastPage) {
            const summaryNode = buildSeekSummary({
              rows: summaryRows,
              netPayableLabel: self.showCifLabel ? 'Net Payable (C.I.F)' : 'Net Payable',
              netPayableValue: self._fmt(self.netPayable)
            })
            const pay = buildPaymentOptions({ bank: COMPANY_BANK })
            blocks.push({
              columns: [
                { width: '52%', stack: pay ? [pay] : [{ text: '' }] },
                { width: '48%', stack: [summaryNode] }
              ],
              columnGap: 16,
              margin: [0, 8, 0, 4]
            })

            const rem = buildRemarks({ text: self.remark })
            if (rem) blocks.push(rem)
          }

          return blocks
        }
      )
    }
  }

  async generatePDF() {
    await this.preparePDF()
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }

  async downloadPDF() {
    const pdf = await this.generatePDF()
    const filename = `Invoice_${this.invoiceNo}_${dayjs().format('YYYYMMDD')}.pdf`
    pdf.download(filename)
  }

  async openPDF() {
    const pdf = await this.generatePDF()
    pdf.open()
  }

  async getPreviewUrl() {
    const pdf = await this.generatePDF()
    return new Promise(resolve => {
      pdf.getBlob(blob => resolve(URL.createObjectURL(blob)))
    })
  }

  _generateInvoiceNumber() {
    const date = dayjs()
    const timestamp = date.format('YYMMDDHHmmss')
    return `INV-${timestamp}`
  }
}
