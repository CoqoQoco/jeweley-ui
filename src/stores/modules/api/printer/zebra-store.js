import { defineStore } from 'pinia'
import api from '@/axios/axios-helper.js'
import { printZpl } from '@/services/api/print-bridge-service.js'
import { fetchPrinterList } from '@/services/api/printer-config-service.js'
import {
  getBarcodePrinterConfig,
  getBarcodePrinterName,
  PRINTER_PROFILES
} from '@/services/api/barcode-printer-config.js'
import {
  generateLegacyZPL,
  generateLegacyZPLVertical,
  generateGt800ZPL,
  generateGt800ZPLVertical,
  generateGt800ZPLQr
} from '@/services/helper/barcode/barcode-zpl.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const noPrinterSelectedResult = {
  status: 'error',
  message: 'ยังไม่ได้ตั้งค่าเครื่องพิมพ์บาร์โค้ด กรุณาไปตั้งค่าที่หน้าตั้งค่าเครื่องพิมพ์บาร์โค้ดก่อนพิมพ์ครับ'
}

// ป้าย QR ใช้ได้เฉพาะ GT800 และต้องมีลิงก์หน้าสินค้าแล้วเท่านั้น — เช็คก่อนสร้าง ZPL ทุกครั้ง
function checkQrLabelGuard(forms, profile) {
  const hasQrLabel = forms.some((form) => form.barcodeType === 'original-qr')
  if (!hasQrLabel) return null

  if (profile === PRINTER_PROFILES.LEGACY) {
    return { status: 'error', message: 'ป้าย QR ใช้ได้เฉพาะเครื่องพิมพ์ GT800 ครับ' }
  }

  const missingUrl = forms.some((form) => form.barcodeType === 'original-qr' && !form.publicUrl)
  if (missingUrl) {
    return { status: 'error', message: 'ยังไม่มีลิงก์หน้าสินค้า จึงพิมพ์ป้าย QR ไม่ได้ครับ' }
  }

  return null
}

export const zebraPrinterApi = defineStore('zebraPrinter', {
  state: () => ({}),

  getters: {},

  actions: {
    // เลือก ZPL template ตาม profile เครื่องคอมนี้ × barcodeType (original → แนวนอน, อื่น → แนวตั้ง)
    buildZpl(formValue, profile, dpiScale, rotate180 = false) {
      const isOriginal = formValue.barcodeType === 'original'

      if (profile === PRINTER_PROFILES.LEGACY) {
        return isOriginal ? generateLegacyZPL(formValue) : generateLegacyZPLVertical(formValue)
      }

      const options = { rotate180 }

      if (formValue.barcodeType === 'original-qr') {
        return generateGt800ZPLQr(formValue, dpiScale, options)
      }

      return isOriginal
        ? generateGt800ZPL(formValue, dpiScale, options)
        : generateGt800ZPLVertical(formValue, dpiScale, options)
    },

    // ตรวจสถานะเครื่องพิมพ์บาร์โค้ดที่ตั้งไว้ — เครื่องเดิมเช็คผ่าน Zebra Print Service, GT800 เช็คผ่าน DK Print Bridge
    // profileOverride — ใช้ตอนหน้าตั้งค่าอยากเช็คตาม profile ที่เลือกบนจอ (ยังไม่ได้กดบันทึก) แทนค่าที่บันทึกไว้
    async fetchBarcodePrinterStatus(profileOverride) {
      const config = getBarcodePrinterConfig()
      const profile = profileOverride || config.profile

      if (profile === PRINTER_PROFILES.LEGACY) {
        const result = await api.zebraPrinter.getStatus({ skipLoading: true, skipError: true })
        const status = result?.service?.status === 'running' ? 'success' : 'service-error'
        return {
          profile: PRINTER_PROFILES.LEGACY,
          status,
          printerName: '',
          printers: [],
          detail: result || null
        }
      }

      const result = await fetchPrinterList()

      if (result.status !== 'ok') {
        return {
          profile: PRINTER_PROFILES.GT800,
          status: 'bridge-error',
          printerName: '',
          printers: [],
          detail: { bridgeStatus: result.status, message: result.detail }
        }
      }

      const savedName = getBarcodePrinterName()
      if (!savedName) {
        return { profile: PRINTER_PROFILES.GT800, status: 'no-printer', printerName: '', printers: result.printers, detail: null }
      }

      const found = result.printers.some((p) => p.name === savedName)
      if (!found) {
        return {
          profile: PRINTER_PROFILES.GT800,
          status: 'printer-not-found',
          printerName: savedName,
          printers: result.printers,
          detail: null
        }
      }

      return { profile: PRINTER_PROFILES.GT800, status: 'success', printerName: savedName, printers: result.printers, detail: null }
    },

    async fetchZebraPrint({ formValue, skipLoading = true }) {
      const config = getBarcodePrinterConfig()

      const qrGuardResult = checkQrLabelGuard([formValue], config.profile)
      if (qrGuardResult) return qrGuardResult

      const printCount = formValue.print || 1
      const zpl = this.buildZpl(formValue, config.profile, config.dpiScale, config.rotate180)

      if (config.profile === PRINTER_PROFILES.LEGACY) {
        for (let i = 0; i < printCount; i++) {
          const result = await api.zebraPrinter.printZPL(zpl, { skipLoading })

          if (result.status !== 'success') {
            return {
              status: 'error',
              message: result.message || `เกิดข้อผิดพลาดในการพิมพ์ชิ้นที่ ${i + 1}`
            }
          }

          if (i < printCount - 1) {
            await delay(1000)
          }
        }

        return { status: 'success', message: `พิมพ์ทั้งหมด ${printCount} ชิ้นเสร็จสิ้น` }
      }

      if (!config.printerName) {
        return { ...noPrinterSelectedResult }
      }

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

    async fetchZebraPrints({ formValue, skipLoading = true }) {
      const config = getBarcodePrinterConfig()

      const qrGuardResult = checkQrLabelGuard(formValue, config.profile)
      if (qrGuardResult) return qrGuardResult

      const zpls = formValue.map((form) => this.buildZpl(form, config.profile, config.dpiScale, config.rotate180))

      if (config.profile === PRINTER_PROFILES.LEGACY) {
        return await api.zebraPrinter.printsZPL(zpls, { skipLoading })
      }

      if (!config.printerName) {
        return { ...noPrinterSelectedResult }
      }

      let successCount = 0
      let failedCount = 0

      // bridge มีแค่ /print/raw จึงต้องวนยิงทีละใบ
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
    }
  }
})
