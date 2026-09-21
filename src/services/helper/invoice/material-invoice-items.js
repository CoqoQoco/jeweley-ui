// material-invoice-items.js — แปลง Invoice/Get.materialItems (ใบแจ้งหนี้วัตถุดิบ MATERIAL) ให้อยู่ใน
// shape เดียวกับ invoiceItems ของสินค้า (stockNumber/appraisalPrice/discountPercent/qty/materials)
// เพื่อให้ใช้ตัวกลางเดิมได้หมด (computeDocumentTotals, buildVatPrintModel, InvoiceSummaryPdfBuilder ฯลฯ)
import { materialPriceExclVat } from '@/services/helper/material-sale/material-sale-money.js'

/**
 * @param {Array} materialItems - Invoice/Get.materialItems
 * @param {Object} options
 * @param {number|string} options.vatPercent
 * @param {string} options.pieceLabel - หน่วยนับเม็ด เช่น 'เม็ด'
 * @returns {Array}
 */
export function toMaterialInvoiceItems(materialItems, { vatPercent, pieceLabel } = {}) {
  const list = Array.isArray(materialItems) ? materialItems : []

  return list.map((item) => {
    const description = item?.description || [item?.gemName, item?.gemSize].filter(Boolean).join(' ')
    const qtyPiece = Number(item?.qtyPiece) || 0
    const qtyWeight = Number(item?.qtyWeight) || 0

    return {
      itemNo: item?.itemNo,
      gemCode: item?.gemCode,
      gemName: item?.gemName,
      gemGroup: item?.gemGroup,
      gemShape: item?.gemShape,
      gemSize: item?.gemSize,
      gemGrade: item?.gemGrade,
      qtyPiece,
      qtyWeight,
      priceInclVat: Number(item?.priceInclVat) || 0,
      isMaterial: true,
      stockNumber: item?.gemCode,
      productNumber: '',
      description,
      productNameEN: `${description} (${qtyPiece} ${pieceLabel || ''})`,
      // ราคาก่อน VAT ดิบคำนวณใหม่เสมอ (ไม่ใช้ priceExclVat ที่ backend snapshot มา) ให้ตรงเกณฑ์ไม่ปัดระหว่างทาง
      appraisalPrice: materialPriceExclVat(item?.priceInclVat, vatPercent),
      discountPercent: 0,
      qty: qtyWeight,
      materials: [{ type: 'Gem', typeCode: item?.gemShape || '', qty: qtyPiece, weight: qtyWeight }]
    }
  })
}
