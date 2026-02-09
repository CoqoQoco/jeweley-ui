// src/services/pdf/pdfInvoiceIntegration.js

// นำเข้า InvoicePdfBuilder
import { InvoicePdfBuilder } from '@/services/helper/pdf/quotation/quotation-pdf-builder.js'

/**
 * สร้าง PDF ใบกำกับสินค้า/ใบแจ้งหนี้จากข้อมูลในคอมโพเนนต์
 *
 * @param {Object} options ตัวเลือกสำหรับการสร้าง PDF
 * @param {Array} options.items รายการสินค้า
 * @param {Object} options.customer ข้อมูลลูกค้า (name, note)
 * @param {Date|String} options.invoiceDate วันที่ออกใบกำกับ
 * @param {String} options.filename ชื่อไฟล์ PDF (ถ้าไม่ระบุจะเป็น 'invoice.pdf')
 * @param {Boolean} options.openInNewTab เปิดในแท็บใหม่หรือไม่ (true = เปิดในแท็บใหม่, false = ดาวน์โหลด)
 * @param {Object} options.targetWindow เป้าหมายสำหรับเปิดแท็บใหม่ (ใช้สำหรับการหลีกเลี่ยง browser block)
 * @param {Number} options.itemsPerPage จำนวนรายการต่อหน้า (default = 10)
 * @returns {Promise} Promise ที่จะ resolve เมื่อสร้าง PDF เสร็จสิ้น
 */
export function generateInvoicePdf({
  items,
  customer,
  invoiceDate,
  filename = 'invoice.pdf',
  openInNewTab = false,
  targetWindow = null,
  itemsPerPage = 10 // เพิ่ม default parameter
}) {
  return new Promise((resolve, reject) => {
    try {
      // ปรับปรุงข้อมูลให้เหมาะสมกับ InvoicePdfBuilder
      const formattedItems = items.map((item) => {
        return {
          ...item,
          // ตรวจสอบว่ามี price แล้วหรือไม่ ถ้าไม่มีให้ใช้ productPrice
          productPrice: Number(item.price || item.productPrice || 0)
        }
      })

      // สร้าง instance ของ InvoicePdfBuilder
      const invoiceBuilder = new InvoicePdfBuilder(
        formattedItems,
        customer, // Pass the full customer object
        invoiceDate,
        customer.freight,
        customer.discount,
        customer.invoiceNumber,
        customer.currencyUnit, // currency unit
        customer.currencyMultiplier, // currency multiplier
        itemsPerPage // ส่งค่า itemsPerPage เข้าไป
      )

      invoiceBuilder
        .generatePDF()
        .then((pdf) => {
          if (openInNewTab && targetWindow) {
            // เปิด PDF invoice แล้วรอ 1 วินาที ก่อนจะ resolve เพื่อให้มีเวลาสำหรับเปิด breakdown ต่อ
            pdf.getBlob((blob) => {
              const url = URL.createObjectURL(blob)
              targetWindow.location.href = url
              setTimeout(() => {
                resolve({
                  success: true,
                  message: openInNewTab ? 'เปิดใบกำกับสินค้าสำเร็จ' : 'สร้างใบกำกับสินค้าสำเร็จ'
                })
              }, 1000)
            })
            return // ป้องกัน resolve ซ้ำ
          } else if (openInNewTab) {
            pdf.open()
            resolve({
              success: true,
              message: 'เปิดใบกำกับสินค้าสำเร็จ'
            })
            return
          } else {
            pdf.download(filename)
            resolve({
              success: true,
              message: 'สร้างใบกำกับสินค้าสำเร็จ'
            })
            return
          }
        })
        .catch((error) => {
          console.error('Error in PDF generation:', error)
          reject({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสร้างใบกำกับสินค้า',
            error
          })
        })

      //   // สร้าง PDF
      //   const pdf = await invoiceBuilder.generatePDF()

      //   // เปิดหรือดาวน์โหลด PDF
      //   if (openInNewTab) {
      //     pdf.open()
      //   } else {
      //     pdf.download(filename)
      //   }

      //   resolve({
      //     success: true,
      //     message: openInNewTab ? 'เปิดใบกำกับสินค้าสำเร็จ' : 'สร้างใบกำกับสินค้าสำเร็จ'
      //   })
    } catch (error) {
      console.error('Error generating PDF:', error)
      reject({
        success: false,
        message: 'เกิดข้อผิดพลาดในการสร้างใบกำกับสินค้า',
        error
      })
    }
  })
}
