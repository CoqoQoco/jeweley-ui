# Quotation System Documentation

ระบบใบเสนอราคาสำหรับธุรกิจเครื่องประดับ

## ภาพรวม

Quotation System เป็นจุดเริ่มต้นของ sales flow ที่ทำหน้าที่สร้างใบเสนอราคาให้ลูกค้า รองรับทั้งการค้นหาสินค้าจากคลัง และการดึงราคาจากรายการตีราคา (Cost Version)

```
Quotation → Sale Order → Production → Delivery → Invoice
    ↑ (ขั้นตอนนี้)
```

## โครงสร้างไฟล์

```
quotation/
├── index-view.vue                      # หน้าหลัก - จัดการ state, routing, orchestration
├── README.md                           # เอกสารนี้
├── components/
│   ├── quotation-view.vue              # ฟอร์มหลัก - ตาราง, ลูกค้า, คำนวณราคา, PDF
│   └── search-view.vue                 # ฟอร์มค้นหาสินค้าและใบเสนอราคา
└── modal/
    ├── cost-version-picker-modal.vue   # เลือกสินค้าจากรายการตีราคา (2026-02)
    ├── edit-stock-view.vue             # แก้ไขสินค้า, วัตถุดิบ, ประเมินราคา
    ├── confirm-create-pdf-view.vue     # ยืนยันการสร้าง PDF (ตั้งค่า items per page)
    ├── customer-search-modal.vue       # ค้นหาลูกค้าจากฐานข้อมูล
    └── customer-create-modal.vue       # เพิ่มลูกค้าใหม่
```

### PDF Generation Files

```
src/services/helper/pdf/quotation/
├── quotation-pdf-builder.js            # InvoicePdfBuilder class - สร้าง PDF ใบเสนอราคา
├── quotation-pdf-integration.js        # generateInvoicePdf() - wrapper function
├── breakdown-pdf-builder.js            # BreakdownPdfBuilder class - สร้าง PDF breakdown
└── breakdown-pdf-integration.js        # generateBreakdownPdf() - wrapper function
```

---

## Architecture

### Component Flow

```
index-view.vue (Orchestrator)
├── search-view.vue
│   ├── @search → ค้นหาสินค้าด้วย stockNumber / productNumber
│   ├── @searchQuotation → ค้นหาใบเสนอราคาด้วยเลขที่
│   └── @clear → ล้างค่าค้นหา
└── quotation-view.vue
    ├── v-model:modelForm → ค้นหาสินค้า
    ├── v-model:modelQuotation → โหลดใบเสนอราคา
    └── Modals:
        ├── CostVersionPickerModal → ดึงจากรายการตีราคา
        ├── EditStockModal → แก้ไขสินค้า/วัตถุดิบ
        ├── ConfirmCreatePdfModal → ยืนยันสร้าง PDF
        ├── CustomerSearchModal → ค้นหาลูกค้า
        └── CustomerCreateModal → เพิ่มลูกค้าใหม่
```

### Route Query Parameters

```
/sale/quotation?number=QT-001          → โหลดใบเสนอราคา QT-001
/sale/quotation?number=QT-001&mode=view → โหลดแบบดูอย่างเดียว (TODO)
```

---

## Data Model

### interfaceForm (Customer Object)

```javascript
const interfaceForm = {
  // Quotation Info
  invoiceNumber: null,           // เลขที่ใบเสนอราคา
  quotationDate: new Date(),     // วันที่
  quotationItems: [],            // รายการสินค้า (Array)

  // Customer Info (read-only, เลือกจาก modal)
  name: null,                    // ชื่อลูกค้า
  address: null,                 // ที่อยู่
  tel: null,                     // เบอร์โทร
  email: null,                   // อีเมล
  remark: null,                  // หมายเหตุ (แก้ไขได้)

  // Currency & Pricing
  currencyUnit: 'US$',          // สกุลเงิน
  currencyMultiplier: 33.0,     // อัตราแลกเปลี่ยน (THB per unit)
  markup: 3.5,                  // อัตรากำไร
  discountPercent: 0,           // ส่วนลดลูกค้า (%)
  goldPerOz: 0,                 // ราคาทอง US$/Oz อ้างอิง

  // Special Items (2026-02)
  specialDiscount: 0,           // ส่วนลดพิเศษ (absolute amount)
  specialAddition: 0,           // ส่วนเพิ่มพิเศษ (absolute amount)
  vatPercent: 0,                // VAT (%)

  // Charges
  freight: 0,                   // ค่าขนส่งและประกัน
  discount: 0                   // ส่วนลด (legacy)
}
```

### interfaceShow (Modal Visibility)

```javascript
const interfaceShow = {
  isEditStock: false,            // Edit Stock Modal
  searchCustomer: false,         // Customer Search Modal
  createCustomer: false,         // Customer Create Modal
  costVersionPicker: false       // Cost Version Picker Modal (2026-02)
}
```

---

## ฟีเจอร์หลัก

### 1. การเพิ่มสินค้า — 2 วิธี

#### วิธีที่ 1: ค้นหาสินค้าจากคลัง (Scan/Key)
- ค้นหาด้วย **เลขที่ผลิต (ใหม่)**: `DK-2502-00X`
- ค้นหาด้วย **เลขที่ผลิต (เก่า)**: `AD054XX`
- ค้นหาด้วย **รหัสสินค้า**: `R08X50XXXL`
- ราคาใช้ `productPrice` (ราคาต้นทุนจริง)

#### วิธีที่ 2: ดึงจากรายการตีราคา (Cost Version) — 2026-02
- กดปุ่ม "ดึงจากรายการตีราคา" → เปิด Modal
- ค้นหาด้วย stockNumber, running (เลขที่ใบตีราคา), createBy
- เลือกรายการ → ระบบดึงข้อมูลสินค้า + คำนวณราคาจากการตี
- ราคาใช้ `costTotal × tagPriceMultiplier` (ราคาประเมินจากการตี)
- เก็บ `priceTransactions` และ `costVersionRunning` ไว้กับ item

### 2. ตารางสินค้า (Quotation Table)

#### คอลัมน์หลัก
| คอลัมน์ | รายละเอียด | แก้ไขได้ |
|---------|------------|----------|
| รูปภาพ | แสดงรูปสินค้า 25x25px | - |
| เลขที่ผลิต | เลขที่ผลิตใหม่/เก่า | - |
| รหัสสินค้า | ProductNumber | แก้ไขได้ |
| รายละเอียด | คำอธิบายสินค้า | แก้ไขได้ |
| Gold (gms) | น้ำหนักทอง แยกตามประเภท | - |
| Diamond (cts) | น้ำหนักเพชร พร้อมจำนวน | - |
| Stone (cts) | น้ำหนักพลอย พร้อมจำนวน | - |
| ราคาขาย (THB) | ราคาต้นฉบับ | - |
| ราคาประเมิน (THB) | ราคาที่ใช้คำนวณ | แก้ไขได้ |
| ส่วนลด (%) | จากค่า discountPercent ของลูกค้า | - |
| ราคาส่วนลด (THB) | ราคาหลังหักส่วนลด | - |
| แปลงเรท | currencyMultiplier | - |
| ราคาแปลง | ราคาในสกุลเงินต่างประเทศ | - |
| จำนวน | จำนวนสินค้า | แก้ไขได้ |
| รวมราคา | ราคารวมต่อรายการ | - |

#### การดำเนินการต่อรายการ
- **ลบ**: ลบรายการออกจากตาราง
- **แก้ไข**: เปิด Modal แก้ไขสินค้า (รูปภาพ, วัตถุดิบ, ประเมินราคา)
- **คัดลอก**: คัดลอกรายการ (ไม่รวมเลขที่ผลิต)

### 3. การคำนวณราคา

#### สูตรการคำนวณ (Computed Properties)

```javascript
// ราคาหลังส่วนลด (per item)
discountPrice = appraisalPrice × (1 - discountPercent / 100)

// ราคาแปลงสกุลเงิน (per item)
convertedPrice = discountPrice ÷ currencyMultiplier

// ราคารวมต่อรายการ
totalConvertedPrice = convertedPrice × qty

// --- Footer Calculations ---

// รวมราคาแปลงทั้งหมด
sumTotalConvertedPrice = Σ(totalConvertedPrice)

// ยอดหลังปรับพิเศษ
totalAfterDiscountAndAddition = sumTotalConvertedPrice - specialDiscount + specialAddition

// ยอดรวมก่อน VAT
totalBeforeVat = totalAfterDiscountAndAddition + freight

// VAT
vatAmount = totalBeforeVat × (vatPercent / 100)

// ยอดรวมสุทธิ
grandTotal = totalBeforeVat + vatAmount
```

#### ส่วนสรุป (Footer Rows)

| Row | ค่า | แก้ไขได้ |
|-----|-----|----------|
| รวมน้ำหนัก | Gold, Diamond, Stone, Net Weight | - |
| รวมราคา | sumTotalConvertedPrice | - |
| ส่วนลดพิเศษ | specialDiscount | แก้ไขได้ |
| ส่วนเพิ่มพิเศษ | specialAddition | แก้ไขได้ |
| ยอดรวมหลังปรับ | totalAfterDiscountAndAddition | - |
| Freight & Insurance | freight | แก้ไขได้ |
| ยอดรวมก่อน VAT | totalBeforeVat | - |
| VAT (%) | vatPercent → vatAmount | แก้ไขได้ |
| ราคารวม (Grand Total) | grandTotal | - |

#### น้ำหนักสุทธิ (Net Weight)

```javascript
netWeight = (diamondWeight + gemWeight) / 5 + goldWeight
```

### 4. ข้อมูลลูกค้า (Customer Information)

#### ข้อมูลพื้นฐาน
- **วันที่ใบเสนอราคา**: เลือกจาก PrimeVue Calendar
- **เลขที่ใบเสนอราคา**: กำหนดเอง

#### การจัดการลูกค้า
- **ค้นหาลูกค้า**: เปิด Modal ค้นหาจากฐานข้อมูล (ชื่อ, รหัส)
- **เพิ่มลูกค้าใหม่**: เปิด Modal สร้างลูกค้าใหม่
- ข้อมูลลูกค้าแสดงแบบ read-only (ชื่อ, ที่อยู่, เบอร์โทร, อีเมล)
- **หมายเหตุ**: สามารถแก้ไขได้

#### การตั้งค่าราคา
| Field | ตัวอย่าง | คำอธิบาย |
|-------|----------|----------|
| Currency | US$, EUR, THB | สกุลเงิน |
| Currency Rate | 33.0 | อัตราแลกเปลี่ยน (THB per unit) |
| Markup | 3.5 | อัตรากำไร |
| Discount (%) | 0-100 | ส่วนลดให้ลูกค้า |
| Gold (US$/Oz.) | 2000 | ราคาทองคำอ้างอิง |

### 5. การแก้ไขสินค้า (Edit Stock Modal)

#### การจัดการรูปภาพ
- **อัปโหลดรูป**: อัปโหลดไฟล์ใหม่ (บีบอัดอัตโนมัติ)
- **เลือกจากคลัง**: เลือกรูปจาก Image Gallery
- **ค้นหารูป**: ค้นหาด้วยชื่อไฟล์

#### จัดการวัตถุดิบ (Materials)
| ประเภท | รหัส | จำนวน+หน่วย | น้ำหนัก+หน่วย | ราคา |
|--------|------|-------------|---------------|------|
| ทอง/เงิน | Gold Master | 1 pc | 5.50 gms | 1000 |
| เพชร | Diamond Grade | 3 pc | 0.75 cts | 2000 |
| พลอย | Gem Master | 5 pc | 2.30 cts | 500 |

#### การประเมินราคา (Cost Calculation)
แบ่งตามประเภทงาน:
- **รายการทอง**: ต้นทุนวัตถุดิบทอง
- **รายการวัตถุดิบ**: เพชร พลอย อื่นๆ
- **รายการงานช่าง**: ค่าแรงช่าง
- **รายการงานฝัง**: ค่างานฝังพลอย
- **รายการเพิ่มเติม**: ค่าใช้จ่ายอื่นๆ

```javascript
totalCost = (qty × qtyPrice) + (weight × weightPrice)
costPerPiece = Σ(totalCost)
```

### 6. Cost Version Picker Modal — 2026-02

Modal สำหรับเลือกสินค้าจากรายการตีราคา

**ค้นหาด้วย**: stockNumber, running (เลขที่ใบตีราคา), createBy

**คอลัมน์ในตาราง**:
| Field | Header | Width |
|-------|--------|-------|
| action | (เลือก) | 80px |
| stockNumber | เลขที่ผลิต | 150px |
| running | ใบตีราคา | 140px |
| createDate | วันที่ | 140px |
| createBy | ผู้สร้าง | 120px |
| totalPrice (computed) | ราคารวม | 120px |
| currencyUnit | สกุลเงิน | 80px |

**Flow**:
1. กดปุ่ม "ดึงจากรายการตีราคา"
2. Modal เปิด → ค้นหา/เลือก Cost Version
3. ระบบดึง stock product data (`fetchDataGet`)
4. คำนวณ appraisalPrice = costTotal × tagPriceMultiplier
5. Map prictransection → priceTransactions
6. เพิ่ม item ใน quotationItems พร้อม `source: 'costVersion'`

### 7. Customer Modals

#### Customer Search Modal (`customer-search-modal.vue`)
- ค้นหาลูกค้าด้วยชื่อหรือรหัสลูกค้า
- DataTable พร้อม pagination + sorting
- คอลัมน์: รหัส, ชื่อ TH, ชื่อ EN, ที่อยู่, โทรศัพท์, E-mail

#### Customer Create Modal (`customer-create-modal.vue`)
- เพิ่มลูกค้าใหม่ในระบบ
- ฟิลด์: รหัส (บังคับ), ประเภท (บังคับ), ชื่อ TH (บังคับ), ชื่อ EN, ที่อยู่, เบอร์โทร, E-mail

### 8. การสร้าง PDF

#### ประเภท PDF
| ประเภท | Builder Class | Integration Function |
|--------|--------------|---------------------|
| Quotation File | `InvoicePdfBuilder` | `generateInvoicePdf()` |
| Breakdown File | `BreakdownPdfBuilder` | `generateBreakdownPdf()` |

#### Quotation PDF — Layout

```
┌──────────────────────────────────────────────────────────┐
│ [Logo] Duang Kaew Jewelry              QUOTATION         │
│                                        No.: QT-001       │
│                                        Date: Feb 22, 2026│
├──────────────────────────────────────────────────────────┤
│ From: Duang Kaew Jewelry...    Consigned To: Customer... │
├──────────────────────────────────────────────────────────┤
│ No │ Img │ Style │ Desc │ Gold │ Diamond │ Gem │Qty│Price│
│  1 │     │ R001  │ Ring │ 5.50 │  0.75   │2.30 │ 1 │ xxx│
│  2 │     │ B001  │ Brace│ 8.20 │  1.00   │     │ 2 │ xxx│
├──────────────────────────────────────────────────────────┤
│ Total                                          │  xxx.xx │
│                              F.O.B Bangkok     │  xxx.xx │ ← แสดงเมื่อมี row อื่นต่อ
│                              SPECIAL DISCOUNT  │ -xxx.xx │ ← แสดงเมื่อ > 0
│                              SPECIAL ADDITION  │  xxx.xx │ ← แสดงเมื่อ > 0
│                              FREIGHT & INSURE  │  xxx.xx │ ← แสดงเมื่อ > 0
│                              SUB TOTAL         │  xxx.xx │ ← แสดงเมื่อ VAT > 0
│                              VAT (7%)          │  xxx.xx │ ← แสดงเมื่อ VAT > 0
│ (US$) ONE THOUSAND ONLY      C.I.F             │  xxx.xx │ ← แสดงเสมอ
├──────────────────────────────────────────────────────────┤
│ ONE PARCEL ONLY                  Confirm and Accept      │
│ WE CERTIFY THAT THIS INVOICE TRUE AND CORRECT.          │
│ xxx NET WEIGHT OF MERCHANDISES (gms.)                    │
│ ORIGIN THAILAND                  ____________________    │
│                                  (Authorized Signature)  │
└──────────────────────────────────────────────────────────┘
```

**PDF Footer Rows — Conditional Display**:
- **F.O.B Bangkok**: แสดงเฉพาะเมื่อมี row อื่นต่อท้าย (specialDiscount, specialAddition, freight, หรือ VAT)
- **SPECIAL DISCOUNT**: แสดงเฉพาะเมื่อ `specialDiscount > 0`
- **SPECIAL ADDITION**: แสดงเฉพาะเมื่อ `specialAddition > 0`
- **FREIGHT & INSURANCE**: แสดงเฉพาะเมื่อ `freight > 0`
- **SUB TOTAL**: แสดงเฉพาะเมื่อ `vatPercent > 0`
- **VAT (x%)**: แสดงเฉพาะเมื่อ `vatPercent > 0`
- **C.I.F (Grand Total)**: แสดงเสมอ

#### การตั้งค่า PDF
- **Items per page**: จำนวนรายการต่อหน้า (1-50, default 10)
- **Save and Create**: บันทึกข้อมูลก่อนสร้าง PDF
- เปิดใน tab ใหม่ (ป้องกัน popup blocker ด้วย pre-open window)

#### Breakdown PDF
- Layout แนวนอน (landscape)
- แสดงรายละเอียดวัตถุดิบต่อชิ้น
- ไม่รวม special items (แสดงเฉพาะ per-item cost detail)

---

## การจัดเก็บข้อมูล

### การบันทึก (Save Quotation)

```javascript
// API: POST Quotation/Upsert
const formValue = {
  number: invoiceNumber,

  // Customer
  customerName, customerAddress, customerPhone, customerEmail,

  // Currency & Pricing
  currency: currencyUnit,       // เช่น 'US$'
  currencyRate: currencyMultiplier, // เช่น 33.0
  markup,                       // เช่น 3.5
  discount: discountPercent,    // เช่น 10 (%)

  // Special Items (2026-02)
  specialDiscount,              // absolute amount
  specialAddition,              // absolute amount
  vat: vatPercent,              // เช่น 7 (%)
  goldPerOz,                    // US$/Oz

  // Charges & Info
  freight,
  date,
  remark,

  // Items
  data: JSON.stringify(quotationItems)
}
```

### การโหลด (Load Quotation)

```javascript
// API: POST Quotation/Get
const res = await quotationStore.fetchGet({ formValue: { number } })

// Field Mapping (API → Frontend)
// res.currency       → currencyUnit
// res.currencyRate   → currencyMultiplier
// res.markUp         → markup          (ตัว U ตัวใหญ่ใน API)
// res.discount       → discountPercent
// res.vat            → vatPercent
// res.specialDiscount → specialDiscount
// res.specialAddition → specialAddition
// res.goldPerOz      → goldPerOz
// res.data           → JSON.parse() → quotationItems
```

---

## Quotation → Sale Order Flow

เมื่อ SO ดึงข้อมูลจาก Quotation (`loadQuotationData` ใน `sale-order/index-view.vue`):

```javascript
saleOrderData = {
  quotationNumber,
  customer: { name, address, phone, email },
  discount,
  freight,
  items: JSON.parse(response.data),

  // ส่งต่อ currency / markup / special items
  currencyUnit: response.currency,
  currencyRate: response.currencyRate,
  markup: response.markUp,
  goldPerOz: response.goldPerOz,
  specialDiscount: response.specialDiscount,
  specialAddition: response.specialAddition,
  vat: response.vat
}
```

---

## ข้อมูลเทคนิค

### Computed Properties

| Property | คำนวณ |
|----------|-------|
| `sumGoldWeight` | รวมน้ำหนักทอง (gms) |
| `sumDiamondWeight` | รวมน้ำหนักเพชร (cts) |
| `sumAppraisalPrice` | รวมราคาประเมิน (THB) |
| `sumDiscountPrice` | รวมราคาหลังหักส่วนลด (THB) |
| `sumConvertedPrice` | รวมราคาแปลงสกุลเงิน |
| `sumTotalConvertedPrice` | รวมราคาแปลง × จำนวน |
| `sumNetWeight` | น้ำหนักสุทธิ = (diamond+gem)/5 + gold |
| `totalAfterDiscountAndAddition` | sumTotal - specialDiscount + specialAddition |
| `totalBeforeVat` | totalAfterDiscount + freight |
| `vatAmount` | totalBeforeVat × vatPercent/100 |
| `grandTotal` | totalBeforeVat + vatAmount |
| `masterGold` | ข้อมูล Master ทอง |
| `masterGem` | ข้อมูล Master พลอย |
| `masterDiamondGrade` | ข้อมูล Master เกรดเพชร |

### API Stores

| Store | Methods | ใช้งาน |
|-------|---------|--------|
| `usrStockProductApiStore` | `fetchDataGet`, `fetchListCostVersion` | ค้นหาสินค้า, ดึง Cost Version |
| `usrQuotationApiStore` | `fetchSave`, `fetchGet` | บันทึก/โหลดใบเสนอราคา |
| `useMasterApiStore` | `.gold`, `.gem`, `.diamondGrade` | ข้อมูล Master วัตถุดิบ |
| `useCustomerDetailApiStore` | `fetchCustomerSearch`, `fetchCreateCustomer` | จัดการลูกค้า |
| `stockProductImageApiStore` | image APIs | จัดการรูปภาพสินค้า |

### Dependencies
- **Vue 3**: Options API
- **PrimeVue**: DataTable (ColumnGroup footer), Calendar, Dropdown
- **Pinia**: State management (API stores)
- **pdfmake**: PDF generation (THSarabunNew font)
- **dayjs**: Date formatting
- **Azure Blob Storage**: Product images

### Performance
- **Async Components**: Modal โหลดแบบ lazy (`defineAsyncComponent`)
- **Image Compression**: บีบอัดรูปก่อนอัปโหลด
- **Computed Properties**: คำนวณราคาแบบ reactive
- **Pre-load Images**: PDF builder โหลดรูปจาก Azure Blob ก่อนสร้าง PDF

---

## การใช้งาน

### 1. สร้างใบเสนอราคาใหม่

1. **เพิ่มสินค้า** — เลือกวิธีใดวิธีหนึ่ง:
   - *ค้นหาจากคลัง*: พิมพ์เลขที่ผลิต/รหัสสินค้า → สินค้าเพิ่มเข้าตาราง
   - *ดึงจากรายการตีราคา*: กดปุ่ม → เลือกจาก Modal → สินค้าเพิ่มพร้อมราคาจากการตี
2. แก้ไขราคาประเมินและจำนวนตามต้องการ
3. **เลือกลูกค้า**: ค้นหาจากฐานข้อมูล หรือเพิ่มลูกค้าใหม่
4. ตั้งค่าสกุลเงิน, อัตราแลกเปลี่ยน, ส่วนลด
5. กรอกรายการพิเศษ (ถ้ามี): ส่วนลดพิเศษ, ส่วนเพิ่มพิเศษ, VAT
6. สร้าง PDF หรือบันทึกข้อมูล

### 2. แก้ไขใบเสนอราคาเดิม

1. ค้นหาด้วยเลขที่ใบเสนอราคา
2. ระบบโหลดข้อมูลเดิม (สินค้า, ลูกค้า, ราคา, special items)
3. แก้ไขข้อมูลตามต้องการ
4. บันทึกข้อมูลใหม่

### 3. สร้าง PDF

1. กดปุ่ม "Quotation File" หรือ "Save & Create PDF"
2. ระบุจำนวนรายการต่อหน้า (1-50)
3. PDF เปิดใน tab ใหม่
4. (ถ้ามีเลขที่ใบเสนอราคา) สามารถสร้าง Breakdown PDF พร้อมกันได้

---

## การบำรุงรักษา

### หากต้องการเพิ่มคอลัมน์ใหม่
1. เพิ่ม `<Column>` ใน `quotation-view.vue`
2. เพิ่ม field ใน `interfaceForm`
3. อัปเดต computed properties
4. ปรับ PDF template (`quotation-pdf-builder.js`)

### หากต้องการเปลี่ยนสูตรคำนวณ
1. แก้ไข computed properties ใน `quotation-view.vue`
2. แก้ไข `calculateTotalAmount()` + `buildFinalTableBody()` ใน `quotation-pdf-builder.js`
3. ทดสอบทั้งหน้าจอและ PDF

### หากต้องการเพิ่ม Footer Row ใน PDF
1. แก้ไข `buildFinalTableBody()` ใน `quotation-pdf-builder.js`
2. เพิ่ม parameter ใน constructor (ถ้าต้องรับค่าใหม่)
3. ส่งค่าจาก `quotation-pdf-integration.js`
4. Row จะแสดงเฉพาะเมื่อค่า > 0 (conditional display)

### Backend Requirements (Quotation Table)
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `specialDiscount` | decimal | 0 | ส่วนลดพิเศษ |
| `specialAddition` | decimal | 0 | ส่วนเพิ่มพิเศษ |
| `vat` | decimal | 0 | VAT (%) |
| `goldPerOz` | decimal | 0 | ราคาทอง US$/Oz |

---

## Changelog

### 2026-02-22
- เพิ่ม **Cost Version Picker Modal** — ดึงสินค้าจากรายการตีราคา
- เพิ่ม **Special Items** ใน footer — ส่วนลดพิเศษ, ส่วนเพิ่มพิเศษ, VAT (%)
- อัปเดต **Quotation PDF** — รองรับ special items (conditional display)
- อัปเดต **Quotation → SO flow** — ส่ง currency, markup, special items ให้ SO
- เพิ่ม fields: `specialDiscount`, `specialAddition`, `vatPercent`, `goldPerOz`
- เพิ่ม computed: `totalAfterDiscountAndAddition`, `totalBeforeVat`, `vatAmount`, `grandTotal`

### 2025-01-15
- แยก Customer Information Section
- เพิ่ม Customer Search Modal
- เพิ่ม Customer Create Modal
- เปลี่ยนข้อมูลลูกค้าเป็น read-only display

---
*อัปเดตล่าสุด: 2026-02-22*
