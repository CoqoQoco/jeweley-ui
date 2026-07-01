# TODO — jeweley-ui Redesign (Claude Design program)

> อัปเดตล่าสุด: 2026-07-01 · branch งาน: `redesign/search-bar` (ยังไม่ push)
> อ้างอิง: `docs/claude-design/` (playbook `04`, blueprints/), `docs/design-system.md` (Decision Log)
> กติกา: redesign ที่ shared component (token + generic) → propagate ทุกหน้า · map เข้าโค้ดผ่าน `@ui-implementer` เท่านั้น · ทุก design ที่ approve ต้องมี **blueprint** ก่อน map

---

## ✅ เสร็จแล้ว — SearchBar (สาย list search)

- filled header (พื้น main + icon + description) · full-bleed · responsive (self-contained ไม่พึ่ง legacy scss)
- input focus ring · MultiSelect chip = outline teal · dot texture ใน header
- slot `#header-actions` (มุมขวาบน, หลายปุ่ม width เท่ากัน, default btn-green) — ปุ่ม create ย้ายเข้า header แล้ว
- หลักการ #10 ปรับ: primary search มี label ได้ / ปุ่มรอง icon-only
- **propagate 11 หน้า**: customer, master×6 (zill/productType/gold-size/gem/gem-shape/diamond-grade), catalog, plan-order-tracking (migrate แล้ว), ticket×2 (ไม่มีปุ่ม create)
- blueprint: `docs/claude-design/blueprints/search-bar.md` (Refinement รอบ 1–6)

---

## 🔲 ค้าง — สาย SearchBar (follow-up เล็ก)

- [ ] **Segmented action bar** — จัดกลุ่มปุ่มรอง (advanced/clear/export) ใน segmented container · เลื่อนไว้จนกว่าปุ่มทุกหน้าเป็น ButtonGeneric ครบ
- [ ] **Visual verify** 11 หน้าแบบ chrome-mcp (ตอนนี้ verify ด้วยตาเฉพาะ customer/plan-tracking) — ติด login ในเบราว์เซอร์ที่ควบคุม
- [x] ~~ref เต็ม #3 (ปุ่ม label segmented)~~ — **ตัดสินไม่รับ** (คง icon-only ตาม #10)

---

## 🔲 ค้าง — Redesign program (playbook Phase 1) · component ที่ยังไม่ redesign เข้าโค้ด

ลำดับ impact สูง→ต่ำ (loop: ออกแบบ 3 ทาง → blueprint → map @ui-implementer → Decision Log):

- [ ] **token + ButtonGeneric** (มีแค่การ์ด doc บน Claude Design — ยังไม่ redesign โค้ดจริง)
- [ ] **InputTextGeneric / TextareaGeneric / FormFieldGeneric**
- [ ] **SectionCardGeneric** (impact สูง — ใช้ทุกหน้า form/detail)
- [ ] form controls: DropdownGeneric / MultiSelectGeneric / CalendarGeneric / CheckboxGeneric / RadioGroupGeneric / AutoCompleteGeneric
- [ ] **DataTableWithPaging** (ตารางทุกหน้า list — คู่กับ SearchBar ที่ทำแล้ว → หน้า list ครบชุด) ⭐ แนะนำทำต่อ
- [ ] modal-view / DrawerGeneric / DialogSearchView
- [ ] media/พิเศษ: ImagePreview / UploadImage / MultiImageUpload / GalleryView / StepperStatus / HorizontalBarChart

## 🔲 ค้าง — Phase 2 Archetypes (ประกอบ component ที่ approve)

- [ ] List page (ทำ SearchBar แล้ว รอ DataTable)
- [ ] Create / Edit
- [ ] Detail / Dashboard
- [ ] Modal form

## 🔲 ค้าง — Phase 4 Mobile (`/mobile/*` layout แยก) — รอบท้าย

---

## 🔲 ค้าง — Claude Design DS (housekeeping)

- [ ] ลบ project เก่า **"Design System"** (ว่างเปล่า) บน claude.ai/design
- [ ] การ์ด **Explore · SearchBar (A/B/C)** — เก็บเป็น history หรือลบ
- [ ] เพิ่ม component card ที่เหลือ (ตอนนี้มีแค่ button + page-header; อีก ~24 ตัว) ถ้าจะ document DS ให้ครบ

## 🔲 ค้าง — Infra

- [ ] `design-system-mcp` remote connector สำหรับ claude.ai (ตอนนี้ stdio/Claude Code เท่านั้น) — **gate**: เทสต์ว่า Claude Design Beta รับ custom connector ได้ไหม
- [ ] **push** branch `redesign/search-bar` (6 commits) — รอสั่ง "push"

---

## ⚠️ หมายเหตุ — WIP ของ user (ไม่ใช่งาน redesign · ห้ามแตะ/commit)

ค้างใน working tree (uncommitted): `sale/invoice-detail/*`, `invoice-pdf-*`, `language/view/sale/*`, `.claude/settings.json` (sensitive), `graphify-out/`, `public/graph-*.html`
