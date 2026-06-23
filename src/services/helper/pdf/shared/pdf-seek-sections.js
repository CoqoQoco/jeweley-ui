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
          x1: 0, y1: 0, x2: 555, y2: 0,
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
export function buildStatusBand({ thisInvoice, amountPaid, totalOwed, dueDate, accent = PDF_COLORS.primary }) {
  const labelStyle = { fontSize: 9, margin: [0, 0, 0, 2] }
  const valueStyle = { fontSize: 12, bold: true }

  return {
    margin: [0, 10, 0, 10],
    table: {
      widths: ['*', '*', '*', '*'],
      body: [
        // Label row
        [
          { ...labelStyle, text: 'This Invoice', color: PDF_COLORS.darkGray },
          { ...labelStyle, text: 'Amount Paid', color: PDF_COLORS.darkGray },
          { ...labelStyle, text: 'Total Owed', color: PDF_COLORS.white, fillColor: accent },
          { ...labelStyle, text: 'Due Date', color: PDF_COLORS.white, fillColor: accent }
        ],
        // Value row
        [
          { ...valueStyle, text: thisInvoice || '-', color: PDF_COLORS.darkGray },
          { ...valueStyle, text: amountPaid || '-', color: PDF_COLORS.darkGray },
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
      paddingTop: () => 6,
      paddingBottom: () => 6
    }
  }
}

/**
 * buildSeekSummary
 * Right-aligned financial summary table. rows = [{label, value, color?}].
 * Ends with a divider then Net Payable in accent color.
 */
export function buildSeekSummary({ rows = [], netPayableLabel = 'Net Payable', netPayableValue = '', accent = PDF_COLORS.primary }) {
  const body = rows.map(row => [
    { text: row.label || '', fontSize: 12, bold: true, color: row.color || PDF_COLORS.darkGray, alignment: 'left' },
    { text: row.value || '', fontSize: 12, bold: true, color: row.color || PDF_COLORS.darkGray, alignment: 'right' }
  ])

  // Divider row — top border (main color), before Net Payable
  body.push([
    { text: '', border: [false, true, false, false], borderColor: [null, accent, null, null], margin: [0, 2, 0, 2] },
    { text: '', border: [false, true, false, false], borderColor: [null, accent, null, null], margin: [0, 2, 0, 2] }
  ])

  // Net Payable row — emphasized
  body.push([
    { text: netPayableLabel, bold: true, fontSize: 15, color: accent, alignment: 'left' },
    { text: netPayableValue, bold: true, fontSize: 15, color: accent, alignment: 'right' }
  ])

  return {
    columns: [
      { width: '55%', text: '' },
      {
        width: '45%',
        table: {
          widths: ['*', 'auto'],
          body
        },
        layout: {
          vLineWidth: () => 0,
          hLineWidth: () => 0,
          paddingTop: () => 1.5,
          paddingBottom: () => 1.5,
          paddingLeft: () => 0,
          paddingRight: () => 0
        }
      }
    ],
    margin: [0, 8, 0, 4]
  }
}

/**
 * buildPaymentOptions
 * Bank transfer block. Returns null if bank.accountNumber is empty.
 */
export function buildPaymentOptions({ bank }) {
  if (!bank || !bank.accountNumber) return null

  const lines = [{ text: 'Bank Transfer', bold: true, fontSize: 9, margin: [0, 2, 0, 2] }]
  if (bank.bankName) lines.push({ text: 'Bank: ' + bank.bankName, fontSize: 9, color: PDF_COLORS.darkGray })
  if (bank.accountName) lines.push({ text: 'Account Name: ' + bank.accountName, fontSize: 9, color: PDF_COLORS.darkGray })
  if (bank.accountNumber) lines.push({ text: 'Account No: ' + bank.accountNumber, fontSize: 9, color: PDF_COLORS.darkGray })
  if (bank.swift) lines.push({ text: 'SWIFT: ' + bank.swift, fontSize: 9, color: PDF_COLORS.darkGray })
  if (bank.branch) lines.push({ text: 'Branch: ' + bank.branch, fontSize: 9, color: PDF_COLORS.darkGray })

  return {
    stack: [
      { text: 'Payment Options', bold: true, fontSize: 11, color: PDF_COLORS.darkGray, margin: [0, 10, 0, 4] },
      ...lines
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
          x1: 0, y1: 0, x2: 555, y2: 0,
          lineWidth: 0.8,
          lineColor: PDF_COLORS.lightGray
        }]
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'For ' + (companyName || ''), fontSize: 9, margin: [0, 0, 0, 24] },
              { text: '____________________', fontSize: 9, margin: [0, 0, 0, 2] },
              { text: 'Authorized Signature', fontSize: 9, color: PDF_COLORS.darkGray }
            ]
          },
          {
            width: '50%',
            alignment: 'right',
            stack: [
              { text: companyName || '', fontSize: 9, bold: true, margin: [0, 0, 0, 2] },
              { text: 'TAX ID: ' + (companyTaxId || ''), fontSize: 8, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 1] },
              { text: companyAddress || '', fontSize: 8, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 1] },
              { text: 'Tel: ' + (companyPhone || ''), fontSize: 8, color: PDF_COLORS.darkGray }
            ]
          }
        ]
      }
    ]
  }
}
