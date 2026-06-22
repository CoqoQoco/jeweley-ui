---
name: design-system
description: ตารางโทเค็นทั้งหมด (spacing/radius/shadow/typography/color), วิธีใช้ mixin, กฎห้าม hardcode สี/px, และโทนปุ่มมาตรฐาน — ใช้เมื่อเขียน SCSS ใหม่, เพิ่ม component, หรือตรวจว่าค่าที่ใช้ถูกต้องตาม token
---

# Design System

> **Source of truth ของหลักการ/baseline UI อยู่ที่ `docs/design-system.md`** (multi-box layout, page structure, Design Decision Log) — skill นี้คือ **detail ของ tokens/mixins/button** ที่เอกสารนั้นอ้างถึง ออกแบบ UI ใหม่ต้องยึด `docs/design-system.md` และอัปเดต Decision Log เมื่อมี pattern ใหม่

## Design Tokens

ทั้งหมดนิยามใน `src/assets/scss/variable.scss` ทั้งแบบ SCSS variable (`$sp-lg`) และ CSS custom property (`var(--sp-lg)`)

### Spacing

| Token | SCSS | CSS var | ค่า |
|---|---|---|---|
| xs | `$sp-xs` | `var(--sp-xs)` | 4px |
| sm | `$sp-sm` | `var(--sp-sm)` | 8px |
| md | `$sp-md` | `var(--sp-md)` | 12px |
| lg | `$sp-lg` | `var(--sp-lg)` | 16px |
| xl | `$sp-xl` | `var(--sp-xl)` | 20px |
| 2xl | `$sp-2xl` | `var(--sp-2xl)` | 24px |

### Radius

| Token | CSS var | ค่า |
|---|---|---|
| sm | `var(--radius-sm)` | 4px |
| md | `var(--radius-md)` | 8px |
| lg | `var(--radius-lg)` | 12px |

### Shadow

| Token | CSS var | ค่าโดยประมาณ |
|---|---|---|
| sm | `var(--shadow-sm)` | rgba(0,0,0,0.06) 0 2px 8px |
| md | `var(--shadow-md)` | rgba(0,0,0,0.1) 0 4px 12px |
| lg | `var(--shadow-lg)` | rgba(0,0,0,0.15) 0 8px 24px |

### Typography

| Token | CSS var | ค่า |
|---|---|---|
| fs-sm | `var(--fs-sm)` | 12px |
| fs-base | `var(--fs-base)` | 14px |
| fs-lg | `var(--fs-lg)` | 17px |
| fs-xl | `var(--fs-xl)` | 20px |
| lh-sm | `var(--lh-sm)` | 1.4 |
| lh-md | `var(--lh-md)` | 1.6 |
| lh-lg | `var(--lh-lg)` | 1.8 |

### Color

| Token | CSS var | ค่า | ความหมาย |
|---|---|---|---|
| primary | `var(--base-font-color)` | #921313 | primary theme (dark red) |
| green | `var(--base-green)` | #038387 | secondary/success (teal) |
| warning | `var(--base-warning)` | #fabc3f | warning |
| red | `var(--base-red)` | #ff4d4d | destructive/error |
| border | `var(--color-border)` | #e0e0e0 | border ทั่วไป |
| card-bg | `var(--color-card-bg)` | #ffffff | พื้นหลัง card |
| highlight-bg | `var(--color-highlight-bg)` | #fdf2f2 | highlight (card header) |

---

## Mixins

นิยามใน `src/assets/scss/mixin.scss` — import ด้วย `@import '@/assets/scss/mixin.scss'`

### card-base

ใช้กับ section card wrapper — border + shadow + radius + padding

```scss
@import '@/assets/scss/mixin.scss';

.my-card {
  @include card-base;
  // ผลลัพธ์: border: 1px solid var(--color-border); border-radius: var(--radius-md);
  //           box-shadow: var(--shadow-sm); background: var(--color-card-bg); padding: var(--sp-xl);
}
```

### input-control

ใช้กับ input/textarea — padding sync กับ DropdownGeneric (10px 12px)

```scss
input.form-control {
  @include input-control;
}

textarea.form-control {
  @include input-control;
  resize: vertical;
}
```

### form-row-grid($cols)

สร้าง CSS grid responsive — รับ 2 หรือ 4 columns; breakpoint 1024px

```scss
.form-row {
  @include form-row-grid(2);  // 2 col → 1 col ที่ ≤1024px
}

.form-row-4 {
  @include form-row-grid(4);  // 4 col → 2 col ที่ ≤1024px → 1 col ที่ ≤600px
}
```

### button-variant($bg, $fg)

ฐาน variant ของปุ่ม — ใช้ใน main.scss สร้างทุก btn-* class

```scss
button.btn-custom {
  @include button-variant($base-green, #fff);
}
```

---

## Button Standard

นิยามใน `src/assets/scss/main.scss` — ใช้ `ButtonGeneric` เป็นหลักสำหรับโค้ดใหม่

| Class | สี | ใช้เมื่อ |
|---|---|---|
| `btn-main` | `$base-font-color` (#921313) | primary action — บันทึก, ยืนยัน |
| `btn-outline-main` | outline #921313 | secondary — ยกเลิก, ล้าง |
| `btn-sub-main` | `$base-font-color` | sub-primary (เหมือน btn-main) |
| `btn-green` | `$base-green` (#038387) | view/search — ดูรายละเอียด, ค้นหา |
| `btn-red` | `$base-red` (#ff4d4d) | destructive — ลบ |
| `btn-dark` | `$base-sub-color` (#393939) | clear/neutral — ล้าง, ยกเลิกอ่อน |

---

## กฎการใช้ Token

**✅ Good — ใช้ token เสมอ:**
```scss
.my-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--sp-lg);
  box-shadow: var(--shadow-sm);
  color: var(--base-font-color);
}
```

**❌ Bad — hardcode:**
```scss
.my-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  color: #921313;
}
```

**✅ Good — ใช้ ButtonGeneric (โค้ดใหม่):**
```vue
<ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="onSave" />
<ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onCancel" />
```

**❌ Bad — ใช้ btn-warning หรือ hardcode btn-primary:**
```vue
<button class="btn btn-sm btn-warning">ยืนยัน</button>
<button class="btn btn-sm btn-primary">ยืนยัน</button>
```

---

## กฎห้ามทำ

- ❌ ห้าม hardcode สี เช่น `#921313`, `#038387`, `#e0e0e0` ในโค้ดใหม่ — ใช้ CSS var เสมอ
- ❌ ห้าม hardcode px spacing เช่น `padding: 16px` — ใช้ `var(--sp-lg)` หรือ `@include card-base`
- ❌ ห้ามใช้ `btn-warning`, `btn-custom`, `btn-primary`, `btn-secondary` — ไม่มีใน design system
- ❌ ห้ามเขียน `border-radius: 8px` เองเมื่อใช้ mixin ได้ — ใช้ `var(--radius-md)`
