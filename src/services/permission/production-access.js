import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from './permission.js'
import { PERMISSIONS } from './config.js'

// ซ่อนปุ่มที่แก้ข้อมูลในหน้าติดตามงานผลิตจากผู้ใช้ที่อ่านอย่างเดียว (API บังคับสิทธิ์อยู่แล้ว นี่คือฝั่งจอ)
// เรียกใน computed ได้เลย — reactive ตาม authStore.permissions และไม่ต้องเพิ่ม setup() ให้ component
function permissionService() {
  const authStore = useAuthStore()
  return new PermissionService(authStore.getUser, authStore.permissions)
}

export function hasProductionEditAccess() {
  return permissionService().hasPermission(PERMISSIONS.PRODUCTION_EDIT)
}

// ตาม API: CreateGoldCost รับทั้ง create หรือ edit
export function hasProductionCreateAccess() {
  return permissionService().hasAnyPermission([PERMISSIONS.PRODUCTION_CREATE, PERMISSIONS.PRODUCTION_EDIT])
}
