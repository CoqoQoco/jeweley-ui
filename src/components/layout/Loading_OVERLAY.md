# LoadingOverlay Component

ไฟล์: `src/components/layout/LoadingOverlay.vue`

---

## ภาพรวม

Global loading overlay แสดงทับหน้าจอทั้งหมดเมื่อมี API call — ควบคุมผ่าน `useLoadingStore` (Pinia)
มี timeout warning เมื่อ loading นานเกินกำหนด พร้อมปุ่มยกเลิก

---

## การใช้งาน

Mount ครั้งเดียวใน `App.vue` — ทำงานอัตโนมัติ ไม่ต้องเรียกเองในแต่ละหน้า

```vue
<!-- App.vue -->
<router-view></router-view>
<BaseLoading />
```

**ไม่ต้อง** import หรือใช้ซ้ำในหน้าอื่น

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showText` | Boolean | `true` | (reserved — ยังไม่ได้ใช้ใน template) |
| `fullPage` | Boolean | `true` | (reserved — ยังไม่ได้ใช้ใน template) |
| `timeoutSeconds` | Number | `30` | วินาทีก่อนแสดง timeout warning |

---

## Loading State — ควบคุมผ่าน Store

```javascript
import { useLoadingStore } from '@/stores/modules/master/loading-store'

const loadingStore = useLoadingStore()

loadingStore.showLoading()   // แสดง overlay
loadingStore.hideLoading()   // ซ่อน overlay
```

**หมายเหตุ**: axios middleware จัดการ show/hide อัตโนมัติสำหรับทุก API call — ไม่ต้องเรียก manual

---

## Timeout Warning

เมื่อ loading เกิน `timeoutSeconds` (default 30 วินาที):
- แสดงกล่อง warning พร้อมข้อความเป็นภาษาไทย
- มีปุ่ม "ปิดหน้าต่าง" → เรียก `loadingStore.hideLoading()` + stop timer

---

## Animation

Ripple animation จาก 3 วงกลมซ้อนกัน (`.box`) แต่ละวงมี delay ต่างกัน (`--i * 0.15s`)

| CSS Variable | ค่า | หน้าที่ |
|---|---|---|
| `--size` | `400px` | ขนาด loader (web) |
| `--duration` | `2.5s` | ความเร็ว animation |
| `--logo-color` | `#ffff` | สีโลโก้ |

---

## Mobile Responsive

ใช้ `body.mobile-view` class (set โดย `LayoutMobile.vue`) เพื่อ override ขนาด

| Property | Web | Mobile |
|----------|-----|--------|
| `--size` (loader) | `400px` | `180px` |
| `.svg` width | `150px` | `70px` |
| `.loader-container` padding | `2rem` | `1rem` |
| `.cancel-loading-container` font-size | `16px` | `14px` |
| `.cancel-loading-container` max-width | `350px` | `280px` |

**Mechanism**: ใช้ `@media (max-width: 768px)` ใน scoped style ธรรมดา — ไม่ต้องพึ่ง `body.mobile-view` เพราะ mobile device มี screen width < 768px อยู่แล้ว scoped hash ยังคงอยู่จึงไม่กระทบ component อื่น

---

## Z-Index

```
9999 — .loading-overlay (สูงสุดในระบบ — ทับทุกอย่าง รวมถึง modal และ bottom nav)
```

---

## ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/App.vue` | mount component |
| `src/stores/modules/master/loading-store.js` | `isLoading` state |
| `src/axios/axios-helper.js` | auto show/hide ผ่าน interceptor |
| `src/layout/mobile/LayoutMobile.vue` | set `body.mobile-view` |

---

*Last updated: 2026-02-23 — เพิ่ม mobile responsive (`@media (max-width: 768px)` ใน scoped style)*
