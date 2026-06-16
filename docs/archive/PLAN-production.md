# Plan: สลิปจ่ายฝัง — เพิ่มส่วน Gold Loss

## เป้าหมาย

เพิ่มข้อมูล Gold Loss เข้าไปใน **สลิปจ่ายฝัง (PDF)** ของแผนกฝัง (status 80)
ปัจจุบันสลิปแสดงเฉพาะ ค่าแรง/รายละเอียดงาน — ต้องเพิ่ม section คำนวณ Gold Loss ด้วย

---

## สลิปปัจจุบัน (EmbedSlipPdfBuilder)

```
┌─────────────────────────────────────────────────────┐
│ บริษัท ดวงแก้ว จิวเวลรี่...    สลิปจ่ายฝัง          │
│ วัตถุดิบ: YG                          dd/mm/yyyy     │
├──────┬──────────────────────────────────────────────┤
│ รูป  │ เลขที่ W.O. | รหัสสินค้า | ช่างรับงาน       │
│ แม่  ├──────────────────────────────────────────────┤
│ พิมพ์│ รายละเอียด | จ.จ่าย | น.จ่าย | น.รับ | จ.รับ│
│      │             |         |         |       | ราคา │
│      │ รวมราคา:  xxx.xx                              │
├──────┴──────────────────────────────────────────────┤
│ หมายเหตุ | ผู้รับ [ ] | ผู้ส่ง [ ]                  │
└─────────────────────────────────────────────────────┘
```

---

## สลิปใหม่ (เพิ่ม Gold Loss Section)

```
┌─────────────────────────────────────────────────────┐
│ บริษัท ดวงแก้ว จิวเวลรี่...    สลิปจ่ายฝัง          │
│ วัตถุดิบ: YG                          dd/mm/yyyy     │
├──────┬──────────────────────────────────────────────┤
│ รูป  │ เลขที่ W.O. | รหัสสินค้า | ช่างรับงาน       │
│ แม่  ├──────────────────────────────────────────────┤
│ พิมพ์│ [ตารางรายละเอียดงาน + ค่าแรง เหมือนเดิม]    │
│      │ รวมค่าแรง: xxx.xx                             │
├──────┴──────────────────────────────────────────────┤
│ [คำนวณ Gold Loss]  ราคาทอง: 2,500.00 บาท/กรัม       │
├────────┬──────┬──────┬───────┬──────┬───────┬───────┤
│ รายละ  │น.จ่าย│น.รับ │ขาด/  │%loss │น.loss │เงิน  │
│ เอียด  │      │      │เกิน  │      │ ได้   │ได้/  │
│        │      │      │      │      │       │ขาด   │
├────────┼──────┼──────┼───────┼──────┼───────┼───────┤
│ [desc] │50.000│48.500│-1.500│ 1.5  │ 0.750 │+1,875│
├────────┴──────┴──────┴───────┴──────┴───────┴───────┤
│                        รวมเงิน ได้/ขาด: +1,875.00   │
├─────────────────────────────────────────────────────┤
│ หมายเหตุ | ผู้รับ [ ] | ผู้ส่ง [ ]                  │
└─────────────────────────────────────────────────────┘
```

---

## วิเคราะห์ Data Flow ปัจจุบัน

### การเรียก PDF

`plan-process-view.vue`:
```javascript
// groupGold computed → แต่ละ group มี:
{
  key: "YG - [WK001:ช่างหนุ่ย]",
  selectKey: "YG - ช่างหนุ่ย",
  gold: "YG",
  worker: "WK001 - ช่างหนุ่ย",
  wo: "WO-001", product: "...", mold: "M001",
  values: [
    {
      goldWeightSend, goldWeightCheck, goldQtySend, goldQtyCheck,
      lossPercent,   // ← มีแล้วจาก DB (implement ไปแล้ว)
      lossRemark,    // ← มีแล้วจาก DB (implement ไปแล้ว)
      wages, totalWages, requestDate, description, ...
    }
  ]
}

// เรียก PDF:
async handleGeneratePDF(data) {
  await this.fetchImage()
  await this.generatePDF(data)
}
async generatePDF(data) {
  const pdfBuilder = new EmbedSlipPdfBuilder(data, this.urlImage)
  const pdf = pdfBuilder.generatePDF()
  pdf.open()
}
```

**ปัญหา**: `goldLossPrice` อยู่ที่ `this.data.goldLossPrice` (status header) แต่ **ไม่ได้ส่งไปให้ EmbedSlipPdfBuilder**

### แหล่งข้อมูล Gold Loss

| ข้อมูล | แหล่งที่มา | ปัจจุบัน |
|--------|------------|---------|
| `lossPercent` | `data.values[i].lossPercent` | ✅ มีแล้ว |
| `lossRemark` | `data.values[i].lossRemark` | ✅ มีแล้ว |
| `goldWeightSend` | `data.values[i].goldWeightSend` | ✅ มีแล้ว |
| `goldWeightCheck` | `data.values[i].goldWeightCheck` | ✅ มีแล้ว |
| `goldLossPrice` | `this.data.goldLossPrice` (header) | ❌ ไม่ได้ส่งไป PDF |

---

## Files ที่เปลี่ยนแปลง

| File | Action |
|------|--------|
| `src/services/helper/pdf/FilePlanEmbed.js` | **แก้ไข** — เพิ่ม gold loss section ใน PDF builder |
| `src/views/production/plan-view/components/plan-process-view.vue` | **แก้ไข** — ส่ง `goldLossPrice` เข้า PDF builder |

---

## 1. `plan-process-view.vue` — ส่ง goldLossPrice ไปด้วย

### แก้ `generatePDF(data)`

```javascript
async generatePDF(data) {
  try {
    // เพิ่ม goldLossPrice จาก header เข้า data object
    const enrichedData = {
      ...data,
      goldLossPrice: this.data.goldLossPrice ?? 0
    }
    const pdfBuilder = new EmbedSlipPdfBuilder(enrichedData, this.urlImage)
    const pdf = pdfBuilder.generatePDF()
    pdf.open()
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
},
```

---

## 2. `FilePlanEmbed.js` — เพิ่ม Gold Loss Section

### สูตรคำนวณต่อ row (ใน values[])

```javascript
const weightSend      = item.goldWeightSend ?? 0
const weightCheck     = item.goldWeightCheck ?? 0
const rawLoss         = weightSend - weightCheck              // น้ำหนัก ขาด/เกิน
const lossPercent     = Number(item.lossPercent ?? 0)
const weightLossAllowed = weightSend * (lossPercent / 100)   // น้ำหนักที่ loss ได้
const weightLossActual  = weightLossAllowed - rawLoss         // น้ำหนัก loss (+ = ได้/เขียว, - = ขาด/แดง)
const moneyDiff         = weightLossActual * goldLossPrice    // เงิน ได้/ขาด
```

### เพิ่ม method `buildGoldLossBody()`

```javascript
buildGoldLossBody() {
  const goldLossPrice = this.data.goldLossPrice ?? 0
  const body = []

  // Header row
  body.push([
    this.setTablePriceTitle('รายละเอียด'),
    this.setTablePriceTitleTextRight('น้ำหนักจ่าย'),
    this.setTablePriceTitleTextRight('น้ำหนักรับ'),
    this.setTablePriceTitleTextRight('ขาด/เกิน'),
    this.setTablePriceTitleTextRight('%loss'),
    this.setTablePriceTitleTextRight('น้ำหนักที่ loss ได้'),
    this.setTablePriceTitleTextRight('น้ำหนัก loss'),
    this.setTablePriceTitleTextRight('เงิน ได้/ขาด')
  ])

  let moneyTotal = 0

  this.data.values.forEach((item) => {
    const weightSend = Number(item.goldWeightSend ?? 0)
    const weightCheck = Number(item.goldWeightCheck ?? 0)
    const rawLoss = weightSend - weightCheck
    const lossPercent = Number(item.lossPercent ?? 0)
    const weightLossAllowed = weightSend * (lossPercent / 100)
    const weightLossActual = weightLossAllowed - rawLoss
    const moneyDiff = weightLossActual * goldLossPrice
    moneyTotal += moneyDiff

    const signColor = (val) => (val >= 0 ? '#007060' : '#cc0000')
    const fmtSign = (val) => {
      const sign = val >= 0 ? '+' : '-'
      return `${sign}${Math.abs(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    }
    const fmt3 = (val) => Number(val).toFixed(3)

    body.push([
      this.setTablePriceRow(item.lossRemark ?? ''),
      this.setTablePriceRowTextRight(fmt3(weightSend)),
      this.setTablePriceRowTextRight(fmt3(weightCheck)),
      {
        text: fmtSign(rawLoss * -1),  // rawLoss เป็น weightSend-weightCheck → ค่า + = เกิน (ดี), flipped sign
        alignment: 'right',
        fontSize: 12,
        bold: true,
        color: signColor(rawLoss * -1),
        border: [false, false, false, false]
      },
      this.setTablePriceRowTextRight(`${lossPercent.toFixed(2)}%`),
      this.setTablePriceRowTextRight(fmt3(weightLossAllowed)),
      {
        text: fmtSign(weightLossActual),
        alignment: 'right',
        fontSize: 12,
        bold: true,
        color: signColor(weightLossActual),
        border: [false, false, false, false]
      },
      {
        text: fmtSign(moneyDiff),
        alignment: 'right',
        fontSize: 12,
        bold: true,
        color: signColor(moneyDiff),
        border: [false, false, false, false]
      }
    ])
  })

  // Footer: รวมเงิน
  const signColor = (val) => (val >= 0 ? '#007060' : '#cc0000')
  const fmtSign = (val) => {
    const sign = val >= 0 ? '+' : '-'
    return `${sign}${Math.abs(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }

  body.push([
    this.setTablePriceFooter(''),
    this.setTablePriceFooter(''),
    this.setTablePriceFooter(''),
    this.setTablePriceFooter(''),
    this.setTablePriceFooter(''),
    this.setTablePriceFooter(''),
    this.setTablePriceFooterTextRight('รวมเงิน ได้/ขาด'),
    {
      text: fmtSign(moneyTotal),
      bold: true,
      alignment: 'right',
      color: signColor(moneyTotal),
      border: [false, true, false, false]
    }
  ])

  return body
}
```

### เพิ่ม method `getGoldLossSection()`

```javascript
getGoldLossSection() {
  const goldLossPrice = this.data.goldLossPrice ?? 0

  return {
    margin: [0, 8, 0, 0],
    stack: [
      // Header bar
      {
        columns: [
          { text: 'คำนวณ Gold Loss', bold: true, fontSize: 12 },
          {
            text: `ราคาทอง: ${Number(goldLossPrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} บาท/กรัม`,
            alignment: 'right',
            fontSize: 11
          }
        ],
        margin: [0, 0, 0, 3]
      },
      // Gold Loss Table
      {
        fontSize: 11,
        table: {
          headerRows: 1,
          widths: ['*', 38, 38, 38, 28, 45, 38, 45],
          body: this.buildGoldLossBody()
        }
      }
    ]
  }
}
```

### แก้ `getDocDefinition()` — เพิ่ม gold loss section

เงื่อนไข: แสดงเฉพาะเมื่อ **ทั้งสองเงื่อนไขครบ**:
1. `goldLossPrice > 0` — ราคาทองถูกบันทึกแล้ว
2. มีอย่างน้อย 1 row ที่ `lossPercent > 0` — มีการกรอก %loss แล้ว

ขาดเงื่อนไขใดเงื่อนไขหนึ่ง → **ไม่แสดง section**

```javascript
getDocDefinition() {
  // แสดง Gold Loss section เฉพาะเมื่อบันทึกข้อมูลครบทั้งคู่:
  // 1) ราคาทองมีค่า  2) มีแถวที่กรอก %loss แล้ว
  const hasGoldLoss =
    Number(this.data.goldLossPrice ?? 0) > 0 &&
    this.data.values.some(v => Number(v.lossPercent ?? 0) > 0)

  return {
    pageSize: { width: 595.28, height: 'auto' },
    pageMargins: [10, 10, 10, 10],
    content: [
      this.getHeaderContent(),
      { ...this.getSubHeaderContent(), margin: [0, 0, 0, 2] },
      { ...this.getMainContentTable(), margin: [0, 0, 0, 2] },
      // เพิ่ม Gold Loss Section เฉพาะเมื่อมีข้อมูลครบ
      ...(hasGoldLoss ? [this.getGoldLossSection()] : []),
      this.getSignatureSection()
    ],
    defaultStyle: { font: 'THSarabunNew', fontSize: 11 },
    styles: {
      title: { fontSize: 10, margin: [0, 1, 0, 1] },
      desc: { fontSize: 10, bold: true, margin: [0, 1, 0, 1] },
      boldText: { bold: true }
    }
  }
}
```

---

## Layout ที่จะเห็น (กรณีมี Gold Loss)

```
Gold Loss section (ต่อจากตารางค่าแรง):

คำนวณ Gold Loss               ราคาทอง: 2,500.00 บาท/กรัม
──────────────────────────────────────────────────────────
รายละเอียด │น.จ่าย│น.รับ │ขาด/เกิน│%loss│น.loss ได้│น.loss│เงิน ได้/ขาด
──────────────────────────────────────────────────────────
ช่างหนุ่ย   │50.000│48.500│  -1.500│ 1.50│     0.750│+1.250│   +3,125.00
──────────────────────────────────────────────────────────
                                          รวมเงิน ได้/ขาด│   +3,125.00
```

**สีที่ใช้**:
- ค่า `+` (ดี/ได้) → สีเขียว `#007060`
- ค่า `-` (ขาด) → สีแดง `#cc0000`

---

## Sign Convention ใน PDF

| คอลัมน์ | `+` = | `-` = |
|---------|-------|-------|
| ขาด/เกิน | เกิน (ดี) | ขาด (ไม่ดี) |
| น้ำหนัก loss | budget เหลือ (ดี) | เกิน loss ที่กำหนด (ไม่ดี) |
| เงิน ได้/ขาด | ได้เงิน (ดี) | ขาดเงิน (ไม่ดี) |

> **หมายเหตุ**: `rawLoss = weightSend - weightCheck` ถ้า weightSend > weightCheck → rawLoss > 0 → ทองขาด (ไม่ดี)
> ดังนั้น sign ของ "ขาด/เกิน" column ต้องกลับ: แสดง `-rawLoss` เพื่อให้ `+` = เกิน = ดี

---

## เงื่อนไขแสดง Gold Loss Section

Gold Loss section จะ **ปรากฏใน PDF** ต่อเมื่อ **ครบทั้งสองเงื่อนไข**:

| เงื่อนไข | ความหมาย |
|---------|---------|
| `goldLossPrice > 0` | ผู้ใช้กดบันทึก "ราคาทอง" ใน update-process แล้ว |
| มีแถวที่ `lossPercent > 0` | ผู้ใช้กรอก `%loss` อย่างน้อย 1 แถว แล้วกดบันทึก |

**กรณีที่ไม่แสดง** (ขาดเงื่อนไขใดข้อหนึ่ง):
- ยังไม่ได้กรอกราคาทอง → ไม่แสดง
- กรอกราคาทองแล้วแต่ยังไม่ได้กรอก %loss → ไม่แสดง
- กรอก %loss แต่ไม่ได้กรอกราคาทอง → ไม่แสดง
- ยังไม่ได้ทำ gold loss เลย → ไม่แสดง (layout สลิปเหมือนเดิมทุกอย่าง)

---

## ไม่เปลี่ยนแปลง

- Layout ของ main content table (ค่าแรง, รูปแม่พิมพ์, ข้อมูล WO) — คงเดิมทุกอย่าง
- Signature section — คงเดิม
- การเรียก PDF จาก modal เลือก gold/worker — คงเดิม
- `FormPrintEmbedBill.vue` (plan-update) — ไม่แตะ (scope เฉพาะ plan-view)

---

*สร้าง: 2026-03-10 — รอ confirm ก่อน implement*
