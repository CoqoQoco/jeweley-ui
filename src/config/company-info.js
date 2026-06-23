export const COMPANY_INFO = {
  name: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
  address: '200/16 Rama 6 Rd.,Praythai,Phayathai,Bangkok 10400 Thailand',
  phone: '(+662) 6196601-4',
  fax: ' (+662) 2710834',
  email: 'info@dkbkk.com'
}

export const getCompanyLogoUrl = () => new URL('@/assets/duangkaew-icon.png', import.meta.url).href

export const COMPANY_TAX_ID = '0105533041850'

// NOTE: ค่าด้านล่างเป็น placeholder ตัวอย่างเพื่อให้ Payment Options แสดงใน preview
// แทนที่ด้วยข้อมูลบัญชีจริง (หรือย้ายไปหน้า settings ภายหลัง)
export const COMPANY_BANK = {
  bankName: 'ธนาคารกสิกรไทย (Kasikornbank)',
  accountName: 'Duang Kaew Jewelry Manufacturer Co.,Ltd.',
  accountNumber: 'xxx-x-xxxxx-x',
  swift: 'KASITHBK',
  branch: 'สำนักงานใหญ่ / Head Office'
}
