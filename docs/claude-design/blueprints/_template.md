# Blueprint — <Component / Archetype>

> พิมพ์เขียว design ของ `<ชื่อ>` — source of truth ของดีไซน์ที่ approve แล้ว ใช้ตอน map เข้าโค้ด
> 1 ไฟล์ = 1 component/archetype · copy ไฟล์นี้เป็น `<component-kebab>.md` แล้วกรอก

---

## Meta

| | |
|---|---|
| **Component / Archetype** | `<ชื่อ + path โค้ด เช่น src/components/generic/PageHeaderGeneric.vue>` |
| **สถานะ** | 🟡 draft / 🔵 review / ✅ approved / 🚀 mapped |
| **วันที่ (อัปเดตล่าสุด)** | YYYY-MM-DD |
| **Ref ที่ใช้** | `<ลิงก์/ชื่อ ref + ชอบตรงไหน>` |
| **Claude Design** | `<project + ลิงก์/ชื่อ frame ที่ approve>` |
| **ทางเลือกที่เลือก** | A / B / C — `<เหตุผลสั้นๆ>` |

---

## Layout (frame ที่ approve)

```
<วาง ASCII frame ของดีไซน์ที่เลือก — เต็มกว้าง แสดง layout/field/ปุ่ม/state>
```

---

## Spec — ค่าที่ใช้ (token เท่านั้น)

| ส่วน | property | token / ค่า |
|---|---|---|
| <เช่น bar bg> | background | `var(--base-font-color)` #921313 |
| <padding> | padding | `var(--sp-md) var(--sp-lg)` |
| ... | ... | ... |

> ทุกค่าต้องเป็น token — ถ้า Claude Design เสนอค่า hardcode ให้ map เข้า token ที่ใกล้สุด (เช็คด้วย MCP `validate_value`)

---

## States (ครบทุก state ที่ component มี)

| State | สิ่งที่เปลี่ยน |
|---|---|
| default | ... |
| hover / focus | ... |
| disabled | ... |
| empty / error / loading (ถ้ามี) | ... |

---

## Diff จากของเดิม

- `<อะไรเปลี่ยนจาก current → ใหม่ เช่น radius 8→10, เพิ่ม description, ปุ่ม search เด่นขึ้น>`

---

## Mapping → โค้ด (Phase 3)

| ไฟล์ที่ต้องแก้ | แก้อะไร |
|---|---|
| `<src/components/.../X.vue>` | `<scss/template ที่เปลี่ยน — คง props/emits/slots เดิม>` |
| `src/assets/scss/variable.scss` | `<ถ้าเพิ่ม/แก้ token>` |

- delegate: **@ui-implementer** · verify: `npm run lint` + `npm run build` + chrome-mcp (catalog/customer)
- บันทึก **Design Decision Log** ใน `docs/design-system.md` (วันที่ + หน้า/feature + สิ่งที่เปลี่ยน)

---

## Screenshots

- `<แนบ/ลิงก์ screenshot ของดีไซน์ที่ approve — before/after>`
