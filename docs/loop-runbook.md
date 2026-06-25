# Loop Runbook — วิธีรัน Migration Loop

คู่มือสำหรับรัน Phase 1 Migration Loop ทีละ module

---

## กฎพื้นฐาน

- **1 iteration = 1 module** เสมอ — ห้ามรวมหลาย module ในรอบเดียว
- **State file**: `docs/refactor-migration.md` — อ่านก่อนทุกรอบ, อัปเดตหลังทำเสร็จ
- **ทุก iteration ต้องผ่าน**: lint warning ของ module = 0 + build ผ่าน + UI เหมือนมาตรฐาน
- **Delegate `@ui-implementer` เสมอ** — ห้าม implement ตรงๆ

---

## 6 ขั้นตอนต่อ 1 Iteration

### ขั้นที่ 1 — อ่าน Tracker

อ่าน `docs/refactor-migration.md`:
- ดูว่า module ถัดไปในลำดับ priority คือ module ไหน (ที่ยังเป็น ⬜ ทั้งหมด)
- ดูตัวเลข "native เหลือ" เพื่อประเมิน scope
- ตรวจ Iteration Log ว่ารอบก่อนหน้าจบที่ไหน

### ขั้นที่ 2 — Delegate @ui-implementer

สั่ง `@ui-implementer` พร้อมระบุ module ที่จะ migrate โดยครอบคลุม:

**a. Design System** — แทน hardcode ด้วย token:
- สี hex → `var(--base-font-color)`, `var(--base-green)`, `var(--color-border)` ฯลฯ
- px spacing → `var(--sp-lg)`, `var(--radius-md)` หรือ `@include card-base`
- ปุ่ม `btn-warning/btn-custom/btn-primary` → `btn-main/btn-outline-main/btn-dark`

**b. Native → Generic** — แทนทุก native element และ PrimeVue ตรงๆ:

| ❌ ห้ามใช้ | ✅ ใช้แทน |
|---|---|
| `<input class="form-control">` | `InputTextGeneric` |
| `<textarea class="form-control">` | `TextareaGeneric` |
| `<button class="btn btn-*">` | `ButtonGeneric` |
| `<table>` HTML | `DataTableWithPaging` |
| PrimeVue Dropdown/Calendar/AutoComplete/MultiSelect/Checkbox ตรงๆ | Generic wrappers |
| Page header เอง | `PageHeaderGeneric` |
| Search bar เอง | `SearchBarGeneric` |
| Section card เอง | `SectionCardGeneric` |

**c. i18n** — extract hardcode ไทย → `$t()`:
- ปุ่ม: `$t('common.btn.save')`, `$t('common.btn.cancel')` ฯลฯ
- Field label: `$t('common.field.name')`, `$t('common.field.status')` ฯลฯ
- ข้อความเฉพาะ feature → เพิ่ม key ใน `src/language/view/<feature>/th.js` + `en.js`

**d. Composables** — แทน boilerplate code:
- `handlePageChange` / `handleSortChange` ซ้ำ → `mixins: [dataTablePaging]`
- `confirmSubmit(...)` ซ้ำ → `confirmThenSubmit(...)`

**e. Cleancode** — ในไฟล์ที่แตะ:
- ลบ `console.log` ที่ไม่จำเป็น
- ลบ commented imports
- ลบ inline `style="..."` ที่ควรเป็น class
- ลบ dead code ที่ไม่มี import ใดอ้างถึง

### ขั้นที่ 3 — Verify Lint + Build

```bash
npm run lint        # ESLint + Stylelint
npm run build       # ตรวจ compile error
```

- **ESLint warning ของ module นั้นต้องเป็น 0** หลัง migrate
- Build ต้องผ่านก่อนถือว่า iteration สำเร็จ
- ถ้า warning เพิ่ม → แก้ก่อนไปขั้นถัดไป

### ขั้นที่ 4 — Verify UI (chrome-mcp)

ใช้ chrome-mcp testing ตรวจ UI จริง:

1. **CRUD ครบ**: สร้าง → แก้ไข → ลบ (ถ้ามี) → ค้นหา
2. **สลับภาษา**: กด switcher TH/EN → ข้อความเปลี่ยนตามที่ `$t()` กำหนด
3. **เทียบมาตรฐาน**: spacing/radius/shadow/ปุ่ม ตรงกับ design system
4. **Responsive**: ลดหน้าต่าง ≤ 1024px — layout ยังใช้งานได้

ดูรายละเอียด: `@.claude/skills/chrome-mcp-testing/SKILL.md`

### ขั้นที่ 5 — Update Tracker

อัปเดต `docs/refactor-migration.md`:
- เปลี่ยน ⬜ → ✅ ใน column ที่ทำเสร็จ
- อัปเดต "native เหลือ" เป็น 0 (หรือตัวเลขที่เหลือจริง)
- เพิ่มแถวใน Iteration Log (วันที่, module, ผลลัพธ์, ESLint/Stylelint ลด)
- เพิ่ม entry ใน `docs/user-manual/README.md` ถ้าเป็น module หลัก

### ขั้นที่ 6 — Commit

```bash
git add <ไฟล์ที่เปลี่ยน>
git commit -m "refactor(<module>): migrate to design token + generic + i18n"
```

ตรวจสอบว่าไม่ commit ไฟล์ sensitive (`.env`, `appsettings.json`)

---

## Skills ที่ @ui-implementer ต้องใช้ต่อ Iteration

| Skill | ใช้เมื่อ |
|---|---|
| `design-system` | Token spacing/radius/shadow/color, mixin card-base/input-control, button standard |
| `native-call-policy` | ตาราง ❌→✅ ทุก native element/PrimeVue |
| `i18n-system` | namespace common.btn/field/label, $t(), เพิ่ม key ใหม่ |
| `composables` | useDataTablePaging mixin, confirmThenSubmit |
| `generic-components` | Props/events ของ InputTextGeneric, ButtonGeneric, DataTableWithPaging ฯลฯ |
| `ui-layout` | PageHeaderGeneric, SearchBarGeneric, SectionCardGeneric patterns |

---

## เกณฑ์ปิด Iteration

| เกณฑ์ | ต้องผ่าน |
|---|---|
| ESLint warning ของ module | = 0 |
| Stylelint warning ของ module | = 0 (หรือลดลงมาก) |
| `npm run build` | ผ่าน (ไม่มี error) |
| CRUD + สลับภาษา ผ่าน chrome-mcp | ✅ |
| UI spacing/สี/ปุ่ม ตรงมาตรฐาน | ✅ |
| Tracker อัปเดต | ✅ |

---

## วิธีสั่ง Loop

**สั่งทีละรอบ (แนะนำ)**:
```
migrate module <ชื่อ module> ตาม loop-runbook
```

**สั่งแบบ loop ต่อเนื่อง**:
```
/loop
```
(loop จะหยุดอัตโนมัติเมื่อ tracker ครบทุก module)

---

## หมายเหตุพิเศษ

- **`sale/sale-order`**: ไฟล์ `sale-order-view.vue` 3,933 บรรทัด → ต้องแตก component ตาม `code-structure` skill ก่อน migrate
- **`production/plan-update`**: 99 native imports — iteration นี้จะใช้เวลามากกว่าปกติ
- **`catalog`**: Pilot แรก — ใช้เป็น reference implementation สำหรับ module อื่น
- Module ที่ native เหลือ = 0 ยังต้องตรวจ design-token + i18n + cleancode
