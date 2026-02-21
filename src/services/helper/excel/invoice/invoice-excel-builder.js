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
    itemsPerPage
  ) {
    this.data = data // ข้อมูลสินค้าที่เลือก
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

  // สร้าง Excel Workbook
  async generateExcel() {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'DK Jewelry Management System'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('Invoice', {
      pageSetup: { paperSize: 9, orientation: 'portrait' }
    })

    let currentRow = 1

    // === HEADER SECTION ===
    currentRow = this.buildHeader(worksheet, currentRow)

    // === COMPANY & CUSTOMER INFO ===
    currentRow = this.buildCompanyAndCustomerInfo(worksheet, currentRow)

    // === ITEMS TABLE ===
    currentRow = this.buildItemsTable(worksheet, currentRow)

    // === SUMMARY SECTION ===
    currentRow = this.buildSummarySection(worksheet, currentRow)

    // === FOOTER SECTION ===
    this.buildFooterSection(worksheet, currentRow)

    // Auto-fit columns
    this.autoFitColumns(worksheet)

    return workbook
  }

  // สร้างส่วน Header
  buildHeader(worksheet, startRow) {
    let row = startRow

    // Company Name
    worksheet.mergeCells(`A${row}:E${row}`)
    const companyNameCell = worksheet.getCell(`A${row}`)
    companyNameCell.value = 'Duang Kaew Jewelry'
    companyNameCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FF8B0000' } }
    companyNameCell.alignment = { vertical: 'middle', horizontal: 'left' }
    companyNameCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    worksheet.getRow(row).height = 30

    // Invoice Title
    worksheet.mergeCells(`F${row}:J${row}`)
    const invoiceTitleCell = worksheet.getCell(`F${row}`)
    invoiceTitleCell.value = 'INVOICE'
    invoiceTitleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF393939' } }
    invoiceTitleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    invoiceTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    row++

    // Slogan
    worksheet.mergeCells(`A${row}:E${row}`)
    const sloganCell = worksheet.getCell(`A${row}`)
    sloganCell.value = 'The first step is always the hardest'
    sloganCell.font = { name: 'Arial', size: 10, color: { argb: 'FF8B0000' } }
    sloganCell.alignment = { vertical: 'middle', horizontal: 'left' }
    sloganCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    // Invoice Details
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

    // Date
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

    // Fill left side with gray
    ;['A', 'B', 'C', 'D', 'E'].forEach((col) => {
      worksheet.getCell(`${col}${row}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
    })

    row++

    // SO Number
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

    // Fill left side with gray
    ;['A', 'B', 'C', 'D', 'E'].forEach((col) => {
      worksheet.getCell(`${col}${row}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
    })

    row++
    row++ // Empty row

    return row
  }

  // สร้างส่วนข้อมูลบริษัทและลูกค้า
  buildCompanyAndCustomerInfo(worksheet, startRow) {
    let row = startRow

    // Company Info Header
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = 'Form: Duang Kaew Jewelry Manufacturer Co.,Ltd.'
    worksheet.getCell(`A${row}`).font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FF8B0000' }
    }

    // Customer Info Header
    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = `Invoice To: ${this.customer.name || ''}`
    worksheet.getCell(`F${row}`).font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FF8B0000' }
    }

    row++

    // Company Address
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = `Address: ${this.companyInfo.address}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    // Customer Address
    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = `Address: ${this.customer.address || ''}`
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    // Company Phone
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = `TEL: ${this.companyInfo.phone}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    // Customer Phone
    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = `TEL: ${this.customer.phone || ''}`
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    // Company FAX
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = `FAX: ${this.companyInfo.fax}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    // Customer Email
    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = `E-mail: ${this.customer.email || ''}`
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++

    // Company Email
    worksheet.mergeCells(`A${row}:E${row}`)
    worksheet.getCell(`A${row}`).value = `E-Mail: ${this.companyInfo.email}`
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    // Currency Info
    worksheet.mergeCells(`F${row}:J${row}`)
    worksheet.getCell(`F${row}`).value = `Currency: ${this.currencyUnit} (Rate: ${this.currencyRate})`
    worksheet.getCell(`F${row}`).font = { name: 'Arial', size: 9, color: { argb: 'FF393939' } }

    row++
    row++ // Empty row

    return row
  }

  // สร้างตารางสินค้า
  buildItemsTable(worksheet, startRow) {
    let row = startRow

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
      const col = String.fromCharCode(65 + index) // A, B, C, ...
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = header
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8B0000' }
      }
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

      // Calculate material totals
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

      // Row data
      const rowData = [
        index + 1,
        '', // Image placeholder
        item.stockNumber && item.productNumber
          ? `${item.stockNumber}/${item.productNumber}`
          : item.stockNumber || item.productNumber || '',
        item.description || item.productNumber || '',
        this.formatCurrency(goldWeight),
        this.formatCurrency(diamondWeight),
        this.formatCurrency(gemWeight),
        qty,
        this.formatCurrency(convertedPrice),
        this.formatCurrency(amount)
      ]

      rowData.forEach((data, colIndex) => {
        const col = String.fromCharCode(65 + colIndex)
        const cell = worksheet.getCell(`${col}${row}`)
        cell.value = data
        cell.font = { name: 'Arial', size: 9 }
        cell.alignment = {
          vertical: 'middle',
          horizontal: colIndex === 0 || colIndex >= 4 ? 'right' : 'left'
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
      worksheet.getRow(row).height = 20

      row++
    })

    // Total Row
    const totalRowData = [
      'Total',
      '',
      '',
      '',
      this.formatCurrency(sumGold),
      this.formatCurrency(sumDiamond),
      this.formatCurrency(sumGem),
      sumQty,
      '',
      this.formatCurrency(sumAmount)
    ]

    totalRowData.forEach((data, colIndex) => {
      const col = String.fromCharCode(65 + colIndex)
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = data
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8B0000' }
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: colIndex === 0 ? 'right' : colIndex >= 4 ? 'right' : 'left'
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    worksheet.getRow(row).height = 25

    row++

    // F.O.B Bangkok Row
    this.addSummaryRow(worksheet, row, 'F.O.B Bangkok', this.formatCurrency(this.subtotal))
    row++

    // Special Discount
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

    // Special Addition
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

    // Freight & Insurance
    if (this.freightAndInsurance > 0) {
      this.addSummaryRow(
        worksheet,
        row,
        'FREIGHT & INSURANCE',
        this.formatCurrency(this.freightAndInsurance)
      )
      row++
    }

    // VAT (แสดงเฉพาะเมื่อมี VAT)
    if (this.vatPercent > 0) {
      this.addSummaryRow(
        worksheet,
        row,
        `VAT (${this.vatPercent}%)`,
        this.formatCurrency(this.vatAmount)
      )
      row++
    }

    // Grand Total (C.I.F)
    const grandTotal = this.totalAmount
    const grandTotalInWords = this.convertNumberToWords(grandTotal)

    // Total in words
    worksheet.mergeCells(`A${row}:G${row}`)
    worksheet.getCell(`A${row}`).value = grandTotalInWords
    worksheet.getCell(`A${row}`).font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    }
    worksheet.getCell(`A${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B0000' }
    }
    worksheet.getCell(`A${row}`).alignment = { vertical: 'middle', horizontal: 'left' }
    worksheet.getCell(`A${row}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    // C.I.F label
    worksheet.mergeCells(`H${row}:I${row}`)
    worksheet.getCell(`H${row}`).value = 'C.I.F'
    worksheet.getCell(`H${row}`).font = {
      name: 'Arial',
      size: 11,
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

    // C.I.F amount
    worksheet.getCell(`J${row}`).value = this.formatCurrency(grandTotal)
    worksheet.getCell(`J${row}`).font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FF8B0000' }
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

    worksheet.getRow(row).height = 25

    row++
    row++ // Empty row

    return row
  }

  // เพิ่มแถว Summary
  addSummaryRow(worksheet, row, label, value, valueColor = 'FF8B0000') {
    // Empty cells
    ;['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((col) => {
      const cell = worksheet.getCell(`${col}${row}`)
      cell.value = ''
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    // Label
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

    // Value
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

  // สร้างส่วน Summary
  buildSummarySection(worksheet, startRow) {
    let row = startRow

    // Calculate net weight
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

    // ONE PARCEL ONLY
    worksheet.mergeCells(`A${row}:G${row}`)
    worksheet.getCell(`A${row}`).value = 'ONE PARCEL ONLY'
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9 }

    worksheet.mergeCells(`H${row}:J${row}`)
    worksheet.getCell(`H${row}`).value = 'Confirm and Accept'
    worksheet.getCell(`H${row}`).font = { name: 'Arial', size: 9 }
    worksheet.getCell(`H${row}`).alignment = { vertical: 'middle', horizontal: 'center' }

    row++

    // WE CERTIFY
    worksheet.mergeCells(`A${row}:J${row}`)
    worksheet.getCell(`A${row}`).value = 'WE CERTIFY THAT THIS INVOICE TRUE AND CORRECT.'
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9 }

    row++

    // NET WEIGHT
    worksheet.mergeCells(`A${row}:G${row}`)
    worksheet.getCell(`A${row}`).value = netWeightText
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9 }

    row++

    // ORIGIN THAILAND
    worksheet.mergeCells(`A${row}:G${row}`)
    worksheet.getCell(`A${row}`).value = 'ORIGIN THAILAND'
    worksheet.getCell(`A${row}`).font = { name: 'Arial', size: 9 }

    worksheet.mergeCells(`H${row}:J${row}`)
    worksheet.getCell(`H${row}`).value = '______________________________'
    worksheet.getCell(`H${row}`).font = { name: 'Arial', size: 9 }
    worksheet.getCell(`H${row}`).alignment = { vertical: 'middle', horizontal: 'center' }

    row++

    // Signature text
    worksheet.mergeCells(`H${row}:J${row}`)
    worksheet.getCell(`H${row}`).value = '(Authorized Signature and Company Stamp)'
    worksheet.getCell(`H${row}`).font = { name: 'Arial', size: 9 }
    worksheet.getCell(`H${row}`).alignment = { vertical: 'middle', horizontal: 'center' }

    row++

    return row
  }

  // สร้างส่วน Footer
  buildFooterSection(worksheet, startRow) {
    // Footer can be added if needed
    return startRow
  }

  // Auto-fit columns
  autoFitColumns(worksheet) {
    const columnWidths = {
      A: 8, // No.
      B: 10, // Image
      C: 20, // Style/Product
      D: 25, // Description
      E: 12, // Gold
      F: 12, // Diamond
      G: 12, // Gem
      H: 8, // Qty
      I: 15, // Price
      J: 15 // Amount
    }

    Object.keys(columnWidths).forEach((col) => {
      worksheet.getColumn(col).width = columnWidths[col]
    })
  }

  // แปลงตัวเลขเป็นคำ
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

  // ดาวน์โหลดไฟล์ Excel
  async downloadExcel() {
    try {
      const workbook = await this.generateExcel()
      const invoiceFileName = `Invoice_${this.invoiceNo}_${dayjs().format('YYYYMMDD')}.xlsx`

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = invoiceFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error('Error downloading Excel:', error)
      throw error
    }
  }
}
