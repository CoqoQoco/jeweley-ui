# Design System — Source of Truth

เอกสารนี้คือ **มาตรฐานกลางของการออกแบบ UI** ในโปรเจกต์ jeweley-ui — ทุกหน้า/ทุก feature ต้องยึดตามนี้

> **บังคับ**: ก่อน implement/ออกแบบ UI ต้องอ่านเอกสารนี้ก่อน และทุกครั้งที่เพิ่ม/เปลี่ยน design pattern ใหม่ → ต้องบันทึกใน [Design Decision Log](#design-decision-log) ท้ายไฟล์
>
> เอกสารนี้เป็น **source-of-truth** (หลักการ + baseline) — รายละเอียดเชิงลึกอยู่ใน skill (ไม่ copy ซ้ำ):
> `design-system`(tokens) · `ui-layout`(layout) · `native-call-policy`(generic) · `i18n-system` · `generic-components`

---

## Purpose

สถาปนา design language เดียวกันทั้งระบบ เริ่มจากหน้า **Ticket — แจ้งปัญหา/ขอฟีเจอร์** เป็น baseline แล้วใช้ refactor หน้าอื่นต่อ เป้าหมาย: สะอาด, focus, เรียบง่าย, consistent, reusable

---

## Core Principles

| # | หลักการ | รายละเอียด |
|---|---|---|
| 1 | **Page header มาตรฐาน** | ใช้ `PageHeaderGeneric` (back + title) — ปุ่มรอง (เช่น คู่มือ) วางใน `#actions` slot เท่านั้น ห้ามปุ่มลอยในการ์ด |
| 2 | **แบ่งเป็นหลาย box ตาม logic** | จัด field เป็นกลุ่มตามความหมาย แต่ละกลุ่ม = `SectionCardGeneric` **มี border + title ของตัวเอง** (ไม่รวมทุกอย่างในการ์ดใบเดียว) เพื่อสร้าง focus |
| 3 | **Label แหล่งเดียว** | `FormFieldGeneric` เป็นที่มาของ label เพียงแหล่งเดียว — component ลูก (เช่น upload) **ห้าม render title/label ซ้ำ** |
| 4 | **Multi-column = grid** | แถวหลายคอลัมน์ใช้ mixin `form-row-grid(n)` (responsive ≤1024px ยุบเป็น 1 คอลัมน์) ห้ามเขียน media query เอง |
| 5 | **Footer action bar** | ปุ่ม action หลักอยู่ **นอก box** ชิดขวา, primary ขวาสุด, เว้นด้วย `ml-2` (Bootstrap 4) ห้าม flex gap |
| 6 | **Token เท่านั้น** | สี/ระยะ/มุม/เงา ใช้ `var(--sp-*)`,`var(--radius-*)`,`var(--shadow-*)`,`var(--base-*)`,`var(--color-*)` — ห้าม hardcode px/hex (ดู `design-system` skill) |
| 7 | **Generic component เท่านั้น** | ห้าม native `<input>`/`<button>`/`<table>`/`<img>` หรือ PrimeVue ตรงๆ — ใช้ generic wrapper (ดู `native-call-policy` skill); รูป Azure ใช้ `ImagePreview` |
| 8 | **i18n เท่านั้น** | ห้าม hardcode ข้อความไทย ใช้ `$t()` เสมอ (ดู `i18n-system` skill) |
| 9 | **Reusable first** | ถ้าต้องการ UI ซ้ำ 2+ ที่ → สร้าง generic component ใหม่ (เช่น `MultiImageUpload`) อย่า inline ซ้ำ |
| 10 | **List page = icon-only buttons** | ปุ่มใน search/action bar ของหน้า list (search/clear/create/export) ใช้ `ButtonGeneric` แบบ **ไม่ส่ง `label`** เหลือแค่ `icon` + `:title` (tooltip) — ref: `/plan-order-tracking` |
| 11 | **Filter = MultiSelect เป็น default** | filter field ที่เป็น choice ใช้ `MultiSelectGeneric` เสมอ **ห้ามใช้ `DropdownGeneric`** เว้นแต่ field นั้นเลือกได้ค่าเดียวโดยธรรมชาติจริงๆ (ระบุเหตุผลใน Decision Log) |
| 12 | **Page title มี description เสมอ** | ทุก `SearchBarGeneric` ต้องส่ง prop `description` อธิบายหน้านั้น (i18n) — ห้ามมีแต่ title เปล่า |

---

## Reference Layout (canonical — หน้า Ticket create)

```
┌────────────────────────────────────────────────────────────────────┐
│ (←)  <Page Title>                                       [ปุ่มรอง...] │  PageHeaderGeneric + #actions
└────────────────────────────────────────────────────────────────────┘
  ┌─ Box 1 · <กลุ่ม logic 1> (border + title) ───────────────────────┐
  │  Label A *        Label B *        Label C *                      │  form-row-grid(n) inline
  │  [____]           [▼ ____]         [____]                         │  (≤1024px ยุบ 1 คอลัมน์)
  │  Label D (full width)                                             │
  │  [______________________________________________]                │
  └────────────────────────────────────────────────────────────────────┘
  ┌─ Box 2 · <กลุ่ม logic 2> (border + title) ───────────────────────┐
  │  <fields / MultiImageUpload / ...>                                │
  └────────────────────────────────────────────────────────────────────┘
                                          [ยกเลิก]  [➤ บันทึก]  footer นอก box ชิดขวา
```

**ไฟล์อ้างอิงจริง**: `src/views/ticket/create-view.vue`

---

## Spacing Rhythm (baseline)

| ตำแหน่ง | ค่า token |
|---|---|
| padding ภายใน box | `var(--sp-xl)` |
| เว้นระหว่าง box | `var(--sp-lg)` |
| เว้นระหว่าง field ใน box | `var(--sp-lg)` |
| เว้นปุ่มใน footer | `ml-2` |

---

## Icon Input

กฎ: icon ที่อยู่ภายในช่องกรอกข้อมูล (leading icon) ต้องใช้ `InputTextGeneric` พร้อม prop `:icon` เท่านั้น

- icon ฝังอยู่ใน control เดียวกับ input (inline) — ไม่ใช่กล่อง addon แยก
- ใช้ Bootstrap Icon class name เช่น `'bi-telephone-fill'`, `'bi-envelope-check-fill'`
- ห้ามเขียน `<div class="input-group">` + `.input-group-append` + `.input-group-text` manual อีก

```vue
<!-- ✅ Good — icon ผ่าน prop -->
<InputTextGeneric id="tel1" type="tel" icon="bi-telephone-fill" v-model.trim="form.tel1" />
<InputTextGeneric id="email" type="email" icon="bi-envelope-check-fill" v-model.trim="form.email" />

<!-- ❌ Bad — input-group manual (พัง: icon ลอยเหนือ input) -->
<div class="input-group input-group-inner">
  <div class="input-group-append">
    <span class="input-group-text"><i class="bi bi-telephone-fill"></i></span>
  </div>
  <InputTextGeneric type="tel" v-model="form.tel1" />
</div>
```

---

## Modal Form Standard

modal form ที่มีหลาย field ต้องแบ่งเป็นกลุ่มตาม logic ดังนี้:

1. **title bar** ใช้ `<modal headerVariant="main">` — bg สี main (`--base-font-color`) + text/✕ ขาว ให้ title เด่น
2. แต่ละกลุ่ม logic ใช้ `SectionCardGeneric` (กล่อง border + title) เหมือน page form (Core Principle #2) — เว้นระหว่างกล่อง `var(--sp-lg)`
3. ใช้ `InputTextGeneric` พร้อม prop `icon` สำหรับ field ที่มี icon (ห้าม input-group manual)
4. spacing ใช้ token `var(--sp-*)` ทั้งหมด — ห้าม hardcode px
5. footer (บันทึก/ยกเลิก) อยู่ใน `#action` slot ของ `modal-view.vue` เสมอ (นอกกล่อง)

```
╔════════════════════════════════════════════════════════════════════════════════╗
║  แก้ไขข้อมูลลูกค้า                                               (ขาว)  [ ✕ ] ║  ◀ bg = main, text/✕ ขาว
╠════════════════════════════════════════════════════════════════════════════════╣
│  ┌─ ข้อมูลหลัก ───────────────────────────────────────────────────────────┐   │
│  │ รหัสลูกค้า *  [201901](disabled)   ประเภทลูกค้า * [▼ L: ในประเทศ      ✕] │   │
│  │ ชื่อภาษาไทย * [เดบิว           ]     ชื่อภาษาอังกฤษ [Debut             ]  │   │
│  │ ที่อยู่ติดต่อ  [BKK (textarea) ]     หมายเหตุ      [(textarea)         ]  │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│  ┌─ ช่องทางติดต่อ ────────────────────────────────────────────────────────┐   │
│  │ เบอร์โทร 1   [☎  0930515544  ]      เบอร์โทร 2   [☎                 ]    │   │
│  │ E-mail      [✉  debutbkk@..  ]      บุคคลติดต่อ  [👤  Art            ]   │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│  ┌─ การขาย ──────────────────────────────────────────────────────────────┐   │
│  │ ส่วนลด (%)  [0]                                                          │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                  [ 💾 บันทึก ]   [ ยกเลิก ]     │
└──────────────────────────────────────────────────────────────────────────────┘
```

SCSS มาตรฐานสำหรับเว้นระหว่างกล่อง (scoped ใน modal):

```scss
.modal-section {
  margin-bottom: var(--sp-lg);

  &:last-child {
    margin-bottom: 0;
  }
}
```

**✅ Good:**
```vue
<modal headerVariant="main" ...>
  <template #title>
    <span class="title-text-lg d-block">หัวข้อ Modal</span>
  </template>
  <template #content>
    <div class="p-3">
      <SectionCardGeneric :title="$t('view.x.section.main')" class="modal-section">
        <!-- form rows -->
      </SectionCardGeneric>
      <SectionCardGeneric :title="$t('view.x.section.contact')" class="modal-section">
        <!-- form rows -->
      </SectionCardGeneric>
    </div>
  </template>
</modal>
```

**❌ Bad:**
```vue
<!-- เส้นใต้ h6 เดิม (เลิกใช้แล้ว) -->
<h6 class="form-section-title">ข้อมูลหลัก</h6>

<!-- title bar ธรรมดาบนพื้นขาว -->
<span class="title-text-lg px-3 pt-3 d-block">หัวข้อ</span>

<!-- รวมทุก field กล่องเดียว -->
<SectionCardGeneric title="ข้อมูลทั้งหมด">...</SectionCardGeneric>
```

**Reference implementation**: `src/views/customer/list-customer/modal/create-view.vue`

---

## Design Decision Log

> บันทึกทุกครั้งที่ออกแบบ/เปลี่ยน design pattern ใหม่ (บังคับโดย hook `remind-on-change.sh`)

| วันที่ | หน้า/Feature | สิ่งที่เปลี่ยน / pattern ใหม่ |
|---|---|---|
| 2026-06-22 | ticket/create-view | สถาปนา baseline design system: multi-box แยก border, `PageHeaderGeneric` + `#actions` slot, `MultiImageUpload` (generic ใหม่), footer action bar นอก box, label แหล่งเดียวผ่าน `FormFieldGeneric` |
| 2026-06-22 | PageHeaderGeneric (global) | เพิ่ม `border-top: 2px solid var(--base-font-color)` ให้ page header bar — กรอบบน-ล่างเข้มสมมาตร |
| 2026-06-22 | PageHeaderGeneric (global) | เปลี่ยน page header เป็น filled bg สี main (`--base-font-color`) + inner elements (title/back/actions) เป็นสีสว่าง (white-outline auto ใน actions slot) |
| 2026-06-22 | ticket/create-view + router | เพิ่ม **tab/segment-switch pattern** (ButtonGeneric active=main, inactive=outline) รวมหลายมุมมองในหน้าเดียว (แจ้งใหม่ + Ticket ของฉัน); เมนูกลุ่มที่มี in-page toggle ให้ใช้ลิงก์ตรง (`minorShow: false`) เพื่อ discoverability |
| 2026-06-24 | list-page standard (global) | **#10 icon-only buttons**: ปุ่ม search/clear/create/export ในหน้า list ไม่ส่ง `:label` — ใช้แค่ `icon` + `:title` tooltip; ฟอร์ม create/edit ยังคง label ตามเดิม |
| 2026-06-24 | list-page standard (global) | **#11 MultiSelect default**: filter choice ทุกตัวในหน้า list ใช้ `MultiSelectGeneric` (array, chip display) แทน `DropdownGeneric` (single); `data().filter` ต้องเริ่มต้นเป็น `[]`; ส่ง API เฉพาะเมื่อ `array.length > 0` |
| 2026-06-24 | list-page standard (global) | **#12 description บังคับ**: `SearchBarGeneric` เพิ่ม prop `description` (String, default '') และส่งต่อให้ `pageTitle` — ทุก list page ต้องใส่ `:description="$t('view.xxx.xxxDesc')"` (i18n key ทั้ง th และ en) |
| 2026-06-25 | InputTextGeneric (global) | เพิ่ม prop `icon` — icon-input ฝังในช่อง (leading), เลิก input-group manual ที่ icon ลอย; migrate ทีละหน้าในรอบถัดไป |
| 2026-06-25 | customer/create-view (modal) | Modal Form Standard: title bar headerVariant=main (filled bg), แต่ละกลุ่มใช้ SectionCardGeneric (border box + title) แทนเส้นใต้ h6, footer นอกกล่อง — reference customer create-view |
