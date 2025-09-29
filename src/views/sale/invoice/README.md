# Invoice System

ระบบใบแจ้งหนี้และใบกำกับภาษีสำหรับธุรกิจเครื่องประดับ

## ภาพรวม

Invoice System เป็นขั้นตอนสุดท้ายของ sales flow ที่ทำหน้าที่สร้างใบแจ้งหนี้และใบกำกับภาษีหลังจากส่งมอบสินค้าให้ลูกค้าแล้ว

## Flow การทำงาน

```
Delivery Note → Invoice Creation → Tax Calculation → Send Invoice → Payment → Close
```

1. **Delivery Completed**: สินค้าส่งมอบเรียบร้อยแล้ว
2. **Create Invoice**: สร้างใบแจ้งหนี้จากใบส่งของ
3. **Tax & Discount**: คำนวณภาษีและส่วนลด
4. **Send to Customer**: ส่งใบแจ้งหนี้ให้ลูกค้า
5. **Payment Tracking**: ติดตามการชำระเงิน

## ฟีเจอร์หลัก

### ✅ UI Framework (Demo Ready)

#### 1. Search & Selection
- ค้นหาใบส่งของ/ใบแจ้งหนี้/ลูกค้า
- Modal เลือกใบส่งของที่พร้อมออกใบแจ้งหนี้
- ตรวจสอบสถานะการออกใบแจ้งหนี้

#### 2. Invoice Information
- เลขที่ใบแจ้งหนี้ (INV-2025-001)
- วันที่ออกใบแจ้งหนี้
- วันที่ครบกำหนดชำระ
- เงื่อนไขการชำระเงิน
- อ้างอิงใบส่งของ

#### 3. Customer & Tax Information
- ข้อมูลลูกค้าจากใบส่งของ
- เลขที่ประจำตัวผู้เสียภาษี
- ที่อยู่ออกใบกำกับภาษี
- ประเภทลูกค้า (บุคคล/นิติบุคคล)

#### 4. Items & Calculation
- รายการสินค้าจากใบส่งของ
- ราคาต่อหน่วยและราคารวม
- ส่วนลด (หากมี)
- ค่าขนส่ง
- ภาษีมูลค่าเพิ่ม 7%
- ยอดรวมสุทธิ

#### 5. Payment Terms
- เงินสด (Cash)
- เครดิต 15/30/60 วัน
- ผ่อนชำระ
- เงินมัดจำ + ยอดคงเหลือ

### 🔄 Business Logic (To Implement)

#### Tax Calculation
```javascript
// ภาษีมูลค่าเพิ่ม 7%
subtotal = Σ(quantity × unitPrice) - discount
shippingCost = deliveryCost
taxableAmount = subtotal + shippingCost
vatAmount = taxableAmount × 0.07
grandTotal = taxableAmount + vatAmount
```

#### Invoice Types
- **ใบแจ้งหนี้**: สำหรับลูกค้าทั่วไป
- **ใบกำกับภาษี**: สำหรับลูกค้าที่มีเลขประจำตัวผู้เสียภาษี
- **ใบเสร็จรับเงิน**: หลังชำระเงินแล้ว

## โครงสร้างไฟล์

```
invoice/
├── index-view.vue                    # Main controller ✅
├── components/
│   ├── search-view.vue              # Search form (TODO)
│   ├── invoice-view.vue             # Main form (TODO)
│   ├── invoice-info-section.vue    # Invoice details (TODO)
│   ├── tax-calculation-section.vue # Tax & totals (TODO)
│   └── payment-terms-section.vue   # Payment options (TODO)
├── modal/
│   └── delivery-note-search-modal.vue # Delivery note selector (TODO)
└── README.md                       # This file ✅
```

## Key UI Sections

### 1. Invoice Header
```vue
<!-- Invoice Information -->
- เลขที่ใบแจ้งหนี้: INV-2025-001
- วันที่ออกใบแจ้งหนี้: DatePicker
- วันที่ครบกำหนด: DatePicker (auto calculate)
- อ้างอิงใบส่งของ: DN-2025-001 (readonly)
- เงื่อนไขการชำระ: Dropdown
```

### 2. Customer Information
```vue
<!-- Customer Details (from Delivery Note) -->
- ชื่อลูกค้า: บริษัท ABC จำกัด
- ที่อยู่: 123 ถนนสุขุมวิท...
- เลขประจำตัวผู้เสียภาษี: 0105537000111
- เบอร์โทร: 02-123-4567
- อีเมล: contact@abc.com
```

### 3. Items Table
```vue
<!-- DataTable with delivered items -->
- ลำดับ
- รหัสสินค้า
- รายละเอียดสินค้า
- จำนวน (ที่ส่งมอบ)
- หน่วย
- ราคาต่อหน่วย
- ส่วนลดต่อรายการ (%)
- จำนวนเงิน
```

### 4. Calculation Summary
```vue
<!-- Tax & Total Calculation -->
- ยอดรวมก่อนส่วนลด: 42,000.00
- ส่วนลดรวม (5%): -2,100.00
- ยอดหลังหักส่วนลด: 39,900.00
- ค่าขนส่ง: 500.00
- ยอดก่อนภาษี: 40,400.00
- ภาษีมูลค่าเพิ่ม (7%): 2,828.00
- ยอดรวมสุทธิ: 43,228.00
```

### 5. Payment Information
```vue
<!-- Payment Terms -->
- เงื่อนไขการชำระ: เครดิต 30 วัน
- วันที่ครบกำหนด: 19 กุมภาพันธ์ 2568
- วิธีการชำระ: โอนเงิน / เงินสด / เช็ค
- หมายเลขบัญชี: XXX-X-XXXXX-X
- หมายเหตุการชำระ: ชำระภายในกำหนด
```

## Data Models

### Frontend Models
```typescript
interface Invoice {
  invoiceId?: number
  deliveryNoteId: number
  saleOrderId: number
  number: string
  invoiceDate: Date
  dueDate: Date
  paymentTerms: PaymentTerms
  customerId: number
  customerName: string
  customerAddress: string
  customerTaxId?: string
  subtotal: number
  discountRate: number
  discountAmount: number
  shippingCost: number
  taxableAmount: number
  vatRate: number
  vatAmount: number
  grandTotal: number
  status: InvoiceStatus
  items: InvoiceItem[]
  remark?: string
}

interface InvoiceItem {
  itemId: number
  productId: number
  productNumber: string
  productName: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  discountRate: number
  discountAmount: number
  lineTotal: number
}

enum PaymentTerms {
  Cash = 'cash',           // เงินสด
  Credit15 = 'credit15',   // เครดิต 15 วัน
  Credit30 = 'credit30',   // เครดิต 30 วัน
  Credit60 = 'credit60',   // เครดิต 60 วัน
  Installment = 'installment' // ผ่อนชำระ
}

enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}
```

## Mock Data

```javascript
const mockDeliveryNoteData = {
  deliveryNoteId: 1,
  number: 'DN-2025-001',
  saleOrderNumber: 'SO-2025-001',
  customerName: 'บริษัท ABC จำกัด',
  customerTaxId: '0105537000111',
  customerAddress: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
  deliveryDate: '2025-01-20',
  totalValue: 42000,
  items: [
    {
      productNumber: 'R001',
      productName: 'แหวนเพชร เซ็ต 2 วง',
      description: 'แหวนเพชร 1 กะรัต ทอง 18K',
      deliveredQuantity: 2,
      unit: 'วง',
      unitPrice: 15000,
      lineTotal: 30000
    },
    {
      productNumber: 'B001', 
      productName: 'สร้อยข้อมือทอง',
      description: 'สร้อยข้อมือทอง 18K น้ำหนัก 10 กรัม',
      deliveredQuantity: 1,
      unit: 'เส้น',
      unitPrice: 12000,
      lineTotal: 12000
    }
  ]
}
```

## Calculation Logic

### Tax Calculation
```javascript
function calculateInvoice(items, discountRate, shippingCost, vatRate = 7) {
  // รวมราคาสินค้า
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  
  // ส่วนลดรวม
  const discountAmount = subtotal * (discountRate / 100)
  const afterDiscount = subtotal - discountAmount
  
  // ยอดก่อนภาษี
  const taxableAmount = afterDiscount + shippingCost
  
  // ภาษีมูลค่าเพิ่ม
  const vatAmount = taxableAmount * (vatRate / 100)
  
  // ยอดรวมสุทธิ
  const grandTotal = taxableAmount + vatAmount
  
  return {
    subtotal,
    discountAmount,
    afterDiscount,
    shippingCost,
    taxableAmount,
    vatAmount,
    grandTotal
  }
}
```

### Due Date Calculation
```javascript
function calculateDueDate(invoiceDate, paymentTerms) {
  const dueDate = new Date(invoiceDate)
  
  switch (paymentTerms) {
    case 'cash':
      return dueDate // Same day
    case 'credit15':
      dueDate.setDate(dueDate.getDate() + 15)
      break
    case 'credit30':
      dueDate.setDate(dueDate.getDate() + 30)
      break
    case 'credit60':
      dueDate.setDate(dueDate.getDate() + 60)
      break
  }
  
  return dueDate
}
```

## PDF Template

### Invoice Layout
```
┌─────────────────────────────────────┐
│ บริษัท เครื่องประดับ ABC จำกัด        │
│ ใบแจ้งหนี้ / ใบกำกับภาษี             │
├─────────────────────────────────────┤
│ เลขที่: INV-2025-001                │
│ วันที่: 20 มกราคม 2568               │
│ ครบกำหนด: 19 กุมภาพันธ์ 2568        │
├─────────────────────────────────────┤
│ ลูกค้า: บริษัท ABC จำกัด             │
│ ที่อยู่: 123 ถนนสุขุมวิท...          │
│ เลขประจำตัวผู้เสียภาษี: 0105537000111│
├─────────────────────────────────────┤
│ ลำดับ │ รายการ │ จำนวน │ ราคา │ รวม  │
│   1   │ แหวน  │   2   │15,000│30,000│
│   2   │สร้อย   │   1   │12,000│12,000│
├─────────────────────────────────────┤
│ รวมก่อนภาษี:           40,400.00    │
│ ภาษีมูลค่าเพิ่ม 7%:     2,828.00    │
│ รวมทั้งสิ้น:           43,228.00    │
└─────────────────────────────────────┘
```

## Integration Points

### API Endpoints (To Develop)
- `GET /api/invoices/from-delivery/{id}` - Load delivery note data
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/{id}/send` - Send invoice to customer
- `GET /api/invoices/{id}/pdf` - Generate PDF
- `POST /api/invoices/{id}/email` - Email invoice

### Payment Integration
- เชื่อมต่อ Payment Gateway
- QR Code PromptPay
- Bank Transfer
- Credit Card Payment

### Tax Compliance
- ส่งข้อมูลภาษี e-Tax Invoice
- รายงาน VAT รายเดือน
- Export ข้อมูลสำหรับบัญชี

## การใช้งาน (Demo Flow)

1. **เลือกใบส่งของ**: ค้นหาใบส่งของที่ส่งมอบแล้ว
2. **ตรวจสอบรายการ**: ยืนยันรายการสินค้าที่ส่งมอบ
3. **กำหนดเงื่อนไขการชำระ**: เลือกประเภทการชำระเงิน
4. **คำนวณภาษี**: ระบบคำนวณ VAT อัตโนมัติ
5. **สร้างใบแจ้งหนี้**: ยืนยันและสร้างใบแจ้งหนี้
6. **ส่งให้ลูกค้า**: Print PDF หรือส่ง Email
7. **ติดตามการชำระ**: Monitor payment status

## Next Steps

1. **Complete UI Components**: สร้าง component ที่เหลือ
2. **Tax Calculation Engine**: เครื่องคำนวณภาษี
3. **PDF Generation**: ระบบสร้าง PDF ใบแจ้งหนี้
4. **Email Integration**: ส่งใบแจ้งหนี้ทาง Email
5. **Payment Tracking**: ระบบติดตามการชำระเงิน
6. **e-Tax Integration**: เชื่อมต่อระบบภาษีอิเล็กทรอนิกส์

---
*สถานะ: Framework Ready - รอ Component Implementation*