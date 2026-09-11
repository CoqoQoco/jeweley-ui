# Mobile Layout Architecture

เอกสารอธิบายโครงสร้าง Layout ของ Mobile Application

---

## Overview

Mobile ใช้ Layout แยกจาก Web โดยสิ้นเชิง — มี routing, layout component, และ SCSS เป็นของตัวเอง

```
src/layout/mobile/
├── LayoutMobile.vue         # Layout หลัก (มี TopBar + BottomNav)
├── LayoutMobileLogin.vue    # Layout สำหรับหน้า Login (ไม่มี nav)
└── MOBILE_LAYOUT.md         # เอกสารนี้
```

---

## Layout Components

### 1. `LayoutMobile.vue` — Layout หลัก

ใช้สำหรับทุกหน้าที่ต้อง login แล้ว (protected routes)

**โครงสร้าง**:
```
┌─────────────────────────────────┐
│  mobile-topbar-container        │  ← sticky top, z-index: 100
│  (MobileTopBar)                 │     ซ่อนที่หน้า Dashboard
├─────────────────────────────────┤
│                                 │
│  mobile-content-wrapper         │  ← flex: 1, scrollable
│  <router-view>                  │     padding-bottom: calc(70px + safe-area)
│                                 │
│                                 │
├─────────────────────────────────┤
│  mobile-bottom-nav-container    │  ← fixed bottom: 0, z-index: 100
│  (MobileBottomNav)              │     padding-bottom: safe-area
└─────────────────────────────────┘
```

**Features**:
- **TopBar แบบ conditional**: ซ่อนที่หน้า `mobile-dashboard` ผ่าน `showTopBar` computed
- **Page title**: ดึงจาก `$route.meta.Displayname.th`
- **Pull-to-refresh prevention**: ป้องกัน native pull-to-refresh ผ่าน touchstart/touchmove listener
- **Body class**: เพิ่ม `mobile-view` ที่ `<body>` ตอน mounted, ลบตอน beforeUnmount

**Global styles** (unscoped):
- ป้องกัน text selection (`user-select: none`)
- ป้องกัน tap highlight (`-webkit-tap-highlight-color: transparent`)
- ป้องกัน auto-zoom บน iOS Safari (`input, textarea, select { font-size: 16px !important }`)
- ซ่อน scrollbar
- ป้องกัน overscroll (`overscroll-behavior: none`)

### 2. `LayoutMobileLogin.vue` — Layout Login

ใช้สำหรับหน้า Login ของ mobile (public routes ไม่ต้อง auth)

**โครงสร้าง**: แค่ `<router-view>` เปล่าๆ บน gradient background
- Background: `linear-gradient(135deg, var(--base-font-color), var(--base-font-sub-color))`
- Body class: `mobile-login-view`
- มี global styles เหมือน LayoutMobile (ป้องกัน zoom, tap highlight, overscroll)

---

## Sub-Components

### `MobileTopBar` (`src/components/layout/mobile-top-bar.vue`)

แถบด้านบนแสดงชื่อหน้า + ปุ่ม navigation

**Layout**: CSS Grid 3 columns (`60px | 1fr | 60px`)

```
┌────────┬──────────────────────┬────────┐
│  ← Back│    Page Title         │ 🔔 ⋮  │
└────────┴──────────────────────┴────────┘
```

**Props**:
| Prop | Type | Default | หมายเหตุ |
|------|------|---------|----------|
| `title` | String | `''` | ถ้าไม่ส่ง จะใช้ `$route.meta.Displayname.th` |
| `backButton` | Boolean | `true` | แสดง back button |
| `notification` | Boolean | `true` | แสดง notification icon |
| `menu` | Boolean | `false` | แสดง menu icon (emit `menu-opened`) |

**Back Button Logic**:
1. ไม่แสดงที่หน้า Dashboard
2. ไม่แสดงถ้า `backButton` prop = false
3. แสดงเมื่อ `window.history.length > 1`
4. ถ้าไม่แสดง back → แสดง Home button แทน (ยกเว้นหน้า Dashboard)

**Safe Area**: รองรับ notch ผ่าน `@supports (padding-top: env(safe-area-inset-top))`

### `MobileBottomNav` (`src/components/layout/mobile-bottom-nav.vue`)

แถบ navigation ด้านล่าง (fixed)

**Nav Items** (กรองตาม permission):
| Item | Icon | Path | Permission |
|------|------|------|------------|
| หน้าแรก | `bi-house-door-fill` | `/mobile/dashboard` | `mobile:dashboard` |
| สแกน | `bi-qr-code-scan` | `/mobile/scan` | `mobile:scan` |
| งาน | `bi-list-task` | `/mobile/tasks` | `mobile:tasks` |
| โปรไฟล์ | `bi-person-fill` | `/mobile/profile` | `mobile:profile` |

**Features**:
- Permission-based filtering ผ่าน `PermissionService`
- Active state: icon scale 1.1 + bold label + theme color
- Touch feedback: `transform: scale(0.95)` on `:active`
- Badge support (จำนวนงานรอ — placeholder, ยังไม่ implement)
- ป้องกัน NavigationDuplicated error

---

## Routing

**ไฟล์**: `src/router/mobile/authen-routes.js`

**Path convention**: `/mobile/*`

### Routes ที่ implement แล้ว

| Route Name | Path | Component | Permission |
|------------|------|-----------|------------|
| `mobile-dashboard` | `/mobile/dashboard` | `dashboard/index-view.vue` | `mobile:dashboard` |
| `mobile-scan` | `/mobile/scan` | `scan/index-view.vue` | `mobile:scan` |
| `mobile-tasks` | `/mobile/tasks` | `tasks/index-view.vue` | `mobile:tasks` |
| `mobile-cost-version-detail` | `/mobile/cost-version/:jobRunning` | `cost-version-detail/index-view.vue` | `mobile:tasks` |
| `mobile-sale` | `/mobile/sale` | `sale/index-view.vue` | `mobile:sale` |
| `mobile-sale-create` | `/mobile/sale/create` | `sale/create-view.vue` | `mobile:sale` |
| `mobile-sale-detail` | `/mobile/sale/detail/:soNumber` | `sale/detail-view.vue` | `mobile:sale` |
| `mobile-invoice-detail` | `/mobile/sale/invoice/:invoiceNumber` | `sale/invoice-detail-view.vue` | `mobile:sale` |
| `mobile-quotation` | `/mobile/quotation` | `quotation/index-view.vue` | `mobile:sale` |
| `mobile-quotation-detail` | `/mobile/quotation/:number` | `quotation/detail-view.vue` | `mobile:sale` |
| `mobile-profile` | `/mobile/profile` | `profile/index-view.vue` | `mobile:profile` |
| `mobile-notifications` | `/mobile/notifications` | `notifications/index-view.vue` | `mobile:notifications` |

### Routes ที่ยังไม่ implement (commented out)
- `mobile-production` — แผนการผลิต
- `mobile-stock` — สต็อก
- `mobile-cost-stock` — ตีราคาสินค้า
- `mobile-settings` — ตั้งค่า

---

## SCSS System

**Import**: `@import '@/assets/scss/responsive-style/mobile';`

**ไฟล์**:
```
src/assets/scss/responsive-style/mobile/
├── index.scss              # Main entry (import utilities + shared vars/mixins)
└── mobile-utilities.scss   # Utility classes ทั้งหมด
```

### Utility Classes Reference

#### Container & Card
| Class | คำอธิบาย |
|-------|----------|
| `.mobile-container` | Container padding 16px, background white |
| `.mobile-card` | Card: white bg, rounded 12px, shadow, margin-bottom 12px |
| `.mobile-card-flat` | Flat card: no shadow, border-bottom separator |

#### Typography
| Class | คำอธิบาย |
|-------|----------|
| `.mobile-title` | 1.25rem, bold 600, theme color |
| `.mobile-subtitle` | 1rem, bold 500, #333 |
| `.mobile-text` | 0.9rem, #666 |
| `.mobile-text-sm` | 0.8rem, #999 |
| `.mobile-text-bold` | font-weight: 600 |

#### Buttons
| Class | คำอธิบาย |
|-------|----------|
| `.mobile-btn` | Base button: full width, rounded 8px, flex center |
| `.mobile-btn-primary` | Theme color background, white text |
| `.mobile-btn-secondary` | #f0f0f0 bg, #333 text |
| `.mobile-btn-success` | Green bg, white text |
| `.mobile-btn-danger` | Red bg, white text |
| `.mobile-btn-warning` | Warning bg, #333 text |
| `.mobile-btn-outline` | Transparent bg, theme color border + text |
| `.mobile-btn-sm` | Smaller padding (8px 12px) |
| `.mobile-btn-lg` | Larger padding (16px 20px) |
| `.mobile-btn-icon` | Icon-only button: 40x40, rounded full, transparent |

#### Form
| Class | คำอธิบาย |
|-------|----------|
| `.mobile-form-group` | Form group wrapper: margin-bottom 16px, label + input styling |
| `.form-helper-text` | Helper text: 0.8rem, #999 |
| `.form-error-text` | Error text: 0.8rem, red |

#### List
| Class | คำอธิบาย |
|-------|----------|
| `.mobile-list` | List container: white bg, rounded 12px |
| `.mobile-list-item` | List item: padding 14px 16px, border-bottom, flex |
| `.list-icon` | Icon circle: 40x40, #f5f5f5 bg |
| `.list-content` | Content: flex 1, `.list-title` + `.list-subtitle` |
| `.list-action` | Action area: chevron icon |

#### Grid & Flex
| Class | คำอธิบาย |
|-------|----------|
| `.mobile-grid-2` | 2-column grid, gap 12px |
| `.mobile-grid-3` | 3-column grid, gap 12px |
| `.mobile-grid-auto` | Auto-fit grid (min 150px), gap 12px |
| `.mobile-flex` | Flex container, gap 12px |
| `.mobile-flex-column` | Flex column direction |
| `.mobile-flex-center` | Center align + justify |
| `.mobile-flex-between` | Space between |
| `.mobile-flex-wrap` | Flex wrap |

#### Spacing
| Pattern | ค่า |
|---------|-----|
| `.mobile-m-{0,1,2,3}` | margin: 0/8px/16px/24px |
| `.mobile-mt-{0,1,2,3}` | margin-top: 0/8px/16px/24px |
| `.mobile-mb-{0,1,2,3}` | margin-bottom: 0/8px/16px/24px |
| `.mobile-ml-{1,2}` | margin-left: 8px/16px |
| `.mobile-mr-{1,2}` | margin-right: 8px/16px |
| `.mobile-p-{0,1,2,3}` | padding: 0/8px/16px/24px |
| `.mobile-pt-{1,2,3}` | padding-top: 8px/16px/24px |
| `.mobile-pb-{1,2,3}` | padding-bottom: 8px/16px/24px |
| `.mobile-px-{1,2,3}` | padding-left+right: 8px/16px/24px |
| `.mobile-py-{1,2,3}` | padding-top+bottom: 8px/16px/24px |

#### Other Utilities
| Class | คำอธิบาย |
|-------|----------|
| `.mobile-divider` | Divider 1px #e0e0e0 |
| `.mobile-divider-thick` | Thick divider 8px #f5f5f5 (bleed to edges) |
| `.mobile-badge-{primary,success,warning,danger,secondary}` | Badge/tag |
| `.mobile-empty-state` | Empty state: centered icon + title + subtitle |
| `.mobile-loading` | Loading spinner + text |
| `.mobile-safe-top` / `.mobile-safe-bottom` | Safe area padding |
| `.mobile-shadow` / `.mobile-shadow-lg` | Box shadow |
| `.mobile-rounded` / `.mobile-rounded-lg` / `.mobile-rounded-full` | Border radius 8px/12px/9999px |
| `.mobile-truncate` | Text ellipsis |
| `.mobile-text-center` / `.mobile-text-right` / `.mobile-text-left` | Text alignment |
| `.mobile-tap-feedback` | Touch feedback (opacity + scale) |

---

## iOS Safari Safe Area (Critical)

**Problem**: iOS Safari มี bottom toolbar/home indicator ที่ทับ `position: fixed; bottom: 0`

**Solution**: `viewport-fit=cover` + `env(safe-area-inset-bottom)`

### ค่าสำคัญ

| Element | CSS |
|---------|-----|
| Bottom nav container | `padding-bottom: env(safe-area-inset-bottom, 0px)` |
| Content wrapper | `padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px))` |
| View padding | `padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px))` |
| Sticky btn above nav | `bottom: calc(70px + env(safe-area-inset-bottom, 0px))` |
| View with sticky btn + nav | `padding-bottom: calc(140px + env(safe-area-inset-bottom, 0px))` |

### Z-Index Hierarchy

```
9999  - Loading Overlay
1000  - Full-screen Modal Overlays (customer search/create)
100   - Bottom Nav Container + Top Bar Container
99    - Sticky Bottom Buttons (above bottom nav)
10    - Sticky Table Headers
```

---

## Component Conventions (Mobile vs Web)

| Rule | Web | Mobile |
|------|-----|--------|
| **UI Framework** | PrimeVue (DataTable, Dropdown, etc.) | Native HTML (`<select>`, `<input>`, `<checkbox>`) |
| **Date picker** | PrimeVue Calendar | PrimeVue Calendar (ผ่าน CalendarGeneric) |
| **Dropdown/Select** | PrimeVue Dropdown | Native `<select>` |
| **SCSS Import** | `responsive-style/web` | `responsive-style/mobile` |
| **API Pattern** | Options API | Options API |
| **Alerts** | sweetAlerts | sweetAlerts |
| **Try-catch** | No (axios middleware) | No (axios middleware) |
| **Loading state** | No manual (axios middleware) | No manual (axios middleware) |
| **File naming** | kebab-case | kebab-case |

---

## Mobile Full-Screen Modal Pattern

Modal แบบเต็มหน้าจอบน mobile **ต้องใช้ `<Teleport to="body">`** เสมอ เพื่อหลีกเลี่ยง stacking context issues บน iOS Safari

**Rules:**
1. ใช้ `<Teleport to="body">` ครอบ modal overlay เสมอ
2. overlay ใช้ `position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000`
3. เพิ่ม `env(safe-area-inset-top)` ที่ header ของ modal
4. เพิ่ม `env(safe-area-inset-bottom)` ที่ padding-bottom ของ scrollable content
5. ห้ามใช้ `-webkit-overflow-scrolling: touch` (deprecated ตั้งแต่ iOS 13, ก่อปัญหา stacking context)

**Template:**
```vue
<template>
  <Teleport to="body">
    <div v-if="isVisible" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <!-- Header content -->
        </div>
        <div class="modal-body">
          <!-- Scrollable content -->
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
}
</style>
```

**ตัวอย่างที่ใช้ pattern นี้:**
- `src/views/mobile/sale/components/customer-create-modal.vue`
- `src/views/mobile/sale/components/customer-search-modal.vue`

---

## Known Issues & Fixes

### iOS Safari: Modal ถูกทับโดย TopBar/BottomNav (แก้ไขแล้ว)

**อาการ**: Full-screen modal (`position: fixed; z-index: 1000`) แสดงอยู่ใต้ TopBar และ BottomNav บน iPhone ทั้งที่ z-index สูงกว่า (1000 vs 100) — เกิดบน iPhone เท่านั้น, Android/Desktop ปกติ

**Root Cause**: `-webkit-overflow-scrolling: touch` ที่ `.mobile-content-wrapper` ใน `LayoutMobile.vue`

```
mobile-layout
├── mobile-topbar-container      (sticky, z-index: 100) ← อยู่นอก content wrapper
├── mobile-content-wrapper        (overflow-y: auto + -webkit-overflow-scrolling: touch)
│   └── router-view
│       └── modal-overlay         (fixed, z-index: 1000) ← ติดอยู่ข้างใน!
└── mobile-bottom-nav-container   (fixed, z-index: 100) ← อยู่นอก content wrapper
```

iOS Safari ใช้ `-webkit-overflow-scrolling: touch` สร้าง **stacking context ใหม่** ทำให้ z-index ของ modal แข่งได้แค่ภายใน `.mobile-content-wrapper` เท่านั้น — ไม่สามารถทับ TopBar/BottomNav ที่อยู่นอก content wrapper ได้

**วิธีแก้** (ทำแล้ว):
1. **ลบ** `-webkit-overflow-scrolling: touch` จาก `LayoutMobile.vue` — deprecated ตั้งแต่ iOS 13, momentum scrolling เป็น default แล้ว
2. **เพิ่ม** `<Teleport to="body">` ให้ modal ทุกตัว — ย้าย modal ออกจาก DOM hierarchy เพื่อป้องกัน stacking context issues ในอนาคต
3. **เพิ่ม** safe area padding (`env(safe-area-inset-top/bottom)`) ให้ modal content — เพราะ Teleport ไปที่ body แล้ว modal ต้องจัดการ safe area เอง

**กฎสำคัญ**:
- ห้ามใช้ `-webkit-overflow-scrolling: touch` ใน mobile layout/components ทุกที่
- Full-screen modal ต้องใช้ `<Teleport to="body">` เสมอ (ดู section "Mobile Full-Screen Modal Pattern")

---

## Mobile View Template

โครงสร้างพื้นฐานสำหรับสร้างหน้า mobile ใหม่:

```vue
<template>
  <div class="mobile-feature-view">
    <!-- Content -->
    <div class="mobile-container mobile-mt-1">
      <!-- Your content here -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileFeatureView',

  setup() {
    // Pinia stores
  },

  data() {
    return {}
  },

  mounted() {
    // Initial data loading
  },

  methods: {
    // Methods
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.mobile-feature-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}
</style>
```
