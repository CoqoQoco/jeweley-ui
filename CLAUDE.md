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