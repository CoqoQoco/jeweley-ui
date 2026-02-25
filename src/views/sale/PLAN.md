# Plan: Export Excel Button — quotation-view.vue

## สรุป

เพิ่มปุ่ม **Export Excel** ใน `quotation-view.vue` ที่ download ไฟล์ `.xlsx` โดยตรง
ใช้ `InvoiceExcelBuilder` ที่มีอยู่แล้ว (เดียวกับ `invoice-detail/index-view.vue`)

---

## Files ที่ต้องแก้ไข

| File | Action |
|------|--------|
| `src/views/sale/quotation/components/quotation-view.vue` | เพิ่ม import + button + method |

---

## 1. Import เพิ่มใน `<script>`

```javascript
import { InvoiceExcelBuilder } from '@/services/helper/excel/invoice/invoice-excel-builder.js'
```

(`dayjs` import อยู่แล้ว — ไม่ต้องเพิ่ม)

---

## 2. เพิ่ม data field

```javascript
isExportingExcel: false
```

---

## 3. เพิ่ม method `exportQuotationExcel()`

```javascript
async exportQuotationExcel() {
  if (!this.customer.quotationItems || this.customer.quotationItems.length === 0) {
    warning('ไม่มีสินค้าสำหรับสร้าง Excel')
    return
  }
  this.isExportingExcel = true

  const customer = {
    name: this.customer.name || '',
    address: this.customer.address || '',
    phone: this.customer.tel || '',
    email: this.customer.email || ''
  }

  const saleOrderData = {
    number: this.customer.invoiceNumber || '',
    specialDiscount: this.customer.specialDiscount || 0,
    specialAddition: this.customer.specialAddition || 0,
    freightAndInsurance: this.customer.freight || 0,
    vatPercent: this.customer.vatPercent || 0
  }

  const builder = new InvoiceExcelBuilder(
    this.customer.quotationItems,
    customer,
    this.customer.quotationDate || new Date(),
    saleOrderData,
    this.customer.currencyUnit || 'US$',
    this.customer.currencyMultiplier || 1,
    this.customer.invoiceNumber || `QT-${dayjs().format('YYYYMMDD_HHmmss')}`
  )

  await builder.downloadExcel()
  this.isExportingExcel = false
},
```

import `warning` จาก sweetAlerts:
```javascript
import { warning } from '@/services/alert/sweetAlerts.js'
```
(ถ้ายังไม่มี import นี้ — ตรวจสอบก่อน)

---

## 4. เพิ่มปุ่มใน Template

วางในกลุ่มปุ่ม action (บรรทัด 752-770) ระหว่าง "Preview Quotation" กับ "Breakdown File":

```html
<button
  class="btn btn-sm btn-outline-secondary"
  type="button"
  @click="exportQuotationExcel"
  :disabled="customer.quotationItems.length === 0 || isExportingExcel"
>
  <span v-if="isExportingExcel" class="spinner-border spinner-border-sm mr-1"></span>
  <i v-else class="bi bi-file-earmark-excel mr-1"></i>
  <span>{{ isExportingExcel ? 'กำลังสร้าง...' : 'Export Excel' }}</span>
</button>
```

---

## 5. ผลลัพธ์ Action Buttons (หลังแก้ไข)

```
[ Quotation File ]  [ Preview Quotation ]  [ Export Excel ]  [ Breakdown File ]  [ Save Quotation ]
```

---

## Verification

1. เปิดหน้า Quotation → เพิ่มสินค้า
2. กด "Export Excel" → browser download `.xlsx`
3. เปิดไฟล์ → ข้อมูลสินค้า, ลูกค้า, ราคา ถูกต้อง
4. สินค้า = 0 → ปุ่ม disabled + warning แสดง
5. ระหว่าง export → ปุ่ม disabled + spinner

---

*Plan date: 2026-02-25*
