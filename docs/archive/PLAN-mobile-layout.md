# PLAN: แก้ปัญหา Modal ถูกทับโดย TopBar/BottomNav บน iPhone

## สถานะ: Implemented

---

## 1. Root Cause Analysis

### ปัญหาที่เกิด
`customer-create-modal.vue` และ `customer-search-modal.vue` ใช้ `position: fixed; z-index: 1000` แต่บน iPhone (iOS Safari) เนื้อหา modal ถูกทับโดย TopBar และ BottomNav ทั้งที่ z-index สูงกว่า (1000 vs 100)

### สาเหตุที่แท้จริง: iOS Safari Stacking Context Bug

**โครงสร้างปัจจุบัน:**
```
<div class="mobile-layout">
  <div class="mobile-topbar-container">     ← sticky, z-index: 100
  <div class="mobile-content-wrapper">      ← overflow-y: auto + -webkit-overflow-scrolling: touch
    <router-view>
      <customer-create-modal>               ← position: fixed, z-index: 1000
    </router-view>
  </div>
  <div class="mobile-bottom-nav-container"> ← fixed, z-index: 100
</div>
```

**ปัญหาคือ `-webkit-overflow-scrolling: touch`** ที่ `LayoutMobile.vue` บรรทัด 140:

```scss
.mobile-content-wrapper {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;  // ← สร้าง stacking context ใหม่บน iOS Safari!
}
```

บน iOS Safari, `-webkit-overflow-scrolling: touch` สร้าง **stacking context ใหม่** ทำให้:
- Modal อยู่ **ข้างใน** stacking context ของ `.mobile-content-wrapper`
- z-index: 1000 ของ modal แข่งได้แค่ **ภายใน** `.mobile-content-wrapper` เท่านั้น
- TopBar (sticky, z-index: 100) และ BottomNav (fixed, z-index: 100) อยู่ **นอก** content wrapper
- เนื่องจาก `.mobile-content-wrapper` ไม่มี z-index กำหนด (auto = 0) → modal ไม่สามารถทับ TopBar/BottomNav ได้

**ผลลัพธ์**: Modal ถูกวาดอยู่ใต้ TopBar และ BottomNav เสมอบน iPhone ไม่ว่าจะตั้ง z-index สูงแค่ไหน

### ทำไมเกิดแค่บน iPhone?
- `-webkit-overflow-scrolling: touch` เป็น **iOS Safari-only** property
- Chrome/Android ไม่รู้จัก property นี้ จึงไม่สร้าง stacking context → modal ทำงานปกติ
- Desktop browsers ก็ไม่มีปัญหาเช่นกัน

---

## 2. วิธีแก้ไข

### แก้ 2 จุด: Root Cause + Modal Pattern

### 2.1 ลบ `-webkit-overflow-scrolling: touch` ออกจาก LayoutMobile.vue

**ไฟล์**: `src/layout/mobile/LayoutMobile.vue` บรรทัด 140

```scss
// ก่อนแก้:
.mobile-content-wrapper {
  flex: 1;
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  overflow-x: hidden;

  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;  // ← ลบบรรทัดนี้
}

// หลังแก้:
.mobile-content-wrapper {
  flex: 1;
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  overflow-x: hidden;

  scroll-behavior: smooth;
}
```

**เหตุผล**:
- `-webkit-overflow-scrolling: touch` เป็น property เก่าที่ใช้เปิด momentum scrolling บน iOS Safari
- **ตั้งแต่ iOS 13 (2019)** iOS Safari ใช้ momentum scrolling เป็น default สำหรับทุก `overflow: auto/scroll` แล้ว
- ไม่จำเป็นต้องใช้อีกต่อไป และมันก่อ side effect (สร้าง stacking context ที่ไม่ต้องการ)
- Apple เองก็ deprecated property นี้แล้ว

### 2.2 เพิ่ม `<Teleport to="body">` ให้ Full-Screen Modal ทุกตัว

แม้ลบ `-webkit-overflow-scrolling: touch` แล้วจะแก้ปัญหาได้ แต่เพื่อป้องกันปัญหาในอนาคต (กรณี CSS อื่นๆ สร้าง stacking context โดยไม่ตั้งใจ) ควรย้าย modal ออกจาก DOM hierarchy ด้วย `<Teleport>`

**ไฟล์ที่แก้:**

#### 2.2.1 `customer-create-modal.vue`

```vue
<!-- ก่อนแก้: -->
<template>
  <div v-if="isVisible" class="customer-create-overlay">
    ...
  </div>
</template>

<!-- หลังแก้: -->
<template>
  <Teleport to="body">
    <div v-if="isVisible" class="customer-create-overlay">
      ...
    </div>
  </Teleport>
</template>
```

เพิ่ม safe area padding ให้ `.create-form-section`:
```scss
// ก่อนแก้:
.create-form-section {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 40px;
  -webkit-overflow-scrolling: touch;
}

// หลังแก้:
.create-form-section {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
}
```

**หมายเหตุ**: ลบ `-webkit-overflow-scrolling: touch` ออกจาก `.create-form-section` ด้วย (ถ้ามี) เพราะเหตุผลเดียวกัน

#### 2.2.2 `customer-search-modal.vue`

```vue
<!-- ก่อนแก้: -->
<template>
  <div v-if="isVisible" class="customer-search-overlay">
    ...
  </div>
</template>

<!-- หลังแก้: -->
<template>
  <Teleport to="body">
    <div v-if="isVisible" class="customer-search-overlay">
      ...
    </div>
  </Teleport>
</template>
```

เพิ่ม safe area padding ให้ `.search-header`:
```scss
// ก่อนแก้:
.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  ...
}

// หลังแก้:
.search-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
  ...
}
```

---

## 3. สรุปไฟล์ที่ต้องแก้ไข

| # | ไฟล์ | สิ่งที่เปลี่ยน |
|---|------|--------------|
| 1 | `src/layout/mobile/LayoutMobile.vue` | ลบ `-webkit-overflow-scrolling: touch` (บรรทัด 140) |
| 2 | `src/views/mobile/sale/components/customer-create-modal.vue` | เพิ่ม `<Teleport to="body">` + safe area padding (top + bottom) |
| 3 | `src/views/mobile/sale/components/customer-search-modal.vue` | เพิ่ม `<Teleport to="body">` + safe area padding (top) |
| 4 | `src/layout/mobile/MOBILE_LAYOUT.md` | เพิ่ม section "Mobile Modal Pattern" อธิบาย pattern ที่ถูกต้อง |

---

## 4. อัปเดต MOBILE_LAYOUT.md

เพิ่ม section ใหม่:

### Mobile Modal Pattern

```markdown
### Mobile Full-Screen Modal Pattern

Modal แบบเต็มหน้าจอบน mobile **ต้องใช้ `<Teleport to="body">`** เสมอ เพื่อหลีกเลี่ยง stacking context issues บน iOS Safari

**Rules:**
1. ใช้ `<Teleport to="body">` ครอบ modal overlay เสมอ
2. overlay ใช้ `position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000`
3. เพิ่ม `env(safe-area-inset-top)` ที่ header ของ modal
4. เพิ่ม `env(safe-area-inset-bottom)` ที่ padding-bottom ของ scrollable content
5. ห้ามใช้ `-webkit-overflow-scrolling: touch` (deprecated, ก่อปัญหา stacking context)

**Template:**
\```vue
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
\```
```

---

## 5. Verification

1. **iPhone Safari**: เปิดหน้า Sale → กดเพิ่มลูกค้าใหม่ → modal ต้องแสดงเต็มจอ ไม่ถูกทับ TopBar/BottomNav
2. **iPhone Safari**: modal search ลูกค้า → header + search input + list ต้องใช้งานได้ทั้งหมด
3. **iPhone Safari**: scroll เนื้อหาใน modal ต้อง smooth (momentum scrolling ยังทำงาน แม้ไม่มี `-webkit-overflow-scrolling: touch`)
4. **Android Chrome**: ทุกอย่างยังทำงานปกติ (ไม่มี regression)
5. **หน้า mobile อื่นๆ**: scroll ปกติ, TopBar/BottomNav ทำงานปกติ
