import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const zebraPrinterApi = defineStore('zebraPrinter', {
  state: () => ({}),

  getters: {},

  actions: {
    async fetchZebraPrinterStatus({ skipLoading }) {
      try {
        return await api.zebraPrinter.getStatus({ skipLoading: skipLoading, skipError: true })
      } catch (error) {
        console.error('Error fetching zebra printer status:', error)
      }
    },

    // async fetchZebraPrint({ formValue, skipLoading }) {
    //   try {
    //     //create zebra code
    //     const zpl = this.generateZPLs(formValue)
    //     return await api.zebraPrinter.printZPL(zpl, { skipLoading: skipLoading })
    //   } catch (error) {
    //     console.error('Error fetching zebra printer status:', error)
    //   }
    // },

    async fetchZebraPrint({ formValue, skipLoading }) {
      try {
        const printCount = formValue.print || 1

        // เลือก ZPL template ตาม barcodeType
        const zpl = formValue.barcodeType === 'vertical'
          ? this.generateZPLVertical(formValue)
          : this.generateZPLs(formValue)

        // สร้างฟังก์ชันสำหรับ delay
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

        // วนลูปพิมพ์ทีละชิ้นตามลำดับ โดยใช้ ZPL เดิม
        for (let i = 0; i < printCount; i++) {
          try {
            // ยิง API ด้วย ZPL ที่สร้างครั้งเดียว
            const result = await api.zebraPrinter.printZPL(zpl, { skipLoading: skipLoading })

            // ตรวจสอบผลลัพธ์
            if (result.status !== 'success') {
              console.error(`การพิมพ์ชิ้นที่ ${i + 1} ล้มเหลว: ${result.message}`)
              return result // หยุดและส่งคืนข้อผิดพลาด
            }

            console.log(`พิมพ์ชิ้นที่ ${i + 1}/${printCount} สำเร็จ`)

            // ถ้ายังไม่ใช่ชิ้นสุดท้าย ให้รอ 1 วินาที
            if (i < printCount - 1) {
              await delay(1000) // รอ 1 วินาที
            }
          } catch (innerError) {
            console.error(`เกิดข้อผิดพลาดในการพิมพ์ชิ้นที่ ${i + 1}:`, innerError)
            return {
              status: 'error',
              message: `เกิดข้อผิดพลาดในการพิมพ์ชิ้นที่ ${i + 1}`,
              error: innerError
            }
          }
        }

        console.log(`พิมพ์ทั้งหมด ${printCount} ชิ้นเสร็จสิ้น`)
        return {
          status: 'success',
          message: `พิมพ์ทั้งหมด ${printCount} ชิ้นเสร็จสิ้น`
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการพิมพ์:', error)
        return {
          status: 'error',
          message: 'เกิดข้อผิดพลาดในการพิมพ์',
          error: error
        }
      }
    },
    async fetchZebraPrints({ formValue, skipLoading }) {
      try {
        // เลือก ZPL template ตาม barcodeType ของแต่ละ item
        const zpl = formValue.map((form) =>
          form.barcodeType === 'vertical' ? this.generateZPLVertical(form) : this.generateZPLs(form)
        )

        console.log('ZPL:', zpl)
        return await api.zebraPrinter.printsZPL(zpl, { skipLoading: skipLoading })
      } catch (error) {
        console.error('Print from forms error:', error)
        return {
          status: 'error',
          message: 'เกิดข้อผิดพลาดในการสร้างและพิมพ์ฉลาก'
        }
      }
    },

    generateZPLs(formValue) {
      // เริ่มต้น ZPL
      let zpl = '^XA^LL200^MD25^LT40^XZ'
      zpl += '^XA'

      // ส่วนหัว (Model)
      zpl += formValue.isSilver ? `^FO252,15^A0N,20,18^FD${formValue.mold || ''}^FS` : null

      // บาร์โค้ด
      zpl += `^FO248,35^BY1,3.0:1,25^BCN,Y,N,N^FD${formValue.stockNumber || ''}^FS`

      // stock number
      zpl += `^FO248,65^A0N,20,18^FD${formValue.stockNumber || ''}^FS`

      // gold and size
      zpl += `^FO250,090^A0N,14,16,B^FD${formValue.gold || ''} ${formValue.size || ''}^FS`

      // made in
      zpl += `^FO025,050^A0N,15,15,B^FD${formValue.madeIn || ''}^FS`

      // gold type
      zpl += `^FO420,045^A0N,14,16,B^FD${formValue.goldType || ''}^FS`

      // รายการอัญมณี
      if (Array.isArray(formValue.gems)) {
        let yPos = 15
        formValue.gems.forEach((gem) => {
          if (gem) {
            zpl += `^F450,${yPos}^A0N,14,16,B^FD${gem}^FS`
            yPos += 15
          }
        })
      }

      // จบ ZPL
      zpl += '^XZ'

      console.log('ZPL:', zpl)

      return zpl
    },

    generateZPLVertical(formValue) {
      // ใช้ label ขนาดเดิม เพิ่ม price row จึงสูงขึ้นเล็กน้อย
      const hasPrice = formValue.price != null && formValue.price > 0
      const labelHeight = hasPrice ? 220 : 200

      let zpl = `^XA^LL${labelHeight}^MD25^LT40^XZ`
      zpl += '^XA'

      // made in (ซ้าย เหมือน horizontal)
      zpl += `^FO025,050^A0N,15,15,B^FD${formValue.madeIn || ''}^FS`

      // productNameEn แทน mold (ไม่มี goldType ข้างๆ)
      zpl += `^FO252,10^A0N,20,18^FD${formValue.productNameEn || ''}^FS`

      // gold + size เหนือ barcode
      const sizeText = formValue.size ? ` #${formValue.size}` : ''
      zpl += `^FO250,030^A0N,14,16,B^FD${formValue.gold || ''}${sizeText}^FS`

      // barcode (ไม่มี stockNumber ใต้)
      zpl += `^FO248,048^BY1,3.0:1,25^BCN,Y,N,N^FD${formValue.stockNumber || ''}^FS`

      // productNumber - price ไม่รวม gold
      const priceText = hasPrice
        ? new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(formValue.price)
        : ''
      const priceLine = [formValue.productNumber, priceText].filter(Boolean).join(' - ')
      if (priceLine) {
        zpl += `^FO250,100^A0N,14,16,B^FD${priceLine}^FS`
      }

      // gems (ขวา เหมือน horizontal)
      if (Array.isArray(formValue.gems)) {
        let yPos = 15
        formValue.gems.forEach((gem) => {
          if (gem) {
            zpl += `^FO450,${yPos}^A0N,14,16,B^FD${gem}^FS`
            yPos += 15
          }
        })
      }

      zpl += '^XZ'

      console.log('ZPL Vertical:', zpl)

      return zpl
    }
  }
})
