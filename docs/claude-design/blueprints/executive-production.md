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
- after (Phase 1, Revision 1 — ภาพรวม/KPI 6 ช่อง + legend grid 2×2): screenshot วัดจอ 1900px ของ user 2026-09-29 (แก้ layout 2 รอบตามที่ระบุ)

---

## Revision 2 (2026-09-29): per-topic tabs, 4-part structure

**⚠️ Supersedes**: หมวด "ภาพรวม" (Revision 1 — KPI 6 ช่อง + legend grid 2×2: งานค้างแยกแผนก/พยากรณ์ปิดงาน/ปิดงานรายเดือน/ทองเดือนนี้) **ถูกแทนที่ทั้งหมด** — ลบ `overview-section.vue` + `gold-this-month-panel.vue` แล้ว ไม่มีหมวด "ภาพรวม" รวมทุกอย่างอีกต่อไป โครง layout เดิม (`.charts-row-b` container-padding trick, mainbar sticky offset ฯลฯ) ยังใช้ต่อใน `insight-tab-layout.vue`/`wip-section.vue` (แก้ปัญหาเดียวกัน แค่คนละ context)

**เหตุผลที่เปลี่ยน**: ข้อมูลดิบ (จำนวน/กราฟ) อย่างเดียวไม่พอให้ผู้บริหารตัดสินใจเร็ว — ต้องมี "จะเกิดปัญหาอะไร (คาดการณ์)" + "ต้องทำอะไรต่อ (วิธีแก้)" กำกับข้อมูลเสมอ ไม่ใช่แค่โยนตัวเลขให้ไปตีความเอง โจทย์ใหม่มาจาก API ใหม่ (`ProductionInsight/*`, กำลังสร้างคู่ขนาน) ที่คำนวณ "ปัญหา/คาดการณ์/วิธีแก้" มาให้ตรงๆ ผ่าน `code`+`params` แทนที่ frontend จะต้องคำนวณเอง — โครงนี้ reusable ข้ามหัวข้อได้ (ผลิต/ขาย/คลัง) เพราะทุกหมวดใช้ contract เดียวกัน (`problems`/`forecasts`/`actions`/`report`)

### Tab list (เมนูย่อยชั้น 2 — แทน overview/wip/capacity/monthly/gold เดิม)

| value | label | สถานะ Revision 2 |
|---|---|---|
| `wip` (default) | งานค้างและคอขวด | ✅ implement จริง — `ProductionInsight/Wip` |
| `delivery` | ส่งงานตรงเวลา | 🔵 placeholder |
| `capacity` | กำลังการผลิต | 🔵 placeholder |
| `gold` | ทองและ Loss | 🔵 placeholder (ฝัง `gold-loss-trend-view.vue` เดิมเป็นรายงานเสริม) |
| `workers` | ช่างและค่าแรง | 🔵 placeholder |
| `materials` | วัตถุดิบที่กระทบการผลิต | 🔵 placeholder |

placeholder ทุกหมวดใช้โครง 4 ส่วนเดียวกัน — problems/forecasts เป็น bullet ข้อความล้วน (severity `info`, ดูตาราง "เนื้อหาที่วางแผนไว้" ด้านล่าง) ไม่มี actions จนกว่าจะมีข้อมูลจริง, รายงาน = ลิงก์กลับหน้าเดิม (`/production-dashboard`, `/gold-loss-dashboard`, `/report-production-worker-wages`, `/stock-gem-dashboard`)

### Wide frame

```
┌─ 📊 ภาพรวมผู้บริหาร · ข้อมูล ณ 29/09/2026 13:23                                    [⬇ Excel] [↻] ┐
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ [🏭 ผลิต] [💰 ขายและเงิน] [📦 คลังสินค้า]                                  TabViewGeneric ชั้น 1 │
│ ┌──────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │(งานค้างฯ│ส่งงานตรงเวลา│กำลังการผลิต│ทองฯ│ช่างฯ│วัตถุดิบฯ) [แผนก✕][ไม่ขยับเกิน:90✕] [⚙ ตัวกรอง(2)]│ │ ← sticky toolbar (เฉพาะ wip มี filter)
│ ├──────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │  งานค้างและคอขวด                                                    (● วิกฤต / ต้องระวัง)   │ │ InsightTabLayout header
│ │ ┌─ ⚠ ปัญหาที่เกิดแล้ว (legend) ───────┐ ┌─ 📈 คาดการณ์ปัญหาที่จะเกิด (legend) ──────────┐   │ │
│ │ │ [🔴 งานเลยกำหนด 12 ใบ (8%)        ดู›]│ │ [🟢 คาดว่าจะค้างเพิ่ม 5 ใบ ใน 14 วัน      ดู›]│   │ │ InsightFindingList ×2
│ │ │ [🟡 แผนกฝังค้างมากสุด 20 ใบ (35%) ดู›]│ │ [🟢 งานใกล้ครบกำหนด เสี่ยงเลย 3 ใบ        ดู›]│   │ │
│ │ └────────────────────────────────────┘ └────────────────────────────────────────────────┘   │ │
│ │ ┌─ ✅ วิธีแก้ / สิ่งที่ควรทำ (legend) ───────────────────────────────────────────────────┐   │ │
│ │ │ 1. เร่งปิดงานค้างไม่ขยับ 12 ใบ [หัวหน้าแผนก]      แก้ปัญหา: งานเลยกำหนดส่ง             │   │ │ InsightActionList
│ │ │ 2. กำหนด SLA ให้แผนกฝัง [ผู้จัดการฝ่ายผลิต]        แก้ปัญหา: แผนกที่ค้างมากที่สุด        │   │ │
│ │ └──────────────────────────────────────────────────────────────────────────────────────┘   │ │
│ │ ┌─ งานค้างแยกแผนก (legend) ───────────┐ ┌─ งานเข้า-ออกแต่ละแผนก 90วัน (legend) ────────┐   │ │
│ │ │ stacked bar #insight-report-        │ │ grouped bar (inflow/outflow + net) #insight-  │   │ │ report anchors
│ │ │ departments                         │ │ report-flow                                   │   │ │
│ │ └──────────────────────────────────────┘ └────────────────────────────────────────────────┘ │ │
│ │ ┌─ ใบงานค้าง (legend) #insight-report-stalePlans ────────────────────────────────────────┐   │ │
│ │ │ ตาราง (filter แผนก/ไม่ขยับเกิน จาก toolbar)                                              │   │ │
│ │ └──────────────────────────────────────────────────────────────────────────────────────┘   │ │
│ │ ┌─ งานเสี่ยงเลยกำหนด (legend) #insight-report-dueRisk ───────────────────────────────────┐   │ │
│ │ │ (เลยกำหนด│ครบกำหนดใน 30 วัน) ToggleGroup + ตาราง                                        │   │ │
│ │ └──────────────────────────────────────────────────────────────────────────────────────┘   │ │
│ └──────────────────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### API contract (`ProductionInsight/*`, POST, `api.jewelry`)

`ProductionInsight/Wip` body `{ staleDays?:180, riskWindowDays?:30 }` → `{ asOf, status, problems:[{code,severity,params,reportRef}], forecasts:[…same], actions:[{code,priority,ownerRole,relatedCodes,params}], report:{ departments:[{key,total,moved30d,moved30to180d,stale180d}], flow:[{key,inflow90d,outflow90d,net}], openCount, overdueCount, dueSoonAtRiskCount, becomingStaleCount, meltedOpenCount } }`

`ProductionInsight/StalePlans` — contract เดียวกับ `ExecutiveReport/StalePlans` เดิม (`{take,skip,sort,minDays,departmentKeys}`, flat ไม่ห่อ `search`) — `ProductionInsight/DueRiskPlans` — สมมติ contract เดียวกัน + `mode:'overdue'|'dueSoon'` + `riskWindowDays`, item = StalePlans item + `dueDate`, `daysToDue` (**assumption**: ยังไม่ยืนยันชื่อ field ที่แน่นอนกับฝั่ง API เพราะ "being built in parallel" — โค้ด FE อิง contract นี้ไว้ก่อน)

| กลุ่ม | code | params | severity/priority | ownerRole |
|---|---|---|---|---|
| problems | `WIP_STALE` | `count, openCount, percent` | critical/warning (จาก API) | — |
| problems | `WIP_OVERDUE` | `count, openCount, percent` | critical/warning | — |
| problems | `WIP_DEPT_STALE_TOP` | `deptKey, count, share` | critical/warning | — |
| problems | `WIP_MELTED_OPEN` | `count` | critical/warning | — |
| forecasts | `FC_BECOMING_STALE` | `count, days` | critical/warning/info | — |
| forecasts | `FC_DUE_SOON_AT_RISK` | `count, days` | critical/warning/info | — |
| forecasts | `FC_BOTTLENECK` | `deptKey, inflow, outflow, net` | critical/warning/info | — |
| actions | `ACT_CLOSE_STALE` | `count` | priority (API) | `deptHead` |
| actions | `ACT_PRIORITIZE_DUE` | `overdue, dueSoon` | priority | `planner` |
| actions | `ACT_STAGE_SLA` | `deptKey` | priority | `productionManager` |
| actions | `ACT_CLOSE_MELTED` | `count` | priority | `goldControl` |

`reportRef ∈ departments\|flow\|stalePlans\|dueRisk` — DOM anchor id = `insight-report-<reportRef>` (ดูโค้ดที่ `insight-tab-layout.vue` `scrollToReport()`)

### เนื้อหาที่วางแผนไว้ (placeholder 5 หมวด — code ชั่วคราว, severity `info` ล้วน, รอ API จริง)

| หมวด | problems | forecasts |
|---|---|---|
| delivery | เลยกำหนดส่ง | ครบกำหนดใน 14 วันแต่ยังอยู่ขั้นต้น |
| capacity | ปิดงานเดือนนี้ต่ำกว่าค่าเฉลี่ย | ประมาณการปิดงานสิ้นเดือน |
| gold | ช่างที่เสียทองเกินเกณฑ์, เล่มหล่อที่ยังไม่คืนทอง | ช่างที่ % loss สูงขึ้น 3 เดือนติด |
| workers | รายการที่ไม่มีค่าแรง | ค่าแรงต่อชิ้นสูงขึ้น |
| materials | พลอยใกล้หมดเทียบงานที่รอคัดพลอย, ทองวัตถุดิบในระบบติดลบ | — (ไม่มี — ทั้ง 2 ข้อเป็นปัญหาปัจจุบันล้วน) |

### Component ใหม่ (Revision 2)

| Component | ไฟล์ | หน้าที่ |
|---|---|---|
| `InsightTabLayout` | `src/components/insight/insight-tab-layout.vue` | โครง 4 ส่วน (header+status chip / problems+forecasts / actions / `#report` slot) — แปล code→ข้อความในตัว |
| `InsightFindingList` | `src/components/insight/insight-finding-list.vue` | severity chip (critical/warning/info) + `[ดู ›]` เลื่อนไป report anchor |
| `InsightActionList` | `src/components/insight/insight-action-list.vue` | เลขลำดับ + owner-role chip + related findings |
| `insight-helpers.js` (+ spec) | `src/components/insight/` | pure: severity/status icon map, `worstStatus`, `resolveFindingParams` (deptKey translate), number/percent format |

`FilterPanelGeneric` เพิ่มพฤติกรรม: slot `#global` ว่าง → ซ่อนทั้ง label "ใช้กับทุกหมวด" (ไม่ใช่แค่ field เปล่า) — Revision 2 ไม่มีตัวกรองข้ามหมวดอีกต่อไป (เดิม dateRange/gold/goldSize/productType/customerType ไม่มี endpoint ใหม่ตัวไหนรับ) แต่ละหมวดถือ filter อิสระของตัวเอง (ตอนนี้มีจริงแค่ `wip`: แผนก/ไม่ขยับเกิน (วัน)/เตือนล่วงหน้า (วัน) — query key `wipDept`/`wipStaleDays`/`wipRiskWindow`)

### Mapping → โค้ด (Revision 2)

| ไฟล์ | แก้อะไร | agent |
|---|---|---|
| `src/components/insight/{insight-tab-layout,insight-finding-list,insight-action-list,insight-helpers}.{vue,js}` (+ spec) | ใหม่ทั้งหมด | @ui-implementer |
| `src/stores/modules/api/production/production-insight-api.js` (ใหม่) | เรียก `ProductionInsight/{Wip,StalePlans,DueRiskPlans}` | @ui-implementer |
| `src/views/production/insight/sections/wip-section.vue` (ใหม่) + `components/{department-flow-chart,wip-stale-plans-panel,wip-due-risk-panel}.vue` (ใหม่) | หมวด "งานค้างและคอขวด" เต็มรูปแบบ | @ui-implementer |
| `src/views/production/insight/sections/topic-placeholder-section.vue` (ใหม่) | 5 หมวดที่เหลือ | @ui-implementer |
| `src/views/production/insight/insight-filters.js` + spec | เขียนใหม่ทั้งหมด (SECTION_VALUES ใหม่, wip filter) | @ui-implementer |
| `src/views/production/insight/index-view.vue` | เขียนใหม่ (toolbar เดิม + filter เฉพาะ wip) | @ui-implementer |
| `src/views/report/executive/index-view.vue` | ตัด `productionWipView`/`goldLossTrendView` ออกจาก template (ยังใช้ data/method เดิมสำหรับ Excel) | @ui-implementer |
| ลบ: `overview-section.vue`, `gold-this-month-panel.vue`, `production-wip-view.vue`, `monthly-completed-chart.vue` | ไฟล์ Revision 1 ที่ไม่มีจุดใช้แล้วหลัง Revision 2 | @ui-implementer |
| Backend `ProductionInsight/{Wip,StalePlans,DueRiskPlans}` | ใหม่ทั้งหมด — "being built in parallel" | @api-implementer |

- verify: `npm run lint` + `npx vitest run` + `npm run build` (chrome-mcp รอ backend endpoint จริง — ตอนนี้เรียกแล้วจะ error เพราะ API ยังไม่มี ถือว่าปกติจนกว่า backend จะ deploy)
- ห้ามกล่องเส้นสีหนาด้านซ้าย (Core Principle #14) · token/generic/i18n เท่านั้น · ห้าม try/catch ครอบ store call

## Revision 2.1 (2026-09-30): Stage lead-time / มาตรฐานเวลาผลิต (wip tab, หลังกล่องพัฒนาการ)

เพิ่ม 5 ส่วนใหม่ในหมวด `wip` ต่อจากกล่องพัฒนาการงานค้างแยกแผนก (WipTrendPanel): (1) ตาราง "เวลาผลิตรายแผนก"
(2) กราฟรายละเอียดแนวโน้ม lead time ต่อแผนก (3) การ์ด "ผลต่อกำลังการผลิต" (Little's Law) (4) ตาราง "ใบที่อยู่
ในแผนกนานผิดปกติ" (5) แผง "กำหนดมาตรฐาน" (เห็นได้ทุกคน แก้ไขได้เฉพาะสิทธิ์ใหม่ `production:standard-edit` —
Executive + Dev) — แบ่งเวลาต่อแผนกเป็น "เวลารอ" (สถานะ 49/59/69/79/89/94) กับ "เวลาทำ" (สถานะ
50/60/70/80/90/95 — แผนกออกแบบนับเป็นเวลาทำล้วน)

### API contract เพิ่มเติม (`ProductionInsight/*`)

- `StageLeadTime` POST `{start,end,bucket,draftStandards?:[{deptKey,standardDays}]}` → `{ departments:[{key,standardDays,standardSource:'saved'|'draft',standardEffectiveFrom,exitedCount,median:{total,wait,work},p90:{total,wait,work},overStandardPercent,currentCount,abnormalCount,series:[{bucketEnd,count,medianTotal,medianWait,medianWork,p90Total}]}], capacity:{current:{totalLeadDays,monthlyThroughput,bottleneckDept},atStandard:{…same},departments:[{key,wip,inflowPerDay,throughputPerDayCurrent,throughputPerDayAtStandard,expectedWipAtStandard}]} }` — `draftStandards` ส่งเฉพาะตอนแก้ไขในแผงมาตรฐานยังไม่บันทึก ให้ตาราง/การ์ดคำนวณ preview real-time (debounce ฝั่งแผง)
- `AbnormalDwellPlans` POST DataSourceRequest + `{departmentKeys?, multiplier:2}` → item = StalePlans item + `deptKey,daysInDept,waitDays,workDays,standardDays`
- `StageStandards` GET → `[{deptKey,standardDays,effectiveFrom,createBy,remark}]` · `StageStandardHistory?deptKey=` GET → แถวใหม่→เก่า
- `SaveStageStandards` POST `{items:[{deptKey,standardDays}],remark}` — ต้องมีสิทธิ์ `production:standard-edit`

Code ใหม่ (namespace เดิม `view.productionInsight.rules`/`help`, `reportRef` ใหม่ 2 ค่า `leadTime`/`abnormalDwell`):

| กลุ่ม | code | params | reportRef | ownerRole |
|---|---|---|---|---|
| problems | `STAGE_OVER_STANDARD` | `deptKey, medianDays, standardDays, percent` | leadTime | — |
| problems | `STAGE_ABNORMAL_DWELL` | `deptKey, count, thresholdDays` | abnormalDwell | — |
| problems | `STAGE_WAIT_DOMINANT` | `deptKey, waitDays, workDays, waitShare` | leadTime | — |
| forecasts | `FC_STAGE_LEADTIME_RISING` | `deptKey, fromDays, toDays, buckets` | leadTime | — |
| actions | `ACT_REDUCE_WAIT` | `deptKey` | — | `productionManager` |
| actions | `ACT_REVIEW_ABNORMAL` | `count` | — | `deptHead` |

โค้ด 4 ตัวนี้มาจาก `ProductionInsight/Wip` เดิม (endpoint เดียวกับปัญหา/คาดการณ์/วิธีแก้ที่มีอยู่แล้ว — ไม่ใช่
endpoint ใหม่) `InsightTabLayout`/`resolveHelpKey` เป็น generic อยู่แล้ว แก้แค่เพิ่ม whitelist + ข้อความ i18n
ไม่ต้องแก้โค้ด resolve

### Component ใหม่ (Revision 2.1)

| Component | ไฟล์ | หน้าที่ |
|---|---|---|
| `WipLeadTimePanel` | `wip-lead-time-panel.vue` | orchestrator — ยิง `StageLeadTime`+`StageStandards`, คุม dept ที่เลือก/draft |
| `WipLeadTimeTable` | `wip-lead-time-table.vue` | ตารางเวลาผลิตรายแผนก (chip เทียบมาตรฐาน, stacked bar รอ/ทำ, sparkline แนวโน้มย่อ) |
| `WipLeadTimeChart` | `wip-lead-time-chart.vue` | เส้นค่ากลาง/P90 + เส้นระดับมาตรฐาน (annotation) + แท่ง stacked รอ/ทำ |
| `WipCapacityPanel` | `wip-capacity-panel.vue` | การ์ด 2 คอลัมน์ ตอนนี้/ตามมาตรฐาน + ตารางย่อยต่อแผนก + ⓘ Little's Law |
| `WipStandardsPanel` | `wip-standards-panel.vue` | ปุ่ม+`DrawerGeneric` ตั้งมาตรฐาน (draft/save/cancel, gate ด้วย `hasStandardEditAccess()`) |
| `WipStandardHistoryModal` | `wip-standard-history-modal.vue` | ตารางประวัติมาตรฐานต่อแผนก |
| `WipAbnormalDwellPanel` | `wip-abnormal-dwell-panel.vue` | ตารางใบค้างนานผิดปกติ — รับ `focusDeptKey` override จากตัวเลขในตาราง 1 |
| `wip-lead-time-helpers.js` (+ spec) | `src/views/production/insight/components/` | pure: chip variant/token, wait/work share, capacity delta text, draft diff detection |
| `hasStandardEditAccess()` | `src/services/permission/standard-edit-access.js` | เช็ค `production:standard-edit` ตรงๆ (ไม่ผูก route ให้อ่าน meta ได้แบบ `resolvePlanLinkState`) |

### Mapping → โค้ด (Revision 2.1)

| ไฟล์ | แก้อะไร | agent |
|---|---|---|
| `src/services/permission/config.js` | เพิ่ม `PRODUCTION_STANDARD_EDIT` (Dev + Executive) | @ui-implementer |
| `src/services/permission/standard-edit-access.js` (ใหม่) | helper เช็คสิทธิ์แก้มาตรฐาน | @ui-implementer |
| `src/stores/modules/api/production/production-insight-api.js` | เพิ่ม `fetchStageLeadTime/fetchAbnormalDwellPlans/fetchStageStandards/fetchStageStandardHistory/saveStageStandards` | @ui-implementer |
| `src/components/insight/insight-helpers.js` (+ spec) | เพิ่ม 4 code ใหม่ใน `HELP_KEY_CODES` | @ui-implementer |
| `src/views/production/insight/components/wip-lead-time-*.vue`, `wip-standards-panel.vue`, `wip-standard-history-modal.vue`, `wip-abnormal-dwell-panel.vue` (+ helpers/spec) (ใหม่ทั้งหมด) | ตาราง/กราฟ/การ์ด/แผงมาตรฐานใหม่ | @ui-implementer |
| `src/views/production/insight/sections/wip-section.vue` | mount `WipLeadTimePanel`/`WipAbnormalDwellPanel` หลังกล่องพัฒนาการ + เชื่อม focus-abnormal | @ui-implementer |
| `src/language/view/production-insight/{th,en}.js` | เพิ่ม namespace `leadTime*`/`capacity*`/`abnormalDwell*`/`standards*` ใต้ `wip` + rules/codeLabel/help ของ 4 code ใหม่ | @ui-implementer |
| Backend `ProductionInsight/{StageLeadTime,AbnormalDwellPlans,StageStandards,StageStandardHistory,SaveStageStandards}` | ใหม่ทั้งหมด — "being built in parallel" | @api-implementer |

- **Assumption**: `AbnormalDwellPlans` item ระบุ field `deptKey` เพิ่มจาก StalePlans เดิมที่มี `departmentKey` อยู่แล้ว — โค้ด FE อ่านทั้งคู่ (`data.deptKey || data.departmentKey`) กันชื่อ field ไม่ตรงกับที่ backend ส่งจริง
- **Assumption**: คอลัมน์ "รอ/ทำ" ของตาราง `AbnormalDwellPlans` รวมเป็นคอลัมน์เดียว (ต่างจากตาราง lead-time หลักที่แยก 2 คอลัมน์) ตามที่ระบุไว้ในสเปค
- verify: `npm run lint` + `npx vitest run` + `npm run build` (endpoint ใหม่ทั้ง 5 ยังไม่มีจริง เรียกแล้ว error ถือว่าปกติจนกว่า backend จะ deploy)

### Note (2026-09-30, follow-up): null wait/work history + capacity model rework

Contract เปลี่ยนก่อน backend deploy จริง (implement คู่ขนานกับ @api-implementer) — โค้ด FE อัปเดตตามนี้แล้ว:

- `StageLeadTime.departments[].median.wait/work` และ `.p90.wait/work` **อาจเป็น `null`** (ประวัติเก่าไม่เคยบันทึกแยกรอ/ทำ ระบบเพิ่งเริ่มบันทึกผ่าน `receive_date` ใหม่) — เพิ่ม `departments[].splitSampleCount` (int) + `departments[].currentWaitingCount` (int, จำนวนใบที่อยู่ในสถานะรอ ณ ตอนนี้) และ top-level `splitDataSince` (ISO date หรือ null) ใน response — ห้าม render null เป็น 0 ที่ไหนทั้งสิ้น
- series `medianWait`/`medianWork` เป็น `null` เมื่อไม่รู้ค่า (ช่องว่างของกราฟ ไม่ใช่ 0 จริง — ของเดิมมีอยู่แล้วผ่าน `mapSeriesField`)
- `capacity.departments[]` เปลี่ยนโครงใหม่ทั้งหมด: `{key, exitedCount, exitedPerDay, medianTotal, standardDays, atStandardPerDay, isBottleneckCurrent, isBottleneckAtStandard}` (ตัดฟิลด์เดิม `wip`/`inflowPerDay`/`throughputPerDayCurrent`/`throughputPerDayAtStandard`/`expectedWipAtStandard` ทิ้งทั้งหมด — **ไม่ใช้ Little's Law อีกต่อไป**) — `capacity.current`/`capacity.atStandard` (สรุปด้านบน: `totalLeadDays`/`monthlyThroughput`/`bottleneckDept`) **ไม่เปลี่ยน**
- โมเดลใหม่: กำลังผลิต = ใบที่ออกจากแผนกจริงต่อวัน (`exitedPerDay`) · ถ้าได้ตามมาตรฐาน = `exitedPerDay × (medianTotal ÷ standardDays)` เฉพาะแผนกที่ช้ากว่ามาตรฐาน (เร็วกว่าอยู่แล้วคงเดิม) · คอขวด = แผนกที่ปล่อยงานได้น้อยที่สุด (`isBottleneckCurrent`/`isBottleneckAtStandard` มาจาก backend ตรงๆ ไม่คำนวณซ้ำฝั่ง FE)
- `AbnormalDwellPlans` item `waitDays`/`workDays` อาจเป็น `null` เช่นกัน — list/count ไม่รวมใบที่ไม่ขยับเกิน 180 วันอีกต่อไป (backend ตัดทิ้งให้ กันนับซ้ำกับตาราง "ใบงานค้าง")

FE เปลี่ยนตาม:
- `wip-lead-time-table.vue`: คอลัมน์รอ/ทำ/สัดส่วน โชว์ "—" + `InfoTipGeneric` เมื่อ null (ข้อความอ้างอิง `splitDataSince` ถ้ามี) + hint "(n ใบ)" เมื่อ `splitSampleCount` น้อย (0<n<10) + คอลัมน์ใหม่ "รออยู่ตอนนี้" (`currentWaitingCount`)
- `wip-lead-time-chart.vue`: ซ่อน series รอ/ทำ + legend ทั้งคู่เมื่อทุกจุดในช่วงเป็น null (`hasAnySeriesValue`) + hint ใต้กราฟ
- `wip-capacity-panel.vue`: ตารางย่อยต่อแผนกสร้างใหม่ทั้งตาราง (แผนก/ใบที่ออก/ออกจริง ใบ/วัน/เวลาจริง (ค่ากลาง)/มาตรฐาน/ถ้าได้ตามมาตรฐาน ใบ/วัน) + ชิปคอขวด (พื้นแดงเต็ม ไม่มี border-left) + ⓘ เปลี่ยนเนื้อหาทั้งหมด (`help.capacityModelExplanation`, key เดิม `capacityLittlesLaw` ลบทิ้ง)
- `wip-abnormal-dwell-panel.vue`: waitWorkTemplate เดิม null-safe อยู่แล้ว (`?? '—'`) — เพิ่มบรรทัด note อธิบายการตัด >180 วันออก
- `wip-lead-time-helpers.js`: `calcWaitWorkShare` คืน `hasData:false` เมื่อ wait/work เป็น null ทั้งคู่ (เดิม coerce เป็น 0) + helper ใหม่ `isSmallSplitSample`/`hasAnySeriesValue`
- i18n th/en เพิ่ม key ใหม่ทั้งหมดใต้ `wip.*`/`help.*` ตามรายการข้างต้น — verify: `npx eslint` เฉพาะไฟล์ที่แก้ + `npx vitest run` (insight) + `npm run build`

## Revision 3 (2026-09-30): หมวด "ส่งงานตรงเวลา" (delivery tab)

หมวด `delivery` ย้ายจาก placeholder (`topic-placeholder-section.vue`) เป็นเนื้อหาจริงเต็มรูปแบบ (แบบ `wip`)
— orchestrator ใหม่ `sections/delivery-section.vue` ยิง `ProductionInsight/Delivery` ครั้งเดียวได้ทั้ง
problems/forecasts/actions/status (ใช้ `InsightTabLayout` เหมือนเดิม) + kpi/series/targetPercent/
targetSource/lateCustomers ในก้อนเดียว (endpoint เดียว ไม่แยกเหมือน wip ที่มี `Wip`+`StageLeadTime` 2
endpoint) — ตาราง 3 ตัวแยก endpoint ของตัวเอง paginate อิสระ (`DeliveryAtRiskPlans`/`DeliveryLatePlans`/
`StuckAfterCostCardPlans`) ตามรูปแบบ `wip-stale-plans-panel.vue`/`wip-due-risk-panel.vue` เดิม

### API contract (`ProductionInsight/*`, endpoint ใหม่ทั้งหมด "being built in parallel")

- `Delivery` POST `{start,end,bucket,riskHorizonDays=30,draftTargetPercent?}` → `{status,problems[],forecasts[],actions[] (shape เดียวกับ Wip), targetPercent,targetSource:'saved'|'draft',targetEffectiveFrom,asOf, kpi:{completedCount,onTimeCount,onTimePercent|null,lateMedianDays,plannedLeadMedianDays,actualLeadMedianDays,suggestedLeadDays,openCount,openOverdueCount,openOverdueActiveCount,atRiskCount,stuckAfterCostCardCount}, series:[{bucketEnd,completedCount,onTimeCount,onTimePercent|null,plannedLeadMedianDays|null,actualLeadMedianDays|null}], lateCustomers:[{customerCode,customerName,completedCount,lateCount,latePercent,lateMedianDays}]}` — `draftTargetPercent` ส่งเฉพาะตอนกำลังแก้ไขเป้าในแผง "ตั้งเป้าส่งตรงเวลา" (ยังไม่บันทึก) เหมือน `draftStandards` ของ `StageLeadTime` · `asOf` แสดงเป็น subtitle เล็กมุมขวาบนของกล่อง KPI (`DeliveryKpiGroup` `#header-actions`, reuse i18n key `view.executive.asOf` เดิม ไม่สร้างคำแปลซ้ำ) · `DLV_OPEN_OVERDUE` ใช้ `reportRef: atRisk` (ตารางเดียวกับเสี่ยงเลยกำหนด ไม่ใช่ตารางแยก)
- `DeliveryAtRiskPlans` POST DataSourceRequest + `{riskHorizonDays,departmentKeys}` → item = stale-plan base fields (มี `lastUpdateBy/lastAction/workers`) + `requestDate,currentDeptKey,daysInCurrentDept,remainingDays,projectedFinishDate,projectedLateDays` — ครอบคลุมทั้งใบที่เสี่ยงจะเลยกำหนดและใบที่เลยไปแล้วแต่ยังเปิดอยู่ (`remainingDays` ติดลบ)
- `DeliveryLatePlans` POST DataSourceRequest + `{start,end}` → base + `requestDate,doneDate,lateDays` — **ไม่มี** `lastUpdateBy/lastAction/workers` (null/[] เสมอ) ต่าง จาก `DeliveryAtRiskPlans` ที่มี — FE ไม่แสดงคอลัมน์ "อัปเดตล่าสุด"/"ช่าง" ในตารางนี้เลย (ซ่อนคอลัมน์ ไม่ใช่โชว์ "—")
- `StuckAfterCostCardPlans` POST DataSourceRequest → base + `costCardDate,daysSinceCostCard` (ไม่มีตัวกรองแผนก/ช่วงเวลา — เหมือนตาราง "ใบงานค้าง"/"ใบค้างนานผิดปกติ") — **ไม่มี** `lastUpdateBy/lastAction/workers` เช่นเดียวกับ `DeliveryLatePlans` (ซ่อนคอลัมน์)
- `DeliveryTarget` GET / `DeliveryTargetHistory` GET (ไม่มี `deptKey` — เป้าเดียวระดับทั้งบริษัท ต่างจาก `StageStandards` ที่เป็นรายแผนก) / `SaveDeliveryTarget` POST `{targetPercent,remark}` (คืน 200 ไม่มี body — FE ไม่อ่าน response) — ต้องมีสิทธิ์ `production:standard-edit` (reuse `hasStandardEditAccess()` เดิม ไม่สร้าง permission ใหม่) — ตารางทั้ง 3 endpoint คืน Kendo DataSourceResult แบบเดียวกับ `StalePlans` เดิม (`{data,total}`)

นิยามที่ระบุไว้ใน titleTip ของกล่อง "% ตรงเวลารายช่วง": "เสร็จ = วันที่โอนเข้าสถานะสำเร็จครั้งแรก" ·
"ตรงเวลา = เสร็จไม่เกินวันกำหนดส่ง (เวลาไทย)" — at-risk projection = เวลาที่เหลือในแผนกปัจจุบัน +
ค่ากลางเวลาของแผนกที่เหลือ (เรียงลำดับคงที่แบบง่าย)

Code ใหม่ (namespace เดิม `view.productionInsight.rules`/`help`, `reportRef` ใหม่ 5 ค่า
`deliveryTrend`/`atRisk`/`latePlans`/`stuckCostCard`/`lateCustomers`):

| กลุ่ม | code | params | reportRef | ownerRole |
|---|---|---|---|---|
| problems | `DLV_ONTIME_BELOW_TARGET` | `percent,target` | deliveryTrend | — |
| problems | `DLV_LEAD_UNDERESTIMATED` | `planned,actual,suggested` | deliveryTrend | — |
| problems | `DLV_OPEN_OVERDUE` | `count` | atRisk | — |
| problems | `DLV_STUCK_AFTER_COSTCARD` | `count` | stuckCostCard | — |
| forecasts | `FC_DLV_AT_RISK` | `count,days` | atRisk | — |
| forecasts | `FC_DLV_ONTIME_DECLINING` | `from,to,buckets` | deliveryTrend | — |
| actions | `ACT_SET_REALISTIC_DUE` | — | — | `productionManager` |
| actions | `ACT_EXPEDITE_AT_RISK` | `count` | — | `deptHead` |
| actions | `ACT_CLOSE_COSTCARD` | `count` | — | `deptHead` |
| actions | `ACT_FIX_BOTTLENECK` | — | — | `productionManager` |

โค้ดเหล่านี้มาจาก `ProductionInsight/Delivery` โดยตรง (endpoint เดียวกับปัญหา/คาดการณ์/วิธีแก้) —
whitelist เพิ่มใน `insight-helpers.js HELP_KEY_CODES` เหมือนรอบก่อนๆ ไม่ต้องแก้ resolve mechanism

### Component ใหม่ (Revision 3)

| Component | ไฟล์ | หน้าที่ |
|---|---|---|
| `ProductionInsightDeliverySection` | `sections/delivery-section.vue` | orchestrator — ยิง `Delivery`+`DeliveryTarget`, คุม draftTargetPercent |
| `DeliveryKpiGroup` | `components/delivery-kpi-group.vue` | กล่อง KPI 6 ช่อง (`headerStyle="dashboard"` + `StatCardGeneric` ×6, กดได้เลื่อนไปรายงาน) |
| `DeliveryTrendPanel` | `components/delivery-trend-panel.vue` | orchestrator ย่อย reportRef `deliveryTrend` — กราฟ %ตรงเวลา (+ปุ่มตั้งเป้า) + กราฟวางแผน vs ใช้จริง สแต็กกัน |
| `DeliveryOntimeChart` / `DeliveryLeadChart` | `components/delivery-{ontime,lead}-chart.vue` | presentational ล้วน รับ `series` เป็น prop (ไม่ยิง endpoint เอง) |
| `DeliveryTargetPanel` / `DeliveryTargetHistoryModal` | `components/delivery-target-{panel,history-modal}.vue` | ปุ่ม+`DrawerGeneric` ตั้งเป้า % เดียว (ไม่ใช่รายแผนกแบบ `wip-standards-panel.vue`) + ประวัติ |
| `DeliveryLateCustomersPanel` | `components/delivery-late-customers-panel.vue` | ตารางลูกค้าที่ส่งช้าบ่อย (reportRef `lateCustomers`, มาจาก `Delivery.lateCustomers` ตรงๆ ไม่ paginate) |
| `DeliveryAtRiskPanel` / `DeliveryLatePlansPanel` / `DeliveryStuckCostcardPanel` | `components/delivery-{at-risk,late-plans,stuck-costcard}-panel.vue` | ตาราง paginate อิสระ 3 ตัว ยิง endpoint ของตัวเอง — reuse `wip-plan-table-helpers.js` (plan link/workers/lastAction) |
| `delivery-helpers.js` (+ spec) | `components/` | pure: on-time stat variant, draft-target-chip diff check, series field mapper |

### Mapping → โค้ด (Revision 3)

| ไฟล์ | แก้อะไร | agent |
|---|---|---|
| `src/stores/modules/api/production/production-insight-api.js` | เพิ่ม `fetchDelivery/fetchDeliveryAtRiskPlans/fetchDeliveryLatePlans/fetchStuckAfterCostCardPlans/fetchDeliveryTarget/fetchDeliveryTargetHistory/saveDeliveryTarget` | @ui-implementer |
| `src/components/insight/insight-helpers.js` (+ spec) | เพิ่ม 6 code ใหม่ใน `HELP_KEY_CODES` | @ui-implementer |
| `src/views/production/insight/insight-filters.js` (+ spec) | เพิ่ม `buildDefaultDeliveryFilter/parseDeliveryFilterQuery/deliveryFilterToQuery/clearedDeliveryFilterQueryKeys` (query prefix `dlv*`, คนละ namespace จาก `wip*`) | @ui-implementer |
| `src/views/production/insight/components/delivery-*.vue` (+ helpers/spec) (ใหม่ทั้งหมด) | KPI/กราฟ/ตาราง/แผงตั้งเป้าใหม่ | @ui-implementer |
| `src/views/production/insight/sections/delivery-section.vue` (ใหม่) | mount ทุก component ข้างต้น เชื่อม draft-target-change/target-saved | @ui-implementer |
| `src/views/production/insight/sections/topic-placeholder-section.vue` | ลบ entry `delivery` ออกจาก `TOPIC_LINK`/`TOPIC_CODES` (ย้ายไป section จริงแล้ว) | @ui-implementer |
| `src/views/production/insight/index-view.vue` | mount `DeliverySection` แทน placeholder, ขยาย `hasFilterableFields`/`activeChips`/`rangeModelValue`/filter-panel handlers ให้ section-aware (ไม่ hardcode `filters.wip` อีกต่อไป) | @ui-implementer |
| `src/language/view/production-insight/{th,en}.js` | เพิ่ม namespace `delivery.*` เต็ม + rules/codeLabel/help ของ 6 code ใหม่ — ลบ `DELIVERY_PLACEHOLDER_OVERDUE`/`DELIVERY_PLACEHOLDER_DUE_SOON`/`placeholder.link.delivery` (dead, ย้ายไป section จริงแล้ว) | @ui-implementer |
| Backend `ProductionInsight/{Delivery,DeliveryAtRiskPlans,DeliveryLatePlans,StuckAfterCostCardPlans,DeliveryTarget,DeliveryTargetHistory,SaveDeliveryTarget}` | ใหม่ทั้งหมด — "being built in parallel" | @api-implementer |

- **Decision**: เป้า % ตรงเวลาเป็นค่าเดียวระดับทั้งบริษัท (ไม่ใช่รายแผนกแบบมาตรฐานเวลาผลิต) — `DeliveryTargetPanel`/`DeliveryTargetHistoryModal` เลยง่ายกว่า `wip-standards-panel.vue`/`wip-standard-history-modal.vue` (ไม่มี per-dept map/deptKey loop)
- **Decision**: 2 กราฟ (%ตรงเวลา, วางแผน vs ใช้จริง) ใช้ `Delivery.series` ชุดเดียวกัน คนละฟิลด์ — สแต็กเป็น 2 กล่อง legend แนวตั้งใต้ `DeliveryTrendPanel` เดียว (ไม่ใช่ side-by-side charts-row) หลีกเลี่ยงความซับซ้อนของ container-padding-top pattern โดยไม่จำเป็น เพราะทั้งคู่ใช้ reportRef เดียวกัน (`deliveryTrend`)
- **Decision**: `index-view.vue` เดิม hardcode `filters.wip`/`draftWipFilter` ทุกจุด (range/filter-panel/chip handlers) — ขยายเป็น section-aware (`this.filters[this.activeSection]`/if-else ตาม `activeSection`) ตอนเพิ่ม delivery แทนการ duplicate state คนละชุดแบบเดิม เพราะ `RangePresetGeneric` ในแถบเครื่องมือใช้ร่วมกันทุกหมวดที่มี filter (URL query key `range/start/end` ไม่มี prefix ยังคงเป็น global slot เดียว สะท้อนเฉพาะหมวดที่เปิดอยู่ ณ ขณะนั้น)
- verify: `npx eslint` เฉพาะไฟล์ที่แก้ + `npx vitest run` (insight) + `npm run build` (endpoint ใหม่ทั้ง 7 ยังไม่มีจริง เรียกแล้ว error ถือว่าปกติจนกว่า backend จะ deploy)

## Revision 4 (2026-10-01): หมวด "ทองและ Loss" (gold tab)

หมวด `gold` ย้ายจาก placeholder (`topic-placeholder-section.vue`, เดิมฝัง `gold-loss-trend-view.vue` ของ
`/executive` เป็นรายงานเสริม) เป็นเนื้อหาจริงเต็มรูปแบบ (แบบ `wip`/`delivery`) — orchestrator ใหม่
`sections/gold-section.vue` ยิง `ProductionInsight/Gold` ครั้งเดียวได้ทั้ง problems/forecasts/actions/
status + kpi/series/targets/workers/asOf (endpoint เดียว เหมือน `Delivery` ไม่แยกเหมือน `Wip`) — จุดต่าง
จาก delivery: เป้า (%Loss) เป็น **รายประเภทช่าง** (50=ช่างแต่ง/80=ช่างฝัง, 2 ค่าคงที่) ไม่ใช่ค่าเดียวระดับ
บริษัท และ "เป้า % ตรงเวลา vs ตรงเวลาจริง" ของ delivery กลายเป็น **3 ค่าต้องโชว์คู่กันเสมอ**: Loss จริง / %
ที่ยอมให้ตาม slip / เป้าที่ตั้งไว้ (จุดประสงค์หลักของหมวดนี้ตามที่ user ขอ — ไม่ใช่แค่ 2 ค่าเหมือน delivery)

### API contract (`ProductionInsight/*`, endpoint ใหม่ทั้งหมด — final contract จาก API agent 2026-10-01)

- `Gold` POST `{start,end,bucket,workerTypes?,workerCodes?,draftTargets?:[{workerType,targetPercent}]}` → `{asOf,status,problems[],forecasts[],actions[] (shape เดียวกับ Wip/Delivery), targets:[{workerType,targetPercent,source:'saved'|'draft',effectiveFrom}], kpi:[{workerType,slipCount,workerCount,receivedGram,rawLossGram,allowedGram,lossPercent,allowedPercent,targetPercent,excessGram,excessMoney,netMoney,overCount,workersOverCount,coverageJobs,coverageTotalJobs,coveragePercent}], series:[{bucketEnd,workerType,slipCount,rawLossGram|null,allowedGram|null,lossPercent|null,allowedPercent|null}], workers:[{workerType,workerCode,workerName,slipCount,receivedGram,lossPercent,allowedPercent,targetPercent,excessGram,excessMoney,netMoney,overBuckets,qualifyingBuckets}]}` — `draftTargets` ส่งเฉพาะตอนกำลังแก้ไขเป้าในแผง "ตั้งเป้า Loss" (ยังไม่บันทึก) เหมือน `draftStandards`/`draftTargetPercent` เดิม — `kpi`/`targets` เป็น **array ต่อประเภทช่าง** (ไม่ใช่ object เดี่ยวแบบ delivery) — percent base = received gram
- `GoldOverSlips` POST DataSourceRequest + `{workerTypes,workerCodes}` → `{slipId,documentNo,workerType,workerCode,workerName,requestDateStart,requestDateEnd,rawLossGram,allowedGram,excessGram,excessMoney,netMoney}` — **ช่างแต่ง (50) = 1 แถวต่อ 1 ใบ slip จริง, ช่างฝัง (80) = 1 แถวต่อ 1 รายการที่เกินเกณฑ์ (job) ภายใต้ slip เดียวกัน** (documentNo ซ้ำกันได้หลายแถว) — FE โชว์ `InfoTipGeneric` กำกับเฉพาะแถว workerType 80 กันเข้าใจผิดว่านับซ้ำใบ
- `GoldUncoveredJobs` POST DataSourceRequest + `{workerTypes,workerCodes,olderThanDays}` → `{planId,wo,woNumber,woText,deptKey,workerCode,workerName,jobDate,sendGram,checkGram,diffGram,daysSince}` (link ผ่าน `resolvePlanLinkState` เดิม) — `workerName` เป็นค่าประมาณ (best-effort จากช่างหลักของงาน ไม่ใช่ข้อมูลยืนยันแน่นอนแบบ slip จริง) — FE โชว์ `workerCode` คู่กันเสมอ + `InfoTipGeneric` กำกับ
- `GoldLossTargets` GET → `[{workerType,targetPercent,effectiveFrom,createBy,remark}]` (array ต่อประเภทช่าง ไม่ใช่ object เดี่ยว) / `GoldLossTargetHistory?workerType=` GET → shape เดียวกัน filtered ต่อประเภท / `SaveGoldLossTargets` POST `{items:[{workerType,targetPercent}],remark}` (คืน 200 ไม่มี body) — ต้องมีสิทธิ์ `production:standard-edit` (reuse `hasStandardEditAccess()` เดิม)
- ตารางทั้ง 2 (`GoldOverSlips`/`GoldUncoveredJobs`) คืน Kendo DataSourceResult แบบเดียวกับ `StalePlans`/`DeliveryAtRiskPlans` เดิม (`{data,total}`)

**Money/sign semantics (สำคัญ — ห้ามคำนวณเงินเองฝั่ง FE เพราะราคาทองต่างกันตามกะรัต)**: `netMoney` บวก =
"ช่างได้คืน", ลบ = "หักช่าง" (**ห้ามเรียกว่า loss ทั้งคู่**) · `excessMoney` เป็นค่า ≥0 เสมอ (มูลค่าทองที่เกิน
เกณฑ์) — FE ใช้ 2 ค่านี้ตรงๆ จาก response ไม่มี derive/คำนวณเองที่ไหนเลย

**workerType resolution**: เป็นเลข (50/80) เสมอ — ห้าม render ดิบ ต้องแปลผ่าน `translateWorkerType` ใน
`insight-tab-layout.vue` (เพิ่มคู่กับ `translateDept` เดิมใน `resolveFindingParams` — ขยาย signature เป็น
`resolveFindingParams(params, translateDept, translateWorkerType)`) resolve เป็น
`view.productionInsight.gold.workerType.<n>` (เก็บเป็น **nested object** `gold.workerType: {50:'ช่างแต่ง',
80:'ช่างฝัง'}` ใน th.js/en.js ตามที่ API agent ระบุ ไม่ใช่ flat key `workerType50`/`workerType80`) — ใช้
mechanism เดียวกันทุกจุดที่ต้องแปล (components, insight-tab-layout, i18n interpolation spec)

Code ใหม่ (namespace เดิม `view.productionInsight.rules`/`help`, `reportRef` ใหม่ 5 ค่า
`goldKpi`/`goldTrend`/`goldWorkers`/`goldOverSlips`/`goldUncovered`):

| กลุ่ม | code | params (ชื่อสุดท้ายจาก API agent) | reportRef | ownerRole |
|---|---|---|---|---|
| problems | `GOLD_EXCESS_OVER_ALLOWANCE` | `workerType,excessGram,excessMoney` | goldOverSlips | — |
| problems | `GOLD_LOSS_ABOVE_TARGET` | `workerType,lossPercent,targetPercent` | goldKpi | — |
| problems | `GOLD_ALLOWANCE_ABOVE_TARGET` | `workerType,allowedPercent,targetPercent` | goldKpi | — |
| problems | `GOLD_MOST_WORKERS_OVER` | `workerType,overCount,workerCount,percent` | goldWorkers | — |
| problems | `GOLD_REPEAT_OFFENDER` | `workerType,workerCode,workerName,buckets` | goldWorkers | — |
| problems | `GOLD_SLIP_COVERAGE_LOW` | `workerType,coveragePercent,coverageJobs,coverageTotalJobs` | goldUncovered | — |
| forecasts | `FC_GOLD_EXCESS_PROJECTED` | `workerType,avgMonthlyExcessGram,avgMonthlyExcessMoney` | goldTrend | — |
| forecasts | `FC_GOLD_LOSS_RISING` | `workerType,fromPercent,toPercent,buckets` | goldTrend | — |
| actions | `ACT_COMPLETE_SLIPS` | `workerType,uncoveredCount` | — | `goldControl` |
| actions | `ACT_TALK_WORKER` | `workerType,workerCode,workerName` | — | `deptHead` |
| actions | `ACT_REVIEW_ALLOWANCE` | `workerType,allowedPercent,targetPercent` | — | `productionManager` |
| actions | `ACT_CHECK_WEIGHING` | `workerType,excessGram` | — | `goldControl` |

โค้ดเหล่านี้มาจาก `ProductionInsight/Gold` โดยตรง — whitelist เพิ่มใน `insight-helpers.js HELP_KEY_CODES`
เหมือนรอบก่อนๆ — **ทุกชื่อ param ตรวจแล้วตรงกับที่ th.js/en.js/`gold-i18n.spec.js` ใช้จริง** (บทเรียนจากรอบ
delivery ที่ตรวจไม่ครบจนมี param หลุด sync 3 จุด — รอบนี้ API agent ส่ง final contract มาก่อนเขียนข้อความเสร็จ
จึงตรวจพร้อมกันได้เลยไม่ต้องแก้ย้อนหลัง)

### Component ใหม่ (Revision 4)

| Component | ไฟล์ | หน้าที่ |
|---|---|---|
| `ProductionInsightGoldSection` | `sections/gold-section.vue` | orchestrator — ยิง `Gold`+`GoldLossTargets`, คุม draftTargets, emit `workers-loaded` ให้ index-view.vue ทำ options ตัวกรอง workerCodes |
| `GoldKpiGroup` | `components/gold-kpi-group.vue` | กล่อง KPI 2 แถว (ช่างฝัง/ช่างแต่ง) × 3 การ์ด (`headerStyle="dashboard"` + `StatCardGeneric` ×6, โชว์ 3 ค่า Loss จริง/ยอมให้/เป้าในการ์ดเดียว) |
| `GoldTrendPanel` | `components/gold-trend-panel.vue` | orchestrator ย่อย reportRef `goldTrend` — `ToggleGroupGeneric` เลือกประเภทช่าง + กราฟ + ปุ่มตั้งเป้า |
| `GoldTrendChart` | `components/gold-trend-chart.vue` | presentational dual-axis (แท่งกรัม แกนซ้าย, เส้น% แกนขวา + เส้นเป้า annotation) รับ `series` ที่กรองแล้วเป็น prop |
| `GoldTargetPanel` / `GoldTargetHistoryModal` | `components/gold-target-{panel,history-modal}.vue` | ปุ่ม+`DrawerGeneric` ตั้งเป้า 2 แถวคงที่ (ช่างฝัง/ช่างแต่ง — ไม่ใช่ N แผนกแบบ wip หรือค่าเดียวแบบ delivery) + ประวัติแยกตาม workerType |
| `GoldWorkerRankingPanel` | `components/gold-worker-ranking-panel.vue` | ตารางอันดับช่าง (reportRef `goldWorkers`, มาจาก `Gold.workers` ตรงๆ ไม่ paginate) |
| `GoldOverSlipsPanel` / `GoldUncoveredJobsPanel` | `components/gold-{over-slips,uncovered-jobs}-panel.vue` | ตาราง paginate อิสระ 2 ตัว ยิง endpoint ของตัวเอง — `GoldUncoveredJobsPanel` reuse `wip-plan-table-helpers.js` (plan link) |
| `gold-helpers.js` (+ spec) | `components/` | pure: loss-vs-target stat variant, net-money variant, draft-target-chip diff check (ต่อ workerType), series field mapper, over-buckets ratio formatter |

### Mapping → โค้ด (Revision 4)

| ไฟล์ | แก้อะไร | agent |
|---|---|---|
| `src/stores/modules/api/production/production-insight-api.js` | เพิ่ม `fetchGold/fetchGoldOverSlips/fetchGoldUncoveredJobs/fetchGoldLossTargets/fetchGoldLossTargetHistory/saveGoldLossTargets` | @ui-implementer |
| `src/components/insight/insight-helpers.js` (+ spec) | เพิ่ม 8 code ใหม่ใน `HELP_KEY_CODES`, ขยาย `resolveFindingParams` รับ `translateWorkerType` (param ที่ 3) | @ui-implementer |
| `src/components/insight/insight-tab-layout.vue` | เพิ่ม method `translateWorkerType` ส่งเป็น translator ตัวที่ 2 ให้ `resolveText`/`resolveHelpText` | @ui-implementer |
| `src/views/production/insight/insight-filters.js` (+ spec) | เพิ่ม `buildDefaultGoldFilter/parseGoldFilterQuery/goldFilterToQuery/clearedGoldFilterQueryKeys` (query prefix `gld*`) | @ui-implementer |
| `src/views/production/insight/components/gold-*.vue` (+ helpers/spec) (ใหม่ทั้งหมด) | KPI/กราฟ/ตาราง/แผงตั้งเป้าใหม่ | @ui-implementer |
| `src/views/production/insight/sections/gold-section.vue` (ใหม่) | mount ทุก component ข้างต้น เชื่อม draft-target-change/target-saved/workers-loaded | @ui-implementer |
| `src/views/production/insight/sections/topic-placeholder-section.vue` | ลบ entry `gold` ออกจาก `TOPIC_LINK`/`TOPIC_CODES` + ลบการฝัง `gold-loss-trend-view.vue` (ย้ายไป section จริงแล้ว — ไฟล์เดิมยังอยู่ ใช้ที่ `/executive` ต่อ ไม่ได้ลบ) | @ui-implementer |
| `src/views/production/insight/index-view.vue` | mount `GoldSection`, ขยาย `hasFilterableFields`/`activeChips`/filter-panel handlers เป็น 3-way (wip/delivery/gold), เพิ่ม `goldWorkerOptions` (populate จาก emit `workers-loaded`) | @ui-implementer |
| `src/language/view/production-insight/{th,en}.js` | เพิ่ม namespace `gold.*` เต็ม (รวม nested `workerType` object) + rules/codeLabel/help ของ 8 code ใหม่ — ลบ `GOLD_PLACEHOLDER_*`/`placeholder.link.gold` (dead, ย้ายไป section จริงแล้ว) | @ui-implementer |
| `src/language/view/production-insight/gold-i18n.spec.js` (ใหม่) | ขยาย pattern เดียวกับ `delivery-i18n.spec.js` มาตรวจ param ของ gold codes | @ui-implementer |
| Backend `ProductionInsight/{Gold,GoldOverSlips,GoldUncoveredJobs,GoldLossTargets,GoldLossTargetHistory,SaveGoldLossTargets}` | ใหม่ทั้งหมด — final contract ส่งมาแล้ว (2026-10-01) | @api-implementer |

- **Decision**: เป้า % Loss เป็นรายประเภทช่าง (2 ค่าคงที่ 50/80) ไม่ใช่รายแผนกแบบ `StageLeadTime`/ไม่ใช่ค่าเดียวแบบ `Delivery` — `GoldTargetPanel` เลยอยู่กึ่งกลางระหว่าง `wip-standards-panel.vue` (per-item map, N แถว) กับ `delivery-target-panel.vue` (scalar เดียว) — ใช้ per-item map pattern ของ wip แต่ fix `ROW_ORDER = [80, 50]` แทนที่จะ loop departments แบบ dynamic
- **Decision**: `translateWorkerType` เพิ่มเป็น translator ตัวที่ 2 ของ `resolveFindingParams` (เดิมรับแค่ `translateDept`) แทนการสร้าง resolver แยกต่างหาก — เพราะ mechanism resolve ของ `insight-tab-layout.vue` (ที่ใช้ร่วมทุกหมวด) ออกแบบไว้แล้วให้ขยาย translator เพิ่มได้ง่ายโดยไม่กระทบ code เดิมของ wip/delivery (ไม่มี param `workerType` อยู่แล้ว)
- **Decision**: `gold.workerType` เก็บเป็น nested object (`{50:'...',80:'...'}`) ไม่ใช่ flat key (`workerType50`) ตามที่ API agent ระบุชัดเจน — ยืนยันแล้วว่า vue-i18n resolve `$t('...gold.workerType.50')` ได้ปกติ (object key ตัวเลขถูก JS coerce เป็น string key โดยอัตโนมัติ)
- verify: `npx eslint` เฉพาะไฟล์ที่แก้ + `npx vitest run` (insight) + `npm run build` (endpoint ใหม่ทั้ง 6 ยังไม่มีจริง เรียกแล้ว error ถือว่าปกติจนกว่า backend จะ deploy)

### Note (2026-10-01, follow-up): metal dimension (ทอง/เงิน) + param formatting fixes

User verified บน prod แล้วสั่งแก้เพิ่ม 4 เรื่อง — contract สุดท้ายจาก API agent:

- **metal 'GOLD'|'SILVER' (default 'GOLD')** เป็น request param ใหม่บน `Gold`/`GoldOverSlips`/`GoldUncoveredJobs` ทั้งก้อน — คุมทั้งหมวด (KPI/กราฟ/ตารางทุกจุด follow ค่านี้ ไม่ผสมทอง/เงินในตัวเลขเดียวกัน เพราะราคาเงินคงที่ 40 ฿/กรัม ต่างจากทองที่แยกตามกะรัต) — `Gold.draftTargets`/`SaveGoldLossTargets` items เป็น `{workerType,metal,targetPercent}`, response `targets[]`/`kpi[]` มี `metal` แนบมาด้วยต่อแถว (ค่าเดียวกับที่ขอเสมอ) ส่วน `series[]`/`workers[]` ไม่มี (ยืนยันจาก API agent) — `GoldUncoveredJobs.start/end` เปลี่ยนจาก optional เป็น **required** (ช่วงเดียวกับ `Gold`) `olderThanDays` เป็นตัวกรองเสริมแยกต่างหาก — **แก้บั๊ก**: `GoldOverSlips` ไม่เคยส่ง `start`/`end` มาตั้งแต่แรก (ไม่อยู่ใน draft contract รอบก่อน) backend สงสัยว่าทำให้ query ไม่มีช่วงเวลาแล้วได้ 0 แถว — เพิ่ม `start`/`end` เป็น required props เข้า `gold-over-slips-panel.vue`/`fetchGoldOverSlips` ด้วย
- UI: เพิ่ม `metal` เข้า gold filter (`insight-filters.js` key `gldMetal`) + `ToggleGroupGeneric` ทอง|เงิน 2 จุด **state เดียวกัน** — ในแผง `FilterPanelGeneric` (field ปกติ) และข้างหัวข้อ `GoldKpiGroup` (prop `metal`/emit `update:metal` ส่งขึ้นผ่าน `gold-section.vue`'s `metal-change` ให้ `index-view.vue` เป็นคนแก้ `filters.gold.metal` จริง — pattern เดียวกับ `onRangePresetChange` คือใช้ทันทีไม่ผ่าน draft/apply) — `GoldKpiGroup`'s title เปลี่ยนเป็น `nav.gold + ' — ' + metalLabel` ("ทองและ Loss — ทอง") ตามที่สั่ง (ลบ i18n key `kpiGroupTitle` เดิมทิ้งเพราะกลายเป็น dead code)
- **เป้าแยกตาม (ประเภทช่าง, โลหะ) 4 ชุดคงที่** (80/50 × GOLD/SILVER) — `GoldTargetPanel` ใช้ composite key `"workerType-metal"` (helper ใหม่ `buildGoldTargetKey`) จัดกลุ่ม UI เป็น 2 กลุ่มโลหะ × 2 แถวประเภทช่าง ในแผงเดียว (เลือกแบบ "4 inputs grouped" ตามตัวเลือกแรกที่ user ให้ไว้ ไม่ใช่ 2 inputs+note) — ข้อความอ้างอิง "% Loss จริงตอนนี้" โชว์เฉพาะแถวที่ตรงกับ `activeMetal` (kpi prop เป็นของโลหะที่กำลังดูอยู่เพียงโลหะเดียว แถวโลหะอื่นไม่มีข้อมูลให้โชว์ ไม่ใช่เอาเลขโลหะอื่นมาแทน) — `shouldShowGoldDraftChip`/`buildGoldDraftTargetsPayload` ขยายรับ `metal` คู่กับ `workerType` ด้วย — ประวัติ (`GoldLossTargetHistory`) filter ทั้ง `workerType`+`metal`
- **i18n param audit รอบ 3**: `GOLD_MOST_WORKERS_OVER`/`GOLD_REPEAT_OFFENDER` เปลี่ยนคำจาก "เกินเป้า" เป็น "เกินเกณฑ์" (เทียบกับ allowance ของ slip ไม่ใช่เป้าที่ตั้งเอง) — `GOLD_REPEAT_OFFENDER`/`ACT_TALK_WORKER` รวมช่างหลายคนเป็น finding/action **เดียว** ต่อประเภทช่าง (ไม่ใช่ 1 finding ต่อ 1 คนแบบเดิม) ด้วย param `workers:[{workerCode,workerName}]` + `count` — เพิ่ม **`formatWorkerNameList`** (`insight-helpers.js`, ตัวใหม่) ต่อท้าย "และอีก N คน" เมื่อเกิน maxNames (default 3, `ACT_TALK_WORKER` ขอ 5 — ส่งผ่าน `resolveMaxWorkerNames(code)` ใน `insight-tab-layout.vue`) ไม่มี overflow ใช้ "และ" คั่นคนสุดท้ายตามไวยากรณ์ไทย — เพิ่ม **numeric-suffix auto-formatter** ใน `resolveFindingParams` (param ที่ชื่อลงท้าย `Money`=0 ตำแหน่ง, `Gram`/`Percent`=ไม่เกิน 2 ตำแหน่ง ใส่ตัวคั่นหลักพันเสมอ, case-sensitive กันชนกับ param ชื่อสั้นเดิมของ wip เช่น `percent`/`count`) — **ทุก code เพิ่ม `metal` param** (translate ผ่าน `translateMetal` ใหม่ ตัวที่ 3 ของ `resolveFindingParams` คู่กับ `translateDept`/`translateWorkerType` เดิม, reuse namespace `gold.metalLabel` เดียวกับ UI toggle) ข้อความทุกตัวแปะ `({metal})` ต่อท้าย `{workerType}`
- `GoldUncoveredJobsPanel` เพิ่ม note "ตามช่วงวันที่งานที่เลือก" (`uncoveredRangeNote`) ตามที่สั่ง เพราะตารางนี้ range-scoped แล้วฝั่ง backend (ตัดแถวข้อมูลทดสอบ/ปีเก่าออกไปเอง)
- verify: `npx eslint` เฉพาะไฟล์ที่แก้ + `npx vitest run` (insight, 251 ผ่านทั้งหมด) + `npm run build`

## Revision 5 (2026-10-01): หมวด "กำลังการผลิต" (capacity tab) + อัปเดต capacity ของ wip tab

หมวด `capacity` ("กำลังการผลิต") ย้ายจาก placeholder เป็นเนื้อหาจริงเต็มรูปแบบ ตาม pattern `wip`/`delivery`/
`gold` — orchestrator ใหม่ `sections/capacity-section.vue` ยิง `ProductionInsight/Capacity` ครั้งเดียวได้ทั้ง
problems/forecasts/actions/status + kpi/series/departments/costCardToDone — **bucket เป็นรายเดือนเสมอ** (ไม่
ผันตาม range preset แบบหมวดอื่นที่ใช้ weekสำหรับ ≤6m — ยืนยันจาก API agent เพราะตัวเลข "ใบออก/เดือน" ไม่มี
ความหมายเป็นรายสัปดาห์) — `unit:'plan'|'piece'` คุมแค่ตัวเลข "งานเข้า" ในกราฟแนวโน้มเท่านั้น (ผลิตเสร็จ/
ปิดสำเร็จ/งานค้างยังนับเป็นใบเสมอ ไม่มีหน่วยชิ้นให้จากฝั่ง API) — KPI card ทั้ง 5 ช่องไม่ผันตาม unit เลย (โชว์
ทั้งใบและชิ้นคู่กันเสมอ)

**5 ส่วนตามที่ user ระบุ**: (1) `CapacityKpiGroup` 5 StatCards (งานเข้า+ชิ้น, ผลิตเสร็จ+สุทธิ±, งานค้างเทียบเท่า
เดือน+ใบ, คอขวด+คิววัน, บัตรต้นทุน→สำเร็จค่ากลาง+P90+ค้างอยู่) ต้อง cross-reference `departments[]` เพื่อดึง
queueDays ของแผนกคอขวด (kpi.bottleneckDepts เป็นแค่ array ของ key ไม่มี queueDays ติดมา) — เลยรับ prop
`departments` เพิ่มเข้ามานอกจาก `kpi` เอง (2) `CapacityTrendChart` dual-axis (แท่งงานเข้า/ผลิตเสร็จ/ปิดสำเร็จ
แกนซ้าย + เส้นงานค้างปลายงวด แกนขวา) ตาม pattern `gold-trend-chart.vue` (3) `CapacityDepartmentPanel`
(table+detail chart รวมไว้ orchestrator เดียว ตาม pattern `wip-lead-time-panel.vue` เป๊ะ — คลิกแถว = เลือก
แผนกไปโชว์กราฟ "ใบออก vs จำนวนช่าง" รายเดือนของแผนกนั้น) — ชิปคอขวดของแผนก "บัตรต้นทุน" ใช้ข้อความ
"คอขวด·เอกสาร" แยกจากคอขวดสายการผลิตทั่วไป (4) `CapacityCostcardPanel` (กล่องใหม่ที่ user ขอเพิ่ม — KPI
line ค่ากลาง/P90/ค้างอยู่/ค้างเกิน 30 วัน + กราฟรายเดือน + ตาราง `CapacityCostcardPendingPanel` แยก ยิง
`CostCardPendingPlans` เอง paginate อิสระ ไม่มีตัวกรองนอกจาก paging ตามคอนแทรค — reuse pattern
`delivery-stuck-costcard-panel.vue` เป๊ะ รวม `resolvePlanLinkState`) (5) `CapacityWhatIfPanel` — **client-side
ล้วน ไม่มี API ไม่มีการบันทึก** (ปิดหน้าแล้วหาย) จำลองเพิ่ม/ลดช่างต่อแผนก (ไม่รวมแผนก "บัตรต้นทุน" — วิเคราะห์
แยกที่กล่อง 4) สมมติ `plansPerWorker` คงที่เท่าปัจจุบัน คำนวณ `exits`/`queueDays` ใหม่ล้วนๆ ฝั่ง client
(`capacity-helpers.js`: `calcWhatIfExits`/`calcWhatIfQueueDays`/`buildWhatIfRows`/`sumWhatIfField`/
`resolveWhatIfBottleneck`) — ตารางใช้ `BaseDataTable :paginator="false"` พร้อม custom cell template สำหรับ
ช่อง input (lint บังคับ ห้าม `<table>` ดิบใน views ตาม skill `generic-components`)

**mapping คำไทย ↔ field ที่ชวนสับสน (บันทึกไว้กันงง)**: "ผลิตเสร็จ" = field `completed` (เข้าบัตรต้นทุน
ครั้งแรก งานช่างจบ — ตามนิยามที่ user ให้ตรงๆ) ใช้คำนี้สม่ำเสมอทั้ง KPI card และแท่งที่ 2 ของกราฟแนวโน้ม —
"ปิดสำเร็จ" = field `output` (ปิดงานเต็มขั้นตอนหลังบัตรต้นทุน, ใช้คำนวณ `netPerMonth = inflow − output` ด้วย
ตามที่ API agent ยืนยัน) ใช้เฉพาะแท่งที่ 3 ของกราฟแนวโน้ม ไม่มี KPI card แยก — การตัดสินใจนี้ยึดตามนิยาม
"ผลิตเสร็จ" ที่ user ให้ตรงๆ เป็นหลัก (ไม่ใช่ตามลำดับ field ใน draft contract) เพราะ KPI card "ผลิตเสร็จ/เดือน"
ต้องใช้คำเดียวกับที่ user นิยามไว้แน่นอน — ยังไม่ได้ยืนยันกับ API agent โดยตรงว่าการแมปนี้ถูกต้อง 100%
(ไม่มี field ไหนชื่อ "completed"/"output" ที่ระบุชัดว่าคำไหนคู่กับคำไหน) ถ้าผิดสลับกันง่ายมาก แค่สลับ field ใน
`capacity-trend-chart.vue`'s `chartSeries` + สลับ primary value ของ KPI card 2 ใน `capacity-kpi-group.vue`

**findings/actions**: 6 problem/forecast code (`CAP_BACKLOG_MONTHS`/`CAP_QUEUE_BOTTLENECK`/
`CAP_INFLOW_OVER_OUTPUT`/`CAP_COSTCARD_SLOW`/`FC_BACKLOG_PROJECTED`/`FC_PEAK_RISK`) + 4 action
(`ACT_ADD_WORKER`/`ACT_SPEED_COSTCARD`/`ACT_CLEAN_STALE`/`ACT_SMOOTH_INFLOW`) — param ตรงกับ final contract
ที่ API agent ยืนยันเป๊ะ — เพิ่ม generic mechanism ใหม่ 2 ตัวใน `insight-helpers.js` (ใช้ร่วมได้กับหมวดอื่น
ในอนาคต ไม่ผูกกับ capacity เฉพาะ): **`formatDeptQueueList(depts, translateDept)`** จัดการ param array รูปแบบ
ใหม่ `depts:[{deptKey,queueDays,waitingNow}]` ของ `CAP_QUEUE_BOTTLENECK` (ต่างจาก `workers[]` เดิมของ gold
ตรงที่ต้องประกอบเป็นวลีเต็มต่อรายการ ไม่ใช่แค่รวมชื่อ) ต่อ "{ชื่อแผนก} ~{คิว} วัน (รอ {งาน} ใบ)" คั่นด้วย ", "
ตามตัวอย่างที่ API agent ให้ตรงๆ — **`formatThaiMonthYear(yyyyMm)`** แปลง `"2026-06"` → `"มิ.ย. 2026"` (ปี ค.ศ.
ตรงๆ ไม่ใช้ `Intl.DateTimeFormat('th-TH')` ที่แปลงเป็น พ.ศ. อัตโนมัติ ซึ่งไม่ตรงกับตัวอย่างที่ API agent ให้)
ใช้กับ param `peakMonth` ของ `CAP_INFLOW_OVER_OUTPUT`/`FC_PEAK_RISK` — ทั้งคู่ผูกเข้า `resolveFindingParams`
อัตโนมัติเมื่อ param ชื่อ `depts`/`peakMonth` ปรากฏ (เหมือนกลไก `workers`/`deptKey`/`workerType`/`metal` เดิม)

**อัปเดต `wip-capacity-panel.vue`** (กล่อง "ผลต่อกำลังการผลิต" ของ wip tab เดิม) ตาม delta ที่ API agent ส่งมา
พร้อมกัน: `StageLeadTime.departments[]` เพิ่ม `activeWip`/`queueDaysCurrent`/`queueDaysAtStandard` และ
`bottleneckDept` สรุปด้านบนเปลี่ยนความหมายเป็น "แผนกที่คิวยาวที่สุด" (ไม่ใช่ "แผนกที่ปล่อยงานได้น้อยที่สุด"
แบบเดิม) — ย้ายชิปคอขวด (`isBottleneckCurrent`/`isBottleneckAtStandard`) จากคอลัมน์ "ออกจริง (ใบ/วัน)"/
"ถ้าได้ตามมาตรฐาน (ใบ/วัน)" เดิม ไปผูกกับคอลัมน์ใหม่ "คิวเทียบเท่าตอนนี้ (วัน)"/"คิวเทียบเท่าถ้าได้มาตรฐาน
(วัน)" แทน (คอลัมน์เก่ากลายเป็นตัวเลขล้วนไม่มีชิปแล้ว) + เพิ่มคอลัมน์ "งานค้าง (ใบ)" (activeWip) + แก้
`help.capacityModelExplanation` ให้ตรงนิยามใหม่ตรงๆ

**ลบ dead code**: `topic-placeholder-section.vue` TOPIC_LINK/TOPIC_CODES entry `capacity` + i18n
`CAPACITY_PLACEHOLDER_BELOW_AVG`/`CAPACITY_PLACEHOLDER_MONTH_END_FORECAST`/`placeholder.link.capacity`

### ไฟล์ที่แตะ

| ไฟล์ | สรุป | เจ้าของ |
|---|---|---|
| `src/views/production/insight/components/capacity-*.vue` (+ helpers/spec) (ใหม่ทั้งหมด) | KPI/กราฟ/ตารางแผนก/บัตรต้นทุน/what-if | @ui-implementer |
| `src/views/production/insight/sections/capacity-section.vue` (ใหม่) | mount ทุก component ข้างต้น | @ui-implementer |
| `src/views/production/insight/components/wip-capacity-panel.vue` | เพิ่มคอลัมน์ activeWip/queueDaysCurrent/queueDaysAtStandard ย้ายชิปคอขวดไปผูกคอลัมน์คิว + แก้ tip | @ui-implementer |
| `src/views/production/insight/sections/topic-placeholder-section.vue` | ลบ entry `capacity` | @ui-implementer |
| `src/views/production/insight/index-view.vue` | mount `CapacitySection`, ขยาย `hasFilterableFields`/`activeChips`/filter-panel handlers เป็น 4-way, `bucket` บังคับ 'month' เฉพาะ capacity | @ui-implementer |
| `src/views/production/insight/insight-filters.js` | เพิ่มชุดฟังก์ชัน capacity filter คู่ขนานกับ gold/delivery (`CAPACITY_BUCKET` คงที่ 'month') | @ui-implementer |
| `src/components/insight/insight-helpers.js` | เพิ่ม `formatDeptQueueList`/`formatThaiMonthYear` + ผูกเข้า `resolveFindingParams` | @ui-implementer |
| `src/language/view/production-insight/{th,en}.js` | เพิ่ม namespace `capacity.*` เต็ม + rules/codeLabel/help ของ 10 code ใหม่ + อัปเดต wip.capacity* 3 key ใหม่ | @ui-implementer |
| `src/language/view/production-insight/capacity-i18n.spec.js` (ใหม่) | ขยาย pattern เดียวกับ `gold-i18n.spec.js` | @ui-implementer |
| Backend `ProductionInsight/{Capacity,CostCardPendingPlans}` + `StageLeadTime` delta | ใหม่/แก้ — final contract ยืนยันแล้ว (2026-10-01) | @api-implementer |

- **Decision**: what-if panel ไม่ auto-reset ค่าที่ผู้ใช้กำลังจำลองอยู่ทุกครั้งที่ `departments` prop เปลี่ยน
  (เช่น ตัวกรองเปลี่ยนแล้ว fetch ใหม่) — init ค่าเริ่มต้นแค่ครั้งแรกที่มีข้อมูลจริงเท่านั้น มีปุ่ม "รีเซ็ต" ให้
  กดเองตอนอยากเริ่มใหม่ (กันค่าที่กำลังทดลองอยู่หายไปเฉยๆ โดยผู้ใช้ไม่ได้ตั้งใจ)
- verify: `npx eslint` เฉพาะไฟล์ที่แก้ (clean) + `npx vitest run` (insight, 364 ผ่านทั้งหมด) + `npm run build`
  (สำเร็จ) + grep `border-left` ไฟล์ที่เปลี่ยนทั้งหมด (เจอแค่ในคอมเมนต์ที่บอกว่า "ห้ามใช้" ไม่ใช่ CSS จริง)

### Note (2026-10-01, follow-up): แก้ 3 จุดที่ยังค้างจาก Revision 5 — contract สุดท้ายจาก API agent

1. **mapping "ผลิตเสร็จ"/"ปิดสำเร็จ" สลับกัน** — ของจริง: `output` = เข้าบัตรต้นทุนครั้งแรก (งานช่างจบ) =
   "ผลิตเสร็จ" (KPI card 2 ใช้ `kpi.outputPerMonth`, กราฟแนวโน้มแท่งที่ 2, `netPerMonth = inflow − output`,
   `backlogMonths` หารด้วย output) — `completed` = "ปิดสำเร็จ" ขั้นถัดไป ใช้แค่กราฟแนวโน้มแท่งที่ 3 ไม่มี KPI
   card ของตัวเอง — ย้าย field name 2 ตัวนี้ไปเป็นค่าคงที่ใหม่ `CAPACITY_PRODUCED_FIELD`('output')/
   `CAPACITY_CLOSED_FIELD`('completed') ใน `capacity-helpers.js` (import ใช้ตรงใน `capacity-kpi-group.vue`/
   `capacity-trend-chart.vue` แทน hardcode ชื่อ field เอง) พร้อม spec ยืนยันค่าคงที่ 2 ตัวนี้ตรงๆ กันสลับผิด
   อีกรอบ
2. **`exitsSeries` แยก array จาก `workersSeries`** — ยืนยันแล้วว่า `departments[]` item มี
   `exitsSeries:[{bucketEnd,exits}]` เพิ่มมาต่างหาก (ไม่ได้ฝังใน `workersSeries` point เดียวกัน) — เพิ่ม helper
   ใหม่ `alignSeriesByBucket(points, series, field)` (+ spec) จับคู่ 2 array ที่แกน x เดียวกันด้วย `bucketEnd`
   (bucket หาคู่ไม่เจอ = null ช่องว่าง ไม่ coerce เป็น 0) ใช้ใน `capacity-department-chart.vue` แทนการอ่าน
   `point.exits` จาก `workersSeries` ตรงๆ แบบเดิม — ลบ comment "⚠️ สมมติฐานที่รอยืนยัน" ทิ้งเพราะยืนยันแล้ว
3. **`departmentKeys` ไม่ส่งไป `ProductionInsight/Capacity`** (API ไม่รับ ยืนยันแล้ว) — ลบออกจาก
   `fetchCapacity` store action + `capacity-section.vue` เปลี่ยนจาก deep-watch ทั้ง `filter` เป็น watch เฉพาะ
   `unit`/`start`/`end`/`bucket` (field ที่ endpoint รับจริง) ไม่ watch `departmentKeys` อีกต่อไป (กัน refetch
   โดยไม่จำเป็นเมื่อแก้แค่ตัวกรองแผนก) — เพิ่ม computed `filteredDepartments` กรอง client-side เอง ใช้แค่กับ
   `CapacityDepartmentPanel`/`CapacityWhatIfPanel` (ตาราง/แผงจำลอง/กราฟรายละเอียด) ส่วน `CapacityKpiGroup`
   ยังรับ `departments` เต็มไม่กรอง (คอขวดภาพรวมทั้งบริษัทต้องถูกต้องเสมอ ไม่ขึ้นกับตัวกรองตาราง) — เพิ่ม tip
   "กรองเฉพาะตารางรายแผนก" (`help.capacityFilterDept`) ใต้ field ตัวกรองแผนกใน filter panel ตามที่สั่งเป๊ะ

verify: `npx eslint` เฉพาะไฟล์ที่แก้ (clean) + `npx vitest run` (insight, 370 ผ่านทั้งหมด) + `npm run build`
(สำเร็จ) + grep `border-left` ไฟล์ที่เปลี่ยนทั้งหมด (เจอแค่ในคอมเมนต์ "ห้ามใช้")

## Revision 4.1 (2026-10-01): เพิ่มส่วน "Loss ตามใบงานรายแผนก (จ่าย − รับ)" เข้าหมวด "ทองและ Loss" (gold tab)

เพิ่มส่วนใหม่ "Loss ตามใบงานรายแผนก (จ่าย − รับ)" ลงในหมวด `gold` เดิม (Revision 4) — วางไว้ **ขวาง**
`GoldKpiGroup` (KPI ของ slip) กับ `GoldTrendPanel` (แนวโน้ม slip + ปุ่มตั้งเป้า) ตามที่ user ระบุ "right after
the slip KPI group" — ใช้ metal state เดียวกับทั้งหมวด (`filter.metal` เดิม ไม่เพิ่ม toggle ใหม่) — ยิง
`ProductionInsight/GoldByStage` เป็น endpoint ที่สอง **แยกจาก** `Gold` (คนละ response แต่ยิงพร้อมกันเสมอทุกครั้ง
ที่ filter เปลี่ยน/แก้เป้า — ดู `fetchAll`/`onTargetDraftChange`/`onTargetSaved` ใน `gold-section.vue`) —
GoldByStage **ไม่มี** problems/forecasts/actions ของตัวเอง (findings ของส่วนนี้มาทาง `Gold()` ปนกับของ slip
ตามที่ API agent ยืนยัน — ใช้ `InsightTabLayout`/`resolveFindingParams` กลไกเดิมได้ทันที ไม่ต้องแก้ layout)

### โครงสร้าง component ใหม่ (6 ไฟล์ + helpers)

- `gold-stage-panel.vue` — orchestrator รวมทั้งหมด (department-panel + trend-chart + outlier + pending) วาง
  ไว้ที่เดียวใน `gold-section.vue`
- `gold-stage-department-panel.vue` + `gold-stage-table.vue` + `gold-stage-detail-chart.vue` +
  `gold-stage-worker-table.vue` — ตาราง 8 คอลัมน์ (แผนก/จ่าย/รับ/ส่วนต่าง/%/เป้า %/% จาก slip/ค้างไม่รับคืน)
  คลิกแถว = กราฟรายเดือน + ตารางช่าง (ตาม pattern `capacity-department-panel.vue`/`wip-lead-time-panel.vue`
  เป๊ะ — ตารางช่างไม่ยิง endpoint แยก ใช้ `departments[].workers[]` ที่ซ้อนมาในตัวอยู่แล้ว) — reportRef เดียว
  `goldStage` ครอบทั้งตาราง+รายละเอียด
- `gold-stage-trend-chart.vue` — กราฟรวมทุกแผนก (เส้นละแผนก, `CHART_PALETTE`) — ซ่อนเส้น "ช่างแต่ง" (trim)
  เป็นค่าเริ่มต้นด้วย `chart.events.mounted → chartContext.hideSeries(name)` (ยังกดเปิดจาก legend ได้) พร้อม
  note อธิบายเหตุผล (เศษ/ก้านทำให้ % แกว่งแรงบดบังแผนกอื่น)
- `gold-stage-outlier-jobs-panel.vue`/`gold-stage-pending-return-panel.vue` — paged table แยก ยิง
  `GoldStageOutlierJobs`/`GoldStagePendingReturn` เอง (reuse `resolvePlanLinkState`/`wip-plan-table-helpers.js`
  เหมือนตารางอื่นทุกตัวในโปรเจกต์) — pending ใช้ `filter.olderThanDays` ตัวเดียวกับ `GoldUncoveredJobsPanel`
- `gold-stage-helpers.js` (+ spec) — pure logic: `mapGoldStageSeriesField`/`filterStageSeriesByDept`/
  `collectStageBuckets`/`alignStageSeriesToBuckets` (ประกอบกราฟรวมจาก series แบนรวมทุกแผนกปนกัน — ต่างจาก
  `GoldByStage.series` ของทุกหมวดก่อนหน้าที่แยก array ต่อมิติให้แล้ว), `resolveStageDiffVariant`,
  `formatPendingSummary`, `buildGoldStageDraftTargetsPayload`, `resolveDefaultStageDeptKey`

### แผงตั้งเป้า (point 5) — ขยาย `gold-target-panel.vue` เดิมเป็น 2 กลุ่ม ไม่สร้างปุ่ม/แผงใหม่

ปุ่ม "ตั้งเป้า Loss" เดิม (อยู่ใน toolbar ของ `GoldTrendPanel`) เปิดแผงเดียวที่ตอนนี้มี **2 กลุ่ม**: "เป้า %
Loss ตามใบ slip" (เดิม 4 แถว 80/50 × GOLD/SILVER) + "เป้าตามแผนก (จ่าย − รับ)" (ใหม่ 6 แถว 60/80/90 ×
GOLD/SILVER) — draft ของทั้ง 2 กลุ่มรวมเป็น array เดียว ส่งให้ทั้ง `Gold` (ขับเคลื่อน slip rules + stage rules
พร้อมกัน — API agent ยืนยันให้ส่งทั้ง 2 scope ไปที่ endpoint นี้เสมอ) และ `GoldByStage` (ขับเคลื่อน
`departments[]` preview) **พร้อมกันทุกครั้ง** ไม่แยกว่าผู้ใช้แก้กลุ่มไหน (ง่ายกว่า ไม่ error-prone ตามที่ user
ให้ freedom เลือกเอง) — `GoldTargetHistoryModal` ขยายรับ prop `scope`/`deptKey` คู่กับ `workerType` เดิม เลือก
query ตาม scope ที่เปิดมา

### ⚠️ field name ที่ตอนแรกเข้าใจผิด แก้แล้ว (บทเรียนสำคัญ)

Draft contract แรกไม่ได้สะกด field ของ **target record** (draftTargets/GoldLossTargets items/History
query/Save items) ชัดเจนว่าใช้ชื่ออะไรฝั่ง STAGE — ตอนแรกสันนิษฐานว่าใช้ `deptKey` คู่กับ SLIP ที่ใช้
`workerType` (ให้เหตุผลในแง่ชื่อที่ "ตรงความหมาย" กว่า) — **ผิด**: API agent ยืนยันว่า target record (ทุก
endpoint: `GoldLossTargets` GET, `GoldLossTargetHistory` query, `SaveGoldLossTargets` items, `Gold`/
`GoldByStage` draftTargets) ใช้ field ชื่อ **`workerType` เสมอไม่ว่า scope ไหน** (STAGE ส่งรหัสแผนก 60/80/90
ใต้ key `workerType` เหมือนกัน) — มีแค่ `GoldByStage.departments[]`/`series[]` และตาราง
outlier/pending (`GoldStageOutlierJobs`/`GoldStagePendingReturn`) เท่านั้นที่ใช้ `deptKey` จริง — แก้
`buildGoldStageDraftTargetsPayload`/`gold-target-panel.vue`'s `stageSavedMap`/store action
`fetchGoldLossTargetHistory` ให้ส่ง `workerType` ตรงตามนี้แล้ว (ดู comment `⚠️` ในแต่ละไฟล์)

### resolveFindingParams ขยาย translator ตัวที่ 5 แบบไม่เพิ่ม parameter ใหม่ (reuse translateDept เดิม)

Code ใหม่ 2 ตัว (`GOLD_STAGE_ABOVE_TARGET`/`FC_GOLD_STAGE_RISING`) มี param `deptKey` และ
`GOLD_STAGE_PENDING_RETURN` มี `topDeptKey` — แต่ `deptKey` เป็น **รหัสตัวเลข** (60/80/90, namespace
`gold.stageKey`) ต่างจาก `deptKey` เดิมของ wip/capacity ที่เป็น **string key** (`'trim'`/`'setting'`,
namespace `view.executive.department`) — ชนกันที่ชื่อ param เดียวกันเป๊ะ แก้โดยไม่เพิ่ม parameter ใหม่ให้
`resolveFindingParams` (ยังรับแค่ `translateDept` ตัวเดียวเหมือนเดิม) แต่ทำให้ `translateDept` ที่
`insight-tab-layout.vue` ฉีดเข้ามา **แยกตาม `typeof` ค่าที่ได้รับ** (`number` → `gold.stageKey.<n>`, `string`
→ `view.executive.department.<key>`) — ปลอดภัย 100% เพราะ wip/capacity ไม่มี deptKey เป็นตัวเลขอยู่แล้ว —
`topDeptKey` เพิ่ม branch ใหม่ใน `resolveFindingParams` ที่ reuse `translateDept` ตัวเดียวกันตามที่ API agent
สั่ง "extend the resolver to *DeptKey / topDeptKey"

### ไฟล์ที่แตะ

| ไฟล์ | สรุป | เจ้าของ |
|---|---|---|
| `src/views/production/insight/components/gold-stage-*.vue` (+ helpers/spec) (ใหม่ทั้งหมด) | ตาราง/กราฟ/outlier/pending ของส่วนใหม่ | @ui-implementer |
| `src/views/production/insight/sections/gold-section.vue` | ยิง `GoldByStage` คู่ขนานกับ `Gold` เสมอ, mount `GoldStagePanel`, รวม draft 2 scope เป็น array เดียว | @ui-implementer |
| `src/views/production/insight/components/gold-target-panel.vue` | ขยาย 2 กลุ่ม (SLIP เดิม + STAGE ใหม่), prop `stageDepartments` ใหม่, draft-change payload เปลี่ยนจาก array แบนเป็น `{slip,stage}` | @ui-implementer |
| `src/views/production/insight/components/gold-target-history-modal.vue` | เพิ่ม prop `scope`/`deptKey` ใช้ร่วมกับ `workerType` เดิม | @ui-implementer |
| `src/views/production/insight/components/gold-trend-panel.vue` | ส่งต่อ `stageDepartments` เข้า `GoldTargetPanel`, relay draft payload ชนิดใหม่ | @ui-implementer |
| `src/views/production/insight/components/gold-helpers.js`(+spec) | `buildGoldDraftTargetsPayload` เติม `scope:'SLIP'` ทุก item, `shouldShowGoldDraftChip` เช็ค scope กันชนกับ STAGE | @ui-implementer |
| `src/components/insight/insight-helpers.js`(+spec) | เพิ่ม `topDeptKey` handling (reuse translateDept) | @ui-implementer |
| `src/components/insight/insight-tab-layout.vue` | `translateDept` แยก type-aware (number→gold.stageKey, string→executive.department) | @ui-implementer |
| `src/stores/modules/api/production/production-insight-api.js` | เพิ่ม `fetchGoldByStage`/`fetchGoldStageOutlierJobs`/`fetchGoldStagePendingReturnJobs`, แก้ `fetchGoldLossTargetHistory` ส่ง `workerType`+`scope` | @ui-implementer |
| `src/language/view/production-insight/{th,en}.js` | เพิ่ม `gold.stage*` namespace เต็ม + rules/codeLabel/help ของ 6 code ใหม่ | @ui-implementer |
| `src/language/view/production-insight/gold-i18n.spec.js` | เพิ่ม 8 เคสใหม่ (6 rule code + stageDetailTitle) | @ui-implementer |
| Backend `ProductionInsight/{GoldByStage,GoldStageOutlierJobs,GoldStagePendingReturn}` + `Gold`/`GoldLossTargets*` delta | ใหม่/แก้ — final contract ยืนยันแล้ว (2026-10-01) | @api-implementer |

- **Decision**: `GoldStageTrendChart` ไม่มี target-line overlay (จุดที่ระบุว่า "optional" ในโจทย์) — ตัดออก
  เพื่อประหยัดเวลา เพราะกราฟรายละเอียดราย 1 แผนก (`GoldStageDetailChart`) มี target line อยู่แล้วและเป็นจุดที่
  ผู้ใช้เข้าถึงบ่อยกว่า (ต้องการดูแผนกเดียวชัดๆ มากกว่าดูเป้าซ้อนทุกเส้นพร้อมกัน)
- **Decision**: `GoldByStage.departments[].notWeighed=true` (gemSort/คัดพลอย) โชว์เป็นข้อความ "ไม่ได้ชั่งน้ำหนัก"
  แทนตัวเลขทุกคอลัมน์ทีละเซลล์ (ไม่ใช่ colspan จริงแบบ merge cell เดียว — BaseDataTable/PrimeVue wrapper ของ
  โปรเจกต์ไม่รองรับ colspan ง่ายๆ) — เป็นการลดรูปที่ยอมรับได้ ผลลัพธ์ที่ผู้ใช้เห็นเหมือนกัน (ไม่มีตัวเลขให้เข้าใจ
  ผิด) แค่ implementation ไม่ได้ merge cell จริง
- verify: `npx eslint` เฉพาะไฟล์ที่แก้ (clean) + `npx vitest run` (insight, 416 ผ่านทั้งหมด) + `npm run build`
  (สำเร็จ) + grep `border-left` ไฟล์ที่เปลี่ยนทั้งหมด (เจอแค่ในคอมเมนต์ "ห้ามใช้")

### Note (2026-10-01, follow-up): แก้ deptKey/topDeptKey กลับเป็น string key — ยืนยันจาก source code จริง

API agent ตรวจสอบจาก `ProductionInsightRuleEngine.cs` ฝั่ง backend ตรงๆ แล้วแจ้งกลับ 2 จุดที่ Revision 4.1
เข้าใจผิด:

1. **param `deptKey`/`topDeptKey` ของ finding/action (GOLD_STAGE_ABOVE_TARGET/FC_GOLD_STAGE_RISING/
   ACT_CHECK_STAGE/GOLD_STAGE_PENDING_RETURN) เป็น string dept key เดียวกับ wip/capacity**
   ('trim'/'rawPolish'/'gemSort'/'setting'/'plating') **ไม่ใช่รหัสตัวเลข 60/80/90 แยกชุดแบบที่เข้าใจผิดตอน
   แรก** — ลบ type-aware branch (`typeof key === 'number'`) ออกจาก `translateDept` ใน
   `insight-tab-layout.vue` กลับไปเป็น `view.executive.department.${key}` ตรงๆ เหมือนเดิมทุกหมวด (ของเดิม
   ก่อน Revision 4.1 ถูกต้องอยู่แล้ว ไม่ต้องแก้อะไรเพิ่มนอกจากลบ branch ที่เพิ่งเพิ่มไป) — ลบ i18n namespace
   `gold.stageKey` (นัมเบอร์-อินเด็กซ์) ทิ้งทั้งหมด เพราะกลายเป็น dead code
2. **ป้ายชื่อตัวเลขที่เดาไว้ผิดอยู่แล้ว**: status 50=แต่ง, **60=ขัดดิบ, 70=คัดพลอย, 80=ฝัง, 90=ขัดชุบ**
   (ไม่ใช่ 60=ช่างแต่ง/90=ช่างขัด ตามที่เดาไว้ — เลขเดิมเป็นเลขสถานะที่มีอยู่แล้วทั้งระบบ ตรงกับ
   `view.executive.department.{rawPolish,setting,plating}` เป๊ะ) — **target record (scope='STAGE') ยังคงใช้
   field `workerType` เป็นตัวเลข 60/80/90 จริง** (ไม่เปลี่ยน ยืนยันซ้ำแล้ว) เพียงแต่ label ต้องแปลงเป็น string
   deptKey ก่อนด้วย mapping ใหม่ `STAGE_TARGET_WORKER_TYPE_DEPT_KEY = {60:'rawPolish',80:'setting',90:'plating'}`
   (`gold-stage-helpers.js`) แล้วแปลผ่าน `view.executive.department.*` ตัวเดียวกับทุกหมวด (ไม่สร้างคำแปลซ้ำ) —
   `gold-target-panel.vue`'s `stageRows` เปลี่ยนจากไล่ `STAGE_DEPT_ORDER` (เลข, ชื่อตัวแปรเดิม) เป็น
   `STAGE_TARGET_WORKER_TYPE_ORDER` (เลขเดิม [60,80,90] แค่เปลี่ยนชื่อให้ชัดว่าเป็น "เลข workerType ของ target
   record" ไม่ใช่ "deptKey ของตารางหลัก") — `gold-target-history-modal.vue` เรียบง่ายขึ้นด้วย: ลบ prop
   `deptKey` แยกทิ้ง เหลือแค่ `workerType` ตัวเดียว (ทั้ง SLIP/STAGE row ใช้ field เดียวกันแล้ว ไม่ต้องแยกตาม
   scope อีกต่อไป)

**sub-note ที่สลับกันไปด้วย** (เพราะตอนแรกคิดว่า 80="gemSort" ซึ่งผิด — "gemSort" ในคำสั่งแปลว่าแผนกคัดพลอยจริง
ไม่ใช่ "ฝัง"): โชคดีที่ `gold-stage-table.vue`/`gold-stage-trend-chart.vue` เช็ค sub-note (scrap/not-weighed)
จาก **flag `includesScrap`/`notWeighed` ตรงๆ อยู่แล้ว** ไม่ได้ hardcode เทียบ deptKey เลย — พฤติกรรมจริงจึง
**ไม่เคยผิด** มีแค่ **doc comment**/**help text** (`goldStageDefinition`, `stageTrendTrimHiddenNote`) ที่เขียน
ชื่อแผนกผิด ("ช่างฝัง"/"ช่างแต่ง" แทนที่จะเป็น "คัดพลอย"/"แต่ง") ต้องแก้ข้อความให้ตรง

**Decision ที่เคยเปิดไว้ปิดแล้ว**: ป้ายชื่อ deptKey/workerType เดิม "ยังไม่ยืนยันกับ API agent" — ตอนนี้ยืนยัน
แล้วจากการตรวจ source code ฝั่ง backend ตรงๆ ไม่ใช่แค่การสื่อสารผ่านข้อความ — เพิ่ม spec ใหม่ใน
`gold-stage-helpers.spec.js` (`resolveStageTargetDeptKey`) + `gold-i18n.spec.js` (describe block
"STAGE target workerType (60/80/90) label resolution end-to-end" — ยืม i18n instance ของ
`src/language/view/executive/th.js` เข้ามาตรวจ end-to-end ว่า 60/80/90 → ขัดดิบ/ฝัง/ขัดชุบ จริง ไม่ใช่แค่ตรวจ
ว่า mapping function คืนค่าตรงกับตัวเองเฉยๆ)

verify: `npx eslint` เฉพาะไฟล์ที่แก้ (clean) + `npx vitest run` (insight, 422 ผ่านทั้งหมด) + `npm run build`
(สำเร็จ) + grep `border-left` ไฟล์ที่เปลี่ยนทั้งหมด (เจอแค่ในคอมเมนต์ "ห้ามใช้")

## Revision 6 (2026-10-01): หมวด "ช่างและค่าแรง" (workers tab) + employmentType ในหน้าข้อมูลช่าง

หมวด `workers` ("ช่างและค่าแรง") ย้ายจาก placeholder เป็นเนื้อหาจริงเต็มรูปแบบ — เหลือแค่ `materials`
("วัตถุดิบที่กระทบการผลิต") ที่ยังเป็น placeholder — orchestrator ใหม่ `sections/workers-section.vue` ยิง
`ProductionInsight/Workers` ครั้งเดียวได้ทั้ง problems/forecasts/actions/status +
kpi/series/seriesTotal/workers/concentration — **bucket เป็นรายเดือนเสมอ** (เหมือน capacity ไม่มีพารามิเตอร์
bucket ใน contract เลย) — **ต่างจาก capacity ตรงที่ `departmentKeys`/`employmentTypes` ส่งไป server จริง**
(ยืนยันจาก API agent) จึง deep-watch ทั้ง `filter` object แบบเดียวกับ wip/delivery/gold ไม่ใช่ watch เฉพาะ field
แบบ capacity

**5 ส่วนตามที่ user ระบุ**: (1) `WorkersKpiGroup` 4 StatCards (ค่าแรงในระบบ/เดือน + sub "{แผนก1} {share1}% ·
{แผนก2} {share2}%" จาก `kpi.wagesByDept` เรียงมากไปน้อยเอง ไม่ hardcode ชื่อแผนก ต่อท้ายด้วย "ไม่รวมเงินเดือน"
เพราะ `kpi.excludesSalaried` เป็น true เสมอ, ค่าแรงต่อใบงานที่ผลิตเสร็จ, ช่างที่มีงาน + sub tooltip แยกแผนกจาก
`kpi.activeWorkersByDept`, สัดส่วนค่าแรงนอกบ้าน/ร้าน) (2) `WorkersTrendChart` stacked bar ค่าแรงแยกแผนก (ไม่
hardcode รายชื่อแผนก — `collectWageDeptKeys` อ่านจาก `series[]` เอง) + เส้นค่าแรงต่อใบงาน (`seriesTotal[].
wagePerPlan`, แกนขวา) ตาม pattern `gold-stage-trend-chart.vue` (stacked ไม่ใช่แยกแกน) (3) `WorkersTablePanel`
(table+detail chart รวม orchestrator เดียว ตาม pattern `gold-stage-department-panel.vue` — **ไม่
auto-select แถวแรก** ต่างจาก gold-stage เพราะช่างมีได้หลายสิบ-ร้อยคน ต้องให้คลิกเลือกเอง) ตาราง `WorkersTable`
มีตัวกรอง "แผนก"/"ประเภท" ของตัวเองแบบ client-side ล้วน (กรองเฉพาะ `workers[]` ที่โหลดมาแล้ว ไม่ยิง request ใหม่
— แยกจากตัวกรอง departmentKeys/employmentTypes ของแผงตัวกรองหลักที่กรองทั้งก้อน server-side) วางเป็น toolbar
ใต้ title แทนการใช้ slot `header-actions` (ใช้ได้แค่ headerStyle filled/dashboard ไม่ใช่ legend ที่หมวดนี้ใช้ —
ตาม pattern `wip-due-risk-panel.vue`'s mode toggle) คลิกแถว → `WorkersDetailChart` ยิง `WorkerMonthly` เอง
(ไม่ได้มากับ response หลัก, ต้องส่ง `deptKey` คู่กับ `code` เสมอเพราะช่างคนเดียวอาจทำงานหลายแผนก) (4)
`WorkersUnpaidJobsPanel` (paged, ยิง `UnpaidPieceJobs` เอง ตาม pattern `gold-stage-outlier-jobs-panel.vue`)
(5) หน้าข้อมูลช่าง (`views/worker/worker-list/`) เพิ่ม dropdown "ประเภทช่าง" (ในบ้าน/นอกบ้าน/ร้าน) ในฟอร์ม
สร้าง/แก้ไข + คอลัมน์ในตารางรายการ

**field name ไม่ตรงกับ convention เดิม (แก้ `formatWorkerNameList` กลาง)**: `workers[]`/`concentration[].
topWorkers[]` ของหมวดนี้ใช้ field ชื่อ `name`/`code` (ไม่ใช่ `workerName`/`workerCode` แบบ wip/gold/capacity เดิม)
— `formatWorkerNameList` (`insight-helpers.js`, ใช้ร่วมทุกหมวด) แก้เป็น fallback `workerName ?? name` รองรับทั้ง
2 แบบ + รองรับ array ของสตริงชื่อดิบตรงๆ ด้วย (`workerNames[]` ของ `ACT_CROSS_TRAIN`) — **ขยาย format ต่อคน
เพิ่มใหม่**: ถ้า item มี `wagePerJob`+`medianPerJob` ครบคู่ (เฉพาะ `WRK_RATE_OUTLIER`/`ACT_REVIEW_RATE`) ต่อท้าย
เป็น `"{ชื่อ} {wagePerJob} ฿/งาน (ค่ากลาง {medianPerJob})"` ตามตัวอย่างที่ API agent ให้ตรงๆ ("หนิง 1,290 ฿/งาน
(ค่ากลาง 145)") — เพิ่ม suffix ตัวเลขใหม่ `Wages` (0 ทศนิยม เหมือน `Money`) ใน
`NUMERIC_SUFFIX_MAX_FRACTION_DIGITS` สำหรับ `FC_WAGES_NEXT_MONTH.projectedWages/avgWages` (ชื่อ param ไม่ได้
ลงท้าย `Money` ตรงๆ)

**findings/actions (final contract)**: 5 problem/forecast code (`WRK_CONCENTRATION`/`WRK_RATE_OUTLIER`/
`WRK_WAGE_PER_PLAN_RISING`(forecast)/`WRK_UNPAID_JOBS`/`WRK_GOLD_REPEAT`) + 2 forecast
(`FC_WAGES_NEXT_MONTH`(info)/`FC_KEY_PERSON_RISK`) + 4 action (`ACT_CROSS_TRAIN`/`ACT_REVIEW_RATE`/
`ACT_RECORD_WAGES`/`ACT_TALK_WORKER_GOLD`) — param ยืนยันจาก API agent 2026-10-01: `WRK_CONCENTRATION`→
deptKey,top2Share,workers[{code,name}] (1 ต่อแผนก) | `WRK_RATE_OUTLIER`→count,workers[{code,name,wagePerJob,
medianPerJob}] (top3, ตรงกับ `DEFAULT_MAX_WORKER_NAMES` พอดีไม่ต้อง override) | `WRK_WAGE_PER_PLAN_RISING`→
fromValue,toValue (บาท/ใบ — **ไม่ใช่ fromMoney/toMoney** จึงไม่ auto-format ตัวคั่นหลักพัน ฝัง "บาท/ใบ" เป็น
ข้อความตรงๆ แทน) | `WRK_UNPAID_JOBS`→count | `WRK_GOLD_REPEAT`→workers[{code,name}],count |
`FC_WAGES_NEXT_MONTH`→projectedWages,avgWages | `FC_KEY_PERSON_RISK`→deptKey,**workerName** (เอกพจน์ ไม่ใช่
`workers[]`),queueDaysNow,queueDaysWithout | `ACT_CROSS_TRAIN`→deptKey,**workerNames** (string[], ไม่มี count
แยก = array คือรายชื่อเต็มเสมอ) | `ACT_REVIEW_RATE`→workers (shape เดียวกับ RATE_OUTLIER, ไม่มี count แยก) |
`ACT_RECORD_WAGES`→count | `ACT_TALK_WORKER_GOLD`→workers[{code,name}] — `top2Share`/`share`/`shareOfDeptJobs`/
`outsideWageShare`/`wagesByDept.share` เป็นสเกล 0–100 ทั้งหมด (ต่อท้าย "%" ในข้อความ/คอลัมน์ตรงๆ ไม่ต้องคูณ)

**ตัวกรองหน้าตาราง (คนละชั้นกับตัวกรองหลัก)**: ดรอปดาวน์ "แผนก" + toggle "ประเภท" (ทั้งหมด|ในบ้าน|นอกบ้าน|ร้าน)
ใน `WorkersTable` เป็น **client-side ล้วน** กรองแค่ตารางที่เห็น ไม่กระทบ KPI/กราฟ/ตัวเลือกแผนกในดรอปดาวน์มาจาก
deptKey ที่ปรากฏจริงใน `workers[]` เท่านั้น (ไม่ใช่ลิสต์ 7 แผนกคงที่) — ส่วนตัวกรองหลัก (FilterPanelGeneric,
`departmentKeys`/`employmentTypes`) ส่งไป server กรองทั้งก้อน kpi/series/workers/concentration จริง

**employmentType ในหน้าข้อมูลช่าง**: `Worker/Search` คืน `employmentType` มาด้วยแล้ว (แสดงในคอลัมน์ใหม่) —
`Worker/Create`/`Worker/Update` รับ `employmentType` เป็น optional (`'IN_HOUSE'|'OUTSIDE'|'SHOP'`) — **กฎ
Update สำคัญ**: omit key = คงค่าเดิม, `""` = ล้างค่า — ฟอร์มจึงต้อง **ส่ง key นี้เสมอไม่ omit** (ไม่งั้นแก้ชื่อ
เฉยๆ โดยไม่แตะ dropdown จะไม่เป็นไร เพราะ key หายไปจาก payload = backend ตีความว่า "คงเดิม" ไม่ใช่ "ล้าง" —
ถ้า omit ผิดจังหวะถึงจะเป็นปัญหา) — `plan-worker-store.js`'s `fetchCreate`/`fetchUpdate` ส่ง
`employmentType: formValue.employmentType || ''` เสมอ (coerce null/undefined → `''` กัน wire payload หลุด
เป็น `null` ที่ไม่อยู่ในคอนแทรค) — ฟอร์มแก้ไขโหลดค่าปัจจุบันมาเต็มอยู่แล้ว (`watch.modelUpdate` spread
ทั้ง record) จึงส่งค่าเดิมกลับไปถูกต้องเสมอถ้าผู้ใช้ไม่แตะช่องนี้ — ค่าคงที่ enum อยู่ที่ไฟล์เดียว
`views/worker/worker-list/worker-employment-type.js` ใช้ร่วม 3 ไฟล์ (update/create/data-table) กัน duplicate

**ลบ dead code**: `topic-placeholder-section.vue` TOPIC_LINK/TOPIC_CODES entry `workers` + i18n
`WORKERS_PLACEHOLDER_NO_WAGE`/`WORKERS_PLACEHOLDER_RISING_COST_PER_PIECE`/`placeholder.link.workers`

### ไฟล์ที่แตะ

| ไฟล์ | สรุป | เจ้าของ |
|---|---|---|
| `src/views/production/insight/components/workers-*.vue` (+ helpers/spec) (ใหม่ทั้งหมด) | KPI/กราฟ/ตารางช่าง/รายละเอียด/งานค้างบันทึก | @ui-implementer |
| `src/views/production/insight/sections/workers-section.vue` (ใหม่) | mount ทุก component ข้างต้น | @ui-implementer |
| `src/views/production/insight/sections/topic-placeholder-section.vue` | ลบ entry `workers` | @ui-implementer |
| `src/views/production/insight/index-view.vue` | mount `WorkersSection`, ขยาย `hasFilterableFields`/`activeChips`/filter-panel handlers/draft state เป็น 5-way | @ui-implementer |
| `src/views/production/insight/insight-filters.js` | เพิ่มชุดฟังก์ชัน workers filter คู่ขนานกับ wip/delivery/gold (ส่ง departmentKeys/employmentTypes ไป server จริง, bucket คงที่ 'month') | @ui-implementer |
| `src/stores/modules/api/production/production-insight-api.js` | เพิ่ม `fetchWorkers`/`fetchWorkerMonthly`/`fetchUnpaidPieceJobs` | @ui-implementer |
| `src/components/insight/insight-helpers.js` (+spec) | `formatWorkerNameList` รองรับ field `name`/สตริงดิบ/wagePerJob+medianPerJob, `workerNames` param ใหม่, suffix `Wages` | @ui-implementer |
| `src/language/view/production-insight/{th,en}.js` | เพิ่ม namespace `workers.*` เต็ม + rules/codeLabel/help ของ 11 code ใหม่ + ลบ placeholder keys ที่ตายแล้ว | @ui-implementer |
| `src/language/view/production-insight/workers-i18n.spec.js` (ใหม่) | ขยาย pattern เดียวกับ `capacity-i18n.spec.js`/`gold-i18n.spec.js` | @ui-implementer |
| `src/views/worker/worker-list/{modal,components}/*.vue` + `plan-worker-store.js` + `worker-employment-type.js` (ใหม่) | เพิ่ม dropdown/คอลัมน์/wire payload employmentType | @ui-implementer |
| `src/language/view/worker/{th,en}.js` | เพิ่ม `fieldEmploymentType`/`colEmploymentType`/`employmentType.*` | @ui-implementer |
| Backend `ProductionInsight/{Workers,WorkerMonthly,UnpaidPieceJobs}` + `Worker/{Search,Create,Update}` employmentType | ใหม่/แก้ — final contract ยืนยันแล้ว (2026-10-01) | @api-implementer |

- **Decision**: ตารางช่างมี "ตัวกรองซ้อน 2 ชั้น" (หลัก server-side + ท้องถิ่นใน box client-side) โดยตั้งใจ —
  ตัวกรองหลักไว้กรองข้อมูลจริงที่ดึงมา (กระทบ KPI/กราฟด้วย) ส่วนตัวกรอง box ไว้ไล่ดูตารางยาวๆ เร็วๆ โดยไม่ต้อง
  เปิดแผงตัวกรอง/รอ request ใหม่ — ยังไม่เห็น wireframe จริง (เปิดลิงก์ artifact ไม่ได้) จุดนี้เป็นการตีความเอง
  ถ้า user ตรวจแล้วไม่ตรง wireframe ให้แจ้งกลับมาปรับ
- verify: `npx eslint` เฉพาะไฟล์ที่แก้ (clean) + `npx vitest run` ทั้ง repo (1270/1279 ผ่าน เหลือแค่
  `customer-edit-modal.spec.js` 9 เทสที่ fail ซ้ำเดิมมาตลอด session นี้ ไม่เกี่ยวกับงานนี้) + `npm run build`
  (สำเร็จ) + grep `border-left` ไฟล์ที่เปลี่ยนทั้งหมด (เจอแค่ในคอมเมนต์ "ห้ามใช้")
