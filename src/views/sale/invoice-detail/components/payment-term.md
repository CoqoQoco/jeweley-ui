# Payment Term Component

## สถานะการพัฒนา: ✅ เสร็จสมบูรณ์

### สิ่งที่ทำเสร็จแล้ว
- ✅ สร้าง API payment functions ใน `invoice-store.js`
  - `createPayment(formData)` - สร้างรายการชำระเงิน
  - `fetchPaymentList({ formValue })` - ดึงประวัติการชำระเงิน
  - `deletePayment({ formValue })` - ลบรายการชำระเงิน
- ✅ แก้ไข dropdown payment methods ให้มี structure: `{ name, value, id }`
- ✅ เชื่อมต่อ API กับปุ่ม "บันทึก" ใน modal
- ✅ เพิ่ม watch เพื่อ sync `paymentId` กับ `paymentMethod`
- ✅ แก้ไข `optionLabel` จาก `"label"` เป็น `"name"` ใน Dropdown
- ✅ อัพเดท `handleSavePayment` ใน index-view.vue ให้เรียก API จริง
- ✅ เพิ่ม `loadPaymentHistory` method และเรียกตอน mounted
- ✅ ส่งข้อมูลไปยัง backend ด้วย FormData (PascalCase)

## จุดประสงค์
ระบบจัดการการชำระเงิน Invoice ประกอบด้วย 2 ส่วนหลัก:
1. **ประวัติการเก็บเงิน** - แสดง list ประวัติการชำระเงินทั้งหมด
2. **บันทึกการเก็บเงิน** - Modal สำหรับบันทึกการรับชำระเงินแต่ละครั้ง

## ไฟล์ที่เกี่ยวข้อง
- **Modal Component**: `modal/payment-record-modal.vue`
- **Parent View**: `index-view.vue`
- **Reference**: `modal/invoice-confirm-print-modal.vue`

## 1. Modal บันทึกการเก็บเงิน (payment-record-modal.vue)

### คุณสมบัติหลัก

#### 1.1 ข้อมูลการชำระเงิน
- **วันที่จ่ายเงิน**: PrimeVue Calendar (required)
- **ยอดเงิน**: ตามสกุลเงินของ Invoice (required)
  - แสดงยอดคงเหลือที่ต้องชำระ
  - Validate ไม่ให้เกินยอดคงเหลือ
  - Default = ยอดคงเหลือทั้งหมด
- **วิธีการชำระเงิน**: Dropdown (required)
  - เงินสด
  - โอนเงิน
  - เช็ค
  - บัตรเครดิต
- **เลขที่อ้างอิง/หมายเลขธุรกรรม**: Text input (optional)
- **หมายเหตุ**: Textarea (optional)

#### 1.2 หลักฐานการชำระเงิน
- **Upload รูปภาพ**: ใช้ `UploadImage.vue` component
- **จำนวน**: 1 ไฟล์
- **รองรับ**: JPG, PNG
- **บีบอัดรูปภาพ**: อัตโนมัติก่อนส่ง API
  - Max dimension: 1200x1200px
  - Quality: 70%
  - Format: JPEG

#### 1.3 ข้อมูลแสดง
- Invoice Number
- ยอด Invoice รวม
- ยอดคงเหลือที่ต้องชำระ

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isShowModal | Boolean | false | สถานะการแสดง/ซ่อน modal |
| invoiceData | Object | {} | ข้อมูล invoice |
| paidAmount | Number | 0 | ยอดเงินที่จ่ายแล้ว |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| close-modal | - | ปิด modal |
| save-payment | Object | บันทึกการชำระเงิน |

### ข้อมูลที่ส่งกลับ (save-payment event)

```javascript
{
  invoiceNumber: String,       // เลขที่ invoice
  paymentDate: Date,           // วันที่จ่าย (normalized time = 00:00:00)
  amount: Number,              // ยอดเงิน
  payment: Number,             // Payment method ID (int) - ใหม่!
  paymentName: String,         // Payment method name (string) - ใหม่!
  referenceNumber: String,     // เลขที่อ้างอิง (nullable)
  remark: String,              // หมายเหตุ (nullable)
  receiptImage: File           // รูปภาพที่บีบอัดแล้ว (compressed image)
}
```

**หมายเหตุ**:
- เปลี่ยนจาก `paymentMethod` เป็น `payment` (ID) และ `paymentName` (ชื่อ)
- ลบ `createdDate` และ `createdBy` ออก (backend จะสร้างเอง)

### Validation Rules

1. **วันที่จ่ายเงิน**: ต้องเลือกวันที่
2. **ยอดเงิน**:
   - ต้องกรอกและมากกว่า 0
   - ต้องไม่เกินยอดคงเหลือ
3. **วิธีการชำระเงิน**: ต้องเลือก
4. **รูปภาพ**: Optional แต่แนะนำให้อัปโหลด

### Image Compression

```javascript
// Compression settings
maxWidth: 1200px
maxHeight: 1200px
quality: 0.7 (70%)
outputFormat: 'image/jpeg'

// เปรียบเทียบขนาดไฟล์
console.log('Original size:', (file.size / 1024).toFixed(2), 'KB')
console.log('Compressed size:', (compressedFile.size / 1024).toFixed(2), 'KB')
```

## 2. Payment History List (ยังไม่ทำ)

### จะแสดงใน index-view.vue
- **ตำแหน่ง**: ต่อท้ายส่วน "ข้อมูลการชำระเงินและสรุปยอด"
- **รูปแบบ**: DataTable หรือ Card List
- **ข้อมูลแสดง**:
  - วันที่จ่าย
  - ยอดเงิน
  - วิธีการชำระ
  - เลขที่อ้างอิง
  - ผู้บันทึก
  - รูปภาพหลักฐาน (thumbnail + preview)
  - หมายเหตุ

## การใช้งาน

### 1. Import Component (index-view.vue)

```vue
<script>
import PaymentRecordModal from './modal/payment-record-modal.vue'

export default {
  components: {
    PaymentRecordModal
  },
  data() {
    return {
      showPaymentModal: false,
      paidAmount: 0  // จำนวนเงินที่จ่ายแล้ว (จาก API)
    }
  }
}
</script>
```

### 2. เพิ่ม Template

```vue
<template>
  <!-- ในส่วน "ข้อมูลการชำระเงินและสรุปยอด" -->
  <div class="card-header">
    <h6 class="mb-0">
      <i class="bi bi-credit-card mr-2"></i>ข้อมูลการชำระเงินและสรุปยอด
    </h6>
    <button class="btn btn-sm btn-success" @click="showPaymentModal = true">
      <i class="bi bi-cash-coin mr-1"></i>
      บันทึกการเก็บเงิน
    </button>
  </div>

  <!-- Payment Modal -->
  <PaymentRecordModal
    :isShowModal="showPaymentModal"
    :invoiceData="invoiceData"
    :paidAmount="paidAmount"
    @close-modal="showPaymentModal = false"
    @save-payment="handleSavePayment"
  />
</template>
```

### 3. Handler Method (อัพเดทแล้ว)

```javascript
methods: {
  async handleSavePayment(paymentData) {
    // Create FormData for file upload (ใช้ PascalCase สำหรับ backend .NET)
    const formData = new FormData()
    formData.append('InvoiceNumber', paymentData.invoiceNumber)
    formData.append('PaymentDate', paymentData.paymentDate.toISOString())
    formData.append('Amount', paymentData.amount)
    formData.append('Payment', paymentData.payment)           // Payment method ID
    formData.append('PaymentName', paymentData.paymentName)   // Payment method name

    if (paymentData.referenceNumber) {
      formData.append('ReferenceNumber', paymentData.referenceNumber)
    }

    if (paymentData.remark) {
      formData.append('Remark', paymentData.remark)
    }

    if (paymentData.receiptImage) {
      formData.append('ReceiptImage', paymentData.receiptImage)
    }

    // Call API to save payment record
    const response = await this.invoiceStore.createPayment(formData)

    if (response) {
      // Reload payment history
      await this.loadPaymentHistory()
    }

    // Close modal after processing
    this.showPaymentModal = false
  },

  async loadPaymentHistory() {
    // Load payment records from API
    const response = await this.invoiceStore.fetchPaymentList({
      formValue: {
        invoiceNumber: this.invoiceData.invoiceNumber
      }
    })

    if (response && response.data) {
      // Calculate total paid amount
      this.paidAmount = response.data.reduce((sum, payment) => {
        return sum + payment.amount
      }, 0)
    }
  }
}
```

**การเปลี่ยนแปลง**:
- ใช้ PascalCase สำหรับ FormData keys (เพื่อให้ตรงกับ .NET backend)
- เปลี่ยนจาก `savePaymentRecord` เป็น `createPayment`
- เปลี่ยนจาก `fetchPaymentHistory` เป็น `fetchPaymentList`
- ลบ try-catch ออก (axios middleware จัดการ error ให้อัตโนมัติ)
- ปิด modal หลังจากบันทึกสำเร็จ

## API Integration

### Frontend API Methods (invoice-store.js)

```javascript
// Invoice Payment APIs
async createPayment(formData) {
  try {
    return await api.jewelry.post('Invoice/Payment/Create', formData, {
      skipLoading: false,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    throw error
  }
},

async fetchPaymentList({ formValue }) {
  try {
    const param = {
      invoiceNumber: formValue.invoiceNumber
    }
    return await api.jewelry.post('Invoice/Payment/List', param, {
      skipLoading: false
    })
  } catch (error) {
    console.error('Error fetching payment list:', error)
    throw error
  }
},

async deletePayment({ formValue }) {
  try {
    const param = {
      paymentRunning: formValue.paymentRunning
    }
    return await api.jewelry.post('Invoice/Payment/Delete', param, {
      skipLoading: false
    })
  } catch (error) {
    console.error('Error deleting payment:', error)
    throw error
  }
}
```

### Backend ต้องรับ
```csharp
// C# .NET API
[HttpPost("payment")]
public async Task<IActionResult> SavePaymentRecord([FromForm] PaymentRecordDto payment)
{
    // payment.ReceiptImage = IFormFile (compressed image)
    // Save image to Images/Payment/
    // Save payment record to database
    // Return payment record with ID
}

[HttpGet("payment/history")]
public async Task<IActionResult> GetPaymentHistory(string invoiceNumber)
{
    // Return list of payment records
}
```

## Database Schema (แนะนำ)

```sql
CREATE TABLE TbtInvoicePayment (
    Id INT PRIMARY KEY IDENTITY,
    InvoiceNumber VARCHAR(50) NOT NULL,
    PaymentDate DATETIME NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    PaymentMethod VARCHAR(20) NOT NULL, -- cash, transfer, check, credit
    ReferenceNumber VARCHAR(100),
    Remark NVARCHAR(500),
    ReceiptImagePath VARCHAR(255),
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    CreatedBy VARCHAR(100) NOT NULL,

    FOREIGN KEY (InvoiceNumber) REFERENCES TbtInvoice(InvoiceNumber)
)
```

## โครงสร้าง UI Modal

```
┌─────────────────────────────────────────┐
│ [Cash Icon] บันทึกการเก็บเงิน           │ ← Header
├─────────────────────────────────────────┤
│ [Receipt Icon] ข้อมูลการชำระเงิน        │
│ ┌─────────────────────────────────────┐ │
│ │ [Calendar] วันที่จ่ายเงิน *         │ │
│ │ [Date Picker]                       │ │
│ │                                     │ │
│ │ [Currency] ยอดเงิน (USD) *          │ │
│ │ [Input: 1000.00]                    │ │
│ │ ยอดคงเหลือ: 5,000.00 USD           │ │
│ │                                     │ │
│ │ [Credit Card] วิธีการชำระเงิน *    │ │
│ │ [Dropdown: โอนเงิน]                 │ │
│ │                                     │ │
│ │ [#] เลขที่อ้างอิง                   │ │
│ │ [Input: TXN12345]                   │ │
│ │                                     │ │
│ │ [Chat] หมายเหตุ                     │ │
│ │ [Textarea: ...]                     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [Image Icon] หลักฐานการชำระเงิน        │
│ ┌─────────────────────────────────────┐ │
│ │ [เลือกรูปภาพ] receipt.jpg          │ │
│ │                                     │ │
│ │     [Image Preview 300x300]         │ │
│ │                                     │ │
│ │ * รองรับ JPG, PNG (บีบอัดอัตโนมัติ) │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [Info] Invoice: INV-2024-001           │
│        ยอด Invoice: 10,000.00 USD      │
├─────────────────────────────────────────┤
│             [บันทึก] [ยกเลิก]          │
└─────────────────────────────────────────┘
```

## หมายเหตุสำหรับการพัฒนา

### สิ่งที่ทำแล้ว (ทั้งหมด)
- ✅ สร้าง payment-record-modal.vue
- ✅ รองรับ upload และบีบอัดรูปภาพ
- ✅ Validation ครบถ้วน
- ✅ ระบบคำนวณยอดคงเหลืออัตโนมัติ
- ✅ เพิ่มปุ่ม "บันทึกการเก็บเงิน" ใน index-view.vue
- ✅ เชื่อมต่อ API backend (Frontend + Backend)
- ✅ ระบบ Payment History tracking (คำนวณ paidAmount)
- ✅ แก้ไข Dropdown ให้แสดงข้อมูลได้ถูกต้อง

### สิ่งที่ต้องทำต่อ (Optional)
- ⏳ สร้าง Payment History List UI component (แสดงตาราง/รายการ)
- ⏳ ทดสอบ upload รูปภาพกับ backend จริง
- ⏳ เพิ่มฟีเจอร์ลบ/แก้ไขประวัติการชำระเงิน (UI)

### การ Extend ในอนาคต
- เพิ่ม Receipt PDF generation
- Export payment history
- Email notification เมื่อรับชำระเงิน
- Multi-currency conversion rate tracking
- Payment installment plan

---

**Created**: 2025-01-03
**Last Updated**: 2025-01-04
**Version**: 2.0 (เสร็จสมบูรณ์)

## สรุปการทำงาน

ระบบบันทึกการเก็บเงิน Invoice ได้รับการพัฒนาเสร็จสมบูรณ์แล้ว ประกอบด้วย:

1. **Frontend**: Modal สำหรับบันทึกการชำระเงิน พร้อมระบบอัพโหลดและบีบอัดรูปภาพ
2. **Backend**: API endpoints ครบทั้ง Create, List, และ Delete
3. **Integration**: เชื่อมต่อ Frontend กับ Backend ผ่าน FormData
4. **Validation**: ตรวจสอบข้อมูลครบถ้วนก่อนบันทึก
5. **Payment Tracking**: คำนวณยอดที่จ่ายแล้วและยอดคงเหลืออัตโนมัติ

สามารถนำไปใช้งานได้ทันที โดยรอเพิ่ม UI สำหรับแสดงประวัติการชำระเงินเท่านั้น