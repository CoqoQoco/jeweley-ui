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
