# Plan: Quotation — One-time Image สำหรับ Copied Items

## 1. ผลการตรวจสอบ Function ที่มีอยู่

### `copyItem(item)` — ถูกต้อง ✅
- Deep copy ด้วย `JSON.parse(JSON.stringify(item))`
- Reset `stockNumber` และ `stockNumberOrigin` → null
- Set `_copyId = Date.now() + Math.random()` (ใช้ระบุ copied item)
- Copy arrays: `materials`, `priceTransactions`
- `imagePath` ยังคงเหมือนต้นฉบับ (copy มาพร้อมกัน) → Azure preview ยังใช้ได้

### `onEditStock(item, index)` — ถูกต้อง ✅
- Deep copy item ก่อน pass เข้า modal
- Set `editStockIndex` เพื่อ track ตำแหน่ง

### `onCloseEditStockModal(payload)` — ถูกต้อง ✅
- ถ้า `payload.action === 'save'` → replace item ด้วย `payload.data`
- Sync `discountPrice` จาก `priceDiscount` ถ้ามี

### `edit-stock-view.vue` — ถูกต้องสำหรับ copied items ✅
- ปุ่ม "บันทึก" เป็น `type="button" @click="onSave"` → emit data กลับ parent โดยไม่เรียก API
- `onSave()` ทำ `this.stock.priceTransactions = [...this.tranItems]` แล้ว emit `{ action: 'save', data: ... }`
- `onSubmit()` / `fetchUpdateStockProduct` จะถูก trigger เมื่อกด Enter เท่านั้น ไม่ใช่ปุ่ม Save

---

## 2. Feature: One-time Image สำหรับ Copied Items

### Requirement
- สินค้าที่ duplicate มา (`_copyId` ถูก set) สามารถเพิ่มรูปได้
- รูปเก็บเป็น base64 ใน memory เท่านั้น (**ไม่ upload Azure, ไม่ save DB**)
- รูปถูกใช้ใน PDF generation (`quotation-pdf-builder.js` รองรับ `item.imageBase64` อยู่แล้ว)
- ตารางแสดงรูป preview ของ local image แทน Azure blob

### PDF Builder รองรับอยู่แล้ว — ไม่ต้องแก้ ✅
```javascript
// prepareImages() line 90: ถ้า imageBase64 set อยู่แล้ว → skip Azure loading
if (item.imageBase64) return

// buildFinalTableBody() line 592: ใช้ imageBase64 ก่อน
item.imageBase64 || item.imageBlobPath
  ? this.setTabImageCell(item.imageBase64, item.imageBlobPath)
  : this.setTableCell('')
```

---

## 3. Files ที่ต้องแก้ไข

| File | Action |
|------|--------|
| `src/views/sale/quotation/components/quotation-view.vue` | แก้ไข image column template + เพิ่ม method |

---

## 4. การแก้ไข `quotation-view.vue`

### 4.1 เพิ่ม data fields

```javascript
data() {
  return {
    // ... existing fields
    _copyUploadTarget: null   // reference ถึง item ที่กำลัง upload
  }
}
```

### 4.2 เพิ่ม hidden file input (ใน template, นอก DataTable)

วางก่อน `</form>` ปิด:
```html
<!-- Hidden file input for one-time copy image -->
<input
  ref="copyImageInput"
  type="file"
  accept="image/*"
  style="display: none"
  @change="onCopyImageChange"
/>
```

### 4.3 แก้ไข Image Column Template

**เปลี่ยนจาก:**
```html
<column field="image" header="" style="width: 50px">
  <template #body="slotProps">
    <div class="image-container">
      <div v-if="slotProps.data.imagePath">
        <imagePreview
          :imageName="slotProps.data.imagePath"
          :type="type"
          :width="25"
          :height="25"
        />
      </div>
    </div>
  </template>
</column>
```

**เป็น:**
```html
<column field="image" header="" style="width: 60px">
  <template #body="slotProps">
    <div class="image-container">
      <!-- One-time local image (copied items) → แสดงก่อน -->
      <div v-if="slotProps.data.imageBase64" class="copy-image-preview">
        <img
          :src="slotProps.data.imageBase64"
          :width="25"
          :height="25"
          style="object-fit: cover; cursor: pointer;"
          :title="'คลิกเพื่อเปลี่ยนรูป'"
          @click="slotProps.data._copyId && onUploadCopyImage(slotProps.data)"
        />
      </div>
      <!-- Azure Blob image (real stock) -->
      <div v-else-if="slotProps.data.imagePath">
        <imagePreview
          :imageName="slotProps.data.imagePath"
          :type="type"
          :width="25"
          :height="25"
        />
      </div>
      <!-- Upload button (copied items ที่ยังไม่มีรูป) -->
      <div v-if="slotProps.data._copyId">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary p-0"
          style="width: 22px; height: 22px; font-size: 10px;"
          :title="slotProps.data.imageBase64 ? 'เปลี่ยนรูป' : 'เพิ่มรูป (ใช้สำหรับ PDF เท่านั้น)'"
          @click="onUploadCopyImage(slotProps.data)"
        >
          <i :class="slotProps.data.imageBase64 ? 'bi bi-arrow-repeat' : 'bi bi-image'"></i>
        </button>
      </div>
    </div>
  </template>
</column>
```

### 4.4 เพิ่ม Methods

```javascript
onUploadCopyImage(item) {
  this._copyUploadTarget = item
  this.$refs.copyImageInput.value = ''
  this.$refs.copyImageInput.click()
},

onCopyImageChange(event) {
  const file = event.target.files[0]
  if (!file || !this._copyUploadTarget) return

  const reader = new FileReader()
  reader.onload = (e) => {
    this._copyUploadTarget.imageBase64 = e.target.result   // data:image/...;base64,...
    this._copyUploadTarget = null
  }
  reader.readAsDataURL(file)
}
```

---

## 5. Behavior สรุป

| สถานการณ์ | Table Preview | PDF |
|----------|--------------|-----|
| Real stock (imagePath) | Azure blob via ImagePreview | Azure blob fetch → base64 |
| Copied item + no image | ปุ่ม bi-image | ไม่มีรูปใน PDF |
| Copied item + one-time image | img tag (base64) + ปุ่ม bi-arrow-repeat | imageBase64 → ใช้โดยตรง (skip Azure) |
| Copied item + แก้ไขผ่าน edit modal (upload Azure) | Azure blob (imagePath เปลี่ยน, imageBase64 null) | Azure fetch |

---

## 6. Verification

1. Copy item จากตาราง → ต้องเห็นปุ่ม bi-image ในคอลัมน์รูป
2. คลิกปุ่ม → file picker เปิด → เลือกรูป → ตารางแสดง preview ทันที
3. Export PDF → รูปที่เลือกต้องปรากฏใน PDF
4. Item ที่ไม่ได้ copy (real stock) → ปุ่ม upload ต้องไม่แสดง
5. Refresh หน้า / reset → รูปหายไป (in-memory only ✅)
