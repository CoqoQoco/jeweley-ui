import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from './permission.js'
import { PERMISSIONS } from './config.js'

// เห็น markup / ส่วนลด % / ต้นทุน ในใบเสนอราคา-ใบสั่งขาย (ซ่อนแค่บนจอ ข้อมูลยังโหลด/บันทึกครบ)
// เรียกใน computed ได้เลย — reactive ตาม authStore.permissions และไม่ต้องเพิ่ม setup() ให้ component
export function hasMarginAccess() {
  const authStore = useAuthStore()
  return new PermissionService(authStore.getUser, authStore.permissions).hasPermission(
    PERMISSIONS.SALE_VIEW_MARGIN
  )
}
