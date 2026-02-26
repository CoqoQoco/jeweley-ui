# Plan: Merge Quotation Feature — quotation-list

## Overview

ฟีเจอร์ "รวม Quotation": เลือก ≥2 ใบจาก quotation-list → ตรวจ conflict ข้อมูลส่วนหัว → ให้ user เลือกค่าที่จะใช้ → สร้าง Quotation ใหม่ด้วยเลขที่ใหม่

---

## Files ที่ต้องแก้ไข

| File | Action |
|------|--------|
| `src/views/sale/quotation-list/components/data-table-view.vue` | เพิ่ม selection mode + merge toolbar + modal |
| `src/views/sale/quotation-list/components/merge-quotation-modal.vue` | **NEW** — conflict resolution UI + items preview + confirm |
| `src/views/sale/quotation-list/quotationlist.md` | อัปเดต documentation |

> **ไม่มีการแก้ไข store หรือ backend** — ใช้ `fetchGet` + `fetchSave` ที่มีอยู่แล้ว

---

## Feature Flow (step by step)

```
1. User เช็ค checkbox ≥2 ใบ (ผ่าน DataTableWithPaging selectionMode)
2. Merge Toolbar ปรากฏเหนือตาราง: "เลือก N ใบ | [รวม N Quotation] [ยกเลิก]"
3. User กด "รวม N Quotation"
4. System fetch full data ทุกใบ (Quotation/Get parallel)
5. เปิด merge-quotation-modal
6. Modal แสดง:
   a. ถ้า conflict → radio buttons เลือกค่าจาก quotation ไหน
   b. ตารางแสดง merged items (readonly, แสดงว่ามาจาก quotation ไหน)
   c. ปุ่ม "ยืนยันการรวม" (disabled จนกว่า conflict ทั้งหมดจะ resolve แล้ว)
7. User confirm
8. System generate เลขใหม่ (QT-YYYYMMDD-HHmmss) + call Quotation/Upsert
9. Success → navigate ไป /sale-quotation?number={newNumber}
```

---

## Key Technical Facts

จาก `fetchGetQuotation` (quotation-view.vue) — structure ของ `Quotation/Get` response:
```javascript
res = {
  number: 'QT-20250101-120000',  // quotation number
  currency: 'US$',                // currencyUnit
  currencyRate: 1.5,              // currencyMultiplier
  markUp: 10,                     // markup
  discount: 5,                    // discountPercent
  freight: 0,
  date: '2025-01-01T00:00:00Z',   // quotationDate (ISO string)
  remark: '',
  customerName: '',
  customerAddress: '',
  customerPhone: '',
  customerEmail: '',
  specialDiscount: 0,
  specialAddition: 0,
  vat: 0,
  goldPerOz: 0,
  data: '[{"stockNumber":"...","qty":1,...}]'  // JSON string ของ items
}
```

จาก `fetchSaveQuotation` (quotation-view.vue) — structure ของ `Quotation/Upsert` request:
```javascript
{
  number: 'QT-YYYYMMDD-HHmmss',  // generate client-side (เหมือน generateQuotationNumber())
  customerName: '',
  customerAddress: '',
  customerPhone: '',
  customerEmail: '',
  currency: '',
  currencyRate: 1,
  markup: 0,
  discount: 0,
  freight: 0,
  date: formatISOString(date),
  remark: '',
  specialDiscount: 0,
  specialAddition: 0,
  vat: 0,
  goldPerOz: 0,
  data: JSON.stringify(items)   // items เป็น JSON string
}
```

**หมายเหตุสำคัญ**: quotation number ถูก generate client-side (`QT-{YYYYMMDD}-{HHmmss}`) ไม่ใช่ server-side

---

## 1. data-table-view.vue — การแก้ไข

### 1.1 เพิ่ม import + component

```javascript
import { defineAsyncComponent } from 'vue'
const mergeModal = defineAsyncComponent(() => import('./merge-quotation-modal.vue'))
```

### 1.2 เพิ่ม data fields

```javascript
data() {
  return {
    // ...existing
    selectedQuotations: [],
    showMergeModal: false,
    mergeQuotationsData: []
  }
}
```

### 1.3 Template — เพิ่ม merge toolbar และ selectionMode ใน BaseDataTable

```html
<!-- Merge Toolbar (conditional) -->
<div v-if="selectedQuotations.length >= 2" class="merge-toolbar">
  <span class="merge-info">
    <i class="bi bi-check2-square mr-1"></i>
    เลือก {{ selectedQuotations.length }} ใบ
  </span>
  <button class="btn btn-sm btn-warning ml-2" @click="onMergeClick">
    <i class="bi bi-diagram-2 mr-1"></i>
    รวม {{ selectedQuotations.length }} Quotation
  </button>
  <button class="btn btn-sm btn-outline-dark ml-2" @click="selectedQuotations = []">
    ยกเลิก
  </button>
</div>

<BaseDataTable
  ...existing props...
  :selectionMode="true"
  selectionType="multiple"
  v-model:itemsSelection="selectedQuotations"
  ...
>

<!-- Merge Modal -->
<mergeModal
  :isShow="showMergeModal"
  :quotations="mergeQuotationsData"
  @close="onMergeClose"
  @merge-done="onMergeDone"
/>
```

### 1.4 เพิ่ม methods

```javascript
async onMergeClick() {
  const results = await Promise.all(
    this.selectedQuotations.map(q =>
      this.quotationStore.fetchGet({ formValue: { number: q.number } })
    )
  )
  this.mergeQuotationsData = results.filter(r => r)
  this.showMergeModal = true
},

onMergeClose() {
  this.showMergeModal = false
  this.mergeQuotationsData = []
},

onMergeDone(newNumber) {
  this.showMergeModal = false
  this.selectedQuotations = []
  this.mergeQuotationsData = []
  this.$router.push({ path: '/sale-quotation', query: { number: newNumber } })
}
```

### 1.5 Style เพิ่ม

```scss
.merge-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;

  .merge-info {
    font-size: 14px;
    font-weight: 500;
  }
}
```

---

## 2. merge-quotation-modal.vue (NEW)

### 2.1 Header Fields ที่ตรวจ conflict

```javascript
const HEADER_FIELDS = [
  { key: 'customerName',    label: 'ชื่อลูกค้า',          type: 'string' },
  { key: 'customerAddress', label: 'ที่อยู่',               type: 'string' },
  { key: 'customerPhone',   label: 'เบอร์โทร',             type: 'string' },
  { key: 'customerEmail',   label: 'อีเมล',                type: 'string' },
  { key: 'currency',        label: 'สกุลเงิน',             type: 'string' },
  { key: 'currencyRate',    label: 'อัตราแลกเปลี่ยน',      type: 'number' },
  { key: 'markUp',          label: 'Markup (%)',           type: 'number' },
  { key: 'discount',        label: 'ส่วนลด (%)',           type: 'number' },
  { key: 'freight',         label: 'ค่าขนส่ง',             type: 'number' },
  { key: 'remark',          label: 'หมายเหตุ',             type: 'string' },
  { key: 'date',            label: 'วันที่ใบเสนอราคา',     type: 'date'   },
  { key: 'specialDiscount', label: 'Special Discount',    type: 'number' },
  { key: 'specialAddition', label: 'Special Addition',    type: 'number' },
  { key: 'vat',             label: 'VAT (%)',              type: 'number' },
  { key: 'goldPerOz',       label: 'Gold Per Oz',         type: 'number' }
]
```

### 2.2 Computed

```javascript
computed: {
  conflicts() {
    return HEADER_FIELDS.filter(field => {
      const values = this.quotations.map(q => q[field.key] ?? null)
      const normalized = values.map(v =>
        field.type === 'number' ? String(Number(v || 0)) : String(v ?? '')
      )
      return new Set(normalized).size > 1
    }).map(field => ({
      ...field,
      options: this.quotations.map(q => ({
        quotationNumber: q.number,
        value: q[field.key]
      }))
    }))
  },

  mergedItems() {
    return this.quotations.flatMap(q => {
      const items = q.data ? JSON.parse(q.data) : []
      return items.map(item => ({
        ...item,
        _fromQuotation: q.number,
        id: null  // reset ID เพื่อสร้างใหม่
      }))
    })
  },

  isResolved() {
    return this.conflicts.every(c => this.resolved[c.key] !== undefined)
  }
}
```

### 2.3 onConfirm method

```javascript
async onConfirm() {
  // Resolve header values
  const merged = {}
  HEADER_FIELDS.forEach(field => {
    const conflict = this.conflicts.find(c => c.key === field.key)
    merged[field.key] = conflict
      ? this.resolved[field.key]
      : (this.quotations[0]?.[field.key] ?? null)
  })

  // Generate new quotation number (same pattern as generateQuotationNumber)
  const now = dayjs()
  const newNumber = `QT-${now.format('YYYYMMDD')}-${now.format('HHmmss')}`

  // Clean items (remove _fromQuotation helper)
  const items = this.mergedItems.map(({ _fromQuotation, ...rest }) => rest)

  const formValue = {
    number: newNumber,
    customerName:    merged.customerName    || '',
    customerAddress: merged.customerAddress || '',
    customerPhone:   merged.customerPhone   || '',
    customerEmail:   merged.customerEmail   || '',
    currency:        merged.currency        || '',
    currencyRate:    Number(merged.currencyRate    || 1),
    markup:          Number(merged.markUp          || 0),
    discount:        Number(merged.discount        || 0),
    freight:         Number(merged.freight         || 0),
    date:            merged.date ? formatISOString(new Date(merged.date)) : formatISOString(new Date()),
    remark:          merged.remark          || '',
    specialDiscount: Number(merged.specialDiscount || 0),
    specialAddition: Number(merged.specialAddition || 0),
    vat:             Number(merged.vat             || 0),
    goldPerOz:       Number(merged.goldPerOz       || 0),
    data:            JSON.stringify(items)
  }

  const res = await this.quotationStore.fetchSave({ formValue })
  if (res) {
    success('รวม Quotation สำเร็จ', `เลขที่ใหม่: ${newNumber}`)
    this.$emit('merge-done', newNumber)
  }
}
```

### 2.4 Template Layout

```
┌─────────────────────────────────────────────────────────┐
│ Dialog Header: "รวม Quotation"                           │
├─────────────────────────────────────────────────────────┤
│ [ถ้ามี conflict]                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠️ ข้อมูลที่แตกต่างกัน — กรุณาเลือก                 │ │
│ │                                                     │ │
│ │ ชื่อลูกค้า:                                         │ │
│ │   ○ QT-20250101-120000: นาย ก                      │ │
│ │   ○ QT-20250101-130000: นาย ข                      │ │
│ │                                                     │ │
│ │ สกุลเงิน:                                           │ │
│ │   ○ QT-20250101-120000: US$                        │ │
│ │   ○ QT-20250101-130000: EUR                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [ถ้าไม่มี conflict]                                      │
│ ✅ ข้อมูลส่วนหัวของทุกใบตรงกัน ไม่มีข้อมูลขัดแย้ง     │
│                                                          │
│ รายการสินค้าที่จะรวม (N รายการ)                         │
│ ┌────────┬───────────┬──────────────┬─────┬──────────┐  │
│ │ จาก   │ Stock No. │ ชื่อสินค้า   │ Qty │ ราคา     │  │
│ ├────────┼───────────┼──────────────┼─────┼──────────┤  │
│ │ QT-A  │ ST001     │ แหวน         │ 2   │ 1,500    │  │
│ │ QT-B  │ ST002     │ สร้อย        │ 1   │ 2,000    │  │
│ └────────┴───────────┴──────────────┴─────┴──────────┘  │
├─────────────────────────────────────────────────────────┤
│ [Footer]            [ยกเลิก]  [ยืนยันการรวม (N รายการ)] │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Imports ที่ต้องใช้ใน merge-quotation-modal.vue

```javascript
import Dialog from 'primevue/dialog'
import dayjs from 'dayjs'
import { formatISOString } from '@/services/utils/dayjs.js'
import { success } from '@/services/alert/sweetAlerts.js'
import { usrQuotationApiStore } from '@/stores/modules/api/sale/quotation-store.js'
```

---

## 4. Verification Steps

1. เปิด `/sale-quotation-list`
2. เลือก 1 ใบ → ปุ่ม Merge **ไม่** ปรากฏ (ต้องการ ≥2)
3. เลือก 2+ ใบ → Merge Toolbar ปรากฏ พร้อมจำนวน
4. กด "รวม" → modal เปิด
5. ถ้า conflict (เช่น ต่าง currency) → radio buttons แสดง
6. ถ้าไม่ conflict → ข้อความสีเขียว + ตาราง items
7. items ของทุก quotation รวมกันใน merged items table
8. ปุ่ม "ยืนยัน" disabled จนกว่า conflicts ทั้งหมดจะ resolved
9. กด "ยืนยัน" → navigate ไปหน้า quotation ใหม่
10. Quotation ใหม่มี items ครบจากทุก quotation + header ที่ resolve แล้ว

---

*Plan date: 2026-02-26*
