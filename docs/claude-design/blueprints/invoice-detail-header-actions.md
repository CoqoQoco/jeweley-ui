# Blueprint — Invoice Detail header actions (แถบปุ่มหน้า รายละเอียด Invoice)

> พิมพ์เขียว design ของแถบปุ่ม action บนหัวหน้า `/invoice-detail` — source of truth ของดีไซน์ที่ approve แล้ว ใช้ตอน map เข้าโค้ด

---

## Meta

| | |
|---|---|
| **Component / Archetype** | Detail page header actions — `src/views/sale/invoice-detail/index-view.vue` (header) + generic ใหม่ `src/components/generic/ActionMenuGeneric.vue` (ปุ่ม + เมนู popup) + `PageHeaderGeneric` (เพิ่ม modifier `is-primary`) |
| **สถานะ** | 🚀 mapped (build เขียว 2026-09-08) |
| **วันที่ (อัปเดตล่าสุด)** | 2026-09-08 |
| **Ref ที่ใช้** | หน้า ใบวางบิล detail (`src/views/sale/billing-note/detail-view.vue`) — ใช้ `PageHeaderGeneric` + `#actions` อยู่แล้ว; archetype `detail` ใน design-system MCP (rule: "ปุ่มแสดงต่างกันตามสถานะเอกสาร") |
| **Claude Design** | ไม่ได้ใช้ — ออกแบบใน chat เป็น ASCII 2 ทางเลือก (A จัดกลุ่มเป็นเมนู / B icon-only) |
| **ทางเลือกที่เลือก** | **A** — ลดจาก 9 ปุ่มเหลือ 5 control อยู่แถวเดียว, action หลัก (พิมพ์ใบแจ้งหนี้) เด่นและกดได้ทันที, action อันตรายซ่อนใน ⋯ |

---

## ปัญหาของเดิม

- ปุ่ม 9 ปุ่ม `btn-green` สีเดียวกันหมด (ยกเว้นยกเลิก) → action หลักไม่เด่น
- กว้างเกิน 1 แถว ตกบรรทัดบนจอ 1366–1600px
- header เป็น `.card-header` custom ของหน้านี้เอง ไม่ใช่ `PageHeaderGeneric` ที่หน้า detail อื่นใช้
- ปุ่มใบรับประกันที่ปิดอยู่ ต้องอาศัย tooltip บน `<span>` ครอบ (มองไม่เห็นเหตุผลจนกว่าจะ hover)

---

## Layout (frame ที่ approve)

```
┌─ page-header-bar (PageHeaderGeneric: bg --surface-inverse #921313, ตัวอักษรขาว, radius-md, shadow-sm) ─────────────┐
│ (←)  รายละเอียด Invoice  [👁 กำลังดู Version: 2]                                                                      │
│                              [↩ กลับต้นฉบับ]* [＋ เพิ่ม Version] [🖨 พิมพ์ใบแจ้งหนี้] [📄 เอกสารอื่น ▾] [📗 Excel ▾] [⋯] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                        * โผล่เฉพาะตอนกำลังดู Version

   เอกสารอื่น ▾ (ActionMenuGeneric)          Excel ▾                          ⋯ (icon-only, title "เพิ่มเติม")
   ┌──────────────────────────────┐         ┌──────────────────────────┐     ┌──────────────────────┐
   │ 🚚 ใบส่งสินค้า                 │         │ 📗 Excel ใบแจ้งหนี้        │     │ ↺ ยกเลิกเอกสาร (แดง) │
   │ ✅ ใบรับประกัน                 │         │ 📗 Excel ใบสรุปตามประเภท   │     └──────────────────────┘
   │    ต้องชำระเงินครบก่อน  ← hint  │         └──────────────────────────┘
   │    (item disabled เมื่อยังไม่ครบ)│
   │ 📄 ใบสรุปตามประเภท (PDF)       │
   └──────────────────────────────┘
```

ลำดับซ้าย→ขวา (ตามความถี่ใช้งาน, primary อยู่กลางกลุ่มแต่เป็นปุ่มเดียวที่ filled):
1. `กลับต้นฉบับ` (เฉพาะตอนดู version) — outline
2. `เพิ่ม Version` — ghost
3. `พิมพ์ใบแจ้งหนี้` — **primary filled** (ใช้บ่อยสุด กดได้ทันที ไม่อยู่ในเมนู)
4. `เอกสารอื่น ▾` — ghost + เมนู 3 รายการ
5. `Excel ▾` — ghost + เมนู 2 รายการ
6. `⋯` — ghost icon-only + เมนู 1 รายการ (danger)

---

## Spec — ค่าที่ใช้ (token เท่านั้น)

| ส่วน | property | token / ค่า |
|---|---|---|
| header bar | ทั้งหมด | ใช้ `PageHeaderGeneric` ตามเดิม (bg `var(--surface-inverse)`, padding `var(--sp-md) var(--sp-lg)`, radius `var(--radius-md)`, shadow `var(--shadow-sm)`) |
| ปุ่มใน `#actions` (ghost) | bg / border / color | transparent / `1px solid var(--on-inverse)` / `var(--on-inverse)` (deep style ที่ `PageHeaderGeneric` มีอยู่แล้ว) |
| ปุ่ม ghost hover | bg / color | `var(--color-card-bg)` / `var(--base-font-color)` (เดิม) |
| ปุ่ม primary (`is-primary`) | bg / border / color | `var(--on-inverse)` / `1px solid var(--on-inverse)` / `var(--base-font-color)` — **เพิ่ม modifier ใน PageHeaderGeneric** (`.page-header-actions :deep(.btn.is-primary)`) |
| ปุ่ม primary hover | bg / color | `var(--on-inverse-muted)` / `var(--base-font-color)` |
| ระยะห่างปุ่ม | gap | `var(--sp-sm)` (flex gap ของ `.page-header-actions` เดิม) — ไม่ใช้ `ml-2` เพราะ container นี้ใช้ gap อยู่แล้ว |
| chevron ▾ ของปุ่มเมนู | icon / margin | `bi-chevron-down` ขนาด `var(--fs-sm)`, margin-left `var(--sp-xs)` |
| เมนู popup (PrimeVue `Menu` popup) | bg / border / radius / shadow | `var(--color-card-bg)` / `1px solid var(--color-border)` / `var(--radius-md)` / `var(--shadow-md)` |
| เมนู popup | min-width / padding | `220px` / `var(--sp-xs) 0` |
| menu item | padding / font | `var(--sp-sm) var(--sp-md)` / ขนาดฐานเดียวกับปุ่ม (`btn-sm`), color `var(--base-sub-color)` |
| menu item icon | color / width | `var(--base-font-color)` / `1.25rem` จัดชิดซ้ายเท่ากันทุกแถว |
| menu item hover | bg | ใช้ theme hover ของ PrimeVue Menu (ไม่ override) |
| menu item disabled | opacity / cursor | `.5` / `not-allowed` (PrimeVue `disabled: true`) |
| menu item hint (บรรทัดใต้ label) | font / color | `var(--fs-sm)` / muted token ของระบบ (`--on-inverse` ใช้ไม่ได้บนพื้นขาว → ใช้ token muted ที่มีใน `variable.scss`; ถ้าไม่มี ใช้ `var(--base-sub-color)` + opacity .7) |
| menu item danger | color (label + icon) | `var(--base-red)` |
| badge "กำลังดู Version" | class | `badge badge-warning` เดิม (อยู่ต่อจาก title) |

> ทุกค่าต้องเป็น token — ห้าม hardcode hex ใน component ใหม่

---

## ActionMenuGeneric — API

```
<ActionMenuGeneric
  :label="$t('view.sale.invoiceDetail.menuOtherDocs')"   // ไม่ส่ง label = icon-only (ต้องส่ง :title)
  icon="bi-file-earmark-text"
  :items="otherDocMenuItems"
  variant="outline"                                        // ส่งต่อให้ ButtonGeneric (ใน PageHeaderGeneric จะถูก deep style ทับเป็น ghost อยู่แล้ว)
  :disabled="false"
/>

items: [{
  key: 'delivery',                 // unique
  label: 'ใบส่งสินค้า',
  icon: 'bi-truck',
  command: () => {...},            // เรียกเมื่อคลิก
  disabled: false,
  hint: 'ต้องชำระเงินครบก่อน',     // optional บรรทัดเล็กใต้ label
  danger: false                    // true = สีแดง
}]
```

- ภายใน: `ButtonGeneric` (trigger, มี chevron อัตโนมัติเมื่อมี label) + PrimeVue `Menu` (`:popup="true"`, `:model`) ใช้ `#item` slot render icon/label/hint/danger เอง
- Emits: ไม่มี (ใช้ `command` ต่อรายการ) — ตรง pattern PrimeVue MenuItem
- ปิดเมนูอัตโนมัติหลังคลิก / คลิกนอก / Esc (PrimeVue จัดการ)

---

## States (ครบทุก state ที่ component มี)

| State | สิ่งที่เปลี่ยน |
|---|---|
| default | 5 control แถวเดียว ชิดขวาของ header; ปุ่ม primary เป็น filled ขาวตัวแดง ที่เหลือ ghost |
| กำลังดู Version | badge เหลืองต่อจาก title + ปุ่ม `กลับต้นฉบับ` โผล่ซ้ายสุดของกลุ่มปุ่ม |
| ยังชำระไม่ครบ / invoice ยกเลิก | เมนู เอกสารอื่น → รายการ ใบรับประกัน `disabled` + hint "ต้องชำระเงินครบก่อนออกใบรับประกันครับ" |
| ไม่มีรายการสินค้า | ใบสรุปตามประเภท (PDF) และ Excel ใบสรุปตามประเภท `disabled` (เงื่อนไขเดิม `invoiceItems.length === 0`) |
| hover ปุ่ม | ghost → พื้นขาวตัวแดง; primary → พื้นขาวหม่น |
| เมนูเปิด | popup ใต้ปุ่ม ชิดขวาของปุ่ม; คลิกนอก/Esc ปิด |
| จอแคบ (< 1024px) | `.page-header-bar` ให้ `flex-wrap: wrap` → กลุ่มปุ่มตกลงบรรทัดใต้ title ชิดขวา, gap `var(--sp-sm)` |
| loading (ระหว่างสร้าง PDF) | ไม่เปลี่ยนปุ่ม (พฤติกรรมเดิม — modal/preview เป็นตัวบอกสถานะ) |

---

## Diff จากของเดิม

- header `.card` + `.card-header` custom → `PageHeaderGeneric` (`@back="goBack"` คงตรรกะ `fromRoute` เดิม) → ปุ่ม `ย้อนกลับ` หายไป กลายเป็นวงกลม (←) ซ้ายสุด
- 9 ปุ่ม `btn-green` → 5 control: `เพิ่ม Version`, `พิมพ์ใบแจ้งหนี้` (primary), `เอกสารอื่น ▾`, `Excel ▾`, `⋯`
- `ใบส่งสินค้า` / `ใบรับประกัน` / `ใบสรุปตามประเภท` → เมนู เอกสารอื่น
- `Export Excel` / `Excel ใบสรุปตามประเภท` → เมนู Excel
- `ยกเลิกเอกสาร` (btn-red) → รายการสีแดงในเมนู ⋯ (ยัง confirm ก่อนทำเหมือนเดิม)
- tooltip ใบรับประกันบน `<span>` → hint ในเมนู + item disabled
- ลบ style `.btn-header-action { min-width: 140px }` และ `.card-header` ที่ไม่ใช้แล้วในหน้านี้ (ตรวจว่า class `.card`/`.card-body` ยังถูกใช้ที่ส่วนอื่นของหน้าไหมก่อนลบ)

---

## Mapping → โค้ด (Phase 3)

| ไฟล์ที่ต้องแก้ | แก้อะไร |
|---|---|
| `src/components/generic/ActionMenuGeneric.vue` (ใหม่) | ปุ่ม trigger (`ButtonGeneric`) + PrimeVue `Menu` popup; props `label`, `icon`, `items`, `variant`, `disabled`, `title`; item slot render icon/label/hint/danger ด้วย token |
| `src/components/generic/PageHeaderGeneric.vue` | เพิ่ม `:deep(.btn.is-primary)` filled ขาว + `flex-wrap: wrap` บน `.page-header-bar` (backward compatible) |
| `src/views/sale/invoice-detail/index-view.vue` | header → `PageHeaderGeneric` + 5 control; computed `otherDocMenuItems` / `excelMenuItems` / `moreMenuItems`; ลบ span tooltip + style ที่ไม่ใช้ |
| `src/language/view/sale/th.js` / `en.js` | `invoiceDetail.menuOtherDocs` ("เอกสารอื่น"/"Other documents"), `invoiceDetail.menuExcel` ("Excel"), `invoiceDetail.menuMore` ("เพิ่มเติม"/"More"), `invoiceDetail.printSummaryPdf` ("ใบสรุปตามประเภท (PDF)"/"Summary by type (PDF)") |
| `.claude/skills/generic-components/SKILL.md` | เพิ่มแถว `ActionMenuGeneric` ในตาราง generic |
| `docs/design-system.md` | Decision Log: 2026-09-08 invoice-detail header — จัดกลุ่ม action เป็นเมนู + generic ใหม่ + modifier `is-primary` |

- delegate: **@ui-implementer** · verify: `npx eslint` + `npx vite build` + chrome-mcp `/invoice-detail?invoiceNumber=INV260908007` (ถ้า browser ว่าง)
- บันทึก **Design Decision Log** ใน `docs/design-system.md`

---

## Screenshots

- before: แถบปุ่ม 9 ปุ่มตกบรรทัด (screenshot จาก user 2026-09-08)
- after: แนบหลัง map เข้าโค้ดและเปิดดูจริง
