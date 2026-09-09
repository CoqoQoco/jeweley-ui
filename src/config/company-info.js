import { getCompanySetting } from '@/services/helper/company-info-store.js'

export const COMPANY_INFO = {
  name: 'Duangkaew Jewelry Manufacturer Co., Ltd.',
  nameTh: 'บริษัท ดวงแก้ว จิวเวลรี่ แมนูแฟคเจอเรอร์ จำกัด',
  branchLabel: 'สำนักงานใหญ่',
  address: '200/16 Rama 6 Road, Phaya Thai, Phaya Thai, Bangkok 10400 Thailand',
  addressTh: '200/16 ถนนพระรามที่ 6 แขวงพญาไท เขตพญาไท กรุงเทพมหานคร 10400',
  phone: '(66) 2 619-6601-4',
  fax: '(+662) 2710834',
  email: 'info@dkbkk.com',
  website: 'www.dkbangkok.com'
}

export const getCompanyLogoUrl = () => new URL('@/assets/duangkaew-icon.png', import.meta.url).href

export const COMPANY_TAX_ID = '0105533041850'

export const COMPANY_BANK = {
  bankName: 'ธนาคารกสิกรไทย (Kasikornbank)',
  accountName: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
  accountNumber: '',
  swift: 'KASITHBK',
  branch: 'สำนักงานใหญ่ / Head Office'
}

export const COMPANY_SOCIAL = {
  facebook: 'duangkaewjewelry',
  instagram: 'duangkaewjewelry.official',
  tiktok: 'dkjewelbangkok',
  lineOa: '@duangkaew'
}

export function normalizeSocialHandle(channel, value) {
  if (!value) return ''
  let handle = String(value).trim()
  if (!handle) return ''

  handle = handle.replace(/^https?:\/\//i, '')
  handle = handle.replace(/^www\./i, '')
  handle = handle.split('?')[0]
  handle = handle.replace(/\/+$/, '')

  if (handle.includes('/')) {
    const segments = handle.split('/').filter(Boolean)
    handle = segments[segments.length - 1] || ''
  }

  handle = handle.replace(/^@+/, '')

  if (channel === 'lineOa') {
    return handle ? `@${handle}` : ''
  }

  return handle
}

export function socialUrl(channel, handle) {
  if (!handle) return ''

  switch (channel) {
    case 'facebook':
      return `https://www.facebook.com/${handle}`
    case 'instagram':
      return `https://www.instagram.com/${handle}`
    case 'tiktok':
      return `https://www.tiktok.com/@${handle}`
    case 'lineOa':
      return `https://line.me/R/ti/p/${handle}`
    case 'website':
      return /^https?:\/\//i.test(handle) ? handle : `https://${handle}`
    default:
      return ''
  }
}

export function normalizeWebsite(value) {
  if (!value) return ''
  let site = String(value).trim()
  if (!site) return ''

  site = site.replace(/^https?:\/\//i, '')
  site = site.replace(/\/+$/, '')

  return site
}

let cachedCompanyInfo = null

export async function loadCompanyInfo() {
  if (cachedCompanyInfo) return cachedCompanyInfo

  const defaults = {
    info: {
      name: COMPANY_INFO.name,
      nameTh: COMPANY_INFO.nameTh,
      branchLabel: COMPANY_INFO.branchLabel,
      address: COMPANY_INFO.address,
      addressTh: COMPANY_INFO.addressTh,
      phone: COMPANY_INFO.phone,
      fax: COMPANY_INFO.fax,
      email: COMPANY_INFO.email,
      website: COMPANY_INFO.website
    },
    taxId: COMPANY_TAX_ID,
    bank: { ...COMPANY_BANK },
    social: { ...COMPANY_SOCIAL }
  }

  const saved = await getCompanySetting()
  if (!saved) {
    cachedCompanyInfo = defaults
    return cachedCompanyInfo
  }

  cachedCompanyInfo = {
    info: { ...defaults.info, ...(saved.info || {}) },
    taxId: saved.taxId || defaults.taxId,
    bank: { ...defaults.bank, ...(saved.bank || {}) },
    social: { ...defaults.social, ...(saved.social || {}) }
  }
  return cachedCompanyInfo
}

export function resetCompanyInfoCache() {
  cachedCompanyInfo = null
}
