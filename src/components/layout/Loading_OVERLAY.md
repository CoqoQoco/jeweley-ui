# LoadingOverlay Component

ไฟล์: `src/components/layout/LoadingOverlay.vue`
ชื่อ component: `BaseLoading`

---

## ภาพรวม

Global loading overlay แสดงทับหน้าจอทั้งหมดเมื่อมี API call — ควบคุมผ่าน `useLoadingStore` (Pinia)
มี timeout warning อัตโนมัติเมื่อ loading นานเกินกำหนด พร้อมปุ่มยกเลิก

---

## การใช้งาน

Mount **ครั้งเดียว** ใน `App.vue` — ทำงานอัตโนมัติ ไม่ต้อง import ซ้ำในหน้าอื่น

```vue
<!-- App.vue -->
<router-view></router-view>
<BaseLoading />
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showText` | Boolean | `true` | reserved — ยังไม่ได้ใช้ใน template |
| `fullPage` | Boolean | `true` | reserved — ยังไม่ได้ใช้ใน template |
| `timeoutSeconds` | Number | `30` | วินาทีก่อนแสดง timeout warning |

---

## Loading State — ควบคุมผ่าน Pinia Store

```javascript
import { useLoadingStore } from '@/stores/modules/master/loading-store'

const loadingStore = useLoadingStore()

loadingStore.showLoading()  // แสดง overlay
loadingStore.hideLoading()  // ซ่อน overlay
```

**หมายเหตุ**: axios middleware (`src/axios/axios-helper.js`) จัดการ show/hide อัตโนมัติสำหรับทุก API call — ไม่ต้องเรียก manual

---

## Timeout Warning

เมื่อ loading ค้างเกิน `timeoutSeconds` (default 30 วินาที):
- แสดง `.cancel-loading-container` พร้อมข้อความภาษาไทย
- ปุ่ม "ปิดหน้าต่าง" → เรียก `loadingStore.hideLoading()` + `stopTimer()`

`convertToMinute(seconds)` แปลงวินาทีเป็น `"m:ss"` เช่น 90 → `"1:30"`

---

## โครงสร้าง Template

```
.loading-overlay          ← position: fixed, full screen, z-index: 9999, v-if="isLoading"
  └── .loader-container   ← flex column, center
        ├── .loader       ← ripple animation container (--size controls overall size)
        │     └── .box ×3 ← วงกลมซ้อนกัน (--i: 1-3, --inset กำหนดขนาด)
        │           └── .logo → img.svg  ← โลโก้ DK (แสดงใน box แรกเท่านั้น)
        └── .cancel-loading-container  ← v-if="showTimeoutWarning"
              └── ปุ่ม .btn-cancel
```

---

## Animation

Ripple animation จาก 3 `.box` ซ้อนกัน แต่ละวงมี delay ต่างกัน

| CSS Variable | ค่า (Web) | หน้าที่ |
|---|---|---|
| `--size` | `400px` | ขนาดรวมของ loader |
| `--duration` | `2.5s` | ความเร็ว ripple animation |
| `--logo-color` | `#ffff` | สีโลโก้ (reserved) |
| `--i` | `1, 2, 3` | index ของแต่ละ box (กำหนด delay + z-index) |
| `--inset` | `30%, 28%, 22%` | ขนาด inset ของแต่ละ box |

**Keyframe ripple**: scale 1 → 1.4 → 1 พร้อม box-shadow เปลี่ยน

---

## Mobile Responsive

ใช้ `@media (max-width: 768px)` ใน scoped style — ไม่ต้องพึ่ง `body.mobile-view`
scoped hash ยังคงอยู่จึงไม่กระทบ component อื่น

| Property | Web | Mobile (≤ 768px) |
|----------|-----|-----------------|
| `--size` | `400px` | `180px` |
| `.svg` width | `150px` | `70px` |
| `.loader-container` padding | `2rem` | `1rem` |
| `.cancel-loading-container` font-size | `16px` | `14px` |
| `.cancel-loading-container` padding | `1.5rem` | `1rem` |
| `.cancel-loading-container` margin-top | `2rem` | `1rem` |
| `.cancel-loading-container` max-width | `350px` | `280px` |

> **หมายเหตุ**: ห้ามใช้ `:global(.mobile-view)` ใน scoped style — SCSS nesting ทำให้ class ชื่อซ้ำกลายเป็น global selector ไปกระทบ component อื่น

---

## Z-Index

```
9999 — .loading-overlay  ← สูงสุดในระบบ ทับทุกอย่าง รวมถึง modal (1000) และ bottom nav (100)
```

---

## Setup Logic

```
isLoading (Pinia) → watch →
  true  → startTimer() → setInterval ทุก 1 วินาที → ถ้า timeElapsed ≥ timeoutSeconds → showTimeoutWarning = true
  false → stopTimer()  → clearInterval + reset timeElapsed + showTimeoutWarning = false

onBeforeUnmount → stopTimer() (cleanup)
```

---

## ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/App.vue` | mount `<BaseLoading />` |
| `src/stores/modules/master/loading-store.js` | `isLoading` state (Pinia) |
| `src/axios/axios-helper.js` | auto show/hide ผ่าน axios interceptor |
| `src/assets/duangkaew-logo.png` | โลโก้ที่แสดงใน loader |

---

*Last updated: 2026-02-23 — เพิ่ม mobile responsive (`@media (max-width: 768px)`), เขียน documentation ครบ*
