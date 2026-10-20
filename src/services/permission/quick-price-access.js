import { useAuthStore } from '@/stores/modules/authen/authen-store.js'

// ตีราคาด่วน (StockProduct/QuickPriceCreate) — API เช็ค CheckPermissionLevel("update_stock") ซึ่งอิงชื่อ role
// ไม่ใช่ permission string (Dev / Admin / StockOperator) จึงเช็ค role ตรงๆ ให้ตรงกับ backend
// ไม่ได้ผูก permission key ใหม่เพราะ permission จริงมาจาก DB (Permission/MyPermissions) ที่ยังไม่มี key นี้
// เรียกใน computed ได้เลย — reactive ตาม authStore.user และไม่ต้องเพิ่ม setup() ให้ component
export const QUICK_PRICE_ROLES = ['Dev', 'Admin', 'StockOperator']

export function hasQuickPriceAccess() {
  const authStore = useAuthStore()
  const roles = authStore.getUser?.role
  if (!Array.isArray(roles)) return false
  return roles.some((role) => QUICK_PRICE_ROLES.includes(role?.name))
}
