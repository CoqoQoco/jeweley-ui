// ที่อยู่เว็บสาธารณะที่ลูกค้าใช้เปิดจริง (Static Web App "dk-ui" ผูก custom domain ไว้แล้ว)
// ห้ามใช้ window.location.origin ประกอบลิงก์/QR ในเอกสารที่พิมพ์ออกไปถึงมือลูกค้า
// เพราะเอกสารต้องชี้โดเมนจริงเสมอ ไม่ว่าจะพิมพ์จากเครื่อง dev, localhost หรือเครื่องไหนก็ตาม
export const PUBLIC_SITE_BASE_URL = 'https://app.duangkeaw.com'

export function buildPublicUrl(path) {
  const base = (import.meta.env.VITE_PUBLIC_SITE_URL || PUBLIC_SITE_BASE_URL).replace(/\/+$/, '')

  if (!path) return base

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}
