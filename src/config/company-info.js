import { getCompanySetting } from '@/services/helper/company-info-store.js'

export const COMPANY_INFO = {
  name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
  address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
  phone: '(+662) 6196601-4',
  fax: ' (+662) 2710834',
  email: 'info@dkbkk.com'
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

let cachedCompanyInfo = null

export async function loadCompanyInfo() {
  if (cachedCompanyInfo) return cachedCompanyInfo

  const defaults = {
    info: {
      name: COMPANY_INFO.name,
      address: COMPANY_INFO.address,
      phone: COMPANY_INFO.phone,
      fax: COMPANY_INFO.fax,
      email: COMPANY_INFO.email
    },
    taxId: COMPANY_TAX_ID,
    bank: { ...COMPANY_BANK }
  }

  const saved = await getCompanySetting()
  if (!saved) {
    cachedCompanyInfo = defaults
    return cachedCompanyInfo
  }

  cachedCompanyInfo = {
    info: { ...defaults.info, ...(saved.info || {}) },
    taxId: saved.taxId || defaults.taxId,
    bank: { ...defaults.bank, ...(saved.bank || {}) }
  }
  return cachedCompanyInfo
}

export function resetCompanyInfoCache() {
  cachedCompanyInfo = null
}
