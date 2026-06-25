---
name: native-call-policy
description: ตารางกฎ "ห้ามเรียกตรงๆ → ใช้ generic ตัวไหน" ครอบคลุม native HTML, PrimeVue, alert, localStorage — ใช้เมื่อเขียน component ใหม่หรือ migrate โค้ดเก่า
---

# Native Call Policy

**กฎ**: ทุกครั้งก่อนเขียน native element หรือ PrimeVue ตรงๆ ให้ตรวจตารางนี้ก่อน

---

## ตาราง ❌ → ✅

| ❌ ห้ามใช้ตรงๆ | ✅ ใช้แทน | Path |
|---|---|---|
| `<input class="form-control">` | `InputTextGeneric` | `@/components/generic/InputTextGeneric.vue` |
| `<textarea class="form-control">` | `TextareaGeneric` | `@/components/generic/TextareaGeneric.vue` |
| `<button class="btn btn-*">` | `ButtonGeneric` | `@/components/generic/ButtonGeneric.vue` |
| `<table>` HTML | `DataTableWithPaging` | `@/components/prime-vue/DataTableWithPaging.vue` |
| PrimeVue `<DataTable>` ตรงๆ | `DataTableWithPaging` | `@/components/prime-vue/DataTableWithPaging.vue` |
| PrimeVue `<Dropdown>` ตรงๆ | `DropdownGeneric` | `@/components/prime-vue/DropdownGeneric.vue` |
| PrimeVue `<Calendar>` ตรงๆ | `CalendarGeneric` | `@/components/prime-vue/CalendarGeneric.vue` |
| PrimeVue `<AutoComplete>` ตรงๆ | `AutoCompleteGeneric` | `@/components/prime-vue/AutoCompleteGeneric.vue` |
| PrimeVue `<MultiSelect>` ตรงๆ | `MultiSelectGeneric` | `@/components/prime-vue/MultiSelectGeneric.vue` |
| PrimeVue `<Checkbox>` ตรงๆ | `CheckboxGeneric` | `@/components/prime-vue/CheckboxGeneric.vue` |
| PrimeVue `<Dialog>` | `ModalView` | `@/components/modal/modal-view.vue` |
| `alert()` / `confirm()` native | `sweetAlerts` service | `@/services/alert/sweetAlerts.js` |
| `localStorage.getItem/setItem` | `storage` service | `@/services/storage.js` |
| `<FormField>` (label+input เอง) | `FormFieldGeneric` | `@/components/generic/FormFieldGeneric.vue` |
| page header (create/edit) เอง | `PageHeaderGeneric` | `@/components/generic/PageHeaderGeneric.vue` |
| search bar 4-section เอง | `SearchBarGeneric` | `@/components/generic/SearchBarGeneric.vue` |
| section card เอง | `SectionCardGeneric` | `@/components/generic/SectionCardGeneric.vue` |
| `<div class="input-group">` + icon addon manual | `InputTextGeneric :icon` | `@/components/generic/InputTextGeneric.vue` |

---

## ตัวอย่าง

**✅ Good — ใช้ generic:**
```vue
<template>
  <PageHeaderGeneric :title="$t('common.btn.create')" backRoute="my-list" />

  <SectionCardGeneric title="ข้อมูลหลัก">
    <FormFieldGeneric :label="$t('common.field.name')" :required="true">
      <InputTextGeneric v-model="form.name" />
    </FormFieldGeneric>
    <FormFieldGeneric :label="$t('common.field.remark')">
      <TextareaGeneric v-model="form.remark" :rows="4" />
    </FormFieldGeneric>
    <ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="onSave" />
    <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onCancel" />
  </SectionCardGeneric>
</template>
```

**❌ Bad — native + hardcode Thai:**
```vue
<template>
  <div class="page-header-bar">
    <button class="btn-back" @click="$router.go(-1)"><i class="bi bi-arrow-left"></i></button>
    <h2>สร้างรายการ</h2>
  </div>
  <div class="section-card">
    <span class="title-text">ชื่อ <span class="text-danger">*</span></span>
    <input class="form-control" v-model="form.name" />
    <button class="btn btn-sm btn-main" @click="onSave">บันทึก</button>
    <button class="btn btn-sm btn-outline-main ml-2" @click="onCancel">ยกเลิก</button>
  </div>
</template>
```

---

## Import Pattern

```javascript
// Generic components
import InputTextGeneric from '@/components/generic/InputTextGeneric.vue'
import TextareaGeneric from '@/components/generic/TextareaGeneric.vue'
import ButtonGeneric from '@/components/generic/ButtonGeneric.vue'
import FormFieldGeneric from '@/components/generic/FormFieldGeneric.vue'
import PageHeaderGeneric from '@/components/generic/PageHeaderGeneric.vue'
import SearchBarGeneric from '@/components/generic/SearchBarGeneric.vue'
import SectionCardGeneric from '@/components/generic/SectionCardGeneric.vue'

// Prime-vue generics
import MultiSelectGeneric from '@/components/prime-vue/MultiSelectGeneric.vue'
import CheckboxGeneric from '@/components/prime-vue/CheckboxGeneric.vue'
import DropdownGeneric from '@/components/prime-vue/DropdownGeneric.vue'
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'

// Services
import { warning, error, success, confirmSubmit } from '@/services/alert/sweetAlerts.js'
import { storage } from '@/services/storage.js'
```

---

## กฎห้ามทำ

- ❌ ห้าม `localStorage.getItem/setItem` ตรงๆ ในโค้ด component — ใช้ `storage` service
- ❌ ห้าม `alert()` / `confirm()` native — ใช้ sweetAlerts
- ❌ ห้ามใช้ PrimeVue `<Dialog>` — ใช้ `ModalView`
- ❌ ห้ามสร้าง page header / search bar / section card เอง — ใช้ Generic component
