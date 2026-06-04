---
name: excel-system
description: คู่มือการ export Excel (.xlsx) ในโปรเจกต์นี้ — ใช้เมื่อต้องสร้าง excel, xlsx, export excel, ExcelHelper, รายงาน, document builder, ตาราง Excel ที่มี header หรือรูปภาพ
---

# Excel System (ExcelJS)

## Library

- **ExcelJS 4.4.0** — library หลักสำหรับสร้าง `.xlsx`
- ห้ามใช้ `xlsx` / `SheetJS` — ใช้ ExcelJS เท่านั้น

---

## 2 แนวทาง — เลือกตามความซับซ้อน

| สถานการณ์ | แนวทาง | Import จาก |
|---|---|---|
| ตารางง่าย (list/รายงาน — array of objects) | `ExcelHelper` static methods | `@/services/utils/excel-js.js` |
| เอกสาร (header บริษัท, รูปสินค้า, ยอดรวม, merge cells) | Class Builder pattern | สร้าง builder ใหม่ตาม pattern |

---

## แนวทาง 1: ExcelHelper (ตารางง่าย)

### Import

```javascript
import { ExcelHelper } from '@/services/utils/excel-js.js'
```

### exportToExcel — ตารางเดียว

```javascript
await ExcelHelper.exportToExcel(data, {
  filename: 'รายงาน-สินค้า.xlsx',
  sheetName: 'สินค้า',
  columns: [
    { header: 'รหัสสินค้า', key: 'stockNumber' },
    { header: 'ชื่อสินค้า', key: 'productName' },
    { header: 'จำนวน', key: 'qty' }
  ],
  columnWidths: { stockNumber: 15, productName: 30, qty: 10 }
})
```

- `data` — Array of objects; key ต้องตรงกับ `columns[].key`
- `columns` — ถ้าไม่ระบุ จะ auto-generate จาก key ของ data[0]
- `columnWidths` — ถ้าไม่ระบุ จะ auto-fit (min 10, max 50)

### exportToExcelMultiSheet — หลาย sheet

```javascript
await ExcelHelper.exportToExcelMultiSheet([
  {
    data: goldData,
    sheetName: 'ทอง',
    columns: [{ header: 'ประเภท', key: 'type' }, { header: 'น้ำหนัก (gms)', key: 'weight' }],
    columnWidths: { type: 20, weight: 15 }
  },
  {
    data: gemData,
    sheetName: 'อัญมณี',
    columns: [{ header: 'ชนิด', key: 'gemType' }, { header: 'กะรัต', key: 'carat' }]
  }
], { filename: 'รายงาน-วัสดุ.xlsx' })
```

### exportWithDatetime — ชื่อไฟล์มี timestamp อัตโนมัติ

```javascript
ExcelHelper.exportWithDatetime(data, 'รายงาน-สต็อก', {
  columns: [...],
  sheetName: 'Stock'
})
// ผลลัพธ์: รายงาน-สต็อก[2025-01-15T10-30-00-000Z].xlsx
```

### defaultStyles — ใช้ซ้ำได้

```javascript
ExcelHelper.defaultStyles = {
  headerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '921313' } },
  headerFont: { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 },
  headerAlignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
  bodyFont: { name: 'Arial', size: 10 }
}
```

**✅ Good — ตารางรายงานง่าย:**
```javascript
import { ExcelHelper } from '@/services/utils/excel-js.js'

async exportData() {
  await ExcelHelper.exportToExcel(this.reportItems, {
    filename: 'รายงาน.xlsx',
    sheetName: 'ข้อมูล',
    columns: [
      { header: 'เลขที่', key: 'number' },
      { header: 'วันที่', key: 'date' },
      { header: 'จำนวนเงิน', key: 'amount' }
    ]
  })
}
```

**❌ Bad — เขียน download blob เองทั้งหมด:**
```javascript
const buffer = await workbook.xlsx.writeBuffer()
const blob = new Blob([buffer], { type: '...' })
// ถ้าใช้ ExcelHelper ได้ ให้ใช้แทน
```

---

## แนวทาง 2: Class Builder (เอกสารซับซ้อน)

ใช้เมื่อต้องการ: header บริษัท + logo, รูปสินค้าฝังใน cell, merge cells, ยอดรวม/สรุป, หลาย section

### Pattern มาตรฐาน

```javascript
import ExcelJS from 'exceljs'

export class MyDocumentExcelBuilder {
  constructor(data, options = {}) {
    this.data = data
    this.currencyUnit = options.currencyUnit || 'THB'
    this.currencyRate = Number(options.currencyRate) || 1
    this.logoBase64 = null
    // คำนวณ totals ใน constructor
    this.subtotal = this.calculateSubtotal()
  }

  calculateSubtotal() { /* ... */ }

  async prepare() {
    try {
      const logoPath = new URL('@/assets/duangkaew-icon.png', import.meta.url).href
      this.logoBase64 = await this.loadImageAsBase64(logoPath)
    } catch {
      // non-critical — continue without logo
    }
    await this.prepareImages()
  }

  async prepareImages() {
    const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')
    await Promise.all(
      this.data.map(async (item) => {
        if (item.imageBase64) return
        const blobPath = item.imageBlobPath || item.imagePath
        if (!blobPath) return
        const base64 = await getAzureBlobAsBase64(blobPath, 'stock')
        if (base64 && base64.length > 0) item.imageBase64 = base64
      })
    )
  }

  async loadImageAsBase64(path) {
    const response = await fetch(path)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  async generateExcel() { /* สร้าง workbook, worksheet, buildHeader, buildItemsTable, buildSummarySection */ }
  buildHeader(worksheet, startRow) { /* ... */ return nextRow }
  buildItemsTable(worksheet, startRow) { /* ... */ return { nextRow, itemImageData } }
  buildSummarySection(worksheet, startRow) { /* ... */ return nextRow }
  autoFitColumns(worksheet) { /* กำหนด column widths */ }

  async downloadExcel(filename) {
    const workbook = await this.generateExcel()
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
```

### วิธีเรียกใช้ใน Component

```javascript
import { SaleOrderExcelBuilder } from '@/services/helper/excel/sale-order/sale-order-excel-builder.js'

async exportExcel() {
  if (this.stockItems.length === 0) {
    warning('ไม่มีสินค้าสำหรับสร้าง Excel')
    return
  }
  this.isExportingExcel = true
  const builder = new SaleOrderExcelBuilder(data, {
    currencyUnit: this.currencyUnit,
    currencyRate: this.currencyRate,
    showCifLabel: this.showCifLabel
  })
  await builder.prepare()
  await builder.downloadExcel('SO_' + soNumber + '.xlsx')
  this.isExportingExcel = false
}
```

---

## Styling มาตรฐาน

### Header row — สีหลัก argb '921313'

```javascript
cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF921313' } }
cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
```

### Summary row — พื้นเทา สีแดง

```javascript
cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }
cell.font = { name: 'Arial', bold: true, color: { argb: 'FF921313' }, size: 10 }
```

### Border มาตรฐาน

```javascript
cell.border = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}
```

---

## Format มาตรฐาน

| ข้อมูล | Format | ตัวอย่าง |
|---|---|---|
| ราคา / จำนวนเงิน | `.toFixed(2)` + `Intl.NumberFormat('th-TH', { minimumFractionDigits: 2 })` | `1,234.56` |
| น้ำหนักวัสดุ (gms/cts) | `.toFixed(2)` | `12.50` |
| วันที่ | `dayjs(date).format('MMMM DD, YYYY')` | `January 15, 2025` |

---

## รูปภาพใน Excel

```javascript
// ใน prepareImages() — โหลดรูปก่อน generateExcel()
const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')
const base64 = await getAzureBlobAsBase64(item.imageBlobPath || item.imagePath, 'stock')

// ใน generateExcel() — embed รูปหลังสร้าง worksheet
const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '')
const imgExt = imageBase64.includes('data:image/png') ? 'png' : 'jpeg'
const imageId = workbook.addImage({ base64: rawBase64, extension: imgExt })
worksheet.addImage(imageId, {
  tl: { col: 1.1, row: rowIndex - 1 + 0.1 },  // rowIndex เป็น 1-indexed
  ext: { width: 55, height: 55 }               // ใช้ ext ไม่ใช่ br เพื่อ preserve aspect ratio
})
```

---

## Reference ไฟล์จริง

| ไฟล์ | หน้าที่ |
|---|---|
| `src/services/utils/excel-js.js` | ExcelHelper — ตารางง่าย (static methods) |
| `src/services/helper/excel/invoice/invoice-excel-builder.js` | Builder pattern ต้นแบบ — Invoice/Quotation |
| `src/services/helper/excel/sale-order/sale-order-excel-builder.js` | Builder — Sale Order |

---

## กฎห้ามทำ

- ❌ ห้าม import `xlsx` หรือ `sheetjs` — ใช้ ExcelJS เท่านั้น
- ❌ ห้ามเขียน download blob logic เองถ้าใช้ `ExcelHelper.exportToExcel()` ได้
- ❌ ห้ามเรียก `generateExcel()` โดยไม่เรียก `prepare()` ก่อน (เมื่อใช้ Builder pattern)
- ❌ ห้าม hardcode สีเป็น `#921313` ใน fill — ใช้ argb `FF921313` เสมอ (ExcelJS ต้องการ argb format)
