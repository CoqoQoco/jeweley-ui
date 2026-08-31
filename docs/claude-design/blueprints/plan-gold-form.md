# Blueprint — ฟอร์มใบเบิกผสมทอง (Gold Cost Slip Form)

> พิมพ์เขียว design ของฟอร์มใบเบิกผสมทอง — source of truth ของดีไซน์ที่ approve แล้ว ใช้ตอน map เข้าโค้ด

---

## Meta

| | |
|---|---|
| **Component / Archetype** | `src/views/production/plan-gold/components/*` (ชุดใหม่) — ใช้ร่วมโดยหน้าสร้าง `plan-gold/index-view.vue` และหน้าแก้ไข `plan-tracking-gold/components/update-view.vue` |
| **สถานะ** | ✅ approved |
| **วันที่ (อัปเดตล่าสุด)** | 2026-08-31 |
| **Ref ที่ใช้** | `src/views/production/report/gold-loss-tang-report/` — thin orchestrator + `components/` + calc util แยก; โดเมนเดียวกัน (gold loss) และเป็น pattern ที่ดีที่สุดในโปรเจกต์ตอนนี้ |
| **Claude Design** | Duangkeaw Jewelry DS — ไม่มี frame แยก ใช้ token + generic kit เดิมทั้งหมด |
| **ทางเลือกที่เลือก** | **B** — แตก section component แล้วให้หน้าสร้าง/หน้าแก้ไขใช้ร่วมกันผ่าน prop `mode`<br>(A = แก้ 2 ไฟล์แยกกันต่อไป → ปฏิเสธ เพราะซ้ำ ~800 บรรทัดและ i18n ซ้ำ 2 namespace) |

---

## Layout (frame ที่ approve)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ PageHeaderGeneric — "สร้างใบเบิกผสมทอง" / "แก้ไขใบเบิกผสมทอง"   [ล้างฟอร์ม]  │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌─ ข้อมูลเบิกผสมทอง ─────────────────────────────────────────────────────┐   │  legend accent=main
│ │  .form-row.four-col                                                     │   │
│ │  [เล่มที่ *    ] [เลขที่ *     ] [วันที่เบิก *  ] [ราคาทอง *  ]         │   │
│ │  [ประเภททอง * ] [เปอร์เซ็นทอง*] [สูตรผสมทอง * ] [—          ]         │   │
│ │  [ผู้เบิกทอง  ] [ผู้รับทอง    ]                                        │   │
│ │  [รายละเอียด ────────────────────────────────────── textarea]          │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ ┌─ ข้อมูลทองหลอม ────────────────────────────────────────────────────────┐   │  legend accent=main
│ │  [วันที่เบิกหลอม] [เบิกทองหลอม ] [คืนทองหลอม  ] [—          ]         │   │
│ │  [น้ำหนักขาด    ] [น้ำหนักเกิน ] [ซิล         ] [จำนวนซิล   ]         │   │
│ │  ┌─ คืนขี้เบ้า ─────────────────────────────────────────────────────┐  │   │  legend accent=green
│ │  │ [คืนขี้เบ้า      ] [วันที่คืนขี้เบ้า ]                            │  │   │  (nested legend, ไม่ใช่แถบ teal ทึบ)
│ │  └───────────────────────────────────────────────────────────────────┘  │   │
│ │  ┌─ สมดุลทองหลอม ──────────────────────────────────────────────────┐  │   │  legend accent=green
│ │  │  เบิก 120.00  −  คืนรวม 118.30  =  ต่าง 1.70   ขาด    [ใช้ค่านี้] │  │   │
│ │  └───────────────────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ ┌─ ข้อมูลทองหล่อ ────────────────────────────────────────────────────────┐   │  legend accent=main
│ │  [วันที่เบิกหล่อ ] [เบิกทองหล่อ ]                                      │   │  (ตัด "เบิกพลอยเพชร" ออก — dead field)
│ │  [คืนทองหล่อ    ] [คืนแม่พิมพ์  ] [คืนตัวเรือนเสีย] [รวมคืนตัวเรือน 🔒] │   │
│ │  [คืนผงทอง      ] [น้ำหนักขาด   ] [น้ำหนักเกิน   ] [—             ]   │   │
│ │  ┌─ คืนขี้เบ้า ─────────────────────────────────────────────────────┐  │   │  legend accent=green
│ │  │ [คืนขี้เบ้า      ] [วันที่คืนขี้เบ้า ]                            │  │   │
│ │  └───────────────────────────────────────────────────────────────────┘  │   │
│ │  ┌─ คืนตัวเรือน ────────────────────────────────────────── [+ เพิ่ม] ┐  │   │  legend accent=main
│ │  │ ┌────┬──────────────┬─────────┬──────────┬────────────┐          │  │   │
│ │  │ │ 🗑 │ WO ตัวเรือน  │ จำนวน   │ น้ำหนัก  │ รายละเอียด │          │  │   │  ← แถวแก้ไขได้ตลอด
│ │  │ ├────┼──────────────┼─────────┼──────────┼────────────┤          │  │   │    (ไม่มีดินสอ/ติ๊กถูก)
│ │  │ │ 🗑 │[WO-0001 ▾  ]│[     2 ]│[   4.50 ]│[          ]│          │  │   │
│ │  │ ├────┴──────────────┴─────────┼──────────┼────────────┤          │  │   │
│ │  │ │      รวมน้ำหนักคืนตัวเรือน  │    4.50  │            │          │  │   │
│ │  │ └─────────────────────────────┴──────────┴────────────┘          │  │   │
│ │  │  (ว่าง) → "ยังไม่มีรายการคืนตัวเรือน"                             │  │   │
│ │  └───────────────────────────────────────────────────────────────────┘  │   │
│ │  ┌─ สมดุลทองหล่อ ──────────────────────────────────────────────────┐  │   │  legend accent=green
│ │  │  เบิก 200.00  −  คืนรวม 198.50  =  ต่าง 1.50   ขาด    [ใช้ค่านี้] │  │   │
│ │  └───────────────────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                              .btn-submit-container-between                    │
│  <div/>                                    [ล้างฟอร์ม]  [สร้างใบเบิกผสมทอง]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Responsive** — `.form-row.four-col`: ≤1024px → 2 คอลัมน์ · ≤600px → 1 คอลัมน์ (ui-layout §3)

---

## Spec — ค่าที่ใช้ (token เท่านั้น)

| ส่วน | property | token / ค่า |
|---|---|---|
| หัวข้อกล่องหลัก | component | `SectionCardGeneric headerStyle="legend" accent="main"` |
| หัวข้อกล่องย่อย (ขี้เบ้า / สมดุล) | component | `SectionCardGeneric headerStyle="legend" accent="green"` |
| legend text (main) | color | `var(--base-font-color)` #921313 |
| legend text (green) | color | `var(--base-green)` #038387 |
| ระยะระหว่างกล่อง | margin-top | `var(--sp-2xl)` 24px |
| ระยะภายในกล่อง | gap | `var(--sp-lg)` 16px (two-col) / `var(--sp-md)` 12px (four-col) |
| radius กล่อง | border-radius | `var(--radius-md)` 8px |
| ตัวเลขสมดุล "ขาด" | color | `var(--base-red)` #ff4d4d |
| ตัวเลขสมดุล "เกิน" | color | `var(--base-green)` #038387 |
| ปุ่มสร้าง | component | `ButtonGeneric variant="main"` |
| ปุ่มล้างฟอร์ม | component | `ButtonGeneric variant="outline"` |
| ปุ่มเพิ่ม/ลบแถว | component | `ButtonGeneric` (`type="button"` เสมอ) |
| ช่องน้ำหนักทุกช่อง | component | `InputTextGeneric type="number"` + **`v-model.number`** + `text-right` |

> ❌ ห้าม `.title-text-lg-bg` / `.filter-container-bg` / `style="width:30px"` / `min-width:50rem` — hardcode ทั้งหมด

---

## States

| State | สิ่งที่เปลี่ยน |
|---|---|
| default | ทุกช่องว่าง · วันที่เบิก = วันนี้ · วันที่คืนขี้เบ้า = `null` |
| field error | `FormFieldGeneric :error` → `<small class="text-danger">` ใต้ช่อง + sweetAlert `warning` สรุปทุกข้อพร้อมกัน |
| ตารางว่าง | "ยังไม่มีรายการคืนตัวเรือน" (empty state) |
| แถวไม่มี WO | validate บล็อก submit + เตือน "แถวที่ N ยังไม่ได้เลือก WO" |
| สมดุล = 0 | ซ่อนปุ่ม "ใช้ค่านี้" (ไม่มีอะไรให้เติม) |
| mode = edit | เล่มที่ / เลขที่ `disabled` · หัวข้อเปลี่ยนเป็น "แก้ไขใบเบิกผสมทอง" |
| ออกจากหน้าโดยยังไม่บันทึก | `beforeRouteLeave` → sweetAlert ยืนยัน |

---

## Diff จากของเดิม

- หัวข้อกล่อง: แถบทึบ maroon `.title-text-lg-bg` × 3 → **`SectionCardGeneric` legend** (ตามกฎ box-title)
- คืนขี้เบ้า: **แถบ teal ทึบเต็มความกว้าง** (`.filter-container-bg` + `.title-text-white`) → **nested legend accent green**
  > เหตุผล: teal เป็น accent ของ DS (ดู slide-menu Decision Log) แต่ slab ทึบกลางการ์ดขาวดังเกินน้ำหนักเนื้อหา — ลดเป็น legend คงความหมาย "หัวข้อย่อยคนละเรื่อง" ไว้โดยไม่แย่งสายตา
- ตารางคืนตัวเรือน: `editMode="row"` (ต้องกดดินสอทีละแถว) → **แถวแก้ไขได้ตลอด** ตัดคอลัมน์ row-editor ทิ้ง
- ตัด "เบิกพลอยเพชร" (dead field — `disabled` + ไม่เคย set ค่า)
- เพิ่ม 2 กล่อง "สมดุลทอง" (ของใหม่ Phase 2)
- ฟิลด์ทั้งหมด: native `<input class="form-control">` → `FormFieldGeneric` + `InputTextGeneric` (+ `id` ผูก `label for`)
- `.form-col-container` (auto-fit minmax 250px) → `.form-row.four-col` / `.two-col`

---

## Mapping → โค้ด (Phase 3)

| ไฟล์ที่ต้องแก้ / สร้าง | แก้อะไร |
|---|---|
| `src/views/production/plan-gold/components/gold-info-section.vue` | **ใหม่** — ข้อมูลเบิกผสมทอง (prop `mode` คุม disabled เล่มที่/เลขที่) |
| `src/views/production/plan-gold/components/melt-section.vue` | **ใหม่** — ทองหลอม + ขี้เบ้า + สมดุล |
| `src/views/production/plan-gold/components/cast-section.vue` | **ใหม่** — ทองหล่อ + ขี้เบ้า + ตารางคืนตัวเรือน + สมดุล |
| `src/views/production/plan-gold/components/body-return-table.vue` | **ใหม่** — ตารางคืนตัวเรือน (แถวแก้ไขได้ตลอด) |
| `src/views/production/plan-gold/components/balance-panel.vue` | **ใหม่** — แผงสมดุลใช้ร่วม 2 ที่ |
| `src/views/production/plan-gold/index-view.vue` | ลดเหลือ thin orchestrator (โหมด create) |
| `src/views/production/plan-tracking-gold/components/update-view.vue` | ใช้ section component ชุดเดียวกัน (`mode="edit"`) |
| `src/language/view/production/th.js` + `en.js` | รวม `planTrackingGold` → `planGold` namespace เดียว |

- delegate: **@ui-implementer** · verify: `npm run lint` + `npm run build` + chrome-mcp (`/plan-gold-order` + `/plan-gold-tracking`)
- บันทึก **Design Decision Log** ใน `docs/design-system.md`

---

## Screenshots

- before: หน้าเดิม 3 แถบ maroon ทึบ + 2 แถบ teal ทึบ (audit 2026-08-31)
- after: แนบหลัง implement เสร็จ
