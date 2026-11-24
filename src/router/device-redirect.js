// หน้าที่ต้องเปิดด้วย path เดิมทุกอุปกรณ์ (เช่น /oauth/authorize ที่มี query ของ OAuth) ติด meta.skipDeviceRedirect
// เพื่อข้ามการเด้ง /mobile/* ใน router guard — ไม่งั้น query หรือหน้าปลายทางหายก่อนถึง auth check
export function shouldSkipDeviceRedirect(to) {
  return !!to?.matched?.some((route) => route.meta?.skipDeviceRedirect)
}

// route ที่ไม่มีคู่ /mobile/* (meta.noMobileTwin) หรือข้าม device redirect ไม่ต้อง router.resolve หา /mobile/... ให้ vue-router warn "No match found"
export function shouldLookupMobileTwin(to) {
  if (shouldSkipDeviceRedirect(to)) return false
  return !to?.matched?.some((route) => route.meta?.noMobileTwin)
}

export function resolveMobileRedirect({ shouldUseMobile, to, mobileRouteExists }) {
  if (!shouldUseMobile) return null
  if (shouldSkipDeviceRedirect(to)) return null
  if (to.path.startsWith('/mobile') || to.name === 'routes-login') return null
  if (!mobileRouteExists) return null
  return { path: `/mobile${to.path}`, query: to.query }
}

// 401 กลางหน้าที่ติด meta.returnAfterLogin ต้อง login ใหม่แล้วกลับมาที่หน้าเดิมพร้อม query
export function buildLoginLocation(currentRoute) {
  const needReturn = !!currentRoute?.matched?.some((route) => route.meta?.returnAfterLogin)
  if (!needReturn) return '/login'
  return { path: '/login', query: { redirect: currentRoute.fullPath } }
}
