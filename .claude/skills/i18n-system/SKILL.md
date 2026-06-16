---
name: i18n-system
description: ระบบ i18n ของโปรเจกต์ — namespace structure, การใช้ $t(), setLocale, กฎห้าม hardcode ไทย, และวิธีเพิ่ม key ใหม่ — ใช้เมื่อเพิ่มข้อความในหน้า, เพิ่ม key ใหม่, หรือ migrate hardcode ไทยเป็น $t()
---

# i18n System

## Config

**ไฟล์:** `src/plugins/i18n/config.js`

- library: `vue-i18n` (Composition API mode: `legacy: false`)
- `fallbackLocale: 'th'` — ถ้าไม่มี key ใน locale ที่เลือก จะ fallback เป็น th อัตโนมัติ
- locale ถูกเก็บใน localStorage ผ่าน `storage` service (key: `'lang'`)

---

## เปลี่ยนภาษา — setLocale

```javascript
import { setLocale } from '@/plugins/i18n/config.js'

// เปลี่ยนเป็นอังกฤษ
setLocale('en')

// เปลี่ยนกลับเป็นไทย
setLocale('th')
```

`setLocale(lang)` ทำ 3 อย่างพร้อมกัน:
1. ตั้ง `i18n.global.locale.value = lang`
2. บันทึก `storage.setItem('lang', lang)`
3. ตั้ง `document.documentElement.lang = lang`

Language switcher อยู่ใน `src/components/layout/main-bar.vue` — เรียก `setLocale(lang)` ผ่าน `switchLang(lang)` method

---

## Namespace Structure

```
src/language/
├── common/
│   ├── th.js   ← common.btn.* / common.field.* / common.label.* / common.lang.*
│   └── en.js
├── button/
│   ├── th.js
│   └── en.js
├── alerts/
│   ├── th.js
│   └── en.js
├── breadcrumb/
│   ├── th.js
│   └── en.js
└── view/
    └── <feature>/
        ├── th.js
        └── en.js
```

---

## common Namespace (ใช้บ่อยที่สุด)

### common.btn.*

| Key | th | en |
|---|---|---|
| `common.btn.save` | บันทึก | Save |
| `common.btn.cancel` | ยกเลิก | Cancel |
| `common.btn.search` | ค้นหา | Search |
| `common.btn.clear` | ล้าง | Clear |
| `common.btn.delete` | ลบ | Delete |
| `common.btn.edit` | แก้ไข | Edit |
| `common.btn.add` | เพิ่ม | Add |
| `common.btn.close` | ปิด | Close |
| `common.btn.confirm` | ยืนยัน | Confirm |
| `common.btn.export` | ส่งออก | Export |
| `common.btn.create` | สร้าง | Create |
| `common.btn.back` | กลับ | Back |

### common.field.*

| Key | th | en |
|---|---|---|
| `common.field.code` | รหัส | Code |
| `common.field.name` | ชื่อ | Name |
| `common.field.status` | สถานะ | Status |
| `common.field.type` | ประเภท | Type |
| `common.field.remark` | หมายเหตุ | Remark |
| `common.field.quantity` | จำนวน | Quantity |
| `common.field.weight` | น้ำหนัก | Weight |
| `common.field.price` | ราคา | Price |
| `common.field.total` | รวม | Total |
| `common.field.action` | การดำเนินการ | Action |

### common.label.*

| Key | th | en |
|---|---|---|
| `common.label.noData` | ไม่พบข้อมูล | No data found |
| `common.label.loading` | กำลังโหลด... | Loading... |
| `common.label.all` | ทั้งหมด | All |

---

## วิธีใช้ใน Component

```vue
<template>
  <!-- ปุ่ม -->
  <ButtonGeneric variant="main" :label="$t('common.btn.save')" @click="onSave" />
  <ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onCancel" />

  <!-- label -->
  <FormFieldGeneric :label="$t('common.field.name')" :required="true">
    <InputTextGeneric v-model="form.name" />
  </FormFieldGeneric>

  <!-- SearchBar title -->
  <SearchBarGeneric :title="$t('view.myFeature.searchTitle')" @search="onSearch" @clear="onClear" />

  <!-- Table column header -->
  <BaseDataTable :columns="columns" />
</template>

<script>
export default {
  computed: {
    columns() {
      return [
        { field: 'code', header: this.$t('common.field.code') },
        { field: 'name', header: this.$t('common.field.name') },
        { field: 'action', header: this.$t('common.field.action'), sortable: false }
      ]
    }
  }
}
</script>
```

---

## วิธีเพิ่ม Key ใหม่

ต้องเพิ่มทั้ง th และ en เสมอ:

```javascript
// src/language/common/th.js
export default {
  btn: {
    // ...
    approve: 'อนุมัติ'  // ← เพิ่มทั้งสองไฟล์พร้อมกัน
  }
}

// src/language/common/en.js
export default {
  btn: {
    // ...
    approve: 'Approve'  // ← คู่กันเสมอ
  }
}
```

สำหรับ key เฉพาะ feature → สร้างใน `src/language/view/<feature>/th.js` และ `en.js`

---

**✅ Good:**
```vue
<span class="title-text">{{ $t('common.field.name') }}</span>
<button class="btn btn-sm btn-main">{{ $t('common.btn.save') }}</button>
```

**❌ Bad — hardcode ไทย:**
```vue
<span class="title-text">ชื่อ</span>
<button class="btn btn-sm btn-main">บันทึก</button>
```

---

## กฎห้ามทำ

- ❌ ห้าม hardcode ข้อความไทยในโค้ดใหม่ — ใช้ `$t()` เสมอ
- ❌ ห้ามเพิ่ม key เฉพาะ th โดยไม่เพิ่ม en คู่กัน (fallback ยังได้ แต่ไม่ถูก convention)
- ❌ ห้ามใช้ `localStorage` ตรงๆ สำหรับ lang — `setLocale()` จัดการผ่าน `storage` service
