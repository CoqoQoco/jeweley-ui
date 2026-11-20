// 4xx = server ปฏิเสธด้วยเหตุผลธุรกิจ (เช่น invoice ถูกยกเลิก) — ต้องหยุด ไม่ใช่ปัญหาเครือข่าย
export function isClientRejection(error) {
  const status = error?.response?.status
  return typeof status === 'number' && status >= 400 && status < 500
}

import { escapeHtml } from '@/services/helper/barcode/print-batch.js'

const MAX_LISTED_CERTIFICATES = 10

// นับใบรับรอง/ใบรับประกันที่ invoice นี้ออกไปแล้ว — ล้มเหลวข้อไหนให้ถือเป็น 0 (fail-open ไม่ขวางการยกเลิก)
export async function fetchVoidDocCounts({ certificateStore, invoiceStore, invoiceNumber }) {
  const [certificateNos, guaranteeCount] = await Promise.all([
    Promise.resolve()
      .then(() => certificateStore.fetchByInvoice({ invoiceNumber }))
      .then((res) => {
        const rows = Array.isArray(res?.data) ? res.data : []
        return [...new Set(rows.map((row) => row?.certificateNo).filter(Boolean))]
      })
      .catch(() => []),
    Promise.resolve()
      .then(() => invoiceStore.fetchGuaranteePrintCount({ invoiceNumber }))
      .then((count) => Number(count) || 0)
      .catch(() => 0)
  ])
  return { certificateCount: certificateNos.length, certificateNos, guaranteeCount }
}

// ต่อเลขใบรับรองเป็นข้อความ — เกิน 10 ใบแสดง 10 แรก + "และอีก N ใบ" (moreText รับจำนวนที่เหลือ คืนข้อความ)
export function formatCertificateNos(certificateNos, moreText) {
  const listed = certificateNos.slice(0, MAX_LISTED_CERTIFICATES).join(', ')
  const rest = certificateNos.length - MAX_LISTED_CERTIFICATES
  return rest > 0 ? `${listed} ${moreText(rest)}` : listed
}

// ประกอบข้อความเตือนเอกสารโมฆะเป็นย่อหน้าแยก — เลขใบรับรองขึ้นบรรทัดใหม่ตัวหนา (escape เพราะมาจาก DB และ confirm render HTML)
export function buildVoidDocsHtml({ docsMsg, certLabel, certList }) {
  const certBlock = certList ? `<br/>${certLabel}<br/><b>${escapeHtml(certList)}</b>` : ''
  return `<div style="margin: var(--sp-md) 0;">${docsMsg}${certBlock}</div>`
}
