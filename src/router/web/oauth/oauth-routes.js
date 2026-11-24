// หน้าอนุญาตให้แอป AI เข้าถึงข้อมูล (OAuth consent) — standalone ไม่ครอบ Layout (ไม่มี sidebar/topbar)
// ต้อง login ก่อน (auth guard ปกติ) แล้ววนกลับมาพร้อม query เดิมผ่าน ?redirect=
// skipDeviceRedirect: มือถือต้องอยู่ path เดิม (ไม่เด้ง /mobile/*) ไม่งั้น query หาย
// returnAfterLogin: 401 กลางหน้า → login แล้วกลับมาหน้าเดิม
const routes = [
  {
    path: '/oauth/authorize',
    name: 'oauth-authorize',
    component: () => import('@/views/oauth/authorize/index-view.vue'),
    meta: {
      skipDeviceRedirect: true,
      returnAfterLogin: true
    }
  }
]

export default routes
