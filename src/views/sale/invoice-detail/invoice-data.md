# Invoice Detail View - Data Structure Documentation

## คำอธิบาย

ไฟล์ Invoice Detail (`index-view.vue`) เป็นหน้าแสดงข้อมูล Invoice แบบ Read-only ไม่สามารถแก้ไขได้

## ไฟล์ที่เกี่ยวข้อง

- **Main View**: `index-view.vue`
- **Modals**:
  - `modal/invoice-version-modal.vue` - สร้าง Version ใหม่
  - `modal/invoice-confirm-print-modal.vue` - ยืนยันพิมพ์ PDF
  - `modal/payment-record-modal.vue` - บันทึกการเก็บเงิน
- **Stores**:
  - `@/stores/modules/api/sale/invoice-store.js`
  - `@/stores/modules/api/sale/sale-order-store.js`
- **Services**:
  - `@/services/helper/pdf/invoice/invoice-pdf-integration.js`

---

## 1. Data Structure

### 1.1 Component Data

```javascript
data() {
  return {
    // Invoice Data
    invoiceData: null,              // ข้อมูล Invoice จาก API
    invoiceItems: [],               // รายการสินค้าใน Invoice

    // Sale Order Data (สำรองไว้)
    formSaleOrder: {},              // ข้อมูล SO ที่เกี่ยวข้อง

    // UI States
    loadError: null,                // Error message ในกรณีโหลดไม่สำเร็จ
    fromRoute: null,                // เก็บ route ที่มา (สำรับ navigation)
    type: 'STOCK-PRODUCT',          // Type สำรับ image preview

    // Modal States
    showVersionModal: false,        // แสดง Version Modal
    showConfirmPrintModal: false,   // แสดง Print Modal
    showPaymentModal: false,        // แสดง Payment Modal

    // Payment Data
    paidAmount: 0,                  // ยอดเงินที่ชำระแล้วทั้งหมด

    // Version Data
    versionList: [],                // รายการ Invoice Versions
    originalInvoiceData: null,      // เก็บข้อมูล Invoice ต้นฉบับ
    originalInvoiceItems: [],       // เก็บรายการสินค้าต้นฉบับ
    currentViewingVersion: null,    // Version ที่กำลังดูอยู่

    // Stores
    invoiceStore: useInvoiceApiStore(),
    saleOrderStore: usrSaleOrderApiStore()
  }
}
```

---

## 2. invoiceData Structure

ข้อมูลที่ได้จาก `invoiceStore.fetchGet()`

```javascript
invoiceData: {
  // Basic Info
  invoiceNumber: String,          // เลขที่ Invoice (PK)
  soNumber: String,               // เลขที่ Sale Order
  createDate: Date,               // วันที่สร้าง Invoice
  deliveryDate: Date,             // วันที่กำหนดส่ง
  statusName: String,             // สถานะ (Draft, Confirmed, Cancelled)
  createBy: String,               // ผู้สร้าง

  // Customer Info
  customerName: String,           // ชื่อลูกค้า
  customerTel: String,            // เบอร์โทร
  customerEmail: String,          // อีเมล
  customerAddress: String,        // ที่อยู่

  // Currency & Financial
  currencyUnit: String,           // สกุลเงิน (THB, USD, etc.)
  currencyRate: Number,           // อัตราแลกเปลี่ยน
  specialDiscount: Number,        // ส่วนลดพิเศษ
  specialAddition: Number,        // ส่วนเพิ่มพิเศษ
  freightAndInsurance: Number,    // ค่าขนส่งและประกันภัย

  // Payment Info
  paymentName: String,            // วิธีการชำระเงิน (เงินสด)
  paymentDay: Number,             // ระยะเวลาชำระ (วัน)
  deposit: Number,                // ราคามัดจำ
  depositPercent: Number,         // เปอร์เซ็นต์มัดจำ

  // Items (Confirmed Items only)
  confirmedItems: Array,          // รายการสินค้าที่ยืนยันแล้วทั้งหมด

  // Others
  remark: String                  // หมายเหตุ
}
```

---

## 3. invoiceItems Structure

รายการสินค้าที่รวมมา Sale Order และใน Invoice

```javascript
invoiceItems: [
  {
    // Stock Info
    stockNumber: String,           // เลขที่สต๊อก (ใหม่)
    stockNumberOrigin: String,     // เลขที่สต๊อก (เดิม)
    productNumber: String,         // รหัสสินค้า
    description: String,           // รายละเอียด
    imagePath: String,             // Path รูปภาพ

    // Materials
    materials: [
      {
        type: String,              // 'Gold', 'Diamond', 'Gem'
        typeCode: String,          // รหัสวัตถุดิบ
        weight: Number,            // น้ำหนัก
        qty: Number                // จำนวน (สำรับ Diamond/Gem)
      }
    ],

    // Pricing (in THB)
    priceOrigin: Number,           // ราคาขาย (THB)
    price: Number,                 // ราคาปัจจุบัน
    appraisalPrice: Number,        // ราคาประเมิน (THB)
    discountPercent: Number,       // ส่วนลด (%)

    // Quantity
    qty: Number,                   // จำนวน

    // Status
    isConfirm: Boolean,            // ยืนยันแล้วหรือไม่?
    isInvoice: Boolean,            // มี Invoice แล้วหรือไม่?
    invoice: String,               // เลขที่ Invoice
    isRemainProduct: Boolean,      // เป็นสินค้าเหลือหรือไม่?
    message: String                // ข้อความแจ้งเตือน
  }
]
```

---

## 4. formSaleOrder Structure

ข้อมูล Sale Order ที่ใช้ในการแสดงผลเพิ่มเติม

```javascript
formSaleOrder: {
  // SO Info
  number: String,                 // เลขที่ SO
  date: Date,                     // วันที่ SO
  expectedDeliveryDate: Date,     // วันที่คาดว่าจะส่ง
  quotationNumber: String,        // เลขที่ใบเสนอราคา
  priority: String,               // ลำดับความสำคัญ
  remark: String,                 // หมายเหตุ SO

  // Customer Info (from SO)
  customerCode: String,
  customerName: String,
  customerAddress: String,
  customerPhone: String,
  customerEmail: String,
  customerRemark: String,

  // Currency & Rates
  currencyUnit: String,           // สกุลเงิน
  currencyRate: Number,           // อัตราแลกเปลี่ยน
  markup: Number,                 // Markup
  goldPerOz: Number,              // ราคาทองออนซ์

  // Freight
  freight: Number,                // ค่าขนส่ง
  copyFreight: Number,            // ค่าขนส่ง (copy)

  // Deposit
  depositRequired: Boolean        // ต้องการมัดจำหรือไม่?
}
```

---

## 5. versionList Structure

รายการ Invoice Versions จาก `invoiceStore.fetchListVersions()`

```javascript
versionList: [
  {
    versionNumber: String,        // เลขที่ Version (e.g., "INV-001-V001")
    invoiceNumber: String,        // เลขที่ Invoice
    soNumber: String,             // เลขที่ SO
    data: String,                 // JSON string ของข้อมูล Version
    createDate: Date,             // วันที่สร้าง
    createBy: String,             // ผู้สร้าง
    isActive: Boolean             // ใช้งานอยู่หรือไม่?
  }
]
```

### Version Data (parsed JSON)

```javascript
{
  currencyUnit: String,
  currencyRate: Number,
  specialDiscount: Number,
  specialAddition: Number,
  freightAndInsurance: Number,
  items: Array                    // รายการสินค้า (เหมือน invoiceItems)
}
```

---

## 6. Computed Properties

### 6.1 totalSelectedAmount

```javascript
totalSelectedAmount() {
  return Number(this.getSumTotalConvertedPrice(this.invoiceItems) || 0)
}
```
- **ความหมาย**: ยอดรวมสินค้าทั้งหมด (หลังแปลงสกุลเงิน)
- **ใช้ใน**: การคำนวณยอดสุดท้าย

### 6.2 totalAfterDiscountAndAddition

```javascript
totalAfterDiscountAndAddition() {
  const baseTotal = this.totalSelectedAmount
  const afterDiscount = baseTotal - Number(this.invoiceData?.specialDiscount || 0)
  const afterAddition = afterDiscount + Number(this.invoiceData?.specialAddition || 0)
  return afterAddition
}
```
- **ความหมาย**: ยอดรวมหลังหักส่วนลดพิเศษและบวกส่วนพิเศษ
- **สูตร**: `ยอดรวมสินค้า - ส่วนลด + ส่วนเพิ่ม`

### 6.3 grandTotal

```javascript
grandTotal() {
  return this.totalAfterDiscountAndAddition + Number(this.invoiceData?.freightAndInsurance || 0)
}
```
- **ความหมาย**: ยอดรวม Invoice สุดท้าย
- **สูตร**: `ยอดรวมหลังปรับ + ค่าขนส่งและประกัน`

---

## 7. Lifecycle Hooks

### 7.1 mounted()

```javascript
async mounted() {
  // 1. เก็บ route ที่มา
  this.fromRoute = this.$route.query.from || null

  // 2. ดึง invoice number จาก query params
  const invoiceNumber = this.$route.query.invoiceNumber

  if (invoiceNumber) {
    // 3. โหลดข้อมูล Invoice
    await this.loadInvoiceData(invoiceNumber)

    // 4. โหลดประวัติการชำระเงิน
    await this.loadPaymentHistory()
  } else {
    this.loadError = 'ไม่พบเลขที่ Invoice ในระบบ'
  }
}
```

---

## 8. Key Methods

### 8.1 loadInvoiceData(invoiceNumber)

**หน้าที่**: โหลดข้อมูล Invoice และ Sale Order

**ขั้นตอน**:
1. เรียก `invoiceStore.fetchGet()` เพื่อดึงข้อมูล Invoice
2. เรียก `getSaleOrderData()` เพื่อดึงข้อมูล SO
3. Map ข้อมูล SO ลง `formSaleOrder`
4. กรองเฉพาะรายการ `invoiceItems` จาก SO ที่มี confirmed items ใน Invoice
5. เก็บข้อมูลต้นฉบับไว้ใน `originalInvoiceData` และ `originalInvoiceItems`
6. เรียก `loadVersions()` เพื่อโหลดรายการ Version

### 8.2 getSaleOrderData(soNumber)

**หน้าที่**: ดึงข้อมูล Sale Order และแปลงโครงสร้าง

**Return**:
```javascript
{
  number: String,
  date: Date,
  items: Array,              // Parsed from JSON
  confirmedItems: Array,     // stockConfirm from API
  currencyUnit: String,
  currencyRate: Number,
  customer: Object,
  // ... etc
}
```

### 8.3 loadVersions()

**หน้าที่**: โหลดรายการ Invoice Versions

```javascript
async loadVersions() {
  const response = await this.invoiceStore.fetchListVersions({
    formValue: {
      invoiceNumber: this.invoiceData.invoiceNumber,
      soNumber: this.invoiceData.soNumber
    }
  })

  if (response && response.data) {
    this.versionList = response.data
  }
}
```

### 8.4 viewVersion(version)

**หน้าที่**: ดูข้อมูล Version ที่เลือก

**ขั้นตอน**:
1. เรียก `invoiceStore.fetchGetVersion()` เพื่อดึงข้อมูล Version
2. Parse JSON data
3. อัพเดท `invoiceData` และ `invoiceItems` ให้เป็นข้อมูล Version
4. เก็บ `currentViewingVersion` เพื่อแสดง badge

### 8.5 restoreOriginalView()

**หน้าที่**: กลับไปดูข้อมูลต้นฉบับ

```javascript
restoreOriginalView() {
  this.currentViewingVersion = null
  this.invoiceData = { ...this.originalInvoiceData }
  this.invoiceItems = [...this.originalInvoiceItems]
  this.formSaleOrder.currencyUnit = this.originalInvoiceData.currencyUnit
  this.formSaleOrder.currencyRate = this.originalInvoiceData.currencyRate
}
```

### 8.6 loadPaymentHistory()

**หน้าที่**: โหลดประวัติการชำระเงินและคำนวณยอดที่ชำระแล้ว

```javascript
async loadPaymentHistory() {
  const response = await this.invoiceStore.fetchPaymentList({
    formValue: {
      invoiceNumber: this.invoiceData.invoiceNumber
    }
  })

  if (response && response.data) {
    // คำนวณยอดที่ชำระแล้วทั้งหมด
    this.paidAmount = response.data.reduce((sum, payment) => {
      return sum + payment.amount
    }, 0)
  }
}
```

### 8.7 handleSavePayment(paymentData)

**หน้าที่**: บันทึกการชำระเงิน

**ขั้นตอน**:
1. สร้าง FormData จากข้อมูลการชำระเงิน
2. เรียก `invoiceStore.createPayment(formData)`
3. Reload ข้อมูล Invoice ใหม่ (เรียก `loadInvoiceData()` ทั้งหมด)
4. ปิด Modal

**FormData Structure**:
```javascript
{
  InvoiceNumber: String,
  PaymentDate: String (ISO),
  Amount: Number,
  Payment: Number,           // Payment method ID
  PaymentName: String,       // Payment method name
  ReferenceNumber: String,   // Optional
  Remark: String,            // Optional
  ReceiptImage: File         // Optional (compressed)
}
```

---

## 9. Calculation Methods

### 9.1 Price Calculations

```javascript
// ราคาประเมิน
getAppraisalPrice(item) {
  return item.appraisalPrice || item.price || 0
}

// ราคาหลังหักส่วนลด (THB)
getDiscountedPrice(item) {
  const appraisalPrice = this.getAppraisalPrice(item)
  const discountPercent = item.discountPercent || 0
  return appraisalPrice * (1 - discountPercent / 100)
}

// ราคาหลังแปลงสกุลเงิน
getConvertedPrice(item) {
  const discountedPrice = this.getDiscountedPrice(item)
  const currencyRate = this.invoiceData.currencyRate || 1
  return discountedPrice / currencyRate
}

// ราคารวม (คูณจำนวน)
getTotalConvertedPrice(item) {
  const convertedPrice = this.getConvertedPrice(item)
  const qty = item.qty || 0
  return convertedPrice * qty
}
```

### 9.2 Weight Calculations

```javascript
// น้ำหนักรวมทั้งหมด
getNetWeight(items) {
  return items.reduce((sum, item) => {
    if (!item.materials) return sum
    return sum + item.materials.reduce((matSum, mat) => {
      return matSum + (mat.weight || 0)
    }, 0)
  }, 0).toFixed(2)
}

// น้ำหนักทอง
getGoldWeight(items) {
  return items.reduce((sum, item) => {
    if (!item.materials) return sum
    return sum + item.materials
      .filter(m => m.type === 'Gold')
      .reduce((matSum, mat) => matSum + (mat.weight || 0), 0)
  }, 0).toFixed(2)
}

// น้ำหนักเพชร
getDiamondWeight(items) {
  // Similar to getGoldWeight but filter by 'Diamond'
}

// น้ำหนักพลอย
getGemWeight(items) {
  // Similar to getGoldWeight but filter by 'Gem'
}
```

### 9.3 Sum Calculations

```javascript
// รวมราคาประเมิน
getSumAppraisalPrice(items) {
  const total = items.reduce((sum, item) => {
    return sum + (Number(this.getAppraisalPrice(item)) || 0)
  }, 0)
  return Number(total).toFixed(2)
}

// รวมราคาหลังหักส่วนลด
getSumDiscountPrice(items) {
  const total = items.reduce((sum, item) => {
    return sum + (Number(this.getDiscountedPrice(item)) || 0)
  }, 0)
  return Number(total).toFixed(2)
}

// รวมราคาหลังแปลงสกุลเงิน
getSumConvertedPrice(items) {
  const total = items.reduce((sum, item) => {
    return sum + (Number(this.getConvertedPrice(item)) || 0)
  }, 0)
  return Number(total).toFixed(2)
}

// รวมจำนวน
getSumQty(items) {
  return items.reduce((sum, item) => {
    return sum + (Number(item.qty) || 0)
  }, 0)
}

// รวมราคาทั้งหมด
getSumTotalConvertedPrice(items) {
  const total = items.reduce((sum, item) => {
    return sum + (Number(this.getTotalConvertedPrice(item)) || 0)
  }, 0)
  return Number(total).toFixed(2)
}
```

---

## 10. Utility Methods

### 10.1 formatDate(date)

```javascript
formatDate(date) {
  if (!date) return '-'
  return dayjs(date).format('DD/MM/YYYY')
}
```

### 10.2 formatNumber(value)

```javascript
formatNumber(value) {
  if (!value && value !== 0) return '0.00'
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
```

### 10.3 formatPriceWithCurrency(price)

```javascript
formatPriceWithCurrency(price) {
  const currency = this.invoiceData?.currencyUnit || 'THB'
  return `${this.formatNumber(price)} ${currency}`
}
```

### 10.4 calculateDueDate()

```javascript
calculateDueDate() {
  if (!this.invoiceData?.paymentDay || this.invoiceData.paymentDay <= 0) return '-'

  const createDate = this.invoiceData.createDate
    ? new Date(this.invoiceData.createDate)
    : new Date()
  const dueDate = new Date(createDate)
  dueDate.setDate(dueDate.getDate() + this.invoiceData.paymentDay)

  return this.formatDate(dueDate)
}
```

### 10.5 getStatusBadgeClass(status)

```javascript
getStatusBadgeClass(status) {
  const statusMap = {
    Draft: 'badge badge-secondary',
    Confirmed: 'badge badge-success',
    Cancelled: 'badge badge-danger',
    Pending: 'badge badge-warning'
  }
  return statusMap[status] || 'badge badge-info'
}
```

---

## 11. PDF Generation

### 11.1 handleConfirmPrint(printData)

**หน้าที่**: สร้าง PDF จากข้อมูล Invoice

```javascript
const pdfData = {
  saleOrder: {
    soNumber: this.invoiceData.soNumber,
    date: this.invoiceData.createDate,
    expectedDeliveryDate: this.invoiceData.deliveryDate,
    paymentTerms: this.invoiceData.paymentName,
    depositPercent: this.invoiceData.depositPercent,
    remark: this.invoiceData.remark,
    specialDiscount: this.invoiceData.specialDiscount || 0,
    specialAddition: this.invoiceData.specialAddition || 0,
    freightAndInsurance: this.invoiceData.freightAndInsurance || 0
  },
  customer: {
    name: this.invoiceData.customerName,
    address: this.invoiceData.customerAddress,
    tel: this.invoiceData.customerTel,
    email: this.invoiceData.customerEmail,
    phone: this.invoiceData.customerTel
  },
  currency: {
    unit: this.invoiceData.currencyUnit || 'THB',
    rate: this.invoiceData.currencyRate || 1
  },
  items: this.invoiceItems
}

const options = {
  invoiceNo: printData.invoiceNumber,
  invoiceDate: formattedDate,
  download: true,
  open: false
}

await invoicePdfService.generateInvoicePDF(pdfData, options)
```

### 11.2 generateVersionPDF(versionData, options)

**หน้าที่**: สร้าง PDF จากข้อมูล Version

**ความแตกต่าง**:
- ใช้ข้อมูล `versionData` แทน `invoiceData` สำหรับ currency และ financial data
- ใช้ `versionData.items` แทน `invoiceItems`
- Invoice number ต่อท้ายด้วย `{invoiceNumber}-V{versionNumber}`

---

## 12. การยกเลิก Invoice

### confirmReverseInvoice()

```javascript
confirmSubmit(
  'การยกเลิก Invoice จะลบข้อมูลการออก Invoice และคืนสถานะสินค้ากลับไปยัง Sale Order',
  'คุณต้องการยกเลิก Invoice นี้หรือไม่?',
  async (result) => {
    if (result.isConfirmed) {
      await this.reverseInvoice()
    }
  }
)
```

### reverseInvoice()

**ขั้นตอน**:
1. เรียก `invoiceStore.fetchDelete()` เพื่อยกเลิก Invoice
2. แสดง success message
3. Navigate กลับไปยัง:
   - Sale Order page (ถ้ามาจาก SO)
   - หน้าก่อนหน้า (ถ้ามาจากที่อื่น)

---

## 13. Route Parameters

### Query Parameters

```javascript
{
  invoiceNumber: String,     // Required - เลขที่ Invoice ที่ต้องการดู
  from: String              // Optional - ระบุว่ามาจาก route ไหน (เช่น 'sale-order')
}
```

### ตัวอย่างการใช้งาน

```javascript
// จาก Sale Order
this.$router.push({
  path: '/sale/invoice-detail',
  query: {
    invoiceNumber: 'INV-2025-001',
    from: 'sale-order'
  }
})

// จาก Invoice List
this.$router.push({
  path: '/sale/invoice-detail',
  query: {
    invoiceNumber: 'INV-2025-001'
  }
})
```

---

## 14. UI Sections

### 14.1 Header Section
- หัวข้อหน้า: "รายละเอียด Invoice"
- Version badge (ถ้ากำลังดู Version)
- ปุ่ม Actions:
  - กลับไปดูต้นฉบับ (ถ้ากำลังดู Version)
  - เพิ่ม Version
  - พิมพ์เอกสาร
  - ยกเลิกเอกสาร
  - ย้อนกลับ

### 14.2 Invoice and Customer Information
- ข้อมูล Invoice:
  - เลขที่ Invoice
  - เลขที่ SO
  - วันที่สร้าง
  - วันกำหนดส่ง
  - สถานะ
  - ผู้สร้าง
  - สกุลเงิน

- ข้อมูลลูกค้า:
  - ชื่อลูกค้า
  - เบอร์โทร
  - อีเมล
  - ที่อยู่

### 14.3 Invoice Items (DataTable)

**Columns**:
1. # (ลำดับ)
2. รูปภาพ
3. เลขที่สต๊อก (ใหม่)
4. เลขที่สต๊อก (เดิม)
5. รหัสสินค้า
6. รายละเอียด
7. Gold (gms)
8. Diamond (cts)
9. Stone (cts)
10. ราคาขาย (THB)
11. ราคาประเมิน (THB)
12. ส่วนลด (%)
13. ราคาส่วนลด (THB)
14. แปลงเรท
15. ราคาแปลง (Currency)
16. จำนวน
17. รวมราคา (Currency)

**Footer Rows**:
1. Net Weight Of Merchandise + รวมน้ำหนักทุกวัตถุดิบ
2. ส่วนลดพิเศษ
3. ส่วนเพิ่มพิเศษ
4. ยอดรวมหลังปรับ
5. Freight & Insurance
6. **ยอดรวม Invoice** (สีน้ำเงิน, ตัวหนา)

### 14.4 Version List Panel

**Layout**: Grid 1fr 4fr (Version List : Payment Summary)

**Version Item**:
- Version number
- Create date
- Created by
- ปุ่มพิมพ์ PDF

**Actions**:
- คลิกเพื่อดู Version
- คลิกปุ่มพิมพ์เพื่อ download PDF

### 14.5 Payment and Financial Summary

**ข้อมูลการชำระเงิน**:
- วิธีการชำระเงิน
- ระยะเวลาชำระ (วัน) + วันครบกำหนด
- ราคามัดจำ
- ยอดคงเหลือที่ต้องชำระ

**สรุปยอดเงิน**:
- สกุลเงิน
- อัตราแลกเปลี่ยน
- ส่วนลดพิเศษ
- ส่วนเพิ่มพิเศษ
- Freight & Insurance
- ยอดรวมหลังปรับ
- **ยอดรวม Invoice** (highlighted)

### 14.6 Payment History Table (ประวัติการชำระเงิน)

**Component**: `DataTableWithPaging` (ปิด pagination)

**ตำแหน่ง**: อยู่ด้านล่าง Payment and Financial Summary section

**Data Source**: `invoiceData.payments[]` - มาจาก API `invoiceStore.fetchGet()`

#### Payment Data Structure

```javascript
payments: [
  {
    running: String,                  // เลขที่การชำระเงิน (PK) e.g., "PAY-INV251026002251104001"
    paymentDate: Date,                // วันที่ชำระเงิน
    amount: Number,                   // จำนวนเงินที่ชำระ
    currencyUnit: String,             // สกุลเงิน (US$, THB)
    paymentMethod: String,            // วิธีการชำระเงิน (เงินสด (Cash), โอนเงิน (Transfer))
    referenceNumber: String,          // เลขที่อ้างอิง (เลขที่โอน, เลขเช็ค)
    remark: String,                   // หมายเหตุ
    imagePath: String,                // ชื่อไฟล์รูปภาพหลักฐาน (e.g., "PAY-INV251026002251104001.jpg")
    createBy: String,                 // ผู้บันทึก
    createDate: Date,                 // วันที่บันทึก
    updateBy: String,                 // ผู้แก้ไขล่าสุด
    updateDate: Date                  // วันที่แก้ไขล่าสุด
  }
]
```

#### Table Columns Configuration

```javascript
columns: [
  {
    field: 'index',
    header: '#',
    width: '50px',
    sortable: false,
    align: 'center'
  },
  {
    field: 'image',
    header: 'หลักฐาน',
    width: '80px',
    sortable: false,
    align: 'center'
  },
  {
    field: 'paymentDate',
    header: 'วันที่ชำระ',
    minWidth: '120px',
    sortable: true,
    format: 'date'
  },
  {
    field: 'amount',
    header: 'จำนวนเงิน',
    minWidth: '120px',
    sortable: true,
    align: 'right',
    format: 'decimal2'
  },
  {
    field: 'currencyUnit',
    header: 'สกุลเงิน',
    width: '100px',
    sortable: false,
    align: 'center'
  },
  {
    field: 'paymentMethod',
    header: 'วิธีชำระ',
    minWidth: '150px',
    sortable: true
  },
  {
    field: 'referenceNumber',
    header: 'เลขที่อ้างอิง',
    minWidth: '150px',
    sortable: false
  },
  {
    field: 'remark',
    header: 'หมายเหตุ',
    minWidth: '200px',
    sortable: false
  },
  {
    field: 'createBy',
    header: 'ผู้บันทึก',
    minWidth: '120px',
    sortable: true
  },
  {
    field: 'createDate',
    header: 'วันที่บันทึก',
    minWidth: '150px',
    sortable: true,
    format: 'datetime'
  }
]
```

#### Implementation Example

```vue
<template>
  <!-- Payment History Section -->
  <div class="card-container mt-3">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="bi bi-clock-history mr-2"></i>ประวัติการชำระเงิน
      </h6>
    </div>
    <div class="card-body">
      <!-- Empty State -->
      <div v-if="!invoiceData.payments || invoiceData.payments.length === 0"
           class="text-center text-muted py-4">
        <i class="bi bi-inbox" style="font-size: 2rem"></i>
        <p class="mb-0 mt-2">ยังไม่มีประวัติการชำระเงิน</p>
      </div>

      <!-- Payment History Table -->
      <BaseDataTable
        v-else
        :items="invoiceData.payments"
        :totalRecords="invoiceData.payments.length"
        :columns="paymentColumns"
        :paginator="false"
        :scrollHeight="'300px'"
        dataKey="running"
      >
        <!-- Index Column Template -->
        <template #indexTemplate="{ index }">
          <div class="text-center">{{ index + 1 }}</div>
        </template>

        <!-- Image Column Template -->
        <template #imageTemplate="{ data }">
          <div class="image-container text-center">
            <imagePreview
              v-if="data.imagePath"
              :imageName="data.imagePath"
              :path="data.imagePath"
              type="PAYMENT-RECEIPT"
              :width="40"
              :height="40"
              :emitImage="true"
            />
            <span v-else class="text-muted">-</span>
          </div>
        </template>

        <!-- Amount Column Template with Currency -->
        <template #amountTemplate="{ data }">
          <div class="text-right">
            {{ formatNumber(data.amount) }} {{ data.currencyUnit }}
          </div>
        </template>
      </BaseDataTable>

      <!-- Payment Summary Footer -->
      <div class="mt-3 pt-3 border-top">
        <div class="row">
          <div class="col-md-6">
            <strong>จำนวนครั้งที่ชำระ:</strong>
            {{ invoiceData.payments.length }} ครั้ง
          </div>
          <div class="col-md-6 text-right">
            <strong>ยอดชำระทั้งหมด:</strong>
            <span class="text-success">
              {{ formatNumber(paidAmount) }} {{ invoiceData.currencyUnit }}
            </span>
          </div>
        </div>
        <div class="row mt-2">
          <div class="col-md-12 text-right">
            <strong>ยอดคงเหลือ:</strong>
            <span class="text-danger">
              {{ formatNumber(grandTotal - paidAmount) }} {{ invoiceData.currencyUnit }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'

export default {
  components: {
    BaseDataTable,
    imagePreview
  },

  data() {
    return {
      paymentColumns: [
        { field: 'index', header: '#', width: '50px', sortable: false, align: 'center' },
        { field: 'image', header: 'หลักฐาน', width: '80px', sortable: false, align: 'center' },
        { field: 'paymentDate', header: 'วันที่ชำระ', minWidth: '120px', sortable: true, format: 'date' },
        { field: 'amount', header: 'จำนวนเงิน', minWidth: '120px', sortable: true, align: 'right' },
        { field: 'currencyUnit', header: 'สกุลเงิน', width: '100px', sortable: false, align: 'center' },
        { field: 'paymentMethod', header: 'วิธีชำระ', minWidth: '150px', sortable: true },
        { field: 'referenceNumber', header: 'เลขที่อ้างอิง', minWidth: '150px', sortable: false },
        { field: 'remark', header: 'หมายเหตุ', minWidth: '200px', sortable: false },
        { field: 'createBy', header: 'ผู้บันทึก', minWidth: '120px', sortable: true },
        { field: 'createDate', header: 'วันที่บันทึก', minWidth: '150px', sortable: true, format: 'datetime' }
      ]
    }
  }
}
</script>
```

#### Key Features

1. **แสดงรูปภาพหลักฐาน**: ใช้ `imagePreview` component แสดงรูปภาพหลักฐานการชำระเงิน (type: `PAYMENT-RECEIPT`)
2. **ปิด Pagination**: ตั้ง `:paginator="false"` เพื่อแสดงทุกรายการในครั้งเดียว
3. **Auto Format**: ใช้ `format` property ของ column เพื่อ format วันที่และตัวเลขอัตโนมัติ
4. **Custom Templates**: ใช้ named slots (`#indexTemplate`, `#imageTemplate`, `#amountTemplate`) สำหรับ custom rendering
5. **Summary Footer**: แสดงสรุปจำนวนครั้งที่ชำระ, ยอดชำระทั้งหมด, และยอดคงเหลือ
6. **Empty State**: แสดงข้อความเมื่อยังไม่มีประวัติการชำระเงิน

#### Image Path Configuration

```javascript
// Type สำหรับ imagePreview component
type: 'PAYMENT-RECEIPT'  // ใช้สำหรับรูปหลักฐานการชำระเงิน

// API Base Path
const baseImagePath = `${apiBaseUrl}/Images/Payment/${imagePath}`
```

#### Notes

- ข้อมูล `payments` มาจาก `invoiceData` ที่ได้จาก `invoiceStore.fetchGet()` โดยตรง ไม่ต้องเรียก API แยก
- `paidAmount` คำนวณจาก `loadPaymentHistory()` โดยรวม `amount` จาก `payments[]`
- รูปภาพหลักฐานเก็บใน folder `Images/Payment/` ตามชื่อไฟล์ที่ระบุใน `imagePath`

**ปุ่ม**:
- บันทึกการเก็บเงิน (เปิด Payment Modal)

### 14.7 Remark Section
แสดงเฉพาะเมื่อมี `invoiceData.remark`

---

## 15. Modals

### 15.1 Invoice Version Modal
- **Props**: `isShowModal`, `invoiceData`, `invoiceItems`
- **Events**: `@close-modal`, `@save`, `@preview`
- **หน้าที่**: สร้าง Version ใหม่ให้กับข้อมูลที่ต้องการแก้ไข

### 15.2 Invoice Confirm Print Modal
- **Props**: `isShowModal`, `invoiceData`
- **Events**: `@close-modal`, `@confirm-print`
- **หน้าที่**: ยืนยันและแก้ไขเลขที่ Invoice/วันที่ก่อนพิมพ์

### 15.3 Payment Record Modal
- **Props**: `isShowModal`, `invoiceData`, `paidAmount`
- **Events**: `@close-modal`, `@save-payment`
- **หน้าที่**: บันทึกการเก็บเงิน
- **เอกสารเพิ่มเติม**: `payment-term.md`

---

## 16. สรุปการทำงานของระบบ

### Data Flow

```
1. User เปิดหน้า Invoice Detail ส่งค่า invoiceNumber
   ↓
2. mounted() → loadInvoiceData()
   ↓
3. fetchGet(invoiceNumber) → invoiceData
   ↓
4. getSaleOrderData(soNumber) → formSaleOrder
   ↓
5. กรอง invoiceItems จาก SO ที่มี confirmedItems
   ↓
6. loadVersions() → versionList
   ↓
7. loadPaymentHistory() → paidAmount
   ↓
8. แสดงข้อมูล Invoice แบบ Read-only
```

### Price Calculation Flow

```
1. Item Price (THB)
   - appraisalPrice
   ↓
2. After Discount (THB)
   - appraisalPrice * (1 - discountPercent/100)
   ↓
3. Converted Price (Currency)
   - discountedPrice / currencyRate
   ↓
4. Total Price (Currency)
   - convertedPrice * qty
   ↓
5. Sum All Items → totalSelectedAmount
   ↓
6. Apply Special Discount/Addition
   → totalAfterDiscountAndAddition
   ↓
7. Add Freight & Insurance
   → grandTotal
```

---

## 17. หมายเหตุสำหรับการพัฒนา

### สิ่งที่ควรระวัง

1. **Read-only Mode**: หน้านี้เป็น read-only ไม่สามารถแก้ไขข้อมูล Invoice ได้โดยตรง
2. **Version System**: สามารถสร้าง Version ใหม่ได้เมื่อต้องการแก้ไขข้อมูล
3. **Payment Tracking**: ติดตามการชำระเงินผ่าน `paidAmount`
4. **Data Combination**: ข้อมูลมาจาก Invoice + Sale Order รวมกัน
5. **Currency Conversion**: คำนวณราคาตามสกุลเงินของ Invoice

### Best Practices

1. ใช้ `formatNumber()` สำหรับแสดงตัวเลขทุกที่
2. ใช้ `formatDate()` สำหรับแสดงวันที่
3. ตรวจสอบ `invoiceData` และ `invoiceData.invoiceNumber` ก่อนใช้งาน
4. เก็บ original data ไว้เสมอเพื่อ restore เมื่อดู Version

### ข้อจำกัด

1. ไม่สามารถแก้ไขข้อมูล Invoice ได้โดยตรง (Read-only)
2. ยกเลิก Invoice แล้วจะคืนสถานะกลับไป SO
3. Version ไม่สามารถลบได้โดยตรง (soft delete only)

---

**Created**: 2025-01-04
**Last Updated**: 2025-01-04
**Version**: 1.0
