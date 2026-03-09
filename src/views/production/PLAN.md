# Plan: แผนกแต่ง (Status 50) รองรับการใส่วัสดุ

## เป้าหมาย

ให้แผนกแต่ง (status = 50) สามารถใส่วัสดุ (gems) ได้เหมือนกับแผนกคัดพลอย (status = 70)
**แสดง gem table ทุก plan ที่อยู่ใน status 50 — user จะใส่เองตามความเหมาะสม**

---

## วิเคราะห์สถานะปัจจุบัน

### API ที่ใช้ใน `update-process-view.vue`

| กรณี | Endpoint |
|------|---------|
| บันทึกงาน status 50/60/70/80/90/100 | `POST ProductionPlan/ProductionPlanUpdateStatusDetail` |
| บันทึกงาน status 500 | `POST ProductionPlan/ProductionPlanAddStatusDetail` |
| ค้นหาช่าง | `POST Worker/Search` |
| ค้นหาพลอย | `POST StockGem/Search` |

**ข้อสังเกต**: ใน `submit()` ของ `update-process-view.vue` ทุก status ส่ง `gems: [...this.gemAssign]` ไปแล้วเสมอ แต่ backend ไม่ process ให้ status 50

### GET endpoint — ส่ง `TbtProductionPlanStatusGem` ให้ทุก status

Backend `NewProductionPlanGet` map `TbtProductionPlanStatusDetailGem` เป็น `TbtProductionPlanStatusGem` ให้ทุก status header (ไม่ได้ filter เฉพาะ status 70) ดังนั้น:
- ถ้า status 50 มี gem records → API จะส่งมาให้ frontend อยู่แล้ว
- ถ้ายังไม่มี gem records → จะได้ `TbtProductionPlanStatusGem: []` (empty list)

### Frontend gem section ปัจจุบัน

**`update-process-view.vue`**:
- Line 304: `v-if="status === 70"` → gem input table ไม่แสดงสำหรับ status 50
- Line 720: `if (this.status === 70 && value.tbtProductionPlanStatusGem)` → ไม่โหลด gem data

**`plan-process-view.vue`**:
- Line 205: `v-if="status === 70"` → gem display section ไม่แสดงสำหรับ status 50

### Backend switch case ปัจจุบัน

```csharp
case ProductionPlanStatusEnum.Casting:   // 50
case ProductionPlanStatusEnum.Scrub:     // 60
case ProductionPlanStatusEnum.Embed:     // 80
case ProductionPlanStatusEnum.Plated:    // 90
    await HandleProductionWoker(header, request, addStatusItems);
    break;
```

`HandleProductionWoker` ใช้ `RemoveExistingHeaderDetail` (ลบแค่ StatusDetail) + `CreateProductionHeaderDetail`
— **ไม่ลบ** และ **ไม่บันทึก** gem records ใดๆ

### Request model — ไม่ต้องเปลี่ยน

`ProductionPlanStatusUpdateRequest` มี `List<GemItem>? Gems` อยู่แล้ว

---

## Condition ใหม่

```
v-if="status === 70 || status === 50"
```

---

## Files ที่เปลี่ยนแปลง

| File | Action |
|------|--------|
| `plan-view/modal/update-process-view.vue` | **แก้ไข** — แก้ v-if + แก้ initForm |
| `plan-view/components/plan-process-view.vue` | **แก้ไข** — แก้ v-if |
| `Jewelry.Service/ProductionPlan/ProductionPlanService.cs` | **แก้ไข** — case Casting เพิ่ม gem handling |

---

## 1. `update-process-view.vue`

### แก้ `initForm()` — line 720

```javascript
// เดิม:
if (this.status === 70 && value.tbtProductionPlanStatusGem) {

// ใหม่:
if ((this.status === 70 || this.status === 50) && value.tbtProductionPlanStatusGem) {
```

### แก้ template gem table — line 304

```html
<!-- เดิม: -->
<div class="form-col-container mt-3" v-if="status === 70">

<!-- ใหม่: -->
<div class="form-col-container mt-3" v-if="status === 70 || status === 50">
```

---

## 2. `plan-process-view.vue`

### แก้ template gem display section — line 205

```html
<!-- เดิม: -->
<div v-if="status === 70">

<!-- ใหม่: -->
<div v-if="status === 70 || status === 50">
```

---

## 3. `ProductionPlanService.cs`

### แก้ switch case สำหรับ Casting (status 50)

ต้อง:
1. แยก `case Casting` ออกจาก `case Scrub/Embed/Plated`
2. ยังคง call `HandleProductionWoker` (gold handling เหมือนเดิม)
3. เพิ่ม gem handling หลังจาก golds ถูก save แล้ว

```csharp
// เดิม:
case ProductionPlanStatusEnum.Casting:   // 50
case ProductionPlanStatusEnum.Scrub:     // 60
case ProductionPlanStatusEnum.Embed:     // 80
case ProductionPlanStatusEnum.Plated:    // 90
    await HandleProductionWoker(header, request, addStatusItems);
    break;

// ใหม่:
case ProductionPlanStatusEnum.Casting:   // 50
    await HandleProductionWoker(header, request, addStatusItems);
    if (request.Gems?.Any() == true)
    {
        // ลบ gem records เดิมออกก่อน (HandleProductionWoker ลบแค่ StatusDetail ไม่ลบ gems)
        var existingGems = header.TbtProductionPlanStatusDetailGem.ToList();
        if (existingGems.Any())
        {
            _jewelryContext.TbtProductionPlanStatusDetailGem.RemoveRange(existingGems);
            await _jewelryContext.SaveChangesAsync();
            header.TbtProductionPlanStatusDetailGem.Clear();  // clear in-memory collection
        }
        await HandleGemDetails(header, request, addStatusItemGems, updateStatusItemGems);
    }
    break;

case ProductionPlanStatusEnum.Scrub:     // 60
case ProductionPlanStatusEnum.Embed:     // 80
case ProductionPlanStatusEnum.Plated:    // 90
    await HandleProductionWoker(header, request, addStatusItems);
    break;
```

**เหตุผลที่ต้องทำแบบนี้**:
- `HandleProductionWoker` เรียก `RemoveExistingHeaderDetail` → ลบแค่ `TbtProductionPlanStatusDetail`
- `HandleProductionGems` เรียก `RemoveExistingDetailsAndGems` → ลบทั้ง detail + gems (แต่ใช้ `CreateReceiveStatusDetail` ซึ่งต่างจาก Casting ที่ใช้ `CreateProductionHeaderDetail`)
- การใช้ `HandleProductionGems` สำหรับ status 50 จะเปลี่ยน gold creation logic → **ห้ามทำ**
- วิธีที่ถูกต้องคือ: คง `HandleProductionWoker` ไว้ + เพิ่ม gem handling แยกต่างหาก

---

## ไม่เปลี่ยนแปลง

- `ProductionPlanStatusUpdateRequest.cs` — มี `Gems` field อยู่แล้ว
- `ProductionPlanStatus.cs` — enum/constants ไม่ต้องแก้
- `submit()` ใน `update-process-view.vue` — ส่ง `gems: [...this.gemAssign]` อยู่แล้วทุก status
- UI/UX ของ gem table — ใช้เหมือนกับ status 70 ทุกอย่าง

---

*สร้าง: 2026-03-09 | อัปเดต: 2026-03-09 (เพิ่มการวิเคราะห์ API + backend logic) — รอ confirm ก่อน implement*
