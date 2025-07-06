# Dashboard View Business Logic Documentation

## Overview
The Gem Stock Dashboard provides comprehensive analytics and monitoring capabilities for jewelry inventory management. Built with Vue 3 Composition API, it delivers real-time insights across multiple time periods.

## Component Architecture

### Core Structure
- **Framework**: Vue 3 with Options API
- **State Management**: Pinia store (`useStockGemDashboardStore`)
- **UI Components**: PrimeVue with custom SCSS styling
- **Charts**: Custom HorizontalBarChart component
- **Internationalization**: Vue i18n (Thai/English support)

## Business Features

### 1. Multi-Tab Dashboard System

#### Overview Tab
**Purpose**: Comprehensive stock overview with key metrics and recent activities

**Key Sections**:
- **Stock Summary Cards**: 
  - Total gem types with unique varieties count
  - Total quantity with weight breakdown
  - Low stock alerts with zero stock count
  - Available vs on-process quantities

- **Category Breakdown Chart**:
  - Horizontal bar chart visualization
  - Data grouped by gem attributes (group, shape, grade)
  - Multiple dataset fields (count, weight, on-process data)
  - Responsive design with empty state handling

- **Top Movements Analysis**:
  - Most active gems by transaction count
  - Category and quantity moved information
  - Tabular display with gem code identification

- **Price Alerts Panel**:
  - Significant price changes (>5%)
  - Before/after price comparison
  - Percentage change indicators
  - Visual trend direction badges

- **Availability Status**:
  - Available vs on-process breakdown
  - Color-coded status indicators
  - Real-time quantity tracking

- **Last Activities Section** *(New Feature)*:
  - 10 most recent transactions
  - Transaction type with Thai descriptions
  - Gem details and quantities
  - Status and job/PO references
  - Formatted timestamps

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

### API Integration Updates
**DateTimeOffset Support**: Updated to handle timezone-aware date filtering
- Frontend sends proper DateTimeOffset values
- Backend processes with UTC conversion
- Consistent date boundary calculations

## Technical Implementation

### Component Methods

#### Core Operations
- `loadDashboardData()`: Main data loading orchestration
- `setActiveTab()`: Tab switching with data loading
- `refreshDashboard()`: Manual refresh functionality
- `applyFilters()`/`clearFilters()`: Filter management

#### Utility Methods
- `getTransactionIcon()`: Maps transaction types to Bootstrap icons
- `formatNumber()`: Number formatting with locale support
- `formatCurrency()`: Thai Baht currency formatting
- `formatDateTime()`: Dayjs-based date/time formatting

### State Management
- **Reactive Data**: Vue 3 reactivity system
- **Computed Properties**: Derived state for UI rendering
- **Store Integration**: Pinia store for centralized state management
- **Loading States**: Granular loading indicators

### Performance Considerations
- **Lazy Loading**: Tab-specific data loading
- **Chart Optimization**: Conditional rendering with data validation
- **Memory Management**: Proper component cleanup
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
- **HorizontalBarChart**: Custom chart component
- **Pinia Store**: State management
- **Vue i18n**: Internationalization
- **SweetAlert**: User notifications
- **Dayjs**: Date/time manipulation

## Future Enhancement Opportunities

### Planned Features
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Filtering**: Multi-criteria filter combinations
- **Export Functionality**: PDF/Excel report generation
- **Chart Interactions**: Drill-down capabilities
- **Customizable Dashboards**: User-configurable layouts

### Performance Improvements
- **Virtual Scrolling**: For large transaction lists
- **Data Caching**: Client-side caching strategies
- **Progressive Loading**: Incremental data loading
- **Chart Lazy Loading**: On-demand chart rendering

### Analytics Enhancements
- **Predictive Analytics**: Trend forecasting
- **Comparative Analysis**: Period-over-period comparisons
- **Custom Metrics**: User-defined KPIs
- **Alert Customization**: Configurable thresholds