# Dashboard View Business Logic Documentation

## Overview
The Gem Stock Dashboard provides comprehensive analytics and monitoring capabilities for jewelry inventory management. Built with Vue 3 Options API, it delivers real-time insights across multiple time periods using a modular component architecture.

## Component Architecture *(Updated 2024)*

### Core Structure
- **Framework**: Vue 3 with Options API
- **State Management**: Pinia store (`useStockGemDashboardStore`)
- **UI Components**: PrimeVue with custom SCSS styling
- **Charts**: Custom HorizontalBarChart component
- **Internationalization**: Vue i18n (Thai/English support)

### Modular Architecture Pattern
The dashboard follows a **component separation pattern** for better maintainability:

```
/dashboard/
├── dashboard-view.vue (main orchestrator - 400 lines)
└── components/ (modular sections)
    ├── stock-summary-cards.vue (overview metrics)
    ├── category-chart.vue (chart visualization)
    ├── top-movements-table.vue (movement analysis)
    ├── last-activities-table.vue (transaction history)
    ├── price-alerts-panel.vue (price change alerts)
    └── availability-status.vue (availability metrics)
```

**Benefits Achieved**:
- **Reduced Complexity**: Main file reduced from 800+ to ~400 lines
- **Improved Maintainability**: Each component handles a single responsibility
- **Enhanced Reusability**: Components can be reused across different dashboards
- **Better Team Development**: Multiple developers can work on different sections
- **Easier Testing**: Individual components can be unit tested in isolation

### File Naming Convention
All component files use **kebab-case** naming:
- ✅ `stock-summary-cards.vue`
- ❌ `StockSummaryCards.vue`

### Component Communication
- **Props Down**: Parent passes data to child components via props
- **Events Up**: Child components emit events for user interactions (where needed)
- **Store Access**: Components access Pinia store directly for data consistency

## Business Features

### 1. Multi-Tab Dashboard System

#### Overview Tab
**Purpose**: Comprehensive stock overview with key metrics and recent activities

**Component Sections**:

#### **Stock Summary Cards** (`stock-summary-cards.vue`)
- **Purpose**: Overview metrics display
- **Features**:
  - Total gem types with unique varieties count
  - Total quantity (piece count) - separate card
  - Total weight (grams) - separate card
  - Low stock alerts with zero stock count
- **Props**: `stockSummary` (Object)
- **Methods**: `formatNumber()` for number formatting

#### **Category Breakdown Chart** (`category-chart.vue`)
- **Purpose**: Visual data representation
- **Features**:
  - Horizontal bar chart visualization
  - Data grouped by gem attributes (group, shape, grade)
  - Multiple dataset fields (count, weight, on-process data)
  - Responsive design with empty state handling
- **Props**: `categoryChartData`, `isLoading`, `datasetFields`, `chartName`
- **Dependencies**: `HorizontalBarChart` component

#### **Top Movements Analysis** (`top-movements-table.vue`)
- **Purpose**: Transaction activity tracking
- **Features**:
  - Most active gems by transaction count
  - Category and quantity moved information
  - Tabular display with gem code identification
- **Props**: `topMovements` (Array)
- **Methods**: `formatNumber()` for quantity display

#### **Last Activities Table** (`last-activities-table.vue`)
- **Purpose**: Recent transaction history
- **Features**:
  - 10 most recent transactions with BaseDataTable integration
  - Transaction type with Thai descriptions and icons
  - Gem details and quantities with formatted display
  - Status badges and job/PO references
  - User tracking (createBy, updateBy)
  - Custom column templates for enhanced data presentation
- **Props**: `lastActivities` (Array)
- **Dependencies**: `BaseDataTable` from PrimeVue
- **Templates**: Custom templates for each column type

#### **Price Alerts Panel** (`price-alerts-panel.vue`)
- **Purpose**: Price change monitoring
- **Features**:
  - Significant price changes (>5%)
  - Before/after price comparison
  - Percentage change indicators with color coding
  - Visual trend direction badges
- **Props**: `priceAlerts` (Array)
- **Methods**: `formatCurrency()` for Thai Baht formatting

#### **Availability Status** (`availability-status.vue`)
- **Purpose**: Inventory availability tracking
- **Features**:
  - Available vs on-process breakdown
  - Color-coded status indicators with gradients
  - Real-time quantity tracking
- **Props**: `stockSummary` (Object)
- **Methods**: `formatNumber()` for quantity display

#### Today Tab
**Purpose**: Daily operational insights and real-time monitoring

**Features**:
- **Daily Summary Cards**:
  - Today's transaction count
  - Price changes occurred
  - New stock items added
  - Low stock alerts generated

- **Transaction Activities List**:
  - Real-time transaction feed
  - Transaction type icons and descriptions
  - Gem identification and quantities
  - Status tracking and job references
  - Time-sorted display (most recent first)

#### Weekly Tab *(Enhanced)*
**Purpose**: Weekly performance analysis and trend monitoring

**Features**:
- **Weekly Summary Cards**:
  - Weekly transaction totals
  - Price change tracking
  - New item additions
  - Alert generation counts

- **Weekly Analysis Panel**:
  - Movement pattern analysis
  - Performance trend indicators
  - Activity summaries with timestamps
  - Empty state handling for no data

#### Monthly Tab *(Enhanced)*
**Purpose**: Monthly comprehensive reporting and strategic insights

**Features**:
- **Monthly Summary Cards**:
  - Monthly transaction aggregates
  - Long-term price trend analysis
  - Inventory addition tracking
  - Alert pattern analysis

- **Monthly Analysis Panel**:
  - Comprehensive monthly breakdowns
  - Strategic performance indicators
  - Trend analysis with historical context
  - Business intelligence insights

### 2. Data Management & State

#### Store Integration
**Primary Store**: `useStockGemDashboardStore`

**Key Getters**:
- `getStockSummary`: Main dashboard statistics
- `getCategories`: Category breakdown data
- `getTrends`: Transaction trend analysis
- `getTopMovements`: Most active gems
- `getPriceAlerts`: Price change notifications
- `getLastActivities`: Recent transaction history *(New)*
- `getTodaySummary/getTodayTransactions`: Daily data
- `getWeeklySummary/getDailyMovements`: Weekly data *(Enhanced)*
- `getMonthlySummary/getWeeklyComparisons`: Monthly data *(Enhanced)*

#### Data Refresh Logic
- **Manual Refresh**: User-triggered via refresh button
- **Tab-Specific Loading**: Loads data when switching tabs
- **Filter Integration**: Supports groupName, shape, grade filters
- **Loading States**: Spinner indicators during data fetch
- **Error Handling**: SweetAlert integration for error display

### 3. User Interface & Experience

#### Responsive Design
- **Grid System**: Bootstrap 4 responsive grid
- **Breakpoints**: Mobile-first approach with tablet/desktop optimizations
- **Component Scaling**: Adaptive card sizes and typography
- **Navigation**: Tab-based interface with active state indicators

#### Visual Design System
- **Color Scheme**: 
  - Overview: Base color scheme
  - Today: Purple accent (#6f42c1)
  - Weekly: Green accent (#28a745) *(New)*
  - Monthly: Blue accent (#17a2b8) *(New)*

- **Icons**: Bootstrap Icons throughout
- **Typography**: Hierarchical heading system
- **Cards**: Consistent card design with hover effects
- **Loading States**: Spinner animations and skeleton screens

#### Internationalization
**Supported Languages**: Thai (primary), English (secondary)

**Recent Translation Additions**:
- `lastActivities`: "กิจกรรมล่าสุด" / "Last Activities"
- `weeklyTransactions`: "ธุรกรรมรายสัปดาห์" / "Weekly Transactions"
- `weeklyAnalysis`: "การวิเคราะห์รายสัปดาห์" / "Weekly Analysis"
- `monthlyTransactions`: "ธุรกรรมรายเดือน" / "Monthly Transactions"
- `monthlyAnalysis`: "การวิเคราะห์รายเดือน" / "Monthly Analysis"
- Error state messages for weekly/monthly data

## Recent Enhancements (2024)

### Last Activities Integration
**Business Requirement**: Users needed visibility into recent stock movements directly in the overview.

**Implementation**:
- **UI Component**: New activities list in overview tab
- **Data Source**: `getLastActivities` store getter
- **Display Logic**: Shows 10 most recent transactions
- **Visual Design**: Consistent with today's transaction display
- **Interactive Elements**: Transaction type icons, formatted timestamps

**Features**:
- Transaction type mapping with Thai descriptions
- Gem identification (code, group, shape, grade)
- Quantity and status information
- Job/PO reference linking
- Running number tracking
- Real-time timestamp formatting

### Weekly/Monthly Tab Enhancement
**Previous State**: Placeholder "Coming Soon" messages

**Enhanced Implementation**:
- **Full UI Implementation**: Complete dashboard layouts
- **Summary Cards**: Metrics specific to time periods
- **Analysis Panels**: Data visualization sections
- **State Management**: Proper data binding to store getters
- **Empty States**: Graceful handling of no-data scenarios
- **Styling**: Period-specific color schemes

**Business Value**:
- Comprehensive time-period analysis
- Consistent user experience across all tabs
- Foundation for future analytics features

### Stock Summary Card Separation
**Business Requirement**: Users needed clearer distinction between piece count and weight metrics.

**Implementation**:
- **UI Split**: Separated combined quantity/weight card into two distinct cards
- **Visual Design**: Added weight-specific icon (bi-weight) for weight card
- **Data Clarity**: Piece count and weight now have dedicated displays
- **Translations**: Added specific labels for piece count and weight units

**Enhanced User Experience**:
- Clear visual separation of quantity vs weight metrics
- Improved readability of key inventory indicators
- Better alignment with business inventory tracking practices

### Last Activities Enhancement & Repositioning
**Business Requirement**: Users needed more comprehensive transaction details and better layout organization.

**Implementation Changes**:
- **Location Update**: Moved Last Activities from right sidebar to main content area (same column as Top Movements)
- **Data Enhancement**: Added createBy and updateBy fields for user tracking
- **API Updates**: Extended LastActivity model with user audit fields
- **UI Improvements**: Enhanced detail display with conditional user information

**Layout Benefits**:
- **Better Space Utilization**: Main content area provides more room for transaction details
- **Improved Readability**: Wider layout accommodates additional user tracking fields
- **Logical Grouping**: Activities grouped with other transaction-related data
- **Enhanced Audit Trail**: Users can now see who created and updated each transaction

**Technical Implementation**:
- Backend: Added CreateBy and UpdateBy to LastActivity model and service
- Frontend: Enhanced activity display with conditional user fields
- Translations: Added createBy/updateBy labels in Thai and English
- UI: Transformed from card-based layout to responsive data table structure

### Last Activities Table Structure Enhancement
**Business Requirement**: Users needed more structured and scannable transaction data presentation.

**Implementation Changes**:
- **UI Transformation**: Changed from card-based activity list to structured data table
- **Table Structure**: Following src/views/receipt-stock/gem/transaction/components/data-table-view.vue pattern
- **Column Organization**: 
  - Create Date (formatted timestamp)
  - Gem Code with group name
  - Transaction Type (with icons)
  - Quantity (formatted numbers)
  - Running Number (monospace styling)
  - Job/PO references
  - Status (with color badges)
  - User tracking (createBy/updateBy)

**UI/UX Improvements**:
- **Responsive Table**: Bootstrap table-responsive with horizontal scrolling
- **Visual Hierarchy**: Clear column headers with consistent styling
- **Data Density**: More information visible in compact format
- **Status Indicators**: Color-coded badges for transaction status
- **Icon Integration**: Transaction type icons for quick visual identification
- **Hover Effects**: Row highlighting for better user interaction

**Technical Features**:
- **BaseDataTable Integration**: Uses the same component as data-table-view.vue
- **Component Consistency**: Exact same structure and patterns as transaction views
- **Template System**: Custom templates for each column with proper formatting
- **PrimeVue Integration**: Leverages PrimeVue DataTable with custom templates
- **Performance**: Optimized rendering with virtual scrolling capabilities
- **Responsive Design**: Built-in responsive behavior from BaseDataTable component

### Component Refactoring History *(2024)*

#### **Component Separation Implementation**
**Problem**: Original dashboard-view.vue was 800+ lines and becoming unmaintainable

**Solution**: Extracted 6 specialized components following the modular pattern

**Refactoring Process**:
1. **Identified Logical Sections**: Analyzed UI structure for component boundaries
2. **Extracted Components**: Created individual Vue files for each section
3. **Props Interface**: Defined clean prop interfaces for data passing
4. **Import Updates**: Updated main dashboard to import new components
5. **Cleanup**: Removed redundant code and unused methods from main file

**Results**:
- **Main File Size**: Reduced from 800+ to ~400 lines
- **Component Count**: 6 new reusable components created
- **Maintainability**: Each component has single responsibility
- **Code Quality**: Improved linting and structure

#### **BaseDataTable Integration** (`last-activities-table.vue`)
**Component Integration**: Following `src/views/receipt-stock/gem/transaction/components/data-table-view.vue` pattern

**Implementation Features**:
- **Import Structure**: `import BaseDataTable from '@/components/prime-vue/DataTableWithPaging.vue'`
- **Column Configuration**: Array-based column definitions with template references
- **Template Slots**: Custom templates for each column type:
  - `typeTemplate`: Transaction type with icon and name
  - `qtyTemplate`: Quantity with formatting and transaction icon
  - `codeTemplate`: Gem code with group name subtitle
  - `statusTemplate`: Color-coded status badges
  - `createByTemplate`: User information with updateBy subtitle
  - `runningTemplate`: Monospace styled running numbers
  - `jobOrPoTemplate`: Conditional display of job/PO references

**Data Handling**:
- **Static Display**: Fixed 10 records, no pagination needed
- **Real-time Updates**: Direct binding to store data
- **Responsive Design**: Built-in responsive behavior from BaseDataTable

### API Integration Updates
**DateTimeOffset Support**: Updated to handle timezone-aware date filtering
- Frontend sends proper DateTimeOffset values
- Backend processes with UTC conversion
- Consistent date boundary calculations

## Technical Implementation

### Main Dashboard Controller (`dashboard-view.vue`)

#### Core Operations
- `loadDashboardData()`: Main data loading orchestration
- `setActiveTab()`: Tab switching with data loading
- `refreshDashboard()`: Manual refresh functionality
- `applyFilters()`/`clearFilters()`: Filter management

#### Computed Properties
- `stockSummary()`: Main dashboard statistics from store
- `categoryChartData()`: Chart data for visualization
- `topMovements()`: Most active gems by transaction count
- `lastActivities()`: Recent transaction history
- `priceAlerts()`: Price change notifications
- `todaySummary()`/`weeklySummary()`/`monthlySummary()`: Time-period specific data

#### Utility Methods (Removed from Components)
- Removed redundant utility methods after component separation
- Each component now handles its own formatting logic
- Centralized store access reduces method duplication

### Component-Level Implementation

#### Individual Component Responsibilities
- **Data Formatting**: Each component handles its own number/currency formatting
- **Event Handling**: Components manage their internal interactions
- **State Management**: Direct store access where needed
- **Styling**: Component-specific SCSS with shared variables

#### Props Interface Design
```javascript
// Example: stock-summary-cards.vue
props: {
  stockSummary: {
    type: Object,
    default: () => ({})
  }
}

// Example: category-chart.vue  
props: {
  categoryChartData: Object,
  isLoading: Boolean,
  datasetFields: Array,
  chartName: String
}
```

### Performance Optimizations
- **Component-Level Optimization**: Individual components can be optimized independently
- **Reduced Bundle Size**: Tree-shaking eliminates unused code more effectively
- **Lazy Loading**: Tab-specific data loading maintained
- **Memory Management**: Better component lifecycle management
- **API Efficiency**: Batched requests where possible

## Business Rules & Logic

### Dashboard Thresholds
- **Low Stock Alert**: Items with quantity ≤ threshold
- **Zero Stock Alert**: Items with exactly 0 quantity
- **Price Change Alert**: Changes > 5%
- **Transaction Limit**: Last 10 activities displayed

### Data Filtering
- **Group Name**: Gem category filtering
- **Shape**: Physical shape filtering
- **Grade**: Quality grade filtering
- **Date Range**: Time period boundaries
- **Real-time Updates**: Live data refresh capabilities

### User Experience Rules
- **Tab Persistence**: Maintains active tab state
- **Loading Feedback**: Visual indicators during operations
- **Error Recovery**: Graceful error handling with user feedback
- **Responsive Behavior**: Adaptive design across devices

## Integration Points

### Backend API Integration
- **Endpoints**: StockGem dashboard APIs
- **Request Format**: DashboardWrapperRequest with filters
- **Response Handling**: Comprehensive error handling
- **Data Transformation**: Frontend-specific data formatting

### Component Dependencies
- **Modular Components**: 6 specialized dashboard components
- **HorizontalBarChart**: Custom chart component (used in `category-chart.vue`)
- **BaseDataTable**: PrimeVue table component (used in `last-activities-table.vue`)
- **Pinia Store**: State management across all components
- **Vue i18n**: Internationalization support
- **SweetAlert**: User notifications
- **Dayjs**: Date/time manipulation

## Future Enhancement Opportunities

### Component Architecture Evolution
- **Cross-Dashboard Reusability**: Use components in other dashboard views
- **Component Library**: Standardize dashboard components across the application
- **Advanced Props**: Enhanced component interfaces for more flexibility
- **Event System**: Better parent-child communication patterns

### Planned Features
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Filtering**: Multi-criteria filter combinations
- **Export Functionality**: PDF/Excel report generation at component level
- **Chart Interactions**: Drill-down capabilities in chart components
- **Customizable Dashboards**: User-configurable component layouts

### Performance Improvements
- **Component Lazy Loading**: Load dashboard components on demand
- **Virtual Scrolling**: Enhanced in `last-activities-table.vue`
- **Data Caching**: Component-level caching strategies
- **Progressive Loading**: Incremental data loading per component
- **Chart Optimization**: Enhanced chart performance in `category-chart.vue`

### Component-Specific Enhancements
- **Stock Summary Cards**: Add drill-down capability to detailed views
- **Category Chart**: Interactive chart with filtering capabilities
- **Activities Table**: Enhanced filtering and export features
- **Price Alerts**: Real-time price monitoring with notifications
- **Availability Status**: Predictive availability forecasting

### Development Process Improvements
- **Component Testing**: Unit tests for individual components
- **Storybook Integration**: Component documentation and testing
- **Type Safety**: TypeScript migration for better component interfaces
- **Performance Monitoring**: Component-level performance tracking