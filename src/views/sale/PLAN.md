# Plan: ย้าย Conditions Block จาก Sale Order PDF → Quotation PDF

## Summary

ย้าย conditions block (ข้อความท้ายเอกสาร) จาก `sale-order-pdf-builder.js` ไปใส่ใน `quotation-pdf-builder.js` แทน
- Sale Order PDF → comment out ทั้ง Conditions block ออก (ไม่แสดงอีกต่อไป)
- Quotation PDF → เพิ่ม Conditions block เข้าไป + เพิ่ม `conditionText` style

---

## Files ที่เปลี่ยน

| File | Action |
|------|--------|
| `src/services/helper/pdf/sale-order/sale-order-pdf-builder.js` | Comment out ทั้ง Conditions block ใน `getSummarySection()` |
| `src/services/helper/pdf/quotation/quotation-pdf-builder.js` | เพิ่ม Conditions block ใน `getSummarySection()` + เพิ่ม `conditionText` style |
| `src/views/sale/SALES_FLOW.md` | อัปเดต Section 7 (PDF Builders) |

---

## 1. sale-order-pdf-builder.js — Comment out Conditions block

### ตำแหน่ง
`getSummarySection()` → ใน `stack: [ ... ]` ของ column ที่มี `width: '90%'`

### ปัจจุบัน (มี active lines):
```javascript
              // Conditions
              {
                margin: [0, 10, 0, 0],
                stack: [
                  // { text: 'Price is F.O.B. Bangkok', style: 'conditionText' },
                  // ...
                  { text: 'Price is F.O.B. Bangkok not inclued freight and insurance', style: 'conditionText' },
                  { text: 'Production time within 5-7 weeks', style: 'conditionText' },
                  { text: '40% payment of tt, 60% before the shipment.', style: 'conditionText' },
                  { text: 'Gold weight, Diamond weight and Stones weight are approximately, the actual weight will be known after production is completed', style: 'conditionText' },
                  // { text: 'W.C.P.F.R stand for Wax, Casting, Polising, Fliding, Rhodium', style: 'conditionText' },
                  { text: 'Minimun order 10 pcs per design / Minimun purchase US$ 5,000', style: 'conditionText' },
                  { text: 'The price quotation is current gold price market at www.kitco.com (please confirm within 2 days)', style: 'conditionText' }
                ]
              }
```

### หลังแก้ไข — comment out ทั้ง block:
```javascript
              // Conditions
              // {
              //   margin: [0, 10, 0, 0],
              //   stack: [
              //     { text: 'Price is F.O.B. Bangkok not inclued freight and insurance', style: 'conditionText' },
              //     { text: 'Production time within 5-7 weeks', style: 'conditionText' },
              //     { text: '40% payment of tt, 60% before the shipment.', style: 'conditionText' },
              //     { text: 'Gold weight, Diamond weight and Stones weight are approximately, the actual weight will be known after production is completed', style: 'conditionText' },
              //     { text: 'Minimun order 10 pcs per design / Minimun purchase US$ 5,000', style: 'conditionText' },
              //     { text: 'The price quotation is current gold price market at www.kitco.com (please confirm within 2 days)', style: 'conditionText' }
              //   ]
              // }
```

---

## 2. quotation-pdf-builder.js — เพิ่ม 2 จุด

### 2a. เพิ่ม Conditions block ใน getSummarySection()

ตำแหน่ง: ต่อจาก `(Authorized Signature and Company Stamp)` block — ก่อน `],` ปิด outer stack

```javascript
              // Conditions
              {
                margin: [0, 10, 0, 0],
                stack: [
                  { text: 'Price is F.O.B. Bangkok not inclued freight and insurance', style: 'conditionText' },
                  { text: 'Production time within 5-7 weeks', style: 'conditionText' },
                  { text: '40% payment of tt, 60% before the shipment.', style: 'conditionText' },
                  { text: 'Gold weight, Diamond weight and Stones weight are approximately, the actual weight will be known after production is completed', style: 'conditionText' },
                  { text: 'Minimun order 10 pcs per design / Minimun purchase US$ 5,000', style: 'conditionText' },
                  { text: 'The price quotation is current gold price market at www.kitco.com (please confirm within 2 days)', style: 'conditionText' }
                ]
              }
```

### 2b. เพิ่ม conditionText style ใน getDocDefinition() → styles

ปัจจุบัน `quotation-pdf-builder.js` ไม่มี `conditionText` style — ต้องเพิ่ม:

```javascript
        conditionText: {
          fontSize: 8,
          color: '#393939',
          margin: [0, 1, 0, 1]
        }
```

ตำแหน่ง: ต่อจาก `totalWordsInTable` style (style สุดท้ายใน `styles` object)

---

## 3. SALES_FLOW.md — อัปเดต Section 7

อัปเดต row ของ `quotation-pdf-builder.js` ใน PDF Builders table เพื่อระบุว่ามี Conditions block:

**ก่อน**:
```
| `pdf/quotation/quotation-pdf-builder.js` | `InvoicePdfBuilder` | Quotation PDF (item table + per-item discount + footer totals) |
```

**หลัง**:
```
| `pdf/quotation/quotation-pdf-builder.js` | `InvoicePdfBuilder` | Quotation PDF (item table + per-item discount + footer totals + conditions) |
```

---

## Verification

1. เปิด Quotation PDF → ต้องเห็น conditions text 6 บรรทัดท้ายเอกสาร (font 8px สีเทา)
2. เปิด Sale Order PDF → ไม่มี conditions text อีกต่อไป
3. Layout/font/style ของ Quotation PDF ส่วนอื่นไม่เปลี่ยนแปลง

---

*Last updated: 2026-02-23 — รอ confirm ก่อน implement*
