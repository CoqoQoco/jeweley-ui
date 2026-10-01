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
