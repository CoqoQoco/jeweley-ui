---
name: generic-components
description: Generic wrapper components ทั้งหมด — ตรวจก่อนใช้ native HTML หรือ PrimeVue ตรงๆ และสร้าง generic wrapper ถ้ายังไม่มี — ดู native-call-policy skill สำหรับตารางครบ
---

# Generic Components

**กฎ**: ก่อนเขียน native element หรือ PrimeVue ตรงๆ → ตรวจตารางนี้ก่อน (ดู `native-call-policy` skill สำหรับตารางครบ)

---

## Generic UI Components (`src/components/generic/`)

โค้ดใหม่ใช้ component เหล่านี้แทน native element — ใช้ `ButtonGeneric` แทน `<button>`, `InputTextGeneric` แทน `<input>` เสมอ

| Component | ไฟล์ | หน้าที่ |
|---|---|---|
| `InputTextGeneric` | `InputTextGeneric.vue` | wrap `<input class="form-control">` — padding sync กับ DropdownGeneric; props: `modelValue`, `type`, `placeholder`, `disabled`, `readonly`, `required`, `trim`, `bgInput`, `step`(null), `min`(null), `max`(null), `maxlength`(null), `icon`('')(Bootstrap icon class เช่น `'bi-telephone-fill'` — leading icon ฝังในช่อง), `iconPosition`('left'); emits: `update:modelValue`, `blur`, `focus` |
| `TextareaGeneric` | `TextareaGeneric.vue` | wrap `<textarea class="form-control">` — resize: vertical; props: `modelValue`, `rows`(3), `placeholder`, `disabled`, `required`, `maxlength`; emits: `update:modelValue` |
| `ButtonGeneric` | `ButtonGeneric.vue` | wrap `<button class="btn btn-sm btn-*">` — variant map: main/outline/green/red/dark/sub-main/plain; props: `variant`, `icon`, `label`, `type`, `disabled`, `loading`, `block`; emits: `click` |
| `FormFieldGeneric` | `FormFieldGeneric.vue` | label + required marker + error msg + slot; props: `label`, `required`, `error`, `inputId`(''  — เมื่อส่งมา render `<label :for="inputId">` แทน `<span>`, ต้องส่ง `id` ตรงกันให้ input ลูกเอง) |
| `PageHeaderGeneric` | `PageHeaderGeneric.vue` | back btn วงกลม + title + border-bottom; props: `title`, `backRoute`; slot: `#actions` (ปุ่มฝั่งขวา เช่นหน้า detail/edit — ถ้าไม่ส่ง layout เหมือนเดิม); emits: `back` |
| `SearchBarGeneric` | `SearchBarGeneric.vue` | search bar 4-section (pageTitle + fields + actions); props: `title`, `description`, `icon`; slots: `#header-actions` (ปุ่มมุมขวาบน filled header — หลายปุ่ม, width เท่ากัน grid 1fr, default btn-green; ปุ่มมี label ได้), `#fields`, `#actions-left`, `#actions-right`; emits: `search`, `clear` |
| `SectionCardGeneric` | `SectionCardGeneric.vue` | card: card-base mixin + optional pageTitle; props: `title`, `description`(filled mode), `icon`, `accent`('main'\|'green', legend + dashboard mode), `headerStyle`('underline'\|'legend'\|'filled'\|'dashboard', default 'underline' — `dashboard` = หัวข้อ+เส้นคั่นเท่านั้น ไม่มีกรอบ/พื้นครอบ ไม่มี card-base ใช้กับกลุ่ม KPI บน dashboard ที่การ์ดลูก เช่น `StatCardGeneric` มีกรอบของตัวเองอยู่แล้ว กันกรอบซ้อน 2 ชั้น); slots: default, `#header-actions` (filled + dashboard mode — forward ไป pageTitle rightSlot ใน filled mode, ต่อท้ายเส้นคั่นใน dashboard mode) |
| `StatCardGeneric` | `StatCardGeneric.vue` | KPI tile (icon circle + value + label) — สกัดจาก ticket-dashboard `.kpi-card`; props: `icon`(required), `value`, `label`, `subLabel`(''  — ข้อความเสริมเล็กๆ ใต้ label เช่น เศษส่วนตรวจสอบได้ '12/50'), `variant`('main'\|'warning'\|'green'\|'grey', default 'main'); consumer wrap หลายใบใน CSS grid เอง |
| `DashboardHeaderGeneric` | `DashboardHeaderGeneric.vue` | dashboard header: icon + title/subtitle + ปุ่ม refresh; props: `title`, `subtitle`, `icon`('bi-clipboard-data'), `showRefresh`(true); slot: `#controls` (วางก่อนปุ่ม refresh เช่น DropdownGeneric period); emits: `refresh` |
| `TabViewGeneric` | `TabViewGeneric.vue` | wrap PrimeVue `TabView`/`TabPanel` + custom grouped nav bar (ทำเอง ไม่ใช้ PrimeVue nav header ตรงๆ — ซ่อนด้วย `.p-tabview-nav-container{display:none}`); รองรับ group divider (`tabs[].group` + `groupLabel`) และ lazy "mount ครั้งเดียวแล้วค้าง" ของจริง (ใช้ `visited` Set ควบคุมเอง ไม่พึ่ง PrimeVue `:lazy` เพราะ PrimeVue unmount ทุกครั้งที่สลับแท็บออกซึ่งทำให้ filter/สถานะภายในแท็บหาย); props: `modelValue`(required, String — v-model แท็บที่เลือก, ผูก query string ได้), `tabs`(required, Array ของ `{ value, label, group?, groupLabel? }`), `lazy`(true); slots: 1 slot ต่อ 1 tab โดยใช้ `tab.value` เป็นชื่อ slot; emits: `update:modelValue` |
| `ToggleGroupGeneric` | `ToggleGroupGeneric.vue` | segmented toggle (สกัดจาก gold-loss-dashboard `.group-by-toggle`) — render `role="tablist"` + native `<button role="tab">` ภายใน (อนุญาตในตัว generic); props: `modelValue`(String\|Number, required), `options`(Array ของ `{ value, label }`, required), `ariaLabel`(''), `disabled`(false); emits: `update:modelValue` |
| `SourceStripGeneric` | `SourceStripGeneric.vue` | แถบคาดบอก "ต้นทางข้อมูล" ของหน้า/แท็บที่รวมข้อมูลจากหลายต้นทาง (เช่น gold-loss-dashboard: PLAN vs SLIP) — บอกที่มา/คีย์จากหน้าไหน/นับอะไร + ปุ่ม ⓘ กางคำอธิบายยาว; props: `source`(required, `'plan'\|'slip-tang'\|'slip-setter'\|'slip'\|'both'` — `'slip'` = ทั้ง 2 แผนก (tang+setter) รวมกัน); ข้อความทั้งหมดมาจาก i18n `goldLossDashboard.sourceStrip.*` (ไม่มี slot — บังคับให้ทุก source ต้องมีข้อความกำกับใน i18n) |
| `BarcodeGeneric` | `BarcodeGeneric.vue` | render CODE128 (JsBarcode) ลง `<svg>` ล้วน — wrap JsBarcode ด้วย try/catch + fallback ข้อความเมื่อ value ว่าง/encode ไม่ได้; props: `value`(''), `format`('CODE128'), `width`(2), `height`(80), `displayValue`(true), `margin`(10); method (เรียกผ่าน ref): `toPngDataUrl()` → `Promise<string>` PNG data URL พื้นขาว |
| `CameraScanGeneric` | `CameraScanGeneric.vue` | กล้องเต็มจอสแกนบาร์โค้ด/QR (html5-qrcode, `Teleport to="body"`, fixed z-index 1000) — fallback chain กล้องหลัง exact→loose→any, dedup 1500ms, torch toggle (แสดงเมื่อมี), หยุดกล้องอัตโนมัติเมื่อ `visibilitychange`/เปลี่ยน route; props: `visible`(Boolean), `title`('' → fallback `$t('common.scan.title')`), `hint`('' → fallback `$t('common.scan.hint')`); emits: `detect(code)`, `close`; ไม่มี logic โดเมน (เพิ่มตะกร้า/ค้นสินค้า) — caller จัดการเองผ่าน `@detect` |
| `BarcodeButtonGeneric` | `BarcodeButtonGeneric.vue` | ปุ่ม icon-only (`bi-upc`) เปิด `ModalView` แสดง `BarcodeGeneric` + ปุ่มดาวน์โหลด PNG/พิมพ์ (client-side ล้วน ผ่าน hidden iframe, ไม่พึ่ง Zebra print service); props: `value`(''), `title`(''), `disabled`(false) — disabled อัตโนมัติเมื่อ `value` ว่าง |
| `ActionMenuGeneric` | `ActionMenuGeneric.vue` | ปุ่ม trigger (`ButtonGeneric`) + PrimeVue `Menu` popup (`:popup="true"`, `appendTo="body"`) — ใช้รวมปุ่มที่ทำหน้าที่คล้ายกันหลายปุ่มเป็นเมนูเดียว (เช่น header action bar); มี label → เติม chevron `bi-chevron-down` ให้อัตโนมัติ, ไม่มี label → icon-only ต้องส่ง `title`; props: `label`(''), `icon`(''), `items`(required), `variant`('outline'), `disabled`(false), `title`(''); `items` รองรับ 3 shape ผสมกันได้ (PrimeVue Menu v3 native): (1) item ปกติ `{key, label, icon, command, disabled, hint, danger}` — render ผ่าน `#item` slot (icon คอลัมน์คงที่ 1.25rem, `hint` บรรทัดเล็กใต้ label, `danger:true` = label สีแดง + icon ขึ้น chip วงกลม 28px พื้น `--status-cancelled-bg`/icon `--base-red` + hover/focus พื้นแดงอ่อนทั้งแถว (chip กลับสีเป็นพื้นแดงทึบ/icon ขาว), `disabled:true` = opacity .5 + command ไม่ทำงาน — PrimeVue Menu จัดการเอง); (2) separator `{separator: true}` (PrimeVue render `<li role="separator">` เอง); (3) group `{key, label, items: [...]}` — render label ผ่าน slot `#submenuheader` (section label เล็กจาง) แล้ว flatten children ด้วย `#item` slot เดียวกัน; popup `min-width: 260px` / `max-width: 340px`; ไม่มี emits — ใช้ `item.command` ต่อรายการ |

## PrimeVue Generic Components (`src/components/prime-vue/`)

| Component | ไฟล์ | หน้าที่ |
|---|---|---|
| `ChartGeneric` | `ChartGeneric.vue` | wrap global `<apexchart>` — merge default options (`chart.toolbar.show:false`, `colors:CHART_PALETTE`, `dataLabels.enabled:false`, `legend.position:'bottom'`) กับ props.options ด้วย lodash merge (props ชนะ) + built-in loading/empty state; `<apexchart>` bind `:key="` `${type}-${height}` `"` เพื่อ remount ทุกครั้งที่ type/height เปลี่ยน (กัน vue3-apexcharts destroy+re-init แข่งกับ watcher options/series แล้วกราฟหาย); empty check อ่าน data point ที่เป็น object (`{x,y,...}`) ผ่าน `.y` ได้ ไม่ใช่แค่ตัวเลขล้วน; props: `type`('donut'\|'bar'\|'area'\|'line'\|'pie', default 'donut'), `series`(required), `options`({}), `height`(320), `loading`(false), `emptyText`(''); slot: `#empty` |
| `CalendarGeneric` | `CalendarGeneric.vue` | Date picker พร้อม mobile-friendly styling; props เพิ่ม `inputId`(null — forward ไป PrimeVue Calendar prop `inputId` ตรงๆ, ใส่ id ให้ `<input>` จริงข้างในแทน wrapper `<span class="p-calendar">` — ใช้คู่กับ `FormFieldGeneric :inputId`) |
| `DateRangeGeneric` | `DateRangeGeneric.vue` | ช่วงวันที่เริ่มต้น-สิ้นสุด (CalendarGeneric ×2 + `.flex-group`) พร้อม validate start ≤ end + จำกัด maxRangeDays; props: `startDate`, `endDate`, `startPlaceholder`, `endPlaceholder`, `disabled`(false), `showButtonBar`(true), `maxRangeDays`(0=ไม่จำกัด); emits: `update:startDate`, `update:endDate`, `change` |
| `AutoCompleteGeneric` | `AutoCompleteGeneric.vue` | Autocomplete รองรับ API mode + static list; props เพิ่ม `inputId`(null — forward ไป PrimeVue AutoComplete prop `inputId` ตรงๆ, ใส่ id ให้ `<input>` จริงข้างในแทน wrapper) |
| `DropdownGeneric` | `DropdownGeneric.vue` | Dropdown select รองรับ options list + showClear; props เพิ่ม `inputId`(null — forward ไป PrimeVue Dropdown prop `inputId`, PrimeVue ใส่ id นี้ที่ `<span role="combobox">` ไม่ใช่ `<input>` จริง — **ห้ามคู่กับ `FormFieldGeneric :inputId`** เพราะ `<label for>` ชี้ `<span>` ไม่ได้ตามสเปค HTML ให้ปล่อย `FormFieldGeneric` ไม่มี `inputId` แล้วใช้ `ariaLabel` แทน), `ariaLabel`(null — forward ไป PrimeVue Dropdown prop `ariaLabel` → `aria-label` บน `<span role="combobox">`) |
| `MultiSelectGeneric` | `MultiSelectGeneric.vue` | Multi-select พร้อม chip display + filter; props: `modelValue`, `options`, `optionLabel`('label'), `optionValue`(null), `placeholder`, `showClear`, `filter`(true), `disabled`; emits: `update:modelValue` |
| `CheckboxGeneric` | `CheckboxGeneric.vue` | Checkbox รองรับ binary (default) และ array mode; props: `modelValue`, `value`, `binary`(true), `label`, `disabled`; emits: `update:modelValue` |
| `RadioGroupGeneric` | `RadioGroupGeneric.vue` | Radio button group options-based; props: `modelValue`, `options`(array), `optionLabel`('label'), `optionValue`(null=whole option), `inline`(false=stacked/true=row), `disabled`; emits: `update:modelValue` |
| `ImagePreview` | `ImagePreview.vue` | แสดงรูปจาก Azure Blob (direct URL) |
| `ImagePreviewEmit` | `ImagePreviewEmit.vue` | แสดงรูปพร้อม emit blobPath |
| `DataTableWithPaging` | `DataTableWithPaging.vue` | DataTable พร้อม pagination |
| `UploadImage` | `UploadImage.vue` | Upload รูปเดียว — มี `compact` mode สำหรับ form/modal |

---

## InputTextGeneric — icon prop

```vue
<!-- icon ฝังซ้าย (leading) -->
<InputTextGeneric icon="bi-telephone-fill" type="tel" v-model.trim="form.tel" />
<InputTextGeneric icon="bi-envelope-check-fill" type="email" v-model.trim="form.email" />
<InputTextGeneric icon="bi-person-lines-fill" type="text" v-model.trim="form.contact" />

<!-- ไม่มี icon — render เหมือนเดิม (ไม่ regress) -->
<InputTextGeneric v-model="form.name" />
```

---

## CalendarGeneric

```vue
<CalendarGeneric
  v-model="selectedDate"
  dateFormat="dd/mm/yy"
  placeholder="เลือกวันที่"
  :showIcon="true"
  :showButtonBar="true"
  @date-select="onDateSelect"
/>
```

**หมายเหตุ**: v-model รับ `Date` object — ใช้ `formatISOString(date)` จาก `src/services/utils/dayjs.js` แปลงเป็น ISO string สำหรับ API

**a11y — label ต้องชี้ `<input>` จริง**: PrimeVue Calendar render เป็น `<span class="p-calendar"><input .../></span>` — ถ้าใส่ `id` ที่ตัว `CalendarGeneric`/`Calendar` ตรงๆ, id จะไปตกที่ `<span>` wrapper ไม่ใช่ `<input>` ทำให้ `<label for>` ชี้ผิดที่ (Chrome a11y warning) → ใช้ `inputId` แทน `id` เสมอเมื่อคู่กับ `FormFieldGeneric`:

```vue
<FormFieldGeneric :label="$t('common.field.date')" inputId="my-date">
  <CalendarGeneric inputId="my-date" v-model="form.date" />
</FormFieldGeneric>
```

---

## DateRangeGeneric

ใช้แทนการประกอบ `CalendarGeneric` ×2 + `.flex-group` มือ — เช่น ฟิลด์ "วันที่เริ่มต้น-สิ้นสุด" ในหน้า search bar

```vue
<DateRangeGeneric
  :startDate="form.start"
  :endDate="form.end"
  :startPlaceholder="$t('view.report.common.dateFrom')"
  :endPlaceholder="$t('view.report.common.dateTo')"
  :maxRangeDays="90"
  @update:startDate="form.start = $event"
  @update:endDate="form.end = $event"
/>
```

Props สำคัญ:
- `startDate` / `endDate` — v-model คู่ (Date object)
- `maxRangeDays` — จำกัดช่วงวันสูงสุด (0 = ไม่จำกัด) — เกินแล้วยิง `warning()` และไม่ commit ค่าใหม่
- ช่องหลังใช้ `:minDate="startDate"` บังคับ end ≥ start ในตัว (ไม่ต้องเขียน validate เอง)

Import:
```javascript
import DateRangeGeneric from '@/components/prime-vue/DateRangeGeneric.vue'
```

---

## AutoCompleteGeneric

### Static List Mode (master list ตายตัว)

```vue
<AutoCompleteGeneric
  :modelValue="currencyUnit"
  :staticOptions="CURRENCY_UNITS"
  :useStaticList="true"
  optionLabel="code"
  placeholder="เช่น US$, EUR"
  :forceSelection="false"
  customClass="currency-ac"
  @update:modelValue="onCurrencyChange"
>
  <template #option="{ option }">
    <span>{{ option.label }}</span>
  </template>
</AutoCompleteGeneric>
```

Props สำคัญ:
- `useStaticList: true` — กรองจาก `staticOptions` ไม่ call API
- `optionLabel` — field ที่ใช้กรองและแสดงใน input
- `forceSelection: false` — รับ free-text ได้
- `take` — จำนวนแถวที่ paging (API mode เท่านั้น, default `0` = ไม่ paging คืนทุกแถวที่ match — ระวังเวลาใช้กับ endpoint ที่มีข้อมูลเยอะ ให้ส่ง `:take="20"` เพื่อจำกัดผลลัพธ์)
- `inputId` — a11y: forward ไป PrimeVue AutoComplete prop `inputId` ตรงๆ ใส่ id ให้ `<input>` จริงข้างใน (แทน wrapper) — ใช้คู่กับ `FormFieldGeneric :inputId` แทนการใส่ `id` ตรงๆ
- `ariaLabel` — a11y: forward ไป PrimeVue AutoComplete prop `ariaLabel` (→ `aria-label` บน `<input>` จริง) — ใช้แทน `<label for>` เมื่อไม่มี label แสดงผล เช่น input ซ้ำหลายแถวใน DataTable cell (`:aria-label="$t('...')"`)

Handler เมื่อเลือก (emit เป็น full object):
```javascript
onCurrencyChange(value) {
  this.currencyUnit = typeof value === 'object' ? value.code : value
}
```

SCSS:
```scss
:deep(.currency-ac) {
  width: 100%;
  .p-autocomplete-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.9rem;
  }
}
```

---

## DropdownGeneric

```vue
<DropdownGeneric
  :modelValue="modelForm.status"
  :options="STATUS_OPTIONS"
  optionLabel="label"
  optionValue="value"
  placeholder="ทั้งหมด"
  :showClear="true"
  @update:modelValue="update('status', $event)"
/>
```

Props สำคัญ:
- `options` — Array ของ objects (เช่น `[{ value: 'Draft', label: 'ร่าง' }]`)
- `optionLabel` — field ที่แสดงใน dropdown (default: `'label'`)
- `optionValue` — field ที่ใช้เป็น value (default: `null` = ส่ง full object)
- `showClear` — แสดงปุ่มล้างค่า (default: `false`)

**กฎ**: ใช้สำหรับ field ที่เลือกได้ค่าเดียวโดยธรรมชาติ (เช่น เลือกสาขา, สกุลเงิน) — **ห้ามใช้ใน filter ของหน้า list** → ใช้ `MultiSelectGeneric` แทน (Core Principle #11)

**a11y — Dropdown ไม่มี `<input>` จริง ห้ามใช้ `FormFieldGeneric :inputId`**: ต่างจาก Calendar/AutoComplete — PrimeVue Dropdown เอา prop `inputId` ไปใส่ที่ `<span role="combobox" tabindex="0">` (ไม่ใช่ `<input>`) `<label for>` ชี้ `<span>` ไม่ได้ตามสเปค HTML → browser ทิ้ง association ทันที (Chrome: `Incorrect use of <label for=...>`) ให้ทำแบบนี้แทน:

```vue
<FormFieldGeneric :label="$t('common.field.type')" :required="true">
  <DropdownGeneric inputId="my-type" :ariaLabel="$t('common.field.type')" v-model="form.type" :options="typeOptions" />
</FormFieldGeneric>
```

- **ไม่ส่ง `inputId` ให้ `FormFieldGeneric`** (ปล่อยให้ render เป็น `<span class="title-text">` แทน `<label for>`)
- ส่ง `ariaLabel` ให้ `DropdownGeneric` แทน — ได้ `aria-label` บน `<span role="combobox">` ตรงๆ เป็น accessible name
- `inputId` บน `DropdownGeneric` เก็บไว้ได้ตามปกติ (ใส่ id ให้ element เฉยๆ ไม่ผูก label แล้ว)

Import:
```javascript
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
```

---

## MultiSelectGeneric

```vue
<MultiSelectGeneric
  v-model="form.tags"
  :options="tagOptions"
  optionLabel="label"
  optionValue="value"
  placeholder="เลือกแท็ก"
  :filter="true"
/>
```

Props สำคัญ:
- `modelValue` — Array ของ value ที่เลือก
- `options` — Array ของ objects
- `optionLabel` — field ที่แสดง (default: `'label'`)
- `optionValue` — field ที่ใช้เป็น value (default: `null` = full object)
- `filter` — แสดง search filter (default: `true`)
- `showClear` — ปุ่มล้างค่า (default: `false`)
- แสดงผลแบบ `display="chip"` อัตโนมัติ

**กฎ List Page Filter (Core Principle #11)**:
- ✅ filter ทุกตัวในหน้า list ต้องใช้ `MultiSelectGeneric` — ให้ผู้ใช้เลือกหลายค่าได้
- ✅ `data().filter` เริ่มต้นเป็น `[]` (ไม่ใช่ `null`)
- ✅ ส่ง API: `status: this.filter.status?.length ? this.filter.status : undefined`
- ✅ `onClear()` reset เป็น `[]` (ไม่ใช่ `null`)
- ❌ ห้ามใช้ `DropdownGeneric` สำหรับ filter ในหน้า list

Import:
```javascript
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
```

---

## CheckboxGeneric

### Binary mode (default — true/false)

```vue
<CheckboxGeneric v-model="form.isActive" label="เปิดใช้งาน" />
```

### Array mode (checklist)

```vue
<CheckboxGeneric
  v-model="form.selectedIds"
  :value="item.id"
  :binary="false"
  :label="item.name"
/>
```

Props สำคัญ:
- `modelValue` — Boolean เมื่อ `binary=true`, Array เมื่อ `binary=false`
- `value` — ค่าที่ push เข้า array เมื่อ `binary=false`
- `binary` — default: `true`
- `label` — label ข้างๆ checkbox
- สีใช้ `var(--base-font-color)` อัตโนมัติ

Import:
```javascript
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
```

---

## ตัวอย่าง Form ที่ใช้ Generic ครบ

**✅ Good — ใช้ generic ครบ:**
```vue
<template>
  <SectionCardGeneric title="ข้อมูลสินค้า">
    <div class="form-row two-col">
      <FormFieldGeneric :label="$t('common.field.name')" :required="true">
        <InputTextGeneric v-model="form.name" />
      </FormFieldGeneric>
      <FormFieldGeneric :label="$t('common.field.type')">
        <DropdownGeneric v-model="form.type" :options="typeOptions" :showClear="true" />
      </FormFieldGeneric>
    </div>
    <FormFieldGeneric label="แท็ก">
      <MultiSelectGeneric v-model="form.tags" :options="tagOptions" optionLabel="name" />
    </FormFieldGeneric>
    <CheckboxGeneric v-model="form.isActive" label="เปิดใช้งาน" />
    <div class="mt-3">
      <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="onSave" />
      <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onCancel" />
    </div>
  </SectionCardGeneric>
</template>
```

**❌ Bad — native + hardcode ไทย:**
```vue
<template>
  <div class="section-card">
    <span class="title-text">ชื่อ <span class="text-danger">*</span></span>
    <input class="form-control" v-model="form.name" />
    <MultiSelect v-model="form.tags" :options="tagOptions" />
    <button class="btn btn-sm btn-main" @click="onSave">บันทึก</button>
  </div>
</template>
```

---

## UploadImage

**กฎ**: ทุกการ upload รูปเดียว (single file) ต้องใช้ `UploadImage` — ห้ามเขียน file input + preview เอง

มี 2 mode:

### Default mode (legacy — header แดง, ปุ่มเหลือง, preview 300×300)

ใช้ใน form/modal ที่ต้องการ UX แบบเก่า:

```vue
<UploadImage
  hight="400px"
  :reset="resetUpload"
  @onImportFile="onUploadImage"
/>
```

### Compact mode (สำหรับ form/modal ใหม่)

ใช้สำหรับ section card ที่ต้องการ button + thumbnail แนวนอน + validation alerts:

```vue
<UploadImage
  :modelValue="form.imageFile"
  :previewUrl="form.imagePreview"
  title="รูปสินค้า"
  accept="image/*"
  :maxSizeMB="5"
  :previewSize="150"
  :compact="true"
  :showClear="true"
  @update:modelValue="form.imageFile = $event"
  @update:previewUrl="form.imagePreview = $event"
  @clear="onImageClear"
/>
```

### Props

| Prop | Type | Default | คำอธิบาย |
|---|---|---|---|
| `modelValue` | File | `null` | v-model — File object ที่เลือก |
| `previewUrl` | String | `null` | v-model — preview URL (object URL หรือ data URL) |
| `title` | String | `''` | หัวข้อ section (compact mode เท่านั้น) |
| `accept` | String | `'.jpg, .png'` | accept attribute (เช่น `'image/*'`) |
| `maxSizeMB` | Number | `0` | ขนาดสูงสุด (MB) — 0 = ไม่ check |
| `previewSize` | Number | `300` | ขนาด preview (px, square) |
| `compact` | Boolean | `false` | เปิด compact layout (button + thumbnail แนวนอน) |
| `showClear` | Boolean | `false` | แสดงปุ่ม "ลบรูป" เมื่อมีรูป |
| `hight` | String | `'auto'` | ความสูง container (default mode) — typo เดิม คงไว้เพื่อ backward compat |
| `reset` | Boolean | `false` | toggle เพื่อล้าง file input (legacy) |

### Events

| Event | Payload | คำอธิบาย |
|---|---|---|
| `update:modelValue` | File \| null | v-model file |
| `update:previewUrl` | String \| null | v-model preview URL |
| `clear` | - | กดปุ่มลบรูป |
| `onImportFile` | File | (legacy) compatible กับโค้ดเก่า |

### Validation (compact mode + maxSizeMB หรือ accept = 'image/*')

- ไฟล์ต้องเป็นรูปภาพ → ถ้าไม่ใช่ ยิง warning "ประเภทไฟล์ไม่ถูกต้อง"
- ขนาดเกิน maxSizeMB → ยิง warning "รูปภาพขนาดใหญ่เกินไป"

ใช้ `warning()` จาก `@/services/alert/sweetAlerts.js` อัตโนมัติ

### Import

```javascript
import UploadImage from '@/components/prime-vue/UploadImage.vue'
// หรือ async:
const UploadImage = defineAsyncComponent(
  () => import('@/components/prime-vue/UploadImage.vue')
)
```

---

## DataTableWithPaging (BaseDataTable)

**กฎสำคัญ**: ทุกตารางข้อมูลต้องใช้ `DataTableWithPaging` เท่านั้น — ห้ามใช้ `<table>` HTML ธรรมดา หรือ PrimeVue `DataTable` ตรงๆ

```vue
<BaseDataTable
  :items="dataList"
  :totalRecords="total"
  :columns="columns"
  :perPage="10"
  :paginator="true"
  @page="handlePageChange"
  @sort="handleSortChange"
>
  <!-- Custom column template -->
  <template #actionTemplate="{ data }">
    <button class="btn btn-sm btn-green" @click="onView(data)">
      <i class="bi bi-eye"></i>
    </button>
  </template>

  <!-- Footer slot -->
  <template #footer>
    <div>รวม {{ total }} รายการ</div>
  </template>
</BaseDataTable>
```

### Import

```javascript
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
```

### Props หลัก

| Prop | Type | Default | คำอธิบาย |
|---|---|---|---|
| `items` | Array | `[]` | ข้อมูลแสดงในตาราง |
| `totalRecords` | Number | `0` | จำนวน record ทั้งหมด (สำหรับ pagination) |
| `columns` | Array | **required** | กำหนด columns (ดูด้านล่าง) |
| `perPage` | Number | `10` | จำนวนแถวต่อหน้า |
| `paginator` | Boolean | `true` | แสดง pagination |
| `dataKey` | String | `'id'` | unique key ของแต่ละ row |
| `showGridlines` | Boolean | `true` | แสดงเส้นตาราง |
| `scrollHeight` | String | `'calc(100vh - 360px)'` | ความสูง scroll |
| `selectionMode` | Boolean | `false` | เปิด checkbox/radio เลือก row |
| `selectionType` | String | `'multiple'` | `'single'` หรือ `'multiple'` |
| `expandable` | Boolean | `false` | เปิด row expand |
| `emptyMessage` | String | `'ไม่พบข้อมูล'` | ข้อความเมื่อไม่มีข้อมูล |
| `reorderableColumns` | Boolean | `false` | เปิดลาก drag คอลัมน์ (PrimeVue `reorderableColumns`) |
| `showColumnSettings` | Boolean | `false` | แสดงปุ่ม ⚙ เปิด panel ปักหมุดคอลัมน์ซ้าย/ขวา (+ ปุ่มรีเซ็ตเมื่อมี `columnPrefsKey`) |
| `columnPrefsKey` | String | `''` | ว่าง = พฤติกรรมเดิมทุกประการ (ไม่จำอะไร); ใส่ค่า → จำลำดับคอลัมน์ที่ลาก + การปักหมุดจาก panel ⚙ ลง `localStorage` — ดู "Column Order & Freeze Persistence" ด้านล่าง |

### Columns Definition

```javascript
columns: [
  { field: 'documentNo', header: 'เลขที่', minWidth: '120px' },
  { field: 'createDate', header: 'วันที่', minWidth: '100px', format: 'date' },
  { field: 'amount', header: 'จำนวนเงิน', minWidth: '100px', format: 'decimal2', align: 'right' },
  { field: 'status', header: 'สถานะ', minWidth: '80px', sortable: false },
  { field: 'action', header: '', minWidth: '100px', sortable: false }
]
```

| Column Option | คำอธิบาย |
|---|---|
| `field` | ชื่อ property ใน data object |
| `header` | ชื่อหัวคอลัมน์ |
| `minWidth` | ความกว้างขั้นต่ำ |
| `width` | ความกว้างคงที่ |
| `align` | `'left'`, `'center'`, `'right'` |
| `format` | `'date'`, `'datetime'`, `'decimal2'`, `'decimal3'`, `'number'`, `'currency'` |
| `sortable` | `true`/`false` (default: true) |

### Custom Column Template

ใช้ slot ชื่อ `{field}Template`:

```vue
<BaseDataTable :items="items" :columns="columns">
  <!-- slot name = field + 'Template' -->
  <template #actionTemplate="{ data }">
    <div class="btn-action-container">
      <button class="btn btn-sm btn-green" @click="onView(data)">
        <i class="bi bi-eye"></i>
      </button>
      <button class="btn btn-sm btn-red" @click="onDelete(data)">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </template>
</BaseDataTable>
```

### Events

| Event | Payload | คำอธิบาย |
|---|---|---|
| `@page` | `{ first, rows }` | เปลี่ยนหน้า |
| `@sort` | `{ first, rows, multiSortMeta }` | เปลี่ยนการ sort |
| `@update:itemsSelection` | Array | เปลี่ยน selection (เมื่อ selectionMode=true) |

**✅ Good:**
```vue
<BaseDataTable :items="items" :columns="columns" :totalRecords="total" />
```

**❌ Bad:**
```vue
<table class="table table-bordered"><thead>...</thead></table>
<DataTable :value="items">...</DataTable>
```

### Column Order & Freeze Persistence (`columnPrefsKey`)

จำลำดับคอลัมน์ (จากลาก `reorderableColumns`) + การปักหมุด (จาก panel ⚙ `showColumnSettings`) ลง `localStorage` ต่อหน้า:

```vue
<BaseDataTable
  :items="items"
  :columns="columns"
  :totalRecords="total"
  :reorderableColumns="true"
  :showColumnSettings="true"
  columnPrefsKey="invoice-list"
/>
```

- Key เก็บ: `table-cols-${columnPrefsKey}-dk` รูปแบบ `{ order: [field...], frozen: { field: 'left'|'right'|null } }`
- โหลดตอน mount, บันทึกทุกครั้งที่ลาก/ปักหมุด, panel ⚙ มีปุ่ม "รีเซ็ตคอลัมน์" ลบ key + remount ตาราง
- helper แยกไว้ที่ `src/services/utils/column-prefs.js` (pure function, มี spec คู่กัน)
- ตัวอย่างใช้จริง: `src/views/sale/invoice/components/data-table-view.vue`

**กติกาสำคัญ**:
- ❌ ห้ามใช้ `stateStorage`/`stateKey` ของ PrimeVue เอง — มัน restore `first`/`rows` ชนกับ `useDataTablePaging` mixin (ตารางโชว์หน้า 3 แต่ข้อมูลที่ fetch จริงเป็นหน้า 1)
- index จาก event `column-reorder` ของ PrimeVue นับรวมคอลัมน์ expander/selection ที่ BaseDataTable แทรกเองด้วย ต้องหัก offset (ดู `computeReorderOffset` ใน `column-prefs.js`) ก่อน map กลับเข้า array field
- ❌ ห้ามป้อนลำดับที่ได้จาก event กลับเข้า `:columns` ระหว่าง session — PrimeVue เก็บ `d_columnOrder` ของมันเองอยู่แล้ว ป้อนกลับจะสลับซ้อนกัน (ลำดับจาก localStorage ใช้ตอน mount ครั้งเดียวเท่านั้น)

---

## เมื่อไหร่ควรสร้าง Generic Component ใหม่

สร้างเมื่อ:
- ใช้ PrimeVue component เดิมซ้ำ 2+ ครั้งพร้อม styling เหมือนกัน
- PrimeVue component ต้องการ config/styling เพิ่มเติมที่ไม่ใช่ default

ขั้นตอน:
1. สร้างไฟล์ใน `src/components/prime-vue/<ComponentName>.vue`
2. Export props ที่จำเป็น
3. อัปเดต table ใน skill นี้
