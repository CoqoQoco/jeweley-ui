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
- **Bootstrap 4** for base styling with custom SCSS

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
- Protected routes organized by feature:
  - `production/` - Production planning and tracking
  - `stock/` - Inventory management (gems, products)
  - `mold/` - Mold creation and management
  - `sale/` - Sales and quotations
  - `setting/` - User and system settings

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

**Example**: Gem Dashboard Implementation
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
```