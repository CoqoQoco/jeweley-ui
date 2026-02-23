# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

## Docker Deployment

```bash
docker build . -t jewelry-ui
docker run -d -p 8080:80 jewelry-ui
```

## Architecture Overview

This is a Vue 3 jewelry management application with the following key architectural components:

### Frontend Stack
- **Vue 3** with Composition API
- **Vite** for build tooling
- **Pinia** for state management
- **Vue Router** for routing with role-based permissions
- **PrimeVue** for UI components
- **Vue i18n** for internationalization (Thai/English)
- **SCSS Styling**:
  - Legacy: `custom-style/` (Bootstrap 4 based - Do NOT modify)
  - New Web: `responsive-style/web/` (Responsive utilities for Tablet & Desktop)
  - Mobile: `responsive-style/mobile/` (Mobile utility classes + safe area)
  - Shared: `variable.scss`, `mixin.scss`

### Authentication & Authorization
- JWT token-based authentication stored in localStorage (`token-dk`)
- Role-based permission system via `PermissionService`
- Navigation guards in router checking user permissions
- User data cached in localStorage (`user-dk`)

### API Configuration
- Centralized axios configuration in `src/axios/`
- Base API URL configured in `axios-config.js` (currently `https://localhost:49153/`)
- API wrapper with jewelry-specific endpoints

### State Management (Pinia Stores)
- `authen-store.js` - Authentication, user profile, login/logout
- `loading-store.js` - Global loading states
- API-specific stores in `src/stores/modules/api/`

### Routing Structure
- Public routes: login, register (in `landing-route.js`)
- **Web Routes** (Tablet & Desktop) - Protected routes organized by feature:
  - `production/` - Production planning and tracking
  - `stock/` - Inventory management (gems, products)
  - `mold/` - Mold creation and management
  - `sale/` - Sales, quotations, and stock appraisal
    - `quotation/` - Customer quotations
    - `sale-order/` - Sales orders
    - `invoice/` - Invoice management
    - `cost-stock/web/cost-edit/` - Stock appraisal (product pricing)
  - `setting/` - User and system settings
- **Mobile Routes** (`src/router/mobile/authen-routes.js`):
  - Separate route structure + layout (`LayoutMobile.vue`) for mobile devices
  - Bottom navigation + optional top bar
  - Path convention: `/mobile/feature-name/`
  - Features: dashboard, sale (SO + Invoice), scan, tasks, profile, notifications, cost-version-detail

### Component Organization
- `src/components/` - Reusable components
- `src/views/` - Page-level components organized by feature
- `src/layout/` - Layout components (dashboard, login layouts)

#### Component Architecture Patterns
**File Naming Convention**: Use kebab-case for all component filenames
- ✅ `stock-summary-cards.vue`
- ❌ `StockSummaryCards.vue`

**Component Structure**: For complex views with multiple sections, follow the modular pattern:
```
/feature-view/
├── feature-view.vue (main orchestrator)
└── components/
    ├── section-one.vue
    ├── section-two.vue
    └── data-table.vue
```

**Example 1**: Gem Dashboard Implementation
```
/dashboard/
├── dashboard-view.vue (main orchestrator)
└── components/
    ├── stock-summary-cards.vue (overview cards)
    ├── category-chart.vue (chart visualization)
    ├── top-movements-table.vue (movement analysis)
    ├── last-activities-table.vue (transaction history)
    ├── price-alerts-panel.vue (price change alerts)
    └── availability-status.vue (availability metrics)
```

**Example 2**: Stock Appraisal (Cost-Edit) Implementation
```
/cost-stock/web/cost-edit/
├── index-view.vue (main orchestrator - manages search/appraisal flow)
├── components/
│   ├── search-stock-view.vue (stock search by stock number/product code)
│   └── appraisal-form-view.vue (appraisal form with materials & pricing)
└── modal/ (reserved for future modals if needed)
```

**Flow Structure**: Stock Appraisal
```
1. Search Stock (search-stock-view.vue)
   ↓ (User searches by stock number or product code)
2. Display Appraisal Form (appraisal-form-view.vue)
   ├── Stock Information (stock number, product code, description)
   ├── Materials Section (gold, diamond, gems with quantities & prices)
   ├── Price Appraisal Table (grouped by: Gold, Gem, Worker, Embed, ETC)
   │   ├── Calculate cost per piece automatically
   │   ├── Option to use cost as appraisal price
   │   └── Add/remove transaction items
   └── Actions
       ├── Save (updates stock product price)
       └── Save & New (saves and returns to search for next item)
```

**Benefits of This Pattern**:
- **Maintainability**: Smaller, focused components
- **Reusability**: Components can be used across different views
- **Testability**: Individual components can be tested in isolation
- **Team Development**: Multiple developers can work simultaneously
- **Performance**: Better optimization through component-level changes

### Key Features
- Multi-language support (Thai primary, English secondary)
- PDF generation with pdfmake
- Barcode generation and scanning
- Image upload and preview
- Excel import/export functionality
- Print integration for production planning

### Development Notes
- Console logging can be disabled in production via `vite.config.js`
- Permission checks happen at route level and component level
- Uses SCSS with custom variables and mixins
- Modal container dynamically created in DOM

## Component Development Guidelines

### When to Create Separate Components
Create separate components when any of the following apply:
1. **Size**: The main component file exceeds 400-500 lines
2. **Complexity**: Multiple distinct UI sections that can be logically separated
3. **Reusability**: Sections that might be reused in other views
4. **Team Development**: Multiple developers working on the same feature
5. **Testability**: Individual sections need isolated testing

### Component Props Best Practices
- Use TypeScript-style prop validation in Vue 2/3 Options API
- Pass only necessary data to child components
- Prefer specific props over large objects when possible
- Use descriptive prop names following camelCase convention

```javascript
// Good
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

// Avoid
props: {
  data: Object  // Too generic
}
```

### Import Conventions
- Use relative imports for local components: `'./components/stock-summary-cards.vue'`
- Group imports by type: external dependencies, then local components
- Use kebab-case for component file paths in imports

```javascript
// External dependencies
import { useStockGemDashboardStore } from '@/stores/modules/api/stock/stock-gem-dashboard-store.js'
import dayjs from 'dayjs'

// Local components
import StockSummaryCards from './components/stock-summary-cards.vue'
import CategoryChart from './components/category-chart.vue'
```

### Alert and Notification System
**IMPORTANT**: NEVER use native JavaScript `alert()`, `confirm()`, or `prompt()`. Always use the centralized alert service.

**Alert Service Location**: `src/services/alert/sweetAlerts.js`

**Available Functions**:
```javascript
import { warning, error, success, info, confirmSubmit } from '@/services/alert/sweetAlerts.js'

// Warning messages (yellow)
warning('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ')
warning('ข้อมูลไม่ครบถ้วน', 'กรุณาตรวจสอบข้อมูล')

// Error messages (red)
error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
error(err.message, 'ไม่สามารถบันทึกข้อมูลได้')

// Success messages (green)
success('บันทึกข้อมูลสำเร็จ')
success('เลขที่ใบสั่งขาย: SO-001', 'สร้างใบสั่งขายสำเร็จ')

// Info messages (blue)
info('ข้อมูลถูกส่งไปยังระบบแล้ว')

// Confirmation dialogs
confirmSubmit('คุณต้องการลบข้อมูลนี้หลือไม่?', 'ยืนยันการลบ', () => {
  // Callback on confirm
  deleteData()
})
```

**Function Signatures**:
- `warning(message, title, callback)` - Parameters: message (required), title (optional), callback (optional)
- `error(message, title, callback, stacktrace)` - Parameters: message (required), title (optional), callback (optional), stacktrace (optional)
- `success(message, title, callback)` - Parameters: message (required), title (optional), callback (optional)
- `info(message, title, callback)` - Parameters: message (required), title (optional), callback (optional)
- `confirmSubmit(message, title, callback, buttonInfo, icon, msgStyle)` - For confirmation dialogs

**Best Practices**:
```javascript
// ❌ Bad - Never use native alerts
alert('บันทึกสำเร็จ')
confirm('คุณต้องการลบหรือไม่?')

// ✅ Good - Use sweetAlerts service
success('บันทึกสำเร็จ')
confirmSubmit('คุณต้องการลบหรือไม่?', 'ยืนยันการลบ', handleDelete)

// ❌ Bad - Missing context
warning('กรุณากรอกข้อมูล')

// ✅ Good - Clear and specific
warning('กรุณากรอกชื่อลูกค้าและที่อยู่', 'ข้อมูลไม่ครบถ้วน')

// ✅ Good - With error details
error(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'ไม่สามารถโหลดข้อมูลได้')
```

### Error Handling and Try-Catch Usage
**IMPORTANT**: DO NOT use try-catch blocks in components unless absolutely necessary for specific error recovery logic.

**Why**: The centralized axios configuration in `src/axios/axios-helper.js` already handles error detection and display automatically. Using try-catch blocks can interfere with this mechanism by catching errors before they reach the axios error interceptor.

**Location**: `src/axios/axios-helper.js` - Error interceptors are configured

**Best Practices**:
```javascript
// ❌ Bad - Unnecessary try-catch that blocks axios error handling
async loadData() {
  try {
    const response = await this.store.fetchData()
    this.data = response.data
  } catch (err) {
    error(err.message, 'ไม่สามารถโหลดข้อมูลได้')
  }
}

// ✅ Good - Let axios handle errors automatically
async loadData() {
  const response = await this.store.fetchData()
  this.data = response.data
}

// ✅ Good - Only use try-catch when you need specific error recovery logic
async loadData() {
  try {
    const response = await this.store.fetchData()
    this.data = response.data
  } catch (err) {
    // Specific recovery logic (e.g., retry, fallback)
    this.data = this.getDefaultData()
  }
}
```

**When to use try-catch**:
- Specific error recovery logic (retry, fallback data)
- Need to prevent error propagation for non-critical operations
- Complex error handling with multiple scenarios

**When NOT to use try-catch**:
- Standard API calls (axios handles errors automatically)
- Simple data fetching operations
- Form submissions without special error handling

### Loading State Management
**IMPORTANT**: DO NOT manually manage loading states (`this.loading` or `isLoading`) when calling API through Pinia stores.

**Why**: The centralized axios configuration in `src/axios/axios-helper.js` already handles global loading states automatically for all API calls through middleware.

**Location**: `src/axios/axios-helper.js` - Loading interceptors are configured

**Best Practices**:
```javascript
// ❌ Bad - Manual loading state management
async loadData() {
  this.loading = true  // DON'T DO THIS
  const response = await this.store.fetchData()
  this.data = response.data
  this.loading = false  // DON'T DO THIS
}

// ✅ Good - Let axios middleware handle loading automatically
async loadData() {
  const response = await this.store.fetchData()
  this.data = response.data
}

// ✅ Good - Only use local loading for specific UI needs
async loadData() {
  // Only if you need component-specific loading indicator
  // separate from global loading (e.g., button-specific spinner)
  this.componentSpecificLoading = true
  const response = await this.store.fetchData()
  this.data = response.data
  this.componentSpecificLoading = false
}
```

**When to use local loading state**:
- Component-specific UI needs (e.g., individual button loading spinners)
- Multiple simultaneous API calls requiring individual tracking
- Custom loading behavior different from global loading

**When NOT to use local loading state**:
- Standard API calls through Pinia stores (axios middleware handles it)
- Page-level data fetching (axios middleware handles it)
- Form submissions (axios middleware handles it)

### Responsive Design Guidelines
**IMPORTANT**: Design components to be responsive for **Tablet and Desktop only**. Mobile will have separate routes and layouts.

**Location**: `src/assets/scss/responsive-style/web/` - **New web styles for future development** (separated from legacy styles)

**Legacy Styles**: `src/assets/scss/custom-style/standard-form.scss` - **Do NOT modify** legacy styles, they remain untouched

**Usage**:
```scss
// Import web responsive utilities in your new components
@import '@/assets/scss/responsive-style/web';

// If you need both legacy and new styles:
@import '@/assets/scss/custom-style/standard-form.scss';  // Legacy (untouched)
@import '@/assets/scss/responsive-style/web';             // New web styles
```

**File Structure**:
```
src/assets/scss/
├── custom-style/
│   └── standard-form.scss      # ❌ Legacy - Do NOT modify
├── variable.scss               # Shared variables
├── mixin.scss                  # Shared mixins
└── responsive-style/           # ✨ New styles directory
    ├── web/                    # Web-specific styles (Tablet & Desktop)
    │   ├── index.scss          # Main import file
    │   ├── responsive-utilities.scss  # All responsive utility classes
    │   └── README.md           # Documentation
    └── mobile/                 # Mobile-specific styles
        ├── index.scss          # Main import file
        ├── mobile-utilities.scss  # Mobile utility classes
        └── README.md           # Documentation
```

**Available Responsive Classes**:

#### 1. Responsive Table Wrapper
```vue
<template>
  <div class="responsive-table-wrapper">
    <DataTable :value="items">
      <!-- columns -->
    </DataTable>
  </div>
</template>
```
- Adds horizontal scroll on smaller screens
- Adjusts padding on tablet

#### 2. Responsive Button Group
```vue
<template>
  <div class="responsive-btn-group">
    <button class="btn btn-sm btn-green">บันทึก</button>
    <button class="btn btn-sm btn-main">บันทึกและตีราคาใหม่</button>
    <button class="btn btn-sm btn-secondary">ยกเลิก</button>
  </div>
</template>
```
- Buttons wrap naturally with gap spacing
- Center-aligned with flex-wrap

#### 3. Responsive Action Group
```vue
<template>
  <div class="responsive-action-group">
    <Dropdown v-model="selected" :options="options" />
    <button class="btn btn-sm btn-green">เพิ่ม</button>
  </div>
</template>
```
- Wraps items naturally on smaller screens
- Dropdown has min-width on tablet

#### 4. Responsive Info Row
```vue
<template>
  <div class="responsive-info-row">
    <span>ต้นทุนต่อชิ้น:</span>
    <span class="font-weight-bold">{{ cost }}</span>
    <input type="checkbox" id="useCost" v-model="useCost" />
    <label for="useCost">ใช้ต้นทุนเป็นราคาประเมิน</label>
  </div>
</template>
```
- Wraps items naturally with gap spacing

#### 5. Responsive Text Note
```vue
<template>
  <div class="responsive-text-note">
    * หมายเหตุสำคัญเกี่ยวกับการใช้งาน
  </div>
</template>
```
- Font size adjusts for tablet (14px → 13px)

#### 6. Responsive Grid Containers
```vue
<template>
  <!-- Auto-fit grid: 3 columns → 2 columns -->
  <div class="responsive-grid-container">
    <div><!-- field 1 --></div>
    <div><!-- field 2 --></div>
    <div><!-- field 3 --></div>
  </div>

  <!-- 2 columns → 1 column -->
  <div class="responsive-grid-2col">
    <div><!-- field 1 --></div>
    <div><!-- field 2 --></div>
  </div>

  <!-- Always 2 columns (smaller gap on tablet) -->
  <div class="responsive-grid-2col-fixed">
    <div><!-- field 1 --></div>
    <div><!-- field 2 --></div>
  </div>
</template>
```
- `.responsive-grid-container` - 3+ columns on desktop, 2 on tablet
- `.responsive-grid-2col` - 2 columns on desktop, 1 on tablet
- `.responsive-grid-2col-fixed` - Always 2 columns with adjusted gap

#### 7. Hide/Show Utilities
```vue
<template>
  <span class="show-desktop-only">รายละเอียดเพิ่มเติม</span>
  <span class="hide-tablet">ข้อความนี้ซ่อนบน tablet</span>
  <span class="show-tablet-only">แสดงเฉพาะ tablet</span>
</template>
```
- `.show-desktop-only` - Show only on desktop (hidden on tablet ≤ 1024px)
- `.hide-tablet` - Hidden on tablet and smaller (≤ 1024px)
- `.show-tablet-only` - Show only on tablet (hidden on desktop > 1024px)

#### 8. Spacing Utilities
```vue
<template>
  <div class="responsive-padding">Padding ปรับตามหน้าจอ</div>
  <div class="responsive-padding-lg">Padding ใหญ่</div>
  <div class="responsive-padding-sm">Padding เล็ก</div>
  <div class="responsive-margin">Margin ปรับตามหน้าจอ</div>
</template>
```
- `.responsive-padding` - Padding 10px → 8px on tablet
- `.responsive-padding-lg` - Padding 20px → 15px on tablet
- `.responsive-padding-sm` - Padding 5px → 3px on tablet
- `.responsive-margin` - Margin 10px → 8px on tablet

#### 9. Container & Layout Utilities
```vue
<template>
  <!-- Centered container with max-width -->
  <div class="responsive-container">
    <div class="responsive-section">
      <div class="responsive-card">
        Card content
      </div>
    </div>
  </div>
</template>
```
- `.responsive-container` - Max-width container with auto margins
- `.responsive-section` - Section padding 20px → 15px on tablet
- `.responsive-card` - Card with border, shadow, padding 15px → 12px on tablet

#### 10. Flex Utilities
```vue
<template>
  <div class="responsive-flex-row">Flex row with wrap</div>
  <div class="responsive-flex-column">Flex column</div>
  <div class="responsive-flex-center">Centered flex</div>
  <div class="responsive-flex-between">Space between flex</div>
</template>
```
- `.responsive-flex-row` - Flex row with gap and wrap
- `.responsive-flex-column` - Flex column with gap
- `.responsive-flex-center` - Centered flex items
- `.responsive-flex-between` - Space between with wrap

#### 11. Form Utilities
```vue
<template>
  <div class="responsive-form-group">
    <label class="responsive-label">Label</label>
    <input class="form-control" />
  </div>
</template>
```
- `.responsive-form-group` - Form group with responsive margin
- `.responsive-label` - Label with responsive font size

**Existing Responsive Classes** (already in standard-form.scss):
- `.form-col-container` - Auto-fit grid (min 250px per column)
- `.form-col-sm-container` - Auto-fit grid (min 150px per column)

**Breakpoints**:
- Tablet: ≤ 1024px
- Desktop: > 1024px
- **Note**: Mobile (< 768px) will have separate routes/layouts

**Best Practices**:
```vue
<!-- ❌ Bad - Fixed widths, not responsive -->
<template>
  <div style="width: 800px">
    <DataTable :value="items">...</DataTable>
  </div>
  <div style="display: flex">
    <button>บันทึก</button>
    <button>ยกเลิก</button>
  </div>
</template>

<!-- ✅ Good - Using responsive classes -->
<template>
  <div class="responsive-table-wrapper">
    <DataTable :value="items">...</DataTable>
  </div>
  <div class="responsive-btn-group">
    <button class="btn btn-sm btn-green">บันทึก</button>
    <button class="btn btn-sm btn-secondary">ยกเลิก</button>
  </div>
</template>

<!-- ✅ Good - New web components with responsive styles -->
<style lang="scss" scoped>
@import '@/assets/scss/custom-style/standard-form.scss';  // Legacy styles (if needed)
@import '@/assets/scss/responsive-style/web';             // New web styles

:deep(.p-datatable) {
  @media (max-width: 1024px) {
    font-size: 13px;

    .p-datatable-thead > tr > th {
      padding: 0.5rem 0.4rem;
    }
  }
}
</style>

<!-- ✅ Good - Only new web styles (no legacy needed) -->
<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/web';

.my-component {
  // Component-specific styles
}
</style>
```

**Development Strategy**:
```
┌─────────────────────────────────────────────────────────────┐
│ Legacy Components (Existing)                                 │
│ ├── Use: custom-style/standard-form.scss                    │
│ └── Status: ❌ Do NOT modify - keep as-is                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ New Web Components (Future Development)                      │
│ ├── Use: responsive-style/web/                              │
│ ├── Target: Tablet & Desktop only                           │
│ └── Status: ✅ Use for all new development                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Mobile Components (Implemented)                              │
│ ├── Routes: /mobile/*                                        │
│ ├── Layout: src/layout/mobile/LayoutMobile.vue              │
│ ├── Styles: responsive-style/mobile/                        │
│ ├── No raw PrimeVue directly — use native HTML (select, input, checkbox)  │
│ ├── ✅ Generic PrimeVue wrappers OK: AutoCompleteGeneric, CalendarGeneric, ImagePreview │
│ └── Safe area: viewport-fit=cover + env(safe-area-inset-*)  │
└─────────────────────────────────────────────────────────────┘
```

**Testing Responsive Design**:
1. Test on Chrome DevTools with different device sizes
2. Test breakpoints: 1024px (tablet), 1280px+ (desktop)
3. Check DataTable horizontal scroll on tablet
4. Verify button wrapping on smaller screens
5. Check text readability on tablet and desktop
6. **Note**: Don't test mobile sizes - mobile will have separate implementation

### Style System Decision Guide

**When working on existing components:**
```scss
// ❌ Do NOT modify - keep as-is
@import '@/assets/scss/custom-style/standard-form.scss';
```
- **Action**: Keep existing imports unchanged
- **Reason**: Prevent breaking changes in production
- **Components**: All existing components in the codebase

**When creating new web components:**
```scss
// ✅ Use this for all new development
@import '@/assets/scss/responsive-style/web';

// Or combine with legacy if you need base styles:
@import '@/assets/scss/custom-style/standard-form.scss';  // Base styles
@import '@/assets/scss/responsive-style/web';             // Responsive utilities
```
- **Action**: Always use new responsive utilities
- **Target**: Tablet (≤ 1024px) and Desktop (> 1024px) only
- **Components**: All new web components (routes under `/sale/*`, `/production/*`, etc.)

**Quick Reference:**

| Scenario | Import | Status |
|----------|--------|--------|
| Existing component | `custom-style/standard-form.scss` | ❌ Keep unchanged |
| New web component | `responsive-style/web` | ✅ Use for new dev |
| Mobile component | `responsive-style/mobile` | ✅ Use for mobile dev |
| Need both | Import both files | ✅ OK if needed |

**Path Reference:**
- Legacy: `@/assets/scss/custom-style/standard-form.scss`
- New Web: `@/assets/scss/responsive-style/web`
- Mobile: `@/assets/scss/responsive-style/mobile`
- Variables: `@/assets/scss/variable.scss` (shared by all)
- Mixins: `@/assets/scss/mixin.scss` (shared by all)
```

### Mobile Development Guidelines

**IMPORTANT**: Mobile components have different conventions from Web components. Follow these rules strictly.

#### Mobile Layout Architecture

```
index.html
  └── viewport-fit=cover (enables safe area insets)

LayoutMobile.vue (src/layout/mobile/)
  ├── mobile-topbar-container (sticky top, optional per route)
  ├── mobile-content-wrapper (scrollable, padding-bottom for bottom nav + safe area)
  └── mobile-bottom-nav-container (fixed bottom: 0, padding-bottom: safe area)
```

#### iOS Safari Safe Area (CRITICAL)

**Problem**: iOS Safari has a bottom toolbar/home indicator that overlaps `position: fixed; bottom: 0` elements.

**Solution**: `viewport-fit=cover` + `env(safe-area-inset-bottom)` on all fixed/sticky bottom elements.

**Rules**:
1. `index.html` MUST have `viewport-fit=cover` in meta viewport tag
2. ALL `position: fixed; bottom` elements MUST use `env(safe-area-inset-bottom, 0px)`
3. ALL mobile view `padding-bottom` that accounts for bottom nav MUST include safe area

**Best Practices**:
```scss
// ❌ Bad - Safari bottom bar overlaps content
.my-fixed-bottom {
  position: fixed;
  bottom: 0;
}

.my-view {
  padding-bottom: 80px;
}

.my-sticky-btn {
  position: fixed;
  bottom: 70px;
}

// ✅ Good - Accounts for Safari safe area
.my-fixed-bottom {
  position: fixed;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.my-view {
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

.my-sticky-btn {
  position: fixed;
  bottom: calc(70px + env(safe-area-inset-bottom, 0px));
}
```

**Key values**:
- Bottom nav height: ~60px (padding 8px top/bottom + content)
- Content wrapper: `padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px))`
- Sticky buttons above nav: `bottom: calc(70px + env(safe-area-inset-bottom, 0px))`
- Views with bottom nav: `padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px))`
- Views with sticky btn + bottom nav: `padding-bottom: calc(140px + env(safe-area-inset-bottom, 0px))`

**Safe area utility classes** (in `mobile-utilities.scss`):
```scss
.mobile-safe-top    { padding-top: env(safe-area-inset-top); }
.mobile-safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

#### Mobile Component Conventions

| Rule | Web | Mobile |
|------|-----|--------|
| **UI Framework** | PrimeVue (DataTable, Dropdown, Checkbox, etc.) | Native HTML (`<select>`, `<input>`, `<checkbox>`) สำหรับ controls ทั่วไป ❌ raw PrimeVue — ✅ Generic wrappers: AutoCompleteGeneric, CalendarGeneric, ImagePreview |
| **SCSS Import** | `@import '@/assets/scss/responsive-style/web'` | `@import '@/assets/scss/responsive-style/mobile'` |
| **API Pattern** | Options API | Options API |
| **Alerts** | sweetAlerts | sweetAlerts |
| **Try-catch** | No (axios middleware) | No (axios middleware) |
| **Loading state** | No manual (axios middleware) | No manual (axios middleware) |
| **File naming** | kebab-case | kebab-case |
| **Date picker** | PrimeVue Calendar | PrimeVue Calendar (ผ่าน CalendarGeneric) |
| **Dropdown/Select** | PrimeVue Dropdown | Native `<select>` |

```vue
<!-- ✅ Good - Mobile component template -->
<style lang="scss" scoped>
@import '@/assets/scss/responsive-style/mobile';

.my-mobile-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}
</style>
```

#### Mobile Key CSS Classes

| Class | Usage |
|-------|-------|
| `.mobile-container` | Container with padding |
| `.mobile-mt-{1-3}` | Margin top (8px, 16px, 24px) |
| `.mobile-btn` + `.mobile-btn-primary` / `.mobile-btn-outline` / `.mobile-btn-success` | Buttons |
| `.mobile-form-group` | Form styling |
| `.mobile-empty-state` | Empty state |
| `.mobile-grid-2` | 2-column grid |
| `.mobile-safe-top` / `.mobile-safe-bottom` | Safe area padding |

#### Mobile Z-Index Hierarchy

```
9999  - Loading Overlay
1000  - Full-screen Modal Overlays (customer search/create)
100   - Bottom Nav Container + Top Bar Container
99    - Sticky Bottom Buttons (above bottom nav)
10    - Sticky Table Headers
```

### Image System (Azure Blob Storage)

Images are stored in Azure Blob Storage and accessed through two mechanisms. Understanding which to use is critical to avoid broken images.

#### Image Components

| Component | File | How it loads | When to use |
|-----------|------|-------------|-------------|
| **ImagePreview** | `src/components/prime-vue/ImagePreview.vue` | Direct Azure Blob URL (`getAzureBlobUrl`) | Displaying images in tables and views |
| **ImagePreviewEmit** | `src/components/prime-vue/ImagePreviewEmit.vue` | API proxy as Base64 (`getAzureBlobAsBase64`) | Only when you need the `@image-loaded` event to get blobPath |

**IMPORTANT**: Always prefer `ImagePreview.vue` for displaying images. Only use `ImagePreviewEmit.vue` if you specifically need the emitted blob path data.

```javascript
// ✅ Good - Use ImagePreview for display
import imagePreview from '@/components/prime-vue/ImagePreview.vue'

// ❌ Avoid - ImagePreviewEmit unless you need @image-loaded event
import imagePreview from '@/components/prime-vue/ImagePreviewEmit.vue'
```

#### Image Display in Views (Template)

```vue
<!-- ✅ Correct pattern (same as stock product data-table-view) -->
<imagePreview
  :imageName="item.imagePath"
  :type="type"
  :width="25"
  :height="25"
/>
<!-- type = 'STOCK-PRODUCT' → builds path: Stock/Product/{imagePath} -->
```

#### Blob Path Mapping (ImagePreview `buildBlobPathFromType`)

| Type | Blob Path | Azure URL |
|------|-----------|-----------|
| `STOCK` / `STOCK-PRODUCT` | `Stock/Product/{imageName}` | `https://...blob.../jewelry-images/Stock/Product/{imageName}` |
| `MOLD` | `Mold/{imageName}-Mold.png` | `https://...blob.../jewelry-images/Mold/{imageName}-Mold.png` |
| `ORDERPLAN` / `PRODUCTIONPLAN` | `ProductionPlan/{imageName}` | `https://...blob.../jewelry-images/ProductionPlan/{imageName}` |
| `USER` | `User/{imageName}` | `https://...blob.../jewelry-images/User/{imageName}` |
| `PAYMENT` | `Payment/{imageName}` | `https://...blob.../jewelry-images/Payment/{imageName}` |

#### Image Loading in PDF Builders

PDF generation uses `getAzureBlobAsBase64` to convert images to base64 for embedding in pdfmake.

**Reference pattern** (`sale-order-pdf-builder.js`):
```javascript
async prepareImages() {
  const { getAzureBlobAsBase64 } = await import('@/config/azure-storage-config.js')

  await Promise.all(
    this.items.map(async (item) => {
      if (item.imageBase64) return

      // ใช้ imageBlobPath ก่อน, ถ้าไม่มีใช้ imagePath
      const blobPath = item.imageBlobPath || item.imagePath
      if (!blobPath) return

      const base64Image = await getAzureBlobAsBase64(blobPath, 'stock')
      if (base64Image && base64Image.length > 0) {
        item.imageBase64 = base64Image
      }
    })
  )
}
```

**Rules for PDF image loading**:
- Always follow the sale-order-pdf-builder pattern above
- Use `item.imageBlobPath || item.imagePath` as blobPath (no manual prefix)
- Pass the correct `imageType` as second argument: `'stock'`, `'mold'`, `'plan'`, `'user'`

#### `getAzureBlobAsBase64` (azure-storage-config.js)

This function resolves images via backend API proxy. It determines which API endpoint to call:

| Resolved Type | API Endpoint | Trigger |
|---------------|-------------|---------|
| `stock` | `FileExtension/GetStockProductImage` | `blobPath.startsWith('Stock/')` or `imageType === 'stock'` |
| `mold` | `FileExtension/GetMoldImage` | `blobPath.startsWith('Mold/')` or `imageType === 'mold'` |
| `plan` | `FileExtension/GetPlanImage` | `blobPath.startsWith('ProductionPlan/')` or `imageType === 'plan'` |
| `user` | `FileExtension/GetImage` | `blobPath.startsWith('User/')` or `imageType === 'user'` |

**IMPORTANT**: blobPath prefix is checked **first** and takes priority over `imageType` parameter. This prevents the default `imageType='mold'` from overriding the actual path type.

### Generic PrimeVue Components

Reusable PrimeVue wrapper components อยู่ใน `src/components/prime-vue/`:

| Component | File | หน้าที่ |
|-----------|------|---------|
| `CalendarGeneric` | `CalendarGeneric.vue` | Date picker — wrapper PrimeVue Calendar พร้อม mobile-friendly styling |
| `AutoCompleteGeneric` | `AutoCompleteGeneric.vue` | Autocomplete — รองรับ API mode + static list mode |
| `ImagePreview` | `ImagePreview.vue` | แสดงรูปจาก Azure Blob (direct URL) |
| `ImagePreviewEmit` | `ImagePreviewEmit.vue` | แสดงรูปจาก Azure Blob พร้อม emit blobPath |
| `DataTableWithPaging` | `DataTableWithPaging.vue` | DataTable พร้อม pagination |

**CalendarGeneric Usage**:
```vue
<CalendarGeneric
  v-model="selectedDate"
  dateFormat="dd/mm/yy"
  placeholder="เลือกวันที่"
  :showIcon="true"
  :showButtonBar="true"
  @date-select="onDateSelect"
/>
```

**หมายเหตุ**: v-model ใช้ `Date` object (ไม่ใช่ string) — ใช้ `formatISOString(date)` จาก `src/services/utils/dayjs.js` เพื่อแปลงเป็น ISO string สำหรับ API

**AutoCompleteGeneric — Static List Mode (สำหรับ dropdown ที่มี master list ตายตัว):**

ใช้เมื่อ: มี list ตายตัว (เช่น currency units, job types) ไม่ต้อง call API

```vue
<AutoCompleteGeneric
  :modelValue="currencyUnit"
  :staticOptions="CURRENCY_UNITS"
  :useStaticList="true"
  optionLabel="code"
  placeholder="เช่น US$, EUR"
  :forceSelection="false"
  customClass="currency-ac"
  @update:modelValue="onCurrencyChange"
>
  <template #option="{ option }">
    <span>{{ option.label }}</span>
  </template>
</AutoCompleteGeneric>
```

Props ที่ต้องใช้:
- `useStaticList: true` — กรองจาก `staticOptions` (ไม่ call API)
- `staticOptions` — array ของ options
- `optionLabel` — field ที่ใช้กรอง + แสดงใน input หลังเลือก
- `forceSelection: false` — รับ free-text ได้

เมื่อ user เลือก option → emit ด้วย full object, ต้อง extract field ที่ต้องการใน handler:
```javascript
onCurrencyChange(value) {
  this.currencyUnit = typeof value === 'object' ? value.code : value
}
```

Style (:deep สำหรับ PrimeVue component ที่อยู่ใน child):
```scss
:deep(.currency-ac) {
  width: 100%;
  .p-autocomplete-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.9rem;
  }
}
```