# Mobile SCSS Utilities

Utility classes สำหรับ Mobile view เท่านั้น (< 768px)

## การใช้งาน

### Import ใน Vue Component

```vue
<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

// Component-specific styles
.my-component {
  // ...
}
</style>
```

## Available Utilities

### Container

- `.mobile-container` - Container with padding และ white background
- `.mobile-card` - Card with rounded corners และ shadow
- `.mobile-card-flat` - Flat card with border-bottom

### Typography

- `.mobile-title` - หัวข้อหลัก (1.25rem)
- `.mobile-subtitle` - หัวข้อรอง (1rem)
- `.mobile-text` - ข้อความปกติ (0.9rem)
- `.mobile-text-sm` - ข้อความเล็ก (0.8rem)
- `.mobile-text-bold` - ข้อความตัวหนา

### Buttons

- `.mobile-btn` - ปุ่มพื้นฐาน (full width)
  - `.mobile-btn-primary` - สีแดง
  - `.mobile-btn-secondary` - สีเทา
  - `.mobile-btn-success` - สีเขียว
  - `.mobile-btn-danger` - สีแดงเข้ม
  - `.mobile-btn-outline` - ขอบเส้น
  - `.mobile-btn-sm` - ขนาดเล็ก
  - `.mobile-btn-lg` - ขนาดใหญ่

### Form

- `.mobile-form-group` - Form group container
  - Auto-styled `label`, `input`, `textarea`, `select`
  - `.form-helper-text` - Helper text
  - `.form-error-text` - Error message

### List

- `.mobile-list` - List container
- `.mobile-list-item` - List item
  - `.list-icon` - Icon container (40x40 circle)
  - `.list-content` - Content area
    - `.list-title` - หัวข้อ
    - `.list-subtitle` - รายละเอียด
  - `.list-action` - Action icon (chevron, etc.)

### Grid & Flexbox

- `.mobile-grid-2` - 2 columns grid
- `.mobile-grid-3` - 3 columns grid
- `.mobile-grid-auto` - Auto-fit grid (min 150px)
- `.mobile-flex` - Flexbox container
  - `.mobile-flex-column` - Flex column
  - `.mobile-flex-row` - Flex row
  - `.mobile-flex-center` - Center items
  - `.mobile-flex-between` - Space between
  - `.mobile-flex-wrap` - Flex wrap

### Spacing

#### Margin
- `.mobile-m-{0-3}` - All sides
- `.mobile-mt-{0-3}` - Top
- `.mobile-mb-{0-3}` - Bottom
- `.mobile-ml-{1-2}` - Left
- `.mobile-mr-{1-2}` - Right

#### Padding
- `.mobile-p-{0-3}` - All sides
- `.mobile-pt-{1-3}` - Top
- `.mobile-pb-{1-3}` - Bottom
- `.mobile-px-{1-3}` - Horizontal
- `.mobile-py-{1-3}` - Vertical

**Spacing Scale:**
- `0` = 0px
- `1` = 8px
- `2` = 16px
- `3` = 24px

### Divider

- `.mobile-divider` - บาง (1px)
- `.mobile-divider-thick` - หนา (8px, เต็มความกว้าง)

### Badge & Tag

- `.mobile-badge` - Badge พื้นฐาน
  - `.mobile-badge-primary`
  - `.mobile-badge-success`
  - `.mobile-badge-warning`
  - `.mobile-badge-danger`
  - `.mobile-badge-secondary`

### Empty State & Loading

- `.mobile-empty-state` - Empty state container
  - `.empty-title`
  - `.empty-subtitle`
- `.mobile-loading` - Loading spinner
  - `.spinner`
  - `.loading-text`

### Safe Area (iPhone Notch)

- `.mobile-safe-top`
- `.mobile-safe-bottom`
- `.mobile-safe-left`
- `.mobile-safe-right`

### Utilities

- `.mobile-hide` / `.mobile-show` - Visibility
- `.mobile-text-center` / `.mobile-text-right` / `.mobile-text-left` - Text alignment
- `.mobile-truncate` - Text truncation (ellipsis)
- `.mobile-shadow` / `.mobile-shadow-lg` - Box shadow
- `.mobile-rounded` / `.mobile-rounded-lg` / `.mobile-rounded-full` - Border radius
- `.mobile-tap-feedback` - Tap feedback animation

## ตัวอย่างการใช้งาน

### Card with List Items

```vue
<template>
  <div class="mobile-container">
    <h2 class="mobile-title">รายการสินค้า</h2>

    <div class="mobile-list">
      <div class="mobile-list-item mobile-list-item-clickable" @click="selectItem(1)">
        <div class="list-icon">
          <i class="bi bi-gem"></i>
        </div>
        <div class="list-content">
          <div class="list-title">สร้อยคอทองคำ</div>
          <div class="list-subtitle">น้ำหนัก: 15.5 กรัม</div>
        </div>
        <div class="list-action">
          <i class="bi bi-chevron-right"></i>
        </div>
      </div>

      <div class="mobile-list-item mobile-list-item-clickable" @click="selectItem(2)">
        <div class="list-icon">
          <i class="bi bi-gem"></i>
        </div>
        <div class="list-content">
          <div class="list-title">แหวนเพชร</div>
          <div class="list-subtitle">น้ำหนัก: 3.2 กรัม</div>
        </div>
        <div class="list-action">
          <i class="bi bi-chevron-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>
```

### Form

```vue
<template>
  <div class="mobile-container">
    <div class="mobile-card">
      <h3 class="mobile-subtitle">เพิ่มสินค้า</h3>

      <div class="mobile-form-group">
        <label>ชื่อสินค้า</label>
        <input type="text" placeholder="กรอกชื่อสินค้า" v-model="productName" />
        <span class="form-helper-text">ชื่อสินค้าต้องไม่เกิน 50 ตัวอักษร</span>
      </div>

      <div class="mobile-form-group">
        <label>รายละเอียด</label>
        <textarea placeholder="กรอกรายละเอียด" v-model="description"></textarea>
      </div>

      <button class="mobile-btn mobile-btn-primary" @click="submit">
        <i class="bi bi-check-circle"></i>
        บันทึก
      </button>
    </div>
  </div>
</template>
```

### Grid Layout

```vue
<template>
  <div class="mobile-container">
    <div class="mobile-grid-2">
      <div class="mobile-card">
        <i class="bi bi-gem"></i>
        <div class="mobile-text">สต็อก</div>
      </div>
      <div class="mobile-card">
        <i class="bi bi-gear"></i>
        <div class="mobile-text">การผลิต</div>
      </div>
    </div>
  </div>
</template>
```

### Empty State

```vue
<template>
  <div class="mobile-empty-state">
    <i class="bi bi-inbox"></i>
    <div class="empty-title">ไม่พบข้อมูล</div>
    <div class="empty-subtitle">ยังไม่มีรายการสินค้าในระบบ</div>
  </div>
</template>
```

### Loading State

```vue
<template>
  <div class="mobile-loading" v-if="isLoading">
    <div class="spinner"></div>
    <div class="loading-text">กำลังโหลด...</div>
  </div>
</template>
```

## หมายเหตุ

- ใช้สำหรับ Mobile routes เท่านั้น (`/mobile/*`)
- อย่าใช้ใน Web routes (ใช้ `responsive-style/web` แทน)
- Utilities เหล่านี้ออกแบบมาสำหรับ touch-friendly UI
- รองรับ iPhone notch ผ่าน safe-area utilities
