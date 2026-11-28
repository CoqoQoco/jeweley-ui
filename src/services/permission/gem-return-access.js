import { useAuthStore } from '@/stores/modules/authen/authen-store.js'
import { PermissionService } from './permission.js'
import { PERMISSIONS } from './config.js'

// สิทธิ์คืนพลอยจากใบงานเข้าคลัง — เรียกใน computed ได้เลย (reactive ตาม authStore.permissions)
export function hasGemReturnAccess() {
  const authStore = useAuthStore()
  return new PermissionService(authStore.getUser, authStore.permissions).hasPermission(
    PERMISSIONS.STOCK_GEM_RETURN_FROM_PLAN
  )
}
