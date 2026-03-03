import dayjs from 'dayjs'
import ExcelJS from 'exceljs'

export class InvoiceExcelBuilder {
  constructor(
    data,
    customer,
    invoiceDate,
    saleOrderData,
    currencyUnit,
    currencyRate,
    invoiceNo,
    itemsPerPage,
    options = {}
  ) {
    this.data = data
    this.customer = customer || {}
    this.saleOrderData = saleOrderData || {}
    this.invoiceDate = invoiceDate || dayjs()
    this.companyInfo = {
      name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
      address: '200/16 Rama 6 Rd.,Phayathai,Phayathai,Bangkok 10400 Thailand',
      phone: '(+662) 6196601-4',
      fax: ' (+662) 2710834',
      email: 'info@dkbkk.com'
    }
    this.invoiceNo = invoiceNo || this.generateInvoiceNumber()
    this.currencyUnit = currencyUnit || 'THB'
    this.currencyRate = Number(currencyRate) || 1

    // Financial adjustments
    this.specialDiscount = Number(saleOrderData.specialDiscount) || 0
    this.specialAddition = Number(saleOrderData.specialAddition) || 0
    this.freightAndInsurance = Number(saleOrderData.freightAndInsurance) || 0
    this.vatPercent = Number(saleOrderData.vatPercent) || Number(saleOrderData.vat) || 0

    // Calculate totals
    this.subtotal = this.calculateSubtotal()
    this.totalAfterDiscountAndAddition = this.subtotal - this.specialDiscount + this.specialAddition
    this.totalBeforeVat = this.totalAfterDiscountAndAddition + this.freightAndInsurance
    this.vatAmount = (this.totalBeforeVat * this.vatPercent) / 100
    this.totalAmount = this.totalBeforeVat + this.vatAmount

    // Options (configurable per document type)
    this.documentTitle = options.documentTitle || 'QUOTATION'
    this.consignedLabel = options.consignedLabel || 'Consigned To'
    this.showCifLabel = options.showCifLabel !== undefined ? options.showCifLabel : true
    this.showConditions = options.showConditions !== undefined ? options.showConditions : true

    // Assets (loaded async in prepare())
    this.logoBase64 = null
  }

  calculateSubtotal() {
    if (!this.data || !Array.isArray(this.data)) return 0
    let total = 0
    this.data.forEach((item) => {
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

  generateInvoiceNumber() {
    const date = dayjs()
    const timestamp = date.format('YYMMDDHHmmss')
    return `INV-${timestamp}`
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

    const worksheet = workbook.addWorksheet(this.documentTitle, {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    })

    let currentRow = 1
    currentRow = this.buildHeader(worksheet, currentRow)
    currentRow = this.buildCompanyAndCustomerInfo(worksheet, currentRow)

    const { nextRow, itemImageData } = this.buildItemsTable(worksheet, currentRow)
    currentRow = nextRow

    currentRow = this.buildSummarySection(worksheet, currentRow)
    this.buildFooterSection(worksheet, currentRow)

    this.autoFitColumns(worksheet)

    // Add logo image — use ext (fixed pixel size) to preserve aspect ratio
    if (this.logoBase64) {
      const rawBase64 = this.logoBase64.replace(/^data:image\/\w+;base64,/, '')
      const logoId = workbook.addImage({ base64: rawBase64, extension: 'png' })
      worksheet.addImage(logoId, {
        tl: { col: 0.1, row: 0.1 },
        ext: { width: 40, height: 40 }
      })
    }

    // Add item images — use ext (fixed pixel size) to preserve aspect ratio
    for (const { imageBase64, rowIndex } of itemImageData) {
      if (!imageBase64) continue
      const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      const imgExt = imageBase64.includes('data:image/png') ? 'png' : 'jpeg'
      const imageId = workbook.addImage({ base64: rawBase64, extension: imgExt })
      const zeroRow = rowIndex - 1 // convert 1-indexed worksheet row to 0-indexed
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

    // A1: Logo placeholder — logo image overlaid here by generateExcel()
    worksheet.getCell(`A${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    // B1:E1 Company Name
    worksheet.mergeCells(`B${row}:E${row}`)
    const companyNameCell = worksheet.getCell(`B${row}`)
    companyNameCell.value = 'Duang Kaew Jewelry'
    companyNameCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FF8B0000' } }
    companyNameCell.alignment = { vertical: 'middle', horizontal: 'left' }
    companyNameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }

    // F1:J1 Document Title (QUOTATION / INVOICE)
    worksheet.mergeCells(`F${row}:J${row}`)
    const titleCell = worksheet.getCell(`F${row}`)
    titleCell.value = this.documentTitle
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF393939' } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }

    row++

    // Row 2: Logo area (A) | Slogan (B-E) | No.: label (F) | Invoice No (G-J)
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

    worksheet.getCell(`F${row}`).value = 'No.:'
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }
    worksheet.getCell(`F${row}`).alignment = { vertical: 'middle', horizontal: 'right' }
    worksheet.getCell(`F${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    worksheet.mergeCells(`G${row}:J${row}`)
    worksheet.getCell(`G${row}`).value = this.invoiceNo
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
    worksheet.getCell(`G${row}`).value = dayjs(this.invoiceDate).format('MMMM DD, YYYY')
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

    // Row 4: A-E gray fill | SO#
    ;['A', 'B', 'C', 'D', 'E'].forEach((col) => {
      worksheet.getCell(`${col}${row}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
    })

    worksheet.getCell(`F${row}`).value = 'SO#:'
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }
    worksheet.getCell(`F${row}`).alignment = { vertical: 'middle', horizontal: 'right' }
    worksheet.getCell(`F${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    worksheet.mergeCells(`G${row}:J${row}`)
    worksheet.getCell(`G${row}`).value =
      this.saleOrderData.soNumber || this.saleOrderData.number || ''
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
    worksheet.getCell(`A${row}`).value = 'Form: Duang Kaew Jewelry Manufacturer Co.,Ltd.'
    worksheet.getCell(`A${row}`).font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FF8B0000' }
    }

    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = `${this.consignedLabel}: ${this.customer.name || ''}`
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
    worksheet.getCell(`F${row}`).value = `Address: ${this.customer.address || ''}`
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    // TEL
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = `TEL: ${this.companyInfo.phone}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = `TEL: ${this.customer.phone || this.customer.tel || ''}`
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    // FAX | Email
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = `FAX: ${this.companyInfo.fax}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = `E-mail: ${this.customer.email || ''}`
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
    const itemImageData = [] // collect { imageBase64, rowIndex } for generateExcel to embed

    // Table Header
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
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B0000' } }
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

    this.data.forEach((item, index) => {
      const appraisalPrice = Number(item.appraisalPrice) || 0
      const qty = Number(item.qty) || 0
      const discountPercent = Number(item.discountPercent) || 0
      const priceAfterDiscount = appraisalPrice * (1 - discountPercent / 100)
      const convertedPrice = priceAfterDiscount / this.currencyRate
      const amount = convertedPrice * qty

      // Build multiline material text (matching PDF mini-table layout)
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

      // Calculate total material weights for sum row
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

      // Style/Product — use stockNumberOrigin like PDF builder
      const styleProduct =
        item.stockNumberOrigin && item.productNumber
          ? `${item.stockNumberOrigin}/${item.productNumber}`
          : item.stockNumberOrigin || item.stockNumber || item.productNumber || ''

      // Row cell data
      const cells = [
        { col: 'A', value: index + 1, align: 'right', wrap: false },
        { col: 'B', value: '', align: 'center', wrap: false }, // image placeholder
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

      // Row height — based on max material entries (or image height)
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

      // Collect image info — generateExcel() will embed the image
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
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B0000' } }
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

    // === Summary Rows ===
    const hasAnyExtra =
      this.specialDiscount > 0 ||
      this.specialAddition > 0 ||
      this.freightAndInsurance > 0 ||
      this.vatPercent > 0

    // F.O.B Bangkok — conditional (only when extras exist, matching PDF behaviour)
    if (hasAnyExtra) {
      this.addSummaryRow(worksheet, row, 'F.O.B Bangkok', this.formatCurrency(this.subtotal))
      row++
    }

    if (this.specialDiscount > 0) {
      this.addSummaryRow(
        worksheet,
        row,
        'SPECIAL DISCOUNT',
        '-' + this.formatCurrency(this.specialDiscount),
        'FF8B0000'
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

    // SUB TOTAL + VAT (matching PDF — shown only when vatPercent > 0)
    if (this.vatPercent > 0) {
      this.addSummaryRow(worksheet, row, 'SUB TOTAL', this.formatCurrency(this.totalBeforeVat))
      row++
      this.addSummaryRow(
        worksheet,
        row,
        `VAT (${this.vatPercent}%)`,
        this.formatCurrency(this.vatAmount)
      )
      row++
    }

    // Grand Total / C.I.F row (number in words left | C.I.F + amount right)
    const grandTotalInWords = this.convertNumberToWords(this.totalAmount)

    worksheet.mergeCells(`A${row}:G${row}`)
    const wordsCell = worksheet.getCell(`A${row}`)
    wordsCell.value = grandTotalInWords
    wordsCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
    wordsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B0000' } }
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
    cifLabelCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF8B0000' } }
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
    cifAmountCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF8B0000' } }
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
  addSummaryRow(worksheet, row, label, value, valueColor = 'FF8B0000') {
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
      color: { argb: 'FF8B0000' }
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

    // Calculate net weight (same formula as PDF)
    let gold = 0,
      diamond = 0,
      gem = 0
    if (this.data && Array.isArray(this.data)) {
      this.data.forEach((item) => {
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
    worksheet.getCell(`A${row}`).value = 'WE CERTIFY THAT THIS INVOICE TRUE AND CORRECT.'
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

  // === FOOTER SECTION (Conditions list) ===

  buildFooterSection(worksheet, startRow) {
    if (!this.showConditions) return

    let row = startRow + 1 // blank row before conditions

    const conditions = [
      'Price is F.O.B. Bangkok not included freight and insurance',
      'Production time within 5-7 weeks',
      '40% payment of tt, 60% before the shipment.',
      'Gold weight, Diamond weight and Stones weight are approximately, the actual weight will be known after production is completed',
      'Minimun order 10 pcs per design / Minimun purchase US$ 5,000',
      'The price quotation is current gold price market at www.kitco.com (please confirm within 2 days)'
    ]

    conditions.forEach((condition, i) => {
      worksheet.mergeCells(`A${row}:J${row}`)
      const cell = worksheet.getCell(`A${row}`)
      cell.value = `${i + 1}. ${condition}`
      cell.font = { name: 'Arial', size: 8, color: { argb: 'FF393939' } }
      row++
    })
  }

  // === COLUMN WIDTHS ===

  autoFitColumns(worksheet) {
    const columnWidths = {
      A: 6, // No.
      B: 12, // Image
      C: 20, // Style/Product
      D: 25, // Description
      E: 18, // Gold (gms) — multiline
      F: 18, // Diamond (cts) — multiline
      G: 18, // Gem (cts) — multiline
      H: 8, // Qty
      I: 15, // Price
      J: 15 // Amount
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

  async downloadExcel() {
    const workbook = await this.generateExcel()
    const prefix = this.documentTitle === 'QUOTATION' ? 'Quotation' : 'Invoice'
    const fileName = `${prefix}_${this.invoiceNo}_${dayjs().format('YYYYMMDD')}.xlsx`

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
