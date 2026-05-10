---
name: generic-components
description: Generic PrimeVue wrapper components — ตรวจสอบก่อนใช้ PrimeVue ตรงๆ และสร้าง generic wrapper ถ้ายังไม่มี
---

# Generic PrimeVue Components

**กฎ**: ก่อนใช้ PrimeVue component ตรงๆ → ตรวจสอบว่ามี generic wrapper ใน `src/components/prime-vue/` แล้วหรือยัง

---

## Components ที่มีอยู่แล้ว

| Component | ไฟล์ | หน้าที่ |
|---|---|---|
| `CalendarGeneric` | `CalendarGeneric.vue` | Date picker พร้อม mobile-friendly styling |
| `AutoCompleteGeneric` | `AutoCompleteGeneric.vue` | Autocomplete รองรับ API mode + static list |
| `DropdownGeneric` | `DropdownGeneric.vue` | Dropdown select รองรับ options list + showClear |
| `ImagePreview` | `ImagePreview.vue` | แสดงรูปจาก Azure Blob (direct URL) |
| `ImagePreviewEmit` | `ImagePreviewEmit.vue` | แสดงรูปพร้อม emit blobPath |
| `DataTableWithPaging` | `DataTableWithPaging.vue` | DataTable พร้อม pagination |
| `UploadImage` | `UploadImage.vue` | Upload รูปเดียว — มี `compact` mode สำหรับ form/modal |

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

Import:
```javascript
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
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
| `scrollHeight` | String | `'calc(100vh - 340px)'` | ความสูง scroll |
| `selectionMode` | Boolean | `false` | เปิด checkbox/radio เลือก row |
| `selectionType` | String | `'multiple'` | `'single'` หรือ `'multiple'` |
| `expandable` | Boolean | `false` | เปิด row expand |
| `emptyMessage` | String | `'ไม่พบข้อมูล'` | ข้อความเมื่อไม่มีข้อมูล |

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

---

## เมื่อไหร่ควรสร้าง Generic Component ใหม่

สร้างเมื่อ:
- ใช้ PrimeVue component เดิมซ้ำ 2+ ครั้งพร้อม styling เหมือนกัน
- PrimeVue component ต้องการ config/styling เพิ่มเติมที่ไม่ใช่ default

ขั้นตอน:
1. สร้างไฟล์ใน `src/components/prime-vue/<ComponentName>.vue`
2. Export props ที่จำเป็น
3. อัปเดต table ใน skill นี้
