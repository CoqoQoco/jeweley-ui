# Refactor Migration Tracker

**State file หลักของ migration loop** — อ่านก่อนทุก iteration, อัปเดตหลังทำเสร็จ

---

## Baseline Metrics (Phase 0.8)

| Metric | จำนวน | รายละเอียด |
|---|---|---|
| **ESLint warnings** | **287** | no-restricted-imports 270, no-alert 8, table 9 |
| **Stylelint warnings** | **1282** | hardcode-color (ห้าม hex สีตรงๆ) |

### ESLint Breakdown (no-restricted-imports 270)

| Rule | จำนวน |
|---|---|
| Dropdown import ตรงๆ | 78 |
| DataTable import ตรงๆ | 67 |
| Calendar import ตรงๆ | 60 |
| AutoComplete import ตรงๆ | 31 |
| MultiSelect import ตรงๆ | 15 |
| Dialog import ตรงๆ | 10 |
| Checkbox import ตรงๆ | 9 |

**เป้าหมาย**: ลดทุก iteration จนเป็น 0 → เลื่อน rule เป็น `error`

---

## Priority Order

**Pilot แรก = `catalog`** (0 native imports — ตรวจสอบ pattern ก่อนขยาย)

ลำดับ: master/* → catalog → customer → stock → receipt-stock → production/* → sale/* → mobile/*

---

## Module Checklist

| Module | สถานะ | design-token | generic | i18n | cleancode | native เหลือ | หมายเหตุ |
|---|---|---|---|---|---|---|---|
| **master/diamond-grade** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | native→generic ✅, i18n ✅, composables ✅, design-token ✅, cleancode ✅ |
| **master/gem** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | native→generic ✅, i18n ✅, composables ✅, design-token ✅, cleancode ✅ |
| **master/gem-shape** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | native→generic ✅, i18n ✅, composables ✅, design-token ✅, cleancode ✅ |
| **master/gold-size** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | native→generic ✅, i18n ✅, composables ✅, design-token ✅, cleancode ✅ |
| **master/productType** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | native→generic ✅, i18n ✅, composables ✅, design-token ✅, cleancode ✅ |
| **master/zill** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | native→generic ✅, i18n ✅, composables ✅, design-token ✅, cleancode ✅ |
| **catalog** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | **Pilot แรก** — reference implementation; native→generic ✅, i18n ✅, composables ✅, design-token ✅, cleancode ✅ |
| **customer** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | native→generic ✅, i18n ✅, composables ✅, design-token ✅, cleancode ✅ |
| **dashboard** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | |
| **stock/gem** | ✅ | ✅ | ✅ | ⬜ | ✅ | 0 | AutoComplete/Dropdown/MultiSelect/DataTable→generic; dataTablePaging mixin; confirmThenSubmit; cleancode; 1 known lint warning (cost-detail-modal ColumnGroup exception) |
| **stock/location** | ✅ | ✅ | ✅ | ⬜ | ✅ | 0 | CheckboxGeneric, dataTablePaging mixin, confirmThenSubmit, design token badges |
| **stock/move-location** | ✅ | ✅ | ✅ | ⬜ | ✅ | 0 | MultiSelect→MultiSelectGeneric (4 instances), dataTablePaging mixin, btn-primary→btn-green, badge token |
| **stock/product** | ✅ | ✅ | ✅ | ⬜ | ✅ | 0 | Dropdown→DropdownGeneric (update-view), dataTablePaging mixin, confirmThenSubmit, Dialog→ModalView (cost-detail/cost-history modals), MultiSelect→MultiSelectGeneric (search-view), cleancode |
| **receipt-stock/gem** | ✅ | ✅ | ✅ | ✅ | ✅ | 6* | gem sub-feature: 13 ไฟล์ migrate ครบ; *6 ไฟล์ที่เหลือ primevue เป็น exception (ColumnGroup footer ซับซ้อน): inbound/DataTableView, outbound/DataTableView, pick-off/DataTableView, PickReturnAndOutbound, PickReturnAndOutboundExpand, data-expand-view |
| **receipt-stock (other)** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | gr-production/new-gr-production ครบ: materials-section + adjust-breakdown-view migrate ครบ |
| **mold** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 23 | |
| **production-cost** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 24 | |
| **production/plan-update** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 99 | ไฟล์ยักษ์ — แตก component |
| **production/plan-view** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 32 | |
| **production/plan-tracking-gold** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 15 | |
| **production/plan-tracking** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 8 | |
| **production/mold** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 8 | |
| **production/plan-bom** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 4 | |
| **production/plan-create** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 7 | |
| **production/plan-gold** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 7 | |
| **production/plan-price** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 7 | |
| **production (อื่นๆ)** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | รวม pre-plan, dashboard, tracking-worker ฯลฯ |
| **sale/sale-order** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 22 | sale-order-view.vue 3,933 บรรทัด — แตก component |
| **sale/cost-stock** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 12 | |
| **sale/invoice-detail** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 10 | |
| **sale/quotation** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 11 | |
| **sale/production-order** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 7 | |
| **sale/stock-reservation** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 7 | |
| **sale/quotation-list** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 2 | |
| **sale/saleorder-list** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 3 | |
| **sale (อื่นๆ)** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | delivery-note, invoice, payment-tracking ฯลฯ |
| **worker** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 8 | |
| **setting** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 5 | |
| **report-production** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 3 | |
| **report-production-gold-cost** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 5 | |
| **report-production-wages** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 2 | |
| **mobile/sale** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | |
| **mobile/tasks** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | |
| **mobile/quotation** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | |
| **mobile (อื่นๆ)** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | scan, dashboard, profile, notifications |
| **admin** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | |
| **login** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 1 | |

### คำอธิบาย Column

| Column | ความหมาย |
|---|---|
| **design-token** | ✅ เมื่อใช้ `var(--*)` แทน hardcode hex/px ทั้งหมด |
| **generic** | ✅ เมื่อไม่มี native input/button/table หรือ PrimeVue ตรงๆ |
| **i18n** | ✅ เมื่อไม่มี hardcode ข้อความไทยในโค้ด |
| **cleancode** | ✅ เมื่อลบ console.log / dead code / commented import ออกแล้ว |
| **native เหลือ** | จำนวน `from 'primevue/...` import ตรงๆ ใน module (signal ของ priority) |

---

## Iteration Log

| วันที่ | Module | ผลลัพธ์ | ESLint ลด | Stylelint ลด |
|---|---|---|---|---|
| 2026-06-16 | catalog | ✅ Pass | 0 (ไม่มี native PrimeVue import ตั้งต้น) | ลด hardcode px/สี ใน SCSS |
| 2026-06-16 | customer | ✅ Pass | 1→0 (Dropdown import ตรงๆ) | ลด hardcode px/สี ใน SCSS |
| 2026-06-16 | master/* (diamond-grade, gem, gem-shape, gold-size, productType) | ✅ Pass | 0 warnings ใน master/* | ลบ hardcode ไทย/px/inline-style ทั้งหมด |
| 2026-06-16 | master/zill + InputTextGeneric props + gold-size goldPercent fix | ✅ Pass | 0 warnings ใน master/zill | native→generic, Dropdown→DropdownGeneric, dataTablePaging mixin, i18n, cleancode |
| 2026-06-16 | stock/* (gem, location, move-location, product, product/cost) | ✅ Pass | ลด ~23 restricted-import warnings | AutoComplete/Dropdown/MultiSelect/DataTable→generic wrappers; Dialog→ModalView; CheckboxGeneric; dataTablePaging mixin; confirmThenSubmit; cleancode (remove console.log/isLoading/try-catch); design token badge colors; btn-primary/btn-secondary→valid classes; 1 known exception: cost-detail-modal ColumnGroup |
| 2026-06-17 | receipt-stock (partial — search/data-table/modal) | 🔄 Partial | ลด 9 errors (56→47 ใน receipt-stock); 365→356 total | Calendar/MultiSelect/Input→generic (search-views ทุกกลุ่ม); dataTablePaging mixin (data-table-views); Dialog→ModalView+DropdownGeneric (edit-all-materials); formatISOString/api/get unused imports removed; StockSummaryCards unused removed; console.log/try-catch dashboard; stock-details Dropdown→DropdownGeneric; common.label.start/end เพิ่ม |
| 2026-06-17 | receipt-stock/gem (13 ไฟล์ครบ) | ✅ Pass | ลด ~20 native PrimeVue imports; gem sub-feature ครบ 100% | Dropdown→DropdownGeneric, Calendar→CalendarGeneric, AutoComplete→AutoCompleteGeneric, Checkbox→CheckboxGeneric, input→InputTextGeneric, textarea→TextareaGeneric; remove try-catch/isLoading/console.log; named imports sweetAlerts; i18n keys เพิ่ม inbound/outbound/pickOff/pickReturnAndOutbound/create sections; 6 ไฟล์ยังคง primevue DataTable/Column/ColumnGroup เป็น exception (ColumnGroup footer ซับซ้อน) |
| 2026-06-17 | receipt-stock/product (2 ไฟล์สุดท้าย) | ✅ Pass | 0 native PrimeVue imports เหลือใน receipt-stock/product | materials-section: Dropdown→DropdownGeneric, input→InputTextGeneric, remove dead btn-outline-primary/secondary SCSS, design token; adjust-breakdown-view: Dropdown→DropdownGeneric, input→InputTextGeneric, swAlert default→named imports, btn-danger/primary/success/secondary→valid classes, console.log removed, stockColumns/breakdownColumns→computed (i18n), SCSS hardcode→design tokens |
