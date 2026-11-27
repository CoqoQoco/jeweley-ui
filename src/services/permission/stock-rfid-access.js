import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from './permission.js'
import { PERMISSIONS } from './config.js'

// สิทธิ์ดู/ผูกแท็ก RFID บนหน้าคลังสินค้า — เรียกใน computed ได้เลย (reactive ตาม authStore.permissions)
function has(permission) {
  const authStore = useAuthStore()
  return new PermissionService(authStore.getUser, authStore.permissions).hasPermission(permission)
}

export function hasRfidViewAccess() {
  return has(PERMISSIONS.STOCK_RFID_VIEW)
}

export function hasRfidBindAccess() {
  return has(PERMISSIONS.STOCK_RFID_BIND)
}
