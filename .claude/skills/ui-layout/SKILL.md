---
name: ui-layout
description: มาตรฐาน layout ของหน้าและ form — page header bar, card section, form row 2/4-col, input padding sync, button spacing — ใช้เมื่อสร้าง/ปรับ UI หน้า create/edit, form layout, section card, page title
---

# UI Layout Standards

มาตรฐานการจัด layout ของหน้า form และ section ใน web (Tablet/Desktop)

---

## 1. Page Header Bar

ส่วนหัวของหน้า create/edit — ปุ่มกลับวงกลม + title สีหลัก + border-bottom

```vue
<template>
  <div class="app-container">
    <div class="page-header-bar">
      <button class="btn-back" @click="$router.push({ name: '<list-route>' })" title="กลับ" type="button">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h2 class="page-title">{{ isEditMode ? 'แก้ไข...' : 'สร้าง...' }}</h2>
    </div>
    <!-- ... sections ... -->
  </div>
</template>

<style lang="scss" scoped>
.page-header-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 8px;
  border-bottom: 2px solid var(--base-font-color);
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  margin-bottom: 16px;
}
.btn-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--base-font-color);
  color: var(--base-font-color);
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
  &:hover {
    background: var(--base-font-color);
    color: #ffffff;
  }
}
.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--base-font-color);
}
</style>
```

---

## 2. Section Card

Wrapper ของ section ในหน้า — border + shadow + PageTitle หรือ h6 highlight สีหลัก

### 2.1 Card wrapper SCSS
```scss
.section-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 8px;
  padding: 20px;
  background: #ffffff !important;
}

h6 {
  color: var(--base-font-color);
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  background: transparent !important;
}
```

### 2.2 Title สำคัญ — ใช้ `PageTitle` component
```vue
<pageTitle title="ข้อมูลใบสั่งผลิต" :isShowBtnClose="false" />
```
- Import: `defineAsyncComponent(() => import('@/components/custom/PageTitle.vue'))`
- ให้ border-bottom + title สีหลักอัตโนมัติ

**กฎ**: card ใหม่ทุกอันต้อง override `background: #ffffff !important` + `h6 { background: transparent !important }` เพื่อกัน global override จาก legacy

---

## 3. Form Row Grid (2-col / 4-col Responsive)

ใช้ CSS grid แทน flex เพื่อ alignment ที่ตรงกันแน่นอน

```scss
.form-row {
  margin-bottom: 16px;

  &.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  &.four-col {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  @media (max-width: 1024px) {
    &.two-col { grid-template-columns: 1fr; }
    &.four-col { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 600px) {
    &.four-col { grid-template-columns: 1fr; }
  }
}

.form-field {
  width: 100%;

  .title-text {
    display: block;
    font-weight: 500;
    margin-bottom: 6px;
  }
}
```

```vue
<div class="form-row two-col">
  <div class="form-field">
    <span class="title-text">ผลิตครั้งที่</span>
    <input class="form-control" type="number" v-model.number="form.x" />
  </div>
  <div class="form-field">
    <span class="title-text">ประเภททอง <span class="text-danger">*</span></span>
    <DropdownGeneric ... />
  </div>
</div>
```

---

## 4. Input / Textarea Padding Sync (กับ DropdownGeneric)

**ปัญหา**: Bootstrap `.form-control` default padding ไม่ตรงกับ `DropdownGeneric` (10px 12px) → ความสูงไม่ตรงเมื่ออยู่ใน row เดียวกัน

**วิธีแก้** (scoped style ของ form section):
```scss
input.form-control,
textarea.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.4;

  &:focus {
    border-color: var(--base-font-color);
    box-shadow: none;
    outline: none;
  }
}

textarea.form-control {
  resize: vertical;
}
```

---

## 5. Button Spacing — ใช้ Bootstrap `ms-2` / `me-2`

**❌ Bad**:
```vue
<div class="d-flex gap-2">
  <button class="btn btn-main">บันทึก</button>
  <button class="btn btn-outline-main">ยกเลิก</button>
</div>
```

**✅ Good**:
```vue
<button class="btn btn-sm btn-main">บันทึก</button>
<button class="btn btn-sm btn-outline-main ms-2">ยกเลิก</button>
```

ลำดับสากล: action หลัก (`btn-main`) → action รอง (`btn-outline-main` หรือ `btn-red`) — ตัวที่ตามมาใช้ `ms-2`

---

## 6. Item Summary Card

Pattern สำหรับแสดง item เป็นการ์ดสรุป + ปุ่ม edit/delete

```vue
<div class="item-card">
  <div class="item-card-header d-flex justify-content-between align-items-center">
    <span class="fw-semibold">รายการที่ {{ index + 1 }}</span>
    <div>
      <button class="btn btn-sm btn-main" @click="$emit('edit')">
        <i class="bi bi-pencil"></i> แก้ไข
      </button>
      <button class="btn btn-sm btn-red ms-2" @click="$emit('remove')">
        <i class="bi bi-trash"></i> ลบ
      </button>
    </div>
  </div>
  <div class="item-card-body d-flex align-items-start gap-3">
    <!-- thumbnail + info rows -->
  </div>
</div>
```

```scss
.item-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}
.item-card-header {
  background: #fdf2f2;
  color: var(--base-font-color);
  padding: 10px 16px;
}
.item-card-body {
  padding: 12px 16px;
}
```

---

## 7. Modal Title & Action Footer

### 7.1 Modal Title — ใช้ `title-text-lg` (reuse จาก legacy)

```vue
<template #title>
  <span class="title-text-lg px-3 pt-3 d-block">หัวข้อ Modal</span>
</template>
```

`.title-text-lg` ถูก define ใน `custom-style/standard-form.scss` (color: base-font-color, font-size: 17px, weight: 700) — **ห้ามเขียนใหม่** ต้อง reuse ด้วยการ import:

```scss
<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';  // ← ต้องมีถ้าใช้ title-text-lg / title-text
@import '@/assets/scss/responsive-style/web';
</style>
```

**กฎ**: ถ้าใช้ class `title-text`, `title-text-lg`, `title-text-white`, `title-text-highlight` ใน scoped style ต้อง `@import 'custom-style/standard-form.scss'` มิฉะนั้น class จะไม่มี style

### 7.2 Modal Action Footer

```vue
<template #action>
  <button class="btn btn-sm btn-main" @click="onSubmit">
    <i class="bi bi-save"></i> บันทึก
  </button>
  <button class="btn btn-sm btn-outline-main ms-2" @click="$emit('closeModal')">
    ยกเลิก
  </button>
</template>
```

---

## 8. Reuse First — Typography Classes ที่มีอยู่แล้ว

**หลัก**: ก่อนเขียน CSS ใหม่ → ตรวจ class ใน `custom-style/standard-form.scss` แล้ว reuse

| Class | กำหนดที่ | ใช้เมื่อ |
|---|---|---|
| `title-text` | standard-form.scss | label form, หัวข้อ field (color base-font-color, weight 700) |
| `title-text-lg` | standard-form.scss | หัวข้อ Modal (17px, weight 700, base-font-color) |
| `title-text-white` | standard-form.scss | หัวข้อบนพื้นเข้ม |
| `title-text-lg-bg` | standard-form.scss | หัวข้อพื้นแดง (white text, base-font-color bg, radius บน) |

**❌ Bad — เขียนซ้ำ:**
```scss
.modal-title { color: #921313; font-size: 17px; font-weight: 700; }
```

**✅ Good — reuse:**
```vue
<span class="title-text-lg">หัวข้อ</span>
```
```scss
@import '@/assets/scss/custom-style/standard-form.scss';
```

---

## 9. Decision Table

| Scenario | ใช้ |
|---|---|
| Page หัว create/edit | `page-header-bar` + `btn-back` + `page-title` |
| Section card title สำคัญ | `<pageTitle>` component |
| Section card title ย่อย | `<h6>` + main color + border-bottom |
| Modal title | `title-text-lg` + import `standard-form.scss` |
| Field label ใน form | `title-text` + import `standard-form.scss` |
| Form 2 fields ต่อแถว | `.form-row.two-col` |
| Form 4 fields ต่อแถว | `.form-row.four-col` |
| Input/Textarea ในแถว row + DropdownGeneric | scoped style sync padding 10px 12px |
| ปุ่มเรียงข้างกัน | `ms-2` (ห้าม flex gap) |
| Item summary | `item-card` + `item-card-header` (#fdf2f2) |
| Modal footer ปุ่ม | บันทึก + ยกเลิก ms-2 |

---

## 10. กฎห้ามทำ

- ❌ ห้าม hardcode สีนอก `var(--base-*)` (ยกเว้น border #e0e0e0, bg #fdf2f2 ที่กำหนดไว้แล้ว)
- ❌ ห้ามใช้ `flex gap-2` สำหรับ button spacing — ใช้ `ms-2`
- ❌ ห้ามใช้ inline `style="..."` กำหนด layout — ใช้ class
- ❌ ห้าม **modify** `custom-style/standard-form.scss` (legacy — ห้ามแตะเนื้อหา) — แต่ **import เพื่อ reuse** typography classes ได้
- ❌ ห้ามเขียน CSS ซ้ำกับ class ที่มีอยู่แล้วใน `standard-form.scss` — reuse เสมอ
- ❌ ห้ามใช้ class `title-text-lg` / `title-text` โดยไม่ import `standard-form.scss` ใน scoped style
- ❌ ห้ามลืม `background: #ffffff !important` ใน `.card` — กัน global override จาก legacy
