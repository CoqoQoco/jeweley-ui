# Mobile Tasks Flow Documentation

ระบบงานของฉัน (My Jobs) — Mobile

**Mobile Layout**: `src/layout/mobile/LayoutMobile.vue`
**UI Framework**: ✅ PrimeVue — same as Web (Generic wrappers preferred: AutoCompleteGeneric, CalendarGeneric)
**SCSS**: `@import '@/assets/scss/responsive-style/mobile'`

---

## Flow Overview

```
Tasks index-view.vue
  ├── Filter Tab: ทั้งหมด     → isActive: true (ไม่ filter status)
  ├── Filter Tab: กำลังดำเนินการ → statusId: [10, 20, 30, 40, 50]
  └── Filter Tab: เสร็จสิ้น    → statusId: [100]
        └── กด JobCard
        │     └── jobTypeId === 10 && statusId === 100
        │           → mobile-cost-version-detail (params: jobRunning)
        └── กด Trash Icon (showInactive=true)
              → confirmSubmit dialog
                    → User/InactiveMyJob API
                          → loadJobs() (reload)
```

---

## 1. Routes

| Path | Route Name | Component |
|------|-----------|-----------|
| `/mobile/tasks` | `mobile-tasks` | `index-view.vue` |

---

## 2. File Structure

```
src/views/mobile/tasks/
  index-view.vue                        -- รายการงานของฉัน (My Jobs)

src/views/mobile/components/
  job-card.vue                          -- card แสดง job (shared component)

src/constants/
  job-type.js                           -- JOB_TYPE constants + helper functions

src/stores/modules/api/user/
  user-store.js                         -- fetchListMyJob → User/ListMyJob API
```

---

## 3. index-view.vue

### หน้าที่
แสดงรายการงาน (TbtMyJob) ของ user ที่ login อยู่ — กรองตาม status, pagination

### Data Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `myJobs` | array | `[]` | รายการงาน |
| `isLoading` | boolean | `false` | loading state (local) |
| `activeFilter` | string | `'all'` | filter ปัจจุบัน |
| `currentPage` | number | `0` | หน้าปัจจุบัน |
| `pageSize` | number | `20` | จำนวนต่อหน้า |
| `hasMore` | boolean | `true` | มีข้อมูลเพิ่มเติม |
| `filterTabs` | array | — | tabs กรอง (ทั้งหมด / กำลังดำเนินการ / เสร็จสิ้น) |

> ✅ CLAUDE.md violations ได้รับการแก้ไขแล้ว (2026-02-23):
> - ลบ `try-catch` ออกจาก `loadJobs()`, `loadMore()` แล้ว
> - ลบ `isLoading` local state ออกแล้ว — global LoadingOverlay จัดการ

### Filter Tabs และ Status Mapping

| Tab | value | statusId ที่ส่ง API |
|-----|-------|-------------------|
| ทั้งหมด | `'all'` | ไม่ filter — ส่ง `isActive: true` |
| กำลังดำเนินการ | `'active'` | `[10, 20, 30, 40, 50]` |
| เสร็จสิ้น | `'completed'` | `[100]` |

### Methods

| Method | หน้าที่ |
|--------|---------|
| `loadJobs()` | โหลด jobs ใหม่ตั้งแต่ต้น (reset page = 0) |
| `loadMore()` | โหลดหน้าถัดไป append ต่อ list |
| `changeFilter(value)` | เปลี่ยน filter → เรียก `loadJobs()` |
| `getSearchFilter()` | สร้าง search object ตาม activeFilter |
| `viewJobDetail(job)` | navigate ตาม jobTypeId + statusId |

### Navigation Logic (`viewJobDetail`)

```javascript
if (job.jobTypeId === JOB_TYPE.PLAN_STOCK_COST && job.statusId === 100) {
  // → mobile-cost-version-detail (params: { jobRunning })
} else {
  // ยังไม่ implement (console.log)
}
```

---

## 4. API — User/ListMyJob

### Endpoint
`POST User/ListMyJob`

### Backend Service
`Jewelry.Service/User/UserService.cs` → `ListMyJob()`

**หมายเหตุสำคัญ**: Backend กรอง `WHERE job.CreateBy == CurrentUsername` เสมอ — user เห็นเฉพาะงานของตัวเอง

### Request Format

```javascript
{
  take: 20,
  skip: 0,
  sort: [{ field: 'createDate', dir: 'desc' }],
  search: {
    isActive: true,           // tab "ทั้งหมด"
    statusId: [10, 20, 30],   // tab "กำลังดำเนินการ" / "เสร็จสิ้น"
    // fields อื่น (ใช้ใน backend แต่ frontend ยังไม่ใช้):
    // id, createBy, updateBy, dataJob, jobRunning, jobTypeName, jobTypeId
    // createDateFrom, createDateTo, updateDateFrom, updateDateTo
  }
}
```

### Response Fields (TbtMyJob)

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Job ID |
| `jobRunning` | string | เลขที่งาน (ใช้เป็น params navigate) |
| `jobTypeId` | number | ประเภทงาน (ดู JOB_TYPE constants) |
| `jobTypeName` | string | ชื่อประเภทงาน |
| `statusId` | number | รหัส status |
| `statusName` | string | ชื่อ status |
| `dataJob` | string (JSON) | ข้อมูลเพิ่มเติมของงาน (parse JSON) |
| `isActive` | boolean | active flag |
| `createBy` | string | username ผู้สร้าง |
| `createDate` | datetime | วันที่สร้าง |
| `updateBy` | string | username ผู้อัปเดต |
| `updateDate` | datetime | วันที่อัปเดต |

### Store

```javascript
import { useUserApiStore } from '@/stores/modules/api/user/user-store.js'

const result = await userApiStore.fetchListMyJob({
  take, skip, sort, search
})
// result.data → array of jobs
// result.total → total count
```

---

## 5. Status ID Reference

| StatusId | ชื่อ | สี | Filter Tab |
|----------|------|-----|-----------|
| 10 | Pending | เทา `#9e9e9e` | กำลังดำเนินการ |
| 20 | Assigned | น้ำเงิน `#2196f3` | กำลังดำเนินการ |
| 30 | Started | น้ำเงิน `#2196f3` | กำลังดำเนินการ |
| 40 | InProgress | ส้ม `#ff9800` | กำลังดำเนินการ |
| 50 | OnHold | ส้ม `#ff9800` | กำลังดำเนินการ |
| 100 | Completed | เขียว `#4caf50` | เสร็จสิ้น |
| 500 | (Error/Cancel) | แดง `#f44336` | — |

---

## 6. Job Type Constants

ไฟล์: `src/constants/job-type.js`

| Constant | Value | ชื่อภาษาไทย | Navigate ไปที่ |
|----------|-------|------------|---------------|
| `JOB_TYPE.PLAN_STOCK_COST` | `10` | แผนตีราคาสินค้า | `mobile-cost-version-detail` (ถ้า status=100) |

Helper functions:
- `getJobTypeName(typeCode)` → ชื่อภาษาไทย
- `getJobTypeNameEn(typeCode)` → ชื่อภาษาอังกฤษ
- `getAllJobTypes()` → array ของทุก type

---

## 7. JobCard Component

ไฟล์: `src/views/mobile/components/job-card.vue`

**Shared component** — ใช้ได้ทั้ง tasks และ views อื่นที่ต้องแสดง job

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `job` | Object | required | ข้อมูล job จาก API |
| `clickable` | Boolean | `true` | แสดง cursor pointer + active effect |
| `selected` | Boolean | `false` | แสดง checkmark + highlight border |
| `compact` | Boolean | `false` | ซ่อน status badge, แสดงแค่วันที่ |

### Emits
- `click` → ส่ง job object กลับ

### dataJob Parsing
`job.dataJob` เป็น JSON string — JobCard parse อัตโนมัติ:
```javascript
// สำหรับ PLAN_STOCK_COST (jobTypeId: 10)
parsedDataJob.stockNumber        // รหัสสินค้าใหม่
parsedDataJob.stockNumberOrigin  // รหัสสินค้าเก่า
```

### Usage

```vue
<JobCard
  v-for="job in myJobs"
  :key="job.id"
  :job="job"
  @click="viewJobDetail"
/>
```

---

## 8. Pinia Store

| Store | Store ID | ใช้ใน |
|-------|----------|-------|
| `useUserApiStore` | `userStore` | index-view.vue |

API actions ที่เกี่ยวข้อง:

| Action | Endpoint | หน้าที่ |
|--------|----------|---------|
| `fetchListMyJob` | `User/ListMyJob` | โหลดรายการงาน |

---

## 9. Inactive My Job Feature

### Flow
1. `job-card.vue` แสดง trash icon เมื่อ `showInactive: true`
2. กด trash icon → emit `@inactive` พร้อม job object
3. `index-view.vue` → `onInactiveJob(job)` → `confirmSubmit` dialog
4. ยืนยัน → เรียก `fetchInactiveMyJob({ id, jobRunning })` → API `User/InactiveMyJob`
5. สำเร็จ → `loadJobs()` reload

### Security
- Backend validate `CreateBy == CurrentUsername` — ไม่สามารถ inactive งานของคนอื่นได้
- Frontend ส่งทั้ง `id` และ `jobRunning` เพื่อ double-check

### API
```javascript
// store action
async fetchInactiveMyJob({ id, jobRunning }) {
  return await api.jewelry.post('User/InactiveMyJob', { id, jobRunning })
}
```

### JobCard Props ที่เกี่ยวข้อง

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showInactive` | Boolean | `false` | แสดง trash icon แทน chevron-right |

### Emit ที่เกี่ยวข้อง
- `inactive` → ส่ง job object กลับ

---

## 10. Features ที่ยังไม่ implement

| Feature | หมายเหตุ |
|---------|----------|
| `tab-count` (badge จำนวน) | `filterTabs[].count` เป็น `null` ทั้งหมด — ยังไม่มี count API |
| Job detail สำหรับ type อื่น | `viewJobDetail` → `console.log` ถ้าไม่ใช่ `PLAN_STOCK_COST` completed |
| Filter โดย date range | Backend รองรับแต่ frontend ยังไม่มี UI |

---

*Last updated: 2026-02-23 — Initial documentation*
