// ค้นหาสินค้าจากคลังด้วย stockNumber/stockNumberOrigin/productNumber — ใช้ร่วมกันระหว่างหน้าใบสั่งขาย
// (sale-order-view.vue: onSearchProduct) และ modal เติมของจากคลัง (fill-from-stock-modal.vue) กันเขียนซ้ำ
import { warning, error } from '@/services/alert/sweetAlerts.js'
import { createLineKey } from './line-key.js'

/**
 * เรียก StockProduct/Get แบบไม่ยิง alert เอง — คืนสถานะให้ caller ตัดสินใจแจ้งเตือนเอง
 * @param {Object} productStore - usrStockProductApiStore()
 * @param {Object} formValue - { stockNumber?, stockNumberOrigin?, productNumber? }
 * @returns {Promise<{ data: Object|null, status: 'ok'|'not-found'|'error', httpStatus?: number }>}
 */
export async function fetchStockProduct(productStore, formValue) {
  try {
    const data = await productStore.fetchDataGet({
      formValue,
      skipError: true,
      rethrow: true
    })
    if (!data || !data.stockNumber) {
      return { data: null, status: 'not-found' }
    }
    return { data, status: 'ok' }
  } catch (err) {
    const httpStatus = err?.response?.status
    if (httpStatus === 400 || httpStatus === 404) {
      return { data: null, status: 'not-found' }
    }
    return { data: null, status: 'error', httpStatus }
  }
}

/**
 * fetchStockProduct + แจ้งเตือนให้อัตโนมัติ (พฤติกรรมเดิมของ onSearchProduct เป๊ะ)
 * @param {Object} productStore
 * @param {Object} formValue
 * @param {Function} translate - this.$t
 * @returns {Promise<Object|null>} rawData หรือ null (แจ้งเตือนให้แล้ว)
 */
export async function lookupStockProduct(productStore, formValue, translate) {
  const { data, status, httpStatus } = await fetchStockProduct(productStore, formValue)

  if (status === 'ok') return data

  if (status === 'not-found') {
    warning(translate('view.sale.saleOrder.warn.stockNotFound'))
  } else {
    error(translate('view.sale.saleOrder.warn.stockLookupFailed', { status: httpStatus || 'Network' }))
  }
  return null
}

/**
 * สร้างบรรทัดสินค้าจริง (stock item) จาก raw StockProduct/Get response — shape เดียวกับที่ onSearchProduct ใช้
 * @param {Object} rawData - response จาก StockProduct/Get หรือ StockProduct/Availability ที่ merge แล้ว
 * @param {Object} [overrides] - ค่าที่ override ทับ default (เช่น appraisalPrice/discountPercent ที่สืบทอดมา, qty, sourceCopyLineKey)
 * @returns {Object}
 */
export function buildScanStockLine(rawData, overrides = {}) {
  const stockNumberOrigin = rawData.stockNumberOrigin || rawData.stockNumber

  return {
    ...rawData,
    price: rawData.productPrice ? Number(rawData.productPrice).toFixed(2) : 0,
    appraisalPrice: rawData.productPrice ? Number(rawData.productPrice).toFixed(2) : 0,
    description: rawData.productNameEn,
    group: 'product',
    planQty: rawData.planQty || 1,
    qty: 1,
    lineKey: createLineKey(),
    stockNumberOrigin,
    isRemainProduct: true,
    isConfirm: false,
    isInvoice: false,
    ...overrides
  }
}
