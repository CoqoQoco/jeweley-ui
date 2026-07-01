# 04 · Redesign Playbook — Loop การทำงาน

> **วัตถุประสงค์**: ขั้นตอนการ redesign ทีละส่วน (generic component → archetype) บน Claude Design แล้ว map กลับเข้าโค้ด
> + prompt template + ตาราง tracking · อิง memory `project_ui_refactor`, `docs/loop-runbook.md`

---

## หลักการ: redesign ที่ "ของกลาง" → propagate ทั้งระบบ

ทุกหน้าใช้ generic component + token ร่วมกัน ดังนั้น **1 หน่วยงาน = 1 generic component / 1 archetype / 1 token group**
ไม่ใช่ "1 หน้า" — แก้ที่ `variable.scss` / ไฟล์ component กลาง → 486 หน้าได้ของใหม่อัตโนมัติ

---

## ลำดับการ Redesign (Phase 1 → 2)

### Phase 1 — Components (impact สูง → ต่ำ)

| รอบ | Component | เหตุผล (ความถี่การใช้) |
|---|---|---|
| 1 | **token + ButtonGeneric** | ปุ่มอยู่ทุกหน้า; token เป็นฐานของทุกอย่าง |
| 2 | InputTextGeneric · TextareaGeneric · FormFieldGeneric | ฟอร์มทุกหน้า |
| 3 | SectionCardGeneric · PageHeaderGeneric · SearchBarGeneric | โครงทุก archetype |
| 4 | DropdownGeneric · MultiSelectGeneric · CalendarGeneric · Checkbox · Radio · AutoComplete | form controls |
| 5 | **DataTableWithPaging** | ตารางทุกหน้า list/detail |
| 6 | modal-view · DrawerGeneric · DialogSearchView | overlay |
| 7 | Image/Upload (ImagePreview/UploadImage/MultiImageUpload/Gallery) · StepperStatus · HorizontalBarChart | media/พิเศษ |

### Phase 2 — Archetypes
ประกอบ component ที่ approve เป็น 5 archetype (`03`) → ตรวจ responsive ≤1024px → approve

---

## Loop ต่อ 1 หน่วย (component หรือ archetype)

```
1. เตรียม spec   → ดึงจาก 01 (component) หรือ 03 (archetype) + token จาก 00
                   (หรือถาม design-system-mcp: get_component_spec / get_archetype)
2. Prompt        → ป้อนใน Claude Design (template ด้านล่าง) + แนบ ref/screenshot ของจริง
3. Generate      → ได้ดีไซน์ 1–3 ทางเลือก
4. Review        → ตรวจกับหลักการ 12 ข้อ (00) + ทุก state ครบ (01) → เลือก/ปรับ
5. ⭐ Blueprint  → บันทึกพิมพ์เขียวที่ blueprints/<component>.md (บังคับ — copy _template.md)
                   เก็บ: ref, ทางเลือกที่เลือก, spec(token), states, diff, mapping, screenshot
6. (Phase 3) map → @ui-implementer แก้ token/ไฟล์ component ตาม blueprint → lint+build → chrome-mcp verify
7. บันทึก        → เพิ่มแถว Design Decision Log ใน docs/design-system.md + อัปเดตสถานะ blueprint = 🚀 mapped
```

> **กฎถาวร:** ทุก design ที่ผ่าน review **ต้องมี blueprint ก่อน map เข้าโค้ด** — ห้ามแก้โค้ดโดยไม่มีพิมพ์เขียว
> blueprint = สัญญาระหว่างดีไซน์ ↔ โค้ด (`docs/claude-design/blueprints/`)

---

## Prompt Template (วางใน Claude Design)

### สำหรับ Component
```
ออกแบบ component "<ชื่อ>" สำหรับระบบจัดการเครื่องประดับ (เว็บแอป tablet/desktop)
ยึด Design System "Duangkeaw Jewelry DS": primary dark red #921313, secondary teal #038387,
มุมมน 8px, เงาบาง, พื้นขาว, เส้นขอบ #e0e0e0, spacing 4/8/12/16/20/24.

บทบาท: <จาก catalog 01>
Variants: <list>
ต้องแสดงครบทุก state: default, hover, focus, disabled, loading, error/required, empty (ตามที่มี)
คงโครงสร้าง props เดิม เปลี่ยนแค่ visual. ห้ามใช้สีนอก palette.
ส่งมาเป็น <Wireframe / hi-fi mockup> พร้อม annotation ค่า spacing/สีที่ใช้.
```

### สำหรับ Archetype
```
ออกแบบหน้าแบบ "<List/Create-Edit/Detail/Dashboard/Modal>" ตาม Duangkeaw Jewelry DS.
ใช้ component ที่ออกแบบไว้แล้ว: <list>. โครงตาม wireframe นี้: <วาง frame จาก 03>.
หลักการบังคับ: multi-box แยก border, footer นอก box ชิดขวา, list page = ปุ่ม icon-only,
filter = multi-select chip, responsive ยุบ 1 คอลัมน์ที่ ≤1024px.
แสดง state: ปกติ / empty / loading.
```

---

## Tracking Table (อัปเดตทุกรอบ)

| รอบ | หน่วย (component/archetype) | สถานะ | ดีไซน์ที่ approve (สรุป diff) | map เข้าโค้ดแล้ว | Decision Log |
|---|---|---|---|---|---|
| 1 | token + ButtonGeneric | ⬜ pending | — | ⬜ | ⬜ |
| 2 | Input/Textarea/FormField | ⬜ | — | ⬜ | ⬜ |
| 3 | SectionCard/PageHeader/SearchBar | ⬜ | — | ⬜ | ⬜ |
| 4 | form controls | ⬜ | — | ⬜ | ⬜ |
| 5 | DataTableWithPaging | ⬜ | — | ⬜ | ⬜ |
| 6 | overlays | ⬜ | — | ⬜ | ⬜ |
| 7 | media/พิเศษ | ⬜ | — | ⬜ | ⬜ |
| A1–A5 | 5 archetypes | ⬜ | — | ⬜ | ⬜ |

> สถานะ: ⬜ pending · 🟡 designing · 🔵 review · ✅ approved · 🚀 mapped

---

## Phase 3 — Map กลับเข้าโค้ด (กฎสำคัญ)

- **ต้อง delegate `@ui-implementer` เท่านั้น** (ห้าม implement ตรง — กฎ CLAUDE.md)
- แก้ที่ `variable.scss` (token) / `mixin.scss` / ไฟล์ component กลาง — **ห้ามแตะ business page ทีละหน้า**
- คง props/emits/slots เดิม (backward compatible)
- ทุกรอบ: `npm run lint` + `npm run build` ต้องเขียว
- verify pilot ด้วย chrome-mcp: **catalog + customer** (i18n TH↔EN, responsive, 0 console error)
- ห้ามแตะ `src/assets/scss/custom-style/` (legacy)
- ห้าม commit/push (ผู้ใช้จัดการเอง)

---

## Verify Checklist ต่อรอบ

- [ ] ผ่านหลักการ 12 ข้อ (00)
- [ ] ครบทุก state ที่ component มี (01)
- [ ] token-only (ไม่มี hex/px ใหม่) — เช็คด้วย `validate_value` ของ MCP หรือ stylelint
- [ ] responsive ตัด 1024px ถูก
- [ ] lint + build เขียว
- [ ] Decision Log เพิ่มแล้ว
