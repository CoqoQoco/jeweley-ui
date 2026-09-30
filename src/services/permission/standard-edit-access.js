import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from './permission.js'
import { PERMISSIONS } from './config.js'

// แก้ไขมาตรฐานเวลาผลิตต่อแผนก (wip-standards-panel.vue) — Executive + Dev เท่านั้น (production:standard-edit
// ไม่ผูกกับ route ไหนโดยตรง เลยเช็คตรงๆ ที่นี่แทนอ่านจาก route.meta.permissions แบบ resolvePlanLinkState)
// เรียกใน computed ได้เลย — reactive ตาม authStore.permissions และไม่ต้องเพิ่ม setup() ให้ component
export function hasStandardEditAccess() {
  const authStore = useAuthStore()
  return new PermissionService(authStore.getUser, authStore.permissions).hasPermission(
    PERMISSIONS.PRODUCTION_STANDARD_EDIT
  )
}
