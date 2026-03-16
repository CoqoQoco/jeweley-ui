---
name: button-system
description: ระบบปุ่มและ color theme ของโปรเจกต์ — ใช้เมื่อเพิ่มปุ่ม, เลือก class ปุ่ม, หรือกำหนดสีใน component
---

# Button System & Color Theme

## Color Variables

กำหนดใน `src/assets/scss/variable.scss` และ `main.scss`:

| CSS Variable | Hex | ความหมาย |
|---|---|---|
| `--base-font-color` | `#921313` | Primary theme (dark red) |
| `--base-green` | `#038387` | Secondary/success (teal) |
| `--base-warning` | `#fabc3f` | Warning (yellow) |
| `--base-red` | `#ff4d4d` | Destructive/error |

---

## Button Classes

| Class | Color | ใช้เมื่อ |
|---|---|---|
| `btn-main` | `#921313` | **Primary action** — บันทึก, ยืนยัน, ดำเนินการหลัก |
| `btn-outline-main` | outline `#921313` | Secondary — ยกเลิก, ล้าง, ปุ่มรอง |
| `btn-green` | `#038387` | View/read — ดูรายละเอียด, ค้นหา |
| `btn-sub-main` | `#921313` | Sub primary (same as btn-main) |
| `btn-red` | `#ff4d4d` | Destructive — ลบ, ยกเลิกรายการ |

---

## ตัวอย่าง

```vue
<!-- ✅ Good -->
<button class="btn btn-sm btn-main">ยืนยัน</button>
<button class="btn btn-sm btn-outline-main">ยกเลิก</button>
<button class="btn btn-sm btn-green">ดูรายละเอียด</button>
<button class="btn btn-sm btn-red">ลบ</button>

<!-- ❌ Bad -->
<button class="btn btn-sm btn-warning">ยืนยัน</button>
<button class="btn btn-sm btn-outline-dark">ยกเลิก</button>
```

```scss
/* ✅ Good — ใช้ CSS variables */
.my-toolbar {
  border: 1px solid var(--base-font-color);
  background: #fdf2f2;
  color: var(--base-font-color);
}

/* ❌ Bad — hardcoded Bootstrap colors */
.my-toolbar {
  border: 1px solid #ffc107;
  background: #fff3cd;
}
```

---

## กฎห้ามทำ

- ❌ ห้ามใช้ `btn-warning` สำหรับ primary actions
- ❌ ห้ามใช้ `btn-outline-dark` / `btn-outline-secondary` สำหรับ cancel
- ❌ ห้ามใช้ Bootstrap colors โดยตรง — ใช้ `var(--base-*)` เสมอ
