# Production Plan View — Flow Documentation

*Updated: 2026-03-09*

---

## ภาพรวม

`plan-view/` คือหน้าจัดการแผนงานผลิต (Production Plan) แบบละเอียด เข้าถึงได้ผ่าน route `/production/plan/{id}` โดย `id` คือ ID ของ Production Plan ใน Database

**ID ที่ใช้**: ดึงจาก URL → `url.split('/').slice(-1)[0]`

---

## File Structure

```
plan-view/
├── index-view.vue                    # Orchestrator หลัก — จัดการ tabs, modals, fetch data
├── components/
│   ├── plan-view.vue                 # Tab 0: รายละเอียดแผนผลิต + รูปแม่พิมพ์
│   ├── plan-mat-view.vue             # Tab 1: วัสดุ (ทอง, พลอย, เพชร) + รายการเบิกผสมทอง
│   ├── plan-process-view.vue         # Tab 2-6, 8-9: รายละเอียดกระบวนการผลิตตามสถานะ
│   ├── plan-price-view.vue           # Tab 7: บัตรต้นทุน (Cost Card)
│   ├── plan-overview.vue             # Component ประวัติสถานะ (ใช้ใน mat + process modals)
│   └── plan-bom-view.vue             # Tab 10: BOM (ปิดอยู่ — commented out)
└── modal/
    ├── update-plan-view.vue          # Modal แก้ไขข้อมูล Header แผนผลิต
    ├── update-mat-view.vue           # Modal เพิ่ม/แก้ไขวัสดุ
    ├── update-process-view.vue       # Modal อัพเดตงานกระบวนการ (ทุก status)
    ├── update-price-view.vue         # Modal ประเมินบัตรต้นทุน
    ├── transfer-job-view.vue         # Modal โอนงาน (ย้ายไปแผนกอื่น)
    └── transfer-product-view.vue     # Modal โอนสินค้า (ปิดงาน → รับสินค้าเข้าคลัง)
```

---

## Stores ที่ใช้

| Store | File | ใช้เพื่อ |
|-------|------|---------|
| `usePlanSearchApiStore` | `plan-search-store.js` | fetchPlan, fetchMat, fetchGoldCostItem |
| `usePlanUpdateApiStore` | `plan-update-store.js` | submitTransfer (โอนงาน) |
| `usePlanBOMApiStore` | `plan/plan-bom-store.js` | BOM data |
| `useMasterApiStore` | `master-store.js` | masterData (gold, gem, planStatus, etc.) |

---

## Tab Navigation

| Tab Index | Label | Status Code | Component |
|-----------|-------|-------------|-----------|
| 0 | รายละเอียด | — | `plan-view.vue` |
| 1 | ทอง | — | `plan-mat-view.vue` |
| 2 | แต่ง | 50 | `plan-process-view.vue` |
| 3 | ขัดดิบ | 60 | `plan-process-view.vue` |
| 4 | คัดพลอย | 70 | `plan-process-view.vue` |
| 5 | ฝัง | 80 | `plan-process-view.vue` |
| 6 | ขัดชุบ | 90 | `plan-process-view.vue` |
| 7 | บัตรต้นทุน | — | `plan-price-view.vue` |
| 8 | สำเร็จ | 100 | `plan-process-view.vue` |
| 9 | หลอม | 500 | `plan-process-view.vue` |

> Tab 10 (BOM) และ Tab 11 (สถานะการผลิต) ถูก comment out ในปัจจุบัน

---

## Status Codes (Production Plan)

| Status | ความหมาย | UI Class |
|--------|---------|----------|
| 10 | กำลังดำเนินการ (ใบงานใหม่) | `box-status-process` |
| 49, 54, 59, 69, 79, 84, 89, 94 | In-between states (resting) | `box-status-process` |
| 50 | จ่ายแต่ง | `box-status-show` |
| 55, 85 | ขั้นกลาง | `box-status-process` |
| 60 | ขัดดิบ | `box-status-show` |
| 70 | คัดพลอย | `box-status-show` |
| 80 | ฝัง | `box-status-show` |
| 90 | ขัดชุบ | `box-status-show` |
| 95 | พร้อมทำบัตรต้นทุน | `box-status-process` |
| 100 | สำเร็จ | `box-status-success` |
| 500 | หลอม | `box-status-disable` |
| 9999 | In Process | `box-status-process` |

---

## Data Flow

### Initial Load (index-view.vue `created()`)

```
1. id = ดึงจาก URL → url.split('/').slice(-1)[0]
2. fetchPlan()   → GET  ProductionPlan/ProductionPlanGet?id=...
   → this.data   (plan header + tbtProductionPlanStatusHeader[])
3. fetchMat()    → POST ProductionPlan/ProductionPlanMateriaGet {id}
   → this.mat    (วัสดุ: ทอง, พลอย, เพชร)
4. fetchBOM()    → planBOMStore.fetchGet {id}
5. fetchTransactionBOM()
6. fetchDataGoldCostItem(planNumber) → POST ProductionPlanCost/ListGoldCostItem
   → this.gold   (รายการเบิกทอง)
7. Master data: productType, customerType, gold, goldSize, gem, gemShape, planStatus
```

### Data Model (this.data)

ข้อมูลจาก `ProductionPlanGet` มี nested objects:
- `data.wo`, `data.woNumber` — เลขที่ใบงาน
- `data.status`, `data.statusName` — สถานะปัจจุบัน
- `data.mold`, `data.moldSub` — รหัสแม่พิมพ์ (ใช้โหลดรูปจาก Azure Blob)
- `data.tbtProductionPlanStatusHeader[]` — array ของแต่ละ process stage
  - แต่ละ element: `{ status, createBy, createDate, workerCode, workerName, updateBy, updateDate, remark1, remark2, tbtProductionPlanStatusDetail[], tbtProductionPlanStatusGem[], wagesTotal }`
- `data.priceItems[]` — รายการบัตรต้นทุน

---

## แต่ละ Tab ทำงานอย่างไร

### Tab 0: รายละเอียด (`plan-view.vue`)

**แสดง**: รูปแม่พิมพ์ (Gallery), ข้อมูล WO, ลูกค้า, สินค้า, ทอง, หมายเหตุ

**Actions**:
| ปุ่ม | สิ่งที่เกิดขึ้น |
|------|--------------|
| PDF (OLD) | `FilePDFProductionPlanView` component |
| NEW (PDF) | `generatePDF()` → `FilePlanProduction` builder + Azure Blob URL |
| แก้ไข (🖌) | emit `onShowFormHeaderUpdate` → เปิด `update-plan-view.vue` modal |
| ลบ (🗑) | emit `onMeltJob` → `confirmSubmit` dialog (ไม่มี API call ปัจจุบัน) |
| CVD | `onCVDJob()` → 2-step transfer: status current → 95 → 100 |

**รูปภาพ**: โหลดจาก Azure Blob โดย `getAzureBlobUrl('Mold/{mold}-Mold.png')`
**CVD สามารถทำได้**: status 10, 49, 50, 59, 60, 69, 70, 79, 80, 85, 89, 90

---

### Tab 1: ทอง (`plan-mat-view.vue`)

**แสดง**:
1. ตาราง `modelMatValue` — วัสดุแผน (ทอง/พลอย/เพชร per บรรทัด)
2. ตาราง `modelGoldItem` — รายการเบิกผสมทอง (จาก `ProductionPlanCost/ListGoldCostItem`)
3. `plan-overview.vue` — ประวัติสถานะ

**Actions**:
| ปุ่ม | สิ่งที่เกิดขึ้น |
|------|--------------|
| + (เพิ่ม) | emit `onShowFormMaterialUpdate` → เปิด `update-mat-view.vue` modal |
| 🗑 (ลบแถว) | `confirmSubmit` → POST `ProductionPlan/ProductionPlanDeleteMaterial` |

---

### Tab 2-6, 8-9: Process Tabs (`plan-process-view.vue`)

Component เดียวรับ `status` prop ตาม tab → ดึงข้อมูลจาก `data.tbtProductionPlanStatusHeader.find(x => x.status === props.status)`

**แสดง**:
- ผู้โอนงาน, วันโอนงาน, ช่างรับงาน, ผู้แก้ไขล่าสุด
- ตารางรายละเอียดงาน (`tbtProductionPlanStatusDetail`) — คอลัมน์ต่างกันตาม status
- เฉพาะ Tab 4 (status 70): ตารางพลอย (`tbtProductionPlanStatusGem`) + ปุ่ม export CSV

**คอลัมน์ตารางตาม status**:
| Status | คอลัมน์พิเศษ |
|--------|-------------|
| 50 (แต่ง) | จ่าย/รับ qty+weight + น้ำหนักขาด/เกิน + ช่างรับงาน + ค่าแรง |
| 60 (ขัดดิบ) | จ่าย/รับ qty+weight + น้ำหนักขาด/เกิน + ช่าง + ค่าแรง |
| 70 (คัดพลอย) | ช่างคัดพลอย + ช่างคัดเพชร + จำนวน/น้ำหนัก (ไม่มีค่าแรง) |
| 80 (ฝัง) | จำนวนจ่าย[ชิ้น] + จำนวนฝัง[เม็ด] + ช่าง + ค่าแรง |
| 90 (ขัดชุบ) | เหมือน 50 แต่มีคอลัมน์ "ช่างขัด" + "ช่างชุบ" |
| 100/500 | disable ปุ่ม transfer/update |

**Button State Logic (`checkBtn()`)**:
- `transfer` active: เฉพาะเมื่อ `model.status === tab.status` (แผนอยู่ที่ขั้นตอนนี้พอดี)
- `update` active: เฉพาะเมื่อมี `data.createBy` (มีข้อมูลอยู่แล้ว)
- `print` active: เฉพาะ status 80 (ฝัง) สำหรับพิมพ์สลิปฝัง
- ทุกปุ่ม disable เมื่อ `model.status` เป็น 100 หรือ 500 (ยกเว้น print ฝัง)

**Actions**:
| ปุ่ม | สิ่งที่เกิดขึ้น |
|------|--------------|
| 🖨 (พิมพ์) | เลือก gold/worker group → `EmbedSlipPdfBuilder` → PDF open |
| ↕ (โอนงาน) | emit `transfer` → เปิด `transfer-job-view.vue` modal |
| 🖌 (แก้ไข) | emit `onShowUpdate` → เปิด `update-process-view.vue` modal |
| CSV (tab 70) | `exportGemCsv()` → ExcelHelper export |

---

### Tab 7: บัตรต้นทุน (`plan-price-view.vue`)

**แสดง**: DataTable ของ `data.priceItems` จัดกลุ่มตาม `nameGroup` พร้อม sub-total และ grand total

**Groups**:
| nameGroup | ชื่อไทย |
|-----------|--------|
| Gold | รายการทอง |
| Gem | รายการวัถุดิบ |
| Worker | รายการงานช่าง |
| Embed | รายการงานฝัง |
| ETC | รายการเพิ่มเติม |

**Button State**:
- `add` (ประเมิน) active: status 94, 95, 100
- `success` (โอนสินค้า) active: เฉพาะเมื่อ `model.status === 95`
- PDF buttons: active เมื่อมี priceItems (`isMakePrice`)

**Actions**:
| ปุ่ม | สิ่งที่เกิดขึ้น |
|------|--------------|
| 🛒 (โอนสินค้า) | emit `receipt` → `onTransferProduct()` → เปิด `transfer-product-view.vue` modal |
| PDF ราคา | `FilePDFProductionPlanPrice` component |
| PDF BOM | `FilePDFProductionPlanBOM` component (Gold + Gem เท่านั้น) |
| + (ประเมิน) | emit `onShowAdd` → เปิด `update-price-view.vue` modal |

---

## Modals

### `update-plan-view.vue` — แก้ไขข้อมูล Header

**เปิดเมื่อ**: tab 0 → คลิกปุ่มแก้ไข
**ส่ง API**: POST `ProductionPlan/ProductionPlanUpdateHeader`
**หลัง save**: `fetchData('plan')` → กลับ tab 0

---

### `update-mat-view.vue` — เพิ่ม/แก้ไขวัสดุ

**เปิดเมื่อ**: tab 1 → คลิก +
**ข้อมูล**: เลือก gold (type + size) + gem (type + shape + size) + diamond
**ส่ง API**: POST `ProductionPlan/ProductionPlanUpdateMaterial`
**หลัง save**: `fetchData('mat')` → กลับ tab 1

---

### `update-process-view.vue` — อัพเดตรายละเอียดงาน

**เปิดเมื่อ**: process tab → คลิกปุ่มแก้ไข
**ข้อมูล**: ช่างรับงาน (AutoComplete) + DataTable ทอง (row-edit) + DataTable พลอย (เฉพาะ status 70) + หมายเหตุ 1/2
**Logic พิเศษ**:
- status 500 (หลอม): ใช้ endpoint `ProductionPlanAddStatusDetail` แทน `ProductionPlanUpdateStatusDetail`
- `initForm()`: โหลดข้อมูลเดิมจาก `tbtProductionPlanStatusHeader` + resolve ชื่อช่างจาก code ผ่าน `Worker/Search`

**ส่ง API**:
- POST `ProductionPlan/ProductionPlanUpdateStatusDetail` (status 50/60/70/80/90/100)
- POST `ProductionPlan/ProductionPlanAddStatusDetail` (status 500)
- ค้นหาช่าง: POST `Worker/Search`
- ค้นหาพลอย: POST `StockGem/Search`

---

### `update-price-view.vue` — ประเมินบัตรต้นทุน

**เปิดเมื่อ**: tab 7 → คลิก +
**เปิด modal**: GET `ProductionPlan/GetAllTransectionPrice?wo=...&woNumber=...` → โหลด transaction เดิม
**แก้ไข**: qty, qtyPrice, qtyWeight, qtyWeightPrice แต่ละรายการ (totalPrice คำนวณอัตโนมัติ)
**เพิ่ม**: เลือก group (Gold/Gem/Worker/Embed/ETC) แล้วกด +
**ส่ง API**: POST `ProductionPlan/CreatePrice`

---

### `transfer-job-view.vue` — โอนงาน

**เปิดเมื่อ**: process tab → คลิกปุ่ม ↕
**ข้อมูล**: เลือกแผนกปลายทาง (dropdown) + ช่างรับงาน (ยกเว้น status 95)
**Filter status ที่ไม่อนุญาต**: 10, 49, 55, 59, 69, 79, 84, 85, 89, 94, 100, 500, และ status ที่มีข้อมูลอยู่แล้ว
**Validation**: ห้าม transfer ไป status 49, 54, 55, 59, 69, 79, 84, 85, 94, 500
**ส่ง API**: POST `Production/Plan/Transfer` (via `usePlanUpdateApiStore.submitTransfer`)

---

### `transfer-product-view.vue` — โอนสินค้า

**เปิดเมื่อ**: tab 7 เมื่อ `model.status === 95`
**เงื่อนไข**: status ต้องเป็น 95 เท่านั้น (validate ก่อน submit)
**ส่ง API**: POST `Production/Plan/Transfer` — `{ formerStatus: 95, targetStatus: 100, selectedItems }`
**หลัง save**: `success('เลขที่แผนรับสินค้า: xxx')` → emit `fetch(receiptNumber)` → `$router.push({ name: 'goods-receipt-production', params: { id: receiptNumber } })`

---

## API Quick Reference

| Method | Endpoint | ใช้ที่ | หน้าที่ |
|--------|----------|-------|--------|
| GET | `ProductionPlan/ProductionPlanGet` | index-view | โหลด plan header + status details |
| POST | `ProductionPlan/ProductionPlanMateriaGet` | index-view | โหลดวัสดุ |
| POST | `ProductionPlanCost/ListGoldCostItem` | index-view | รายการเบิกทอง |
| POST | `ProductionPlan/ProductionPlanUpdateHeader` | update-plan-view | แก้ไข header |
| POST | `ProductionPlan/ProductionPlanUpdateMaterial` | update-mat-view | เพิ่ม/แก้วัสดุ |
| POST | `ProductionPlan/ProductionPlanDeleteMaterial` | plan-mat-view | ลบวัสดุ |
| POST | `ProductionPlan/ProductionPlanUpdateStatusDetail` | update-process-view | อัพเดตงาน (50/60/70/80/90/100) |
| POST | `ProductionPlan/ProductionPlanAddStatusDetail` | update-process-view | เพิ่มงาน (500 หลอม) |
| POST | `ProductionPlan/ProductionPlanDeleteStatusDetail` | plan-price-view | ลบรายการงาน |
| POST | `Production/Plan/Transfer` | transfer-job/product | โอนงาน/โอนสินค้า |
| GET | `ProductionPlan/GetAllTransectionPrice` | update-price-view | โหลด transaction บัตรต้นทุน |
| POST | `ProductionPlan/CreatePrice` | update-price-view | บันทึกบัตรต้นทุน |
| POST | `Worker/Search` | modals | ค้นหาช่าง |
| POST | `StockGem/Search` | update-process-view | ค้นหาพลอย (tab คัดพลอย) |

---

## Production Workflow สรุป

```
สร้างแผนผลิต (status 10)
    ↓ โอนงาน (transfer-job-view)
จ่ายแต่ง (status 50)
    ↓ แก้ไขรายละเอียด (update-process-view) + โอนงาน
ขัดดิบ (status 60)
    ↓
คัดพลอย (status 70)     [มีตารางพลอย + export CSV]
    ↓
ฝัง (status 80)          [มีปุ่มพิมพ์สลิปฝัง]
    ↓
ขัดชุบ (status 90)
    ↓ โอนงาน
พร้อมทำต้นทุน (status 95)
    ↓ ประเมินบัตรต้นทุน (update-price-view)
    ↓ โอนสินค้า (transfer-product-view)
สำเร็จ (status 100) → redirect: goods-receipt-production/{receiptNumber}

กรณีพิเศษ:
- ทุก status (ที่อนุญาต) → โอนไปหลอม (status 500)
- ทุก status (ที่อนุญาต) → CVD → 2-step: current → 95 → 100 (จาก plan-view.vue)
```

---

## หมายเหตุ

- **BOM Tab (10)**: ถูก comment out ใน tabItems แล้ว แต่ logic ยังอยู่ใน index-view
- **`isUpdate` object**: ใช้ควบคุม modal visibility — `onCloseModal()` reset ทุก flag เป็น `false`
- **`keep-alive`**: ใช้กับ `planView` และ `planViewUpdate` เพื่อ preserve component state
- **Image Gallery**: `GalleryView.vue` รับ array ของ Azure Blob URL (รองรับ `mold` และ `moldSub`)
- **CVD flow**: 2-step transfer ใน `processCVDJob()` — step1: current → 95, step2: 95 → 100 โดยไม่ผ่าน modal, emit `onCVDJob` → `fetchData('plan')`
