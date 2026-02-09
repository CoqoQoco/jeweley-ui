// src/services/utils/excel-helper.js
import ExcelJS from 'exceljs'

export class ExcelHelper {
  static defaultStyles = {
    headerFill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '921313' } 
    },
    headerFont: {
      name: 'Arial',
      bold: true,
      color: { argb: 'FFFFFFFF' }, 
      size: 10
    },
    headerAlignment: {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    },
    bodyAlignment: {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: true
    },
    bodyFont: {
      name: 'Arial',
      size: 10
    }
  }

  static async exportToExcel(data, options = {}) {
    try {
      const {
        filename = 'export.xlsx',
        sheetName = 'Sheet1',
        columns = null,
        styles = this.defaultStyles,
        columnWidths = {}
      } = options

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook()

      // Set workbook properties for Thai support

      workbook.creator = 'DK Jewelry Management System'
      workbook.lastModifiedBy = 'DK Jewelry Management System'

      workbook.created = new Date()
      workbook.modified = new Date()
      workbook.lastPrinted = new Date()

      const worksheet = workbook.addWorksheet(sheetName, {
        views: [{ showGridLines: true }]
      })

      // Set columns if provided, otherwise auto-generate from data
      const columnDefinitions =
        columns ||
        Object.keys(data[0]).map((key) => ({
          header: key,
          key: key
        }))

      worksheet.columns = columnDefinitions.map((col) => ({
        header: col.header,
        key: col.key,
        width: columnWidths[col.key] || 25
      }))

      // Style the header row
      const headerRow = worksheet.getRow(1)
      headerRow.height = 30 // Set header height

      headerRow.eachCell((cell) => {
        cell.fill = styles.headerFill
        cell.font = styles.headerFont
        cell.alignment = styles.headerAlignment
      })

      // Add data and style body rows
      worksheet.addRows(data)

      // Style body cells
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Skip header row
          row.eachCell((cell) => {
            cell.alignment = styles.bodyAlignment
            cell.font = styles.bodyFont
          })
          row.height = 25 // Set row height
        }
      })

      // Add borders to all cells
    //   worksheet.eachRow((row) => {
    //     row.eachCell((cell) => {
    //       cell.border = {
    //         top: { style: 'thin' },
    //         left: { style: 'thin' },
    //         bottom: { style: 'thin' },
    //         right: { style: 'thin' }
    //       }
    //     })
    //   })

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 10
          maxLength = Math.max(maxLength, cellLength)
        })
        column.width = Math.min(Math.max(maxLength + 2, 10), 50) // Min 10, Max 50
      })

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer()

      // Create Blob and trigger download
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error('Error exporting Excel:', error)
      return false
    }
  }

  static async exportToExcelMultiSheet(sheets, options = {}) {
    try {
      const {
        filename = 'export.xlsx',
        styles = this.defaultStyles
      } = options

      // Create workbook
      const workbook = new ExcelJS.Workbook()

      // Set workbook properties for Thai support
      workbook.creator = 'DK Jewelry Management System'
      workbook.lastModifiedBy = 'DK Jewelry Management System'
      workbook.created = new Date()
      workbook.modified = new Date()
      workbook.lastPrinted = new Date()

      // Create each sheet
      for (const sheet of sheets) {
        const {
          data,
          sheetName,
          columns = null,
          columnWidths = {}
        } = sheet

        if (!data || data.length === 0) continue

        const worksheet = workbook.addWorksheet(sheetName, {
          views: [{ showGridLines: true }]
        })

        // Set columns if provided, otherwise auto-generate from data
        const columnDefinitions =
          columns ||
          Object.keys(data[0]).map((key) => ({
            header: key,
            key: key
          }))

        worksheet.columns = columnDefinitions.map((col) => ({
          header: col.header,
          key: col.key,
          width: columnWidths[col.key] || 25
        }))

        // Style the header row
        const headerRow = worksheet.getRow(1)
        headerRow.height = 30 // Set header height

        headerRow.eachCell((cell) => {
          cell.fill = styles.headerFill
          cell.font = styles.headerFont
          cell.alignment = styles.headerAlignment
        })

        // Add data and style body rows
        worksheet.addRows(data)

        // Style body cells
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            // Skip header row
            row.eachCell((cell) => {
              cell.alignment = styles.bodyAlignment
              cell.font = styles.bodyFont
            })
            row.height = 25 // Set row height
          }
        })

        // Auto-fit columns
        worksheet.columns.forEach((column) => {
          let maxLength = 0
          column.eachCell({ includeEmpty: true }, (cell) => {
            const cellLength = cell.value ? cell.value.toString().length : 10
            maxLength = Math.max(maxLength, cellLength)
          })
          column.width = Math.min(Math.max(maxLength + 2, 10), 50) // Min 10, Max 50
        })
      }

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer()

      // Create Blob and trigger download
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error('Error exporting Excel:', error)
      return false
    }
  }

  static exportWithDatetime(data, filePrefix, options = {}) {
    const datetime = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${filePrefix}[${datetime}].xlsx`
    return this.exportToExcel(data, { ...options, filename })
  }
}
