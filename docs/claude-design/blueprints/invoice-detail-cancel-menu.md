# Blueprint — Invoice Detail ⋯ menu (เมนูยกเลิก)

> พิมพ์เขียว design ของเมนู `⋯` บนหัวหน้า `/invoice-detail` — source of truth ของดีไซน์ที่ approve แล้ว ใช้ตอน map เข้าโค้ด
> ต่อยอดจาก `invoice-detail-header-actions.md` (แถบปุ่มทั้งแถบ) — ไฟล์นี้โฟกัสเฉพาะ popup ของ `⋯` + generic ที่ต้องเพิ่ม

---

## Meta

| | |
|---|---|
| **Component / Archetype** | `src/components/generic/ActionMenuGeneric.vue` (popup + item) + `src/views/sale/invoice-detail/index-view.vue` (`moreMenuItems`) |
| **สถานะ** | ✅ approved (user เลือกแนว ก + สั่ง rewrite ปุ่ม 2026-09-10) |
| **วันที่ (อัปเดตล่าสุด)** | 2026-09-10 |
| **Ref ที่ใช้** | popup เดิมของ `ActionMenuGeneric` (2026-09-08) + pattern section label ของ slide-menu (กลุ่ม system: label เล็ก + แยกโซน) |
| **Claude Design** | ไม่ได้ใช้ — ออกแบบเป็น ASCII ใน chat |
| **ทางเลือกที่เลือก** | group เดียวชื่อ "การยกเลิก" + 2 รายการ danger ที่มี hint บังคับ — ผู้ใช้ต้องอ่านผลลัพธ์ก่อนกด ไม่ใช่เดาจาก label |

---

## ปัญหาของเดิม

- popup มีรายการเดียว ลอยกลางกล่องขาว ไม่มีหัวข้อ/ขอบเขต → ดูเหมือนกล่องว่างที่มีข้อความหลุดมา
- icon `bi-arrow-counterclockwise` (↺) สื่อว่า "ย้อนกลับ/กู้คืน" ทั้งที่เป็น action ทำลายที่ย้อนไม่ได้
- สีแดงอยู่แค่ตัวอักษร ไม่มีน้ำหนักพอให้รู้ว่าเป็นโซนอันตราย
- hover ใช้ theme default ของ PrimeVue (เทา) ไม่ผูกกับ token ของระบบ
- กำลังจะมี 2 รายการยกเลิกที่ผลต่างกันมาก ถ้าไม่มี hint ผู้ใช้แยกไม่ออกและกดผิดได้

---

## Layout (frame ที่ approve)

```
                                                   [ ⋯ ]  ← trigger เดิม (ghost icon-only, title "เพิ่มเติม")
   ┌──────────────────────────────────────────────────────────┐
   │  การยกเลิก                                                │ ← group header: fs-sm, --base-sub-color @ .6, ไม่คลิก
   ├──────────────────────────────────────────────────────────┤ ← เส้นคั่น 1px --color-border
   │  (✕)   ยกเลิก Invoice                                     │ ← icon chip วงกลม 28px พื้น --status-cancelled-bg
   │        คืนสินค้าเข้าคลัง แต่ยังยืนยันค้างไว้ใน SO            │ ← hint บังคับ fs-sm
   │                                                           │
   │  (⊘)   ยกเลิก Invoice + ปลดยืนยันสินค้า                    │
   │        ปลดยืนยันสินค้าของใบนี้ออกจาก SO ด้วย                │
   └──────────────────────────────────────────────────────────┘

   hover แถว danger → พื้นทั้งแถวเป็น --status-cancelled-bg, chip เข้มขึ้นเป็น --base-red พื้นขาว
```

- ลำดับ: อันตรายน้อย → มากจากบนลงล่าง (ยกเลิกใบเดียว มาก่อน ยกเลิกใบ + ปลดยืนยัน)
- ทั้งสองรายการเป็น danger ทั้งคู่ ไม่มีรายการปกติปนในเมนูนี้ → ใส่ group header ครั้งเดียวพอ
- ไม่มี state disabled: Invoice ที่ยกเลิกแล้วเปิดหน้านี้ไม่ได้ตั้งแต่ต้น (`Invoice/Get` กรอง `is_delete == false`)

---

## Spec — ค่าที่ใช้ (token เท่านั้น)

| ส่วน | property | token / ค่า |
|---|---|---|
| popup | min-width / max-width | `260px` / `340px` (เดิม min 220px — label ยาวขึ้น) |
| popup | bg / border / radius / shadow | `var(--color-card-bg)` / `1px solid var(--color-border)` / `var(--radius-md)` / `var(--shadow-md)` (เดิม) |
| group header | font / color / padding | `var(--fs-sm)` / `var(--base-sub-color)` opacity `.6` / `var(--sp-sm) var(--sp-md) var(--sp-xs)` |
| เส้นคั่น (separator) | border-top / margin | `1px solid var(--color-border)` / `var(--sp-xs) 0` |
| menu item | padding / gap | `var(--sp-sm) var(--sp-md)` / `var(--sp-sm)` (เดิม) |
| menu item hover/focus (ปกติ) | background | `var(--color-highlight-bg)` |
| menu item hover/focus (danger) | background | `var(--status-cancelled-bg)` |
| icon chip (danger) | size / radius / bg / color | `28px` / `50%` / `var(--status-cancelled-bg)` / `var(--base-red)` |
| icon chip (danger) hover | bg / color | `var(--base-red)` / `var(--color-card-bg)` |
| label (danger) | color / weight | `var(--base-red)` / `600` |
| hint | font / color / line-height | `var(--fs-sm)` / `var(--base-sub-color)` opacity `.7` / `var(--lh-sm)` |
| icon ปกติ (เมนูอื่น) | คงเดิม | ไม่มี chip — `1.25rem` สี `var(--base-font-color)` |

> chip ใช้เฉพาะรายการ danger — เมนู "เอกสารอื่น" / "Excel" หน้าตาไม่เปลี่ยน

---

## States

| State | สิ่งที่เปลี่ยน |
|---|---|
| default | 2 รายการ danger ใต้ group header "การยกเลิก" |
| hover / focus (keyboard) | พื้นแถวเป็น tint แดง chip กลับสี (พื้นแดง icon ขาว) — `.p-focus` ให้ผลเดียวกับ hover |
| disabled | รองรับตามเดิม (opacity .5 + cursor not-allowed) — เมนูนี้ยังไม่ใช้ |
| ระหว่างยิง API | popup ปิดไปแล้ว สถานะแสดงผ่าน loading overlay ของ axios-helper (เดิม) |
| มีการรับชำระเงินค้าง | ไม่เปลี่ยนหน้าตาเมนู — เตือนในกล่อง confirm แทน |

---

## Diff จากของเดิม

- 1 รายการ → 2 รายการ + group header "การยกเลิก" + เส้นคั่นใต้ header
- icon `bi-arrow-counterclockwise` → `bi-x-circle` (ยกเลิกใบเดียว) และ `bi-x-octagon` (ยกเลิก + ปลดยืนยัน)
- icon เปล่า → icon chip วงกลมพื้น tint แดงสำหรับรายการ danger
- hover theme default → token (`--color-highlight-bg` ปกติ / `--status-cancelled-bg` danger)
- hint ยังไม่เคยถูกใช้ในเมนูนี้ → ใช้ทั้ง 2 รายการ (บังคับ อธิบายผลลัพธ์ต่อ SO)
- min-width 220px → 260px, เพิ่ม max-width 340px ให้ hint ตัดบรรทัดสวย

---

## Mapping → โค้ด

| ไฟล์ที่ต้องแก้ | แก้อะไร |
|---|---|
| `src/components/generic/ActionMenuGeneric.vue` | รองรับ item 3 แบบ: ปกติ / `separator: true` (PrimeVue native) / group `{ label, items: [] }` ผ่าน `#submenuheader`; เพิ่ม icon chip + hover/focus token + width ใหม่; คง props/emits เดิมทั้งหมด |
| `src/views/sale/invoice-detail/index-view.vue` | `moreMenuItems` เป็น group เดียวที่มี 2 รายการ danger + hint; เพิ่ม `confirmCancelAndUnconfirm()` |
| `src/language/view/sale/th.js` · `en.js` | key ใหม่ใต้ `view.sale.invoiceDetail` (ดูตารางใน task ของ implementer) |
| `docs/design-system.md` | Decision Log 2026-09-10 |

- delegate: **@ui-implementer** · verify: `npx eslint` + `npx vite build`
- ⚠️ ห้ามกดยิงจริงบน local — API local ต่อฐานข้อมูล prod

---

## Screenshots

- before: popup รายการเดียว icon ↺ (screenshot จาก user 2026-09-10)
- after: แนบหลัง map เข้าโค้ด
