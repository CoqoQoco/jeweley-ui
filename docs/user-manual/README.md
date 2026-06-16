# คู่มือการใช้งานระบบ jeweley-ui

index สำหรับคู่มือผู้ใช้ปลายทาง (end-user manual) ต่อ feature

> คู่มือแต่ละหน้าสร้างตาม `user-manual` skill: `@.claude/skills/user-manual/SKILL.md`
> วิธีสร้างคู่มือใหม่ดูที่ section "วิธีเพิ่มคู่มือ feature ใหม่" ด้านล่าง

---

## รายการคู่มือ

| Feature | ไฟล์คู่มือ | สถานะ |
|---|---|---|
| ย้าย Location สินค้า | `src/views/stock/move-location/modal/manual-view.vue` | ✅ มีอยู่แล้ว |
| (รอเพิ่มตาม module ที่ migrate) | — | ⬜ |

---

## วิธีเพิ่มคู่มือ Feature ใหม่

คู่มือแต่ละ feature ประกอบด้วย 2 ส่วน:

### 1. ปุ่ม "คู่มือ" ใน Search Bar

วางในกลุ่มขวาของ `.btn-submit-container-between` ก่อนปุ่ม search:

```vue
<button class="btn btn-sm btn-outline-main mr-2" type="button"
  @click="$emit('manual')" title="คู่มือการใช้งาน">
  <i class="bi bi-journal-text"></i> คู่มือ
</button>
```

### 2. Manual Modal

สร้างไฟล์ `modal/manual-view.vue` ใน feature folder:

```
views/<feature>/
├── index-view.vue
├── components/
└── modal/
    └── manual-view.vue    ← สร้างที่นี่
```

Screenshot เก็บที่: `src/assets/manuals/<feature>/NN-ชื่อ.png`

ดูตัวอย่างเต็มที่: `src/views/stock/move-location/modal/manual-view.vue`
ดูรายละเอียด pattern ทั้งหมด: `@.claude/skills/user-manual/SKILL.md`

---

## โครงสร้าง Screenshot

```
src/assets/manuals/
├── move-location/          ← มีอยู่แล้ว
│   ├── 01-list.png
│   ├── 02-select.png
│   └── ...
└── <feature-name>/         ← เพิ่มเมื่อสร้างคู่มือใหม่
    ├── 01-step1.png
    └── 02-step2.png
```
