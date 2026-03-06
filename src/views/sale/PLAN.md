# Plan: ลบใบสั่งขาย (Inactive Sale Order)

## ผลการวิเคราะห์

### ปุ่ม "ลบใบสั่งขาย"

| View | สถานะ |
|------|-------|
| `sale-order-view.vue` (Web) | ❌ มีปุ่มแต่ไม่มี `@click`, class ผิด (`btn-outline-main` → `btn-red`) |
| `detail-view.vue` (Mobile) | ❌ ยังไม่มีปุ่ม |

**ทั้งสองใช้ `saleOrderStore` = `usrSaleOrderApiStore()` เหมือนกัน**

### Status field (TbtSaleOrder)

| Status | StatusName | ความหมาย |
|--------|-----------|---------|
| `1` | `"DK-SO"` | Active |
| `0` | `"Inactive"` | Inactive (ซ่อนจาก list) |

### Business Rules

| State ของ SO | Action |
|-------------|--------|
| ยังไม่มีเลขที่ (draft ใหม่) | clear form เท่านั้น — ไม่ call API |
| มีเลขที่ + มี confirmed items (Invoice = null) | confirmSubmit แจ้ง → **auto-unconfirm + inactive ใน 1 transaction** |
| มีเลขที่ + ไม่มี confirmed/invoiced items | confirmSubmit → inactive SO |
| มี invoiced items (Invoice != null) | ❌ warning — ห้าม inactive |

### Backend Inactive() logic (1 transaction)

```
1. Find TbtSaleOrder by SoNumber
2. AnyAsync TbtSaleOrderProduct WHERE Invoice != null → throw error
3. Get all TbtSaleOrderProduct WHERE Invoice = null (confirmed, no invoice)
   → ทุก record: TbtStockProduct.QtySale -= Qty (restore) + Remove record
4. TbtSaleOrder.Status = 0, StatusName = "Inactive", UpdateDate, UpdateBy
5. SaveChangesAsync() + CommitAsync()
```

---

## แผน

### Backend — 5 ไฟล์

#### 1. สร้าง `jewelry.Model/Sale/SaleOrder/Inactive/Request.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace jewelry.Model.Sale.SaleOrder.Inactive
{
    public class Request
    {
        [Required]
        public string SoNumber { get; set; } = null!;
    }
}
```

#### 2. `ISaleOrderService.cs` — เพิ่ม method

```csharp
Task<bool> Inactive(jewelry.Model.Sale.SaleOrder.Inactive.Request request);
```

#### 3. `SaleOrderService.cs` — implement `Inactive()` + แก้ `List()`

**`Inactive()`:**
```csharp
public async Task<bool> Inactive(jewelry.Model.Sale.SaleOrder.Inactive.Request request)
{
    var saleOrder = await _jewelryContext.TbtSaleOrder
        .FirstOrDefaultAsync(x => x.SoNumber == request.SoNumber);

    if (saleOrder == null)
        throw new HandleException($"Sale Order {request.SoNumber} not found.");

    var hasInvoicedItems = await _jewelryContext.TbtSaleOrderProduct
        .AnyAsync(x => x.SoNumber == request.SoNumber && !string.IsNullOrEmpty(x.Invoice));
    if (hasInvoicedItems)
        throw new HandleException($"ไม่สามารถยกเลิกใบสั่งขาย {request.SoNumber} ได้ เนื่องจากมีสินค้าที่ออก Invoice แล้ว");

    using var transaction = await _jewelryContext.Database.BeginTransactionAsync();
    try
    {
        var now = DateTime.UtcNow;

        var confirmedProducts = await _jewelryContext.TbtSaleOrderProduct
            .Where(x => x.SoNumber == request.SoNumber && string.IsNullOrEmpty(x.Invoice))
            .ToListAsync();

        foreach (var product in confirmedProducts)
        {
            var stockProduct = await _jewelryContext.TbtStockProduct
                .FirstOrDefaultAsync(s => s.StockNumber == product.StockNumber);
            if (stockProduct != null)
            {
                stockProduct.QtySale -= product.Qty;
                stockProduct.UpdateDate = now;
                stockProduct.UpdateBy = CurrentUsername;
                _jewelryContext.TbtStockProduct.Update(stockProduct);
            }
            _jewelryContext.TbtSaleOrderProduct.Remove(product);
        }

        saleOrder.Status = 0;
        saleOrder.StatusName = "Inactive";
        saleOrder.UpdateDate = now;
        saleOrder.UpdateBy = CurrentUsername;

        await _jewelryContext.SaveChangesAsync();
        await transaction.CommitAsync();
        return true;
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        throw new HandleException($"Error inactivating sale order: {ex.Message}");
    }
}
```

**`List()` — เพิ่ม default filter:**
```csharp
// เดิม:
var query = from saleOrder in _jewelryContext.TbtSaleOrder
            select new ...
// ใหม่:
var query = from saleOrder in _jewelryContext.TbtSaleOrder
            where saleOrder.Status > 0
            select new ...
```

#### 4. `SaleOrderController.cs` — เพิ่ม endpoint

```csharp
[Route("Inactive")]
[HttpPost]
[ProducesResponseType((int)System.Net.HttpStatusCode.OK, Type = typeof(bool))]
[ProducesResponseType((int)System.Net.HttpStatusCode.Unauthorized)]
public async Task<IActionResult> Inactive([FromBody] jewelry.Model.Sale.SaleOrder.Inactive.Request request)
{
    try
    {
        var response = await _service.Inactive(request);
        return Ok(response);
    }
    catch (HandleException ex)
    {
        return BadRequest(new NotFoundResponse() { Message = ex.Message });
    }
}
```

---

### Frontend — 3 ไฟล์

#### 1. `sale-order-store.js` — เพิ่ม `fetchInactive`

```javascript
async fetchInactive({ soNumber }) {
  return await api.jewelry.post('SaleOrder/Inactive', { soNumber })
}
```

---

#### 2. `sale-order-view.vue` (Web) — 2 จุด

**Fix button (line ~1551):**
```html
<!-- เดิม: -->
<button class="btn btn-outline-main mr-2" type="button" style="width: 200px">

<!-- ใหม่: -->
<button class="btn btn-red mr-2" type="button" style="width: 200px"
        @click="inactiveSaleOrder()">
```

**เพิ่ม method `inactiveSaleOrder()`:**
```javascript
inactiveSaleOrder() {
  if (!this.hasSaleOrderNumber) {
    confirmSubmit('ต้องการยกเลิกการสร้างใบสั่งขายนี้หรือไม่?', 'ยืนยันการยกเลิก', () => {
      this.clearForm()
      success('ยกเลิกการสร้างใบสั่งขายแล้ว')
    })
    return
  }

  if (this.invoiceItemsCount > 0) {
    warning(
      'ไม่สามารถลบใบสั่งขายได้ เนื่องจากมีสินค้าที่ออก Invoice แล้ว กรุณายกเลิก Invoice ก่อน',
      'ไม่สามารถลบได้'
    )
    return
  }

  const msg = this.confirmedStockItemsCount > 0
    ? `ใบสั่งขาย ${this.formSaleOrder.number} มีสินค้าที่ยืนยันแล้ว ${this.confirmedStockItemsCount} รายการ\nระบบจะยกเลิกการยืนยันสินค้าทั้งหมดและลบใบสั่งขายนี้ ต้องการดำเนินการหรือไม่?`
    : `ต้องการลบใบสั่งขายเลขที่ ${this.formSaleOrder.number} หรือไม่?`

  confirmSubmit(msg, 'ยืนยันการลบ', async () => {
    await this.saleOrderStore.fetchInactive({ soNumber: this.formSaleOrder.number })
    success('ลบใบสั่งขายสำเร็จ')
    this.$router.push({ path: '/sale-order-list' })
  })
}
```

> `confirmSubmit` มีอยู่ใน import แล้วที่ `sale-order-view.vue` — ไม่ต้องเพิ่ม import ใหม่

---

#### 3. `detail-view.vue` (Mobile) — 4 จุด

**จุดที่ 1 — เพิ่ม `confirmSubmit` ใน import:**
```javascript
// เดิม:
import { success, error, warning } from '@/services/alert/sweetAlerts.js'
// ใหม่:
import { success, error, warning, confirmSubmit } from '@/services/alert/sweetAlerts.js'
```

**จุดที่ 2 — เพิ่ม computed `confirmedStockItemsCount`:**
```javascript
confirmedStockItemsCount() {
  return this.stockItems.filter((item) => item.isConfirm && !item.isInvoice).length
}
```

**จุดที่ 3 — เพิ่มปุ่มใน template (view mode, หลัง "ออก Invoice" button):**
```html
<!-- Delete SO -->
<button
  class="mobile-btn mobile-btn-danger"
  @click="inactiveSaleOrder()"
>
  <i class="bi bi-trash"></i>
  ลบใบสั่งขาย
</button>
```

**จุดที่ 4 — เพิ่ม method `inactiveSaleOrder()` + style `.mobile-btn-danger`:**

Method:
```javascript
inactiveSaleOrder() {
  if (this.invoicedItems.length > 0) {
    warning(
      'ไม่สามารถลบใบสั่งขายได้ เนื่องจากมีสินค้าที่ออก Invoice แล้ว กรุณายกเลิก Invoice ก่อน',
      'ไม่สามารถลบได้'
    )
    return
  }

  const msg = this.confirmedStockItemsCount > 0
    ? `ใบสั่งขาย ${this.soData.soNumber} มีสินค้าที่ยืนยันแล้ว ${this.confirmedStockItemsCount} รายการ\nระบบจะยกเลิกการยืนยันสินค้าทั้งหมดและลบใบสั่งขายนี้ ต้องการดำเนินการหรือไม่?`
    : `ต้องการลบใบสั่งขายเลขที่ ${this.soData.soNumber} หรือไม่?`

  confirmSubmit(msg, 'ยืนยันการลบ', async () => {
    await this.saleOrderStore.fetchInactive({ soNumber: this.soData.soNumber })
    success('ลบใบสั่งขายสำเร็จ')
    this.$router.back()
  })
}
```

Style (เพิ่มใน `.action-buttons` scoped style):
```scss
.mobile-btn-danger {
  background: var(--base-red, #ff4d4d);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;

  &:active:not(:disabled) {
    opacity: 0.9;
  }
}
```

---

## Files ที่เปลี่ยนแปลง

### Backend

| File | Action |
|------|--------|
| `jewelry.Model/Sale/SaleOrder/Inactive/Request.cs` | **สร้างใหม่** |
| `Jewelry.Service/Sale/SaleOrder/ISaleOrderService.cs` | **แก้ไข** — เพิ่ม `Inactive` signature |
| `Jewelry.Service/Sale/SaleOrder/SaleOrderService.cs` | **แก้ไข** — implement `Inactive()` + `Status > 0` filter ใน `List()` |
| `Jewelry.Api/Controllers/Sale/SaleOrderController.cs` | **แก้ไข** — เพิ่ม `Inactive` endpoint |

### Frontend

| File | Action |
|------|--------|
| `src/stores/modules/api/sale/sale-order-store.js` | **แก้ไข** — เพิ่ม `fetchInactive` |
| `src/views/sale/sale-order/components/sale-order-view.vue` | **แก้ไข** — fix button + `inactiveSaleOrder()` |
| `src/views/mobile/sale/detail-view.vue` | **แก้ไข** — import + computed + button + method + style |

## ไม่เปลี่ยนแปลง

- Mobile: ไม่มี Case "draft ใหม่" เพราะ mobile detail-view โหลดจาก SO ที่มีเลขที่แล้วเสมอ
- Backend validate invoiced items ซ้ำเป็น safety net
- ปุ่มแสดงเสมอใน view mode (ไม่ซ่อน) — ใช้ alert อธิบายเหตุผลถ้าทำไม่ได้

*Updated: 2026-03-06 — เพิ่ม Mobile detail-view + auto-unconfirm logic*

---

# Plan: sale-order-pdf-integration.js

## สถานะปัจจุบัน — 3 call sites

| File | Method | Output |
|------|--------|--------|
| `sale-order-view.vue` | `exportPDF()` | `pdf.download('SO_xxx.pdf')` |
| `sale-order-view.vue` | `previewPDF()` | `pdf.open()` |
| `mobile/sale/detail-view.vue` | `handlePrintPDF()` | `pdf.download('SO_xxx_timestamp.pdf')` |

ทุกที่เรียก `new SaleOrderPdfBuilder(...)` ตรงๆ ต่างจาก quotation/invoice ที่มี integration wrapper

---

## แผน

### 1. สร้างไฟล์ใหม่: `src/services/helper/pdf/sale-order/sale-order-pdf-integration.js`

```javascript
import { SaleOrderPdfBuilder } from './sale-order-pdf-builder.js'

export async function generateSaleOrderPdf({
  soData, items, filename = 'sale-order.pdf',
  openInNewTab = false, currencyUnit = 'THB', currencyRate = 1, showCifLabel = true
}) {
  const pdfData = { ...soData, items }
  const builder = new SaleOrderPdfBuilder(pdfData, { currencyUnit, currencyRate, showCifLabel })
  await builder.preparePDF()
  const pdf = await builder.generatePDF()
  if (openInNewTab) { pdf.open() } else { pdf.download(filename) }
}
```

### 2. แก้ไข `sale-order-view.vue` — import + `exportPDF()` + `previewPDF()`

### 3. แก้ไข `mobile/sale/detail-view.vue` — import + `handlePrintPDF()` (ลบ try-catch)

## Files ที่เปลี่ยนแปลง

| File | Action |
|------|--------|
| `src/services/helper/pdf/sale-order/sale-order-pdf-integration.js` | **สร้างใหม่** |
| `src/views/sale/sale-order/components/sale-order-view.vue` | **แก้ไข** |
| `src/views/mobile/sale/detail-view.vue` | **แก้ไข** |
