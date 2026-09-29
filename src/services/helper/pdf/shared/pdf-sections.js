import { PDF_COLORS } from './pdf-theme.js'

/**
 * buildDocumentHeader — TK202609250001 "Variant A" header, shared by quotation,
 * sale-order, invoice, delivery, breakdown and appraisal-history builders.
 * Single grey band (logo + company block | doc title/meta), one separator rule,
 * then a full-width 60/40 column block for customer/doc-specific info.
 *
 * pdfmake mutates content nodes during layout — this function builds a fresh
 * object tree on every call, so it is safe to call once per page.
 *
 * @param {Object} params
 * @param {string|null} params.logoBase64  - company logo as base64 data-URI
 * @param {Object}      [params.company]   - { name, address, phone, fax, email }
 * @param {Object}      params.rightStack  - full pdfmake node for the right cell (title/No./Date/etc., doc-specific)
 * @param {Array}       [params.customerLeft]  - content nodes for the 60% left column below the rule
 * @param {Array}       [params.customerRight] - content nodes for the 40% right column below the rule
 * @param {boolean}     [params.forcePageBreak] - adds pageBreak:'before' (page 2+ headers)
 * @param {boolean}     [params.hideCompany]    - hide logo/company block, keep grey band empty
 * @param {number}      [params.ruleWidth]      - separator line length in pt (default 575 = portrait A4 content width)
 * @returns {Object} pdfmake content node
 */
export function buildDocumentHeader({
  logoBase64,
  company = {},
  rightStack,
  customerLeft = [],
  customerRight = [],
  forcePageBreak = false,
  hideCompany = false,
  ruleWidth = 575
}) {
  const leftCell = hideCompany
    ? { text: '', fillColor: PDF_COLORS.lightGray }
    : {
        fillColor: PDF_COLORS.lightGray,
        columns: [
          {
            width: 62,
            stack: [
              logoBase64
                ? { image: logoBase64, width: 42, height: 42, margin: [15, 9, 0, 0] }
                : { text: 'LOGO', fontSize: 9, color: PDF_COLORS.darkGray, alignment: 'center', margin: [10, 15, 0, 0] }
            ]
          },
          {
            width: '*',
            margin: [8, 5, 0, 5],
            stack: [
              { text: 'Duang Kaew Jewelry', fontSize: 20, bold: true, color: PDF_COLORS.primary, margin: [0, 0, 0, -3] },
              { text: company.name || '', fontSize: 9.5, bold: true, color: PDF_COLORS.primary },
              { text: company.address || '', fontSize: 8, color: PDF_COLORS.darkGray },
              {
                text: `TEL: ${company.phone || ''}   FAX: ${company.fax || ''}   E-mail: ${company.email || ''}`,
                fontSize: 8,
                color: PDF_COLORS.darkGray
              }
            ]
          }
        ]
      }

  return {
    ...(forcePageBreak ? { pageBreak: 'before' } : {}),
    stack: [
      {
        margin: [-10, -10, -10, 0],
        table: {
          widths: ['72%', '28%'],
          body: [[leftCell, rightStack]]
        },
        layout: 'noBorders'
      },
      {
        margin: [0, 4, 0, 3],
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: ruleWidth, y2: 0, lineWidth: 1.5, lineColor: PDF_COLORS.lightGray }]
      },
      {
        margin: [0, 2, 0, 0],
        columns: [
          { width: '60%', stack: customerLeft },
          { width: '40%', stack: customerRight }
        ]
      }
    ]
  }
}

/**
 * buildHeaderBlock
 * Renders the top of each PDF page: logo + company name (left) | title + meta rows (right),
 * followed by a separator line and a two-column bill-from / bill-to block.
 *
 * @param {Object} params
 * @param {string|null}  params.logoBase64  - company logo as base64 data-URI
 * @param {Object}       params.company     - { name, address, phone, fax, email, tagline }
 * @param {string}       params.title       - document title shown in the right column, e.g. "INVOICE"
 * @param {Array}        params.meta        - label/value pairs: [{ label: 'No.:', value: '...' }, …]
 * @param {Object}       params.billTo      - { name, address, phone, email, taxId }
 * @returns {Object} pdfmake content block
 */
export function buildHeaderBlock({ logoBase64, company, title, meta = [], billTo = {} }) {
  const logoCell = logoBase64
    ? { image: logoBase64, width: 35, height: 35, margin: [15, 10, 10, 0] }
    : { text: '', margin: [15, 10, 10, 0] }

  const metaRows = meta.map(({ label, value }) => ({
    columns: [
      { text: label, fontSize: 9, color: PDF_COLORS.darkGray, alignment: 'right', width: '45%' },
      { text: value || '', fontSize: 12, bold: true, color: PDF_COLORS.primary, alignment: 'left', width: '55%', margin: [5, 0, 0, 0] }
    ]
  }))

  return {
    stack: [
      // Top header bar: company brand (left) + document title + meta (right)
      {
        margin: [-10, -10, -10, 0],
        table: {
          widths: ['70%', '30%'],
          body: [
            [
              {
                fillColor: PDF_COLORS.lightGray,
                stack: [
                  {
                    columns: [
                      logoCell,
                      {
                        stack: [
                          {
                            text: company.shortName || 'Duang Kaew Jewelry',
                            fontSize: 30,
                            bold: true,
                            color: PDF_COLORS.primary,
                            margin: [25, 5, 0, 0]
                          },
                          {
                            text: company.tagline || 'The first step is always the hardest',
                            fontSize: 12,
                            color: PDF_COLORS.primary,
                            margin: [25, -10, 0, 0]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                stack: [
                  {
                    text: title,
                    fontSize: 20,
                    color: PDF_COLORS.darkGray,
                    alignment: 'center',
                    margin: [0, 10, 0, 0]
                  },
                  ...metaRows
                ]
              }
            ]
          ]
        },
        layout: 'noBorders'
      },

      // Separator
      {
        margin: [0, 0, 0, 5],
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 675, y2: 0, lineWidth: 2, lineColor: PDF_COLORS.lightGray }]
      },

      // Bill-from (left) / Bill-to (right)
      {
        margin: [0, 0, 0, 0],
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'From: ' + (company.name || ''), fontSize: 14, bold: true, color: PDF_COLORS.primary, margin: [0, 0, 0, 0] },
              { text: 'Address: ' + (company.address || ''), fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 0] },
              { text: 'TEL: ' + (company.phone || ''), fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 0] },
              { text: 'FAX: ' + (company.fax || ''), fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 0] },
              { text: 'E-Mail: ' + (company.email || ''), fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 0] }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'Invoice To: ' + (billTo.name || ''), fontSize: 14, bold: true, color: PDF_COLORS.primary, margin: [0, 0, 0, 0] },
              { text: 'Address: ' + (billTo.address || ''), fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 0] },
              { text: 'TEL: ' + (billTo.phone || ''), fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 0] },
              { text: 'E-mail: ' + (billTo.email || ''), fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 0] },
              billTo.taxId ? { text: 'Tax ID: ' + billTo.taxId, fontSize: 10, color: PDF_COLORS.darkGray, margin: [0, 0, 0, 0] } : { text: '', fontSize: 10 }
            ].filter(Boolean)
          }
        ]
      },

      // Bottom separator
      {
        margin: [0, 5, 0, 5],
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 2, lineColor: PDF_COLORS.lightGray }]
      }
    ].filter(Boolean)
  }
}

/**
 * buildSignatureBlock
 * Renders the bottom footer section: certify text, net weight, origin, signature line.
 *
 * @param {Object} params
 * @param {string} params.netWeightText     - full net weight string, e.g. "NET WEIGHT OF MERCHANDISES 12.50 (gms.)"
 * @param {string} [params.originText]      - default "ORIGIN THAILAND"
 * @param {string} [params.certifyText]     - default "WE CERTIFY THAT THIS INVOICE TRUE AND CORRECT."
 * @param {string} [params.signatureLabel]  - default "Confirm and Accept"
 * @returns {Object} pdfmake content block
 */
export function buildSignatureBlock({
  netWeightText,
  originText = 'ORIGIN THAILAND',
  certifyText = 'WE CERTIFY THAT THIS INVOICE TRUE AND CORRECT.',
  signatureLabel = 'Confirm and Accept'
}) {
  return {
    columns: [
      {
        stack: [
          {
            columns: [
              { text: 'ONE PARCEL ONLY', style: 'parcelText', alignment: 'left', width: '70%' },
              { text: signatureLabel, style: 'parcelText', alignment: 'center', width: '30%' }
            ]
          },
          {
            columns: [
              { text: certifyText, style: 'certifyText', alignment: 'left' }
            ]
          },
          {
            columns: [
              { text: netWeightText, width: '50%', style: 'weightText' },
              { text: '', width: '50%', style: 'madeInText' }
            ]
          },
          {
            columns: [
              { text: originText, style: 'parcelText', alignment: 'left', width: '70%' },
              { text: '______________________________', style: 'parcelText', alignment: 'center', width: '30%' }
            ]
          },
          {
            columns: [
              { text: '', style: 'parcelText', alignment: 'left', width: '70%' },
              { text: '(Authorized Signature and Company Stamp)', style: 'parcelText', alignment: 'center', width: '30%' }
            ]
          }
        ],
        width: '90%'
      }
    ],
    margin: [0, 15, 0, 0],
    pageBreakBefore: false
  }
}

/**
 * paginate
 * Generic pagination helper. Splits items into pages of itemsPerPage,
 * calls renderPage for each page and concatenates the results into a flat array.
 * Inserts a { text: '', pageBreak: 'after' } between pages (not after the last page).
 *
 * @param {Array}    items         - full list of data items
 * @param {number}   itemsPerPage  - how many items per page
 * @param {Function} renderPage    - (pageItems, pageNum, isLastPage) => Array<pdfmakeContent>
 * @returns {Array} flat pdfmake content array
 */
export function paginate(items, itemsPerPage, renderPage) {
  const safeItems = items && Array.isArray(items) ? items : []
  const totalItems = safeItems.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const content = []

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const startIdx = pageNum * itemsPerPage
    const endIdx = Math.min(startIdx + itemsPerPage, totalItems)
    const pageItems = safeItems.slice(startIdx, endIdx)
    const isLastPage = pageNum === totalPages - 1

    const pageContent = renderPage(pageItems, pageNum, isLastPage)
    content.push(...pageContent)

    if (!isLastPage) {
      content.push({ text: '', pageBreak: 'after' })
    }
  }

  return content
}
