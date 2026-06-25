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

**รวม 26 ไฟล์** · regenerate ได้ด้วย: `grep -rl "input-group-append\|input-group-inner" src/ | grep -v ".scss"`

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

## Progress Log

| วันที่ | Batch | ไฟล์ | สถานะ |
|---|---|---|---|
| 2026-06-25 | reference | `customer/list-customer/modal/create-view.vue` | ✅ done (ต้นแบบ) |
| | master | — | ⬜ pending |
| | ... | — | ⬜ pending |
