// src/services/helper/pdf/quotation/cost-check-pdf-integration.js

import { CostCheckPdfBuilder } from '@/services/helper/pdf/quotation/cost-check-pdf-builder.js'

/**
 * สร้าง PDF ใบตรวจสอบต้นทุน (เอกสารภายใน) จากรายการในใบเสนอราคา
 * @param {Object} options
 * @param {Array} options.items - รายการในใบเสนอราคา
 * @param {Object} options.customer - ข้อมูล header ของใบเสนอราคา
 * @param {Date|String} options.invoiceDate - วันที่ใบเสนอราคา
 * @param {String} options.filename - ชื่อไฟล์ PDF (ใช้เมื่อดาวน์โหลด)
 * @param {Boolean} options.openInNewTab - true = เปิดในแท็บใหม่, false = ดาวน์โหลด
 * @param {Object} options.targetWindow - window ที่เปิดล่วงหน้าไว้ (กัน browser block popup)
 * @param {Number} [options.lowMarginThreshold] - เกณฑ์ % กำไรต่ำ (default 15)
 * @returns {Promise}
 */
export async function generateCostCheckPdf({
  items,
  customer,
  invoiceDate,
  filename = 'cost-check.pdf',
  openInNewTab = false,
  targetWindow = null,
  lowMarginThreshold
}) {
  const builder = new CostCheckPdfBuilder({
    items,
    customer,
    invoiceDate,
    invoiceNo: customer.invoiceNumber,
    lowMarginThreshold
  })
  await builder.preparePDF()
  const pdf = await builder.generatePDF()

  if (openInNewTab && targetWindow) {
    return new Promise((resolve) => {
      pdf.getBlob((blob) => {
        const url = URL.createObjectURL(blob)
        targetWindow.location.href = url
        setTimeout(() => {
          resolve({ success: true, message: 'เปิดใบตรวจสอบต้นทุนสำเร็จ' })
        }, 1000)
      })
    })
  }

  pdf.download(filename)
  return { success: true, message: 'สร้างใบตรวจสอบต้นทุนสำเร็จ' }
}
