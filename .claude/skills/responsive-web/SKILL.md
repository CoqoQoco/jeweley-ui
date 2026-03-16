---
name: responsive-web
description: Responsive design สำหรับ Web (Tablet & Desktop) — ใช้เมื่อสร้าง web component ใหม่, จัด layout, หรือเลือก responsive class
---

# Responsive Web Design

**สำคัญ**: ออกแบบสำหรับ **Tablet และ Desktop เท่านั้น** — Mobile มี routes และ layout แยกต่างหาก

## Breakpoints

| ขนาด | Breakpoint |
|---|---|
| Desktop | > 1024px |
| Tablet | ≤ 1024px |
| Mobile | < 768px (แยก implementation) |

---

## SCSS Import

```scss
// New web components
@import '@/assets/scss/responsive-style/web';

// ถ้าต้องการ base styles ด้วย
@import '@/assets/scss/custom-style/standard-form.scss';
@import '@/assets/scss/responsive-style/web';
```

**❌ ห้าม modify** `custom-style/standard-form.scss` (legacy)

---

## Responsive Classes ที่ใช้บ่อย

### Layout
| Class | พฤติกรรม |
|---|---|
| `responsive-table-wrapper` | Horizontal scroll บน tablet |
| `responsive-btn-group` | Buttons wrap พร้อม gap |
| `responsive-action-group` | Dropdown + button wrap |
| `responsive-grid-container` | 3+ col → 2 col บน tablet |
| `responsive-grid-2col` | 2 col → 1 col บน tablet |
| `responsive-grid-2col-fixed` | 2 col เสมอ, gap เล็กลงบน tablet |

### Visibility
| Class | พฤติกรรม |
|---|---|
| `show-desktop-only` | ซ่อนบน tablet ≤ 1024px |
| `hide-tablet` | ซ่อนบน tablet และเล็กกว่า |
| `show-tablet-only` | แสดงเฉพาะ tablet |

### Spacing
| Class | พฤติกรรม |
|---|---|
| `responsive-padding` | 10px → 8px |
| `responsive-padding-lg` | 20px → 15px |
| `responsive-padding-sm` | 5px → 3px |

### Flex
| Class | พฤติกรรม |
|---|---|
| `responsive-flex-row` | flex row + wrap + gap |
| `responsive-flex-between` | space-between + wrap |

---

## ตัวอย่าง

```vue
<!-- ✅ Good -->
<template>
  <div class="responsive-table-wrapper">
    <DataTable :value="items">...</DataTable>
  </div>
  <div class="responsive-btn-group">
    <button class="btn btn-sm btn-main">บันทึก</button>
    <button class="btn btn-sm btn-outline-main">ยกเลิก</button>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';
</style>

<!-- ❌ Bad -->
<template>
  <div style="width: 800px">...</div>
  <div style="display: flex">...</div>
</template>
```

---

## Decision Table

| Scenario | Import | สถานะ |
|---|---|---|
| Existing component | `custom-style/standard-form.scss` | ❌ Keep ห้ามแก้ |
| New web component | `responsive-style/web` | ✅ ใช้เสมอ |
| Mobile component | `responsive-style/mobile` | ✅ ใช้เสมอ |
