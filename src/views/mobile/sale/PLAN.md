# PLAN: เพิ่ม Currency Edit ใน Mobile SO Detail (Edit Mode)

## ผลการตรวจสอบ

หน้าแก้ไข SO (`detail-view.vue`) **ไม่สามารถเปลี่ยนสกุลเงินได้ในปัจจุบัน**

### หลักฐาน

| จุด | สถานะ |
|-----|--------|
| View mode (บรรทัด 38-41) | แสดงค่า currency แบบ read-only เท่านั้น |
| Edit mode template | ไม่มี UI input สำหรับ currency unit / rate |
| `saveChanges()` (บรรทัด 677-678) | ใช้ `this.soData.currencyUnit` / `this.soData.currencyRate` โดยตรง (ค่าเดิมจาก API — ไม่มี working copy) |

### CLAUDE.md violations ที่พบในไฟล์เดิม (แก้ควบคู่กัน)

| Violation | บรรทัด | วิธีแก้ |
|-----------|--------|---------|
| `isLoading: false` ใน data() | 359 | ลบออก |
| `this.isLoading = true/false` ใน `loadSaleOrder()` | 487, 500 | ลบออก |
| Template `v-if="isLoading"` spinner card | 4-9 | ลบออก (global LoadingOverlay จัดการ) |
| `v-else-if="soData"` → ต้องแก้ | 12 | เปลี่ยนเป็น `v-if="soData"` |

---

## Files ที่เปลี่ยน

| File | Action |
|------|--------|
| `src/views/mobile/sale/detail-view.vue` | เพิ่ม currency edit UI + data props + methods + fix CLAUDE violations |
| `src/views/mobile/sale/SALE_MOBILES_FLOW.md` | อัปเดต Section 5 (Edit Mode) |

---

## 1. Imports ที่เพิ่ม

```javascript
import AutoCompleteGeneric from '@/components/prime-vue/AutoCompleteGeneric.vue'
import { CURRENCY_UNITS } from '@/constants/currency-units.js'
```

เพิ่มใน `components`:
```javascript
AutoCompleteGeneric
```

---

## 2. data() — เพิ่ม 3 fields, ลบ isLoading

```javascript
data() {
  return {
    soData: null,
    stockItems: [],
    copyItems: [],
    // isLoading: false,  ← ลบออก (CLAUDE violation)
    exportingPDF: false,
    CURRENCY_UNITS,          // ← เพิ่ม (expose ให้ template)
    editCurrencyUnit: '',    // ← เพิ่ม working copy สำหรับ edit mode
    editCurrencyRate: null,  // ← เพิ่ม working copy สำหรับ edit mode
    // ... existing fields ไม่เปลี่ยน
  }
}
```

---

## 3. Methods — เพิ่ม/แก้ไข 4 จุด

### 3a. `loadSaleOrder()` — ลบ isLoading (CLAUDE fix)

```javascript
async loadSaleOrder() {
  // this.isLoading = true  ← ลบออก
  this.soData = null
  this.stockItems = []
  this.copyItems = []

  const response = await this.saleOrderStore.fetchGet({
    formValue: { soNumber: this.soNumber }
  })

  if (response) {
    this.soData = response
    this.parseItems(response)
  }
  // this.isLoading = false  ← ลบออก
},
```

### 3b. `startEdit()` — copy currency values เป็น working copy

```javascript
startEdit() {
  const nonInvoiced = this.soItems.filter((item) => !item.isInvoice)
  this.editItems = nonInvoiced.map((item) => ({ ...item }))
  this.editCurrencyUnit = this.soData.currencyUnit || 'US$'    // ← เพิ่ม
  this.editCurrencyRate = this.soData.currencyRate || 33.0     // ← เพิ่ม
  this.isEditing = true
},
```

### 3c. `cancelEdit()` — reset currency working copy

```javascript
cancelEdit() {
  this.isEditing = false
  this.editItems = []
  this.editCurrencyUnit = ''    // ← เพิ่ม
  this.editCurrencyRate = null  // ← เพิ่ม
  this.scanInput = ''
},
```

### 3d. `saveChanges()` — ใช้ edit copy แทน soData โดยตรง

```javascript
// เปลี่ยนจาก:
currencyUnit: this.soData.currencyUnit || 'US$',
currencyRate: this.soData.currencyRate || 33.0,

// เป็น:
currencyUnit: this.editCurrencyUnit || this.soData.currencyUnit || 'US$',
currencyRate: Number(this.editCurrencyRate) || this.soData.currencyRate || 33.0,
```

### 3e. `onCurrencyChange(value)` — handler ใหม่ (AutoCompleteGeneric emit object หรือ string)

```javascript
onCurrencyChange(value) {
  if (typeof value === 'object' && value !== null) {
    this.editCurrencyUnit = value.code || ''
  } else {
    this.editCurrencyUnit = value || ''
  }
},
```

---

## 4. Template — แก้ 2 จุด

### 4a. ลบ loading block + แก้ v-if (CLAUDE fix)

```html
<!-- ลบออก: -->
<!-- <div v-if="isLoading" class="mobile-container mobile-mt-2">
  <div class="mobile-loading">...</div>
</div> -->

<!-- เปลี่ยน v-else-if → v-if: -->
<div v-if="soData" class="mobile-container mobile-mt-1">
```

### 4b. เพิ่ม Currency Edit Card ใน `<template v-if="isEditing">`

ตำแหน่ง: **ก่อน** "เพิ่มสินค้า" section card

```html
<!-- Currency Edit -->
<div class="section-card mobile-mt-2">
  <div class="section-header-bar">
    <h3 class="section-title">
      <i class="bi bi-currency-exchange"></i>
      สกุลเงิน
    </h3>
  </div>
  <div class="currency-edit-row">
    <div class="currency-edit-field">
      <label class="currency-edit-label">สกุลเงิน</label>
      <AutoCompleteGeneric
        :modelValue="editCurrencyUnit"
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
    </div>
    <div class="currency-edit-field">
      <label class="currency-edit-label">อัตราแลกเปลี่ยน</label>
      <input
        v-model="editCurrencyRate"
        type="number"
        class="form-control"
        placeholder="เช่น 33.5"
        min="0"
        step="0.01"
      />
    </div>
  </div>
</div>
```

---

## 5. Style — เพิ่ม currency edit styles

```scss
// ==================== Currency Edit ====================
.currency-edit-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.currency-edit-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.currency-edit-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #888;
}

:deep(.currency-ac) {
  width: 100%;

  .p-autocomplete-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: var(--base-font-color);
    }

    &::placeholder {
      color: #bbb;
    }
  }
}
```

---

## 6. SALE_MOBILES_FLOW.md — อัปเดต Section 5 (Edit Mode)

เพิ่ม currency edit ใน edit mode description และ data properties table

---

## Verification

1. กด "แก้ไขรายการ" → currency card แสดงค่าปัจจุบันของ SO ใน input fields
2. เปลี่ยน currency unit → dropdown กรอง → เลือก → input แสดง code ("US$")
3. เปลี่ยน rate → กรอกตัวเลขใหม่
4. กด "บันทึกการแก้ไข" → API body มี `currencyUnit` และ `currencyRate` ค่าใหม่
5. กด "ยกเลิก" → ฟอร์มถูก reset — currency กลับค่าเดิม (ไม่ถูกบันทึก)
6. View mode แสดง currency ที่อัปเดตหลัง reload
7. ไม่มี local loading spinner อีกต่อไป — global LoadingOverlay จัดการแทน

---

*Last updated: 2026-02-23 — รอ confirm ก่อน implement*
