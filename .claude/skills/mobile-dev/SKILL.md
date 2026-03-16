---
name: mobile-dev
description: Mobile development guidelines — ใช้เมื่อสร้าง mobile component, จัด layout mobile, หรือแก้ปัญหา iOS Safari safe area
---

# Mobile Development Guidelines

## Layout Architecture

```
index.html (viewport-fit=cover)
  └── LayoutMobile.vue
      ├── mobile-topbar-container     (sticky top, optional per route)
      ├── mobile-content-wrapper      (scrollable, padding-bottom รวม safe area)
      └── mobile-bottom-nav-container (fixed bottom: 0 + safe area)
```

Routes: `/mobile/*` — แยกจาก web routes ชัดเจน

---

## iOS Safari Safe Area (CRITICAL)

**ปัญหา**: iOS Safari มี home indicator ที่ทับ `position: fixed; bottom: 0`

**วิธีแก้**: `viewport-fit=cover` + `env(safe-area-inset-bottom)` ทุก fixed/sticky bottom element

### กฎ
1. `index.html` ต้องมี `viewport-fit=cover` ใน meta viewport tag
2. ทุก `position: fixed; bottom` ต้องใช้ `env(safe-area-inset-bottom, 0px)`
3. ทุก `padding-bottom` ที่เผื่อ bottom nav ต้องรวม safe area

```scss
/* ✅ Good */
.my-fixed-bottom {
  position: fixed;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.my-view {
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

/* ❌ Bad */
.my-fixed-bottom {
  position: fixed;
  bottom: 0;
}

.my-view {
  padding-bottom: 80px;
}
```

### Key Values
| Element | padding-bottom |
|---|---|
| Content wrapper | `calc(70px + env(safe-area-inset-bottom, 0px))` |
| View with bottom nav | `calc(80px + env(safe-area-inset-bottom, 0px))` |
| Sticky btn above nav | `bottom: calc(70px + env(safe-area-inset-bottom, 0px))` |
| View + sticky btn + nav | `calc(140px + env(safe-area-inset-bottom, 0px))` |

---

## SCSS Import

```scss
@import '@/assets/scss/responsive-style/mobile';
```

---

## Mobile CSS Classes ที่ใช้บ่อย

| Class | Usage |
|---|---|
| `.mobile-container` | Container พร้อม padding |
| `.mobile-mt-{1-3}` | Margin top (8px, 16px, 24px) |
| `.mobile-btn` + modifier | Buttons (primary, outline, success) |
| `.mobile-form-group` | Form styling |
| `.mobile-empty-state` | Empty state display |
| `.mobile-grid-2` | 2-column grid |
| `.mobile-safe-top` | padding-top: safe area |
| `.mobile-safe-bottom` | padding-bottom: safe area |

---

## Z-Index Hierarchy

```
9999  Loading Overlay
1000  Full-screen Modal Overlays
100   Bottom Nav + Top Bar
99    Sticky Bottom Buttons
10    Sticky Table Headers
```

---

## Convention เทียบกับ Web

| Rule | Web | Mobile |
|---|---|---|
| UI Framework | PrimeVue | PrimeVue (generic wrappers preferred) |
| SCSS | `responsive-style/web` | `responsive-style/mobile` |
| API Pattern | Options API | Options API |
| Alerts | sweetAlerts | sweetAlerts |
| Try-catch | ❌ ไม่ใช้ | ❌ ไม่ใช้ |
| Loading state | ❌ ไม่ใช้ manual | ❌ ไม่ใช้ manual |

---

## Template เริ่มต้น

```vue
<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.my-mobile-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}
</style>
```
