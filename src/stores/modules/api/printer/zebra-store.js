import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'

export const zebraPrinterApi = defineStore('zebraPrinter', {
  state: () => ({}),

  getters: {},

  actions: {
    async fetchZebraPrinterStatus({ skipLoading }) {
      try {
        return await api.zebraPrinter.getStatus({ skipLoading: skipLoading })
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
        // ตรวจสอบว่ามีการระบุจำนวนที่ต้องการพิมพ์หรือไม่
        const printCount = formValue.print || 1 // กำหนดค่าเริ่มต้นเป็น 1 ถ้าไม่ได้ระบุ

        console.log(`เริ่มพิมพ์จำนวน ${printCount} ชิ้น`)

        // สร้าง ZPL code เพียงครั้งเดียว
        const zpl = this.generateZPLs(formValue)

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
        //create multi zebra code
        const zpl = formValue.map((form) => this.generateZPLs(form))

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
    }
  }
})
