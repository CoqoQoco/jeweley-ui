import dayjs from 'dayjs'
import ExcelJS from 'exceljs'

export class SaleOrderExcelBuilder {
  constructor(soData, options = {}) {
    this.soData = soData || {}
    this.items = soData?.items || []
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: ' (+662) 2710834',
      email: 'info@dkbkk.com'
    }
    this.documentTitle = 'SALE ORDER'
    this.currencyUnit = options.currencyUnit || 'THB'
    this.currencyRate = Number(options.currencyRate) || 1
    this.showCifLabel = options.showCifLabel !== undefined ? options.showCifLabel : true

    // Financial adjustments — freight field (SO uses "freight", not freightAndInsurance)
    this.specialDiscount = Number(soData.specialDiscount) || 0
    this.specialAddition = Number(soData.specialAddition) || 0
    this.freightAndInsurance = Number(soData.freight) || Number(soData.freightAndInsurance) || 0
    this.vatPercent = Number(soData.vatPercent) || Number(soData.vat) || 0

    // Calculate totals (same formula as SaleOrderPdfBuilder)
    this.subtotal = this.calculateSubtotal()
    this.totalAfterDiscountAndAddition = this.subtotal - this.specialDiscount + this.specialAddition
    this.totalBeforeVat = this.totalAfterDiscountAndAddition + this.freightAndInsurance
    this.vatAmount = (this.totalBeforeVat * this.vatPercent) / 100
    this.totalAmount = this.totalBeforeVat + this.vatAmount

    // Assets (loaded async in prepare())
    this.logoBase64 = null
  }

  calculateSubtotal() {
    if (!this.items || !Array.isArray(this.items)) return 0
    let total = 0
    this.items.forEach((item) => {
      const price = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = price * (1 - discountPercent / 100)
      const convertedPrice = priceAfterDiscount / this.currencyRate
      total += convertedPrice * qty
    })
    return total
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
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
    if (!this.items || !Array.isArray(this.items)) return
    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')
    await Promise.all(
      this.items.map(async (item) => {
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
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'DK Jewelry Management System'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet(this.documentTitle, {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    })

    let currentRow = 1
    currentRow = this.buildHeader(worksheet, currentRow)
    currentRow = this.buildCompanyAndCustomerInfo(worksheet, currentRow)

    const { nextRow, itemImageData } = this.buildItemsTable(worksheet, currentRow)
    currentRow = nextRow

    currentRow = this.buildSummarySection(worksheet, currentRow)

    this.autoFitColumns(worksheet)

    // Add logo image
    if (this.logoBase64) {
      const rawBase64 = this.logoBase64.replace(/^data:image\/\w+;base64,/, '')
      const logoId = workbook.addImage({ base64: rawBase64, extension: 'png' })
      worksheet.addImage(logoId, {
        tl: { col: 0.1, row: 0.1 },
        ext: { width: 40, height: 40 }
      })
    }

    // Add item images
    for (const { imageBase64, rowIndex } of itemImageData) {
      if (!imageBase64) continue
      const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      const imgExt = imageBase64.includes('data:image/png') ? 'png' : 'jpeg'
      const imageId = workbook.addImage({ base64: rawBase64, extension: imgExt })
      const zeroRow = rowIndex - 1
      worksheet.addImage(imageId, {
        tl: { col: 1.1, row: zeroRow + 0.1 },
        ext: { width: 55, height: 55 }
      })
    }

    return workbook
  }

  // === HEADER SECTION ===

  buildHeader(worksheet, startRow) {
    let row = startRow

    // Row 1: Logo area (A) | Company Name (B-E) | Document Title (F-J)
    worksheet.getRow(row).height = 35

    worksheet.getCell(`A${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    worksheet.mergeCells(`B${row}:E${row}`)
    const companyNameCell = worksheet.getCell(`B${row}`)
    companyNameCell.value = 'Duang Kaew Jewelry'
    companyNameCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FF8B0000' } }
    companyNameCell.alignment = { vertical: 'middle', horizontal: 'left' }
    companyNameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }

    worksheet.mergeCells(`F${row}:J${row}`)
    const titleCell = worksheet.getCell(`F${row}`)
    titleCell.value = this.documentTitle
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF393939' } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }

    row++

    // Row 2: Logo area (A) | Slogan (B-E) | SO No.: label (F) | SO Number (G-J)
    worksheet.getRow(row).height = 20

    worksheet.getCell(`A${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    worksheet.mergeCells(`B${row}:E${row}`)
    const sloganCell = worksheet.getCell(`B${row}`)
    sloganCell.value = 'The first step is always the hardest'
    sloganCell.font = { name: 'Arial', size: 10, color: { argb: 'FF8B0000' } }
    sloganCell.alignment = { vertical: 'middle', horizontal: 'left' }
    sloganCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }

    worksheet.getCell(`F${row}`).value = 'SO No.:'
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }
    worksheet.getCell(`F${row}`).alignment = { vertical: 'middle', horizontal: 'right' }
    worksheet.getCell(`F${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    worksheet.mergeCells(`G${row}:J${row}`)
    worksheet.getCell(`G${row}`).value = this.soData.soNumber || ''
    worksheet.getCell(`G${row}`).font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FF8B0000' }
    }
    worksheet.getCell(`G${row}`).alignment = { vertical: 'middle', horizontal: 'left' }
    worksheet.getCell(`G${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    row++

    // Row 3: A-E gray fill | Date
    ;['A', 'B', 'C', 'D', 'E'].forEach((col) => {
      worksheet.getCell(`${col}${row}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
    })

    worksheet.getCell(`F${row}`).value = 'Date:'
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }
    worksheet.getCell(`F${row}`).alignment = { vertical: 'middle', horizontal: 'right' }
    worksheet.getCell(`F${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    worksheet.mergeCells(`G${row}:J${row}`)
    worksheet.getCell(`G${row}`).value = dayjs(this.soData.createDate).format('MMMM DD, YYYY')
    worksheet.getCell(`G${row}`).font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FF8B0000' }
    }
    worksheet.getCell(`G${row}`).alignment = { vertical: 'middle', horizontal: 'left' }
    worksheet.getCell(`G${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    row++
    row++ // Empty row

    return row
  }

  // === COMPANY & CUSTOMER INFO ===

  buildCompanyAndCustomerInfo(worksheet, startRow) {
    let row = startRow

    // Company header | Customer header
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = 'From: Duang Kaew Jewelry Manufacturer Co.,Ltd.'
    worksheet.getCell(`A${row}`).font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FF8B0000' }
    }

    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = `Customer: ${this.soData.customerName || ''}`
    worksheet.getCell(`F${row}`).font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FF8B0000' }
    }

    row++

    // Address
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = `Address: ${this.companyInfo.address}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = this.soData.customerAddress
      ? `Address: ${this.soData.customerAddress}`
      : ''
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    // TEL
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = `TEL: ${this.companyInfo.phone}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = this.soData.customerTel
      ? `TEL: ${this.soData.customerTel}`
      : ''
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    // FAX | Remark
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = `FAX: ${this.companyInfo.fax}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = this.soData.remark
      ? `Remark: ${this.soData.remark}`
      : ''
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    // Email | Currency
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = `E-Mail: ${this.companyInfo.email}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = `Currency: ${this.currencyUnit} (Rate: ${this.currencyRate})`
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++
    row++ // Empty row

    return row
  }

  // === ITEMS TABLE ===

  buildItemsTable(worksheet, startRow) {
    let row = startRow
    const itemImageData = []

    // Table Header — mirrors PDF columns exactly
    const headers = [
      'No.',
      'Image',
      'Style/Product',
      'Description',
      'Gold (gms)',
      'Diamond (cts)',
      'Gem (cts)',
      'Qty',
      `Price (${this.currencyUnit})`,
      `Amount (${this.currencyUnit})`
    ]

    headers.forEach((header, index) => {
      const col = String.fromCharCode(65 + index)
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = header
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF921313' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    worksheet.getRow(row).height = 25
    row++

    // Table Body
    let sumGold = 0,
      sumDiamond = 0,
      sumGem = 0,
      sumQty = 0,
      sumAmount = 0

    this.items.forEach((item, index) => {
      const appraisalPrice = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)
      const convertedPrice = priceAfterDiscount / this.currencyRate
      const amount = convertedPrice * qty

      // Build multiline material text (mirrors PDF buildMaterialTable)
      const buildMaterialText = (type) => {
        if (!item.materials || !Array.isArray(item.materials)) return ''
        const entries = item.materials.filter((m) => m.type === type)
        if (!entries.length) return ''
        return entries
          .map((m) => {
            const code =
              type === 'Gold'
                ? m.typeCode || ''
                : `(${m.qty || ''}) ${m.typeCode || ''}`
            const weight = m.weight ? Number(m.weight).toFixed(2) : '0.00'
            return `${code}  ${weight}`
          })
          .join('\n')
      }

      // Accumulate material weights for total row
      let goldWeight = 0,
        diamondWeight = 0,
        gemWeight = 0
      if (item.materials && Array.isArray(item.materials)) {
        item.materials.forEach((m) => {
          if (m.type === 'Gold') goldWeight += Number(m.weight) || 0
          if (m.type === 'Diamond') diamondWeight += Number(m.weight) || 0
          if (m.type === 'Gem') gemWeight += Number(m.weight) || 0
        })
      }
      sumGold += goldWeight
      sumDiamond += diamondWeight
      sumGem += gemWeight
      sumQty += qty
      sumAmount += amount

      // Style/Product — use stockNumber like PDF builder
      const styleProduct =
        item.stockNumber && item.productNumber
          ? `${item.stockNumber}/${item.productNumber}`
          : item.stockNumber || item.stockNumberOrigin || item.productNumber || ''

      const cells = [
        { col: 'A', value: index + 1, align: 'right', wrap: false },
        { col: 'B', value: '', align: 'center', wrap: false },
        { col: 'C', value: styleProduct, align: 'left', wrap: false },
        {
          col: 'D',
          value: item.description || item.productNumber || '',
          align: 'left',
          wrap: true
        },
        { col: 'E', value: buildMaterialText('Gold'), align: 'left', wrap: true },
        { col: 'F', value: buildMaterialText('Diamond'), align: 'left', wrap: true },
        { col: 'G', value: buildMaterialText('Gem'), align: 'left', wrap: true },
        { col: 'H', value: qty, align: 'right', wrap: false },
        { col: 'I', value: this.formatCurrency(convertedPrice), align: 'right', wrap: false },
        { col: 'J', value: this.formatCurrency(amount), align: 'right', wrap: false }
      ]

      cells.forEach(({ col, value, align, wrap }) => {
        const cell = worksheet.getCell(`${col}${row}`)
        cell.value = value
        cell.font = { name: 'Arial', size: 9 }
        cell.alignment = { vertical: 'top', horizontal: align, wrapText: wrap }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })

      // Row height — based on max material entries or image height
      const maxLines = item.materials
        ? Math.max(
            item.materials.filter((m) => m.type === 'Gold').length,
            item.materials.filter((m) => m.type === 'Diamond').length,
            item.materials.filter((m) => m.type === 'Gem').length,
            1
          )
        : 1
      const rowHeight = item.imageBase64
        ? Math.max(65, maxLines * 18)
        : Math.max(20, maxLines * 18)
      worksheet.getRow(row).height = rowHeight

      if (item.imageBase64) {
        itemImageData.push({ imageBase64: item.imageBase64, rowIndex: row })
      }

      row++
    })

    // Total Row (white text, dark red background)
    const totalRowData = [
      { col: 'A', value: 'Total', align: 'right' },
      { col: 'B', value: '' },
      { col: 'C', value: '' },
      { col: 'D', value: '' },
      { col: 'E', value: this.formatCurrency(sumGold), align: 'right' },
      { col: 'F', value: this.formatCurrency(sumDiamond), align: 'right' },
      { col: 'G', value: this.formatCurrency(sumGem), align: 'right' },
      { col: 'H', value: sumQty, align: 'right' },
      { col: 'I', value: '' },
      { col: 'J', value: this.formatCurrency(sumAmount), align: 'right' }
    ]
    totalRowData.forEach(({ col, value, align }) => {
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = value
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF921313' } }
      cell.alignment = { vertical: 'middle', horizontal: align || 'left' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    worksheet.getRow(row).height = 25
    row++

    // === Summary Rows (mirrors PDF buildFinalTableBody) ===

    // F.O.B Bangkok — always shown (mirrors PDF which always shows it)
    this.addSummaryRow(worksheet, row, 'F.O.B Bangkok', this.formatCurrency(this.subtotal))
    row++

    if (this.specialDiscount > 0) {
      this.addSummaryRow(
        worksheet,
        row,
        'SPECIAL DISCOUNT',
        '-' + this.formatCurrency(this.specialDiscount),
        'FFFF4D4D'
      )
      row++
    }

    if (this.specialAddition > 0) {
      this.addSummaryRow(
        worksheet,
        row,
        'SPECIAL ADDITION',
        '+' + this.formatCurrency(this.specialAddition),
        'FF038387'
      )
      row++
    }

    if (this.freightAndInsurance > 0) {
      this.addSummaryRow(
        worksheet,
        row,
        'FREIGHT & INSURANCE',
        this.formatCurrency(this.freightAndInsurance)
      )
      row++
    }

    if (this.vatPercent > 0) {
      this.addSummaryRow(worksheet, row, `VAT (${this.vatPercent}%)`, this.formatCurrency(this.vatAmount))
      row++
    }

    // Grand Total / C.I.F row
    const grandTotalInWords = this.convertNumberToWords(this.totalAmount)

    worksheet.mergeCells(`A${row}:G${row}`)
    const wordsCell = worksheet.getCell(`A${row}`)
    wordsCell.value = grandTotalInWords
    wordsCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    wordsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF921313' } }
    wordsCell.alignment = { vertical: 'middle', horizontal: 'left' }
    wordsCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    worksheet.mergeCells(`H${row}:I${row}`)
    const cifLabelCell = worksheet.getCell(`H${row}`)
    cifLabelCell.value = this.showCifLabel ? 'C.I.F' : ''
    cifLabelCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF921313' } }
    cifLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }
    cifLabelCell.alignment = { vertical: 'middle', horizontal: 'right' }
    cifLabelCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    const cifAmountCell = worksheet.getCell(`J${row}`)
    cifAmountCell.value = this.formatCurrency(this.totalAmount)
    cifAmountCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF921313' } }
    cifAmountCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }
    cifAmountCell.alignment = { vertical: 'middle', horizontal: 'right' }
    cifAmountCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    worksheet.getRow(row).height = 25
    row++
    row++ // Empty row

    return { nextRow: row, itemImageData }
  }

  // Summary row helper (label in H:I, value in J, empty borders A-G)
  addSummaryRow(worksheet, row, label, value, valueColor = 'FF921313') {
    ;['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((col) => {
      worksheet.getCell(`${col}${row}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    worksheet.mergeCells(`H${row}:I${row}`)
    worksheet.getCell(`H${row}`).value = label
    worksheet.getCell(`H${row}`).font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FF921313' }
    }
    worksheet.getCell(`H${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    worksheet.getCell(`H${row}`).alignment = { vertical: 'middle', horizontal: 'right' }
    worksheet.getCell(`H${row}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    worksheet.getCell(`J${row}`).value = value
    worksheet.getCell(`J${row}`).font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: valueColor }
    }
    worksheet.getCell(`J${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    worksheet.getCell(`J${row}`).alignment = { vertical: 'middle', horizontal: 'right' }
    worksheet.getCell(`J${row}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    worksheet.getRow(row).height = 20
  }

  // === SUMMARY SECTION (ONE PARCEL ONLY, WE CERTIFY, NET WEIGHT, Signature) ===

  buildSummarySection(worksheet, startRow) {
    let row = startRow

    // Calculate net weight (same formula as SaleOrderPdfBuilder.getSummarySection)
    let gold = 0,
      diamond = 0,
      gem = 0
    if (this.items && Array.isArray(this.items)) {
      this.items.forEach((item) => {
        if (item.materials) {
          item.materials.forEach((m) => {
            if (m.type === 'Gold') gold += Number(m.weight) || 0
            if (m.type === 'Diamond') diamond += Number(m.weight) || 0
            if (m.type === 'Gem') gem += Number(m.weight) || 0
          })
        }
      })
    }
    const net = (diamond + gem) / 5 + gold
    const netWeightText = `NET WEIGHT OF MERCHANDISES ${net ? net.toFixed(2) : (0).toFixed(2)} (gms.)`
    const smallFont = { name: 'Arial', size: 9 }

    // ONE PARCEL ONLY (A-G) | Confirm and Accept (H-J)
    worksheet.mergeCells(`A${row}:G${row}`)
    worksheet.getCell(`A${row}`).value = 'ONE PARCEL ONLY'
    worksheet.getCell(`A${row}`).font = smallFont

    worksheet.mergeCells(`H${row}:J${row}`)
    worksheet.getCell(`H${row}`).value = 'Confirm and Accept'
    worksheet.getCell(`H${row}`).font = smallFont
    worksheet.getCell(`H${row}`).alignment = { horizontal: 'center' }
    row++

    // WE CERTIFY
    worksheet.mergeCells(`A${row}:J${row}`)
    worksheet.getCell(`A${row}`).value = 'WE CERTIFY THAT THIS SALE ORDER IS TRUE AND CORRECT.'
    worksheet.getCell(`A${row}`).font = smallFont
    row++

    // NET WEIGHT
    worksheet.mergeCells(`A${row}:G${row}`)
    worksheet.getCell(`A${row}`).value = netWeightText
    worksheet.getCell(`A${row}`).font = smallFont
    row++

    // ORIGIN THAILAND (A-G) | Signature line (H-J)
    worksheet.mergeCells(`A${row}:G${row}`)
    worksheet.getCell(`A${row}`).value = 'ORIGIN THAILAND'
    worksheet.getCell(`A${row}`).font = smallFont

    worksheet.mergeCells(`H${row}:J${row}`)
    worksheet.getCell(`H${row}`).value = '______________________________'
    worksheet.getCell(`H${row}`).font = smallFont
    worksheet.getCell(`H${row}`).alignment = { horizontal: 'center' }
    row++

    // Authorized Signature label
    worksheet.mergeCells(`H${row}:J${row}`)
    worksheet.getCell(`H${row}`).value = '(Authorized Signature and Company Stamp)'
    worksheet.getCell(`H${row}`).font = { name: 'Arial', size: 8 }
    worksheet.getCell(`H${row}`).alignment = { horizontal: 'center' }
    row++

    return row
  }

  // === COLUMN WIDTHS ===

  autoFitColumns(worksheet) {
    const columnWidths = {
      A: 6,  // No.
      B: 12, // Image
      C: 20, // Style/Product
      D: 25, // Description
      E: 18, // Gold (gms)
      F: 18, // Diamond (cts)
      G: 18, // Gem (cts)
      H: 8,  // Qty
      I: 15, // Price
      J: 15  // Amount
    }
    Object.keys(columnWidths).forEach((col) => {
      worksheet.getColumn(col).width = columnWidths[col]
    })
  }

  // === NUMBER TO WORDS ===

  convertNumberToWords(number) {
    const prefix = this.currencyUnit ? `(${this.currencyUnit})` : ''
    return prefix + ' ' + this.numberToWords(Math.floor(number)) + ' ONLY'
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

  // === DOWNLOAD ===

  async downloadExcel(filename) {
    const workbook = await this.generateExcel()
    const defaultFilename = `SO_${this.soData.soNumber || 'DRAFT'}.xlsx`
    const finalFilename = filename || defaultFilename

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = finalFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return true
  }
}
