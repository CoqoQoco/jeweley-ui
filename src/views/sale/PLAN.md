# Plan: PDF Builders — ขยาย Image + CIF Toggle

## Context

ปรับปรุง 3 PDF builders:
1. **ขยายขนาด Image** — เพิ่ม image column width + image size โดยลด price/amount column เพื่อชดเชย
2. **CIF Toggle** — ให้กำหนด on/off ป้ายกำกับ "C.I.F" ได้ แต่ยังคงแสดง grand total amount ไว้เสมอ

---

## Files ที่จะแก้ไข

| File | Action |
|------|--------|
| `pdf/quotation/quotation-pdf-builder.js` | column widths + image size + CIF toggle |
| `pdf/sale-order/sale-order-pdf-builder.js` | column widths + image size + CIF toggle |
| `pdf/invoice/invoice-pdf-builder.js` | column widths + image size + CIF toggle |
| `src/views/sale/SALES_FLOW.md` | อัปเดต Section 8 |

---

## สิ่งที่ยังไม่เปลี่ยน (out of scope for this plan)

- Modal UI สำหรับ toggle CIF (confirm-create-pdf-view.vue, etc.) — แยก implement ทีหลัง
- Caller files (quotation-pdf-integration.js, invoice-pdf-integration.js, sale-order-view.vue) — อัปเดตพร้อมกันใน session เดียวกัน

---

## Change 1 — ขยาย Image Column + Image Size

### ก่อน / หลัง

| | ก่อน | หลัง |
|--|------|------|
| Image column width (index 1) | `30` | `45` |
| Image size (width/height) | `25 × 25` | `38 × 38` |
| Image margin | `[2, 5, 2, 5]` | `[2, 3, 2, 3]` |
| Price column (index 8) | `60` | `55` |
| Amount column (index 9) | `60` | `50` |
| **Net width change** | — | +15 - 5 - 10 = **0** (balanced) |

### Column Widths — ทุก PDF builder เปลี่ยนเหมือนกัน

```javascript
// Empty page table (header only):
widths: [15, 45, '*', '*', '*', '*', '*', 20, 55, 50]  // เดิม: [15, 30, '*', '*', '*', '*', '*', 20, 60, 60]

// Regular + Final page table:
widths: [15, 45, 70, 70, 35, 45, '*', 20, 55, 50]      // เดิม: [15, 30, 70, 70, 35, 45, '*', 20, 60, 60]
```

### setTabImageCell — ทุก PDF builder เปลี่ยนเหมือนกัน

```javascript
// ก่อน:
return {
  image: imageData,
  width: 25,
  height: 25,
  alignment: 'center',
  margin: [2, 5, 2, 5]
}

// หลัง:
return {
  image: imageData,
  width: 38,
  height: 38,
  alignment: 'center',
  margin: [2, 3, 2, 3]
}
```

---

## Change 2 — CIF Label Toggle

### สิ่งที่เกิดขึ้นในแต่ละ builder

CIF row (grand total row) ปัจจุบัน — เหมือนกันทุก builder:
```javascript
body.push([
  { text: this.convertNumberToWords(grandTotal), style: 'summaryLabelColored', alignment: 'left', colSpan: 7 },
  {}, {}, {}, {}, {}, {},
  { text: 'C.I.F', style: 'totalSummaryLabelColored', alignment: 'right', colSpan: 2 },  // ← label นี้
  {},
  { text: this.roundNoDecimal(grandTotal), style: 'totalSummaryLabelColored', alignment: 'right' }  // ← price คงไว้
])
```

**Goal**: Label "C.I.F" on/off ได้ แต่ `grandTotal` amount แสดงเสมอ

---

### 2a. SaleOrderPdfBuilder — เพิ่มใน `options` object (ง่ายสุด)

**Constructor** (`sale-order-pdf-builder.js`):
```javascript
// เพิ่มใน constructor:
this.showCifLabel = options.showCifLabel !== undefined ? options.showCifLabel : true
```

**CIF row**:
```javascript
{ text: this.showCifLabel ? 'C.I.F' : '', style: 'totalSummaryLabelColored', alignment: 'right', colSpan: 2 },
```

**Caller** (`sale-order-view.vue` + `mobile/sale/detail-view.vue`):
```javascript
const pdfBuilder = new SaleOrderPdfBuilder(pdfData, {
  currencyUnit: ...,
  currencyRate: ...,
  showCifLabel: true  // ← เพิ่ม (default true = backward compatible)
})
```

---

### 2b. quotation InvoicePdfBuilder — รับผ่าน `customer` object

**Constructor** (`quotation-pdf-builder.js`):
```javascript
// เพิ่มใน constructor (customer param มีอยู่แล้ว):
this.showCifLabel = customer?.showCifLabel !== undefined ? customer.showCifLabel : true
```

**CIF row**:
```javascript
{ text: this.showCifLabel ? 'C.I.F' : '', style: 'totalSummaryLabelColored', alignment: 'right', colSpan: 2 },
```

**Caller** (`quotation-pdf-integration.js`):
```javascript
const invoiceBuilder = new InvoicePdfBuilder(
  formattedItems,
  { ...customer, showCifLabel: customer.showCifLabel !== undefined ? customer.showCifLabel : true },
  // ... ที่เหลือเดิม
)
```

---

### 2c. invoice InvoicePdfBuilder — รับผ่าน `saleOrderData` object

**Constructor** (`invoice-pdf-builder.js`):
```javascript
// เพิ่มใน constructor (saleOrderData param มีอยู่แล้ว):
this.showCifLabel = saleOrderData?.showCifLabel !== undefined ? saleOrderData.showCifLabel : true
```

**CIF row**:
```javascript
{ text: this.showCifLabel ? 'C.I.F' : '', style: 'totalSummaryLabelColored', alignment: 'right', colSpan: 2 },
```

**Caller** (`invoice-pdf-integration.js`):
```javascript
this.pdfBuilder = new InvoicePdfBuilder(
  items,
  customer,
  invoiceDate,
  { ...saleOrder, showCifLabel: options.showCifLabel !== undefined ? options.showCifLabel : true },
  currencyUnit,
  currencyRate,
  invoiceNo,
  10
)
```

---

## Change 3 — SALES_FLOW.md Section 8 Update

อัปเดต Section 8 (PDF Builders) เพิ่ม:
1. Column widths ใหม่
2. `showCifLabel` option

### เพิ่ม sub-section ใน Section 8:
```
### Image & Column Widths (ทุก builder ใช้ค่าเดียวกัน)

| Column | Index | Width |
|--------|-------|-------|
| No. | 0 | 15 |
| Image | 1 | 45 |
| Style/Product | 2 | 70 |
| Description | 3 | 70 |
| Gold (gms) | 4 | 35 |
| Diamond (cts) | 5 | 45 |
| Gem (cts) | 6 | * |
| Qty | 7 | 20 |
| Price | 8 | 55 |
| Amount | 9 | 50 |

Image size: 38×38 px

### CIF Label Toggle (showCifLabel)

| Builder | รับผ่าน | Default |
|---------|---------|---------|
| SaleOrderPdfBuilder | `options.showCifLabel` | `true` |
| quotation InvoicePdfBuilder | `customer.showCifLabel` | `true` |
| invoice InvoicePdfBuilder | `saleOrderData.showCifLabel` | `true` |

- `showCifLabel: true` → แสดง "C.I.F" label (เหมือนเดิม)
- `showCifLabel: false` → ซ่อน label (แต่ยังแสดง grand total amount เสมอ)
```

---

## Summary ของ Changes

| # | File | What | จำนวน Occurrences |
|---|------|------|-------------------|
| 1a | `quotation-pdf-builder.js` | Column widths (empty/regular/final) | 3 จุด |
| 1b | `quotation-pdf-builder.js` | setTabImageCell size | 1 จุด |
| 1c | `quotation-pdf-builder.js` | CIF toggle: constructor + `this.showCifLabel` | 2 จุด |
| 2a | `sale-order-pdf-builder.js` | Column widths | 3 จุด |
| 2b | `sale-order-pdf-builder.js` | setTabImageCell size | 1 จุด |
| 2c | `sale-order-pdf-builder.js` | CIF toggle: constructor + `this.showCifLabel` | 2 จุด |
| 3a | `invoice-pdf-builder.js` | Column widths | 3 จุด |
| 3b | `invoice-pdf-builder.js` | setTabImageCell size | 1 จุด |
| 3c | `invoice-pdf-builder.js` | CIF toggle: constructor + `this.showCifLabel` | 2 จุด |
| 4 | `sale-order-view.vue` | Add `showCifLabel` to SaleOrderPdfBuilder call | 1 จุด |
| 5 | `mobile/sale/detail-view.vue` | Add `showCifLabel` to SaleOrderPdfBuilder call | 1 จุด |
| 6 | `quotation-pdf-integration.js` | Spread `showCifLabel` into customer | 1 จุด |
| 7 | `invoice-pdf-integration.js` | Spread `showCifLabel` into saleOrder | 1 จุด |
| 8 | `SALES_FLOW.md` | อัปเดต Section 8 | — |

---

## Verification

1. เปิด Quotation PDF → รูปสินค้าควรใหญ่ขึ้น (38×38 แทน 25×25)
2. Price/Amount column ยังแสดงตัวเลขครบ ไม่ truncate
3. `showCifLabel: true` → PDF แสดง "C.I.F" label
4. `showCifLabel: false` → "C.I.F" หายไป แต่ grand total amount ยังแสดง
5. Layout หน้า PDF ไม่พัง (เพราะ net width change = 0)

---

*Last updated: 2026-02-24 — รอ confirm ก่อน implement*
