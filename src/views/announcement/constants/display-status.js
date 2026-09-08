// Shared announcement displayStatus constants — Options API friendly (plain functions, no Composition API)

export const DISPLAY_STATUS_META = {
  Visible: { i18nKey: 'view.announcement.status.visible', badgeClass: 'status-visible' },
  Hidden: { i18nKey: 'view.announcement.status.hidden', badgeClass: 'status-hidden' },
  Scheduled: { i18nKey: 'view.announcement.status.scheduled', badgeClass: 'status-scheduled' },
  Expired: { i18nKey: 'view.announcement.status.expired', badgeClass: 'status-expired' }
}

export function getDisplayStatusOptions(t) {
  return [
    { value: null, label: t('view.announcement.status.all') },
    ...Object.keys(DISPLAY_STATUS_META).map((key) => ({
      value: key,
      label: t(DISPLAY_STATUS_META[key].i18nKey)
    }))
  ]
}

// filter dropdown ส่ง isPublished เฉพาะ Visible(true)/Hidden(false) — Scheduled/Expired เป็นสถานะที่คำนวณฝั่ง client
// เท่านั้น (ไม่มี field ให้ filter ตรงๆ ฝั่ง backend) จึงปล่อยเป็น undefined = ไม่ filter
export function statusFilterToIsPublished(value) {
  if (value === 'Visible') return true
  if (value === 'Hidden') return false
  return undefined
}
