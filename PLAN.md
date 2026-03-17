# PLAN.md

---

## [2026-03-16] ระบบจัดการเอกสารสินค้าประจำเดือน (Sale Document Management)

### สรุปสิ่งที่ต้องทำ

ระบบ upload / download / tag / ลบ เอกสาร PDF ประจำเดือนของฝ่ายขาย
เก็บไฟล์จริงที่ Azure Blob Storage และ metadata ที่ฐานข้อมูล

---

### ข้อเสนอแนะเพิ่มเติม

| รายการ | เหตุผล |
|---|---|
| **Preview PDF ในหน้าเว็บ** | คลิกดูได้เลยโดยไม่ต้อง download — เปิด blob URL ใน tab ใหม่ |
| **Tag สีต่างกัน** | แยกประเภทเอกสารให้เห็นชัด เช่น approved / pending |
| **Search ชื่อไฟล์ / tag** | กรอง client-side ช่วยหาเอกสารย้อนหลังเร็วขึ้น |
| **แสดง ผู้ upload / วันที่** | Audit trail |

---

## UI Style Pattern (ตาม saleorder-list)

จาก `saleorder-list` กำหนด pattern ดังนี้:

### index-view.vue
```vue
<template>
  <div class="app-container">
    <search v-model:modelForm="form" @search="onSearch" @clear="onClear" />
    <dataTable v-model:modelForm="search" @upload="onUpload" @tag="onEditTag" @delete="onDelete" />
    <uploadModal :isShowModal="isShow.upload" @close="closeModal" @saved="onSaved" />
    <tagModal :isShowModal="isShow.tag" :data="selectedDoc" @close="closeModal" @saved="onSaved" />
  </div>
</template>
<style>
@import '@/assets/scss/custom-style/standard-form.scss';
</style>
```

### search-view.vue
```
filter-container-searchBar
├── pageTitle (ชื่อหน้า + คำอธิบาย)
├── form-col-container
│   ├── เดือน (Dropdown 1-12)
│   ├── ปี (Dropdown)
│   └── ชื่อไฟล์ / tag (text input)
└── btn-submit-container
    ├── btn-main [🔍 ค้นหา]
    └── btn-dark [✕ ล้าง]
```
SCSS: `standard-search-bar` + `standard-form.scss`

### data-table-view.vue
```
BaseDataTable (DataTableWithPaging)
├── columns: ชื่อไฟล์, เดือน/ปี, Tags (badge), ผู้ upload, วันที่
└── action column:
    ├── btn-green  [👁 Preview]
    ├── btn-main   [⬇ Download]
    ├── btn-sub-main [🏷 Tag]
    └── btn-red    [🗑 ลบ]
```
SCSS: `standard-data-table` + `standard-form`

---

## โครงสร้างภาพรวม (Flow)

```
[UI] sale/document/index-view.vue
        ↓ upload PDF
[API] SaleDocument/Upload
        ↓ save file
[Azure Blob] Sale/Document/{year}/{month}/{uuid}_{filename}.pdf
        ↓ save metadata
[DB] tbt_sale_document
```

---

## ส่วนที่ 1 — Database

### Table: `tbt_sale_document`

| Column | Type | หมายเหตุ |
|---|---|---|
| `id` | SERIAL PK | |
| `file_name` | VARCHAR(500) | ชื่อไฟล์ต้นฉบับ |
| `blob_path` | VARCHAR(1000) | path ใน Azure เช่น `Sale/Document/2026/03/uuid_file.pdf` |
| `document_month` | INT | เดือน (1-12) |
| `document_year` | INT | ปี เช่น 2026 |
| `tags` | VARCHAR(500) | comma-separated เช่น `"approved,Q1"` |
| `remark` | VARCHAR(1000) | หมายเหตุ |
| `is_active` | BOOL | false = ลบแล้ว (soft delete) |
| `create_by` | VARCHAR(100) | |
| `create_date` | TIMESTAMPTZ | `DateTime.UtcNow` |
| `update_by` | VARCHAR(100) | |
| `update_date` | TIMESTAMPTZ | |

> ใช้ `DateTime.UtcNow` เสมอ (ตาม API CLAUDE.md)

---

## ส่วนที่ 2 — API (.NET)

### 2.1 Controller ใหม่: `SaleDocumentController`

**File**: `Jewelry.Api/Controllers/SaleDocumentController.cs`

| Endpoint | Method | หน้าที่ |
|---|---|---|
| `SaleDocument/Upload` | POST (multipart/form-data) | Upload PDF + บันทึก metadata |
| `SaleDocument/List` | GET | ดึงรายการ filter ตาม month/year |
| `SaleDocument/Download/{id}` | GET | Download ไฟล์ (return FileStreamResult) |
| `SaleDocument/UpdateTag` | PUT | แก้ไข tags + remark |
| `SaleDocument/Delete/{id}` | PUT | Soft delete (is_active = false) |

### 2.2 Service: `ISaleDocumentService` / `SaleDocumentService`

**File**: `Jewelry.Service/SaleDocument/SaleDocumentService.cs`

**Upload flow**:
```
1. รับ IFormFile + month + year + tags + remark
2. สร้าง blobFileName = {uuid}_{original_name}.pdf
3. _azureBlobService.UploadImageAsync(stream, "Sale/Document/{year}/{month}", blobFileName)
4. บันทึก metadata → tbt_sale_document
5. return id + blobPath
```

**Download flow**:
```
1. ดึง record จาก DB ด้วย id
2. _azureBlobService.DownloadImageAsync(folder, fileName)
3. return FileStreamResult("application/pdf")
```

### 2.3 Models (DTOs)

**File**: `jewelry.Model/SaleDocument/`

```
SaleDocumentUploadRequest    — month, year, tags, remark (+ IFormFile via form-data)
SaleDocumentListRequest      — month?, year?
SaleDocumentListResponse     — id, fileName, blobPath, month, year, tags, remark, createBy, createDate
SaleDocumentUpdateTagRequest — id, tags, remark
```

### 2.4 เพิ่ม allowed folder ใน AzureBlobStorageService

```csharp
// เพิ่ม "Sale/Document" ใน _allowedFolders
```

### 2.5 Register Service ใน `InfrastructureServiceRegistration.cs`

```csharp
services.AddScoped<ISaleDocumentService, SaleDocumentService>();
```

---

## ส่วนที่ 3 — Frontend (Vue 3)

### 3.1 File Structure (ตาม saleorder-list pattern)

```
src/views/sale/document/
├── index-view.vue                    ← Orchestrator (app-container)
├── components/
│   ├── search-view.vue               ← filter-container-searchBar + pageTitle
│   └── data-table-view.vue           ← BaseDataTable + action buttons
└── modal/
    ├── upload-modal.vue              ← Modal upload PDF
    └── tag-modal.vue                 ← Modal แก้ไข tags
```

### 3.2 Store

**File**: `src/stores/modules/api/sale/sale-document-store.js`

| Action | API |
|---|---|
| `fetchList(month, year)` | GET `SaleDocument/List` |
| `uploadDocument(formData)` | POST `SaleDocument/Upload` |
| `downloadDocument(id)` | GET `SaleDocument/Download/{id}` |
| `updateTag(payload)` | PUT `SaleDocument/UpdateTag` |
| `deleteDocument(id)` | PUT `SaleDocument/Delete/{id}` |

### 3.3 Route ใหม่ใน `sale-routes.js`

```javascript
{
  path: '/sale/document',
  name: 'sale-document',
  component: SaleDocument,
  meta: {
    Displayname: { en: 'Sale Document', th: 'เอกสารสินค้า' },
    minorShow: true,
    permissions: [PERMISSIONS.SALE_VIEW]
  }
}
```

### 3.4 search-view.vue (ตาม pattern saleorder-list)

```
filter-container-searchBar
├── pageTitle title="เอกสารสินค้า" description="..."
├── form-col-container
│   ├── เดือน → Dropdown (ม.ค. - ธ.ค.)
│   ├── ปี → Dropdown (ปีปัจจุบัน - 3 ปีย้อนหลัง)
│   └── ชื่อไฟล์ / tag → input text
└── btn-submit-container
    ├── btn-main [🔍]
    └── btn-dark [✕]
```

### 3.5 data-table-view.vue (ตาม pattern saleorder-list)

**columns**:
| field | header | หมายเหตุ |
|---|---|---|
| `action` | - | ปุ่ม action |
| `fileName` | ชื่อไฟล์ | |
| `documentMonth` + `documentYear` | เดือน/ปี | format: "มีนาคม 2026" |
| `tags` | Tags | badge สี |
| `remark` | หมายเหตุ | |
| `createBy` | ผู้ upload | |
| `createDate` | วันที่ upload | formatDateTime |

**action buttons**:
```vue
<button class="btn btn-sm btn-green"    @click="onPreview(data)">  <!-- 👁 -->
<button class="btn btn-sm btn-main"     @click="onDownload(data)"> <!-- ⬇ -->
<button class="btn btn-sm btn-sub-main" @click="onEditTag(data)">  <!-- 🏷 -->
<button class="btn btn-sm btn-red"      @click="onDelete(data)">   <!-- 🗑 -->
```

### 3.6 upload-modal.vue

```
Modal
├── เลือกไฟล์ PDF (file input — accept=".pdf")
├── เดือน (Dropdown)
├── ปี (Dropdown)
├── Tags (text input, comma-separated)
├── หมายเหตุ (textarea)
└── btn-main [บันทึก] / btn-outline-main [ยกเลิก]
```

> **หมายเหตุ**: ไม่ใช้ PrimeVue FileUpload โดยตรง — ใช้ `<input type="file">` ธรรมดา + FormData เพื่อความเรียบง่าย (ไม่ต้องสร้าง generic wrapper)

### 3.7 tag-modal.vue

```
Modal
├── ชื่อไฟล์ (read-only แสดงข้อมูล)
├── Tags (text input)
├── หมายเหตุ (textarea)
└── btn-main [บันทึก] / btn-outline-main [ยกเลิก]
```

---

## ลำดับการ Implement

```
Step 1: DB  — SQL script สร้าง table tbt_sale_document
Step 2: API — Model DTOs (jewelry.Model/SaleDocument/)
Step 3: API — ISaleDocumentService + SaleDocumentService
Step 4: API — SaleDocumentController
Step 5: API — เพิ่ม allowed folder + register service
Step 6: UI  — sale-document-store.js
Step 7: UI  — search-view.vue + data-table-view.vue
Step 8: UI  — upload-modal.vue + tag-modal.vue
Step 9: UI  — index-view.vue + เพิ่ม route sale-routes.js
```

---

## ไฟล์ที่ต้องสร้าง / แก้ไข

### API
| ไฟล์ | สร้าง/แก้ |
|---|---|
| `jewelry.Model/SaleDocument/` (4 DTOs) | สร้างใหม่ |
| `Jewelry.Service/SaleDocument/SaleDocumentService.cs` | สร้างใหม่ |
| `Jewelry.Api/Controllers/SaleDocumentController.cs` | สร้างใหม่ |
| `Jewelry.Service/Helper/AzureBlobStorageService.cs` | แก้ไข (allowed folder) |
| `Jewelry.Api/InfrastructureServiceRegistration.cs` | แก้ไข (register) |

### UI
| ไฟล์ | สร้าง/แก้ |
|---|---|
| `src/stores/modules/api/sale/sale-document-store.js` | สร้างใหม่ |
| `src/views/sale/document/index-view.vue` | สร้างใหม่ |
| `src/views/sale/document/components/search-view.vue` | สร้างใหม่ |
| `src/views/sale/document/components/data-table-view.vue` | สร้างใหม่ |
| `src/views/sale/document/modal/upload-modal.vue` | สร้างใหม่ |
| `src/views/sale/document/modal/tag-modal.vue` | สร้างใหม่ |
| `src/router/web/sale/sale-routes.js` | แก้ไข |
