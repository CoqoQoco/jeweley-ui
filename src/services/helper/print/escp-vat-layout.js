// LQ-310 — กระดาษต่อเนื่อง 9x11"
// 10 cpi = 90 cols/9", 6 lpi = 66 lines/11"
// horizontal unit ของ ESC $ = 1/60", ดังนั้น 1 col = 6 units

export const CHAR_WIDTH_UNITS = 6  // 10 cpi → 6 units/char
export const LINE_SPACING_216 = 36 // 36/216 = 1/6 inch (6 lpi)

// ตำแหน่งหัวกระดาษ (column index, 0-based)
export const COL_INVOICE_NO = 70
export const COL_CUSTOMER_NAME = 12
export const COL_CUSTOMER_TAX_ID = 12
export const COL_CUSTOMER_ADDRESS = 12
export const COL_PAGE_NUMBER = 70

// row position (1-based, นับจากขอบบน)
export const ROW_INVOICE_NO = 4
export const ROW_INVOICE_DATE = 6
export const ROW_PAGE_NUMBER = 7
export const ROW_CUSTOMER_NAME = 4
export const ROW_CUSTOMER_TAX_ID = 5
export const ROW_CUSTOMER_ADDRESS = 6

// ตารางสินค้า
export const ROW_ITEMS_START = 10
export const MAX_ROWS_PER_PAGE = 23
export const COL_ITEM_NO = 3
export const COL_ITEM_DESC = 10
export const COL_ITEM_QTY = 50
export const COL_ITEM_PRICE = 60
export const COL_ITEM_AMOUNT = 75

// summary (last page)
export const ROW_TOTAL_QTY = 35
export const ROW_SUBTOTAL = 35
export const ROW_VAT = 36
export const ROW_GRAND_TOTAL = 37
export const ROW_AMOUNT_TEXT = 36

export const COL_TOTAL_QTY = 50
export const COL_SUMMARY_AMOUNT = 75
export const COL_AMOUNT_TEXT = 8
