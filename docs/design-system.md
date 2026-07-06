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
| 2 | **แบ่งเป็นหลาย box ตาม logic** | จัด field เป็นกลุ่มตามความหมาย แต่ละกลุ่ม = `SectionCardGeneric` **มี border + title ของตัวเอง** (ไม่รวมทุกอย่างในการ์ดใบเดียว) เพื่อสร้าง focus — **หัวข้อกล่อง/section ต้องมาจาก `SectionCardGeneric` (แนะนำ `headerStyle="legend"` + icon + accent เหมือนหน้า gold-loss-tang) เท่านั้น — ห้ามประดิษฐ์แถบ box-title/section-header เอง** |
| 3 | **Label แหล่งเดียว** | `FormFieldGeneric` เป็นที่มาของ label เพียงแหล่งเดียว — component ลูก (เช่น upload) **ห้าม render title/label ซ้ำ** |
| 4 | **Multi-column = grid** | แถวหลายคอลัมน์ใช้ mixin `form-row-grid(n)` (responsive ≤1024px ยุบเป็น 1 คอลัมน์) ห้ามเขียน media query เอง |
| 5 | **Footer action bar** | ปุ่ม action หลักอยู่ **นอก box** ชิดขวา, primary ขวาสุด, เว้นด้วย `ml-2` (Bootstrap 4) ห้าม flex gap |
| 6 | **Token เท่านั้น** | สี/ระยะ/มุม/เงา ใช้ `var(--sp-*)`,`var(--radius-*)`,`var(--shadow-*)`,`var(--base-*)`,`var(--color-*)` — ห้าม hardcode px/hex (ดู `design-system` skill) |
| 7 | **Generic component เท่านั้น** | ห้าม native `<input>`/`<button>`/`<table>`/`<img>` หรือ PrimeVue ตรงๆ — ใช้ generic wrapper (ดู `native-call-policy` skill); รูป Azure ใช้ `ImagePreview` |
| 8 | **i18n เท่านั้น** | ห้าม hardcode ข้อความไทย ใช้ `$t()` เสมอ (ดู `i18n-system` skill) |
| 9 | **Reusable first** | ถ้าต้องการ UI ซ้ำ 2+ ที่ → สร้าง generic component ใหม่ (เช่น `MultiImageUpload`) อย่า inline ซ้ำ |
| 10 | **List page buttons** | ปุ่มใน search/action bar ของหน้า list: **ปุ่ม primary search ใส่ label ได้** (เช่น 'ค้นหา') เพื่อให้ action หลักเด่น — **ปุ่มรอง (clear/export/advanced/create) คง icon-only + `:title`** tooltip เท่านั้น (ไม่ส่ง `:label`) — ref: `/plan-order-tracking` |
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

Section cards inside modals should use the legend header style (`headerStyle="legend"` with matching `icon` and `accent`) to match the visual language of page forms — this applies to both create/edit modals and detail/read-only modals. Legend boxes reserve top space (`margin-top: var(--sp-2xl)`) for the straddling chip, and box padding must remain uniform via `card-base` (`var(--sp-xl)`) — do not override padding per box.

**✅ Good:**
```vue
<modal headerVariant="main" ...>
  <template #title>
    <span class="title-text-lg d-block">หัวข้อ Modal</span>
  </template>
  <template #content>
    <div class="p-3">
      <SectionCardGeneric :title="$t('view.x.section.main')" headerStyle="legend" icon="bi-card-list" accent="main" class="modal-section">
        <!-- form rows -->
      </SectionCardGeneric>
      <SectionCardGeneric :title="$t('view.x.section.contact')" headerStyle="legend" icon="bi-card-list" accent="main" class="modal-section">
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
| 2026-06-30 | SectionCardGeneric (global) | เพิ่ม opt-in headerStyle='legend' (title คร่อมเส้น border บน + icon + accent main/green, ไม่มีเส้นใต้) — backward compatible, default ยังเป็น pageTitle underline; ใช้ครั้งแรกที่หน้า gold-loss-tang |
| 2026-06-30 | SectionCardGeneric (global) | headerStyle='legend': เปลี่ยน `.section-legend` เป็น **outlined chip** — เพิ่ม `border: 1px solid` (accent color), `border-radius: var(--radius-md)`, padding บน-ล่าง `var(--sp-xs)` (จากเดิม `0`) ให้ title อยู่ในกล่องมีกรอบสีตาม accent มุมมน คร่อมเส้น border บนของ card |
| 2026-06-30 | variable.scss (global) | เพิ่ม token `--color-green-bg: #e6f4f4` (teal tint อ่อน, SCSS `$color-green-bg` + CSS custom property) — ใช้กับ zone สรุป/คำนวณที่ต้องการ focus เป็นพื้นเขียวอ่อน (teal) แทน highlight-bg (ชมพู) |
| 2026-06-30 | gold-loss-tang / summary-panel | `.calc-summary` เปลี่ยน background เป็น `var(--color-green-bg)` + border เป็น `var(--base-green)` — สร้าง visual focus ที่ zone สรุป&คำนวณ; remark TextareaGeneric แยกลงแถวล่างเต็มกว้าง (จาก three-col เป็น two-col + แถวล่าง full-width) |
| 2026-06-30 | gold-loss-tang / issued+returned lines | เปลี่ยน `FormFieldGeneric` ต่อแถว → **div-grid table** `grid-template-columns: 1fr 140px 44px` ให้ทุกแถว (base/header/input/total) อยู่แนวเดียวกัน; ค่าน้ำหนักจาก 4dp → **2dp** ทุกจุด (display เท่านั้น — logic calc ไม่เปลี่ยน); step input 0.0001 → 0.01 |
| 2026-06-30 | SearchBarGeneric/pageTitle (global) | search bar header → filled main ตัวอักษรขาว (prop `filled` ใน `page-title.vue`, non-breaking); input focus ring (`border-color: var(--base-font-color)` + `box-shadow: 0 0 0 3px rgba(146,19,19,.08)`); status chip teal (`var(--color-green-bg)` bg + `var(--base-green)` text); **#10 ปรับ**: primary search ใส่ label ได้ — ปุ่มรอง (clear/export/advanced/create) คง icon-only + `:title` — blueprint: docs/claude-design/blueprints/search-bar.md |
| 2026-06-30 | SearchBarGeneric filled header (global) | เพิ่ม slot `#header-actions` (มุมขวาบน header filled แดง) — รองรับหลายปุ่ม, width เท่ากัน (grid `auto-columns: 1fr`), default style `btn-green` (var(--base-green)); ปุ่ม create ย้ายจาก action bar มาที่นี่, caller ใช้ `variant="green"` เพื่อตรง semantic default |
| 2026-07-01 | SearchBarGeneric/pageTitle (global) | adopt ref บางส่วน: (#1) filled header เพิ่ม dot texture `radial-gradient(rgba(255,255,255,.08) 1px, transparent 1.5px)` size 14px; (#2) MultiSelect chip เปลี่ยนเป็น outline teal (`background: transparent` + border/text `var(--base-green)`); (#3 ไม่รับ) ปุ่ม list page คง icon-only ตาม #10 — ไม่รับ ref แบบ label segmented |
| 2026-07-02 | gold-loss-tang detail modal | Detail/read-only modal ใช้ Modal Standard เต็ม: headerVariant="main" (title bar filled) + section cards ใช้ headerStyle="legend" (icon+accent main/green) ให้สไตล์ box title ตรงกับหน้า create — reference gold-loss-tang list/modal/detail-view |
| 2026-07-02 | SectionCardGeneric (global) | headerStyle='legend': เพิ่ม margin-top var(--sp-2xl) ให้ chip ที่คร่อมขอบบน (top:0/translateY(-50%)) ไม่ชนขอบ box ก่อนหน้า; padding ทุก box ต้องเท่ากันจาก card-base (var(--sp-xl)) ห้าม override |
| 2026-07-06 | variable.scss (global) | เพิ่ม status color tokens (`--status-open/-progress/-resolved/-closed/-cancelled` + คู่ `-bg`) — mirror สีจาก dashboard donut เดิม ให้ table badge กับ dashboard chart ใช้แหล่งสีเดียวกัน แก้ปัญหาสถานะเดียวกันแสดงคนละสีระหว่างหน้า |
| 2026-07-06 | ticket/manage (list+detail+dashboard) | box-title เขียนเอง (`.panel-section-header`/`.panel-divider`) → แปลงเป็น `SectionCardGeneric headerStyle="legend"` ทุกกล่อง (detail panel ซ้าย 2 กล่อง, การ์ดฝั่งขวา 3 กล่อง, chart การ์ด dashboard 4 กล่อง); สร้าง shared `ticket-status-badge.vue`/`ticket-type-badge.vue` + `ticket-status.js` constants แทน array/method ซ้ำ 3 ไฟล์ |
