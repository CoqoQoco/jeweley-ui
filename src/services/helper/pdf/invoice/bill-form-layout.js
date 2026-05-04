// Coordinates in pt (1pt = 1/72 inch). Calibrate by measuring real pre-printed form.
// Form: bill (K&P Proforma Invoice) — 9 x 11 inch continuous

// Page size: 9 x 11 inch = 648 x 792 pt
export const PAGE_WIDTH = 648
export const PAGE_HEIGHT = 792

// Header fields (printed on every page) — based on bill.jpg layout
export const FIELD_INVOICE_NO = { x: 500, y: 165 }
export const FIELD_INVOICE_DATE = { x: 500, y: 195 }
export const FIELD_PAGE_NUMBER = { x: 500, y: 225 }
export const FIELD_CUSTOMER_NAME_ADDRESS = { x: 220, y: 320 }

// Items table — 9 columns
// Items y = ITEMS_BASE_Y + (rowIndex * LINE_HEIGHT)
export const ITEMS_BASE_Y = 450
export const LINE_HEIGHT = 25
export const MAX_ROWS_PER_PAGE = 9

// 9 columns: Item | Stock No | Description | Gold(gms) [2 values] | Stone(cts) [2 values] | Diamond(cts) | Qty | Unit Price | Amount
export const COL_ITEM = 28
export const COL_STOCK_NO = 65
export const COL_DESCRIPTION = 200
export const COL_GOLD_PRICE = 380
export const COL_GOLD_WEIGHT = 435
export const COL_STONE_PRICE = 480
export const COL_STONE_WEIGHT = 520
export const COL_DIAMOND = 560
export const COL_QTY = 590
export const COL_UNIT_PRICE = 625
export const COL_AMOUNT = 645

// Summary fields (last page only)
export const FIELD_TOTAL_QTY = { x: 560, y: 720 }
export const FIELD_TOTAL_PRICE = { x: 645, y: 720 }
export const FIELD_VAT = { x: 645, y: 750 }
export const FIELD_GRAND_TOTAL = { x: 645, y: 778 }
export const FIELD_REMARK = { x: 90, y: 720 }
