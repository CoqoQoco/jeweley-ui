---
name: button-system
description: ระบบปุ่มและ color theme ของโปรเจกต์ — ใช้เมื่อเพิ่มปุ่ม, เลือก class ปุ่ม, หรือกำหนดสีใน component — โค้ดใหม่ใช้ ButtonGeneric แทน native button; ดู design-system skill สำหรับ token ครบ
---

# Button System & Color Theme

**โค้ดใหม่**: ใช้ `ButtonGeneric` แทน native button — ดู `generic-components` skill
**Token ครบ**: ดู `design-system` skill

## Color Variables

กำหนดใน `src/assets/scss/variable.scss` และ `main.scss`:

| CSS Variable | Hex | ความหมาย |
|---|---|---|
| `--base-font-color` | `#921313` | Primary theme (dark red) |
| `--base-green` | `#038387` | Secondary/success (teal) |
| `--base-warning` | `#fabc3f` | Warning (yellow) |
| `--base-red` | `#ff4d4d` | Destructive/error |

---

## Button Classes (ทุกตัวนิยามใน `main.scss` ใช้ `button-variant` mixin)

| Class | ButtonGeneric variant | Color | ใช้เมื่อ |
|---|---|---|---|
| `btn-main` | `variant="main"` | `#921313` | **Primary action** — บันทึก, ยืนยัน |
| `btn-outline-main` | `variant="outline"` | outline `#921313` | Secondary — ยกเลิก, ปุ่มรอง |
| `btn-sub-main` | `variant="sub-main"` | `#921313` | Sub primary (เหมือน btn-main) |
| `btn-green` | `variant="green"` | `#038387` | View/read — ดูรายละเอียด, ค้นหา |
| `btn-red` | `variant="red"` | `#ff4d4d` | Destructive — ลบ, ยกเลิกรายการ |
| `btn-dark` | `variant="dark"` | `#393939` | Clear/neutral — ล้าง filter |

---

## ตัวอย่าง

**โค้ดใหม่ — ButtonGeneric (แนะนำ):**
```vue
<ButtonGeneric variant="main" icon="bi-save" :label="$t('common.btn.save')" @click="onSave" />
<ButtonGeneric variant="outline" :label="$t('common.btn.cancel')" class="ml-2" @click="onCancel" />
<ButtonGeneric variant="dark" icon="bi-x-circle" :label="$t('common.btn.clear')" @click="onClear" />
<ButtonGeneric variant="red" icon="bi-trash" :label="$t('common.btn.delete')" @click="onDelete" />
```

**โค้ดเก่า — native button (ยังใช้ได้ใน migration):**
```vue
<!-- ✅ Good -->
<button class="btn btn-sm btn-main">ยืนยัน</button>
<button class="btn btn-sm btn-outline-main ml-2">ยกเลิก</button>
<button class="btn btn-sm btn-green">ดูรายละเอียด</button>
<button class="btn btn-sm btn-red ml-2">ลบ</button>
<button class="btn btn-sm btn-dark ml-2">ล้าง</button>

<!-- ❌ Bad -->
<button class="btn btn-sm btn-warning">ยืนยัน</button>
<button class="btn btn-sm btn-primary">บันทึก</button>
```

```scss
/* ✅ Good — ใช้ CSS variables */
.my-toolbar {
  border: 1px solid var(--base-font-color);
  background: var(--color-highlight-bg);
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

- ❌ ห้ามใช้ `btn-warning`, `btn-custom`, `btn-primary`, `btn-secondary` — ไม่มีใน design system
- ❌ ห้ามใช้ `btn-outline-dark` / `btn-outline-secondary` สำหรับ cancel — ใช้ `btn-outline-main`
- ❌ ห้ามใช้ Bootstrap colors โดยตรง — ใช้ `var(--base-*)` หรือ `var(--color-*)` เสมอ
- ✅ โค้ดใหม่ใช้ `ButtonGeneric` เพื่อรองรับ i18n label อัตโนมัติ
