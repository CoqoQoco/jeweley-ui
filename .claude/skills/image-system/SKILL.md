---
name: image-system
description: ระบบรูปภาพ Azure Blob Storage — ใช้เมื่อแสดงรูป, โหลดรูปใน PDF, หรือ upload รูปใดๆ
---

# Image System (Azure Blob Storage)

## Components

| Component | ไฟล์ | วิธีโหลด | ใช้เมื่อ |
|---|---|---|---|
| `ImagePreview` | `src/components/prime-vue/ImagePreview.vue` | Direct Azure Blob URL | **Default** — แสดงรูปทั่วไป |
| `ImagePreviewEmit` | `src/components/prime-vue/ImagePreviewEmit.vue` | API proxy as Base64 | เฉพาะเมื่อต้องการ `@image-loaded` event |

**กฎ**: ใช้ `ImagePreview` เสมอ ยกเว้นต้องการ blobPath จาก emit

```javascript
// ✅ Good
import imagePreview from '@/components/prime-vue/ImagePreview.vue'

// ❌ Avoid (ใช้เฉพาะกรณีพิเศษ)
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
```

---

## การใช้งานใน Template

```vue
<imagePreview
  :imageName="item.imagePath"
  :type="type"
  :width="25"
  :height="25"
/>
```

`type` กำหนด blob path ที่จะสร้าง:

| Type | Blob Path |
|---|---|
| `STOCK` / `STOCK-PRODUCT` | `Stock/Product/{imageName}` |
| `MOLD` | `Mold/{imageName}-Mold.png` |
| `ORDERPLAN` / `PRODUCTIONPLAN` | `ProductionPlan/{imageName}` |
| `USER` | `User/{imageName}` |
| `PAYMENT` | `Payment/{imageName}` |

---

## รูปใน PDF (pdfmake)

ใช้ `getAzureBlobAsBase64` แปลงเป็น base64 สำหรับฝังใน PDF:

```javascript
async prepareImages() {
  const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')

  await Promise.all(
    this.items.map(async (item) => {
      if (item.imageBase64) return

      const blobPath = item.imageBlobPath || item.imagePath  // ใช้ imageBlobPath ก่อนเสมอ
      if (!blobPath) return

      const base64Image = await getAzureBlobAsBase64(blobPath, 'stock')
      if (base64Image && base64Image.length > 0) {
        item.imageBase64 = base64Image
      }
    })
  )
}
```

**กฎ PDF image**:
- ใช้ `item.imageBlobPath || item.imagePath` เสมอ (ไม่ต่อ prefix เอง)
- ระบุ `imageType` ที่ถูกต้อง: `'stock'`, `'mold'`, `'plan'`, `'user'`

---

## getAzureBlobAsBase64 — Type Resolution

| Resolved Type | API Endpoint | Trigger |
|---|---|---|
| `stock` | `FileExtension/GetStockProductImage` | `blobPath.startsWith('Stock/')` หรือ `imageType === 'stock'` |
| `mold` | `FileExtension/GetMoldImage` | `blobPath.startsWith('Mold/')` หรือ `imageType === 'mold'` |
| `plan` | `FileExtension/GetPlanImage` | `blobPath.startsWith('ProductionPlan/')` หรือ `imageType === 'plan'` |
| `user` | `FileExtension/GetImage` | `blobPath.startsWith('User/')` หรือ `imageType === 'user'` |

**หมายเหตุ**: blobPath prefix ถูกตรวจสอบก่อน imageType เสมอ
