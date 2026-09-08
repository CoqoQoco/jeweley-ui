# Blueprint — Invoice Detail payment zone (โซนชำระเงิน + สรุปยอดเงิน)

> พิมพ์เขียว design ของโซนชำระเงินหน้า `/invoice-detail` — source of truth ของดีไซน์ที่ approve แล้ว ใช้ตอน map เข้าโค้ด

---

## Meta

| | |
|---|---|
| **Component / Archetype** | Detail page money zone — `src/views/sale/invoice-detail/index-view.vue` (grid + กล่องเงิน), `components/payment-section.vue` (สถานะ + ประวัติรับชำระ), component ใหม่ `components/money-summary-card.vue`, `components/invoice-items-table.vue` (ตัดแถวเงินออกจาก footer) |
| **สถานะ** | 🚀 mapped — วัดซ้ำในเบราว์เซอร์จริงแล้ว (headless Chrome/CDP, viewport 1506): overflow หาย (`scrollWidth === clientWidth`), grid item `[285, 1141]`, footer ตารางสินค้าเหลือแถวยอดคอลัมน์จริง, ทุก payment status render ถูกต้อง; พบ+แก้ 2 จุดหลังวัด: (1) `moneySummaryFootnote` เจอ vue-i18n bug บาง `@` (reserved prefix ของ linked message) → escape เป็น `{'@'}` ทั่ว `src/language/` (รวม `companyFooter` ×2, `placeholderEmail` ×2 ที่เป็น bug แฝงเดิม); (2) กล่องยอดเงินมี dead space ใต้แถบสถานะเพราะ flex row เดียวกับสถานะเท่านั้น → ครอบสถานะ+ประวัติด้วย `.payment-left` แล้วให้กล่องยอดเงินอยู่ข้าง `.payment-left` ทั้งก้อน (`align-items: flex-start`) |
| **วันที่ (อัปเดตล่าสุด)** | 2026-09-08 |
| **Ref ที่ใช้** | archetype `detail` (design-system MCP): "zone สรุปใช้ `--color-green-bg`"; `StatCardGeneric` / `SectionCardGeneric` ที่มีอยู่; helper `src/services/utils/payment-status.js` (session อื่นสร้างไว้ — reuse ห้ามเขียนตรรกะซ้ำ) |
| **Claude Design** | ไม่ได้ใช้ — ออกแบบใน chat จาก screenshot จริง + วัด layout ด้วย chrome-devtools MCP |
| **ทางเลือกที่เลือก** | ทำทั้งชุด (แก้ overflow + ย้ายแถวเงิน + redesign) — user เลือกแทนการแบ่ง 2 รอบ |

---

## ปัญหาของเดิม (วัดจริงด้วย chrome-devtools MCP, viewport 1521px)

| อาการ | ตัวเลข/สาเหตุที่วัดได้ |
|---|---|
| หน้าเลื่อนแนวนอนทั้งหน้า | `document.scrollWidth` = **1854** vs viewport **1521** (เกิน 333px) |
| ต้นเหตุ overflow | `.form-content-payment-container` เป็น `display:grid; grid-template-columns: 1fr 4fr` แต่ **grid item ไม่ได้ตั้ง `min-width: 0`** (computed = `auto`) → หดต่ำกว่า min-content ไม่ได้ ตารางประวัติชำระเงิน 13 คอลัมน์ (wrapper scrollW **1680**) ดัน item เป็น **1714** แล้วดันทั้งหน้า |
| ผลข้างเคียง | คอลัมน์ Version ถูกบีบเหลือ **96px** (ทดลองใส่ `min-width:0` แล้วได้ **288px**, doc กลับมา **1521** พอดีจอ, ตารางเลื่อนในกรอบตัวเอง clientW 1119 / scrollW 1680) |
| "แถวว่าง" ในตารางสินค้า | ไม่ใช่แถวว่าง — ตารางกว้าง **2287px**, `tfoot` มี **9 แถว** โดย 7 แถวเป็น `Column colspan=16` วางเนื้อหาไว้ที่ x ≈ **2136px** → เห็นเป็นแถวว่างทุกครั้งที่ไม่ได้เลื่อนสุดขวา |
| ตัวเลขซ้ำ | `ยอดที่ต้องชำระ` โผล่ **3 ที่** (footer ตารางสินค้า / กล่องสรุปยอดเงิน / ท้ายตารางชำระเงิน) · `มัดจำ`, `ยอดคงเหลือ`, `ส่วนลดพิเศษ`, `VAT` ซ้ำ **2 ที่** |
| อ่านยาก | ข้อมูลอ่านอย่างเดียว ~14 ช่อง render เป็นกล่องพื้นชมพูเลียนแบบ input |
| ไม่เห็นสถานะ | ไม่มี badge/ตัวบอกว่าจ่ายครบหรือยัง ต้องไล่อ่านว่า `คงเหลือ = 0.00` |
| ตารางชำระเงินเปลืองที่ | 13 คอลัมน์ (ธนาคาร/สาขา/เลขอ้างอิง/หมายเหตุ ว่างเกือบทุกแถวในข้อมูลจริง) |

---

## Layout (frame ที่ approve)

```
┌─ .form-content-payment-container (grid 1fr 4fr, gap sp-sm, ทุก item min-width:0) ───────────┐
│ ┌─ Versions (1fr) ─┐ ┌─ โซนเงิน (4fr) ──────────────────────────────────────────────────┐ │
│ │ Invoice Versions │ │ ┌─ SectionCardGeneric legend "การชำระเงิน" (accent main) ──────┐ │ │
│ │ (card เดิม)      │ │ │ .payment-zone (flex row, align-items: flex-start) ────────────│ │ │
│ │                  │ │ │ ┌── .payment-left (flex 1) ───────┐ ┌── ยอดเงิน (320px) ──┐ │ │ │
│ │                  │ │ │ │ ● ชำระครบแล้ว   [+ บันทึกรับเงิน]│ │ ยอดที่ต้องชำระ       │ │ │ │
│ │                  │ │ │ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  100%    │ │ 11,000.00 THB       │ │ │ │
│ │                  │ │ │ │ ชำระแล้ว 11,000.00/11,000.00   │ │ ──────────────────  │ │ │ │
│ │                  │ │ │ │ เงินสด · เครดิต 0 วัน            │ │ มัดจำ        0.00   │ │ │ │
│ │                  │ │ │ │                                  │ │ ชำระแล้ว 11,000.00  │ │ │ │
│ │                  │ │ │ │ ประวัติการรับชำระ (1 ครั้ง)         │ │ คงเหลือ      0.00 ✓ │ │ │ │
│ │                  │ │ │ │ ┌──────────────────────────────┐│ └─────────────────────┘ │ │ │
│ │                  │ │ │ │ │[🖼]08/09/26 11,000.00 THB    ││  ← เงินยอดสูงกว่า status+   │ │ │
│ │                  │ │ │ │ │   เงินสด  ampai989      [🗑] ││    history → align-items:  │ │ │
│ │                  │ │ │ │ │   ธนาคาร/สาขา · อ้างอิง …     ││    flex-start กันที่ว่างล่าง│ │ │
│ │                  │ │ │ │ │   ← มีค่าเท่านั้น              ││                            │ │ │
│ │                  │ │ │ │ └──────────────────────────────┘│                            │ │ │
│ │                  │ │ │ └──────────────────────────────────┘                            │ │ │
│ │                  │ │ └──────────────────────────────────────────────────────────────┘ │ │
│ │                  │ │ ┌─ money-summary-card (พับได้ ปิดไว้ default) ─────────────────┐ │ │
│ │                  │ │ │ สรุปยอดเงิน                     ยอดที่ต้องชำระ 11,000.00 THB ▾│ │ │
│ │                  │ │ │ ─────────────── (เปิดแล้วเห็นตารางใบเสร็จ) ─────────────────│ │ │
│ │                  │ │ │ ยอดรวมสินค้า                                     11,000.00  │ │ │
│ │                  │ │ │ ส่วนลดพิเศษ                                          -0.00  │ │ │
│ │                  │ │ │ ส่วนเพิ่มพิเศษ                                       +0.00  │ │ │
│ │                  │ │ │ ค่าขนส่ง / ประกันภัย                                  0.00  │ │ │
│ │                  │ │ │ ────────────────────────────────────────────────────────── │ │ │
│ │                  │ │ │ ยอดรวมก่อน VAT                                   11,000.00  │ │ │
│ │                  │ │ │ VAT 0%                                                0.00  │ │ │
│ │                  │ │ │ ══════════════════════════════════════════════════════════ │ │ │
│ │                  │ │ │ ยอดที่ต้องชำระ                              11,000.00 THB  │ │ │
│ │                  │ │ │ สกุล THB @ 1.00 · ปัดขึ้น +0.00                             │ │ │
│ │                  │ │ └──────────────────────────────────────────────────────────────┘ │ │
│ └──────────────────┘ └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

ตารางสินค้า (บนสุดของหน้า) — footer เหลือเฉพาะ 2 แถวที่เป็นยอดของ "คอลัมน์":
  แถว 1: Net Weight Of Merchandise …  |  แถว 2: Total (ทอง / เพชร / พลอย / จำนวน / รวมราคา)
  ❌ ตัดแถว colspan=16 ทั้ง 7 แถว (ส่วนลดพิเศษ → ยอดที่ต้องชำระ) ออก ย้ายไป money-summary-card
```

---

## Spec — ค่าที่ใช้ (token เท่านั้น)

| ส่วน | property | token / ค่า |
|---|---|---|
| grid โซนเงิน | `grid-template-columns` / gap | `1fr 4fr` / `var(--sp-sm)` (คงเดิม) |
| **grid item ทุกตัว** | `min-width` | **`0`** ← จุดที่แก้ overflow |
| กล่องหลัก | header | `SectionCardGeneric` `headerStyle="legend"` `accent="main"` (กฎ box-title ของโปรเจกต์) |
| `.payment-zone` (สถานะ+ประวัติ vs กล่องยอดเงิน) | layout | flex, `align-items: flex-start`, gap `var(--sp-lg)`, wrap เมื่อ < 1024px — **`.payment-left` (flex 1, min-width:0) ครอบทั้งแถบสถานะ + ประวัติการรับชำระ** ไว้เป็นคอลัมน์ซ้ายเดียว ให้กล่องยอดเงิน `flex: 0 0 320px` อยู่ข้างคอลัมน์ซ้ายทั้งหมด (ไม่ใช่แค่ข้างแถบสถานะ) กัน dead space ใต้กล่องยอดเงินตอนยอดสูงกว่า |
| badge สถานะ `paid` | color / bg | `var(--status-resolved)` / `var(--status-resolved-bg)` |
| badge สถานะ `partial` | color / bg | `var(--status-open)` / `var(--status-open-bg)` |
| badge สถานะ `unpaid` | color / bg | `var(--status-cancelled)` / `var(--status-cancelled-bg)` |
| badge | padding / radius / font | `var(--sp-xs) var(--sp-md)` / `var(--radius-sm)` / `var(--fs-sm)` bold |
| progress bar | height / radius / track | `8px` / `var(--radius-sm)` / `var(--color-border)` |
| progress fill | bg | สีเดียวกับ badge ตามสถานะ (`--status-*`) |
| กล่องยอดเงิน | bg / border / radius / padding | `var(--color-green-bg)` (กฎ archetype detail: zone สรุป) / `1px solid var(--color-border)` / `var(--radius-md)` / `var(--sp-lg)` |
| ตัวเลขยอดใหญ่ | font | `var(--fs-xl)` weight 700, สี `var(--base-font-color)` |
| แถว label/value ในกล่องยอด | layout / font | `display:flex; justify-content:space-between` / label `var(--fs-sm)` `var(--base-sub-color)`, value `var(--fs-base)` weight 600, ตัวเลข `font-variant-numeric: tabular-nums` |
| คงเหลือ = 0 | สี value | `var(--status-resolved)` · คงเหลือ > 0 → `var(--base-red)` |
| รายการประวัติ (แถว) | padding / เส้นคั่น / hover | `var(--sp-md)` / `1px solid var(--color-border)` (ไม่ใส่เส้นแถวสุดท้าย) / bg `var(--color-highlight-bg)` |
| รายการประวัติ บรรทัดรอง | font / สี | `var(--fs-sm)` / `var(--base-sub-color)` — render เฉพาะฟิลด์ที่มีค่า |
| money-summary ตารางใบเสร็จ | layout | `display:grid; grid-template-columns: 1fr auto`, row gap `var(--sp-sm)`, ตัวเลขชิดขวา `tabular-nums` |
| เส้นคั่นก่อน "ยอดรวมก่อน VAT" | border-top | `1px solid var(--color-border)` |
| เส้นคู่ก่อน "ยอดที่ต้องชำระ" | border-top | `2px solid var(--base-font-color)` |
| ปุ่มพับ money-summary | component | `ButtonGeneric variant="plain"` + `bi-chevron-down/up` |

> ทุกค่าต้องเป็น token — ห้าม hardcode hex

---

## ตรรกะสถานะ (ห้ามเขียนซ้ำ)

ใช้ `src/services/utils/payment-status.js` ที่มีอยู่แล้ว:
- `getPaymentStatus(grandTotal, deposit, paidAmount)` → `'paid' | 'partial' | 'unpaid' | null`
  (คืน `null` เมื่อไม่รู้ยอดรวม — **ห้ามเดาว่าค้างชำระ** ให้ซ่อน badge/progress แล้วขึ้น `-`)
- `getOutstandingAmount(grandTotal, deposit, paidAmount)` → ยอดคงเหลือ
- ค่าที่ส่งเข้า: `grandTotalRounded` (computed เดิมของหน้า), `invoiceData.deposit`, `paidAmount`
- progress % = `clamp(0, 100, ((deposit + paid) / grandTotal) * 100)`; grandTotal = 0 → ซ่อน bar

---

## States (ครบทุก state ที่ component มี)

| State | สิ่งที่เปลี่ยน |
|---|---|
| ชำระครบ (`paid`) | badge เขียว "ชำระครบแล้ว", bar 100% เขียว, คงเหลือ 0.00 สีเขียว |
| ชำระบางส่วน (`partial`) | badge เหลือง "ชำระบางส่วน", bar ตามสัดส่วน, คงเหลือสีแดง |
| ยังไม่ชำระ (`unpaid`) | badge แดง "ยังไม่ชำระ", bar 0%, คงเหลือสีแดง |
| ไม่รู้ยอดรวม (`null`) | ซ่อน badge + bar, ทุกยอดแสดง `-`, ปุ่มบันทึกรับเงินยังกดได้ |
| ไม่มีประวัติชำระ | empty state ไอคอน `bi-inbox` + ข้อความ (คงข้อความเดิม) แทนรายการ |
| มีสลิป (`imagePath`) | thumbnail 40×40 หน้าแถว กดดูรูปใหญ่ได้ (คง `imagePreview` เดิม) |
| ฟิลด์รองว่าง | ไม่ render บรรทัดรองเลย (ไม่เว้นที่ว่าง) |
| money-summary ปิด/เปิด | ปิด: หัวข้อ + ยอดที่ต้องชำระ + chevron ลง · เปิด: ตารางใบเสร็จเต็ม + chevron ขึ้น |
| จอ < 1024px | สถานะ/กล่องยอดเงิน wrap เป็นแนวตั้ง, grid โซนเงินเป็น 1 คอลัมน์ |
| ลบรายการชำระ | ปุ่มถังขยะแดงในแถว → confirm เดิม (`@delete-payment` ไม่เปลี่ยน) |

---

## Diff จากของเดิม

- `.form-content-payment-container > *` เพิ่ม `min-width: 0` → หน้าเลิกล้นแนวนอน (1854 → 1521), Version ได้ 288px
- ตารางสินค้า: ตัด `tfoot` แถว `colspan=16` 7 แถว (ส่วนลดพิเศษ, ส่วนเพิ่มพิเศษ, ยอดรวมหลังปรับ, ค่าขนส่ง, ยอดรวมก่อน VAT, VAT, ยอดที่ต้องชำระ/ก่อนปัด) — เหลือ 2 แถวที่เป็นยอดคอลัมน์จริง
- กล่อง "ข้อมูลการชำระเงิน" + "สรุปยอดเงิน" (14 ช่องพื้นชมพู) → แถบสถานะ + กล่องยอดเงิน + `money-summary-card` แบบใบเสร็จ
- ตารางประวัติ 13 คอลัมน์ (`BaseDataTable`) → รายการการ์ด; ฟิลด์รองขึ้นเฉพาะที่มีค่า
- ท้ายตารางประวัติ (จำนวนครั้ง/ยอดที่ต้องชำระ/มัดจำ/ชำระแล้ว/คงเหลือ) → ยุบเข้ากล่องยอดเงินด้านบน (เลิกซ้ำ)
- ปุ่ม "บันทึกรับเงิน" ย้ายจาก `.card-header` มาอยู่ในแถบสถานะ (ใกล้ context ที่ใช้)

---

## Mapping → โค้ด (Phase 3)

| ไฟล์ที่ต้องแก้ | แก้อะไร |
|---|---|
| `src/views/sale/invoice-detail/index-view.vue` | `.form-content-payment-container > * { min-width: 0 }`; ลบ markup กล่อง "ข้อมูลการชำระเงิน + สรุปยอดเงิน" เดิม (บรรทัด ~128-270) แล้ววาง `<payment-section>` + `<money-summary-card>`; ส่ง props ที่ทั้งสองต้องใช้ |
| `src/views/sale/invoice-detail/components/payment-section.vue` | เขียนใหม่: `SectionCardGeneric` legend + แถบสถานะ (badge/progress/ปุ่มบันทึกรับเงิน) + กล่องยอดเงิน + รายการประวัติแบบการ์ด; ใช้ `getPaymentStatus`/`getOutstandingAmount`; emit `delete-payment` เดิม + emit ใหม่ `record-payment` |
| `src/views/sale/invoice-detail/components/money-summary-card.vue` (ใหม่) | กล่องสรุปยอดเงินแบบใบเสร็จ พับได้ (default ปิด) — props: `invoiceData`, `subTotal`, `totalAfterDiscountAndAddition`, `totalBeforeVat`, `vatAmount`, `grandTotalRaw`, `grandTotalRounded` |
| `src/views/sale/invoice-detail/components/invoice-items-table.vue` | ลบ `<Row>` ที่มี `Column colspan="16"` ทั้ง 7 แถวใน `ColumnGroup type="footer"` + computed/style ที่ใช้เฉพาะแถวนั้นถ้าไม่มีใครใช้ต่อ |
| `src/language/view/sale/th.js` / `en.js` | key ใหม่: `paymentStatusPaid/Partial/Unpaid`, `paymentProgress`, `moneySummaryTitle`, `subTotalItems`, `roundingAdjust`, `paymentHistoryCount`, `noSecondaryInfo` ฯลฯ (ตั้งชื่อจริงตอน implement) |
| `docs/design-system.md` | Decision Log 2026-09-08: payment zone redesign + กฎ `min-width:0` สำหรับ grid item ที่มีตารางกว้าง |

- delegate: **@ui-implementer** · verify: `npx eslint` + `npx vite build` + chrome-devtools MCP วัดซ้ำที่ `/invoice-detail?invoiceNumber=INV260908007` ต้องได้ `document.scrollWidth === clientWidth`
- ⚠️ ห้ามแตะไฟล์ของ session อื่นที่ค้างใน working tree; `payment-status.js` เป็นของ session อื่น — **import อย่างเดียว ห้ามแก้**

---

## Screenshots

- before: `scratchpad/payment-zone-before.png` (2026-09-08) + screenshot จาก user ที่เห็นแถวว่างและหน้าล้น
- after: แนบหลัง map เข้าโค้ด
