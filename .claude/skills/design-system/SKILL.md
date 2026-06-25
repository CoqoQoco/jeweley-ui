---
name: design-system
description: ตารางโทเค็นทั้งหมด (spacing/radius/shadow/typography/color), วิธีใช้ mixin, กฎห้าม hardcode สี/px, button standard + icon-only rule สำหรับหน้า list, กฎห้ามทำปุ่ม — ใช้เมื่อเขียน SCSS ใหม่, เพิ่ม component, เลือก button class, หรือตรวจว่าค่าที่ใช้ถูกต้องตาม token
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

| Class | ButtonGeneric variant | สี | ใช้เมื่อ |
|---|---|---|---|
| `btn-main` | `variant="main"` | `$base-font-color` (#921313) | primary action — บันทึก, ยืนยัน |
| `btn-outline-main` | `variant="outline"` | outline #921313 | secondary — ยกเลิก, ล้าง |
| `btn-sub-main` | `variant="sub-main"` | `$base-font-color` | sub-primary (เหมือน btn-main) |
| `btn-green` | `variant="green"` | `$base-green` (#038387) | view/search — ดูรายละเอียด, ค้นหา |
| `btn-red` | `variant="red"` | `$base-red` (#ff4d4d) | destructive — ลบ |
| `btn-dark` | `variant="dark"` | `$base-sub-color` (#393939) | clear/neutral — ล้าง, ยกเลิกอ่อน |

### ตัวอย่าง native button (migration)

```vue
<!-- ✅ Good — native ใช้ได้ใน migration -->
<button class="btn btn-sm btn-main">ยืนยัน</button>
<button class="btn btn-sm btn-outline-main ml-2">ยกเลิก</button>
<button class="btn btn-sm btn-green">ดูรายละเอียด</button>
<button class="btn btn-sm btn-red ml-2">ลบ</button>
<button class="btn btn-sm btn-dark ml-2">ล้าง</button>

<!-- ❌ Bad -->
<button class="btn btn-sm btn-warning">ยืนยัน</button>
<button class="btn btn-sm btn-primary">บันทึก</button>
```

### หน้า List = Icon-Only

หน้า **list/search** ปุ่มใน action bar ต้องเป็น icon-only เสมอ — ไม่ส่ง `:label`, ใช้ `:title` แทน (tooltip):

```vue
<!-- ✅ Good — list page icon-only -->
<ButtonGeneric variant="main" icon="bi-search" type="submit" :title="$t('common.btn.search')" />
<ButtonGeneric variant="dark" icon="bi-x-circle" class="ml-2" :title="$t('common.btn.clear')" @click="onClear" />
<ButtonGeneric variant="main" icon="bi-plus" class="ml-2" :title="$t('common.btn.create')" @click="onCreate" />

<!-- ❌ Bad — label ใน list page -->
<ButtonGeneric variant="main" icon="bi-search" :label="$t('common.btn.search')" type="submit" />
```

หน้า **create/edit form** ปุ่มยังคง label ตามปกติ:

```vue
<!-- ✅ Good — form page มี label -->
<ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="onSave" />
<ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onCancel" />
```

---

## Icon Input

icon ที่อยู่ภายในช่องกรอก (leading icon) ใช้ prop `icon` ของ `InputTextGeneric` เท่านั้น

```vue
<!-- ✅ Good — icon ผ่าน prop, token เท่านั้น -->
<InputTextGeneric id="tel1" type="tel" icon="bi-telephone-fill" v-model.trim="form.tel1" />
<InputTextGeneric id="email" type="email" icon="bi-envelope-check-fill" v-model.trim="form.email" />

<!-- ❌ Bad — input-group manual (icon ลอยเหนือ input, flex พัง) -->
<div class="input-group input-group-inner">
  <div class="input-group-append">
    <span class="input-group-text"><i class="bi bi-telephone-fill"></i></span>
  </div>
  <InputTextGeneric type="tel" v-model="form.tel1" />
</div>
```

SCSS ที่ `InputTextGeneric` จัดการเองแล้ว (ไม่ต้องเขียนซ้ำ):

```scss
.input-icon-group {
  position: relative;
  width: 100%;
  .input-icon {
    position: absolute;
    left: var(--sp-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--base-font-color);
    font-size: 0.95rem;
    pointer-events: none;
  }
  input.form-control.has-icon-left { padding-left: calc(var(--sp-md) + 20px); }
  &.is-disabled .input-icon { opacity: 0.5; }
}
```

---

## Modal Form Styling

modal form ที่มีหลาย field ต้องแบ่งกลุ่มด้วย `SectionCardGeneric` และใช้ title bar สี main:

1. `<modal headerVariant="main">` — title bar bg สีหลัก + text/✕ ขาว
2. แต่ละกลุ่ม logic ใช้ `SectionCardGeneric` (กล่อง border + title) — เว้นระหว่างกล่อง `var(--sp-lg)`

```vue
<!-- ✅ Good — title bar filled + SectionCardGeneric ต่อกลุ่ม -->
<modal headerVariant="main" ...>
  <template #title>
    <span class="title-text-lg d-block">หัวข้อ Modal</span>
  </template>
  <template #content>
    <div class="p-3">
      <SectionCardGeneric :title="$t('view.x.section.main')" class="modal-section">
        <div class="form-row two-col">...</div>
      </SectionCardGeneric>
      <SectionCardGeneric :title="$t('view.x.section.contact')" class="modal-section">
        <div class="form-row two-col">...</div>
      </SectionCardGeneric>
    </div>
  </template>
</modal>

<!-- ❌ Bad — เส้นใต้ h6 (เลิกใช้แล้ว) -->
<h6 class="form-section-title">ข้อมูลหลัก</h6>

<!-- ❌ Bad — title ธรรมดาบนพื้นขาว ไม่ใช้ headerVariant -->
<span class="title-text-lg px-3 pt-3 d-block">หัวข้อ</span>

<!-- ❌ Bad — รวมทุก field กล่องเดียว -->
<SectionCardGeneric title="ข้อมูลทั้งหมด"><!-- ทุก group รวมกัน --></SectionCardGeneric>
```

SCSS scoped ใน modal component:

```scss
.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}
```

**Reference**: `src/views/customer/list-customer/modal/create-view.vue`

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
- ❌ ห้ามใช้ `btn-outline-dark` / `btn-outline-secondary` สำหรับ cancel — ใช้ `btn-outline-main`
- ❌ ห้ามใส่ `:label` ในปุ่ม action bar ของหน้า list — ใช้ icon-only + `:title` เสมอ
- ❌ ห้ามเขียน `border-radius: 8px` เองเมื่อใช้ mixin ได้ — ใช้ `var(--radius-md)`
