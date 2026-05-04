// Coordinates in pt (1pt = 1/72 inch). Calibrate by measuring real pre-printed form.
// Form: bill (K&P Proforma Invoice) — 9 x 11 inch continuous

// Page size: 9 x 11 inch = 648 x 792 pt
export const PAGE_WIDTH = 648
export const PAGE_HEIGHT = 792

// Header fields (printed on every page) — based on bill.jpg layout
export const FIELD_INVOICE_NO = { x: 510, y: 145 }
export const FIELD_INVOICE_DATE = { x: 510, y: 175 }
export const FIELD_PAGE_NUMBER = { x: 510, y: 205 }
export const FIELD_CUSTOMER_NAME_ADDRESS = { x: 220, y: 235 }

// Items table — 9 columns
// Items y = ITEMS_BASE_Y + (rowIndex * LINE_HEIGHT)
export const ITEMS_BASE_Y = 295
export const LINE_HEIGHT = 22
export const MAX_ROWS_PER_PAGE = 9

// 9 columns: Item | Stock No | Description | Gold(gms) [2 values] | Stone(cts) [2 values] | Diamond(cts) | Qty | Unit Price | Amount
export const COL_ITEM = 30
export const COL_STOCK_NO = 60
export const COL_DESCRIPTION = 175
export const COL_GOLD_PRICE = 350
export const COL_GOLD_WEIGHT = 405
export const COL_STONE_PRICE = 450
export const COL_STONE_WEIGHT = 480
export const COL_DIAMOND = 525
export const COL_QTY = 555
export const COL_UNIT_PRICE = 600
export const COL_AMOUNT = 640

// Summary fields (last page only)
export const FIELD_TOTAL_QTY = { x: 555, y: 580 }
export const FIELD_TOTAL_PRICE = { x: 640, y: 580 }
export const FIELD_VAT = { x: 640, y: 605 }
export const FIELD_GRAND_TOTAL = { x: 640, y: 630 }
export const FIELD_REMARK = { x: 90, y: 580 }
