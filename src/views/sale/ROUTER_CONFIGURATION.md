# 🔗 Sales Flow Router Configuration

## ✅ Router Routes พร้อมใช้งาน

### 📍 Sales Routes (/sale)

| Route | Component | Description | Status |
|-------|-----------|-------------|---------|
| `/sale/dashboard` | SalesDashboard | ภาพรวมงานขาย | ✅ |
| `/sale/sale-order` | SaleOrder | ใบสั่งขาย | ✅ |
| `/sale/production-order` | ProductionOrder | ใบสั่งผลิต | ✅ |
| `/sale/stock-reservation` | StockReservation | จองสต็อก | ✅ |
| `/sale/delivery-note` | DeliveryNote | ใบส่งของ | ✅ |
| `/sale/invoice` | Invoice | ใบแจ้งหนี้ | ✅ |
| `/sale/payment-dashboard` | PaymentDashboard | ภาพรวมการชำระเงิน | ✅ |

### 📍 Legacy Routes (Redirect)

| Old Route | New Route | Status |
|-----------|-----------|---------|
| `/sale-order` | `/sale/sale-order` | ✅ |
| `/production-order` | `/sale/production-order` | ✅ |
| `/Invoice` | `/sale/invoice` | ✅ |

### 📍 Existing Quotation Routes

| Route | Component | Description | Status |
|-------|-----------|-------------|---------|
| `/sale-quotation` | Quotation | เสนอราคา | ✅ |
| `/sale-quotation-list` | QuotationList | รายการใบเสนอราคา | ✅ |

## 🔄 Navigation Flow

### การเข้าถึงหน้าต่างๆ:

#### 1. **Sales Dashboard** (หน้าหลัก)
```
URL: /sale/dashboard
- แสดงภาพรวม Sales Flow
- Process Flow visualization
- Quick Actions ไปยังหน้าต่างๆ
```

#### 2. **Sale Order** (จุดเริ่มต้น Flow)
```
URL: /sale/sale-order
- สร้างใบสั่งขายจาก Demo Data
- ยืนยันใบสั่งขาย → แสดงปุ่มขั้นตอนต่อไป
- Navigation ไปยัง Production Order, Stock Reservation, etc.
```

#### 3. **Production Order**
```
URL: /sale/production-order
- รับข้อมูลจาก Sale Order via Query Parameters
- จัดการสินค้าที่ต้องผลิต
```

#### 4. **Stock Reservation**
```
URL: /sale/stock-reservation  
- รับข้อมูลจาก Sale Order via Query Parameters
- จัดการการจองสต็อกสินค้าคงคลัง
```

#### 5. **Delivery Note**
```
URL: /sale/delivery-note
- รับข้อมูลจาก Sale Order via Query Parameters
- จัดการการส่งมอบสินค้า
```

#### 6. **Invoice**
```
URL: /sale/invoice
- รับข้อมูลจาก Sale Order via Query Parameters
- สร้างใบแจ้งหนี้และใบกำกับภาษี
```

#### 7. **Payment Dashboard**
```
URL: /sale/payment-dashboard
- แสดงภาพรวมการชำระเงิน
- ติดตามหนี้ค้างชำระ
```

## 🎯 Quick Access URLs

### สำหรับการ Demo:
```bash
# Sales Dashboard (หน้าแรก)
http://localhost:5173/sale/dashboard

# Sale Order (เริ่มต้น Flow)
http://localhost:5173/sale/sale-order

# Production Order (ทดสอบ)
http://localhost:5173/sale/production-order

# Stock Reservation (ทดสอบ)
http://localhost:5173/sale/stock-reservation

# Invoice (ทดสอบ)
http://localhost:5173/sale/invoice

# Payment Dashboard (ทดสอบ)
http://localhost:5173/sale/payment-dashboard
```

## 🔧 Route Configuration Details

### Permission Requirements:
```javascript
// ส่วนใหญ่ใช้ PERMISSIONS.SALE_VIEW หรือ PERMISSIONS.SALE_CREATE
meta: {
  permissions: [PERMISSIONS.SALE_VIEW] // หรือ PERMISSIONS.SALE_CREATE
}
```

### Menu Display:
```javascript
meta: {
  Displayname: {
    en: 'English Name',
    th: 'ชื่อภาษาไทย'
  },
  minorShow: true // แสดงในเมนู
}
```

### Main Route Redirect:
```javascript
// เมื่อเข้า /sale จะ redirect ไป /sale/dashboard
redirect: '/sale/dashboard'
```

## 📱 Component Status

### ✅ พร้อมใช้งาน:
- SalesDashboard ✅
- SaleOrder ✅  
- ProductionOrder ✅
- StockReservation ✅
- DeliveryNote ✅
- Invoice ✅
- PaymentDashboard ✅

### 🔄 Data Flow Integration:
- Query Parameters ระหว่างหน้า ✅
- Mock Data สำหรับ Demo ✅
- SweetAlerts Integration ✅
- DataTableWithPaging ✅

## 🚀 วิธีการทดสอบ Router

### 1. เข้า Sales Dashboard:
```
http://localhost:5173/sale/dashboard
```

### 2. จาก Dashboard → Sale Order:
```
คลิก "สร้างใบสั่งขายใหม่" หรือไป URL โดยตรง
```

### 3. ทดสอบ Navigation Flow:
```
Sale Order → ยืนยัน → คลิกปุ่มขั้นตอนต่อไป
→ Production Order / Stock Reservation / Delivery Note / Invoice
```

### 4. ทดสอบ Back Navigation:
```
ใช้ browser back button หรือ navigation menu
```

---

**🎯 Router Configuration สำเร็จสมบูรณ์! พร้อมสำหรับการใช้งาน Sales Flow ครบทุกขั้นตอน**