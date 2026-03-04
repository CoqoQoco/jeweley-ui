# Plan: edit-stock-view.vue — Image Fix + Size/Region Editing

## 1. Image ไม่แสดง

### Root Cause

ใน `edit-stock-view.vue` (บรรทัด 17-26):
```html
<imagePreview
  v-if="stock.imagePath"
  :imageName="stock.imagePath"
  :path="stock.imagePath"   ← redundant (ค่าเดียวกับ imageName)
  :type="type"
/>
```

`type` = `'STOCK-PRODUCT'` (hardcoded ใน data())

**ปัญหา**: `:path` prop ซ้ำกับ `:imageName` ทำให้ใน `ImagePreview.vue` (บรรทัด 162):
```javascript
case 'STOCK-PRODUCT':
  return this.path ? `Stock/Product/${this.path}` : `Stock/Product/${cleanImageName}`
```

เมื่อ `stock.imagePath` = `"DK001.jpg"` (ไม่มี `/`):
- `imageName` = `"DK001.jpg"` → `buildBlobPathFromType()` → `this.path = "DK001.jpg"` → `"Stock/Product/DK001.jpg"` ✅

เมื่อ `stock.imagePath` = `"Stock/Product/DK001.jpg"` (มี `/`):
- ImagePreview บรรทัด 92: `imageName.includes('/')` → returns `imageName` directly = `"Stock/Product/DK001.jpg"` ✅

**ปัญหาจริง**: `stock.imagePath` เป็น null/undefined สำหรับ items บางประเภท
ทำให้ `v-if="stock.imagePath"` = false → แสดง no-image.png แทน

### Fix

ลบ redundant `:path` prop ออก — ไม่ได้ช่วยอะไรและทำให้ code อ่านยาก:

```html
<!-- เดิม -->
<imagePreview
  v-if="stock.imagePath"
  :imageName="stock.imagePath"
  :path="stock.imagePath"
  :type="type"
  :width="150"
  :height="150"
  :preview="true"
  class="image-body"
/>

<!-- ใหม่ -->
<imagePreview
  v-if="stock.imagePath"
  :imageName="stock.imagePath"
  :type="type"
  :width="150"
  :height="150"
  :preview="true"
  class="image-body"
/>
```

> หมายเหตุ: ถ้า image ยังไม่แสดงหลัง fix นี้ ปัญหาอยู่ที่ `stock.imagePath` เป็น null
> ซึ่งต้องตรวจสอบ API response ว่า field ชื่ออะไร (อาจเป็น `imageBlob` หรือ `imageBlobPath`)

---

## 2. เพิ่ม ขนาด (size) และ แหล่งผลิต (region) แก้ไขได้สำหรับ Diamond/Gem

### สถานะปัจจุบัน

`materialColumns` (บรรทัด 723-733) มี column `size` และ `region` แล้ว:
```javascript
{ field: 'size', header: 'ขนาด', sortable: false, width: '100px' },
{ field: 'region', header: 'เเหล่งผลิต', sortable: false, width: '80px' }
```

แต่ใน BaseDataTable **ไม่มี** `#sizeTemplate` และ `#regionTemplate` → แสดงเป็น text read-only

### Fix

#### A. เพิ่ม `size` และ `region` ใน `addMaterialItem()`

```javascript
addMaterialItem(data) {
  data.push({
    type: '',
    qty: 1,
    qtyUnit: 'pc',
    weight: null,
    weightUnit: 'ct.',
    description: '',
    size: '',      // ← เพิ่ม
    region: ''     // ← เพิ่ม
  })
}
```

#### B. เพิ่ม `#sizeTemplate` ใน BaseDataTable

สำหรับ Diamond/Gem → แสดง input; สำหรับ Gold/Silver → แสดง `—`

```html
<template #sizeTemplate="{ data }">
  <div v-if="data.type === 'Diamond' || data.type === 'Gem'">
    <input
      type="text"
      v-model="data.size"
      class="form-control"
      placeholder="ขนาด"
    />
  </div>
  <div v-else class="text-center">—</div>
</template>
```

#### C. เพิ่ม `#regionTemplate` ใน BaseDataTable

```html
<template #regionTemplate="{ data }">
  <div v-if="data.type === 'Diamond' || data.type === 'Gem'">
    <input
      type="text"
      v-model="data.region"
      class="form-control"
      placeholder="แหล่งผลิต"
    />
  </div>
  <div v-else class="text-center">—</div>
</template>
```

---

## 3. Files ที่แก้ไข

| File | Action |
|------|--------|
| `src/views/sale/quotation/modal/edit-stock-view.vue` | **แก้ไข** — ลบ `:path` prop, เพิ่ม size/region templates, update addMaterialItem |

---

## 4. ไม่เปลี่ยนแปลง

- `materialColumns` data ไม่เปลี่ยน (มี field อยู่แล้ว)
- Logic อื่นๆ ใน edit-stock-view.vue ไม่เปลี่ยน
- `ImagePreview.vue` ไม่เปลี่ยน
