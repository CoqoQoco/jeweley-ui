# Payment Tracking System

ระบบติดตามการชำระเงินสำหรับธุรกิจเครื่องประดับ

## ภาพรวม

Payment Tracking System เป็นขั้นตอนสุดท้ายของ sales flow ที่ทำหน้าที่ติดตามการชำระเงินจากลูกค้าหลังจากออกใบแจ้งหนี้แล้ว

## Flow การทำงาน

```
Invoice Sent → Payment Reminder → Payment Received → Receipt → Account Reconciliation
```

1. **Invoice Sent**: ส่งใบแจ้งหนี้ให้ลูกค้าแล้ว
2. **Payment Tracking**: ติดตามการชำระเงิน
3. **Payment Received**: รับชำระเงิน
4. **Issue Receipt**: ออกใบเสร็จรับเงิน
5. **Account Update**: อัพเดทบัญชีลูกค้า

## ฟีเจอร์หลัก

### 📊 Payment Dashboard
- สรุปยอดค้างชำระรายวัน/เดือน
- ใบแจ้งหนี้ที่เลยกำหนด
- ลูกค้าที่ชำระดี/ชำระช้า
- กราฟการชำระเงินรายเดือน

### 🔍 Payment Search & Filter
- ค้นหาตามเลขที่ใบแจ้งหนี้
- ค้นหาตามชื่อลูกค้า
- Filter ตามสถานะการชำระ
- Filter ตามช่วงวันที่
- Filter ตามประเภทการชำระ

### 💰 Payment Methods
- **เงินสด**: Cash payment
- **โอนเงิน**: Bank transfer
- **เช็ค**: Check payment
- **บัตรเครดิต**: Credit card
- **QR Code**: PromptPay/QR Payment
- **ผ่อนชำระ**: Installment payment

### 📋 Payment Status
- **Pending**: รอชำระเงิน
- **Partial**: ชำระบางส่วน
- **Paid**: ชำระครบแล้ว
- **Overdue**: เลยกำหนดชำระ
- **Cancelled**: ยกเลิกใบแจ้งหนี้

### 🔔 Payment Reminders
- แจ้งเตือนใกล้ครบกำหนด (3 วันก่อน)
- แจ้งเตือนเลยกำหนด (1, 7, 15, 30 วัน)
- ส่ง SMS/Email reminder
- Print reminder letters

## UI Components Structure

```
payment-tracking/
├── dashboard/
│   ├── index-view.vue              # Payment dashboard
│   └── components/
│       ├── payment-summary-cards.vue
│       ├── overdue-alerts.vue
│       ├── payment-charts.vue
│       └── recent-payments.vue
├── payment-list/
│   ├── index-view.vue              # Payment list view
│   └── components/
│       ├── search-view.vue
│       ├── payment-table.vue
│       └── payment-filters.vue
├── payment-entry/
│   ├── index-view.vue              # Record payment
│   └── components/
│       ├── invoice-search.vue
│       ├── payment-form.vue
│       └── receipt-preview.vue
├── payment-history/
│   ├── index-view.vue              # Payment history
│   └── components/
│       ├── history-search.vue
│       └── history-table.vue
└── README.md                       # This file
```

## Key Features Detail

### 1. Payment Dashboard

#### Summary Cards
```vue
<!-- Payment Overview -->
- ยอดค้างชำระทั้งหมด: 1,250,000 บาท
- ใบแจ้งหนี้ครบกำหนดวันนี้: 15 ใบ
- ใบแจ้งหนี้เลยกำหนด: 8 ใบ  
- ยอดชำระวันนี้: 85,000 บาท
```

#### Overdue Alerts
```vue
<!-- Overdue List -->
- INV-2025-001 | ABC Company | เลย 5 วัน | 45,000 บาท
- INV-2025-003 | XYZ Corp    | เลย 12 วัน | 78,000 บาท
- INV-2025-005 | DEF Ltd     | เลย 25 วัน | 120,000 บาท
```

#### Payment Charts
```vue
<!-- Charts & Analytics -->
- กราฟยอดชำระรายเดือน
- อัตราการชำระตรงเวลา vs เลยกำหนด
- Top 10 ลูกค้าที่ค้างชำระ
- Payment method distribution
```

### 2. Payment List & Search

#### Search Options
```vue
<!-- Search Form -->
- เลขที่ใบแจ้งหนี้: INV-2025-001
- ชื่อลูกค้า: ABC Company
- ช่วงวันที่: 01/01/2025 - 31/01/2025
- สถานะ: Pending, Paid, Overdue
- วิธีการชำระ: Cash, Transfer, Check
```

#### Payment Table Columns
```vue
<!-- DataTable Columns -->
- เลขที่ใบแจ้งหนี้
- วันที่ออกใบแจ้งหนี้
- ลูกค้า
- ยอดเงิน
- วันที่ครบกำหนด
- สถานะ
- วิธีการชำระ
- ยอดที่ชำระแล้ว
- ยอดค้างชำระ
- การดำเนินการ [รับชำระ] [แจ้งเตือน] [ดูรายละเอียด]
```

### 3. Payment Entry Form

#### Invoice Selection
```vue
<!-- Select Invoice -->
- ค้นหาใบแจ้งหนี้ที่ยังไม่ได้ชำระ
- แสดงรายละเอียดใบแจ้งหนี้
- ยอดเงินรวม, ยอดที่ชำระแล้ว, ยอดค้างชำระ
```

#### Payment Information
```vue
<!-- Payment Details -->
- วันที่รับชำระ: DatePicker
- ยอดเงินที่รับ: Number Input
- วิธีการชำระ: Dropdown (Cash, Transfer, Check, Card)
- เลขที่อ้างอิง: Reference number (ถ้าโอนเงิน)
- หมายเหตุ: Text area
```

#### Bank/Check Details
```vue
<!-- For Bank Transfer -->
- ธนาคาร: dropdown
- เลขที่บัญชีที่รับโอน
- วันที่โอน
- เลขที่ transaction

<!-- For Check Payment -->
- ธนาคารที่ออกเช็ค
- เลขที่เช็ค
- วันที่เช็ค
- ชื่อผู้เขียนเช็ค
```

### 4. Receipt Generation

#### Receipt Information
```vue
<!-- Receipt Header -->
- เลขที่ใบเสร็จ: REC-2025-001
- วันที่ออกใบเสร็จ
- อ้างอิงใบแจ้งหนี้: INV-2025-001
- ผู้รับเงิน: พนักงานที่ login

<!-- Payment Details -->
- ยอดเงินที่รับชำระ (ตัวเลข + ตัวหนังสือ)
- วิธีการชำระเงิน
- เลขที่อ้างอิง (ถ้ามี)
- หมายเหตุการชำระ
```

## Data Models

### Payment Models
```typescript
interface Payment {
  paymentId: number
  invoiceId: number
  paymentDate: Date
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string
  bankName?: string
  checkNumber?: string
  status: PaymentStatus
  receivedBy: string
  remark?: string
  receiptNumber?: string
}

interface PaymentSummary {
  totalOutstanding: number
  dueTodayCount: number
  overdueCount: number
  todayPayments: number
  overdueAmount: number
}

enum PaymentMethod {
  Cash = 'cash',
  BankTransfer = 'transfer',
  Check = 'check',
  CreditCard = 'card',
  QRCode = 'qr',
  Installment = 'installment'
}

enum PaymentStatus {
  Pending = 'pending',
  Processing = 'processing',
  Confirmed = 'confirmed',
  Failed = 'failed',
  Cancelled = 'cancelled'
}
```

### Payment Dashboard Data
```javascript
const mockPaymentDashboard = {
  summary: {
    totalOutstanding: 1250000,
    dueTodayCount: 15,
    overdueCount: 8,
    todayPayments: 85000,
    overdueAmount: 340000
  },
  overdueInvoices: [
    {
      invoiceNumber: 'INV-2025-001',
      customerName: 'ABC Company',
      overdueDays: 5,
      amount: 45000,
      dueDate: '2025-01-15'
    }
  ],
  recentPayments: [
    {
      paymentId: 1,
      invoiceNumber: 'INV-2025-010',
      customerName: 'XYZ Corp',
      amount: 25000,
      paymentDate: '2025-01-20',
      paymentMethod: 'transfer'
    }
  ]
}
```

## Business Rules

### Payment Validation
```javascript
// ตรวจสอบยอดชำระ
function validatePayment(invoice, paymentAmount) {
  const outstanding = invoice.grandTotal - invoice.paidAmount
  
  if (paymentAmount <= 0) {
    return { valid: false, message: 'ยอดชำระต้องมากกว่า 0' }
  }
  
  if (paymentAmount > outstanding) {
    return { valid: false, message: 'ยอดชำระเกินยอดค้างชำระ' }
  }
  
  return { valid: true }
}
```

### Due Date Calculation
```javascript
function getOverdueDays(dueDate) {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = today - due
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}
```

### Payment Status Logic
```javascript
function calculatePaymentStatus(invoice) {
  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0)
  const outstanding = invoice.grandTotal - totalPaid
  
  if (outstanding === 0) return 'Paid'
  if (totalPaid > 0) return 'Partial'
  if (new Date() > new Date(invoice.dueDate)) return 'Overdue'
  return 'Pending'
}
```

## Integration Points

### API Endpoints (To Develop)
- `GET /api/payments/dashboard` - Payment dashboard data
- `GET /api/payments/overdue` - Overdue invoices
- `GET /api/invoices/unpaid` - Unpaid invoices list
- `POST /api/payments` - Record payment
- `GET /api/payments/{id}/receipt` - Generate receipt
- `POST /api/payments/reminders` - Send payment reminders

### External Integrations
- **Bank API**: Auto-match bank transfers
- **SMS Gateway**: Send payment reminders
- **Email Service**: Email receipts & reminders
- **Accounting System**: Export payment data

### Notification Rules
```javascript
// แจ้งเตือนตามกำหนด
const reminderRules = [
  { days: -3, message: 'ใบแจ้งหนี้จะครบกำหนดใน 3 วัน' },
  { days: 0, message: 'ใบแจ้งหนี้ครบกำหนดวันนี้' },
  { days: 1, message: 'ใบแจ้งหนี้เลยกำหนด 1 วัน' },
  { days: 7, message: 'ใบแจ้งหนี้เลยกำหนด 1 สัปดาห์' },
  { days: 30, message: 'ใบแจ้งหนี้เลยกำหนด 1 เดือน' }
]
```

## การใช้งาน (Demo Flow)

### 1. Payment Dashboard
- เข้าหน้า Dashboard เพื่อดูภาพรวม
- ตรวจสอบใบแจ้งหนี้ที่เลยกำหนด
- ดูสถิติการชำระเงิน

### 2. Record Payment
- ค้นหาใบแจ้งหนี้ที่ต้องรับชำระ
- บันทึกการรับชำระเงิน
- ระบุวิธีการชำระและยอดเงิน
- สร้างใบเสร็จรับเงิน

### 3. Payment Tracking
- ติดตามสถานะการชำระ
- ส่งการแจ้งเตือนลูกค้า
- อัพเดทสถานะเมื่อได้รับชำระ

### 4. Reporting
- รายงานการชำระเงินรายวัน/เดือน
- รายงานลูกค้าค้างชำระ
- Export ข้อมูลสำหรับบัญชี

## Next Steps

1. **Payment Dashboard**: สร้าง dashboard components
2. **Payment Entry Form**: ฟอร์มบันทึกการรับชำระ
3. **Receipt Generation**: ระบบสร้างใบเสร็จ
4. **Reminder System**: ระบบแจ้งเตือนการชำระ
5. **Reporting**: รายงานการชำระเงิน
6. **Bank Integration**: เชื่อมต่อ bank API

---
*สถานะ: Specification Ready - รอ Implementation*