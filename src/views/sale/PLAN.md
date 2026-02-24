# Plan: แสดงต้นทุนจากแผนผลิตใน appraisal-form-view.vue

## Context

`appraisal-form-view.vue` ปัจจุบันแสดงแค่ข้อมูลเลขที่แผน (`planRunning`) และ WO display field

User ต้องการ **แสดงต้นทุนจากแผนผลิต** ถ้าสินค้านั้นมี WO — ดูรูปแบบข้อมูลจาก `plan-price-view.vue`

**วิธีที่เลือก: แก้ Backend `Get()` ให้ return `PlanPriceItems` โดยตรง** — ง่ายกว่าการ call API เพิ่มจาก frontend

---

## Current State Analysis

### `TbtProductionPlanPrice` fields ที่มีอยู่แล้ว
```
No, Name, NameDescription, NameGroup
Qty, QtyPrice, QtyWeight, QtyWeightPrice
TotalPrice  ← stored in DB (ไม่ใช่ computed)
Date, Running, Wo, WoNumber
```

### `Get.Response` ปัจจุบัน
```csharp
PlanQty              // มีอยู่แล้ว — set เฉพาะตอน plan มีข้อมูล
PriceTransactions    // มีอยู่แล้ว — appraisal items (fallback จาก plan หรือ materials)
PlanPriceItems       // ❌ ยังไม่มี — ต้องเพิ่ม
```

### ปัญหาของ logic ปัจจุบันใน `Get()`
```
ปัจจุบัน: query plan เฉพาะเมื่อ PriceTransactions ว่าง (fallback เท่านั้น)
ต้องการ:  query plan เสมอเมื่อมี Wo+WoNumber → set PlanPriceItems (แยกจาก PriceTransactions)
```

---

## Files ที่จะแก้ไข

| File | Layer | Action |
|------|-------|--------|
| `jewelry.Model/Stock/Product/Get/Response.cs` | Model | เพิ่ม `PlanPriceItems` field + `PlanPriceItem` class |
| `Jewelry.Service/Stock/Product/ProductService.cs` | Service | refactor `Get()` — แยก plan query ออกมา + populate PlanPriceItems |
| `jeweley-ui/src/.../appraisal-form-view.vue` | Frontend | อ่าน `stock.planPriceItems` จาก response → แสดง read-only table |
| `jeweley-ui/src/views/sale/SALES_FLOW.md` | Doc | update |

---

## 1. `Response.cs` — เพิ่ม PlanPriceItems

```csharp
// เพิ่มใน class Response:
public List<PlanPriceItem> PlanPriceItems { get; set; } = new List<PlanPriceItem>();

// เพิ่ม class ใหม่:
public class PlanPriceItem
{
    public int No { get; set; }
    public string Name { get; set; }
    public string NameDescription { get; set; }
    public string NameGroup { get; set; }
    public DateTime? Date { get; set; }
    public decimal Qty { get; set; }
    public decimal QtyPrice { get; set; }
    public decimal QtyWeight { get; set; }
    public decimal QtyWeightPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
```

---

## 2. `ProductService.cs` — Refactor `Get()` method

### Strategy: แยก plan query ออกมาที่ระดับบน — ใช้ตัวเดียวกันสำหรับทั้ง 2 วัตถุประสงค์

```csharp
// ---- หลังสร้าง response object ----

// Step A: ดึง plan data เสมอ (ถ้ามี Wo+WoNumber)
TbtProductionPlan plan = null;
if (!string.IsNullOrEmpty(response.Wo) && response.WoNumber.HasValue)
{
    plan = _jewelryContext.TbtProductionPlan
        .Include(x => x.TbtProductionPlanPrice)
        .Where(x => x.Wo == response.Wo && x.WoNumber == response.WoNumber.Value)
        .FirstOrDefault();
}

// Step B: PriceTransactions — ลำดับ priority เดิม (ไม่เปลี่ยน logic)
// ขั้น 1: จาก ProductCostDetail JSON (ถ้ามี)
if (stock.ProductCostDetail != null) { ... }

// ขั้น 2: fallback จาก plan (ถ้า PriceTransactions ยังว่าง)
if (!response.PriceTransactions.Any() && plan != null && plan.TbtProductionPlanPrice.Any())
{
    response.PlanQty = plan.ProductQty;
    // ... existing Gold/NonGold logic เหมือนเดิม (ไม่แก้)
}
else if (!response.PriceTransactions.Any())
{
    // ... existing material fallback เหมือนเดิม (ไม่แก้)
}

// Step C: PlanPriceItems — ใส่เสมอถ้า plan มีข้อมูล (ใหม่ทั้งหมด)
if (plan != null && plan.TbtProductionPlanPrice != null && plan.TbtProductionPlanPrice.Any())
{
    response.PlanQty = plan.ProductQty;
    response.PlanPriceItems = plan.TbtProductionPlanPrice
        .OrderBy(x => x.No)
        .Select(x => new jewelry.Model.Stock.Product.Get.PlanPriceItem
        {
            No = x.No,
            Name = x.Name,
            NameDescription = x.NameDescription,
            NameGroup = x.NameGroup,
            Date = x.Date,
            Qty = x.Qty,
            QtyPrice = x.QtyPrice,
            QtyWeight = x.QtyWeight,
            QtyWeightPrice = x.QtyWeightPrice,
            TotalPrice = x.TotalPrice
        }).ToList();
}
```

> **ข้อดีของ refactor นี้:** query plan **ครั้งเดียว** ใช้ได้ทั้งสอง purpose — ไม่ hit DB ซ้ำ

---

## 3. `appraisal-form-view.vue` — Frontend (Simple!)

### ❌ ไม่ต้องเพิ่ม store action ใหม่
ข้อมูล `planPriceItems` มาจาก `stock` prop โดยตรง (Get API response) — ไม่ต้อง call API เพิ่ม

### computed — เพิ่ม 3 computed

```javascript
planPriceItems() {
  return this.localStock.planPriceItems || []
},
hasPlanProductionCost() {
  return this.planPriceItems.length > 0
},
planProductQty() {
  return Number(this.localStock.planQty) || 1
}
```

### methods — เพิ่ม 3 methods (helper เท่านั้น)

```javascript
calcPlanGroupTotal(groupName) {
  return this.planPriceItems
    .filter(item => item.nameGroup === groupName)
    .reduce((sum, item) => sum + Number(item.totalPrice), 0)
},
calcPlanTotalCost() {
  return this.planPriceItems
    .reduce((sum, item) => sum + Number(item.totalPrice), 0).toFixed(2)
},
calcPlanCostPerPiece() {
  const total = this.planPriceItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
  return (total / this.planProductQty).toFixed(2)
}
```

### Template — เพิ่ม section "ต้นทุนจากแผนผลิต (อ้างอิง)"

**ตำแหน่ง:** หลัง plan info section และก่อน customer section

```html
<template v-if="hasPlanProductionCost">
  <div class="line mt-3 mb-3"></div>

  <div class="vertical-center-container mb-2">
    <span class="title-text-lg bi bi-cash-coin mr-2"></span>
    <span class="title-text-lg">ต้นทุนจากแผนผลิต (อ้างอิง)</span>
    <span class="badge badge-secondary ml-2" style="font-size: 0.75rem;">
      แผน: {{ localStock.wo }}{{ localStock.woNumber }}
    </span>
  </div>

  <div class="responsive-text-note mb-2">
    * ราคารวมทั้งแผน {{ planProductQty }} ชิ้น — แสดงเพื่อเปรียบเทียบเท่านั้น
  </div>

  <div class="responsive-table-wrapper">
    <DataTable
      :value="planPriceItems"
      rowGroupMode="subheader"
      groupRowsBy="nameGroup"
      stripedRows
      showGridlines
    >
      <ColumnGroup type="header">
        <Row>
          <Column header="รายละเอียด" :colspan="2" />
          <Column header="จำนวน" />
          <Column header="ราคา/จำนวน" />
          <Column header="น้ำหนัก" />
          <Column header="ราคา/น้ำหนัก" />
          <Column header="ราคารวม (THB)" />
        </Row>
      </ColumnGroup>

      <Column field="nameGroup" />
      <Column field="index" style="width: 10px">
        <template #body="slotProps"><span>{{ slotProps.index + 1 }}</span></template>
      </Column>
      <Column field="nameDescription">
        <template #body="slotProps"><span>{{ slotProps.data.nameDescription }}</span></template>
      </Column>
      <Column field="qty" style="width: 100px">
        <template #body="slotProps">
          <div class="text-right">{{ Number(slotProps.data.qty).toFixed(3) }}</div>
        </template>
      </Column>
      <Column field="qtyPrice" style="width: 100px">
        <template #body="slotProps">
          <div class="text-right">{{ Number(slotProps.data.qtyPrice).toFixed(2) }}</div>
        </template>
      </Column>
      <Column field="qtyWeight" style="width: 100px">
        <template #body="slotProps">
          <div class="text-right">{{ Number(slotProps.data.qtyWeight).toFixed(3) }}</div>
        </template>
      </Column>
      <Column field="qtyWeightPrice" style="width: 100px">
        <template #body="slotProps">
          <div class="text-right">{{ Number(slotProps.data.qtyWeightPrice).toFixed(2) }}</div>
        </template>
      </Column>
      <Column field="totalPrice" style="width: 130px">
        <template #body="slotProps">
          <div class="text-right font-weight-bold">
            {{ Number(slotProps.data.totalPrice).toFixed(2) }}
          </div>
        </template>
      </Column>

      <template #groupheader="slotProps">
        <div class="flex align-items-center gap-2 type-container">
          <i class="bi bi-clipboard2-check mr-2"></i>
          <span>{{ getGroupName(slotProps.data.nameGroup) }}</span>
        </div>
      </template>
      <template #groupfooter="slotProps">
        <div class="d-flex align-items-center justify-content-between gap-2 type-container">
          <span>ต้นทุน {{ getGroupName(slotProps.data.nameGroup) }}</span>
          <span class="mr-2">{{ calcPlanGroupTotal(slotProps.data.nameGroup).toFixed(2) }}</span>
        </div>
      </template>

      <ColumnGroup type="footer">
        <Row>
          <Column :colspan="6">
            <template #footer>
              <div class="text-right type-container">
                ต้นทุนรวมทั้งแผน ({{ planProductQty }} ชิ้น)
              </div>
            </template>
          </Column>
          <Column>
            <template #footer>
              <div class="text-right type-container">{{ calcPlanTotalCost() }}</div>
            </template>
          </Column>
        </Row>
        <Row>
          <Column :colspan="6">
            <template #footer>
              <div class="text-right type-container plan-per-piece">ต้นทุนต่อชิ้น</div>
            </template>
          </Column>
          <Column>
            <template #footer>
              <div class="text-right type-container plan-per-piece">{{ calcPlanCostPerPiece() }}</div>
            </template>
          </Column>
        </Row>
      </ColumnGroup>
    </DataTable>
  </div>
</template>
```

### Style

```scss
.plan-per-piece {
  color: var(--base-font-color);
  font-weight: bold;
}
```

---

## Edge Cases

| Case | Behavior |
|------|----------|
| ไม่มี `wo` / `woNumber` | ไม่ query plan → `planPriceItems = []` → ไม่แสดง |
| หา plan ไม่เจอ (WO ไม่มีในระบบ) | `plan = null` → `planPriceItems = []` → ไม่แสดง |
| มี plan แต่ `TbtProductionPlanPrice` ว่าง | `planPriceItems = []` → ไม่แสดง |
| `planQty = 0` หรือ null | ใช้ 1 เป็น default |
| มี `ProductCostDetail` อยู่แล้ว | `PriceTransactions` ใช้จาก JSON ตามเดิม, `PlanPriceItems` ยังแสดงอยู่ (แยกกัน) |

---

## Verification

1. Build backend → ไม่มี error
2. GET `StockProduct/Get` → response มี `planPriceItems[]`
3. เปิด appraisal form → ค้นหาสินค้าที่มี WO
4. ตรวจสอบ section "ต้นทุนจากแผนผลิต (อ้างอิง)" แสดงขึ้นมา
5. ตรวจข้อมูล: Gold, Gem, Worker, Embed, ETC ครบ
6. Footer: ต้นทุนรวม + ต้นทุนต่อชิ้น ถูกต้อง
7. สินค้าที่ไม่มี WO → section ไม่แสดง

---

*Last updated: 2026-02-24 — รอ confirm ก่อน implement*

---
---

# (Archive) Plan: PDF Builders — ขยาย Image + CIF Toggle (✅ Completed)

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
