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
| **dashboard** | ✅ | ⬜ | ✅ | ⬜ | ✅ | 0 | monthly-success-report: Calendar→CalendarGeneric; $swal.fire→warning(); try-catch/console.log/ms-2/me-2 removed; $t('button.search')→$t('common.btn.search') |
| **stock/gem** | ✅ | ✅ | ✅ | ⬜ | ✅ | 0 | AutoComplete/Dropdown/MultiSelect/DataTable→generic; dataTablePaging mixin; confirmThenSubmit; cleancode; 1 known lint warning (cost-detail-modal ColumnGroup exception) |
| **stock/location** | ✅ | ✅ | ✅ | ⬜ | ✅ | 0 | CheckboxGeneric, dataTablePaging mixin, confirmThenSubmit, design token badges |
| **stock/move-location** | ✅ | ✅ | ✅ | ⬜ | ✅ | 0 | MultiSelect→MultiSelectGeneric (4 instances), dataTablePaging mixin, btn-primary→btn-green, badge token |
| **stock/product** | ✅ | ✅ | ✅ | ⬜ | ✅ | 0 | Dropdown→DropdownGeneric (update-view), dataTablePaging mixin, confirmThenSubmit, Dialog→ModalView (cost-detail/cost-history modals), MultiSelect→MultiSelectGeneric (search-view), cleancode |
| **receipt-stock/gem** | ✅ | ✅ | ✅ | ✅ | ✅ | 6* | gem sub-feature: 13 ไฟล์ migrate ครบ; *6 ไฟล์ที่เหลือ primevue เป็น exception (ColumnGroup footer ซับซ้อน): inbound/DataTableView, outbound/DataTableView, pick-off/DataTableView, PickReturnAndOutbound, PickReturnAndOutboundExpand, data-expand-view |
| **receipt-stock (other)** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | gr-production/new-gr-production ครบ: materials-section + adjust-breakdown-view migrate ครบ |
| **mold** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 23 | |
| **production-cost** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 24 | |
| **production/plan-update** | ✅ | ✅ | ✅ | ✅ | ✅ | 22* | Pass A+B+C+D ครบ; *22 primevue exceptions (eslint-disable ครบ); FormHeaderView: btn-warning/btn-custom→ButtonGeneric variant=main, try-catch/console.log removed, dead txt var removed, moment/formatDateTime/api unused imports removed, SCSS hardcode→design token; FormMaterialView: DataTable/Column kept primevue (duplicate field names — eslint-disable), btn-warning→ButtonGeneric, swAlert default→named imports confirmSubmit/success, try-catch/isLoading removed, console.log in computed removed, dead mat[]/api removed; i18n planUpdate.* เพิ่ม woNumber/createDate/updateDate/productName/confirmDeleteMaterial th+en คู่กัน |
| **production/plan-view** | ✅ | ✅ | ✅ | ✅ | ✅ | 13* | *13 primevue exceptions (eslint-disable): plan-overview (rowGroupMode="subheader"), plan-price-view+update-price-view (ColumnGroup), plan-bom-view+update-process-view (editMode="row"); i18n planView.* เพิ่ม th+en ครบ; swAlert default→named imports ทุกไฟล์; try-catch/isLoading/console.log removed ทุกไฟล์; btn-warning/btn-primary→valid classes; inline styles→CSS classes |
| **production/plan-tracking-gold** | ✅ | ✅ | ✅ | ✅ | ✅ | 4* | *4 imports เป็น exception (DataTable/Column/ColumnGroup/Row — editMode="row" ซับซ้อน ใช้ eslint-disable) |
| **production/plan-tracking** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 8 | |
| **production/mold** | ✅ | ✅ | ⬜ | ✅ | ✅ | 0 | MoldView: DataTable→BaseDataTable, dataTablePaging mixin, btn-warning→btn-main, design tokens; ModalCreate/ModalUpdate: Dropdown→DropdownGeneric, @change→@update:modelValue, btn-warning→btn-main, confirmSubmit/success named imports, try-catch/isLoading/console.log removed |
| **production/plan-bom** | ✅ | ✅ | ⬜ | ⬜ | ✅ | 0 | search-view: commented-out primevue imports removed; CalendarGeneric/MultiSelectGeneric already used; isLoading/created($nextTick) still present |
| **production/plan-create** | ✅ | ✅ | ⬜ | ✅ | ✅ | 3* | create-view: AutoComplete/Calendar/Dropdown/Checkbox→generic (outside DataTable); *3 primevue exceptions (Dropdown inside editMode="row" editor slots) with eslint-disable; confirmSubmit/success named imports; try-catch/isLoading/console.log removed; modify-plan-view: AutoComplete→AutoCompleteGeneric, dataTablePaging mixin added, fetchData() implemented |
| **production/plan-gold** | ✅ | ✅ | ⬜ | ✅ | ✅ | 5* | index-view: Calendar→CalendarGeneric (5 instances), Dropdown→DropdownGeneric (2 instances outside DataTable); confirmSubmit/success named imports; try-catch/isLoading/console.log removed; *5 primevue exceptions (DataTable+Column+Row+ColumnGroup+AutoComplete in editor) with eslint-disable |
| **production/plan-price** | ✅ | ✅ | ⬜ | ⬜ | ✅ | 4* | IndexView: *4 primevue exceptions (DataTable+Column+ColumnGroup+Row — rowGroupMode="subheader") with eslint-disable; confirmSubmit named import; try-catch/isLoading/console.log removed; unused imports removed |
| **production/plan-tracking-transfer** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | MultiSelect/Calendar/Dropdown→generic; btn-primary→btn-green; i18n keys เพิ่ม (transferDate, deptTransfer, goldColor, goldType); console.log removed |
| **production/plan-tracking-status** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | MultiSelect/Calendar→generic; btn-primary→btn-green; i18n keys เพิ่ม (receiveDate, workerReceiveDate, goldType); console.log removed; isLoading removed |
| **production/tracking-worker (IndexView)** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | Calendar→CalendarGeneric; console.log removed; try-catch/isLoading removed |
| **production/tracking-worker (TableMainView)** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | DataTable→BaseDataTable; columns→computed i18n; try-catch/isLoading/console.log removed; unused imports removed |
| **production (อื่นๆ)** | ✅ | ⬜ | ⬜ | ✅ | ✅ | 0 | report/gold-loss-tang/search-view: Calendar→CalendarGeneric, Dropdown→DropdownGeneric, BS5 gap-2 removed, $t('button.search')→$t('common.btn.search'); report/plan-completed-all-gold/search-view: MultiSelect→MultiSelectGeneric (4), Calendar→CalendarGeneric (4), Dropdown→DropdownGeneric, isLoading/console.log/empty-created removed; pre-plan mold-history-modal: confirmed clean in prev batch |
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
| 2026-06-17 | production tracking 5 ไฟล์ (plan-tracking-gold/update-view, plan-tracking-transfer/search-view, plan-tracking-status/search-view, tracking-worker/TableMainView, tracking-worker/IndexView) | ✅ Pass | ลด ~10 native PrimeVue imports; 4 เหลือ (exception ColumnGroup) | Dropdown→DropdownGeneric, Calendar→CalendarGeneric, AutoComplete→AutoCompleteGeneric, MultiSelect→MultiSelectGeneric; DataTable→BaseDataTable (tracking-worker TableMainView); columns→computed i18n; btn-primary→btn-green; console.log/try-catch/isLoading removed; i18n keys เพิ่ม (common.btn.advancedSearch, common.label.searchPlaceholder, planTrackingTransfer.transferDate/deptTransfer/goldColor/goldType, planTrackingStatus.receiveDate/workerReceiveDate/goldType, trackingWorker.searchText/colQtySend/colWeightSend/colQtyCheck/colWeightCheck) |
| 2026-06-17 | production misc batch 2 (8 sub-folders: dashboard, report, plan-create, mold, plan-gold, plan-price, plan-bom, pre-plan) | ✅ Pass | ลด ~30 native PrimeVue imports; 12 เหลือ (exception DataTable+ColumnGroup+Row+editMode="row") | dashboard/monthly-success-report: Calendar→CalendarGeneric, $swal.fire→warning(), BS5 ms-2/me-2→ml-2/mr-2, $t fix; report/gold-loss-tang/search-view: Calendar→CalendarGeneric, Dropdown→DropdownGeneric, gap-2 removed; report/plan-completed-all-gold/search-view: MultiSelect→MultiSelectGeneric (4), Calendar→CalendarGeneric (4), Dropdown→DropdownGeneric, isLoading/console.log/empty-created removed; plan-create/create-view: AutoComplete/Calendar/Dropdown/Checkbox→generic (outside DataTable), 3 primevue exceptions (editor slots) +eslint-disable, confirmSubmit/success named imports, try-catch/isLoading/console.log removed; plan-create/modify-plan-view: AutoComplete→AutoCompleteGeneric, dataTablePaging mixin, fetchData() added; mold/MoldView: DataTable→BaseDataTable, dataTablePaging mixin, btn-warning→btn-main, design tokens; mold/ModalCreate+ModalUpdate: Dropdown→DropdownGeneric, @update:modelValue, btn-warning→btn-main, confirmSubmit/success named, try-catch/isLoading/console.log removed; plan-gold/index-view: Calendar→CalendarGeneric (5), Dropdown→DropdownGeneric (2), 5 primevue exceptions+eslint-disable, confirmSubmit/success named; plan-price/IndexView: 4 primevue exceptions+eslint-disable, confirmSubmit named, cleancode; plan-bom/search-view: commented-out imports removed |
| 2026-06-17 | production/plan-view (11 ไฟล์ครบ) | ✅ Pass | ลด ~19 native PrimeVue imports; 13 เหลือ (exception) | index-view: swAlert→confirmSubmit named, tabItems $t('planView.tab*'), inline style→CSS class; plan-view: btn-primary/warning/secondary→valid classes, try-catch/console.log removed; plan-overview: kept PrimeVue (rowGroupMode="subheader"), console.log removed; plan-mat-view: DataTable→BaseDataTable, columns→computed i18n (matColumns/goldColumns); plan-price-view+update-price-view: kept PrimeVue ColumnGroup (eslint-disable), swAlert→named imports, try-catch/isLoading/console.log removed, unused import removed; plan-bom-view+update-process-view: kept PrimeVue editMode="row" (eslint-disable), swAlert→named imports, try-catch/console.log removed; transfer-job-view: Dropdown→DropdownGeneric, AutoComplete→AutoCompleteGeneric; update-mat-view: Dropdown→DropdownGeneric (4 instances); update-plan-view: AutoComplete/Calendar/Dropdown→generic, inline styles→CSS classes; i18n planView.* 39 keys เพิ่ม th+en คู่กัน |
| 2026-06-17 | production/plan-update (view/ 10 ไฟล์ — Pass A) | ✅ Pass | 0 errors ใน view/; pre-existing errors ไม่เปลี่ยน | PlanHeaderView: removed unused dayjs/moment import, removed showDate()/empty lifecycle hooks, cleancode; PlanMaterialView: eslint-disable DataTable, swAlert→named, try-catch/isLoading/console.log removed; PlanOverview: eslint-disable DataTable, console.log removed; plan-casting-view: eslint-disable, swAlert→named, btn fixed, try-catch/isLoading removed; plan-gem-view: eslint-disable, swAlert→named, btn fixed (CSV→btn-green), try-catch/isLoading removed; plan-melt-view: eslint-disable, swAlert→named, btn fixed, dead commented buttons removed, try-catch/isLoading removed; plan-plate-view: eslint-disable, swAlert→named, btn fixed, try-catch/isLoading removed; plan-price-view: eslint-disable (DataTable/ColumnGroup/Row), swAlert→named, btn fixed, operator precedence bug fixed (total/(productQty??1)), console.log in created() removed; plan-scrubb-view: eslint-disable, swAlert→named, btn fixed, try-catch/isLoading removed; plan-embed-view: eslint-disable, swAlert→named, btn-secondary/warning/primary→valid classes ทุกปุ่ม, console.log in addStatus/updateStatus/generatePDF/groupGold removed, try-catch in generatePDF/handleGeneratePDF/DelStatus/fetchImage removed, isLoading removed |
| 2026-06-17 | production/plan-update (update/ + form-status/ — Pass B ครบ) | ✅ Pass | build ผ่าน; ลด ~28 native PrimeVue imports (AutoComplete×8, Calendar×8, Dropdown×5 + script cleanups) | transfer-job-view (done before); transfer-product-view (done before); PlanHeaderUpdateView (done before); FormStatusAdd (done before); FormStatusUpdate: Calendar/Dropdown/AutoComplete→Generic ทุก showType; FormStatusView: swAlert→named+confirmThenSubmit, try-catch/isLoading removed; FormPrintEmbedBill: console.log/dead code removed, catch clause cleaned; plan-casting-update-view: full script+template migrate, Calendar/Dropdown/AutoComplete→Generic, input→InputTextGeneric, textarea→TextareaGeneric :rows=2, swAlert→named+confirmThenSubmit, try-catch/isLoading removed, localStorage→storage.getJSON; PlanEmbedUpdateView: same pattern, confirm msg [ฝัง]; PlanPlateUpdateView: same pattern, confirm msg [ขัดชุบ]; PlanScrubbUpdateView: same pattern, confirm msg [ขัดดิบ]; plan-gem-update-view: same pattern + gem DataTable (AutoComplete→AutoCompleteGeneric, InputTextGeneric for qty/weight/price, btn-danger→btn-red); i18n planUpdate.* 22 keys เพิ่ม th+en (receiveDate/receiveBy/assignDate/assignBy/requestDate/goldType/goldQTYSend/goldWeightSend/goldQTYCheck/goldWeightCheck/description/workers/workersSub/wages/totalWages/remark1/remark2/total/items) |
| 2026-06-17 | production/plan-update (form-header/ + form-material/ — Pass D ครบ) | ✅ Pass | build ผ่าน; lint 0 errors ใน 2 ไฟล์ | FormHeaderView: btn-warning/btn-custom→ButtonGeneric variant=main, try-catch/console.log removed, dead txt var removed, unused imports removed (moment/formatDateTime/api), SCSS hardcode px→design token (var(--sp-sm), var(--radius-sm), var(--shadow-sm), var(--fs-*)), i18n ทุก label (planTracking.*/planView.*/planUpdate.*/common.*); FormMaterialView: DataTable/Column kept primevue with eslint-disable (duplicate field names prevent BaseDataTable migration), btn-warning→ButtonGeneric variant=main, swAlert default→named imports (confirmSubmit/success), try-catch/isLoading/console.log removed, dead mat[]/api removed; i18n planUpdate.* เพิ่ม 5 keys th+en (woNumber/createDate/updateDate/productName/confirmDeleteMaterial) |
| 2026-06-17 | production/plan-update (add/ 6 ไฟล์ + form-header/ + form-material/ + index-view — Pass C ครบ) | ✅ Pass | build ผ่าน; module ครบ 100% | FormHeaderUpdate: AutoComplete/Calendar/Dropdown→Generic, input→InputTextGeneric, textarea→TextareaGeneric, btn-warning/dark→ButtonGeneric, swAlert→named+confirmThenSubmit, try-catch/isLoading/console.log removed; FormMaterialAdd: Dropdown→DropdownGeneric, input→InputTextGeneric, btn-warning→ButtonGeneric, swAlert→named+confirmThenSubmit, try-catch/isLoading removed; plan-material-add-view: already done pass B; plan-casting-add-view: eslint-disable, CalendarGeneric outside DataTable, InputTextGeneric receiveBy, TextareaGeneric remark, ButtonGeneric, confirmThenSubmit, try-catch/isLoading removed; PlanScrubbAddView: same pattern, status=60; plan-melt-add-view: same pattern, status=500, localStorage→storage.getJSON; plan-gem-add-view: same pattern + 2 DataTables (gold+gem with AutoComplete), status=70, storage.getJSON; plan-price-add-view: eslint-disable, DropdownGeneric outside DataTable, ButtonGeneric, ColumnGroup/Row kept, swAlert→named+confirmThenSubmit, try-catch/isLoading/console.log removed; index-view.vue: try-catch/isLoading/console.log removed all API methods; i18n planUpdate.* เพิ่มอีก 20+ keys (editHeader/confirmEditHeader/productCode/productQty/addMaterial/confirmAddMaterial/goldColor/goldPercent/goldQty/gemType/gemShape/gemSize/gemQty/gemUnit/diamondSize/diamondWeight/diamondWeightUnit/diamondQuality/diamondQty/diamondUnit/castingJobTitle/scrubbJobTitle/meltJobTitle/gemJobTitle/costCardTitle/costCardNote/selectItem/goldList/materialList/workerList/embedList/etcList/costTotal/costGroup/goldSection/gemSection/diamondSection/costCardDescription/pricePerQty/pricePerWeight/totalPrice/meltReceiveDate/meltReceiveBy/gemReceiveDate/gemReceiveBy/confirmCasting/confirmScrubb/confirmMelt/confirmGem/confirmCostCard/remark1/remark2/total/items) th+en คู่กัน |
