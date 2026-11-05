import { PhotoSheetPdfBuilder, toPhotoSheetItems } from '@/services/helper/pdf/photo-sheet/photo-sheet-pdf-builder.js'
import { prepareItemImages } from '@/services/helper/pdf/shared/pdf-images.js'

/**
 * สร้าง PDF ใบรูปอย่างเดียว แล้วเปิดในแท็บใหม่
 * @param {Object} options
 * @param {String} options.docNo - เลขที่เอกสาร (SO / Quotation / Invoice)
 * @param {Array} options.items - รายการสินค้าของเอกสาร (ต้องมี mold/productNumber และ imagePath/imageBlobPath)
 */
export async function generatePhotoSheetPdf({ docNo, items }) {
  const photoItems = toPhotoSheetItems(items)
  await prepareItemImages(photoItems)
  const pdf = new PhotoSheetPdfBuilder({ docNo, items: photoItems }).generatePDF()
  pdf.open()
}
