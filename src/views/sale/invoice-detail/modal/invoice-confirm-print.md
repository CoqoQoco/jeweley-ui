# Invoice Confirm Print Modal

## จุดประสงค์
Modal สำหรับยืนยันและแก้ไขข้อมูลก่อนพิมพ์เอกสาร Invoice โดยข้อมูลที่แก้ไขจะมีผลเฉพาะกับเอกสารที่พิมพ์เท่านั้น ไม่มีผลกับข้อมูลต้นฉบับในระบบ

## ไฟล์ที่เกี่ยวข้อง
- **Component**: `invoice-confirm-print-modal.vue`
- **Parent View**: `index-view.vue`
- **Reference**: `invoice-version-modal.vue` (โครงสร้างคล้ายคลึง)

## คุณสมบัติหลัก

### 1. แก้ไขข้อมูลเอกสาร
- **Invoice Number**: สามารถแก้ไขได้ (default: ค่าเดิมจากระบบ)
- **Invoice Date**: สามารถเปลี่ยนแปลงได้ (default: ค่าเดิมจากระบบ) 
    ## date ต้องใช้ prime-vue date picker ครับ 

### 2. แสดงค่าต้นฉบับ
- แสดงค่าเดิมของ Invoice Number และ Invoice Date เป็น hint ใต้ช่อง input
- ใช้สีเทาและขนาดตัวอักษรเล็กกว่า

### 3. การแจ้งเตือน
- มีข้อความแจ้งเตือนชัดเจนว่าการเปลี่ยนแปลงไม่มีผลกับข้อมูลต้นทาง
- ใช้ไอคอน info และสีฟ้าสำหรับข้อความแจ้งเตือน

### 4. Validation
- ตรวจสอบ Invoice Number ต้องไม่เป็นค่าว่าง
- ตรวจสอบ Invoice Date ต้องมีการเลือกวันที่

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isShowModal | Boolean | false | สถานะการแสดง/ซ่อน modal |
| invoiceData | Object | {} | ข้อมูล invoice ต้นฉบับ |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| close-modal | - | ปิด modal |
| confirm-print | Object | ยืนยันการพิมพ์พร้อมข้อมูลที่แก้ไข |

## ข้อมูลที่ส่งกลับ (confirm-print event)

```javascript
{
  ...invoiceData,           // ข้อมูล invoice ทั้งหมด
  invoiceNumber: String,    // Invoice Number ที่แก้ไข
  invoiceDate: String       // Invoice Date ที่แก้ไข (format: YYYY-MM-DD)
}
```

## การใช้งาน

### 1. Import Component
```vue
<script>
import InvoiceConfirmPrintModal from './modal/invoice-confirm-print-modal.vue'

export default {
  components: {
    InvoiceConfirmPrintModal
  }
}
</script>
```

### 2. เพิ่ม Template
```vue
<template>
  <InvoiceConfirmPrintModal
    :isShowModal="showConfirmPrintModal"
    :invoiceData="currentInvoice"
    @close-modal="showConfirmPrintModal = false"
    @confirm-print="handleConfirmPrint"
  />
</template>
```

### 3. ตัวอย่าง Handler
```javascript
methods: {
  handleConfirmPrint(printData) {
    // printData จะมีข้อมูล invoice ทั้งหมด + ค่าที่แก้ไข
    console.log('Invoice Number:', printData.invoiceNumber)
    console.log('Invoice Date:', printData.invoiceDate)

    // ส่งข้อมูลไปพิมพ์เอกสาร
    this.printInvoice(printData)
  }
}
```

## โครงสร้าง UI

```
┌─────────────────────────────────────────┐
│ [Printer Icon] ยืนยันการพิมพ์เอกสาร     │ ← Header (title-text-lg-bg)
├─────────────────────────────────────────┤
│ [File Icon] ข้อมูลเอกสาร                │ ← Section Title
│ ┌─────────────────────────────────────┐ │
│ │ [#] Invoice Number                  │ │
│ │ [Input: เลขที่ใบแจ้งหนี้]            │ │ ← Editable Input
│ │ ค่าเดิม: INV-2024-001               │ │ ← Original Value Hint
│ │                                     │ │
│ │ [Calendar] Invoice Date             │ │
│ │ [Date Picker]                       │ │ ← Editable Date Input
│ │ ค่าเดิม: 15/01/2025                │ │ ← Original Value Hint
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [Info Icon] การเปลี่ยนแปลงข้อมูลนี้    │ ← Info Section
│ จะมีผลเฉพาะกับเอกสารที่พิมพ์เท่านั้น  │
│ ข้อมูลต้นฉบับในระบบจะไม่มีการเปลี่ยนแปลง│
├─────────────────────────────────────────┤
│             [พิมพ์เอกสาร] [ยกเลิก]     │ ← Action Buttons
└─────────────────────────────────────────┘
```

## SCSS Classes ที่ใช้

### จาก standard-form.scss
- `.filter-container` - กรอบสำหรับฟอร์ม
- `.filter-container-search` - กรอบสำหรับข้อมูล info
- `.title-text-lg-bg` - หัวข้อใหญ่พื้นหลังแดง
- `.btn-submit-container` - Container สำหรับปุ่ม

### Custom Classes
- `.form-label` - Label ของ input fields
- `.form-control` - Input และ date picker
- `.form-text.text-muted` - ข้อความ hint ค่าเดิม

## Dependencies

### Components
- `ModalView.vue` - Base modal component

### Libraries
- `dayjs` - สำหรับจัดการวันที่

### Services
- `sweetAlerts.js` - สำหรับแสดงข้อความ warning

## Validation Rules

1. **Invoice Number**
   - ต้องไม่เป็นค่าว่าง
   - จะ trim() ช่องว่างด้านหน้า-หลังอัตโนมัติ

2. **Invoice Date**
   - ต้องเลือกวันที่
   - Format: YYYY-MM-DD (HTML5 date input)

## หมายเหตุสำหรับการพัฒนาต่อ

### การปรับแต่งที่อาจต้องการ
1. เพิ่ม field อื่นๆ เช่น Customer Name, Due Date
2. เพิ่มตัวเลือก template การพิมพ์
3. เพิ่ม preview ก่อนพิมพ์
4. เพิ่มประวัติการพิมพ์ครั้งก่อน

### เชื่อมต่อกับระบบพิมพ์
- ใน parent component ควรรับ `confirm-print` event
- นำข้อมูลที่ได้ส่งไปยัง PDF generation service
- ข้อมูลที่แก้ไขจะถูก override ในเอกสารที่พิมพ์เท่านั้น

### การ Extend ในอนาคต
```javascript
// ตัวอย่างการเพิ่ม field เพิ่มเติม
data() {
  return {
    printData: {
      invoiceNumber: '',
      invoiceDate: '',
      customerName: '',      // ← เพิ่ม field ใหม่
      paymentTerms: '',      // ← เพิ่ม field ใหม่
      // ...
    }
  }
}
```

---

**Created**: 2025-01-03
**Last Updated**: 2025-01-03
**Version**: 1.0