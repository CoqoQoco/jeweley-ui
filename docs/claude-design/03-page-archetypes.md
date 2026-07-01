# 03 · Page Archetypes — Wireframe Spec

> **วัตถุประสงค์**: layout มาตรฐาน 5 แบบที่ทุกหน้าในระบบ "เข้าพวก" — redesign archetype = ครอบหน้าจำนวนมากพร้อมกัน
> แต่ละ archetype มี wireframe + รายการ component ที่ประกอบ · source: `docs/design-system.md`, skill `ui-layout`
>
> ใช้ frame เหล่านี้เป็น input ของ Project บน Claude Design (1 archetype = 1 wireframe project)

---

## A. List / Search Page (พบมากสุด)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  filter-container-searchBar                                                     │
│  ┌─ pageTitle: <ชื่อหน้า> ─────────────────────────────────────────────────┐  │ ส่วน 1: title + description + border main
│  │  <description สั้นๆ ของหน้า>                                              │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │  สถานะ              ประเภท              ช่วงวันที่                          │  │ ส่วน 2: filter fields (grid auto-fit)
│  │  [▼ เลือกหลายค่า▾]   [▼ เลือกหลายค่า▾]   [📅____ - 📅____]                 │  │   filter = MultiSelectGeneric (chip)
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │  [bulk action ◀ซ้าย]                  [📖][🔍][✖][⬇][➕] ◀ขวา icon-only │  │ ส่วน 4: action bar space-between
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌─ DataTableWithPaging ────────────────────────────────────────────────────┐  │
│  │  เลขที่ │ ชื่อ │ ประเภท │ สถานะ │ วันที่ │  การดำเนินการ                  │  │  header
│  │  ───────┼──────┼────────┼───────┼────────┼────────────────                │  │
│  │  …rows…                                              [👁][✏][🗑]           │  │  row + action icons
│  │  ───────────────────────────────────────────────────────────────────────  │  │
│  │  รวม N รายการ                                  ◀ ‹ 1 2 3 › ▶  paginator   │  │  footer + paging
│  └────────────────────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────────────────┘
```
- **Components**: `SearchBarGeneric` (`<pageTitle>` + `MultiSelectGeneric` + `ButtonGeneric` icon-only) + `DataTableWithPaging`
- **Rules**: ปุ่ม action bar icon-only + tooltip · filter = MultiSelect array · มี `description` เสมอ · ปุ่มเรียง search→advanced→clear→export→create
- **States ที่ต้อง design**: empty table, loading, paging, sorted column, row hover

---

## B. Create / Edit Page

```
╔══════════════════════════════════════════════════════════════════════════════╗
║ (←)  สร้าง/แก้ไข <ชื่อ>                                         [ปุ่มรอง คู่มือ]║  PageHeaderGeneric (filled bg main)
╚══════════════════════════════════════════════════════════════════════════════╝
  ┌─ Box 1 · ข้อมูลหลัก (border + title) ─────────────────────────────────────┐
  │  Label A *        Label B *        Label C                                  │  form-row-grid(n)
  │  [________]       [▼ ______]       [________]                               │  ≤1024px ยุบ 1 col
  │  Label D (full width)                                                       │
  │  [__________________________________________________]                       │
  └────────────────────────────────────────────────────────────────────────────┘
  ┌─ Box 2 · กลุ่ม logic 2 (border + title) ──────────────────────────────────┐
  │  <fields / upload / ตารางย่อย>                                              │
  └────────────────────────────────────────────────────────────────────────────┘
                                              [ ยกเลิก ]   [ 💾 บันทึก ]  footer นอก box ชิดขวา
```
- **Components**: `PageHeaderGeneric` (+`#actions`) · หลาย `SectionCardGeneric` · `FormFieldGeneric`+input/dropdown · footer `ButtonGeneric` (มี label)
- **Rules**: multi-box แยกตาม logic · label แหล่งเดียว · primary ขวาสุด เว้น `ml-2` · token-only
- **ref จริง**: `src/views/ticket/create-view.vue` (baseline)

---

## C. Detail / View Page

```
╔══════════════════════════════════════════════════════════════════════════════╗
║ (←)  <เลขเอกสาร / ชื่อ>                            [⬇ PDF][⬇ Excel][🖨 พิมพ์] ║  PageHeaderGeneric + actions
╚══════════════════════════════════════════════════════════════════════════════╝
  ┌─ StepperStatus: ● ร่าง ─── ● อนุมัติ ─── ○ เสร็จ ──────────────────────────┐ (ถ้ามี flow)
  └────────────────────────────────────────────────────────────────────────────┘
  ┌─ ข้อมูลเอกสาร (read-only) ──────┐  ┌─ สรุป/ยอดรวม (zone teal) ─────────────┐
  │  ฟิลด์: ค่า   ฟิลด์: ค่า         │  │  รวม ฿ xxx   (--color-green-bg)        │
  └─────────────────────────────────┘  └────────────────────────────────────────┘
  ┌─ รายการ (DataTableWithPaging read-only) ──────────────────────────────────┐
  └────────────────────────────────────────────────────────────────────────────┘
```
- **Components**: `PageHeaderGeneric`+actions · `StepperStatus` (flow) · `SectionCardGeneric` · `DataTableWithPaging` · zone สรุปใช้ `--color-green-bg`
- **States**: ต่อสถานะเอกสาร (ร่าง/อนุมัติ/ยกเลิก) ปุ่มที่แสดงต่างกัน

---

## D. Dashboard Page

```
┌─ KPI ─────────┐ ┌─ KPI ─────────┐ ┌─ KPI ─────────┐ ┌─ KPI ─────────┐
│  ตัวเลขใหญ่    │ │  ตัวเลขใหญ่    │ │               │ │               │   การ์ดสรุป (grid)
│  label เล็ก    │ │  ▲ +12%       │ │               │ │               │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
┌─ HorizontalBarChart / กราฟ ────────┐ ┌─ ตารางสรุป (DataTable) ─────────────┐
│                                     │ │                                      │
└─────────────────────────────────────┘ └──────────────────────────────────────┘
```
- **Components**: KPI card (`SectionCardGeneric` หรือ card ใหม่) · `HorizontalBarChart` · `DataTableWithPaging`
- **หมายเหตุ**: ถ้ามี KPI card ซ้ำหลายที่ → พิจารณาสร้าง generic `StatCard` ใหม่ (Reusable first)

---

## E. Modal Form

```
╔════════════════════════════════════════════════════════════════════╗
║  <หัวข้อ Modal>                                       (ขาว)   [ ✕ ] ║  headerVariant="main" (filled)
╠════════════════════════════════════════════════════════════════════╣
│  ┌─ ข้อมูลหลัก ─────────────────────────────────────────────────┐  │
│  │  field    field                                                │  │  SectionCardGeneric ต่อกลุ่ม
│  └────────────────────────────────────────────────────────────────┘
│  ┌─ ช่องทางติดต่อ ──────────────────────────────────────────────┐  │
│  │  [☎ ___]   [✉ ___]   (InputTextGeneric :icon)                  │  │
│  └────────────────────────────────────────────────────────────────┘
├──────────────────────────────────────────────────────────────────────┤
│                                          [ ยกเลิก ]   [ 💾 บันทึก ]   │  #action slot (นอกกล่อง)
└──────────────────────────────────────────────────────────────────────┘
```
- **Components**: `modal-view` (`headerVariant="main"`) · หลาย `SectionCardGeneric` (`.modal-section`) · footer ใน `#action`
- **ref จริง**: `src/views/customer/list-customer/modal/create-view.vue`
- **ขนาด**: form เล็ก 500–600px · กลาง 700–900px · ตาราง 1000–1200px

---

## Responsive (ทุก archetype)

- breakpoint **1024px**: 2-col → 1-col, 4-col → 2-col · ใช้ `form-row-grid` / utility class ห้ามเขียน media query เอง
- ปุ่มกลุ่มใช้ `responsive-btn-group` · ตารางใช้ `responsive-table-wrapper` (scroll แนวนอน)
- Mobile (`/mobile/*`) = layout คนละชุด (ดู skill `mobile-dev`) — รอบนี้ยังไม่ทำ
