---
name: pdf-system
description: การสร้าง PDF ด้วย pdfmake — ใช้เมื่อสร้าง PDF, export เอกสาร, พิมพ์รายงาน
---

# PDF System (pdfmake)

## กฎหลัก

ใช้ **pdfmake** + **THSarabunNew** font สำหรับรองรับภาษาไทย

---

## โครงสร้างไฟล์

ไฟล์ PDF อยู่ที่ `src/services/helper/pdf/`:

| ไฟล์ | หน้าที่ |
|---|---|
| `FilePlanProduction.js` | ใบจ่าย-รับคืนงาน |
| `FilePlanEmbed.js` | ใบจ่ายงานฝัง |
| `gold-loss/gold-loss-pdf-builder.js` | ใบงาน Gold Loss |
| `quotation/quotation-pdf-builder.js` | ใบเสนอราคา |
| `invoice/invoice-pdf-builder.js` | ใบกำกับสินค้า |
| `delivery/delivery-pdf-builder.js` | ใบส่งของ |
| `gem-barcode/gem-barcode-pdf-builder.js` | Barcode อัญมณี |
| `appraisal/appraisal-history-pdf-builder.js` | ประวัติประเมินราคา |

---

## Builder Pattern

ทุก PDF ใช้ **Class-Based Builder**:

```javascript
import { initPdfMake } from '@/services/utils/pdf-make'
import dayjs from 'dayjs'

export class MyPdfBuilder {
  constructor(data) {
    this.data = data
  }

  getHeaderContent() { /* ... */ }
  getTableContent() { /* ... */ }

  getDocDefinition() {
    return {
      pageSize: 'A4',
      pageMargins: [15, 15, 15, 15],
      content: [
        this.getHeaderContent(),
        this.getTableContent()
      ],
      defaultStyle: {
        font: 'THSarabunNew',
        fontSize: 10
      }
    }
  }

  generatePDF() {
    const pdfMake = initPdfMake()
    return pdfMake.createPdf(this.getDocDefinition())
  }
}
```

---

## วิธีเรียกใช้ใน Component

```javascript
import { MyPdfBuilder } from '@/services/helper/pdf/my-feature/my-pdf-builder.js'

// เปิดในแท็บใหม่
const builder = new MyPdfBuilder(data)
builder.generatePDF().open()

// ดาวน์โหลด
builder.generatePDF().download('filename.pdf')

// พิมพ์
builder.generatePDF().print()
```

---

## Font Setup

**ไฟล์:** `src/services/utils/pdf-make.js`

```javascript
import pdfMake from 'pdfmake/build/pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'

export const initPdfMake = () => {
  pdfMake.vfs = vfs
  pdfMake.fonts = {
    THSarabunNew: {
      normal: 'THSarabunNew.ttf',
      bold: 'THSarabunNew Bold.ttf',
      italics: 'THSarabunNew Italic.ttf',
      bolditalics: 'THSarabunNew BoldItalic.ttf'
    },
    AngsanaNew: { /* ... */ }
  }
  return pdfMake
}
```

**กฎ**: เรียก `initPdfMake()` ทุกครั้งก่อน `createPdf()`

---

## Table Layout

```javascript
{
  table: {
    headerRows: 1,
    widths: [30, '*', 60, 80],
    body: [headerRow, ...dataRows]
  },
  layout: {
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    hLineColor: () => '#cccccc',
    vLineColor: () => '#cccccc',
    fillColor: (rowIndex) => rowIndex === 0 ? '#921313' : null
  }
}
```

---

## Image ใน PDF

ใช้ `getAzureBlobAsBase64` สำหรับรูปจาก Azure Blob:

```javascript
async prepareImages() {
  const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')
  const base64 = await getAzureBlobAsBase64(blobPath, 'stock')
  // ใช้ใน content: { image: base64, width: 50 }
}
```

---

## สิ่งที่ห้ามทำ

- ❌ ห้ามใช้ font อื่นนอกจาก THSarabunNew หรือ AngsanaNew
- ❌ ห้ามลืม `initPdfMake()` ก่อน createPdf
- ❌ ห้าม hardcode font path — ใช้ชื่อ font จาก initPdfMake เสมอ
