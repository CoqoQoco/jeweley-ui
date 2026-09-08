// หน้าสาธารณะ — ลูกค้าสแกน QR code แล้วเข้าดูสินค้าโดยไม่ต้อง login
// standalone page ไม่ครอบ Layout ใดๆ (ไม่มี sidebar/topbar) — ดู meta.publicPage ใน router/index.js
// ที่ทำให้ route นี้ข้าม device-redirect/auth/permission guard ทั้งหมด
const routes = [
  {
    path: '/p/:token',
    name: 'public-product',
    component: () => import('@/views/public/product-showcase/index-view.vue'),
    meta: {
      publicPage: true
    }
  }
]

export default routes
