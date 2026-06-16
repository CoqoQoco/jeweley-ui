# Refactor Migration Tracker

**State file หลักของ migration loop** — อ่านก่อนทุก iteration, อัปเดตหลังทำเสร็จ

---

## Baseline Metrics (Phase 0.8)

| Metric | จำนวน | รายละเอียด |
|---|---|---|
| **ESLint warnings** | **287** | no-restricted-imports 270, no-alert 8, table 9 |
| **Stylelint warnings** | **1282** | hardcode-color (ห้าม hex สีตรงๆ) |

### ESLint Breakdown (no-restricted-imports 270)

| Rule | จำนวน |
|---|---|
| Dropdown import ตรงๆ | 78 |
| DataTable import ตรงๆ | 67 |
| Calendar import ตรงๆ | 60 |
| AutoComplete import ตรงๆ | 31 |
| MultiSelect import ตรงๆ | 15 |
| Dialog import ตรงๆ | 10 |
| Checkbox import ตรงๆ | 9 |

**เป้าหมาย**: ลดทุก iteration จนเป็น 0 → เลื่อน rule เป็น `error`

---

## Priority Order

**Pilot แรก = `catalog`** (0 native imports — ตรวจสอบ pattern ก่อนขยาย)

ลำดับ: master/* → catalog → customer → stock → receipt-stock → production/* → sale/* → mobile/*

---

## Module Checklist

| Module | สถานะ | design-token | generic | i18n | cleancode | native เหลือ | หมายเหตุ |
|---|---|---|---|---|---|---|---|
| **master/diamond-grade** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | pilot group (เล็ก) |
| **master/gem** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | |
| **master/gem-shape** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | |
| **master/gold-size** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | |
| **master/productType** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | |
| **master/zill** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | |
| **catalog** | ✅ | ✅ | ✅ | ✅ | ✅ | 0 | **Pilot แรก** — reference implementation; native→generic ✅, i18n ✅, composables ✅, design-token ✅, cleancode ✅ |
| **customer** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 5 | |
| **dashboard** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | |
| **stock/gem** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | |
| **stock/location** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | |
| **stock/move-location** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | มี user-manual แล้ว |
| **stock/product** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 23 | นับรวม stock ทั้งหมด |
| **receipt-stock** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 65 | priority สูง |
| **mold** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 23 | |
| **production-cost** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 24 | |
| **production/plan-update** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 99 | ไฟล์ยักษ์ — แตก component |
| **production/plan-view** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 32 | |
| **production/plan-tracking-gold** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 15 | |
| **production/plan-tracking** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 8 | |
| **production/mold** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 8 | |
| **production/plan-bom** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 4 | |
| **production/plan-create** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 7 | |
| **production/plan-gold** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 7 | |
| **production/plan-price** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 7 | |
| **production (อื่นๆ)** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | รวม pre-plan, dashboard, tracking-worker ฯลฯ |
| **sale/sale-order** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 22 | sale-order-view.vue 3,933 บรรทัด — แตก component |
| **sale/cost-stock** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 12 | |
| **sale/invoice-detail** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 10 | |
| **sale/quotation** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 11 | |
| **sale/production-order** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 7 | |
| **sale/stock-reservation** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 7 | |
| **sale/quotation-list** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 2 | |
| **sale/saleorder-list** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 3 | |
| **sale (อื่นๆ)** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | TBD | delivery-note, invoice, payment-tracking ฯลฯ |
| **worker** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 8 | |
| **setting** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 5 | |
| **report-production** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 3 | |
| **report-production-gold-cost** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 5 | |
| **report-production-wages** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 2 | |
| **mobile/sale** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | |
| **mobile/tasks** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | |
| **mobile/quotation** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | |
| **mobile (อื่นๆ)** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | scan, dashboard, profile, notifications |
| **admin** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 0 | |
| **login** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 1 | |

### คำอธิบาย Column

| Column | ความหมาย |
|---|---|
| **design-token** | ✅ เมื่อใช้ `var(--*)` แทน hardcode hex/px ทั้งหมด |
| **generic** | ✅ เมื่อไม่มี native input/button/table หรือ PrimeVue ตรงๆ |
| **i18n** | ✅ เมื่อไม่มี hardcode ข้อความไทยในโค้ด |
| **cleancode** | ✅ เมื่อลบ console.log / dead code / commented import ออกแล้ว |
| **native เหลือ** | จำนวน `from 'primevue/...` import ตรงๆ ใน module (signal ของ priority) |

---

## Iteration Log

| วันที่ | Module | ผลลัพธ์ | ESLint ลด | Stylelint ลด |
|---|---|---|---|---|
| 2026-06-16 | catalog | ✅ Pass | 0 (ไม่มี native PrimeVue import ตั้งต้น) | ลด hardcode px/สี ใน SCSS |
