// Catalog ของ generic component + archetype + หลักการ — สรุปจาก docs/claude-design/01,03 และ skills
// (ส่วนนี้เป็น metadata ที่ไม่ได้อยู่ใน scss → เก็บเป็น structured data; token ดึงสดจาก parse-tokens.js)

export const COMPONENTS = [
  // Core generic
  { name: 'ButtonGeneric', group: 'generic', role: 'ปุ่มมาตรฐาน (แทน <button>)', variants: ['main', 'outline', 'green', 'red', 'dark', 'sub-main'], states: ['default', 'hover', 'disabled', 'loading', 'block'], props: ['variant', 'icon', 'label', 'type', 'disabled', 'loading', 'block'] },
  { name: 'InputTextGeneric', group: 'generic', role: 'input ข้อความ (แทน <input>) + leading icon', variants: [], states: ['default', 'focus', 'disabled', 'readonly', 'error'], props: ['modelValue', 'type', 'placeholder', 'disabled', 'readonly', 'required', 'trim', 'icon', 'iconPosition', 'min', 'max', 'step', 'maxlength'] },
  { name: 'TextareaGeneric', group: 'generic', role: 'textarea (แทน <textarea>)', variants: [], states: ['default', 'focus', 'disabled'], props: ['modelValue', 'rows', 'placeholder', 'disabled', 'required', 'maxlength'] },
  { name: 'FormFieldGeneric', group: 'generic', role: 'label + required + error + slot (label แหล่งเดียว)', variants: [], states: ['normal', 'required', 'error'], props: ['label', 'required', 'error'] },
  { name: 'PageHeaderGeneric', group: 'generic', role: 'header หน้า create/edit (back+title+actions, filled bg main)', variants: [], states: ['with-actions', 'without-actions'], props: ['title', 'backRoute'] },
  { name: 'SearchBarGeneric', group: 'generic', role: 'search/filter bar 4-section ของหน้า list', variants: ['pageTitle', 'legend'], states: [], props: ['title', 'description'] },
  { name: 'SectionCardGeneric', group: 'generic', role: 'การ์ด section (border+title)', variants: ['pageTitle', 'legend'], states: [], props: ['title', 'headerStyle'] },
  { name: 'DrawerGeneric', group: 'generic', role: 'drawer off-canvas เลื่อนจากข้าง', variants: ['main'], states: ['open', 'closed'], props: ['show', 'title', 'width', 'clickToClose', 'isShowActionPart', 'headerVariant', 'sideShow', 'sideWidth'] },

  // PrimeVue wrappers — form controls
  { name: 'DropdownGeneric', group: 'prime-vue', role: 'select ค่าเดียว', variants: [], states: ['default', 'open', 'disabled', 'cleared'], props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'placeholder', 'showClear'] },
  { name: 'MultiSelectGeneric', group: 'prime-vue', role: 'multi-select + chip + filter (default ของ filter หน้า list)', variants: [], states: ['default', 'open', 'chips', 'disabled'], props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'filter', 'showClear'] },
  { name: 'AutoCompleteGeneric', group: 'prime-vue', role: 'autocomplete (API + static list)', variants: ['api', 'static'], states: ['default', 'suggesting', 'forceSelection'], props: ['modelValue', 'staticOptions', 'useStaticList', 'optionLabel', 'forceSelection'] },
  { name: 'CalendarGeneric', group: 'prime-vue', role: 'date picker (mobile-friendly)', variants: [], states: ['default', 'open', 'range'], props: ['modelValue', 'dateFormat', 'showIcon', 'showButtonBar'] },
  { name: 'CheckboxGeneric', group: 'prime-vue', role: 'checkbox (binary + array mode)', variants: ['binary', 'array'], states: ['checked', 'unchecked', 'disabled'], props: ['modelValue', 'value', 'binary', 'label', 'disabled'] },
  { name: 'RadioGroupGeneric', group: 'prime-vue', role: 'radio group (options-based)', variants: ['inline', 'stacked'], states: ['selected', 'disabled'], props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'inline', 'disabled'] },

  // PrimeVue wrappers — data display
  { name: 'DataTableWithPaging', group: 'prime-vue', role: 'ตารางข้อมูลมาตรฐาน (แทน <table>/PrimeVue DataTable)', variants: ['paginated', 'selection', 'expandable'], states: ['loading', 'empty', 'sorted', 'row-hover', 'selected'], props: ['items', 'totalRecords', 'columns', 'perPage', 'paginator', 'dataKey', 'selectionMode', 'expandable', 'emptyMessage'] },
  { name: 'StepperStatus', group: 'prime-vue', role: 'timeline สถานะขั้นตอนงาน', variants: [], states: ['active', 'next', 'done'], props: ['eventsName', 'events', 'eventsIdActive', 'isNextStatus'] },
  { name: 'HorizontalBarChart', group: 'prime-vue', role: 'กราฟแท่งแนวนอน (รายงาน)', variants: [], states: [], props: ['data'] },

  // PrimeVue wrappers — image/media
  { name: 'ImagePreview', group: 'prime-vue', role: 'แสดงรูป Azure Blob (direct URL) — default', variants: [], states: ['loaded', 'loading', 'error'], props: ['imageName', 'type', 'width', 'height'] },
  { name: 'ImagePreviewEmit', group: 'prime-vue', role: 'แสดงรูป + emit blobPath (กรณีพิเศษ)', variants: [], states: ['loaded'], props: ['imageName', 'type'] },
  { name: 'azure-blob-image', group: 'prime-vue', role: 'base img จาก Azure blob (low-level)', variants: [], states: [], props: [] },
  { name: 'GalleryView', group: 'prime-vue', role: 'แกลเลอรีหลายรูป + carousel', variants: [], states: ['default', 'autoplay'], props: ['urls', 'code', 'isVisible', 'numVisible', 'autoPlay', 'isRemoveImage', 'isRemoveFirstImage', 'titlePrefix'] },
  { name: 'UploadImage', group: 'prime-vue', role: 'upload รูปเดียว (มี compact mode)', variants: ['default', 'compact'], states: ['empty', 'preview', 'invalid'], props: ['modelValue', 'previewUrl', 'title', 'accept', 'maxSizeMB', 'previewSize', 'compact', 'showClear'] },
  { name: 'MultiImageUpload', group: 'prime-vue', role: 'upload หลายรูป (generic)', variants: [], states: ['empty', 'preview', 'max-reached'], props: ['modelValue', 'max', 'accept', 'maxSizeMB'] },
  { name: 'UploadImages', group: 'prime-vue', role: 'upload หลายรูป (legacy, progress bar)', variants: [], states: ['empty', 'uploading'], props: ['maxFileSize', 'title', 'isUpload', 'isAllClear', 'countClearFiles'] },
  { name: 'qr-code-scanner', group: 'prime-vue', role: 'สแกน QR/barcode (กล้อง)', variants: [], states: [], props: [] },

  // PrimeVue wrappers — overlay
  { name: 'DialogSearchView', group: 'prime-vue', role: 'dialog ค้นหา (popup table)', variants: [], states: ['open', 'closed'], props: ['isShow', 'txtHeader', 'width'] }
]

export const ARCHETYPES = {
  list: {
    name: 'List / Search Page',
    summary: 'search bar 4-section + DataTable + paging — หน้าที่พบมากสุด',
    components: ['SearchBarGeneric', 'MultiSelectGeneric', 'ButtonGeneric', 'DataTableWithPaging'],
    rules: ['ปุ่ม action bar icon-only + tooltip', 'filter = MultiSelect array', 'มี description เสมอ', 'ลำดับปุ่ม search→advanced→clear→export→create'],
    states: ['empty', 'loading', 'paging', 'sorted', 'row-hover']
  },
  'create-edit': {
    name: 'Create / Edit Page',
    summary: 'PageHeaderGeneric + หลาย SectionCard + footer นอก box',
    components: ['PageHeaderGeneric', 'SectionCardGeneric', 'FormFieldGeneric', 'InputTextGeneric', 'DropdownGeneric', 'ButtonGeneric'],
    rules: ['multi-box แยกตาม logic', 'label แหล่งเดียว', 'primary ขวาสุดเว้น ml-2', 'token-only'],
    ref: 'src/views/ticket/create-view.vue'
  },
  detail: {
    name: 'Detail / View Page',
    summary: 'header + ข้อมูล read-only + StepperStatus + zone สรุป (teal) + ตาราง',
    components: ['PageHeaderGeneric', 'StepperStatus', 'SectionCardGeneric', 'DataTableWithPaging'],
    rules: ['zone สรุปใช้ --color-green-bg', 'ปุ่มแสดงต่างกันตามสถานะเอกสาร']
  },
  dashboard: {
    name: 'Dashboard Page',
    summary: 'KPI cards + chart + ตารางสรุป',
    components: ['SectionCardGeneric', 'HorizontalBarChart', 'DataTableWithPaging'],
    rules: ['KPI card ซ้ำหลายที่ → พิจารณาสร้าง generic StatCard ใหม่']
  },
  modal: {
    name: 'Modal Form',
    summary: 'popup form แบ่ง SectionCard, header filled main, footer ใน #action',
    components: ['modal-view', 'SectionCardGeneric', 'FormFieldGeneric', 'InputTextGeneric', 'ButtonGeneric'],
    rules: ['headerVariant=main', 'แต่ละกลุ่ม = SectionCardGeneric', 'footer นอกกล่อง'],
    ref: 'src/views/customer/list-customer/modal/create-view.vue'
  }
}

export const PRINCIPLES = [
  'Page header มาตรฐาน (PageHeaderGeneric) — ปุ่มรองอยู่ใน #actions เท่านั้น',
  'แบ่งเป็นหลาย box ตาม logic — แต่ละกลุ่ม = card มี border + title ของตัวเอง',
  'Label แหล่งเดียวผ่าน FormFieldGeneric — ลูกห้าม render label ซ้ำ',
  'Multi-column ใช้ grid (form-row-grid) responsive ≤1024px → 1 คอลัมน์',
  'Footer action bar อยู่นอก box ชิดขวา, primary ขวาสุด, เว้น ml-2',
  'Token เท่านั้น — ห้าม hardcode hex/px',
  'Generic component เท่านั้น — ห้าม native input/button/table หรือ PrimeVue ตรงๆ',
  'i18n เท่านั้น — ห้าม hardcode ไทย, ใช้ $t()',
  'Reusable first — ซ้ำ 2+ ที่ → สร้าง generic ใหม่',
  'List page = icon-only buttons',
  'Filter = MultiSelectGeneric เป็น default (array, chip)',
  'Page title มี description เสมอ'
]
