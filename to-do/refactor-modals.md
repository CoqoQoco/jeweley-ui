# To-Do: Refactor Modal & Icon Input ทั้งระบบ

> Backlog สำหรับยก modal/form ทั้งระบบสู่มาตรฐานใหม่ (Modal Form Standard + Icon Input)
> สร้างเมื่อ 2026-06-25 · ทำแบบ loop ทีละ batch — ไม่แก้รวดเดียว

---

## 1. Goal & Reference

ยกทุก **form modal** และ **icon input** ทั้งระบบให้ตรงมาตรฐานที่สถาปนาไว้แล้วในงาน Customer:

| มาตรฐาน | ที่มา (source of truth) |
|---|---|
| Icon Input (prop `icon`) | `docs/design-system.md` § Icon Input · `design-system` skill |
| Modal Form Standard (title bar main + section boxes) | `docs/design-system.md` § Modal Form Standard |
| Reference implementation จริง | `src/views/customer/list-customer/modal/create-view.vue` |
| Base modal (prop `headerVariant`) | `src/components/modal/modal-view.vue` |

---

## 2. Track A — Icon Input Migration (26 ไฟล์)

**Pattern:** แทน manual input-group ด้วย prop `icon`

```vue
<!-- ❌ เดิม (icon ลอย/flex พัง) -->
<div class="input-group input-group-inner">
  <div class="input-group-append">
    <span class="input-group-text"><i class="bi bi-telephone-fill"></i></span>
  </div>
  <InputTextGeneric type="tel" v-model="form.tel" />
</div>

<!-- ✅ ใหม่ -->
<InputTextGeneric type="tel" icon="bi-telephone-fill" v-model="form.tel" />
```

### ไฟล์ที่ต้อง migrate (จัดกลุ่มตาม domain)

| Domain | ไฟล์ |
|---|---|
| production / plan-tracking | `production/plan-tracking/components/search-view.vue` · `plan-tracking-worker/components/search-view.vue` · `plan-tracking-gold/components/search-view.vue` · `plan-tracking-transfer/components/search-view.vue` · `plan-bom/components/search-view.vue` |
| production / อื่น ๆ | `production/tracking-worker/IndexView.vue` · `production/report/plan-completed-all-gold/components/search-view.vue` |
| receipt-stock (gr-production) | `receipt-stock/product/gr-production/index-view.vue` · `gr-production/modal/search-product-name-view.vue` · `gr-production/modal/image-select-view.vue` · `new-gr-production/index-view.vue` · `new-gr-production/modal/search-product-name-view.vue` · `new-gr-production/modal/image-select-view.vue` · `new-gr-production/components/fields/product-name-field.vue` |
| sale | `sale/quotation/components/search-view.vue` · `sale/quotation/modal/customer-create-modal.vue` · `sale/quotation/modal/customer-edit-modal.vue` · `sale/quotation/modal/edit-stock-view.vue` · `sale/sale-order/modal/customer-edit-modal.vue` · `sale/production-order/components/search-view.vue` |
| stock | `stock/product/image/components/create-view.vue` · `stock/product/image/components/image-view.vue` |
| report | `report-production/IndexView.vue` · `report-production-gold-cost/IndexView.vue` |
| generic component | `components/input/input-with-button.vue` · `components/custom/scan-input.vue` |

**รวม 26 ไฟล์ (grep)** — แต่จริง ๆ มีแค่ **11 ไฟล์** ที่เป็น *decorative icon* (✅ migrate แล้ว ดู Progress Log Track A 9a/9b). อีก **15 ไฟล์ ไม่ใช่ icon target**: 13 เป็น *input+button* (ปุ่ม search/submit/lookup/scan จริง) + 2 generic widget (`input-with-button`, `scan-input`) → grep จับเพราะใช้ `input-group` markup เหมือนกัน แต่แทนด้วย prop `icon` ไม่ได้ (จะเสียปุ่ม) → **ดู §8**

> regenerate: `grep -rl "input-group-append\|input-group-inner" src/ | grep -v ".scss"` (ระวัง: จับ input+button ปนมาด้วย — ต้องแยกเอง)

> ⚠️ SCSS legacy 3 ไฟล์ (`custom-style/standard-search-bar.scss`, `search-bar.scss`, `form-modal.scss`) — **ห้ามแก้** (legacy read-only) แค่เลิกพึ่ง เมื่อ migrate ครบจึงค่อยพิจารณาลบ rule

---

## 3. Track B — Modal Form Standard Migration

**Pattern ต่อไฟล์ (เฉพาะ form modal):**
1. `<modal headerVariant="main">` — title bar สี main + text/✕ ขาว
2. เอา `px-3 pt-3` ออกจาก title span (header มี padding เอง)
3. ครอบ field เป็นกลุ่ม logic ด้วย `<SectionCardGeneric :title="...">` (เว้นระหว่างกล่อง `var(--sp-lg)`)
4. ปุ่ม action ไว้ใน `#action` slot (footer นอกกล่อง)
5. icon input ใช้ prop `icon` (Track A)

**ขอบเขต:** เฉพาะ **form modal** (create / update / upsert) — **ไม่รวม**:
- confirm dialog (`*confirm*`, `cancel-reason`, `reject-reason`)
- PDF/print preview (`*pdf-preview*`, `*-print-*`, `barcode-*`)
- picker / search modal (`*-search-modal`, `*-picker-*`, `*-select-*`)
- manual/help modal (`manual-view`)

### กลุ่มเป้าหมายเด่น (จาก inventory ~134 modal)

| Domain | form modal (ตัวอย่าง) | ระดับ |
|---|---|---|
| master | `master/{zill,productType,gold-size,gem,gem-shape,diamond-grade}/modal/{create,update}-view.vue` (~12) | ง่าย (ทำก่อน) |
| worker | `worker/worker-list/modal/{create,update}-view.vue` | ง่าย |
| stock | `stock/product/list/modal/update-view.vue` · `stock/location/modal/upsert-view.vue` · `stock/gem/components/{create,update,price}-view.vue` | กลาง |
| mold | `mold/components/create/*` · `mold/mold-list/components/UpdateView.vue` · `production/mold/components/Modal{Create,Update}.vue` | กลาง |
| catalog | `catalog/modal/{create,update}-view.vue` | ง่าย |
| production-cost | `production-cost/goldCost/components/Form{Create,Update}.vue` | กลาง |
| production / plan-update | `production/plan-update/components/{add,update,form-*}/*` | ซับซ้อน (ทำท้าย) |
| production / pre-plan | `production/pre-plan/pre-plan-create/modal/item-form-modal.vue` | ซับซ้อน |
| sale / receipt-stock | form modal ใน `sale/*`, `receipt-stock/gem/*` (CreateView/ConfirmView) | ซับซ้อน |

> regenerate ลิสต์เต็ม: `grep -rl "modal/modal-view" src/` แล้วกรองเฉพาะไฟล์ที่เป็นฟอร์ม (create/update/upsert) ตามเกณฑ์ exclude ด้านบน

---

## 4. Migration Approach

- ทำแบบ **loop ทีละ domain / batch** (ตาม UI Refactor Program) — ไม่แก้รวดเดียวทั้งระบบ
- หรือใช้กฎ **"แตะหน้าไหน migrate หน้านั้น"** เมื่อมีงานในหน้านั้นอยู่แล้ว
- ลำดับแนะนำ (ง่าย → ซับซ้อน): **master → catalog → worker → stock → mold → production-cost → production/plan-update → sale/receipt-stock**
- แต่ละ batch:
  1. implement ผ่าน `@ui-implementer`
  2. `npm run lint` — ไฟล์ที่แก้ 0 error
  3. ตรวจ regress: form ยัง create/update/submit ได้ครบ; ช่อง icon แสดงถูก
  4. (option) chrome-devtools MCP — screenshot ก่อน/หลัง ตาม `chrome-mcp-testing` skill

---

## 5. Acceptance Criteria (ต่อไฟล์)

- [ ] ไม่มี `input-group` / `input-group-append` manual เหลือ — icon ผ่าน prop `icon`
- [ ] form modal: `headerVariant="main"` + field แบ่งกลุ่มด้วย `SectionCardGeneric` + footer ใน `#action`
- [ ] ไม่ hardcode สี/px — ใช้ token (`var(--sp-*)`, `var(--color-*)`, `var(--base-*)`)
- [ ] ไม่ hardcode ไทย — ใช้ `$t()` (เพิ่ม section label ใน i18n ถ้าจำเป็น)
- [ ] `npm run lint` ผ่าน · logic เดิมไม่ regress

---

## 6. Out of Scope / Cautions

- ❌ ห้ามแก้ logic / business flow — refactor layout/markup เท่านั้น
- ❌ ห้ามแตะ `src/assets/scss/custom-style/*.scss` (legacy read-only)
- ❌ non-form modal (confirm/preview/picker/manual) — **คงเดิม** ไม่ต้องใส่ header main / section boxes
- ⚠️ ทดสอบทุกไฟล์ก่อนปิด task — modal เก่าบางตัวมี markup เฉพาะตัว ต้องตรวจ regress ดี

---

## 7. Deferred Plan — modal ซับซ้อน/hybrid (ทำตอน "แตะหน้านั้น" + test เต็ม)

modal 2 ตัวนี้ **ไม่ใช่ create/update form ล้วน** มี interactive widget ที่เสี่ยง regress สูง → ข้ามจาก batch loop ปกติ ทำเมื่อมีงานในหน้านั้นจริงและ test ได้ครบ

### 7.1 `stock/product/list/modal/update-view.vue` (1200px) — เสี่ยงสุด
ส่วนประกอบ: image-upload stage machine (SHOW/SELECT + gallery `BaseDataTable`) · materials inline-edit `BaseDataTable` · custom gradient `section-header` (3 sections)
- **แนวทาง (เบา, แนะนำ):** เพิ่ม `headerVariant="main"` ที่ `<modal>` + ย้าย title span ตัด `px-3 pt-3` + แปลงปุ่ม footer raw → `ButtonGeneric` ใน `#action`. ส่วน field grid (mold/ชื่อ/qty/price/size/type/location) แปลงเป็น `FormFieldGeneric`+`InputTextGeneric`/`DropdownGeneric`
- **คงเดิม:** image stage, materials table, gradient `section-header` (ถ้าจะแปลงเป็น `SectionCardGeneric` ต้อง test รูป+materials หนัก) — หรือเลือกแปลงเฉพาะ "Product Information" section เป็น `SectionCardGeneric` ก็พอ
- **ห้ามแตะ:** logic image stage (`imageStage`, `fetchLatestImage`, `onSelect`), materials (`addMaterialItem`/`removeMaterialItem`/`getBarcode`), validation `isRequiredSizeField`
- **token cleanup:** scoped style มี hardcode สี/px เยอะ (`#7a0f0f`, gradient, `2rem`...) — แปลงเป็น token เมื่อทำ

### 7.2 `stock/gem/components/price-view.vue` — hybrid
ส่วนประกอบ: info panel ราคาปัจจุบัน (`filter-container-highlight`, ขาวบนพื้น highlight) · ฟอร์มราคาใหม่ (4 ช่อง) · ตารางประวัติราคา `BaseDataTable`
- **แนวทาง (เบา):** แปลงเฉพาะ "ฟอร์มราคาใหม่" (priceQty/price/unitCode/unit) → `FormFieldGeneric`+`InputTextGeneric`/`DropdownGeneric`, ปุ่ม "ปรับราคา" → `ButtonGeneric`. เพิ่ม `headerVariant="main"` ได้ถ้า title ย้ายมา `#title`
- **คงเดิม:** info panel + price history table (ไม่ใช่ form)
- **ห้ามแตะ:** `onbluePrice/onbluePriceQty` (toFixed logic), `initForm`, `fetchHistory`, validate `val.isUnit`

> ทั้ง 2 ไฟล์: ห้าม hardcode สี/px (ใช้ token), ห้าม hardcode ไทย ($t), `npm run lint` ผ่าน, test create/update/ปรับราคา + รูป/ตาราง ไม่ regress

### 7.3 mold stage modals (7 ไฟล์) — heavy + ต้อง i18n migration
ต่างจาก master/worker: เป็น **stage/status form** ที่มี widget เยอะ + **hardcode ไทยเต็ม** (ยังไม่ i18n) → ต้องเพิ่ม key namespace ใหม่ทั้ง th/en ก่อน ถึงทำ layout standard ได้

ไฟล์:
- `mold/components/create/{CastingView,CastingOfSilverView,CuttingView,ResinView,StoreView,new-store-view}.vue` (6) — แต่ละตัว: `stepperStatus` ด้านบน + info panel `filter-container-highlight` (moldCode/updateDate, ขาวบนพื้น) + `uploadImages` widget + raw input ป้ายไทย + ปุ่ม submit ไทย + ใช้ `swAlert.confirmSubmit` (ไม่ใช่ `confirmThenSubmit`)
- `mold/mold-list/components/UpdateView.vue` (1) — partially i18n; มี dual image upload + info highlight panel + hardcode ไทยบางจุด ("เเก้ไข", "รูปที่ 1/2", "ไม่มีรูปภาพ")

แนวทางเมื่อทำ (ต่อไฟล์):
1. **i18n ก่อน:** ย้าย hardcode ไทยทุกจุด → `$t()` เพิ่ม key ใน namespace ของ mold (เช่น `view.mold.create.*`) ทั้ง th + en — ตาม `i18n-system` skill
2. layout standard: `headerVariant="main"` + title → `#title` slot · raw input → `FormFieldGeneric`+`InputTextGeneric`/`TextareaGeneric` · ปุ่ม → `ButtonGeneric` ใน `#action` (เพิ่ม form id)
3. **คงเดิม:** `stepperStatus`, `uploadImages`/dual image upload widget, info `filter-container-highlight` panel (ไม่ใช่ field form), `swAlert.confirmSubmit` logic, FormData/API
4. field group → `SectionCardGeneric`; token-only; lint ผ่าน; test แต่ละ stage submit + upload รูป ไม่ regress

> ⚠️ งานนี้ใหญ่กว่า batch ปกติเพราะรวม i18n migration — แยกทำทีละ stage, test ทุกตัว

### 7.4 production/plan-update + pre-plan (Batch 7) — ซับซ้อนสุด, ทำท้าย
form modal ~19 ตัว (ไม่รวม `view/*` ที่เป็น read-only):
- `plan-update/components/add/*` (6): PlanScrubbAddView · plan-{casting,gem,material,melt,price}-add-view
- `plan-update/components/update/*` (8): Plan{Embed,Header,Plate,Scrubb}UpdateView · plan-{casting,gem}-update-view · transfer-{job,product}-view
- `plan-update/components/{form-header/FormHeaderUpdate, form-material/FormMaterialAdd, form-status/FormStatusAdd, form-status/FormStatusUpdate}` (4)
- `pre-plan/pre-plan-create/modal/item-form-modal.vue` (1) — ใช้ child section component (moldSection/material-table/UploadImage) + hardcode ไทย

ลักษณะร่วม (เหมือน §7.3): title `title-text-lg-header` ใน content · editable `DataTable` raw PrimeVue + hardcode ไทย (placeholder "เลือกทอง" ฯลฯ) · `line` divider · manual label `title-text` · บางตัว mix `$t` + hardcode ไทย

แนวทาง (ต่อไฟล์, ทำทีละตัว + test):
1. **i18n ก่อน:** hardcode ไทย → `$t()` (รวม placeholder/header ใน DataTable) เพิ่ม key namespace `planUpdate.*` / pre-plan
2. layout standard: `headerVariant="main"` + title → `#title` · manual label → `FormFieldGeneric` · ปุ่ม → `ButtonGeneric` `#action` (form id)
3. **คงเดิม:** editable DataTable + row-edit logic, child section components (moldSection ฯลฯ), UploadImage, validation `val.*`, FormData/API
4. field group → `SectionCardGeneric`; token-only; lint ผ่าน; test add/update + แก้แถวตาราง + upload ไม่ regress

### 7.5 sale / receipt-stock form modal (Batch 8) — ซับซ้อน
ยังไม่ inventory ละเอียด — ก่อนทำ regenerate: `grep -rl "modal/modal-view" src/views/sale src/views/receipt-stock` แล้วกรอง create/update/upsert (exclude confirm/print/pdf/search/picker ตาม §3). คาดว่าหลายตัวมี DataTable + hardcode ไทย → ทำแบบเดียวกับ §7.4 (i18n ก่อน + คง widget)

---

## 8. Follow-up — input+button widgets (ไม่ใช่ Track A icon)

15 ไฟล์ที่ grep `input-group` จับได้ แต่ **ไม่ใช่ decorative icon** → prop `icon` แทนไม่ได้ เพราะ append เป็นปุ่มจริง:

**input+button (13):** `sale/quotation/components/search-view.vue` · `sale/production-order/components/search-view.vue` · `sale/quotation/modal/edit-stock-view.vue` · `stock/product/image/components/{create,image}-view.vue` · `receipt-stock/product/{gr-production,new-gr-production}/index-view.vue` · `.../{gr-production,new-gr-production}/modal/search-product-name-view.vue` · `.../{gr-production,new-gr-production}/modal/image-select-view.vue` · `new-gr-production/components/fields/product-name-field.vue`
- append = `<button>` search/submit/lookup/scan จริง → คงไว้ได้ หรือ migrate ไปใช้ generic `components/input/input-with-button.vue` เพื่อเลิก manual `input-group`

**generic widget (2):** `components/input/input-with-button.vue` · `components/custom/scan-input.vue`
- เป็น "ตัวต้นแบบ" input+button เอง (slot/`@btn-click`/scan logic) → ไม่ใช่ icon target. ถ้า cleanup: ใช้ `InputTextGeneric` ข้างใน + ปุ่มแยก — งานแยก ไม่อยู่ใน scope icon

> acceptance "ไม่มี manual input-group เหลือ" จะปิดได้ต่อเมื่อทำ §8 — track แยกจาก swap prop `icon`

---

## Progress Log

| วันที่ | Batch | ไฟล์ | สถานะ |
|---|---|---|---|
| 2026-06-25 | reference | `customer/list-customer/modal/create-view.vue` | ✅ done (ต้นแบบ) |
| 2026-06-26 | master | `master/{zill,productType,gold-size,gem,gem-shape,diamond-grade}/modal/{create,update}-view.vue` (12) | ✅ done — headerVariant=main + SectionCardGeneric, lint 0 error |
| 2026-06-26 | catalog | `catalog/modal/{create,update}-view.vue` (2) | ✅ done — headerVariant=main + SectionCardGeneric, lint 0 error |
| 2026-06-26 | worker | `worker/worker-list/modal/{create,update}-view.vue` (2) | ✅ done — normalize→generic + headerVariant=main + SectionCardGeneric, lint 0 error |
| 2026-06-26 | stock (4a) | `stock/location/modal/upsert-view.vue` · `stock/gem/components/{create,update}-view.vue` (3) | ✅ done — normalize→generic + standard, lint 0 error |
| | stock (4b) | `stock/product/list/modal/update-view.vue` · `stock/gem/components/price-view.vue` (2) | ⏭️ deferred — ดู §7 Deferred Plan (ทำตอน "แตะหน้านั้น") |
| 2026-06-26 | mold (5a) | `production/mold/components/Modal{Create,Update}.vue` (2) | ✅ done — normalize→generic + standard, lint 0 error |
| | mold (5b) | `mold/components/create/*` (6) · `mold/mold-list/components/UpdateView.vue` (1) | ⏭️ deferred — ดู §7.3 (heavy + ต้อง i18n) |
| 2026-06-26 | production-cost | `production-cost/goldCost/components/Form{Create,Update}.vue` (2) | ✅ done — 5 SectionCardGeneric + standard, lint 0 error · ⚠️ follow-up: hardcode ไทยใน DataTable returnBody ยังไม่ i18n |
| | production/plan-update + pre-plan (7) | add/* · update/* · form-* · item-form-modal (~19) | ⏭️ deferred — ดู §7.4 (ซับซ้อนสุด + ต้อง i18n) |
| | sale / receipt-stock (8) | regenerate ก่อนทำ | ⏭️ deferred — ดู §7.5 |
| 2026-06-26 | Track A (9a) | search bar/index 8 ไฟล์ (plan-tracking ×4 · plan-bom · plan-completed-all-gold · tracking-worker · report-production) | ✅ done — scan icon → prop `icon`, lint 0 error |
| 2026-06-26 | Track A (9b) | customer modal 3 ไฟล์ (sale-order/customer-edit · quotation/customer-{edit,create}) | ✅ done — tel/email/contact icon → prop `icon`, lint 0 error |
| | Track A (เหลือ) | input+button 13 ไฟล์ + generic 2 ไฟล์ | ❌ ไม่ใช่ icon target — ดู §8 (ต้องใช้ generic input+button แยกงาน) |
