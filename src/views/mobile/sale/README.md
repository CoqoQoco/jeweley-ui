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
├── README.md                           # เอกสารนี้
└── components/
    ├── add-item-method-selector.vue    # Tab toggle: ตีราคา | สแกน
    ├── appraisal-job-list.vue          # รายการ Job ตีราคาที่ Completed
    ├── item-card.vue                   # การ์ดสินค้า (แก้ราคา/จำนวน/ส่วนลดได้)
    ├── item-list.vue                   # รายการสินค้าที่เพิ่มแล้ว
    ├── customer-form.vue               # ฟอร์มลูกค้า (เลือกจาก DB + แสดงข้อมูล)
    ├── customer-search-modal.vue       # Full-screen modal ค้นหาลูกค้าจาก DB
    ├── so-summary.vue                  # สรุปราคา (THB + สกุลเงินแปลง)
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
        └── Card list: Invoice number, ลูกค้า, วันที่, จำนวนรายการ, ยอดรวม, status badge
    ↓
สร้าง SO (create-view)
  ├── Tab A: เลือกจากรายการตีราคา (Job ที่ Completed) → ได้ราคาตีราคาใหม่
  ├── Tab B: สแกน QR / พิมพ์ stock number → ได้ราคาต้นทุนจริง
  ├── แก้ราคา / จำนวน / ส่วนลด % ได้ทุกรายการ
  ├── ตั้งค่าสกุลเงิน (Currency Unit + Rate)
  ├── เลือกลูกค้าจากฐานข้อมูล (Customer Search)
  └── บันทึก: "สร้างใบสั่งขาย" (Confirmed)
    ↓
รายละเอียด SO (detail-view)
  ├── ข้อมูล SO + ข้อมูลลูกค้า + รายการสินค้า (read-only)
  ├── ปุ่ม "พิมพ์ใบสั่งขาย" → สร้าง PDF (A4, style เหมือน Invoice)
  └── ปุ่ม "ออก Invoice" → Confirm Stock + Create Invoice รวมขั้นตอนเดียว
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
  - กดเลือก → fetchGetCostVersion → fetchDataGet → เพิ่มสินค้าพร้อมราคาตีราคา
- **Tab B "สแกนสินค้า"**: ใช้ QrScanner + manual input
  - สแกน/พิมพ์ stock number → fetchDataGet → เพิ่มสินค้าพร้อมราคาต้นทุนจริง

**Section 2 - รายการสินค้า**
- แสดงรายการที่เพิ่มแล้ว (item-card.vue)
- แก้ไขราคา / จำนวน / ส่วนลด % ได้
- ลบรายการได้
- คำนวณ total อัตโนมัติ: `price * qty * (1 - discountPercent / 100)`

**Section 3 - สกุลเงิน (Currency)**
- Currency Unit (default: `US$`)
- Currency Rate (default: `33.0`)
- สรุปราคาแสดงทั้ง THB และสกุลเงินที่แปลง
- ส่งค่า `currencyUnit` + `currencyRate` ไปกับ formValue ตอนบันทึก

**Section 4 - ข้อมูลลูกค้า (Customer Search)**
- ปุ่ม "ค้นหาลูกค้า" → เปิด full-screen modal ค้นหาจากฐานข้อมูล
- ใช้ `useCustomerDetailApiStore().fetchCustomerSearch()` — API: `Customer/Search`
- เมื่อเลือกลูกค้า → auto-fill: customerCode, customerName, customerTel, customerEmail, customerAddress
- ข้อมูลลูกค้า read-only (ยกเว้นหมายเหตุ) — ต้องเลือกจาก DB เท่านั้น
- **Required**: ต้องเลือกลูกค้าก่อนบันทึก SO (API ต้องการ `customerCode`)

**Section 5 - สรุป + บันทึก**
- แสดงจำนวนรายการ
- ยอดรวม THB + ยอดรวมแปลงสกุลเงิน (ถ้า rate ≠ 1)
- ปุ่ม "สร้างใบสั่งขาย" (status: Confirmed)
- Validation: ต้องมีสินค้า ≥ 1 + ต้องเลือกลูกค้า + ต้องระบุ currency

**formValue ที่ส่งไป API (saveOrder):**
```javascript
{
  soNumber: 'SO-2025-001',
  status: 'Confirmed',
  customerCode: 'CUST-001',         // ← required (จาก customer search)
  customerName: 'ชื่อลูกค้า',
  customerTel: '081-xxx-xxxx',
  customerEmail: 'email@example.com',
  customerAddress: 'ที่อยู่',
  remark: 'หมายเหตุ',
  currencyUnit: 'US$',               // ← required (default: US$)
  currencyRate: 33.0,                 // ← required (default: 33.0)
  priority: 'mobile',
  data: JSON.stringify({
    stockItems: [...],
    copyItems: [...],
    allItems: [...],
    freight: 0,
    copyFreight: 0
  })
}
```

### หน้า 3: รายละเอียด SO (`detail-view.vue`)
- ข้อมูล SO: เลข SO, วันที่, ผู้สร้าง, status badge
- ข้อมูลลูกค้า: ชื่อ, เบอร์, ที่อยู่
- รายการสินค้า (read-only, so-item-card.vue)
- สรุปราคา
- ข้อมูล Invoice (ถ้าออกแล้ว)
- **ปุ่ม "พิมพ์ใบสั่งขาย"** → สร้าง PDF download
- **ปุ่ม "ออก Invoice"** → Confirm Stock + Create Invoice (ซ่อนถ้าออก Invoice แล้ว)

### PDF (`sale-order-pdf-builder.js`)

**Style เหมือน Invoice PDF** — ใช้ layout, table, summary section เดียวกัน:

- A4 format, Thai font (THSarabunNew)
- Page margins: `[10, 10, 10, 40]` (เหมือน Invoice)
- Company header + logo (load from assets)
- SO number + date
- Company info (From:) + Customer info
- **10-column table** (เหมือน Invoice):
  - No., Image, Style/Product, Description, Gold(gms), Diamond(cts), Gem(cts), Qty, Price, Amount
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
| `appraisal-job-list` | `selectedItems` (Array) | `add-item` | รายการ Job ตีราคา Completed |
| `item-card` | `item` (Object), `index` (Number) | `update`, `remove` | การ์ดสินค้า editable |
| `item-list` | `items` (Array) | `update-item`, `remove-item` | Wrapper สำหรับ item cards |
| `customer-form` | `customer` (Object) | `update:customer` | ฟอร์มลูกค้า + ปุ่มค้นหา DB |
| `customer-search-modal` | `visible` (Boolean) | `close`, `customer-selected` | Full-screen modal ค้นหาลูกค้าจาก DB |
| `so-summary` | `items`, `currencyUnit`, `currencyRate` | - | สรุปราคา THB + แปลงสกุลเงิน |
| `so-item-card` | `item` (Object) | - | การ์ดสินค้า read-only + status |

### Reused Components

| Component | Source | Usage |
|-----------|--------|-------|
| `QrScanner` | `mobile/scan/components/qr-scanner.vue` | สแกน QR/Barcode ใน Tab B |
| `sweetAlerts` | `services/alert/sweetAlerts.js` | warning, error, success, confirmSubmit |
| Mobile SCSS | `assets/scss/responsive-style/mobile` | Utility classes ทั้งหมด |

## API Integration

### Stores Used (ไม่ได้สร้างใหม่)

| Store | File | Methods Used |
|-------|------|--------------|
| `usrSaleOrderApiStore` | `stores/modules/api/sale/sale-order-store.js` | `fetchList`, `fetchGet`, `fetchSave`, `fetchGenerateRunningNumber`, `confirmStockItems` |
| `useInvoiceApiStore` | `stores/modules/api/sale/invoice-store.js` | `fetchList`, `fetchCreate` |
| `usrStockProductApiStore` | `stores/modules/api/stock/product-api.js` | `fetchDataGet`, `fetchGetCostVersion` |
| `useUserApiStore` | `stores/modules/api/user/user-store.js` | `fetchListMyJob` |
| `useAuthStore` | `stores/modules/authen/authen-store.js` | `getUser` (username สำหรับ filter createBy) |
| `useCustomerDetailApiStore` | `stores/modules/api/customer/customer-detail-store.js` | `fetchCustomerSearch` (ค้นหาลูกค้าจาก DB) |

### Customer Search Flow

```
customer-form.vue
  ├── ปุ่ม "ค้นหาลูกค้า" → showSearchModal = true
  └── customer-search-modal.vue (full-screen overlay)
        ├── Input search text → fetchCustomerSearch({ formValue: { text } })
        ├── แสดงรายการลูกค้า (code, name, tel, email, address)
        ├── Pagination "โหลดเพิ่มเติม"
        └── กดเลือก → emit('customer-selected', customerData)
              ↓
        customer-form.vue onCustomerSelected()
          → populate: customerCode, customerName, customerTel, customerEmail, customerAddress
              ↓
        create-view.vue customer object
          → ส่งไป formValue ตอน saveOrder()
```

**Customer data จาก API (Customer/Search):**
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
  ├── so-summary.vue รับ props:
  │   ├── ยอดรวม THB = sum(appraisalPrice * qty * (1 - discountPercent/100))
  │   └── ยอดรวม converted = THB / currencyRate
  │
  └── saveOrder() → formValue includes:
      ├── currencyUnit: 'US$'
      └── currencyRate: 33.0
```

**Reference**: Web version `sale-order-view.vue` uses same pattern:
- Currency inputs: `currencyUnit` (text), `currencyRate` (number)
- Price conversion: `price / currencyRate`
- Default: `US$` / `33.0`

## Item Data Structure

```javascript
// Items เก็บเป็น JSON string ในฟิลด์ data ของ SaleOrder
// response.data = '{"stockItems": [...], "copyItems": [...], "allItems": [...]}'

// แต่ละ item มี fields:
{
  stockNumber: 'STK-001',           // เลขที่ผลิต (null ถ้าเป็น copyItem)
  productNumber: 'PRD-001',         // รหัสสินค้า
  description: 'แหวนทอง',           // ชื่อสินค้า
  price: 15000,                     // ราคาจากระบบ
  appraisalPrice: 15000,            // ราคาตีราคา (ราคาขาย)
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
  source: 'appraisal' | 'scan'     // แหล่งที่มา (ใน create view)
}

// คำนวณราคารวม: appraisalPrice * qty * (1 - discountPercent / 100)
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

## Related Files

- Router: `src/router/mobile/authen-routes.js`
- Permissions: `src/services/permission/config.js`
- Auth Store: `src/stores/modules/authen/authen-store.js`
- Sale Order Store: `src/stores/modules/api/sale/sale-order-store.js`
- Invoice Store: `src/stores/modules/api/sale/invoice-store.js`
- Product Store: `src/stores/modules/api/stock/product-api.js`
- User Store: `src/stores/modules/api/user/user-store.js`
- Customer Store: `src/stores/modules/api/customer/customer-detail-store.js`
- PDF Builder: `src/services/helper/pdf/sale-order/sale-order-pdf-builder.js`
- Invoice PDF Builder: `src/services/helper/pdf/invoice/invoice-pdf-builder.js` (reference style)
- Azure Storage Config: `src/config/azure-storage-config.js` (เพิ่ม stock type)
- QR Scanner: `src/views/mobile/scan/components/qr-scanner.vue`
- Sweet Alerts: `src/services/alert/sweetAlerts.js`
- Mobile Styles: `src/assets/scss/responsive-style/mobile/`
