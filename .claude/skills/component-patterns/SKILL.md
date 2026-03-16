---
name: component-patterns
description: รูปแบบการสร้าง Vue component — naming convention, modular structure, props best practices, import conventions — ใช้เมื่อสร้าง component ใหม่หรือ refactor
---

# Component Patterns

## File Naming Convention

ใช้ **kebab-case** เสมอ:

| ✅ Good | ❌ Bad |
|---|---|
| `stock-summary-cards.vue` | `StockSummaryCards.vue` |
| `appraisal-form-view.vue` | `AppraisalFormView.vue` |

---

## Modular Structure

สำหรับ view ที่ซับซ้อน ให้แยก component ตามนี้:

```
/feature-view/
├── feature-view.vue        ← main orchestrator
└── components/
    ├── section-one.vue
    ├── section-two.vue
    └── data-table.vue
```

### เมื่อไหร่ควรแยก Component

แยกเมื่อตรงอย่างน้อย 1 ข้อ:
1. ไฟล์หลักเกิน **400-500 บรรทัด**
2. มี UI section ที่แยกกันได้ชัดเจน
3. Section นั้นอาจถูก reuse ใน view อื่น
4. ทีมหลายคนทำงานพร้อมกัน

### ตัวอย่าง: Stock Appraisal

```
/cost-stock/web/cost-edit/
├── index-view.vue
├── components/
│   ├── search-stock-view.vue
│   └── appraisal-form-view.vue
└── modal/
```

---

## Props Best Practices

```javascript
// ✅ Good — typed, descriptive, has default
props: {
  stockSummary: {
    type: Object,
    default: () => ({})
  },
  isLoading: {
    type: Boolean,
    default: false
  }
}

// ❌ Bad — too generic, no type
props: {
  data: Object
}
```

**กฎ**: ส่งเฉพาะ data ที่ child ต้องการ ไม่ส่ง object ใหญ่ทั้งก้อน

---

## Import Conventions

จัด import เป็น 2 กลุ่ม: external → local:

```javascript
// External dependencies
import { useStockGemDashboardStore } from '@/stores/modules/api/stock/stock-gem-dashboard-store.js'
import dayjs from 'dayjs'

// Local components
import StockSummaryCards from './components/stock-summary-cards.vue'
import CategoryChart from './components/category-chart.vue'
```

---

## API Pattern

ใช้ **Options API** ทั้ง Web และ Mobile (ไม่ใช้ Composition API)
