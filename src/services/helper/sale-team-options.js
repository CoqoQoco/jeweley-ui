import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'

const SALE_ROLE_ID = 6 // tbm_user_role: 6 = Sale

// รายชื่อพนักงาน role Sale ไว้ให้เลือกในช่องผู้ขาย/ผู้ช่วยขาย (พิมพ์ชื่อเองก็ได้ ไม่บังคับเลือกจากลิสต์)
// ใช้ logic เดียวกับ loadSaleUserOptions() ใน sale-order-view.vue — ห้ามแก้ผลลัพธ์ให้ต่างกัน
export async function fetchSaleUserOptions() {
  try {
    const userApiStore = useUserApiStore()
    const res = await userApiStore.fetchDataList({
      take: 200,
      skip: 0,
      sort: null,
      form: { roleId: SALE_ROLE_ID, isActive: true }
    })

    const list = res?.data || []
    return list
      .map((u) => {
        const firstName = (u.firstName || '').trim()
        const lastName = (u.lastName || '').trim()
        const fullName = `${firstName} ${lastName}`.trim()
        return { code: u.username, name: fullName || u.username }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}
