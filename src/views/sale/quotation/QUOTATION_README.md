# Quotation (ใบเสนอราคา)

ระบบสร้างและจัดการใบเสนอราคาสำหรับลูกค้า รองรับหลายสกุลเงิน, การคำนวณ Markup/Discount, export PDF และ Excel

---

## File Structure

```
sale/quotation/
├── index-view.vue                      # Orchestrator — จัดการ routing ระหว่าง search และ form
├── components/
│   ├── quotation-view.vue              # Form หลัก (สร้าง/แก้ไขใบเสนอราคา)
│   └── search-view.vue                 # Search bar (ค้นหาเลขที่ / สินค้า)
└── modal/
    ├── confirm-create-pdf-view.vue     # ตั้งค่าก่อน export PDF
    ├── cost-version-picker-modal.vue   # ดึงสินค้าจาก Cost Version / การตีราคา
    ├── customer-search-modal.vue       # ค้นหาลูกค้าที่มีอยู่ในระบบ
    ├── customer-create-modal.vue       # สร้างลูกค้าใหม่ระหว่างกรอก quotation
    └── edit-stock-view.vue             # แก้ไขรายละเอียดสินค้าใน quotation

sale/quotation-list/
├── index-view.vue                      # Orchestrator ของ list page
├── components/
│   ├── search-view.vue                 # ตัวกรองค้นหา (quick + advanced)
│   ├── data-table-view.vue             # ตารางรายการ quotation + merge feature
│   └── merge-quotation-modal.vue       # Modal รวม quotation หลายใบ
└── quotationlist.md                    # เอกสารประกอบ quotation list
```

---

## Flow ภาพรวม

```
[Quotation List] ─── ค้นหา / กดดู ──────────────────────────────────► [Quotation Form]
                                                                              │
                  ┌───────────────────────────────────────────────────────────┤
                  │                                                           │
              ค้นหาสินค้า                                              เพิ่มจาก Cost Version
          (search-view.vue)                                        (cost-version-picker-modal)
                  │                                                           │
                  └─────────────────────────────────────────────► quotationItems[]
                                                                              │
                                          ┌────────────────────────────────────────────┐
                                          │          Export / บันทึก                  │
                                          │                                            │
                                    Quotation PDF    Breakdown PDF   Excel    Save API │
                                          │                │           │        │      │
                                    pdfmake         pdfmake     ExcelJS  /Quotation/Upsert
                                          └────────────────────────────────────────────┘
```

---

## Quotation Form (`quotation-view.vue`)

### Header Fields

| Field | ตัวแปร | ค่า default | หมายเหตุ |
|---|---|---|---|
| วันที่ | `quotationDate` | วันนี้ | PrimeVue Calendar |
| เลขที่ใบเสนอราคา | `invoiceNumber` | auto-gen | รูปแบบ `QT-YYYYMMDD-HHmmss` |
| ชื่อลูกค้า | `name` | - | จากค้นหา หรือพิมพ์เอง |
| ที่อยู่ | `address` | - | |
| เบอร์โทร | `tel` | - | |
| อีเมล | `email` | - | |
| หมายเหตุ | `remark` | - | |

### Pricing Fields

| Field | ตัวแปร | ค่า default | หมายเหตุ |
|---|---|---|---|
| สกุลเงิน | `currencyUnit` | `'US$'` | พิมพ์อิสระ |
| อัตราแลกเปลี่ยน | `currencyMultiplier` | `33.0` | THB per 1 unit |
| Markup (%) | `markup` | `3.5` | ใช้คำนวณ `appraisalPrice` |
| Discount (%) | `discountPercent` | `0` | ส่วนลดทั่วไป (apply ทุก item) |
| Gold Per Oz | `goldPerOz` | `0` | ราคาทองต่อออนซ์ (US$) |
| Freight | `freight` | `0` | ค่าขนส่งและประกัน |
| Special Discount | `specialDiscount` | `0` | ส่วนลดพิเศษรวม |
| Special Addition | `specialAddition` | `0` | ค่าใช้จ่ายเพิ่มเติมรวม |
| VAT (%) | `vatPercent` | `0` | |

### Quotation Items (`quotationItems[]`)

แต่ละ item ใน array มี field ดังนี้:

```javascript
{
  stockNumber,        // เลขที่ผลิต (ใหม่)
  stockNumberOrigin,  // เลขที่ผลิต (เก่า) — ใช้ใน PDF/Excel
  productNumber,      // รหัสสินค้า
  description,        // รายละเอียด
  qty,                // จำนวน
  appraisalPrice,     // ราคาประเมิน (THB) — ใช้คำนวณ
  discountPercent,    // ส่วนลดต่อ item (%)
  materials: [        // วัสดุ
    { type, typeCode, weight, qty }  // type: 'Gold' | 'Diamond' | 'Gem'
  ],
  imagePath,          // path รูปใน Azure Blob
  imageBase64,        // base64 ชั่วคราว (item ที่ copy — ไม่ได้บันทึก)
  priceTransactions,  // breakdown ราคาจาก cost version
  costVersionRunning, // อ้างอิง cost version ที่นำมา
  _copyId             // ID ชั่วคราวสำหรับ copy
}
```

### การคำนวณราคา

```
appraisalPrice (THB)  ÷  currencyMultiplier  ×  (1 - discountPercent/100)  =  unit price (foreign)
unit price  ×  qty  =  amount per item
sum(amount)  =  subtotal

subtotal  -  specialDiscount  +  specialAddition  +  freight  =  totalBeforeVat
totalBeforeVat  ×  vatPercent/100  =  vatAmount
totalBeforeVat  +  vatAmount  =  grandTotal (C.I.F)
```

---

## Actions / ปุ่มทั้งหมด

### ปุ่มใน Header

| ปุ่ม | Method | หมายเหตุ |
|---|---|---|
| 🔄 (สร้างเลขที่ใหม่) | `generateQuotationNumber()` | auto-gen `QT-YYYYMMDD-HHmmss` |
| Apply Discount | `applyGlobalDiscount()` | ใส่ `discountPercent` ให้ทุก item |
| ค้นหาลูกค้า | `onSearchCustomer()` | เปิด customer-search-modal |
| สร้างลูกค้าใหม่ | `onCreateCustomer()` | เปิด customer-create-modal |
| ดึงจาก Cost Version | `onOpenCostVersionPicker()` | เปิด cost-version-picker-modal |

### ปุ่มต่อ item

| ปุ่ม | Method | หมายเหตุ |
|---|---|---|
| 🗑️ ลบ | `delItem(index)` | ลบ item ออกจาก array |
| ✏️ แก้ไข | `onEditStock(item, index)` | เปิด edit-stock-view modal |
| 📋 copy | `copyItem(item)` | duplicate item (ได้ `_copyId` ใหม่) |

### ปุ่ม Export & Save

| ปุ่ม | Class | Method | ผลลัพธ์ |
|---|---|---|---|
| Quotation File | `btn-green` | `printInvoice()` | PDF ผ่าน confirm-create-pdf-view |
| Preview Quotation | `btn-outline-main` | `previewInvoice()` | PDF เปิด tab ใหม่ (ไม่ผ่าน modal) |
| Export Excel | `btn-green` | `exportQuotationExcel()` | Excel ผ่าน ExcelExportConfirmModal |
| Breakdown File | `btn-green` | `printBreakdown()` | PDF cost breakdown |
| Save Quotation | `btn-main` | `onSave()` | บันทึกผ่าน `/Quotation/Upsert` |

> ปุ่ม Export Excel และ Save จะ disabled เมื่อ `quotationItems` ว่างเปล่า

---

## Modal ทั้งหมด

### `confirm-create-pdf-view.vue` — ตั้งค่า PDF
- ตั้ง **items per page** (1-50, default 10)
- toggle **แสดง CIF label** ในหน้า PDF
- ปุ่ม "ยืนยัน" → export PDF ทันที
- ปุ่ม "บันทึกและยืนยัน" → save quotation ก่อน แล้ว export PDF

### `cost-version-picker-modal.vue` — ดึงสินค้าจาก Cost Version
- ค้นหาด้วย stock number, cost version running, ผู้สร้าง
- ตารางแสดง cost versions พร้อม DataTable pagination
- เลือก item → คำนวณ `appraisalPrice` จาก cost ↔ markup อัตโนมัติ
- map `priceTransactions` เพื่อดู breakdown ราคา

### `customer-search-modal.vue` — ค้นหาลูกค้า
- ค้นหาจาก database ลูกค้า
- กด select → fill ข้อมูลลูกค้าใน form อัตโนมัติ

### `customer-create-modal.vue` — สร้างลูกค้าใหม่
- กรอกข้อมูลลูกค้าใหม่ → save → fill form

### `edit-stock-view.vue` — แก้ไขสินค้าใน quotation
- แก้ materials (gold, diamond, gem) — weight, qty, typeCode
- แก้ราคา, discount, จำนวน
- ดู price breakdown จาก priceTransactions
- อัปโหลดรูปชั่วคราวสำหรับ copied items (≤45KB, เก็บเป็น base64 ชั่วคราว ไม่บันทึก Azure)

---

## API

**Store**: `usrQuotationApiStore` (`src/stores/modules/api/sale/quotation-store.js`)

| Action | Endpoint | Payload หลัก |
|---|---|---|
| บันทึก / อัปเดต | `POST /Quotation/Upsert` | `formValue: { number, quotationDate, customerName, data (JSON string of items), ... }` |
| โหลด quotation | `POST /Quotation/Get` | `formValue: { number }` |
| รายการ | `POST /Quotation/List` | `formValue: { page, pageSize, number, customerName, ... }` |

**Items storage**: items array ถูก `JSON.stringify()` ก่อนส่ง API เก็บเป็น field `data` (string)

**Field mapping (Get response → form)**:

| API field | Form field |
|---|---|
| `invoiceNumber` / `number` | `customer.invoiceNumber` |
| `quotationDate` | `customer.quotationDate` |
| `currency` | `customer.currencyUnit` |
| `currencyRate` | `customer.currencyMultiplier` |
| `markup` | `customer.markup` |
| `discount` | `customer.discountPercent` |
| `data` (JSON string) | `customer.quotationItems` (parsed) |

---

## Export PDF

### Quotation PDF (`quotation-pdf-builder.js`)
ใช้ **pdfmake** + THSarabunNew font

| ส่วน | รายละเอียด |
|---|---|
| Header | โลโก้ + ชื่อบริษัท + "QUOTATION" + เลขที่ + วันที่ |
| Company Info | ที่อยู่ / TEL / FAX / Email ฝั่งซ้าย |
| Customer Info | "Consigned To:" + ชื่อ / ที่อยู่ / TEL / Email ฝั่งขวา |
| Items Table | No. / Image / Style-Product / Description / Gold / Diamond / Gem / Qty / Price / Amount |
| Totals | F.O.B Bangkok → Special Discount/Addition → Freight → VAT → C.I.F |
| Footer | ONE PARCEL ONLY / WE CERTIFY / NET WEIGHT / Signature + 6 เงื่อนไข |
| รูปสินค้า | โหลดจาก Azure Blob ผ่าน `getAzureBlobAsBase64()` |
| Multi-page | แบ่งหน้าตาม `itemsPerPage` — ทุกหน้ามี subtotal, หน้าสุดท้ายมี grand total |

### Breakdown PDF (`breakdown-pdf-builder.js`)
แสดง cost breakdown ต่อ item (materials, weight, ราคาต่อ unit)

---

## Export Excel

### `InvoiceExcelBuilder` (`src/services/helper/excel/invoice/invoice-excel-builder.js`)
ใช้ **ExcelJS**

| ส่วน | รายละเอียด |
|---|---|
| Header | โลโก้ (A1, 40×40px) + "Duang Kaew Jewelry" + "QUOTATION" |
| Company / Customer | เหมือน PDF — "Consigned To:" |
| Items Table | 10 columns เหมือน PDF — Gold/Diamond/Gem แสดง multiline ต่อ material entry |
| รูปสินค้า | โหลดจาก Azure Blob → embed ใน col B (55×55px, `ext` mode — proportional) |
| Totals | F.O.B Bangkok (conditional) → Special → SUB TOTAL → VAT → C.I.F |
| Footer | ONE PARCEL ONLY / WE CERTIFY / NET WEIGHT / Signature / 6 เงื่อนไข |
| Filename | `Quotation_{number}_{YYYYMMDD}.xlsx` |

**Constructor options สำหรับ Quotation**:
```javascript
new InvoiceExcelBuilder(items, customer, date, saleOrderData, currency, rate, number, 10,
  { documentTitle: 'QUOTATION' }
)
```

**Generic modal ก่อน export**: `ExcelExportConfirmModal` (`src/components/modal/ExcelExportConfirmModal.vue`)
- ให้ผู้ใช้แก้ Quotation Number / Date ก่อน export
- ข้อมูลในระบบ **ไม่เปลี่ยน** — ผลต่อเฉพาะ Excel ที่ดาวน์โหลด

---

## Quotation List

**Route**: `/sale-quotation-list`

### Search Filters

| Filter | ประเภท | หมายเหตุ |
|---|---|---|
| Quotation Number | Quick search | ค้นหาด้วยเลขที่ |
| Customer Name | Advanced | |
| Currency | Advanced | |
| Created By | Advanced | |
| Create Date (ช่วง) | Advanced | start / end |
| Quotation Date (ช่วง) | Advanced | start / end |

### Table Columns

| Column | หมายเหตุ |
|---|---|
| Action | ปุ่ม "ดู" → `/sale-quotation?number=xxx` |
| Quotation Number | เลขที่ใบเสนอราคา |
| Running No | ลำดับในระบบ |
| Customer Name | ชื่อลูกค้า |
| Customer Phone / Email | |
| Currency | สกุลเงิน |
| Currency Rate | อัตราแลกเปลี่ยน |
| Markup (%) | |
| Discount (%) | |
| Freight | |

---

## Merge Quotation Feature

รวมใบเสนอราคาหลายใบเป็นใบเดียว

### วิธีใช้
1. เลือก checkbox ≥ 2 ใบในตาราง
2. Toolbar "Merge N Quotations" ปรากฏ (`btn-main`)
3. ระบบโหลดข้อมูล quotation แต่ละใบจาก `/Quotation/Get`
4. `merge-quotation-modal.vue` เปิด — ตรวจสอบ conflict

### Conflict Fields (15 fields)

| Field | Label |
|---|---|
| `customerName` | ชื่อลูกค้า |
| `customerAddress` | ที่อยู่ |
| `customerPhone` | เบอร์โทร |
| `customerEmail` | อีเมล |
| `currency` | สกุลเงิน |
| `currencyRate` | อัตราแลกเปลี่ยน |
| `markup` | Markup (%) |
| `discount` | Discount (%) |
| `freight` | Freight |
| `specialDiscount` | Special Discount |
| `specialAddition` | Special Addition |
| `vatPercent` | VAT (%) |
| `quotationDate` | วันที่ |
| `goldPerOz` | Gold Per Oz |
| `remark` | หมายเหตุ |

- field ที่ **ตรงกันทุกใบ** → ใช้ค่านั้นเลย
- field ที่ **ต่างกัน** → แสดง radio buttons ให้ผู้ใช้เลือก

### ผลลัพธ์
- เลขที่ใหม่: `QT-YYYYMMDD-HHmmss`
- items: รวมทุก item จากทุกใบ (id reset เป็น null, เพิ่ม `_fromQuotation` tracking)
- บันทึกผ่าน `/Quotation/Upsert` → redirect ไปหน้า quotation ใหม่

---

## Related Files

| File | หน้าที่ |
|---|---|
| `src/stores/modules/api/sale/quotation-store.js` | Pinia store — API calls |
| `src/services/helper/pdf/quotation/quotation-pdf-builder.js` | PDF builder |
| `src/services/helper/pdf/quotation/quotation-pdf-integration.js` | PDF integration helper |
| `src/services/helper/pdf/quotation/breakdown-pdf-builder.js` | Breakdown PDF builder |
| `src/services/helper/excel/invoice/invoice-excel-builder.js` | Excel builder (shared กับ Invoice) |
| `src/components/modal/ExcelExportConfirmModal.vue` | Generic Excel confirm modal |
| `src/views/sale/SALES_FLOW.md` | ภาพรวม flow ของระบบขายทั้งหมด |

---

*Last updated: 2026-03-03*
