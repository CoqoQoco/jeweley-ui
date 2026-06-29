import { PDF_COLORS } from './pdf-theme.js'

/**
 * buildSeekHeader
 * Seek/JobsDB-style clean header: logo+company left, title right,
 * thin separator, bill-to left + meta rows right.
 */
export function buildSeekHeader({ logoBase64, companyName, companyTaxId, title, meta = [], billTo = {} }) {
  const logoCell = logoBase64
    ? { image: logoBase64, width: 34, height: 34, margin: [0, 0, 0, 0] }
    : { text: '', width: 34, margin: [0, 0, 0, 0] }

  const metaRows = meta.map(({ label, value }) => ({
    columns: [
      { text: label, fontSize: 9, color: PDF_COLORS.darkGray, width: '45%', alignment: 'right' },
      { text: value || '', fontSize: 9, bold: true, color: PDF_COLORS.darkGray, width: '55%', alignment: 'left', margin: [6, 0, 0, 0] }
    ],
    margin: [0, 1, 0, 1]
  }))

  const billToStack = [
    { text: 'Invoice To:', bold: true, fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 2] },
    { text: billTo.name || '', fontSize: 10, margin: [0, 0, 0, 1] },
    { text: billTo.address || '', fontSize: 9, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 1] }
  ]
  if (billTo.taxId) {
    billToStack.push({ text: 'Tax ID: ' + billTo.taxId, fontSize: 9, color: PDF_COLORS.darkGray })
  }

  return {
    stack: [
      // Row 1: company left | title right
      {
        columns: [
          {
            width: 'auto',
            columnGap: 16,
            columns: [
              logoCell,
              {
                width: 'auto',
                margin: [0, 2, 0, 0],
                stack: [
                  { text: companyName || '', fontSize: 15, bold: true, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 2] },
                  { text: 'TAX ID: ' + (companyTaxId || ''), fontSize: 9, color: PDF_COLORS.darkGray }
                ]
              }
            ]
          },
          {
            text: title || 'INVOICE',
            fontSize: 24,
            bold: true,
            color: PDF_COLORS.primary,
            alignment: 'right'
          }
        ]
      },

      // Separator (main color)
      {
        margin: [0, 8, 0, 8],
        canvas: [{
          type: 'line',
          x1: 0, y1: 0, x2: 565, y2: 0,
          lineWidth: 1.2,
          lineColor: PDF_COLORS.primary
        }]
      },

      // Row 2: bill-to left (60%) | meta right (40%)
      {
        columns: [
          {
            width: '60%',
            stack: billToStack
          },
          {
            width: '40%',
            stack: metaRows
          }
        ],
        margin: [0, 0, 0, 8]
      }
    ]
  }
}

/**
 * buildStatusBand
 * 4-quadrant band (This Invoice | Amount Paid | Total Owed | Due Date).
 * Last two columns use accent fill.
 */
export function buildStatusBand({ thisInvoice, amountPaid, totalOwed, dueDate, accent = PDF_COLORS.primary, green = PDF_COLORS.green }) {
  const labelStyle = { fontSize: 8, margin: [0, 0, 0, 2] }
  const valueStyle = { fontSize: 11, bold: true }

  return {
    margin: [0, 6, 0, 6],
    table: {
      widths: ['*', '*', '*', '*'],
      body: [
        // Label row
        [
          { ...labelStyle, text: 'This Invoice', color: PDF_COLORS.white, fillColor: green },
          { ...labelStyle, text: 'Amount Paid', color: PDF_COLORS.white, fillColor: green },
          { ...labelStyle, text: 'Total Owed', color: PDF_COLORS.white, fillColor: accent },
          { ...labelStyle, text: 'Due Date', color: PDF_COLORS.white, fillColor: accent }
        ],
        // Value row
        [
          { ...valueStyle, text: thisInvoice || '-', color: PDF_COLORS.white, fillColor: green },
          { ...valueStyle, text: amountPaid || '-', color: PDF_COLORS.white, fillColor: green },
          { ...valueStyle, text: totalOwed || '-', color: PDF_COLORS.white, fillColor: accent },
          { ...valueStyle, text: dueDate || '-', color: PDF_COLORS.white, fillColor: accent }
        ]
      ]
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 3,
      paddingBottom: () => 3
    }
  }
}

/**
 * buildSeekSummary
 * Right-aligned financial summary table. rows = [{label, value, color?}].
 * Ends with a divider then Net Payable in accent color.
 * Wrapped in a gray panel (panelBg).
 */
export function buildSeekSummary({ rows = [], netPayableLabel = 'Net Payable', netPayableValue = '', accent = PDF_COLORS.primary }) {
  const dividerIndex = rows.length

  const body = rows.map(row => {
    const rowColor = row.label === 'Amount Paid' ? PDF_COLORS.muted : (row.color || PDF_COLORS.darkGray)
    return [
      { text: row.label || '', fontSize: 10, bold: true, color: rowColor, alignment: 'left' },
      { text: row.value || '', fontSize: 10, bold: true, color: rowColor, alignment: 'right' }
    ]
  })

  // Net Payable row — accent divider line + red text
  body.push([
    { text: (netPayableLabel || '').toUpperCase(), bold: true, fontSize: 11, color: accent, alignment: 'left' },
    { text: netPayableValue, bold: true, fontSize: 13, color: accent, alignment: 'right' }
  ])

  return {
    table: {
      widths: ['*', 'auto'],
      body
    },
    layout: {
      vLineWidth: () => 0,
      hLineWidth: (i) => (i === dividerIndex ? 1 : 0),
      hLineColor: () => accent,
      paddingTop: (i) => (i === dividerIndex ? 5 : 1.5),
      paddingBottom: () => 1.5,
      paddingLeft: () => 0,
      paddingRight: () => 0
    }
  }
}

/**
 * buildPaymentOptions
 * Bank transfer block. Returns null if bank.accountNumber is empty.
 */
export function buildPaymentOptions({ bank }) {
  if (!bank || !bank.accountNumber) return null

  const bankLines = [
    { text: 'BANK TRANSFER', bold: true, fontSize: 8, color: PDF_COLORS.primary, margin: [0, 0, 0, 4] }
  ]
  if (bank.bankName) bankLines.push({ text: [{ text: 'Bank: ', color: PDF_COLORS.muted }, { text: bank.bankName, bold: true, color: PDF_COLORS.darkGray }], fontSize: 8, margin: [0, 1, 0, 1] })
  if (bank.accountName) bankLines.push({ text: [{ text: 'Account Name: ', color: PDF_COLORS.muted }, { text: bank.accountName, bold: true, color: PDF_COLORS.darkGray }], fontSize: 8, margin: [0, 1, 0, 1] })
  if (bank.accountNumber) bankLines.push({ text: [{ text: 'Account No: ', color: PDF_COLORS.muted }, { text: bank.accountNumber, bold: true, color: PDF_COLORS.darkGray }], fontSize: 8, margin: [0, 1, 0, 1] })
  if (bank.swift) bankLines.push({ text: [{ text: 'SWIFT: ', color: PDF_COLORS.muted }, { text: bank.swift, bold: true, color: PDF_COLORS.darkGray }], fontSize: 8, margin: [0, 1, 0, 1] })
  if (bank.branch) bankLines.push({ text: [{ text: 'Branch: ', color: PDF_COLORS.muted }, { text: bank.branch, bold: true, color: PDF_COLORS.darkGray }], fontSize: 8, margin: [0, 1, 0, 1] })

  return {
    stack: [
      {
        columns: [
          { width: 3, canvas: [{ type: 'rect', x: 0, y: 0, w: 3, h: 12, color: PDF_COLORS.primary }] },
          { width: '*', text: 'Payment Options', bold: true, fontSize: 11, color: PDF_COLORS.darkGray, margin: [6, 0, 0, 0] }
        ],
        margin: [0, 0, 0, 6]
      },
      {
        table: {
          widths: ['*'],
          body: [[{ fillColor: PDF_COLORS.panelBg, border: [false, false, false, false], stack: bankLines }]]
        },
        layout: { defaultBorder: false, paddingLeft: () => 6, paddingRight: () => 6, paddingTop: () => 6, paddingBottom: () => 6 }
      }
    ]
  }
}

/**
 * buildRemarks
 * Returns null if text is empty.
 */
export function buildRemarks({ text }) {
  if (!text) return null
  return {
    text: [{ text: 'Remarks: ', bold: true }, { text: String(text) }],
    fontSize: 9,
    color: PDF_COLORS.darkGray,
    margin: [0, 8, 0, 0]
  }
}

/**
 * buildSeekSignature
 * Top separator + two-column signature block.
 * Left: "For <company>" + signature line. Right: company details.
 */
export function buildSeekSignature({ companyName, companyTaxId, companyAddress, companyPhone }) {
  return {
    stack: [
      {
        margin: [0, 16, 0, 8],
        canvas: [{
          type: 'line',
          x1: 0, y1: 0, x2: 565, y2: 0,
          lineWidth: 0.8,
          lineColor: PDF_COLORS.lightGray
        }]
      },
      {
        columns: [
          {
            width: '*',
            alignment: 'left',
            stack: [
              { text: companyName || '', fontSize: 8, bold: true, margin: [0, 0, 0, 2] },
              { text: 'TAX ID: ' + (companyTaxId || ''), fontSize: 7, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 1] },
              { text: companyAddress || '', fontSize: 7, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 1] },
              { text: 'Tel: ' + (companyPhone || ''), fontSize: 7, color: PDF_COLORS.darkGray }
            ]
          },
          {
            width: 165,
            stack: [
              { text: ' ', fontSize: 8, margin: [0, 0, 0, 18] },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 0.8, lineColor: PDF_COLORS.darkGray, dash: { length: 2 } }], margin: [0, 0, 0, 4] },
              { text: 'Authorized Signature', fontSize: 8, bold: true, color: PDF_COLORS.darkGray },
              { text: 'For ' + (companyName || ''), fontSize: 6, color: PDF_COLORS.darkGray, margin: [0, 1, 0, 0] }
            ]
          },
          {
            width: 165,
            stack: [
              { text: ' ', fontSize: 8, margin: [0, 0, 0, 18] },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 0.8, lineColor: PDF_COLORS.darkGray, dash: { length: 2 } }], margin: [0, 0, 0, 4] },
              { text: 'Customer Signature', fontSize: 8, bold: true, color: PDF_COLORS.darkGray }
            ]
          }
        ]
      }
    ]
  }
}
