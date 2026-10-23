import dayjs from 'dayjs'
import 'dayjs/locale/en'
import ExcelJS from 'exceljs'
import { formatItemStyleCode } from '@/services/utils/item-code.js'
import { COMPANY_INFO, loadCompanyInfo } from '@/config/company-info.js'
import {
  buildBreakdownPriceModel,
  getBlockRowCount,
  resolveGoldGroupLabel
} from '@/services/helper/breakdown-price-calc.js'

const MAROON = 'FF8B0000'
const NUM_FMT = '#,##0.00'

// A SL | B STOCK | C IMAGE | D ARTICLE | E-G GOLD | H-K DIAMOND | L-P STONE | Q-S LABOR | T N | U O | V P | W Q
const COLUMN_WIDTHS = {
  A: 5, B: 16, C: 10, D: 18,
  E: 9, F: 10, G: 11,
  H: 7, I: 8, J: 11, K: 11,
  L: 14, M: 7, N: 8, O: 11, P: 11,
  Q: 18, R: 11, S: 12,
  T: 12, U: 12, V: 8, W: 13
}
const LAST_COL = 'W'
const MIN_BLOCK_HEIGHT_PT = 45

function stdBorder() {
  return {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
}

function solid(argb) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

export class BreakdownPriceExcelBuilder {
  constructor({
    items,
    customer,
    invoiceDate,
    invoiceNo,
    currencyUnit,
    currencyMultiplier,
    profitPercent,
    goldLossPercent,
    laborAllSettingUsd,
    laborWcpfrUsd
  }) {
    this.data = items || []
    this.customer = customer || {}
    this.invoiceDate = invoiceDate || dayjs().format('YYYY-MM-DD')
    this.invoiceNo = invoiceNo
    this.currencyUnit = currencyUnit || 'THB'
    this.currencyMultiplier = Number(currencyMultiplier) || 1
    const parsedProfit = profitPercent === '' || profitPercent === null ? NaN : Number(profitPercent)
    this.profitPercent = Number.isFinite(parsedProfit) ? parsedProfit : 15
    this.goldLossPercent = Number(goldLossPercent ?? 12)
    this.laborAllSettingUsd = laborAllSettingUsd
    this.laborWcpfrUsd = laborWcpfrUsd
    this.goldSpotPrice = this.customer.goldSpotPrice || this.customer.goldPerOz || 0
    this.logoBase64 = null
    this.imageCache = new Map()
    this.companyInfo = { ...COMPANY_INFO }
  }

  async prepare() {
    try {
      const logoPath = new URL('@/assets/duangkaew-icon.png', import.meta.url).href
      this.logoBase64 = await this.loadImageAsBase64(logoPath)
    } catch {
      // logo load failure is non-critical — continue without logo
    }
    const company = await loadCompanyInfo()
    this.companyInfo = { ...COMPANY_INFO, ...(company?.info || {}) }
    await this.prepareImages()
  }

  async prepareImages() {
    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')
    await Promise.all(
      this.data.map(async (item) => {
        const blobPath = item.imageBlobPath || item.imagePath
        if (!blobPath || this.imageCache.has(blobPath)) return
        const base64 = await getAzureBlobAsBase64(blobPath, 'stock')
        if (base64 && base64.length > 0) this.imageCache.set(blobPath, base64)
      })
    )
  }

  async loadImageAsBase64(path) {
    const response = await fetch(path)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  getModels() {
    return buildBreakdownPriceModel(this.data, {
      currencyMultiplier: this.currencyMultiplier,
      profitPercent: this.profitPercent,
      goldLossPercent: this.goldLossPercent,
      laborAllSettingUsd: this.laborAllSettingUsd,
      laborWcpfrUsd: this.laborWcpfrUsd
    })
  }

  async generateExcel() {
    await this.prepare()

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'DK Jewelry Management System'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('BREAK DOWN PRICE', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
    })
    Object.entries(COLUMN_WIDTHS).forEach(([col, width]) => {
      worksheet.getColumn(col).width = width
    })

    let row = this.buildHeader(worksheet)
    row = this.buildTableHeader(worksheet, row)
    const { nextRow, itemImages } = this.buildItems(worksheet, row)
    this.buildFooter(worksheet, nextRow)

    if (this.logoBase64) {
      const logoId = workbook.addImage({ base64: this.logoBase64.replace(/^data:image\/\w+;base64,/, ''), extension: 'png' })
      worksheet.addImage(logoId, { tl: { col: 0.1, row: 0.1 }, ext: { width: 40, height: 40 } })
    }
    for (const { imageBase64, rowIndex } of itemImages) {
      const imgExt = imageBase64.includes('data:image/png') ? 'png' : 'jpeg'
      const imageId = workbook.addImage({ base64: imageBase64.replace(/^data:image\/\w+;base64,/, ''), extension: imgExt })
      worksheet.addImage(imageId, { tl: { col: 2.1, row: rowIndex - 1 + 0.1 }, ext: { width: 50, height: 50 } })
    }
    return workbook
  }

  setText(worksheet, range, value, font = {}, alignment = {}) {
    if (range.includes(':')) worksheet.mergeCells(range)
    const cell = worksheet.getCell(range.split(':')[0])
    cell.value = value
    cell.font = { name: 'Arial', size: 9, ...font }
    cell.alignment = { vertical: 'middle', horizontal: 'left', ...alignment }
    return cell
  }

  buildHeader(worksheet) {
    const company = this.companyInfo
    const gray = solid('FFE0E0E0')
    for (let r = 1; r <= 4; r++) {
      for (let c = 1; c <= 23; c++) worksheet.getCell(r, c).fill = gray
    }
    worksheet.getRow(1).height = 32

    this.setText(worksheet, 'C1:K1', company.name || 'Duang Kaew Jewelry Manufacturer Co.,Ltd.', { size: 14, bold: true, color: { argb: MAROON } })
    this.setText(worksheet, 'L1:W1', 'BREAK DOWN PRICE', { size: 16, bold: true, color: { argb: 'FF393939' } }, { horizontal: 'center' })
    this.setText(worksheet, 'C2:K2', company.address || '')
    this.setText(worksheet, 'C3:K3', `TEL: ${company.phone || ''}   FAX: ${company.fax || ''}`)
    this.setText(worksheet, 'C4:K4', `E-mail: ${company.email || ''}`)

    this.setText(worksheet, 'L2:W2', `DATE: ${dayjs(this.invoiceDate).locale('en').format('MMMM DD, YYYY')}`, { bold: true, size: 10 }, { horizontal: 'center' })
    this.setText(
      worksheet,
      'L3:W3',
      `GOLD LOCKED: ${this.goldSpotPrice ? `$${Number(this.goldSpotPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/OZ` : '-'}`,
      { bold: true, size: 10 },
      { horizontal: 'center' }
    )
    this.setText(worksheet, 'L4:W4', `Currency: ${this.currencyUnit}`, { bold: true, size: 10 }, { horizontal: 'center' })

    this.setText(worksheet, 'A6:K6', `CONSIGNED TO: ${this.customer.name || ''}`, { size: 11, bold: true, color: { argb: MAROON } })
    this.setText(worksheet, 'A7:K7', this.customer.address || '')
    this.setText(worksheet, 'A8:K8', `Tel: ${this.customer.tel || ''}`)
    return 10
  }

  buildTableHeader(worksheet, startRow) {
    const r0 = startRow
    const r1 = startRow + 1
    const r2 = startRow + 2
    const style = (cell, fill = MAROON, color = 'FFFFFFFF') => {
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: color } }
      cell.fill = solid(fill)
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = stdBorder()
    }
    const put = (ref, value, fill, color) => {
      const cell = worksheet.getCell(ref)
      cell.value = value
      style(cell, fill, color)
    }
    const mergeBlock = (range, value) => {
      worksheet.mergeCells(range)
      put(range.split(':')[0], value)
      const [a, b] = range.split(':')
      worksheet.getCell(b).border = stdBorder()
      worksheet.getCell(a).border = stdBorder()
    }

    ;[['A', 'SL'], ['B', 'STOCK NO.'], ['C', 'IMAGE'], ['D', 'ARTICLE']].forEach(([col, text]) =>
      mergeBlock(`${col}${r0}:${col}${r2}`, text)
    )
    mergeBlock(`E${r0}:G${r0}`, resolveGoldGroupLabel(this.data))
    mergeBlock(`H${r0}:K${r0}`, 'DIAMOND')
    mergeBlock(`L${r0}:P${r0}`, 'STONE')
    mergeBlock(`Q${r0}:S${r0}`, 'LABOR CHARGE')
    ;[['T', 'Total'], ['U', `Profit ${this.profitPercent}%`], ['V', 'Total QTY'], ['W', 'Total Amount']].forEach(([col, text]) =>
      mergeBlock(`${col}${r0}:${col}${r1}`, text)
    )

    const sub = {
      E: 'Gold Wt', F: 'Price/gms', G: 'Gold Value',
      H: '# of pc', I: '# of ct', J: 'Dia Price/Carat', K: 'Dia Charge',
      L: 'Color Stone', M: '# of pc', N: '# of ct', O: 'Stone Price/Carat', P: 'Stone Charge',
      Q: 'Labor', R: 'Labor Price/pcs', S: 'Total Labor Price'
    }
    Object.entries(sub).forEach(([col, text]) => put(`${col}${r1}`, text))

    const letters = { E: 'A', F: 'B', G: 'C', H: 'D', I: 'E', J: 'F', K: 'G', M: 'H', N: 'I', O: 'J', P: 'K', R: 'L', S: 'M', T: 'N', U: 'O', V: 'P', W: 'Q' }
    'LQ'.split('').forEach((col) => put(`${col}${r2}`, '', 'FFF3DEDE', MAROON))
    Object.entries(letters).forEach(([col, letter]) => put(`${col}${r2}`, `(${letter})`, 'FFF3DEDE', MAROON))

    worksheet.getRow(r0).height = 18
    worksheet.getRow(r1).height = 30
    worksheet.getRow(r2).height = 15
    return startRow + 3
  }

  setCell(worksheet, ref, value, { numeric = false, align, bold = false } = {}) {
    const cell = worksheet.getCell(ref)
    const hasValue = value !== '' && value !== null && value !== undefined
    cell.value = hasValue ? value : null
    if (numeric && hasValue) cell.numFmt = NUM_FMT
    cell.font = { name: 'Arial', size: 9, bold }
    cell.alignment = { vertical: 'middle', horizontal: align || (numeric ? 'right' : 'center'), wrapText: true }
    cell.border = stdBorder()
    return cell
  }

  // ว่างเมื่อเป็น 0 (กันพิมพ์ 0.00 ในช่องที่ไม่เกี่ยว)
  numOrBlank(value) {
    return Number(value) ? Number(value) : null
  }

  mergeSpan(worksheet, col, startRow, endRow, value, opts = {}) {
    if (endRow > startRow) worksheet.mergeCells(`${col}${startRow}:${col}${endRow}`)
    this.setCell(worksheet, `${col}${startRow}`, value, opts)
    for (let r = startRow; r <= endRow; r++) worksheet.getCell(`${col}${r}`).border = stdBorder()
  }

  buildItems(worksheet, startRow) {
    let row = startRow
    const itemImages = []
    const models = this.getModels()

    this.data.forEach((item, idx) => {
      const model = models[idx]
      const rows = getBlockRowCount(model)
      const first = row
      const last = row + rows - 1

      this.mergeSpan(worksheet, 'A', first, last, idx + 1)
      this.mergeSpan(worksheet, 'B', first, last, formatItemStyleCode(item))
      this.mergeSpan(worksheet, 'C', first, last, null)
      this.mergeSpan(worksheet, 'D', first, last, item.description || item.productTypeName || '', { align: 'left' })
      this.mergeSpan(worksheet, 'E', first, last, model.gold.weight, { numeric: true })
      this.mergeSpan(worksheet, 'F', first, last, model.gold.pricePerGram, { numeric: true })
      this.mergeSpan(worksheet, 'G', first, last, model.gold.value, { numeric: true })
      this.mergeSpan(worksheet, 'H', first, last, model.diamond.pcs || null)
      this.mergeSpan(worksheet, 'I', first, last, this.numOrBlank(model.diamond.ct), { numeric: true })
      this.mergeSpan(worksheet, 'J', first, last, this.numOrBlank(model.diamond.pricePerCt), { numeric: true })
      this.mergeSpan(worksheet, 'K', first, last, this.numOrBlank(model.diamond.charge), { numeric: true })

      for (let r = 0; r < rows; r++) {
        const y = first + r
        const stone = model.stones[r]
        this.setCell(worksheet, `L${y}`, stone ? stone.name : '', { align: 'left' })
        this.setCell(worksheet, `M${y}`, stone ? stone.pcs || null : null)
        this.setCell(worksheet, `N${y}`, stone ? this.numOrBlank(stone.ct) : null, { numeric: true })
        this.setCell(worksheet, `O${y}`, stone ? this.numOrBlank(stone.pricePerCt) : null, { numeric: true })
        this.setCell(worksheet, `P${y}`, stone ? stone.charge : null, { numeric: true })

        const line = model.labor[r]
        if (line) {
          this.setCell(worksheet, `Q${y}`, line.name, { align: 'left' })
          this.setCell(worksheet, `R${y}`, line.pricePerPc, { numeric: true })
          this.setCell(worksheet, `S${y}`, line.total, { numeric: true })
        } else if (r === model.labor.length) {
          this.setCell(worksheet, `Q${y}`, 'Total Labor Price', { align: 'left', bold: true })
          this.setCell(worksheet, `R${y}`, null)
          this.setCell(worksheet, `S${y}`, model.laborTotal, { numeric: true, bold: true })
        } else {
          ;['Q', 'R', 'S'].forEach((col) => this.setCell(worksheet, `${col}${y}`, null))
        }
      }

      if (model.mode === 'single') {
        const t = model.single
        this.mergeSpan(worksheet, 'T', first, last, t.N, { numeric: true, bold: true })
        this.mergeSpan(worksheet, 'U', first, last, t.O, { numeric: true })
        this.mergeSpan(worksheet, 'V', first, last, t.P)
        this.mergeSpan(worksheet, 'W', first, last, t.Q, { numeric: true, bold: true })
      } else {
        for (let r = 0; r < rows; r++) {
          const y = first + r
          const t = model.options[r]
          this.setCell(worksheet, `T${y}`, t ? t.N : null, { numeric: true, bold: true })
          this.setCell(worksheet, `U${y}`, t ? t.O : null, { numeric: true })
          this.setCell(worksheet, `V${y}`, t ? t.P : null)
          this.setCell(worksheet, `W${y}`, t ? t.Q : null, { numeric: true, bold: true })
        }
      }

      const rowHeight = Math.max(15, MIN_BLOCK_HEIGHT_PT / rows)
      for (let y = first; y <= last; y++) worksheet.getRow(y).height = rowHeight

      const imageBase64 = this.imageCache.get(item.imageBlobPath || item.imagePath) || item.imageBase64
      if (imageBase64) itemImages.push({ imageBase64, rowIndex: first })

      row = last + 1
    })
    return { nextRow: row, itemImages }
  }

  buildFooter(worksheet, startRow) {
    let row = startRow + 1
    this.setText(worksheet, `A${row}:K${row}`, 'ORIGIN THAILAND', { size: 10, color: { argb: 'FF393939' } })
    this.setText(worksheet, `Q${row}:W${row}`, '______________________________', { size: 10, color: { argb: 'FF393939' } }, { horizontal: 'center' })
    row++
    this.setText(worksheet, `Q${row}:W${row}`, '(Authorized Signature and Company Stamp)', { size: 8, color: { argb: 'FF393939' } }, { horizontal: 'center' })
    row += 2
    ;[
      'Price is F.O.B. Bangkok not inclued freight and insurance',
      'Production time within 5-7 weeks',
      '50% payment of tt, 50% before the shipment.',
      'Gold weight, Diamond weight and Stones weight are approximately, the actual weight will be known after production is completed',
      'Minimun order 6 pcs per design / Minimun purchase US$ 5,000',
      'The price quotation is current gold price market at www.kitco.com (please confirm within 2 days)'
    ].forEach((text) => {
      this.setText(worksheet, `A${row}:${LAST_COL}${row}`, text, { size: 8, color: { argb: 'FF666666' } })
      row++
    })
  }

  async downloadExcel() {
    const workbook = await this.generateExcel()
    const fileName = `BreakdownPrice_${this.invoiceNo || 'NA'}_${dayjs().format('YYYYMMDD')}.xlsx`
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  }
}
