Claude Code Prompt: Sales Order UI Development
Project Context
Create a Sales Order management UI for a jewelry business system using Vue.js 3 with Composition API and .NET Core backend. The system converts quotations into sales orders and handles both stock items and production items.
Requirements
1. Sales Order Creation Page
Create a Vue.js component for converting quotation to sales order with the following features:
UI Components Needed:
•	Sales order header form (customer info, order date, payment terms)
•	Quotation items grid with selection capability (for partial acceptance)
•	Item type indicators (Stock/Production items)
•	Payment terms configuration section
•	Order summary with totals
•	Action buttons (Save Draft, Confirm Order, Cancel)
Key Features:
•	Load quotation data and display items
•	Allow customer to accept all items or select specific items
•	Calculate order totals dynamically
•	Show item availability status for stock items
•	Indicate which items need production orders
•	Payment terms selection (Cash, Credit, Deposit Required)
•	Deposit calculation for production items
2. Data Models
Frontend Models (TypeScript):
interface SalesOrder {
  salesOrderId?: number;
  quotationId: number;
  customerId: number;
  customerName: string;
  orderDate: Date;
  paymentTerms: PaymentTerm;
  depositRequired: boolean;
  depositPercentage?: number;
  totalAmount: number;
  status: SalesOrderStatus;
  items: SalesOrderItem[];
}

interface SalesOrderItem {
  itemId?: number;
  salesOrderId?: number;
  productId: number;
  productName: string;
  itemType: 'Stock' | 'Production';
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isSelected: boolean;
  stockAvailable?: number;
  estimatedProductionDays?: number;
}

enum PaymentTerm {
  Cash = 'Cash',
  Credit30 = 'Credit30',
  Credit60 = 'Credit60',
  DepositAndBalance = 'DepositAndBalance'
}

enum SalesOrderStatus {
  Draft = 'Draft',
  Confirmed = 'Confirmed',
  PartiallyFulfilled = 'PartiallyFulfilled',
  Fulfilled = 'Fulfilled'
}
Backend Models (C#):
public class SalesOrder
{
    public int SalesOrderId { get; set; }
    public int QuotationId { get; set; }
    public int CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public PaymentTerm PaymentTerms { get; set; }
    public bool DepositRequired { get; set; }
    public decimal? DepositPercentage { get; set; }
    public decimal TotalAmount { get; set; }
    public SalesOrderStatus Status { get; set; }
    public List<SalesOrderItem> Items { get; set; }
}

public class SalesOrderItem
{
    public int ItemId { get; set; }
    public int SalesOrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public ItemType ItemType { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
    public int? StockAvailable { get; set; }
    public int? EstimatedProductionDays { get; set; }
}
3. API Endpoints
Create these .NET Core Web API endpoints:
[ApiController]
[Route("api/[controller]")]
public class SalesOrderController : ControllerBase
{
    // GET: api/salesorder/from-quotation/{quotationId}
    [HttpGet("from-quotation/{quotationId}")]
    public async Task<ActionResult<SalesOrderDto>> GetSalesOrderFromQuotation(int quotationId)

    // POST: api/salesorder
    [HttpPost]
    public async Task<ActionResult<SalesOrder>> CreateSalesOrder(CreateSalesOrderDto salesOrder)

    // PUT: api/salesorder/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateSalesOrder(int id, UpdateSalesOrderDto salesOrder)

    // GET: api/salesorder/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<SalesOrder>> GetSalesOrder(int id)

    // POST: api/salesorder/{id}/confirm
    [HttpPost("{id}/confirm")]
    public async Task<ActionResult> ConfirmSalesOrder(int id)
}
4. UI Design Guidelines
Styling Framework: Use Tailwind CSS or similar utility-first framework
Layout Structure:
┌─────────────────────────────────────┐
│ Sales Order Creation                │
├─────────────────────────────────────┤
│ Customer Info & Order Details       │
├─────────────────────────────────────┤
│ Quotation Items Selection Grid      │
│ ├─ Item Name | Type | Qty | Price   │
│ ├─ [✓] Diamond Ring | Stock | 2     │
│ ├─ [✓] Custom Necklace | Production │
├─────────────────────────────────────┤
│ Payment Terms & Deposit Section     │
├─────────────────────────────────────┤
│ Order Summary & Totals              │
├─────────────────────────────────────┤
│ [Save Draft] [Confirm] [Cancel]     │
└─────────────────────────────────────┘
Key UX Features:
•	Real-time total calculations
•	Visual indicators for item types (icons/badges)
•	Validation messages for business rules
•	Loading states for API calls
•	Success/error notifications
•	Responsive design for mobile/tablet
5. Business Logic
Validation Rules:
•	At least one item must be selected
•	Stock items: verify availability before confirmation
•	Production items: require deposit if policy demands
•	Payment terms validation based on customer credit status
•	Minimum order value checks
Calculations:
•	Line totals: quantity × unit price
•	Subtotal: sum of selected items
•	Deposit amount: (production items total × deposit percentage)
•	Total order value including any applicable taxes
6. File Structure
Create the following file structure:
src/
├── components/
│   └── SalesOrder/
│       ├── SalesOrderCreate.vue
│       ├── SalesOrderItemGrid.vue
│       ├── PaymentTermsSection.vue
│       └── OrderSummary.vue
├── composables/
│   └── useSalesOrder.ts
├── types/
│   └── salesOrder.ts
└── api/
    └── salesOrderApi.ts
7. Integration Points
Dependencies:
•	Quotation system (already completed)
•	Customer management system
•	Product/inventory system
•	Payment processing system
State Management:
•	Use Pinia for state management if needed
•	Handle form state with Vue 3 reactivity
•	Manage API loading states
Technical Requirements
•	Frontend: Vue.js 3, TypeScript, Composition API
•	Backend: .NET Core 6+, Entity Framework Core
•	Database: PostgreSQL
•	Styling: Tailwind CSS or similar
•	HTTP Client: Axios for API calls
•	Validation: Vue 3 form validation or Vee-Validate
Expected Deliverables
1.	Complete Vue.js Sales Order creation component
2.	.NET Core API controller with CRUD operations
3.	Database migration scripts for sales order tables
4.	API integration services
5.	Form validation and error handling
6.	Responsive UI implementation
Please implement this step by step, starting with the basic component structure and then adding the business logic and API integration.

