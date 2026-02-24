# Plan: CustomStockInfo — บันทึกลง DB + UI Form + PDF Callers

## Background / คำถาม

`AppraisalHistoryPdfBuilder` รองรับ `options.customStockInfo = [{label, value}]` แล้ว
แต่ยังไม่มีที่ให้ user กรอก และยังไม่ถูก save ลง DB

**คำถาม**: `appraisal-form-view.vue` ต้องแก้ไมหม? และต้องเพิ่ม field อะไรใน DB?

**คำตอบ**: YES ทั้งคู่ — ต้องเพิ่ม column ใน DB + แก้ form + อัปเดต backend ทุก layer

---

## การวิเคราะห์ปัจจุบัน

### DB / Backend
- `tbt_stock_cost_version` ไม่มี column `custom_stock_info` — ต้องเพิ่ม
- `TbtStockCostVersion.cs` (EF model) ไม่มี property นี้
- Scaffold ทำไม่ได้ → ต้องแก้ manual ทุก layer
- Layer ที่ต้องแก้: EF Model → Request DTO → Response DTOs (3 ไฟล์) → ProductService

### Frontend
- `appraisal-form-view.vue`: ยังไม่มี UI กรอก customStockInfo
- `fetchSave()`: ยังไม่ส่ง customStockInfo ไปที่ API
- PDF Callers (cost-version-list-view + callers อื่นๆ): ยังไม่ pass `customStockInfo` ให้ Builder

---

## Files ที่จะแก้ไข

| Layer | File | Action |
|-------|------|--------|
| **DB** | PostgreSQL `tbt_stock_cost_version` | เพิ่ม column `custom_stock_info TEXT NULL` (SQL ด้านล่าง) |
| **EF Model** | `Jewelry.Data/Models/Jewelry/TbtStockCostVersion.cs` | เพิ่ม property |
| **Request DTO** | `jewelry.Model/Stock/Product/AddProductCost/Request.cs` | เพิ่ม field + inner class |
| **Response DTO** | `jewelry.Model/Stock/Product/GetCostVersion/Response.cs` | เพิ่ม field |
| **Response DTO** | `jewelry.Model/Stock/Product/ListProductCost/Response.cs` | เพิ่ม field |
| **Response DTO** | `jewelry.Model/Stock/Product/ListCostVersion/Response.cs` | เพิ่ม field |
| **Service** | `Jewelry.Service/Stock/Product/ProductService.cs` | serialize + deserialize ใน 3 methods |
| **Vue Form** | `src/views/sale/cost-stock/web/cost-edit/components/appraisal-form-view.vue` | เพิ่ม UI section + fetchSave |
| **Vue PDF** | `src/views/sale/cost-stock/web/cost-edit/components/cost-version-list-view.vue` | pass customStockInfo ให้ Builder |
| **Docs** | `src/views/sale/SALES_FLOW.md` | อัปเดต |

---

## Part A — SQL Migration (manual — scaffold ไม่ได้)

```sql
ALTER TABLE tbt_stock_cost_version
ADD COLUMN custom_stock_info TEXT NULL;
```

> User ต้อง run SQL นี้ใน PostgreSQL ก่อน implement backend

---

## Part B — Backend (C#)

### B1. EF Model `TbtStockCostVersion.cs`

เพิ่ม property 1 บรรทัด:

```csharp
public string? CustomStockInfo { get; set; }
```

---

### B2. Request DTO `AddProductCost/Request.cs`

เพิ่ม field และ inner class:

```csharp
// ใน class Request:
public List<CustomStockInfoItem>? CustomStockInfo { get; set; }

// inner class ใหม่:
public class CustomStockInfoItem
{
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
```

---

### B3. Response DTOs — เพิ่ม field เดียวกันใน 3 ไฟล์

**`GetCostVersion/Response.cs`**, **`ListProductCost/Response.cs`**, **`ListCostVersion/Response.cs`** — เพิ่มใน Response class:

```csharp
public List<CustomStockInfoItem>? CustomStockInfo { get; set; }

// inner class (เพิ่มใน namespace เดียวกัน):
public class CustomStockInfoItem
{
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
```

---

### B4. ProductService.cs — แก้ 3 methods

**`AddProductCostDeatialVersion`** — serialize และ save:

```csharp
// ใน TbtStockCostVersion initializer เพิ่ม:
CustomStockInfo = request.CustomStockInfo != null && request.CustomStockInfo.Any()
    ? JsonSerializer.Serialize(request.CustomStockInfo, options)
    : null,
```

**`GetCostVersion`** — deserialize และ return:

```csharp
// ใน Response initializer เพิ่ม:
CustomStockInfo = !string.IsNullOrEmpty(costVersion.CustomStockInfo)
    ? JsonSerializer.Deserialize<List<jewelry.Model.Stock.Product.GetCostVersion.CustomStockInfoItem>>(costVersion.CustomStockInfo, options)
    : null,
```

**`GetProductCostDetailVersion`** (ListProductCost) — เพิ่มใน select:

```csharp
CustomStockInfo = !string.IsNullOrEmpty(item.CustomStockInfo)
    ? JsonSerializer.Deserialize<List<jewelry.Model.Stock.Product.ListProductCost.CustomStockInfoItem>>(item.CustomStockInfo, options)
    : null,
```

**`ListCostVersion`** — เพิ่มใน select:

```csharp
CustomStockInfo = !string.IsNullOrEmpty(item.CustomStockInfo)
    ? JsonSerializer.Deserialize<List<jewelry.Model.Stock.Product.ListCostVersion.CustomStockInfoItem>>(item.CustomStockInfo, options)
    : null,
```

---

## Part C — Frontend: appraisal-form-view.vue

### C1. ตอบคำถาม: form ต้องแก้ไหม?

**YES** — ต้องเพิ่ม UI section ใหม่ให้ user กรอก Custom Stock Info

### C2. UI Design

วาง section ใหม่ **ระหว่าง "ข้อมูลลูกค้า" และ "ประเมินราคาสินค้า"**:

```
┌─────────────────────────────────────────────────┐
│ 📋 ข้อมูลสินค้าแบบกำหนดเอง (Custom)             │
│ * ถ้ากรอก จะแสดงแทนข้อมูลสินค้าปกติใน PDF      │
│                                                   │
│ Label            Value                  [ลบ]     │
│ [____________]  [____________________]  [🗑]      │
│ [____________]  [____________________]  [🗑]      │
│                                                   │
│ [+ เพิ่มรายการ]                                   │
└─────────────────────────────────────────────────┘
```

### C3. Script changes

**data()**:
```javascript
customInfoItems: [],  // Array<{label: string, value: string}>
```

**Watcher** — load จาก stock data:
```javascript
// ใน watch.stock handler เพิ่ม:
this.customInfoItems = (val.customStockInfo || []).map(item => ({
  label: item.label || '',
  value: item.value || ''
}))
```

**Methods**:
```javascript
addCustomInfoItem() {
  this.customInfoItems.push({ label: '', value: '' })
},
removeCustomInfoItem(index) {
  this.customInfoItems.splice(index, 1)
},
```

**fetchSave()** — เพิ่มใน requestData:
```javascript
customStockInfo: this.customInfoItems.filter(i => i.label.trim())
  .map(i => ({ label: i.label.trim(), value: i.value.trim() })),
```

**store mapping** (ใน `usrStockProductApiStore`) — ตรวจสอบว่า `fetchAddProductCostDeatialVersion` ส่ง field ครบ — ถ้า store ทำ plain pass-through ก็ไม่ต้องแก้

### C4. Template

```html
<!-- หลัง Customer Info section, ก่อน Price Appraisal section -->
<div class="filter-container mt-3">
  <div class="vertical-center-container mb-2">
    <span class="title-text-lg bi bi-pencil-square mr-2"></span>
    <span class="title-text-lg">ข้อมูลสินค้าแบบกำหนดเอง (Custom)</span>
  </div>
  <div class="responsive-text-note mb-2">
    * ถ้ากรอก จะแสดงแทนข้อมูลสินค้าปกติใน PDF
  </div>

  <div v-for="(item, index) in customInfoItems" :key="index" class="custom-info-row mb-2">
    <input
      class="form-control form-control-sm"
      type="text"
      v-model="item.label"
      placeholder="หัวข้อ เช่น ชื่อสินค้า"
    />
    <input
      class="form-control form-control-sm"
      type="text"
      v-model="item.value"
      placeholder="ค่า เช่น แหวนทองคำ"
    />
    <button
      class="btn btn-sm btn-red"
      type="button"
      @click="removeCustomInfoItem(index)"
    >
      <i class="bi bi-trash"></i>
    </button>
  </div>

  <button class="btn btn-sm btn-main mt-1" type="button" @click="addCustomInfoItem">
    <i class="bi bi-plus mr-1"></i>เพิ่มรายการ
  </button>
</div>
```

**Style**:
```scss
.custom-info-row {
  display: flex;
  gap: 8px;
  align-items: center;

  input:first-child { width: 200px; flex-shrink: 0; }
  input:nth-child(2) { flex: 1; }
}
```

---

## Part D — Frontend: PDF Callers

4 callers ต้องอัปเดตให้ pass `customStockInfo` จาก version data:

### cost-version-list-view.vue (`onExportPDF`)

```javascript
// แก้จาก:
const pdfOptions = version.currencyUnit
  ? { currencyUnit: version.currencyUnit, currencyRate: version.currencyRate }
  : {}

// เป็น:
const pdfOptions = {
  ...(version.currencyUnit ? { currencyUnit: version.currencyUnit, currencyRate: version.currencyRate } : {}),
  ...(version.customStockInfo?.length ? { customStockInfo: version.customStockInfo } : {})
}
```

> อีก 3 callers (`cost-version-detail-modal.vue`, `cost-history-modal.vue`, `mobile/cost-version-detail/index-view.vue`) — ใช้ pattern เดียวกัน, ต้องอ่านไฟล์ก่อน implement เพื่อหา exact location

---

## Part E — Store check

ตรวจสอบ `src/stores/modules/api/stock/product-api.js`:
- `fetchAddProductCostDeatialVersion` ส่ง `formValue` ตรงๆ ไปที่ API — ถ้าเป็น plain pass-through ไม่ต้องแก้
- ถ้า store มี field mapping explicit → ต้องเพิ่ม `customStockInfo`

---

## Verification Steps

1. Run SQL migration บน DB
2. Build backend → ไม่มี compile error
3. เปิด appraisal form → section "ข้อมูลสินค้าแบบกำหนดเอง" ปรากฏ
4. เพิ่มรายการ label/value → กด "บันทึก" → ไม่ error
5. เปิด version list → Export PDF → PDF ใช้ custom fields แทน default stock info
6. ถ้าไม่ได้กรอก custom info → PDF แสดง default stock info ปกติ
7. บันทึกซ้ำ → custom info ถูก overwrite ถูกต้อง

---

## สรุปคำตอบ

| คำถาม | คำตอบ |
|--------|--------|
| `appraisal-form-view.vue` ต้องแก้ไหม? | **YES** — เพิ่ม Custom Stock Info section |
| DB ต้องเพิ่ม field อะไร? | `ALTER TABLE tbt_stock_cost_version ADD COLUMN custom_stock_info TEXT NULL;` |
| Scaffold ทำยังไง? | ไม่ต้อง scaffold — แก้ EF model manual 1 บรรทัด |
| Backend layers ที่ต้องแก้ | EF Model + 1 Request DTO + 3 Response DTOs + ProductService (3 methods) |
| Frontend layers ที่ต้องแก้ | appraisal-form-view + 4 PDF callers (+ store ถ้า explicit mapping) |

---

*Archive: แผนก่อนหน้า (AppraisalHistoryPdfBuilder 3 features) — ✅ Implemented แล้ว*
