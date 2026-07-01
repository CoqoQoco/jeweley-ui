# Blueprint — SearchBar (search/filter bar หน้า list)

> พิมพ์เขียว design ของ search bar 4-section — source of truth ก่อน map เข้าโค้ด

---

## Meta

| | |
|---|---|
| **Component / Archetype** | SearchBar archetype — `src/components/generic/SearchBarGeneric.vue` + `src/components/custom/page-title.vue` (header zone) · ref หน้า `/plan-order-tracking` (`src/views/production/plan-tracking/components/search-view.vue`) |
| **สถานะ** | 🚀 mapped (2026-06-30, build เขียว) — segmented action bar เลื่อนไปรอบ migrate ปุ่มเป็น ButtonGeneric |
| **วันที่** | 2026-06-30 |
| **Ref ที่ใช้** | ไม่มี ref ภายนอก — เสนอ 3 ทาง (A simple / B bold / C modern) |
| **Claude Design** | "Duangkeaw Jewelry DS" → กลุ่ม "Explore · SearchBar" → `search-bar-c-recommended.html` |
| **ทางเลือกที่เลือก** | **C (ปรับ)** — modern admin; user สั่งปรับ: (1) เอา icon chip ออก (2) header zone เปลี่ยนจากชมพูอ่อน → **พื้น main #921313 ตัวอักษรขาว** |

---

## Layout (frame ที่ approve)

```
┌─ card (white, border, radius-md, shadow-sm, overflow hidden) ───────────────┐
│ ┌─ header zone: bg #921313 (filled main) ────────────────────────────────┐ │
│ │  ติดตามใบสั่งผลิต                              ← title ขาว fs-lg weight700│ │
│ │  ค้นหาและติดตามสถานะใบสั่งผลิตทั้งหมด           ← desc ขาว .82 fs-sm     │ │
│ └────────────────────────────────────────────────────────────────────────┘ │
│  body (padding sp-xl)                                                        │
│  วันที่สร้าง            เลขใบสั่งงาน           สถานะแผน                       │
│  [📅 เริ่ม]→[📅 สิ้นสุด] [▥ EX:.. (focus ring)] [chip teal] [chip teal]      │
│  ───────────────────────────────────────────────────────────────  (divider) │
│                        [ 🔎  ✖  ⬇ ]  segmented ghost      [ 🔍 ค้นหา ] primary│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Spec — ค่าที่ใช้ (token)

| ส่วน | property | token / ค่า |
|---|---|---|
| card | border / radius / shadow / bg | `--color-border` / `--radius-md` / `--shadow-sm` / `--color-card-bg`; `overflow:hidden` |
| header zone | background | `var(--base-font-color)` #921313 (filled) |
| header zone | padding | `var(--sp-md) var(--sp-lg)` |
| title | font / color | `var(--fs-lg)` (17px) weight 700 · `#fff` |
| description | font / color | `var(--fs-sm)` (12px) · `rgba(255,255,255,.82)` |
| body | padding | `var(--sp-xl)` |
| fields grid | layout | `auto-fit minmax(230px,1fr)` gap `var(--sp-lg)` (responsive ≤1024 → 1 col) |
| label | font | `var(--fs-sm)` weight 500 · `#555` |
| input | height/border/radius | 38px · `--color-border` · `--radius-md` |
| input focus | border/ring | `--base-font-color` + `0 0 0 3px rgba(146,19,19,.08)` |
| status chip | bg/text | `var(--color-green-bg)` #e6f4f4 / `var(--base-green)` #038387 |
| action bar | layout | flex-end, gap `--sp-sm`, border-top `#f0f0f0`, padding-top `--sp-lg` |
| secondary actions | container | segmented: bg `#f7f7f7` radius `--radius-lg` padding `--sp-xs`; icon btn 34px ghost; export icon = teal |
| primary search | btn | filled `--base-font-color`, radius `--radius-md`, มี label "ค้นหา" + icon |

---

## States

| State | สิ่งที่เปลี่ยน |
|---|---|
| default | header filled main, fields ว่าง |
| input focus | border แดง + ring จาง |
| filter เลือกหลายค่า | chip teal ใน control (multi-select) |
| export disabled | ปุ่ม export จาง + cursor not-allowed (เมื่อ total = 0) |
| responsive ≤1024px | fields ยุบ 1 คอลัมน์; action bar ปุ่มไม่ล้น |

---

## Diff จากของเดิม

- header zone: เดิม = พื้นขาว + title แดง + border-bottom แดง (pageTitle) → **ใหม่ = filled main ตัวอักษรขาว** (consistent กับ PageHeaderGeneric)
- **เพิ่ม description** (ของเดิมหน้า plan-tracking ไม่ส่ง description — ผิดหลักการ #12)
- action bar: เดิมไอคอนเรียงเดี่ยวๆ → **จัดกลุ่ม**: secondary (ค้นเพิ่ม/ล้าง/export) ใน segmented ghost + **search เป็น primary เด่นแยก**
- status chip: ใช้โทน teal (green-bg)

---

## Mapping → โค้ด (Phase 3)

| ไฟล์ | แก้อะไร |
|---|---|
| `src/components/custom/page-title.vue` | ⚠️ **อย่าแก้ตรงๆ ทั้งไฟล์** — pageTitle ใช้ร่วมกับ SectionCardGeneric ด้วย; เพิ่ม **variant/prop** (เช่น `filled`) หรือ scope ผ่าน `:deep()` ใน SearchBarGeneric เพื่อให้ header filled main เฉพาะ context search bar |
| `src/components/generic/SearchBarGeneric.vue` | scoped style: header filled main (`:deep(.page-title-container)`), action bar segmented + primary search, focus ring, chip teal |
| pages ที่ hand-roll search bar (เช่น `search-view.vue` ของ plan-tracking) | **migrate มาใช้ `SearchBarGeneric`** เพื่อ inherit ดีไซน์ใหม่ (ปัจจุบันเขียน `filter-container-searchBar` เอง) |
| `standard-search-bar.scss` / `standard-form.scss` | ❌ legacy — ห้ามแก้ (import reuse เท่านั้น) |

- delegate: **@ui-implementer** · verify: `npm run lint` + `npm run build` + chrome-mcp (`/plan-order-tracking`, catalog)
- Design Decision Log (`docs/design-system.md`): บันทึก "search bar header → filled main + action จัดกลุ่ม"

---

## ✅ Decision (confirmed 2026-06-30)

- เลือก **(b)**: คง **label เฉพาะปุ่ม search (primary)** + **secondary (ค้นเพิ่ม/ล้าง/export) คง icon-only**
- ต้อง **อัปเดตหลักการ #10** ใน `docs/design-system.md` + skill `design-system`: "primary search ใส่ label ได้, ปุ่มรองคง icon-only"

---

## Refinement (2026-06-30, หลัง verify รอบ 1)

- header filled **full-bleed**: break out จาก padding 10px ของ `.filter-container-searchBar` (legacy) ด้วย negative margin → ชนขอบนอก, มุมบนโค้งตาม wrapper (5px)
- **เพิ่ม margin-bottom** ใต้ header band แยกจาก filter fields (`var(--sp-md)`/`--sp-lg`)
- ทำใน SearchBarGeneric scoped (`:deep(.page-title-filled)`) — ห้ามแตะ legacy scss

## Refinement รอบ 2 (2026-06-30, จาก ref ผู้ใช้)

ผู้ใช้ส่ง ref ใหม่ แต่เอาเฉพาะ 3 จุด (ยังไม่เอา chip outline/ลายจุด/ปุ่ม label segmented — ไว้รอบ migrate ปุ่ม):
1. **เพิ่ม icon นำหน้า title** ใน filled header — กล่องไอคอนซ้าย (พื้น translucent white) + title/desc (pageTitle เพิ่ม prop `icon`; SearchBarGeneric ส่ง default `bi-search`)
2. **title ใหญ่ขึ้น + ชิด description** — title `var(--fs-xl)` weight 700 line-height แน่น, description margin-top ~0 (ลดช่องว่าง)
3. **fields ไม่ชิดขอบ** — เพิ่ม horizontal inset ให้ `.form-col-container` + action bar (header คง full-bleed)

> ref เต็ม (chip teal outline, ลายจุด header, ปุ่ม ค้นหา/ล้าง/พิมพ์ แบบมี label segmented) = direction รอบถัดไปตอน migrate ปุ่มเป็น ButtonGeneric

## Refinement รอบ 3 (2026-06-30) — เลิกพึ่ง legacy scss + responsive เอง

SearchBarGeneric เดิม `@import` `standard-search-bar.scss` + `standard-form.scss` (legacy) → action bar ไม่ wrap, ไม่ responsive ดี
- **ลบ @import legacy ทั้ง 2** จาก SearchBarGeneric
- เขียน scoped layout ใหม่ด้วย token/mixin: wrapper `card-base` + padding 0 + overflow hidden (header full-bleed เองโดยไม่ต้อง hack negative margin -10px), body padding `--sp-lg`, fields grid auto-fit responsive, **action bar flex-wrap** (ปุ่ม wrap บนจอแคบ)
- label `.title-text` ปลอดภัย: ทุกหน้า import standard-form เอง (slot = parent scope)

## Refinement รอบ 4 (2026-06-30) — header right-slot + แก้ gap (specificity)

- **gap header↔fields** ย้ายไปคุมที่ `.search-bar-body` padding-top (`var(--sp-xl)`) แทน margin-bottom ของ title (เดิมโดน `page-title.vue .page-title-container.page-title-filled{margin-bottom:0}` override — specificity สูงกว่า :deep)
- **เพิ่ม right-slot ใน filled header** — มุมขวาบนของ header แดงรับ template ได้ (เอาไว้วางปุ่ม เช่น "สร้างลูกค้าใหม่"):
  - `page-title.vue` filled branch: เติม `.filled-actions` + `<slot name="rightSlot">` (render เมื่อ `$slots.rightSlot`) + `:deep(.filled-actions .btn)` style ขอบขาวโปร่ง (เหมือน PageHeaderGeneric actions)
  - `SearchBarGeneric.vue`: expose slot `#header-actions` → ส่งต่อ `<template #rightSlot>` ของ pageTitle
  - caller ใช้: `<SearchBarGeneric><template #header-actions><ButtonGeneric.../></template></SearchBarGeneric>` → ย้ายปุ่ม create จาก action bar มาที่ header

## Refinement รอบ 5 (2026-07-01) — header-actions หลายปุ่ม + equal width + default btn-green

ปรับ `.filled-actions` ใน `page-title.vue` จาก flex → **grid** เพื่อรองรับปุ่มหลายปุ่มที่กว้างเท่ากัน:

```scss
.filled-actions {
  flex-shrink: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;   /* ทุกปุ่มกว้างเท่ากัน */
  gap: var(--sp-sm);
}

:deep(.filled-actions .btn) {
  width: 100%;
  justify-content: center;
  background: var(--base-green);
  border: 1px solid var(--base-green);
  color: var(--color-card-bg);
}

:deep(.filled-actions .btn:hover) {
  filter: brightness(0.92);
}
```

กติกา 3 ข้อใหม่:
1. **หลายปุ่มได้** — ทุกปุ่มกว้างเท่ากัน (grid 1fr) สมมาตร ไม่ต้องกำหนด width เอง
2. **Equal width** — `grid-auto-columns: 1fr` + `width: 100%` บนปุ่ม
3. **Default btn-green** — `:deep` override ทุกปุ่มใน slot ให้เป็น teal (`var(--base-green)`) โดยไม่สน variant ที่ caller ส่ง → caller ควรส่ง `variant="green"` เพื่อตรง semantic

ผลลัพธ์: caller ใช้ `<ButtonGeneric variant="green" :label="..." @click="..." />` ใน `#header-actions`

## Screenshots

- ดูที่ Claude Design → Explore · SearchBar → `search-bar-c-recommended.html` (เทียบ A/B ในกลุ่มเดียวกัน)
