# 01 · Component Catalog — หน่วยของการ Redesign

> **วัตถุประสงค์**: catalog ของ generic component ทั้งหมดที่ใช้ทั่วทั้งระบบ — แต่ละตัวคือ **"1 ส่วน" ของการ redesign**
> เพราะทุกหน้าใช้ component เหล่านี้ร่วมกัน การ redesign 1 ตัว = เปลี่ยนทั้งระบบพร้อมกัน
>
> source: `src/components/generic/` (8) + `src/components/prime-vue/` (18) · รายละเอียด props ดู skill `generic-components`/`native-call-policy`

---

## วิธีใช้ catalog นี้

แต่ละ component มี: **บทบาท · variants · states · props หลัก** — ใช้เขียน "component spec" ใน Claude Design
และเป็น checklist ว่า redesign ครอบ **ทุก state** (default / hover / focus / disabled / error / loading / empty) แล้วหรือยัง

ลำดับ redesign แนะนำ (impact สูง→ต่ำ) อยู่ใน `04-redesign-playbook.md`

---

## A. Core Generic (`src/components/generic/`) — 8 ตัว

| Component | บทบาท | Variants / States | Props หลัก |
|---|---|---|---|
| **ButtonGeneric** | ปุ่มมาตรฐาน (แทน `<button>`) | variant: main/outline/green/red/dark/sub-main · states: default/hover/disabled/loading/block | `variant`, `icon`, `label`, `type`, `disabled`, `loading`, `block` |
| **InputTextGeneric** | input ข้อความ (แทน `<input>`) | states: default/focus/disabled/readonly · มี leading icon ได้ | `modelValue`, `type`, `placeholder`, `disabled`, `readonly`, `required`, `trim`, `icon`, `iconPosition`, `min/max/step/maxlength` |
| **TextareaGeneric** | textarea (แทน `<textarea>`) | resize: vertical · states เหมือน input | `modelValue`, `rows`(3), `placeholder`, `disabled`, `required`, `maxlength` |
| **FormFieldGeneric** | label + required mark + error + slot (label แหล่งเดียว) | states: normal/required/error | `label`, `required`, `error` |
| **PageHeaderGeneric** | header หน้า create/edit (back + title + actions) | filled bg main · มี/ไม่มี `#actions` | `title`, `backRoute` · slot `#actions` · emit `back` |
| **SearchBarGeneric** | search/filter bar 4-section ของหน้า list | + `headerStyle` legend (opt-in) | `title`, `description` · slots `#fields`/`#actions-left`/`#actions-right` · emit `search`/`clear` |
| **SectionCardGeneric** | การ์ด section (border + title) | `headerStyle`: pageTitle(default) / legend(chip คร่อม border) | `title`, `headerStyle` · slot default |
| **DrawerGeneric** | drawer เลื่อนจากข้าง (off-canvas) | `headerVariant` main · side panel ได้ | `show`, `title`, `width`(480px), `clickToClose`, `isShowActionPart`, `headerVariant`, `sideShow`, `sideWidth` |

---

## B. PrimeVue Wrappers (`src/components/prime-vue/`) — 18 ตัว

### B1. Form controls

| Component | บทบาท | Props หลัก |
|---|---|---|
| **DropdownGeneric** | select ค่าเดียว | `modelValue`, `options`, `optionLabel`, `optionValue`, `placeholder`, `showClear` |
| **MultiSelectGeneric** | multi-select + chip + filter (**default ของ filter หน้า list**) | `modelValue`(array), `options`, `optionLabel`, `optionValue`, `filter`(true), `showClear` |
| **AutoCompleteGeneric** | autocomplete (API mode + static list) | `modelValue`, `staticOptions`, `useStaticList`, `optionLabel`, `forceSelection` |
| **CalendarGeneric** | date picker (mobile-friendly) | `modelValue`(Date), `dateFormat`, `showIcon`, `showButtonBar` |
| **CheckboxGeneric** | checkbox (binary + array mode) | `modelValue`, `value`, `binary`(true), `label`, `disabled` |
| **RadioGroupGeneric** | radio group (options-based) | `modelValue`, `options`, `optionLabel`, `optionValue`, `inline`, `disabled` |

### B2. Data display

| Component | บทบาท | Props หลัก |
|---|---|---|
| **DataTableWithPaging** | **ตารางข้อมูลมาตรฐาน** (แทน `<table>` / PrimeVue DataTable) | `items`, `totalRecords`, `columns`, `perPage`, `paginator`, `dataKey`, `selectionMode`, `expandable`, `emptyMessage` · slot `{field}Template`, `#footer` · states: loading/empty/paginated |
| **StepperStatus** | timeline สถานะขั้นตอนงาน | `eventsName`, `events`(array), `eventsIdActive`, `isNextStatus` |
| **HorizontalBarChart** | กราฟแท่งแนวนอน (รายงาน) | `data`({report:[]}) |

### B3. Image / media

| Component | บทบาท | Props หลัก |
|---|---|---|
| **ImagePreview** | แสดงรูป Azure Blob (direct URL) — **default** | `imageName`, `type`, `width`, `height` |
| **ImagePreviewEmit** | แสดงรูป + emit blobPath (กรณีพิเศษ) | + `@image-loaded` |
| **azure-blob-image** | base img จาก Azure blob | (low-level) |
| **GalleryView** | แกลเลอรีหลายรูป + carousel | `urls`(array), `code`, `numVisible`(5), `autoPlay`, `isRemoveImage` |
| **UploadImage** | upload รูปเดียว (มี compact mode) | `modelValue`(File), `previewUrl`, `title`, `accept`, `maxSizeMB`, `previewSize`, `compact`, `showClear` |
| **MultiImageUpload** | upload หลายรูป (generic) | `modelValue`(array), `max`(5), `accept`(image/*), `maxSizeMB`(5) |
| **UploadImages** | upload หลายรูป (legacy, progress bar) | `maxFileSize`, `title`, `isUpload`, `isAllClear`, `countClearFiles` |
| **qr-code-scanner** | สแกน QR/barcode (กล้อง) | (mobile scan) |

### B4. Overlay

| Component | บทบาท | Props หลัก |
|---|---|---|
| **DialogSearchView** | dialog ค้นหา (popup table) | `isShow`, `txtHeader`, `width`(1200px) |

> **Modal หลัก** ของระบบคือ `src/components/modal/modal-view.vue` (vue-neat-modal) — props: `showModal`, `width`, `clickToClose`, `fitHeight`, `isShowActionPart`, `headerVariant` · slots: `#title`/`#content`/`#action`/`#loading`

---

## C. Layout shell (`src/components/layout/`)

| Component | บทบาท |
|---|---|
| **main-bar** | top navigation + i18n language switcher (web) |
| **side-bar** | เมนูข้าง (web) |
| **breadcrumb-name** | breadcrumb |
| **loading-overlay** | global loading (z-index 9999, จัดการโดย axios-helper) |
| **mobile-top-bar** / **mobile-bottom-nav** | shell ของ mobile (`/mobile/*`) |
| **view-mode-toggle** | สลับมุมมอง |

---

## State Checklist (ต้อง redesign ครบทุก state)

| State | ใช้กับ component ไหน |
|---|---|
| default / hover / active | ทุก control + ปุ่ม |
| focus | input, textarea, dropdown, calendar |
| disabled / readonly | input, button, dropdown, checkbox |
| loading | button, page (overlay), table |
| error / required | FormFieldGeneric, input |
| empty | DataTable (emptyMessage), gallery |
| selected / chip | MultiSelect, checkbox array, table selection |

---

## กฎสำคัญเมื่อ redesign component

- redesign ที่ **token + ไฟล์ component กลาง** เท่านั้น → propagate ทุกหน้า
- ห้ามแตะ `src/assets/scss/custom-style/` (legacy read-only)
- ทุก component ต้องคง props/emits/slots เดิม (backward compatible) — เปลี่ยนแค่ visual
- เปลี่ยน pattern ใหม่ → บันทึก **Design Decision Log** ใน `docs/design-system.md`
