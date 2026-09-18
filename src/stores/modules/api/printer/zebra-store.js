import { defineStore } from 'pinia'
import { printZpl } from '@/services/api/print-bridge-service.js'
import { fetchPrinterList } from '@/services/api/printer-config-service.js'
import { getBarcodePrinterConfig, getBarcodePrinterName } from '@/services/api/barcode-printer-config.js'

export const zebraPrinterApi = defineStore('zebraPrinter', {
  state: () => ({}),

  getters: {},

  actions: {
    // ตรวจสถานะเครื่องพิมพ์บาร์โค้ดที่ตั้งไว้ ผ่าน DK Print Bridge (ไม่ใช่ Zebra Print Service เดิมแล้ว)
    async fetchBarcodePrinterStatus() {
      const result = await fetchPrinterList()

      if (result.status !== 'ok') {
        return {
          status: 'bridge-error',
          printerName: '',
          printers: [],
          detail: { bridgeStatus: result.status, message: result.detail }
        }
      }

      const savedName = getBarcodePrinterName()
      if (!savedName) {
        return { status: 'no-printer', printerName: '', printers: result.printers, detail: null }
      }

      const found = result.printers.some((p) => p.name === savedName)
      if (!found) {
        return { status: 'printer-not-found', printerName: savedName, printers: result.printers, detail: null }
      }

      return { status: 'success', printerName: savedName, printers: result.printers, detail: null }
    },

    async fetchZebraPrint({ formValue }) {
      const config = getBarcodePrinterConfig()

      if (!config.printerName) {
        return {
          status: 'error',
          message: 'ยังไม่ได้ตั้งค่าเครื่องพิมพ์บาร์โค้ด กรุณาไปตั้งค่าที่หน้าตั้งค่าเครื่องพิมพ์บาร์โค้ดก่อนพิมพ์ครับ'
        }
      }

      const printCount = formValue.print || 1

      // เลือก ZPL template ตาม barcodeType
      const zpl = formValue.barcodeType === 'original'
        ? this.generateZPLs(formValue, config.dpiScale)
        : this.generateZPLVertical(formValue, config.dpiScale)

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

      // วนลูปพิมพ์ทีละชิ้นตามลำดับ โดยใช้ ZPL เดิม
      for (let i = 0; i < printCount; i++) {
        try {
          await printZpl({ printerName: config.printerName, zpl })
        } catch (err) {
          return {
            status: 'error',
            message: `เกิดข้อผิดพลาดในการพิมพ์ชิ้นที่ ${i + 1}: ${err.message || ''}`
          }
        }

        // ถ้ายังไม่ใช่ชิ้นสุดท้าย ให้รอตามระยะที่ตั้งค่าไว้ก่อนยิงพิมพ์ต่อ
        if (i < printCount - 1) {
          await delay(config.copyDelayMs)
        }
      }

      return {
        status: 'success',
        message: `พิมพ์ทั้งหมด ${printCount} ชิ้นเสร็จสิ้น`
      }
    },

    async fetchZebraPrints({ formValue }) {
      const config = getBarcodePrinterConfig()

      if (!config.printerName) {
        return {
          status: 'error',
          message: 'ยังไม่ได้ตั้งค่าเครื่องพิมพ์บาร์โค้ด กรุณาไปตั้งค่าที่หน้าตั้งค่าเครื่องพิมพ์บาร์โค้ดก่อนพิมพ์ครับ'
        }
      }

      // เลือก ZPL template ตาม barcodeType ของแต่ละ item
      const zpls = formValue.map((form) =>
        form.barcodeType === 'original'
          ? this.generateZPLs(form, config.dpiScale)
          : this.generateZPLVertical(form, config.dpiScale)
      )

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

      let successCount = 0
      let failedCount = 0

      // ของเดิมยิง endpoint prints ก้อนเดียว ตอนนี้ bridge มีแค่ /print/raw จึงต้องวนยิงทีละใบ
      for (let i = 0; i < zpls.length; i++) {
        try {
          await printZpl({ printerName: config.printerName, zpl: zpls[i] })
          successCount++
        } catch (err) {
          failedCount++
        }

        if (i < zpls.length - 1) {
          await delay(config.copyDelayMs)
        }
      }

      const total = zpls.length
      const summary = { total, success: successCount, failed: failedCount }

      if (failedCount === 0) {
        return { status: 'success', message: `พิมพ์ทั้งหมด ${total} รายการสำเร็จ`, summary }
      }
      if (successCount === 0) {
        return { status: 'error', message: 'พิมพ์ไม่สำเร็จทั้งหมด', summary }
      }
      return {
        status: 'partial',
        message: `พิมพ์สำเร็จบางส่วน: สำเร็จ ${successCount} รายการ, ล้มเหลว ${failedCount} รายการ`,
        summary
      }
    },

    generateZPLs(formValue, dpiScale = 1) {
      // template เขียนพิกัดไว้ที่หัวพิมพ์ 203 dpi — คูณ scale เพื่อรองรับหัวพิมพ์ dpi อื่น (dpiScale = 1 ต้องได้ผลลัพธ์เดิมเป๊ะ)
      const s = (n) => Math.round(n * dpiScale)

      // เริ่มต้น ZPL
      let zpl = `^XA^LL${s(200)}^MD25^LT40^XZ`
      zpl += '^XA'

      // บาร์โค้ด
      zpl += `^FO${s(248)},${s(35)}^BY${s(1)},3.0:1,${s(25)}^BCN,Y,N,N^FD${formValue.stockNumber || ''}^FS`

      // เลขที่ผลิต - ราคาขาย (เมื่อมีค่า)
      const salePriceText =
        formValue.salePrice != null && formValue.salePrice > 0
          ? new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
              formValue.salePrice
            )
          : ''
      const stockNumberLine = [formValue.stockNumber, salePriceText].filter(Boolean).join(' - ')
      zpl += `^FO${s(248)},${s(65)}^A0N,${s(20)},${s(18)}^FD${stockNumberLine}^FS`

      // gold and size
      zpl += `^FO${s(250)},${s(90)}^A0N,${s(14)},${s(16)},B^FD${formValue.gold || ''} ${formValue.size || ''}^FS`

      // made in
      zpl += `^FO${s(25)},${s(50)}^A0N,${s(15)},${s(15)},B^FD${formValue.madeIn || ''}^FS`

      // gold type
      zpl += `^FO${s(420)},${s(45)}^A0N,${s(14)},${s(16)},B^FD${formValue.goldType || ''}^FS`

      // รายการอัญมณี
      if (Array.isArray(formValue.gems)) {
        let yPos = 15
        formValue.gems.forEach((gem) => {
          if (gem) {
            zpl += `^F${s(450)},${s(yPos)}^A0N,${s(14)},${s(16)},B^FD${gem}^FS`
            yPos += 15
          }
        })
      }

      // จบ ZPL
      zpl += '^XZ'

      return zpl
    },

    generateZPLVertical(formValue, dpiScale = 1) {
      const s = (n) => Math.round(n * dpiScale)

      // ใช้ label ขนาดเดิม เพิ่ม price row จึงสูงขึ้นเล็กน้อย
      const hasPrice = formValue.price != null && formValue.price > 0
      const labelHeight = hasPrice ? 220 : 200

      let zpl = `^XA^LL${s(labelHeight)}^MD25^LT40^XZ`
      zpl += '^XA'

      // made in (ซ้าย เหมือน horizontal)
      zpl += `^FO${s(25)},${s(50)}^A0N,${s(15)},${s(15)},B^FD${formValue.madeIn || ''}^FS`

      // productNameEn แทน mold (ไม่มี goldType ข้างๆ)
      zpl += `^FO${s(252)},${s(10)}^A0N,${s(20)},${s(18)}^FD${formValue.productNameEn || ''}^FS`

      // gold + size เหนือ barcode
      const sizeText = formValue.size ? ` #${formValue.size}` : ''
      zpl += `^FO${s(250)},${s(30)}^A0N,${s(14)},${s(16)},B^FD${formValue.gold || ''}${sizeText}^FS`

      // barcode (ไม่มี stockNumber ใต้)
      zpl += `^FO${s(248)},${s(48)}^BY${s(1)},3.0:1,${s(25)}^BCN,Y,N,N^FD${formValue.stockNumber || ''}^FS`

      // productNumber - price ไม่รวม gold
      const priceText = hasPrice
        ? new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(formValue.price)
        : ''
      const priceLine = [formValue.productNumber, priceText].filter(Boolean).join(' - ')
      if (priceLine) {
        zpl += `^FO${s(250)},${s(100)}^A0N,${s(14)},${s(16)},B^FD${priceLine}^FS`
      }

      // gems (ขวา เหมือน horizontal)
      if (Array.isArray(formValue.gems)) {
        let yPos = 15
        formValue.gems.forEach((gem) => {
          if (gem) {
            zpl += `^FO${s(450)},${s(yPos)}^A0N,${s(14)},${s(16)},B^FD${gem}^FS`
            yPos += 15
          }
        })
      }

      zpl += '^XZ'

      return zpl
    }
  }
})
