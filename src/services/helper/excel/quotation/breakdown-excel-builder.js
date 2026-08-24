import dayjs from 'dayjs'
import 'dayjs/locale/en'
import ExcelJS from 'exceljs'

function stdBorder() {
  return {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
}

export class BreakdownExcelBuilder {
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
    const profitPercentNum = Number(profitPercent)
    this.profitPercent =
      profitPercent === undefined || profitPercent === null || profitPercent === '' || !Number.isFinite(profitPercentNum)
        ? 15
        : profitPercentNum
    this.goldLossPercent = Number(goldLossPercent ?? 12)
    this.settingDiamondRate = Number(settingDiamondRate ?? 15)
    this.settingStoneRate = Number(settingStoneRate ?? 25)
    // fallback ไป goldPerOz รองรับใบเสนอราคาเก่าที่ยังไม่ได้บันทึกราคา spot
    this.goldSpotPrice = this.customer.goldSpotPrice || this.customer.goldPerOz || 0
    this.logoBase64 = null
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: ' (+662) 2710834',
      email: 'info@dkbkk.com'
    }
  }

  // === ASYNC PREPARE (logo + item images) ===

  async prepare() {
    try {
      const logoPath = new URL('@/assets/duangkaew-icon.png', import.meta.url).href
      this.logoBase64 = await this.loadImageAsBase64(logoPath)
    } catch {
      // logo load failure is non-critical — continue without logo
    }
    await this.prepareImages()
  }

  async prepareImages() {
    if (!this.data || !Array.isArray(this.data)) return
    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')
    await Promise.all(
      this.data.map(async (item) => {
        if (item.imageBase64) return
        const blobPath = item.imageBlobPath || item.imagePath
        if (!blobPath) return
        const base64 = await getAzureBlobAsBase64(blobPath, 'stock')
        if (base64 && base64.length > 0) item.imageBase64 = base64
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

  // === GENERATE EXCEL ===

  async generateExcel() {
    await this.prepare()

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'DK Jewelry Management System'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('BREAKDOWN', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    })

    let currentRow = 1
    currentRow = this.buildHeader(worksheet, currentRow)
    currentRow = this.buildCompanyAndCustomerInfo(worksheet, currentRow)

    const { nextRow, itemImageData } = this.buildItemsTable(worksheet, currentRow)
    currentRow = nextRow

    this.buildFooterSection(worksheet, currentRow)

    this.autoFitColumns(worksheet)

    if (this.logoBase64) {
      const rawBase64 = this.logoBase64.replace(/^data:image\/\w+;base64,/, '')
      const logoId = workbook.addImage({ base64: rawBase64, extension: 'png' })
      worksheet.addImage(logoId, {
        tl: { col: 0.1, row: 0.1 },
        ext: { width: 40, height: 40 }
      })
    }

    for (const { imageBase64, rowIndex } of itemImageData) {
      if (!imageBase64) continue
      const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      const imgExt = imageBase64.includes('data:image/png') ? 'png' : 'jpeg'
      const imageId = workbook.addImage({ base64: rawBase64, extension: imgExt })
      const zeroRow = rowIndex - 1
      worksheet.addImage(imageId, {
        tl: { col: 1.1, row: zeroRow + 0.1 },
        ext: { width: 50, height: 50 }
      })
    }

    return workbook
  }

  // === HEADER SECTION ===

  buildHeader(worksheet, startRow) {
    let row = startRow
    const grayFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }

    // Row 1: Logo (A) | Company Name (B:E) | BREAKDOWN title (F:L)
    worksheet.getRow(row).height = 35
    worksheet.getCell(`A${row}`).fill = grayFill

    worksheet.mergeCells(`B${row}:E${row}`)
    const companyNameCell = worksheet.getCell(`B${row}`)
    companyNameCell.value = 'Duang Kaew Jewelry'
    companyNameCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FF8B0000' } }
    companyNameCell.alignment = { vertical: 'middle', horizontal: 'left' }
    companyNameCell.fill = grayFill

    worksheet.mergeCells(`F${row}:M${row}`)
    const titleCell = worksheet.getCell(`F${row}`)
    titleCell.value = 'BREAKDOWN'
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF393939' } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    titleCell.fill = grayFill

    row++

    // Row 2: Logo (A) | Slogan (B:E) | No.: (F) | invoiceNo (G:L)
    worksheet.getRow(row).height = 20
    worksheet.getCell(`A${row}`).fill = grayFill

    worksheet.mergeCells(`B${row}:E${row}`)
    const sloganCell = worksheet.getCell(`B${row}`)
    sloganCell.value = 'The first step is always the hardest'
    sloganCell.font = { name: 'Arial', size: 10, color: { argb: 'FF8B0000' } }
    sloganCell.alignment = { vertical: 'middle', horizontal: 'left' }
    sloganCell.fill = grayFill

    const noLabelCell = worksheet.getCell(`F${row}`)
    noLabelCell.value = 'No.:'
    noLabelCell.font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }
    noLabelCell.alignment = { vertical: 'middle', horizontal: 'right' }
    noLabelCell.fill = grayFill

    worksheet.mergeCells(`G${row}:M${row}`)
    const noValueCell = worksheet.getCell(`G${row}`)
    noValueCell.value = this.invoiceNo || ''
    noValueCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF8B0000' } }
    noValueCell.alignment = { vertical: 'middle', horizontal: 'left' }
    noValueCell.fill = grayFill

    row++

    // Row 3: A:E gray | Date: (F) | date value (G:L)
    ;['A', 'B', 'C', 'D', 'E'].forEach((col) => {
      worksheet.getCell(`${col}${row}`).fill = grayFill
    })

    const dateLabelCell = worksheet.getCell(`F${row}`)
    dateLabelCell.value = 'Date:'
    dateLabelCell.font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }
    dateLabelCell.alignment = { vertical: 'middle', horizontal: 'right' }
    dateLabelCell.fill = grayFill

    worksheet.mergeCells(`G${row}:M${row}`)
    const dateValueCell = worksheet.getCell(`G${row}`)
    dateValueCell.value = dayjs(this.invoiceDate).locale('en').format('MMMM DD, YYYY')
    dateValueCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF8B0000' } }
    dateValueCell.alignment = { vertical: 'middle', horizontal: 'left' }
    dateValueCell.fill = grayFill

    row++

    // Row 4: A:E gray | Gold Spot: (F) | value (G:L)
    ;['A', 'B', 'C', 'D', 'E'].forEach((col) => {
      worksheet.getCell(`${col}${row}`).fill = grayFill
    })

    const goldLabelCell = worksheet.getCell(`F${row}`)
    goldLabelCell.value = 'Gold Spot:'
    goldLabelCell.font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }
    goldLabelCell.alignment = { vertical: 'middle', horizontal: 'right' }
    goldLabelCell.fill = grayFill

    worksheet.mergeCells(`G${row}:M${row}`)
    const goldValueCell = worksheet.getCell(`G${row}`)
    goldValueCell.value = this.goldSpotPrice ? `$${this.formatPrice(this.goldSpotPrice)} /Oz.` : '-'
    goldValueCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF8B0000' } }
    goldValueCell.alignment = { vertical: 'middle', horizontal: 'left' }
    goldValueCell.fill = grayFill

    row++
    row++ // empty spacer row

    return row
  }

  // === COMPANY & CUSTOMER INFO ===

  buildCompanyAndCustomerInfo(worksheet, startRow) {
    let row = startRow

    worksheet.mergeCells(`A${row}:F${row}`)
    worksheet.getCell(`A${row}`).value = 'Form: Duang Kaew Jewelry Manufacturer Co.,Ltd.'
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF8B0000' } }

    worksheet.mergeCells(`G${row}:M${row}`)
    worksheet.getCell(`G${row}`).value = `Consigned To: ${this.customer.name || ''}`
    worksheet.getCell(`G${row}`).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF8B0000' } }

    row++

    worksheet.mergeCells(`A${row}:F${row}`)
    worksheet.getCell(`A${row}`).value = this.companyInfo.address || ''
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`G${row}:M${row}`)
    worksheet.getCell(`G${row}`).value = `Address: ${this.customer.address || ''}`
    worksheet.getCell(`G${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    worksheet.mergeCells(`A${row}:F${row}`)
    worksheet.getCell(`A${row}`).value = `TEL: ${this.companyInfo.phone || ''}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`G${row}:M${row}`)
    worksheet.getCell(`G${row}`).value = `TEl: ${this.customer.tel || ''}`
    worksheet.getCell(`G${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    worksheet.mergeCells(`A${row}:F${row}`)
    worksheet.getCell(`A${row}`).value = `FAX: ${this.companyInfo.fax || ''}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`G${row}:M${row}`)
    worksheet.getCell(`G${row}`).value = `E-mail: ${this.customer.email || ''}`
    worksheet.getCell(`G${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    worksheet.mergeCells(`A${row}:F${row}`)
    worksheet.getCell(`A${row}`).value = `E-Mail: ${this.companyInfo.email || ''}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`G${row}:M${row}`)
    worksheet.getCell(`G${row}`).value = this.goldSpotPrice
      ? `Gold Spot: US$ ${this.formatPrice(this.goldSpotPrice)} /Oz.`
      : ''
    worksheet.getCell(`G${row}`).font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF393939' } }

    row++
    row++ // empty spacer row

    return row
  }

  // === ITEMS TABLE ===

  buildItemsTable(worksheet, startRow) {
    let row = startRow
    const itemImageData = []
    const multiplier = this.currencyMultiplier || 1

    const headers = [
      'No.',
      'Image',
      'QTY.',
      'Style/Product',
      'Type',
      'Description',
      'Qty Stone',
      'Price/Qty',
      'Weight',
      `Net Weight with Gold Loss ${this.goldLossPercent}%`,
      'Price/Weight',
      `Price/Unit (${this.currencyUnit})`,
      `Total (${this.currencyUnit})`
    ]
    const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']

    headers.forEach((header, idx) => {
      const cell = worksheet.getCell(`${colLetters[idx]}${row}`)
      cell.value = header
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B0000' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = stdBorder()
    })
    worksheet.getRow(row).height = 24
    row++

    ;(this.data || []).forEach((item, itemIdx) => {
      const priceTransactions = Array.isArray(item.priceTransactions) ? item.priceTransactions : []
      const goldList = priceTransactions.filter((t) => (t.nameGroup || '').toLowerCase() === 'gold')
      const gemList = priceTransactions.filter((t) => (t.nameGroup || '').toLowerCase() === 'gem')
      const workList = priceTransactions.filter((t) => (t.nameGroup || '').toLowerCase() === 'worker')
      const embedList = priceTransactions.filter((t) => (t.nameGroup || '').toLowerCase() === 'embed')
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

      const itemQty = item.qty || 1
      const itemStartRow = row

      goldList.forEach((t) => {
        this.writeStandardRow(worksheet, row, t, { multiplier, itemQty, includeWeight: true, isGold: true })
        row++
      })
      if (goldList.length) {
        this.mergeTypeCell(worksheet, itemStartRow, itemStartRow + goldList.length - 1, 'Gold')
      }

      const gemStartRow = row
      gemList.forEach((t) => {
        this.writeStandardRow(worksheet, row, t, { multiplier, itemQty, includeWeight: true })
        row++
      })
      if (gemList.length) {
        this.mergeTypeCell(worksheet, gemStartRow, gemStartRow + gemList.length - 1, 'Diamond / C. Stone')
      }

      const laborStartRow = row
      workList.forEach((t) => {
        this.writeLaborRow(worksheet, row, t, { multiplier, itemQty })
        row++
      })
      if (workList.length) {
        this.mergeTypeCell(worksheet, laborStartRow, laborStartRow + workList.length - 1, 'Labor')
      }

      const embedStartRow = row
      embedList.forEach((t) => {
        this.writeStandardRow(worksheet, row, t, { multiplier, itemQty, includeWeight: false })
        row++
      })
      if (embedList.length) {
        this.mergeTypeCell(worksheet, embedStartRow, embedStartRow + embedList.length - 1, 'Setting')
      }

      const etcStartRow = row
      etcList.forEach((t) => {
        this.writeStandardRow(worksheet, row, t, { multiplier, itemQty, includeWeight: true })
        row++
      })
      if (etcList.length) {
        this.mergeTypeCell(worksheet, etcStartRow, etcStartRow + etcList.length - 1, 'Etc')
      }

      const itemEndRow = row - 1

      if (itemEndRow >= itemStartRow) {
        this.mergeAndSetCell(worksheet, 'A', itemStartRow, itemEndRow, itemIdx + 1, 'center')
        this.mergeImageCell(worksheet, itemStartRow, itemEndRow)
        this.mergeAndSetCell(worksheet, 'C', itemStartRow, itemEndRow, itemQty, 'center')
        this.mergeAndSetCell(
          worksheet,
          'D',
          itemStartRow,
          itemEndRow,
          item.productNumber || item.stockNumberOrigin || item.stockNumber || '',
          'center'
        )

        worksheet.getRow(itemStartRow).height = Math.max(worksheet.getRow(itemStartRow).height || 0, 58)

        if (item.imageBase64) {
          itemImageData.push({ imageBase64: item.imageBase64, rowIndex: itemStartRow })
        }
      }

      const totalGold = goldList.reduce(
        (sum, t) => sum + (Number(t.totalPrice || 0) / multiplier) * itemQty,
        0
      )
      const totalGem = gemList.reduce(
        (sum, t) => sum + (Number(t.totalPrice || 0) / multiplier) * itemQty,
        0
      )
      const totalEtc = etcList.reduce(
        (sum, t) => sum + (Number(t.totalPrice || 0) / multiplier) * itemQty,
        0
      )
      const totalWork = workList.length
        ? (workList.reduce((sum, t) => sum + Number(t.totalPrice || 0), 0) / multiplier) * itemQty
        : 0
      const totalEmbed = embedList.length
        ? (embedList.reduce((sum, t) => sum + Number(t.totalPrice || 0), 0) / multiplier) * itemQty
        : 0

      const totalItemPrice = totalGold + totalGem + totalEtc + totalWork + totalEmbed
      const profitAmount = totalItemPrice * (this.profitPercent / 100)
      const totalWithProfit = totalItemPrice + profitAmount

      row = this.writeSummaryRow(worksheet, row, `Sub Total of ${item.productNumber} `, totalItemPrice)
      row = this.writeSummaryRow(worksheet, row, `Profit (${this.profitPercent}%) `, profitAmount)
      row = this.writeSummaryRow(worksheet, row, `Total of ${item.productNumber} `, totalWithProfit)
    })

    return { nextRow: row, itemImageData }
  }

  // === ROW BUILDING HELPERS ===

  writeStandardRow(worksheet, row, t, { multiplier, itemQty, includeWeight = true, isGold = false }) {
    const descCell = worksheet.getCell(`F${row}`)
    descCell.value = t.nameDescription || '-'
    descCell.font = { name: 'Arial', size: 9 }
    descCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    descCell.border = stdBorder()

    this.setConditionalNumber(worksheet, `G${row}`, t.qty, 1)
    this.setConditionalNumber(worksheet, `H${row}`, t.qtyPrice, multiplier)

    if (includeWeight) {
      this.setConditionalNumber(worksheet, `I${row}`, t.qtyWeight, 1)
      if (isGold) {
        this.setGoldLossWeightCell(worksheet, `J${row}`, t.qtyWeight)
      } else {
        this.setBlankCell(worksheet, `J${row}`)
      }
      this.setConditionalNumber(worksheet, `K${row}`, t.qtyWeightPrice, multiplier)
    } else {
      this.setBlankCell(worksheet, `I${row}`)
      this.setBlankCell(worksheet, `J${row}`)
      this.setBlankCell(worksheet, `K${row}`)
    }

    const priceUnit = (Number(t.totalPrice) || 0) / (multiplier || 1)
    this.setAlwaysNumber(worksheet, `L${row}`, priceUnit)
    this.setAlwaysNumber(worksheet, `M${row}`, priceUnit * (itemQty || 1))
  }

  writeLaborRow(worksheet, row, t, { multiplier, itemQty }) {
    const descCell = worksheet.getCell(`F${row}`)
    descCell.value = t.nameDescription || '-'
    descCell.font = { name: 'Arial', size: 9 }
    descCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    descCell.border = stdBorder()

    this.setBlankCell(worksheet, `G${row}`)
    this.setBlankCell(worksheet, `H${row}`)
    this.setBlankCell(worksheet, `I${row}`)
    this.setBlankCell(worksheet, `J${row}`)
    this.setBlankCell(worksheet, `K${row}`)

    const priceUnit = (Number(t.totalPrice) || 0) / (multiplier || 1)
    this.setAlwaysNumber(worksheet, `L${row}`, priceUnit)
    this.setAlwaysNumber(worksheet, `M${row}`, priceUnit * (itemQty || 1))
  }

  setConditionalNumber(worksheet, ref, rawValue, divisor) {
    const cell = worksheet.getCell(ref)
    const num = Number(rawValue)
    if (rawValue && num) {
      cell.value = num / (divisor || 1)
      cell.numFmt = '#,##0.00'
    } else {
      cell.value = null
    }
    cell.font = { name: 'Arial', size: 9 }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = stdBorder()
  }

  setGoldLossWeightCell(worksheet, ref, qtyWeight) {
    const cell = worksheet.getCell(ref)
    const num = Number(qtyWeight)
    if (qtyWeight && num) {
      cell.value = num * (1 + this.goldLossPercent / 100)
      cell.numFmt = '#,##0.00'
    } else {
      cell.value = null
    }
    cell.font = { name: 'Arial', size: 9 }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = stdBorder()
  }

  setAlwaysNumber(worksheet, ref, value) {
    const cell = worksheet.getCell(ref)
    cell.value = Number(value) || 0
    cell.numFmt = '#,##0.00'
    cell.font = { name: 'Arial', size: 9 }
    cell.alignment = { vertical: 'middle', horizontal: 'right' }
    cell.border = stdBorder()
  }

  setBlankCell(worksheet, ref) {
    const cell = worksheet.getCell(ref)
    cell.value = null
    cell.font = { name: 'Arial', size: 9 }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = stdBorder()
  }

  mergeAndSetCell(worksheet, colLetter, startRow, endRow, value, align) {
    if (endRow > startRow) {
      worksheet.mergeCells(`${colLetter}${startRow}:${colLetter}${endRow}`)
    }
    const cell = worksheet.getCell(`${colLetter}${startRow}`)
    cell.value = value
    cell.font = { name: 'Arial', size: 9 }
    cell.alignment = { vertical: 'middle', horizontal: align, wrapText: true }
    for (let r = startRow; r <= endRow; r++) {
      worksheet.getCell(`${colLetter}${r}`).border = stdBorder()
    }
  }

  mergeImageCell(worksheet, startRow, endRow) {
    if (endRow > startRow) {
      worksheet.mergeCells(`B${startRow}:B${endRow}`)
    }
    for (let r = startRow; r <= endRow; r++) {
      worksheet.getCell(`B${r}`).border = stdBorder()
    }
  }

  mergeTypeCell(worksheet, startRow, endRow, label) {
    if (endRow > startRow) {
      worksheet.mergeCells(`E${startRow}:E${endRow}`)
    }
    const cell = worksheet.getCell(`E${startRow}`)
    cell.value = label
    cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF393939' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    for (let r = startRow; r <= endRow; r++) {
      worksheet.getCell(`E${r}`).border = stdBorder()
    }
  }

  writeSummaryRow(worksheet, row, label, value) {
    worksheet.mergeCells(`A${row}:L${row}`)
    const labelCell = worksheet.getCell(`A${row}`)
    labelCell.value = label
    labelCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF8B0000' } }
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }
    labelCell.alignment = { vertical: 'middle', horizontal: 'right' }
    labelCell.border = stdBorder()

    const valueCell = worksheet.getCell(`M${row}`)
    valueCell.value = Number(value) || 0
    valueCell.numFmt = '#,##0.00'
    valueCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF8B0000' } }
    valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }
    valueCell.alignment = { vertical: 'middle', horizontal: 'right' }
    valueCell.border = stdBorder()

    worksheet.getRow(row).height = 20
    return row + 1
  }

  // === FOOTER SECTION (Signature + Conditions) ===

  buildFooterSection(worksheet, startRow) {
    let row = startRow + 1

    worksheet.mergeCells(`A${row}:H${row}`)
    worksheet.getCell(`A${row}`).value = 'ORIGIN THAILAND'
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 10, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`I${row}:M${row}`)
    worksheet.getCell(`I${row}`).value = '______________________________'
    worksheet.getCell(`I${row}`).font = { name: 'Arial', size: 10, color: { argb: 'FF393939' } }
    worksheet.getCell(`I${row}`).alignment = { horizontal: 'center' }

    row++

    worksheet.mergeCells(`I${row}:M${row}`)
    worksheet.getCell(`I${row}`).value = '(Authorized Signature and Company Stamp)'
    worksheet.getCell(`I${row}`).font = { name: 'Arial', size: 8, color: { argb: 'FF393939' } }
    worksheet.getCell(`I${row}`).alignment = { horizontal: 'center' }

    row += 2

    const conditions = [
      'Price is F.O.B. Bangkok not inclued freight and insurance',
      'Production time within 5-7 weeks',
      '50% payment of tt, 50% before the shipment.',
      'Gold weight, Diamond weight and Stones weight are approximately, the actual weight will be known after production is completed',
      'Minimun order 6 pcs per design / Minimun purchase US$ 5,000',
      'The price quotation is current gold price market at www.kitco.com (please confirm within 2 days)'
    ]

    conditions.forEach((text) => {
      worksheet.mergeCells(`A${row}:M${row}`)
      const cell = worksheet.getCell(`A${row}`)
      cell.value = text
      cell.font = { name: 'Arial', size: 8, color: { argb: 'FF666666' } }
      row++
    })
  }

  // === COLUMN WIDTHS ===

  autoFitColumns(worksheet) {
    const columnWidths = {
      A: 6, // No.
      B: 10, // Image
      C: 8, // QTY.
      D: 18, // Style/Product
      E: 12, // Type
      F: 24, // Description
      G: 10, // Qty Stone
      H: 12, // Price/Qty
      I: 10, // Weight
      J: 16, // Net Weight with Gold Loss
      K: 12, // Price/Weight
      L: 14, // Price/Unit
      M: 14 // Total
    }
    Object.keys(columnWidths).forEach((col) => {
      worksheet.getColumn(col).width = columnWidths[col]
    })
  }

  // === HELPERS ===

  formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) return '0.00'
    return price.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // === DOWNLOAD ===

  async downloadExcel() {
    const workbook = await this.generateExcel()
    const fileName = `Breakdown_${this.invoiceNo || 'NA'}_${dayjs().format('YYYYMMDD')}.xlsx`

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
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
