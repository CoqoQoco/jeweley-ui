// Coordinates in pt (1pt = 1/72 inch). Calibrate by measuring real pre-printed form.
// Form: ใบเสร็จรับเงิน/ใบกำกับภาษี (ดวงแก้ว) — 9 x 11 inch continuous

// Page size: 9 x 11 inch = 648 x 792 pt
export const PAGE_WIDTH = 648
export const PAGE_HEIGHT = 792

// Header fields (printed on every page)
export const FIELD_INVOICE_NO = { x: 510, y: 225 }
export const FIELD_INVOICE_DATE = { x: 510, y: 265 }
export const FIELD_PAGE_NUMBER = { x: 510, y: 285 }
export const FIELD_CUSTOMER_NAME = { x: 155, y: 225 }
export const FIELD_CUSTOMER_TAX_ID = { x: 155, y: 245 }
export const FIELD_CUSTOMER_ADDRESS = { x: 155, y: 265 }

// Items table — base position + per-column x
// Items y = ITEMS_BASE_Y + (rowIndex * LINE_HEIGHT)
export const ITEMS_BASE_Y = 310
export const LINE_HEIGHT = 25
export const MAX_ROWS_PER_PAGE = 9

export const COL_NO = 70             // ลำดับ (left-align)
export const COL_DESCRIPTION = 130   // รายการ (left-align)
export const COL_QTY = 455           // จำนวน (right-align target)
export const COL_UNIT_PRICE = 545    // ราคา/หน่วย (right-align target)
export const COL_AMOUNT = 625        // จำนวนเงิน (right-align target)

// Summary fields (last page only) — y around 695
export const FIELD_TOTAL_QTY = { x: 455, y: 695 }
export const FIELD_SUB_TOTAL = { x: 625, y: 695 }
export const FIELD_VAT = { x: 625, y: 715 }
export const FIELD_GRAND_TOTAL = { x: 625, y: 735 }
export const FIELD_TOTAL_AMOUNT_TEXT = { x: 90, y: 710 }
