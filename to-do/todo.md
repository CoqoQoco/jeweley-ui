# TODO — jeweley-ui Redesign (Claude Design program)

> อัปเดตล่าสุด: 2026-07-01 · branch งาน: `redesign/search-bar` (ยังไม่ push)
> อ้างอิง: `docs/claude-design/` (playbook `04`, blueprints/), `docs/design-system.md` (Decision Log)
> กติกา: redesign ที่ shared component (token + generic) → propagate ทุกหน้า · map เข้าโค้ดผ่าน `@ui-implementer` เท่านั้น · ทุก design ที่ approve ต้องมี **blueprint** ก่อน map
>
> **วิธีอ้างอิงงาน**: ใช้รหัสในวงเล็บ เช่น "ทำ RD-05" = redesign DataTableWithPaging

---

## ✅ DONE — SB-0 · SearchBar (สาย list search)

- filled header (พื้น main + icon + description) · full-bleed · responsive (self-contained ไม่พึ่ง legacy scss)
- input focus ring · MultiSelect chip = outline teal · dot texture ใน header
- slot `#header-actions` (มุมขวาบน, หลายปุ่ม width เท่ากัน, default btn-green) — ปุ่ม create ย้ายเข้า header
- หลักการ #10 ปรับ: primary search มี label ได้ / ปุ่มรอง icon-only
- **propagate 11 หน้า**: customer, master×6 (zill/productType/gold-size/gem/gem-shape/diamond-grade), catalog, plan-order-tracking (migrate แล้ว), ticket×2 (ไม่มีปุ่ม create)
- blueprint: `docs/claude-design/blueprints/search-bar.md` (Refinement รอบ 1–6)

---

## 🔲 SB · SearchBar follow-up (เล็ก)

- [ ] **SB-1 · Segmented action bar** — จัดกลุ่มปุ่มรอง (advanced/clear/export) ใน segmented container · เลื่อนจนกว่าปุ่มทุกหน้าเป็น ButtonGeneric ครบ
- [ ] **SB-2 · Visual verify 11 หน้า** — ตรวจด้วย chrome-mcp (ตอนนี้ดูด้วยตาเฉพาะ customer/plan-tracking) · ติด login ในเบราว์เซอร์ที่ควบคุม
- [x] ~~**SB-3 · ref เต็ม (ปุ่ม label segmented)**~~ — ตัดสิน **ไม่รับ** (คง icon-only ตาม #10)

---

## 🔲 RD · Redesign components (playbook Phase 1) — ยังไม่ redesign เข้าโค้ด

ลำดับ impact สูง→ต่ำ · loop: ออกแบบ 3 ทาง → blueprint → map @ui-implementer → Decision Log

- [ ] **RD-01 · Token + ButtonGeneric** — มีแค่การ์ด doc บน Claude Design ยังไม่ redesign โค้ดจริง
- [ ] **RD-02 · Input / Textarea / FormField** — InputTextGeneric, TextareaGeneric, FormFieldGeneric
- [ ] **RD-03 · SectionCardGeneric** — impact สูง ใช้ทุกหน้า form/detail
- [ ] **RD-04 · Form controls** — Dropdown / MultiSelect / Calendar / Checkbox / Radio / AutoComplete
- [ ] **RD-05 · DataTableWithPaging** ⭐ — ตารางทุกหน้า list, คู่กับ SearchBar → หน้า list ครบชุด · **แนะนำทำต่อ**
- [ ] **RD-06 · Overlay** — modal-view / DrawerGeneric / DialogSearchView
- [ ] **RD-07 · Media & พิเศษ** — ImagePreview / UploadImage / MultiImageUpload / GalleryView / StepperStatus / HorizontalBarChart

## 🔲 AR · Archetypes (Phase 2 — ประกอบ component ที่ approve)

- [ ] **AR-1 · List page** — ทำ SearchBar แล้ว รอ DataTable (RD-05)
- [ ] **AR-2 · Create / Edit**
- [ ] **AR-3 · Detail / Dashboard**
- [ ] **AR-4 · Modal form**

## 🔲 MB · Mobile (Phase 4 — `/mobile/*` layout แยก) — รอบท้าย

- [ ] **MB-1 · Mobile redesign** — ยกชุด design system เข้า mobile layout

---

## 🔲 CD · Claude Design DS (housekeeping)

- [ ] **CD-1 · ลบ project เก่า "Design System"** (ว่างเปล่า) บน claude.ai/design
- [ ] **CD-2 · จัดการการ์ด Explore · SearchBar (A/B/C)** — เก็บเป็น history หรือลบ
- [ ] **CD-3 · เพิ่ม component card ที่เหลือ** — ตอนนี้มีแค่ button + page-header (อีก ~24 ตัว) ถ้าจะ document DS ครบ

## 🔲 IN · Infra

- [ ] **IN-1 · design-system-mcp remote connector** สำหรับ claude.ai (ตอนนี้ stdio/Claude Code เท่านั้น) — gate: เทสต์ว่า Claude Design Beta รับ custom connector ได้ไหม
- [ ] **IN-2 · push** branch `redesign/search-bar` — รอสั่ง "push"

---

## ⚠️ WIP-USER · งานของ user (ไม่ใช่ redesign · ห้ามแตะ/commit)

ค้างใน working tree (uncommitted): `sale/invoice-detail/*`, `invoice-pdf-*`, `language/view/sale/*`, `.claude/settings.json` (sensitive), `graphify-out/`, `public/graph-*.html`
