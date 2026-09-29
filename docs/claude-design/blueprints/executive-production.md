# Blueprint — Production Insight (Dashboard v2, archetype Dashboard)

> พิมพ์เขียว design ของหมวด **"ผลิต"** ในหน้าภาพรวมผู้บริหาร `/executive` ที่รวม `/production-dashboard` + `/gold-loss-dashboard` + ส่วนผลิตเดิมของ `/executive` เข้าด้วยกัน
> และเป็นต้นแบบ **Dashboard v2** (เมนูย่อย 2 ชั้น + ตัวกรองแบบ slide panel + chip ตัวกรอง + โหลดตามหมวด) สำหรับ dashboard อื่นที่จะรวมตามมา (ขาย/คลัง)

---

## Meta

| | |
|---|---|
| **Component / Archetype** | Dashboard archetype v2 — `src/views/production/insight/` (ใหม่) วางใน 2 ที่: `/executive?tab=production` และ `/production-dashboard` |
| **สถานะ** | ✅ approved |
| **วันที่ (อัปเดตล่าสุด)** | 2026-09-29 |
| **Ref ที่ใช้** | ของเดิมในระบบ: `views/production/dashboard/*`, `views/production/gold-loss-dashboard/*`, `views/report/executive/*` · canonical dashboard เดิม `views/ticket/manage/components/ticket-dashboard.vue` |
| **Claude Design** | — (ยังไม่ส่ง; wireframe อยู่ในไฟล์นี้ + artifact สำหรับ review) |
| **ทางเลือกที่เลือก** | **A** — component กลางชุดเดียว วาง 2 ที่ (boss ที่ /executive, ฝ่ายผลิตที่ /production-dashboard) ตัวเลขชุดเดียวกัน · ตัด B (ย้ายมา /executive ที่เดียว) เพราะฝ่ายผลิตเข้า /executive ไม่ได้ |

---

## ปัญหาที่แก้

| ปัญหา | ตอนนี้ | หลังออกแบบใหม่ |
|---|---|---|
| ข้อมูลเยอะเกินหน้าเดียว | ~20 กล่องจาก 3 หน้า (production 3 tab + gold-loss 3 tab + executive) | แบ่ง 5 หมวดย่อย แต่ละหมวด 1–2 จอ |
| ตัวกรองกินพื้นที่ + ซ้ำ | SearchBar เต็มความกว้าง 11 ช่อง + ช่วงวันที่ซ้ำ 3 ที่ (filter bar / capacity / monthly) | ปุ่ม `ตัวกรอง (n)` เปิด slide panel · ช่วงวันที่ที่เดียว · chip แสดงค่าที่ใช้อยู่ |
| ข้อมูลซ้ำ | จำนวนตามสถานะโผล่ 3 ที่ · "แนวโน้มสถานะ" hardcode "คงที่" · endpoint ใบช่างถูกยิง 8 ครั้ง | เหลือกราฟสถานะเดียว · ตัดแนวโน้มปลอม · ดึงข้อมูลใบช่างครั้งเดียวต่อหมวด |
| โหลดช้า | production mount ทุก tab ด้วย `v-show` ยิงทุก endpoint ตอนเปิดหน้า | โหลดเฉพาะหมวดที่เปิด (mount ครั้งแรกแล้วค้าง) + skeleton ระหว่างรอ |

---

## Information Architecture

```
/executive  ─┬─ KPI ข้ามทุก tab (6 ช่องเดิม)
             ├─ [🏭 ผลิต] ──┬─ ภาพรวม        (default)
             │              ├─ งานค้าง
             │              ├─ กำลังการผลิต
             │              ├─ ผลรายเดือน
             │              └─ ทอง
             ├─ [💰 ขายและเงิน]   (รอบถัดไป)
             └─ [📦 คลังสินค้า]    (รอบถัดไป)

/production-dashboard (สิทธิ์ production:view) ── ใช้ ProductionInsightView ตัวเดียวกัน (ไม่มี KPI การเงินของ boss)
/gold-loss-dashboard ── Phase 5: redirect → /production-dashboard?view=gold
```

URL state: `?tab=production&view=<overview|wip|capacity|monthly|gold>&start=&end=&gold=&goldSize=&productType=&customerType=&…`
(อ่านครั้งเดียวใน `created()` + `$router.replace` ตอนเปลี่ยน — pattern เดียวกับ gold-loss-dashboard)

---

## Layout (frame ที่เสนอ)

```
┌─ 📊 ภาพรวมผู้บริหาร · ข้อมูล ณ 29/09/2026 13:23                                    [⬇ Excel] [↻] ┐  DashboardHeaderGeneric #controls
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI ข้ามทุก tab (เฉพาะ /executive)                                                              │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ [🏭 ผลิต] [💰 ขายและเงิน] [📦 คลังสินค้า]                                  TabViewGeneric ชั้น 1 │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │( ภาพรวม│งานค้าง│กำลังการผลิต│ผลรายเดือน│ทอง )  [📅01/04–30/09✕][ทอง:เหลือง18K✕] ล้างทั้งหมด  [⚙ ตัวกรอง (2)]│ │  ← toolbar แถวเดียว (sticky ใต้ mainbar)
│ │  ↑ nav (ToggleGroupGeneric)                    ↑ ActiveFilterChipsGeneric (flex:1, wrap)    ↑ ปุ่มตัวกรอง │ │     ≤1024px: nav ขึ้นบรรทัดแรก, chips+ปุ่ม บรรทัดถัดไป
│ │                                                                                              │ │
│ │ <เนื้อหาหมวด — ดูตารางด้านล่าง>                                                               │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### หมวด "ภาพรวม"
```
┌─ ผลิต · ภาพรวม (dashboard) ───────────────────────────────────────────────────────────────┐
│ [ใบงานทั้งหมด] [กำลังผลิต] [เลยกำหนด] [% สำเร็จ] [ปิดวันนี้] [ปิดเมื่อวาน]     StatCard ×6     │
└───────────────────────────────────────────────────────────────────────────────────────────┘
┌─ งานค้างแยกแผนก (legend) ───────────────┐ ┌─ พยากรณ์ปิดงาน (legend) ─────────────────────┐
│ stacked bar: ≤30 / 30–180 / >180 วัน     │ │ line: ปิดงานรายวัน + run-rate + เป้า          │
└──────────────────────────────────────────┘ └──────────────────────────────────────────────┘
┌─ ปิดงานรายเดือน 13 เดือน (legend) ───────┐ ┌─ ทองเดือนนี้: loss จริง vs ยอมให้ (legend) ──┐
│ column: เดือนปัจจุบันสีต่าง               │ │ แต่ง 1.84% / 2.29% · ฝัง x% / y%             │
│                                          │ │ เกินรายใบ n ใบ · [ดูหมวดทอง ›]                │
└──────────────────────────────────────────┘ └──────────────────────────────────────────────┘
```

### Slide panel ตัวกรอง (FilterPanelGeneric)
```
                                   ┌─ ⚙ ตัวกรอง ───────────────────────── ✕ ┐  filled header (headerVariant main)
                                   │ ใช้กับทุกหมวด                              │  section label
                                   │  ช่วงวันที่   [01/04/2026] – [30/09/2026] │  DateRangeGeneric (default 6 เดือน)
                                   │  ชนิดทอง     [เหลือง ✕][ขาว ✕]      [▾]  │  MultiSelectGeneric
                                   │  ขนาดทอง     [18K ✕]               [▾]  │
                                   │  ประเภทสินค้า [ทั้งหมด]              [▾]  │
                                   │  ประเภทลูกค้า [ทั้งหมด]              [▾]  │
                                   │ ─────────────────────────────────────── │
                                   │ เฉพาะหมวด "งานค้าง"                       │  เปลี่ยนตามหมวดที่เปิดอยู่
                                   │  สถานะ       [ทั้งหมด]              [▾]  │
                                   │  เกินแผน     ( ) ทั้งหมด (•) เฉพาะเกิน    │
                                   │  ค้นหา       [WO / แบบ / รหัสสินค้า     ] │
                                   ├───────────────────────────────────────────┤
                                   │ [ล้าง]                    [✓ ใช้ตัวกรอง]  │  action part
                                   └───────────────────────────────────────────┘
  กว้าง 420px · backdrop · Esc ปิด · แก้ค่าในร่าง (draft) แล้วค่อยกด "ใช้ตัวกรอง" จึงยิง API
```

---

## เนื้อหาแต่ละหมวด (mapping จากของเดิม)

| หมวด | กล่อง | มาจาก (ของเดิม) | endpoint | ตัวกรองเฉพาะหมวด |
|---|---|---|---|---|
| **ภาพรวม** | KPI ผลิต 6 ช่อง | `dashboard-stats-cards` | `Production/Plan/DailyPlan` | — |
| | งานค้างแยกแผนก | executive `production-wip-view` | `ExecutiveReport/ProductionWip` * | — |
| | พยากรณ์ปิดงาน | `completed-forecast-panel` | `Production/Plan/CompletedDailySeries` | — |
| | ปิดงานรายเดือน 13 เดือน | executive | `ExecutiveReport/ProductionWip` * | — |
| | ทองเดือนนี้ (mini) | ใหม่ (สรุปจาก slip-monthly-helpers) | `Worker/ReportGoldLoss{Tang,Slip}ByWorker` | — |
| **งานค้าง** | งานค้างแยกแผนก (ใหญ่) | executive | `ExecutiveReport/ProductionWip` * | สถานะ, เกินแผน, ค้นหา |
| | ใบงานตามสถานะ (กราฟเดียว) | `dashboard-chart-section` (ยุบรวมกับ status-trends + total card) | `DailyPlan` | |
| | ตามประเภทสินค้า / ประเภทลูกค้า | `dashboard-summary-tables` | `DailyPlan` | |
| | ตารางใบงานนิ่ง | executive `StalePlans` | `ExecutiveReport/StalePlans` * | ไม่ขยับเกิน (วัน), แผนก |
| **กำลังการผลิต** | KPI 5 + กราฟ + ตาราง | `capacity-report-view` | `Production/Plan/CapacityReport` | จัดกลุ่มตาม, ช่วง (วัน/สัปดาห์/เดือน) |
| **ผลรายเดือน** | ผลสำเร็จแยกทอง / ประเภท / ลูกค้า | `monthly-success-report` | `Production/Plan/MonthlyReport` | เดือน (ค่าเริ่มต้น = เดือนท้ายของช่วงวันที่) |
| **ทอง** | KPI แต่ง / ฝัง | gold-loss `overview-tab-view` | `Worker/ReportGoldLoss*ByWorker` | ช่าง |
| | เทียบรายเดือน + อันดับช่าง | shared `components/gold-loss/*` (มีแล้ว) | เดียวกัน (ยิงครั้งเดียว) | แผนก, ช่วงอันดับ |
| | ตารางรายเดือนแยกช่าง + ต้องจัดการ | gold-loss overview | เดียวกัน | |
| | เศษทองหลอม / หล่อ | `dashboard-scrap-weight` | `ProductionPlanCost/ScrapWeightDashboard` | ปี |

\* `ExecutiveReport/*` ต้อง `executive:view` — ที่ `/production-dashboard` (ฝ่ายผลิต) ต้องมี endpoint คู่ที่ล็อก `production:view` (ดู Phase 4) หรือย้าย 3 endpoint นี้ไปไว้ใน controller ผลิตที่ล็อกด้วยสิทธิ์ใดสิทธิ์หนึ่ง

**ตัดทิ้ง:** `dashboard-status-trends` (ทิศทาง hardcode "stable" ทุกแถว = ข้อมูลปลอม) · `dashboard-recent-activities` (งานหน้างาน ดูได้ที่ plan-tracking อยู่แล้ว) · การ์ด "ทั้งหมด" ที่ซ้ำกับผลรวมกราฟสถานะ

---

## Component ใหม่ (generic)

| Component | หน้าที่ | Props / Slots / Emits |
|---|---|---|
| `FilterPanelGeneric` | ห่อ `DrawerGeneric` (มีแล้ว: Teleport, backdrop, Esc) เป็น panel ตัวกรอง | props `show`, `title`, `width`(`'420px'`) · slots `#global`, `#section`, `#section-title` · emits `apply`, `clear`, `close` · ถือค่า **draft** ภายใน — ยิง `apply` ครั้งเดียวตอนกดปุ่ม |
| `ActiveFilterChipsGeneric` | แถว chip ค่าตัวกรองที่ใช้อยู่ใต้ header | props `chips: [{ key, label, value }]` · emits `remove(key)`, `clear-all` · ซ่อนทั้งแถวเมื่อ `chips` ว่าง |
| (ใช้ของเดิม) `ToggleGroupGeneric` | เมนูย่อยชั้น 2 | — |
| (ใช้ของเดิม) `ChartGeneric` `loading` / `StatCardGeneric` | skeleton ระหว่างรอ | เพิ่ม prop `loading` ให้ `StatCardGeneric` (แสดงแถบเทาแทนค่า) — backward compatible |

---

## Spec — ค่าที่ใช้ (token เท่านั้น)

| ส่วน | property | token / ค่า |
|---|---|---|
| ปุ่ม `ตัวกรอง (n)` | variant | `ButtonGeneric variant="outline"` + badge นับจำนวน (`--base-font-color` พื้น, `--on-inverse` ตัวอักษร) |
| panel ตัวกรอง | width | `420px` (prop) · ≤768px = 100vw |
| panel header | surface | `DrawerGeneric headerVariant="main"` (filled maroon) |
| panel section label | typography | `var(--fs-sm)` weight 600 สี `var(--base-sub-color)` + เส้นคั่น `var(--color-border)` |
| panel ระยะห่าง field | gap | `var(--sp-lg)` · padding เนื้อหา `var(--sp-xl)` |
| filter chip | style | outline teal: border 1px `var(--base-green)`, text `var(--base-green)`, พื้นโปร่ง, radius `var(--radius-lg)`, padding `var(--sp-xs) var(--sp-sm)` (ตาม Decision Log 2026-07-01 MultiSelect chip) |
| แถว chip | spacing | margin-top `var(--sp-sm)`, gap `var(--sp-sm)` |
| เมนูย่อยชั้น 2 | position | `position: sticky` ใต้ tab bar, พื้น `var(--color-card-bg)`, เส้นล่าง 1px `var(--color-border)` |
| กล่องในหมวด | header | กลุ่ม KPI = `SectionCardGeneric headerStyle="dashboard"` · กราฟ/ตาราง = `headerStyle="legend"` (Decision Log 2026-09-14) |
| grid กราฟ | layout | 2 คอลัมน์ `.charts-row-b` · ≤1024px = 1 คอลัมน์ · grid item `min-width: 0` (Decision Log 2026-09-08) |
| สีกราฟ | palette | `CHART_PALETTE` / `CHART_TOKENS` เท่านั้น (Core Principle #13) |
| สถานะทอง | semantic | ต่ำกว่าเกณฑ์ = `green`, เกิน = `warning` (ไม่ใช้แดงจนกว่าจะมีเกณฑ์ critical) |

---

## States

| State | สิ่งที่เปลี่ยน |
|---|---|
| default | หมวด "ภาพรวม" · ช่วงวันที่ 6 เดือนล่าสุด (เวลาไทย) · ไม่มี chip นอกจากวันที่ |
| กำลังโหลดหมวด | StatCard `loading` + ChartGeneric `loading` (โครงกล่องยังอยู่ ไม่กระพริบทั้งหน้า) |
| panel เปิด | backdrop · focus ไป field แรก · Esc/✕/คลิก backdrop = ปิดโดยไม่ใช้ค่า draft |
| มีตัวกรอง | badge `(n)` บนปุ่ม + chip แถวใต้ header · ลบ chip = ใช้ค่าทันที |
| ตัวกรองไม่เกี่ยวกับหมวดนี้ | chip ยังโชว์แต่จาง (`opacity .45`) + tooltip "ไม่มีผลกับหมวดนี้" (pattern เดียวกับ gold-loss filter field จาง) |
| empty | ChartGeneric emptyText · ตาราง "ไม่พบข้อมูล" |
| error | ไม่มี try/catch เอง — axios-helper แสดง alert · กล่องอื่นยังแสดงผลได้ |

---

## Diff จากของเดิม

- ตัวกรอง: SearchBarGeneric เต็มความกว้าง → ปุ่ม + slide panel + chip (ครั้งแรกของระบบ → Decision Log + Reference Layout — Dashboard v2)
- เมนู: 1 ชั้น (tab) → 2 ชั้น (tab + segmented) · จำใน URL
- production-dashboard: Bootstrap tab + `v-show` (mount หมด) → หมวดโหลดตามที่เปิด
- gold-loss-dashboard: ย้ายเป็นหมวด "ทอง" · shared chart components ใช้ต่อ
- ตัดกล่องซ้ำ/ข้อมูลปลอม 3 กล่อง (ดูหัวข้อ "ตัดทิ้ง")

---

## ข้อเสนอเพิ่มใน `docs/design-system.md` (ทำตอน map เข้าโค้ด)

หัวข้อใหม่ **"Reference Layout — Dashboard v2 (ข้อมูลเยอะ)"** ต่อจาก Reference Layout — Dashboard เดิม:
1. ใช้เมื่อ dashboard มีมากกว่า ~8 กล่อง หรือรวมหลายแหล่ง → แบ่งหมวดย่อยด้วย `ToggleGroupGeneric` ใต้ tab
2. ตัวกรองเกิน 4 ช่อง → `FilterPanelGeneric` + `ActiveFilterChipsGeneric` แทน `SearchBarGeneric`; แยกกลุ่ม "ใช้กับทุกหมวด" / "เฉพาะหมวดนี้"
3. โหลดข้อมูลตามหมวดที่เปิด (mount ครั้งแรกแล้วค้าง) + skeleton
4. state ทั้งหมดอยู่ใน URL query
+ แถว Design Decision Log

---

## Mapping → โค้ด (Phase 1–5)

| Phase | ไฟล์ | แก้อะไร | agent |
|---|---|---|---|
| 1 | `src/components/generic/FilterPanelGeneric.vue` (ใหม่) + spec | ห่อ DrawerGeneric ตาม spec | @ui-implementer |
| 1 | `src/components/generic/ActiveFilterChipsGeneric.vue` (ใหม่) + spec | | @ui-implementer |
| 1 | `src/components/generic/StatCardGeneric.vue` | prop `loading` (backward compatible) | @ui-implementer |
| 1 | `src/views/production/insight/index-view.vue` (ใหม่) + `insight-filters.js` (URL↔state, chip builder) | โครงหมวด + ตัวกรอง + หมวด "ภาพรวม" | @ui-implementer |
| 1 | `src/views/report/executive/index-view.vue` | tab ผลิต ใช้ `ProductionInsightView` | @ui-implementer |
| 2 | `insight/sections/{wip,capacity,monthly}-section.vue` | ย้ายจาก `views/production/dashboard/components/*` (คง logic, ตัดกล่องซ้ำ) | @ui-implementer |
| 3 | `insight/sections/gold-section.vue` | ย้ายจาก gold-loss overview + scrap-weight | @ui-implementer |
| 4 | `Controllers/Production/PlanController.cs` | เปิด `[Authorize]` + `[RequirePermission]` ต่อ action · ตรวจก่อนว่ามี client อื่นเรียกแบบไม่มี token ไหม | @api-implementer |
| 4 | `PlanService.GetDailyReport` / `GoldLoss*Service.ReportByWorker` / `GetScrapWeightDashboard` | รวมใน SQL, async, cache สั้น | @api-implementer |
| 4 | endpoint คู่สำหรับ production:view ของ WIP/StalePlans | | @api-implementer |
| 5 | `router/web/report/report-routes.js` | `/production-dashboard` → ProductionInsightView · `/gold-loss-dashboard` redirect | @ui-implementer |

- verify ทุก phase: `npm run lint` + `npx vitest run` + `npm run build` + chrome-mcp (ทั้ง /executive และ /production-dashboard)
- ห้ามกล่องเส้นสีหนาด้านซ้าย (Core Principle #14) · token/generic/i18n เท่านั้น

---

## Screenshots

- before: `/production-dashboard` (3 tab), `/gold-loss-dashboard` ภาพรวม, `/executive` tab ผลิต (ภาพจาก user 2026-09-29)
- after: รอ Phase 1
