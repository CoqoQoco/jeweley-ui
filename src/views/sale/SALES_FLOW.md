# Sales Flow Documentation

ระบบงานขายครบวงจรสำหรับ Jewelry Management System

**Backend Codebase**: `jewelry-api/Jewelry.Api/`
**Frontend Codebase**: `jeweley-ui/src/`
**Route Pattern**: ไม่มี prefix `api/` — ใช้ `/{Controller}/{Action}` ตรง
**Auth**: ทุก endpoint ต้อง JWT (`[Authorize]`) ยกเว้น `/Landing/*`

## Flow Overview

```
Quotation (ใบเสนอราคา)
  ↓ อ้างอิงเลขที่ Quotation
Sale Order (ใบสั่งขาย)
  ↓ ยืนยันสินค้า (Confirm Stock)
  ↓ เลือก items สร้าง Invoice
Invoice (ใบแจ้งหนี้)
  ↓ พิมพ์ / Version / Delivery / Payment
Invoice Detail (รายละเอียด + ชำระเงิน)
```

---

## 1. Routes (Actual)

### Web Routes

| Path | Route Name | Component | หมายเหตุ |
|------|-----------|-----------|----------|
| `/sale/dashboard` | `sale-dashboard` | `sale/dashboard/index-view.vue` | ภาพรวมงานขาย |
| `/sale/cost-stock-edit` | `cost-stock-edit` | `sale/cost-stock/web/cost-edit/index-view.vue` | ตีราคาสินค้า |
| `/sale-quotation` | `sale-quotation` | `sale/quotation/index-view.vue` | สร้าง/แก้ไขใบเสนอราคา |
| `/sale-quotation-list` | `sale-quotation-list` | `sale/quotation-list/index-view.vue` | รายการใบเสนอราคา |
| `/sale-order` | `sale-order` | `sale/sale-order/index-view.vue` | สร้าง/แก้ไขใบสั่งขาย |
| `/sale-order-list` | `sale-order-list` | `sale/saleorder-list/index-view.vue` | รายการใบสั่งขาย |
| `/sale/invoice` | `sale-invoice` | `sale/invoice/index-view.vue` | รายการ Invoice |
| `/invoice-detail` | `invoice-detail` | `sale/invoice-detail/index-view.vue` | รายละเอียด Invoice |
| `/sale/payment-dashboard` | `sale-payment-dashboard` | `sale/payment-tracking/dashboard/index-view.vue` | ภาพรวมการชำระเงิน |

**Permission**: ทุก route ใช้ `SALE_VIEW`

**Route ที่ commented out (ยังไม่ใช้งาน)**:
- `/sale/production-order` — ใบสั่งผลิต
- `/sale/stock-reservation` — จองสต็อก
- `/sale/delivery-note` — ใบส่งของ

### Mobile Routes

> **ดูรายละเอียดครบที่**: `src/views/mobile/sale/SALE_MOBILES_FLOW.md`

| Path | Route Name | Component |
|------|-----------|-----------|
| `/mobile/quotation` | `mobile-quotation` | `mobile/quotation/index-view.vue` |
| `/mobile/quotation/:number` | `mobile-quotation-detail` | `mobile/quotation/detail-view.vue` |
| `/mobile/sale` | `mobile-sale` | `mobile/sale/index-view.vue` |
| `/mobile/sale/create` | `mobile-sale-create` | `mobile/sale/create-view.vue` |
| `/mobile/sale/detail/:soNumber` | `mobile-sale-detail` | `mobile/sale/detail-view.vue` |
| `/mobile/sale/invoice/:invoiceNumber` | `mobile-invoice-detail` | `mobile/sale/invoice-detail-view.vue` |

**Permission**: ทุก mobile sale route ใช้ `mobile:sale`

---

## 2. Quotation Flow

### File Structure

```
src/views/sale/quotation/
  index-view.vue                         -- orchestrator (โหลด quotation จาก query ?number=)
  components/search-view.vue             -- ค้นหา stock / quotation number
  components/quotation-view.vue          -- form หลัก (~1,600 บรรทัด)
  modal/edit-stock-view.vue              -- แก้ไข materials/price ของ item
  modal/confirm-create-pdf-view.vue      -- เลือก items-per-page ก่อนสร้าง PDF
  modal/customer-search-modal.vue        -- ค้นหาลูกค้า
  modal/customer-create-modal.vue        -- สร้างลูกค้าใหม่
  modal/cost-version-picker-modal.vue    -- ดึง items จากรายการตีราคา
```

### Customer (Header) Fields

| Field | Description |
|-------|-------------|
| `invoiceNumber` | เลขที่ Quotation (auto: `QT-YYYYMMDD-HHmmss`) |
| `quotationDate` | วันที่ใบเสนอราคา |
| `name`, `address`, `tel`, `email` | ข้อมูลลูกค้า |
| `currencyUnit` | สกุลเงิน (default: `US$`) |
| `currencyMultiplier` | อัตราแลกเปลี่ยน (default: `33.0`) |
| `markup` | Markup multiplier (default: `3.5`) |
| `discountPercent` | Global default discount % (ใช้เป็นค่าเริ่มต้นของ item ใหม่) |
| `goldPerOz` | ราคาทอง US$/oz |
| `specialDiscount` | ส่วนลดพิเศษ (หัก) |
| `specialAddition` | ส่วนเพิ่มพิเศษ (บวก) |
| `freight` | ค่าขนส่ง |
| `vatPercent` | VAT % |

### Per-Item Fields (quotationItems[])

| Field | Description |
|-------|-------------|
| `stockNumber` | เลข stock |
| `productNumber` | เลข product |
| `description` | คำอธิบาย |
| `imagePath` | path รูปภาพ |
| `materials[]` | วัตถุดิบ (Gold/Diamond/Gem) |
| `appraisalPrice` | ราคาประเมิน (THB, แก้ไขได้) |
| `discountPercent` | **ส่วนลดต่อ item (%)** |
| `qty` | จำนวน |
| `group` | กลุ่มสินค้า |

### Footer Calculation

```
sumTotalConvertedPrice  = SUM( appraisalPrice * (1 - discountPercent/100) / currencyMultiplier * qty )
totalAfterSpecial       = sumTotalConvertedPrice - specialDiscount + specialAddition
totalBeforeVat          = totalAfterSpecial + freight
vatAmount               = totalBeforeVat * (vatPercent / 100)
grandTotal              = totalBeforeVat + vatAmount
```

### API: POST `/Quotation/Upsert`

สร้าง/แก้ไข Quotation — ถ้า `Number` ไม่เจอใน DB = Create (auto generate Running ด้วย prefix `"QUO"`), เจอ = Update

**Service**: `QuotationService.Upsert()`
**Pinia Store**: `usrQuotationApiStore.fetchSave()`

| Request Field | Type | Required | Notes |
|---------------|------|----------|-------|
| `Number` | string | Yes | เลขที่ Quotation (uppercased) |
| `CustomerName` | string | Yes | |
| `CustomerAddress` | string? | No | |
| `CustomerPhone` | string? | No | |
| `CustomerEmail` | string | No | |
| `Currency` | string? | No | |
| `CurrencyRate` | decimal? | No | |
| `MarkUp` | decimal? | No | |
| `Discount` | decimal? | No | |
| `Freight` | decimal? | No | |
| `SpecialDiscount` | decimal? | No | |
| `SpecialAddition` | decimal? | No | |
| `Vat` | decimal? | No | |
| `GoldPerOz` | decimal? | No | |
| `Remark` | string? | No | |
| `Data` | string | No | JSON string ของ quotationItems |
| `Date` | DateTimeOffset? | No | วันที่ใบเสนอราคา |

**Response**: `"success"` (string)

**Note**: Update branch จะ set `UpdateDate = UTC now` และ `UpdateBy = CurrentUsername` ด้วย

### API: POST `/Quotation/Get`

ดึง Quotation ตาม Number

**Service**: `QuotationService.Get()`
**Pinia Store**: `usrQuotationApiStore.fetchGet()`

| Request Field | Type | Required |
|---------------|------|----------|
| `Number` | string | Yes |

| Response Field | Type |
|----------------|------|
| `Number`, `Running` | string |
| `CustomerName`, `CustomerAddress`, `CustomerPhone`, `CustomerEmail` | string |
| `Currency`, `CurrencyRate`, `MarkUp`, `Discount`, `Freight` | decimal |
| `SpecialDiscount`, `SpecialAddition`, `Vat`, `GoldPerOz` | decimal? |
| `Remark`, `Data` | string |
| `Date` | DateTimeOffset? |

### API: POST `/Quotation/List`

รายการ Quotation — ใช้ Kendo DataSourceRequest (take/skip/sort)

**Service**: `QuotationService.List()`
**Pinia Store**: `usrQuotationApiStore.fetchList()`

| Search Filter | Type | Filter |
|---------------|------|--------|
| `Number` | string? | Contains (uppercased) |
| `CustomerName` | string? | Contains |
| `Currency` | string? | Contains |
| `CreateBy` | string? | Contains |
| `CreateDateStart` / `CreateDateEnd` | DateTimeOffset? | Date range |
| `QuotationDateStart` / `QuotationDateEnd` | DateTimeOffset? | Date range |

**Response**: DataSourceResult of `{ Number, Running, CustomerName, CustomerPhone, CustomerEmail, CustomerAddress, Currency, CurrencyRate, MarkUp, Discount, Freight, SpecialDiscount, SpecialAddition, Vat, GoldPerOz, Remark, Date, CreateDate, CreateBy, UpdateDate, UpdateBy }`

---

## 3. Sale Order Flow

### File Structure

```
src/views/sale/sale-order/
  index-view.vue                         -- orchestrator (โหลด SO จาก query ?soNumber=)
  components/search-view.vue             -- ค้นหา quotation number
  components/sale-order-view.vue         -- form หลัก (~3,500 บรรทัด)
  modal/confirm-stock-modal.vue          -- ยืนยันสินค้า
  modal/invoice-modal.vue                -- สร้าง Invoice จาก confirmed items
  modal/quotation-search-modal.vue       -- ค้นหา Quotation
```

### formSaleOrder Fields

| Field | Description |
|-------|-------------|
| `number` | เลขที่ SO (generated via `SaleOrder/GenerateRunningNumber`) |
| `date` | วันที่ SO |
| `expectedDeliveryDate` | วันส่งมอบ |
| `quotationNumber` | เลขที่ Quotation อ้างอิง |
| `priority` | ลำดับความสำคัญ (normal/high/urgent/critical) |
| `customerName/Address/Phone/Email/Remark` | ข้อมูลลูกค้า |
| `currencyUnit` | สกุลเงิน |
| `currencyRate` | อัตราแลกเปลี่ยน |
| `markup` | Markup |
| `goldPerOz` | ราคาทอง |
| `freight` | ค่าขนส่ง |
| `specialDiscount` | ส่วนลดพิเศษ |
| `specialAddition` | ส่วนเพิ่มพิเศษ |
| `vatPercent` | VAT % |

### Stock Items (2 ตาราง)

1. **stockItems** — สินค้าที่มี `stockNumber` จริง (จากคลัง)
   - จัดกลุ่มตาม: `invoice_X` (มี Invoice แล้ว), `confirmed_pending_invoice` (ยืนยันแล้ว), `pending_confirmation` (รอยืนยัน)
2. **copyItems** — สินค้าที่ไม่มี `stockNumber` (ต้องผลิต)

### Footer Calculation

```
total - specialDiscount + specialAddition + freight = beforeVat
beforeVat * (vatPercent/100) = vatAmount
beforeVat + vatAmount = grandTotal
```

### Action Buttons

| ปุ่ม | เงื่อนไข | Action |
|------|---------|--------|
| ยืนยันการขาย | มี SO number แล้ว | เปิด ConfirmStockModal |
| Invoice | มี confirmed items | เปิด InvoiceModal |
| บันทึกร่าง | - | `SaleOrder/Upsert` |
| Export PDF | - | `SaleOrderPdfBuilder` |

### API: POST `/SaleOrder/Upsert`

สร้าง/แก้ไข Sale Order — ถ้า `SoNumber` = null → Create (auto generate running number prefix `"SO"`), มีค่า → Update

**Service**: `SaleOrderService.Upsert()`
**Pinia Store**: `usrSaleOrderApiStore.fetchSave()`

**Business Logic**:
- Create: Status=1, StatusName="DK-SO", CurrencyUnit default "THB", Priority default "Normal"
- Update: อัปเดต pricing/dates/currency fields — **ไม่อัปเดต** CustomerName/CustomerCode

| Request Field | Type | Required | Notes |
|---------------|------|----------|-------|
| `SoNumber` | string? | No | null = create, มีค่า = update |
| `SODate` | DateTimeOffset? | No | |
| `DeliveryDate` | DateTimeOffset? | No | |
| `RefQuotation` | string? | No | |
| `Priority` | string | No | default "Normal" |
| `Data` | string? | No | JSON string ของ items |
| `CustomerName` | string | Yes (create) | |
| `CustomerCode` | string | Yes (create) | |
| `CustomerAddress` | string? | No | |
| `CustomerTel` | string? | No | |
| `CustomerEmail` | string? | No | |
| `CustomerRemark` | string? | No | |
| `CurrencyUnit` | string | No | default "THB" |
| `CurrencyRate` | decimal | No | |
| `Markup` | decimal? | No | |
| `Discount` | decimal? | No | |
| `GoldRate` | decimal? | No | |
| `SpecialDiscount` | decimal? | No | |
| `SpecialAddition` | decimal? | No | |
| `Vat` | decimal? | No | |
| `Freight` | decimal? | No | |
| `Remark` | string? | No | |

**Response**: `string` — SoNumber (เลขที่ SO)

### API: POST `/SaleOrder/Get`

ดึง SO detail + stock confirm status + stock availability

**Service**: `SaleOrderService.Get()`
**Pinia Store**: `usrSaleOrderApiStore.fetchGet()`

**Business Logic**:
1. ดึง `TbtSaleOrder` ตาม SoNumber
2. Parse `Data` JSON → สร้าง StockConfirm list (default `IsConfirm=false`)
3. Query `TbtSaleOrderProduct` → merge confirmed items (`IsConfirm=true`, price, qty, invoice)
4. ตรวจ `TbtStockProduct.QtyRemaining <= 0` → set `IsRemainProduct=false` + message ภาษาไทย

| Request Field | Type | Required |
|---------------|------|----------|
| `SoNumber` | string | Yes |

| Response Field | Type | Notes |
|----------------|------|-------|
| `Running`, `SoNumber` | string | |
| `CreateDate`, `CreateBy` | DateTime, string | |
| `UpdateDate`, `UpdateBy` | DateTime?, string? | |
| `DeliveryDate` | DateTime? | |
| `Status`, `StatusName` | int, string | |
| `RefQuotation` | string? | |
| `Priority` | string | |
| `Data` | string? | Raw JSON blob ของ items |
| `CustomerName/Code/Address/Tel/Email/Remark` | string | |
| `CurrencyUnit`, `CurrencyRate` | string, decimal | |
| `Markup`, `GoldRate` | decimal? | |
| `SpecialDiscount`, `SpecialAddition`, `Vat` | decimal? | |
| `Freight` | decimal? | |
| `SoDate` | DateTime? | |
| `Remark` | string? | |
| `StockConfirm[]` | List | ดูตารางย่อยด้านล่าง |

**StockConfirm sub-object**:

| Field | Type | Notes |
|-------|------|-------|
| `Id` | long | DB row ID |
| `StockNumber` | string | |
| `PriceOrigin`, `Qty`, `Discount`, `NetPrice` | decimal | |
| `Remark` | string? | |
| `Invoice`, `InvoiceItem`, `DKInvoiceNumber` | string? | มีค่าถ้าออก Invoice แล้ว |
| `IsConfirm` | bool | true ถ้าอยู่ใน TbtSaleOrderProduct |
| `IsInvoice` | bool (computed) | true ถ้า Invoice != null |
| `IsRemainProduct` | bool | false ถ้า stock หมด |
| `Message` | string? | ข้อความเตือนภาษาไทย |

### API: POST `/SaleOrder/List`

รายการ SO — Kendo DataSourceRequest

**Service**: `SaleOrderService.List()`
**Pinia Store**: `usrSaleOrderApiStore.fetchList()`

| Search Filter | Type | Filter |
|---------------|------|--------|
| `SoNumber` | string? | Contains (uppercased) |
| `CustomerName` | string? | Contains |
| `RefQuotation` | string? | Contains |
| `CurrencyUnit` | string? | Contains |
| `Status` | int? | Exact match |
| `CreateBy` | string? | Contains |
| `CreateDateStart` / `CreateDateEnd` | DateTimeOffset? | Date range |
| `DeliveryDateStart` / `DeliveryDateEnd` | DateTimeOffset? | Date range |

### API: POST `/SaleOrder/GenerateRunningNumber`

Generate SO running number (preview) — ไม่สร้าง record

**Service**: `SaleOrderService.GenerateRunningNumber()`
**Pinia Store**: `usrSaleOrderApiStore.fetchGenerateRunningNumber()`

**Request**: ไม่มี body
**Response**: `string` — SO number (prefix `"SO"`)

### API: POST `/SaleOrder/ConfirmStockItems`

ยืนยันสินค้าใน SO — ใช้ DB transaction, หักยอด `QtySale` ใน stock

**Service**: `SaleOrderService.ConfirmStockItems()`
**Pinia Store**: `usrSaleOrderApiStore.confirmStockItems()`

**Validations**:
- SoNumber ต้องมีอยู่ใน TbtSaleOrder
- StockNumber ต้องมีอยู่ใน TbtStockProduct
- Qty > 0 และ AppraisalPrice > 0
- Available quantity (Qty - QtySale) >= requested Qty

**DB Changes**:
- Insert rows ลง `TbtSaleOrderProduct`
- Increment `TbtStockProduct.QtySale`

| Request Field | Type | Required | Notes |
|---------------|------|----------|-------|
| `SoNumber` | string | Yes | |
| `StockItems[]` | List | Yes, non-empty | |
| `.StockNumber` | string | Yes | |
| `.ProductNumber` | string? | No | fallback = StockNumber |
| `.Qty` | int | Yes | > 0 |
| `.AppraisalPrice` | decimal | Yes | > 0 |
| `.Discount` | decimal | No | NetPrice = Price * (1 - Discount/100) |

| Response Field | Type |
|----------------|------|
| `Success` | bool |
| `Message` | string |
| `ConfirmedItemsCount` | int |
| `ConfirmedStockNumbers` | List\<string\> |
| `ConfirmedDate` | DateTime |

### API: POST `/SaleOrder/UnconfirmStockItems`

ยกเลิกยืนยันสินค้า — ใช้ DB transaction, คืนยอด `QtySale`

**Service**: `SaleOrderService.UnconfirmStockItems()`
**Pinia Store**: `usrSaleOrderApiStore.unconfirmStockItems()`

**Validations**: ไม่สามารถ unconfirm ถ้า item มี `Invoice` แล้ว

**DB Changes**:
- Hard delete `TbtSaleOrderProduct` rows
- Decrement `TbtStockProduct.QtySale`

| Request Field | Type | Required |
|---------------|------|----------|
| `SoNumber` | string | Yes |
| `StockItems[].Id` | int | Yes (DB row ID) |
| `StockItems[].StockNumber` | string | Yes |

| Response Field | Type |
|----------------|------|
| `Success` | bool |
| `Message` | string |
| `UnconfirmedItemsCount` | int |
| `UnconfirmedStockNumbers` | List\<string\> |

---

## 4. Invoice Flow

### File Structure

```
src/views/sale/invoice-detail/
  index-view.vue                                  -- หน้าหลัก Invoice detail
  modal/invoice-version-modal.vue                 -- สร้าง version ใหม่ (เปลี่ยนอัตราแลกเปลี่ยน)
  modal/invoice-confirm-print-modal.vue           -- กำหนดเลขที่/วันที่ก่อนพิมพ์ Invoice PDF
  modal/delivery-confirm-print-modal.vue          -- กำหนดเลขที่/วันที่ก่อนพิมพ์ Delivery Note PDF
  modal/invoice-confirm-excel-modal.vue           -- กำหนดเลขที่/วันที่ก่อน Export Excel
  modal/payment-record-modal.vue                  -- บันทึกการชำระเงิน (วันที่, จำนวน, วิธีการ, รูปภาพ)
```

### Invoice สร้างจากไหน

Invoice สร้างจาก **Sale Order** ผ่าน `invoice-modal.vue`:
1. เลือก confirmed items จาก SO
2. กำหนด specialDiscount, specialAddition, freight, VAT (pre-fill จาก SO)
3. กด สร้าง Invoice → เรียก `Invoice/Create`
4. Redirect ไปหน้า Invoice Detail

### Invoice Detail Features

| Feature | Description |
|---------|-------------|
| แสดงรายการ | items พร้อม per-item discount |
| Invoice Versions | สร้าง version ใหม่ด้วยอัตราแลกเปลี่ยนใหม่ |
| พิมพ์ Invoice PDF | กำหนดเลขที่/วันที่ → สร้าง PDF |
| พิมพ์ Delivery Note PDF | กำหนดเลขที่/วันที่ → สร้าง PDF |
| Export Excel | กำหนดเลขที่/วันที่ → Export |
| บันทึกชำระเงิน | วันที่, จำนวน, วิธีการ, upload รูปภาพ |
| ยกเลิกเอกสาร | Reverse/Cancel Invoice |

### Footer Calculation

```
total - specialDiscount + specialAddition + freightAndInsurance = beforeVat
beforeVat * (vatPercent/100) = vatAmount
beforeVat + vatAmount = grandTotal
remaining = grandTotal - deposit - paidAmount
```

### API: POST `/Invoice/Create`

สร้าง Invoice จาก SO — auto generate number prefix `"INV"`

**Service**: `InvoiceService.Create()`
**Pinia Store**: `useInvoiceApiStore.fetchCreate()`

**Validations**:
- SoNumber, CustomerCode, CustomerName, Items required
- DKInvoiceNumber (ถ้ามี) ต้องไม่ซ้ำ
- ทุก StockNumber ต้องอยู่ใน TbtSaleOrderProduct ของ SoNumber นั้น
- ต้องยังไม่มี Invoice assign

**DB Changes**:
- Insert `TbtSaleInvoiceHeader`
- Update `TbtSaleOrderProduct` → set Invoice, InvoiceItem, DkInvoiceNumber

| Request Field | Type | Required | Notes |
|---------------|------|----------|-------|
| `SoNumber` | string | Yes | |
| `DKInvoiceNumber` | string? | No | เลข Invoice ของลูกค้า (unique) |
| `CustomerCode` | string | Yes | |
| `CustomerName` | string | Yes | |
| `CustomerAddress` | string? | No | |
| `CustomerTel` | string? | No | |
| `CustomerEmail` | string? | No | |
| `CustomerRemark` | string? | No | |
| `CurrencyUnit` | string | Yes | |
| `CurrencyRate` | decimal | Yes | |
| `DeliveryDate` | DateTimeOffset? | No | |
| `Deposit` | decimal | No | |
| `GoldRate` | decimal | No | |
| `Markup` | decimal | No | |
| `Payment` | int | Yes | Payment type code |
| `PaymentName` | string | Yes | Payment type name |
| `PaymentDay` | int | No | |
| `Priority` | string | No | |
| `RefQuotation` | string? | No | |
| `Remark` | string? | No | |
| `SpecialDiscount` | decimal | No | |
| `SpecialAddition` | decimal | No | |
| `FreightAndInsurance` | decimal | No | |
| `Vat` | decimal | No | |
| `Items[]` | List | Yes, non-empty | แต่ละ item มี StockNumber |

**Response**: `{ invoiceNumber: string, message: "Invoice created successfully" }`

### API: POST `/Invoice/Get`

ดึง Invoice detail + confirmed items + payment records

**Service**: `InvoiceService.Get()`
**Pinia Store**: `useInvoiceApiStore.fetchGet()`

| Request Field | Type | Required |
|---------------|------|----------|
| `InvoiceNumber` | string | Yes |

| Response Field | Type | Notes |
|----------------|------|-------|
| `InvoiceNumber`, `DKInvoiceNumber`, `SoNumber` | string | |
| `CreateDate`, `CreateBy`, `UpdateDate`, `UpdateBy` | | |
| `CustomerCode/Name/Address/Tel/Email/Remark` | string | |
| `CurrencyUnit`, `CurrencyRate` | | |
| `DeliveryDate` | DateTime? | |
| `Deposit`, `GoldRate`, `Markup` | decimal | |
| `Payment`, `PaymentName`, `PaymentDay` | | |
| `Priority`, `RefQuotation`, `Remark` | string? | |
| `SpecialDiscount`, `SpecialAddition`, `FreightAndInsurance`, `Vat` | decimal | |
| `Status`, `StatusName` | int, string | Initial: 100 / "invoice" |
| `ConfirmedItems[]` | List | Id, StockNumber, IsConfirmed, Invoice, InvoiceItem |
| `Payments[]` | List | Running, PaymentDate, Amount, PaymentMethod, ReferenceNumber, ImagePath, ... |

### API: POST `/Invoice/List`

รายการ Invoice — Kendo DataSourceRequest

**Service**: `InvoiceService.List()`
**Pinia Store**: `useInvoiceApiStore.fetchList()`

| Search Filter | Type | Filter |
|---------------|------|--------|
| `InvoiceNumber` | string? | Contains |
| `DKInvoiceNumber` | string? | Contains |
| `CustomerName` | string? | Contains |
| `CustomerCode` | string? | Contains |
| `Status` | int? | Exact match |
| `CreateBy` | string? | Contains |
| `CreateDateFrom` / `CreateDateTo` | DateTimeOffset? | Date range |
| `DeliveryDateFrom` / `DeliveryDateTo` | DateTimeOffset? | Date range |

### API: POST `/Invoice/Delete`

Soft-delete Invoice — `IsDelete = true`, ล้าง Invoice ref จาก TbtSaleOrderProduct

**Service**: `InvoiceService.Delete()`
**Pinia Store**: `useInvoiceApiStore.fetchDelete()`

| Request | Type |
|---------|------|
| `InvoiceNumber` | string |

### API: GET `/Invoice/GenerateInvoiceNumber`

Preview generate invoice number (prefix `"INV"`) — ไม่สร้าง record

### API: POST `/Invoice/Version/Upsert`

สร้าง version snapshot ของ Invoice (always create new — version number auto: `{InvoiceNumber}-V001`, `-V002`, ...)

**Service**: `InvoiceService.UpsertVersion()`
**Pinia Store**: `useInvoiceApiStore.fetchUpsertVersion()`

| Request Field | Type | Required |
|---------------|------|----------|
| `InvoiceNumber` | string | Yes |
| `SoNumber` | string | Yes |
| `Data` | string | Yes — JSON snapshot |

| Response Field | Type |
|----------------|------|
| `VersionNumber` | string (e.g. `"INV-2024001-V001"`) |
| `InvoiceNumber`, `SoNumber` | string |

### API: POST `/Invoice/Version/Get`

ดึง version snapshot

| Request | Response |
|---------|----------|
| `VersionNumber: string` | `VersionNumber, InvoiceNumber, SoNumber, Data (JSON), CreateDate/By, IsActive` |

### API: POST `/Invoice/Version/List`

รายการ versions ของ Invoice

| Filter | Type |
|--------|------|
| `InvoiceNumber` | string? |
| `SoNumber` | string? |
| `IsActive` | bool? |

### API: POST `/Invoice/Payment/Create` (multipart/form-data)

บันทึกการชำระเงิน — upload receipt image ไป Azure Blob Storage (folder `"Payment"`)

**Service**: `InvoiceService.CreatePayment()`
**Pinia Store**: `useInvoiceApiStore.createPayment()`

**Validations**: InvoiceNumber ต้องมี + ไม่ถูก delete, Amount > 0, PaymentName required

| Request Field | Type | Required | Notes |
|---------------|------|----------|-------|
| `InvoiceNumber` | string | Yes | |
| `PaymentDate` | DateTimeOffset | Yes | |
| `Amount` | decimal | Yes | > 0 |
| `Payment` | int | No | Payment type code |
| `PaymentName` | string | Yes | Payment method name |
| `ReferenceNumber` | string? | No | เลขอ้างอิงธนาคาร |
| `Remark` | string? | No | |
| `ReceiptImage` | IFormFile? | No | Upload ไป Azure Blob |

**Response**: `{ paymentRunning: string, message: "Payment record created successfully" }`

### API: POST `/Invoice/Payment/List`

รายการชำระเงินของ Invoice

| Request | Response per item |
|---------|-------------------|
| `InvoiceNumber: string` | Running, InvoiceNumber, SoNumber, PaymentDate, Amount, CurrencyUnit, PaymentMethod, ReferenceNumber, Remark, ImagePath, CreateBy/Date |

### API: POST `/Invoice/Payment/Delete`

Soft-delete payment record (`IsDelete = true`)

| Request | Response |
|---------|----------|
| `PaymentRunning: string` | `{ message: "Payment {running} deleted successfully" }` |

---

## 5. Stock Product APIs (ที่เกี่ยวข้องกับ Sale)

**Controller**: `StockProductController` — Route: `/StockProduct`
**Service**: `ProductService`

### API: POST `/StockProduct/Get`

ดึงข้อมูล stock product สำหรับเพิ่มใน Quotation/SO

| Request Field | Type | Notes |
|---------------|------|-------|
| `StockNumber` | string? | อย่างน้อย 1 field ต้องมี |
| `StockNumberOrigin` | string? | |
| `ProductNumber` | string? | |

| Response Field | Type |
|----------------|------|
| `StockNumber`, `StockNumberOrigin` | string |
| `ProductNumber`, `ProductNameEn`, `ProductNameTh` | string |
| `ProductType`, `ProductTypeName` | string |
| `ProductPrice` | decimal |
| `ProductionType`, `ProductionTypeSize` | string? |
| `Mold`, `ImageName`, `ImagePath` | string? |
| `Qty`, `Size`, `Location` | |
| `TagPriceMultiplier` | decimal |
| `Materials[]` | List (type, typeCode, weight, qty, ...) |
| `PriceTransactions[]` | List (No, Name, NameGroup, Qty, QtyPrice, QtyWeight, QtyWeightPrice, TotalPrice) |

**Business Logic**: คืนเฉพาะ `QtyRemaining > 0` และ `Status == "Available"`. PriceTransactions มาจาก: (1) stored JSON, (2) production plan prices, หรือ (3) materials list

### API: POST `/StockProduct/List`

รายการ stock products — Kendo DataSourceRequest

| Search Filter | Type | Filter |
|---------------|------|--------|
| `StockNumber` | string? | Contains |
| `StockNumberOrigin` | string? | Contains (ProductCode) |
| `ProductNumber` | string? | Contains |
| `ProductNameEn` | string? | Contains |
| `ProductNameTh` | string? | Contains |
| `ReceiptType` | string[]? | ProductionType match |
| `ProductType` | string[]? | Array filter |
| `Gold` | string[]? | Maps to ProductionType |
| `GoldSize` | string[]? | Maps to ProductionTypeSize |
| `Size` | string? | Contains |
| `Mold` | string? | Contains (MoldDesign) |

**Response**: คืนเฉพาะ `Status == "Available"` พร้อม Materials

### API: POST `/StockProduct/AddProductCostDeatialVersion`

บันทึก cost version — ใช้ใน cost-stock-edit (ตีราคาสินค้า)

| Request Field | Type | Notes |
|---------------|------|-------|
| `StockNumber` | string | |
| `PlanRunning` | string? | Link ไป cost plan |
| `CustomerCode/Name/Address/Tel/Email` | string? | |
| `TagPriceMultiplier` | decimal | |
| `CurrencyUnit` | string? | |
| `CurrencyRate` | decimal? | |
| `Prictransection[]` | List | รายการต้นทุน (No, Name, NameGroup, Qty, QtyPrice, QtyWeight, QtyWeightPrice) |
| `IsOriginCost` | bool | ถ้า true → เขียน cost กลับลง stock product |

### API: POST `/StockProduct/Update`

อัปเดต stock product — ต้อง permission `update_stock`

| Request Field | Type |
|---------------|------|
| `StockNumber` | string |
| `ReceiptNumber` | string |
| `ProductNameEn/Th` | string |
| `Mold` | string |
| `ProductPrice` | decimal |
| `Qty` | decimal |
| `Size`, `Location` | string? |
| `ImageName`, `ImagePath` | string? |
| `Materials[]` | List (replace all existing) |

---

## 6. Customer APIs

**Controller**: `CustomerController` — Route: `/Customer`

### API: POST `/Customer/Search`

ค้นหาลูกค้า — Kendo DataSourceRequest

### API: POST `/Customer/SearchCustomer`

ค้นหาลูกค้า (variant)

### API: POST `/Customer/CreateCustomer`

สร้างลูกค้าใหม่

| Request Field | Type |
|---------------|------|
| `Code` | string |
| `Type.Code` | string |
| `NameTh`, `NameEn` | string |
| `Address`, `Tel1`, `Tel2` | string? |
| `Email`, `ContactName`, `Remark` | string? |

---

## 7. PDF Builders

| File | Class | Output |
|------|-------|--------|
| `pdf/quotation/quotation-pdf-builder.js` | `InvoicePdfBuilder` | Quotation PDF (item table + per-item discount + footer totals + conditions) |
| `pdf/quotation/breakdown-pdf-builder.js` | `BreakdownPdfBuilder` | Cost Breakdown PDF (รายละเอียดต้นทุนต่อ item) |
| `pdf/sale-order/sale-order-pdf-builder.js` | `SaleOrderPdfBuilder` | SO PDF (เหมือน Quotation + รูปสินค้า) |
| `pdf/invoice/invoice-pdf-builder.js` | `InvoicePdfBuilder` | Invoice PDF |
| `pdf/delivery/delivery-pdf-builder.js` | — | Delivery Note PDF |

### Financial Fields ใน PDF

ทุก PDF builder ใช้ fields เดียวกัน:
- `specialDiscount` — ส่วนลดพิเศษ
- `specialAddition` — ส่วนเพิ่มพิเศษ
- `freight` / `freightAndInsurance` — ค่าขนส่ง
- `vatPercent` — VAT %
- Per-item `discountPercent` — ส่วนลดต่อ item

---

## 8. Pinia Stores

### Sale-related Stores

| File | Store ID | Main Actions |
|------|----------|-------------|
| `sale/quotation-store.js` | `usrQuotationApiStore` | fetchSave, fetchGet, fetchList |
| `sale/sale-order-store.js` | `usrSaleOrderApiStore` | fetchSave, fetchGet, fetchList, fetchGenerateRunningNumber, confirmStockItems, unconfirmStockItems |
| `sale/invoice-store.js` | `useInvoiceApiStore` | fetchCreate, fetchGet, fetchList, fetchDelete, versions, payments |

### Data Pattern

ทุก store ใช้ pattern เดียวกัน:
- `fetchSave({ formValue })` — Create/Update
- `fetchGet({ formValue })` — Get by ID/number
- `fetchList({ take, skip, sort, formValue })` — Paginated list with filters

Items (quotationItems, SO stockItems) ถูก serialize เป็น **JSON string** ใน field `data` ก่อนส่ง API

---

## 9. Running Number Prefixes

| Prefix | ใช้กับ | Generated by |
|--------|-------|-------------|
| `"SO"` | Sale Order number | `SaleOrder/GenerateRunningNumber` |
| `"QUO"` | Quotation running | `Quotation/Upsert` (internal) |
| `"INV"` | Invoice number | `Invoice/Create` |
| `"PAY-{invoiceNumber}"` | Payment running | `Invoice/Payment/Create` |
| `"CP"` | Cost Plan | `StockProduct/CreateProductCostDeatialPlan` |
| `"CV"` | Cost Version | `StockProduct/AddProductCostDeatialVersion` |

---

## 10. DB Tables (Sale)

| Table | Description |
|-------|-------------|
| `tbt_sale_quotation` | ใบเสนอราคา (+ special_discount, special_addition, vat, gold_per_oz) |
| `tbt_sale_order` | ใบสั่งขาย (+ special_discount, special_addition, vat, freight) |
| `tbt_sale_order_product` | สินค้าที่ confirm แล้ว (link SO ↔ Stock ↔ Invoice) |
| `tbt_sale_invoice_header` | Invoice header |
| `tbt_sale_invoice_payment_item` | รายการชำระเงิน |
| `tbt_sale_invoice_version` | Invoice version snapshots |
| `tbt_stock_product` | สินค้าคงคลัง (QtySale = จำนวนที่ถูกจอง) |
| `tbt_stock_product_material` | วัตถุดิบของสินค้า |
| `tbt_stock_cost_plan` | แผนตีราคา |
| `tbt_stock_cost_version` | version การตีราคา |

---

## 11. Key Design Notes

### Items stored as JSON

ทุก document (Quotation, SO, Invoice) เก็บ items เป็น JSON string ใน field `data`:
- **Save**: `JSON.stringify(items)` → ส่งเป็น `data` field
- **Load**: `JSON.parse(response.data)` → ได้ array ของ items

### Per-Item Discount

- แต่ละ item มี `discountPercent` แยกกัน
- `customer.discountPercent` เป็น global default สำหรับ item ใหม่
- ปุ่ม "กำหนดทั้งหมด" ใน Quotation: set ทุก item ให้ใช้ global discount

### Financial Fields Flow

```
Quotation:  specialDiscount, specialAddition, freight, vatPercent
    ↓ (โหลดเข้า SO เมื่อสร้างจาก Quotation)
Sale Order: specialDiscount, specialAddition, freight, vatPercent
    ↓ (pre-fill เมื่อสร้าง Invoice)
Invoice:    specialDiscount, specialAddition, freightAndInsurance, vatPercent
```

### Stock Confirmation Gate

Items ต้องผ่าน 2 ขั้นตอนก่อนออก Invoice:
1. **Confirm Stock** (`ConfirmStockModal`) → set `isConfirm = true`, หัก `QtySale` ใน stock
2. **Create Invoice** (`InvoiceModal`) → เลือก confirmed items → สร้าง Invoice

Items ที่มี `invoice` field แล้วจะถูก lock (แก้ไข/ลบไม่ได้)

### Mobile Data Parity

> **ดูรายละเอียดครบที่**: `src/views/mobile/sale/SALE_MOBILES_FLOW.md`

Mobile SO/Invoice ส่ง fields ครบเหมือน Web — ดูรายละเอียด data flow, ความแตกต่าง, และ features ที่ยังไม่มีในเอกสาร Mobile

### Soft Delete vs Hard Delete

- **Soft delete**: Invoice (`IsDelete=true`), Payment (`IsDelete=true`)
- **Hard delete**: `TbtSaleOrderProduct` rows (เมื่อ unconfirm)

---

## 12. All Backend API Endpoints (Quick Reference)

### Sale Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/Quotation/Upsert` | สร้าง/แก้ไข Quotation |
| POST | `/Quotation/Get` | ดึง Quotation |
| POST | `/Quotation/List` | รายการ Quotation |
| POST | `/SaleOrder/Upsert` | สร้าง/แก้ไข SO |
| POST | `/SaleOrder/Get` | ดึง SO + stock status |
| POST | `/SaleOrder/List` | รายการ SO |
| POST | `/SaleOrder/GenerateRunningNumber` | Generate SO number |
| POST | `/SaleOrder/ConfirmStockItems` | ยืนยันสินค้า |
| POST | `/SaleOrder/UnconfirmStockItems` | ยกเลิกยืนยัน |
| POST | `/Invoice/Create` | สร้าง Invoice |
| POST | `/Invoice/Get` | ดึง Invoice + payments |
| POST | `/Invoice/List` | รายการ Invoice |
| POST | `/Invoice/Delete` | ยกเลิก Invoice |
| GET | `/Invoice/GenerateInvoiceNumber` | Generate INV number |
| POST | `/Invoice/Version/Upsert` | สร้าง version |
| POST | `/Invoice/Version/Get` | ดึง version |
| POST | `/Invoice/Version/List` | รายการ versions |
| POST | `/Invoice/Payment/Create` | บันทึกชำระเงิน (multipart) |
| POST | `/Invoice/Payment/List` | รายการชำระเงิน |
| POST | `/Invoice/Payment/Delete` | ลบรายการชำระเงิน |

### Stock Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/StockProduct/List` | รายการ stock products (Available only) |
| POST | `/StockProduct/Get` | ดึง stock product + materials + price transactions |
| POST | `/StockProduct/GetStockCostDetail` | ดึง cost detail (query: ?stockNumber=) |
| POST | `/StockProduct/Update` | อัปเดต stock product (ต้อง permission) |
| POST | `/StockProduct/CreateProductCostDeatialPlan` | สร้างแผนตีราคา |
| POST | `/StockProduct/AddProductCostDeatialVersion` | บันทึก cost version |
| GET | `/StockProduct/GetProductCostDetailVersion` | ดึง cost versions (query: ?stockNumber=) |
| POST | `/StockProduct/GetCostVersion` | ดึง cost version ตาม planRunning |
| POST | `/StockProduct/ListStockCostPlan` | รายการแผนตีราคา |
| POST | `/StockProduct/ListCostVersion` | รายการ cost versions |
| POST | `/StockProduct/PlanReceiptList` | รายการรับสินค้าจากแผนผลิต |
| POST | `/StockProduct/ListName` | ค้นหาชื่อสินค้า (autocomplete) |
| POST | `/StockProduct/Dashboard` | Dashboard stock overview |
| POST | `/StockProduct/Dashboard/Today` | รายงานวันนี้ |
| POST | `/StockProduct/Dashboard/Weekly` | รายงานรายสัปดาห์ |
| POST | `/StockProduct/Dashboard/Monthly` | รายงานรายเดือน |

### Stock Gem Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/StockGem/Search` | ค้นหาพลอย (flat list) |
| POST | `/StockGem/SearchData` | ค้นหาพลอย (paged + filters) |
| POST | `/StockGem/GroupGemData` | ดึง distinct values สำหรับ dropdown |
| POST | `/StockGem/Price` | แก้ไขราคาพลอย |
| POST | `/StockGem/PriceHistory` | ประวัติราคาพลอย |
| POST | `/StockGem/Dashboard` | Dashboard overview |
| POST | `/StockGem/Dashboard/Today` | รายงานวันนี้ |
| POST | `/StockGem/Dashboard/Weekly` | รายงานรายสัปดาห์ |
| POST | `/StockGem/Dashboard/Monthly` | รายงานรายเดือน |
| POST | `/StockGem/Dashboard/Monthly/GemTransactionSummaries` | สรุปธุรกรรมพลอยรายเดือน |

### Customer Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/Customer/Search` | ค้นหาลูกค้า |
| POST | `/Customer/SearchCustomer` | ค้นหาลูกค้า (variant) |
| POST | `/Customer/CreateCustomer` | สร้างลูกค้าใหม่ |

### Other Related

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/Master/MasterCustomerType` | ประเภทลูกค้า |
| GET | `/Master/MasterGold` | ข้อมูลทอง |
| GET | `/Master/MasterGem` | ข้อมูลพลอย |
| GET | `/Master/MasterGemShape` | รูปร่างพลอย |
| GET | `/Master/MasterDiamondGrade` | เกรดเพชร |
| GET | `/Master/MasterProductType` | ประเภทสินค้า |
| GET | `/FileExtension/GetStockProductImage` | รูปสินค้า (base64) |
| GET | `/FileExtension/GetMoldImage` | รูปแม่พิมพ์ (base64) |

---

*Last updated: 2026-02-23 — ย้าย Conditions block จาก Sale Order PDF → Quotation PDF*
