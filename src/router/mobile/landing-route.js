/**
 * Mobile Public Routes (Login, Register, etc.)
 *
 * หมายเหตุ: Mobile และ Web ใช้หน้า login เดียวกัน
 * เพราะหน้า login มี responsive design อยู่แล้ว
 *
 * ถ้าต้องการ mobile-specific login UI สามารถสร้างแยกได้
 * โดยใช้ LayoutMobileLogin และ components แยก
 */

// import LayoutMobileLogin from '@/layout/mobile/LayoutMobileLogin.vue'

const routes = [
  // หมายเหตุ: ปัจจุบันใช้ web login route เดียวกัน (/login)
  // เพราะหน้า login มี responsive design อยู่แล้ว

  // ถ้าต้องการสร้าง mobile-specific login ในอนาคต
  // สามารถ uncomment code ด้านล่างนี้:

  // {
  //   path: '/mobile/login',
  //   name: 'mobile-login',
  //   component: () => import('@/views/mobile/login/index-view.vue'),
  //   meta: {
  //     layout: 'mobile-login',
  //     requiresAuth: false
  //   }
  // }
]

export default routes
