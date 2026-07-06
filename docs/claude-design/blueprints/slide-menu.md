# Blueprint — Slide Menu (Navigation Drawer)

> พิมพ์เขียว design ของ slide menu (drawer เมนูงาน) — source of truth ของดีไซน์ที่ approve แล้ว ใช้ตอน map เข้าโค้ด

---

## Meta

| | |
|---|---|
| **Component / Archetype** | Navigation Drawer — `src/components/layout/main-bar.vue` (`.custom-sidebar*` shell) + `src/components/layout/side-bar.vue` (menu tree) |
| **สถานะ** | 🚀 mapped |
| **วันที่ (อัปเดตล่าสุด)** | 2026-07-06 |
| **Ref ที่ใช้** | `src/components/custom/page-title.vue` (`.page-title-filled` — dot texture + translucent icon box), `main-bar.vue` top bar gradient |
| **Claude Design** | ไม่มี frame ภายนอก — ออกแบบต่อยอดจาก filled-surface pattern ที่มีอยู่แล้วในระบบ |
| **ทางเลือกที่เลือก** | **Maroon filled + Teal active** — drawer เป็นส่วนต่อของ top bar (พื้น maroon), active route ใช้ teal ให้เด่นตัดกับพื้น (แทนที่จะใช้ maroon ซ้ำซึ่งจะกลืนพื้น) |

---

## Layout (frame ที่ approve)

```
┌──────────────────────────────────────┐  ◀ .custom-sidebar
│ ⬢ เลือกงาน                      [ ✕ ] │  header: maroon เข้ม + dot texture, icon box translucent
├──────────────────────────────────────┤     (i18n: sidebar.title / common.btn.close)
│  พื้น = linear-gradient(180°,          │
│         #921313 → #360505) + dots      │
│                                        │
│  ┌────────────────────────────────┐   │  main-menu-wrapper (rest)
│  │ 🏭 การผลิต               ⌄  ⑤ │   │   bg rgba(255,255,255,.06), radius md
│  └────────────────────────────────┘   │   ⑤ = counter (red badge --base-red เมื่อ >0)
│  ┌────────────────────────────────┐   │  main-menu-active (เปิดอยู่)
│  │ 🏭 การผลิต               ⌃    │◀──┼── bg rgba(255,255,255,.15)
│  │   ├ ➤ วางแผนการผลิต            │   │  submenu (translucent อ่อนกว่า)
│  │   ├ ➤ ติดตามแผน       ← teal ██│◀──┼── router-link-active = พื้น teal (--base-green) ขาว
│  │   └ ↳ รายการย่อย               │   │  children (translucent อ่อนสุด)
│  └────────────────────────────────┘   │
│  ──────────────────────────────────   │  separator rgba(255,255,255,.15)
│  ┌────────────────────────────────┐   │
│  │ ⏻ ออกจากระบบ                  │   │  logout: icon/label --base-red, bg red tint
│  └────────────────────────────────┘   │
└──────────────────────────────────────┘
note: layout/ลำดับเมนู/accordion/counter logic คงเดิมทุกอย่าง — เปลี่ยนแค่ผิว (สี/พื้น/spacing) + i18n
```

---

## Spec — ค่าที่ใช้ (token เท่านั้น)

| ส่วน | property | token / ค่า |
|---|---|---|
| drawer bg + texture | background | `@include filled-surface` (`var(--surface-inverse-gradient)` + `var(--surface-dot)`, canonical alpha .08) |
| drawer width/shadow | width / box-shadow | `320px` (คงเดิม) / คงเดิม |
| header padding | padding | `var(--sp-lg)` |
| header icon box | bg / radius | `var(--overlay-white-solid)` (.15) / `var(--radius-md)` |
| header border-bottom | border-bottom | `var(--overlay-white-hover)` (.08, nearest ของเดิม .1) |
| main-menu item rest | background | `var(--overlay-white-subtle)` (.06) |
| main-menu item hover | background | `var(--overlay-white-hover)` (.08) |
| main-menu item expanded | background | `var(--overlay-white-subtle)` (.06) |
| main-menu radius | border-radius | `var(--radius-md)` |
| sub-menu item rest/hover/expanded | background | `var(--overlay-white-subtle)` (.06) / `var(--overlay-white-hover)` (.08) / `var(--overlay-white-subtle)` (.06) |
| sub-menu radius | border-radius | `var(--radius-sm)` |
| children item rest/hover | background | `var(--overlay-white-subtle)` (.06) / `var(--overlay-white-hover)` (.08) |
| children radius | border-radius | `var(--radius-sm)` |
| route active (leaf) | background | `var(--base-green)` (teal accent — ไม่ใช้ maroon ซ้ำ) |
| arrows / submenu icon | color | `var(--on-inverse-dim)` (.65) |
| menu label / submenu text | color | `var(--on-inverse-muted)` (.85) |
| section label | color | `var(--on-inverse-label)` (.5) |
| separator / bottom-line / section divider | background | `var(--overlay-white-solid)` (.15) |
| scrollbar thumb | background | `var(--overlay-white-strong)` (.25) |
| counter (rest, no value) | background | `var(--overlay-white-solid)` (.15) |
| counter (active-state, on teal) | background | `var(--overlay-white-strong)` (.25) |
| counter (>0 badge) | background | `var(--base-red)` |
| logout bg / hover | background | `rgba(255,77,77,.15)` / `rgba(255,77,77,.25)` |
| logout icon/label | color | `var(--base-red)` |
| spacing (padding เดิม 8/12/16/4px) | padding | `var(--sp-sm)` / `var(--sp-md)` / `var(--sp-lg)` / `var(--sp-xs)` |

> **อัปเดต 2026-07-06 (token pass)**: ทุก `rgba(255,255,255,x)` ในตารางด้านบนถูกยกเป็น `--overlay-white-*` / `--on-inverse-*` token กลางแล้ว (ดู `docs/design-system.md` หัวข้อ "Filled / Inverse Surface") — เหลือเฉพาะ `rgba(255,77,77,x)` (logout red tint) ที่ยังไม่มี token เฉพาะ (นอกขอบเขต pass นี้)

---

## States (ครบทุก state ที่ component มี)

| State | สิ่งที่เปลี่ยน |
|---|---|
| default (menu ปิด) | item bg translucent .06 (`--overlay-white-subtle`) |
| hover | item bg translucent .08 (`--overlay-white-hover`) |
| expanded (accordion เปิด) | item bg translucent .06 (`--overlay-white-subtle`), arrow หมุน (คง logic เดิม) |
| route active (leaf link) | bg teal (`--base-green`), text ขาว, counter overlay `.25` |
| counter มีค่า > 0 (ไม่ active) | red badge (`--base-red`) |
| logout item | red tint bg + hover เข้มขึ้น, icon/label แดง |
| drawer เปิด/ปิด | transform slide (คงเดิม 0.3s) — ไม่เปลี่ยน |

---

## Diff จากของเดิม

- drawer bg: เทา hardcode (`var(--base-sub-color)` / `#2d2d2d` ฯลฯ) → maroon gradient แนวตั้ง + dot texture (เข้าชุด top bar)
- route active accent: maroon (`var(--base-font-color)`) ซึ่งกลืนกับพื้น maroon ใหม่ → **teal** (`var(--base-green)`) ให้เด่น
- header icon: ธรรมดา → กล่อง translucent white (`.15`) + `radius-md` (เข้าชุด filled-icon-box ของ page-title)
- ทุก hardcode สี (arrows `#888`, separator `#444/#555`, scrollbar `#555`, logout `#dc3545`) → translucent-white scale หรือ `--base-red`
- radius/padding px ทั้งหมด → token (`--radius-sm/md`, `--sp-*`)
- header text "เลือกงาน" + logout "ออกจากระบบ" → i18n (`sidebar.title`, `common.btn.logout`)
- `showMenuName()` คืน `.th` เสมอ → locale-aware (`this.$i18n.locale` พร้อม fallback `.th`)
- ลบ dead code `.social-banner`/`.social-icons`/`.social-icon` (SCSS + template comment)

---

## Mapping → โค้ด (Phase 3)

| ไฟล์ที่ต้องแก้ | แก้อะไร |
|---|---|
| `src/components/layout/main-bar.vue` | SCSS `.custom-sidebar` (gradient + dot texture), `.sidebar-header`/`.sidebar-title` (icon box translucent), i18n header text + logout confirm title |
| `src/components/layout/side-bar.vue` | SCSS ทั้งหมด (grey → token/translucent ตามตาราง), `showMenuName()` locale-aware, logout label i18n, ลบ dead code |
| `src/language/common/th.js` + `en.js` | เพิ่ม `common.btn.logout` |
| `src/language/**` (namespace ใหม่ `sidebar`) | เพิ่ม `sidebar.title` |

- delegate: **@ui-implementer** · verify: `npm run lint` + `npm run build` (chrome-mcp ผู้ใช้ verify เอง — ต้อง login)
- บันทึก **Design Decision Log** ใน `docs/design-system.md` (2026-07-06, layout/slide-menu)
- **ไม่เปลี่ยน behavior**: เปิด/ปิด, ESC/overlay/route-change close, accordion toggle, permission/route filtering, counter fetch, width 320px, transition timing — visual + i18n เท่านั้น

---

## Screenshots

- (ผู้ใช้ verify ด้วย chrome MCP แยกหลัง implement — ต้อง login)

---

## Menu section grouping — 3 labeled sections + dividers (flat muted items)

> อัปเดต 2026-07-06 — ต่อยอดจาก maroon+teal drawer (ด้านบน); **supersede** gold-accent grouping (2026-07-06 รอบแรก)

Ref เพิ่มเติมจากผู้ใช้ (dark sidebar: MENU/DISCOVERY/GENERAL section label + item เรียบ + pill active) — คง maroon bg เดิม (ผู้ใช้ยืนยัน OK) ปรับส่วนอื่นตาม ref:

1. **Item flat/muted** — เลิก translucent-white card ทุกอัน (`rgba(255,255,255,.06)` rest) → พื้นใส (`transparent`), hover `rgba(255,255,255,.08)`, กลุ่มเปิดอยู่ `rgba(255,255,255,.06)`; text ~85% ขาว, icon/arrow muted ~65%
2. **3 section labels + dividers** (แทน gold accent เดิม) — `เมนูหลัก` / `ข้อมูล & รายงาน` / `ตั้งค่า & อื่นๆ` คั่นด้วย uppercase muted label + เส้นบาง
3. **Active pill สะอาด** — คง teal (`--base-green`) เพราะพื้น maroon, `border-radius: var(--radius-md)` ให้ดู pill

**กลไก**: route ระดับบนสุด tag `meta.menuSection`: `'data'` (customer/worker/report-production-worker-wages/master), `'system'` (data-setting/graph-group/downloads-group — เดิมอยู่แล้ว), ไม่ tag = `'main'` (default). Template คำนวณ `sectionOf(index)` เทียบกับตัวก่อนหน้า → render `.menu-section-divider` (ยกเว้นกลุ่มแรก) + `.menu-section-label` เมื่อกลุ่มเปลี่ยน — แทนที่ divider เดิมที่ผูกกับ `tpLineShow` (เหลือเส้นเดียวเหนือกลุ่ม system)

**Visual**:
- `.menu-section-label`: `var(--fs-sm)`, `rgba(255,255,255,.5)`, uppercase + letter-spacing, padding `var(--sp-md) var(--sp-md) var(--sp-xs)`
- `.menu-section-divider`: `border-top: 1px solid rgba(255,255,255,.15)`, margin `var(--sp-sm) var(--sp-xs)`
- `.main-menu-wrapper`/`.sub-menu-wrapper`/`.children-menu-wrapper`: bg `transparent` (rest) → `rgba(255,255,255,.08)` (hover) → `rgba(255,255,255,.06)` (expanded)
- ลบ `.is-system` block (left-border gold + warm tint + gold icon) ทั้งหมด

**ไม่แตะ**: accordion toggle, permission filtering, counter logic, ลำดับเมนู

---

## Menu hierarchy (L1/L2/L3) — เพิ่ม visual distinction 3 ระดับ

> อัปเดต 2026-07-06 — หลัง flatten (section ด้านบน) main/sub/children ดูเป็นชั้นเดียวกัน จึงเพิ่ม indent + rail + น้ำหนักลดหลั่นแยกให้ชัด (SCSS `side-bar.vue` เท่านั้น)

- **L1 (main menu)**: สว่าง/หนา — label `var(--on-inverse)` (ขาวเต็ม) `font-weight: 600`; ไอคอน `var(--on-inverse-muted)`; parent ที่เปิดอยู่ (`main-menu-active`) bg `var(--overlay-white-hover)` เด่นเป็นหัวกลุ่ม
- **L2 (sub menu)**: เยื้องเข้า + เส้น rail ซ้าย + จางลง — `margin/padding` ตาม `--sp-md`, `border-left: 2px solid var(--overlay-white-solid)`; text `0.85rem` weight 400 สี `var(--on-inverse-dim)`
- **L3 (children)**: เยื้องลึกกว่า + rail จางกว่า L2 + จางสุด — `border-left: 1px solid var(--overlay-white-hover)`; text `0.8rem` สี `var(--on-inverse-dim)`
- Active teal pill (`.router-link-active > .btn-link`) ยัง override สีจางของ L2/L3 ได้ปกติ (specificity สูงกว่า)
