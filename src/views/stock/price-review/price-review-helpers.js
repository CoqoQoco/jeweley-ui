import { formatReasons } from '@/services/helper/price-check/price-check.js'

export const REASON_CODES = ['COST_RATIO', 'TYPE_CEILING', 'PREVIOUS_PRICE', 'SAME_WO', 'SAME_DESIGN']

export const EXPORT_TAKE = 10000

const isBlank = (v) => v === null || v === undefined || v === ''

export const REVIEW_STATUSES = ['PENDING', 'ACKED', 'ALL']

export const ACK_NOTE_MAX = 500

// ค่าเริ่มต้นของตัวกรองสต็อก (ชุดเดียวกับหน้า stock-product-list)
export const createStockFilter = () => ({
  receiptType: null,
  stockNumberOriginal: null,
  stockNumber: null,
  mold: null,
  productNumber: null,
  productNameEn: null,
  productNameTh: null,
  woText: null,
  size: null,
  productType: [],
  gold: null,
  goldSize: null,
  hasCostDetail: null,
  pieceStatus: null,
  priceStatus: null,
  locationCodes: [],
  materials: [],
  materialMatch: 'all',
  priceMin: null,
  priceMax: null
})

// ตัวกรองหน้าจอ → search ของ StockProduct/PriceOutlierList (ค่าว่างไม่ส่ง)
// filter = ผลของ buildSearchParam(stockFilter) — ออบเจ็กต์เดียวกับที่หน้า stock-product-list ส่งไป StockProduct/List
export const buildPriceReviewSearch = (form, filter) => {
  const text = (form?.text || '').trim()
  return {
    text: text || undefined,
    reasonCode: isBlank(form?.reasonCode) ? undefined : form.reasonCode,
    reviewStatus: REVIEW_STATUSES.includes(form?.reviewStatus) ? form.reviewStatus : 'PENDING',
    filter: filter || undefined
  }
}

export const formatWoText = (item) => {
  if (isBlank(item?.wo)) return ''
  return isBlank(item?.woNumber) ? String(item.wo) : `${item.wo}-${item.woNumber}`
}

// t = $t ของ vue-i18n; headers = หัวคอลัมน์ที่แปลแล้ว
// ถ้า headers มี ackStatus → เพิ่มคอลัมน์สถานะตรวจ (ackLabels = { acked, pending, changed }, formatDate = ฟังก์ชันจัดรูปแบบวันที่)
export const buildPriceReviewExportRows = (t, items, headers, ackLabels, formatDate) =>
  (items || []).map((item) => {
    const row = {
      [headers.stockNumberOrigin]: item.stockNumberOrigin || '',
      [headers.stockNumber]: item.stockNumber || '',
      [headers.productNumber]: item.productNumber || '',
      [headers.productName]: item.productNameTh || '',
      [headers.productType]: item.productTypeName || '',
      [headers.wo]: formatWoText(item),
      [headers.price]: Number(item.price) || 0,
      [headers.reasons]: formatReasons(t, item.reasons).join('\n'),
      [headers.suggestedPrice]: isBlank(item.suggestedPrice) ? '' : Number(item.suggestedPrice)
    }
    if (headers.ackStatus) {
      let status = ackLabels.pending
      if (item.isAcked) status = ackLabels.acked
      else if (item.priceChangedSinceAck) status = ackLabels.changed
      row[headers.ackStatus] = status
      row[headers.ackBy] = item.ackBy || ''
      row[headers.ackDate] = item.ackDate && formatDate ? formatDate(item.ackDate) : ''
      row[headers.ackNote] = item.ackNote || ''
    }
    return row
  })
