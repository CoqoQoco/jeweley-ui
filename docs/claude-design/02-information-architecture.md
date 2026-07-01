# 02 · Information Architecture — โครงสร้างโปรเจกต์

> **วัตถุประสงค์**: บอก Claude Design ว่าระบบมี module/หน้าอะไรบ้าง, นำทางอย่างไร, และแต่ละหน้าเป็น "ชนิด" (archetype) ไหน
> เพื่อจัดเป็น Project ได้ตรง · source: `src/views/**`, `src/router/`, `src/components/layout/`

---

## Navigation Shell

```
Web (Tablet/Desktop):
  ┌ main-bar ───────────────────────────────────────────────┐  top: brand + i18n switcher (TH/EN) + user
  ├ side-bar ─┬─────────────────────────────────────────────┤  เมนูข้าง จัดกลุ่มตาม module
  │  เมนู     │   <router-view>  (breadcrumb-name อยู่บนสุด)  │
  └───────────┴─────────────────────────────────────────────┘

Mobile (/mobile/*) — layout แยกต่างหาก:
  mobile-top-bar (sticky) + content + mobile-bottom-nav (fixed + iOS safe area)
```

---

## Module / Page Inventory (Web)

| Module | path prefix | หน้าหลัก (ตัวอย่าง) |
|---|---|---|
| **Catalog** | `/catalog` | catalog (list+detail) |
| **Customer** | `/customer` | list-customer (list + modal create/edit) |
| **Master data** | `/master` | gem, gem-shape, diamond-grade, gold-size, productType, zill |
| **Stock** | `/stock` | product/list, location, move-location |
| **Receipt-Stock** | `/receipt-stock` | product GR (production/outsource), gem transaction/pick-return |
| **Production** | `/production` | dashboard, plan-create, plan-tracking (gold/status/transfer/worker), plan-bom, plan-gold, plan-update, plan-view, pre-plan (list/create/approve), report (gold-loss-tang, plan-completed) |
| **Sale** | `/sale` | dashboard, quotation(+list), sale-order(+list), invoice(+detail), delivery-note, production-order, payment-tracking, cost-stock, stock-basket, stock-reservation, document(+catalog-builder) |
| **Worker** | `/worker` | worker-list, gold-loss-slip-list, worker-daily-wages |
| **Setting** | `/setting` | user-account, role-permission, edit-account, bill/vat-print-layout |
| **Ticket** | `/ticket` | manage (baseline design ref) |
| **Misc** | — | downloads, graph |
| **Mobile** | `/mobile` | dashboard, sale, quotation, scan, tasks, notifications, profile, cost-version-detail |

> รวม ~70 หน้าหลัก (index-view) · ~486 ไฟล์ .vue ทั้งหมด

---

## Page-Type Taxonomy (archetype) → ดูรายละเอียดใน `03`

ทุกหน้าจัดได้เป็น 1 ใน archetype เหล่านี้ — redesign archetype = ครอบหน้าจำนวนมากพร้อมกัน

| Archetype | ลักษณะ | หน้าตัวอย่าง | สัดส่วน |
|---|---|---|---|
| **List / Search** | search bar 4-section + DataTable + paging | master/*, customer, worker-list, quotation-list, saleorder-list, pre-plan-list | สูงสุด |
| **Create / Edit** | PageHeaderGeneric + หลาย SectionCard + footer | plan-create, pre-plan-create, sale-order, quotation, cost-edit | สูง |
| **Detail / View** | header + ข้อมูล read-only + เอกสาร/PDF | invoice-detail, plan-view, plan-tracking | กลาง |
| **Dashboard** | KPI cards + chart + ตารางสรุป | production/dashboard, sale/dashboard, payment-tracking/dashboard | ต่ำ |
| **Modal form** | popup form แบ่ง SectionCard | customer create-view, master modals | ฝังในหลายหน้า |

---

## Module → Archetype map (สำหรับวางลำดับ redesign)

| Module | archetype เด่น |
|---|---|
| Master / Customer / Worker | List + Modal form |
| Stock / Receipt-Stock | List + Create/Edit + Detail |
| Production | Create/Edit + Detail + Dashboard + List |
| Sale | ครบทุก archetype (ซับซ้อนสุด) |
| Setting | List + Modal form |

---

## Priority (จาก memory `project_ui_refactor` — primevue imports สูงสุด)

1. **production** (impact สูงสุด) 2. **sale** 3. **receipt-stock** → ที่เหลือ
แต่ **pilot ของ redesign ควรเริ่มที่ archetype ที่ง่ายและ representative**: List page (master/customer) ก่อน
