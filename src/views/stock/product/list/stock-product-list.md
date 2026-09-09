
#### ช่วยเขียนและแก้ไข code ตามรูปแบบใน E:\coqo_duangkeaw\Code\jeweley-ui\CLAUDE.md เท่านั้นครับ
#### ถ้ามีการใช้ prime-vue components >> ตรวจสอบว่ามี generic-components ไหม >> ไม่มีให้สร้างไว้เพื่อ re-used >> สร้างและเช็ค ที่ E:\coqo_duangkeaw\Code\jeweley-ui\src\components\prime-vue

>> คลังสินค้าสำเร็จรูป (Stock Product List)
>> ระบบตรวจสอบและจัดการคลังสินค้าสำเร็จรูป รองรับการค้นหา แก้ไข และพิมพ์ป้ายบาร์โค้ด
>> **หมายเหตุ**: Web version รองรับ Tablet & Desktop เท่านั้น, Mobile จะมี route และ layout แยกต่างหาก

## 1. Stock Product List (Web - Tablet & Desktop)

  **Flow**: Search Stock >> View List >> Update/Print Barcode >> Export

  **Location**: `/stock/product-list` (E:\coqo_duangkeaw\Code\jeweley-ui\src\views\stock\product\list\)

  ### Component Structure:
  ```
  /stock/product/
  ├── components/                      (shared: list ↔ detail page)
  │   ├── material-table.vue (ตารางวัตถุดิบ read-only — variant compact/full)
  │   └── balance-panel.vue (ยอดคงเหลือล็อตนี้ + ยอดรวม SKU ตาม Storage Location)
  ├── list/
  │   ├── index-view.vue (Main orchestrator)
  │   ├── components/
  │   │   ├── search-view.vue (Search bar with filters)
  │   │   ├── data-table-view.vue (Product list table)
  │   │   ├── data-expand-view.vue (Row expansion: material-table + balance-panel ใน SectionCardGeneric legend, sticky-left)
  │   │   ├── cost-detail-modal.vue (ดูต้นทุนสินค้า)
  │   │   └── cost-history-modal.vue (ดูประวัติตีราคา)
  │   └── modal/
  │       ├── update-view.vue (Edit product modal)
  │       └── barcode-view.vue (Print barcode modal)
  └── detail/
      └── index-view.vue (หน้าใหม่ "รายละเอียดสินค้า" /stock-product-detail/:stockNumber)
  ```
  Composable ที่ยุบตรรกะ merge ยอดคงเหลือมาไว้ที่เดียว: `src/composables/useStockBalanceMerge.js` (`mergeBalanceIntoItems`) — ใช้ทั้งใน `data-table-view.vue` และหน้า `detail/index-view.vue`

  ### Features Implemented:

  ✅ **Search & Filter Section** (search-view.vue)
     - **Page Title**: "ตรวจคลัง" - ตรวจสอบคลังสินค้า พิมพ์ป้าย หรือแก้ไขข้อมูลสินค้า
     - **Basic Search** (Always visible):
       - เลขที่ผลิต (ใหม่) - Stock Number (e.g., DK-2502-00X)
       - เลขที่ผลิต (เก่า) - Stock Number Origin (e.g., A0211XX)
       - รหัสสินค้า - Product Number (e.g., R08X50XXXL)
     - **Advanced Search** (Dialog Modal - เพิ่มเติม button):
       - ประเภทงานรับ (Receipt Type) - MultiSelect
       - แม่พิมพ์ (Mold)
       - ชื่อสินค้า EN (Product Name English)
       - ชื่อสินค้า TH (Product Name Thai)
       - W.O. (Work Order)
       - ขนาด (Size)
       - ประเภทสินค้า (Product Type) - MultiSelect
       - สีของทอง/เงิน (Gold/Silver Color) - MultiSelect
       - ประเภททอง/เงิน (Gold/Silver Type) - MultiSelect
     - **Action Buttons**:
       - 🔍 ค้นหา (Search) - Submit search
       - 🔎 เพิ่มเติม (More) - Open advanced search dialog
       - ❌ ล้าง (Clear) - Reset all filters
       - 📊 Export CSV - Export filtered results (disabled when no data)

  ✅ **Product List Table** (data-table-view.vue)
     - **DataTable Configuration**:
       - Pagination: 10 items per page
       - Sortable columns
       - Expandable rows (show material details)
       - Custom image preview column
     - **Columns** (sortable):
       1. Action buttons
       2. Image preview
       3. เลขที่ผลิต (ใหม่) - Stock Number
       4. เลขที่ผลิต (เก่า) - Stock Number Origin
       5. รหัสสินค้า - Product Number
       6. แม่พิมพ์ - Mold
       7. ชื่อสินค้า EN - Product Name English
       8. ชื่อสินค้า TH - Product Name Thai
       9. ประเภทสินค้า - Product Type Name
       10. ขนาด - Size
       11. สีของทอง/เงิน - Production Type (Gold/Silver Color)
       12. ประเภททอง/เงิน - Production Type Size
       13. W.O. - Work Order (wo-woNumber format)
       14. จัดเก็บ - Location
       15. ราคา - Product Price (decimal format)
       16. ผู้รับสินค้า - Received By (create by)
       17. หมายเหตุ - Remark
     - **Action Buttons per Row** (`ButtonGeneric` ×2, icon-only + `:title`):
       - 👁️ ดูรายละเอียด (View) - `variant="main"` - push `/stock-product-detail/:stockNumber`
       - ✏️ แก้ไข (Edit) - `variant="outline"` - เปิด `update-view.vue` เดิม
       - ปุ่มพิมพ์ป้าย/ต้นทุน/ประวัติ/QR ย้ายไปอยู่ header ของหน้า detail แล้ว (ถอด wiring ออกจากแถวนี้)
     - **Row Expansion**: 2 `SectionCardGeneric headerStyle="legend"` (วัตถุดิบซ้าย / ยอดคงเหลือขวา) ใน grid `sticky-left`

  ✅ **Material Details Expansion** (data-expand-view.vue → ใช้ shared components)
     - **Layout**: `.expand-container { position: sticky; left: 0 }` + `.expand-grid` (`minmax(0,3fr) minmax(0,2fr)`, ≤1200px ยุบ 1 คอลัมน์) — แทนที่ fixed `width: 750px` เดิม
     - กล่องซ้าย: `material-table.vue` (`variant="compact"`) — ประเภท/รหัส/ขนาด/แหล่งผลิต/จำนวน/น้ำหนัก/ราคา + รวมราคาวัตถุดิบ
     - กล่องขวา: `balance-panel.vue` — 3 tile ล็อตนี้ (คงเหลือ/จอง/พร้อมขาย) + ตาราง SKU ตาม Storage Location (`slocHeader` ผ่าน i18n แล้ว)
     - **Material Type Display** (ย้ายมาอยู่ที่เดียวใน `material-table.vue`):
       - Gold/Silver: Show master gold type name
       - Diamond: Show "Diamond (typeCode)"
       - Gem: Show gem type code
     - **Styling**: token เท่านั้น (ไม่มี hex/px hardcode เดิม), type column bold `var(--base-font-color)`

  ✅ **หน้ารายละเอียดสินค้า** (`detail/index-view.vue` — ใหม่, route `/stock-product-detail/:stockNumber`)
     - Archetype: Detail/View Page — `PageHeaderGeneric` (title + 4 ปุ่ม ghost: พิมพ์ป้าย/ต้นทุน/ประวัติ/QR + ปุ่มแก้ไข `is-primary`) + 5 `SectionCardGeneric legend` (รูปภาพ, ข้อมูลสินค้า, วัตถุดิบ `variant="full"`, ยอดคงเหลือ, การรับเข้า/ประวัติ)
     - โหลดข้อมูลเองจาก `StockProduct/Get` (deep-link/refresh ได้) แล้ว merge ยอดคงเหลือด้วย `mergeBalanceIntoItems`
     - ฝัง modal เดิมทั้ง 5: `update-view`, `barcode-view`, `cost-detail-modal`, `cost-history-modal`, `product-share-dialog` (ไม่แก้ไฟล์เหล่านี้)
     - State ไม่พบสินค้า: การ์ด `notFoundTitle`/`notFoundDesc` + ปุ่มกลับหน้าตรวจคลัง

  ✅ **Update Product Modal** (update-view.vue)
     - **Modal Size**: 1200px width
     - **Modal Header**: แก้ไขสินค้า | เลขที่ผลิต: {stockNumber}

     **Section 1: Image Section**
     - **Show Mode** (default):
       - Display current product image (150x150)
       - Show "No Image" placeholder if no image
       - Button: "เลือกรูปสินค้า" (Select Image)
     - **Select Mode** (when selecting image):
       - Search box for image name
       - DataTable with image list:
         - Columns: Image preview (40x40), Name, Create Date
         - Pagination: 10, 20, 50 per page
         - Single selection mode
       - Action buttons: Cancel, Select (disabled when no selection)

     **Section 2: Product Information**
     - แม่พิมพ์ (Mold) - Required, full width
     - ชื่อสินค้า (EN) - Product Name English - Required
     - ชื่อสินค้า (TH) - Product Name Thai - Required
     - จำนวน (Quantity) - Number input, required
     - ราคาขาย (Sale Price) - Number input, required
     - ขนาด (Size) - Required for product types: G, B, R (Ring, Bracelet, Necklace)
     - คลังจัดเก็บ (Location) - Disabled (read-only)

     **Section 3: Materials (ทอง | เพชร | พลอย)**
     - **Material Table**:
       - Add material button (green)
       - Editable DataTable without pagination
       - Columns:
         1. ประเภท (Type) - Dropdown: Gold, Silver, Diamond, Gem
         2. รหัส (Code) - Dynamic dropdown based on type:
            - Gold/Silver: Master gold list
            - Diamond: Diamond grade list
            - Gem: Gem type list
         3. ขนาด (Size) - Text input
         4. แหล่งผลิต (Region/Origin) - Text input
         5. จำนวน (Quantity) - Number + Unit (paired inputs)
         6. น้ำหนัก (Weight) - Number + Unit (paired inputs)
         7. ราคา (Price) - Number input
         8. Action - Delete button (red)
     - **Default Material Values**:
       - qty: 1
       - qtyUnit: 'pc'
       - weightUnit: 'ct.'

     **Submit Button**: บันทึกการแก้ไข (centered, green, with shadow)

     **Validation**:
     - Confirm dialog before submit
     - Generate typeBarcode for each material before save
     - Barcode format varies by material type:
       - Diamond: `{qty}{type}{weight} {weightUnit}, {typeCode}`
       - Gold/Silver: `{weight} {weightUnit} {type}`
       - Gem: `{qty}{typeCode}{weight} {weightUnit}`

  ✅ **Print Barcode Modal** (barcode-view.vue)
     - **Note**: Implementation details not fully visible in provided code
     - Triggered by "พิมพ์ป้าย" button in data table
     - Receives modelStock data for barcode printing

  ✅ **Responsive Design** (Legacy System)
     - Uses legacy standard-form.scss
     - Uses legacy standard-search-bar.scss
     - Uses legacy standard-data-table.scss
     - **Note**: Uses legacy styles, not new responsive-style/web

  ### API Integration:

  #### 1. Product List API
  - ✅ **Implemented**: `StockProduct/List`
  - API Store: `usrStockProductApiStore.fetchDataSearch()`
  - Location: `src/stores/modules/api/stock/product-api.js`
  - Request params:
    - take, skip (pagination)
    - sort (sorting array)
    - search (filter object with all search criteria)
  - Response: `{ total, data }` with product array

  #### 2. Product Update API
  - ✅ **Implemented**: `StockProduct/Update`
  - API Store: `usrStockProductApiStore.fetchUpdateStockProduct()`
  - Request data:
    - Product information fields
    - Materials array with typeBarcode generated
  - Response: Success/failure status

  #### 3. Export API
  - ✅ **Implemented**: `StockProduct/List` with export to Excel
  - API Store: `usrStockProductApiStore.fetchDataSearchReceiptExport()`
  - Uses ExcelHelper service for export
  - Export filename: "คลังสินค้าสินค้า.xlsx"
  - Export columns: All visible columns formatted

  #### 4. Image API
  - ✅ **Implemented**: Stock Product Image API
  - API Store: `stockProductImageApiStor.fetchListImage()`
  - Type: 'STOCK-PRODUCT'
  - Search params: name, year
  - Returns: Array of images with path and metadata

  #### 5. Master Data APIs

  **Gold (ทอง)**:
  - ✅ Source: `master-store.js` → `fetchGold()`
  - Endpoint: `Master/MasterGold`
  - Usage: Material type dropdown, advanced search filter

  **Gold Size (ประเภททอง)**:
  - ✅ Source: `master-store.js` → `fetchGoldSize()`
  - Endpoint: `Master/MasterGoldSize`
  - Usage: Advanced search filter

  **Product Type (ประเภทสินค้า)**:
  - ✅ Source: `master-store.js` → `fetchProductType()`
  - Endpoint: `Master/MasterProductType`
  - Usage: Advanced search filter, size field validation

  **Gem (พลอย)**:
  - ✅ Source: `master-store.js` → `fetchGem()`
  - Endpoint: `Master/MasterGem`
  - Usage: Material type dropdown

  **Diamond Grade (เกรดเพชร)**:
  - ✅ Source: `master-store.js` → `fetchDiamondGrade()`
  - Endpoint: `Master/MasterDiamondGrade`
  - Usage: Material type dropdown

  ### Generic Components Used:

  #### BaseDataTable (DataTableWithPaging.vue)
  **Location**: `src/components/prime-vue/DataTableWithPaging.vue`

  **Purpose**: Reusable data table with pagination, sorting, and custom templates

  **Key Props**:
  - `items` - Data array
  - `totalRecords` - Total count for pagination
  - `dataKey` - Unique key field
  - `columns` - Column configuration array
  - `perPage` - Items per page
  - `expandable` - Enable row expansion
  - `paginator` - Show/hide pagination
  - `selectionMode` - Enable row selection
  - `selectionType` - 'single' or 'multiple'

  **Events**:
  - `@page` - Page change event
  - `@sort` - Sort change event
  - `@update:itemsSelection` - Selection change event

  **Column Configuration**:
  ```javascript
  {
    field: 'stockNumber',        // Field name
    header: 'เลขที่ผลิต',        // Column header
    sortable: true,              // Enable sorting
    minWidth: '150px',           // Minimum width
    width: '150px',              // Fixed width
    format: 'decimal2',          // Format type (decimal2, datetime)
    align: 'right',              // Text alignment
    bodyTemplate: 'actionTemplate' // Custom template name
  }
  ```

  **Custom Templates**:
  - `#actionTemplate` - Custom action buttons
  - `#imageTemplate` - Image preview
  - `#woTextTemplate` - W.O. format display
  - `#expansion` - Row expansion content
  - `#paginator-buttons` - Custom paginator buttons

  #### ImagePreview Component
  **Location**: `src/components/prime-vue/ImagePreview.vue`

  **Purpose**: Display and preview images from server

  **Props**:
  - `imageName` - Image file name
  - `path` - Image path
  - `type` - Image type (e.g., 'STOCK-PRODUCT')
  - `width` - Display width in pixels
  - `height` - Display height in pixels
  - `preview` - Enable click to preview (boolean)

  #### DialogSearchView Component
  **Location**: `src/components/prime-vue/DialogSearchView.vue`

  **Purpose**: Reusable dialog for advanced search

  **Props**:
  - `isShow` - Show/hide dialog
  - `txtHeader` - Dialog header text

  **Events**:
  - `@closeDialog` - Close dialog event
  - `@search` - Search button clicked

  **Slots**:
  - `#content` - Dialog content area

  #### ModalView Component
  **Location**: `src/components/modal/ModalView.vue`

  **Purpose**: Reusable modal wrapper

  **Props**:
  - `showModal` - Show/hide modal (boolean)
  - `width` - Modal width (e.g., '1200px')

  **Events**:
  - `@closeModal` - Modal close event

  **Slots**:
  - `#content` - Modal content area

  ### Data Flow:

  **1. Search Flow**:
  ```
  User Input (search-view.vue)
    ↓ @search event
  index-view.vue (onSearchFilter)
    ↓ update search object
  data-table-view.vue (watch modelForm)
    ↓ fetchData()
  API Call (StockProduct/List)
    ↓ response
  Display in DataTable
  ```

  **2. Export Flow**:
  ```
  User Click Export (search-view.vue)
    ↓ @export event
  index-view.vue (onExport)
    ↓ update formExport object
  data-table-view.vue (watch modelFormExport)
    ↓ fetchDataExport()
  API Call (StockProduct/List with all data)
    ↓ response
  ExcelHelper.exportToExcel()
    ↓ download file
  "คลังสินค้าสินค้า.xlsx"
  ```

  **3. Update Product Flow**:
  ```
  User Click Edit Button (data-table-view.vue)
    ↓ onUpdate(data)
  Open Update Modal (update-view.vue)
    ↓ load product data
  User Edit & Submit
    ↓ onSubmit()
  Confirm Dialog
    ↓ fetchConfirm()
  Generate typeBarcode for materials
    ↓ API Call (StockProduct/Update)
  Close Modal & Refresh Data
  ```

  **4. Image Selection Flow**:
  ```
  User Click "เลือกรูปสินค้า"
    ↓ onSelectImage('SELECT')
  imageStage = 'SELECT'
    ↓ fetchLatestImage()
  API Call (stockProductImageStore.fetchListImage)
    ↓ display image list in DataTable
  User Select Image & Click "เลือก"
    ↓ onSelect()
  Update stock.imagePath
    ↓ imageStage = 'SHOW'
  Display selected image
  ```

  ### State Management:

  **index-view.vue** (Main orchestrator):
  ```javascript
  data: {
    form: { ...interfaceForm },          // Search criteria
    formExport: { ...interfaceForm },    // Export criteria
    search: {}                           // Active search object
  }
  ```

  **search-view.vue** (Search component):
  ```javascript
  data: {
    form: { ...modelForm },              // Current filter values
    isShow: { dialog: false },           // Dialog visibility
    receiptTypeMaster: []                // Receipt type options
  }
  ```

  **data-table-view.vue** (Table component):
  ```javascript
  data: {
    isShow: {
      isBarcode: false,                  // Barcode modal visibility
      isUpdate: false                    // Update modal visibility
    },
    modelStock: {},                      // Selected product data
    take: 10,                            // Page size
    skip: 0,                             // Page offset
    sort: [],                            // Sort configuration
    columns: []                          // Table columns config
  }
  ```

  **update-view.vue** (Update modal):
  ```javascript
  data: {
    isShowModal: false,                  // Modal visibility
    imageStage: 'SHOW',                  // 'SHOW' or 'SELECT'
    stock: {},                           // Product data
    search: null,                        // Image search text
    selectedItems: [],                   // Selected images
    latestImage: [],                     // Available images
    materialColumns: [],                 // Material table columns
    masterMaterialType: []               // Material type options
  }
  ```

  ### Validation Rules:

  **Product Information**:
  - แม่พิมพ์ (Mold): Required
  - ชื่อสินค้า EN: Required
  - ชื่อสินค้า TH: Required
  - จำนวน (Quantity): Required, Number, Min: 0
  - ราคาขาย (Price): Required, Number, Min: 0
  - ขนาด (Size): Required for product types R, G, B (Ring, Necklace, Bracelet)

  **Materials**:
  - All fields optional (can be empty)
  - Weight: Number with step 0.01
  - Price: Number with step 0.01
  - Quantity: Number, Min: 0

  ### Search Filter Object Structure:

  ```javascript
  {
    // Basic Search
    stockNumber: null,              // เลขที่ผลิต (ใหม่)
    stockNumberOriginal: null,      // เลขที่ผลิต (เก่า)
    productNumber: null,            // รหัสสินค้า

    // Advanced Search
    receiptType: null,              // ประเภทงานรับ (array or single)
    mold: null,                     // แม่พิมพ์
    productNameEn: null,            // ชื่อสินค้า EN
    productNameTh: null,            // ชื่อสินค้า TH
    woText: null,                   // W.O.
    size: null,                     // ขนาด
    productType: [],                // ประเภทสินค้า (array)
    gold: null,                     // สีของทอง/เงิน (array)
    goldSize: null                  // ประเภททอง/เงิน (array)
  }
  ```

  ### Material Data Structure:

  ```javascript
  {
    type: 'Gold' | 'Silver' | 'Diamond' | 'Gem',
    typeCode: string,               // Master code based on type
    size: string,                   // Material size
    region: string,                 // แหล่งผลิต
    qty: number,                    // จำนวน
    qtyUnit: string,                // หน่วยจำนวน (default: 'pc')
    weight: number,                 // น้ำหนัก
    weightUnit: string,             // หน่วยน้ำหนัก (default: 'ct.')
    price: number,                  // ราคา
    typeBarcode: string             // Generated barcode string
  }
  ```

  ### Barcode Generation Logic:

  ```javascript
  // Diamond
  `{qty}{type}{weight} {weightUnit}, {typeCode}`
  // Example: "5Diamond2.5 ct., VVS1"

  // Gold/Silver
  `{weight} {weightUnit} {type}`
  // Example: "10.5 g Gold"

  // Gem
  `{qty}{typeCode}{weight} {weightUnit}`
  // Example: "3Ruby1.2 ct."
  ```

  ### Export Excel Configuration:

  **Filename**: `คลังสินค้าสินค้า.xlsx`

  **Columns**:
  - วันรับสินค้า (Receipt Date) - formatDate
  - เลขที่ผลิต (Stock Number)
  - รหัสสินค้า (Product Number)
  - ชื่อสินค้า EN (Product Name EN)
  - ชื่อสินค้า TH (Product Name TH)
  - ประเภทสินค้า (Product Type Name)
  - ขนาด (Size)
  - แม่พิมพ์ (Mold)
  - สีของทอง/เงิน (Production Type)
  - ประเภททอง/เงิน (Production Type Size)
  - W.O. (Work Order) - format: `{wo}-{woNumber}`
  - จัดเก็บ (Location)
  - ราคา (Product Price) - formatDecimal(2)
  - ผู้รับสินค้า (Create By)
  - หมายเหตุ (Remark)

  **Excel Styling**:
  - Header fill color: #921313 (Red)
  - Default font size
  - Auto column width

  ### Key Features Summary:

  ✅ **Search & Filter**:
  - Basic search (3 fields always visible)
  - Advanced search (modal dialog with 9 additional filters)
  - MultiSelect for multiple criteria selection
  - Clear filters button

  ✅ **Data Display**:
  - Sortable, paginated data table
  - Image preview column
  - Expandable rows showing material details
  - Custom formatting (dates, decimals, W.O. format)

  ✅ **Product Management**:
  - Edit product information
  - Update product image (select from existing images)
  - Manage materials (add/edit/delete)
  - Form validation with required fields

  ✅ **Export**:
  - Export to Excel (.xlsx)
  - Include all filtered results
  - Custom formatting and styling
  - Disabled when no data

  ✅ **Material Management**:
  - Dynamic dropdown based on material type
  - Editable inline table
  - Add/remove materials
  - Auto-generate barcode for materials

  ### Future Enhancements:

  🔜 **Print Barcode Feature**:
  - Complete barcode-view.vue implementation
  - Integration with printer service
  - Barcode format configuration

  🔜 **Mobile Version**:
  - Separate mobile routes
  - Mobile-optimized UI
  - Touch-friendly interactions

  🔜 **Responsive Design**:
  - Migrate to new responsive-style/web
  - Remove legacy style dependencies
  - Tablet & Desktop optimization

  ### References:
  - Base data table pattern: `DataTableWithPaging.vue`
  - Image preview pattern: `ImagePreview.vue`
  - Modal pattern: `ModalView.vue`
  - Export pattern: ExcelHelper in `src/services/utils/excel-js.js`
  - Alert pattern: `src/services/alert/sweetAlerts.js`
