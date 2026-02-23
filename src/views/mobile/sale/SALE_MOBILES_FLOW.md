# Mobile Sale Flow Documentation

ระบบงานขาย Mobile สำหรับ Jewelry Management System

**Web Sale Flow**: ดู `src/views/sale/SALES_FLOW.md`
**Mobile Layout**: `src/layout/mobile/LayoutMobile.vue`
**UI Framework**: ✅ PrimeVue — same as Web (Generic wrappers preferred: AutoCompleteGeneric, CalendarGeneric)
**SCSS**: `@import '@/assets/scss/responsive-style/mobile'`

---

## Flow Overview

```
SO List (index-view.vue)
  ├── Tab: Sale Orders → ดูรายการ SO
  │     ├── สร้าง SO ใหม่ (create-view.vue)
  │     └── ดู/แก้ไข SO (detail-view.vue)
  │           ├── แก้ไข items (edit mode)
  │           ├── Print SO PDF
  │           └── สร้าง Invoice (invoice-creation-form.vue)
  └── Tab: Invoices → ดูรายการ Invoice
        └── ดู Invoice detail (invoice-detail-view.vue)
              └── Print Invoice PDF
```

---

## 1. Routes

| Path | Route Name | Component | Permission |
|------|-----------|-----------|------------|
| `/mobile/sale` | `mobile-sale` | `index-view.vue` | `mobile:sale` |
| `/mobile/sale/create` | `mobile-sale-create` | `create-view.vue` | `mobile:sale` |
| `/mobile/sale/detail/:soNumber` | `mobile-sale-detail` | `detail-view.vue` | `mobile:sale` |
| `/mobile/sale/invoice/:invoiceNumber` | `mobile-invoice-detail` | `invoice-detail-view.vue` | `mobile:sale` |

---

## 2. File Structure

```
src/views/mobile/sale/
  index-view.vue                          -- รายการ SO + Invoice (tab view)
  create-view.vue                         -- สร้าง SO ใหม่
  detail-view.vue                         -- ดู/แก้ไข SO + สร้าง Invoice
  components/
    invoice-creation-form.vue             -- form สร้าง Invoice จาก SO
    invoice-detail-view.vue               -- ดู Invoice detail + print PDF
    add-item-method-selector.vue          -- เลือกวิธีเพิ่ม item (Appraisal/Scan)
    appraisal-job-list.vue                -- รายการงานตีราคา
    customer-form.vue                     -- form ข้อมูลลูกค้า
    item-list.vue                         -- รายการ items (editable)
    so-item-card.vue                      -- card แสดง item (read-only)
    so-summary.vue                        -- สรุปยอด SO
    qr-scanner.vue                        -- QR code scanner
```

---

## 3. index-view.vue — รายการ SO + Invoice

### หน้าที่
แสดงรายการ Sale Orders และ Invoices ในรูปแบบ Tab — เป็นหน้าแรกของ Mobile Sale

### Data Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `activeTab` | string | `'so'` | Tab ปัจจุบัน ('so' หรือ 'invoice') |
| `pageSize` | number | `20` | จำนวนต่อหน้า |
| `soList` | array | `[]` | รายการ SO |
| `soPage` | number | `0` | หน้าปัจจุบัน SO |
| `soHasMore` | boolean | `true` | มีข้อมูลเพิ่มเติม |
| `invoiceList` | array | `[]` | รายการ Invoice |
| `invoicePage` | number | `0` | หน้าปัจจุบัน Invoice |
| `invoiceHasMore` | boolean | `true` | มีข้อมูลเพิ่มเติม |

### API Calls

| Action | API | Filter |
|--------|-----|--------|
| Load SO List | `SaleOrder/List` | CreateBy = currentUsername, sort: createDate desc |
| Load Invoice List | `Invoice/List` | CreateBy = currentUsername, sort: createDate desc |

### Features
- **Lazy loading**: โหลดข้อมูล tab แรกเมื่อ mounted, โหลด tab อื่นเมื่อสลับ
- **Pagination**: กด "โหลดเพิ่ม" เพื่อดึงหน้าถัดไป
- **Status badge**: แสดงสีตาม status (Draft=เทา, Confirm=น้ำเงิน, Invoice/Paid=เขียว, Cancel=แดง)
- **Sticky Create button**: ปุ่มสร้าง SO ใหม่ (แสดงเฉพาะ tab SO)

### Navigation
- กด SO card → `mobile-sale-detail` (params: soNumber)
- กด Invoice card → `mobile-invoice-detail` (params: invoiceNumber)
- กดปุ่มสร้าง → `/mobile/sale/create`

---

## 4. create-view.vue — สร้าง SO ใหม่

### หน้าที่
สร้าง Sale Order ใหม่ — เพิ่ม items, ตั้งค่าสกุลเงิน, กรอกข้อมูลลูกค้า

### Data Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `addItemTab` | string | `'appraisal'` | วิธีเพิ่ม item ('appraisal' หรือ 'scan') |
| `scanInput` | string | `''` | ค่า input สำหรับ scan/search |
| `searchField` | string | `'stockNumber'` | field ค้นหา ('stockNumber' หรือ 'stockNumberOrigin') |
| `items` | array | `[]` | รายการ items ที่เพิ่ม |
| `currencyUnit` | string | `'US$'` | สกุลเงิน |
| `currencyRate` | number | `33.0` | อัตราแลกเปลี่ยน |
| ~~`markup`~~ | ~~number~~ | ~~`3.5`~~ | ~~Markup multiplier~~ — **commented out (ยังไม่ได้ใช้)** |
| ~~`goldPerOz`~~ | ~~number~~ | ~~`2000`~~ | ~~ราคาทอง US$/oz~~ — **commented out (ยังไม่ได้ใช้)** |
| `customer` | object | `{}` | ข้อมูลลูกค้า (customerCode, customerName, customerTel, customerEmail, customerAddress, remark) |
| `refQuotation` | string | `''` | เลข Quotation ที่อ้างอิง (จาก query param `fromQuotation`) |
| `quotationFinancials` | object | `{ specialDiscount: 0, specialAddition: 0, vat: 0, freight: 0 }` | ค่า financial จาก Quotation (ส่งตอน save) |

### วิธีเพิ่ม Items

1. **Appraisal Jobs** — เลือกจากรายการงานตีราคา (AppraisalJobList component)
2. **Scan/Search** — สแกน QR code หรือพิมพ์ค้นหาตาม stockNumber/stockNumberOrigin

### Action Buttons (3 ปุ่ม)

| ปุ่ม | Method | Action |
|------|--------|--------|
| บันทึกใบสั่งขาย | `createSaleOrderOnly()` | Validate → สร้าง SO → navigate ไป detail |
| สร้าง SO + ออก Invoice | `createSaleOrderAndInvoice()` | Validate → สร้าง SO → navigate ไป detail พร้อม `?openInvoice=true` (auto-open invoice form) |
| ยกเลิก | `cancelCreate()` | `$router.back()` |

### Save Order Logic (`saveOrder(status)`)

`saveOrder()` return `soNumber` (ไม่ navigate เอง — caller จัดการ navigate)

สร้าง formValue ส่ง API:

```javascript
formValue = {
  soNumber: null,               // null = create new
  soDate: new Date().toISOString(),
  deliveryDate: null,
  refQuotation: '',
  priority: status === 'Draft' ? 'Normal' : 'Normal',
  data: JSON.stringify({ stockItems, copyItems }),
  customerName: customer.customerName,
  customerCode: customer.customerCode,
  customerAddress: customer.customerAddress,
  customerTel: customer.customerTel,
  customerEmail: customer.customerEmail,
  customerRemark: customer.remark,
  currencyUnit: currencyUnit,
  currencyRate: currencyRate,
  markup: markup || null,
  goldRate: goldPerOz || null,
  specialDiscount: null,
  specialAddition: null,
  vat: null,
  freight: null,
  remark: ''
}
```

### API Calls

| Action | API |
|--------|-----|
| ค้นหา product | `StockProduct/Get` (by stockNumber or stockNumberOrigin) |
| บันทึก SO | `SaleOrder/Upsert` (soNumber = null → create) |

### Items แยก 2 กลุ่ม
- **stockItems**: items ที่มี `stockNumber` จริง (จากคลัง)
- **copyItems**: items ที่ไม่มี `stockNumber` (ต้องผลิต)

### ความแตกต่างจาก Web
| Feature | Web | Mobile |
|---------|-----|--------|
| Search Quotation | มี (ค้นหาเลข Quotation → โหลด items) | **มี** (navigate จาก Quotation detail → pre-fill items + currency + customer display) |
| Confirm Stock | มี (ConfirmStockModal) | **ไม่มี** (ทำใน Invoice creation) |
| Special Discount/Addition/VAT inputs | มี input ในหน้า SO | **ไม่มี input** (ส่ง null) |
| Freight input | มี | **ไม่มี** (ส่ง null) |
| Priority selector | มี | **ไม่มี** (default Normal) |
| Markup / Gold Per Oz | มี | **ซ่อนไว้ก่อน** (commented out — ยังไม่ได้ใช้ตอนนี้) |

---

## 5. detail-view.vue — ดู/แก้ไข SO

### หน้าที่
แสดงรายละเอียด SO — สลับ view/edit mode, สร้าง Invoice, print PDF

### Data Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `soData` | object | `null` | ข้อมูล SO จาก API |
| `stockItems` | array | `[]` | items ที่มี stockNumber |
| `copyItems` | array | `[]` | items ที่ไม่มี stockNumber |
| `isEditing` | boolean | `false` | edit mode |
| `editItems` | array | `[]` | working copy ของ items ที่แก้ไขได้ |
| `showInvoiceForm` | boolean | `false` | แสดง form สร้าง Invoice |
| `exportingPDF` | boolean | `false` | กำลัง generate PDF |

### Computed Properties — Financial Summary

```
currentTotalAmountTHB = SUM( appraisalPrice * (1 - discountPercent/100) * qty )
displayTotalAmount    = currentTotalAmountTHB / currencyRate

hasFinancialFields    = specialDiscount > 0 || specialAddition > 0 || freight > 0 || vat > 0
soTotalAfterSpecial   = displayTotalAmount - specialDiscount + specialAddition
soTotalBeforeVat      = soTotalAfterSpecial + freight
soVatAmount           = soTotalBeforeVat * (vat / 100)
soGrandTotal          = hasFinancialFields ? soTotalBeforeVat + soVatAmount : displayTotalAmount
```

### View Mode Features
- แสดง SO info card (เลขที่, วันที่สร้าง, สกุลเงิน)
- แสดง Customer info card (ถ้ามี)
- แสดง items list (read-only, SoItemCard component)
- **Financial Summary**: แสดงเฉพาะ fields ที่มีค่า > 0
  - F.O.B Bangkok (ยอดรวม)
  - ส่วนลดพิเศษ (สีแดง)
  - ส่วนเพิ่มพิเศษ (สีเขียว)
  - ค่าขนส่ง (Freight)
  - Total before VAT
  - VAT (%)
  - Grand Total
- แสดง Remark (ถ้ามี)
- แสดง Invoice info (ถ้ามี invoiceNumber)

### Edit Mode Features
- **Invoiced items**: แสดงแบบ locked (แก้ไข/ลบไม่ได้)
- **Editable items**: items ที่ยังไม่มี invoice — เพิ่ม/แก้ไข/ลบได้
- เพิ่ม item ด้วย Appraisal หรือ Scan (เหมือน create-view)
- ตรวจ duplicate กับทั้ง invoicedItems + editItems

### Save Changes Logic (`saveChanges()`)

รวม invoicedItems + editItems → สร้าง formValue:

```javascript
formValue = {
  soNumber: soData.soNumber,    // มีค่า = update
  soDate: soData.soDate || soData.createDate,
  deliveryDate: soData.deliveryDate,
  refQuotation: soData.refQuotation,
  data: JSON.stringify({ stockItems, copyItems }),
  customerName: soData.customerName,
  customerCode: soData.customerCode,
  // ... customer fields ...
  currencyUnit: soData.currencyUnit,
  currencyRate: soData.currencyRate,
  markup: soData.markup,
  goldRate: soData.goldRate,
  specialDiscount: soData.specialDiscount,
  specialAddition: soData.specialAddition,
  vat: soData.vat,
  freight: soData.freight,
  remark: soData.remark
}
```

**สำคัญ**: ใช้ค่าเดิมจาก `soData` สำหรับ fields ที่ไม่ได้แก้ไขใน mobile (specialDiscount, specialAddition, vat, freight, markup, goldRate) เพื่อไม่ให้ข้อมูลหาย

### Action Buttons

| ปุ่ม | เมื่อไหร่ | Action |
|------|----------|--------|
| แก้ไข | view mode, ไม่ใช่ทุก item invoiced | เข้า edit mode |
| Print PDF | view mode | สร้าง SO PDF (SaleOrderPdfBuilder) |
| Confirm Stock + ออก Invoice | view mode, มี items ยังไม่ confirm | เปิด InvoiceCreationForm (auto-confirm ตอนสร้าง) |
| ออก Invoice | view mode, items confirm แล้วแต่ยังไม่ invoice | เปิด InvoiceCreationForm |
| ออก Invoice แล้วทั้งหมด | view mode, ทุก item มี invoice | disabled |
| บันทึก | edit mode | `SaleOrder/Upsert` (update) |
| ยกเลิก | edit mode | กลับ view mode |

### Auto-open Invoice Form (query parameter)

เมื่อ `mounted()` ถ้า `$route.query.openInvoice === 'true'` → `showInvoiceForm = true` อัตโนมัติ
(ใช้เมื่อ create-view navigate มาพร้อม `?openInvoice=true`)

### Computed: `hasUnconfirmedItems`

```javascript
hasUnconfirmedItems = stockItems.some(item => item.stockNumber && !item.isConfirm && !item.isInvoice)
```
ใช้กำหนดข้อความปุ่ม Invoice ตามสถานะ

### API Calls

| Action | API |
|--------|-----|
| โหลด SO | `SaleOrder/Get` (by soNumber) |
| ค้นหา product | `StockProduct/Get` |
| บันทึกแก้ไข | `SaleOrder/Upsert` |
| Print PDF | SaleOrderPdfBuilder (frontend only) |

---

## 6. invoice-creation-form.vue — สร้าง Invoice

### หน้าที่
สร้าง Invoice จาก SO — เลือก items, กำหนดส่วนลด/VAT, ชำระเงิน

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `soData` | object | Yes | ข้อมูล SO |
| `stockItems` | array | No | items ที่มี stockNumber |

### Emits

| Event | Description |
|-------|-------------|
| `invoice-created` | Invoice สร้างสำเร็จ |
| `cancel` | ยกเลิก |

### Data Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `selectedItems` | array | `[]` | stockNumbers ที่เลือก |
| `specialDiscount` | number | `0` | ส่วนลดพิเศษ (pre-fill จาก SO) |
| `specialAddition` | number | `0` | ส่วนเพิ่มพิเศษ (pre-fill จาก SO) |
| `freightAndInsurance` | number | `0` | ค่าขนส่ง (pre-fill จาก SO) |
| `vatPercent` | number | `0` | VAT % (pre-fill จาก SO) |
| `depositAmount` | number | `0` | เงินมัดจำ |
| `paymentMethod` | string | `'cash'` | วิธีชำระเงิน |
| `paymentDays` | number | `0` | ระยะเวลาชำระ (วัน) |
| `dkInvoiceNumber` | string | `null` | เลข Invoice ลูกค้า (optional) |

### Pre-fill จาก SO (mounted)

```javascript
mounted() {
  // Auto-select ทุก available items
  this.selectedItems = availableItems.map(item => item.stockNumber)

  // Pre-fill financial fields จาก SO
  this.specialDiscount = Number(this.soData?.specialDiscount) || 0
  this.specialAddition = Number(this.soData?.specialAddition) || 0
  this.freightAndInsurance = Number(this.soData?.freight) || 0
  this.vatPercent = Number(this.soData?.vat) || 0
}
```

### Financial Calculation

```
totalSelectedAmount                = SUM( price * (1 - discount/100) / currencyRate * qty )
totalAfterDiscountAndAddition      = totalSelectedAmount - specialDiscount + specialAddition
totalBeforeVat                     = totalAfterDiscountAndAddition + freightAndInsurance
vatAmount                          = totalBeforeVat * (vatPercent / 100)
grandTotal                         = totalBeforeVat + vatAmount
remaining                          = grandTotal - depositAmount
```

### Create Invoice Logic (`createInvoice()`)

1. **Confirm unconfirmed items**: items ที่ยังไม่ confirm → เรียก `SaleOrder/ConfirmStockItems` ก่อน
2. **Build invoice items**: map selected items พร้อม currency conversion
3. **Call API**: `Invoice/Create` พร้อม financial fields + payment info

```javascript
// Per-item data ที่ส่ง
invoiceItems = selectedItems.map(item => ({
  stockNumber: item.stockNumber,
  productNumber: item.productNumber,
  appraisalPrice: convertedPrice,    // price / currencyRate
  discountPercent: item.discountPercent || 0,
  qty: item.qty || 1,
  markup: Number(soData?.markup) || 0,
  goldRate: Number(soData?.goldRate) || 0
}))

// Form data ที่ส่ง
formValue = {
  soNumber, dkInvoiceNumber,
  customerCode, customerName, customerAddress, customerTel, customerEmail,
  currencyUnit, currencyRate,
  deliveryDate, deposit: depositAmount,
  goldRate: Number(soData?.goldRate) || 0,
  markup: Number(soData?.markup) || 0,
  payment: paymentCode,
  paymentName: paymentMethod,
  paymentDay: paymentDays,
  refQuotation: soData?.refQuotation || '',
  specialDiscount, specialAddition,
  freightAndInsurance, vat: vatPercent,
  items: invoiceItems
}
```

### Payment Methods

| Value | Label |
|-------|-------|
| `cash` | เงินสด |
| `transfer` | โอนเงิน |
| `cheque` | เช็ค |
| `credit_card` | บัตรเครดิต |
| `credit_term` | เครดิต (กำหนดวัน) |

### API Calls

| Action | API |
|--------|-----|
| Confirm items | `SaleOrder/ConfirmStockItems` |
| สร้าง Invoice | `Invoice/Create` |

### ความแตกต่างจาก Web (invoice-modal.vue)

| Feature | Web | Mobile |
|---------|-----|--------|
| Auto-confirm | **ไม่มี** (ต้อง confirm ก่อนแยก) | **มี** (auto-confirm ตอนสร้าง Invoice) |
| DK Invoice Number | มี input | มี input |
| Item selection | Checkbox per item | Checkbox per item |
| Financial fields | Pre-fill จาก SO | Pre-fill จาก SO |
| Payment info | มี | มี |
| Remark | มี | **ไม่มี** |

---

## 7. invoice-detail-view.vue — ดู Invoice

### หน้าที่
แสดงรายละเอียด Invoice — ดู items, financial summary, print PDF

### Data Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `invoiceData` | object | `null` | ข้อมูล Invoice จาก API |
| `invoiceItems` | array | `[]` | items ใน Invoice |
| `soData` | object | `null` | ข้อมูล SO ที่เกี่ยวข้อง |
| `showPrintForm` | boolean | `false` | แสดง form กำหนดเลขที่ print |
| `printInvoiceNumber` | string | `''` | เลข Invoice สำหรับ print |
| `printInvoiceDate` | string | `''` | วันที่ สำหรับ print |
| `exportingPDF` | boolean | `false` | กำลัง generate PDF |

### Load Invoice Logic (`loadInvoiceData()`)

1. Fetch Invoice data (`Invoice/Get`)
2. Fetch SO data (`SaleOrder/Get`) → ต้องการ items data + currency info
3. Merge currency info จาก SO ถ้า Invoice ไม่มี
4. Parse SO data JSON → filter เฉพาะ items ที่อยู่ใน confirmedItems
5. Map stockConfirm data (price, qty, discount) ลง invoice items

### Financial Calculation

```
totalSelectedAmount            = SUM( price * (1 - discount/100) / currencyRate * qty )
totalAfterDiscountAndAddition  = totalSelectedAmount - specialDiscount + specialAddition
totalBeforeVat                 = totalAfterDiscountAndAddition + freightAndInsurance
vatAmount                      = totalBeforeVat * (vatPercent / 100)
grandTotal                     = totalBeforeVat + vatAmount
```

### Print PDF Feature
- กด "Print Invoice" → เปิด form inline (ไม่ใช่ modal)
- กำหนดเลข Invoice + วันที่ (สำหรับ print เท่านั้น ไม่เปลี่ยนใน DB)
- กด Generate PDF → `invoicePdfService.generateInvoicePDF()`

### Action Buttons

| ปุ่ม | Action |
|------|--------|
| พิมพ์ Invoice | เปิด form กำหนดเลข + วันที่ → generate PDF |
| ยกเลิก Invoice + Confirm | `handleCancelInvoice()` — confirm dialog → delete invoice → unconfirm stock → navigate ไป SO detail |
| ย้อนกลับ | `$router.back()` |

### Cancel Invoice Logic (`handleCancelInvoice()`)

```
1. confirmSubmit() — ถามยืนยัน
2. Invoice/Delete — soft-delete invoice (ลบ invoice link จาก SO products)
3. SaleOrder/UnconfirmStockItems — คืน stock (try-catch: ถ้า fail ก็ navigate ออกเพราะ invoice ลบแล้ว)
4. success() พร้อม callback → Navigate ไป SO detail หลัง user กดตกลง
```

**สำคัญ**:
- Step 3 ครอบ try-catch เพราะ invoice ถูกลบแล้ว (step 2) → ต้อง navigate ออกเสมอไม่ว่า unconfirm จะสำเร็จหรือไม่
- `$router.push()` อยู่ใน callback ของ `success()` เพื่อรอ user กดตกลงก่อนค่อย navigate (ป้องกัน iOS Safari navigation issues ขณะ SweetAlert เปิดอยู่)

**Backend Behavior**:
| API | สิ่งที่เกิดขึ้น |
|-----|--------------|
| `Invoice/Delete` | set `IsDelete=true`, clear Invoice/InvoiceItem/DkInvoiceNumber จาก TbtSaleOrderProduct → items กลับเป็น confirmed (ไม่มี invoice) |
| `SaleOrder/UnconfirmStockItems` | ลบ TbtSaleOrderProduct records, คืน QtySale → items กลับเป็น unconfirmed |

### API Calls

| Action | API |
|--------|-----|
| โหลด Invoice | `Invoice/Get` (by invoiceNumber) |
| โหลด SO (สำหรับ items) | `SaleOrder/Get` (by soNumber) |
| Print PDF | invoicePdfService (frontend only) |
| ยกเลิก Invoice | `Invoice/Delete` (soft-delete) |
| คืน stock | `SaleOrder/UnconfirmStockItems` |

### ความแตกต่างจาก Web (invoice-detail/index-view.vue)

| Feature | Web | Mobile |
|---------|-----|--------|
| Invoice Versions | มี (สร้าง version ใหม่ด้วย rate ใหม่) | **ไม่มี** |
| Payment Records | มี (บันทึก/ดู/ลบ การชำระเงิน) | **ไม่มี** |
| Cancel/Delete Invoice | มี | **มี** (ยกเลิก Invoice + Unconfirm Stock) |
| Delivery Note PDF | มี | **ไม่มี** |
| Export Excel | มี | **ไม่มี** |
| Print customization | Modal | Inline form |
| Item editing | ไม่ได้ (read-only) | ไม่ได้ (read-only) |

---

## 8. Components

### Reusable Components

| Component | File | ใช้ใน | หน้าที่ |
|-----------|------|-------|---------|
| AddItemMethodSelector | `add-item-method-selector.vue` | create-view, detail-view | เลือก Appraisal/Scan |
| AppraisalJobList | `appraisal-job-list.vue` | create-view, detail-view | รายการงานตีราคา |
| ItemList | `item-list.vue` | create-view, detail-view (edit) | แสดง/แก้ไข items |
| SoItemCard | `so-item-card.vue` | detail-view (view), invoice-detail | แสดง item (read-only) |
| CustomerForm | `customer-form.vue` | create-view | form ข้อมูลลูกค้า |
| SoSummary | `so-summary.vue` | create-view | สรุปยอด |
| QrScanner | `qr-scanner.vue` | create-view, detail-view | QR code scanner |

### InvoiceCreationForm
ดู Section 6 ด้านบน

### InvoiceDetailView
ดู Section 7 ด้านบน

---

## 9. Pinia Stores ที่ใช้

| Store | Store ID | ใช้ใน |
|-------|----------|-------|
| Sale Order | `usrSaleOrderApiStore` | ทุกหน้า |
| Invoice | `useInvoiceApiStore` | index, invoice-creation-form, invoice-detail |
| Stock Product | `usrStockProductApiStore` | create-view, detail-view (search product) |
| Auth | `useAuthStore` | index-view (currentUsername) |

---

## 10. Data Flow: Quotation → SO → Invoice (Mobile)

### สร้าง SO จาก Mobile
```
create-view.vue
  ├── เพิ่ม items (Appraisal / Scan / Quotation)
  ├── ตั้งค่า currencyUnit, currencyRate, markup, goldPerOz
  ├── กรอกข้อมูลลูกค้า
  └── Save → SaleOrder/Upsert (soNumber = null → create)
```

### สร้าง SO จาก Quotation (Mobile)
```
Quotation detail-view.vue
  └── กดปุ่ม "สร้างใบสั่งขาย"
      └── $router.push({ name: 'mobile-sale-create', query: { fromQuotation: number } })

create-view.vue (mounted)
  ├── ตรวจ $route.query.fromQuotation
  ├── เรียก quotationStore.fetchGet({ number })
  ├── Pre-fill: items (source='quotation'), currency, customer display, financials
  ├── แสดง banner "อ้างอิงใบเสนอราคา: QUO-XXX"
  ├── ⚠️ User ต้องเลือกลูกค้าจาก CustomerForm search modal (ได้ customerCode)
  └── Save → SaleOrder/Upsert พร้อม refQuotation + financials จาก quotation
```

### แก้ไข SO จาก Mobile
```
detail-view.vue (edit mode)
  ├── items ที่มี Invoice แล้ว → locked (แก้ไขไม่ได้)
  ├── items ที่ยังไม่มี Invoice → แก้ไข/ลบ/เพิ่มได้
  ├── ใช้ค่า financial fields เดิมจาก soData (ไม่ overwrite)
  └── Save → SaleOrder/Upsert (soNumber มีค่า → update)
```

### สร้าง Invoice จาก Mobile
```
invoice-creation-form.vue
  ├── เลือก items ที่ต้องการ
  ├── Auto-confirm items ที่ยังไม่ confirm
  ├── Pre-fill financial fields จาก SO
  ├── กรอก payment info
  └── Create → Invoice/Create
```

### Financial Fields Flow
```
SO (Web สร้าง):
  specialDiscount, specialAddition, vat, freight, markup, goldRate
    ↓ (pre-fill)
Invoice (Mobile สร้าง):
  specialDiscount, specialAddition, freightAndInsurance, vatPercent, markup, goldRate
    ↓ (โหลดดู)
Invoice Detail (Mobile ดู):
  แสดง financial summary ครบ
```

---

## 11. ความแตกต่างหลัก Mobile vs Web

### Features ที่ Mobile มี
- สร้าง SO ใหม่ (items + currency + customer)
- แก้ไข SO (เพิ่ม/ลบ items)
- สร้าง Invoice จาก SO (พร้อม auto-confirm)
- ดู Invoice detail
- Print SO PDF / Invoice PDF
- QR code scan เพื่อเพิ่ม item
- ~~Markup / Gold Per Oz inputs ตอนสร้าง SO~~ (commented out — ยังไม่ได้ใช้)
- Financial summary ครบ (F.O.B, discount, addition, freight, VAT, grand total)
- โหลด items จาก Quotation (navigate จาก Quotation detail → pre-fill items, currency, customer display, financials)

### Features ที่ Mobile ยังไม่มี
| Feature | Priority | หมายเหตุ |
|---------|----------|----------|
| Input specialDiscount/Addition/VAT ตอนสร้าง SO | Low | ใส่ได้ตอนสร้าง Invoice |
| Input freight ตอนสร้าง SO | Low | ใส่ได้ตอนสร้าง Invoice |
| Confirm/Unconfirm Stock แยก | Low | Mobile auto-confirm ตอนสร้าง Invoice |
| Invoice Versions | Low | Phase 2 |
| Payment Records (บันทึกชำระเงิน) | Medium | Phase 2 |
| ~~Cancel/Delete Invoice~~ | ~~Low~~ | **Implemented** — ยกเลิก Invoice + Unconfirm Stock |
| Delivery Note PDF | Low | Phase 2 |
| Export Excel | Low | Phase 2 |
| แสดง SO Date (soDate) ใน detail | Low | มีข้อมูลแต่ไม่แสดง |
| Invoice list filter/search | Low | ปัจจุบันแสดงทั้งหมด (filter by CreateBy) |

### UI/UX Differences
| Aspect | Web | Mobile |
|--------|-----|--------|
| UI Framework | PrimeVue (DataTable, Dropdown, etc.) | Native HTML |
| Layout | Fixed sidebar + content area | Bottom nav + full-screen content |
| Items display | DataTable with columns | Card-based list |
| Modals | PrimeVue Dialog | Inline sections / full-screen |
| Date picker | PrimeVue Calendar | Native `<input type="date">` |
| Dropdown | PrimeVue Dropdown | Native `<select>` |

---

## 12. CSS Conventions

### Safe Area (iOS Safari)
```scss
// ทุก view ต้องมี padding-bottom สำหรับ bottom nav + safe area
.mobile-view {
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

// Sticky button ต้องอยู่เหนือ bottom nav
.sticky-btn {
  position: fixed;
  bottom: calc(70px + env(safe-area-inset-bottom, 0px));
}
```

### Status Colors
```javascript
getStatusColor(statusName) {
  switch (statusName?.toLowerCase()) {
    case 'draft':    return '#9e9e9e'  // เทา
    case 'confirm':  return '#2196f3'  // น้ำเงิน
    case 'invoice':
    case 'paid':     return '#4caf50'  // เขียว
    case 'cancel':   return '#f44336'  // แดง
    default:         return '#9e9e9e'
  }
}
```

### Financial Summary Colors
- ส่วนลดพิเศษ: `color: #f44336` (แดง)
- ส่วนเพิ่มพิเศษ: `color: #4caf50` (เขียว)

---

---

## 13. Shared Components & Constants

### Currency Unit Field — AutoCompleteGeneric + CURRENCY_UNITS

| Item | Value |
|------|-------|
| **Component** | `AutoCompleteGeneric` (`src/components/prime-vue/AutoCompleteGeneric.vue`) |
| **Constants** | `src/constants/currency-units.js` |
| **Used in** | `create-view.vue` (Currency Unit field) |

ใช้ `AutoCompleteGeneric` ใน static list mode — ไม่ต้อง call API, รองรับ free-text, กรองตาม `code`

**Usage ใน create-view.vue:**
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

**Handler:**
```javascript
onCurrencyChange(value) {
  if (typeof value === 'string') {
    this.currencyUnit = value
  } else if (value && typeof value === 'object') {
    this.currencyUnit = value.code || ''
  }
}
```

**Behavior:**
| | ผล |
|--|--|
| Input หลังเลือก | แสดง `"US$"` (code) |
| Dropdown items | แสดง `"US$ — US Dollar"` (ผ่าน #option slot) |
| Free-text | พิมพ์ได้ปกติ (forceSelection: false) |
| Filter | กรองตาม code (พิมพ์ "US" → "US$") |

### CURRENCY_UNITS

11 สกุลเงินที่ใช้ใน jewelry export: US$, EUR, GBP, JPY, SGD, HKD, AUD, CAD, THB, CNY, AED

---

*Last updated: 2026-02-23 — Added: Quotation → SO flow (create-view loadFromQuotation, quotation detail-view "สร้างใบสั่งขาย" button, item-card quotation badge)*
*Updated: 2026-02-23 — create-view: commented out markup + goldPerOz inputs (ยังไม่ได้ใช้ตอนนี้)*
*Updated: 2026-02-23 — Section 13: สลับ CurrencyUnitSelect → AutoCompleteGeneric (static list mode)*
