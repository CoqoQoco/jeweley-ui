---
name: alert-system
description: ระบบ alert และ notification — ใช้เมื่อต้องแสดง popup, confirm dialog, error message, success message ใดๆ
---

# Alert & Notification System

**กฎสำคัญ**: ห้ามใช้ `alert()`, `confirm()`, `prompt()` native JavaScript เด็ดขาด

ใช้ **sweetAlerts service** เสมอ

---

## Import

```javascript
import { warning, error, success, info, confirmSubmit } from '@/services/alert/sweetAlerts.js'
```

Location: `src/services/alert/sweetAlerts.js`

---

## Functions

| Function | สี | ใช้เมื่อ |
|---|---|---|
| `success(message, title?)` | เขียว | บันทึกสำเร็จ, ดำเนินการเสร็จ |
| `error(message, title?)` | แดง | เกิด error, API fail |
| `warning(message, title?)` | เหลือง | validation fail, ข้อมูลไม่ครบ |
| `info(message, title?)` | น้ำเงิน | แจ้งข้อมูลทั่วไป |
| `confirmSubmit(message, title, callback)` | - | ยืนยันก่อนดำเนินการ |

---

## ตัวอย่าง

```javascript
// Success
success('บันทึกข้อมูลสำเร็จ')
success('เลขที่ใบสั่งขาย: SO-001', 'สร้างใบสั่งขายสำเร็จ')

// Warning
warning('กรุณากรอกชื่อลูกค้าและที่อยู่', 'ข้อมูลไม่ครบถ้วน')

// Error
error(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'ไม่สามารถโหลดข้อมูลได้')

// Confirm
confirmSubmit('คุณต้องการลบข้อมูลนี้หรือไม่?', 'ยืนยันการลบ', () => {
  deleteData()
})
```

**✅ Good:**
```javascript
success('บันทึกสำเร็จ')
confirmSubmit('คุณต้องการลบหรือไม่?', 'ยืนยันการลบ', handleDelete)
warning('กรุณากรอกชื่อลูกค้าและที่อยู่', 'ข้อมูลไม่ครบถ้วน')
```

**❌ Bad:**
```javascript
alert('บันทึกสำเร็จ')
confirm('คุณต้องการลบหรือไม่?')
warning('กรุณากรอกข้อมูล')  // ไม่ระบุ context
```

---

## Function Signatures เต็ม

```javascript
warning(message, title?, callback?)
error(message, title?, callback?, stacktrace?)
success(message, title?, callback?)
info(message, title?, callback?)
confirmSubmit(message, title, callback, buttonInfo?, icon?, msgStyle?)
```
