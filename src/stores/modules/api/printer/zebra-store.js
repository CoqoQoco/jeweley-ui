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
        const zpl = this.generateZPL(formValue)
        return await api.zebraPrinter.printZPL({ zpl, skipLoading: skipLoading })
      } catch (error) {
        console.error('Error fetching zebra printer status:', error)
      }
    },

    async fetchZebraPrints({ formValue, skipLoading }) {
      try {
        //create multi zebra code
        const zpl = formValue.map((form) => this.generateZPLs(form))
        return await api.zebraPrinter.printsZPL({ zpl, skipLoading: skipLoading })
      } catch (error) {
        console.error('Print from forms error:', error)
        return {
          status: 'error',
          message: 'เกิดข้อผิดพลาดในการสร้างและพิมพ์ฉลาก'
        }
      }
    }
  },

  // one barcode
  generateZPL(formValue) {
    // Extract values from form

    // Start ZPL document
    let zpl = '^XA^LL200^MD25^LT40^XZ'
    zpl += '^XA'

    // Add model
    zpl += `^FO252,15^A0N,20,18^FD${formValue.model || ''}^FS`

    // Add barcode
    zpl += `^FO248,35^BY1,3.0:1,25^BCN,Y,N,N^FD${formValue.barcode || ''}^FS`

    // Add product name
    zpl += `^FO248,65^A0N,20,18^FD${formValue.productName || ''}^FS`

    // Add weight and size
    zpl += `^FO250,090^A0N,14,16,B^FD${formValue.weight || ''} ${formValue.size || ''}^FS`

    // Add made in country
    zpl += `^FO025,050^A0N,15,15,B^FD${formValue.madeIn || ''}^FS`

    // Add gold information
    zpl += `^FO426,045^A0N,14,16,B^FD${formValue.gold || ''}^FS`

    // Add gems information
    let yPos = 15
    formValue.gems.forEach((gem) => {
      if (gem.type && gem.value) {
        zpl += `^FO426,${yPos}^A0N,14,16,B^FD${gem.type}: ${gem.value}^FS`
        yPos += 15
      }
    })

    // End ZPL document
    zpl += '^XZ'

    return zpl
  },

  // ฟังก์ชันสำหรับสร้าง ZPL จากข้อมูลฟอร์ม
  generateZPLs(formValue) {
    // เริ่มต้น ZPL
    let zpl = '^XA^LL200^MD25^LT40^XZ'
    zpl += '^XA'

    // ส่วนหัว (Model)
    zpl += `^FO252,15^A0N,20,18^FD${formValue.model || ''}^FS`

    // บาร์โค้ด
    zpl += `^FO248,35^BY1,3.0:1,25^BCN,Y,N,N^FD${formValue.barcode || ''}^FS`

    // ชื่อสินค้า
    zpl += `^FO248,65^A0N,20,18^FD${formValue.productName || ''}^FS`

    // ข้อมูลเฉพาะ (น้ำหนักและขนาด)
    zpl += `^FO250,090^A0N,14,16,B^FD${formValue.weight || ''} ${formValue.size || ''}^FS`

    // ประเทศผู้ผลิต
    zpl += `^FO025,050^A0N,15,15,B^FD${formValue.madeIn || ''}^FS`

    // ทอง
    zpl += `^FO426,045^A0N,14,16,B^FD${formValue.gold || ''}^FS`

    // รายการอัญมณี
    if (Array.isArray(formValue.gems)) {
      let yPos = 15
      formValue.gems.forEach((gem) => {
        if (gem.type && gem.value) {
          zpl += `^FO426,${yPos}^A0N,14,16,B^FD${gem.type}: ${gem.value}^FS`
          yPos += 15
        }
      })
    }

    // จบ ZPL
    zpl += '^XZ'

    return zpl
  }
})
