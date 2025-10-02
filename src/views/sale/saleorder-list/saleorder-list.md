# Sale Order List UI Components

## Overview
Sale Order List provides a comprehensive interface for viewing, searching, and managing sale orders. Built following the quotation-list pattern with consistent UI patterns and API integration.

## Component Structure

### Main View
- `index-view.vue` - Main orchestrator component that coordinates between search and data table

### Child Components
- `components/search-view.vue` - Search form with basic and advanced filtering options  
- `components/data-table-view.vue` - Data table display with pagination, sorting, and actions

## Features

### Search & Filtering
- **Basic Search**: Sale Order Number (SO-YYYY-###)
- **Advanced Search Dialog**:
  - Customer Name
  - Reference Quotation Number
  - Currency Unit (USD, THB, etc.)
  - Create By (Creator name)
  - Create Date Range (start/end)
  - Delivery Date Range (start/end)

### Data Table Display
- **Pagination**: Server-side with configurable page size
- **Sorting**: Multi-column sorting support
- **Actions**: Edit and View buttons for each record
- **Responsive**: Scroll height adapts to viewport

### Column Configuration
1. Actions (Edit/View buttons)
2. SO Number - Sale order number
3. Running Number - Internal running number
4. Customer Name 
5. Customer Phone
6. Customer Email
7. Reference Quotation - Linked quotation number
8. Currency Unit
9. Currency Rate (2 decimal places)
10. Markup % (2 decimal places)
11. Discount % (2 decimal places)
12. Deposit % (whole number)
13. Status (colored badges)
14. Delivery Date
15. Create Date
16. Create By
17. Remarks

## Navigation & Actions

### Edit Functionality
- Route: `/sale-order?soNumber={soNumber}`
- Opens sale order form in edit mode
- Allows full modification of sale order data

### View Functionality  
- Route: `/sale-order?soNumber={soNumber}&mode=view`
- Opens sale order form in read-only view mode
- Displays all sale order details without editing capability

## Status Management

### Status Color Coding
- **Warning (Yellow)**: Pending/Waiting status (Status = 1)
- **Info (Blue)**: In Progress status (Status = 2)  
- **Success (Green)**: Completed status (Status = 3)
- **Danger (Red)**: Cancelled status (Status = 4)
- **Secondary (Gray)**: Unknown/Other status

## API Integration

### Store: `sale-order-store.js`
- **State**: Maintains `dataList` with data and total count
- **Actions**: `fetchList()` for server-side pagination and filtering

### Backend Service
- **Endpoint**: `POST /SaleOrder/List`
- **Request Format**: DataSourceRequest with search parameters
- **Response Format**: DataSourceResult with data array and total count

### Search Parameters
```javascript
{
  soNumber: string,
  customerName: string,
  refQuotation: string,
  currencyUnit: string,
  status: number,
  createBy: string,
  createDateStart: Date,
  createDateEnd: Date,
  deliveryDateStart: Date,
  deliveryDateEnd: Date
}
```

## Styling & Theme

### CSS Framework
- **Bootstrap 4**: Base styling and grid system
- **Custom SCSS**: Imported from central assets
  - `@/assets/scss/custom-style/standard-data-table`
  - `@/assets/scss/custom-style/standard-form`
  - `@/assets/scss/custom-style/standard-search-bar`

### Responsive Design
- **Mobile-friendly**: Search form adapts to small screens
- **Flexible columns**: Table columns have minimum widths
- **Scroll support**: Horizontal scroll for narrow viewports

## Development Notes

### Component Naming
- All components use kebab-case naming convention
- Follow Vue 3 Composition API patterns where applicable
- Maintain consistency with existing quotation-list structure

### Reusability
- `BaseDataTable` component for consistent table behavior
- `pageTitle` component for consistent page headers
- `DialogSearchView` for advanced search modals

### Performance
- Server-side pagination reduces initial load time
- Lazy loading of search dialog component
- Efficient store management with computed properties

## Integration Points

### Router Configuration
- Expects routes to be configured for `/sale-order` path
- Query parameters: `soNumber` and optional `mode`

### Permission System
- Inherits permission checks from parent routing
- Actions may be conditionally displayed based on user roles

### Error Handling
- API errors displayed via standard error handling
- Graceful fallback for failed data loads
- Console logging for debugging

## Future Enhancements

### Possible Additions
- Export functionality (Excel/CSV)
- Bulk operations (status updates, deletion)
- Advanced filtering (date ranges, status multi-select)
- Column customization (show/hide columns)
- Save search preferences

### Integration Opportunities
- Print sale orders directly from list
- Email notifications for status changes
- Integration with production planning system
- Real-time status updates via websockets

## File Dependencies

### Vue Components
- `@/components/prime-vue/DataTableWithPaging.vue`
- `@/components/custom/PageTitle.vue`
- `@/components/prime-vue/DialogSearchView.vue`

### External Libraries
- `primevue/calendar` - Date picker components
- `@/services/utils/dayjs.js` - Date formatting utilities

### Store Dependencies
- `@/stores/modules/api/sale/sale-order-store.js`

### Navigation
- Vue Router for programmatic navigation
- Integration with main application routing system