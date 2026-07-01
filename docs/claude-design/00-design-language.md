# 00 · Design Language — Brand & Token Brief

> **วัตถุประสงค์**: เอกสารนี้คือ "เมล็ดพันธุ์" (seed) สำหรับสร้าง **Design System** บน Claude Design
> copy เนื้อหาในไฟล์นี้ไปวางตอนสร้าง Design System ได้เลย — ทุกค่าดึงจาก `src/assets/scss/variable.scss` (source of truth)
>
> เมื่อ token ในโค้ดเปลี่ยน ต้องอัปเดตไฟล์นี้ (หรือใช้ `design-system-mcp` ดึงสด — ดู `04`/`05`)

---

## Brand Identity

ระบบจัดการการผลิตเครื่องประดับ **Duangkeaw Jewelry** — โทนหรูหรา-เชื่อถือได้-สะอาด
สีหลักเป็น **แดงเข้ม (dark red / maroon)** สื่อถึงความพรีเมียมของอัญมณี + สีรอง **เขียวมรกต (teal)**

| บทบาท | ชื่อ | Hex | ใช้เมื่อ |
|---|---|---|---|
| **Primary** | dark red | `#921313` | brand, primary action, title, focus border |
| Primary (deep) | deep maroon | `#360505` | hover/emphasis ของ primary |
| **Secondary** | teal | `#038387` | success, view/search, zone คำนวณ |
| Warning | amber | `#fabc3f` | คำเตือน |
| Danger | red | `#ff4d4d` | ลบ/destructive |
| Neutral | dark grey | `#393939` | clear/neutral action |
| Border | grey | `#e0e0e0` | เส้นขอบทั่วไป |
| Card bg | white | `#ffffff` | พื้นการ์ด |
| Highlight bg | pink tint | `#fdf2f2` | header การ์ด/highlight (โทนชมพู) |
| Green bg | teal tint | `#e6f4f4` | zone สรุป/คำนวณ (โทนเขียวอ่อน) |

---

## Color Tokens

```
--base-font-color      #921313   ← primary (dark red)
--base-font-sub-color  #360505   ← primary deep (hover)
--base-green           #038387   ← secondary (teal)
--base-warning         #fabc3f   ← warning
--base-red             #ff4d4d   ← danger
--base-sub-color       #393939   ← neutral dark
--base-color           #e0e0e0   ← grey
--color-border         #e0e0e0   ← border
--color-card-bg        #ffffff   ← card background
--color-highlight-bg   #fdf2f2   ← highlight (pink)
--color-green-bg       #e6f4f4   ← calc zone (teal tint)
```

> กฎเหล็ก: **ห้าม hardcode hex** ในโค้ดใหม่ — ใช้ CSS var เสมอ (`var(--base-font-color)` ฯลฯ)

---

## Spacing Scale (8px-ish rhythm)

| Token | CSS var | ค่า | ใช้กับ |
|---|---|---|---|
| xs | `--sp-xs` | 4px | gap เล็กสุด |
| sm | `--sp-sm` | 8px | gap ภายใน control |
| md | `--sp-md` | 12px | padding input |
| lg | `--sp-lg` | 16px | เว้นระหว่าง field / ระหว่าง box |
| xl | `--sp-xl` | 20px | padding ภายใน card |
| 2xl | `--sp-2xl` | 24px | เว้น section ใหญ่ |

**Spacing rhythm มาตรฐาน**: padding ใน box = `xl` · เว้นระหว่าง box = `lg` · เว้นระหว่าง field = `lg` · เว้นปุ่ม footer = `ml-2` (Bootstrap 4)

---

## Radius

| Token | CSS var | ค่า |
|---|---|---|
| sm | `--radius-sm` | 4px |
| md | `--radius-md` | 8px (default card/input/button) |
| lg | `--radius-lg` | 12px |

## Elevation (Shadow)

| Token | CSS var | ค่า |
|---|---|---|
| sm | `--shadow-sm` | `rgba(0,0,0,.06) 0 2px 8px` (card) |
| md | `--shadow-md` | `rgba(0,0,0,.1) 0 4px 12px` |
| lg | `--shadow-lg` | `rgba(0,0,0,.15) 0 8px 24px` (modal/popover) |

---

## Typography

- Base font size: **14px** · base text color ภายใน = neutral dark
- ภาษาไทย + อังกฤษ (i18n TH/EN)

| Token | CSS var | ค่า | ใช้กับ |
|---|---|---|---|
| fs-sm | `--fs-sm` | 12px | helper / caption |
| fs-base | `--fs-base` | 14px | body |
| fs-lg | `--fs-lg` | 17px | modal title / section |
| fs-xl | `--fs-xl` | 20px | page title |
| lh-sm | `--lh-sm` | 1.4 | input/compact |
| lh-md | `--lh-md` | 1.6 | body |
| lh-lg | `--lh-lg` | 1.8 | อ่านยาว |

---

## Button System (สีต่อ action)

| Variant | สี | ใช้เมื่อ |
|---|---|---|
| `main` | `#921313` | primary — บันทึก, ยืนยัน |
| `outline` | outline `#921313` | secondary — ยกเลิก, ล้าง |
| `green` | `#038387` | view/search — ดูรายละเอียด, ค้นหา |
| `red` | `#ff4d4d` | ลบ/destructive |
| `dark` | `#393939` | clear/neutral |
| `sub-main` | `#921313` | sub-primary |

- หน้า **list/search**: ปุ่ม action bar = **icon-only** (มี tooltip ไม่มี label)
- หน้า **create/edit**: ปุ่มมี label ตามปกติ
- ห้ามใช้ `btn-warning` / `btn-primary` / `btn-secondary` (ไม่อยู่ใน system)

---

## Core Design Principles (12 ข้อ — ห้ามขัด)

ดูฉบับเต็มที่ `docs/design-system.md` → สรุปสั้นสำหรับ Claude Design:

1. Page header มาตรฐาน (`PageHeaderGeneric`) — ปุ่มรองอยู่ใน `#actions` เท่านั้น
2. แบ่งเป็นหลาย box ตาม logic — แต่ละกลุ่ม = card มี border + title ของตัวเอง
3. Label แหล่งเดียวผ่าน `FormFieldGeneric` — ลูกห้าม render label ซ้ำ
4. Multi-column ใช้ grid (`form-row-grid`) responsive ≤1024px → 1 คอลัมน์ ห้ามเขียน media query เอง
5. Footer action bar อยู่นอก box ชิดขวา, primary ขวาสุด, เว้น `ml-2`
6. **Token เท่านั้น** — ห้าม hardcode hex/px
7. **Generic component เท่านั้น** — ห้าม native input/button/table หรือ PrimeVue ตรงๆ
8. **i18n เท่านั้น** — ห้าม hardcode ไทย, ใช้ `$t()`
9. Reusable first — ซ้ำ 2+ ที่ → สร้าง generic ใหม่
10. List page = icon-only buttons
11. Filter = `MultiSelectGeneric` เป็น default (array, chip)
12. Page title มี description เสมอ

---

## Do / Don't (สำหรับ prompt Claude Design)

**✅ Do**
- ใช้สีจาก palette ข้างบนเท่านั้น, primary = dark red `#921313`
- การ์ดมุมมน `8px`, เงาบาง, พื้นขาว, เส้นขอบ `#e0e0e0`
- จัดกลุ่ม field เป็นกล่องแยกตาม logic (multi-box)
- spacing เป็นจังหวะ 4/8/12/16/20/24

**❌ Don't**
- ห้ามใช้สีนอก palette (เช่น ฟ้า/ม่วง/gradient จัดจ้าน)
- ห้ามรวมทุก field ในกล่องเดียว
- ห้าม flat ไม่มีลำดับชั้น หรือเงาหนาเกินจริง
- ห้ามใช้มุมเหลี่ยม 0 หรือมุมมนเกิน 12px
