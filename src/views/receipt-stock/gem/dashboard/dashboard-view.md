# Gem Stock Dashboard — เอกสารประกอบ

## ภาพรวม

หน้าแดชบอร์ดคลังอัญมณี แสดงภาพรวม/วิเคราะห์ stock พลอย แบ่งเป็น 4 แท็บ: ภาพรวม (Overview), วันนี้ (Today), รายสัปดาห์ (Weekly), รายเดือน (Monthly)

- **Framework**: Vue 3 Options API
- **State Management**: Pinia store `useStockGemDashboardStore`
- **UI**: Generic component ทั้งหมด (`SearchBarGeneric`, `DashboardHeaderGeneric`, `SectionCardGeneric`, `StatCardGeneric`, `ChartGeneric`, `DataTableWithPaging`)
- **Charts**: `ChartGeneric` (wrap ApexCharts)
- **i18n**: Thai/English — key อยู่ที่ `src/language/th.js` / `en.js` (block `stock.gem.dashboard`, root aggregator ไม่ใช่ `src/language/view/stock/`)

---

## โครงสร้างไฟล์

```
dashboard/
├── dashboard-view.vue                      (orchestrator — filter bar, header, tabs)
└── components/
    ├── stock-summary-cards.vue             (KPI ภาพรวม: totalGemTypes/totalQuantity/totalWeight/lowStock)
    ├── forecast-panel.vue                  (ประมาณการยอดใช้สิ้นเดือน — run-rate forecast)
    ├── aging-panel.vue                     (อายุสต๊อกพลอย — bucket 0-30/31-90/91-180/181-365/เกิน 1 ปี)
    ├── category-chart.vue                  (แบ่งตามหมวดหมู่ — groupBy: group/shape/grade)
    ├── top-movements-table.vue             (พลอยเคลื่อนไหวสูงสุด — DataTableWithPaging + export)
    ├── last-activities-table.vue           (กิจกรรมล่าสุด 10 รายการ — DataTableWithPaging)
    ├── price-alerts-panel.vue              (แจ้งเตือนราคาเปลี่ยนแปลง >5%)
    ├── today-tab.vue                       (แท็บวันนี้ — KPI + รายการธุรกรรม + export)
    ├── weekly-tab.vue                      (แท็บรายสัปดาห์ — KPI + รายการเคลื่อนไหว + export)
    ├── monthly-report-overview.vue         (orchestrator แท็บรายเดือน — ประกอบ 6 component ด้านล่าง)
    ├── monthly-summary-cards.vue           (KPI รายเดือน: ธุรกรรม/รับเข้า/จ่ายออก/มูลค่าสุทธิ/เติบโต/turnover)
    ├── monthly-weekly-comparison-chart.vue (เทียบรับเข้า-จ่ายออกรายสัปดาห์ในเดือน)
    ├── monthly-top-performers-table.vue    (อันดับพลอยเคลื่อนไหวสูงสุดในเดือน)
    ├── monthly-inventory-analysis-table.vue (วิเคราะห์สถานะคลังรายเดือน — overstock/optimal/understock)
    ├── monthly-supplier-analysis-table.vue (วิเคราะห์ซัพพลายเออร์รายเดือน — เฉพาะพลอยรับเข้าใหม่)
    ├── monthly-price-analysis-table.vue    (วิเคราะห์แนวโน้มราคารายเดือน)
    └── monthly-transaction-summary.vue     (สรุปธุรกรรมแยกตามประเภท ตามเดือนที่เลือก + export)
```

**หลักการ**: ไฟล์ .vue ทั้งหมดใช้ **kebab-case** (`stock-summary-cards.vue` ไม่ใช่ `StockSummaryCards.vue`)

---

## ความรับผิดชอบของแต่ละ Component

| Component | Props หลัก | หน้าที่ |
|---|---|---|
| `stock-summary-cards.vue` | `stockSummary` (Object) | KPI ภาพรวม ผ่าน `StatCardGeneric` |
| `forecast-panel.vue` | `trends` (Array) | ประมาณการยอดใช้สิ้นเดือนจาก run-rate เฉลี่ยต่อวัน |
| `aging-panel.vue` | `aging` (Object), `loading` | สต๊อกค้างนานตาม bucket อายุ |
| `category-chart.vue` | `categoryChartData`, `datasetFields`, `isLoading` | กราฟแท่งแบ่งตามกลุ่ม/รูปทรง/เกรด |
| `top-movements-table.vue` | `topMovements` (Array) | ตารางพลอยเคลื่อนไหวสูงสุด + ปุ่ม export Excel |
| `last-activities-table.vue` | `lastActivities` (Array) | ตารางกิจกรรมล่าสุด พร้อม custom column template |
| `price-alerts-panel.vue` | `priceAlerts` (Array) | รายการแจ้งเตือนราคาเปลี่ยนแปลง พร้อม badge ทิศทาง |
| `today-tab.vue` | `todaySummary`, `todayTransactions` | KPI + รายการธุรกรรมวันนี้ + ปุ่ม export Excel |
| `weekly-tab.vue` | `weeklySummary`, `weeklyMovements` | KPI + รายการเคลื่อนไหวรายสัปดาห์ + ปุ่ม export Excel |
| `monthly-report-overview.vue` | `summary`, `weeklyComparisons`, `topPerformers`, `inventoryAnalysis`, `supplierAnalysis`, `priceAnalysis`, `loading` | ประกอบ 6 component วิเคราะห์รายเดือนเข้าด้วยกัน |
| `monthly-transaction-summary.vue` | *(ไม่มี — เรียก store เอง)* | เลือกเดือน/ประเภทธุรกรรม แสดงกราฟ+ตาราง + export Excel |

---

## Store Integration

**Store**: `useStockGemDashboardStore` (`src/stores/modules/api/stock/stock-gem-dashboard-store.js`)

Getter หลักที่ใช้จริงในหน้านี้:

| Getter | ใช้โดย |
|---|---|
| `getLastUpdated` | `DashboardHeaderGeneric` (subtitle เวลาอัปเดตล่าสุด) |
| `getStockSummary` | `stock-summary-cards.vue` |
| `getTrends` | `forecast-panel.vue` (คำนวณผ่าน `calculateMonthlyRunRateForecast`) |
| `getAging` | `aging-panel.vue` |
| `getTopMovements` | `top-movements-table.vue` |
| `getPriceAlerts` | `price-alerts-panel.vue` |
| `getLastActivities` | `last-activities-table.vue` |
| `getTodaySummary` / `getTodayTransactions` | `today-tab.vue` |
| `getWeeklySummary` / `getDailyMovements` | `weekly-tab.vue` |
| `getMonthlySummary` / `getWeeklyComparisons` / `getMonthlyTopPerformers` / `getMonthlyInventoryAnalysis` / `getMonthlySupplierAnalysis` / `getMonthlyPriceAnalysis` | `monthly-report-overview.vue` + component ลูก |
| `getTransactionTypeSummaries` | `monthly-transaction-summary.vue` |
| `getCategoryChartData` | `category-chart.vue` |

**หมายเหตุ**: getter `getTrendChartData` (chart.js format เก่า) ถูกลบแล้ว — ปัจจุบัน forecast ใช้ `getTrends` ผ่าน util `calculateMonthlyRunRateForecast` (`src/services/utils/forecast.js`) แทน

### Data Refresh
- Refresh ปุ่มเดียวอยู่ใน `DashboardHeaderGeneric` (เรียก `refreshDashboard()` → `dashboardStore.refreshAll(filters)`)
- สลับแท็บ → โหลดข้อมูลเฉพาะแท็บนั้นผ่าน `setActiveTab()`
- Filter (groupName/shape/grade/date range) → `onSearchFilter()` / `onClearFilter()`

---

## Visual Design System

หน้านี้ใช้ design token ทั้งหมด (`var(--sp-*)`, `var(--radius-*)`, `var(--shadow-*)`, `var(--base-*)`) ไม่มี hardcode สี/px แล้ว

- **KPI card**: ใช้ `StatCardGeneric` variant เดียวกันทุกแท็บ — `main` (แดงเข้ม, default), `green`, `warning`, `grey` — ไม่มี accent สีเฉพาะต่อแท็บอีกต่อไป (เดิมมีม่วง/เขียว/ฟ้า hardcode ต่อแท็บ ถูกลบทิ้งหลัง migrate เป็น StatCardGeneric)
- **Section card**: `SectionCardGeneric` (`headerStyle="legend"` — title คร่อมขอบบน)
- **Badge สถานะรายเดือน** (`monthly-*-table.vue`): `status-badge--main/green/warning/red/grey`
- **Icon**: Bootstrap Icons ทั้งหมด

---

## Export Excel

ใช้ `ExcelHelper` (`src/services/utils/excel-js.js`) — pattern: build `dataExcel` array ของ object → `ExcelHelper.exportToExcel(dataExcel, options)` → `success()` แจ้งผล

| แท็บ | ปุ่ม export อยู่ที่ | ข้อมูลที่ export |
|---|---|---|
| ภาพรวม | `top-movements-table.vue` | รายการพลอยเคลื่อนไหวสูงสุด |
| วันนี้ | `today-tab.vue` (การ์ด "ธุรกรรมวันนี้") | รายการธุรกรรมวันนี้ |
| รายสัปดาห์ | `weekly-tab.vue` (การ์ด "การวิเคราะห์รายสัปดาห์") | รายการเคลื่อนไหวรายสัปดาห์ |
| รายเดือน | `monthly-transaction-summary.vue` | รายละเอียดธุรกรรมตามประเภทที่เลือก |

---

## Business Rules

- **Low Stock Alert**: จำนวน ≤ threshold ที่ backend กำหนด
- **Zero Stock Alert**: จำนวน = 0
- **Price Change Alert**: เปลี่ยนแปลง > 5%
- **Last Activities**: แสดง 10 รายการล่าสุด
- **Filter**: groupName, shape, grade (ส่งค่าแรกที่เลือกจาก MultiSelect — backend รับค่าเดียว), วันที่เริ่มต้น-สิ้นสุด
