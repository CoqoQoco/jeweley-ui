# PLAN.md

---

## [2026-03-16] แสดงวัตถุดิบสร้อยคอจากแผนกคัดพลอย ที่แผนกแต่ง (Read-only)

### สรุปสิ่งที่ต้องการ

Tab **แต่ง (status 50)** ให้ดึงรายการวัตถุดิบพลอยจาก **แผนกคัดพลอย (status 70)** มาแสดงด้วย
โดยมีเงื่อนไข:
- แสดงเฉพาะรายการที่ชื่อ **"สร้อยคอ"** เท่านั้น
- **อ่านได้อย่างเดียว** — แก้ไขที่แผนกแต่งไม่ได้
- ข้อมูลที่แผนกแต่งบันทึกเองยังคงเดิม (ไม่กระทบ)

---

### การวิเคราะห์โค้ดปัจจุบัน

#### plan-process-view.vue

| ส่วน | สถานะปัจจุบัน | ปัญหา |
|---|---|---|
| `v-if="status === 70 \|\| status === 50"` (บรรทัด 271) | แสดง gem section ใน status 50 ด้วย | แสดงอยู่แล้ว แต่ข้อมูลว่าง |
| `:value="data.tbtProductionPlanStatusGem"` (บรรทัด 294) | ใช้ `data` ของ status 50 | `data` ของ status 50 มี `tbtProductionPlanStatusGem` ว่างเปล่า เพราะ gem บันทึกที่ status 70 |
| computed `necklaceData` (บรรทัด 510) | อ่านจาก `modelValue.tbtProductionPlanStatusGem` | ผิดที่ — `modelValue` ไม่มี property นี้โดยตรง ควรอ่านจาก `tbtProductionPlanStatusHeader` |
| computed `necklaceData` | มีอยู่แต่ **ยังไม่ได้ใช้ใน template** | ต้องเชื่อมกับ template |

#### ข้อมูลที่มีอยู่แล้ว

ข้อมูล gem ของ status 70 อยู่ใน:
```
modelValue.tbtProductionPlanStatusHeader[i].tbtProductionPlanStatusGem  (where i.status === 70)
```
ข้อมูลนี้ส่งมาพร้อมกับ prop `modelValue` อยู่แล้ว — **ไม่ต้อง fetch API เพิ่ม**

---

### ไฟล์ที่ต้องแก้ไข

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `plan-process-view.vue` | แก้ computed + template |
| `update-process-view.vue` | **ไม่ต้องแก้** — modal นี้จัดการ gold detail เท่านั้น |

---

### รายละเอียดการแก้ไข

#### 1. แก้ computed `necklaceData` → `necklaceGemFromStatus70`

**ไฟล์**: `plan-process-view.vue`

```javascript
// ❌ เดิม (ผิดที่)
necklaceData() {
  if (this.modelValue.tbtProductionPlanStatusGem) {
    let necklace = this.modelValue.tbtProductionPlanStatusGem.find((x) =>
      x.name.includes('สร้อยคอ')
    )
    return necklace || null
  }
  return null
}

// ✅ ใหม่ (ถูกที่ + กรองเฉพาะ สร้อยคอ)
necklaceGemFromStatus70() {
  const header = this.modelValue?.tbtProductionPlanStatusHeader
  if (!header) return []
  const status70 = header.find((x) => x.status === 70)
  if (!status70?.tbtProductionPlanStatusGem) return []
  return status70.tbtProductionPlanStatusGem.filter((x) => x.name?.includes('สร้อยคอ'))
}
```

---

#### 2. แก้ template ส่วน gem — แยก logic ระหว่าง status 50 และ 70

**ไฟล์**: `plan-process-view.vue`

**ก่อน** (บรรทัด 271-344): ส่วน gem ใช้ `data.tbtProductionPlanStatusGem` เหมือนกันทั้ง status 50 และ 70

**หลัง**: แยกออกเป็น 2 ส่วน:

```
status === 50  →  แสดง necklaceGemFromStatus70 (read-only, ไม่มีปุ่ม CSV)
status === 70  →  คงเดิม (แสดง data.tbtProductionPlanStatusGem + ปุ่ม CSV)
```

**รายละเอียด status 50 (ใหม่)**:
- Header label: `"วัตถุดิบสร้อยคอ (จากคัดพลอย)"` หรือคล้ายกัน
- DataTable: `:value="necklaceGemFromStatus70"` — ใช้ `gemColumns` เดิม
- ไม่มีปุ่ม CSV export
- ไม่มี row edit / row delete
- ถ้า `necklaceGemFromStatus70.length === 0` → แสดงข้อความ "ไม่มีรายการสร้อยคอจากคัดพลอย"

**รายละเอียด status 70 (คงเดิม)**:
- ไม่มีการเปลี่ยนแปลง

---

### Flow การทำงานหลังแก้

```
Tab แต่ง (status 50) โหลด
  ↓
syncData() → data = tbtProductionPlanStatusHeader.find(x.status === 50)
  ↓
computed necklaceGemFromStatus70
  → หา header ของ status 70 ใน tbtProductionPlanStatusHeader
  → กรองเฉพาะ tbtProductionPlanStatusGem ที่ name.includes('สร้อยคอ')
  ↓
Template แสดง section "วัตถุดิบสร้อยคอ (จากคัดพลอย)" แบบ read-only
```

---

### สรุปขอบเขต

| รายการ | ทำ / ไม่ทำ |
|---|---|
| แสดงวัตถุดิบสร้อยคอในแผนกแต่ง | ✅ ทำ |
| กรองเฉพาะ "สร้อยคอ" | ✅ ทำ |
| Read-only (แก้ไขไม่ได้) | ✅ ทำ (ไม่มี edit/delete) |
| Fetch API เพิ่มเติม | ❌ ไม่ทำ (ใช้ข้อมูลที่มีอยู่แล้ว) |
| แก้ update-process-view.vue | ❌ ไม่ทำ |
| กระทบ status 70 (คัดพลอย) | ❌ ไม่กระทบ |
