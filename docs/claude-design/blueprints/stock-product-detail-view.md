# Blueprint — Stock Product Detail Page + Expand ใหม่ (หน้า ตรวจคลัง `/stock-product-list`)

> พิมพ์เขียว design ของ (1) ปุ่ม action ในแถวตาราง (2) แถบขยาย (expand) ใหม่ (3) **หน้าใหม่** "รายละเอียดสินค้า" `/stock-product-detail/:stockNumber` — source of truth ใช้ตอน map เข้าโค้ด

---

## Meta

| | |
|---|---|
| **Component / Archetype** | Detail / View Page (archetype C) + row expansion — `src/views/stock/product/list/` (`components/data-table-view.vue`, `components/data-expand-view.vue`) · ใหม่ `src/views/stock/product/detail/index-view.vue` · ใหม่ shared `src/views/stock/product/components/material-table.vue`, `balance-panel.vue` · ใหม่ `src/composables/useStockBalanceMerge.js` |
| **สถานะ** | 🚀 mapped (build เขียว 2026-09-09) |
| **วันที่ (อัปเดตล่าสุด)** | 2026-09-09 |
| **Ref ที่ใช้** | archetype C Detail/View Page (`docs/claude-design/03-page-archetypes.md`) · หน้า invoice-detail (`src/views/sale/invoice-detail/index-view.vue` — `PageHeaderGeneric` + `#actions` ghost + `is-primary`, blueprint `invoice-detail-header-actions.md`) · gold-loss detail `.detail-header-grid` (label/value grid) · mobile detail `src/views/mobile/stock-product/detail-view.vue` (field ที่ควรโชว์ + วิธีโหลด) |
| **Claude Design** | ไม่ได้ใช้ — ออกแบบใน chat เป็น ASCII (artifact: Stock Product Detail Blueprint) |
| **ทางเลือกที่เลือก** | **A3 หน้าใหม่** (user ตัดสิน 2026-09-09) — deep-link/refresh ได้, พื้นที่กว้างสำหรับ 5 กล่อง, header actions ตาม archetype detail; modal (A1) และ drawer (A2) ตกไป |

---

## ปัญหาของเดิม (จาก source 2026-09-09)

| # | ปัญหา | หลักฐาน |
|---|---|---|
| 1 | แถวมี **5 ปุ่ม icon-only สีเดียวกัน** (พิมพ์ป้าย / แก้ไข / ต้นทุน / ประวัติ / QR) เป็น native `<button class="btn btn-sm">` ไม่ผ่าน native-call-policy และ **ไม่มีปุ่ม "ดูรายละเอียด" เลย** | `list/components/data-table-view.vue:14-40` |
| 2 | ตารางกว้าง 18 คอลัมน์ (scroll แนวนอน) → expand ต้อง **fix `width: 750px`** ไม่งั้นเนื้อหาไปโผล่นอกจอ | `list/components/data-expand-view.vue:196-199` |
| 3 | หัวข้อใน expand เป็น `<h6>` เขียนเอง + สี/px hardcode (`#f0f0f0`, `#f8f9fa`, `10px 20px`) ผิดกฎ box-title (ต้อง `SectionCardGeneric legend`) และกฎ token | `data-expand-view.vue:3, 201-226` |
| 4 | header คอลัมน์ `'Storage Location'` hardcode ไม่ผ่าน i18n; คอลัมน์ประเภทวัตถุดิบ header ว่าง | `data-expand-view.vue:80, 116` |
| 5 | expand โชว์เฉพาะ **ยอดรวม SKU** ตาม location — ยอดของ **ล็อตนี้** มีแค่ในคอลัมน์ตารางไกลทางขวา | `data-table-view.vue:76-87, 251-274` |
| 6 | Web ไม่มี detail view; mobile มี (`/mobile/stock-product-list/:stockNumber`) แต่เป็นสไตล์ mobile card ใช้ซ้ำบน web ไม่ได้ | `views/mobile/stock-product/**` |
| 7 | ตรรกะ `mergeBalanceIntoItems()` ซ้ำกัน 2 ที่ (web list + mobile detail) — หน้าใหม่จะเป็นที่ที่ 3 ถ้าไม่ extract | `data-table-view.vue:359-391`, `mobile/stock-product/detail-view.vue:145-176` |

**ไม่ต้องแก้ backend:** endpoint `StockProduct/Get` (`jewelry.Model/Stock/Product/Get/Response.cs`) รับ `{ stockNumber }` คืน 1 ชิ้นแบบ exact พร้อม receiptNumber/Type/Date, productionDate, status, qty/qtyReserved/qtyAvailable, earringStemSize, tagPriceMultiplier, createBy/Date, updateBy/Date, `materials[]` — store มี `productStore.fetchDataGet({ formValue })` แล้ว; ยอดตาม storage location ใช้ `StockBalance` store เดิม

---

## Layout (frame ที่เสนอ)

### 1) คอลัมน์ action ในแถว — 5 ปุ่ม → 2 ปุ่ม

```
เดิม   │ [▤][✎][▦][◷][▩] │ img │ DK-9K-1XR-2060 │ 9K01966 │ ...     (พิมพ์ป้าย/แก้ไข/ต้นทุน/ประวัติ/QR)
ใหม่   │ [◉] [✎]          │ img │ DK-9K-1XR-2060 │ 9K01966 │ ...     (ดูรายละเอียด / แก้ไข)
```
- `[◉]` = `ButtonGeneric variant="main" icon="bi-eye" :title="$t('common.btn.view')"` → `$router.push({ name: 'stock-product-detail', params: { stockNumber } })`
- `[✎]` = `ButtonGeneric variant="outline" icon="bi-pencil" :title="$t('common.btn.edit')"` → เปิด `update-view.vue` เดิม (เหมือนเดิม)
- ปุ่มที่หายจากแถว (พิมพ์ป้าย / ต้นทุน / ประวัติตีราคา / QR) **ย้ายไป header ของหน้า detail** — modal ปลายทางทั้ง 4 ไม่แก้ (import จาก `../list/…` เดิม); wiring ของ 4 ตัวนี้ในหน้า list ถอดออก (dead code)

### 2) Expand ใหม่ — วัตถุดิบ (ซ้าย) + ยอดคงเหลือ (ขวา)

```
▾ │ [◉][✎] │ ▪ │ DK-9K-1XR-2060 │ 9K01966 │ R08630SA3WL2 │ R-8630SW │ 9K RING WG S │ …(scroll →)
  ┌─ .expand-container  (position: sticky; left: 0; max-width ≈ 1200px) ──────────────────────────────┐
  │ ┌╴◇ ทอง | เพชร | พลอย ╶───────────────────────────────┐ ┌╴▤ ยอดคงเหลือ ╶──────────────────────────┐ │
  │ │ ประเภท     รหัส/ชื่อ  ขนาด     แหล่ง  จำนวน  น้ำหนัก   ราคา │ │ ล็อตนี้                                  │ │
  │ │ Sapphire   —         3.0-3.1m  —     1 pc  0.160 ct. 500.00 │ │ ┌────────┐ ┌────────┐ ┌────────┐         │ │
  │ │ White Gold 9K WG     —         —     0     0.850 g.    0.00 │ │ │คงเหลือ │ │  จอง   │ │พร้อมขาย│         │ │
  │ │                                       รวมราคาวัตถุดิบ 500.00 │ │ │  1.00  │ │  0.00  │ │  1.00  │         │ │
  │ └───────────────────────────────────────────────────────┘ │ └────────┘ └────────┘ └────────┘         │ │
  │                                                           │ ยอดรวม SKU ตาม Storage Location          │ │
  │                                                           │ Storage Location   คงเหลือ  จอง  พร้อมขาย │ │
  │                                                           │ MAIN — คลังหลัก      1.00   0.00    1.00 │ │
  │                                                           │ รวม                 1.00   0.00    1.00 │ │
  │                                                           └──────────────────────────────────────────┘ │
  └────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
- grid `minmax(0, 3fr) minmax(0, 2fr)`; ≤1200px → 1 คอลัมน์ (วัตถุดิบก่อน ยอดคงเหลือตาม)
- `position: sticky; left: 0` ทำให้เนื้อหา expand **ติดขอบซ้ายของจอเสมอ** เวลาเลื่อนตารางแนวนอน (แทนการ fix 750px)
- ทั้ง 2 กล่องเป็น component ใช้ซ้ำกับหน้า detail: `material-table.vue`, `balance-panel.vue`

### 3) หน้าใหม่ `/stock-product-detail/:stockNumber` — "รายละเอียดสินค้า"

```
╔═ PageHeaderGeneric ═══════════════════════════════════════════════════════════════════════════════════════╗
║ (←)  รายละเอียดสินค้า · DK-9K-1XR-2060        [▤ พิมพ์ป้ายสินค้า] [▦ ดูต้นทุน] [◷ ประวัติตีราคา] [▩ QR แชร์] [✎ แก้ไข] ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╣
                                                 ghost ×4 (outline ขาวบนพื้น maroon)      is-primary (filled ขาว)
┌╴▣ รูปภาพสินค้า ╶────────────┐ ┌╴▤ ข้อมูลสินค้า ╶─────────────────────────────────────────────────────────────┐
│      ┌────────────────┐      │ │ สถานะคงคลัง      [มีของพร้อมขาย]                                             │
│      │                │      │ │ เลขที่ผลิต (ใหม่)  DK-9K-1XR-2060          เลขที่ผลิต (เก่า)  9K01966            │
│      │    280×280     │      │ │ รหัสสินค้า        R08630SA3WL2            แม่พิมพ์           R-8630SW           │
│      │  preview=true  │      │ │ ชื่อสินค้า EN      9K RING WG S            ชื่อสินค้า TH       9K RING WG S       │
│      │                │      │ │ ประเภทสินค้า      แหวน                    ขนาด / ก้านต่างหู   #55 / —            │
│      └────────────────┘      │ │ สีของทอง/เงิน     WG                      ประเภททอง/เงิน     9K                 │
│                              │ │ W.O.             2603-0021               จัดเก็บ            MAIN — คลังหลัก     │
│                              │ │ ราคาขาย          12,500.00               ตัวคูณราคาป้าย     × 1.00             │
│                              │ │ หมายเหตุ         —                                                             │
└──────────────────────────────┘ └───────────────────────────────────────────────────────────────────────────────┘
┌╴◇ ทอง | เพชร | พลอย ╶────────────────────────────────────────────────────────────────────────────────────────┐
│ ประเภท     รหัส/ชื่อ    เกรด   ขนาด      แหล่งผลิต   จำนวน    น้ำหนัก      ราคา                                  │
│ material-table.vue ตัวเดียวกับ expand — โหมด full (เพิ่มคอลัมน์ เกรด)                        รวมราคาวัตถุดิบ  500.00 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌╴▤ ยอดคงเหลือ ╶────────────────────────────────────────┐ ┌╴◷ การรับเข้า / ประวัติ ╶───────────────────────────────┐
│ balance-panel.vue ตัวเดียวกับ expand                    │ │ เลขที่ใบรับ   GR2603-0007      ประเภทงานรับ   ผลิต       │
│ (3 tile ล็อตนี้ + ตาราง SKU ตาม storage location)       │ │ วันที่รับ     12/03/2569       วันที่ผลิต     10/03/2569 │
│                                                        │ │ ผู้รับสินค้า  สมชาย             รับเมื่อ       12/03/2569 │
│                                                        │ │ แก้ไขล่าสุด   —                                         │
└────────────────────────────────────────────────────────┘ └────────────────────────────────────────────────────────┘
```
- header actions: 4 ปุ่ม ghost (`ButtonGeneric variant="outline"` + label — PageHeaderGeneric deep-style เป็น ghost ขาวอยู่แล้ว) + `แก้ไข` `class="is-primary"` ขวาสุด
- ปุ่ม 5 ตัวเปิด modal เดิมที่ฝังไว้ในหน้านี้: `update-view.vue` (บันทึกสำเร็จ → reload item), `barcode-view.vue`, `cost-detail-modal.vue`, `cost-history-modal.vue`, `product-share-dialog.vue` — ไม่แก้ทั้ง 5 ไฟล์
- (←) → `$router.back()`; ถ้าไม่มี history (เปิดลิงก์ตรง) → push `stock-product-list`
- ≤1024px: กล่องบน (รูป | ข้อมูล) และล่าง (ยอด | รับเข้า) พับเป็น 1 คอลัมน์; header `flex-wrap` (มีอยู่แล้วใน PageHeaderGeneric)

### 4) State ไม่พบสินค้า (เปิดลิงก์ผิด / ถูกลบ)

```
╔═ PageHeaderGeneric ═══════════════════════════════════╗
║ (←)  รายละเอียดสินค้า · DK-XXXX                        ║   (ไม่มี actions)
╚═══════════════════════════════════════════════════════╝
┌───────────────────────────────────────────────────────┐
│                 ◌  ไม่พบสินค้า                        │
│        เลขที่ผลิต DK-XXXX ไม่มีในระบบ                  │
│                [ กลับหน้าตรวจคลัง ]                    │
└───────────────────────────────────────────────────────┘
```

---

## Data flow ของหน้า detail

```
route /stock-product-detail/:stockNumber
  → created(): productStore.fetchDataGet({ formValue: { stockNumber } })        (StockProduct/Get — exact, 1 ชิ้น)
      ↓ null → notFound state
      ↓ item → mergeBalanceIntoItems([item], { balanceStore, locationStore })  (composable ใหม่ — ตรรกะเดิมจาก list)
  → render 5 กล่อง (ทุก field จาก item + item.slocBalances)
  → header action → เปิด modal เดิม; update-view closeModal('fetch') → loadItem() ใหม่
```

| ส่วน | field | มาจาก |
|---|---|---|
| รูป | `imagePath` (`type="STOCK-PRODUCT"`, `preview=true`) · ไม่มีรูป → `assets/no-image.png` | Get |
| ข้อมูลสินค้า | status (chip), stockNumber, stockNumberOrigin, productNumber, mold, productNameEn/Th, productTypeName, size, earringStemSize, productionType, productionTypeSize, wo+woNumber, location, productPrice, tagPriceMultiplier, remark | Get |
| วัตถุดิบ | `materials[]` — type, typeCode(+label ผ่าน master gold), size, region, qty+qtyUnit, weight+weightUnit, price | Get |
| ยอดคงเหลือ ล็อตนี้ | `getPieceQty/Reserved/Available(item)` (`services/utils/stock-piece-qty.js`) | Get |
| ยอดรวม SKU ตาม sloc | `slocBalances[]` (+ แถวรวม) | composable merge (StockBalance store) |
| การรับเข้า / ประวัติ | receiptNumber, receiptType, receiptDate, productionDate, createBy+createDate, updateBy+updateDate (แสดงเมื่อมี) | Get |

> Get ไม่มี `lastMove*` (มีเฉพาะ List เมื่อขอ) → ไม่โชว์ "ย้ายคลังล่าสุด" ในเฟสนี้

---

## Spec — ค่าที่ใช้ (token เท่านั้น)

| ส่วน | property | token / ค่า |
|---|---|---|
| ปุ่มในแถว | component | `ButtonGeneric` ×2 (`main bi-eye` / `outline bi-pencil`) + `:title` — ไม่มี label (กฎ #10 หน้า list) · gap `var(--sp-xs)` |
| route | router | `stock-product-routes.js` children: `path: '/stock-product-detail/:stockNumber'`, `name: 'stock-product-detail'`, `Displayname {en:'Stock Product Detail', th:'รายละเอียดสินค้า'}`, `minorShow: false`, `permissions: [PERMISSIONS.STOCK_PRODUCT]` |
| page container | class | `.app-container` (เหมือนหน้าอื่นใน layout dashboard) |
| header | PageHeaderGeneric | `:title` = `$t('view.stock.product.detailPageTitle') + ' · ' + stockNumber`; `@back="goBack"`; `#actions` 5 ปุ่ม; `แก้ไข` มี `class="is-primary"`; ปุ่มมี label ทั้งหมด (ไม่ใช่หน้า list) |
| กล่องทุกใบ | SectionCardGeneric | `headerStyle="legend" accent="main"` + icon: รูป `bi-image` · ข้อมูล `bi-clipboard2-check-fill` · วัตถุดิบ `bi-gem` · ยอดคงเหลือ `bi-box-seam` · รับเข้า `bi-clock-history`; ระยะระหว่างกล่อง `var(--sp-lg)` (grid gap / margin) |
| grid บน (รูป | ข้อมูล) | grid | `grid-template-columns: 320px minmax(0, 1fr); gap: var(--sp-lg)`; ≤1024px → `1fr` |
| grid ล่าง (ยอด | รับเข้า) | grid | `repeat(2, minmax(0, 1fr)); gap: var(--sp-lg)`; ≤1024px → `1fr` |
| รูป | ImagePreview | 280×280, `preview=true`; ไม่มีรูป → `no-image.png` ขนาดเดียวกัน; จัดกลาง |
| ฟิลด์ข้อมูลสินค้า / รับเข้า | grid ฟิลด์ | `.detail-header-grid` pattern (gold-loss detail): `repeat(2, minmax(0,1fr))` gap `var(--sp-sm) var(--sp-lg)`; label `var(--fs-sm)` `var(--base-sub-color)` w400; value `var(--fs-base)` **w600** (user feedback 2026-09-09: label/value ซ้อนกันแยกยาก → เพิ่ม bold ให้ value ไม่ใส่เส้นคั่น); เลขที่ผลิต 2 ตัว `font-weight: 700; color: var(--base-font-color)`; หมายเหตุ span 2 คอลัมน์ |
| status chip | class | IN_STOCK → bg `var(--color-green-bg)` text `var(--base-green)`; RESERVED → token warning ที่ระบบมี (ตรวจด้วย MCP `validate_value`); SOLD → bg `var(--color-border)` text `var(--base-sub-color)`; radius ตาม chip มาตรฐานของระบบ |
| ล็อตนี้ (3 tile) | grid + tile | `repeat(3, minmax(0,1fr)); gap: var(--sp-sm)`; border `1px solid var(--color-border)` radius `var(--radius-md)` padding `var(--sp-md)`; ตัวเลข `var(--fs-xl)` 700 `tabular-nums`; label `var(--fs-sm)` sub; tile พร้อมขาย bg `var(--color-green-bg)` |
| ตาราง sloc / วัตถุดิบ | BaseDataTable | `:paginator="false"`, header i18n ทุกคอลัมน์, ตัวเลข right `format: 'decimal2'`; แถวรวม sloc เป็นแถวสุดท้าย (ตรรกะเดิม `slocBalanceRows`) |
| material-table | prop `variant` | `'compact'` (expand) · `'full'` (detail: + เกรด); ใต้ตาราง `รวมราคาวัตถุดิบ` = Σ price `decimal2` ชิดขวา; ตารางกว้างเกิน → scroll-x ในกล่องตัวเอง |
| expand container | layout | `position: sticky; left: 0; max-width: min(1200px, calc(100vw - 4 * var(--sp-2xl))); padding: var(--sp-md) var(--sp-lg)`; grid `minmax(0,3fr) minmax(0,2fr)` gap `var(--sp-lg)`; ≤1200px → 1 คอลัมน์; คง bg `.expanded-row-content` เดิม |
| empty / not found | ข้อความ | วัตถุดิบว่าง → `materialsEmpty`; sloc ว่าง → `common.label.noData`; ไม่พบสินค้า → `notFoundTitle` + `notFoundDesc` + ปุ่ม `backToList` (`ButtonGeneric variant="outline"`) |

> ทุกค่าต้องเป็น token — ลบ `#f0f0f0`/`#f8f9fa`/`10px 20px`/`750px` ของ expand เดิมทิ้ง

---

## States

| State | สิ่งที่เปลี่ยน |
|---|---|
| แถวปกติ (list) | 2 ปุ่ม `[◉][✎]` + tooltip จาก `:title` |
| แถวขยาย + เลื่อนแนวนอน | expand ติดขอบซ้ายเสมอ (sticky); 2 กล่อง legend |
| detail กำลังโหลด | header ขึ้นทันที (title จาก route param) · เนื้อหายังไม่ render (`v-if="item"`) — ไม่ต้อง spinner เอง (`fetchDataGet` ใช้ `skipLoading`) |
| detail ไม่พบสินค้า | frame 4: header ไม่มี actions + การ์ด not found + ปุ่มกลับ |
| ยังไม่ merge balance | tile ล็อตนี้ขึ้นจาก item ทันที · ตาราง sloc `noData` แล้วอัปเดตเองเมื่อ merge เสร็จ (reactive) |
| ไม่มีวัตถุดิบ / ไม่มีรูป | `materialsEmpty` · placeholder `no-image.png` |
| status | chip IN_STOCK / RESERVED / SOLD; ไม่มีค่า → ซ่อน chip |
| กด แก้ไข | เปิด `update-view` ด้วย `modelStock = item`; `closeModal('fetch')` → `loadItem()` |
| กด พิมพ์ป้าย / ต้นทุน / ประวัติ / QR | เปิด `barcode-view` / `cost-detail-modal` / `cost-history-modal` / `product-share-dialog` เดิม (ไม่แก้ทั้ง 4) |
| (←) | `router.back()`; ไม่มี history → push `stock-product-list` |
| ≤1024px | grid บน/ล่างเป็น 1 คอลัมน์ · header actions wrap |

---

## Diff จากของเดิม

- แถว list: 5 native `<button>` → 2 `ButtonGeneric` (ดูรายละเอียด → หน้าใหม่ / แก้ไข → modal เดิม); ถอด wiring barcode/cost/history/share ออกจาก `data-table-view.vue` + `index-view.vue` ของ list (modal files ไม่แตะ)
- expand: `h6` เขียนเอง + `width: 750px` + hex/px → 2 `SectionCardGeneric legend` ในกริด + `position: sticky; left: 0`; **วัตถุดิบซ้าย / ยอดคงเหลือขวา**; เพิ่ม **ล็อตนี้** (3 tile) เหนือตาราง SKU; header `'Storage Location'` → i18n
- ใหม่: หน้า `/stock-product-detail/:stockNumber` (5 กล่อง + header 5 action) โหลดเองจาก `StockProduct/Get` — deep-link/refresh ได้
- ใหม่: `material-table.vue`, `balance-panel.vue` (shared list ↔ detail) · `useStockBalanceMerge.js` (ยุบตรรกะ merge ซ้ำ — web ใช้ทั้ง 2 ที่, mobile ยังของเดิม)
- field ที่ยังไม่เคยโชว์บน web: receiptNumber, receiptType, receiptDate, productionDate, updateBy/updateDate, earringStemSize, tagPriceMultiplier, status

**Deviation จาก spec ตอน map เข้าโค้ด (2026-09-09):**
- `getDiamondType` เดิมมี bug เว้นวรรคซ้ำ + วงเล็บค้างเมื่อไม่มี typeCode (`Diamond  ${type ? '(...)' : ''}` → "Diamond  " โดดๆ) — ย้ายมา `material-table.vue` แล้วแก้เป็น `` `Diamond${typeCode ? ` (${typeCode})` : ''}` `` (ไม่มี dangling space/parens); พฤติกรรมกรณีมี typeCode เหมือนเดิมทุกประการ
- คอลัมน์ "รหัส/ชื่อ" (`typeCode`) ของ `material-table.vue` แสดง `—` เมื่อ `type === 'Diamond'` (โค้ดไปอยู่คอลัมน์ "เกรด" แทนในโหมด full) — สอดคล้องกับพฤติกรรมเดิมของตาราง edit ใน `update-view.vue` ที่ไม่ได้ระบุไว้ตรงๆ ใน spec แต่ยึดตามของเดิมเพื่อไม่ให้ค่าไปซ้ำ 2 คอลัมน์
- คอลัมน์ตาราง (`minWidth`/`width` เป็น px string ใน `columns` config ของ `BaseDataTable`) ไม่นับเป็น "hardcode px" ตามกฎ token — เป็น convention เดิมของทั้งระบบสำหรับ config ตาราง (ไม่มี token เทียบเท่า), คงรูปแบบเดิมตามไฟล์ข้างเคียงทั้งหมด

---

### Gotchas ที่พบตอน verify บนหน้าจริง (2026-09-09)

- **sticky ใน expansion ของ PrimeVue DataTable** — `td` ของ `.p-datatable-row-expansion` มี `overflow: hidden` จาก theme ทำให้ `position: sticky; left: 0` ของ `.expand-container` ยึดกับ td แทน `.p-datatable-wrapper` (เนื้อหาเลื่อนหายตามตาราง) → ต้อง override ใน `data-table-view.vue`: `.base-data-table :deep(.p-datatable-row-expansion > td) { overflow: visible }` แล้ว sticky จึงทำงาน (ทดสอบเลื่อน 900/1400px เนื้อหายังติดขอบซ้าย)
- **vue-i18n ตัด `|` เป็น plural** — key `materialsTitle: 'ทอง | เพชร | พลอย'` ถูก vue-i18n ตีความเป็น pluralization แล้ว render เหลือ `"เพชร"` (บั๊กเดิมที่มีอยู่ใน update-view/mobile ด้วย) → แก้ค่าเป็น `"ทอง {'|'} เพชร {'|'} พลอย"` (literal interpolation) ทั้ง th/en — หัวข้อกล่องวัตถุดิบทุกจอแสดงครบ

---

## Mapping → โค้ด (Phase 3)

| ไฟล์ | แก้อะไร |
|---|---|
| `src/router/web/stock/product/stock-product-routes.js` | เพิ่ม child route `stock-product-detail` (ตาม spec) + lazy import `views/stock/product/detail/index-view.vue` |
| `src/views/stock/product/detail/index-view.vue` (ใหม่) | หน้า detail: `PageHeaderGeneric` + 5 กล่อง; `loadItem()` → `fetchDataGet` + merge; state `item`/`notFound`; ฝัง modal เดิม 5 ตัว (import จาก `../list/modal/*`, `../list/components/*`, `@/components/public/product-share-dialog.vue`); `goBack()` |
| `src/views/stock/product/components/material-table.vue` (ใหม่, shared) | props `items`, `variant: 'compact'\|'full'`; BaseDataTable read-only + Σ ราคา + empty; label ประเภทจาก master gold (ย้าย `getGoldType/getGemType/getDiamondType` มาที่นี่ที่เดียว) |
| `src/views/stock/product/components/balance-panel.vue` (ใหม่, shared) | props `item`; 3 tile ล็อตนี้ (`stock-piece-qty.js`) + ตาราง sloc + แถวรวม (ย้าย `slocBalanceRows`/`slocColumns` มาจาก expand) |
| `src/composables/useStockBalanceMerge.js` (ใหม่) | `export async function mergeBalanceIntoItems(items, { balanceStore, locationStore })` — ตรรกะเดิมจาก `data-table-view.vue:359-391` (ยังเติม `skuQty*` + `slocBalances`) |
| `src/views/stock/product/list/components/data-table-view.vue` | action column → 2 `ButtonGeneric`; `onView()` push route; ใช้ composable merge; ถอด `barcode` modal + emits `view-cost`/`view-history`/`show-share` |
| `src/views/stock/product/list/index-view.vue` | ถอด `costDetailModal`/`costHistoryModal`/`productShareDialog` + handler (ย้ายไปหน้า detail) |
| `src/views/stock/product/list/components/data-expand-view.vue` | เหลือ layout: `.expand-container` sticky + grid + 2 `SectionCardGeneric legend` ครอบ `material-table` / `balance-panel`; ลบ SCSS hardcode ทั้งหมด |
| `src/language/view/stock/th.js` / `en.js` (`product.*`) | เพิ่ม `detailPageTitle`, `balanceTitle`, `lotBalanceTitle`, `slocHeader`, `materialsEmpty`, `materialTotalPrice`, `receiptInfoTitle`, `receiptNumber`, `receiptDate`, `productionDate`, `receivedAt`, `updatedBy`, `tagPriceMultiplierLabel`, `materialGrade` (ถ้ายังไม่มี), `notFoundTitle`, `notFoundDesc`, `backToList`, `shareQr` (หรือ reuse `view.public.share.buttonTitle`) — reuse: `stockInfo`, `imageProduct`, `materialsTitle`, `slocBalanceTitle`, `slocQty*`, `slocTotal`, `qtyOnHand/qtyReserved/qtyAvailable`, `pieceStatus`, `inStock/reserved/sold`, `viewCost`, `viewHistory`, `printBarcode`, `earringStemSize`, `receiptType`, `receiver`, `common.btn.view/edit` |
| `src/views/stock/product/list/stock-product-list.md` | อัปเดต component structure + action buttons + expand + หน้า detail ใหม่ |
| `docs/design-system.md` | Decision Log 2026-09-xx: stock-product row actions 5→2 · expand sticky-left + legend cards · หน้า detail ใหม่ (archetype C) — blueprint นี้ |

- **ไม่แตะ:** `update-view.vue`, `barcode-view.vue`, `cost-detail-modal.vue`, `cost-history-modal.vue`, `product-share-dialog.vue`, `views/mobile/**`, backend
- delegate: **@ui-implementer** · verify: `npx eslint` + `npx vite build` + chrome-mcp `http://localhost:2002/stock-product-list` → กด [◉] → `/stock-product-detail/DK-9K-1XR-2060` (+ เปิดลิงก์ตรง/refresh, กด ←, ลอง stockNumber ปลอม → not found, ย่อ ≤1024) — **read-only เท่านั้น** (API local ต่อ DB prod) ห้ามกดบันทึกใน แก้ไข
- บันทึก **Design Decision Log** ใน `docs/design-system.md` แล้วเปลี่ยนสถานะ blueprint → 🚀 mapped

---

## Assumptions (รอ user ยืนยัน)

1. ปุ่ม พิมพ์ป้าย / ต้นทุน / ประวัติ / QR **ย้ายไป header ของหน้า detail** (ยังใช้ได้ ไม่แก้ modal เดิม) และถอด wiring ออกจากหน้า list
2. หน้า detail โหลดเองจาก `StockProduct/Get` (ไม่พึ่ง row data จาก list) เพื่อให้ refresh/แชร์ลิงก์ได้
3. Expand: **วัตถุดิบซ้าย / ยอดคงเหลือขวา** + tile "ล็อตนี้" คู่กับตาราง SKU
4. Web แสดง **เลขใหม่ก่อนเลขเก่า** (กติกาเลขเก่าเด่นใช้เฉพาะ mobile ตามคำสั่ง 2026-09-08)

---

## Screenshots

- before: screenshot จาก user 2026-09-09 (แถว 5 ปุ่ม + expand 750px มี 2 ตาราง)
- after: แนบหลัง map เข้าโค้ดและเปิดดูจริง
