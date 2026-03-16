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
| `ImagePreview` | `ImagePreview.vue` | แสดงรูปจาก Azure Blob (direct URL) |
| `ImagePreviewEmit` | `ImagePreviewEmit.vue` | แสดงรูปพร้อม emit blobPath |
| `DataTableWithPaging` | `DataTableWithPaging.vue` | DataTable พร้อม pagination |

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

## เมื่อไหร่ควรสร้าง Generic Component ใหม่

สร้างเมื่อ:
- ใช้ PrimeVue component เดิมซ้ำ 2+ ครั้งพร้อม styling เหมือนกัน
- PrimeVue component ต้องการ config/styling เพิ่มเติมที่ไม่ใช่ default

ขั้นตอน:
1. สร้างไฟล์ใน `src/components/prime-vue/<ComponentName>.vue`
2. Export props ที่จำเป็น
3. อัปเดต table ใน skill นี้
