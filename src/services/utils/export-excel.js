// src/services/utils/csv-helper.js
import Papa from 'papaparse'

export class CsvHelper {
  static defaultOptions = {
    quotes: false,
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ',',
    header: true,
    newline: '\r\n',
    skipEmptyLines: false,
    columns: null
  }

  static exportToCsv(data, filename, options = {}) {
    try {
      // Merge default options with provided options
      const parseOptions = { ...this.defaultOptions, ...options }

      // Add BOM for UTF-8
      const utf8BOM = '\uFEFF'

      // Parse data to CSV
      const csv = Papa.unparse(data, parseOptions)

      // Combine BOM with CSV data
      const csvData = utf8BOM + csv

      // Create Blob
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      // Set link attributes
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error('Error exporting CSV:', error)
      return false
    }
  }

  static exportWithDatetime(data, filePrefix) {
    const datetime = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${filePrefix}[${datetime}].csv`
    return this.exportToCsv(data, filename)
  }
}
