---
name: pdf-system
description: การสร้าง PDF ด้วย pdfmake — ใช้เมื่อสร้าง PDF, export เอกสาร, พิมพ์รายงาน
---

# PDF System (pdfmake)

## กฎหลัก

ใช้ **pdfmake** สร้างเอกสาร PDF — font ที่ใช้จริงในทุก builder ปัจจุบันคือ **`PDF_FONT`** (ChakraPetch) จาก `shared/pdf-theme.js` ดูตาราง "การเลือก font" ด้านล่างสำหรับรายละเอียด

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
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'
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
        font: PDF_FONT,
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

`initPdfMake()` ลงทะเบียน font ไว้ **5 ตระกูล** (ไม่ใช่แค่ THSarabunNew/AngsanaNew) โดย merge vfs จากหลายไฟล์ font เข้าด้วยกัน:

```javascript
import pdfMake from 'pdfmake/build/pdfmake'
import { vfs } from '@/assets/fonts/pdf-fonts.js'
import { acherusVfs } from '@/assets/fonts/acherus-grotesque-font.js'
import { promptVfs } from '@/assets/fonts/prompt-font.js'
import { chakraVfs } from '@/assets/fonts/chakra-petch-font.js'

export const initPdfMake = () => {
  pdfMake.vfs = { ...vfs, ...acherusVfs, ...promptVfs, ...chakraVfs }
  pdfMake.fonts = {
    ChakraPetch: {
      normal: 'ChakraPetch-Regular.ttf',
      bold: 'ChakraPetch-Bold.ttf',
      italics: 'ChakraPetch-Regular.ttf',
      bolditalics: 'ChakraPetch-Bold.ttf'
    },
    AngsanaNew: { /* ... */ },
    Prompt: { /* ... */ },
    THSarabunNew: {
      normal: 'THSarabunNew.ttf',
      bold: 'THSarabunNew Bold.ttf',
      italics: 'THSarabunNew Italic.ttf',
      bolditalics: 'THSarabunNew BoldItalic.ttf'
    },
    AcherusGrotesque: { /* ... */ }
  }
  return pdfMake
}
```

**กฎ**: เรียก `initPdfMake()` ทุกครั้งก่อน `createPdf()`

---

## การเลือก Font

| ประเภทเอกสาร | Font | หมายเหตุ |
|---|---|---|
| Builder ทุกตัวใน `src/services/helper/pdf/` (billing-note, invoice-summary, material-sale, quotation, sale-order, invoice, delivery, gold-loss-tang, appraisal, gem-barcode, worker-wages, pre-plan-order-form, product-catalog, FilePlanProduction, FilePlanEmbed ฯลฯ) | `PDF_FONT` (= `'ChakraPetch'`) จาก `shared/pdf-theme.js` | มาตรฐานปัจจุบัน — ทุก builder ที่มีอยู่ตอนนี้ใช้ `defaultStyle: { font: PDF_FONT }` แล้วทั้งหมด รองรับภาษาไทยในตัว |
| THSarabunNew / AngsanaNew / Prompt | ลงทะเบียนไว้ใน `initPdfMake()` | ยังไม่มี builder ใดอ้างอิงอยู่ในปัจจุบัน — เผื่อไว้สำหรับความต้องการ font พิเศษในอนาคต ไม่ใช่ตัวเลือก default |
| AcherusGrotesque | ลงทะเบียนไว้ใน `initPdfMake()` | ⚠️ **ไม่มี glyph ภาษาไทย** — ห้ามใช้กับข้อความไทยเด็ดขาด (เจอปัญหาจริงในงาน catalog PDF) ใช้ได้เฉพาะข้อความอังกฤษ/ตัวเลข (เช่น accent text ในงาน catalog) |

**กฎ**: import `PDF_FONT` จาก `shared/pdf-theme.js` แล้วใช้ใน `defaultStyle.font` เสมอ — ห้าม hardcode ชื่อ font เป็น string ตรงๆ ใน builder

```javascript
// ✅ Good
import { PDF_FONT } from '@/services/helper/pdf/shared/pdf-theme.js'
defaultStyle: { font: PDF_FONT, fontSize: 11 }

// ❌ Bad — hardcode ชื่อ font ตรงๆ
defaultStyle: { font: 'ChakraPetch', fontSize: 11 }
defaultStyle: { font: 'THSarabunNew', fontSize: 11 }
```

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

- ❌ ห้าม hardcode ชื่อ font (เช่น `'ChakraPetch'`, `'THSarabunNew'`) ตรงๆ ใน builder — ใช้ `PDF_FONT` จาก `shared/pdf-theme.js` เสมอ
- ❌ ห้ามใช้ font ที่ไม่ได้ลงทะเบียนใน `initPdfMake()`
- ❌ ห้ามใช้ `AcherusGrotesque` กับข้อความภาษาไทย — ไม่มี glyph ไทย ข้อความจะแสดงผิดเพี้ยน
- ❌ ห้ามลืม `initPdfMake()` ก่อน createPdf
- ❌ ห้าม hardcode font path — ใช้ชื่อ font จาก initPdfMake เสมอ
