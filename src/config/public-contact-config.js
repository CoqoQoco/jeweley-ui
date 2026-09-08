// Contact channels สำหรับหน้าสาธารณะ (/p/:token) — รวมไว้ที่เดียวเพื่อแก้/เพิ่มช่องทางได้จุดเดียว
// key = ใช้เป็น :key ใน v-for, labelKey = i18n key, url = ลิงก์เต็ม, icon = Bootstrap icon class
export const PUBLIC_CONTACT_CHANNELS = [
  {
    key: 'facebook',
    labelKey: 'view.public.showcase.contactFacebook',
    url: 'https://www.facebook.com/duangkaewjewelry',
    icon: 'bi-facebook'
  },
  {
    key: 'instagram',
    labelKey: 'view.public.showcase.contactInstagram',
    url: 'https://www.instagram.com/duangkaewjewelry.official',
    icon: 'bi-instagram'
  },
  {
    key: 'email',
    labelKey: 'view.public.showcase.contactEmail',
    url: 'mailto:info@dkbkk.com',
    icon: 'bi-envelope'
  },
  {
    key: 'website',
    labelKey: 'view.public.showcase.contactWebsite',
    url: 'https://www.dkbangkok.com',
    icon: 'bi-globe'
  }

  // เตรียมไว้ ยังไม่เปิดใช้ — เปิดทีหลังโดยลบ comment + เติม url จริง
  // {
  //   key: 'line',
  //   labelKey: 'view.public.showcase.contactLine',
  //   url: '',
  //   icon: 'bi-line'
  // },
  // {
  //   key: 'phone',
  //   labelKey: 'view.public.showcase.contactPhone',
  //   url: 'tel:',
  //   icon: 'bi-telephone'
  // }
]

export default PUBLIC_CONTACT_CHANNELS
