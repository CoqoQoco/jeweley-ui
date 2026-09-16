import dayjs from 'dayjs'
import { initPdfMake } from '@/services/utils/pdf-make'
import { convertAmountToThaiText } from '@/services/utils/thai-baht-text.js'
import { COMPANY_INFO, COMPANY_TAX_ID, loadCompanyInfo } from '@/config/company-info.js'
import { PDF_COLORS, PDF_FONT } from '../shared/pdf-theme.js'
import { buildSeekHeader, buildSeekSummary, buildSeekSignature, buildRemarks } from '../shared/pdf-seek-sections.js'
import { loadCompanyLogo } from '../shared/pdf-images.js'

// ใบรับมัดจำของใบสั่งขาย (SaleOrderDeposit) — A4, ไม่ใช่ใบกำกับภาษี
// data shape: { running, depositDate, soNumber, customerName, customerAddress, customerTel,
//   amount, currencyUnit, payment, paymentName, bankCode, bankBranch, referenceNumber, remark,
//   grandTotal, totalReceived, balance }
export class DepositReceiptPdfBuilder {
  constructor(data) {
    this.data = data || {}
    this.logoBase64 = null
    this.company = null
  }

  async preparePDF() {
    this.logoBase64 = await loadCompanyLogo()
    this.company = await loadCompanyInfo()
  }

  formatMoney(value) {
    return (Number(value) || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  formatDate(value) {
    return value ? dayjs(value).format('DD/MM/YYYY') : ''
  }

  getBankRefLine() {
    const parts = []
    if (this.data.bankCode) parts.push(`ธนาคาร: ${this.data.bankCode}`)
    if (this.data.bankBranch) parts.push(`สาขา: ${this.data.bankBranch}`)
    if (this.data.referenceNumber) parts.push(`เลขที่อ้างอิง: ${this.data.referenceNumber}`)
    return parts.join('   ')
  }

  getHeaderSection() {
    return buildSeekHeader({
      logoBase64: this.logoBase64,
      companyName: this.company?.info?.nameTh || COMPANY_INFO.nameTh,
      companyTaxId: this.company?.taxId || COMPANY_TAX_ID,
      title: 'ใบรับมัดจำ\nDeposit Receipt',
      meta: [
        { label: 'เลขที่:', value: this.data.running || '' },
        { label: 'วันที่:', value: this.formatDate(this.data.depositDate) },
        { label: 'เลขที่ใบสั่งขาย:', value: this.data.soNumber || '' }
      ],
      billTo: {
        name: this.data.customerName || '',
        address: [this.data.customerAddress, this.data.customerTel].filter(Boolean).join('   โทร. ')
      }
    })
  }

  getAmountBlock() {
    const currencyUnit = this.data.currencyUnit || 'THB'
    return {
      margin: [0, 10, 0, 10],
      table: {
        widths: ['*'],
        body: [
          [
            {
              fillColor: PDF_COLORS.panelBg,
              border: [false, false, false, false],
              stack: [
                { text: 'จำนวนเงินที่รับมัดจำ', fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 4] },
                {
                  text: `${this.formatMoney(this.data.amount)} ${currencyUnit}`,
                  fontSize: 20,
                  bold: true,
                  color: PDF_COLORS.primary,
                  margin: [0, 0, 0, 4]
                },
                {
                  text: `(${convertAmountToThaiText(this.data.amount)})`,
                  fontSize: 10,
                  bold: true,
                  color: PDF_COLORS.darkGray
                }
              ]
            }
          ]
        ]
      },
      layout: { defaultBorder: false, paddingLeft: () => 10, paddingRight: () => 10, paddingTop: () => 10, paddingBottom: () => 10 }
    }
  }

  getPaymentInfoSection() {
    const rows = [
      { label: 'วิธีชำระเงิน:', value: this.data.paymentName || '-' }
    ]
    const bankRefLine = this.getBankRefLine()
    if (bankRefLine) rows.push({ label: '', value: bankRefLine })

    return {
      margin: [0, 0, 0, 6],
      stack: rows.map((row) => ({
        text: row.label ? [{ text: row.label + ' ', bold: true, color: PDF_COLORS.darkGray }, { text: row.value }] : row.value,
        fontSize: 9,
        color: PDF_COLORS.darkGray,
        margin: [0, 1, 0, 1]
      }))
    }
  }

  getSummarySection() {
    const currencyUnit = this.data.currencyUnit || 'THB'
    return buildSeekSummary({
      rows: [
        { label: 'ยอดรวมใบสั่งขาย', value: `${this.formatMoney(this.data.grandTotal)} ${currencyUnit}` },
        { label: 'รับมัดจำรวมถึงปัจจุบัน', value: `${this.formatMoney(this.data.totalReceived)} ${currencyUnit}` }
      ],
      netPayableLabel: 'ยอดคงเหลือของใบสั่งขาย',
      netPayableValue: `${this.formatMoney(this.data.balance)} ${currencyUnit}`
    })
  }

  getFootnote() {
    return {
      text: 'เอกสารนี้ไม่ใช่ใบกำกับภาษี',
      fontSize: 8,
      italics: true,
      color: PDF_COLORS.muted,
      alignment: 'center',
      margin: [0, 12, 0, 0]
    }
  }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 40],
      defaultStyle: {
        font: PDF_FONT,
        fontSize: 11
      },
      content: [
        this.getHeaderSection(),
        this.getAmountBlock(),
        this.getPaymentInfoSection(),
        buildRemarks({ text: this.data.remark }),
        this.getSummarySection(),
        buildSeekSignature({
          companyName: this.company?.info?.nameTh || COMPANY_INFO.nameTh,
          companyTaxId: this.company?.taxId || COMPANY_TAX_ID,
          companyAddress: this.company?.info?.addressTh || COMPANY_INFO.addressTh,
          companyPhone: this.company?.info?.phone || COMPANY_INFO.phone
        }),
        this.getFootnote()
      ].filter(Boolean)
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
