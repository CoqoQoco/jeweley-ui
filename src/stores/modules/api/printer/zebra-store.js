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

    async fetchZebraPrint({ formValue, skipLoading }) {
      try {
        //create zebra code
        const zpl = this.generateZPLs(formValue)
        return await api.zebraPrinter.printZPL(zpl, { skipLoading: skipLoading })
      } catch (error) {
        console.error('Error fetching zebra printer status:', error)
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
      zpl += `^FO252,15^A0N,20,18^FD${formValue.mold || ''}^FS`

      // บาร์โค้ด
      zpl += `^FO248,35^BY1,3.0:1,25^BCN,Y,N,N^FD${formValue.stockNumber || ''}^FS`

      // stock number
      zpl += `^FO248,65^A0N,20,18^FD${formValue.stockNumber || ''}^FS`

      // gold and size
      zpl += `^FO250,090^A0N,14,16,B^FD${formValue.gold || ''} ${formValue.size || ''}^FS`

      // made in
      zpl += `^FO025,050^A0N,15,15,B^FD${formValue.madeIn || ''}^FS`

      // gold type
      zpl += `^FO426,045^A0N,14,16,B^FD${formValue.goldType || ''}^FS`

      // รายการอัญมณี
      if (Array.isArray(formValue.gems)) {
        let yPos = 15
        formValue.gems.forEach((gem) => {
          if (gem) {
            zpl += `^F500,${yPos}^A0N,14,16,B^FD${gem}^FS`
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
