import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from '@/services/permission/permission.js'

// สิทธิ์ตั้งขั้นต่ำ/เกณฑ์ของคลังวัตถุดิบ (material:manage-min) — ใช้ key ตรงนี้แทนการเพิ่มใน services/permission/config.js (ไฟล์ที่ session อื่นแก้อยู่)
// เรียกใน computed ได้เลย — reactive ตาม authStore.permissions · ไม่มีสิทธิ์ = ไม่แสดงปุ่มแก้ไข/ตั้งค่า (ผู้ใช้เก่าต้อง login ใหม่หลัง migration)
export const MATERIAL_MANAGE_MIN_PERMISSION = 'material:manage-min'

export function hasMaterialManageAccess() {
  const authStore = useAuthStore()
  return new PermissionService(authStore.getUser, authStore.permissions).hasPermission(MATERIAL_MANAGE_MIN_PERMISSION)
}
