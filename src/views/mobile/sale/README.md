## Web Quotation Module (Updated)

### New Features (2026-02)
1. **ดึงสินค้าจากรายการตีราคา** — เปิด Modal เลือก Cost Version → ใช้ราคาจากการตี
2. **รายการพิเศษ** — ส่วนลดพิเศษ, ส่วนเพิ่มพิเศษ, VAT (%) เหมือน Invoice
3. **ต่อยอด SO → Invoice** — Quotation ส่ง currency/markup/special items ให้ SO

### Quotation → SO → Invoice Flow
```
Quotation → Sale Order (ดึงข้อมูลลูกค้า + items + currency + special items)
  → Invoice (สร้างจาก SO ที่มีข้อมูลครบ)
```

---

# Mobile Sale Order + Invoice

## Overview
ฟีเจอร์ใบสั่งขาย (Sale Order) + Invoice บน Mobile ลดขั้นตอนจาก Web เหลือ 3 ขั้นตอน:

```
เลือกสินค้า (จาก Job ตีราคา / สแกน) → สร้าง SO + Print เสนอลูกค้า → ลูกค้า OK → ออก Invoice
```

## Structure

```
src/views/mobile/sale/
├── index-view.vue                      # รายการ SO + Invoice (2 tabs, filter by createBy)
├── create-view.vue                     # สร้าง SO (add items + currency + customer + save)
├── detail-view.vue                     # รายละเอียด SO + ออก Invoice
├── invoice-detail-view.vue             # รายละเอียด Invoice + พิมพ์ PDF
├── README.md                           # เอกสารนี้
└── components/
    ├── add-item-method-selector.vue    # Tab toggle: ตีราคา | สแกน
    ├── appraisal-job-list.vue          # รายการ Job ตีราคาที่ Completed
    ├── item-card.vue                   # การ์ดสินค้า (แก้ราคาป้าย/จำนวน/ส่วนลดได้ + แสดงต้นทุน)
    ├── item-list.vue                   # รายการสินค้าที่เพิ่มแล้ว
    ├── customer-form.vue               # ฟอร์มลูกค้า (ค้นหาจาก DB + เพิ่มลูกค้าใหม่)
    ├── customer-search-modal.vue       # Full-screen modal ค้นหาลูกค้าจาก DB
    ├── customer-create-modal.vue       # Full-screen modal เพิ่มลูกค้าใหม่ (auto-gen code)
    ├── invoice-creation-form.vue       # ฟอร์มสร้าง Invoice (เลือกสินค้า + ราคาท้ายบิล + ชำระเงิน)
    ├── so-summary.vue                  # สรุปราคา (แสดงในสกุลเงินที่เลือก + อ้างอิงบาท)
    └── so-item-card.vue                # การ์ดสินค้าใน detail (read-only + status badge)

src/services/helper/pdf/sale-order/
└── sale-order-pdf-builder.js           # สร้าง PDF ใบสั่งขาย (style เหมือน Invoice PDF)
```

## Routes

| Path | Name | Component |
|------|------|-----------|
| `/mobile/sale` | `mobile-sale` | `index-view.vue` |
| `/mobile/sale/create` | `mobile-sale-create` | `create-view.vue` |
| `/mobile/sale/detail/:soNumber` | `mobile-sale-detail` | `detail-view.vue` |
| `/mobile/sale/invoice/:invoiceNumber` | `mobile-invoice-detail` | `invoice-detail-view.vue` |

## Permissions

- Permission key: `mobile:sale`
- Defined in: `src/services/permission/config.js`
- Granted to roles: **Dev**, **Admin**, **Sale**

## User Flow

```
Dashboard [ปุ่ม "ใบสั่งขาย"]
    ↓
หน้ารายการ (index-view) — 2 Tabs
  ├── Tab "Sale Order"
  │     ├── ดึงรายการ SO เฉพาะที่ user ปัจจุบันสร้าง (filter: createBy)
  │     ├── Card list: SO number, ลูกค้า, วันที่, status badge
  │     ├── กดเข้าดูรายละเอียด SO ได้
  │     └── ปุ่ม "+ สร้างใบสั่งขาย" (sticky bottom)
  │
  └── Tab "Invoice"
        ├── ดึงรายการ Invoice เฉพาะที่ user ปัจจุบันสร้าง (filter: createBy)
        ├── Card list: Invoice number, ลูกค้า, วันที่, จำนวนรายการ, ยอดรวม, status badge
        └── กดเข้าดูรายละเอียด Invoice ได้
    ↓
สร้าง SO (create-view)
  ├── Tab A: เลือกจากรายการตีราคา (Job ที่ Completed) → ได้ราคาป้าย (ต้นทุน × ตัวคูณ)
  ├── Tab B: สแกน QR / พิมพ์ stock number/origin → ได้ราคาป้าย (ต้นทุน × ตัวคูณ)
  │     └── เลือกค้นหาด้วย "รหัสสินค้าใหม่" หรือ "รหัสสินค้าเก่า"
  ├── แก้ราคาป้าย / จำนวน / ส่วนลด % ได้ทุกรายการ
  ├── ตั้งค่าสกุลเงิน (Currency Unit + Rate)
  ├── เลือกลูกค้าจากฐานข้อมูล หรือเพิ่มลูกค้าใหม่ (auto-gen code: CUST-YYMMDD-XXXX)
  └── บันทึก: "สร้างใบสั่งขาย" (Confirmed) — backend gen SO number อัตโนมัติ
    ↓
รายละเอียด SO (detail-view)
  ├── ข้อมูล SO + ข้อมูลลูกค้า + รายการสินค้า
  ├── ปุ่ม "แก้ไขรายการ" → Edit mode (เพิ่ม/ลบ/แก้ไข สินค้า + บันทึก)
  │     ├── เพิ่มสินค้าจาก Job ตีราคา หรือ สแกน QR/พิมพ์ stock number
  │     ├── แก้ราคาป้าย / จำนวน / ส่วนลด % ได้
  │     ├── ลบสินค้าได้ (เฉพาะที่ยังไม่ออก Invoice)
  │     ├── สินค้าที่ออก Invoice แล้ว → ล็อค (read-only, icon กุญแจ)
  │     └── ปุ่ม "บันทึกการแก้ไข" → Upsert SO (ส่ง soNumber เดิม)
  ├── ปุ่ม "พิมพ์ใบสั่งขาย" → สร้าง PDF (A4, style เหมือน Invoice)
  └── ปุ่ม "ออก Invoice" → เปิดฟอร์มสร้าง Invoice (InvoiceCreationForm)
        ├── เลือกสินค้า (checkbox) + กรอกราคาท้ายบิล + ข้อมูลชำระเงิน
        ├── กด "สร้าง Invoice" → Confirm Stock + Create Invoice
        └── Disabled ถ้าทุกสินค้าออก Invoice แล้ว
    ↓
รายละเอียด Invoice (invoice-detail-view)
  ├── ข้อมูล Invoice + ข้อมูลลูกค้า + รายการสินค้า
  ├── สรุปราคา: F.O.B Bangkok, Discount/Addition, Freight, VAT, Grand Total
  ├── ข้อมูลการชำระเงิน
  ├── ปุ่ม "พิมพ์ Invoice" → เปิด print customization form (inline)
  │     ├── กำหนด Invoice Number + Date ก่อนพิมพ์
  │     └── ปุ่ม "พิมพ์เอกสาร" → สร้าง Invoice PDF (reuse InvoicePdfBuilder)
  └── ปุ่ม "ย้อนกลับ" → กลับหน้ารายการ
```

## Features

### หน้า 1: รายการ SO + Invoice (`index-view.vue`)

**2 Tabs หลัก:**
- **Tab "Sale Order"**: ดึงรายการ SO เฉพาะ user ปัจจุบัน (`createBy` = username)
  - แสดง: SO number, ชื่อลูกค้า, วันที่, status badge
  - กดเข้าดูรายละเอียด SO
  - ปุ่ม "+ สร้างใบสั่งขาย" (sticky bottom, แสดงเฉพาะ tab นี้)
- **Tab "Invoice"**: ดึงรายการ Invoice เฉพาะ user ปัจจุบัน (`createBy` = username)
  - แสดง: Invoice number, ชื่อลูกค้า, วันที่, จำนวนรายการ, ยอดรวม, status badge
- Pagination แบบ "โหลดเพิ่มเติม" ทั้ง 2 tabs

### หน้า 2: สร้าง SO (`create-view.vue`)

**Section 1 - เพิ่มสินค้า (2 tabs)**
- **Tab A "จากรายการตีราคา"**: ดึง MyJob ที่ `jobTypeId === PLAN_STOCK_COST && statusId === 100`
  - กดเลือก → fetchGetCostVersion → fetchDataGet → เพิ่มสินค้าพร้อมราคาป้าย + materials
- **Tab B "สแกนสินค้า"**: ใช้ QrScanner + manual input
  - **เลือกค้นหาด้วย**: รหัสสินค้าใหม่ (`stockNumber`) หรือ รหัสสินค้าเก่า (`stockNumberOrigin`)
  - สแกน/พิมพ์ → fetchDataGet → เพิ่มสินค้าพร้อมราคาป้าย + materials

**Section 2 - รายการสินค้า**
- แสดงรายการที่เพิ่มแล้ว (item-card.vue)
- แสดง **ต้นทุน** (read-only, สีส้ม, หน่วย "บาท" เสมอ) + badge ตัวคูณ
- แก้ไข **ราคาป้าย** / จำนวน / ส่วนลด % ได้
- ลบรายการได้ + เพิ่มกลับได้
- รวมต่อรายการ (หน่วย "บาท") คำนวณอัตโนมัติ: `appraisalPrice * qty * (1 - discountPercent / 100)`

**Section 3 - สกุลเงิน (Currency)**
- Currency Unit (default: `US$`)
- Currency Rate (default: `33.0`)
- ส่งค่า `currencyUnit` + `currencyRate` ไปกับ formValue ตอนบันทึก

**Section 4 - ข้อมูลลูกค้า (Customer)**
- ปุ่ม "ค้นหาลูกค้า" → เปิด full-screen modal ค้นหาจากฐานข้อมูล
- ปุ่ม "เพิ่มลูกค้าใหม่" → เปิด full-screen modal สร้างลูกค้าใหม่
  - ฟิลด์: รหัสลูกค้า* (auto-gen `CUST-YYMMDD-XXXX` + refresh ได้), ประเภทลูกค้า*, ชื่อ TH*, ชื่อ EN, ที่อยู่, เบอร์โทร, อีเมล, บุคคลติดต่อ, หมายเหตุ
  - ใช้ `Master/MasterCustomerType` สำหรับ dropdown ประเภทลูกค้า (native `<select>`)
  - ใช้ `Customer/CreateCustomer` API สร้างลูกค้า
  - สร้างสำเร็จ → auto-fill ข้อมูลลูกค้าในฟอร์ม
- เมื่อเลือก/สร้างลูกค้า → auto-fill: customerCode, customerName, customerTel, customerEmail, customerAddress
- ข้อมูลลูกค้า read-only (ยกเว้นหมายเหตุ)
- **Required**: ต้องมี `customerCode` ก่อนบันทึก SO

**Section 5 - สรุป + บันทึก**
- แสดงจำนวนรายการ
- ยอดรวมในสกุลเงินที่เลือก (แปลงจากบาท ÷ rate)
- แสดง "เทียบเท่า xxx บาท" เป็นข้อมูลอ้างอิง (เฉพาะกรณี rate ≠ 1)
- ปุ่ม "สร้างใบสั่งขาย" (status: Confirmed)
- Validation: ต้องมีสินค้า ≥ 1 + ต้องมี customerCode + ต้องระบุ currency

**การบันทึก SO:**
- ไม่ต้องเรียก `fetchGenerateRunningNumber()` — ส่ง `soNumber: ''` ให้ backend gen อัตโนมัติผ่าน `SaleOrder/Upsert`
- รับ SO number จาก response: `result.soNumber`

**formValue ที่ส่งไป API (saveOrder):**
```javascript
{
  soNumber: '',                    // backend gen อัตโนมัติ
  status: 'Confirmed',
  customerCode: 'CUST-001',
  customerName: 'ชื่อลูกค้า',
  customerTel: '081-xxx-xxxx',
  customerEmail: 'email@example.com',
  customerAddress: 'ที่อยู่',
  remark: 'หมายเหตุ',
  currencyUnit: 'US$',
  currencyRate: 33.0,
  priority: 'mobile',
  data: JSON.stringify({
    stockItems: [...],      // แต่ละ item มี costPrice, tagPriceMultiplier, appraisalPrice, materials
    copyItems: [...],
    allItems: [...],
    freight: 0,
    copyFreight: 0
  })
}
```

### หน้า 3: รายละเอียด SO (`detail-view.vue`)

**View Mode (default)**:
- ข้อมูล SO: เลข SO, วันที่, ผู้สร้าง, สกุลเงิน, status badge
- ข้อมูลลูกค้า: ชื่อ, เบอร์, ที่อยู่
- รายการสินค้า (read-only, so-item-card.vue) — ราคาแสดงหน่วย "บาท"
- สรุปราคา — ยอดรวมในสกุลเงินที่เลือก + "เทียบเท่า xxx บาท" (ถ้า rate ≠ 1)
- ข้อมูล Invoice (ถ้าออกแล้ว)
- **ปุ่ม "แก้ไขรายการ"** → เข้า Edit Mode (ซ่อนถ้าทุก item ออก Invoice แล้ว)
- **ปุ่ม "พิมพ์ใบสั่งขาย"** → สร้าง PDF download (ราคาแปลงเป็นสกุลเงินที่เลือก)
- **ปุ่ม "ออก Invoice"** → เปิดฟอร์มสร้าง Invoice (disabled ถ้าทุก item ออก Invoice แล้ว)

**Invoice Creation Form** (`showInvoiceForm = true`):
- แสดง `InvoiceCreationForm` component แทนปุ่ม action
- **เลือกสินค้า**: checkbox เลือก item ที่จะออก Invoice (default = เลือกทั้งหมด)
- **DK Invoice Number**: ระบุเลข Invoice DK (ไม่บังคับ)
- **สรุปราคา (สกุลเงินจาก SO)**:
  - F.O.B Bangkok (รวมสินค้าที่เลือก)
  - ส่วนลดพิเศษ (input)
  - ส่วนเพิ่มพิเศษ (input)
  - ยอดรวมหลังปรับ
  - Freight & Insurance (input)
  - ยอดรวมก่อน VAT
  - VAT % (input) + จำนวนเงิน VAT
  - ยอดรวม Invoice
- **ข้อมูลการชำระเงิน**:
  - วิธีการชำระเงิน (native `<select>`: เงินสด/โอน/เช็ค/บัตรเครดิต/เครดิต)
  - ระยะเวลาการชำระเงิน (วัน)
  - ราคามัดจำ
  - ยอดคงเหลือที่ต้องชำระ
- **ปุ่ม "สร้าง Invoice"** → confirmSubmit → Confirm Stock + Invoice/Create
- **ปุ่ม "ยกเลิก"** → ปิดฟอร์มกลับ View Mode

**Edit Mode** (`isEditing = true`):
- **เพิ่มสินค้า** — 2 tabs เหมือน create-view:
  - Tab A "จากรายการตีราคา": เลือก Job ตีราคา → เพิ่มสินค้าพร้อมราคาป้าย
  - Tab B "สแกนสินค้า": QR Scanner + manual input (เลือกค้นหาด้วย stockNumber/stockNumberOrigin)
- **สินค้าที่ออก Invoice แล้ว** → แสดงเป็น locked section (read-only, icon กุญแจ, สี gray)
- **สินค้าที่ยังไม่ออก Invoice** → แก้ราคาป้าย/จำนวน/ส่วนลด/ลบได้ (ใช้ ItemList + ItemCard)
- **ตรวจซ้ำ**: เช็ค duplicate ทั้ง invoicedItems + editItems
- **ปุ่ม "บันทึกการแก้ไข"** → merge invoicedItems + editItems → fetchSave (ส่ง `soNumber` เดิม)
- **ปุ่ม "ยกเลิก"** → discard changes กลับ View Mode

**Invoice Flow** (ผ่าน InvoiceCreationForm component):
1. กดปุ่ม "ออก Invoice" → `showInvoiceForm = true` → แสดงฟอร์ม
2. เลือกสินค้า + กรอกราคาท้ายบิล (ส่วนลด/เพิ่มพิเศษ, Freight, VAT) + ข้อมูลชำระเงิน
3. กด "สร้าง Invoice" → confirmSubmit → `confirmStockItems()` (เฉพาะ unconfirmed) → `Invoice/Create`
4. แสดง success + เลข Invoice → emit `invoice-created` → reload SO data

**Invoice Button Disable Logic:**
```javascript
// allItemsInvoiced computed
const stockWithNumber = stockItems.filter(item => item.stockNumber)
return stockWithNumber.every(item => item.isInvoice)
// → disabled + label "ออก Invoice แล้วทั้งหมด"
```

### หน้า 4: รายละเอียด Invoice (`invoice-detail-view.vue`)

**ข้อมูลที่แสดง:**
- ข้อมูล Invoice: เลข Invoice, เลข SO, วันที่สร้าง, สถานะ, สกุลเงิน (Rate), ผู้สร้าง
- ข้อมูลลูกค้า: ชื่อ, เบอร์, ที่อยู่
- รายการสินค้า (read-only, so-item-card.vue) — ราคาหน่วยบาท
- สรุปราคา: F.O.B Bangkok, Special Discount/Addition, Freight & Insurance, VAT, Grand Total (C.I.F)
- ข้อมูลการชำระเงิน: วิธีชำระ, ระยะเวลา, มัดจำ
- หมายเหตุ (ถ้ามี)

**Actions:**
- **ปุ่ม "พิมพ์ Invoice"** → เปิด print customization form (inline)
  - ฟิลด์: Invoice Number (pre-fill) + Invoice Date (native date picker, default = today)
  - หมายเหตุ: "การเปลี่ยนแปลงมีผลเฉพาะเอกสารที่พิมพ์ ข้อมูลต้นฉบับไม่เปลี่ยน"
  - ปุ่ม "พิมพ์เอกสาร" → generate PDF (reuse `invoicePdfService.generateInvoicePDF()`)
  - ปุ่ม "ยกเลิก" → ปิด form
- **ปุ่ม "ย้อนกลับ"** → `router.back()`

**Data Loading:**
1. `Invoice/Get(invoiceNumber)` → invoiceData
2. `SaleOrder/Get(soNumber)` → soData → parse JSON data → stockItems
3. Filter: เฉพาะ items ที่อยู่ใน `invoiceResponse.confirmedItems`
4. Map: `stockConfirm` → set id, appraisalPrice, qty, discountPercent, isConfirm, isInvoice

**Currency:** มาจาก SO (`soResponse.currencyUnit`, `soResponse.currencyRate`)

### ราคาป้าย (Tag Price)

```
ต้นทุน (costPrice) × ตัวคูณ (tagPriceMultiplier) = ราคาป้าย (appraisalPrice)
```

- **ต้นทุน (costPrice)**: ราคาต้นทุนรวมของสินค้า — read-only, แสดงเป็นข้อมูลอ้างอิง (หน่วย "บาท" เสมอ)
- **ตัวคูณ (tagPriceMultiplier)**: ค่าที่ตั้งไว้ตอนตีราคา (เช่น 1.5, 2.0) — เก็บใน DB `tag_price_multiplier`
- **ราคาป้าย (appraisalPrice)**: ราคาขายเริ่มต้น — แก้ไขได้ใน item-card (หน่วย "บาท")
- item-card แสดง: ต้นทุน (สีส้ม, read-only, บาท) + badge ตัวคูณ + ราคาป้าย/ชิ้น (editable) + รวม (บาท)
- **PDF ใบสั่งขาย**: แสดงราคาป้ายเท่านั้น (ไม่แสดงต้นทุน) แปลงเป็นสกุลเงินที่เลือก

**Data flow:**
```
appraisal-job-list.vue
  → fetchGetCostVersion(jobRunning)
  → costData.prictransection → sum → totalCost
  → costData.tagPriceMultiplier → tagPrice = totalCost × multiplier
  → fetchDataGet(stockNumber) → materials
  → emit('add-item', { costPrice: totalCost, appraisalPrice: tagPrice, tagPriceMultiplier, materials })

create-view.vue (scan)
  → fetchDataGet({ stockNumber | stockNumberOrigin })
  → response.productPrice → costPrice
  → response.tagPriceMultiplier → tagPrice = costPrice × multiplier
  → response.materials → materials
  → items.push({ costPrice, appraisalPrice: tagPrice, tagPriceMultiplier, materials })
```

### Currency Display

**หลักการ: ราคาใน items เก็บเป็น "บาท" เสมอ แปลงสกุลเงินเฉพาะตอนแสดงยอดรวมและ PDF**

```
ราคาระดับ item (บาท)                     ยอดรวม (สกุลเงินที่เลือก)
┌──────────────────────┐                 ┌───────────────────────────────┐
│ item-card.vue        │                 │ so-summary.vue                │
│  ต้นทุน: 10,000 บาท  │    sum / rate   │  ยอดรวม: 454.55 US$           │
│  ราคาป้าย: 15,000    │ ──────────────→ │  เทียบเท่า: 15,000.00 บาท    │
│  รวม: 15,000 บาท     │                 └───────────────────────────────┘
└──────────────────────┘
                                         ┌───────────────────────────────┐
┌──────────────────────┐                 │ detail-view.vue (summary)     │
│ so-item-card.vue     │    sum / rate   │  ยอดรวม: 454.55 US$           │
│  ราคา: 15,000 บาท    │ ──────────────→ │  เทียบเท่า: 15,000.00 บาท    │
│  รวม: 15,000 บาท     │                 └───────────────────────────────┘
└──────────────────────┘
                                         ┌───────────────────────────────┐
                                         │ PDF (sale-order-pdf-builder)  │
                                    ──→  │  ราคาแปลงเป็นสกุลเงินที่เลือก │
                                         │  ยอดรวม: 454.55 US$           │
                                         └───────────────────────────────┘
```

- **item-card.vue / so-item-card.vue**: แสดงราคาหน่วย "บาท" เสมอ (เพราะ costPrice + appraisalPrice เก็บเป็น THB)
- **so-summary.vue**: แปลง totalAmountTHB ÷ currencyRate → แสดงในสกุลเงินที่เลือก + แสดง "เทียบเท่า xxx บาท" เป็น reference
- **detail-view.vue**: แปลง totalAmount ÷ currencyRate → แสดงในสกุลเงินที่เลือก + "เทียบเท่า xxx บาท"
- **PDF builder**: แปลงราคาทุกรายการเป็นสกุลเงินที่เลือก (รับ `currencyUnit` + `currencyRate` จาก options)

### PDF (`sale-order-pdf-builder.js`)

**Style เหมือน Invoice PDF** — ใช้ layout, table, summary section เดียวกัน:

- A4 format, Thai font (THSarabunNew)
- Page margins: `[10, 10, 10, 40]` (เหมือน Invoice)
- Company header + logo (load from assets)
- SO number + date
- Company info (From:) + Customer info
- **10-column table** (เหมือน Invoice):
  - No., Image, Style/Product, Description, Gold(gms), Diamond(cts), Gem(cts), Qty, Price, Amount
- **ใช้ราคาป้าย (appraisalPrice) เท่านั้น** — ไม่แสดงต้นทุน — แปลงเป็นสกุลเงินที่เลือก
- **Material breakdown** — Gold, Diamond, Gem แยก column (sub-table per cell)
- **Multi-page support** — itemsPerPage (default 10), header repeat ทุกหน้า
- **Financial summary** (เหมือน Invoice):
  - F.O.B Bangkok (Subtotal)
  - Special Discount (ถ้ามี)
  - Special Addition (ถ้ามี)
  - Freight & Insurance (ถ้ามี)
  - VAT % (ถ้ามี)
  - C.I.F (Grand Total)
- **Number to words** — แปลงยอดรวมเป็นตัวอักษรภาษาอังกฤษ
- **Certification section** — ONE PARCEL ONLY, NET WEIGHT, ORIGIN THAILAND, Signature
- Footer: page number (center)

**Product Images ใน PDF:**
```
create-view.vue บันทึก imagePath จาก product API response
    ↓
detail-view.vue โหลด SO → parse items → ส่งให้ PDF builder
    ↓
PDF builder prepareImages()
  → ใช้ item.imageBlobPath || item.imagePath เป็น blobPath
  → getAzureBlobAsBase64(blobPath, 'stock')
    ↓
azure-storage-config.js
  → FileExtension/GetStockProductImage API (backend)
  → Backend ดึงจาก Azure Blob Storage folder "Stock"
  → return Base64 data URL
    ↓
แสดงรูปใน PDF table column ที่ 2
```

## Components

### New Components

| Component | Props | Events | Description |
|-----------|-------|--------|-------------|
| `add-item-method-selector` | `activeTab` (String) | `update:activeTab` | Toggle tabs ตีราคา/สแกน |
| `appraisal-job-list` | `selectedItems` (Array) | `add-item` | รายการ Job ตีราคา (ตรวจซ้ำจาก selectedItems prop) |
| `item-card` | `item` (Object), `index` (Number) | `update`, `remove` | การ์ดสินค้า: แสดงต้นทุน(บาท) + แก้ราคาป้าย/จำนวน/ส่วนลด + รวม(บาท) |
| `item-list` | `items` (Array), `currencyUnit` (String) | `update-item`, `remove-item` | Wrapper สำหรับ item cards |
| `customer-form` | `customer` (Object) | `update:customer` | ฟอร์มลูกค้า + ปุ่มค้นหา + ปุ่มเพิ่มใหม่ |
| `customer-search-modal` | `visible` (Boolean) | `close`, `customer-selected` | Full-screen modal ค้นหาลูกค้าจาก DB |
| `customer-create-modal` | `visible` (Boolean) | `close`, `customer-created` | Full-screen modal เพิ่มลูกค้าใหม่ (auto-gen code: CUST-YYMMDD-XXXX) |
| `so-summary` | `items`, `currencyUnit`, `currencyRate` | - | สรุปราคาในสกุลเงินที่เลือก + อ้างอิงบาท |
| `invoice-creation-form` | `soData` (Object), `stockItems` (Array) | `invoice-created`, `cancel` | ฟอร์มสร้าง Invoice: เลือกสินค้า + ราคาท้ายบิล (ส่วนลด/เพิ่มพิเศษ, Freight, VAT) + ข้อมูลชำระเงิน |
| `so-item-card` | `item` (Object) | - | การ์ดสินค้า read-only + status (ราคาหน่วยบาท) — ใช้ใน view mode + locked section (edit mode) |

### Reused Components

| Component | Source | Usage |
|-----------|--------|-------|
| `QrScanner` | `mobile/scan/components/qr-scanner.vue` | สแกน QR/Barcode ใน Tab B (กล้องเปิดตลอด auto-start) |
| `JobCard` | `mobile/components/job-card.vue` | การ์ดแสดง Job ตีราคา (แสดง stockNumber จาก dataJob) |
| `sweetAlerts` | `services/alert/sweetAlerts.js` | warning, error, success, confirmSubmit |
| Mobile SCSS | `assets/scss/responsive-style/mobile` | Utility classes ทั้งหมด |

## API Integration

### Stores Used (ไม่ได้สร้างใหม่)

| Store | File | Methods Used |
|-------|------|--------------|
| `usrSaleOrderApiStore` | `stores/modules/api/sale/sale-order-store.js` | `fetchList`, `fetchGet`, `fetchSave`, `confirmStockItems` |
| `useInvoiceApiStore` | `stores/modules/api/sale/invoice-store.js` | `fetchList`, `fetchCreate` |
| `usrStockProductApiStore` | `stores/modules/api/stock/product-api.js` | `fetchDataGet`, `fetchGetCostVersion` |
| `useUserApiStore` | `stores/modules/api/user/user-store.js` | `fetchListMyJob` |
| `useAuthStore` | `stores/modules/authen/authen-store.js` | `getUser` (username สำหรับ filter createBy) |
| `useCustomerDetailApiStore` | `stores/modules/api/customer/customer-detail-store.js` | `fetchCustomerSearch`, `fetchCreateCustomer` |
| `useMasterApiStore` | `stores/modules/api/master-store.js` | `fetchCustomerType` (ประเภทลูกค้า) |

### Customer Flow

```
customer-form.vue
  ├── ปุ่ม "ค้นหาลูกค้า" → customer-search-modal.vue (full-screen)
  │     ├── Input search text → Customer/Search API
  │     ├── แสดงรายการลูกค้า (code, name, tel, email, address)
  │     ├── Pagination "โหลดเพิ่มเติม"
  │     └── กดเลือก → emit('customer-selected')
  │
  └── ปุ่ม "เพิ่มลูกค้าใหม่" → customer-create-modal.vue (full-screen)
        ├── Auto-gen รหัสลูกค้า: CUST-YYMMDD-XXXX (refresh ได้)
        ├── กรอก: ประเภท*, ชื่อ TH*, ชื่อ EN, ที่อยู่, เบอร์โทร, อีเมล, ผู้ติดต่อ, หมายเหตุ
        ├── ประเภทลูกค้า: native <select> จาก Master/MasterCustomerType
        ├── Submit → Customer/CreateCustomer API
        └── สำเร็จ → emit('customer-created') → auto-fill ฟอร์ม
```

**Customer data จาก API (Customer/Search หรือ CreateCustomer):**
```javascript
{
  code: 'CUST-001',
  nameTh: 'ชื่อลูกค้า',
  nameEn: 'Customer Name',
  address: 'ที่อยู่',
  telephone1: '081-xxx-xxxx',
  email: 'email@example.com'
}
```

### Currency Conversion

```
create-view.vue
  ├── currencyUnit: 'US$' (default)
  ├── currencyRate: 33.0 (default)
  │
  ├── item-card.vue: ราคาแสดงหน่วย "บาท" (เก็บเป็น THB ภายใน)
  │
  ├── so-summary.vue รับ props:
  │   ├── ยอดรวมบาท = sum(appraisalPrice * qty * (1 - discountPercent/100))
  │   ├── ยอดรวมแปลง = ยอดรวมบาท / currencyRate → แสดงเป็นสกุลเงินที่เลือก
  │   └── "เทียบเท่า xxx บาท" (ถ้า rate ≠ 1)
  │
  └── saveOrder() → formValue includes:
      ├── currencyUnit: 'US$'
      └── currencyRate: 33.0

detail-view.vue
  ├── View mode: ยอดรวม = sum(soItems) / currencyRate
  ├── Edit mode: ยอดรวม = sum(invoicedItems + editItems) / currencyRate
  ├── "เทียบเท่า xxx บาท" (ถ้า rate ≠ 1)
  └── PDF: ส่ง { currencyUnit, currencyRate } → แปลงราคาทุกรายการ
```

### Edit Mode (detail-view.vue)

**Data Flow:**
```
View Mode                          Edit Mode
┌──────────────────┐              ┌──────────────────────────────────┐
│ soItems (readonly)│  startEdit  │ invoicedItems (locked, readonly) │
│  = stockItems     │ ─────────→ │  = stockItems.filter(isInvoice)  │
│  + copyItems      │             │                                  │
└──────────────────┘              │ editItems (working copy)         │
                                  │  = soItems.filter(!isInvoice)    │
                                  │  + เพิ่มใหม่จาก scan/ตีราคา      │
                                  └──────────────────────────────────┘
                                              │ saveChanges
                                              ▼
                                  ┌──────────────────────────────────┐
                                  │ merge: invoicedItems + editItems │
                                  │ → fetchSave({ soNumber: เดิม }) │
                                  │ → reload SO data                │
                                  └──────────────────────────────────┘
```

**Key computed properties:**
```javascript
invoicedItems    // stockItems.filter(item => item.isInvoice) — ล็อค แก้ไม่ได้
allItemsInvoiced // ทุก stockItem ที่มี stockNumber ออก invoice แล้ว → disable ปุ่ม
allCurrentItems  // isEditing ? invoicedItems + editItems : soItems — ใช้คำนวณ summary
displayItemCount // allCurrentItems.length
currentTotalAmountTHB // sum of allCurrentItems prices (บาท)
```

**Edit mode ใช้ components เหมือน create-view:**
- `AddItemMethodSelector` — toggle tab ตีราคา/สแกน
- `AppraisalJobList` — รายการ Job ตีราคา
- `QrScanner` — สแกน QR/Barcode
- `ItemList` / `ItemCard` — รายการสินค้าที่แก้ไขได้
- `SoItemCard` — สินค้าที่ออก Invoice แล้ว (locked section)

### Search Field Selector (Tab B - สแกน)

```
create-view.vue
  ├── searchField: 'stockNumber' (default)
  ├── searchFieldOptions:
  │   ├── { value: 'stockNumber', label: 'รหัสสินค้าใหม่' }
  │   └── { value: 'stockNumberOrigin', label: 'รหัสสินค้าเก่า' }
  │
  └── fetchDataGet({ [searchField]: searchValue })
      ├── stockNumber → POST StockProduct/Get { stockNumber: 'xxx' }
      └── stockNumberOrigin → POST StockProduct/Get { stockNumberOrigin: 'xxx' }
```

## Item Data Structure

```javascript
// Items เก็บเป็น JSON string ในฟิลด์ data ของ SaleOrder
// response.data = '{"stockItems": [...], "copyItems": [...], "allItems": [...]}'

// แต่ละ item มี fields:
{
  stockNumber: 'STK-001',           // เลขที่ผลิต (null ถ้าเป็น copyItem)
  productNumber: 'PRD-001',         // รหัสสินค้า
  description: 'แหวนทอง',           // ชื่อสินค้า
  costPrice: 10000,                 // ต้นทุน (read-only, แสดงอ้างอิง, หน่วยบาทเสมอ)
  price: 15000,                     // ราคาป้าย (= costPrice × tagPriceMultiplier, หน่วยบาท)
  appraisalPrice: 15000,            // ราคาขาย (= ราคาป้าย, แก้ไขได้, หน่วยบาท)
  tagPriceMultiplier: 1.5,          // ตัวคูณราคาป้าย
  discountPercent: 0,               // ส่วนลด %
  qty: 1,                           // จำนวน
  materials: [                      // วัตถุดิบ (แสดงใน PDF แยก Gold/Diamond/Gem)
    { type: 'Gold', typeCode: '18K', weight: 5.25, qty: 1 },
    { type: 'Diamond', typeCode: 'D-VS1', weight: 0.50, qty: 2 },
    { type: 'Gem', typeCode: 'Ruby', weight: 1.00, qty: 3 }
  ],
  imagePath: 'Stock/image.png',     // รูปสินค้า (จาก product API, ใช้ดึงรูปใน PDF)
  imageBlobPath: null,              // Azure Blob path (สำรอง, ปัจจุบัน null)
  imageBase64: null,                // Base64 image (PDF builder โหลดอัตโนมัติจาก imagePath)
  source: 'appraisal' | 'scan',    // แหล่งที่มา (ใน create view)
  jobRunning: 'JOB-001'            // เลข Job (เฉพาะ source: appraisal, ใช้ตรวจซ้ำ)
}

// คำนวณราคารวม: appraisalPrice * qty * (1 - discountPercent / 100) — หน่วยบาท
// แปลงเป็นสกุลเงิน: รวม / currencyRate — เฉพาะ summary + PDF
```

## Files Modified

| File | Change |
|------|--------|
| `src/services/permission/config.js` | เพิ่ม `MOBILE_SALE: 'mobile:sale'` + เพิ่มให้ Dev, Admin, Sale roles |
| `src/router/mobile/authen-routes.js` | เพิ่ม 3 routes: sale, sale/create, sale/detail/:soNumber |
| `src/views/mobile/dashboard/index-view.vue` | เพิ่มปุ่ม "ใบสั่งขาย" ใน Quick Actions |
| `src/config/azure-storage-config.js` | เพิ่ม `'stock'` type → `FileExtension/GetStockProductImage` |

## Styling

ทุก component ใช้:
```scss
<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';
</style>
```

Key classes ที่ใช้:
- `.mobile-container` - Container with padding
- `.mobile-mt-{1-3}` - Margin top (8px, 16px, 24px)
- `.mobile-title` / `.mobile-subtitle` - Typography
- `.mobile-btn` + `.mobile-btn-primary` / `.mobile-btn-outline` / `.mobile-btn-success` - Buttons
- `.mobile-form-group` - Form styling
- `.mobile-empty-state` - Empty state
- `.mobile-grid-2` - 2-column grid
- `.mobile-list` / `.mobile-list-item` - List styling

## Code Quality

- Options API (ตาม pattern เดิมของ project)
- ไม่ใช้ try-catch ใน component (axios middleware จัดการ)
- ไม่ใช้ manual loading state (axios middleware จัดการ)
- ใช้ sweetAlerts เท่านั้น (ไม่ใช้ native alert/confirm)
- Kebab-case filenames ทุกไฟล์
- `@import '@/assets/scss/responsive-style/mobile'` ทุก component
- ไม่ใช้ PrimeVue Dropdown ใน mobile — ใช้ native `<select>` แทน (lightweight, ใช้ native OS picker)

## Cost Version Detail — Currency Conversion

หน้า `cost-version-detail/index-view.vue` (mobile) มีฟีเจอร์แปลงสกุลเงิน (frontend-only):

- **API ไม่รองรับ**: `StockProduct/GetCostVersion` ไม่มี `currencyUnit` / `currencyRate` ใน request, response, หรือ DB model
- **Solution**: User กรอก currency unit + rate เอง (collapsible card)
- แปลงสกุลเงินเฉพาะ **totalCost** และ **tagPrice** (รายการย่อยยังแสดง "บาท" เสมอ — เหมือน SO ที่ item ราคาเป็นบาท แต่ summary แปลง)
- Export PDF ยังเป็นบาท (ไม่ได้แปลง)

## Related Files

- Router: `src/router/mobile/authen-routes.js`
- Permissions: `src/services/permission/config.js`
- Auth Store: `src/stores/modules/authen/authen-store.js`
- Sale Order Store: `src/stores/modules/api/sale/sale-order-store.js`
- Invoice Store: `src/stores/modules/api/sale/invoice-store.js`
- Product Store: `src/stores/modules/api/stock/product-api.js`
- User Store: `src/stores/modules/api/user/user-store.js`
- Customer Store: `src/stores/modules/api/customer/customer-detail-store.js`
- Master Store: `src/stores/modules/api/master-store.js`
- PDF Builder: `src/services/helper/pdf/sale-order/sale-order-pdf-builder.js`
- Invoice PDF Builder: `src/services/helper/pdf/invoice/invoice-pdf-builder.js` (reference style)
- Azure Storage Config: `src/config/azure-storage-config.js` (เพิ่ม stock type)
- QR Scanner: `src/views/mobile/scan/components/qr-scanner.vue`
- Job Card: `src/views/mobile/components/job-card.vue`
- Sweet Alerts: `src/services/alert/sweetAlerts.js`
- Mobile Styles: `src/assets/scss/responsive-style/mobile/`
