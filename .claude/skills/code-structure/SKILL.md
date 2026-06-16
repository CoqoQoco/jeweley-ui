---
name: code-structure
description: naming convention (kebab-case + ข้อยกเว้น), folder layout, ที่อยู่ของ generic component / composable / services — ใช้เมื่อสร้างไฟล์ใหม่, ย้ายไฟล์, หรือหาว่าของอยู่ที่ไหน
---

# Code Structure

## File Naming Convention

**กฎ**: ใช้ **kebab-case** เสมอ สำหรับไฟล์ .vue ทุกไฟล์

| ✅ Good | ❌ Bad |
|---|---|
| `stock-summary-cards.vue` | `StockSummaryCards.vue` |
| `appraisal-form-view.vue` | `AppraisalFormView.vue` |
| `search-bar-generic.vue` | `SearchBarGeneric.vue` |

### ข้อยกเว้น (PascalCase ที่ยอมรับ)

| Pattern | ตัวอย่าง | เหตุผล |
|---|---|---|
| `*Generic.vue` ใน `components/generic/` และ `components/prime-vue/` | `InputTextGeneric.vue`, `MultiSelectGeneric.vue` | Convention ที่ตั้งใจ — ให้ distinguish จาก business component |
| `File*.vue` ใน `services/helper/pdf/` | `FilePlanProduction.js` | Legacy naming ที่ใช้มาก่อน |

---

## Directory Layout

```
src/
├── assets/
│   ├── scss/
│   │   ├── variable.scss       ← Design tokens (spacing/radius/shadow/typography/color)
│   │   ├── mixin.scss          ← Mixins (card-base, input-control, form-row-grid, button-variant)
│   │   ├── main.scss           ← Global styles + btn-* classes
│   │   ├── custom-style/       ← ❌ Legacy — ห้ามแก้
│   │   └── responsive-style/   ← ✅ New styles
│   │       ├── web/
│   │       └── mobile/
│   └── fonts/
│
├── components/
│   ├── generic/                ← Generic UI wrappers (ไม่ใช่ PrimeVue-specific)
│   │   ├── InputTextGeneric.vue
│   │   ├── TextareaGeneric.vue
│   │   ├── ButtonGeneric.vue
│   │   ├── FormFieldGeneric.vue
│   │   ├── PageHeaderGeneric.vue
│   │   ├── SearchBarGeneric.vue
│   │   └── SectionCardGeneric.vue
│   ├── prime-vue/              ← PrimeVue wrappers
│   │   ├── DataTableWithPaging.vue
│   │   ├── DropdownGeneric.vue
│   │   ├── CalendarGeneric.vue
│   │   ├── AutoCompleteGeneric.vue
│   │   ├── MultiSelectGeneric.vue
│   │   ├── CheckboxGeneric.vue
│   │   ├── UploadImage.vue
│   │   ├── ImagePreview.vue
│   │   └── ImagePreviewEmit.vue
│   ├── modal/
│   │   └── modal-view.vue      ← base modal component
│   ├── layout/
│   │   ├── main-bar.vue        ← top navigation + i18n switcher
│   │   └── side-bar.vue
│   └── custom/
│       └── page-title.vue      ← section title component
│
├── composables/
│   ├── useDataTablePaging.js   ← paging + sort mixin
│   └── useConfirmSubmit.js     ← confirm dialog helper
│
├── plugins/
│   └── i18n/
│       └── config.js           ← i18n config + setLocale()
│
├── services/
│   ├── alert/
│   │   └── sweetAlerts.js      ← ใช้แทน alert()/confirm()
│   ├── storage.js              ← ใช้แทน localStorage ตรงๆ
│   └── utils/
│       ├── dayjs.js
│       └── pdf-make.js
│
├── stores/                     ← Pinia stores (organize by feature)
│   └── modules/
│       └── api/
│
└── views/                      ← Page components
    └── <feature>/
        ├── index-view.vue
        ├── components/
        └── modal/
```

---

## View Structure Pattern

สำหรับ view ที่ซับซ้อน (เกิน 400-500 บรรทัด หรือมีหลาย section):

```
views/<feature>/
├── index-view.vue          ← orchestrator — mount components, data fetch, router
├── components/
│   ├── search-view.vue     ← search/filter bar (ใช้ SearchBarGeneric)
│   ├── form-view.vue       ← create/edit form
│   └── table-section.vue   ← data table section
└── modal/
    ├── detail-modal.vue
    └── confirm-modal.vue
```

---

## Import Grouping

จัด 2 กลุ่มเสมอ: external → local:

```javascript
// External dependencies
import { useMyStore } from '@/stores/modules/api/my-store.js'
import dayjs from 'dayjs'
import { confirmThenSubmit } from '@/composables/useConfirmSubmit.js'
import dataTablePaging from '@/composables/useDataTablePaging.js'

// Local components
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import myModal from './modal/my-modal.vue'
```

---

## กฎห้ามทำ

- ❌ ห้ามตั้งชื่อ business component เป็น PascalCase เช่น `StockForm.vue` — ใช้ `stock-form.vue`
- ❌ ห้าม modify `src/assets/scss/custom-style/` — legacy read-only
- ❌ ห้ามวาง generic component ใหม่ที่ไม่ใช่ `*Generic.vue` ใน `components/generic/`
- ❌ ห้ามเรียก `localStorage` ตรงๆ — ใช้ `storage` service
- ❌ ห้ามเรียก `alert()` / `confirm()` ตรงๆ — ใช้ sweetAlerts service
